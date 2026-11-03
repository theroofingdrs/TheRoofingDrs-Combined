/** Pure preflight only: no environment, credentials, network, database or activation. */
export const SERVICES = Object.freeze(['roof-inspection', 'roof-repair-estimate', 'roof-replacement-estimate', 'storm-damage-inspection', 'insurance-claim-inspection'] as const);
export const MODES = Object.freeze(['on-site', 'phone'] as const);
export const IDENTITIES = Object.freeze({ TRD: 'The Roofing Doctors', CRD: 'Commercial Roof Doctors' } as const);
export type Division = keyof typeof IDENTITIES;
export type Service = typeof SERVICES[number];
export type Mode = typeof MODES[number];
export type DivisionConfig = {
  identity: string;
  publicUrl: string | null;
  calendar: { division: Division; id: string } | null;
  services: Service[];
  operatingHours: { day: number; start: string; end: string }[] | null;
  durationsMinutes: Record<Service, Record<Mode, number | null>>;
  buffers: { beforeMinutes: number | null; afterMinutes: number | null };
};
export type BookingConfig = {
  enabled: boolean;
  central: { provider: 'GOOGLE_CALENDAR'; accountAlias: 'central-booking-account' };
  timezone: string | null;
  confirmation: { after: 'durable-reservation'; channel: 'email' | 'sms'; approved: boolean } | null;
  divisions: Record<Division, DivisionConfig>;
};
export type Issue = Readonly<{ path: string; message: string }>;
export type Readiness = Readonly<{ configurationReady: boolean; runtimeEnabled: false; issues: readonly Issue[] }>;
const divisions: Division[] = ['TRD', 'CRD'];
const record = (v: unknown): Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : {};
const text = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
const integer = (v: unknown, min: number): boolean => typeof v === 'number' && Number.isSafeInteger(v) && v >= min;

// Google documents opaque CalendarList IDs, not a universal email/ID regex.
// Local boundary policy: explicit raw ID, safe for transport, no account alias.
// Existence/access/division ownership still require a future provider check.
function calendarIdentifier(value: unknown): value is string {
  if (typeof value !== 'string' || value.length === 0 || value === 'primary') return false;
  if (/[\s\u0000-\u001f\u007f-\u009f]/u.test(value)) return false;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) return false;
  try { encodeURIComponent(value); } catch { return false; } // malformed UTF-16
  return true;
}

export function createUnconfiguredBookingConfig(): BookingConfig {
  const make = (division: Division): DivisionConfig => ({
    identity: IDENTITIES[division], publicUrl: null, calendar: null, services: [...SERVICES], operatingHours: null,
    durationsMinutes: Object.fromEntries(SERVICES.map(s => [s, { 'on-site': null, phone: null }])) as DivisionConfig['durationsMinutes'],
    buffers: { beforeMinutes: null, afterMinutes: null },
  });
  return { enabled: false, central: { provider: 'GOOGLE_CALENDAR', accountAlias: 'central-booking-account' }, timezone: null, confirmation: null, divisions: { TRD: make('TRD'), CRD: make('CRD') } };
}

