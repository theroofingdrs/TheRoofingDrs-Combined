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

const children = apps.map((app) => {
  const child = spawn(process.execPath, ['dist/server.cjs'], {
    cwd: app.dir,
    env: { ...process.env, NODE_ENV: 'production', PORT: String(app.port) },
    stdio: 'inherit',
  });
  child.on('exit', (code, signal) => {
    console.error(`[${app.name}] child server exited (code=${code}, signal=${signal})`);
  });
  return child;
});

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
  const upstream = http.request({
    hostname: '127.0.0.1',
    port: app.port,
    method: req.method,
    path: targetPath,
    headers: { ...req.headers, host: `127.0.0.1:${app.port}` },
  }, (upstreamRes) => {
    res.writeHead(upstreamRes.statusCode || 502, upstreamRes.headers);
    upstreamRes.pipe(res);
  });
  upstream.on('error', (error) => {
    console.error(`[${app.name}] proxy error:`, error.message);
    if (!res.headersSent) res.writeHead(502, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('The website service is starting or temporarily unavailable.');
  });
  req.pipe(upstream);
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
  const pathname = decodeURIComponent(url.pathname);

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
  server.close();
  for (const child of children) child.kill('SIGTERM');
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
