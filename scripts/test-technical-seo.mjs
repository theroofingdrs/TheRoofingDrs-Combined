// Technical SEO guardrails for the combined public website.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const origin = 'https://theroofingdrs.com';
const [landing, robots, sitemap, trdHeader, trdFooter, crdHeader, crdFooter, trdApp, crdApp, trdIndex, trdHomeView, crdIndex, llms] = await Promise.all([
  readFile('index.html', 'utf8'),
  readFile('robots.txt', 'utf8'),
  readFile('sitemap.xml', 'utf8'),
  readFile('source-apps/trd/src/components/public/PublicHeader.tsx', 'utf8'),
  readFile('source-apps/trd/src/components/public/PublicFooter.tsx', 'utf8'),
  readFile('source-apps/crd/src/components/Header.tsx', 'utf8'),
  readFile('source-apps/crd/src/components/Footer.tsx', 'utf8'),
  readFile('source-apps/trd/src/App.tsx', 'utf8'),
  readFile('source-apps/crd/src/App.tsx', 'utf8'),
  readFile('source-apps/trd/index.html', 'utf8'),
  readFile('source-apps/trd/src/views/PublicWebsiteView.tsx', 'utf8'),
  readFile('source-apps/crd/index.html', 'utf8'),
  readFile('llms.txt', 'utf8'),
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


assert.ok(trdIndex.includes('<link rel="preload" as="image" href="/residential/assets/images/residential-hero.jpg" fetchpriority="high" />'), 'Residential hero is preloaded before React runs');
assert.ok(trdHomeView.includes('fetchPriority="high"') && trdHomeView.includes('className="absolute inset-0 h-full w-full object-cover object-center"'), 'Residential hero image has high fetch priority and responsive cover sizing');
assert.ok(landing.includes('href="https://operations.theroofingdrs.com">Staff Portal</a>'), 'Main landing page includes the requested Staff Portal link');
assert.ok(trdHeader.includes("href={`/residential${link.path === '/' ? '/' : link.path}`}"), 'Residential desktop and mobile navigation expose crawlable hrefs');
assert.ok(trdFooter.includes("href={`/residential/roofing/roof-replacement`}"), 'Residential footer links expose crawlable hrefs');
assert.ok(!trdFooter.includes("onClick={() => onNavigate("), 'Residential footer no longer relies on JavaScript-only button navigation');
for (const [label, source] of [['TRD header', trdHeader], ['TRD footer', trdFooter], ['CRD header', crdHeader], ['CRD footer', crdFooter], ['TRD app', trdApp], ['CRD app', crdApp]]) {
  if (source.includes('trd-crd-operations-687495157172.us-east1.run.app')) throw new Error(label + ' still points directly to the Cloud Run URL');
}
assert.ok([trdFooter, crdFooter, crdHeader, trdApp, crdApp].every(source => source.includes('https://operations.theroofingdrs.com')), 'All staff/admin entry points use the Operations subdomain');

// Priority D: educational content must connect naturally to the next useful action.
const [trdBlog, crdBlog, crdHome] = await Promise.all([
  readFile('source-apps/trd/src/components/public/pages/BlogPage.tsx', 'utf8'),
  readFile('source-apps/crd/src/pages/BlogPage.tsx', 'utf8'),
  readFile('source-apps/crd/src/pages/HomePage.tsx', 'utf8'),
]);
assert.match(trdHeader, /\{ label: 'Blog', path: '\/blog' \}/, 'TRD navigation exposes homeowner resources');
assert.match(trdBlog, /Request a Free Roof Inspection/, 'TRD resource listing provides an inspection next step');
assert.match(trdBlog, /Browse Roofing FAQs/, 'TRD resources connect to homeowner FAQs');
assert.match(crdHeader, /Commercial Roofing Field Notes/, 'CRD primary resources menu exposes field notes');
assert.match(crdBlog, /Request a Roof Assessment/, 'CRD articles provide a commercial assessment next step');
assert.match(crdBlog, /Cost Planning Calculator/, 'CRD articles connect to the project planning tool');
for (const slug of ['commercial-roof-coatings-vs-replacement', 'tpo-vs-epdm-commercial-roofing', 'commercial-roof-coatings-energy-performance']) {
  assert.ok(crdHome.includes('/blog/' + slug), 'CRD homepage features the existing guide ' + slug);
}
assert.match(crdHome, /Commercial Roofing Resource Center/, 'CRD homepage introduces the resource center');


function pageGraph(html, label) {
  const block = html.match(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
  assert.ok(block, label + ' publishes JSON-LD');
  const graph = JSON.parse(block[1]);
  assert.ok(Array.isArray(graph['@graph']), label + ' publishes a connected entity graph');
  return graph['@graph'];
}
const trdNodes = pageGraph(trdIndex, 'Residential landing');
const crdNodes = pageGraph(crdIndex, 'Commercial landing');
const trdEntity = trdNodes.find(node => node['@id'] === origin + '/#trd');
const crdEntity = crdNodes.find(node => node['@id'] === origin + '/#crd');
assert.equal(trdEntity?.name, 'The ROOF Doctors', 'Residential entity uses the locked division name');
assert.equal(crdEntity?.name, 'Commercial ROOF Doctors', 'Commercial entity uses the locked division name');
assert.equal(trdEntity?.parentOrganization?.['@id'], origin + '/#organization');
assert.equal(crdEntity?.parentOrganization?.['@id'], origin + '/#organization');
assert.ok(trdNodes.some(node => node['@type'] === 'WebPage' && node.about?.['@id'] === trdEntity['@id']), 'Residential page identifies its subject entity');
assert.ok(crdNodes.some(node => node['@type'] === 'WebPage' && node.about?.['@id'] === crdEntity['@id']), 'Commercial page identifies its subject entity');
assert.ok(trdNodes.some(node => node['@type'] === 'WebSite' && node.publisher?.['@id'] === origin + '/#organization'), 'Residential page connects to the parent website');
assert.ok(crdNodes.some(node => node['@type'] === 'WebSite' && node.publisher?.['@id'] === origin + '/#organization'), 'Commercial page connects to the parent website');

assert.match(llms, /^# The Roofing Doctors/m, 'AI-readable company reference exists');
for (const fact of ['The ROOF Doctors', 'Commercial ROOF Doctors', 'Texarkana', 'Northeast Texas', 'Southwest Arkansas', 'Dallas–Fort Worth', 'Shreveport/Bossier City', 'Broken Bow', 'Idabel', 'https://theroofingdrs.com/sitemap.xml']) {
  assert.ok(llms.includes(fact), 'AI-readable reference includes ' + fact);
}
assert.match(llms, /not claims of a staffed physical office/i, 'AI reference distinguishes service markets from offices');
assert.match(llms, /Do not invent licensing, certifications, warranties/i, 'AI reference prohibits unsupported claims');

console.log('PASS technical SEO: canonical/social URL consistency, parseable parent/division JSON-LD, robots directives, and unique canonical sitemap URLs (' + urls.length + ' entries).');
