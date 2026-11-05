import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';

// Uses the same real Chromium/CDP session and intercepted network as workflow tests.
export async function checkPublicLayouts({page, wait, base}) {
  const evidence = [];
  const output = process.env.LAYOUT_EVIDENCE_DIR;
  if (output) await mkdir(output, {recursive: true});
  const measure = p => p.evaluate(`(() => {
    const rect = e => { const r=e.getBoundingClientRect(); return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}; };
    const visible = e => {const r=rect(e),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none';};
    const details = e => ({id:e.id,tag:e.tagName,text:e.textContent.trim().slice(0,90),...rect(e)});
    return {viewport:innerWidth,document:document.documentElement.scrollWidth,
      offenders:[...document.querySelectorAll('body *')].filter(visible).filter(e=>{const r=rect(e);return r.left< -1||r.right>innerWidth+1;}).map(details),
      controls:[...document.querySelectorAll('header a,header button')].filter(visible).map(details)};
  })()`);
  const check = (state, label) => {
    assert(state.document <= state.viewport, `${label}: document overflow ${JSON.stringify(state)}`);
    for (const c of state.controls) assert(c.left>=-1&&c.right<=state.viewport+1, `${label}: inaccessible control ${JSON.stringify(c)}`);
    for (let i=0;i<state.controls.length;i++) for (const b of state.controls.slice(i+1)) {
      const a=state.controls[i];
      assert(!(Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1), `${label}: overlapping controls ${JSON.stringify({a,b})}`);
    }
  };
  try {
    for (const width of [1280,1440,1920,375,390,430]) for (const brand of ['residential','commercial']) {
      const p=await page();
      await p.call('Emulation.setDeviceMetricsOverride',{width,height:950,deviceScaleFactor:1,mobile:width<1024});
      await p.call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
      await p.call('Page.navigate',{url:base+'/'+brand+'/'});
      await wait(()=>p.evaluate(`document.querySelector('h1')?.getBoundingClientRect().height>0&&!!document.querySelector('header')`));
      await p.evaluate(`document.fonts.ready`);
      // Allow route transitions and layout animations to settle before measuring.
      await new Promise(resolve=>setTimeout(resolve,1500));
      const state={brand,width,...await measure(p)}; evidence.push(state);
      if(output){const image=await p.call('Page.captureScreenshot',{format:'png'});await writeFile(path.join(output,`${brand}-${width}.png`),Buffer.from(image.data,'base64'));}
      check(state,`${brand} ${width}`);
      const menus=brand==='commercial'&&width>=1024
        ? ['nav-services-btn','nav-systems-btn','nav-storm-btn','nav-industries-btn','nav-protection-btn','nav-resources-btn']
        : width<1024 ? [brand==='commercial'?'mobile-menu-toggle-btn':'mobile-nav-toggle-btn'] : [];
      for(const id of menus){
        await p.evaluate(`document.getElementById(${JSON.stringify(id)}).click()`);
        await wait(()=>p.evaluate(`document.getElementById(${JSON.stringify(id)}).getAttribute('aria-expanded')==='true'`));
        const menu={brand,width,menu:id,...await measure(p)};evidence.push(menu);check(menu,`${brand} ${width} ${id}`);
        await p.evaluate(`document.getElementById(${JSON.stringify(id)}).click()`);
      }
      console.log(`PASS ${brand} layout ${width}px: document ${state.document}px; navigation controls contained and non-overlapping`);
    }
  } finally {
    if(output) await writeFile(path.join(output,'measurements.json'),JSON.stringify(evidence,null,2));
  }
}
