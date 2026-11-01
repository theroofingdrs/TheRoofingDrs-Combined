import { spawn } from 'node:child_process';

const port = Number(process.env.SMOKE_TEST_PORT) || 8080;
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ['server.mjs'], {
  env: { ...process.env, NODE_ENV: 'production', PORT: String(port) },
  stdio: 'ignore',
});

async function request(path) {
  const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(2500) });
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
  await check('/', (body) => body.includes('Residential roofing') && body.includes('Commercial roofing'), 'shared landing page');
  await check('/', (body) => body.includes('G-V9LXQ6DG4H'), 'Google Analytics tag present on landing page');
  await check('/residential/', (body) => body.includes('/residential/assets/'), 'residential app and asset base');
  const commercialPage = await request('/commercial/');
  if (!commercialPage.response.ok || !commercialPage.body.includes('/commercial/assets/')) {
    throw new Error(`commercial app and asset base: HTTP ${commercialPage.response.status}`);
  }
  console.log('PASS commercial app and asset base');

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
  await check('/commercial/sitemap.xml', (body) => body.includes('/commercial/commercial-roofing'), 'commercial sitemap paths');
  await check('/residential/the_roof_doctors_logo_white.svg', (_body, response) => response.headers.get('content-type')?.includes('image/'), 'residential SVG logo asset');
  await check('/commercial/assets/crd-logo-full-light.png', (_body, response) => response.headers.get('content-type')?.includes('image/'), 'commercial logo asset');
  await check('/residential/assets/images/grand_manor_roof.jpg', (_body, response) => response.headers.get('content-type')?.includes('image/'), 'residential roofing photo');
  await check('/commercial/assets/images/commercial_warehouse_roof_1788537086946.jpg', (_body, response) => response.headers.get('content-type')?.includes('image/'), 'commercial roofing photo');
  console.log('Combined site smoke tests passed.');
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  server.kill('SIGTERM');
}
