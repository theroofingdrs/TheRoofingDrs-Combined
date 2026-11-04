/** Server-side orchestration. Not mounted on a public route; production remains disabled. */
import {validateBookingConfiguration,type BookingConfig,type Division,type Service,type Mode} from './readiness.ts';
export type Policy={enabled:boolean;providerVerified:boolean;booking:BookingConfig;operators:Record<Division,string|null>;minNoticeMinutes:number|null;maxAdvanceDays:number|null};
export type Reservation={request_key:string;division_id:Division;calendar_id:string;start_at:string;end_at:string;proposed_start?:string;proposed_end?:string;claim:string;provider_id?:string;status:string;context:{before:number;after:number;service:Service;mode:Mode;request?:unknown}};
export type Store={call:(action:string,request:Record<string,unknown>)=>Promise<Reservation&{action?:string}>};
export type Provider={busy:(calendars:string[],start:string,end:string)=>Promise<boolean>;create:(calendar:string,event:string,details:{key:string;start:string;end:string;division:Division})=>Promise<string>;cancel:(calendar:string,event:string)=>Promise<void>;move:(calendar:string,event:string,start:string,end:string)=>Promise<void>};
const iso=(ms:number)=>new Date(ms).toISOString();
function allowed(policy:Policy){
 if(!policy.enabled||!policy.providerVerified||!validateBookingConfiguration(policy.booking).configurationReady||!policy.operators.TRD||!policy.operators.CRD||!Number.isInteger(policy.minNoticeMinutes)||Number(policy.minNoticeMinutes)<0||!Number.isInteger(policy.maxAdvanceDays)||Number(policy.maxAdvanceDays)<1)throw new Error('Booking is disabled or prerequisites are unverified.');
}
function interval(policy:Policy,division:Division,service:Service,mode:Mode,start:string,now:number){
 const d=policy.booking.divisions[division];const duration=d.durationsMinutes[service]?.[mode];
 if(!duration)throw new Error('Duration is unresolved.');
 const a=Date.parse(start),b=a+duration*60000;
 if(!Number.isFinite(a)||a<now+Number(policy.minNoticeMinutes)*60000||a>now+Number(policy.maxAdvanceDays)*86400000)throw new Error('Choose a time within the approved booking window.');
 const local=(time:number)=>Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:policy.booking.timezone!,weekday:'short',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(time).map(p=>[p.type,p.value]));
 const before=Number(d.buffers.beforeMinutes),after=Number(d.buffers.afterMinutes),first=local(a-before*60000),last=local(b+after*60000);
 const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
 if(['year','month','day'].some(k=>first[k]!==last[k])||!d.operatingHours?.some(h=>h.day===days.indexOf(first.weekday)&&h.start<=first.hour+':'+first.minute&&h.end>=last.hour+':'+last.minute))throw new Error('Time falls outside approved operating hours.');
 return {start:iso(a),end:iso(b),starts:iso(a-before*60000),ends:iso(b+after*60000),before,after};
}
export class BookingEngine{
 private policy:Policy;private store:Store;private provider:Provider;private now:()=>number;
 constructor(policy:Policy,store:Store,provider:Provider,now:()=>number=()=>Date.now()){this.policy=policy;this.store=store;this.provider=provider;this.now=now;}
 async book(request:{key:string;division:Division;lead:string;service:Service;mode:Mode;start:string}){
  allowed(this.policy);
  const previous=await this.store.call('get',{key:request.key});
  if(previous.action!=='missing'){if(['key','division','lead','service','mode','start'].some(field=>(previous.context.request as Record<string,unknown>|undefined)?.[field]!==request[field as keyof typeof request]))throw new Error('Booking reference belongs to different details.');return{status:previous.status,reference:request.key,notification:'pending'};}
  const {division,service,mode}=request;const times=interval(this.policy,division,service,mode,request.start,this.now());
  const calendars=Object.values(this.policy.booking.divisions).map(d=>d.calendar!.id);
  const row=await this.store.call('reserve',{key:request.key,division,operator:this.policy.operators[division],lead:request.lead,calendar:this.policy.booking.divisions[division].calendar!.id,starts:times.starts,ends:times.ends,context:{service,mode,before:times.before,after:times.after,request}});
  if(row.action!=='create')return {status:row.status,reference:row.request_key,notification:'pending'};
  try{
   if(await this.provider.busy(calendars,times.starts,times.ends)){await this.store.call('finish',{key:request.key,claim:row.claim,status:'cancelled'});throw new Error('This time is unavailable.');}
  }catch(error){if((error as Error).message!=='This time is unavailable.')await this.store.call('finish',{key:request.key,claim:row.claim,status:'cancelled'});throw error;}
  try{
   const event=await this.provider.create(row.calendar_id,'roof'+request.key.replaceAll('-',''),{key:request.key,start:times.start,end:times.end,division});
   await this.store.call('finish',{key:request.key,claim:row.claim,status:'confirmed',provider:event});
   return {status:'confirmed',reference:request.key,notification:'pending'};
  }catch(error){await this.store.call('finish',{key:request.key,claim:row.claim,status:'uncertain'});throw error;}
 }
 async cancel(key:string){
  allowed(this.policy);const existing=await this.store.call('get',{key});
  if(existing.status==='cancelled')return {status:'cancelled'};
  const row=await this.store.call('begin_change',{key});
  try{await this.provider.cancel(row.calendar_id,row.provider_id!);await this.store.call('finish',{key,claim:row.claim,status:'cancelled'});return{status:'cancelled'};}
  catch(error){await this.store.call('finish',{key,claim:row.claim,status:'uncertain'});throw error;}
 }
 async reschedule(key:string,start:string){
  allowed(this.policy);const existing=await this.store.call('get',{key});
  const times=interval(this.policy,existing.division_id,existing.context.service,existing.context.mode,start,this.now());
  if(times.before!==existing.context.before||times.after!==existing.context.after)throw new Error('Booking policy changed; staff review is required.');
  // FreeBusy cannot identify which overlapping event is ours. Do not subtract
  // that interval: doing so could hide a second, genuinely conflicting event.
  if(Date.parse(times.starts)<Date.parse(existing.end_at)&&Date.parse(times.ends)>Date.parse(existing.start_at))throw new Error('Overlapping rescheduling requires staff calendar review.');
  if(await this.provider.busy(Object.values(this.policy.booking.divisions).map(d=>d.calendar!.id),times.starts,times.ends))throw new Error('New time is unavailable.');
  const row=await this.store.call('begin_change',{key,starts:times.starts,ends:times.ends});
  try{await this.provider.move(row.calendar_id,row.provider_id!,times.start,times.end);await this.store.call('finish',{key,claim:row.claim,status:'confirmed',provider:row.provider_id});return{status:'confirmed',notification:'pending'};}
  catch(error){await this.store.call('finish',{key,claim:row.claim,status:'uncertain'});throw error;}
 }
}
/** Credential callback is server-only. No OAuth secrets are part of booking configuration. */
export class GoogleCalendarProvider implements Provider{
 private token:()=>Promise<string>;private transport:typeof fetch;
 constructor(token:()=>Promise<string>,transport:typeof fetch=fetch){this.token=token;this.transport=transport;}
 private async request(route:string,method='GET',body?:unknown){const r=await this.transport('https://www.googleapis.com/calendar/v3/'+route,{method,headers:{Authorization:'Bearer '+await this.token(),'Content-Type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(15000),redirect:'error'});return r;}
 async busy(calendars:string[],start:string,end:string){const r=await this.request('freeBusy','POST',{timeMin:start,timeMax:end,items:calendars.map(id=>({id}))});if(!r.ok)throw Error('Calendar availability unavailable.');const data=await r.json();return calendars.some(id=>{const calendar=data.calendars?.[id];if(!calendar||calendar.errors?.length||!Array.isArray(calendar.busy))throw Error('Calendar access unverified.');return calendar.busy.length>0;});}
 async create(calendar:string,event:string,details:{key:string;start:string;end:string;division:Division}){const route='calendars/'+encodeURIComponent(calendar)+'/events';const r=await this.request(route+'?sendUpdates=none','POST',{id:event,summary:(details.division==='TRD'?'The Roofing Doctors':'Commercial Roof Doctors')+' roofing appointment',start:{dateTime:details.start},end:{dateTime:details.end},extendedProperties:{private:{trdcrd_booking:details.key}}});if(!r.ok)throw Error('Calendar creation outcome unconfirmed.');const data=await r.json();if(data.id!==event||data.status==='cancelled'||Date.parse(data.start?.dateTime)!==Date.parse(details.start)||Date.parse(data.end?.dateTime)!==Date.parse(details.end))throw Error('Unexpected calendar event identity or interval.');return data.id;}
 async cancel(calendar:string,event:string){const r=await this.request('calendars/'+encodeURIComponent(calendar)+'/events/'+encodeURIComponent(event)+'?sendUpdates=none','DELETE');if(!r.ok){if(r.status!==404&&r.status!==410)throw Error('Cancellation outcome unconfirmed.');const binding=await this.request('users/me/calendarList/'+encodeURIComponent(calendar));const data=binding.ok?await binding.json():null;if(data?.id!==calendar||!['writer','owner'].includes(data.accessRole))throw Error('Calendar access must be reverified before treating absence as cancellation.');}}
 async move(calendar:string,event:string,start:string,end:string){const r=await this.request('calendars/'+encodeURIComponent(calendar)+'/events/'+encodeURIComponent(event)+'?sendUpdates=none','PATCH',{start:{dateTime:start},end:{dateTime:end}});if(!r.ok)throw Error('Reschedule outcome unconfirmed.');const data=await r.json();if(data.id!==event||Date.parse(data.start?.dateTime)!==Date.parse(start)||Date.parse(data.end?.dateTime)!==Date.parse(end))throw Error('Reschedule evidence does not match.');}
}
export function createApprovedBookingDraft(){
 const config:BookingConfig={enabled:false,central:{provider:'GOOGLE_CALENDAR',accountAlias:'central-booking-account'},timezone:'America/Chicago',confirmation:null,divisions:{} as BookingConfig['divisions']};
 for(const division of ['TRD','CRD'] as Division[])config.divisions[division]={identity:division==='TRD'?'The Roofing Doctors':'Commercial Roof Doctors',publicUrl:null,calendar:null,services:['roof-inspection','roof-repair-estimate','roof-replacement-estimate','storm-damage-inspection','insurance-claim-inspection'],operatingHours:[1,2,3,4,5,6].map(day=>({day,start:'08:30',end:'18:00'})),durationsMinutes:Object.fromEntries(['roof-inspection','roof-repair-estimate','roof-replacement-estimate','storm-damage-inspection','insurance-claim-inspection'].map(s=>[s,{'on-site':null,phone:null}])) as BookingConfig['divisions']['TRD']['durationsMinutes'],buffers:{beforeMinutes:null,afterMinutes:null}};
 return config;
}

export function createRpcBookingStore(rpc:(name:string,args:Record<string,unknown>)=>Promise<{data:any;error:any}>):Store { return {call:async(action,request)=>{const {data,error}=await rpc('crm_booking_operation',{p_action:action,p_request:request});if(error)throw new Error('Booking persistence failed; inspect the saved operation before retrying.');return data;}}; }
