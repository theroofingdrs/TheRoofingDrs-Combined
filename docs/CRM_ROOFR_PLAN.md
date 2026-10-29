# Roof Doctors CRM and Instant Estimate Plan

## Product direction

Build a shared CRM and operational backend for The Roof Doctors residential division and Commercial Roof Doctors commercial division. The companies retain separate branding, websites, offerings, lead sources, pipelines, and permission rules. They must not be collapsed into one undifferentiated workflow. Shared people, organizations, properties, documents, and service history can be linked where authorized.

The CRM is a first class part of the combined Roof Doctors platform, not a disconnected spreadsheet or a demo screen.

Roofr integration is explicitly on hold. Do not add Roofr API calls, credentials, measurement requests, or other Roofr dependencies as part of the current work. The website estimate tool should work from information the property owner enters.

## Core lifecycle

Lead → Contact → Appointment → Inspection → Photos and Documents → Scope → Estimate → Insurance Claim when applicable → Sale → Production → Completion → Warranty → Maintenance → Reviews and Referrals.

Keep a permanent history for each property and roof, including related owners, organizations, contacts, projects, inspections, estimates, claims, communications, documents, warranties, and maintenance events.

## CRM modules

* People and contacts, including multiple roles and relationships.
* Organizations and accounts, including property owners, property managers, general contractors, HOAs, churches, schools, multifamily operators, retailers, offices, and other commercial clients.
* Properties, buildings, roof assets, roof sections, and ownership or management relationships.
* Leads and opportunities with source attribution, assignment, next action, reminders, and division specific pipelines.
* Appointments, calendars, inspections, condition assessments, photos, documents, and field notes.
* Estimates and proposals with line items, alternates, scope, exclusions, terms, and version history.
* Residential insurance claim tracking where applicable.
* Contracts, projects, scheduling, production, crews, subcontractors, materials, completion, punch lists, and closeout.
* Warranties, maintenance agreements, recurring service, roof history, reviews, and referrals.
* Tasks, calls, emails, notes, activity timeline, notifications, and audit history.
* Dashboards and reporting for leads, pipeline, conversion, estimate value, sold work, production, revenue, service agreements, and team activity.
* Role based access for owner or administrator, manager, sales, estimator, inspector, project manager, production, office or CSR, accounting, marketing, field staff, subcontractor, and read only users.

## Division boundaries

The Roof Doctors residential workflow and Commercial Roof Doctors commercial workflow remain separate where their business processes differ. Commercial workflow includes account or company → contacts → properties → buildings → roof assets → leads and opportunities → inspections and condition assessments → proposals and estimates → contracts and projects → production → maintenance and warranties.

Use division aware permissions, branding, forms, documents, pipelines, dashboards, and reports. Shared records must have explicit relationships and access controls.

## Immediate website estimate experience

The property owner must provide their personal and property contact information before receiving the instant estimate. Make these fields required: full name, property address, phone number, and email address. Validate the fields and explain why the information is requested. Do not require insurance or loss information to receive a non insurance estimate.

The form should then collect the roof details needed for the preliminary range:

* Approximate roof size in square feet or roofing squares.
* Roof complexity, using simple choices such as simple, moderate, or complex.
* Roof pitch if known, with an option for unknown.
* Desired roofing material, using the material choices actually offered by the relevant division.

Include an optional insurance and damage section with dropdowns and fields:

* Reason for replacement or repair: storm or hail damage, wind damage, water leak, other damage, age or normal wear, planned upgrade, or not sure.
* Date of loss, optional, when a specific loss date is known.
* Insurance company, optional.
* Policy number, optional.
* Claim number, optional.
* Adjuster name, optional.
* Adjuster phone number, optional.
* Additional notes, optional.

Keep date of loss, insurer, and claim number optional. Do not assume a claim exists or block estimates when those fields are blank. Show insurance related fields as relevant to the selected reason, without hiding the general contact and roof details. Include a preferred contact method if supported.

When the required inputs are provided, show a preliminary price range immediately on the page. The estimate must be calculated from company approved, configurable pricing rules and the user's inputs, not a hard coded invented price. The rules should account for material, size, complexity, pitch when known, and any configured minimums or location adjustments. Keep residential and commercial pricing separate. If a required pricing rule is not configured or the inputs are insufficient, do not invent a range; show a clear request for follow up instead.

Explain plainly that the result is an initial budgetary range based on customer supplied information, not an inspection, guaranteed quote, or formal proposal. The range can change after measurements, site inspection, decking or substrate review, code requirements, tear off details, access conditions, and final scope are verified.

Immediately after displaying the range, offer clear next actions:
* Request an appointment using a short form that carries the entered property and roof details into the lead record.
* Call now using the appropriate division phone number.
* Text now using a correctly configured SMS link and appropriate division number. Do not show a text action unless that number is confirmed capable of receiving messages.

Create a CRM lead and estimate request from a submitted contact or appointment request, preserve the required name, property address, phone, and email, all roof inputs, selected reason for work, optional date of loss, insurer, policy number, claim number, adjuster name, adjuster phone number, notes, calculated range, division, and lead source, and provide a confirmation to the customer. Restrict access to personal and insurance claim details according to role permissions. Protect personal information and validate all submitted fields. Include a server side rate limit and spam protection appropriate to the current stack.

## Future Roofr integration

Roofr satellite measurement integration is deferred until separately approved. Do not make the current estimate form dependent on Roofr availability. If Roofr is pursued later, verify account access and official API capabilities first, then design a provider adapter that associates real returned measurements and report provenance with the customer, property, roof, project, and estimate. Never fabricate measurements, endpoints, report links, pricing, or integration status.

## Data and deployment requirements

* Move production business records from local JSON files to durable database storage before production deployment.
* Plan data migration for both existing applications and verify record counts and relationships before cutover.
* Use authenticated server side APIs, role checks, input validation, audit trails, backups, and migration rollback procedures.
* Keep secrets out of source control and logs.
* Test both divisions independently and test authorized cross division links.
* Test lead capture, estimate calculations, missing or invalid inputs, appointment requests, call and text actions, admin access, mobile screens, deep links, notifications, and data persistence across restarts.
* Do not change live DNS or deploy production writes until staging validation and a rollback plan are complete.

## Implementation order

1. Inventory existing CRM features and data models in both applications. Preserve working functionality and identify overlap before changing schemas.
2. Choose and implement durable shared data infrastructure with explicit division boundaries, migrations, and backups.
3. Build the CRM data model and server side APIs around the lifecycle above, mapping existing data rather than discarding it.
4. Build authenticated CRM screens, role permissions, pipeline views, property and roof history, tasks, and reporting.
5. Inspect the existing website forms and implement the instant estimate experience using configurable, approved pricing rules and the property owner's inputs. Keep Roofr out of scope.
6. Connect appointment and contact submissions to CRM lead records, preserving the estimate inputs, range, division, and lead source.
7. Run end to end staging tests before production deployment.

## Non negotiable safeguards

Do not replace existing data stores with an unverified quick workaround. Do not merge the two division workflows into one generic pipeline. Do not expose customer data or secrets. Do not show fabricated estimates or imply that a preliminary range is a guaranteed quote. Do not deploy or change DNS without explicit approval.
