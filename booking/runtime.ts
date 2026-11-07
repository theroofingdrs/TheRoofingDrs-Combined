import {assessRuntime} from './runtime-readiness.ts';
/** Disabled by default. Secrets stay in server runtime, never in Vite config. */
import {BookingEngine,GoogleCalendarProvider,createRpcBookingStore,type Policy} from './engine.ts';
import {googleAccessToken} from './google-auth.ts';
import {handleStaffBooking} from './staff-handler.ts';
export async function staffBookingRuntime(request:Request,env:Record<string,string|undefined>):Promise<Response>{
 const disabled=()=>Response.json({error:'Booking remains disabled.'},{status:503,headers:{'Cache-Control':'no-store'}});
 if(env.BOOKING_ENABLED!=='true'||!assessRuntime(env).ready)return disabled();
 const origin=request.headers.get('Origin');const allowedOrigin=env.BOOKING_STAFF_ORIGIN;
 if(origin&&(!allowedOrigin||origin!==allowedOrigin||!/^https:\/\//.test(allowedOrigin)))return Response.json({error:'Origin not allowed.'},{status:403});
 const cors:Record<string,string>=origin?{'Access-Control-Allow-Origin':origin,'Vary':'Origin'}:{};
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...cors,'Access-Control-Allow-Methods':'POST','Access-Control-Allow-Headers':'Authorization,Content-Type','Cache-Control':'no-store'}});
 try{
  const url=env.SUPABASE_URL;const key=env.SUPABASE_SERVICE_ROLE_KEY;const anon=env.SUPABASE_ANON_KEY||env.SUPABASE_PUBLISHABLE_KEY;
  if(!url||!key||!anon||env.BOOKING_PROVIDER_VERIFIED!=='true')return disabled();
  const policy=JSON.parse(env.BOOKING_POLICY_JSON||'null') as Policy;
  if(!policy)return disabled();
  // Runtime gates cannot be overridden by fields supplied by a caller.
  policy.enabled=true;policy.providerVerified=true;
  const rpc=async(name:string,args:Record<string,unknown>)=>{
   const r=await fetch(url.replace(/\/$/,'')+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(15000),redirect:'error'});
   return r.ok?{data:await r.json(),error:null}:{data:null,error:true};
  };
  const token=googleAccessToken({clientId:env.GOOGLE_CALENDAR_CLIENT_ID||'',clientSecret:env.GOOGLE_CALENDAR_CLIENT_SECRET||'',refreshToken:env.GOOGLE_CALENDAR_REFRESH_TOKEN||''});
  const engine=new BookingEngine(policy,createRpcBookingStore(rpc),new GoogleCalendarProvider(token));
  const result=await handleStaffBooking(request,{enabled:true,engine,verify:async(token)=>{
   const r=await fetch(url.replace(/\/$/,'')+'/auth/v1/user',{headers:{apikey:anon,Authorization:'Bearer '+token},signal:AbortSignal.timeout(10000),redirect:'error'});
   const user=r.ok?await r.json():null;return typeof user?.id==='string'?{id:user.id}:null;
  },authorize:async(actor,division,key)=>{
   const {data,error}=await rpc('crm_booking_staff_context',{p_actor:actor,p_division:division,p_key:key});return !error&&data?.authorized===true&&data?.enabled===true;
  }});
  for(const [key,value] of Object.entries(cors))result.headers.set(key,value!);
  return result;
 }catch{return Response.json({error:'Booking configuration or operation unresolved.'},{status:503,headers:{...cors,'Cache-Control':'no-store'}});}
}
