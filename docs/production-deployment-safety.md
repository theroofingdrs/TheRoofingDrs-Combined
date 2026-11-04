# Production candidate deployment, verification and rollback

These are operator instructions, not automatic promotion. This change does not run
Cloud Build, deploy a revision, change traffic, or change a trigger.

## Source and build controls

Use the existing `deploy-roof-doctors-production` trigger only after checking its
actual configuration in project `trdcrd`: the intended GitHub repository, branch
filter `^main$` (not inverted), repository `cloudbuild.yaml`, intended build service
account, and required approvals. Trigger configuration/IAM cannot be verified from
this repository. Record the resolved full source SHA and ensure it contains
`ca729b2f927907516b10d3c0f091b91d8d859578`. Main inspected for this change was
`aed6321339f633d1dc3cd73319488de1f613bab0`; recheck before a release.

The existing substitutions remain unchanged:

- `_APPROVE_PRODUCTION_DEPLOY`: default `false`; explicitly supply `true` for an
  authorized candidate deployment. This gate does **not** itself enforce main.
- `_IMAGE_URI`: existing Artifact Registry image destination. The default
  `:integration` tag is mutable and is not evidence of source provenance.
- `_VITE_SUPABASE_URL` and `_VITE_SUPABASE_PUBLISHABLE_KEY`: existing public browser
  build arguments. Never replace the publishable key with a service-role key.

Docker still builds both applications using locked dependencies. After a successful
push, the local Docker image's registry digest reference is saved in the build's
shared `/workspace/combined-image-reference.txt`. Deployment validates its repository
and SHA-256 syntax, then uses that immutable reference with `--no-traffic`. It does
not resolve the remote mutable tag again. Missing/invalid digests fail closed.
Cloud Build's `images` field still publishes the existing tag; use the digest
passed to `gcloud run deploy` in the build log as the candidate's identity, not a
later tag lookup. Match it to the revision below and the build's resolved source.

The deploy command retains the existing service/project/region and does not supply
environment, secrets, IAM, domain, runtime-account, or other service-setting flags.
`--no-traffic` withholds serving traffic from the new revision; when a service
previously routes to LATEST, Cloud Run pins that traffic to the previous serving
revision. Always compare actual before/after traffic, including tags and splits.
A ready revision is not proof that either application works.

## Before an authorized build: record the serving state

Run these read-only commands from an authenticated operator environment. Keep
outputs containing environment or secret-reference details private; do not export
full service specifications into public logs or commits.

```sh
gcloud run services describe roof-doctors-combined \
  --project=trdcrd --region=us-east1 \
  --format='yaml(status.latestCreatedRevisionName,status.latestReadyRevisionName,status.traffic,status.url)'

gcloud run revisions list --service=roof-doctors-combined \
  --project=trdcrd --region=us-east1 \
  --format='table(metadata.name,metadata.creationTimestamp,status.conditions[0].status,status.imageDigest)'
```

Record the exact previous known-good revision name and all traffic percentages.
Do not infer the known-good revision from `latestCreatedRevisionName`, which may
refer to an unverified candidate. Confirm the trigger's build account can upload to
the existing Artifact Registry repository, deploy to the existing Cloud Run
service, act as its runtime account, and write build logs. Confirm the runtime
account retains access to its existing Secret Manager bindings. This change adds
no secrets, permissions or runtime variables.

## Inspect the candidate before promotion

After an independently authorized candidate build completes, record its build ID,
source SHA, immutable digest and timestamp. Identify the revision created by that
build, not merely whichever revision was created most recently concurrently.

```sh
CANDIDATE_REVISION='replace-with-exact-candidate-revision'

gcloud run revisions describe "$CANDIDATE_REVISION" \
  --project=trdcrd --region=us-east1 \
  --format='yaml(metadata.name,metadata.creationTimestamp,status.conditions,status.imageDigest,spec.containers[0].image)'

gcloud logging read \
  "resource.type=cloud_run_revision AND resource.labels.service_name=roof-doctors-combined AND resource.labels.revision_name=$CANDIDATE_REVISION" \
  --project=trdcrd --freshness=1h --limit=50
```

Check Ready=True and errors in private logs; compare the image digest with the
build's recorded deployment reference. Inspect current traffic again with the
service-describe command above: the candidate must have no serving percentage.
Compare existing environment variables/secret bindings in Cloud Console without
copying their values, as well as runtime identity, domain mappings and other
service settings.

