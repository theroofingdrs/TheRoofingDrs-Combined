// Real mobile Chromium; API/session fixtures are intercepted and never call production.
import{spawn,spawnSync}from'node:child_process';import{mkdtemp,rm}from'node:fs/promises';import os from'node:os';import path from'node:path';import assert from'node:assert/strict';
const root=process.cwd(),temp=await mkdtemp(path.join(os.tmpdir(),'roofing-mobile-'));
const browserBin=process.env.CHROME_BIN||['chromium','google-chrome','google-chrome-stable'].find(bin=>spawnSync('which',[bin]).status===0);
if(!browserBin)throw Error('Chromium is required for mobile workflow validation.');
const publicBase=process.env.PUBLIC_TEST_BASE_URL||'http://127.0.0.1:19200';
const processes=[],clients=[];
const start=(args,cwd,env={})=>{const p=spawn(process.execPath,args,{cwd,env:{...process.env,NODE_ENV:'production',WEBSITE_DATA_DIR:temp,...env},stdio:'ignore'});processes.push(p);return p;};
const wait=async(predicate,label='Mobile workflow',timeoutMs=15000)=>{const deadline=Date.now()+timeoutMs;while(Date.now()<deadline){try{if(await predicate())return;}catch{}await new Promise(r=>setTimeout(r,100));}throw Error(`${label} timed out after ${timeoutMs}ms`);};
try{
 if(!process.env.PUBLIC_TEST_BASE_URL)start(['server.mjs'],root,{PORT:'19200'});
 if(process.env.CRM_SOURCE_DIR)start(['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','19201'],process.env.CRM_SOURCE_DIR);
 const browserErrors=[];
 const browser=spawn(browserBin,['--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-background-networking','--disable-component-update','--no-first-run','--remote-debugging-port=19222','--user-data-dir='+path.join(temp,'chrome'),'about:blank'],{stdio:['ignore','ignore','pipe']});processes.push(browser);
 browser.stderr.setEncoding('utf8');browser.stderr.on('data',chunk=>browserErrors.push(chunk));
 await wait(async()=>{if(browser.exitCode!==null)throw Error(`Chromium exited before DevTools was ready (code=${browser.exitCode}, signal=${browser.signalCode||'none'}): ${browserErrors.join('').slice(-3000)}`);const response=await fetch('http://127.0.0.1:19222/json/version').catch(()=>null);return Boolean(response?.ok);},'Chromium DevTools endpoint',60000);
 async function page(crm=false,staff=false){
  const target=await(await fetch('http://127.0.0.1:19222/json/new?about:blank',{method:'PUT'})).json();
  const ws=new WebSocket(target.webSocketDebuggerUrl);clients.push(ws);await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}));
  let seq=0;const pending=new Map(),posts=[],apiRoutes=[],writes=[],tasks=[],bookings=[],bookingPosts=[];let retried=false;const exceptions=[],assetFailures=[];
  const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
  ws.addEventListener('message',async event=>{const message=JSON.parse(event.data);if(message.id){const task=pending.get(message.id);if(task){pending.delete(message.id);message.error?task.reject(Error(message.error.message)):task.resolve(message.result);}return;}
   if(message.method==='Runtime.exceptionThrown')exceptions.push(message.params.exceptionDetails.exception?.description||message.params.exceptionDetails.text);
   if(message.method==='Network.responseReceived'){const r=message.params.response;if(r.url.startsWith(publicBase)&&/\.(?:js|css)(?:\?|$)/.test(r.url)&&r.status>=400)assetFailures.push({path:new URL(r.url).pathname,status:r.status});}
   if(message.method!=='Fetch.requestPaused')return;
   const {requestId,request}=message.params,url=new URL(request.url);
   const allowedHeaders=Object.entries(request.headers).find(([name])=>name.toLowerCase()==='access-control-request-headers')?.[1]||'authorization,apikey,content-type,x-client-info,prefer,range,x-supabase-api-version';
   let body;
   if(crm&&url.hostname.endsWith('supabase.co')){
    apiRoutes.push(url.pathname+(request.method==='OPTIONS'?' OPTIONS':''));
    const table=url.pathname.split('/').at(-1);
    if(table==='crm_appointments'&&request.method==='POST')writes.push(JSON.parse(request.postData));
    body=table==='crm_staff_booking_status'?{enabled:staff,bookings}:table==='crm_memberships'?(url.searchParams.has('role')?[]:[{division_id:'TRD',role:'owner'},{division_id:'CRD',role:'owner'}]):table==='crm_profiles'?{display_name:'Synthetic owner'}:table==='crm_website_intake_status'?[{submission_key:'synthetic-key',received_at:'2026-11-04T06:00:00Z',status:retried?'delivered':'failed',attempts:1,matching:'new',error_code:retried?null:'SYNTHETIC',error_message:'Synthetic retry needed',notifications:{internal:'pending'}}]:table==='crm_retry_website_lead'?(retried=true,{ok:true}):table==='crm_website_lead_attachments'?[{id:'e0000000-0000-4000-8000-000000000001',filename:'synthetic.png',mime:'image/png',size_bytes:8}]:table==='crm_website_attachment'?{filename:'synthetic.png',mime:'image/png',data_base64:'iVBORw0KGgo='}:table==='crm_customer_divisions'?[{customer_id:'customer'}]:table==='crm_properties'?[{id:'property',customer_id:'customer',address_line1:'Synthetic site',city:'Test',state:'TX'}]:table==='crm_customers'?[{id:'customer',display_name:'Synthetic customer'}]:table==='crm_leads'?[{id:'synthetic-lead',customer_id:'customer',property_id:'property',customer:{display_name:'Synthetic customer',email:'synthetic@example.test',phone:'9035550100'},service_interest:'Roof inspection',status:'new',priority:'normal',source:'Website',description:'Synthetic source notes',created_at:'2026-11-04T06:00:00Z',assigned_to:null,source_record_id:'website-TRD-synthetic'}]:[];
    if(table==='crm_tasks'){
     if(request.method==='POST'){const p=JSON.parse(request.postData);writes.push(p);tasks.push({...p,id:'synthetic-task',status:'open'});}
     if(request.method==='PATCH'){Object.assign(tasks[0],JSON.parse(request.postData));body={id:tasks[0].id};}else body=tasks;
    }
   }else if(crm&&url.hostname==='theroofingdrs.com'&&url.pathname==='/commercial/api/staff/booking'){
    body={};if(request.method==='POST'){const p=JSON.parse(request.postData);bookingPosts.push(p);assert(Object.entries(request.headers).some(([key,value])=>key.toLowerCase()==='authorization'&&value.startsWith('Bearer ')));if(p.action==='book'&&!bookings.some(b=>b.request_key===p.key))bookings.push({request_key:p.key,lead_id:p.lead,appointment_id:'synthetic-appointment',status:'confirmed',start_at:p.start,end_at:new Date(Date.parse(p.start)+1800000).toISOString()});if(p.action==='cancel')bookings.find(b=>b.request_key===p.key).status='cancelled';body={status:bookings.find(b=>b.request_key===p.key)?.status||'uncertain'};}
   }else if(!crm&&request.method==='POST'&&url.pathname.includes('/api/')){posts.push(request);body=posts.length===1?{error:'Synthetic storage unavailable'}:{success:true,id:'synthetic',leadId:'synthetic',deliveryStatus:'delivered'};}
   else if(['127.0.0.1','localhost'].includes(url.hostname)){try{await call('Fetch.continueRequest',{requestId});}catch(error){if(!String(error).includes('Invalid InterceptionId'))throw error;}return;}
   else body={};
   try{await call('Fetch.fulfillRequest',{requestId,responseCode:!crm&&posts.length===1&&request.method==='POST'?503:200,responseHeaders:[{name:'content-type',value:'application/json'},{name:'access-control-allow-origin',value:'*'},{name:'access-control-allow-methods',value:'GET,POST,PATCH,OPTIONS'},{name:'access-control-allow-headers',value:allowedHeaders},{name:'content-range',value:'0-0/1'}],body:Buffer.from(JSON.stringify(body)).toString('base64')});}catch(error){if(!String(error).includes('Invalid InterceptionId'))throw error;}
  });
  await call('Page.enable');await call('Runtime.enable');await call('Network.enable');await call('Browser.setDownloadBehavior',{behavior:'deny'});await call('Fetch.enable',{patterns:[{urlPattern:'*'}]});await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  if(crm){const user={id:'10000000-0000-4000-8000-000000000001',email:'owner@example.test',aud:'authenticated',role:'authenticated'};const jwt=Buffer.from(JSON.stringify({alg:'HS256'})).toString('base64url')+'.'+Buffer.from(JSON.stringify({sub:user.id,exp:Math.floor(Date.now()/1000)+3600,role:'authenticated'})).toString('base64url')+'.synthetic';const session={access_token:jwt,refresh_token:'synthetic',expires_at:Math.floor(Date.now()/1000)+3600,expires_in:3600,token_type:'bearer',user};await call('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('sb-gubvelngdohrfvqeeabu-auth-token',${JSON.stringify(JSON.stringify(session))});localStorage.setItem('trd-crd-workspace-${user.id}','{"view":"leads","division":"TRD"}');`});}
  const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text);return r.result.value;};
  const tap=async selector=>{const bounds=await evaluate(`(()=>{const e=${selector};e.scrollIntoView({block:'center',inline:'center',behavior:'instant'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`);assert(bounds.x>=0&&bounds.x<=390&&bounds.y>=0&&bounds.y<=844,JSON.stringify(bounds));await call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...bounds,radiusX:1,radiusY:1}]});await call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});};
  return{call,evaluate,tap,exceptions,assetFailures,posts,apiRoutes,writes,tasks,bookings,bookingPosts,retried:()=>retried};
 }
 // Audit every discoverable public route from both production sitemaps at all requested viewports.
 const layout=await page();
 const layoutWidths=[320,360,375,390,414,667,768,1024,1280,1440];
 const sitemapUrls=[publicBase+'/sitemap.xml',publicBase+'/residential/sitemap.xml'];
 const discovered=new Set([publicBase+'/',publicBase+'/residential/',publicBase+'/commercial/']);
 for(const sitemapUrl of sitemapUrls){
  const response=await fetch(sitemapUrl);
  assert(response.ok,`Unable to load route inventory ${sitemapUrl}: HTTP ${response.status}`);
  const xml=await response.text();
  for(const [,url] of xml.matchAll(/<loc>(https?:[^<]+)<\/loc>/g)){
   const parsed=new URL(url);
   if(parsed.hostname==='theroofingdrs.com')discovered.add(publicBase+parsed.pathname);
  }
 }
 const routes=[...discovered].sort((a,b)=>a.localeCompare(b));
 assert(routes.length>=200,`Expected comprehensive sitemap route inventory, found ${routes.length}`);
 const routeFailures=[];
 for(const routeUrl of routes){
  for(const width of layoutWidths){
   await layout.call('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<768});
   await layout.call('Page.navigate',{url:routeUrl});
   try{
    await wait(()=>layout.evaluate("document.readyState==='complete'&&document.body.innerText.trim().length>30"),routeUrl+' content at '+width+'px',20000);
    const isResidentialHome=new URL(routeUrl).pathname==='/residential/'||new URL(routeUrl).pathname==='/residential';
    const isCommercialHome=new URL(routeUrl).pathname==='/commercial/'||new URL(routeUrl).pathname==='/commercial';
    const toggle=isResidentialHome?'#mobile-nav-toggle-btn':isCommercialHome?'#mobile-menu-toggle-btn':null;
    if(toggle&&width<1800){
     await layout.evaluate("document.querySelector("+JSON.stringify(toggle)+")?.click()");
     await wait(()=>layout.evaluate("document.querySelector("+JSON.stringify(toggle)+")?.getAttribute('aria-expanded')==='true'"),routeUrl+' menu at '+width+'px');
    }
    const metrics=await layout.evaluate(`(()=>{const viewport=document.documentElement.clientWidth;const elements=[...document.querySelectorAll('body *')].map(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return{tag:e.tagName.toLowerCase(),id:e.id||'',className:typeof e.className==='string'?e.className:'',left:Math.round(r.left*100)/100,right:Math.round(r.right*100)/100,width:Math.round(r.width*100)/100,position:s.position,whiteSpace:s.whiteSpace,minWidth:s.minWidth,overflowX:s.overflowX};}).filter(e=>e.width>0&&(e.right>viewport+1||e.left< -1)).sort((a,b)=>Math.max(b.right-viewport,-b.left)-Math.max(a.right-viewport,-a.left)).slice(0,8);return{viewport,documentWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,offenders:elements};})()`);
    assert(metrics.documentWidth<=metrics.viewport+1&&metrics.bodyWidth<=metrics.viewport+1,`Horizontal overflow ${routeUrl} at ${width}px: ${JSON.stringify(metrics)}`);
    if(toggle&&width<1800)await layout.evaluate("document.querySelector("+JSON.stringify(toggle)+")?.click()");
   }catch(error){routeFailures.push({route:routeUrl,width,error:String(error)});throw error;}
  }
 }
 assert.deepEqual(layout.exceptions,[],'No uncaught browser exceptions during sitemap-wide responsive audit');
 assert.deepEqual(layout.assetFailures,[],'No failed same-origin JS/CSS during sitemap-wide responsive audit');
 console.log(`PASS sitemap-wide responsive geometry audit: ${routes.length} discoverable public routes at 320/360/375/390/414/667/768/1024/1280/1440px; navigation drawers included on both division homepages`);
 // Audit the customer-facing CRM application shell at the same viewport matrix using synthetic auth/data.
 if(process.env.CRM_SOURCE_DIR){
  const crmLayout=await page(true);
  await crmLayout.call('Page.navigate',{url:'http://127.0.0.1:19201/'});
  await wait(()=>crmLayout.evaluate('document.body.innerText.trim().length>30'),'CRM initial render');
  for(const width of layoutWidths){
   await crmLayout.call('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<768});
   const metrics=await crmLayout.evaluate(`(()=>({viewport:document.documentElement.clientWidth,documentWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,offenders:[...document.querySelectorAll('body *')].map(e=>{const r=e.getBoundingClientRect();return{tag:e.tagName,id:e.id,className:typeof e.className==='string'?e.className:'',left:Math.round(r.left),right:Math.round(r.right),width:Math.round(r.width)};}).filter(e=>e.width>0&&(e.left< -1||e.right>document.documentElement.clientWidth+1)).slice(0,8)}))()`);
   assert(metrics.documentWidth<=metrics.viewport+1&&metrics.bodyWidth<=metrics.viewport+1,`CRM horizontal overflow at ${width}px: ${JSON.stringify(metrics)}`);
  }
  assert.deepEqual(crmLayout.exceptions,[],'No uncaught CRM browser exceptions across viewport matrix');
  assert.deepEqual(crmLayout.assetFailures,[],'No failed CRM JS/CSS across viewport matrix');
  console.log('PASS CRM shell responsive geometry audit at all ten requested viewport widths (synthetic auth/data)');
 }
 // A healthy API alone missed the historical Footer address.display crash.
 const crd=await page();
 for(const width of [375,390,430,1440]){
  await crd.call('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<768});
  for(let reload=0;reload<3;reload++){
   await crd.call('Page.navigate',{url:publicBase+'/commercial/'});
   try{await wait(()=>crd.evaluate(`!!document.querySelector('h1')&&!!document.querySelector('footer')&&document.querySelector('footer').innerText.includes('COMMERCIAL SERVICE AREA')`),'Commercial page and footer render at '+width);}catch(error){assert.deepEqual(crd.exceptions,[],'Commercial browser exceptions');throw error;}
   assert(await crd.evaluate(`['Texas','Arkansas','Louisiana','Oklahoma'].every(state=>document.querySelector('footer').innerText.includes(state))`));
   assert.deepEqual(crd.exceptions,[]);assert.deepEqual(crd.assetFailures,[],'Commercial JS/CSS must load');
  }
 }
 await crd.call('Page.navigate',{url:publicBase+'/commercial/admin'});
 await wait(()=>crd.evaluate(`document.querySelector('h1')?.textContent==='Operations Portal'&&[...document.querySelectorAll('a')].some(a=>a.textContent.includes('Open Secure Operations Center'))`),'Commercial legacy login shell');
 assert.deepEqual(crd.exceptions,[]);assert.deepEqual(crd.assetFailures,[]);
 console.log('PASS commercial rendering: footer/service area, no JS exceptions or missing JS/CSS, three reloads at 375/390/430/1440px and Operations Portal shell');
 for(const division of ['residential','commercial']){
  const p=await page();await p.call('Page.navigate',{url:publicBase+'/'+division+'/contact?utm_campaign=mobile-synthetic'});
  await wait(()=>p.evaluate('!!document.querySelector("form input")'));
  const toggle=division==='commercial'?'#mobile-menu-toggle-btn':'button[aria-controls="residential-mobile-navigation"]';
  await p.tap(JSON.stringify(toggle)+ ' && document.querySelector('+JSON.stringify(toggle)+')');
  await wait(()=>p.evaluate('document.querySelector('+JSON.stringify(toggle)+').getAttribute("aria-expanded")==="true"'));
  await p.call('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  await wait(()=>p.evaluate('document.querySelector('+JSON.stringify(toggle)+').getAttribute("aria-expanded")==="false"'));
  assert(await p.evaluate('document.activeElement===document.querySelector('+JSON.stringify(toggle)+')'));
  assert(await p.evaluate('document.querySelector("link[rel=canonical]").href.includes("/'+division+'/contact")'));
  if(division==='residential'){
   const navigate=async route=>{await p.evaluate(`history.pushState({},'',${JSON.stringify('/residential'+route)});window.dispatchEvent(new PopStateEvent('popstate'));`);};
   const faq=`[...document.querySelectorAll('script[type="application/ld+json"]')].some(e=>JSON.stringify(JSON.parse(e.textContent)).includes('"@type":"FAQPage"'))`;
   for(const route of ['/faq','/','/faq/','/roofing/roof-repair','/contact']){
    await navigate(route);const expected=route==='/faq'||route==='/';const canonical='https://theroofingdrs.com/residential'+route;
    await wait(()=>p.evaluate(`(${faq})===${expected}&&document.querySelector('link[rel=canonical]').href===${JSON.stringify(canonical)}`));
    if(expected)assert(await p.evaluate(`(()=>{const collect=x=>!x||typeof x!=='object'?[]:x['@type']==='FAQPage'?x.mainEntity:Object.values(x).flatMap(collect);const questions=[...document.querySelectorAll('script[type="application/ld+json"]')].flatMap(e=>collect(JSON.parse(e.textContent)));return questions.length===10&&questions.every(q=>document.body.innerText.includes(q.name));})()`),'FAQ schema questions must actually be displayed');
    assert(await p.evaluate(`!!document.getElementById('shared-organization-jsonld')`));
    assert.equal(await p.evaluate(`document.querySelectorAll('link[rel=canonical]').length`),1);
   }
   console.log('PASS residential client navigation: FAQ/home schema present; repair/contact schema cleared; shared Organization/canonical retained');
  }

  if(division==='residential'){
   for(const route of ['/estimate-request/','/estimate-request/extra']){
    const url=publicBase+'/residential'+route;
    const html=await (await fetch(url)).text();
    const title=html.match(/<title>(.*?)<\/title>/s)[1];
    const description=html.match(/<meta name="description" content="([^"]*)"/)[1];
    await p.call('Page.navigate',{url});
    await wait(()=>p.evaluate(`document.querySelector('h1')?.textContent.includes('Request a Roof Estimate')&&document.querySelector('link[rel=canonical]')?.href==='https://theroofingdrs.com/residential/estimate-request'`));
    assert.equal(await p.evaluate('document.title'),title);
    assert.equal(await p.evaluate(`document.querySelector('meta[name="description"]').content`),description);
   }
   const contactRequirements=await p.evaluate(`(async()=>{const phone=document.querySelector('input[type="tel"]'),email=document.querySelector('input[type="email"]');if(!phone||!email)throw Error('Estimate form phone/email fields missing');const set=(input,value)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,value);input.dispatchEvent(new Event('input',{bubbles:true}));};const frame=()=>new Promise(resolve=>requestAnimationFrame(resolve));const initial=[phone.required,email.required];set(email,'mobile@example.test');await frame();const emailOnly=[phone.required,email.required];set(email,'');set(phone,'9035550100');await frame();const phoneOnly=[phone.required,email.required];set(phone,'');await frame();const neither=[phone.required,email.required];return{initial,emailOnly,phoneOnly,neither};})()`);
   assert.deepEqual(contactRequirements,{initial:[true,true],emailOnly:[false,true],phoneOnly:[true,false],neither:[true,true]},'Residential estimate request must require at least one contact method, not both');
   await p.call('Page.navigate',{url:publicBase+'/residential/'});
   await wait(()=>p.evaluate(`!!document.getElementById('cta-nav-diagnosed-btn')`));
   await p.evaluate(`document.getElementById('cta-nav-diagnosed-btn').click()`);
   await wait(()=>p.evaluate(`document.body.innerText.includes('Diagnostic Need')`));
   assert.equal(await p.evaluate(`[...document.querySelectorAll('button')].some(button=>button.textContent.includes('Autofill Demo Test Data'))`),false,'Public inspection modal must not expose seeded demo customer data');
   console.log('PASS residential estimate validation: phone-only/email-only accepted, neither rejected, demo autofill absent');
   await p.call('Page.navigate',{url:publicBase+'/residential/contact?utm_campaign=mobile-synthetic'});
   await wait(()=>p.evaluate(`!!document.querySelector('form input')&&document.querySelector('link[rel=canonical]')?.href==='https://theroofingdrs.com/residential/contact'`));


   console.log('PASS estimate aliases: initial HTTP metadata agrees with rendered title, description and canonical; no routing changes');
   await p.evaluate(`window.__twitterNodes=[document.querySelector('meta[name="twitter:title"]'),document.querySelector('meta[name="twitter:description"]')]`);
   const social=async()=>{
    await wait(()=>p.evaluate(`document.querySelector('meta[name="twitter:title"]')?.content===document.querySelector('meta[property="og:title"]')?.content&&document.querySelector('meta[name="twitter:description"]')?.content===document.querySelector('meta[property="og:description"]')?.content`));
    return p.evaluate(`(()=>{const names=['twitter:title','twitter:description'];if(!names.every((name,i)=>document.querySelectorAll('meta[name="'+name+'"]').length===1&&document.querySelector('meta[name="'+name+'"]')===window.__twitterNodes[i]))throw Error('Twitter tags were duplicated or replaced');return{title:document.querySelector('meta[name="twitter:title"]').content,description:document.querySelector('meta[name="twitter:description"]').content};})()`);
   };
   const initial=await social();
   for(const route of ['/roofing/roof-repair','/contact']){
    await p.evaluate(`history.pushState({},'',${JSON.stringify('/residential'+route+'?utm_campaign=mobile-synthetic')});window.dispatchEvent(new PopStateEvent('popstate'));`);
    await wait(()=>p.evaluate(`document.querySelector('link[rel=canonical]')?.href===${JSON.stringify('https://theroofingdrs.com/residential'+route)}`));
    const current=await social();
    if(route==='/roofing/roof-repair'){assert.notEqual(current.title,initial.title);assert.notEqual(current.description,initial.description);}else assert.deepEqual(current,initial);
   }
   console.log('PASS residential Twitter/OG metadata parity on initial render and Repair/Contact navigation; existing tag nodes retained without duplicates');
  }

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
 await crm.tap('[...document.querySelectorAll("button")].find(e=>e.textContent.includes("Schedule"))');await wait(()=>crm.evaluate('document.body.textContent.includes("Appointments")'));
 await crm.tap('[...document.querySelectorAll("button")].find(e=>e.textContent.includes("Add record"))');await wait(()=>crm.evaluate('!!document.querySelector("input[type=datetime-local]")'));
 await crm.evaluate(`(async()=>{const inputs=document.querySelectorAll('input[type=datetime-local]');for(let i=0;i<inputs.length;i++){Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(inputs[i],i===0?'2027-01-12T09:00':'2027-01-12T10:00');inputs[i].dispatchEvent(new Event('input',{bubbles:true}));await new Promise(r=>requestAnimationFrame(r));}const select=[...document.querySelectorAll('select')].find(e=>[...e.options].some(o=>o.value==='synthetic-lead'));select.value='synthetic-lead';select.dispatchEvent(new Event('change',{bubbles:true}));})()`);
 await crm.tap('[...document.querySelectorAll("button")].find(e=>e.textContent==="Save record")');await wait(()=>crm.writes.length===1);const scheduled=Array.isArray(crm.writes[0])?crm.writes[0][0]:crm.writes[0];assert(scheduled.ends_at);assert.equal(scheduled.lead_id,'synthetic-lead');assert.equal(scheduled.property_id,'property');assert.equal(scheduled.customer_id,'customer');assert(scheduled.assigned_to);assert.equal(scheduled.starts_at,'2027-01-12T15:00:00.000Z');assert.equal(scheduled.ends_at,'2027-01-12T16:00:00.000Z');
 console.log('PASS mobile CRM scheduling: explicit end time, lead/customer/property links and operator ownership (synthetic API)');
 await crm.tap('[...document.querySelectorAll("nav button")].find(e=>e.textContent.includes("Tasks"))');await wait(()=>crm.evaluate('document.body.textContent.includes("Team tasks")'));
 await crm.tap('[...document.querySelectorAll("button")].find(e=>e.textContent.includes("Add record"))');
 await crm.evaluate(`(()=>{const e=[...document.querySelectorAll('label')].find(e=>e.textContent.includes('Task title')).querySelector('input');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,'Synthetic follow-up');e.dispatchEvent(new Event('input',{bubbles:true}));})()`);
 await crm.tap('[...document.querySelectorAll("button")].find(e=>e.textContent==="Save record")');await wait(()=>crm.tasks.length===1);assert.equal(crm.tasks[0].assigned_to,scheduled.assigned_to);
 await wait(()=>crm.evaluate(`!!document.querySelector('select[aria-label="Status for Synthetic follow-up"]')`));
 await crm.evaluate(`(()=>{const e=document.querySelector('select[aria-label="Status for Synthetic follow-up"]');e.value='completed';e.dispatchEvent(new Event('change',{bubbles:true}));})()`);await wait(()=>crm.tasks[0].status==='completed');
 console.log('PASS mobile CRM task creation: current operator ownership and completed status (synthetic API)');
 const staff=await page(true,true);await staff.call('Page.navigate',{url:'http://127.0.0.1:19201/'});await wait(()=>staff.evaluate('[...document.querySelectorAll("nav button")].some(e=>e.textContent.includes("Schedule"))'));
 await staff.tap('[...document.querySelectorAll("nav button")].find(e=>e.textContent.includes("Schedule"))');await wait(()=>staff.evaluate('document.body.textContent.includes("Book through verified calendar")'));
 await staff.evaluate(`(async()=>{const select=[...document.querySelectorAll('select')].find(e=>[...e.options].some(o=>o.value==='synthetic-lead'));select.value='synthetic-lead';select.dispatchEvent(new Event('change',{bubbles:true}));await new Promise(r=>requestAnimationFrame(r));const e=document.querySelector('input[type=datetime-local]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,'2027-01-12T09:00');e.dispatchEvent(new Event('input',{bubbles:true}));})()`);
 await staff.tap('[...document.querySelectorAll("button")].find(e=>e.textContent.includes("Book through verified calendar"))');await wait(()=>staff.bookingPosts.length===1&&staff.bookings.length===1);
 await wait(()=>staff.evaluate('document.body.textContent.includes("Booking status: confirmed")'));
 await staff.tap('[...document.querySelectorAll("button")].find(e=>e.textContent.includes("Book through verified calendar"))');await wait(()=>staff.bookingPosts.length===2);assert.equal(staff.bookingPosts[0].key,staff.bookingPosts[1].key);assert.equal(staff.bookingPosts[0].start,'2027-01-12T15:00:00.000Z');assert.equal(staff.bookingPosts[0].actor,undefined);
 await wait(()=>staff.evaluate('!document.querySelector(".primary-button").disabled'));
 await staff.tap('[...document.querySelectorAll("button")].find(e=>e.textContent==="Cancel booking")');await wait(()=>staff.bookings[0].status==='cancelled');
 console.log('PASS mobile CRM staff calendar: verified-session request, Central start, stable reference replay and cancellation (mocked provider service)');


 }
}finally{for(const client of clients)client.close();await Promise.all(processes.map(p=>new Promise(resolve=>{if(p.exitCode!==null)return resolve();p.once('exit',resolve);p.kill('SIGTERM');})));await rm(temp,{recursive:true,force:true,maxRetries:10,retryDelay:200}).catch(error=>console.error('Temporary browser cleanup:',error.code));}
