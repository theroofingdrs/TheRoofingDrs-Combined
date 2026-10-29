/**
 * The Roof Doctors — Master Entity & Type Definitions
 * Brand: The Roof Doctors — Residential Roofing & Storm Damage Specialists
 */

// ==========================================
// ROLES & PERMISSIONS (RBAC)
// ==========================================

export type UserRole =
  | 'OWNER'
  | 'ADMINISTRATOR'
  | 'SALES'
  | 'OFFICE'
  | 'INSPECTOR'
  | 'PRODUCTION'
  | 'PROJECT_MANAGER'
  | 'MARKETING'
  | 'CUSTOMER_SUPPORT'
  | 'CREW'
  | 'SUBCONTRACTOR'
  | 'HOMEOWNER';

export type Permission =
  | 'VIEW'
  | 'CREATE'
  | 'EDIT'
  | 'DELETE'
  | 'EXPORT'
  | 'APPROVE'
  | 'SEND'
  | 'MANAGE_FINANCIAL'
  | 'MANAGE_CUSTOMERS'
  | 'MANAGE_USERS'
  | 'MANAGE_SETTINGS'
  | 'MANAGE_INTEGRATIONS'
  | 'MANAGE_CONTENT'
  | 'MANAGE_AUTOMATIONS';

export interface User {
  id: string; // usr_xxx
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  permissions: Permission[];
  marketId?: string;
  divisionId?: string;
  active: boolean;
  mfaEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// STATUS ENUMS & TYPES
// ==========================================

export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'INSPECTION_SCHEDULED'
  | 'INSPECTION_COMPLETED'
  | 'ESTIMATE_SENT'
  | 'WON'
  | 'JOB_SOLD'
  | 'COMPLETED'
  | 'FOLLOW_UP'
  | 'LOST';

export type ProjectStatus =
  | 'LEAD'
  | 'PRE_INSPECTION'
  | 'INSPECTION'
  | 'ESTIMATING'
  | 'PROPOSAL'
  | 'SOLD'
  | 'PRE_PRODUCTION'
  | 'MATERIALS'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'QC'
  | 'COMPLETED'
  | 'CLOSEOUT'
  | 'MAINTENANCE';

export type AppointmentStatus =
  | 'REQUESTED'
  | 'CONFIRMED'
  | 'RESCHEDULED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export type ProposalStatus =
  | 'DRAFT'
  | 'SENT'
  | 'VIEWED'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'EXPIRED'
  | 'CANCELLED';

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type LeadType =
  | 'STORM_DAMAGE'
  | 'INSURANCE'
  | 'LEAK'
  | 'REPAIR'
  | 'REPLACEMENT'
  | 'NEW_ROOF'
  | 'MAINTENANCE'
  | 'NOT_SURE'
  | 'EMERGENCY';

export type AttributionSource =
  | 'Google Organic'
  | 'Google Local'
  | 'Google Ads'
  | 'Bing'
  | 'Facebook'
  | 'Instagram'
  | 'ChatGPT'
  | 'Gemini'
  | 'Other AI'
  | 'Direct'
  | 'Referral'
  | 'Unknown';

export type CommunicationChannel =
  | 'SMS'
  | 'EMAIL'
  | 'PHONE'
  | 'INTERNAL_NOTE'
  | 'PORTAL_MESSAGE'
  | 'AUTOMATION';

export type MeasurementType =
  | 'VERIFIED_MEASUREMENT'
  | 'ESTIMATED_MEASUREMENT'
  | 'AI_DERIVED'
  | 'CUSTOMER_PROVIDED'
  | 'THIRD_PARTY';

// ==========================================
// GEOGRAPHIC & ORGANIZATIONAL HIERARCHY
// ==========================================

export interface Business {
  id: string; // biz_xxx
  name: string; // "The Roof Doctors"
  legalName: string;
  tagline: string;
  phone: string;
  emergencyPhone: string;
  email: string;
  headquartersAddress: string;
  headquartersCity: string;
  headquartersState: string;
  headquartersZip: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Division {
  id: string; // div_xxx
  businessId: string;
  name: string; // e.g. "Residential Roofing & Storm Division"
  description: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Market {
  id: string; // mkt_xxx
  divisionId: string;
  name: string; // e.g. "Northeast Texas"
  state: string; // "TX"
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Territory {
  id: string; // ter_xxx
  marketId: string;
  name: string; // e.g. "Texarkana Metro", "Longview-Tyler Basin"
  zipCodes: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceArea {
  id: string; // srv_xxx
  name: string; // e.g. "Texarkana", "Paris", "Longview", "Tyler"
  slug: string;
  state: string;
  isTier1: boolean;
  county: string;
  zipCodes: string[];
  description: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// CORE CUSTOMER & PROPERTY & ROOF ENTITIES
// ==========================================

export interface Customer {
  id: string; // cust_xxx
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  preferredContactMethod: 'PHONE' | 'EMAIL' | 'SMS';
  communicationPreferences: {
    smsOptIn: boolean;
    emailOptIn: boolean;
    stormAlertsOptIn: boolean;
  };
  source: AttributionSource;
  notes?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  tags: string[];
  propertyIds: string[];
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface Property {
  id: string; // prop_xxx
  customerId?: string; // Long-term link, or unassigned if initial prospect
  customerIds?: string[]; // Multiple associated customers support
  address: string;
  unit?: string;
  city: string;
  state: string;
  zip: string;
  latitude?: number;
  longitude?: number;
  marketId: string;
  territoryId?: string;
  propertyType?: 'SINGLE_FAMILY' | 'MULTI_FAMILY' | 'COMMERCIAL_RESIDENTIAL' | 'TOWNHOME' | 'OTHER';
  yearBuilt?: number;
  stories?: number;
  squareFootage?: number;
  notes?: string;
  verificationStatus: 'UNVERIFIED' | 'VERIFIED' | 'NEEDS_FIELD_CHECK';
  roofId?: string;
  historicalRoofIds?: string[];
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface RoofComponentSpec {
  ventilation?: string; // Ridge vent, solar attic fans, box vents
  flashing?: string; // Step flashing, drip edge, chimney saddle
  underlayment?: string; // Synthetic underlayment, ice & water shield
  decking?: string; // 7/16" OSB, plywood
  starterStrip?: string;
  ridgeCap?: string;
}

export interface Roof {
  id: string; // roof_xxx
  propertyId: string;
  roofingSystem: string; // Architectural Shingle, Standing Seam Metal, Designer Slate
  material: string; // Asphalt Shingle, Steel, Tile, Low-Slope Membrane
  approximateAge?: number;
  installationDate?: string;
  documentedComponents: RoofComponentSpec;
  manufacturer?: string; // GAF, CertainTeed, Owens Corning
  product?: string; // Timberline HDZ, Landmark, Duration
  color?: string;
  pitch?: string; // e.g. "6/12", "8/12"
  squares?: number; // 1 square = 100 sq ft
  sourceStatus: 'VERIFIED' | 'CUSTOMER_PROVIDED' | 'ESTIMATED' | 'THIRD_PARTY';
  roofRecordId: string; // Direct link to long-lived Roof Record
  status?: 'ACTIVE' | 'ARCHIVED' | 'REPLACED';
  notes?: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoofRecordEvent {
  id: string; // rrev_xxx
  roofRecordId: string;
  propertyId: string;
  roofId?: string;
  eventType:
    | 'INSTALLATION'
    | 'INSPECTION'
    | 'STORM'
    | 'DAMAGE'
    | 'REPAIR'
    | 'REPLACEMENT'
    | 'MAINTENANCE'
    | 'MEASUREMENT'
    | 'DOCUMENT';
  title: string;
  description: string;
  date: string;
  actor?: string;
  relatedEntityId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

// Long-lived chronological history of the roof over its entire lifetime
export interface RoofRecord {
  id: string; // rec_xxx
  roofId: string;
  propertyId: string;
  customerId?: string;
  originalInstallationDate?: string;
  lastInspectionDate?: string;
  lastStormEventDate?: string;
  warrantyStatus: 'ACTIVE_MANUFACTURER' | 'ACTIVE_WORKMANSHIP' | 'EXPIRED' | 'UNKNOWN';
  warrantyExpirationDate?: string;
  timelineEventCount: number;
  activeConditionRating?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'REQUIRES_REPAIR' | 'STORM_DAMAGED' | 'NEEDS_REPLACEMENT';
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// LEAD & LEAD INTELLIGENCE ENTITIES
// ==========================================

export interface Lead {
  id: string; // lead_xxx
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  leadType: LeadType;
  serviceRequested: string;
  emergencyFlag: boolean;
  stormRelatedFlag: boolean;
  insuranceRelatedFlag: boolean;
  preferredContactMethod: 'PHONE' | 'EMAIL' | 'SMS';
  message?: string;
  photoUrls?: string[];
  landingPage?: string;
  source: AttributionSource;
  utmSource?: string;
  utmCampaign?: string;
  utmMedium?: string;
  referrer?: string;
  firstTouchAttribution?: string;
  lastTouchAttribution?: string;
  division?: 'RESIDENTIAL' | 'COMMERCIAL';
  status: LeadStatus;
  score: number; // 0 - 100
  scoreReasons: string[];
  assignedUserId?: string;
  convertedCustomerId?: string;
  convertedProjectId?: string;
  convertedAt?: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface LeadActivity {
  id: string; // lact_xxx
  leadId: string;
  activityType: 'CREATED' | 'CONTACTED' | 'STATUS_CHANGED' | 'NOTE_ADDED' | 'APPOINTMENT_BOOKED' | 'CONVERTED';
  description: string;
  userId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

// ==========================================
// PROJECT, INSPECTION, MEASUREMENT & STORM
// ==========================================

export interface Project {
  id: string; // proj_xxx
  customerId: string;
  propertyId: string;
  roofId?: string;
  leadId?: string;
  title: string;
  status: ProjectStatus;
  projectType: 'REPLACEMENT' | 'REPAIR' | 'STORM_RESTORATION' | 'MAINTENANCE';
  insuranceClaimFlag: boolean;
  insuranceCarrier?: string;
  insuranceClaimNumber?: string;
  assignedProjectManagerId?: string;
  assignedSalesId?: string;
  assignedCrewId?: string;
  targetStartDate?: string;
  actualStartDate?: string;
  completedDate?: string;
  totalContractValue?: number;
  notes?: string;
  productionNotes?: string;
  dumpsterLocation?: string;
  dumpsterDropDate?: string;
  qualityChecklist?: {
    iceAndWaterShield: boolean;
    sixNailFastening: boolean;
    continuousRidgeVent: boolean;
    stepFlashing: boolean;
    magnetSweepCompleted: boolean;
    verifiedBy?: string;
    verifiedAt?: string;
  };
  texasHb2102Verified?: boolean;
  texasHb2102DeductibleAmount?: number;
  texasHb2102PaymentMethod?: string;
  texasHb2102VerifiedDate?: string;
  texasHb2102ReceiptNumber?: string;
  workOrderNumber?: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export type VerificationStatus = 'VERIFIED' | 'CUSTOMER_PROVIDED' | 'ESTIMATED' | 'THIRD_PARTY' | 'UNKNOWN';
export type ObservationVerification = 'OBSERVED' | 'POSSIBLE' | 'REQUIRES_FURTHER_REVIEW';
export type ObservationSeverity = 'MINOR' | 'MODERATE' | 'SIGNIFICANT' | 'SEVERE' | 'IMMINENT_FAILURE' | 'URGENT' | 'UNKNOWN';
export type DamageCategory =
  | 'HAIL'
  | 'WIND'
  | 'TREE_OR_LIMB'
  | 'WATER_INTRUSION'
  | 'FLASHING'
  | 'SHINGLE_DAMAGE'
  | 'METAL_DAMAGE'
  | 'DECKING'
  | 'VENTILATION'
  | 'OTHER';

export type RoofArea =
  | 'FRONT'
  | 'REAR'
  | 'LEFT'
  | 'RIGHT'
  | 'ROOF_PLANE'
  | 'RIDGE'
  | 'VALLEY'
  | 'EAVE'
  | 'RAKE'
  | 'FLASHING'
  | 'PENETRATION'
  | 'PIPE_BOOT'
  | 'VENT'
  | 'CHIMNEY'
  | 'SKYLIGHT'
  | 'ATTIC'
  | 'INTERIOR'
  | 'OTHER'
  | string;

export interface RoofCharacteristicItem {
  value: string;
  verificationStatus: VerificationStatus;
  notes?: string;
}

export interface StructuredRoofCharacteristics {
  roofingSystem?: RoofCharacteristicItem;
  material?: RoofCharacteristicItem;
  manufacturer?: RoofCharacteristicItem;
  product?: RoofCharacteristicItem;
  color?: RoofCharacteristicItem;
  approximateAge?: RoofCharacteristicItem;
  installationDate?: RoofCharacteristicItem;
  roofStyle?: RoofCharacteristicItem;
  roofComplexity?: RoofCharacteristicItem;
  ventilation?: RoofCharacteristicItem;
  flashing?: RoofCharacteristicItem;
  pipeBoots?: RoofCharacteristicItem;
  valleys?: RoofCharacteristicItem;
  ridges?: RoofCharacteristicItem;
  decking?: RoofCharacteristicItem;
  underlayment?: RoofCharacteristicItem;
  gutters?: RoofCharacteristicItem;
  otherComponents?: RoofCharacteristicItem;
}

export type ChecklistSectionKey =
  | 'GENERAL_CONDITION'
  | 'SHINGLES'
  | 'METAL'
  | 'FLASHING'
  | 'PIPE_BOOTS'
  | 'VENTILATION'
  | 'RIDGES'
  | 'VALLEYS'
  | 'PENETRATIONS'
  | 'DECKING'
  | 'GUTTERS'
  | 'SOFFIT_FASCIA'
  | 'ATTIC_INTERIOR'
  | 'OTHER';

export interface InspectionChecklistItem {
  id: string;
  label: string;
  section: ChecklistSectionKey;
  condition: 'SOUND' | 'ATTENTION_REQUIRED' | 'DAMAGED' | 'NOT_APPLICABLE';
  observation?: string;
  notes?: string;
  photoIds?: string[];
  severity?: ObservationSeverity;
  verificationStatus?: ObservationVerification;
  checked?: boolean;
}

export interface CustomerFacingExplanation {
  whatWeFound: string;
  whatItMayMean: string;
  whatWeRecommendNext: string;
  whatWeCannotConfirmYet: string;
}

export interface StructuredInspectionSummary {
  overallCondition: string;
  observedIssues: string[];
  possibleStormDamage: boolean;
  urgentIssues: string[];
  recommendedNextStep:
    | 'REPAIR'
    | 'REPLACEMENT'
    | 'FURTHER_INSPECTION'
    | 'MAINTENANCE'
    | 'INSURANCE_DOCUMENTATION'
    | 'EMERGENCY_RESPONSE'
    | 'NO_IMMEDIATE_ACTION';
  measurementStatus?: string;
}

export interface DamageObservation {
  id: string; // dmg_xxx
  inspectionId: string;
  propertyId?: string;
  roofId?: string;
  component?: 'SHINGLES' | 'RIDGE' | 'FLASHING' | 'GUTTERS' | 'DECKING' | 'SOFFIT' | 'PIPE_BOOT' | 'CHIMNEY' | string;
  category?: DamageCategory;
  area?: RoofArea;
  damageType?: 'HAIL_IMPACT' | 'WIND_UPLIFT' | 'MISSING_SHINGLE' | 'PUNCTURE' | 'LEAK_WATER_ENTRY' | 'DEBRIS_IMPACT' | 'BLISTERING' | string;
  severity: ObservationSeverity;
  description: string;
  evidence?: string;
  photoUrl?: string;
  photoRecordId?: string;
  photoIds?: string[];
  slopeLocation?: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST' | 'VALLEY' | 'RIDGE' | string;
  verificationStatus?: ObservationVerification;
  inspector?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Inspection {
  id: string; // insp_xxx
  propertyId: string;
  customerId?: string;
  projectId?: string;
  roofId?: string;
  appointmentId?: string;
  inspectorUserId?: string;
  inspectorName?: string;
  scheduledDate: string;
  completedDate?: string;
  submittedAt?: string;
  submittedBy?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  status:
    | 'SCHEDULED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'NOT_STARTED'
    | 'SUBMITTED'
    | 'REVIEWED'
    | 'CLOSED';
  reviewStatus?: 'PENDING_REVIEW' | 'APPROVED' | 'REVISION_REQUESTED';
  inspectionType: 'FULL_DIAGNOSTIC' | 'STORM_DAMAGE' | 'LEAK_EMERGENCY' | 'WARRANTY' | 'MAINTENANCE_CHECK';
  findingsSummary?: string;
  recommendation?: 'MONITOR' | 'ROUTINE_MAINTENANCE' | 'MINOR_REPAIR' | 'MAJOR_REPAIR' | 'FULL_REPLACEMENT';
  recommendedNextStep?:
    | 'REPAIR'
    | 'REPLACEMENT'
    | 'FURTHER_INSPECTION'
    | 'MAINTENANCE'
    | 'INSURANCE_DOCUMENTATION'
    | 'EMERGENCY_RESPONSE'
    | 'NO_IMMEDIATE_ACTION';
  damageObservations: DamageObservation[];
  photoRecordIds: string[];
  pdfDocumentId?: string;
  atticInspected: boolean;
  ventilationAdequate: boolean;
  flashingCondition: 'SOUND' | 'DETERIORATED' | 'MISSING';
  deckingCondition: 'SOLID' | 'SOFT_SPOTS' | 'ROTTED';
  approximateSquares?: number;
  customerPresent: boolean;
  characteristics?: StructuredRoofCharacteristics;
  checklistItems?: InspectionChecklistItem[];
  structuredSummary?: StructuredInspectionSummary;
  customerFacingExplanation?: CustomerFacingExplanation;
  internalNotes?: string;
  customerNotes?: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface FieldCheckIn {
  id: string; // chk_xxx
  appointmentId?: string;
  propertyId: string;
  userId: string;
  userName?: string;
  checkInTime: string;
  checkOutTime?: string;
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
  notes?: string;
  createdAt: string;
}

export interface RoofModel {
  id: string; // rmod_xxx
  propertyId: string;
  measurementId?: string;
  version: number;
  roofAreaSqFt?: number;
  totalSquares?: number;
  primaryPitch?: string;
  facetsCount?: number;
  ridgesLengthFt?: number;
  valleysLengthFt?: number;
  eavesLengthFt?: number;
  rakesLengthFt?: number;
  stepFlashingLengthFt?: number;
  flashingLengthFt?: number;
  edges?: { type: string; lengthFt: number }[];
  penetrations?: { type: string; count: number }[];
  providerRawReference?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface MeasurementResult {
  totalSquares: number;
  totalAreaSqFt: number;
  predominantPitch: string;
  ridgesLengthFt: number;
  valleysLengthFt: number;
  rakesLengthFt: number;
  eavesLengthFt: number;
  stepFlashingLengthFt: number;
  flashingLengthFt: number;
  facetsCount: number;
  pitchBreakdown?: Record<string, number>;
}

export interface Measurement {
  id: string; // meas_xxx
  propertyId: string;
  projectId?: string;
  roofId?: string;
  inspectionId?: string;
  provider: 'ROOFR' | 'HOVER' | 'EAGLEVIEW' | 'MANUAL';
  providerRequestId?: string;
  providerMeasurementId?: string;
  measurementType?: MeasurementType;
  provenance?: 'VERIFIED_MEASUREMENT' | 'ESTIMATED_MEASUREMENT' | 'AI_DERIVED' | 'CUSTOMER_PROVIDED' | 'THIRD_PARTY';
  status:
    | 'PENDING'
    | 'ORDERED'
    | 'PROCESSING'
    | 'COMPLETED'
    | 'FAILED'
    | 'REQUESTED'
    | 'SUBMITTED'
    | 'READY'
    | 'CANCELLED';
  requestedBy?: string;
  requestedAt: string;
  completedAt?: string;
  version: number;
  providerVersion?: string;
  previousVersionId?: string;
  normalizedData?: MeasurementResult;
  rawReference?: Record<string, any>;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StormEvent {
  id: string; // storm_xxx
  eventName: string; // e.g. "Spring 2026 Severe Hail & Wind Event"
  stormType: 'HAIL' | 'TORNADO' | 'WIND' | 'SEVERE_THUNDERSTORM' | 'TROPICAL';
  dateOccurred: string;
  hailSizeInches?: number;
  windSpeedMph?: number;
  affectedMarkets: string[];
  affectedZipCodes: string[];
  notes?: string;
  active: boolean;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// APPOINTMENTS & COMMUNICATIONS
// ==========================================

export interface Appointment {
  id: string; // appt_xxx
  propertyId: string;
  customerId?: string;
  leadId?: string;
  projectId?: string;
  assignedUserId?: string;
  title: string;
  appointmentType: 'DIAGNOSTIC_INSPECTION' | 'STORM_ASSESSMENT' | 'PROPOSAL_REVIEW' | 'PRE_CONSTRUCTION' | 'FINAL_QC';
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  address: string;
  notes?: string;
  cancellationReason?: string;
  calendarEventId?: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface Communication {
  id: string; // comm_xxx
  channel: CommunicationChannel;
  direction: 'INBOUND' | 'OUTBOUND' | 'INTERNAL';
  sender: string; // e.g. staff name, customer phone, or system
  recipient: string;
  customerId?: string;
  propertyId?: string;
  leadId?: string;
  projectId?: string;
  appointmentId?: string;
  subject?: string;
  body: string;
  status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'RECEIVED';
  provider?: 'TWILIO' | 'RESEND' | 'INTERNAL';
  externalProviderId?: string;
  attachmentFileIds?: string[];
  timestamp: string;
  isDemo?: boolean;
  createdAt: string;
}

export interface Task {
  id: string; // task_xxx
  projectId?: string;
  leadId?: string;
  customerId?: string;
  propertyId?: string;
  assignedUserId?: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
  completedAt?: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// DOCUMENTS, PHOTOS & SECURE FILES
// ==========================================

export interface FileRecord {
  id: string; // fil_xxx
  filename: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string; // Secure internal storage path
  visibility: 'PRIVATE' | 'CUSTOMER_PORTAL' | 'INTERNAL_ONLY';
  category: 'INSPECTION' | 'INSURANCE' | 'CONTRACT' | 'MEASUREMENT' | 'PHOTO' | 'INVOICE' | 'WARRANTY';
  uploaderUserId?: string;
  customerId?: string;
  propertyId?: string;
  projectId?: string;
  version: number;
  status: 'READY' | 'UPLOADING' | 'ARCHIVED';
  isDemo?: boolean;
  createdAt: string;
}

export interface Document {
  id: string; // doc_xxx
  title: string;
  documentType: 'INSPECTION_REPORT' | 'ROOFR_MEASUREMENT' | 'ESTIMATE' | 'PROPOSAL' | 'INSURANCE_SCOPE' | 'WARRANTY_CERTIFICATE' | 'CONTRACT' | 'INVOICE';
  fileRecordId: string;
  customerId?: string;
  propertyId?: string;
  projectId?: string;
  inspectionId?: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Photo {
  id: string; // pht_xxx
  fileRecordId?: string;
  propertyId: string;
  projectId?: string;
  inspectionId?: string;
  caption?: string;
  description?: string;
  photoUrl: string;
  thumbnailUrl?: string;
  damageObservationId?: string;
  area?: RoofArea;
  category:
    | 'OVERVIEW'
    | 'DAMAGE_HAIL'
    | 'DAMAGE_WIND'
    | 'FLASHING'
    | 'VALLEY'
    | 'RIDGE'
    | 'GUTTERS'
    | 'DECKING'
    | 'ATTIC'
    | 'PIPE_BOOT'
    | 'SOFFIT'
    | 'COMPLETED_WORK'
    | string;
  uploaderId?: string;
  uploaderName?: string;
  originalTimestamp?: string;
  visibility?: 'PRIVATE' | 'STAFF_ONLY' | 'CUSTOMER_PORTAL' | 'PUBLIC';
  aiAnalysisStatus?: 'NOT_CONFIGURED' | 'PENDING' | 'REQUIRES_HUMAN_REVIEW' | 'REVIEWED';
  aiObservations?: {
    observation: string;
    confidence: number;
    uncertainty: string;
    modelVersion: string;
    timestamp: string;
  }[];
  isDemo?: boolean;
  createdAt: string;
}

// ==========================================
// ESTIMATES, PROPOSALS & PAYMENTS
// ==========================================

export type EstimateCategory =
  | 'ROOFING'
  | 'TEAR_OFF'
  | 'INSTALLATION'
  | 'UNDERLAYMENT'
  | 'FLASHING'
  | 'VENTILATION'
  | 'DECKING'
  | 'METAL'
  | 'GUTTERS'
  | 'SKYLIGHTS'
  | 'REPAIR'
  | 'EMERGENCY'
  | 'LABOR'
  | 'SUBCONTRACTOR'
  | 'DISPOSAL'
  | 'PERMITS'
  | 'MATERIALS'
  | 'ACCESSORY'
  | 'OTHER'
  | string;

export type EstimateStatus =
  | 'DRAFT'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'SENT'
  | 'VIEWED'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'EXPIRED'
  | 'REVISED'
  | 'CANCELLED';

export interface InsuranceEstimateMetadata {
  insuranceRelated: boolean;
  claimNumber?: string;
  carrier?: string;
  adjusterName?: string;
  adjusterPhone?: string;
  adjusterEmail?: string;
  dateOfLoss?: string;
  inspectionDate?: string;
  claimStatus?: 'CLAIM_FILED' | 'ADJUSTER_MEETING_PENDING' | 'APPROVED' | 'PARTIALLY_APPROVED' | 'SUPPLEMENT_FILED' | 'DENIED' | 'CLOSED';
  deductible?: number;
  approvedAmount?: number;
  supplementalAmount?: number;
  customerResponsibility?: number;
  insuranceNotes?: string;
  documentationStatus?: 'PENDING' | 'COMPLETE';
}

export interface EstimateLineItem {
  id: string;
  estimateId?: string;
  description: string;
  category: EstimateCategory;
  quantity: number;
  unit: 'SQ' | 'LF' | 'EA' | 'HR' | 'ROLL' | 'SQFT' | string;
  unitPrice: number;
  totalPrice: number;
  extendedPrice?: number;
  internalUnitCost?: number;
  internalExtendedCost?: number;
  laborCost?: number;
  materialCost?: number;
  subcontractorCost?: number;
  otherCost?: number;
  margin?: number;
  taxable?: boolean;
  roofArea?: string;
  roofSystem?: string;
  material?: string;
  manufacturer?: string;
  product?: string;
  wasteFactor?: number;
  notes?: string;
  source?: 'PRICE_BOOK' | 'SCOPE_TEMPLATE' | 'MANUAL' | 'ROOFR_MEASUREMENT' | string;
  sortOrder?: number;
}

export interface EstimateVersion {
  id: string;
  estimateId: string;
  versionNumber: number;
  measurementId?: string;
  measurementVersion?: number;
  measurementProvenance?: string;
  priceBookId?: string;
  priceBookVersion?: string;
  subtotal: number;
  discounts: number;
  adjustments: number;
  tax: number;
  total: number;
  internalCost?: number;
  estimatedGrossProfit?: number;
  estimatedMargin?: number;
  lineItems: EstimateLineItem[];
  reasonForRevision?: string;
  createdBy: string;
  createdAt: string;
}

export interface Estimate {
  id: string; // est_xxx
  estimateNumber: string; // e.g. "EST-2026-0042"
  businessId?: string;
  divisionId?: string;
  marketId?: string;
  customerId: string;
  propertyId: string;
  roofId?: string;
  roofRecordId?: string;
  projectId?: string;
  leadId?: string;
  inspectionId?: string;
  measurementId?: string;
  measurementVersionId?: string;
  measurementProvenance?: string;
  priceBookId?: string;
  priceBookVersion?: string;
  scopeTemplateId?: string;
  title: string;
  version: number;
  status: EstimateStatus;
  estimateType?: 'REPLACEMENT' | 'REPAIR' | 'STORM_RESTORATION' | 'EMERGENCY_TARP' | 'MAINTENANCE';
  pricingMethod?: 'UNIT_PRICE' | 'PRICE_BOOK' | 'TIME_AND_MATERIALS' | 'INSURANCE_SCHEDULE';
  lineItems: EstimateLineItem[];
  subtotal: number;
  discounts: number;
  adjustments: number;
  taxRate?: number;
  tax: number;
  total: number;
  internalCost?: number;
  estimatedGrossProfit?: number;
  estimatedMargin?: number;
  notes?: string;
  internalNotes?: string;
  customerNotes?: string;
  validUntil: string;
  insuranceMetadata?: InsuranceEstimateMetadata;
  versions?: EstimateVersion[];
  approvedBy?: string;
  approvedAt?: string;
  convertedProposalId?: string;
  createdBy?: string;
  updatedBy?: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PriceBookItem {
  id: string;
  itemCode: string;
  category: string;
  description: string;
  unit: string;
  unitPrice: number;
  materialCost: number;
  laborCost: number;
  subcontractorCost: number;
  otherCost: number;
  internalTotalCost: number;
  defaultWasteFactor?: number;
  taxable: boolean;
  notes?: string;
  active: boolean;
}

export interface PriceBookVersion {
  id: string;
  versionNumber: string;
  effectiveDate: string;
  notes?: string;
  items: PriceBookItem[];
}

export interface PriceBook {
  id: string; // pb_xxx
  name: string;
  marketId: string;
  category: 'RESIDENTIAL_STANDARD' | 'STORM_RESTORATION' | 'REPAIR' | 'EMERGENCY' | 'COMMERCIAL';
  activeVersionId: string;
  versions: PriceBookVersion[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScopeTemplateItem {
  itemCode: string;
  category: string;
  description: string;
  unit: string;
  unitPrice: number;
  quantityFormula: 'TOTAL_SQUARES' | 'EAVES_LF' | 'VALLEYS_LF' | 'RIDGES_LF' | 'RAKES_LF' | 'STEP_FLASHING_LF' | 'FIXED';
  defaultQuantityMultiplier: number;
  isOptional: boolean;
  sortOrder: number;
}

export interface ScopeTemplate {
  id: string; // stpl_xxx
  name: string;
  category: 'REPLACEMENT' | 'STORM_RESTORATION' | 'REPAIR' | 'EMERGENCY_TARP' | 'MAINTENANCE';
  description: string;
  items: ScopeTemplateItem[];
  defaultTerms: string;
  defaultExclusions: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProposalTier {
  id: string;
  name: string; // e.g. "Good — GAF Natural Shadow", "Better — Timberline HDZ", "Best — Designer Armorshield II"
  shingleType: string;
  warrantyYears: number;
  price: number;
  features: string[];
  isRecommended?: boolean;
}

export interface ProposalOption {
  id: string;
  tier: 'GOOD' | 'BETTER' | 'BEST' | 'CUSTOM';
  name: string;
  roofSystem: string;
  manufacturer: string;
  product: string;
  color?: string;
  warrantyYears: number;
  warrantyDescription?: string;
  price: number;
  internalCost?: number;
  margin?: number;
  scope: string[];
  upgrades?: string[];
  exclusions?: string[];
  isRecommended?: boolean;
  imageUrl?: string;
}

export interface DigitalAcceptanceRecord {
  signerName: string;
  signerEmail: string;
  signedAt: string;
  signerIpAddress?: string;
  consentText: string;
  documentHash?: string;
  acceptanceMethod: 'CLICK_TO_SIGN' | 'DRAWN_SIGNATURE' | 'INTERNAL_STAFF_RECORDED';
  signatureDataUrl?: string;
  provider: 'INTERNAL_E_SIGN' | 'DOCUSIGN' | 'DROPBOX_SIGN';
  providerReferenceId?: string;
}

export interface Proposal {
  id: string; // propos_xxx
  proposalNumber: string; // e.g. "PROP-2026-0042"
  estimateId: string;
  estimateVersionId?: string;
  projectId?: string;
  customerId: string;
  propertyId: string;
  leadId?: string;
  roofRecordId?: string;
  title: string;
  status: ProposalStatus;
  introduction?: string;
  projectSummary?: string;
  diagnosisSummary?: string;
  options: ProposalOption[];
  selectedOptionId?: string;
  tiers?: ProposalTier[];
  selectedTierId?: string;
  scopeOfWork: string;
  terms: string;
  exclusions?: string[];
  assumptions?: string[];
  depositRequired?: number;
  depositPaid?: boolean;
  depositStatus?: 'PENDING' | 'PAID' | 'WAIVED_INSURANCE';
  financingOptionNotes?: string;
  warrantyInformation?: string;
  publicAccessToken?: string;
  photos?: {
    photoId: string;
    url: string;
    caption: string;
    category: string;
    area?: string;
  }[];
  sentAt?: string;
  viewedAt?: string;
  acceptedAt?: string;
  declinedAt?: string;
  declinedReason?: string;
  expiresAt: string;
  acceptance?: DigitalAcceptanceRecord;
  signatureName?: string;
  signatureDate?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string; // sale_xxx
  proposalId: string;
  estimateId: string;
  projectId: string;
  customerId: string;
  propertyId: string;
  leadId?: string;
  soldAmount: number;
  depositRequired?: number;
  depositReceived?: number;
  selectedOptionName: string;
  roofSystem: string;
  salesRepresentativeId?: string;
  salesRepresentativeName?: string;
  attributionSource?: string;
  soldDate: string;
  status: 'PENDING_DEPOSIT' | 'DEPOSIT_RECEIVED' | 'IN_PRODUCTION' | 'PAID_IN_FULL';
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string; // pay_xxx
  projectId: string;
  customerId: string;
  invoiceId?: string;
  amount: number;
  currency: string;
  paymentMethod: 'CREDIT_CARD' | 'ACH' | 'CHECK' | 'FINANCING' | 'INSURANCE_CHECK';
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  receiptNumber: string;
  processedAt?: string;
  notes?: string;
  isDeductiblePayment?: boolean;
  texasHb2102DeclarationConfirmed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLineItem {
  id?: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string; // inv_xxx
  projectId: string;
  customerId: string;
  invoiceNumber: string;
  title?: string;
  milestoneType?: 'DEPOSIT' | 'PROGRESS' | 'FINAL_COMPLETION' | 'SUPPLEMENT' | 'DEDUCTIBLE' | 'OTHER';
  amountDue: number;
  amountPaid: number;
  balance: number;
  status: 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'VOID';
  dueDate: string;
  issuedAt?: string;
  paidAt?: string;
  paymentTerms?: string;
  items?: InvoiceLineItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// MAINTENANCE & MEMBERSHIPS
// ==========================================

export interface MaintenancePlan {
  id: string; // mplan_xxx
  name: string; // e.g. "Residential Roof Shield Annual Diagnostic Plan"
  annualPrice: number;
  inspectionFrequencyMonths: number;
  description: string;
  benefits: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceEnrollment {
  id: string; // menr_xxx
  planId: string;
  customerId: string;
  propertyId: string;
  roofId: string;
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED';
  startDate: string;
  nextScheduledInspectionDate?: string;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// OPERATIONS, CREWS & MATERIALS
// ==========================================

export interface Crew {
  id: string; // crew_xxx
  name: string;
  leadForemanName: string;
  phone: string;
  specialization: 'SHINGLE_REPLACEMENT' | 'REPAIR_SPECIALISTS' | 'METAL_SPECIALISTS';
  active: boolean;
  crewSize?: number;
  insuranceExpiryDate?: string;
  workersCompVerified?: boolean;
  market?: string;
  notes?: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Worker {
  id: string; // wrk_xxx
  crewId: string;
  name: string;
  role: 'FOREMAN' | 'INSTALLER' | 'CLEANUP' | 'GROUND_SUPPORT';
  active: boolean;
  createdAt: string;
}

export interface Subcontractor {
  id: string; // sub_xxx
  companyName: string;
  trade: 'GUTTERS' | 'SOLAR_DETACH' | 'SIDING' | 'INSULATION';
  contactPerson: string;
  phone: string;
  email: string;
  insuranceExpiryDate?: string;
  active: boolean;
  createdAt: string;
}

export interface Material {
  id: string; // mat_xxx
  name: string;
  sku: string;
  category: 'SHINGLE' | 'UNDERLAYMENT' | 'STARTER' | 'VENTILATION' | 'FLASHING' | 'NAILS' | 'CAULK';
  manufacturer: string;
  unit: string;
  costPerUnit: number;
  active: boolean;
  createdAt: string;
}

export interface Vendor {
  id: string; // vend_xxx
  name: string; // e.g. ABC Supply, Beacon Roofing Supply, SRS Distribution
  contactName: string;
  phone: string;
  email: string;
  accountNumber?: string;
  city: string;
  state: string;
  active: boolean;
  createdAt: string;
}

export interface PurchaseOrderItem {
  materialId?: string;
  description: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
}

export interface PurchaseOrder {
  id: string; // po_xxx
  projectId: string;
  vendorId: string;
  poNumber: string;
  status: 'DRAFT' | 'ORDERED' | 'DELIVERED' | 'CANCELLED';
  totalCost: number;
  deliveryDate?: string;
  rooftopDelivery?: boolean;
  deliveryAddress?: string;
  deliveryInstructions?: string;
  supplierConfirmationNumber?: string;
  items?: PurchaseOrderItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectCost {
  id: string; // cost_xxx
  projectId: string;
  category: 'MATERIALS' | 'LABOR' | 'PERMITS' | 'EQUIPMENT' | 'DUMPSTER' | 'OTHER';
  description: string;
  amount: number;
  dateIncurred: string;
  createdAt: string;
}

// ==========================================
// CONTENT, REVIEWS & RESOURCES
// ==========================================

export interface Review {
  id: string; // rev_xxx
  customerId?: string;
  authorName: string;
  city: string;
  state: string;
  rating: number; // 1 to 5
  reviewText: string;
  serviceProvided: string;
  verifiedCustomer: boolean;
  isPublished: boolean;
  date: string;
  createdAt: string;
}

export interface FAQ {
  id: string; // faq_xxx
  question: string;
  answer: string;
  category: 'GENERAL' | 'STORM_DAMAGE' | 'INSURANCE' | 'MAINTENANCE' | 'COST';
  orderIndex: number;
  published: boolean;
  createdAt: string;
}

export interface Resource {
  id: string; // res_xxx
  title: string;
  slug: string;
  summary: string;
  category: 'GUIDE' | 'STORM_CHECKLIST' | 'INSURANCE_TIPS' | 'MAINTENANCE';
  content: string;
  published: boolean;
  readingTimeMinutes: number;
  publishedAt: string;
  createdAt: string;
}

export interface Service {
  id: string; // srvc_xxx
  title: string;
  slug: string;
  description: string;
  detailedContent: string;
  diagnosticProcess: string[];
  commonSymptoms: string[];
  active: boolean;
  createdAt: string;
}

export interface RoofingSystem {
  id: string; // sys_xxx
  name: string;
  slug: string;
  description: string;
  expectedLifespanYears: string;
  windRatingMph: number;
  impactResistance: string; // Class 3, Class 4 UL 2218
  bestSuitedFor: string;
  active: boolean;
  createdAt: string;
}

export interface ProblemType {
  id: string; // prob_xxx
  title: string;
  slug: string;
  urgency: 'ROUTINE' | 'MODERATE' | 'CRITICAL_LEAK' | 'STORM_EMERGENCY';
  symptoms: string[];
  consequencesIfDelayed: string;
  recommendedDiagnosticAction: string;
  createdAt: string;
}

// ==========================================
// AUTOMATION, NOTIFICATIONS & AUDIT LOG
// ==========================================

export interface Automation {
  id: string; // auto_xxx
  name: string;
  triggerEvent: string; // e.g. "LEAD_CREATED", "APPOINTMENT_SCHEDULED"
  actionType: 'SEND_NOTIFICATION' | 'CREATE_TASK' | 'UPDATE_STATUS' | 'TRIGGER_WEBHOOK';
  conditionRules: Record<string, any>;
  enabled: boolean;
  executionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationExecution {
  id: string; // aexec_xxx
  automationId: string;
  triggerEventId: string;
  status: 'SUCCESS' | 'FAILED';
  resultSummary: string;
  executedAt: string;
}

export interface Notification {
  id: string; // notif_xxx
  recipientUserId?: string;
  recipientEmail?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
  type: 'LEAD_ALERT' | 'APPOINTMENT' | 'PROPOSAL_VIEWED' | 'STORM_WARNING' | 'SYSTEM';
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string; // audit_xxx
  userId?: string;
  userRole?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'PROPOSAL_APPROVAL' | 'FINANCIAL_UPDATE' | 'AUTHENTICATION' | 'EXPORT';
  entityType: string;
  entityId: string;
  previousState?: Record<string, any>;
  newState?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

// ==========================================
// INTEGRATIONS, JOBS & WEBHOOKS
// ==========================================

export type IntegrationProvider =
  | 'ROOFR'
  | 'GOOGLE'
  | 'STRIPE'
  | 'TWILIO'
  | 'RESEND'
  | 'GOOGLE_CALENDAR'
  | 'HOVER'
  | 'EAGLEVIEW'
  | 'XACTIMATE_WORKFLOW'
  | 'ACCULYNX'
  | 'JOBNIMBUS'
  | 'GOHIGHLEVEL'
  | 'HUBSPOT'
  | 'QUICKBOOKS';

export interface Integration {
  id: string; // int_xxx
  provider: IntegrationProvider;
  category: 'MEASUREMENTS' | 'PAYMENTS' | 'COMMUNICATION' | 'CALENDAR' | 'CRM' | 'ACCOUNTING';
  status: 'CONNECTED' | 'NOT_CONNECTED' | 'ERROR' | 'CONFIG_REQUIRED';
  enabled: boolean;
  connectedAt?: string;
  lastSyncAt?: string;
  lastError?: string;
  configurationMetadata: Record<string, any>;
  webhookStatus: 'ACTIVE' | 'INACTIVE' | 'NOT_CONFIGURED';
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationEvent {
  id: string; // ievt_xxx
  integrationId: string;
  provider: IntegrationProvider;
  direction: 'INCOMING' | 'OUTGOING';
  eventType: string;
  payload: Record<string, any>;
  status: 'SUCCESS' | 'ERROR';
  errorMessage?: string;
  timestamp: string;
}

export interface WebhookEvent {
  id: string; // whk_xxx
  provider: string;
  signatureVerified: boolean;
  idempotencyKey?: string;
  payload: Record<string, any>;
  processedStatus: 'RECEIVED' | 'PROCESSED' | 'FAILED' | 'REPLAYED';
  processingAttempts: number;
  errorMessage?: string;
  receivedAt: string;
  processedAt?: string;
}

export interface BackgroundJob {
  id: string; // job_xxx
  jobType: 'EMAIL' | 'SMS' | 'ROOFR_SYNC' | 'AI_ANALYSIS' | 'STORM_INGESTION' | 'ANALYTICS';
  payload: Record<string, any>;
  status: 'QUEUED' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'RETRYING';
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  scheduledFor: string;
  completedAt?: string;
  createdAt: string;
}

// ==========================================
// FEATURE FLAGS, BUSINESS RULES & SETTINGS
// ==========================================

export interface FeatureFlag {
  id: string; // flag_xxx
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  enabledFor: 'EVERYONE' | 'ROLES' | 'MARKETS' | 'BETA_USERS';
  allowedRoles?: UserRole[];
  allowedMarkets?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BusinessRule {
  id: string; // rule_xxx
  category: 'LEAD_SCORING' | 'EMERGENCY_ROUTING' | 'APPOINTMENT_SLOTS' | 'DISCOUNT_LIMITS';
  name: string;
  ruleKey: string;
  parameters: Record<string, any>;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SystemSetting {
  id: string; // sett_xxx
  category: 'BUSINESS' | 'COMMUNICATION' | 'OPERATIONS' | 'SECURITY';
  key: string;
  value: any;
  description: string;
  isEncrypted?: boolean;
  updatedAt: string;
}

export interface SystemHealth {
  status: 'OPERATIONAL' | 'DEGRADED' | 'ACTION_REQUIRED';
  timestamp: string;
  services: {
    database: { status: 'HEALTHY' | 'UNHEALTHY'; latencyMs: number };
    api: { status: 'HEALTHY' | 'UNHEALTHY'; uptimeSeconds: number };
    integrations: { status: 'HEALTHY' | 'DEGRADED'; connectedCount: number; unconfiguredCount: number };
    jobQueue: { status: 'HEALTHY' | 'DEGRADED'; pendingJobs: number };
  };
  metrics: {
    totalLeads: number;
    totalProperties: number;
    totalProjects: number;
    activeUsers: number;
  };
}
