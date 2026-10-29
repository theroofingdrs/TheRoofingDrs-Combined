/**
 * Server-only Supabase REST helper for the combined Roof Doctors application.
 * Never import this module from browser code or expose the service role key.
 */
type JsonRecord = Record<string, unknown>;

function getConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      'Supabase persistence is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on the server.'
    );
  }
  if (!/^https:\/\//i.test(url)) {
    throw new Error('SUPABASE_URL must be an HTTPS URL.');
  }
  return { url, key };
}

async function request<T>(
  table: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  options: {
    query?: string;
    body?: JsonRecord | JsonRecord[];
    prefer?: string;
  } = {}
): Promise<T> {
  const { url, key } = getConfig();
  const endpoint = `${url}/rest/v1/${table}${options.query ? `?${options.query}` : ''}`;
  const response = await fetch(endpoint, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.prefer ? { Prefer: options.prefer } : {}),
    },
    ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
  });

  const text = await response.text();
  if (!response.ok) {
    // Do not include request bodies or credentials in errors.
    throw new Error(`Supabase request failed (${response.status}) for table "${table}": ${text.slice(0, 500)}`);
  }
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export async function selectRows<T extends JsonRecord>(
  table: string,
  query: string
): Promise<T[]> {
  return request<T[]>(table, 'GET', { query });
}

export async function insertRows<T extends JsonRecord>(
  table: string,
  rows: JsonRecord[]
): Promise<T[]> {
  return request<T[]>(table, 'POST', {
    body: rows,
    prefer: 'return=representation',
  });
}

export async function upsertRows<T extends JsonRecord>(
  table: string,
  rows: JsonRecord[],
  onConflict: string
): Promise<T[]> {
  return request<T[]>(table, 'POST', {
    query: `on_conflict=${encodeURIComponent(onConflict)}`,
    body: rows,
    prefer: 'resolution=merge-duplicates,return=representation',
  });
}

export async function updateRows<T extends JsonRecord>(
  table: string,
  query: string,
  patch: JsonRecord
): Promise<T[]> {
  return request<T[]>(table, 'PATCH', {
    query,
    body: patch,
    prefer: 'return=representation',
  });
}

export async function deleteRows(
  table: string,
  query: string
): Promise<void> {
  await request<void>(table, 'DELETE', { query });
}
