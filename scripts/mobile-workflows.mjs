// Real mobile Chromium; API/session fixtures are intercepted and never call production.
import{spawn,spawnSync}from'node:child_process';import{mkdtemp,rm}from'node:fs/promises';import os from'node:os';import path from'node:path';import assert from'node:assert/strict';
const root=process.cwd(),temp=await mkdtemp(path.join(os.tmpdir(),'roofing-mobile-'));
const browserBin=process.env.CHROME_BIN||['chromium','google-chrome','google-chrome-stable'].find(bin=>spawnSync('which',[bin]).status===0);
if(!browserBin)throw Error('Chromium is required for mobile workflow validation.');
const processes=[],clients=[];
const start=(args,cwd,env={})=>{const p=spawn(process.execPath,args,{cwd,env:{...process.env,NODE_ENV:'production',WEBSITE_DATA_DIR:temp,...env},stdio:'ignore'});processes.push(p);return p;};
const wait=async(predicate)=>{for(let i=0;i<150;i++){try{if(await predicate())return;}catch{}await new Promise(r=>setTimeout(r,100));}throw Error('Mobile workflow timed out');};
try{
 start(['server.mjs'],root,{PORT:'19200'});
 if(process.env.CRM_SOURCE_DIR)start(['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','19201'],process.env.CRM_SOURCE_DIR);
 const browser=spawn(browserBin,['--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-background-networking','--disable-component-update','--no-first-run','--remote-debugging-port=19222','--user-data-dir='+path.join(temp,'chrome'),'about:blank'],{stdio:'ignore'});processes.push(browser);
 await wait(async()=>{return(await fetch('http://127.0.0.1:19222/json/version')).ok;});
 async function page(crm=false){
  const target=await(await fetch('http://127.0.0.1:19222/json/new?about:blank',{method:'PUT'})).json();
  const ws=new WebSocket(target.webSocketDebuggerUrl);clients.push(ws);await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}));
  let seq=0;const pending=new Map(),posts=[],apiRoutes=[];let retried=false;
  const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
  ws.addEventListener('message',async event=>{const message=JSON.parse(event.data);if(message.id){const task=pending.get(message.id);if(task){pending.delete(message.id);message.error?task.reject(Error(message.error.message)):task.resolve(message.result);}return;}
   if(message.method!=='Fetch.requestPaused')return;
   const {requestId,request}=message.params,url=new URL(request.url);
   const allowedHeaders=Object.entries(request.headers).find(([name])=>name.toLowerCase()==='access-control-request-headers')?.[1]||'authorization,apikey,content-type,x-client-info,prefer,range,x-supabase-api-version';
   let body;
   if(crm&&url.hostname.endsWith('supabase.co')){
    apiRoutes.push(url.pathname+(request.method==='OPTIONS'?' OPTIONS':''));
    const table=url.pathname.split('/').at(-1);
    body=table==='crm_memberships'?(url.searchParams.has('role')?[]:[{division_id:'TRD',role:'owner'},{division_id:'CRD',role:'owner'}]):table==='crm_profiles'?{display_name:'Synthetic owner'}:table==='crm_website_intake_status'?[{submission_key:'synthetic-key',received_at:'2026-11-04T06:00:00Z',status:retried?'delivered':'failed',attempts:1,matching:'new',error_code:retried?null:'SYNTHETIC',error_message:'Synthetic retry needed',notifications:{internal:'pending'}}]:table==='crm_retry_website_lead'?(retried=true,{ok:true}):table==='crm_website_lead_attachments'?[{id:'e0000000-0000-4000-8000-000000000001',filename:'synthetic.png',mime:'image/png',size_bytes:8}]:table==='crm_website_attachment'?{filename:'synthetic.png',mime:'image/png',data_base64:'iVBORw0KGgo='}:table==='crm_customers'?[{id:'customer',display_name:'Synthetic customer'}]:table==='crm_leads'?[{id:'synthetic-lead',customer:{display_name:'Synthetic customer',email:'synthetic@example.test',phone:'9035550100'},service_interest:'Roof inspection',status:'new',priority:'normal',source:'Website',description:'Synthetic source notes',created_at:'2026-11-04T06:00:00Z',assigned_to:null,source_record_id:'website-TRD-synthetic'}]:[];
   }else if(!crm&&request.method==='POST'&&url.pathname.includes('/api/')){posts.push(request);body=posts.length===1?{error:'Synthetic storage unavailable'}:{success:true,id:'synthetic',leadId:'synthetic',deliveryStatus:'delivered'};}
   else if(['127.0.0.1','localhost'].includes(url.hostname)){await call('Fetch.continueRequest',{requestId});return;}
   else body={};
   await call('Fetch.fulfillRequest',{requestId,responseCode:!crm&&posts.length===1&&request.method==='POST'?503:200,responseHeaders:[{name:'content-type',value:'application/json'},{name:'access-control-allow-origin',value:'*'},{name:'access-control-allow-methods',value:'GET,POST,PATCH,OPTIONS'},{name:'access-control-allow-headers',value:allowedHeaders},{name:'content-range',value:'0-0/1'}],body:Buffer.from(JSON.stringify(body)).toString('base64')});
  });
  await call('Page.enable');await call('Runtime.enable');await call('Browser.setDownloadBehavior',{behavior:'deny'});await call('Fetch.enable',{patterns:[{urlPattern:'*'}]});await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  if(crm){const user={id:'10000000-0000-4000-8000-000000000001',email:'owner@example.test',aud:'authenticated',role:'authenticated'};const jwt=Buffer.from(JSON.stringify({alg:'HS256'})).toString('base64url')+'.'+Buffer.from(JSON.stringify({sub:user.id,exp:Math.floor(Date.now()/1000)+3600,role:'authenticated'})).toString('base64url')+'.synthetic';const session={access_token:jwt,refresh_token:'synthetic',expires_at:Math.floor(Date.now()/1000)+3600,expires_in:3600,token_type:'bearer',user};await call('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('sb-gubvelngdohrfvqeeabu-auth-token',${JSON.stringify(JSON.stringify(session))});localStorage.setItem('trd-crd-workspace-${user.id}','{"view":"leads","division":"TRD"}');`});}
  const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text);return r.result.value;};
  const tap=async selector=>{const bounds=await evaluate(`(()=>{const e=${selector};e.scrollIntoView({block:'center',inline:'center',behavior:'instant'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`);assert(bounds.x>=0&&bounds.x<=390&&bounds.y>=0&&bounds.y<=844,JSON.stringify(bounds));await call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...bounds,radiusX:1,radiusY:1}]});await call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});};
  return{call,evaluate,tap,posts,apiRoutes,retried:()=>retried};
 }
 for(const division of ['residential','commercial']){
  const p=await page();await p.call('Page.navigate',{url:'http://127.0.0.1:19200/'+division+'/contact?utm_campaign=mobile-synthetic'});
  await wait(()=>p.evaluate('!!document.querySelector("form input")'));
  await p.evaluate(`(async()=>{for(const e of document.querySelectorAll('form input')){if(['checkbox','radio','hidden'].includes(e.type))continue;const value=e.type==='email'?'mobile@example.test':e.type==='tel'?'9035550100':e.name==='zip'?'00000':e.name==='state'?'TX':e.name==='city'?'Test':'Synthetic mobile';Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,value);e.dispatchEvent(new Event('input',{bubbles:true}));await new Promise(r=>requestAnimationFrame(r));}return true;})()`);
  assert.equal(await p.evaluate('document.querySelector("form").checkValidity()'),true);
  assert.equal(await p.evaluate('[...document.querySelectorAll("form input")].filter(e=>e.type!=="checkbox"&&e.type!=="radio").every(e=>e.labels.length>0)'),true);
  await p.tap('document.querySelector("form button[type=submit]")');await wait(()=>p.posts.length===1);await wait(()=>p.evaluate('document.body.textContent.includes("Reference:")'));
  assert(await p.evaluate('[...document.querySelectorAll("form input")].some(e=>e.value==="mobile@example.test")'));
  await p.tap('document.querySelector("form button[type=submit]")');await wait(()=>p.posts.length===2);
  const key=r=>Object.entries(r.headers).find(([k])=>k.toLowerCase()==='idempotency-key')[1];assert.equal(key(p.posts[0]),key(p.posts[1]));assert.equal(p.posts[0].postData,p.posts[1].postData);
  await wait(()=>p.evaluate('!document.querySelector("form")'));
  assert(await p.evaluate('document.documentElement.scrollWidth<=window.innerWidth+1'));
  console.log('PASS mobile Chromium 390px:',division,'labels/contact entry, error retention, identical-key retry and confirmation');
 }
 if(process.env.CRM_SOURCE_DIR){
 const crm=await page(true);await crm.call('Page.navigate',{url:'http://127.0.0.1:19201/'});try{await wait(()=>crm.evaluate('document.body.textContent.includes("Synthetic customer")'));}catch(error){console.error('CRM fixture routes:',crm.apiRoutes);console.error('CRM fixture screen:',await crm.evaluate('document.body.innerText'));throw error;}
 assert(await crm.evaluate('document.documentElement.scrollWidth<=window.innerWidth+1'));
 await crm.tap('[...document.querySelectorAll("button")].find(e=>e.textContent.includes("Retry saved inquiry"))');await wait(()=>crm.retried());
 await wait(()=>crm.evaluate('document.body.textContent.includes("delivered")'));
 await crm.tap('[...document.querySelectorAll("button")].find(e=>e.textContent.includes("Website attachments"))');await wait(()=>crm.evaluate('document.body.textContent.includes("Download synthetic.png")'));await crm.tap('[...document.querySelectorAll("button")].find(e=>e.textContent.includes("Download synthetic.png"))');await wait(()=>crm.apiRoutes.includes('/rest/v1/rpc/crm_website_attachment'));
 await crm.evaluate(`(()=>{const e=document.querySelector('input[type=search]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,'no-match-fixture');e.dispatchEvent(new Event('input',{bubbles:true}));})()`);await wait(()=>crm.evaluate('document.body.textContent.includes("No matching leads")'));
 console.log('PASS mobile Chromium 390px: CRM lead display, search, owner recovery, attachment access and bounded page width (synthetic auth/data)');
 }
}finally{for(const client of clients)client.close();await Promise.all(processes.map(p=>new Promise(resolve=>{if(p.exitCode!==null)return resolve();p.once('exit',resolve);p.kill('SIGTERM');})));await rm(temp,{recursive:true,force:true,maxRetries:10,retryDelay:200}).catch(error=>console.error('Temporary browser cleanup:',error.code));}
