import test from 'node:test';
import assert from 'node:assert/strict';
import {publishedBlogPost} from './blog.ts';
test('public blog resolution deduplicates feed requests, caches published data and distinguishes unknown slugs from outages',async()=>{
 const original=globalThis.fetch;let calls=0;
 globalThis.fetch=async url=>{calls++;assert(String(url).includes('crm-public-blog?division='));if(String(url).endsWith('CRD'))throw Error('Synthetic feed outage');return Response.json([{slug:'published',title:'Synthetic public post'}]);};
 try{
  const [a,b]=await Promise.all([publishedBlogPost('TRD','published'),publishedBlogPost('TRD','published')]);assert(a.available&&b.post);assert.equal(calls,1);
  const missing=await publishedBlogPost('TRD','unknown');assert.equal(missing.available,true);assert.equal(missing.post,undefined);assert.equal(calls,1);
  assert.deepEqual(await publishedBlogPost('CRD','published'),{available:false});
 }finally{globalThis.fetch=original;}
});
