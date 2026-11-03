# Centralized TRD / CRD booking configuration readiness

Bounded preflight package for Website Issue #29 and tracker #30. Based on release-candidate/combined-site at `31885540cfae96557331a87e38ccbe033a8dd392`. Owner: Crystal.

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

Synthetic fixtures use example.test URLs, dummy calendar IDs and explicitly test-only times/durations. Eleven test groups cover unresolved settings, both identities, central routing, all 20 division/service/mode handoffs, missing/swapped/ambiguous calendars, invalid/missing schedules/timezone, unset durations/buffers, rejected Church identities/domains, unsafe/duplicate URLs, unsupported services, confirmation gating, malformed configuration, no mutation and no network/credential requirement. Approved identity/service/mode registries are frozen so JavaScript consumers cannot rebind the accepted policy. Actual saved customer/profile data is not used.

The pure module is not imported into either app or existing registry. No existing shared package.json/workflow/router/auth/persistence/migration files were edited. A new isolated `.github/workflows/booking-readiness.yml` runs the synthetic suite and a pinned TypeScript 5.8.3 standalone check, independently of existing whole-app CI. The compiler is CI tooling only; no runtime dependency or app package change is introduced. Reviewers can also run the commands above explicitly.

## Unresolved decisions and release gates

Exact public URLs/domain deployment mapping, timezone, operating hours/blackouts, durations, buffers, calendar IDs/access, resource capacity and cross-division busy rules, minimum notice/horizon, notification approval, operational recovery owner, OAuth consent/redirect/scopes and staff-management workflow remain unapproved/unverified. Required settings stay configurable and unset. Central Google management is approved; a live connection is not.

Future activation requires operational approval, real adapter readiness, durable reservation/concurrency tests, exact resource authorization and safe confirmation/recovery integration. Do not enable booking, connect an account, create calendars, send notifications, migrate production data, merge or deploy from this package. Original branches, PRs and uncommitted security/persistence drafts are preserved.


## Local validation results

- `node --experimental-strip-types booking/readiness.test.mjs`: 11 test groups passed, 0 failed; includes all 20 division/service/mode handoff combinations.
- `/workspace/TheRoofingDrs-Combined/source-apps/trd/node_modules/.bin/tsc -p booking/tsconfig.json`: passed using TypeScript 5.8.3.
- Both `npm --prefix source-apps/{trd,crd} run build` commands: passed; existing >500 kB Vite bundle warnings remain.
- `npm --prefix source-apps/crd run lint`: passed.
- `npm --prefix source-apps/trd run lint`: existing baseline failure at BrandLogo.tsx:27 (ImportMeta.env), already reproduced on untouched RC during PR #31. The new standalone module passes strict checking; no shared branding/type file was changed to bypass the baseline error.
- `SMOKE_TEST_PORT=8137 node scripts/smoke-test.mjs`: all existing local combined route/asset/SEO/API-health checks passed.
- `git diff --check`: passed.

Only synthetic fixtures and local servers were used. No live Google account, Calendar, booking URL, notification, appointment, customer record, production database or production configuration was accessed/changed. These results establish configuration preflight coverage, not a working Google integration or release approval.
