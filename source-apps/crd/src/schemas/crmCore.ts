import { z } from 'zod';

/**
 * ============================================================================
 * COMMERCIAL ROOF DOCTORS (CRD) — CORE CRM DATA MODEL SCHEMAS
 * ============================================================================
 * Foundational TypeScript interfaces and Zod validation schemas for Companies
 * (Accounts/Organizations), Properties, and Contacts.
 *
 * Designed for strict relational integrity, commercial-first domain operations,
 * and seamless persistence across local atomic storage or future databases.
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// ENUMS & SHARED VALUE OBJECTS
// ----------------------------------------------------------------------------

export const CompanyTypeEnum = z.enum([
  'Property Management Company',
  'Commercial Property Owner',
  'Facility Management Company',
  'Church / House of Worship',
  'School / Educational Facility',
  'Apartment / Multifamily Operator',
  'Industrial / Warehouse Facility',
  'Retail / Shopping Center',
  'Office Building / Corporate',
  'Healthcare / Medical Facility',
  'HOA / Condominium Association',
  'Municipality / Government',
  'General Contractor / Partner',
  'Other Commercial Organization',
]);
export type CompanyType = z.infer<typeof CompanyTypeEnum>;

export const AccountStatusEnum = z.enum([
  'Active',
  'Prospect',
  'Lead',
  'Under Contract',
  'Past Client',
  'Inactive',
  'Archived',
]);
export type AccountStatus = z.infer<typeof AccountStatusEnum>;

export const ContactRoleEnum = z.enum([
  'Owner',
  'Property Manager',
  'Facility Manager',
  'Maintenance Director',
  'Maintenance Manager',
  'General Manager',
  'Pastor / Church Administrator',
  'School Superintendent / Administrator',
  'Board President / Member',
  'Asset Manager',
  'Regional Director',
  'Insurance Adjuster',
  'Insurance Agent',
  'Roofing Consultant',
  'Tenant Representative',
  'Other Decision Maker',
]);
export type ContactRole = z.infer<typeof ContactRoleEnum>;

export const PreferredContactMethodEnum = z.enum([
  'Phone',
  'Email',
  'SMS / Text',
  'In-Person Meeting',
  'Any',
]);
export type PreferredContactMethod = z.infer<typeof PreferredContactMethodEnum>;

export const PropertyTypeEnum = z.enum([
  'Commercial',
  'Industrial / Warehouse',
  'Office Building',
  'Retail / Shopping Center',
  'Strip Mall',
  'Church / House of Worship',
  'School / Educational Facility',
  'Healthcare / Hospital',
  'Apartment / Multifamily Complex',
  'HOA Community / Condos',
  'Hotel / Hospitality',
  'Restaurant / Food Service',
  'Distribution Center / Logistics',
  'Municipal / Government Building',
  'Other Commercial Facility',
]);
export type PropertyType = z.infer<typeof PropertyTypeEnum>;

export const OccupancyStatusEnum = z.enum([
  'Owner-Occupied',
  'Single-Tenant',
  'Multi-Tenant Commercial',
  'Residential Tenants',
  'Vacant',
  'Under Renovation',
  'Unknown',
]);
export type OccupancyStatus = z.infer<typeof OccupancyStatusEnum>;

export const PropertyStatusEnum = z.enum([
  'Active',
  'Pending Inspection',
  'Proposal Active',
  'Maintenance Contract (PPP)',
  'Prospect',
  'Inactive',
  'Archived',
]);
export type PropertyStatus = z.infer<typeof PropertyStatusEnum>;

// Standard Postal Address Schema
export const AddressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  suite: z.string().optional().default(''),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required').default('TX'),
  zip: z.string().min(5, 'Valid 5-digit ZIP code is required'),
  county: z.string().optional().default(''),
  country: z.string().default('USA'),
});
export type Address = z.infer<typeof AddressSchema>;

// Geographic Coordinates Schema
export const GeoCoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
});
export type GeoCoordinates = z.infer<typeof GeoCoordinatesSchema>;

// Facility Site Access & Safety Schema
export const SiteAccessInstructionsSchema = z.object({
  gateCode: z.string().optional().default(''),
  knoxBoxLocation: z.string().optional().default(''),
  roofAccessLocation: z.string().optional().default(''), // e.g. "External ladder rear dock, or interior roof hatch 2nd floor mechanical"
  accessType: z.enum(['Ground Ladder', 'Fixed Exterior Ladder', 'Interior Hatch', 'Stairwell', 'Lift Required', 'Other']).default('Ground Ladder'),
  siteHazards: z.string().optional().default(''), // e.g. "Skylights without safety screens, live overhead lines"
  checkInRequired: z.boolean().default(false),
  checkInLocation: z.string().optional().default(''), // e.g. "Main office suite 100"
  specialNotes: z.string().optional().default(''),
});
export type SiteAccessInstructions = z.infer<typeof SiteAccessInstructionsSchema>;


// ----------------------------------------------------------------------------
// 1. COMPANY / ORGANIZATION / ACCOUNT SCHEMAS
// ----------------------------------------------------------------------------

/**
 * Company Input Schema (Used for creation and validation)
 */
