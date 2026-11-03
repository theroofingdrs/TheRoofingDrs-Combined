# Centralized TRD / CRD booking configuration readiness

Bounded preflight package for Website Issue #29 and tracker #30. Based on release-candidate/combined-site at `31885540cfae96557331a87e38ccbe033a8dd392`. Owner: Crystal.

## Latest approved operating requirements (2026-11-03)

- Timezone: **America/Chicago** (Central Time), using IANA DST rules rather than a fixed UTC offset.
- Appointment window: **Monday through Saturday, 08:30–18:00 Central**. **No Sunday appointments**.
- Separate customer-facing identities and URLs for **The Roofing Doctors (TRD)** and **Commercial Roof Doctors (CRD)**, using one centralized Google booking arrangement managed through `theroofingdrs@gmail.com`.
- All five listed appointment types remain required for both divisions. Church Roofing Drs / churchroofingdrs.com remains excluded.
- **Automatic confirmation is requested**, not an implemented/verified provider capability. No channel, sender, operator or notification integration is silently selected.
- Durations, buffers, exact calendar assignments, individual operators, public URLs and additional availability rules remain unresolved. Do not infer holidays, lead times, start-time cutoffs, resource capacity or any other schedule rules from the approved daily window.

The frozen implementation's factory remains deliberately unconfigured. The following documentation-only profile represents the approved timezone/window while leaving all other values unset and booking disabled:

```ts
const config = createUnconfiguredBookingConfig();
config.timezone = 'America/Chicago';
for (const division of ['TRD', 'CRD'] as const) {
  config.divisions[division].operatingHours = [1, 2, 3, 4, 5, 6].map(day => ({
    day, start: '08:30', end: '18:00',
  }));
}
// enabled stays false; URLs/calendars/durations/buffers/confirmation stay unresolved.
```

Future availability calculations, displayed appointment times and Calendar integration must consistently use America/Chicago. There is no availability/time-slot engine in this package. Before activation, interval-boundary semantics must be reviewed against approved durations/buffers; no appointment-duration rule is inferred here.

## Independent review status

A separate reviewer assessed exact code SHA `5bdae8b09514d84bc4c8130d965ab1ff1429931f` independently of the implementation author. Result: **FAIL — medium-severity malformed calendar identifier validation gap**. A NUL-character ID passes the current nonblank check and is returned in an otherwise complete synthetic preview. Runtime remains false. The current bounded correction adds the provider-backed identifier contract below and negative regressions. It must receive an independent re-review; no live provider integration or activation is included. Keep PR #32 draft until findings are resolved and independently verified.

The review also distinguishes this isolated package's disabled runtime from unchanged legacy appointment/integration paths: global booking disable is not established by this module. No legacy implementation is changed or activated here. Full independent evidence and reproduction are delivered separately with the review report; the old verdict applies to the frozen SHA; the corrected implementation requires its own exact-SHA verdict.

## Approved direction and current boundary

Two customer-facing experiences: **The Roofing Doctors (TRD)** and **Commercial Roof Doctors (CRD)**. One centrally managed Google booking arrangement, with explicit division-calendar routing and service identity retained. Use the approved central account through the server-side alias `central-booking-account`; no login, credentials or OAuth tokens are stored in this module. Church Roofing Drs and churchroofingdrs.com are excluded; this owner decision supersedes the older Issue #29 wording.

`createUnconfiguredBookingConfig()` supplies approved identities/service names but leaves URLs, calendar assignments, timezone, hours, durations, buffers and confirmation approval unresolved. It sets enabled=false. It reads no environment and performs no I/O. Never replace these nulls with guessed business defaults.

`validateBookingConfiguration(unknown)` returns actionable static errors without echoing supplied values. `configurationReady` means only configuration shape/completeness; it is not operational approval, provider connection, availability or authorization. `runtimeEnabled` is always **false**, including for complete synthetic fixtures. No caller-supplied enabled flag can activate this package.

`previewBookingHandoff()` produces an immutable, explicitly **not-submitted** context for synthetic inspection. Division, approved company name, URL, central provider/account alias, calendar assignment, selected service and mode remain bound together. It creates no reservation or appointment. Both divisions must pass this bounded preflight before a preview is available. It is not a public API or a customer-data authorization mechanism.

## Discovery findings (source evidence, not live integration claims)

