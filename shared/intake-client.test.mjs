import test from 'node:test';import assert from 'node:assert/strict';import{submitInquiry}from'./intake-client.ts';
const saved=new Map();globalThis.sessionStorage={getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)};globalThis.location={pathname:'/residential/contact',search:'?utm_source=google&utm_campaign=synthetic'};globalThis.document={referrer:'https://example.test/campaign'};
test('failed request retains a stable identity and attribution without storing contact details',async()=>{
 const requests=[];globalThis.fetch=async(url,options)=>{requests.push({url,...options});return Response.json(requests.length===1?{error:'Synthetic unavailable'}:{deliveryStatus:'delivered',id:'synthetic'},{status:requests.length===1?503:201});};
 const payload={name:'Synthetic private name',phone:'9035550100'};
 await assert.rejects(submitInquiry('/residential/api/v1/leads',payload),/Reference:/);
 await submitInquiry('/residential/api/v1/leads',payload);
 assert.equal(requests[0].headers['Idempotency-Key'],requests[1].headers['Idempotency-Key']);assert.equal(requests[0].body,requests[1].body);
 assert.equal(JSON.parse(requests[1].body).utmCampaign,'synthetic');assert(!JSON.stringify([...saved]).includes(payload.name));assert(!JSON.stringify([...saved]).includes(payload.phone));
 await submitInquiry('/residential/api/v1/leads',{...payload,name:'Changed synthetic name'});assert.notEqual(requests[2].headers['Idempotency-Key'],requests[1].headers['Idempotency-Key']);
});
test('transport errors and malformed 200 responses cannot become confirmation',async()=>{
 globalThis.fetch=async()=>{throw new TypeError('offline');};await assert.rejects(submitInquiry('/commercial/api/leads',{name:'Synthetic',phone:'123'}),/Reference:/);
 globalThis.fetch=async()=>Response.json({});await assert.rejects(submitInquiry('/commercial/api/leads',{name:'Synthetic',phone:'123'}),/not confirmed/);
});

test('reselecting the same photo keeps its inquiry key despite transient file-picker IDs/times',async()=>{
 const requests=[];globalThis.fetch=async(url,options)=>{requests.push(options);return Response.json({deliveryStatus:'delivered'});};
 const photo={name:'synthetic.png',type:'image/png',size:10,dataUrl:'data:image/png;base64,c3ludGhldGlj'};
 await submitInquiry('/commercial/api/leads',{name:'Synthetic',phone:'9035550100',photos:[{...photo,id:'one',uploadedAt:'first'}]});
 await submitInquiry('/commercial/api/leads',{name:'Synthetic',phone:'9035550100',photos:[{...photo,id:'two',uploadedAt:'later'}]});
 assert.equal(requests[0].headers['Idempotency-Key'],requests[1].headers['Idempotency-Key']);assert.equal(requests[0].body,requests[1].body);
});


test('records a GA4 lead conversion only after confirmed delivery without sending contact details',async()=>{
 const events=[];globalThis.gtag=(...args)=>events.push(args);
 globalThis.fetch=async()=>Response.json({deliveryStatus:'delivered'},{status:201});
 await submitInquiry('/commercial/api/leads',{name:'Synthetic private name',phone:'9035550100',leadType:'Inspection',source:'Contact Page Form'});
 assert.equal(events.length,1);
 assert.deepEqual(events[0],['event','generate_lead',{method:'website_form',brand:'commercial',form_name:'Contact Page Form',lead_type:'Inspection'}]);
 assert(!JSON.stringify(events).includes('Synthetic private name'));
 assert(!JSON.stringify(events).includes('9035550100'));
 delete globalThis.gtag;
});