export const CompanyInputSchema = z.object({
  companyName: z.string().min(2, 'Company or organization name is required'),
  companyType: CompanyTypeEnum.default('Commercial Property Owner'),
  accountStatus: AccountStatusEnum.default('Active'),
  taxId: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  email: z.string().email('Invalid email address').optional().or(z.literal('')).default(''),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')).default(''),
  billingAddress: AddressSchema.optional().default({
    street: '',
    suite: '',
    city: 'Texarkana',
    state: 'TX',
    zip: '75501',
    county: 'Bowie County',
    country: 'USA',
  }),
  isPropertyManager: z.boolean().default(false),
  parentCompanyId: z.string().nullable().optional(), // For multi-tier holding companies or national portfolios
  primaryContactId: z.string().nullable().optional(),
  paymentTerms: z.string().default('Net 30'), // e.g. "Net 30", "50% Deposit / 50% Completion"
  notes: z.string().optional().default(''),
  tags: z.array(z.string()).default([]),
});
export type CompanyInput = z.infer<typeof CompanyInputSchema>;

/**
 * Full Persisted Company Entity
 */
export const CompanySchema = CompanyInputSchema.extend({
  companyId: z.string().min(1, 'Company ID is required'),
  createdAt: z.string().datetime().or(z.string()),
  updatedAt: z.string().datetime().or(z.string()),
  createdBy: z.string().default('CRD System'),
});
export type Company = z.infer<typeof CompanySchema>;


// ----------------------------------------------------------------------------
// 2. CONTACT SCHEMAS
// ----------------------------------------------------------------------------

/**
 * Contact Input Schema (Used for creation and validation)
 */
