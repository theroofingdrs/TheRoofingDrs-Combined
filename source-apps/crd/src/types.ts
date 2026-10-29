export * from './schemas/crmCore';

export type LeadType =
  | 'Emergency'
  | 'Storm Damage'
  | 'Hail Damage'
  | 'Wind Damage'
  | 'Insurance Claim'
  | 'Inspection'
  | 'Repair'
  | 'Replacement'
  | 'Coating/Restoration'
  | 'PPP/Maintenance'
  | 'Property Management'
  | 'Cost Calculator'
  | 'General';

export type LeadPriority = 'Emergency' | 'High' | 'Normal' | 'Low';

export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Inspection Scheduled'
  | 'Inspected'
  | 'Scope Developed'
  | 'Proposal Sent'
  | 'Won'
  | 'Lost';

export type PropertyType =
  | 'Church'
  | 'School'
  | 'Hospital'
  | 'Healthcare'
  | 'Retail'
  | 'Strip Mall'
  | 'Industrial'
  | 'Office'
  | 'HOA'
  | 'Apartment'
  | 'Multifamily'
  | 'Hotel'
  | 'Restaurant'
  | 'Municipal'
  | 'Commercial'
  | 'Other';

export type RoofSystemType =
  | 'TPO'
  | 'EPDM'
  | 'PVC'
  | 'Modified Bitumen'
  | 'BUR'
  | 'Metal'
  | 'Roof Coating'
  | 'Architectural Shingle'
  | 'Tile'
  | 'Slate'
  | 'Unknown';

export interface PhotoAttachment {
  id: string;
  name: string;
  dataUrl: string;
  size?: number;
  type?: string;
  uploadedAt: string;
  caption?: string;
}

export interface Organization {
  organizationId: string;
  companyName: string;
  propertyManager: boolean;
  industry: string;
  website?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  contactId: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  propertyId: string;
  organizationId: string;
  propertyName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  propertyType: PropertyType;
  buildingCount?: number;
  approximateRoofArea?: string | number;
  roofSystem?: RoofSystemType;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  leadId: string;
  organizationId: string;
  contactId: string;
  propertyId: string;
  leadType: LeadType;
  propertyType: PropertyType;
  roofSystem: RoofSystemType;
  priority: LeadPriority;
  source: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  landingPage?: string;
  referrer?: string;
  status: LeadStatus;
  assignedTo: string;
  message?: string;
  notes?: string;
  photos: PhotoAttachment[];
  stormMetadata?: {
    stormDate?: string;
    stormDamageType?: string;
    existingClaim?: boolean;
    claimNumber?: string;
    carrier?: string;
    adjusterAssigned?: boolean;
    adjusterInspectionScheduled?: boolean;
    needCrdPresent?: boolean;
  };
  emergencyMetadata?: {
    emergencyType?: string;
    waterEnteringBuilding?: boolean;
    buildingOccupied?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEvent {
  id: string;
  leadId: string;
  title: string;
  description: string;
  timestamp: string;
  author: string;
}

export interface CalculatorSubmission {
  id: string;
  inputs: {
    squareFootage: number;
    roofSystem: RoofSystemType;
    propertyType: PropertyType;
    condition: string;
    desiredWork: 'Replacement' | 'Restoration/Coating' | 'Repair';
    accessComplexity: 'Standard' | 'Moderate' | 'Complex / High-Rise';
    address?: string;
    contactName?: string;
    companyName?: string;
    phone?: string;
    email?: string;
  };
  results: {
    estimatedLow: number;
    estimatedHigh: number;
    disclaimer: string;
  };
  createdAt: string;
}

export interface AdminStats {
  total: number;
  emergency: number;
  storm: number;
  insurance: number;
  inspection: number;
  ppp: number;
  calculator: number;
  byStatus: Record<LeadStatus, number>;
}
