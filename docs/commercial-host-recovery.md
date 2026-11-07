# Commercial hostname recovery proposal (no infrastructure changes performed)

The canonical commercial site is `https://theroofingdrs.com/commercial/`.
Vite's commercial base, client router, initial metadata and client canonical tags
all use that prefix. The optional `commercial.theroofingdrs.com` hostname is an
alias, not a separate commercial application or a replacement canonical origin.

## DNS evidence and scope

Delegated servers are `ns51.domaincontrol.com` and `ns52.domaincontrol.com`.
Remote nonrecursive queries against both returned `NXDOMAIN`, flags `qr aa`, zero
answers for A, AAAA and CNAME. The authority SOA was:

```text
theroofingdrs.com. 600 IN SOA ns51.domaincontrol.com. dns.jomax.net. 2026103100 28800 7200 604800 600
```

Authoritative query evidence: https://agent.tinyfish.ai/runs/62747c8c-9c5b-4866-a68d-5b7aeb682bfe .
Google Public DNS independently returned Status3 and the same zone SOA. Direct
UDP53 queries from the local executor timed out; those timeouts were not treated
as DNS answers. An earlier `ERR_EMPTY_RESPONSE` was only a browser/network symptom,
not evidence for NXDOMAIN. Repeat authoritative lookups immediately before any
future approved DNS change. Root CAA lookup returned NOERROR/no CAA answers through
a recursive resolver; this does not establish certificate readiness.

## Source-only redirect

Simply mapping the alias to the combined service would serve its shared landing
page at `/`. `server.mjs` now handles only the exact commercial Host (case-insensitive,
optional port), before route/static dispatch:

| Alias request | Proposed response Location |
|---|---|
| `/` | `https://theroofingdrs.com/commercial/` |
| `/contact?utm_campaign=example` | `https://theroofingdrs.com/commercial/contact?utm_campaign=example` |
| `/commercial` | `https://theroofingdrs.com/commercial/` |
| `/commercial/contact` | `https://theroofingdrs.com/commercial/contact` |
| unknown path | Same path beneath `/commercial/`, allowing the canonical app to return its real404 |

GET/HEAD return308, with a five-minute cache lifetime. The origin is fixed in code,
not constructed from untrusted headers/query values. Encoded paths remain encoded;
query strings are preserved. There is no duplicate commercial prefix or redirect
loop. POST/PUT/PATCH/DELETE return405 with `Allow: GET, HEAD`: the alias is not a
write endpoint and does not replay lead submissions cross-origin. Do not configure
forms or webhooks to post to this alias. The shared root, residential routes and
existing www redirect are unchanged.

Actual production-server HTTP tests set the Host using Node `http.request` rather
than relying on fetch Host overrides. They cover root/deep links, queries, existing
prefix, casing/port, HEAD, nonread methods, unrelated hosts and a scheme-relative
open-redirect attempt. The new test fails against unchanged main and passes with
the handler. No DNS, domain mapping, TLS or live-traffic success is implied.

## Exact proposed mapping/DNS design

Before approving infrastructure work, read the existing production front door:
Cloud Run mapping list, any external HTTPS load balancer's frontend/certificate,
URL map host/path rules and backend host rewrite. Do not assume that a working
Cloud Run service or an apex DNS IP identifies every routing component.

If the established front door is **direct Cloud Run domain mapping**, the proposed
additional mapping is:

```text
Project: trdcrd
Region: us-east1
Domain: commercial.theroofingdrs.com
Target service: roof-doctors-combined
```

The standard subdomain record for this design is:

```text
Name: commercial
Type: CNAME
Target: ghs.googlehosted.com.
Suggested initial TTL: 300 seconds (or the provider's minimum)
```

This is a proposed standard record, NOT a `resourceRecords` result for an alias
mapping that has not been created. Use the exact `status.resourceRecords` returned
by the approved mapping operation as the final authority. If it differs, stop and
reconcile before DNS changes. Do not copy apex A/AAAA records blindly, add A/AAAA
alongside a CNAME, point a CNAME at a URL/path, or assume a CNAME to the apex adds
an HTTPS hostname mapping. Existing ownership verification may cover the domain;
if Console requires a verification TXT, use only its exact issued name/value,
never an invented token. No new key, IAM change or service is needed by this code.

