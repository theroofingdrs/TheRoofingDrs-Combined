# TRDCRD Photo & Video Placement Audit

Review branch: `feature/photo-video-placement-audit`
Source branch reviewed: `main`
Source library: `image-library/incoming/`

## Repository audit

- Incoming folder currently contains 163 files: 152 still images, 10 MP4 videos, and one README.
- `image-library/website-image-map.json` currently maps 71 of the 152 incoming still images to website-ready asset paths.
- 81 incoming still images are not represented in that map.
- Website-ready image copies already exist in both brand libraries:
  - Residential: `source-apps/trd/public/assets/images/library/`
  - Commercial: `source-apps/crd/public/assets/images/library/`
- The original incoming files should remain untouched. Continue using descriptive web-ready copies and keep the source-to-destination map current.

## Current page integration

### Residential / The Roof Doctors

- `PublicWebsiteView.tsx` uses three mapped library images in its homepage featured-photo cards:
  - `aerial-residential-roof-project.jpg`
  - `residential-roof-project-detail.jpg`
  - `residential-roof-installation-01.jpg`
- Its fourth card uses `/assets/images/trd-residential-home-exterior.jpg`, outside the mapped library.
- `GalleryPage.tsx` still uses legacy paths such as `new_roof_install.jpg`, `metal_roof_system.jpg`, `wind_damage_shingles.jpg`, and `roof_tear_off.jpg` rather than the newer mapped library.
- The gallery currently presents specific project locations, storm measurements, material specifications, and project narratives. Those claims must be checked against actual job records before they are represented as verified customer projects. Image filenames alone do not establish a customer's identity, project location, system installed, or outcome.

### Commercial / Commercial Roof Doctors

- `HomePage.tsx` already references multiple assets from `/assets/images/library/`, including industrial, drainage, maintenance, single-ply, replacement, and property-roofing images.
- `siteSystemsContent.ts` includes a modified-bitumen project image reference.
- Commercial homepage image coverage is materially further along than the residential gallery integration.

## Visual review notes for the newer incoming batch

A visual sample was inspected directly from GitHub, including:
`IMG_4730.jpeg`, `IMG_4731.jpeg`, `IMG_4732.jpeg`, `IMG_4733.jpeg`, `IMG_4734.jpeg`, `IMG_4735.jpeg`, `IMG_4736.jpeg`, `IMG_4737.jpeg`, `IMG_4738.jpeg`, `IMG_4739.jpeg`, `IMG_4740.jpeg`, `IMG_4741.jpeg`, `IMG_4744.jpeg`, `IMG_4745.jpeg`, `IMG_4746.jpeg`, `IMG_4747.jpeg`, `IMG_4748.jpeg`, `IMG_4751.jpeg`, `IMG_4753.jpeg`, `IMG_4758.jpeg`, `IMG_4760.jpeg`, and `IMG_4776.jpeg`.

The sample depicts:
- Commercial low-slope roof inspections and membrane work.
- Large industrial and warehouse roof replacement/restoration.
- Church and institutional roof work, including metal and steep-slope roofs.
- Multi-family/apartment roof work.
- Agricultural/ranch/barn roofing.

**Important authenticity hold:** several of the newer images have a strongly synthetic or AI-rendered visual appearance. Until the owner confirms which are genuine photographs of company work, do not use these as customer-project evidence, before/after proof, or claims of completed jobs. If approved for use, treat them only as clearly illustrative service imagery and do not attach invented customer names, cities, dates, specifications, or results.

Older incoming images also need individual review: the library contains a mixture of ordinary job photos, collages, screenshots, promotional graphics, branded images, and possible generated visuals. The existing allocation document's exclusions remain in force.

## Video placement plan

The following placements are based on the filenames and should be confirmed by previewing each video before publication.

| Incoming video | Recommended destination | Placement purpose |
|---|---|---|
| `crd-brand-film-28s.mp4` | CRD homepage hero / brand introduction | Short commercial brand film; use with poster image, captions, muted autoplay only if appropriate, and a play control |
| `crd-campus-multi-building-brand-video.mp4` | CRD homepage and institutional / multi-building content | Demonstrate multi-building commercial roofing capability |
| `crd-epdm-roof-replacement-timelapse-no-roof-lift-v2.mp4` | CRD EPDM roofing and roof replacement pages | EPDM replacement process / timelapse |
| `crd-horse-ranch-barn-roof-replacement-all-red.mp4` | CRD agricultural / equestrian industry page | Barn and ranch roof replacement |
| `crd-manufacturing-plant-tpo-replacement-no-roof-lift.mp4` | CRD TPO roofing and industrial industry pages | Manufacturing facility TPO replacement |
| `crd-metal-roof-restoration-video4.mp4` | CRD metal roofing / restoration pages | Metal roof restoration process |
| `crd-metal-warehouse-restoration-timelapse.mp4` | CRD industrial / warehouse restoration pages | Large warehouse restoration timelapse |
| `crd-poultry-facility-roof-restoration-no-roof-lift.mp4` | CRD agricultural / poultry facility content | Poultry-facility roof restoration |
| `crd-refrigerated-warehouse-restoration-no-roof-lift.mp4` | CRD industrial / refrigerated warehouse content | Refrigerated warehouse restoration |
| `1a312aceae4673243e97522af357b2de.mp4` | HOLD — identify content first | Filename gives no reliable subject or placement |

## Implementation requirements

1. Preview each video and record duration, dimensions, audio, and a representative poster frame before publishing.
2. Keep large original videos in the source library. Create web-optimized delivery copies (appropriate MP4/H.264 or supported modern format), poster images, and captions/transcripts where speech is present.
3. Do not autoplay audio. Respect reduced-motion preferences, provide controls, and avoid loading every large video on initial page load.
4. Place videos only on matching service/industry pages; do not repeat the same video across every page.
5. Use responsive layouts, lazy loading, poster images, and explicit dimensions to avoid layout shift.
6. Preserve the originals and update `website-image-map.json` (or a companion video map) with exact source paths and web-ready destination paths.
7. Do not publish identifiable customer/property imagery or imply an endorsement/customer relationship without owner approval.
8. Do not deploy as part of this work. Build and review changes in a feature branch and open a PR.

## Recommended next implementation pass

1. Finish the authenticity review of all 81 unmapped images and classify each as: approved genuine project photo, approved illustrative image, excluded, or needs owner confirmation.
2. Update the residential homepage and gallery to use approved web-ready assets, replacing stale references only after confirming the target image exists and visually matches the page.
3. Audit all gallery captions and remove unsupported customer/project specifics unless backed by confirmed records.
4. Add the approved commercial videos to their matching pages with optimized posters and responsive playback.
5. Complete the video mapping and run route, asset-existence, build, and mobile layout checks.
6. Keep original uploads intact and leave production deployment to a separately approved release.

## Current status

This audit documents what is present and what remains. It does not claim that the unreviewed images or videos have been visually approved, optimized, integrated, or deployed.
