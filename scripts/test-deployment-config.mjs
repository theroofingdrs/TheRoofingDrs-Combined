// Validate the real YAML shell commands with local stubs; never invoke Cloud Build or Google Cloud.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, mkdtempSync, writeFileSync, mkdirSync, existsSync, rmSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
const config=readFileSync(new URL('../cloudbuild.yaml',import.meta.url),'utf8');
const image='us-east1-docker.pkg.dev/trdcrd/roof-doctors/combined:integration';
const reference=image.replace(/:[^/]*$/,'')+'@sha256:'+'a'.repeat(64);
function block(id){
 const step=config.split(/\n  - name:/).find(step=>step.includes('id: '+id+'\n'));
 assert(step,'Missing step '+id);
 const shell=step.match(/      - \|\n([\s\S]*)/)[1].split(/\n\S/)[0].replace(/^        /gm,'');
 return shell;
}
function fixture(approval='true'){
 const dir=mkdtempSync(path.join(os.tmpdir(),'roofing-deploy-test-')),bin=path.join(dir,'bin'),log=path.join(dir,'calls.jsonl'),artifact=path.join(dir,'image.txt');mkdirSync(bin);
 const stub=`#!${process.execPath}\nconst fs=require('node:fs');const args=process.argv.slice(2),tool=require('node:path').basename(process.argv[1]);fs.appendFileSync(process.env.CALL_LOG,JSON.stringify({tool,args})+'\\n');if(tool==='docker'){if(args[0]==='push'&&process.env.FAIL_PUSH)process.exit(1);if(args[0]==='image')console.log(process.env.PUSHED_REFERENCE);}`;
 for(const tool of ['docker','gcloud'])writeFileSync(path.join(bin,tool),stub,{mode:0o755});
 const env={...process.env,PATH:bin+path.delimiter+process.env.PATH,CALL_LOG:log,PUSHED_REFERENCE:reference};
 const shell=id=>block(id).replaceAll('${_IMAGE_URI}',image).replaceAll('${_APPROVE_PRODUCTION_DEPLOY}',approval).replaceAll('$$','$').replaceAll('/workspace/combined-image-reference.txt',artifact);
 return{artifact,env,run:id=>spawnSync('sh',['-c',shell(id)],{env,encoding:'utf8'}),calls:()=>existsSync(log)?readFileSync(log,'utf8').trim().split('\n').map(JSON.parse):[],close:()=>rmSync(dir,{recursive:true,force:true})};
}
test('configuration preserves build arguments, gate and destination without runtime-setting flags',()=>{
 assert(config.includes('VITE_SUPABASE_URL=${_VITE_SUPABASE_URL}'));
 assert(config.includes('VITE_SUPABASE_PUBLISHABLE_KEY=${_VITE_SUPABASE_PUBLISHABLE_KEY}'));
 assert(config.includes('_APPROVE_PRODUCTION_DEPLOY: "false"'));
 assert(!/--(?:set|update|remove|clear)-(?:env-vars|secrets)|--(?:allow-unauthenticated|service-account|tag|to-latest)/.test(block('deploy-combined-cloud-run')));
});
for(const approval of ['false','TRUE',''])test('approval '+JSON.stringify(approval)+' never deploys',()=>{
 const f=fixture(approval);try{assert.equal(f.run('deploy-combined-cloud-run').status,0);assert.deepEqual(f.calls(),[]);}finally{f.close();}
});
test('push records local digest and approved deploy uses that digest with no traffic',()=>{
 const f=fixture();try{
  assert.equal(f.run('push-combined-image').status,0);
  assert.equal(readFileSync(f.artifact,'utf8').trim(),reference);
  assert.equal(f.run('deploy-combined-cloud-run').status,0);
  assert.deepEqual(f.calls(),[
   {tool:'docker',args:['push',image]},
   {tool:'docker',args:['image','inspect',image,'--format','{{index .RepoDigests 0}}']},
   {tool:'gcloud',args:['run','deploy','roof-doctors-combined','--image',reference,'--no-traffic','--region','us-east1','--project','trdcrd','--quiet']}
  ]);
 }finally{f.close();}
});
for(const value of ['',image,'<no value>',reference.replace('combined@','other@'),reference.slice(0,-1),reference.replace(/a$/,'g')])test('invalid image '+JSON.stringify(value)+' fails closed',()=>{
 const f=fixture();try{writeFileSync(f.artifact,value+'\n');assert.notEqual(f.run('deploy-combined-cloud-run').status,0);assert.deepEqual(f.calls(),[]);}finally{f.close();}
});
test('missing digest file fails closed',()=>{const f=fixture();try{assert.notEqual(f.run('deploy-combined-cloud-run').status,0);assert.deepEqual(f.calls(),[]);}finally{f.close();}});
test('failed push never inspects or deploys',()=>{const f=fixture();try{f.env.FAIL_PUSH='1';assert.notEqual(f.run('push-combined-image').status,0);assert.equal(f.calls().length,1);assert(!existsSync(f.artifact));}finally{f.close();}});