| Source | Existing implementation / consequence |
| --- | --- |
| `source-apps/trd/server/services/integrations/index.ts:53-59` | Google Calendar provider declaration lists client ID/secret variable names. A declaration alone is not an adapter or OAuth connection. |
| Same file, `getActiveAdapter():77-84` | Only ROOFR returns an adapter; Google Calendar falls through to null. No usable Calendar adapter was found in this integration folder. |
| Same file, `syncIntegrationStatus():86-109` | Marks provider connected/enabled based on environment presence and persists legacy JSON. This is not verified Google readiness and MUST NOT be used to activate booking. This package does not import/call that function. |
| `source-apps/trd/server/services/integrations/roofr.ts:9-27` | Existing provider abstraction is measurement-specific (order/poll/normalize), unsuitable for reusing as a booking adapter. No generic functional Calendar interface exists there. |
| `source-apps/trd/server/api/v1/router.ts` (`/appointments` handlers) and `source-apps/trd/server/db/database.ts` | Legacy appointment CRUD and local JSON persistence exist. They are not a shared two-brand reservation engine with verified Calendar sync. Their state is not reused as proof of booking readiness. |
| `source-apps/crd/src/constants.ts:2` | Commercial Roof Doctors identity matches owner clarification. This reserved content/config file is unchanged. |
| Operations baseline `crm_appointments` / `crm_divisions` | Appointments have division/resource/time fields; no approved timezone, calendars or booking schedule is established by the inspected baseline. No live catalog/account was inspected. |

Missing operational integration: approved URL/domain mapping, schedule/resource policy, exact calendar assignments, actual Google adapter, OAuth consent/token lifecycle, verified provider readiness, atomic durable reservations, busy-period reconciliation, idempotent event/confirmation recovery and authorized management. None is claimed implemented here.

## Configuration contract

- Exactly one central provider (`GOOGLE_CALENDAR`) and approved account alias; no per-brand credentials or second platform.
- Exact TRD/CRD identities and distinct HTTPS booking URLs; no embedded credentials, query strings, fragments or excluded Church domains.
- Each calendar assignment explicitly names its division. Swapped division bindings fail. Duplicate calendar IDs are treated as ambiguous and blocked; an intentionally shared physical calendar requires a separately reviewed routing contract. The validator cannot prove Google-side calendar ownership or detect an operator assigning the wrong real ID—future integration readiness must verify bindings.
- Five approved services for each division: roof inspection, roof repair estimate, roof replacement estimate, storm damage inspection, insurance claim inspection. Both on-site and phone modes retain service identity.
- Named timezone; per-division weekday/time intervals; positive whole-minute durations per service and mode; explicit nonnegative before/after buffers. Zero buffers are valid only when explicitly supplied. Overnight intervals must be split; overlapping intervals rejected.
- Explicit approved email/SMS confirmation policy only after durable reservation. This is policy validation, not implemented notification delivery.
- Unsupported configuration fields, including credentials, are rejected. Diagnostics do not echo values. Load configuration only from a future trusted server configuration source; this is not a proposed public configuration API.

## Future adapter contract (documented, deliberately unimplemented)

The existing architecture does not safely support implementing a live Calendar adapter in this package. A later coordinated adapter should consume a server-validated immutable context with:

| Operation | Contract |
| --- | --- |
| Readiness | Verify approved central connection and exact division-calendar access; distinguish unconfigured, unauthorized, temporarily unavailable and ready. Environment-variable presence is insufficient. |
| Availability | Receive division/service/mode/time-range and approved schedule/resource policy; read busy periods without exposing customer event details; no availability when readiness fails. |
| Event synchronization | Consume an already committed, authorized reservation plus stable operation ID; preserve division/company/service identity and calendar binding; idempotent create/update/cancel with durable reconciliation. |
| Confirmation | Run only after durable reservation; retain brand identity and explicit delivery state; never claim Google sync or recipient delivery solely from a local status flag. |
| Recovery | Treat provider timeout as uncertain; reconcile the original operation rather than blindly repeat external side effects. Exact policy requires a separate reviewed implementation. |

These operations require the existing intake/CRM owners, approved transactional reservation design and Google integration approval. Types or a config flag cannot prove authorization, reservation durability or provider acceptance. No second database/platform, OAuth client, production config or new API route was introduced.

## Tests and review commands

```sh
node --experimental-strip-types booking/readiness.test.mjs
# Use an installed TypeScript compiler; no dependency installation is required:
tsc -p booking/tsconfig.json
npm --prefix source-apps/trd run build
npm --prefix source-apps/crd run build
SMOKE_TEST_PORT=8137 node scripts/smoke-test.mjs
```

Synthetic fixtures use example.test URLs, dummy calendar IDs and explicitly test-only times/durations. Fourteen test groups cover unresolved settings, both identities, central routing, all 20 division/service/mode handoffs, missing/swapped/ambiguous calendars, invalid/missing schedules/timezone, unset durations/buffers, rejected Church identities/domains, unsafe/duplicate URLs, unsupported services, confirmation gating, malformed configuration, no mutation and no network/credential requirement. Approved identity/service/mode registries are frozen so JavaScript consumers cannot rebind the accepted policy. Actual saved customer/profile data is not used.

