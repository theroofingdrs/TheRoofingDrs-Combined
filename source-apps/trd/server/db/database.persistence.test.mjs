import assert from 'node:assert/strict';
import { test } from 'node:test';

test('TRD operational collections and leads survive a fresh process through Supabase', async () => {
  const records = new Map();
  process.env.NODE_ENV = 'production';
  process.env.SUPABASE_URL = 'https://supabase.persistence.test';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
  process.env.WEBSITE_DATA_DIR = `/tmp/trd-persistence-test-${process.pid}`;

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init = {}) => {
    const url = new URL(String(input));
    const method = init.method || 'GET';
    if (method === 'GET') {
      const recordType = (url.searchParams.get('record_type') || '').replace(/^eq\\./, '');
      const rows = [...records.values()].filter((row) => row.record_type === recordType);
      return new Response(JSON.stringify(rows), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
    if (method === 'POST') {
      const rows = JSON.parse(String(init.body || '[]'));
      for (const row of rows) {
        const existing = records.get(row.id);
        records.set(row.id, {
          ...existing,
          ...row,
          created_at: existing?.created_at || row.created_at || new Date().toISOString(),
        });
      }
      return new Response(null, { status: 204 });
    }
    return new Response('Unsupported test method', { status: 405 });
  };

  try {
    const firstProcess = await import('./database.ts?fresh-process-one');
    await firstProcess.initializeDatabase();
    const database = firstProcess.getDatabase();
    database.customers.push({
      id: 'persistence-test-customer',
      displayName: 'Synthetic persistence test',
      createdAt: '2026-11-04T00:00:00.000Z',
      updatedAt: '2026-11-04T00:00:00.000Z',
    });
    database.leads.push({
      id: 'persistence-test-lead',
      createdAt: '2026-11-04T00:00:00.000Z',
      updatedAt: '2026-11-04T00:00:00.000Z',
    });
    firstProcess.persistDatabase();
    await firstProcess.flushDatabasePersistence();

    assert.ok(records.has('db_collection:customers'));
    assert.ok(records.has('persistence-test-lead'));
    assert.equal(records.get('persistence-test-lead').record_type, 'lead');

    const secondProcess = await import('./database.ts?fresh-process-two');
    await secondProcess.initializeDatabase();
    const restored = secondProcess.getDatabase();
    assert.ok(restored.customers.some((customer) => customer.id === 'persistence-test-customer'));
    assert.ok(restored.leads.some((lead) => lead.id === 'persistence-test-lead'));
  } finally {
    globalThis.fetch = originalFetch;
  }
});
