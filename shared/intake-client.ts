/** Stable retry identity, persisted before sending. No contact details enter browser storage. */
const memory = new Map<string, {key: string; submittedAt: string; attribution: Record<string,string>}>();
function canonical(value: unknown): string {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.keys(value).sort().filter(k => (value as Record<string,unknown>)[k] !== undefined).map(k => JSON.stringify(k) + ':' + canonical((value as Record<string,unknown>)[k])).join(',') + '}';
  return JSON.stringify(value);
}
export async function submitInquiry<T = any>(endpoint: string, payload: Record<string, unknown>): Promise<T> {
  // File-picker IDs/times change on re-selection; they are not inquiry identity.
  const stablePayload = {...payload};
  if(Array.isArray(payload.photos))stablePayload.photos=payload.photos.map(photo=>{if(!photo||typeof photo!=='object')return photo;const {id,uploadedAt,...stable}=photo;return stable;});
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(endpoint + canonical(stablePayload)));
  const slot = 'roofing-inquiry-v1:' + Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2,'0')).join('');
  let saved = memory.get(slot);
  try { saved ??= JSON.parse(sessionStorage.getItem(slot) || 'null'); } catch { /* In-memory fallback keeps retries stable in this page. */ }
  if (!saved) {
    const query = new URLSearchParams(location.search);
    const attribution: Record<string,string> = { landingPage: location.pathname, referrer: document.referrer };
    for (const [param,field] of [['utm_source','utmSource'],['utm_medium','utmMedium'],['utm_campaign','utmCampaign'],['utm_term','utmTerm'],['utm_content','utmContent']]) if (query.has(param)) attribution[field] = query.get(param)!;
    saved = {key: crypto.randomUUID(), submittedAt: new Date().toISOString(), attribution};
    memory.set(slot,saved);
    try { sessionStorage.setItem(slot, JSON.stringify(saved)); } catch { /* No false claim of persistence when storage is unavailable. */ }
  }
  let response: Response;
  try { response = await fetch(endpoint, {method:'POST', signal:AbortSignal.timeout(50000),headers:{'Content-Type':'application/json','Idempotency-Key':saved.key}, body:JSON.stringify({...stablePayload,...saved.attribution,submittedAt:saved.submittedAt})}); }
  catch { throw new Error('Delivery is not confirmed. Retry with the same details. Reference: '+saved.key); }
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.deliveryStatus !== 'delivered') throw new Error((result.error || 'Delivery is not confirmed. Retry with the same details.') + ' Reference: ' + saved.key);
  return result;
}
