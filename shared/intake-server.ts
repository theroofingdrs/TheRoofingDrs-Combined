/** Server only. Only the service credential can execute the intake RPC. */
export class IntakeError extends Error {
  status: number;
  constructor(message: string, status = 503) { super(message); this.status = status; }
}
export type IntakeReceipt = { ok: boolean; status: string; submission_key: string; lead_id: string; source_id: string; received_at: string; replayed: boolean; error_code?: string };
export async function deliverInquiry(division: 'TRD' | 'CRD', key: unknown, payload: Record<string, unknown>): Promise<IntakeReceipt> {
  if (typeof key !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(key)) throw new IntakeError('Refresh this form and retry with its submission reference.', 400);
  const contact = payload.contactRecord && typeof payload.contactRecord === 'object' ? payload.contactRecord as Record<string, unknown> : {};
  const email = contact.email || payload.email, phone = contact.phone || payload.phone;
  const validEmail = typeof email === 'string' && /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(email.trim());
  const validPhone = typeof phone === 'string' && phone.replace(/\D/g, '').length >= 7;
  if (!validEmail && !validPhone) throw new IntakeError('Enter a valid phone number or email address.', 400);
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url?.startsWith('https://') || !secret) { console.error('Website intake configuration missing',{division,submissionKey:key,missing:[...(!url?['SUPABASE_URL']:[]),...(!secret?['SUPABASE_SERVICE_ROLE_KEY']:[])]}); throw new IntakeError('Inquiry storage is unavailable. Your request has not been confirmed; retry or call (903) 231-5940.'); }
  const body = JSON.stringify({ p_division: division, p_key: key, p_payload: payload });
  if (Buffer.byteLength(body) > 26214400) throw new IntakeError('Request is too large. Keep attachments under 25 MB total and retry.', 400);
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url + '/rest/v1/rpc/crm_receive_website_lead', {
        method: 'POST', signal: AbortSignal.timeout(15000),
        headers: { apikey: secret, Authorization: 'Bearer ' + secret, 'Content-Type': 'application/json' }, body,
      });
      if (!response.ok) {
        if ([408,429].includes(response.status) || response.status >= 500) throw new Error('Transient intake HTTP ' + response.status);
        // No provider response body or credential is exposed to a visitor.
        throw new IntakeError('Inquiry delivery is unavailable. Keep your submission reference and retry or call our team.');
      }
      const result = await response.json() as IntakeReceipt;
      if (result.status === 'conflict') throw new IntakeError('This submission reference already belongs to different details. Refresh the form before submitting changed details.', 409);
      if (!result.ok || result.status !== 'delivered' || !result.lead_id || !result.source_id || result.submission_key !== key) {
        throw new IntakeError(result.error_code === '22023' ? 'Check contact details and supported attachments (JPEG, PNG, WebP or PDF; 15 MB per file).' : 'Your inquiry could not reach Operations. Keep your submission reference and retry or call our team.', result.error_code === '22023' ? 400 : 503);
      }
      return result;
    } catch (error) {
      if (error instanceof IntakeError) throw error;
      lastError = error;
      if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }
  console.error('Website intake result unconfirmed', { division, submissionKey: key, reason: lastError instanceof Error ? lastError.name : 'network-error' });
  throw new IntakeError('Delivery is not yet confirmed. Retry with the same details and reference, or call (903) 231-5940.');
}
