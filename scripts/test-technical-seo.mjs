// Technical SEO guardrails for the combined public website.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const origin = 'https://theroofingdrs.com';
const [landing, robots, sitemap, trdHeader, trdFooter, crdHeader, crdFooter, trdApp, crdApp] = await Promise.all([
  readFile('index.html', 'utf8'),
  readFile('robots.txt', 'utf8'),
  readFile('sitemap.xml', 'utf8'),
  readFile('source-apps/trd/src/components/public/PublicHeader.tsx', 'utf8'),
  readFile('source-apps/trd/src/components/public/PublicFooter.tsx', 'utf8'),
  readFile('source-apps/crd/src/components/Header.tsx', 'utf8'),
  readFile('source-apps/crd/src/components/Footer.tsx', 'utf8'),
  readFile('source-apps/trd/src/App.tsx', 'utf8'),
  readFile('source-apps/crd/src/App.tsx', 'utf8'),
]);

function tags(html, tagName) {
  return [...html.matchAll(new RegExp('<' + tagName + '\\b[^>]*>', 'gi'))].map(match => match[0]);
}
function attribute(tag, name) {
  return tag.match(new RegExp("\\b" + name + "=[\"']([^\"']*)[\"']", 'i'))?.[1] ?? '';
}
function one(items, description) {
  assert.equal(items.length, 1, description + ' must appear exactly once');
  return items[0];
}

const linkTags = tags(landing, 'link');
const metaTags = tags(landing, 'meta');
const canonical = attribute(one(linkTags.filter(tag => attribute(tag, 'rel').toLowerCase() === 'canonical'), 'Landing canonical'), 'href');
assert.equal(canonical, origin + '/');
assert.equal(attribute(one(metaTags.filter(tag => attribute(tag, 'property') === 'og:url'), 'Open Graph URL'), 'content'), canonical);
assert.match(landing, /<meta\s+name=["']robots["']\s+content=["']index,follow/i);
assert.match(landing, /<title>[^<]+<\/title>/i);
assert.ok(attribute(one(metaTags.filter(tag => attribute(tag, 'name') === 'description'), 'Landing description'), 'content').length >= 70);

const jsonLdBlocks = [...landing.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
assert.ok(jsonLdBlocks.length >= 1, 'Landing page must publish JSON-LD');
const graphs = jsonLdBlocks.map(match => JSON.parse(match[1]));
const nodes = graphs.flatMap(value => value['@graph'] ?? [value]);
const parent = nodes.find(node => node['@type'] === 'Organization' && node['@id'] === origin + '/#organization');
const trd = nodes.find(node => node['@type'] === 'RoofingContractor' && node['@id'] === origin + '/#trd');
const crd = nodes.find(node => node['@type'] === 'RoofingContractor' && node['@id'] === origin + '/#crd');
assert.ok(parent, 'Parent Organization entity exists');
assert.ok(trd, 'Residential RoofingContractor entity exists');
assert.ok(crd, 'Commercial RoofingContractor entity exists');
assert.equal(parent.name, 'The Roofing Doctors');
assert.equal(trd.name, 'The ROOF Doctors');
assert.equal(crd.name, 'Commercial ROOF Doctors');
assert.ok(parent.subOrganization?.some(item => item['@id'] === trd['@id']));
assert.ok(parent.subOrganization?.some(item => item['@id'] === crd['@id']));
assert.ok(Array.isArray(trd.areaServed) && trd.areaServed.length >= 10);
assert.ok(Array.isArray(crd.areaServed) && crd.areaServed.length >= 8);
assert.equal(trd.address?.addressLocality, 'Texarkana');
assert.equal(trd.address?.addressRegion, 'TX');
assert.equal(trd.telephone, crd.telephone);

assert.match(robots, /^User-agent: \*/m);
assert.match(robots, /^Allow: \/$/m);
assert.match(robots, new RegExp('^Sitemap: ' + origin.replaceAll('.', '\\.') + '/sitemap\\.xml$', 'm'));
for (const privatePath of ['/api/', '/commercial/admin', '/commercial/staff', '/commercial/leads', '/commercial/portal', '/residential/app', '/residential/field', '/residential/portal']) {
  assert.ok(robots.split(/\r?\n/).some(line => line.trim() === 'Disallow: ' + privatePath), 'Robots disallow ' + privatePath);
}

assert.match(sitemap, /^<\?xml version=["']1\.0["']/);
assert.match(sitemap, /<urlset\b[^>]*xmlns=["']http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9["']>/);
assert.match(sitemap, /<\/urlset>\s*$/);
const entries = [...sitemap.matchAll(/<url>\s*<loc>([^<]+)<\/loc>([\s\S]*?)<\/url>/g)];
assert.ok(entries.length >= 20, 'Sitemap contains the public page inventory');
assert.equal((sitemap.match(/<url>/g) ?? []).length, entries.length, 'Every sitemap URL is wrapped in one url element');
const urls = entries.map(([, value]) => value.trim());
assert.equal(new Set(urls).size, urls.length, 'Sitemap URLs are unique');
for (const value of urls) {
  const url = new URL(value);
  assert.equal(url.origin, origin, 'Sitemap uses the canonical HTTPS hostname');
  assert.equal(url.search, '', 'Sitemap URLs exclude tracking/query parameters');
  assert.equal(url.hash, '', 'Sitemap URLs exclude fragments');
  assert.ok(!url.pathname.includes('//'), 'Sitemap paths do not contain duplicate slashes');
}
for (const required of ['/', '/commercial/', '/residential/', '/commercial/service-areas/broken-bow', '/commercial/service-areas/idabel']) {
  assert.ok(urls.includes(origin + required), 'Sitemap includes ' + required);
}


assert.match(trdHeader, /<a[\\s\\S]*?href=\{\`\\/residential\$\{link\.path === '\\/' \? '\\/' : link\.path\}\`\}/);
assert.match(trdFooter, /<a href=\{\`\\/residential\\/roofing\\/roof-replacement\`\}/);
assert.doesNotMatch(trdFooter, /<button[\\s\\S]*?onClick=\{\(\) => onNavigate\(/);
for (const [label, source] of [['TRD header', trdHeader], ['TRD footer', trdFooter], ['CRD header', crdHeader], ['CRD footer', crdFooter], ['TRD app', trdApp], ['CRD app', crdApp]]) {
  if (source.includes('trd-crd-operations-687495157172.us-east1.run.app')) throw new Error(label + ' still points directly to the Cloud Run URL');
}
assert.ok([trdFooter, crdFooter, crdHeader, trdApp, crdApp].every(source => source.includes('https://operations.theroofingdrs.com')), 'All staff/admin entry points use the Operations subdomain');

console.log('PASS technical SEO: canonical/social URL consistency, parseable parent/division JSON-LD, robots directives, and unique canonical sitemap URLs (' + urls.length + ' entries).');
