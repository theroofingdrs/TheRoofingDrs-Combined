import test from 'node:test';
import assert from 'node:assert/strict';
import { createUnconfiguredBookingConfig, validateBookingConfiguration, previewBookingHandoff, SERVICES, MODES, IDENTITIES } from './readiness.ts';

// Explicit synthetic settings; these are NOT business defaults or approvals.
function configured() {
  const c = createUnconfiguredBookingConfig();
  c.enabled = true;
  c.timezone = 'Etc/UTC';
  c.confirmation = { after: 'durable-reservation', channel: 'email', approved: true };
  for (const division of ['TRD', 'CRD']) {
    const d = c.divisions[division];
    d.publicUrl = `https://${division.toLowerCase()}.example.test/book`;
    d.calendar = { division, id: `synthetic-${division}` };
    d.operatingHours = [{ day: 1, start: '09:00', end: '10:00' }];
    for (const service of SERVICES) for (const mode of MODES) d.durationsMinutes[service][mode] = 15;
    d.buffers = { beforeMinutes: 0, afterMinutes: 5 };
  }
  return c;
}
const rejected = c => {
  const result = validateBookingConfiguration(c);
  assert.equal(result.configurationReady, false);
  assert.equal(result.runtimeEnabled, false);
  assert.equal(previewBookingHandoff(c, 'TRD', SERVICES[0], 'phone').ok, false);
  return result;
};

test('unconfigured example retains unresolved values and cannot activate by enabled flag alone', () => {
  const c = createUnconfiguredBookingConfig();
  assert.equal(c.enabled, false);
  assert.equal(c.timezone, null);
  for (const d of Object.values(c.divisions)) {
    assert.equal(d.publicUrl, null);
    assert.equal(d.calendar, null);
    assert.equal(d.operatingHours, null);
    assert.deepEqual(d.buffers, { beforeMinutes: null, afterMinutes: null });
    for (const modes of Object.values(d.durationsMinutes)) assert.deepEqual(modes, { 'on-site': null, phone: null });
  }
  rejected(c);
  c.enabled = true;
  rejected(c);
});

test('both approved identities use one central provider with distinct URLs and division/service/mode routing', () => {
  const c = configured();
  assert.equal(validateBookingConfiguration(c).configurationReady, true);
  assert.notEqual(c.divisions.TRD.publicUrl, c.divisions.CRD.publicUrl);
  for (const division of ['TRD', 'CRD']) for (const service of SERVICES) for (const mode of MODES) {
    const result = previewBookingHandoff(c, division, service, mode);
    assert.equal(result.ok, true);
    assert.equal(result.context.identity, division === 'TRD' ? 'The Roofing Doctors' : 'Commercial Roof Doctors');
    assert.equal(result.context.division, division);
    assert.equal(result.context.calendarId, `synthetic-${division}`);
    assert.equal(result.context.publicUrl, c.divisions[division].publicUrl);
    assert.equal(result.context.provider, 'GOOGLE_CALENDAR');
    assert.equal(result.context.accountAlias, 'central-booking-account');
    assert.equal(result.context.service, service);
    assert.equal(result.context.mode, mode);
    assert.equal(result.context.status, 'not-submitted');
    assert.equal(result.runtimeEnabled, false);
    assert(Object.isFrozen(result.context));
  }
});

test('missing, wrong-division and ambiguous calendar assignments fail closed', () => {
  for (const division of ['TRD', 'CRD']) {
    const missing = configured(); missing.divisions[division].calendar = null; rejected(missing);
    const swapped = configured(); swapped.divisions[division].calendar.division = division === 'TRD' ? 'CRD' : 'TRD'; rejected(swapped);
  }
  const same = configured(); same.divisions.CRD.calendar.id = same.divisions.TRD.calendar.id; rejected(same);
});

