# Roof Doctors CRM and Roofr Integration Plan

## Product direction

Build a shared CRM and operational backend for The Roof Doctors residential division and Commercial Roof Doctors commercial division. The companies retain separate branding, websites, offerings, lead sources, pipelines, and permission rules. They must not be collapsed into one undifferentiated workflow. Shared people, organizations, properties, documents, and service history can be linked where authorized.

The CRM is a first class part of the combined Roof Doctors platform, not a disconnected spreadsheet or a demo screen.

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

## Roofr satellite measurement and estimate integration

Roofr is the first measurement provider integration. The public website should allow a visitor to request a roof estimate using a property address, then show an estimate only when the required measurement and pricing inputs have actually been returned and configured. If Roofr measurements or pricing are unavailable, explain that an inspection or follow up is required instead of inventing a measurement or price.

Required flow:

Property → Project → Measurement Request → Roofr → Measurement Result → Normalized Roof Model → Estimate or Proposal → CRM record.

Associate the Roofr request and result with the customer, property, roof, project, and estimate. Store provider provenance, request status, timestamps, returned report identifiers, import time, measurement version, and any source report link supplied by the provider.

Normalize only fields actually returned by Roofr, such as roof area, pitches, planes, edges, and waste, when present. Preserve the original provider response or report reference securely where permitted. Support measurement request states, errors, retries, and version history.

Use a provider adapter so future measurement providers can be added without hard coding Roofr assumptions throughout the CRM. Keep API credentials on the server. Never expose provider secrets in browser code. Do not fabricate endpoints, API capabilities, measurements, report links, pricing, or connected status. Verify Roofr API access and account entitlements before implementing live calls.

The estimate engine must use company approved pricing rules, configurable materials, labor, waste, pitch or complexity factors, division, location, and other explicitly configured inputs. Clearly distinguish an automated budgetary estimate from a reviewed formal proposal. Do not present a binding price until the business rules and required review process are configured.

## Data and deployment requirements

* Move production business records from local JSON files to durable database storage before production deployment.
* Plan data migration for both existing applications and verify record counts and relationships before cutover.
* Use authenticated server side APIs, role checks, input validation, audit trails, backups, and migration rollback procedures.
* Keep secrets out of source control and logs.
* Test both divisions independently and test authorized cross division links.
* Test lead capture, estimates, Roofr failures, admin access, mobile screens, deep links, notifications, and data persistence across restarts.
* Do not change live DNS or deploy production writes until staging validation and a rollback plan are complete.

## Implementation order

1. Inventory existing CRM features and data models in both applications. Preserve working functionality and identify overlap before changing schemas.
2. Choose and implement durable shared data infrastructure with explicit division boundaries, migrations, and backups.
3. Build the CRM data model and server side APIs around the lifecycle above, mapping existing data rather than discarding it.
4. Build authenticated CRM screens, role permissions, pipeline views, property and roof history, tasks, and reporting.
5. Verify Roofr API credentials, official API capabilities, account permissions, and report retrieval behavior. Implement the provider adapter only against verified documentation.
6. Connect website estimate requests to measurement requests and CRM records. Add approved pricing rules and clearly label estimate confidence and review status.
7. Run end to end staging tests before production deployment.

## Non negotiable safeguards

Do not replace existing data stores with an unverified quick workaround. Do not merge the two division workflows into one generic pipeline. Do not expose customer data or Roofr credentials. Do not show fabricated real time measurements or estimates. Do not deploy or change DNS without explicit approval.
