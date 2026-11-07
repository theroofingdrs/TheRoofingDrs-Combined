import { submitInquiry } from '../../../../shared/intake-client.ts';
/**
 * The Roof Doctors — Client API SDK
 * Connects the React frontends (Public, CRM, Field, Portal) to the server API.
 */

import type {
  User,
  Lead,
  Customer,
  Property,
  Roof,
  RoofRecord,
  Project,
  Inspection,
  DamageObservation,
  FieldCheckIn,
  Photo,
  Measurement,
  Appointment,
  Communication,
  SystemHealth,
  Service,
  ServiceArea,
  FAQ,
  Resource,
  RoofingSystem,
  ProblemType,
  MaintenancePlan,
  Integration,
  AuditLog,
  FeatureFlag,
  Crew,
  Estimate,
  Proposal,
  Sale,
  Invoice,
  Payment,
  PurchaseOrder,
  Material,
  Vendor,
} from '../../shared/types/index.ts';

const BASE_URL = '/residential/api/v1';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('roof_docs_access_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorBody.error || `API Request failed with status ${res.status}`);
  }

  return res.json();
}

export const api = {
  // System Health
  getHealth: () => request<SystemHealth>('/health'),
  getUsers: () => request<User[]>('/users'),

  // Public Configuration & Content
  getServices: () => request<Service[]>('/services'),
  getServiceAreas: () => request<ServiceArea[]>('/service-areas'),
  getFaqs: () => request<FAQ[]>('/faqs'),
  getResources: () => request<Resource[]>('/resources'),
  getRoofingSystems: () => request<RoofingSystem[]>('/roofing-systems'),
  getProblemTypes: () => request<ProblemType[]>('/problem-types'),
  getMaintenancePlans: () => request<MaintenancePlan[]>('/maintenance-plans'),
  getFeatureFlags: () => request<FeatureFlag[]>('/feature-flags'),

  // Leads
  getLeads: () => request<Lead[]>('/leads'),
  getLead: (id: string) => request<Lead>(`/leads/${id}`),
  createLead: (lead: Partial<Lead>) =>
    submitInquiry<Lead>(BASE_URL + '/leads', lead),
  updateLead: (id: string, updates: Partial<Lead>) =>
    request<Lead>(`/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  checkLeadDuplicates: (params: { phone?: string; email?: string; address?: string; excludeLeadId?: string }) =>
    request<{
      hasMatch: boolean;
      matchedCustomers: Customer[];
      matchedLeads: Lead[];
      reasons: string[];
    }>('/leads/check-duplicates', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
  addLeadNote: (id: string, note: string) =>
    request<{ success: boolean; activity: any; communication: Communication }>(`/leads/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    }),
  assignLead: (id: string, assignedUserId?: string) =>
    request<Lead>(`/leads/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ assignedUserId }),
    }),
  getLeadTimeline: (id: string) =>
    request<{
      lead: Lead;
      activities: any[];
      communications: Communication[];
      appointments: Appointment[];
    }>(`/leads/${id}/timeline`),
  convertLead: (id: string, options?: { existingCustomerId?: string; existingPropertyId?: string }) =>
    request<{
      success: boolean;
      customer: Customer;
      property: Property;
      project: Project;
      roofRecord: RoofRecord;
    }>(`/leads/${id}/convert`, {
      method: 'POST',
      body: JSON.stringify(options || {}),
    }),

  // Customers & Properties & Roofs
  getCustomers: () => request<Customer[]>('/customers'),
  getCustomer: (id: string) => request<Customer>(`/customers/${id}`),
  getCustomer360: (id: string) =>
    request<{
      customer: Customer;
      properties: Property[];
      roofs: Roof[];
      roofRecords: RoofRecord[];
      leads: Lead[];
      projects: Project[];
      inspections: Inspection[];
      appointments: Appointment[];
      communications: Communication[];
      tasks: any[];
      documents: any[];
      estimates: any[];
      proposals: any[];
      payments: any[];
    }>(`/customers/${id}`),
  createCustomer: (customer: Partial<Customer>) =>
    request<Customer>('/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    }),
  updateCustomer: (id: string, updates: Partial<Customer>) =>
    request<Customer>(`/customers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  getProperties: () => request<Property[]>('/properties'),
  getPropertyDetail: (id: string) =>
    request<{
      property: Property;
      customers: Customer[];
      roofs: Roof[];
      roofRecord?: RoofRecord;
      roofRecordEvents: any[];
      leads: Lead[];
      appointments: Appointment[];
      inspections: Inspection[];
      damageObservations: any[];
      measurements: Measurement[];
      projects: Project[];
      documents: any[];
      photos: any[];
      storms: any[];
      communications: Communication[];
    }>(`/properties/${id}`),
  createProperty: (property: Partial<Property>) =>
    request<{ property: Property; roof: Roof; roofRecord: RoofRecord }>('/properties', {
      method: 'POST',
      body: JSON.stringify(property),
    }),
  updateProperty: (id: string, updates: Partial<Property>) =>
    request<Property>(`/properties/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  getRoofs: () => request<Roof[]>('/roofs'),
  createRoof: (roofData: Partial<Roof> & { replacesRoofId?: string; replacementReason?: string }) =>
    request<{ roof: Roof; property: Property; roofRecord: RoofRecord }>('/roofs', {
      method: 'POST',
      body: JSON.stringify(roofData),
    }),
  updateRoof: (id: string, updates: Partial<Roof>) =>
    request<Roof>(`/roofs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  getRoofRecords: () => request<RoofRecord[]>('/roof-records'),
  getRoofRecord: (id: string) => request<RoofRecord>(`/roof-records/${id}`),
  getRoofRecordDetail: (id: string) =>
    request<{
      roofRecord: RoofRecord;
      property?: Property;
      activeRoof?: Roof;
      historicalRoofs: Roof[];
      timeline: any[];
    }>(`/roof-records/${id}`),
  addRoofRecordEvent: (
    id: string,
    event: { title: string; eventType: string; description?: string; date?: string; roofId?: string; relatedEntityId?: string }
  ) =>
    request<any>(`/roof-records/${id}/events`, {
      method: 'POST',
      body: JSON.stringify(event),
    }),

  // Projects, Inspections & Measurements
  getProjects: () => request<Project[]>('/projects'),
  createProject: (project: Partial<Project>) =>
    request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    }),
  getInspections: (params?: { date?: string; city?: string; status?: string; inspectorUserId?: string; propertyId?: string }) => {
    const query = params
      ? '?' +
        Object.entries(params)
          .filter(([_, v]) => v !== undefined && v !== '')
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
          .join('&')
      : '';
    return request<Inspection[]>(`/inspections${query}`);
  },
  getInspectionDetail: (id: string) =>
    request<{
      inspection: Inspection;
      property?: Property;
      customer?: Customer;
      roof?: Roof;
      roofRecord?: RoofRecord;
      measurements: Measurement[];
      photos: Photo[];
      checkIns: FieldCheckIn[];
      appointment?: Appointment;
      storms: any[];
      priorInspections: Inspection[];
    }>(`/inspections/${id}`),
  createInspection: (inspection: Partial<Inspection>) =>
    request<Inspection>('/inspections', {
      method: 'POST',
      body: JSON.stringify(inspection),
    }),
  updateInspection: (id: string, updates: Partial<Inspection>) =>
    request<Inspection>(`/inspections/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  submitInspection: (id: string, payload: any) =>
    request<{ success: boolean; inspection: Inspection; roofRecordEvent?: any }>(`/inspections/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  reviewInspection: (id: string, payload: { reviewStatus: 'APPROVED' | 'REVISION_REQUESTED'; notes?: string }) =>
    request<Inspection>(`/inspections/${id}/review`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  assignInspector: (id: string, payload: { inspectorUserId: string; inspectorName?: string }) =>
    request<Inspection>(`/inspections/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  addDamageObservation: (inspectionId: string, observation: Partial<DamageObservation>) =>
    request<DamageObservation>(`/inspections/${inspectionId}/observations`, {
      method: 'POST',
      body: JSON.stringify(observation),
    }),
  deleteDamageObservation: (inspectionId: string, obsId: string) =>
    request<{ success: boolean; removedId: string }>(`/inspections/${inspectionId}/observations/${obsId}`, {
      method: 'DELETE',
    }),
  completeInspection: (id: string, data: { notes: string; damageTypes?: string[] }) =>
    request<Inspection>(`/inspections/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Field Check-Ins
  getCheckIns: (params?: { propertyId?: string; appointmentId?: string }) => {
    const query = params
      ? '?' +
        Object.entries(params)
          .filter(([_, v]) => v !== undefined && v !== '')
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
          .join('&')
      : '';
    return request<FieldCheckIn[]>(`/check-ins${query}`);
  },
  createCheckIn: (checkIn: Partial<FieldCheckIn>) =>
    request<FieldCheckIn>('/check-ins', {
      method: 'POST',
      body: JSON.stringify(checkIn),
    }),

  // Mobile Photos & Document Upload
  uploadPhoto: (photo: Partial<Photo>) =>
    request<Photo>('/photos/upload', {
      method: 'POST',
      body: JSON.stringify(photo),
    }),

  // Measurements & ROOFR Integration
  getMeasurements: () => request<Measurement[]>('/measurements'),
  getMeasurementDetail: (id: string) =>
    request<{
      measurement: Measurement;
      property?: Property;
      project?: Project;
      inspection?: Inspection;
      previousVersion?: Measurement;
    }>(`/measurements/${id}`),
  requestMeasurement: (
    propertyId: string,
    provider: 'ROOFR' | 'HOVER' = 'ROOFR',
    orderNotes?: string,
    projectId?: string,
    inspectionId?: string
  ) =>
    request<Measurement>('/measurements/request', {
      method: 'POST',
      body: JSON.stringify({ propertyId, provider, orderNotes, projectId, inspectionId }),
    }),
  getRoofrStatus: () => request<any>('/integrations/roofr/status'),
  testRoofrConnection: () => request<any>('/integrations/roofr/test', { method: 'POST' }),

  // Appointments & Communications
  getAppointments: () => request<Appointment[]>('/appointments'),
  createAppointment: (appointment: Partial<Appointment>) =>
    request<Appointment>('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointment),
    }),
  updateAppointment: (id: string, updates: Partial<Appointment>) =>
    request<Appointment>(`/appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  getCommunications: () => request<Communication[]>('/communications'),
  createCommunication: (communication: Partial<Communication>) =>
    request<Communication>('/communications', {
      method: 'POST',
      body: JSON.stringify(communication),
    }),

  // Tasks & To-Dos
  getTasks: () => request<any[]>('/tasks'),
  createTask: (task: any) =>
    request<any>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    }),
  updateTask: (id: string, updates: any) =>
    request<any>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  // Storm Events
  getStorms: () => request<any[]>('/storms'),
  createStorm: (storm: any) =>
    request<any>('/storms', {
      method: 'POST',
      body: JSON.stringify(storm),
    }),
  associateStorm: (stormId: string, data: { propertyId?: string; roofRecordId?: string }) =>
    request<{ success: boolean; event: any }>(`/storms/${stormId}/associate`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Documents & Photos
  getDocuments: () => request<any[]>('/documents'),
  createDocument: (doc: any) =>
    request<any>('/documents', {
      method: 'POST',
      body: JSON.stringify(doc),
    }),
  getPhotos: () => request<any[]>('/photos'),
  createPhoto: (photo: any) =>
    request<any>('/photos', {
      method: 'POST',
      body: JSON.stringify(photo),
    }),

  // Operations & Integrations
  getCrews: () => request<Crew[]>('/crews'),
  createCrew: (crew: Partial<Crew>) =>
    request<Crew>('/crews', {
      method: 'POST',
      body: JSON.stringify(crew),
    }),
  updateCrew: (id: string, updates: Partial<Crew>) =>
    request<Crew>(`/crews/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  getIntegrations: () => request<Integration[]>('/integrations'),
  getAuditLogs: () => request<AuditLog[]>('/audit-log'),
  clearDemoData: () =>
    request<{ success: boolean; message: string }>('/demo/clear', {
      method: 'POST',
    }),
  search: (q: string) =>
    request<{
      customers: Customer[];
      properties: Property[];
      leads: Lead[];
      projects: Project[];
    }>(`/search?q=${encodeURIComponent(q)}`),
  // Estimates & Line Items
  getEstimates: (params?: { customerId?: string; propertyId?: string; projectId?: string; status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.customerId) query.set('customerId', params.customerId);
    if (params?.propertyId) query.set('propertyId', params.propertyId);
    if (params?.projectId) query.set('projectId', params.projectId);
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    const qs = query.toString();
    return request<Estimate[]>(`/estimates${qs ? `?${qs}` : ''}`);
  },
  getEstimate: (id: string) => request<Estimate>(`/estimates/${id}`),
  createEstimate: (estimate: Partial<Estimate>) =>
    request<Estimate>('/estimates', {
      method: 'POST',
      body: JSON.stringify(estimate),
    }),
  updateEstimate: (id: string, updates: Partial<Estimate> & { createVersion?: boolean; reasonForRevision?: string }) =>
    request<Estimate>(`/estimates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  approveEstimate: (id: string) =>
    request<Estimate>(`/estimates/${id}/approve`, {
      method: 'POST',
    }),
  deleteEstimate: (id: string) =>
    request<{ success: boolean; message: string }>(`/estimates/${id}`, {
      method: 'DELETE',
    }),

  // Proposals & Contracts
  getProposals: (params?: { customerId?: string; propertyId?: string; projectId?: string; estimateId?: string; status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.customerId) query.set('customerId', params.customerId);
    if (params?.propertyId) query.set('propertyId', params.propertyId);
    if (params?.projectId) query.set('projectId', params.projectId);
    if (params?.estimateId) query.set('estimateId', params.estimateId);
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    const qs = query.toString();
    return request<Proposal[]>(`/proposals${qs ? `?${qs}` : ''}`);
  },
  getProposal: (id: string) => request<Proposal>(`/proposals/${id}`),
  createProposal: (data: {
    estimateId: string;
    title?: string;
    introduction?: string;
    projectSummary?: string;
    scopeOfWork?: string;
    terms?: string;
    exclusions?: string[];
    assumptions?: string[];
    options?: any[];
    depositRequired?: number;
    expiresAt?: string;
  }) =>
    request<Proposal>('/proposals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateProposal: (id: string, updates: Partial<Proposal>) =>
    request<Proposal>(`/proposals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  sendProposal: (id: string) =>
    request<Proposal>(`/proposals/${id}/send`, {
      method: 'POST',
    }),
  recordProposalViewed: (id: string) =>
    request<{ success: boolean; status: string; viewedAt: string }>(`/proposals/${id}/viewed`, {
      method: 'POST',
    }),
  acceptProposal: (
    id: string,
    data: { signerName: string; signerEmail?: string; selectedOptionId?: string; acceptanceMethod?: string; notes?: string }
  ) =>
    request<{ success: boolean; message: string; proposal: Proposal; sale: Sale; project: Project }>(`/proposals/${id}/accept`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  declineProposal: (id: string, data: { reason?: string; notes?: string }) =>
    request<Proposal>(`/proposals/${id}/decline`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Customer Portal Safe Proposal Views
  getPortalProposal: (id: string) =>
    request<{
      proposal: any;
      lineItems: any[];
      customer: { name: string; email?: string; phone?: string } | null;
      property: { address: string; city: string; state: string; zip: string } | null;
      company: any;
    }>(`/portal/proposals/${id}`),
  acceptPortalProposal: (id: string, data: { signerName: string; signerEmail?: string; selectedOptionId?: string }) =>
    request<{ success: boolean; message: string; proposalNumber: string; acceptedAt: string }>(`/portal/proposals/${id}/accept`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  declinePortalProposal: (id: string, data: { reason?: string }) =>
    request<{ success: boolean; message: string }>(`/portal/proposals/${id}/decline`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Sales Foundation
  getSales: () => request<Sale[]>('/sales'),

  // Invoicing & Milestone Billing
  getInvoices: (params?: { projectId?: string; customerId?: string; status?: string; search?: string }) => {
    const query = params
      ? '?' +
        Object.entries(params)
          .filter(([_, v]) => v !== undefined && v !== '')
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
          .join('&')
      : '';
    return request<(Invoice & { customerName?: string; customerPhone?: string; customerEmail?: string; projectTitle?: string })[]>(`/invoices${query}`);
  },
  getInvoiceById: (id: string) =>
    request<Invoice & { customer: Customer; project: Project; property?: Property; payments: Payment[] }>(`/invoices/${id}`),
  createInvoice: (data: Partial<Invoice>) =>
    request<Invoice>('/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  generateMilestoneInvoices: (data: { projectId: string; depositPercentage?: number; includeDeductible?: boolean; deductibleAmount?: number }) =>
    request<{ success: boolean; message: string; invoices: Invoice[] }>('/invoices/generate-milestones', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  issueInvoice: (id: string) =>
    request<Invoice>(`/invoices/${id}/issue`, {
      method: 'POST',
    }),
  voidInvoice: (id: string) =>
    request<Invoice>(`/invoices/${id}/void`, {
      method: 'POST',
    }),

  // Payments & Texas HB 2102 Deductible Compliance
  getPayments: (params?: { projectId?: string; customerId?: string; invoiceId?: string }) => {
    const query = params
      ? '?' +
        Object.entries(params)
          .filter(([_, v]) => v !== undefined && v !== '')
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
          .join('&')
      : '';
    return request<(Payment & { customerName?: string; projectTitle?: string; invoiceNumber?: string })[]>(`/payments${query}`);
  },
  recordPayment: (data: {
    projectId: string;
    customerId: string;
    invoiceId?: string;
    amount: number;
    paymentMethod: string;
    receiptNumber?: string;
    notes?: string;
    isDeductiblePayment?: boolean;
    texasHb2102DeclarationConfirmed?: boolean;
  }) =>
    request<{ success: boolean; payment: Payment; invoice?: Invoice; project?: Project }>('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  verifyTexasHb2102Deductible: (
    projectId: string,
    data: {
      deductibleAmount: number;
      paymentMethod?: string;
      receiptNumber?: string;
      homeownerConfirmed?: boolean;
      notes?: string;
    }
  ) =>
    request<{ success: boolean; message: string; project: Project; paymentRecord: Payment }>(`/projects/${projectId}/verify-deductible`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Production Scheduling & Quality Control
  scheduleProject: (
    id: string,
    data: {
      assignedCrewId?: string;
      targetStartDate: string;
      targetCompletionDate?: string;
      dumpsterLocation?: string;
      dumpsterDropDate?: string;
      productionNotes?: string;
    }
  ) =>
    request<{ success: boolean; message: string; project: Project }>(`/projects/${id}/schedule`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  startProduction: (id: string) =>
    request<{ success: boolean; message: string; project: Project }>(`/projects/${id}/start-production`, {
      method: 'POST',
    }),
  updateQualityChecklist: (
    id: string,
    data: {
      iceAndWaterShield: boolean;
      sixNailFastening: boolean;
      continuousRidgeVent: boolean;
      stepFlashing: boolean;
      magnetSweepCompleted: boolean;
      verifiedBy?: string;
    }
  ) =>
    request<{ success: boolean; message: string; project: Project }>(`/projects/${id}/quality-checklist`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  completeProject: (id: string) =>
    request<{ success: boolean; message: string; project: Project }>(`/projects/${id}/complete`, {
      method: 'POST',
    }),
  getWorkOrder: (id: string) =>
    request<{
      project: Project;
      customer: Customer;
      property: Property;
      roof: Roof;
      crew: Crew;
      estimate: Estimate;
      purchaseOrders: PurchaseOrder[];
      company: any;
    }>(`/projects/${id}/work-order`),

  // Materials, Vendors & Purchase Orders
  getMaterials: () => request<Material[]>('/materials'),
  createMaterial: (data: Partial<Material>) =>
    request<Material>('/materials', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getVendors: () => request<Vendor[]>('/vendors'),
  createVendor: (data: Partial<Vendor>) =>
    request<Vendor>('/vendors', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getPurchaseOrders: (params?: { projectId?: string; vendorId?: string; status?: string }) => {
    const query = params
      ? '?' +
        Object.entries(params)
          .filter(([_, v]) => v !== undefined && v !== '')
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
          .join('&')
      : '';
    return request<(PurchaseOrder & { vendorName?: string; vendorPhone?: string; projectTitle?: string })[]>(`/purchase-orders${query}`);
  },
  getPurchaseOrderById: (id: string) =>
    request<PurchaseOrder & { vendor: Vendor; project: Project }>(`/purchase-orders/${id}`),
  createPurchaseOrder: (data: Partial<PurchaseOrder>) =>
    request<PurchaseOrder>('/purchase-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  orderPurchaseOrder: (id: string, data?: { supplierConfirmationNumber?: string }) =>
    request<PurchaseOrder>(`/purchase-orders/${id}/order`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    }),
  deliverPurchaseOrder: (id: string) =>
    request<PurchaseOrder>(`/purchase-orders/${id}/deliver`, {
      method: 'POST',
    }),
  generateProjectPO: (projectId: string) =>
    request<{ success: boolean; message: string; purchaseOrder: PurchaseOrder }>(`/projects/${projectId}/generate-po`, {
      method: 'POST',
    }),

  // Customer Portal Project & Billing View
  getPortalProjects: (customerId?: string) =>
    request<
      {
        id: string;
        title: string;
        status: string;
        projectType: string;
        targetStartDate?: string;
        actualStartDate?: string;
        completedDate?: string;
        foremanName: string;
        crewName: string;
        texasHb2102Verified: boolean;
        qualityChecklist: any;
        workOrderNumber?: string;
      }[]
    >(`/portal/projects${customerId ? `?customerId=${encodeURIComponent(customerId)}` : ''}`),
  getPortalInvoices: (customerId?: string) =>
    request<{
      invoices: {
        id: string;
        invoiceNumber: string;
        title?: string;
        milestoneType?: string;
        amountDue: number;
        amountPaid: number;
        balance: number;
        status: string;
        dueDate: string;
        issuedAt?: string;
        paidAt?: string;
        items?: any[];
      }[];
      payments: {
        id: string;
        amount: number;
        paymentMethod: string;
        receiptNumber: string;
        processedAt?: string;
        isDeductiblePayment?: boolean;
      }[];
    }>(`/portal/invoices${customerId ? `?customerId=${encodeURIComponent(customerId)}` : ''}`),
  payPortalInvoice: (id: string, data: { paymentMethod?: string; amount?: number }) =>
    request<{ success: boolean; message: string; payment: Payment; invoice: Invoice }>(`/portal/invoices/${id}/pay`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
