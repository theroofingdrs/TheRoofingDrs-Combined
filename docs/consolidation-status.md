# Website consolidation — November 3, 2026 (Central)

## Inventory and integration

Original main was `472eff1`. The working tree was clean. All remote branch histories were fetched directly with Git; no archive transfer or owner reconstruction was used. Original branches and image-library source files are preserved.

Integrated into main:

- `release-candidate/combined-site`: combined server and deep links, blog and restoration pages, brand assets, estimate details and SEO metadata.
- `integration/path-routing`: routing/recovery fixes and expanded asset checks. Conflicts retained the release candidate's current branding, distinct roofing photographs, industry directory, FAQ schema and secure Operations handoff. Old duplicate UI/layout implementations were not restored.
- `feature/supabase-persistence`: durable shared lead storage, authenticated staff APIs, private upload helpers, notifications after persistence, researched roofing/market content and crawlable city routes.
- `growth/residential-inspection-autofill`: labeled contact/address autofill and mobile keyboard hints.
- `feature/booking-configuration-readiness`: disabled preflight/configuration module and malformed calendar-ID correction; no live booking activation.
- `seo/trd-local-trust-schema`: the two city-page corrections, applied as commits. `seo/crd-louisiana-market-pages` has the identical committed tree to the persistence branch; its content is already included, so no duplicate implementation is required.

Earlier commercial content, service pages, Roofr foundation and image allocation branches are historical alternatives or foundations. Their relevant content is retained through main/release candidate/persistence. Incoming image-library originals stay in the repository but are excluded from the application container.

## Actual integration fixes

- Removed duplicate PVC/modified-bitumen object keys while retaining the existing photographed system pages.
- Fixed missing Vite types and stale references to removed public street-address configuration.
- Preserved stable canonical URLs, blog/industry routes and researched regional service descriptions.
- Consolidated the root sitemap with residential public routes and removed competing/unreachable sitemap handlers. Invalid percent-encoded URLs return 400 instead of crashing the server.
- Added locked npm dependencies and a root install/typecheck/build/test workflow; CI validates main.
- Rejected malformed contact values before scoring/persistence. Residential submissions receive their division from the residential server.
- Failed durable saves return an error instead of successful submission. Follow-up event failure after a durable residential save does not reject the saved lead. Persistence requests have a bounded timeout.
- Protected commercial logo mutation with verified owner authentication.
- Smoke tests use isolated local data and no production Supabase credentials; cover anonymous lead-list denial, malformed submissions and missing-storage failures alongside route/image checks.
- Preserved explicit production cutover through a default-off Cloud Build deploy substitution.

## Validation and limitations

Both app typechecks and builds pass. Booking tests: 14 passed. Combined smoke checks cover public routes, APIs, metadata/sitemaps, all detected bundle image references and the intake failure/access cases. Production container build and runtime checks also pass for both app health endpoints, deep links, the root sitemap and anonymous lead API denial. CI now includes those container checks. Large frontend bundle warnings remain.

These are local checks. They do not prove hosted Supabase configuration, real mobile saved-profile autofill, actual lead conversion, real calendar access, email delivery or production availability. No real leads, customer records, provider messages, production migrations, DNS or deployment were changed.

The existing owner-controlled website-to-Operations import remains manual. Automatic transaction-safe CRM ingestion, follow-up ownership/SLA automation, production funnel analytics and live calendar booking still need implementation and hosted verification. Real calendar/operator bindings and server credentials are not configured in this execution environment. Preserve `runtimeEnabled=false` until that work is complete.
