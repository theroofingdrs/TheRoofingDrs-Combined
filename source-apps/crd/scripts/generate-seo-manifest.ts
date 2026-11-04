import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
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

// Read the nine dedicated pages' existing JSX declarations. Fail the build if a
// declaration stops being static rather than silently inventing fallback copy.
const dedicated: Record<string,{title:string;description:string;canonicalPath:string}> = {};
for (const page of ['AboutPage','CalculatorPage','CoatVsReplacePage','ContactPage','CrdPppPage','EmergencyRoofingPage','InsuranceClaimsPage','PropertyManagementPage','StormDamagePage']) {
  const file = `src/pages/${page}.tsx`;
  const source = ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  const records: Record<string,string>[] = [];
  function visit(node: ts.Node) {
    if ((ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) && node.tagName.getText(source)==='SeoMeta') {
      const record: Record<string,string> = {};
      for (const attribute of node.attributes.properties) if (ts.isJsxAttribute(attribute) && ['title','description','canonicalPath'].includes(attribute.name.getText(source))) {
        if (!attribute.initializer || !ts.isStringLiteral(attribute.initializer)) throw Error(`${file}: SEO declaration must be a static string`);
        record[attribute.name.getText(source)] = attribute.initializer.text;
      }
      records.push(record);
    }
    ts.forEachChild(node,visit);
  }
  visit(source);
  if (records.length!==1 || !records[0].title || !records[0].description || !records[0].canonicalPath) throw Error(`${file}: expected one complete SeoMeta declaration`);
  const record = records[0];
  dedicated[page] = {title:record.title,description:record.description,canonicalPath:record.canonicalPath};
  manifest[record.canonicalPath] = dedicated[page];
}

manifest['/'] = {
  title: 'Commercial Roofing | Commercial Roof Doctors – Texarkana, TX',
  description: 'Commercial Roof Doctors provides commercial roof inspections, repairs, coatings and restoration from Texarkana across the Ark-La-Tex region.',
  canonicalPath: '/',
};

const outputPath = path.resolve('public', 'seo-manifest.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });

// Match the client's explicit routes, including staff screens and campaign aliases.
// Metadata presence alone must not decide whether an application route exists.
const routes = new Set([SERVICES_CONTENT,ROOF_SYSTEMS_CONTENT,INDUSTRIES_CONTENT,SERVICE_AREAS_CONTENT,CITY_SERVICE_AREAS_CONTENT,COATING_ARTICLES_CONTENT].flatMap(records=>Object.keys(records)));
const appSource = ts.createSourceFile('App.tsx',fs.readFileSync('src/App.tsx','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
function visitRoute(node: ts.Node) {
  if (ts.isBinaryExpression(node) && node.operatorToken.kind===ts.SyntaxKind.EqualsEqualsEqualsToken && node.left.getText(appSource)==='normalizedPath' && ts.isStringLiteral(node.right) && node.right.text) routes.add(node.right.text);
  if(ts.isIfStatement(node)) {
    const aliases: string[] = [], pages = new Set<string>();
    function condition(child:ts.Node){if(ts.isBinaryExpression(child)&&child.operatorToken.kind===ts.SyntaxKind.EqualsEqualsEqualsToken&&child.left.getText(appSource)==='normalizedPath'&&ts.isStringLiteral(child.right)&&child.right.text)aliases.push(child.right.text);ts.forEachChild(child,condition);}
    function page(child:ts.Node){if((ts.isJsxOpeningElement(child)||ts.isJsxSelfClosingElement(child))&&dedicated[child.tagName.getText(appSource)])pages.add(child.tagName.getText(appSource));ts.forEachChild(child,page);}
    condition(node.expression);page(node.thenStatement);
    if(pages.size===1)for(const alias of aliases)manifest[alias]=dedicated[[...pages][0]];
  }
  ts.forEachChild(node,visitRoute);
}
visitRoute(appSource);
for(const match of fs.readFileSync('src/pages/BlogPage.tsx','utf8').matchAll(/slug:\s*['"]([^'"]+)['"]/g))routes.add('/blog/'+match[1]);
fs.writeFileSync(path.resolve('public/app-routes.json'),JSON.stringify([...routes].sort(),null,2)+'\n');
fs.writeFileSync(outputPath,JSON.stringify(manifest,null,2)+'\n','utf8');
console.log('[CRD SEO manifest] Generated ' + Object.keys(manifest).length + ' route metadata entries.');
