// Real built child servers behind the combined proxy; inspect HTTP bytes before JS.
import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
const temp = await mkdtemp(path.join(os.tmpdir(),'roofing-seo-'));
const env = {...process.env,NODE_ENV:'production',PORT:'19340',WEBSITE_DATA_DIR:temp};
for(const key of Object.keys(env))if(/^(SUPABASE_|BOOKING_|RESEND_|SENDGRID_|CRM_)/.test(key))delete env[key];
const feedFixture=path.join(temp,'public-blog-fixture.mjs');
await writeFile(feedFixture,`const original=globalThis.fetch;globalThis.fetch=(input,options)=>{if(String(input).startsWith('https://gubvelngdohrfvqeeabu.supabase.co/functions/v1/crm-public-blog'))return Promise.resolve(Response.json([{slug:'published-cms-slug',title:'Synthetic public post',excerpt:'Published public advice',seo_title:'Synthetic & Safe $& <roof>',seo_description:'Public description & details',published_at:'2026-01-01'}]));return original(input,options);};`);
env.NODE_OPTIONS=((env.NODE_OPTIONS||'')+' --import='+pathToFileURL(feedFixture).href).trim();
const server=spawn(process.execPath,['server.mjs'],{env,stdio:['ignore','ignore','pipe']});
let stderr='';server.stderr.on('data',chunk=>stderr=(stderr+chunk).slice(-4000));
const decode=text=>text.replace(/&(amp|quot|lt|gt|#39);/g,(_,key)=>({amp:'&',quot:'"',lt:'<',gt:'>','#39':"'"}[key]));
const attr=(tag,name)=>decode(tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`,'i'))?.[1] || '');
function head(html){
 const tags=[...html.matchAll(/<(meta|link)\b[^>]*>/gi)].map(m=>m[0]);
 const canonicals=tags.filter(t=>attr(t,'rel')==='canonical').map(t=>attr(t,'href'));
 const descriptions=tags.filter(t=>attr(t,'name')==='description').map(t=>attr(t,'content'));
 const schemas=[...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>JSON.parse(m[1]));
 return{title:decode(html.match(/<title>(.*?)<\/title>/s)?.[1] || ''),canonicals,descriptions,schemas};
}
const hasType=(value,type)=>!!value&&typeof value==='object'&&(value['@type']===type||Object.values(value).some(item=>Array.isArray(item)?item.some(v=>hasType(v,type)):hasType(item,type)));
async function get(route){const response=await fetch('http://127.0.0.1:19340'+route,{redirect:'manual',signal:AbortSignal.timeout(5000)});return{response,body:await response.text()};}
try{
 let ready=false;for(let i=0;i<100;i++){if(server.exitCode!==null)throw Error(stderr);try{if((await get('/residential/api/health')).response.ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}assert(ready,'Combined server startup');
 const residential=JSON.parse(await readFile('source-apps/trd/dist/seo-manifest.json','utf8'));
 const home=head(await readFile('source-apps/trd/dist/index.html','utf8'));
 assert.equal(home.title,'The Roof Doctors — Residential Roofing & Storm Damage Specialists');
 assert.deepEqual(home.descriptions,['The Roof Doctors — Residential Roofing & Storm Damage Specialists. Free 21-point forensic roof inspections, hail repairs, emergency tarping, and insurance claim support in Texarkana & Northeast Texas.']);
 let checked=0;
 for(const [route,metadata] of Object.entries(residential)){
  if(route==='/__fallback'||route==='/service-areas/__unknown__')continue;
  const {response,body}=await get('/residential'+(route==='/'?'/':route));assert.equal(response.status,200,route);
  const actual=head(body),title=metadata.title.includes('The Roof Doctors')?metadata.title:metadata.title+' | The Roof Doctors';
  assert.equal(actual.title,route==='/'?home.title:title,route);
  assert.deepEqual(actual.descriptions,route==='/'?home.descriptions:[metadata.description],route);
  assert.deepEqual(actual.canonicals,['https://theroofingdrs.com/residential'+(metadata.canonicalPath==='/'?'/':metadata.canonicalPath)],route);
  assert(!actual.canonicals[0].includes('/residential/residential/'));
  assert(actual.schemas.some(s=>hasType(s,'Organization')),route+' shared Organization');
  assert.equal(actual.schemas.some(s=>hasType(s,'FAQPage')),hasType(metadata.schemaJson,'FAQPage'),route+' scoped FAQs');
  if(metadata.schemaJson)assert(actual.schemas.some(s=>JSON.stringify(s)===JSON.stringify(metadata.schemaJson)),route+' declaration schema');
  checked++;
 }
 for(const route of ['/projects','/reviews','/roof-problems','/roofing-cost','/services','/roofing/roof-maintenance'])assert.equal((await get('/residential'+route)).response.status,200,'Alias retained '+route);
 const trailingFaq=await get('/residential/faq/');assert.equal(trailingFaq.response.status,200);assert(!head(trailingFaq.body).schemas.some(s=>hasType(s,'FAQPage')),'Trailing FAQ alias uses the existing services fallback, not the FAQ screen');
 assert.deepEqual(head(trailingFaq.body).canonicals,['https://theroofingdrs.com/residential/faq/']);
 assert.deepEqual(head((await get('/residential/service-areas/texarkana/extra')).body).canonicals,['https://theroofingdrs.com/residential/service-areas/texarkana']);
 const commercial=JSON.parse(await readFile('source-apps/crd/dist/seo-manifest.json','utf8'));
 const nine=['/about','/commercial-roof-cost-calculator','/coat-vs-replace','/contact','/crd-ppp','/emergency-roofing','/insurance-claims','/property-management','/storm-damage'];
 for(const route of nine){
  const metadata=commercial[route];assert(metadata,'Dedicated page missing: '+route);
  const {response,body}=await get('/commercial'+route);assert.equal(response.status,200,route);
  const actual=head(body);assert.equal(actual.title,metadata.title.includes('Commercial Roof Doctors')||/\|\s*CRD$/i.test(metadata.title)?metadata.title:metadata.title+' | CRD');
  assert.deepEqual(actual.descriptions,[metadata.description]);assert.deepEqual(actual.canonicals,['https://theroofingdrs.com/commercial'+metadata.canonicalPath]);checked++;
 }
 assert.equal(head((await get('/commercial/about')).body).title,'About Commercial Roof Doctors | 22+ Years Roofing Authority');
 assert.equal(head((await get('/residential/roofing/roof-repair')).body).title,'Precision Roof Repair & Diagnostic Leak Fix | The Roof Doctors');
 const routes=JSON.parse(await readFile('source-apps/crd/dist/app-routes.json','utf8'));
 for(const route of routes)assert.equal((await get('/commercial'+(route==='/'?'/':route))).response.status,200,'Valid route '+route);
 for(const route of ['/not-a-real-roofing-page','/services/not-real','/industries/not-real','/blog/unknown-unpublished-slug','/assets/missing.js','/missing.css','/missing.png'])assert.equal((await get('/commercial'+route)).response.status,404,'Unknown route/asset '+route);
 const unknown=await get('/commercial/not-a-real-roofing-page');assert.equal(unknown.response.headers.get('location'),null);assert.equal(unknown.response.headers.get('x-robots-tag'),'noindex');assert.deepEqual(head(unknown.body).canonicals,[]);
 for(const route of ['/blog','/blog/published-cms-slug','/industries','/admin','/staff','/large-loss-roofing','/adjuster-meetings','/commercial-storm-inspections'])assert.equal((await get('/commercial'+route)).response.status,200,'Application family retained '+route);
 for(const [alias,canonical] of [['/large-loss-roofing','/insurance-claims'],['/adjuster-meetings','/insurance-claims'],['/commercial-storm-inspections','/storm-damage']])assert.deepEqual(head((await get('/commercial'+alias)).body).canonicals,['https://theroofingdrs.com/commercial'+canonical],'Existing component canonical retained for '+alias);
 const sitemap=(await get('/commercial/sitemap.xml')).body;
 for(const route of ['/commercial-roof-inspection','/new-commercial-construction','/metal-roofing','/roof-asset-management','/multi-property-roofing','/multifamily-roofing','/hoa-roofing','/about/credentials']){
  assert(sitemap.includes('/commercial'+route+'</loc>'),'Disputed sitemap URL must remain '+route);
  assert.equal((await get('/commercial'+route)).response.status,404,'Existing unsupported sitemap route has honest 404 '+route);
 }
 for(const [prefix,file] of [['residential','source-apps/trd/dist/index.html'],['commercial','source-apps/crd/dist/index.html']]){
  const html=await readFile(file,'utf8');for(const [,url]of html.matchAll(/(?:src|href)="([^" ]*\/assets\/[^" ]+)"/g))assert.equal((await get(url)).response.status,200,'Asset '+url);
 }
 const faq=head((await get('/residential/faq')).body);assert(faq.schemas.some(s=>hasType(s,'FAQPage')));
 for(const route of ['/residential/contact','/residential/roofing/roof-repair','/residential/projects','/residential/tools/roof-cost-estimator'])assert(!head((await get(route)).body).schemas.some(s=>hasType(s,'FAQPage')),route+' no unrelated FAQ');
 const published=await get('/residential/blog/published-cms-slug'), publishedHead=head(published.body);
 assert.equal(publishedHead.title,'Synthetic & Safe $& <roof> | The Roof Doctors');
 assert.deepEqual(publishedHead.canonicals,['https://theroofingdrs.com/residential/blog/published-cms-slug']);
 assert.deepEqual(publishedHead.descriptions,['Public description & details']);
 assert(publishedHead.schemas.some(schema=>hasType(schema,'BlogPosting')));assert(!published.body.includes('<roof>'));
 console.log(`PASS initial HTTP SEO: ${checked} route metadata records; ${routes.length} valid commercial routes; aliases, canonicals, schemas, assets and HTTP 404s.`);
}finally{
 await new Promise(resolve=>{if(server.exitCode!==null)return resolve();const timer=setTimeout(()=>server.kill('SIGKILL'),5000);server.once('exit',()=>{clearTimeout(timer);resolve();});server.kill('SIGTERM');});await rm(temp,{recursive:true,force:true});
}
