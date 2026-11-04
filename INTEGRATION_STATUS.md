# Combined Roof Doctors integration status

## Current architecture

- The root landing page is served from `index.html`.
- The residential application is intended to live at `/residential/`.
- The commercial application is intended to live at `/commercial/`.
- `server.mjs` supervises both existing Express servers and routes requests to them.
- The original residential and commercial source trees remain separate.

## Important safety gates

This is an integration scaffold, not an approval to deploy.

1. GitHub Actions builds both applications and runs smoke checks for the landing page, nested app routes, residential health API, commercial sitemap, logos, and roofing photos.
2. Manual staging tests are still required for form submissions, admin views, authentication, mobile navigation, and browser refreshes on all nested routes.
3. The original applications store data in local JSON files. Cloud Run's container filesystem is not a durable database. Do not deploy this container for production writes until both data stores have been migrated to durable storage and the migration has been verified.
4. Confirm all required production secrets and integrations are configured without committing secret values.
5. Do not change DNS or the existing live websites until staging tests pass and a rollback plan is ready.

The original local database files are intentionally excluded from Git.
