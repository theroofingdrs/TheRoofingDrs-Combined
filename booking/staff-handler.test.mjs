import test from 'node:test';import assert from 'node:assert/strict';
import {handleStaffBooking} from './staff-handler.ts';import {googleAccessToken} from './google-auth.ts';
const key='a0000000-0000-4000-8000-000000000001';
const request=(body,token='test')=>new Request('https://test.invalid/staff-booking',{method:'POST',headers:{'Authorization':'Bearer '+token},body:JSON.stringify(body)});
test('disabled staff booking performs no authentication, database or provider work',async()=>{
 assert.equal((await handleStaffBooking(request({}),{enabled:false})).status,503);
});
test('staff handler derives actor from verified session and rejects cross-division requests',async()=>{
 const calls=[];const deps={enabled:true,verify:async token=>token==='valid'?{id:'verified-actor'}:null,authorize:async(...args)=>{calls.push(args);return args[1]==='TRD';},engine:{cancel:async key=>({status:'cancelled',key})}};
 assert.equal((await handleStaffBooking(request({action:'cancel',key,division:'TRD'},'bad'),deps)).status,401);
 assert.equal((await handleStaffBooking(request({action:'cancel',key,division:'CRD',actor:'forged'},'valid'),deps)).status,403);
 assert.deepEqual(calls[0],['verified-actor','CRD',key]);
 const result=await handleStaffBooking(request({action:'cancel',key,division:'TRD'},'valid'),deps);assert.equal(result.status,200);assert.equal(result.headers.get('Cache-Control'),'no-store');
});
test('OAuth refresh is single-flight, cached, and never echoes provider errors or credentials',async()=>{
 let count=0;let clock=0;const token=googleAccessToken({clientId:'client',clientSecret:'secret',refreshToken:'refresh'},async(url,options)=>{count++;assert.equal(url,'https://oauth2.googleapis.com/token');assert.equal(options.redirect,'error');return Response.json({access_token:'test-access',token_type:'Bearer',expires_in:3600});},()=>clock);
 assert.deepEqual(await Promise.all([token(),token()]),['test-access','test-access']);assert.equal(count,1);clock=3600000;await token();assert.equal(count,2);
 const rejected=googleAccessToken({clientId:'client',clientSecret:'secret',refreshToken:'refresh'},async()=>Response.json({error:'secret'},{status:400}));await assert.rejects(rejected(),e=>!e.message.includes('secret'));
});

import {staffBookingRuntime} from './runtime.ts';
test('server runtime is default-off with no external requests',async()=>{assert.equal((await staffBookingRuntime(request({}),{})).status,503);assert.equal((await staffBookingRuntime(request({}),{BOOKING_ENABLED:'true'})).status,503);});

import {assessRuntime} from './runtime-readiness.ts';
test('preflight reports missing server bindings and accidental public secrets without values',()=>{const result=assessRuntime({BOOKING_ENABLED:'true',VITE_SERVICE_ROLE_KEY:'never-print-me'});assert.equal(result.ready,false);assert(result.issues.some(x=>x.includes('SUPABASE_SERVICE_ROLE_KEY')));assert(!JSON.stringify(result).includes('never-print-me'));assert.equal(assessRuntime({SUPABASE_URL:'https://test.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'synthetic'}).ready,true);});
