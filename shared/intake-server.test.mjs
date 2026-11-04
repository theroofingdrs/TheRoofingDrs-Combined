import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deliverInquiry } from './intake-server.ts';
const originalFetch=globalThis.fetch;
const key='a0000000-0000-4000-8000-000000000010';
process.env.SUPABASE_URL='https://intake.example.test';process.env.SUPABASE_SERVICE_ROLE_KEY='synthetic-server-only';
const receipt={ok:true,status:'delivered',submission_key:key,lead_id:'synthetic-lead',source_id:'synthetic-source',received_at:'2026-11-04T00:00:00Z'};
test('stable authenticated retries survive a lost response without changing the payload',async()=>{
 const requests=[];globalThis.fetch=async(url,options)=>{requests.push({url,...options});if(requests.length===1)throw new TypeError('Synthetic lost acknowledgement');return Response.json(receipt);};
 try{const result=await deliverInquiry('TRD',key,{name:'Synthetic',phone:'9035550100'});assert.equal(result.lead_id,'synthetic-lead');assert.equal(requests.length,2);assert.equal(requests[0].body,requests[1].body);assert.equal(requests[0].headers.Authorization,'Bearer synthetic-server-only');assert.equal(JSON.parse(requests[0].body).p_division,'TRD');}finally{globalThis.fetch=originalFetch;}
});
test('failed CRM delivery never returns website success',async()=>{
 globalThis.fetch=async()=>Response.json({...receipt,ok:false,status:'failed',error_code:'P0001'});
 try{await assert.rejects(deliverInquiry('CRD',key,{name:'Synthetic',phone:'9035550100'}),e=>e.status===503);}finally{globalThis.fetch=originalFetch;}
});
test('key conflicts cannot overwrite an earlier inquiry',async()=>{
 globalThis.fetch=async()=>Response.json({ok:false,status:'conflict'});
 try{await assert.rejects(deliverInquiry('TRD',key,{phone:'9035550100'}),e=>e.status===409);}finally{globalThis.fetch=originalFetch;}
});
test('missing key and browser-style credentials cannot be mistaken for configured delivery',async()=>{
 await assert.rejects(deliverInquiry('TRD',undefined,{}),e=>e.status===400);
 delete process.env.SUPABASE_SERVICE_ROLE_KEY;
 await assert.rejects(deliverInquiry('TRD',key,{phone:'9035550100'}),e=>e.status===503);
 process.env.SUPABASE_SERVICE_ROLE_KEY='synthetic-server-only';
});
test('provider authentication failure and malformed success fail closed without exposing response text',async()=>{
 for(const response of [new Response('PRIVATE synthetic config',{status:401}),Response.json({ok:true})]){
  globalThis.fetch=async()=>response;
  try{await assert.rejects(deliverInquiry('TRD',key,{phone:'9035550100'}),e=>e.status===503&&!e.message.includes('PRIVATE'));}finally{globalThis.fetch=originalFetch;}
 }
});