For HTTP/browser testing before promotion, an operator may separately authorize a
temporary revision tag. The following changes only the named tag, not requested
traffic percentages; inspect the result and preserve existing tags:

```sh
gcloud run services update-traffic roof-doctors-combined \
  --project=trdcrd --region=us-east1 \
  --update-tags="seo-candidate=$CANDIDATE_REVISION"

gcloud run services describe roof-doctors-combined \
  --project=trdcrd --region=us-east1 --format='yaml(status.traffic)'
```

Use the returned `seo-candidate` URL (do not guess it). Preserve existing access
controls; authenticated services require the existing authorized test identity.
Check `/residential/api/health` and `/commercial/api/health` for HTTP 200/healthy
responses. Test both homepages, services, contact, estimate request and its aliases,
blog indexes and published articles. Inspect initial title, description, unique
canonical, OG/Twitter tags and appropriate schema; verify Repair → Contact
navigation updates Twitter tags, assets load, and no white screens/JS errors occur.
Unknown commercial blog slugs should return 404 with a healthy public feed; a feed
outage can intentionally produce 503 for unresolved CMS slugs. Tag-host canonical
URLs should still point to the intended production domain. Candidate checks are
separate from post-promotion checks on `https://theroofingdrs.com/`.

## Explicit promotion and rollback (separate production actions)

Only execute after candidate verification and operator production authorization.
Use exact revision names, never `LATEST` or a mutable image tag. Promotion and
rollback below intentionally replace all percentage allocations with 100% to the
specified revision; if the previous state was a deliberate split, restore the
recorded split instead of using the single-revision rollback example.

```sh
# Promote the verified candidate.
gcloud run services update-traffic roof-doctors-combined \
  --project=trdcrd --region=us-east1 \
  --to-revisions="$CANDIDATE_REVISION=100"

# Roll back to the exact previously recorded known-good revision.
PREVIOUS_REVISION='replace-with-recorded-known-good-revision'
gcloud run services update-traffic roof-doctors-combined \
  --project=trdcrd --region=us-east1 \
  --to-revisions="$PREVIOUS_REVISION=100"

# Confirm actual allocation after either operation.
gcloud run services describe roof-doctors-combined \
  --project=trdcrd --region=us-east1 --format='yaml(status.traffic)'
```

Verify both production health routes and the live page/browser checks again after
promotion or rollback. Traffic rollback does not undo data changes or changes to
external integrations. Keep the known-good revision/image available. If a temporary
tag was added, remove only that tag after testing with a separately authorized
`gcloud run services update-traffic roof-doctors-combined --project=trdcrd
--region=us-east1 --remove-tags=seo-candidate` command.

## Google Maps / Places investigation

The inspected main source has no Google Places SDK loader, address autocomplete
component, Maps API key build argument or Maps runtime binding. Public forms use
HTML `autoComplete` attributes (browser-saved address autofill), which are distinct
from Google address suggestions. Maps links elsewhere do not establish Places
functionality. Google calendar auth in `booking/google-auth.ts` is unrelated.

Repository history contains a separate implementation, not an implementation
removed from main: commit `e61683a8d105935c39107249d4ea73da8d8f9881` on
`feature/public-address-autocomplete` adds `shared/address/places.ts`, both brands'
`AddressAutocomplete.tsx` components, Places `importLibrary('places')`/suggestion
calls, and `VITE_GOOGLE_MAPS_API_KEY` with an optional
`_VITE_GOOGLE_MAPS_API_KEY` Cloud Build substitution. Later feature-branch commits
include `dd74540` and `7539b5c`; the implementation is not an ancestor of the
inspected main. None of it is included or changed by this deployment-safety PR.

If live production currently offers Google suggestions, manually trace that
revision's image to its build/source and any external script injection. Inspect
key *references* and API/referrer restrictions privately without exposing values.
Retaining Cloud Run variables will not add a missing frontend implementation or
embed a Vite build-time key. Maps/Places continuity cannot be certified from this
main and may block a release that must preserve those suggestions. Do not add a
key, transplant a feature branch, or change Maps configuration during this task.

## Local validation

`npm test` includes `test:deployment`: local stub executables check the actual YAML
shell blocks, approval denial, successful digest handoff, malformed/missing digest
rejection, push failure and the exact no-traffic deploy arguments. No real gcloud,
Docker push, Cloud Build or traffic command is executed by that test. YAML syntax
can additionally be checked using a YAML parser. Local validation does not verify
trigger/IAM settings, real registry behavior, rollout health or production behavior.
