/** Framework-neutral staff API. Token verification precedes every service RPC.
 * The mounted runtime remains disabled until separately approved server bindings are supplied. */
import {BookingEngine} from './engine.ts';
import {SERVICES,MODES,type Division} from './readiness.ts';
type Dependencies={enabled:boolean;engine:BookingEngine;verify:(token:string)=>Promise<{id:string}|null>;authorize:(actor:string,division:Division,key:string|null)=>Promise<boolean>};
const uuid=(v:unknown):v is string=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
export async function handleStaffBooking(request:Request,deps:Dependencies):Promise<Response>{
 const reply=(status:number,body:unknown)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
 if(!deps.enabled)return reply(503,{error:'Booking remains disabled.'});
 if(request.method!=='POST')return reply(405,{error:'POST required.'});
 const token=request.headers.get('Authorization')?.match(/^Bearer (\S+)$/)?.[1];
 if(!token)return reply(401,{error:'Staff authentication required.'});
 try{
  const actor=await deps.verify(token);if(!actor)return reply(401,{error:'Session invalid or expired.'});
  const raw=await request.text();if(raw.length>8192)return reply(413,{error:'Request too large.'});
  let p;try{p=JSON.parse(raw);}catch{return reply(400,{error:'Invalid JSON.'});}
  if(!p||!['TRD','CRD'].includes(p.division)||!uuid(p.key)||!['book','cancel','reschedule','reconcile'].includes(p.action))return reply(400,{error:'Invalid booking operation.'});
  if(!await deps.authorize(actor.id,p.division,p.action==='book'?null:p.key))return reply(403,{error:'Scheduling authority required in this division.'});
  if(p.action==='book'){
   if(!uuid(p.lead)||!SERVICES.includes(p.service)||!MODES.includes(p.mode)||typeof p.start!=='string')return reply(400,{error:'Lead, service, mode and start are required.'});
   return reply(200,await deps.engine.book({key:p.key,division:p.division,lead:p.lead,service:p.service,mode:p.mode,start:p.start}));
  }
  if(p.action==='reschedule'&&typeof p.start!=='string')return reply(400,{error:'A new start is required.'});
  return reply(200,p.action==='reschedule'?await deps.engine.reschedule(p.key,p.start):p.action==='cancel'?await deps.engine.cancel(p.key):await deps.engine.reconcile(p.key));
 }catch{return reply(503,{error:'Booking operation unresolved. Review the saved reference before retrying.'});}
}
