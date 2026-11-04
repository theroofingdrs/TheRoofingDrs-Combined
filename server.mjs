import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 8080;

const apps = [
  { name: 'residential', prefix: '/residential', port: 3101, dir: path.join(ROOT, 'source-apps', 'trd') },
  { name: 'commercial', prefix: '/commercial', port: 3102, dir: path.join(ROOT, 'source-apps', 'crd') },
];

const childProcesses = new Map();
const restartCounts = new Map();
const restartTimers = new Map();
let shuttingDown = false;

function startChild(app) {
  if (shuttingDown) return;

  console.log('[' + app.name + '] starting child server on port ' + app.port);
  const startedAt = Date.now();
  const child = spawn(process.execPath, ['dist/server.cjs'], {
    cwd: app.dir,
    env: { ...process.env, NODE_ENV: 'production', PORT: String(app.port) },
    stdio: 'inherit',
  });
  childProcesses.set(app.name, child);

  child.on('error', (error) => {
    console.error('[' + app.name + '] child process error:', error);
  });

  child.on('exit', (code, signal) => {
    if (childProcesses.get(app.name) === child) childProcesses.delete(app.name);
    const uptimeMs = Date.now() - startedAt;
    if (uptimeMs > 60_000) restartCounts.set(app.name, 0);
    console.error('[' + app.name + '] child server exited (code=' + code + ', signal=' + signal + ', uptimeMs=' + uptimeMs + ')');

    if (shuttingDown || restartTimers.has(app.name)) return;
    const failures = (restartCounts.get(app.name) || 0) + 1;
    restartCounts.set(app.name, failures);
    const delayMs = Math.min(1000 * (2 ** Math.min(failures - 1, 4)), 15_000);
    console.error('[' + app.name + '] scheduling automatic restart in ' + delayMs + 'ms (failure ' + failures + ')');
    const timer = setTimeout(() => {
      restartTimers.delete(app.name);
      startChild(app);
    }, delayMs);
    timer.unref();
    restartTimers.set(app.name, timer);
  });
}

for (const app of apps) startChild(app);

function safeDistPath(app, pathname) {
  const dist = path.resolve(app.dir, 'dist');
  const candidate = path.resolve(dist, `.${pathname}`);
  return candidate === dist || candidate.startsWith(dist + path.sep) ? candidate : null;
}

function findAsset(pathname, referer = '') {
  const matches = apps.filter((app) => {
    const candidate = safeDistPath(app, pathname);
    return candidate && fs.existsSync(candidate) && fs.statSync(candidate).isFile();
  });
  if (!matches.length) return null;
  if (referer.includes('/commercial')) return matches.find((app) => app.name === 'commercial') || matches[0];
  if (referer.includes('/residential')) return matches.find((app) => app.name === 'residential') || matches[0];
  return matches.length === 1 ? matches[0] : matches.find((app) => app.name === 'commercial') || matches[0];
}

function proxy(req, res, app, targetPath) {
  const canRetry = req.method === 'GET' || req.method === 'HEAD';
  let attempts = 0;

  const send = () => {
    if (res.destroyed || res.writableEnded) return;
    attempts += 1;

    const upstream = http.request({
      hostname: '127.0.0.1',
      port: app.port,
      method: req.method,
      path: targetPath,
      headers: {
        ...req.headers,
        host: req.headers.host || `127.0.0.1:${app.port}`,
        'x-forwarded-host': req.headers.host || `127.0.0.1:${app.port}`,
        'x-forwarded-proto': req.headers['x-forwarded-proto'] || (req.socket.encrypted ? 'https' : 'http'),
      },
    }, (upstreamRes) => {
      res.writeHead(upstreamRes.statusCode || 502, upstreamRes.headers);
      upstreamRes.pipe(res);
    });

    upstream.on('error', (error) => {
      const retryable = ['ECONNREFUSED', 'ECONNRESET', 'EHOSTUNREACH'].includes(error.code);
      if (canRetry && retryable && attempts < 41 && !res.destroyed) {
        setTimeout(send, 250);
        return;
      }
      console.error('[' + app.name + '] proxy error after ' + attempts + ' attempt(s): code=' + (error.code || 'unknown') + ' syscall=' + (error.syscall || 'unknown') + ' address=' + (error.address || 'unknown') + ' port=' + (error.port || 'unknown') + ' path=' + targetPath + ': ' + error.message);
      if (!res.headersSent) res.writeHead(502, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('The website service is starting or temporarily unavailable.');
    });

    if (canRetry) upstream.end();
    else req.pipe(upstream);
  };

  send();
}

function serveRootFile(req, res, filename, contentType) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { allow: 'GET, HEAD' });
    return res.end();
  }
  const filePath = path.join(ROOT, filename);
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    return res.end('Not found.');
  }
  res.writeHead(200, {
    'content-type': contentType,
    'cache-control': 'public, max-age=3600',
  });
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(filePath).pipe(res);
}

function serveLanding(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { allow: 'GET, HEAD' });
    return res.end();
  }
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache' });
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(path.join(ROOT, 'index.html')).pipe(res);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', 'http://localhost');
  let pathname;
  try { pathname = decodeURIComponent(url.pathname); }
  catch { res.writeHead(400); return res.end('Invalid URL.'); }
  const requestHost = (req.headers.host || '').split(':')[0].toLowerCase();
  if (requestHost === 'www.theroofingdrs.com') {
    res.writeHead(301, {
      location: `https://theroofingdrs.com${req.url || '/'}`,
      'cache-control': 'public, max-age=3600',
    });
    return res.end();
  }

  if (pathname === '/robots.txt') return serveRootFile(req, res, 'robots.txt', 'text/plain; charset=utf-8');
  if (pathname === '/sitemap.xml') return serveRootFile(req, res, 'sitemap.xml', 'application/xml; charset=utf-8');


  if (pathname === '/') return serveLanding(req, res);

  for (const app of apps) {
    if (pathname === app.prefix || pathname.startsWith(app.prefix + '/')) {
      const suffix = pathname.slice(app.prefix.length) || '/';
      return proxy(req, res, app, suffix + url.search);
    }
  }

  if (pathname.startsWith('/api/')) {
    const referer = req.headers.referer || '';
    const app = referer.includes('/commercial') ? apps[1] : apps[0];
    return proxy(req, res, app, pathname + url.search);
  }

  const assetApp = findAsset(pathname, req.headers.referer || '');
  if (assetApp) return proxy(req, res, assetApp, url.pathname + url.search);

  res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
  res.end('Page not found.');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Combined Roof Doctors] listening on port ${PORT}`);
});

function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const timer of restartTimers.values()) clearTimeout(timer);
  restartTimers.clear();
  server.close();
  for (const child of childProcesses.values()) child.kill('SIGTERM');
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
