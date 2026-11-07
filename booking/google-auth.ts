/** Server-only OAuth refresh, injected credentials/transport; no interactive login. */
export function googleAccessToken(config:{clientId:string;clientSecret:string;refreshToken:string},transport:typeof fetch=fetch,now:()=>number=()=>Date.now()){
 let cached:{token:string;until:number}|undefined;let pending:Promise<string>|undefined;
 return async():Promise<string>=>{
  if(cached&&cached.until>now()+60000)return cached.token;
  if(pending)return pending;
  pending=(async()=>{
   if(!config.clientId||!config.clientSecret||!config.refreshToken)throw Error('Calendar OAuth credentials are not configured.');
   const r=await transport('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'refresh_token',client_id:config.clientId,client_secret:config.clientSecret,refresh_token:config.refreshToken}),signal:AbortSignal.timeout(15000),redirect:'error'});
   const data=r.ok?await r.json():null;
   if(typeof data?.access_token!=='string'||!data.access_token||data.token_type?.toLowerCase()!=='bearer'||!Number.isFinite(data.expires_in)||data.expires_in<=60)throw Error('Calendar authorization unavailable.');
   cached={token:data.access_token,until:now()+data.expires_in*1000};return cached.token;
  })();
  try{return await pending;}finally{pending=undefined;}
 };
}
