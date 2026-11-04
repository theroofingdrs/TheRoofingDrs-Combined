/**
 * The Roof Doctors — Server-side Persistent Database Engine
 * Implements relational entity persistence, ID generation, validation,
 * audit logging hooks, and seed data for verified business rules & service areas.
 */

import fs from 'fs';
import path from 'path';
import type {
  Business,
  Division,
  Market,
  Territory,
  ServiceArea,
  Customer,
  Property,
  Roof,
  RoofRecord,
  RoofRecordEvent,
  Lead,
  LeadActivity,
  Project,
  Inspection,
  DamageObservation,
  Measurement,
  StormEvent,
  Appointment,
  Communication,
  Task,
  Document,
  Photo,
  FileRecord,
  Estimate,
  Proposal,
  Payment,
  Invoice,
  MaintenancePlan,
  MaintenanceEnrollment,
  Crew,
  Worker,
  Subcontractor,
  Material,
  Vendor,
  PurchaseOrder,
  ProjectCost,
  Review,
  FAQ,
  Resource,
  Service,
  RoofingSystem,
  ProblemType,
  Automation,
  AutomationExecution,
  Notification,
  AuditLog,
  Integration,
  IntegrationEvent,
  WebhookEvent,
  BackgroundJob,
  FeatureFlag,
  BusinessRule,
  SystemSetting,
  FieldCheckIn,
  RoofModel,
  User,
  PriceBook,
  ScopeTemplate,
  Sale,
} from '../../shared/types/index.ts';
import { getDefaultPriceBooks, getDefaultScopeTemplates } from './pricingSeeds.ts';
import { getDefaultVendors, getDefaultMaterials, getDefaultCrews } from './productionSeeds.ts';

const DATA_DIR = process.env.WEBSITE_DATA_DIR || path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'roof_doctors_db.json');

