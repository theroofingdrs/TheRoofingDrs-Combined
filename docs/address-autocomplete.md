# Public property address autocomplete

This change covers seven existing address inputs without changing their required fields,
branding, intake endpoints, photo handling, notifications, analytics or database schema:

| Application | Form | Input ID |
| --- | --- | --- |
| Residential | Contact | `residential-contact-address` |
| Residential | Estimate request | `residential-estimate-address` |
| Residential | Inspection request modal | `inspection-address` |
| Commercial | Contact | `commercial-contact-propertyAddress` |
| Commercial | Cost calculator / assessment request | `commercial-calculator-address` |
| Commercial | Inspection request modal | `commercial-inspection-address` |
| Commercial | Emergency request modal | `emergency-address-input` |

## Optional authorized provider

No Maps integration or authorized public Maps key was present in the website sources or
available environment. The feature reuses an existing `google.maps.importLibrary` SDK
when one is present, otherwise uses optional **public, HTTP-referrer-restricted**
`VITE_GOOGLE_MAPS_API_KEY`. It needs Maps JavaScript API and Places API (New) enabled
in the authorized project, with billing and appropriate site restrictions. Never use
a server API key, service-account credential or unrestricted key in this binding.

The Docker build exposes this optional argument, and the Cloud Build source template
defaults its optional substitution to empty. No deployed configuration, key, billing,
Google project, production data or service was changed. Live Google authorization,
quotas and allowed production referrers remain unverified; without authorization the
forms retain manual entry. An empty binding makes no Google SDK or attribution-asset
request. This PR does not enable or deploy the feature in production.

Suggestions use Places Autocomplete (New), US region filtering, one SDK import per
page, a 300ms debounce, four-character minimum and per-interaction session tokens.
Stale results and identical consecutive input events do not trigger duplicate lookups.
Only a selected prediction fetches address details. Suggestion labels use the provider's
description: Google can omit ZIP codes from those labels. ZIP and other structured
components are populated on selection when supplied; details are not requested for
every suggestion just to add ZIP codes. Google attribution accompanies the list.

Street, city, state and ZIP are extracted from typed address components, never guessed
from prose or a county. Non-US and locations without a street number/route leave the
typed value intact. Missing components remain blank. Residential component inputs stay
editable; commercial forms retain their existing combined address input and submit the
canonical components in the existing `propertyRecord` intake contract. Editing a
selected address clears stale structured metadata. Original manual form validation
still applies; provider errors never disable inputs or submission.

The listbox is portalled to the document body or the modal's outer dialog layer, outside
clipped form cards. It is positioned to the visual viewport and flips above the input
when space is limited. Combobox/listbox semantics, live announcements, arrow keys,
Enter, Escape, Tab and touch selection are supported without changing the input's
visual classes. Suggestions use text nodes, not provider HTML.

## Regression checks

```
npm run install:apps
npm test
CHROME_BIN=/path/to/chromium npm run test:address:browser
CHROME_BIN=/path/to/chromium npm run test:mobile
```

`test:address` covers parsing, minimal detail requests, token propagation, SDK reuse and
missing/failed script fallback. `test:address:browser` renders the built applications
through the real combined server, intercepts external requests and supplies synthetic
Places/intake responses. It checks all seven forms at 320, 360, 375, 390 and 430px,
including actual hit testing of portalled options, keyboard/touch selection, accessible
labels/status, provider failures, invalid/incomplete components, manual entry, and
structured/manual submission payloads with attribution and idempotency headers.
It also checks debounce, duplicate input suppression, IME, Escape/Tab and stale results.
No live API charges, customer records or production writes are involved.
