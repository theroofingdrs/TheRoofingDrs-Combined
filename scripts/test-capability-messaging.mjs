import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const [landing, commercialHome, portfolio] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../source-apps/crd/src/pages/HomePage.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../source-apps/crd/src/pages/PropertyManagementPage.tsx', import.meta.url), 'utf8'),
]);

for (const audience of [
  'Homeowners &amp; Residential Property Owners',
  'Commercial Property Owners &amp; Business Owners',
  'Commercial Real Estate &amp; Portfolio Managers',
]) {
  assert.ok(landing.includes(audience), `Missing audience-specific landing-page content: ${audience}`);
}

for (const capability of [
  'Free 21-point roof inspections',
  'Leak diagnosis and targeted repairs',
  'Hail and wind damage evaluations',
  'TPO, EPDM, PVC, modified bitumen and metal systems',
  'Property-by-property inspections and photo records',
  'Objective roof condition ratings (1–5)',
  'Centralized repair tracking and prioritization',
  'Replacement planning across a portfolio',
]) {
  assert.ok(landing.includes(capability), `Missing capability statement: ${capability}`);
}

assert.ok(commercialHome.includes('commercial property owners, business owners, operators and facility teams'));
assert.ok(commercialHome.includes('tenant and customer activity'));
assert.ok(commercialHome.includes('equipment and inventory exposure'));
assert.ok(portfolio.includes('objective 1–5 roof condition rating'));
assert.ok(portfolio.includes('Centralized Repair Tracking'));
assert.ok(portfolio.includes('What Property Managers Receive from Commercial ROOF Doctors'));
assert.ok(portfolio.includes('Property-by-property inspection records'));
assert.ok(!portfolio.includes('Guaranteed dispatch'));
assert.ok(!portfolio.includes('Predatory'));

console.log('Capability messaging checks passed.');
