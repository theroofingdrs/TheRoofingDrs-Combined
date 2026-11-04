import test from 'node:test';import assert from 'node:assert/strict';
import {parseAddress,placesProvider} from './places.ts';
const component=(type,longText,shortText=longText)=>({types:[type],longText,shortText});
const parts=[component('street_number','123'),component('route','Synthetic Road'),component('locality','Texarkana'),component('administrative_area_level_1','Arkansas','AR'),component('postal_code','71854'),component('country','United States','US')];
test('selection extracts canonical street/city/state/ZIP without guessing from formatted text',()=>{
 assert.deepEqual(parseAddress({addressComponents:parts,formattedAddress:'Ignored provider prose'}),{street:'123 Synthetic Road',city:'Texarkana',state:'AR',zip:'71854',formatted:'123 Synthetic Road, Texarkana AR 71854'});
 const partial=parseAddress({addressComponents:parts.filter(p=>!['locality','postal_code','administrative_area_level_1'].includes(p.types[0]))});assert.equal(partial.city,'');assert.equal(partial.state,'');assert.equal(partial.zip,'');
});
test('city-only, invalid and non-US locations are not invented into street addresses',()=>{
 for(const addressComponents of [[],parts.filter(p=>p.types[0]!=='street_number'),parts.map(p=>p.types[0]==='country'?component('country','Canada','CA'):p)])assert.equal(parseAddress({addressComponents}),null);
 assert.equal(parseAddress({addressComponents:parts.concat(component('subpremise','Suite 4'),component('postal_code_suffix','0123'))}).zip,'71854-0123');
});
test('provider uses a session token, bounds suggestions and requests only needed details on selection',async()=>{
 const calls=[];const lib={AutocompleteSessionToken:class{},AutocompleteSuggestion:{fetchAutocompleteSuggestions:async request=>{calls.push(request);return {suggestions:Array.from({length:9},()=>({placePrediction:{text:{toString:()=>'<img> Synthetic street, Texarkana AR'},toPlace:()=>({addressComponents:parts,fetchFields:async request=>calls.push(request)})}}))};}}};
 const provider=placesProvider(lib),token=provider.token();const predictions=await provider.suggest('123 Synthetic',token);assert.equal(predictions.length,5);assert.equal(calls.length,1);assert.equal(calls[0].sessionToken,token);assert.deepEqual(calls[0].includedRegionCodes,['us']);await predictions[0].resolve();assert.deepEqual(calls[1],{fields:['addressComponents','formattedAddress']});
});
test('one page reuses the existing SDK import instead of loading scripts for each field',async()=>{
 const previous=globalThis.window;let imports=0;
 const lib={AutocompleteSessionToken:class{},AutocompleteSuggestion:{fetchAutocompleteSuggestions:async()=>({suggestions:[]})}};
 globalThis.window={google:{maps:{importLibrary:async()=>{imports++;return lib;}}}};
 try{const {loadPlaces}=await import('./places.ts?loaded');await Promise.all([loadPlaces('public-test-key'),loadPlaces('public-test-key')]);assert.equal(imports,1);}finally{globalThis.window=previous;}
});
test('missing key does not load any script or need a DOM to preserve manual entry',async()=>{
 const previous=globalThis.window;globalThis.window={};try{const {loadPlaces}=await import('./places.ts?missing');await assert.rejects(loadPlaces(undefined));}finally{globalThis.window=previous;}
});
test('failed SDK load can be retried instead of permanently caching the rejection',async()=>{
 const oldWindow=globalThis.window,oldDocument=globalThis.document;const listeners=new Map();let appended=0,attached=null;
 const script={addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:()=>{},remove:()=>{attached=null;}};
 globalThis.window={};globalThis.document={querySelector:()=>attached,createElement:()=>script,head:{appendChild:node=>{appended++;attached=node;}}};
 try{
  const {loadPlaces}=await import('./places.ts?retry');const first=loadPlaces('public-test-key');listeners.get('error')();await assert.rejects(first);assert.equal(appended,1);assert.equal(attached,null);
  const second=loadPlaces('public-test-key');assert.equal(appended,2);
  globalThis.window.google={maps:{importLibrary:async()=>({AutocompleteSessionToken:class{},AutocompleteSuggestion:{fetchAutocompleteSuggestions:async()=>({suggestions:[]})}})}};
  globalThis.window.__trdcrdPlacesReady();await second;
  assert.equal((await loadPlaces('public-test-key')),await second);
 }finally{globalThis.window=oldWindow;globalThis.document=oldDocument;}
});
test('concurrent fields share one in-flight Maps SDK load',async()=>{
 const oldWindow=globalThis.window,oldDocument=globalThis.document;let callback;let appended=0;
 const script={addEventListener:()=>{},removeEventListener:()=>{}};
 globalThis.window={};globalThis.document={querySelector:()=>null,createElement:()=>script,head:{appendChild:()=>appended++}};
 try{
  const {loadPlaces}=await import('./places.ts?concurrent');const first=loadPlaces('public-test-key'),second=loadPlaces('public-test-key');
  globalThis.window.google={maps:{importLibrary:async()=>({AutocompleteSessionToken:class{},AutocompleteSuggestion:{fetchAutocompleteSuggestions:async()=>({suggestions:[]})}})}};
  globalThis.window.__trdcrdPlacesReady();await Promise.all([first,second]);assert.equal(appended,1);
 }finally{globalThis.window=oldWindow;globalThis.document=oldDocument;}
});
