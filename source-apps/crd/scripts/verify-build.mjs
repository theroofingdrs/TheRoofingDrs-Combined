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
  const relativeAssetPath = url.replace(/^\\/commercial\\//, '');
  const assetPath = path.join(dist, relativeAssetPath);
  if (!fs.existsSync(assetPath)) {
    fail(`Built HTML references a missing asset: ${url} (expected ${assetPath})`);
  }
}

const jsAssets = assetRefs.filter((url) => /\\.js(?:$|\\?)/.test(url));
const cssAssets = assetRefs.filter((url) => /\\.css(?:$|\\?)/.test(url));

if (jsAssets.length === 0) fail('No JavaScript entry asset found.');
if (cssAssets.length === 0) fail('No CSS entry asset found.');
if (!fs.existsSync(path.join(dist, 'server.cjs'))) {
  fail('Production Express server bundle dist/server.cjs was not generated.');
}

console.log(`[CRD build verification] PASS: ${assetRefs.length} production assets exist and use the /commercial/ base path.`);
