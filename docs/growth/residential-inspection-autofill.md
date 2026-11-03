# Residential inspection form autofill

Tracker: https://github.com/theroofingdrs/TheRoofingDrs-Combined/issues/30 (B1).
Base: release-candidate/combined-site at 31885540cfae96557331a87e38ccbe033a8dd392.
Owner: Crystal. Dedicated branch: growth/residential-inspection-autofill.

## Customer outcome and scope

The residential inspection modal now supplies standard browser autocomplete hints for name, phone, email, street address, city, state and ZIP. ZIP/phone/email have explicit mobile keyboard hints. Labels are associated with their inputs, improving touch and assistive navigation. Manual entry, validation, the controlled form values and existing submission payload remain unchanged.

This is native browser assistance, not a geocoding/suggestion service. Saved-profile suggestions depend on the browser, user settings and profile; real saved-profile autofill on iOS/Android has not been verified. No provider keys, dependencies, endpoints, booking routes or persistence changes were introduced. No lead-delivery or CRM durability claim follows from this UI change.

## Coordination

Remote refs/open PRs and branch diffs were inspected before edits. No competing branch/draft modified InspectionRequestModal.tsx. The original website security drafts, persistence branch, CRD forms, commercial content/SEO/image work and Operations branches remain untouched. Shared EstimateRequestView.tsx, CRD constants, routing, API/auth and migrations are excluded.

The approved 250-mile About correction already exists on main/image-review; it was not duplicated. The existing service-page fix PR #25 and video allocation PR #26 retain ownership.

## Validation

- `npm --prefix source-apps/trd run build`: passed.
- `npm --prefix source-apps/crd run build`: passed.
- `SMOKE_TEST_PORT=8137 node scripts/smoke-test.mjs`: passed all existing combined routing, asset, metadata, API health and deep-link checks, against local servers only. Initial attempt lacked local-network sandbox permission; rerun with local access passed.
- Ad-hoc Python Playwright/Chromium walkthrough at 390x844: passed all seven label/autocomplete associations, manual address/contact entry, simulated HTTP 500 retaining inputs, and successful retry with identical submitted fields. Both lead POSTs were intercepted in memory; no lead was sent to a real endpoint/provider. External browser requests were blocked. The check used a fresh blank browser profile, not a saved-profile autofill simulation.
- `npm --prefix source-apps/trd run lint`: blocked by pre-existing `src/components/common/BrandLogo.tsx(27,29): TS2339 Property 'env' does not exist on type 'ImportMeta'`. A temporary archive of the untouched RC base reproduced the identical error. Shared branding/type definitions were not changed to bypass it.
- `git diff --check`: passed.

Both builds retain existing Vite >500 kB bundle warnings. The draft PR is an independent UI review package, not release approval. Baseline typecheck remediation needs its own coordinated owner; live mobile saved-profile verification and integration with the reviewed intake/security stack remain acceptance gates. No merge, deployment, production configuration/database operation or customer-data access occurred.
