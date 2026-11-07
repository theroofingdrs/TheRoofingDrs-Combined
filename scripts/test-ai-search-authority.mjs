// Guardrails for the public AI/search reference files and division entity graph.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const origin = 'https://theroofingdrs.com';
const [brief, full, parentHtml, trdHtml, crdHtml, sitemap, robots] = await Promise.all([
  readFile('llms.txt', 'utf8'),
  readFile('llms-full.txt', 'utf8'),
  readFile('index.html', 'utf8'),
  readFile('source-apps/trd/index.html', 'utf8'),
  readFile('source-apps/crd/index.html', 'utf8'),
  readFile('sitemap.xml', 'utf8'),
  readFile('robots.txt', 'utf8'),
]);

for (const phrase of [
  'The Roofing Doctors', 'The ROOF Doctors', 'Commercial ROOF Doctors',
  'Texarkana', 'Dallas', 'Shreveport', 'Bossier City', 'Monroe',
  'Little Rock', 'Hot Springs', 'Broken Bow', 'Idabel', 'Greenville',
]) {
  assert.ok(brief.includes(phrase), 'Concise AI reference includes ' + phrase);
  assert.ok(full.includes(phrase), 'Expanded AI reference includes ' + phrase);
}
for (const url of [
  origin + '/', origin + '/residential/', origin + '/commercial/',
  origin + '/residential/roofing', origin + '/commercial/property-management',
  origin + '/commercial/service-areas', origin + '/sitemap.xml', origin + '/robots.txt',
]) {
  assert.ok(full.includes(url), 'Expanded AI reference links canonical URL ' + url);
}
assert.ok(full.length > brief.length, 'Expanded reference is materially more detailed than concise reference');
assert.match(full, /not a representation that a staffed office exists/i);
assert.match(full, /Do not invent licenses, certifications/i);
assert.match(full, /source of truth if details differ/i);

function graph(html, label) {
  const match = html.match(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
  assert.ok(match, label + ' has JSON-LD');
  const value = JSON.parse(match[1]);
  assert.ok(Array.isArray(value['@graph']), label + ' uses an entity graph');
  return value['@graph'];
}
const parent = graph(parentHtml, 'Parent landing page');
const trd = graph(trdHtml, 'Residential landing page');
const crd = graph(crdHtml, 'Commercial landing page');
const id = name => origin + '/#' + name;
for (const nodes of [parent, trd, crd]) {
  assert.ok(nodes.some(node => node['@id'] === id('organization') && node['@type'] === 'Organization'));
  assert.ok(nodes.some(node => node['@id'] === id('trd') && node['@type'] === 'RoofingContractor'));
  assert.ok(nodes.some(node => node['@id'] === id('crd') && node['@type'] === 'RoofingContractor'));
}
assert.ok(parent.find(node => node['@id'] === id('organization')).subOrganization.some(node => node['@id'] === id('trd')));
assert.ok(parent.find(node => node['@id'] === id('organization')).subOrganization.some(node => node['@id'] === id('crd')));
assert.ok(trd.some(node => node['@type'] === 'WebPage' && node.about?.['@id'] === id('trd')));
assert.ok(crd.some(node => node['@type'] === 'WebPage' && node.about?.['@id'] === id('crd')));
assert.ok(trd.some(node => node['@type'] === 'WebSite'));
assert.ok(crd.some(node => node['@type'] === 'WebSite'));

for (const path of ['/residential/', '/commercial/', '/commercial/property-management']) {
  assert.ok(sitemap.includes('<loc>' + origin + path + '</loc>'), 'Sitemap includes important public URL ' + path);
}
assert.match(robots, /^Sitemap: https:\/\/theroofingdrs\.com\/sitemap\.xml$/m);
assert.match(robots, /^Disallow: \/commercial\/admin$/m);
assert.match(robots, /^Disallow: \/residential\/app$/m);

console.log('[AI search authority] Concise/expanded references, canonical links, entity graphs, sitemap and crawl exclusions verified.');