If an **existing external HTTPS load balancer is the actual front door**, preserve
that design. Extend its certificate/host rules only under separate approval and use
its actual frontend records; do not bypass it with the proposed direct-mapping
CNAME. Its redirect rules must preserve deep links/query strings and avoid adding
a second commercial prefix. No replacement load balancer is proposed or created.

## Recovery sequence — future authorized operator actions only

1. Record authoritative DNS, all existing mapping/LB/certificate settings and the
   known-good canonical service revision/traffic split. Confirm that retaining
   the commercial alias is intended. If not retained, use the existing canonical
   URL consistently; do not pretend the alias has been repaired.
2. Review this source PR separately from BuildKit PR50 and regression PRs51/52.
   After owner-approved integration, record the new full main SHA containing the
   required code. Do not reuse an older SHA expecting these changes to be present.
3. Build with the existing production public build arguments and BuildKit enabled;
   validate the immutable pushed digest and source provenance. Deploy a candidate
   using the existing approval gate and `--no-traffic`, only after separate release
   authorization. No deployment is part of this PR.
4. Before promotion, test both brands at an existing candidate-specific URL and
   verify the redirect with raw Host requests to a locally bound container or an
   approved path that preserves Host. Cloud Run's edge may reject an unmapped
   commercial Host before it reaches the container; do not misdiagnose that as an
   application redirect failure. The default production URL does not test a
   zero-traffic candidate. Keep canonicals on the apex `/commercial/`; end-to-end
   alias TLS/redirect verification occurs after its separately approved mapping.
5. After separate release approval, make the tested redirect implementation available
   on the production service. Do not map the alias to an old revision that serves
   the shared root landing or throws the historical footer error.
6. Under separate infrastructure approval, create only the additional alias mapping
   (or approved existing-LB host rule), then publish only its exact assigned record
   in the existing zone. Preserve apex/www/operations/MX/TXT records. Do not modify
   the current traffic split, IAM, secrets or other services as a DNS workaround.
7. Wait for authoritative servers and recursive resolvers to publish the new record,
   allowing the existing600-second negative cache to expire. Wait for managed
   certificate and mapping Ready status. HTTPS must succeed before an HTTP redirect
   can be relied on; DNS alone does not provide a certificate.
8. Verify the live alias root, `/contact`, query-bearing URL, `/commercial/contact`,
   HEAD and unknown paths. Require one redirect to the fixed HTTPS canonical URL,
   no repeated prefixes/loops, valid TLS and visible CRD content after following it.
   Verify the apex/shared TRD landing and residential routes remain unchanged.
9. Record source/build/digest/revision, mapping readiness, authoritative answers,
   TLS result and redirect chain. Run the release browser checks before declaring
   recovery complete.

Read-only checks (not executed against Google Cloud by this PR):

```sh
gcloud beta run domain-mappings describe --domain=commercial.theroofingdrs.com \
  --project=trdcrd --region=us-east1 \
  --format='yaml(metadata.name,spec.routeName,status.conditions,status.resourceRecords)'

dig @ns51.domaincontrol.com commercial.theroofingdrs.com A +norecurse
dig @ns52.domaincontrol.com commercial.theroofingdrs.com AAAA +norecurse
dig @ns51.domaincontrol.com commercial.theroofingdrs.com CNAME +norecurse

curl --head --max-redirs 0 https://commercial.theroofingdrs.com/
curl --head --max-redirs 0 'https://commercial.theroofingdrs.com/contact?utm_campaign=qa'
```

## Rollback and boundaries

For release promotion/rollback commands and candidate preconditions, use
[production deployment safety](production-deployment-safety.md). Never choose
LATEST or assume revision00170 is good for both brands. Restore the recorded exact
revision or deliberate split only after separate traffic authorization.

For hostname rollback, restore only the recorded pre-change commercial DNS state
(absence at this investigation) or prior approved record set. Remove a newly added
mapping/tag/rule only if confirmed created for this change and separately authorized.
Do not remove or change the apex/www mappings or existing canonical CRD URL.
Resolver/browser redirect caches may outlive rollback; record their TTLs.

No live DNS, mapping, certificate, trigger, traffic, IAM, database, secret,
production configuration, real submission, production deployment or merge was
performed while preparing this source change.
