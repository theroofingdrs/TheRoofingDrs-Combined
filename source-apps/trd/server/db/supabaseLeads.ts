/** Server-only durable lead persistence. Never import into browser code. */
import type { Lead } from '../../shared/types/index.ts';

type StoredLead = { id: string; record_type: string; payload: Record<string, unknown>; created_at?: string; updated_at?: string };

function config() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !/^https:\/\//i.test(url)) {
    throw new Error('Shared lead storage is not configured on the server.');
  }
  return { url, key };
}

async function call<T>(method: string, query: string, body?: unknown): Promise<T> {
  const { url, key } = config();
  const response = await fetch(`${url}/rest/v1/trd_records?${query}`, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Shared lead storage failed (${response.status}).`);
  return (text ? JSON.parse(text) : undefined) as T;
}

export async function saveSharedLead(lead: Lead): Promise<void> {
  await call<StoredLead[]>('POST', 'on_conflict=id', [{
    id: lead.id,
    record_type: 'lead',
    payload: lead,
    created_at: lead.createdAt,
    updated_at: lead.updatedAt,
  }]);
}

export async function getSharedLeads(): Promise<Lead[]> {
  const rows = await call<StoredLead[]>('GET', 'select=id,record_type,payload,created_at,updated_at&record_type=eq.lead&order=created_at.desc');
  return rows.map(row => ({ ...row.payload, id: row.id } as Lead));
}

export async function getSharedLead(id: string): Promise<Lead | null> {
  const rows = await call<StoredLead[]>('GET', `select=id,record_type,payload,created_at,updated_at&record_type=eq.lead&id=eq.${encodeURIComponent(id)}&limit=1`);
  return rows.length ? ({ ...rows[0].payload, id: rows[0].id } as Lead) : null;
}