export interface DatabaseSchema {
  businesses: Business[];
  divisions: Division[];
  markets: Market[];
  territories: Territory[];
  serviceAreas: ServiceArea[];
  users: User[];
  customers: Customer[];
  properties: Property[];
  roofs: Roof[];
  roofRecords: RoofRecord[];
  roofRecordEvents: RoofRecordEvent[];
  leads: Lead[];
  leadActivities: LeadActivity[];
  projects: Project[];
  inspections: Inspection[];
  damageObservations: DamageObservation[];
  measurements: Measurement[];
  stormEvents: StormEvent[];
  appointments: Appointment[];
  communications: Communication[];
  tasks: Task[];
  documents: Document[];
  photos: Photo[];
  fileRecords: FileRecord[];
  estimates: Estimate[];
  proposals: Proposal[];
  payments: Payment[];
  invoices: Invoice[];
  maintenancePlans: MaintenancePlan[];
  maintenanceEnrollments: MaintenanceEnrollment[];
  crews: Crew[];
  workers: Worker[];
  subcontractors: Subcontractor[];
  materials: Material[];
  vendors: Vendor[];
  purchaseOrders: PurchaseOrder[];
  projectCosts: ProjectCost[];
  reviews: Review[];
  faqs: FAQ[];
  resources: Resource[];
  services: Service[];
  roofingSystems: RoofingSystem[];
  problemTypes: ProblemType[];
  automations: Automation[];
  automationExecutions: AutomationExecution[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  integrations: Integration[];
  integrationEvents: IntegrationEvent[];
  webhookEvents: WebhookEvent[];
  backgroundJobs: BackgroundJob[];
  featureFlags: FeatureFlag[];
  businessRules: BusinessRule[];
  systemSettings: SystemSetting[];
  fieldCheckIns: FieldCheckIn[];
  roofModels: RoofModel[];
  priceBooks: PriceBook[];
  scopeTemplates: ScopeTemplate[];
  sales: Sale[];
}

let dbInstance: DatabaseSchema | null = null;

function generateId(prefix: string): string {
  const rand = Math.random().toString(36).substring(2, 9);
  const time = Date.now().toString(36);
  return `${prefix}_${time}${rand}`;
}

function createLifetimeRoofingResource(now: string): Resource {
  return {
    id: 'res_lifetime_roofing_systems',
    title: 'Understanding Roofing Materials, Lifespan, and Long-Term Value',
    slug: 'understanding-roofing-materials-lifespan-and-value',
    summary: 'A practical comparison of asphalt shingles, impact-resistant shingles, metal, and premium roofing systems. Learn what really affects roof life, how installation and maintenance change performance, and how to compare long-term value.',
    category: 'GUIDE',
    content: `### What Does “Lifetime Roofing” Really Mean?
The phrase “lifetime roof” is often used in roofing advertisements, but it needs context. A manufacturer’s limited lifetime warranty is a contract with specific coverage, exclusions, transfer rules, and workmanship requirements. It is not a promise that the roof will never need repair or replacement. Actual service life depends on the roofing material, installation quality, ventilation, weather exposure, maintenance, and the condition of the roof deck.

### Asphalt Shingles: Practical Value and Broad Availability
Quality architectural asphalt shingles are a common choice because they offer a wide range of colors and styles at a comparatively accessible installed cost. Depending on product quality, climate, ventilation, maintenance, and workmanship, many systems provide roughly 15 to 30 years of service. Severe hail, repeated high winds, poor attic ventilation, and installation shortcuts can shorten that life.

### Impact-Resistant Shingles: Added Hail Protection
Class 4 impact-resistant shingles are tested to a defined impact-resistance standard and can be a useful option in hail-prone areas. They may help reduce damage from certain impacts, and some insurers offer discounts when eligibility requirements are met. A Class 4 rating does not guarantee that a roof cannot be damaged by hail, nor does it automatically mean the roof will last longer than every standard shingle system. Confirm product specifications and any insurance discount directly with the manufacturer and insurer.

### Metal Roofing: Long Service Potential
Standing-seam metal roofing uses raised, interlocking seams and concealed clips or fasteners. Properly designed and installed systems can provide several decades of service, often around 40 to 70 years depending on the metal, coating, details, environment, and maintenance. Panel gauge, compatible trim, underlayment, ventilation, expansion allowances, and workmanship all matter. Exposed-fastener metal systems have different inspection and maintenance needs because washers and fasteners are exposed to weather.

### Premium Roofing: Tile, Slate, and Composite Systems
Clay or concrete tile, natural slate, and high-quality composite products can offer long service lives and distinctive appearance. Some tile and slate roofs can remain in service for many decades, but the supporting structure, underlayment, flashings, and individual units still require inspection and maintenance. Composite products vary significantly, so compare the specific product’s tested performance, installation requirements, warranty terms, and repairability rather than relying on the category name alone.

### Installation Quality Is a Major Part of Roof Life
Even an expensive roofing material can fail early when installed incorrectly. Critical details include proper roof-deck preparation, correct underlayment, flashing at walls and penetrations, valley construction, starter and ridge components, fastening patterns, ventilation design, and compliance with the manufacturer’s instructions and local building requirements. A roof inspection should look beyond the visible surface and evaluate these details where accessible.

### Ventilation, Heat, and Moisture
A properly designed attic ventilation system helps manage heat and moisture, but more ventilation is not automatically better. Intake and exhaust must be balanced and appropriate for the building. Poor ventilation, air leaks from the living space, and inadequate insulation can contribute to moisture problems and excess heat. Reflective or “cool roof” products may reduce roof-surface temperatures under suitable conditions, but actual energy savings depend on climate, roof design, insulation, HVAC efficiency, and the product selected.

### Compare Long-Term Value, Not Just the Initial Price
A useful comparison includes the installed price, expected maintenance, likely repair costs, product availability, appearance, energy characteristics, warranty limitations, and how long you expect to own the property. A higher-priced roof is not automatically the better investment for every home. Ask for a written scope that identifies the exact product, underlayment, flashing, ventilation work, accessories, tear-off assumptions, and workmanship coverage.

### Questions to Ask Before Choosing a Roofing System
- What exact manufacturer and product line will be installed?
- What is the product’s tested wind and impact rating, and what does that rating actually cover?
- What underlayment, flashing, ventilation, and fastening details are included?
- Who performs the installation, and what workmanship coverage is provided?
- What maintenance is recommended, and are replacement materials readily available?
- What are the exclusions, prorating rules, and transfer conditions in the written warranty?

### The Roof Doctors’ Recommendation
Choose a roofing system based on the home, roof design, local weather exposure, budget, and long-term plans—not a “lifetime” label alone. A documented roof evaluation and a detailed written installation scope make it easier to compare options fairly and understand what you are buying.`,
    published: true,
    readingTimeMinutes: 6,
    publishedAt: now,
    createdAt: now,
  };
}

function getInitialDatabase(): DatabaseSchema {
  const now = new Date().toISOString();

  const business: Business = {
    id: 'biz_roofdocs_main',
    name: 'The Roof Doctors',
    legalName: 'The Roof Doctors LLC',
    tagline: 'Residential Roofing & Storm Damage Specialists',
    phone: '903-231-5940',
    emergencyPhone: '903-231-5940',
    email: 'contact@theroofdoctors.com',
    headquartersAddress: '500 E Front St',
    headquartersCity: 'Texarkana',
    headquartersState: 'TX',
    headquartersZip: '75501',
    active: true,
    createdAt: now,
    updatedAt: now,
  };

  const division: Division = {
    id: 'div_residential_storm',
    businessId: business.id,
    name: 'Residential Roofing & Storm Damage Division',
    description: 'Residential roof replacements, insurance restoration, diagnostics, and repairs',
    active: true,
    createdAt: now,
    updatedAt: now,
  };

  const market: Market = {
    id: 'mkt_northeast_texas',
    divisionId: division.id,
    name: 'Northeast Texas',
    state: 'TX',
    active: true,
    createdAt: now,
    updatedAt: now,
  };

  const serviceAreas: ServiceArea[] = [
    {
      id: 'srv_texarkana',
      name: 'Texarkana',
      slug: 'texarkana',
      state: 'TX',
      isTier1: true,
      county: 'Bowie',
      zipCodes: ['75501', '75503', '75504', '75505'],
      description: 'Primary headquarters and full diagnostic emergency dispatch hub.',
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'srv_atlanta',
      name: 'Atlanta',
      slug: 'atlanta',
      state: 'TX',
      isTier1: true,
      county: 'Cass',
      zipCodes: ['75551'],
      description: 'Serving Cass County homeowners with precision storm inspections and replacements.',
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'srv_new_boston',
      name: 'New Boston',
      slug: 'new-boston',
      state: 'TX',
      isTier1: true,
      county: 'Bowie',
      zipCodes: ['75570'],
      description: 'Dedicated roofing crews for western Bowie County residential properties.',
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'srv_paris',
      name: 'Paris',
      slug: 'paris',
      state: 'TX',
      isTier1: true,
      county: 'Lamar',
      zipCodes: ['75460', '75461', '75462'],
      description: 'Rapid response roof diagnostics and complete residential restoration in Lamar County.',
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'srv_sulphur_springs',
      name: 'Sulphur Springs',
      slug: 'sulphur-springs',
      state: 'TX',
      isTier1: true,
      county: 'Hopkins',
      zipCodes: ['75482', '75483'],
      description: 'Hopkins County storm damage response and architectural shingle replacements.',
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'srv_longview',
      name: 'Longview',
      slug: 'longview',
      state: 'TX',
      isTier1: true,
      county: 'Gregg',
      zipCodes: ['75601', '75602', '75603', '75604', '75605'],
      description: 'Serving Gregg & Harrison counties with certified residential roof assessments.',
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'srv_tyler',
      name: 'Tyler',
      slug: 'tyler',
      state: 'TX',
      isTier1: true,
      county: 'Smith',
      zipCodes: ['75701', '75702', '75703', '75707', '75708', '75709'],
      description: 'Rose City residential roofing specialists with comprehensive insurance claim support.',
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'srv_marshall',
      name: 'Marshall',
      slug: 'marshall',
      state: 'TX',
      isTier1: true,
      county: 'Harrison',
      zipCodes: ['75670', '75671', '75672'],
      description: 'Prompt Harrison County diagnostic evaluations and storm damage leak repair.',
      active: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const territories: Territory[] = serviceAreas.map((sa) => ({
    id: `ter_${sa.slug.replace(/-/g, '_')}`,
    marketId: market.id,
    name: `${sa.name} Territory`,
    zipCodes: sa.zipCodes,
    active: true,
    createdAt: now,
    updatedAt: now,
  }));

  const services: Service[] = [
    {
      id: 'srvc_roof_replacement',
      title: 'Complete Roof Replacement',
      slug: 'roof-replacement',
      description: 'Engineered complete roof replacement systems built to withstand Northeast Texas severe weather.',
      detailedContent: 'A full roof replacement from The Roof Doctors involves stripping down to the sound roof deck, inspecting every sheet of decking, installing high-performance synthetic underlayment, ice and water barrier in all valleys and eaves, starter shingles, high-grade architectural shingles, and proper balanced ridge ventilation.',
      diagnosticProcess: [
        'Decking integrity physical walk and moisture testing',
        'Intake vs exhaust ventilation flow calculation',
        'Flashing and chimney step flashing analysis',
        'Satellite and aerial measurement precision report via ROOFR',
      ],
      commonSymptoms: [
        'Shingles older than 18-20 years showing granular bald spots',
        'Extensive hail impact bruising across multiple slopes',
        'Multiple active leaks occurring in disparate areas',
        'Brittle, curling or creased wind-damaged shingles',
      ],
      active: true,
      createdAt: now,
    },
    {
      id: 'srvc_storm_restoration',
      title: 'Storm Damage & Hail Restoration',
      slug: 'storm-damage',
      description: 'Objective, forensic storm damage assessments and insurance scope documentation.',
      detailedContent: 'Severe thunderstorms, hail, and high winds are the leading cause of premature roof failure in Northeast Texas. We provide forensic assessments documenting impact densities per square, wind uplift creases, collateral damage to vents and gutters, and prepare comprehensive photographic documentation for your insurance adjuster.',
      diagnosticProcess: [
        '10x10 test square chalk layout on each cardinal slope',
        'Collateral damage check: gutters, downspouts, AC fins, siding',
        'Attic intrusion inspection beneath observed impact clusters',
        'Standardized forensic photo cataloging',
      ],
      commonSymptoms: [
        'Black or dark circular bruises where granules have dislodged',
        'Horizontal creasing near the top of shingle exposure tabs',
        'Water stains blooming on ceilings following heavy downpours',
        'Dented soft metals, ridge vents, or gutter drip edges',
      ],
      active: true,
      createdAt: now,
    },
    {
      id: 'srvc_roof_repair',
      title: 'Precision Roof Repair & Leak Diagnostic',
      slug: 'roof-repair',
      description: 'Targeted diagnostic repairs that solve leaks at the root cause without unneeded replacement.',
      detailedContent: 'Not every roof issue requires a complete tear-off. Our diagnostic specialists trace water migration pathways from the ceiling back up to pipe boots, deteriorated flashing, lifted nails, or chimney interfaces, providing guaranteed repairs.',
      diagnosticProcess: [
        'Water test isolation when leak origin is elusive',
        'Pipe jack and neoprene collar deterioration check',
        'Valley debris and sidewall flashing inspection',
      ],
      commonSymptoms: [
        'Isolated drips around plumbing vents or chimneys during rain',
        'Loose or blown-off tab after a single high-wind storm',
        'Rotting fascia or soffit along an eave edge',
      ],
      active: true,
      createdAt: now,
    },
    {
      id: 'srvc_diagnostic_inspection',
      title: 'Free Diagnostic Roof Inspection',
      slug: 'roof-inspection',
      description: 'Comprehensive 21-point photographic roof inspection by trained residential specialists.',
      detailedContent: 'Our thorough 21-point diagnostic evaluates roof covering, decking, ventilation, pipe collars, chimneys, skylights, gutters, and attic conditions. You receive an objective digital health report with high-resolution photos.',
      diagnosticProcess: [
        'Comprehensive 21-point physical checklist',
        'Attic moisture and light penetration check',
        'Digital delivery of findings and condition rating',
      ],
      commonSymptoms: [
        'Home purchase or pending insurance policy renewal',
        'Recent hail or tornado warning in your neighborhood',
        'Roof age exceeds 10 years without recent assessment',
      ],
      active: true,
      createdAt: now,
    },
    {
      id: 'srvc_emergency_response',
      title: 'Emergency Roof Tarping & Response',
      slug: 'emergency-roof-repair',
      description: 'Immediate emergency dispatch to secure breached roofs and prevent interior structural damage.',
      detailedContent: 'When a tree limb falls or a severe gale tears away shingles, immediate mitigation is required by insurance policies to protect the home interior. Our emergency crews secure the perimeter with commercial-grade reinforced tarps and 2x4 batten anchors.',
      diagnosticProcess: [
        'Structural safety triage before accessing roof',
        'Rapid perimeter batten tarping without puncturing undamaged field shingles',
        'Immediate photographic record of pre-tarp condition for insurance records',
      ],
      commonSymptoms: [
        'Tree branch puncture through decking',
        'Active pouring water into living spaces during an ongoing storm',
        'Large section of roof blown completely off',
      ],
      active: true,
      createdAt: now,
    },
    {
      id: 'srvc_maintenance_plan',
      title: 'Roof Maintenance Program',
      slug: 'roof-maintenance',
      description: 'Annual diagnostic health audits, gutter clearances, and preventative seal renewals.',
      detailedContent: 'Extend your roof service life by 5 to 10 years through proactive seasonal inspections, debris removal from critical drainage valleys, pipe boot collar replacements, and resealing exposed fasteners before leaks develop.',
      diagnosticProcess: [
        'Semi-annual or annual scheduled health audit',
        'Fastener and exposed sealant re-caulking',
        'Clearance of valleys and gutter choke points',
      ],
      commonSymptoms: [
        'Mature trees overhanging roof slopes depositing leaves in valleys',
        'Desire to maintain manufacturer warranty compliance documentation',
      ],
      active: true,
      createdAt: now,
    },
  ];

  const roofingSystems: RoofingSystem[] = [
    {
      id: 'sys_architectural_shingles',
      name: 'Architectural Laminated Asphalt Shingles',
      slug: 'architectural-shingles',
      description: 'Dual-layered dimensional shingles providing superior wind resistance up to 130 mph and clean curb appeal.',
      expectedLifespanYears: '25 - 30 Years',
      windRatingMph: 130,
      impactResistance: 'Class 3 / Class 4 options',
      bestSuitedFor: 'Most residential pitched roofs in Northeast Texas neighborhoods.',
      active: true,
      createdAt: now,
    },
    {
      id: 'sys_class4_impact',
      name: 'Class 4 Impact-Resistant Shingles (SBS Modified)',
      slug: 'class-4-impact-resistant',
      description: 'Rubberized SBS asphalt shingles tested to withstand 2-inch steel ball drop impacts without cracking.',
      expectedLifespanYears: '30 - 35 Years',
      windRatingMph: 130,
      impactResistance: 'UL 2218 Class 4 (Highest Rating)',
      bestSuitedFor: 'Properties in high-frequency hail corridors; frequently qualifies for home insurance premium discounts up to 25%.',
      active: true,
      createdAt: now,
    },
    {
      id: 'sys_standing_seam_metal',
      name: 'Standing Seam Metal Roofing (Concealed Fastener)',
      slug: 'standing-seam-metal',
      description: '24 or 26-gauge galvalume steel panels with concealed clips and raised interlocking seams.',
      expectedLifespanYears: '50+ Years',
      windRatingMph: 150,
      impactResistance: 'Class 4 UL 2218',
      bestSuitedFor: 'High-end homes, low-pitch transitions, and homeowners seeking maximum longevity and energy efficiency.',
      active: true,
      createdAt: now,
    },
    {
      id: 'sys_designer_slate_shingle',
      name: 'Designer Luxury Composite Shingles',
      slug: 'designer-luxury',
      description: 'Heavyweight artisan asphalt replicating hand-split cedar shakes or natural slate.',
      expectedLifespanYears: '40 - 50 Years',
      windRatingMph: 130,
      impactResistance: 'Class 4 UL 2218',
      bestSuitedFor: 'Distinguished custom residences seeking statement architectural styling.',
      active: true,
      createdAt: now,
    },
  ];

  const problemTypes: ProblemType[] = [
    {
      id: 'prob_hail_bruising',
      title: 'Hail Impact & Granule Loss',
      slug: 'hail-damage',
      urgency: 'MODERATE',
      symptoms: [
        'Dark rounded craters on shingle surfaces',
        'Excessive black granules filling gutter downspout splash blocks',
        'Exposed fiberglass matting susceptible to rapid UV decay',
      ],
      consequencesIfDelayed: 'Sun exposure degrades unprotected asphalt mat within 3-6 months, leading to widespread brittle leaks.',
      recommendedDiagnosticAction: 'Schedule a certified hail assessment to inspect cardinal slopes and check insurance claim deadlines.',
      createdAt: now,
    },
    {
      id: 'prob_wind_blowoff',
      title: 'Wind Lift, Creasing & Missing Tabs',
      slug: 'wind-damage',
      urgency: 'CRITICAL_LEAK',
      symptoms: [
        'Shingle tabs flipped backwards or broken off',
        'Horizontal crease lines where sealant bond broke under gust pressure',
        'Visible black underlayment exposed to sky',
      ],
      consequencesIfDelayed: 'Wind-driven rain enters through nail holes and unsealed seams, rotting decking and insulation.',
      recommendedDiagnosticAction: 'Schedule urgent repair or diagnostic inspection before next rain event.',
      createdAt: now,
    },
    {
      id: 'prob_flashing_leak',
      title: 'Chimney, Wall & Valley Flashing Leaks',
      slug: 'flashing-failure',
      urgency: 'CRITICAL_LEAK',
      symptoms: [
        'Water stains along ceiling corners adjacent to exterior walls or fireplaces',
        'Rusted metal valley pans or detached step flashing',
        'Cracked chimney counter-flashing mortar',
      ],
      consequencesIfDelayed: 'Concealed framing rot, mold cultivation, and sheetrock collapse.',
      recommendedDiagnosticAction: 'Inspect flashing solder joints, replace compromised step flashing, and reseal reglet grooves.',
      createdAt: now,
    },
    {
      id: 'prob_pipe_boot_failure',
      title: 'Plumbing Pipe Boot Collar Deterioration',
      slug: 'pipe-boot-failure',
      urgency: 'MODERATE',
      symptoms: [
        'Cracked rubber collar gasket around plumbing soil stack pipe',
        'Drips above bathroom or kitchen ceilings during vertical rain',
      ],
      consequencesIfDelayed: 'Small continuous leak that saturates blown insulation and rots surrounding roof rafters.',
      recommendedDiagnosticAction: 'Replace neoprene collar with silicone or lead flashing boot.',
      createdAt: now,
    },
  ];

  const faqs: FAQ[] = [
    {
      id: 'faq_1',
      question: 'How do I know if my roof has storm or hail damage if it is not currently leaking?',
      answer: 'Hail damage is insidious: impact stones bruise the asphalt matting and knock loose the protective ceramic granules without causing an immediate puncture. However, once the asphalt is exposed to the Northeast Texas sun, UV rays rapidly decompose the binder, turning a minor bruise into an active ceiling leak months later. An objective ground and roof diagnostic by The Roof Doctors documents this damage before filing deadlines pass.',
      category: 'STORM_DAMAGE',
      orderIndex: 1,
      published: true,
      createdAt: now,
    },
    {
      id: 'faq_2',
      question: 'Does The Roof Doctors assist with the insurance claim process?',
      answer: 'Yes. While only licensed public adjusters or policyholders can negotiate coverage legalities, The Roof Doctors provides objective, photographic forensic reports with exact measurements and Xactimate-compatible scopes. We meet with your insurance carrier adjuster on-site to ensure all damaged components (flashing, ventilation, decking, gutters) are properly accounted for in the scope.',
      category: 'INSURANCE',
      orderIndex: 2,
      published: true,
      createdAt: now,
    },
    {
      id: 'faq_3',
      question: 'Is your roof diagnostic inspection genuinely free?',
      answer: 'Yes. Our 21-point Diagnostic Roof Inspection for homeowners in our primary Northeast Texas service area is 100% free with zero obligation. You receive an honest, documented evaluation with photos. If your roof is sound and only needs a small maintenance touch-up or nothing at all, we tell you directly.',
      category: 'GENERAL',
      orderIndex: 3,
      published: true,
      createdAt: now,
    },
    {
      id: 'faq_4',
      question: 'How long does a typical residential roof replacement take?',
      answer: 'For the majority of standard residential homes (20 to 45 squares), our trained crews complete the entire tear-off, decking inspection, installation, and magnetic nail sweep in just one to two days, weather permitting.',
      category: 'GENERAL',
      orderIndex: 4,
      published: true,
      createdAt: now,
    },
  ];

  const resources: Resource[] = [
    {
      id: 'res_post_storm_guide',
      title: 'What Homeowners Must Do Within 48 Hours of a Severe Hail or Wind Storm',
      slug: 'what-to-do-after-a-storm',
      summary: 'Critical steps to safeguard your property, prevent insurance coverage forfeitures, and avoid unscrupulous storm chaser tactics.',
      category: 'STORM_CHECKLIST',
      content: `### 1. Document Before Touching
Take clear photographs of any grounded tree limbs, exterior hail accumulation against the wall foundation, and damaged outdoor equipment.

### 2. Inspect the Attic First
Before stepping outdoors, walk your attic with a flashlight. Look for damp decking, daylight where flashing meets walls, or saturated insulation.

### 3. Avoid Walking on a Steep or Wet Roof
Wet roofs with loose granules are an extreme fall hazard. Leave roof climbing to trained specialists with OSHA-compliant safety gear.

### 4. Beware Out-of-State Door Knockers
Verify local presence, Texas business registration, physical office location, and verified insurance coverage. The Roof Doctors is rooted right here in Northeast Texas.`,
      published: true,
      readingTimeMinutes: 4,
      publishedAt: now,
      createdAt: now,
    },
    {
      id: 'res_insurance_claim_steps',
      title: 'Navigating Texas Homeowners Roof Insurance Claims Step-by-Step',
      slug: 'insurance-claim-process-guide',
      summary: 'A transparent guide to insurance deductibles, adjuster meetings, and actual cash value vs replacement cost value.',
      category: 'INSURANCE_TIPS',
      content: `### Understanding Replacement Cost Value (RCV) vs Actual Cash Value (ACV)
Most modern Texas homeowners policies pay claims in two disbursements: ACV first (depreciated payout), followed by the recoverable depreciation once proof of full completion is submitted by your contractor.

### Texas House Bill 2102 Reminder
Under Texas law, it is illegal for contractors to waive, absorb, or rebate your insurance deductible. Work with contractors who uphold strict legal compliance.`,
      published: true,
      readingTimeMinutes: 5,
      publishedAt: now,
      createdAt: now,
    },
    createLifetimeRoofingResource(now),
  ];

  const maintenancePlans: MaintenancePlan[] = [
    {
      id: 'mplan_annual_shield',
      name: 'Roof Doctor Shield — Annual Diagnostic Plan',
      annualPrice: 249,
      inspectionFrequencyMonths: 12,
      description: 'Comprehensive annual preventative maintenance, storm triage priority, and gutter valley clearances.',
      benefits: [
        'Annual 21-point physical diagnostic health audit with digital report',
        'VIP priority dispatch after declared regional storm events',
        'Re-sealing of all pipe boot collars, flashing seams, and exposed fasteners',
        'Complimentary minor shingle repair (up to 5 shingles included per year)',
        'Valley debris clearing to ensure unobstructed stormwater runoff',
        '10% discount on any future full replacement or major upgrades',
      ],
      active: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const integrations: Integration[] = [
    {
      id: 'int_roofr',
      provider: 'ROOFR',
      category: 'MEASUREMENTS',
      status: 'NOT_CONNECTED',
      enabled: false,
      configurationMetadata: {
        apiEndpoint: 'https://api.roofr.com/v1',
        apiKeyConfigured: false,
        webhookConfigured: false,
      },
      webhookStatus: 'NOT_CONFIGURED',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'int_stripe',
      provider: 'STRIPE',
      category: 'PAYMENTS',
      status: 'NOT_CONNECTED',
      enabled: false,
      configurationMetadata: {
        hasPublishableKey: false,
        hasSecretKey: false,
        webhookSecretConfigured: false,
      },
      webhookStatus: 'NOT_CONFIGURED',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'int_twilio',
      provider: 'TWILIO',
      category: 'COMMUNICATION',
      status: 'NOT_CONNECTED',
      enabled: false,
      configurationMetadata: {
        accountSidConfigured: false,
        authTokenConfigured: false,
        phoneNumber: '',
      },
      webhookStatus: 'NOT_CONFIGURED',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'int_resend',
      provider: 'RESEND',
      category: 'COMMUNICATION',
      status: 'NOT_CONNECTED',
      enabled: false,
      configurationMetadata: {
        apiKeyConfigured: false,
        fromEmail: 'dispatch@theroofdoctors.com',
      },
      webhookStatus: 'NOT_CONFIGURED',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'int_google_calendar',
      provider: 'GOOGLE_CALENDAR',
      category: 'CALENDAR',
      status: 'NOT_CONNECTED',
      enabled: false,
      configurationMetadata: {
        calendarId: '',
        oauthConfigured: false,
      },
      webhookStatus: 'NOT_CONFIGURED',
      createdAt: now,
      updatedAt: now,
    },
  ];

  const featureFlags: FeatureFlag[] = [
    {
      id: 'flag_ai_roof_vision',
      key: 'AI_ROOF_VISION',
      name: 'AI Roof Vision Inspection Analysis',
      description: 'Computer vision analysis on drone and inspection photos for hail indentation detection.',
      enabled: false,
      enabledFor: 'BETA_USERS',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'flag_roofr_integration',
      key: 'ROOFR_INTEGRATION',
      name: 'ROOFR Measurement Engine',
      description: 'Automated satellite roof measurement dispatch through ROOFR API provider.',
      enabled: true,
      enabledFor: 'EVERYONE',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'flag_customer_portal',
      key: 'CUSTOMER_PORTAL',
      name: 'Homeowner Portal & Roof Record',
      description: 'Self-service homeowner portal displaying long-term Roof Records, photos, and project milestones.',
      enabled: true,
      enabledFor: 'EVERYONE',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'flag_maintenance_memberships',
      key: 'MAINTENANCE_MEMBERSHIPS',
      name: 'Maintenance Memberships',
      description: 'Recurring annual residential roof maintenance plan subscriptions.',
      enabled: true,
      enabledFor: 'EVERYONE',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'flag_ai_concierge',
      key: 'AI_CONCIERGE',
      name: 'AI Diagnostic Intake Concierge',
      description: 'Server-side assistant helping homeowners articulate roof symptoms.',
      enabled: false,
      enabledFor: 'ROLES',
      allowedRoles: ['OWNER', 'ADMINISTRATOR', 'SALES'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'flag_storm_intelligence',
      key: 'STORM_INTELLIGENCE',
      name: 'Storm Event Intelligence & Tracking',
      description: 'Correlation of local hail size and wind vectors to property addresses.',
      enabled: true,
      enabledFor: 'EVERYONE',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'flag_call_intelligence',
      key: 'CALL_INTELLIGENCE',
      name: 'Call Intelligence & Voicemail Transcription',
      description: 'Automated inbound emergency triage from telephone audio.',
      enabled: false,
      enabledFor: 'ROLES',
      allowedRoles: ['OWNER', 'ADMINISTRATOR'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'flag_marketing_automation',
      key: 'MARKETING_AUTOMATION',
      name: 'Marketing Attribution Tracking',
      description: 'UTM and multi-touch lead attribution tracking through the pipeline.',
      enabled: true,
      enabledFor: 'EVERYONE',
      createdAt: now,
      updatedAt: now,
    },
  ];

  const businessRules: BusinessRule[] = [
    {
      id: 'rule_lead_scoring',
      category: 'LEAD_SCORING',
      name: 'Lead Priority Scoring Weights',
      ruleKey: 'lead_scoring_weights',
      parameters: {
        emergencyWeight: 25,
        stormDamageWeight: 20,
        insuranceWeight: 15,
        serviceReplacementWeight: 15,
        tier1CityWeight: 10,
        phoneProvidedWeight: 5,
        photoProvidedWeight: 10,
      },
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'rule_emergency_routing',
      category: 'EMERGENCY_ROUTING',
      name: 'Emergency Dispatch Thresholds',
      ruleKey: 'emergency_dispatch_config',
      parameters: {
        autoAlertOnCall: true,
        prioritySmsToLeadInspector: true,
        maxResponseTimeMinutes: 30,
      },
      active: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const systemSettings: SystemSetting[] = [
    {
      id: 'sett_biz_name',
      category: 'BUSINESS',
      key: 'BUSINESS_NAME',
      value: 'The Roof Doctors',
      description: 'Customer facing residential brand name',
      updatedAt: now,
    },
    {
      id: 'sett_tagline',
      category: 'BUSINESS',
      key: 'TAGLINE',
      value: 'Residential Roofing & Storm Damage Specialists',
      description: 'Official brand positioning statement',
      updatedAt: now,
    },
    {
      id: 'sett_phone',
      category: 'COMMUNICATION',
      key: 'MAIN_PHONE',
      value: '903-231-5940',
      description: 'Primary customer service & dispatch phone',
      updatedAt: now,
    },
    {
      id: 'sett_emergency_phone',
      category: 'COMMUNICATION',
      key: 'EMERGENCY_PHONE',
      value: '903-231-5940',
      description: '24/7 Storm & Leak emergency response line',
      updatedAt: now,
    },
    {
      id: 'sett_email',
      category: 'COMMUNICATION',
      key: 'PRIMARY_EMAIL',
      value: 'contact@theroofdoctors.com',
      description: 'Primary inbound contact email',
      updatedAt: now,
    },
  ];

  // Configured Staff Users for development RBAC testing
  const users: User[] = [
    {
      id: 'usr_owner_admin',
      email: 'theroofingdrs@gmail.com',
      name: 'Principal Owner / Admin',
      phone: '903-231-5940',
      role: 'OWNER',
      permissions: [
        'VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT', 'APPROVE', 'SEND',
        'MANAGE_FINANCIAL', 'MANAGE_CUSTOMERS', 'MANAGE_USERS', 'MANAGE_SETTINGS',
        'MANAGE_INTEGRATIONS', 'MANAGE_CONTENT', 'MANAGE_AUTOMATIONS'
      ],
      active: true,
      mfaEnabled: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'usr_inspector_1',
      email: 'inspector@theroofdoctors.com',
      name: 'Senior Diagnostic Inspector',
      phone: '(903) 824-7664',
      role: 'INSPECTOR',
      permissions: ['VIEW', 'CREATE', 'EDIT', 'SEND'],
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'usr_sales_1',
      email: 'sales@theroofdoctors.com',
      name: 'Residential Sales Specialist',
      phone: '(903) 824-7665',
      role: 'SALES',
      permissions: ['VIEW', 'CREATE', 'EDIT', 'SEND', 'MANAGE_CUSTOMERS'],
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'usr_homeowner_demo',
      email: 'homeowner@example.com',
      name: 'Verified Homeowner',
      phone: '(903) 555-0199',
      role: 'HOMEOWNER',
      permissions: ['VIEW'],
      active: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  return {
    businesses: [business],
    divisions: [division],
    markets: [market],
    territories,
    serviceAreas,
    users,
    customers: [],
    properties: [],
    roofs: [],
    roofRecords: [],
    roofRecordEvents: [],
    leads: [],
    leadActivities: [],
    projects: [],
    inspections: [],
    damageObservations: [],
    measurements: [],
    stormEvents: [],
    appointments: [],
    communications: [],
    tasks: [],
    documents: [],
    photos: [],
    fileRecords: [],
    estimates: [],
    proposals: [],
    payments: [],
    invoices: [],
    maintenancePlans,
    maintenanceEnrollments: [],
    crews: getDefaultCrews(),
    workers: [],
    subcontractors: [],
    materials: getDefaultMaterials(),
    vendors: getDefaultVendors(),
    purchaseOrders: [],
    projectCosts: [],
    reviews: [], // No fake reviews!
    faqs,
    resources,
    services,
    roofingSystems,
    problemTypes,
    automations: [],
    automationExecutions: [],
    notifications: [],
    auditLogs: [],
    integrations,
    integrationEvents: [],
    webhookEvents: [],
    backgroundJobs: [],
    featureFlags,
    businessRules,
    systemSettings,
    fieldCheckIns: [],
    roofModels: [],
    priceBooks: getDefaultPriceBooks(),
    scopeTemplates: getDefaultScopeTemplates(),
    sales: [],
  };
}

export function getDatabase(): DatabaseSchema {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      dbInstance = JSON.parse(data);
      if (!dbInstance!.roofRecordEvents) dbInstance!.roofRecordEvents = [];
      if (!dbInstance!.tasks) dbInstance!.tasks = [];
      if (!dbInstance!.stormEvents) dbInstance!.stormEvents = [];
      if (!dbInstance!.documents) dbInstance!.documents = [];
      if (!dbInstance!.photos) dbInstance!.photos = [];
      if (!dbInstance!.fileRecords) dbInstance!.fileRecords = [];
      if (!dbInstance!.crews || dbInstance!.crews.length === 0) {
        dbInstance!.crews = getDefaultCrews();
      }
      if (!dbInstance!.materials || dbInstance!.materials.length === 0) {
        dbInstance!.materials = getDefaultMaterials();
      }
      if (!dbInstance!.vendors || dbInstance!.vendors.length === 0) {
        dbInstance!.vendors = getDefaultVendors();
      }
      if (!dbInstance!.invoices) dbInstance!.invoices = [];
      if (!dbInstance!.payments) dbInstance!.payments = [];
      if (!dbInstance!.purchaseOrders) dbInstance!.purchaseOrders = [];
      if (!dbInstance!.projectCosts) dbInstance!.projectCosts = [];
      if (!dbInstance!.fieldCheckIns) dbInstance!.fieldCheckIns = [];
      if (!dbInstance!.roofModels) dbInstance!.roofModels = [];
      if (!dbInstance!.priceBooks || dbInstance!.priceBooks.length === 0) {
        dbInstance!.priceBooks = getDefaultPriceBooks();
      }
      if (!dbInstance!.scopeTemplates || dbInstance!.scopeTemplates.length === 0) {
        dbInstance!.scopeTemplates = getDefaultScopeTemplates();
      }
      if (!dbInstance!.sales) dbInstance!.sales = [];
      if (!dbInstance!.resources) dbInstance!.resources = [];
      if (!dbInstance!.resources.some((resource) => resource.id === 'res_lifetime_roofing_systems')) {
        dbInstance!.resources.push(createLifetimeRoofingResource(new Date().toISOString()));
      }
      console.log('[DB] Loaded existing persistent database from disk.');
      return dbInstance!;
    }
  } catch (err) {
    console.error('[DB] Error loading file-based database, initializing fresh seed:', err);
  }

  dbInstance = getInitialDatabase();
  persistDatabase();
  return dbInstance;
}

export function persistDatabase(): void {
  if (!dbInstance) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(dbInstance, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Error persisting database to disk:', err);
  }
}

export { generateId };
