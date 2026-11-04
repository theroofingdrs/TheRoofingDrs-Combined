import {validateBookingConfiguration} from './readiness.ts';
export function assessRuntime(env:Record<string,string|undefined>){
 const issues:string[]=[];
 const requireKeys=(keys:string[])=>{for(const name of keys)if(!env[name]?.trim())issues.push('Missing server binding: '+name);};
 requireKeys(['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY']);
 if(env.SUPABASE_URL){try{const url=new URL(env.SUPABASE_URL);if(url.protocol!=='https:'||url.username||url.password)throw Error();}catch{issues.push('SUPABASE_URL must be an HTTPS origin without credentials.');}}
 for(const name of Object.keys(env))if(/^VITE_.*(SERVICE_ROLE|SECRET|REFRESH_TOKEN|RESEND_API)/.test(name))issues.push('Forbidden public credential binding: '+name);
 if(env.BOOKING_ENABLED==='true'){
  requireKeys([...(env.SUPABASE_PUBLISHABLE_KEY?[]:['SUPABASE_ANON_KEY']),'BOOKING_POLICY_JSON','BOOKING_STAFF_ORIGIN','GOOGLE_CALENDAR_CLIENT_ID','GOOGLE_CALENDAR_CLIENT_SECRET','GOOGLE_CALENDAR_REFRESH_TOKEN']);
  if(env.BOOKING_PROVIDER_VERIFIED!=='true')issues.push('Calendar provider verification is unresolved.');
  try{const policy=JSON.parse(env.BOOKING_POLICY_JSON||'null');if(!policy||policy.booking?.timezone!=='America/Chicago'||!validateBookingConfiguration(policy.booking).configurationReady||!policy.operators?.TRD||!policy.operators?.CRD||!Number.isSafeInteger(policy.minNoticeMinutes)||policy.minNoticeMinutes<0||!Number.isSafeInteger(policy.maxAdvanceDays)||policy.maxAdvanceDays<1)throw Error();}catch{issues.push('Booking policy is missing, invalid or incomplete.');}
  try{const url=new URL(env.BOOKING_STAFF_ORIGIN||'');if(url.protocol!=='https:'||url.origin!==env.BOOKING_STAFF_ORIGIN)throw Error();}catch{issues.push('BOOKING_STAFF_ORIGIN must be an exact HTTPS origin.');}
 }
 return {scope:'configuration only; hosted policies, migrations and provider authority require independent verification',ready:issues.length===0,bookingEnabled:env.BOOKING_ENABLED==='true',issues};
}