export const ContactInputSchema = z.object({
  companyId: z.string().min(1, 'Associated Company ID is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: ContactRoleEnum.default('Property Manager'),
  title: z.string().optional().default(''), // Custom job title, e.g. "Senior Vice President of Commercial Operations"
  email: z.string().email('Valid email address is required').optional().or(z.literal('')).default(''),
  phone: z.string().min(7, 'Primary phone number is required'),
  mobilePhone: z.string().optional().default(''),
  preferredContactMethod: PreferredContactMethodEnum.default('Phone'),
  isPrimaryContact: z.boolean().default(false),
  isBillingContact: z.boolean().default(false),
  isEmergencyContact: z.boolean().default(false),
  assignedPropertyIds: z.array(z.string()).default([]), // Scoped properties this person manages
  mailingAddress: AddressSchema.optional(),
  notes: z.string().optional().default(''),
  isActive: z.boolean().default(true),
});
export type ContactInput = z.infer<typeof ContactInputSchema>;

/**
 * Full Persisted Contact Entity
 */
export const ContactSchema = ContactInputSchema.extend({
  contactId: z.string().min(1, 'Contact ID is required'),
  fullName: z.string().optional(), // Derived convenience field
  createdAt: z.string().datetime().or(z.string()),
  updatedAt: z.string().datetime().or(z.string()),
  createdBy: z.string().default('CRD System'),
});
export type Contact = z.infer<typeof ContactSchema>;


// ----------------------------------------------------------------------------
// 3. PROPERTY SCHEMAS
// ----------------------------------------------------------------------------

/**
 * Property Input Schema (Used for creation and validation)
 */
export const PropertyInputSchema = z.object({
  companyId: z.string().min(1, 'Parent Company / Account ID is required'),
  propertyName: z.string().min(2, 'Property or facility name is required'),
  propertyType: PropertyTypeEnum.default('Commercial'),
  status: PropertyStatusEnum.default('Active'),
  address: AddressSchema,
  coordinates: GeoCoordinatesSchema.optional().default({ latitude: null, longitude: null }),
  totalSquareFootage: z.number().nonnegative().optional().nullable(),
  parcelNumber: z.string().optional().default(''), // Tax Assessor Parcel / APN
  yearBuilt: z.number().int().min(1850).max(2100).optional().nullable(),
  occupancyStatus: OccupancyStatusEnum.default('Owner-Occupied'),
  buildingCount: z.number().int().positive().default(1),
  accessInstructions: SiteAccessInstructionsSchema.default({
    gateCode: '',
    knoxBoxLocation: '',
    roofAccessLocation: '',
    accessType: 'Ground Ladder',
    siteHazards: '',
    checkInRequired: false,
    checkInLocation: '',
    specialNotes: '',
  }),
  primaryContactId: z.string().nullable().optional(), // On-site facility contact
  notes: z.string().optional().default(''),
  tags: z.array(z.string()).default([]),
});
export type PropertyInput = z.infer<typeof PropertyInputSchema>;

/**
 * Full Persisted Property Entity
 */
export const PropertySchema = PropertyInputSchema.extend({
  propertyId: z.string().min(1, 'Property ID is required'),
  createdAt: z.string().datetime().or(z.string()),
  updatedAt: z.string().datetime().or(z.string()),
  createdBy: z.string().default('CRD System'),
});
export type Property = z.infer<typeof PropertySchema>;


// ----------------------------------------------------------------------------
// 4. COMPOSITE & ENRICHED VIEW TYPES (For CRM Command Center & Lists)
// ----------------------------------------------------------------------------

/**
 * Enriched Property view with populated parent Company and Contacts
 */
export interface EnrichedProperty extends Property {
  companyName: string;
  companyType: CompanyType;
  primaryContactName?: string;
  primaryContactPhone?: string;
  buildingCountActual?: number;
  roofAssetsCount?: number;
  totalRoofAreaSquares?: number;
}

/**
 * Enriched Company view with linked Properties and Contacts summary
 */
export interface EnrichedCompany extends Company {
  contactsCount: number;
  propertiesCount: number;
  primaryContact?: Contact;
  activeOpportunitiesCount?: number;
  activeContractsTotalValue?: number;
}

/**
 * Contact with company display name
 */
export interface EnrichedContact extends Contact {
  companyName: string;
  companyType: CompanyType;
}


// ----------------------------------------------------------------------------
// 5. HELPER FACTORY FUNCTIONS FOR ROBUST PERSISTENCE
// ----------------------------------------------------------------------------

export function generateCrdId(prefix: 'org' | 'cnt' | 'prp' | 'bld' | 'rf' | 'insp' | 'prop' | 'proj'): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${prefix}_${timestamp}_${randomSuffix}`;
}

export function createDefaultCompany(input: Partial<CompanyInput> & { companyName: string }): Company {
  const now = new Date().toISOString();
  const validatedInput = CompanyInputSchema.parse(input);
  return {
    ...validatedInput,
    companyId: generateCrdId('org'),
    createdAt: now,
    updatedAt: now,
    createdBy: 'CRD Admin',
  };
}

export function createDefaultContact(input: Partial<ContactInput> & { companyId: string; firstName: string; lastName: string; phone: string }): Contact {
  const now = new Date().toISOString();
  const validatedInput = ContactInputSchema.parse(input);
  return {
    ...validatedInput,
    contactId: generateCrdId('cnt'),
    fullName: `${validatedInput.firstName} ${validatedInput.lastName}`.trim(),
    createdAt: now,
    updatedAt: now,
    createdBy: 'CRD Admin',
  };
}

export function createDefaultProperty(input: Partial<PropertyInput> & { companyId: string; propertyName: string; address: Address }): Property {
  const now = new Date().toISOString();
  const validatedInput = PropertyInputSchema.parse(input);
  return {
    ...validatedInput,
    propertyId: generateCrdId('prp'),
    createdAt: now,
    updatedAt: now,
    createdBy: 'CRD Admin',
  };
}
