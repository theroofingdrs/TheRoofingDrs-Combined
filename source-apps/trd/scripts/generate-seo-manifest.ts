import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';
import ts from 'typescript';

// Rendering is build-only: useEffect/API calls do not run. The page declarations
// remain the only source of route titles, descriptions, canonicals and schemas.
const routes = new Set<string>(['/']);
// The existing storm dispatcher also accepts arbitrary what-to-do deep links.
routes.add('/storm-damage/what-to-do');
for (const xml of ['public/sitemap.xml','../../sitemap.xml']) if (fs.existsSync(xml)) {
  for (const match of fs.readFileSync(xml,'utf8').matchAll(/<loc>https:\/\/theroofingdrs.com\/residential([^<]*)<\/loc>/g)) routes.add(match[1] || '/');
}
function visit(node: ts.Node) {
  if (ts.isStringLiteral(node) && /^\/(?!assets|api|app|field|portal|residential|commercial)[\w/-]+$/.test(node.text) && !node.text.endsWith('/')) routes.add(node.text);
  ts.forEachChild(node,visit);
}
for (const file of fs.readdirSync('src/components/public',{recursive:true}).filter(file=>String(file).endsWith('.tsx'))) {
  const filename = path.join('src/components/public',String(file));
  visit(ts.createSourceFile(filename,fs.readFileSync(filename,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX));
}
const blog = fs.readFileSync('src/components/public/pages/BlogPage.tsx','utf8');
for (const match of blog.matchAll(/slug:\s*['"]([^'"]+)['"]/g)) routes.add('/blog/' + match[1]);
const vite = await createServer({ server:{middlewareMode:true,hmr:false,watch:null}, appType:'custom' });
try {
  const { PublicWebsiteView } = await vite.ssrLoadModule('/src/views/PublicWebsiteView.tsx');
  const { SeoCollectionContext } = await vite.ssrLoadModule('/src/components/common/SeoHead.tsx');
  const { EstimateRequestView } = await vite.ssrLoadModule('/src/views/EstimateRequestView.tsx');
  const manifest: Record<string, any> = {};
  for (const route of [...routes,'/__fallback','/service-areas/__unknown__']) {
    const records: any[] = [];
    const page = route === '/estimate-request' ? React.createElement(EstimateRequestView,{onNavigate:()=>{}}) : React.createElement(PublicWebsiteView,{currentPath:route});
    renderToString(React.createElement(SeoCollectionContext.Provider,{value:(metadata:any)=>records.push(metadata)},page));
    if (records.length !== 1) throw Error(`Expected one SEO declaration for ${route}, got ${records.length}`);
    manifest[route.replace(/\/+$/,'') || '/'] = records[0];
  }
  fs.writeFileSync(path.resolve('dist/seo-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  console.log(`[TRD SEO] Generated ${Object.keys(manifest).length} route records from page declarations.`);
} finally { await vite.close(); }
