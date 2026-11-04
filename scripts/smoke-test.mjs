import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import assert from 'node:assert/strict';

const port = Number(process.env.SMOKE_TEST_PORT) || 8080;
const base = `http://127.0.0.1:${port}`;
const testDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'roofing-smoke-'));
const testEnv = { ...process.env, NODE_ENV: 'production', ALLOW_EPHEMERAL_DATABASE: 'true', PORT: String(port), WEBSITE_DATA_DIR: testDirectory };
for (const key of ['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','SUPABASE_ANON_KEY','SUPABASE_PUBLISHABLE_KEY']) delete testEnv[key];
const server = spawn(process.execPath, ['server.mjs'], {
  env: testEnv,
  stdio: 'ignore',
});

async function request(path, refererPath = '') {
  const response = await fetch(`${base}${path}`, {
    headers: refererPath ? { referer: `${base}${refererPath}` } : {},
    signal: AbortSignal.timeout(2500),
  });
  return { response, body: await response.text() };
}

async function waitFor(path, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const result = await request(path);
      if (result.response.ok) return result;
      lastError = new Error(`${path} returned HTTP ${result.response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw lastError || new Error(`Timed out waiting for ${path}`);
}

async function check(path, test, description) {
  const { response, body } = await request(path);
  if (!response.ok || !test(body, response)) {
    throw new Error(`${description}: HTTP ${response.status}`);
  }
  console.log(`PASS ${description}`);
}

try {
  await waitFor('/');
  await check('/', (body) => body.toLowerCase().includes('residential') && body.toLowerCase().includes('commercial'), 'shared landing page');
  await check('/', (body) => body.includes('choice residential') && body.includes('/residential/assets/images/library/residential-roof-project-detail.jpg') && body.includes('choice commercial') && body.includes('/commercial/assets/images/library/crd-industrial-distribution-center-aerial.jpg'), 'distinct residential and commercial landing card photography');
  await check('/', (body) => body.includes('G-V9LXQ6DG4H'), 'Google Analytics tag present on landing page');
  await check('/residential/', (body) => body.includes('/residential/assets/'), 'residential app and asset base');
  await check('/residential/', (body) => body.includes('/residential/the_roof_doctors_logo_transparent.png') && body.includes('https://theroofingdrs.com/residential/assets/images/library/residential-roof-project-detail.jpg'), 'residential favicon and social sharing metadata');
  const commercialPage = await request('/commercial/');
  if (!commercialPage.response.ok || !commercialPage.body.includes('/commercial/assets/')) {
    throw new Error(`commercial app and asset base: HTTP ${commercialPage.response.status}`);
  }
  console.log('PASS commercial app and asset base');
  await check('/commercial/', (body) => body.includes('/commercial/assets/crd-logo-mark.png') && body.includes('https://theroofingdrs.com/commercial/assets/images/library/commercial-industrial-roofing.jpg'), 'commercial favicon and social sharing metadata');
  await check('/', (body) => body.includes('https://theroofingdrs.com/') && body.includes('og:image'), 'shared landing canonical and social sharing metadata');
  await check('/sitemap.xml', (body) => body.includes('https://theroofingdrs.com/residential/faq') && body.includes('https://theroofingdrs.com/commercial/commercial-roofing'), 'root sitemap includes public routes for both brands');
  await check('/robots.txt', (body) => body.includes('https://theroofingdrs.com/sitemap.xml'), 'root robots.txt sitemap reference');
  await check('/residential/sitemap.xml', (body) => body.includes('https://theroofingdrs.com/residential/service-areas/texarkana') && body.includes('https://theroofingdrs.com/residential/blog'), 'residential sitemap content');
  await check('/residential/robots.txt', (body) => body.includes('/residential/sitemap.xml'), 'residential robots.txt sitemap reference');
  await check('/commercial/robots.txt', (body) => body.includes('/commercial/sitemap.xml'), 'commercial robots.txt sitemap reference');

  // Request the actual built frontend bundles, not just the HTML shell.
  const commercialAssetUrls = [
    ...commercialPage.body.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="([^"]+\.(?:js|mjs|css)(?:\\?[^"]*)?)"[^>]*>/gi),
  ].map((match) => match[1]).filter((url) => url.includes('/assets/'));
  const uniqueCommercialAssets = [...new Set(commercialAssetUrls)];
  if (!uniqueCommercialAssets.some((url) => /\.js(?:\\?|$)/i.test(url))) {
    throw new Error('commercial frontend JavaScript bundle was not referenced by the HTML');
  }
  for (const assetUrl of uniqueCommercialAssets) {
    const assetPath = new URL(assetUrl, base).pathname + new URL(assetUrl, base).search;
    const { response, body } = await request(assetPath);
    const isCss = /\.css(?:\\?|$)/i.test(assetUrl);
    const contentType = response.headers.get('content-type') || '';
    if (!response.ok || (isCss && !contentType.includes('text/css')) ||
        (!isCss && !/(?:javascript|ecmascript)/i.test(contentType)) ||
        /^\s*<!doctype html|^\s*<html/i.test(body)) {
      throw new Error(`commercial frontend asset failed: ${assetPath} HTTP ${response.status}, content-type ${contentType}`);
    }
    console.log(`PASS commercial frontend asset ${assetPath}`);
  }
  await check('/residential/api/health', (body) => body.includes('ok'), 'residential API proxy');
  await check('/residential/api/v1/health', (body) => body.includes('OPERATIONAL') && body.includes('"database"'), 'residential versioned API health and route isolation');
  await check('/commercial/api/health', (body) => body.includes('"status":"ok"') && body.includes('Commercial Roof Doctors'), 'commercial API health and route isolation');
  await check('/residential/roofing/roof-replacement', (body) => body.includes('/residential/assets/'), 'residential deep-link refresh');
  await check('/commercial/tpo-roofing', (body) => body.includes('/commercial/assets/'), 'commercial deep-link refresh');
  await check('/residential/blog', (body) => body.includes('/residential/assets/'), 'residential blog deep-link refresh');
  await check('/commercial/blog', (body) => body.includes('/commercial/assets/'), 'commercial blog deep-link refresh');
  await check('/residential/estimate-request', (body) => body.includes('/residential/assets/'), 'residential estimate-request deep link');
  await check('/commercial/commercial-roof-restoration', (body) => body.includes('/commercial/assets/'), 'commercial restoration-center deep link');
  await check('/commercial/industries', (body) => body.includes('/commercial/assets/'), 'commercial industry-directory deep link');
  await check('/commercial/sitemap.xml', (body) => body.includes('/commercial/commercial-roofing'), 'commercial sitemap paths');
  await check('/residential/the_roof_doctors_logo.svg', (_body, response) => response.headers.get('content-type')?.includes('image/'), 'residential SVG logo asset');
  await check('/residential/the_roof_doctors_logo_transparent.png', (_body, response) => response.headers.get('content-type')?.includes('image/png'), 'residential transparent logo asset');
  await check('/commercial/assets/crd-logo-full-light.png', (_body, response) => response.headers.get('content-type')?.includes('image/'), 'commercial logo asset');
  await check('/residential/assets/images/grand_manor_roof.jpg', (_body, response) => response.headers.get('content-type')?.includes('image/'), 'residential roofing photo');
  await check('/residential/assets/images/library/residential-roof-project-detail.jpg', (_body, response) => response.headers.get('content-type')?.includes('image/'), 'residential approved image-library photo');
  await check('/commercial/assets/images/commercial_warehouse_roof_1788537086946.jpg', (_body, response) => response.headers.get('content-type')?.includes('image/'), 'commercial roofing photo');
  await check('/commercial/assets/images/library/crd-industrial-distribution-center-aerial.jpg', (_body, response) => response.headers.get('content-type')?.includes('image/'), 'commercial approved image-library photo');
  // Validate every image URL embedded in the built frontend bundles. This catches
  // broken library allocations that a single representative-photo check misses.
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  for (const app of ['residential', 'commercial']) {
    const assetRoot = path.join(repoRoot, 'source-apps', app === 'residential' ? 'trd' : 'crd', 'dist', 'assets');
    const pending = [assetRoot];
    const files = [];
    while (pending.length) {
      const current = pending.pop();
      let entries;
      try { entries = await fs.readdir(current, { withFileTypes: true }); }
      catch (error) {
        if (error.code === 'ENOENT') continue;
        throw error;
      }
      for (const entry of entries) {
        const fullPath = path.join(current, entry.name);
        if (entry.isDirectory()) pending.push(fullPath);
        else if (entry.isFile() && /\.(?:js|mjs|css)$/i.test(entry.name)) files.push(fullPath);
      }
    }
    const referenced = new Set();
    for (const fullPath of files) {
      const source = await fs.readFile(fullPath, 'utf8');
      for (const match of source.matchAll(/(?:\/|\b)assets\/[^"'\s)\]}]+\.(?:png|jpe?g|webp|avif|svg)(?:\?[^"'\s)\]}]*)?/gi)) {
        const relative = match[0].replace(/^\//, '');
        if (!relative.startsWith('assets/')) continue;
        referenced.add(relative);
      }
    }
    for (const relative of referenced) {
      const assetPath = '/' + app + '/' + relative;
      const { response } = await request(assetPath);
      const contentType = response.headers.get('content-type') || '';
      if (!response.ok || !contentType.startsWith('image/')) {
        throw new Error(app + ' referenced image failed: ' + assetPath + ' HTTP ' + response.status + ', content-type ' + contentType);
      }
      console.log('PASS ' + app + ' referenced image ' + assetPath);
    }
    console.log('PASS ' + app + ' bundle image references (' + referenced.size + ' checked)');
  }

  // Express routing is case-insensitive and accepts trailing slashes by default.
  // The authorization gate must cover the same route variants as the handlers.
  for (const route of ['/commercial/api/leads/', '/commercial/API/LEADS', '/commercial/api/admin/stats/', '/commercial/API/CALCULATOR', '/commercial/api/leads/synthetic/photos', '/commercial/API/LEADS/synthetic', '/commercial/api/calculator/']) {
    const result = await fetch(base + route);
    assert.equal(result.status, 401, 'Anonymous route variant must require authentication: ' + route);
  }
  console.log('PASS case and trailing-slash variants cannot bypass commercial authorization');

  // Run only against isolated local data with no production credentials.
  for (const route of ['/residential/api/v1/leads','/commercial/api/leads']) {
    const denied = await fetch(base + route);
    assert.equal(denied.status, 401, 'Anonymous lead lists must be denied: ' + route);
    for (const body of [{name: 42, phone: {}}, {name: ' ', phone: ' '}]) {
      const result = await fetch(base + route, {method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify(body)});
      assert.equal(result.status, 400, 'Malformed contact data must be rejected: ' + route);
    }
    const unavailable = await fetch(base + route, {method:'POST',headers:{'content-type':'application/json','Idempotency-Key':'f0000000-0000-4000-8000-000000000001'},body:JSON.stringify({name:'Synthetic test',phone:'9035550100'})});
    assert.equal(unavailable.status, 503, 'Missing durable storage must not report success: ' + route);
  }
  assert.equal((await fetch(base + '/commercial/api/staff/booking',{method:'POST',headers:{'content-type':'application/json'},body:'{}'})).status,503,'Staff booking must remain disabled');
  assert.equal((await fetch(base + '/commercial/api/save-logo', {method:'POST',headers:{'content-type':'application/json'},body:'{}'})).status, 401);
  console.log('PASS private lead access, malformed submissions, and durable-storage failure behavior');
  console.log('Combined site smoke tests passed.');
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  const stopped = new Promise(resolve => server.once('exit', resolve));
  server.kill('SIGTERM');
  await stopped;
  await fs.rm(testDirectory, {recursive:true,force:true});
}