test('missing/invalid timezone and schedules cannot be inferred', () => {
  for (const timezone of [null, '', 'not/a/timezone', '+00:00']) { const c = configured(); c.timezone = timezone; rejected(c); }
  for (const hours of [null, [], [{ day: 8, start: '09:00', end: '10:00' }], [{ day: 1, start: '25:00', end: '26:00' }], [{ day: 1, start: '10:00', end: '09:00' }], [{ day: 1, start: '09:00', end: '10:00' }, { day: 1, start: '09:30', end: '10:30' }]]) {
    const c = configured(); c.divisions.TRD.operatingHours = hours; rejected(c);
  }
});

test('every service/mode requires approved duration and explicit buffers including zero', () => {
  for (const division of ['TRD', 'CRD']) for (const service of SERVICES) for (const mode of MODES) {
    const c = configured(); c.divisions[division].durationsMinutes[service][mode] = null; rejected(c);
  }
  for (const value of [null, -1, NaN, Infinity, 1.5]) {
    const c = configured(); c.divisions.TRD.buffers.beforeMinutes = value; rejected(c);
    const d = configured(); d.divisions.CRD.durationsMinutes[SERVICES[0]].phone = value; rejected(d);
  }
});

test('invalid company identity, Church identity and excluded domains rejected', () => {
  for (const division of ['TRD', 'CRD']) for (const identity of [null, '', 'Church Roofing Drs', 'Another Company']) {
    const c = configured(); c.divisions[division].identity = identity; rejected(c);
  }
  for (const url of ['https://churchroofingdrs.com/book', 'https://sub.churchroofingdrs.com/book', 'https://CHURCHROOFINGDRS.COM./book', 'http://crd.example.test/book', 'https://user:password@crd.example.test/book', 'https://crd.example.test/book?token=synthetic', 'https://crd.example.test/book#secret']) {
    const c = configured(); c.divisions.CRD.publicUrl = url; rejected(c);
  }
});

test('duplicate public URLs and unknown services/divisions/modes rejected', () => {
  const c = configured(); c.divisions.CRD.publicUrl = c.divisions.TRD.publicUrl + '/'; rejected(c);
  for (const args of [['OTHER', SERVICES[0], 'phone'], ['TRD', 'unknown', 'phone'], ['CRD', SERVICES[0], 'unknown']]) assert.equal(previewBookingHandoff(configured(), ...args).ok, false);
  const d = configured(); d.divisions.TRD.services = [SERVICES[0]]; rejected(d);
});

test('confirmation must be explicitly approved after durable reservation', () => {
  for (const confirmation of [null, { after: 'before-reservation', channel: 'email', approved: true }, { after: 'durable-reservation', channel: 'email', approved: false }]) {
    const c = configured(); c.confirmation = confirmation; rejected(c);
  }
});

test('credentials/network are unnecessary, unsupported secret fields are not echoed', () => {
  const original = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('No network permitted'); };
  try {
    assert.equal(validateBookingConfiguration(configured()).configurationReady, true);
    const c = configured(); c.central.clientSecret = 'SYNTHETIC-MUST-NOT-ECHO';
    assert(!JSON.stringify(rejected(c)).includes('SYNTHETIC-MUST-NOT-ECHO'));
  } finally { globalThis.fetch = original; }
});

test('malformed data fails closed; validation does not mutate caller configuration', () => {
  for (const input of [undefined, null, true, [], {}, { enabled: 'true' }]) rejected(input);
  const c = configured(); const before = structuredClone(c);
  validateBookingConfiguration(c); previewBookingHandoff(c, 'CRD', SERVICES[2], 'on-site');
  assert.deepEqual(c, before);
  assert.equal(validateBookingConfiguration(c).runtimeEnabled, false);
});


test('approved brand/service registries cannot be rebound by JavaScript consumers', () => {
  for (const registry of [IDENTITIES, SERVICES, MODES]) assert(Object.isFrozen(registry));
  assert.throws(() => { IDENTITIES.CRD = 'Church Roofing Drs'; }, TypeError);
  assert.throws(() => { SERVICES[0] = 'unapproved-service'; }, TypeError);
  assert.throws(() => { MODES[0] = 'unapproved-mode'; }, TypeError);
  const c = configured(); c.divisions.CRD.identity = 'Church Roofing Drs'; rejected(c);
});
