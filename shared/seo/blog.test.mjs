import test from 'node:test';
import assert from 'node:assert/strict';
let caseId=0;
const fresh=()=>import('./blog.ts?test='+caseId++);
test('public blog resolution deduplicates feed requests, caches published data and distinguishes unknown slugs from outages',async()=>{
 const {publishedBlogPost,publishedResidentialMetadata,publishedCommercialMetadata}=await fresh();
 const original=globalThis.fetch;let calls=0;
 globalThis.fetch=async url=>{calls++;assert(String(url).includes('crm-public-blog?division='));if(String(url).endsWith('CRD'))throw Error('Synthetic feed outage');return Response.json({posts:[{slug:'published',title:'Synthetic public post',seo_title:'Existing SEO title',seo_description:'Existing description'}]});};
 try{
  const [a,b]=await Promise.all([publishedBlogPost('TRD','published'),publishedBlogPost('TRD','published')]);assert(a.available&&b.post);assert.equal(calls,1);
  for(const metadata of [publishedResidentialMetadata(a.post),publishedCommercialMetadata(a.post)]){assert.equal(metadata.title,'Existing SEO title');assert.equal(metadata.description,'Existing description');assert.equal(metadata.canonicalPath,'/blog/published');}
  const missing=await publishedBlogPost('TRD','unknown');assert.equal(missing.available,true);assert.equal(missing.post,undefined);assert.equal(calls,1);
  assert.deepEqual(await publishedBlogPost('CRD','published'),{available:false});
 }finally{globalThis.fetch=original;}
});

for(const [name,reply,available] of [
 ['empty published feed',()=>Response.json({posts:[]}),true],
 ['network outage',()=>{throw Error('Synthetic outage')},false],
 ['HTTP outage',()=>Response.json({error:'Unavailable'},{status:503}),false],
 ['invalid JSON',()=>new Response('invalid JSON'),false],
 ...[null,[],{},[{slug:'published',title:'Wrong envelope'}],{posts:{}},{posts:[null]},{posts:[{slug:'published'}]}].map(value=>['malformed '+JSON.stringify(value),()=>Response.json(value),false])
])test(name,async()=>{
 const {publishedBlogPost}=await fresh(),original=globalThis.fetch;
 globalThis.fetch=async()=>reply();
 try{for(const division of ['TRD','CRD'])assert.deepEqual(await publishedBlogPost(division,'unknown'),available?{available:true,post:undefined}:{available:false});}finally{globalThis.fetch=original;}
});
test('failed feed is retried and healthy commercial feed resolves',async()=>{
 const {publishedBlogPost}=await fresh(),original=globalThis.fetch;let calls=0;
 globalThis.fetch=async()=>++calls===1?Response.json({posts:{}}):Response.json({posts:[{slug:'published',title:'Recovered'}]});
 try{assert.deepEqual(await publishedBlogPost('CRD','published'),{available:false});assert.equal((await publishedBlogPost('CRD','published')).post.title,'Recovered');assert.equal(calls,2);}finally{globalThis.fetch=original;}
});
