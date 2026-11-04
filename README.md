# The Roofing Doctors Combined Website

One shared landing page serves the existing residential and commercial applications:

- `/` — brand selection
- `/residential/` — The Roof Doctors
- `/commercial/` — Commercial Roof Doctors

Both original applications and their assets remain in `source-apps/`. The private Operations CRM remains in the separate `theroofingdrs/TRD-CRD-Operations` repository. Staff portal links hand off to Operations.

## Development and validation

Use Node 22 or later. Install exact application dependencies with `npm run install:apps`, then run `npm test` for both TypeScript checks, disabled booking configuration tests, production builds and combined route/asset/intake checks. `npm start` serves the built applications through the combined server.

Smoke tests use a temporary data directory and remove production Supabase bindings from the child environment. They do not create real leads, call calendars or send notifications.

## Runtime configuration

Public lead persistence requires server-only `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Verified staff API access also requires `SUPABASE_ANON_KEY` or `SUPABASE_PUBLISHABLE_KEY`. Browser sign-in uses only `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` at build time. Never expose a service-role key through a Vite variable.

Existing Supabase tables and storage policies must be reconciled before deployment. Repository consolidation does not apply database migrations or change customer data. Local JSON mirrors are not the durable lead store. `WEBSITE_DATA_DIR` optionally relocates these mirrors; production defaults preserve their existing paths.

Cloud Build builds and pushes an image. Its production deploy step is skipped unless `_APPROVE_PRODUCTION_DEPLOY=true` is explicitly supplied for an approved release. No DNS or production deployment is part of this consolidation.

See [consolidation status](docs/consolidation-status.md) for integrated work, tests and remaining product gaps.