The pure module is not imported into either app or existing registry. No existing shared package.json/workflow/router/auth/persistence/migration files were edited. A new isolated `.github/workflows/booking-readiness.yml` runs the synthetic suite and a pinned TypeScript 5.8.3 standalone check, independently of existing whole-app CI. The compiler is CI tooling only; no runtime dependency or app package change is introduced. Reviewers can also run the commands above explicitly.

## Unresolved decisions and release gates

Timezone and the weekly operating window are now approved as above. Exact public URLs/domain deployment mapping, holiday/blackout policy, durations, buffers, calendar IDs/access, resource capacity and cross-division busy rules, minimum notice/horizon, confirmation channel/sender integration, individual operators/recovery owner, OAuth consent/redirect/scopes and staff-management workflow remain unresolved or unverified. Required settings stay configurable and unset. Central Google management is approved; a live connection is not.

Future activation requires operational approval, real adapter readiness, durable reservation/concurrency tests, exact resource authorization and safe confirmation/recovery integration. Do not enable booking, connect an account, create calendars, send notifications, migrate production data, merge or deploy from this package. Original branches, PRs and uncommitted security/persistence drafts are preserved.


## Local validation results

- `node --experimental-strip-types booking/readiness.test.mjs`: 14 test groups passed, 0 failed; includes all 20 division/service/mode handoff combinations.
- `/workspace/TheRoofingDrs-Combined/source-apps/trd/node_modules/.bin/tsc -p booking/tsconfig.json`: passed using TypeScript 5.8.3.
- Both `npm --prefix source-apps/{trd,crd} run build` commands: passed; existing >500 kB Vite bundle warnings remain.
- `npm --prefix source-apps/crd run lint`: passed.
- `npm --prefix source-apps/trd run lint`: existing baseline failure at BrandLogo.tsx:27 (ImportMeta.env), already reproduced on untouched RC during PR #31. The new standalone module passes strict checking; no shared branding/type file was changed to bypass the baseline error.
- `SMOKE_TEST_PORT=8137 node scripts/smoke-test.mjs`: all existing local combined route/asset/SEO/API-health checks passed.
- `git diff --check`: passed.

Only synthetic fixtures and local servers were used. No live Google account, Calendar, booking URL, notification, appointment, customer record, production database or production configuration was accessed/changed. These results establish configuration preflight coverage, not a working Google integration or release approval.


## Calendar identifier correction — provider requirements and local policy

Public provider references inspected 2026-11-03:
- [Google Calendar v3 Calendars.get parameters](https://developers.google.com/workspace/calendar/api/v3/reference/calendars/get#parameters): calendarId is a string; retrieve IDs with calendarList.list. Google also supports the account-relative `primary` keyword.
- [Google CalendarList resource](https://developers.google.com/workspace/calendar/api/v3/reference/calendarList#resource-representations): id identifies the calendar; provider metadata/accessRole is separate from identifier syntax.

These references do not specify a universal email-only regular expression for calendar IDs. This implementation therefore treats explicit IDs as opaque strings, without applying event-ID rules, lowercasing, trimming or decoding them. Example-shaped IDs are not proof of an existing or accessible calendar.

Local booking input contract, deliberately distinguished from a Google-wide syntax claim:
1. Require a nonempty raw string from a future approved CalendarList selection, explicitly bound to TRD or CRD.
2. Reject NUL, all ASCII/C1 controls, whitespace anywhere and malformed UTF-16. Do not silently trim or repair an identifier.
3. Reject pasted scheme:// URLs; the input expects an ID, not a Calendar link or API endpoint.
4. Exclude Google's valid `primary` shortcut from this application contract because it resolves relative to the signed-in account rather than identifying an explicit division calendar.
5. Preserve all other opaque characters and case exactly. Percent sequences are literal ID characters, not decoded escapes; a future adapter must encode a raw ID exactly once as an API path parameter. No HTTP request is performed here.
6. Validate before adding the ID to readiness or constructing any preview context. Missing/wrong-division/duplicate assignment checks remain intact; runtimeEnabled remains false.
7. A syntactically accepted ID still requires independently approved provider access, identity and division-binding verification before any live use. No calendar existence/ownership is inferred by preflight.

The corrected tests reproduce the exact NUL finding: configurationReady=false and no preview context for either division. Additional cases cover nonstrings, empty values, whitespace, all ASCII/C1 control codepoints, malformed Unicode, primary alias, pasted URLs and preservation of synthetic opaque IDs. The new regression suite was also run against the exact reviewed old SHA: the NUL/unsafe-ID regression groups failed as expected. Current suite: 14 groups passed; strict standalone TypeScript check passed. Further build/CI/re-review results are associated with the exact corrective commit in PR #32.
