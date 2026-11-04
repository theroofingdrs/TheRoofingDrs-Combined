import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');
const htmlPath = path.join(dist, 'index.html');

function fail(message) {
  console.error(`[CRD build verification] FAIL: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(htmlPath)) fail('dist/index.html was not generated.');

const html = fs.readFileSync(htmlPath, 'utf8');
const assetRefs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((url) => url.startsWith('/commercial/assets/'));

if (assetRefs.length === 0) {
  fail('No /commercial/assets/ references found in built HTML. Check Vite base configuration.');
}

for (const url of assetRefs) {
  const relativeAssetPath = url.slice('/commercial/'.length);
  const assetPath = path.join(dist, relativeAssetPath);
  if (!fs.existsSync(assetPath)) {
    fail(`Built HTML references a missing asset: ${url} (expected ${assetPath})`);
  }
}

const jsAssets = assetRefs.filter((url) => url.endsWith('.js'));
const cssAssets = assetRefs.filter((url) => url.endsWith('.css'));

if (jsAssets.length === 0) fail('No JavaScript entry asset found.');
if (cssAssets.length === 0) fail('No CSS entry asset found.');
if (!fs.existsSync(path.join(dist, 'server.cjs'))) {
  fail('Production Express server bundle dist/server.cjs was not generated.');
}

const manifestPath = path.join(dist, 'seo-manifest.json');
if (!fs.existsSync(manifestPath)) fail('SEO route metadata manifest dist/seo-manifest.json was not generated.');

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
} catch (error) {
  fail(`SEO route metadata manifest is not valid JSON: ${error.message}`);
}

const manifestEntries = Object.entries(manifest);
if (manifestEntries.length < 150) {
  fail(`Expected at least 150 SEO route metadata entries; found ${manifestEntries.length}.`);
}

for (const [route, record] of manifestEntries) {
  if (!route.startsWith('/') || !record || typeof record.title !== 'string' || !record.title.trim() ||
      typeof record.description !== 'string' || !record.description.trim() ||
      typeof record.canonicalPath !== 'string' || !record.canonicalPath.startsWith('/')) {
    fail(`Invalid SEO metadata for route ${route}.`);
  }
}

for (const route of ['/', '/commercial-roofing']) {
  if (!manifest[route]) fail(`Required SEO metadata route is missing: ${route}`);
}

console.log(`[CRD build verification] PASS: ${assetRefs.length} production assets and ${manifestEntries.length} SEO route records verified.`);