export function validateBookingConfiguration(input: unknown): Readiness {
  const issues: Issue[] = [];
  const add = (path: string, message: string) => issues.push(Object.freeze({ path, message }));
  // Never echo input values: malformed configuration might contain sensitive text.
  const keys = (o: Record<string, unknown>, allowed: string[], path: string) => {
    if (Object.keys(o).some(k => !allowed.includes(k))) add(path, 'Remove unsupported fields; configuration must contain no credentials.');
  };
  const config = record(input);
  keys(config, ['enabled', 'central', 'timezone', 'confirmation', 'divisions'], 'configuration');
  if (config.enabled !== true) add('enabled', 'Booking is disabled; explicit activation intent is required even for preflight.');
  const central = record(config.central);
  keys(central, ['provider', 'accountAlias'], 'central');
  if (central.provider !== 'GOOGLE_CALENDAR' || central.accountAlias !== 'central-booking-account') add('central', 'Use the single approved central Google booking provider/account alias.');
  if (!text(config.timezone)) add('timezone', 'Approve and configure an IANA timezone.');
  else {
    try {
      if (/^[+-]/.test(config.timezone)) throw new Error('Named timezone required');
      new Intl.DateTimeFormat('en', { timeZone: config.timezone }).format(0);
    }
    catch { add('timezone', 'Configure a valid IANA timezone.'); }
  }
  const confirmation = record(config.confirmation);
  keys(confirmation, ['after', 'channel', 'approved'], 'confirmation');
  if (confirmation.after !== 'durable-reservation' || (confirmation.channel !== 'email' && confirmation.channel !== 'sms') || confirmation.approved !== true) add('confirmation', 'Approve a confirmation channel only after durable reservation.');
  const configuredDivisions = record(config.divisions);
  keys(configuredDivisions, divisions, 'divisions');
  const urls: string[] = [];
  const calendars: string[] = [];
  for (const division of divisions) {
    const p = 'divisions.' + division;
    const d = record(configuredDivisions[division]);
    keys(d, ['identity', 'publicUrl', 'calendar', 'services', 'operatingHours', 'durationsMinutes', 'buffers'], p);
    if (d.identity !== IDENTITIES[division]) add(p + '.identity', 'Use the exact approved company identity for this division.');
    let url: URL | undefined;
    try { if (text(d.publicUrl)) url = new URL(d.publicUrl); } catch { /* reported below */ }
    const hostname = url?.hostname.replace(/\.$/, '') ?? '';
    if (!url || url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || hostname === 'churchroofingdrs.com' || hostname.endsWith('.churchroofingdrs.com')) add(p + '.publicUrl', 'Configure an approved HTTPS booking URL without credentials/query/fragment; Church domain is excluded.');
    else urls.push(url.href.replace(/\/$/, ''));
    const calendar = record(d.calendar);
    keys(calendar, ['division', 'id'], p + '.calendar');
    if (calendar.division !== division || !calendarIdentifier(calendar.id)) add(p + '.calendar', 'Assign an explicit raw CalendarList ID to this division; no primary alias, whitespace, controls, malformed Unicode or pasted URLs.');
    else calendars.push(calendar.id);
    const services = d.services;
    if (!Array.isArray(services) || services.length !== SERVICES.length || !SERVICES.every(s => services.includes(s))) add(p + '.services', 'Configure all five approved services for this division without duplicates or unsupported services.');
    const clock = (v: unknown): v is string => typeof v === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(v);
    if (!Array.isArray(d.operatingHours) || d.operatingHours.length === 0) add(p + '.operatingHours', 'Approve operating hours; no schedule is inferred.');
    else {
      const ranges: { day: number; start: string; end: string }[] = [];
      for (const entry of d.operatingHours) {
        const h = record(entry);
        keys(h, ['day', 'start', 'end'], p + '.operatingHours');
        if (!integer(h.day, 0) || Number(h.day) > 6 || !clock(h.start) || !clock(h.end) || h.start >= h.end) add(p + '.operatingHours', 'Use day 0–6 and valid increasing HH:mm intervals; split overnight intervals.');
        else ranges.push({ day: Number(h.day), start: h.start, end: h.end });
      }
      if (ranges.some((a, i) => ranges.slice(i + 1).some(b => a.day === b.day && a.start < b.end && b.start < a.end))) add(p + '.operatingHours', 'Remove overlapping operating intervals.');
    }
    const durations = record(d.durationsMinutes);
    keys(durations, [...SERVICES], p + '.durationsMinutes');
    for (const service of SERVICES) {
      const byMode = record(durations[service]);
      keys(byMode, [...MODES], p + '.durationsMinutes.' + service);
      for (const mode of MODES) if (!integer(byMode[mode], 1)) add(p + '.durationsMinutes.' + service + '.' + mode, 'Approve a positive whole-minute duration; no default is supplied.');
    }
    const buffers = record(d.buffers);
    keys(buffers, ['beforeMinutes', 'afterMinutes'], p + '.buffers');
    if (!integer(buffers.beforeMinutes, 0) || !integer(buffers.afterMinutes, 0)) add(p + '.buffers', 'Explicitly approve nonnegative before/after buffers; missing values are not zero.');
  }
  if (urls.length === 2 && urls[0] === urls[1]) add('divisions.publicUrl', 'The two customer-facing booking URLs must be distinct.');
  if (calendars.length === 2 && calendars[0] === calendars[1]) add('divisions.calendar', 'Calendar assignments are ambiguous; separate division bindings or a separately reviewed shared-calendar contract are required.');
  return Object.freeze({ configurationReady: issues.length === 0, runtimeEnabled: false, issues: Object.freeze(issues) });
}

/** Synthetic handoff preview, NOT a reservation, availability or activation API. */
export function previewBookingHandoff(input: unknown, division: unknown, service: unknown, mode: unknown) {
  const readiness = validateBookingConfiguration(input);
  if (!readiness.configurationReady) return { ok: false as const, issues: readiness.issues };
  if (!divisions.includes(division as Division) || !SERVICES.includes(service as Service) || !MODES.includes(mode as Mode)) return { ok: false as const, issues: [{ path: 'selection', message: 'Select an approved division, service and appointment mode.' }] };
  const config = input as BookingConfig;
  const d = config.divisions[division as Division];
  if (!d.services.includes(service as Service)) return { ok: false as const, issues: [{ path: 'selection.service', message: 'Service is unavailable in this division.' }] };
  return { ok: true as const, context: Object.freeze({ status: 'not-submitted' as const, division: division as Division, identity: d.identity, publicUrl: d.publicUrl!, provider: config.central.provider, accountAlias: config.central.accountAlias, calendarId: d.calendar!.id, service: service as Service, mode: mode as Mode }), runtimeEnabled: false as const };
}
