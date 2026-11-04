import fs from 'node:fs';
import path from 'node:path';
import { SERVICES_CONTENT } from '../src/siteContent';
import {
  ROOF_SYSTEMS_CONTENT,
  INDUSTRIES_CONTENT,
  SERVICE_AREAS_CONTENT,
  CITY_SERVICE_AREAS_CONTENT,
  COATING_ARTICLES_CONTENT,
} from '../src/siteSystemsContent';

type SeoRecord = {
  title?: string;
  metaDescription?: string;
  canonicalPath?: string;
};

const manifest: Record<string, { title: string; description: string; canonicalPath: string }> = {};

function normalizePath(value: string): string {
  const clean = value.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  return clean.startsWith('/') ? clean : '/' + clean;
}

function addRecords(records: Record<string, SeoRecord>) {
  for (const [route, record] of Object.entries(records)) {
    if (!record || typeof record.title !== 'string' || typeof record.metaDescription !== 'string') continue;
    const canonicalPath = normalizePath(record.canonicalPath || route);
    manifest[canonicalPath] = {
      title: record.title.trim(),
      description: record.metaDescription.trim(),
      canonicalPath,
    };
    manifest[normalizePath(route)] = manifest[canonicalPath];
  }
}

addRecords(SERVICES_CONTENT);
addRecords(ROOF_SYSTEMS_CONTENT);
addRecords(INDUSTRIES_CONTENT);
addRecords(SERVICE_AREAS_CONTENT);
addRecords(CITY_SERVICE_AREAS_CONTENT);
addRecords(COATING_ARTICLES_CONTENT);

manifest['/'] = {
  title: 'Commercial Roofing | Commercial Roof Doctors – Texarkana, TX',
  description: 'Commercial Roof Doctors provides commercial roof inspections, repairs, coatings and restoration from Texarkana across the Ark-La-Tex region.',
  canonicalPath: '/',
};

const outputPath = path.resolve('public', 'seo-manifest.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log('[CRD SEO manifest] Generated ' + Object.keys(manifest).length + ' route metadata entries.');
