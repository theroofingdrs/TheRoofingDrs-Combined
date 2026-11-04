// Render production forms with synthetic Places and intake responses. No provider/customer writes.
import { spawn, spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';

const temp = await mkdtemp(path.join(os.tmpdir(), 'roofing-address-'));
const processes = [], sockets = [];
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function wait(predicate, label = 'condition', timeout = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeout) { if (await predicate()) return; await delay(80); }
  throw Error('Timed out: ' + label);
}
function launch(bin, args, env) {
  const child = spawn(bin, args, { env: env || process.env, stdio: ['ignore', 'ignore', 'pipe'] });
  let stderr = '', error;
  child.stderr.on('data', data => { stderr = (stderr + data).slice(-12000); });
  child.on('error', e => { error = e; });
  processes.push(child);
  return { child, check() { if (error || child.exitCode !== null) throw Error(`${bin}: ${error || 'exit ' + child.exitCode}\n${stderr}`); }, details: () => `${bin}\n${stderr}` };
}
function fixture() {
  window.addressFixture = { mode: 'valid', calls: [], details: [], sessions: 0, imports: 0 };
  const state = window.addressFixture;
  const components = () => [
    ['street_number', '123'], ['route', 'Synthetic Avenue'], ['locality', 'Texarkana'],
    ['administrative_area_level_1', 'Arkansas', 'AR'], ['postal_code', '71854'], ['country', 'United States', 'US'],
  ].filter(([type]) => state.mode !== 'partial' || !['locality', 'postal_code'].includes(type))
    .filter(([type]) => state.mode !== 'invalid' || type !== 'street_number')
    .map(([type, longText, shortText]) => ({ types: [type], longText, shortText: shortText || longText }));
  window.google = { maps: { importLibrary: async () => {
    state.imports++;
    if (state.mode === 'unavailable') throw Error('Synthetic SDK failure');
    return {
      AutocompleteSessionToken: class { constructor() { this.id = ++state.sessions; } },
      AutocompleteSuggestion: { fetchAutocompleteSuggestions: async request => {
        state.calls.push({ input: request.input, token: request.sessionToken.id });
        const mode = state.mode;
        if (mode === 'failure') throw Error('Synthetic suggestions failure');
        if (mode === 'slow') await new Promise(r => setTimeout(r, 700));
        return { suggestions: [0, 1].map(index => ({ placePrediction: {
          text: { toString: () => request.input + ' Synthetic Avenue, Texarkana, AR 71854, USA' },
          toPlace: () => ({ fetchFields: async function(request) {
            state.details.push(request.fields);
            if (state.mode === 'details-failure') throw Error('Synthetic details failure');
            this.addressComponents = components();
          } }),
        } })) };
      } },
    };
  } } };
}
const forms = [
  { id: 'residential-contact-address', route: 'residential/contact' },
  { id: 'residential-estimate-address', route: 'residential/estimate-request' },
  { id: 'inspection-address', route: 'residential/', open: 'cta-nav-diagnosed-btn', steps: true },
  { id: 'commercial-contact-propertyAddress', route: 'commercial/contact' },
  { id: 'commercial-calculator-address', route: 'commercial/commercial-roof-cost-calculator', calculator: true },
  { id: 'commercial-inspection-address', route: 'commercial/', open: 'header-inspection-btn' },
  { id: 'emergency-address-input', route: 'commercial/', open: 'mobile-emergency-quick-btn' },
];
try {
  const env = { ...process.env, NODE_ENV: 'production', PORT: '19300', WEBSITE_DATA_DIR: temp };
  // Remove all application service bindings; local tests cannot reach real intake/providers.
  for (const key of Object.keys(env)) if (/^(SUPABASE_|BOOKING_|GOOGLE_|CRM_|RESEND_|SENDGRID_|TWILIO_|STRIPE_|INTERNAL_|WEBSITE_API_)/.test(key)) delete env[key];
  const server = launch(process.execPath, ['server.mjs'], env);
  const bin = process.env.CHROME_BIN || ['google-chrome', 'google-chrome-stable', 'chromium'].find(b => spawnSync('which', [b]).status === 0);
  if (!bin) throw Error('Chromium is required (or set CHROME_BIN).');
  const browser = launch(bin, ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--disable-background-networking', '--no-first-run', '--remote-debugging-port=0', '--user-data-dir=' + path.join(temp, 'chrome'), 'about:blank']);
  let port;
  try { await wait(async () => { browser.check(); try { port = (await readFile(path.join(temp, 'chrome', 'DevToolsActivePort'), 'utf8')).split('\n')[0]; return (await fetch(`http://127.0.0.1:${port}/json/version`)).ok; } catch { return false; } }, 'Chromium readiness', 60000); }
  catch (error) { throw Error(error.message + '\n' + browser.details()); }
  await wait(async () => { server.check(); try { return (await fetch('http://127.0.0.1:19300/residential/api/health')).ok; } catch { return false; } }, 'local website');
  async function page(form, width, mode = 'valid') {
    const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
    const ws = new WebSocket(target.webSocketDebuggerUrl); sockets.push(ws);
    await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));
    let seq = 0;
    const pending = new Map(), posts = [], errors = [];
    const call = (method, params = {}) => new Promise((resolve, reject) => { const id = ++seq; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); });
    ws.addEventListener('message', async event => {
      const message = JSON.parse(event.data);
      if (message.id) { const task = pending.get(message.id); if (task) { pending.delete(message.id); message.error ? task.reject(Error(message.error.message)) : task.resolve(message.result); } return; }
      if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
      if (message.method !== 'Fetch.requestPaused') return;
      const { requestId, request } = message.params, url = new URL(request.url);
      let body = {};
      if (url.hostname === '127.0.0.1' && request.method !== 'POST') { await call('Fetch.continueRequest', { requestId }); return; }
      if (request.method === 'POST') { posts.push(request); body = { success: true, id: 'synthetic', leadId: 'synthetic', deliveryStatus: 'delivered', estimatedLow: 10000, estimatedHigh: 20000, unitLow: 4, unitHigh: 8, disclaimer: 'Synthetic planning range' }; }
      await call('Fetch.fulfillRequest', { requestId, responseCode: 200, responseHeaders: [{ name: 'content-type', value: 'application/json' }, { name: 'access-control-allow-origin', value: '*' }], body: Buffer.from(JSON.stringify(body)).toString('base64') });
    });
    const evaluate = async expression => { const r = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };
    await call('Page.enable'); await call('Runtime.enable');
    await call('Fetch.enable', { patterns: [{ urlPattern: '*' }] });
    await call('Emulation.setDeviceMetricsOverride', { width, height: 844, deviceScaleFactor: 1, mobile: true });
    await call('Emulation.setTouchEmulationEnabled', { enabled: true });
    await call('Emulation.setFocusEmulationEnabled', { enabled: true });
    await call('Page.addScriptToEvaluateOnNewDocument', { source: `(${fixture.toString()})();window.addressFixture.mode=${JSON.stringify(mode)};` });
    await call('Page.navigate', { url: 'http://127.0.0.1:19300/' + form.route + '?utm_campaign=address-regression' });
    const clickText = async text => {
      assert(await evaluate(`(()=>{const e=[...document.querySelectorAll('button')].find(e=>e.textContent.includes(${JSON.stringify(text)}));if(!e)return false;e.click();return true;})()`), text);
      await delay(40);
    };
    if (form.open) { await wait(() => evaluate(`!!document.getElementById(${JSON.stringify(form.open)})`), 'open button'); await evaluate(`document.getElementById(${JSON.stringify(form.open)}).click()`); }
    if (form.steps) { await wait(() => evaluate(`!![...document.querySelectorAll('button')].find(e=>e.textContent.includes('General 21-Point'))`)); await clickText('General 21-Point'); await clickText('Continue'); }
    await wait(() => evaluate(`document.getElementById(${JSON.stringify(form.id)})?.getAttribute('role')==='combobox'`), form.id);
    const input = `document.getElementById(${JSON.stringify(form.id)})`;
    const enter = async (value, composing = false) => evaluate(`(async()=>{const e=${input};e.scrollIntoView({block:'center',behavior:'instant'});e.focus({preventScroll:true});Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new InputEvent('input',{bubbles:true,isComposing:${composing}}));await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));})()`);
    const key = async key => { await call('Input.dispatchKeyEvent', { type: 'keyDown', key, code: key, windowsVirtualKeyCode: { ArrowDown: 40, ArrowUp: 38, Enter: 13, Escape: 27, Tab: 9 }[key] }); await call('Input.dispatchKeyEvent', { type: 'keyUp', key, code: key }); };
    const close = async () => { assert.deepEqual(errors, [], 'uncaught page exceptions'); await call('Page.close'); ws.close(); };
    return { call, evaluate, enter, key, close, posts, clickText, input, form };
  }
  async function suggestions(p) { try { await wait(() => p.evaluate(`${p.input}.getAttribute('aria-expanded')==='true'`), 'suggestions: ' + p.form.id); } catch (error) { console.error(await p.evaluate(`({fixture:addressFixture,status:[...document.querySelectorAll('[role=status]')].map(e=>e.textContent),input:${p.input}.outerHTML,rect:${p.input}.getBoundingClientRect().toJSON(),viewport:{width:innerWidth,height:innerHeight,visual:visualViewport.height},list:document.querySelector('[role=listbox]')?.outerHTML})`)); throw error; } }
  async function select(p, touch = false) {
    if (touch) {
      const r = await p.evaluate(`(()=>{const e=document.querySelector('[role=listbox] [role=option]');const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+Math.min(r.height/2,20)};})()`);
      await p.call('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...r, radiusX: 1, radiusY: 1 }] });
      await p.call('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    } else { await p.key('ArrowDown'); await p.key('Enter'); }
    await wait(() => p.evaluate(`document.querySelector('[role=status]')?.textContent.includes('selected')||[...document.querySelectorAll('[role=status]')].some(e=>e.textContent.includes('missing'))`), 'address details');
  }
  for (const width of [320, 360, 375, 390, 430]) for (const form of forms) {
    const p = await page(form, width);
    await p.enter('123 Synthetic'); await suggestions(p);
    const bounds = await p.evaluate(`(()=>{const e=${p.input},l=document.getElementById(e.getAttribute('aria-controls')),r=l.getBoundingClientRect(),o=l.querySelector('[role=option]'),b=o.getBoundingClientRect();return{width:innerWidth,left:r.left,right:r.right,top:r.top,bottom:r.bottom,hit:o.contains(document.elementFromPoint(b.x+b.width/2,b.y+Math.min(20,b.height/2))),label:e.labels.length,live:!!document.getElementById(e.getAttribute('aria-describedby').split(' ').at(-1)),parent:l.parentElement.getAttribute('role')};})()`);
    assert(bounds.left >= 0 && bounds.right <= width + 1 && bounds.top >= 0 && bounds.bottom <= 845, JSON.stringify({ form: form.id, width, bounds }));
    assert(bounds.hit && bounds.label && bounds.live, JSON.stringify(bounds));
    if (form.open) assert.equal(bounds.parent, 'dialog');
    await select(p, width === 360 || width === 430);
    assert.equal(await p.evaluate(`${p.input}.value`), form.id.startsWith('residential') || form.steps ? '123 Synthetic Avenue' : '123 Synthetic Avenue, Texarkana AR 71854');
    assert.equal(await p.evaluate('addressFixture.calls.length'), 1);
    assert.equal(await p.evaluate('addressFixture.details.length'), 1);
    assert.equal(p.posts.length, 0, 'selection must not submit');
    await p.close();
    console.log('PASS address selection / portal bounds / accessible label:', width, form.id);
  }
  for (const form of forms) for (const mode of ['partial', 'invalid', 'unavailable', 'failure', 'details-failure']) {
    const p = await page(form, 375, mode);
    await p.enter('123 Synthetic');
    if (mode === 'unavailable' || mode === 'failure') await wait(() => p.evaluate(`[...document.querySelectorAll('[role=status]')].some(e=>e.textContent.includes('unavailable'))`));
    else { await suggestions(p); await p.key('ArrowDown'); await p.key('Enter'); await wait(() => p.evaluate(`[...document.querySelectorAll('[role=status]')].some(e=>/missing|manually/.test(e.textContent))`)); }
    if (mode !== 'partial') assert.equal(await p.evaluate(`${p.input}.value`), '123 Synthetic');
    assert.equal(await p.evaluate(`${p.input}.disabled||${p.input}.readOnly`), false);
    await p.enter('Manual rural property, Suite 4');
    assert.equal(await p.evaluate(`${p.input}.value`), 'Manual rural property, Suite 4');
    await p.close();
    console.log('PASS manual fallback:', mode, form.id);
  }
  async function fillOtherFields(p) {
    await p.evaluate(`(async()=>{const root=${p.input}?.closest('[role=dialog]')||document;for(const e of root.querySelectorAll('input,textarea')){if(e===${p.input}||['hidden','file','checkbox','radio','range'].includes(e.type)||e.value)continue;const hint=[e.name,e.id,e.autocomplete,e.type].join(' ');const value=/email/.test(hint)?'synthetic@example.test':/phone|tel/.test(hint)?'9035550100':/zip|postal/.test(hint)?'71854':/state|address-level1/.test(hint)?'AR':/city|address-level2/.test(hint)?'Texarkana':e.type==='number'?'10000':e.type==='date'?'2026-01-01':'Synthetic intake';Object.getOwnPropertyDescriptor(e.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,'value').set.call(e,value);e.dispatchEvent(new Event('input',{bubbles:true}));await new Promise(r=>requestAnimationFrame(r));}})()`);
  }
  for (const form of forms) for (const mode of ['selected', 'manual', 'edited']) {
    const selected = mode === 'selected';
    const p = await page(form, 375, mode === 'manual' ? 'unavailable' : 'valid');
    await p.enter(mode !== 'manual' ? '123 Synthetic' : 'Manual rural route, Suite 4');
    if (mode !== 'manual') { await suggestions(p); await select(p); }
    else await wait(() => p.evaluate(`[...document.querySelectorAll('[role=status]')].some(e=>e.textContent.includes('unavailable'))`));
    if (mode === 'edited') {
      const original = await p.evaluate(`${p.input}.value`);
      await p.enter(original + ' '); await p.enter('Manual rural route, Suite 4');
      if (form.steps || form.id.startsWith('residential')) assert.equal(await p.evaluate(`(document.getElementById('inspection-city')||document.querySelector('input[autocomplete="address-level2"]')).value`), '', 'edited street clears previous city');
    }
    await fillOtherFields(p);
    if (form.steps) { await p.clickText('Continue'); await wait(() => p.evaluate(`!!document.getElementById('inspection-name')`)); await fillOtherFields(p); }
    if (form.calculator) {
      await p.clickText('Continue to Roof Parameters'); await p.clickText('Continue to Scope'); await p.clickText('Compute Planning Range');
      await wait(() => p.evaluate(`!!document.querySelector('button[type=submit]')`));
    }
    await p.evaluate(`(()=>{const form=document.querySelector('[role=dialog] form')||document.querySelector('form');if(!form.checkValidity())throw Error('Original form validation: '+[...form.elements].filter(e=>e.willValidate&&!e.validity.valid).map(e=>e.id||e.name||e.type));form.requestSubmit();})()`);
    await wait(() => p.posts.some(r => JSON.parse(r.postData).submittedAt), 'intake submission: ' + form.id);
    const request = p.posts.find(r => JSON.parse(r.postData).submittedAt), body = JSON.parse(request.postData);
    assert(Object.keys(request.headers).some(k => k.toLowerCase() === 'idempotency-key'));
    assert.equal(body.utmCampaign, 'address-regression');
    if (selected) {
      assert.equal(body.city, 'Texarkana'); assert.equal(body.state, 'AR'); assert.equal(body.zip, '71854');
      assert.equal(body.propertyRecord?.address || body.address, '123 Synthetic Avenue');
    } else {
      assert.equal(body.propertyAddress || body.address, 'Manual rural route, Suite 4');
      if (mode === 'edited' && !form.steps && !form.id.startsWith('residential')) { assert.equal(body.propertyRecord, null); assert.equal(body.city, ''); assert.equal(body.state, ''); assert.equal(body.zip, ''); }
    }
    await p.close();
    console.log('PASS structured/manual intake payload, attribution and idempotency:', mode, form.id);
  }
  const p = await page(forms[0], 390);
  await p.enter('123', true); await delay(400);
  assert.equal(await p.evaluate('addressFixture.calls.length'), 0, 'IME / short query');
  await p.enter('1234'); await p.enter('12345'); await p.enter('123456'); await suggestions(p);
  assert.equal(await p.evaluate('addressFixture.calls.length'), 1, 'debounce');
  await p.enter('123456'); await delay(400);
  assert.equal(await p.evaluate('addressFixture.calls.length'), 1, 'duplicate query');
  await p.enter(''); await p.enter('123456'); await suggestions(p);
  assert.equal(await p.evaluate('addressFixture.calls.length'), 2, 'clearing and retyping must restore suggestions');
  await p.evaluate(`window.addEventListener('keydown',e=>window.addressKeyPrevented=e.defaultPrevented)`);
  await p.key('Enter');
  assert.equal(await p.evaluate('window.addressKeyPrevented'), false, 'Enter without an active suggestion retains normal form behavior');
  assert.equal(await p.evaluate('addressFixture.details.length'), 0);
  await p.key('ArrowUp');
  assert.equal(await p.evaluate(`${p.input}.getAttribute('aria-activedescendant')===[...document.querySelectorAll('[role=listbox] [role=option]')].at(-1)?.id`), true);
  await p.key('Escape'); assert.equal(await p.evaluate(`${p.input}.getAttribute('aria-expanded')`), 'false');
  await p.enter('Another address'); await suggestions(p); await p.key('Tab');
  assert.equal(await p.evaluate(`${p.input}.getAttribute('aria-expanded')`), 'false');
  await p.evaluate(`addressFixture.mode='slow'`); await p.enter('Stale address'); await delay(360); await p.enter('Different current address');
  await suggestions(p); assert(await p.evaluate(`document.querySelector('[role=option]').textContent.startsWith('Different current address')`));
  await p.close();
  console.log('PASS debounce, duplicate suppression, IME, keyboard, Escape, Tab and stale response checks');
} finally {
  for (const socket of sockets) socket.close();
  await Promise.all(processes.map(child => new Promise(resolve => {
    if (child.exitCode !== null) return resolve();
    const timer = setTimeout(() => child.kill('SIGKILL'), 5000);
    child.once('exit', () => { clearTimeout(timer); resolve(); }); child.kill('SIGTERM');
  })));
  await rm(temp, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
}
