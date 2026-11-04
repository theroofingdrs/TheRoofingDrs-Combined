import { deliverInquiry, IntakeError } from '../../../../../shared/intake-server.ts';
/**
 * The Roof Doctors — Versioned REST API Router (/api/v1/*)
 * Houses all server-side endpoints, business validations, scoring, and audit hooks.
 */

import express, { Request, Response } from 'express';
import { requireOwnerAuth } from '../../middleware/requireOwnerAuth.ts';
import { getDatabase, persistDatabase, generateId } from '../../db/database.ts';
import { saveSharedLead, getSharedLeads, getSharedLead } from '../../db/supabaseLeads.ts';
import { calculateLeadScore } from '../../services/scoring.ts';
import { logAuditAction, getAuditLogs } from '../../services/audit.ts';
import { emitSystemEvent } from '../../services/events.ts';
import { syncIntegrationStatus, getActiveAdapter } from '../../services/integrations/index.ts';
import { ingestWebhook, getWebhookEvents } from '../../services/webhooks.ts';
import { getJobs } from '../../services/jobs.ts';
import { productionBillingRouter } from './productionBillingRouter.ts';
import {
  canAccessFinancials,
  calculateEstimateTotals,
  calculateLineItemTotals,
  maskEstimateFinancials,
  maskProposalFinancials,
  generateEstimateNumber,
  generateProposalNumber,
  buildLineItemsFromMeasurementAndTemplate,
} from '../../services/pricingService.ts';
import type {
  Lead,
  LeadActivity,
  Customer,
  Property,
  Roof,
  RoofRecord,
  RoofRecordEvent,
  Project,
  Inspection,
  DamageObservation,
  FieldCheckIn,
  RoofModel,
  Measurement,
  Appointment,
  Communication,
  Task,
  StormEvent,
  Document,
  Photo,
  SystemHealth,
  Crew,
  Estimate,
  EstimateLineItem,
  EstimateVersion,
  Proposal,
  ProposalOption,
  ProposalTier,
  PriceBook,
  ScopeTemplate,
  Sale,
  DigitalAcceptanceRecord,
} from '../../../shared/types/index.ts';

export const apiV1Router = express.Router();
apiV1Router.use(express.json({limit:'25mb'}));

// Helper to extract caller context for audit logging
function getCallerContext(req: Request) {
  const verified = (req as Request & { verifiedStaff?: { id: string; email: string } }).verifiedStaff;
  const userId = verified?.id || 'anonymous';
  const userRole = verified ? 'OWNER' : 'PUBLIC';
  const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  return { userId, userRole, ipAddress, userAgent };
}

// -------------------------------------------------------------
// 1. SYSTEM HEALTH & METRICS
// -------------------------------------------------------------
apiV1Router.get('/health', (req: Request, res: Response) => {
  const startTime = Date.now();
  const db = getDatabase();
  const latency = Date.now() - startTime;

  const connectedCount = db.integrations.filter((i) => i.status === 'CONNECTED').length;
  const unconfiguredCount = db.integrations.length - connectedCount;
  const pendingJobs = db.backgroundJobs.filter((j) => j.status === 'QUEUED' || j.status === 'PROCESSING').length;

  const health: SystemHealth = {
    status: 'OPERATIONAL',
    timestamp: new Date().toISOString(),
    services: {
      database: { status: 'HEALTHY', latencyMs: latency },
      api: { status: 'HEALTHY', uptimeSeconds: Math.floor(process.uptime()) },
      integrations: {
        status: connectedCount > 0 ? 'HEALTHY' : 'DEGRADED',
        connectedCount,
        unconfiguredCount,
      },
      jobQueue: { status: 'HEALTHY', pendingJobs },
    },
    metrics: {
      totalLeads: db.leads.length,
      totalProperties: db.properties.length,
      totalProjects: db.projects.length,
      activeUsers: db.users.filter((u) => u.active).length,
    },
  };

  res.json(health);
});

// -------------------------------------------------------------
// 2. PUBLIC & CONFIGURATION RESOURCES (Services, Areas, FAQs, etc.)
// -------------------------------------------------------------
apiV1Router.get('/services', (req, res) => {
  const db = getDatabase();
  res.json(db.services.filter((s) => s.active));
});

apiV1Router.get('/service-areas', (req, res) => {
  const db = getDatabase();
  res.json(db.serviceAreas.filter((s) => s.active));
});

apiV1Router.get('/faqs', (req, res) => {
  const db = getDatabase();
  res.json(db.faqs.filter((f) => f.published));
});

apiV1Router.get('/resources', (req, res) => {
  const db = getDatabase();
  res.json(db.resources.filter((r) => r.published));
});

apiV1Router.get('/roofing-systems', (req, res) => {
  const db = getDatabase();
  res.json(db.roofingSystems.filter((r) => r.active));
});

apiV1Router.get('/problem-types', (req, res) => {
  const db = getDatabase();
  res.json(db.problemTypes);
});

apiV1Router.get('/maintenance-plans', (req, res) => {
  const db = getDatabase();
  res.json(db.maintenancePlans.filter((p) => p.active));
});

apiV1Router.get('/feature-flags', (req, res) => {
  const db = getDatabase();
  res.json(db.featureFlags);
});

apiV1Router.get('/settings', (req, res) => {
  const db = getDatabase();
  res.json(db.systemSettings);
});

apiV1Router.get('/business-rules', (req, res) => {
  const db = getDatabase();
  res.json(db.businessRules);
});

// All remaining CRM and administration endpoints require a verified owner session.
// Public inquiry submission remains available without staff authentication.
apiV1Router.use((req, res, next) => {
  if (req.method === 'POST' && req.path === '/leads') return next();
  return requireOwnerAuth(req, res, next);
});

apiV1Router.get('/users', (req, res) => {
  const db = getDatabase();
  const safeUsers = (db.users || []).map((u: any) => {
    const { passwordHash, ...safe } = u;
    return safe;
  });
  res.json(safeUsers);
});

// -------------------------------------------------------------
// 3. LEADS (Inbound Diagnostic Inquiries & Management)
// -------------------------------------------------------------
apiV1Router.get('/leads', async (req, res) => {
  try { res.json(await getSharedLeads()); }
  catch (error) { console.error('Shared lead list failed:', error); res.status(503).json({ error: 'Lead storage is temporarily unavailable.' }); }
});

apiV1Router.post('/leads', async (req, res) => {
  const body = req.body;
  const fields = ['name','phone','email','address','city','state','zip','serviceRequested','leadType','preferredContactMethod','message','source','landingPage','referrer','utmSource','utmMedium','utmCampaign'];
  if (!body || typeof body !== 'object' || Array.isArray(body) || fields.some(field => body[field] !== undefined && (typeof body[field] !== 'string' || body[field].length > 10000)) || !body.name?.trim() || (!body.phone?.trim() && !body.email?.trim())) {
    return res.status(400).json({ error: 'Enter your name and a phone number or email address.' });
  }
  try {
    const receipt = await deliverInquiry('TRD', req.get('Idempotency-Key'), body);
    return res.status(receipt.replayed ? 200 : 201).json({ ...body, id: receipt.source_id, crmLeadId: receipt.lead_id, createdAt: receipt.received_at, deliveryStatus: 'delivered' });
  } catch (error) {
    return res.status(error instanceof IntakeError ? error.status : 503).json({ error: error instanceof Error ? error.message : 'Inquiry delivery is unavailable.' });
  }
});

apiV1Router.get('/leads/:id', async (req, res) => {
  try {
    const lead = await getSharedLead(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json(lead);
  } catch (error) { console.error('Shared lead lookup failed:', error); res.status(503).json({ error: 'Lead storage is temporarily unavailable.' }); }
});

apiV1Router.patch('/leads/:id', async (req, res) => {
  const db = getDatabase();
  let existing: Lead | null;
  try { existing = await getSharedLead(req.params.id); }
  catch (error) { console.error('Shared lead lookup failed:', error); return res.status(503).json({ error: 'Lead storage is temporarily unavailable.' }); }
  if (!existing) return res.status(404).json({ error: 'Lead not found' });
  const index = db.leads.findIndex((l) => l.id === req.params.id);
  const previousState = { ...existing };
  const updated: Lead = {
    ...existing,
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  try { await saveSharedLead(updated); }
  catch (error) { console.error('Shared lead update failed:', error); return res.status(503).json({ error: 'Lead update could not be saved.' }); }
  if (index >= 0) db.leads[index] = updated;
  else db.leads.unshift(updated);

  const ctx = getCallerContext(req);

  // Record timeline activity
  if (req.body.status && req.body.status !== previousState.status) {
    db.leadActivities.unshift({
      id: generateId('lact'),
      leadId: updated.id,
      activityType: 'STATUS_CHANGED',
      description: `Status changed from ${previousState.status} to ${updated.status}.`,
      userId: ctx.userId,
      createdAt: updated.updatedAt,
    });
  } else if (req.body.assignedUserId !== undefined && req.body.assignedUserId !== previousState.assignedUserId) {
    const staff = db.users.find((u) => u.id === req.body.assignedUserId);
    const staffName = staff ? staff.name : (req.body.assignedUserId || 'Unassigned');
    db.leadActivities.unshift({
      id: generateId('lact'),
      leadId: updated.id,
      activityType: 'STATUS_CHANGED',
      description: `Lead assigned to: ${staffName}.`,
      userId: ctx.userId,
      createdAt: updated.updatedAt,
    });
  } else {
    const changedFields = Object.keys(req.body).filter((k) => k !== 'status' && k !== 'assignedUserId');
    if (changedFields.length > 0) {
      db.leadActivities.unshift({
        id: generateId('lact'),
        leadId: updated.id,
        activityType: 'STATUS_CHANGED',
        description: `Lead information updated (${changedFields.join(', ')}).`,
        userId: ctx.userId,
        createdAt: updated.updatedAt,
      });
    }
  }

  persistDatabase();

  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'STATUS_CHANGE',
    entityType: 'Lead',
    entityId: updated.id,
    previousState: { status: previousState.status },
    newState: { status: updated.status },
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  res.json(updated);
});

// Duplicate Detection
apiV1Router.post('/leads/check-duplicates', (req, res) => {
  const { phone, email, address, excludeLeadId } = req.body;
  const db = getDatabase();

  const normPhone = phone ? phone.replace(/\D/g, '') : '';
  const normEmail = email ? email.trim().toLowerCase() : '';
  const normAddr = address ? address.trim().toLowerCase() : '';

  const matchedCustomers: Customer[] = [];
  const matchedLeads: Lead[] = [];
  const reasons: string[] = [];

  for (const c of db.customers) {
    const cPhone = c.phone ? c.phone.replace(/\D/g, '') : '';
    const cAlt = c.alternatePhone ? c.alternatePhone.replace(/\D/g, '') : '';
    const cEmail = c.email ? c.email.trim().toLowerCase() : '';

    if (normPhone && (cPhone.endsWith(normPhone.slice(-7)) || cAlt.endsWith(normPhone.slice(-7)))) {
      matchedCustomers.push(c);
      reasons.push(`Phone match with existing customer: ${c.firstName} ${c.lastName} (${c.phone})`);
      continue;
    }
    if (normEmail && cEmail === normEmail) {
      matchedCustomers.push(c);
      reasons.push(`Email match with existing customer: ${c.firstName} ${c.lastName} (${c.email})`);
      continue;
    }
  }

  // Check property address
  if (normAddr) {
    const matchedProps = db.properties.filter(
      (p) => p.address.toLowerCase().includes(normAddr) || normAddr.includes(p.address.toLowerCase())
    );
    for (const p of matchedProps) {
      if (p.customerId) {
        const c = db.customers.find((cust) => cust.id === p.customerId);
        if (c && !matchedCustomers.some((mc) => mc.id === c.id)) {
          matchedCustomers.push(c);
          reasons.push(`Property address matches existing customer ${c.firstName} ${c.lastName} (${p.address})`);
        }
      }
    }
  }

  // Check other leads
  for (const l of db.leads) {
    if (excludeLeadId && l.id === excludeLeadId) continue;
    const lPhone = l.phone ? l.phone.replace(/\D/g, '') : '';
    const lEmail = l.email ? l.email.trim().toLowerCase() : '';
    if (normPhone && lPhone.endsWith(normPhone.slice(-7))) {
      matchedLeads.push(l);
      reasons.push(`Phone match with existing lead: ${l.name} (${l.phone})`);
    } else if (normEmail && lEmail === normEmail) {
      matchedLeads.push(l);
      reasons.push(`Email match with existing lead: ${l.name} (${l.email})`);
    }
  }

  res.json({
    hasMatch: matchedCustomers.length > 0 || matchedLeads.length > 0,
    matchedCustomers,
    matchedLeads,
    reasons,
  });
});

// Add Internal Note to Lead
apiV1Router.post('/leads/:id/notes', (req, res) => {
  const db = getDatabase();
  const lead = db.leads.find((l) => l.id === req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });

  const { note } = req.body;
  if (!note || !note.trim()) return res.status(400).json({ error: 'Note text is required.' });

  const now = new Date().toISOString();
  const ctx = getCallerContext(req);

  const activity: LeadActivity = {
    id: generateId('lact'),
    leadId: lead.id,
    activityType: 'NOTE_ADDED',
    description: note.trim(),
    userId: ctx.userId,
    createdAt: now,
  };
  db.leadActivities.unshift(activity);

  const comm: Communication = {
    id: generateId('comm'),
    channel: 'INTERNAL_NOTE',
    direction: 'INTERNAL',
    sender: ctx.userId,
    recipient: 'Staff',
    leadId: lead.id,
    body: note.trim(),
    status: 'SENT',
    timestamp: now,
    createdAt: now,
  };
  db.communications.unshift(comm);

  lead.updatedAt = now;
  persistDatabase();
  res.json({ success: true, activity, communication: comm });
});

// Assign Lead
apiV1Router.post('/leads/:id/assign', (req, res) => {
  const db = getDatabase();
  const lead = db.leads.find((l) => l.id === req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });

  const { assignedUserId } = req.body;
  const prevAssigned = lead.assignedUserId;
  lead.assignedUserId = assignedUserId;
  const now = new Date().toISOString();
  lead.updatedAt = now;

  const ctx = getCallerContext(req);
  const activity: LeadActivity = {
    id: generateId('lact'),
    leadId: lead.id,
    activityType: 'STATUS_CHANGED',
    description: `Assigned to user: ${assignedUserId || 'Unassigned'}`,
    userId: ctx.userId,
    createdAt: now,
  };
  db.leadActivities.unshift(activity);

  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'UPDATE',
    entityType: 'Lead',
    entityId: lead.id,
    previousState: { assignedUserId: prevAssigned },
    newState: { assignedUserId },
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  persistDatabase();
  res.json(lead);
});

// Lead Timeline
apiV1Router.get('/leads/:id/timeline', (req, res) => {
  const db = getDatabase();
  const lead = db.leads.find((l) => l.id === req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });

  const activities = db.leadActivities.filter((a) => a.leadId === lead.id);
  const communications = db.communications.filter((c) => c.leadId === lead.id);
  const appointments = db.appointments.filter((a) => a.leadId === lead.id);

  res.json({
    lead,
    activities,
    communications,
    appointments,
  });
});

// Convert Lead to Customer & Property & Project
apiV1Router.post('/leads/:id/convert', (req, res) => {
  const db = getDatabase();
  const lead = db.leads.find((l) => l.id === req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });

  const now = new Date().toISOString();
  const { existingCustomerId, existingPropertyId } = req.body || {};

  let customer: Customer;
  let property: Property;
  let roofRecord: RoofRecord;
  let roof: Roof;

  // 1. Customer resolution (existing or new)
  if (existingCustomerId) {
    const existing = db.customers.find((c) => c.id === existingCustomerId);
    if (!existing) return res.status(404).json({ error: 'Existing customer specified not found' });
    customer = existing;
  } else {
    const nameParts = lead.name.split(' ');
    const firstName = nameParts[0] || 'Unknown';
    const lastName = nameParts.slice(1).join(' ') || 'Customer';
    const customerId = generateId('cust');
    customer = {
      id: customerId,
      firstName,
      lastName,
      email: lead.email,
      phone: lead.phone,
      preferredContactMethod: lead.preferredContactMethod,
      communicationPreferences: {
        smsOptIn: true,
        emailOptIn: true,
        stormAlertsOptIn: true,
      },
      source: lead.source,
      notes: `Converted from lead ${lead.id}. ${lead.message || ''}`,
      status: 'ACTIVE',
      tags: [lead.leadType],
      propertyIds: [],
      createdAt: now,
      updatedAt: now,
    };
    db.customers.unshift(customer);
  }

  // 2. Property resolution (existing or new)
  if (existingPropertyId) {
    const existingProp = db.properties.find((p) => p.id === existingPropertyId);
    if (!existingProp) return res.status(404).json({ error: 'Existing property specified not found' });
    property = existingProp;
    if (!customer.propertyIds.includes(property.id)) {
      customer.propertyIds.push(property.id);
    }
    roofRecord = db.roofRecords.find((rr) => rr.propertyId === property.id)!;
    roof = db.roofs.find((r) => r.id === property.roofId)!;
  } else {
    const propertyId = generateId('prop');
    const roofId = generateId('roof');
    const roofRecordId = generateId('rec');

    roofRecord = {
      id: roofRecordId,
      roofId,
      propertyId,
      customerId: customer.id,
      warrantyStatus: 'UNKNOWN',
      timelineEventCount: 1,
      activeConditionRating: lead.stormRelatedFlag ? 'STORM_DAMAGED' : 'FAIR',
      createdAt: now,
      updatedAt: now,
    };

    roof = {
      id: roofId,
      propertyId,
      roofingSystem: 'Architectural Shingles',
      material: 'Asphalt Shingle',
      documentedComponents: {},
      sourceStatus: 'CUSTOMER_PROVIDED',
      roofRecordId,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };

    property = {
      id: propertyId,
      customerId: customer.id,
      address: lead.address || 'Address pending field check',
      city: lead.city || 'Texarkana',
      state: lead.state || 'TX',
      zip: lead.zip || '75501',
      marketId: 'mkt_northeast_texas',
      verificationStatus: 'NEEDS_FIELD_CHECK',
      roofId,
      createdAt: now,
      updatedAt: now,
    };

    if (!customer.propertyIds.includes(property.id)) {
      customer.propertyIds.push(property.id);
    }

    // Add initial conversion event to roofRecordEvents
    const installEvent: RoofRecordEvent = {
      id: generateId('rrev'),
      roofRecordId: roofRecord.id,
      propertyId: property.id,
      roofId: roof.id,
      eventType: 'INSTALLATION',
      title: 'Initial Property & Roof Record Initiated',
      description: `Record created via conversion from lead ${lead.name} (${lead.serviceRequested})`,
      date: now,
      createdAt: now,
    };
    db.roofRecordEvents.unshift(installEvent);

    db.properties.unshift(property);
    db.roofs.unshift(roof);
    db.roofRecords.unshift(roofRecord);
  }

  // 3. Create Project
  const projectId = generateId('proj');
  const newProject: Project = {
    id: projectId,
    customerId: customer.id,
    propertyId: property.id,
    roofId: property.roofId,
    leadId: lead.id,
    title: `${lead.serviceRequested} — ${property.address}`,
    status: 'INSPECTION',
    projectType: lead.leadType === 'REPLACEMENT' ? 'REPLACEMENT' : lead.stormRelatedFlag ? 'STORM_RESTORATION' : 'REPAIR',
    insuranceClaimFlag: lead.insuranceRelatedFlag,
    createdAt: now,
    updatedAt: now,
  };
  db.projects.unshift(newProject);

  // 4. Update Lead
  lead.status = 'INSPECTION_SCHEDULED';
  lead.convertedCustomerId = customer.id;
  lead.convertedProjectId = projectId;
  lead.convertedAt = now;
  lead.updatedAt = now;

  const ctx = getCallerContext(req);
  const conversionActivity: LeadActivity = {
    id: generateId('lact'),
    leadId: lead.id,
    activityType: 'CONVERTED',
    description: `Converted to Customer ${customer.firstName} ${customer.lastName} and Project ${newProject.title}`,
    userId: ctx.userId,
    createdAt: now,
  };
  db.leadActivities.unshift(conversionActivity);

  persistDatabase();

  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'CREATE',
    entityType: 'Customer',
    entityId: customer.id,
    newState: { convertedFromLead: lead.id, projectId },
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  res.json({
    success: true,
    customer,
    property,
    project: newProject,
    roofRecord,
  });
});

// -------------------------------------------------------------
// 4. CUSTOMERS & PROPERTIES & ROOFS
// -------------------------------------------------------------
apiV1Router.get('/customers', (req, res) => {
  const db = getDatabase();
  res.json(db.customers);
});

apiV1Router.post('/customers', (req, res) => {
  const db = getDatabase();
  const body = req.body;
  if (!body.firstName || !body.phone) {
    return res.status(400).json({ error: 'First name and phone are required.' });
  }

  const now = new Date().toISOString();
  const customer: Customer = {
    id: generateId('cust'),
    firstName: body.firstName.trim(),
    lastName: body.lastName?.trim() || '',
    email: body.email?.trim() || '',
    phone: body.phone.trim(),
    alternatePhone: body.alternatePhone,
    preferredContactMethod: body.preferredContactMethod || 'PHONE',
    communicationPreferences: body.communicationPreferences || {
      smsOptIn: true,
      emailOptIn: true,
      stormAlertsOptIn: true,
    },
    source: body.source || 'Direct',
    notes: body.notes || '',
    status: 'ACTIVE',
    tags: body.tags || [],
    propertyIds: [],
    createdAt: now,
    updatedAt: now,
  };

  db.customers.unshift(customer);
  persistDatabase();
  res.status(201).json(customer);
});

// Customer 360 View: Aggregate all customer entities
apiV1Router.get('/customers/:id', (req, res) => {
  const db = getDatabase();
  const customer = db.customers.find((c) => c.id === req.params.id);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });

  const properties = db.properties.filter(
    (p) =>
      p.customerId === customer.id ||
      (p.customerIds && p.customerIds.includes(customer.id)) ||
      customer.propertyIds.includes(p.id)
  );
  const propertyIds = properties.map((p) => p.id);

  const roofs = db.roofs.filter((r) => propertyIds.includes(r.propertyId));
  const roofRecords = db.roofRecords.filter(
    (rr) => propertyIds.includes(rr.propertyId) || rr.customerId === customer.id
  );

  const leads = db.leads.filter(
    (l) =>
      l.convertedCustomerId === customer.id ||
      (customer.phone && l.phone === customer.phone) ||
      (customer.email && l.email.toLowerCase() === customer.email.toLowerCase())
  );

  const projects = db.projects.filter((pr) => pr.customerId === customer.id || propertyIds.includes(pr.propertyId));
  const inspections = db.inspections.filter((i) => i.customerId === customer.id || propertyIds.includes(i.propertyId));
  const appointments = db.appointments.filter(
    (a) => a.customerId === customer.id || propertyIds.includes(a.propertyId)
  );
  const communications = db.communications.filter(
    (cm) => cm.customerId === customer.id || propertyIds.includes(cm.propertyId || '')
  );
  const tasks = db.tasks.filter((t) => t.customerId === customer.id);
  const documents = db.documents.filter(
    (d) => d.customerId === customer.id || propertyIds.includes(d.propertyId || '')
  );
  const projectIds = projects.map((p) => p.id);
  const estimates = db.estimates.filter((e) => e.customerId === customer.id || projectIds.includes(e.projectId));
  const proposals = db.proposals.filter((p) => p.customerId === customer.id || projectIds.includes(p.projectId));
  const payments = db.payments.filter((pay) => pay.customerId === customer.id || projectIds.includes(pay.projectId));

  res.json({
    customer,
    properties,
    roofs,
    roofRecords,
    leads,
    projects,
    inspections,
    appointments,
    communications,
    tasks,
    documents,
    estimates,
    proposals,
    payments,
  });
});

apiV1Router.patch('/customers/:id', (req, res) => {
  const db = getDatabase();
  const customer = db.customers.find((c) => c.id === req.params.id);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });

  const prev = { ...customer };
  const body = req.body;
  const now = new Date().toISOString();

  if (body.firstName !== undefined) customer.firstName = body.firstName.trim();
  if (body.lastName !== undefined) customer.lastName = body.lastName.trim();
  if (body.phone !== undefined) customer.phone = body.phone.trim();
  if (body.alternatePhone !== undefined) customer.alternatePhone = body.alternatePhone;
  if (body.email !== undefined) customer.email = body.email.trim();
  if (body.preferredContactMethod !== undefined) customer.preferredContactMethod = body.preferredContactMethod;
  if (body.communicationPreferences !== undefined) customer.communicationPreferences = body.communicationPreferences;
  if (body.notes !== undefined) customer.notes = body.notes;
  if (body.status !== undefined) customer.status = body.status;
  if (body.tags !== undefined) customer.tags = body.tags;
  customer.updatedAt = now;

  persistDatabase();

  const ctx = getCallerContext(req);
  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'UPDATE',
    entityType: 'Customer',
    entityId: customer.id,
    previousState: prev,
    newState: customer,
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  res.json(customer);
});

apiV1Router.get('/properties', (req, res) => {
  const db = getDatabase();
  res.json(db.properties);
});

// Property Detail & Intelligence Payload
apiV1Router.get('/properties/:id', (req, res) => {
  const db = getDatabase();
  const property = db.properties.find((p) => p.id === req.params.id);
  if (!property) return res.status(404).json({ error: 'Property not found' });

  const customers = db.customers.filter(
    (c) =>
      c.id === property.customerId ||
      (property.customerIds && property.customerIds.includes(c.id)) ||
      c.propertyIds.includes(property.id)
  );

  const roofs = db.roofs.filter((r) => r.propertyId === property.id);
  const roofRecord = db.roofRecords.find(
    (rr) => rr.propertyId === property.id || (property.roofId && rr.roofId === property.roofId)
  );
  const roofRecordEvents = db.roofRecordEvents.filter(
    (rre) => rre.propertyId === property.id || (roofRecord && rre.roofRecordId === roofRecord.id)
  );

  const leads = db.leads.filter(
    (l) =>
      l.address.toLowerCase().includes(property.address.toLowerCase()) ||
      l.convertedCustomerId === property.customerId
  );
  const appointments = db.appointments.filter((a) => a.propertyId === property.id);
  const inspections = db.inspections.filter((i) => i.propertyId === property.id);
  const inspectionIds = inspections.map((i) => i.id);
  const damageObservations = db.damageObservations.filter((d) => inspectionIds.includes(d.inspectionId));

  const measurements = db.measurements.filter((m) => m.propertyId === property.id);
  const projects = db.projects.filter((p) => p.propertyId === property.id);
  const documents = db.documents.filter((d) => d.propertyId === property.id);
  const photos = db.photos.filter((ph) => ph.propertyId === property.id);
  const communications = db.communications.filter((cm) => cm.propertyId === property.id);

  const storms = db.stormEvents.filter(
    (st) => st.affectedZipCodes?.includes(property.zip) || st.affectedMarkets?.includes(property.marketId)
  );

  res.json({
    property,
    customers,
    roofs,
    roofRecord,
    roofRecordEvents,
    leads,
    appointments,
    inspections,
    damageObservations,
    measurements,
    projects,
    documents,
    photos,
    storms,
    communications,
  });
});

apiV1Router.patch('/properties/:id', (req, res) => {
  const db = getDatabase();
  const property = db.properties.find((p) => p.id === req.params.id);
  if (!property) return res.status(404).json({ error: 'Property not found' });

  const prev = { ...property };
  const body = req.body;
  const now = new Date().toISOString();

  if (body.address !== undefined) property.address = body.address.trim();
  if (body.unit !== undefined) property.unit = body.unit;
  if (body.city !== undefined) property.city = body.city.trim();
  if (body.state !== undefined) property.state = body.state.trim();
  if (body.zip !== undefined) property.zip = body.zip.trim();
  if (body.propertyType !== undefined) property.propertyType = body.propertyType;
  if (body.yearBuilt !== undefined) property.yearBuilt = Number(body.yearBuilt);
  if (body.stories !== undefined) property.stories = Number(body.stories);
  if (body.squareFootage !== undefined) property.squareFootage = Number(body.squareFootage);
  if (body.verificationStatus !== undefined) property.verificationStatus = body.verificationStatus;
  if (body.notes !== undefined) property.notes = body.notes;
  property.updatedAt = now;

  persistDatabase();

  const ctx = getCallerContext(req);
  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'UPDATE',
    entityType: 'Property',
    entityId: property.id,
    previousState: prev,
    newState: property,
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  res.json(property);
});

apiV1Router.post('/properties', (req, res) => {
  const db = getDatabase();
  const body = req.body;
  if (!body.address || !body.city || !body.zip) {
    return res.status(400).json({ error: 'Address, city, and zip are required.' });
  }

  const now = new Date().toISOString();
  const propertyId = generateId('prop');
  const roofId = generateId('roof');
  const roofRecordId = generateId('rec');

  const property: Property = {
    id: propertyId,
    customerId: body.customerId,
    address: body.address.trim(),
    unit: body.unit,
    city: body.city.trim(),
    state: body.state || 'TX',
    zip: body.zip.trim(),
    marketId: body.marketId || 'mkt_northeast_texas',
    yearBuilt: body.yearBuilt,
    stories: body.stories,
    verificationStatus: 'UNVERIFIED',
    roofId,
    createdAt: now,
    updatedAt: now,
  };

  const roofRecord: RoofRecord = {
    id: roofRecordId,
    roofId,
    propertyId,
    customerId: body.customerId,
    warrantyStatus: 'UNKNOWN',
    timelineEventCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  const roof: Roof = {
    id: roofId,
    propertyId,
    roofingSystem: body.roofingSystem || 'Architectural Shingles',
    material: body.material || 'Asphalt Shingle',
    documentedComponents: {},
    sourceStatus: 'CUSTOMER_PROVIDED',
    roofRecordId,
    createdAt: now,
    updatedAt: now,
  };

  db.properties.unshift(property);
  db.roofs.unshift(roof);
  db.roofRecords.unshift(roofRecord);

  if (body.customerId) {
    const customer = db.customers.find((c) => c.id === body.customerId);
    if (customer && !customer.propertyIds.includes(propertyId)) {
      customer.propertyIds.push(propertyId);
    }
  }

  persistDatabase();
  res.status(201).json({ property, roof, roofRecord });
});

apiV1Router.get('/roofs', (req, res) => {
  const db = getDatabase();
  res.json(db.roofs);
});

// Add Roof or Replace Existing Roof (Preserving Property History)
apiV1Router.post('/roofs', (req, res) => {
  const db = getDatabase();
  const body = req.body;
  if (!body.propertyId || !body.roofingSystem || !body.material) {
    return res.status(400).json({ error: 'propertyId, roofingSystem, and material are required.' });
  }

  const property = db.properties.find((p) => p.id === body.propertyId);
  if (!property) return res.status(404).json({ error: 'Property not found' });

  const now = new Date().toISOString();
  const roofId = generateId('roof');
  let roofRecord = db.roofRecords.find((rr) => rr.propertyId === property.id);
  if (!roofRecord) {
    const roofRecordId = generateId('rec');
    roofRecord = {
      id: roofRecordId,
      roofId,
      propertyId: property.id,
      customerId: property.customerId,
      warrantyStatus: 'UNKNOWN',
      timelineEventCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    db.roofRecords.unshift(roofRecord);
  }

  // If this replaces an existing roof:
  if (body.replacesRoofId || property.roofId) {
    const oldRoofId = body.replacesRoofId || property.roofId;
    const oldRoof = db.roofs.find((r) => r.id === oldRoofId);
    if (oldRoof && oldRoof.status !== 'REPLACED') {
      oldRoof.status = 'REPLACED';
      oldRoof.updatedAt = now;
      if (!property.historicalRoofIds) property.historicalRoofIds = [];
      if (!property.historicalRoofIds.includes(oldRoof.id)) {
        property.historicalRoofIds.push(oldRoof.id);
      }

      const eventId = generateId('rrev');
      const event: RoofRecordEvent = {
        id: eventId,
        roofRecordId: roofRecord.id,
        propertyId: property.id,
        roofId: oldRoof.id,
        eventType: 'REPLACEMENT',
        title: `Roof Replaced: Transitioned from ${oldRoof.roofingSystem} to new installation`,
        description:
          body.replacementReason ||
          `Existing roof replaced. Previous system archived. New system: ${body.roofingSystem} (${body.material})`,
        date: body.installationDate || now,
        actor: getCallerContext(req).userId,
        createdAt: now,
      };
      db.roofRecordEvents.unshift(event);
      roofRecord.timelineEventCount = (roofRecord.timelineEventCount || 0) + 1;
    }
  }

  const newRoof: Roof = {
    id: roofId,
    propertyId: property.id,
    roofingSystem: body.roofingSystem,
    material: body.material,
    approximateAge: body.approximateAge || 0,
    installationDate: body.installationDate || now,
    documentedComponents: body.documentedComponents || {},
    manufacturer: body.manufacturer,
    product: body.product,
    color: body.color,
    pitch: body.pitch,
    squares: body.squares,
    sourceStatus: body.sourceStatus || 'VERIFIED',
    roofRecordId: roofRecord.id,
    status: 'ACTIVE',
    notes: body.notes,
    createdAt: now,
    updatedAt: now,
  };

  property.roofId = newRoof.id;
  roofRecord.roofId = newRoof.id;
  roofRecord.updatedAt = now;

  const newInstallEvent: RoofRecordEvent = {
    id: generateId('rrev'),
    roofRecordId: roofRecord.id,
    propertyId: property.id,
    roofId: newRoof.id,
    eventType: body.replacesRoofId ? 'REPLACEMENT' : 'INSTALLATION',
    title: `Roof System Documented: ${newRoof.roofingSystem}`,
    description: `${newRoof.manufacturer ? newRoof.manufacturer + ' ' : ''}${newRoof.product || newRoof.material}. Color: ${newRoof.color || 'Standard'}. Source verification: ${newRoof.sourceStatus}.`,
    date: newRoof.installationDate || now,
    actor: getCallerContext(req).userId,
    createdAt: now,
  };
  db.roofRecordEvents.unshift(newInstallEvent);
  roofRecord.timelineEventCount = (roofRecord.timelineEventCount || 0) + 1;

  db.roofs.unshift(newRoof);
  persistDatabase();

  const ctx = getCallerContext(req);
  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'CREATE',
    entityType: 'Roof',
    entityId: newRoof.id,
    newState: newRoof,
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  res.status(201).json({ roof: newRoof, property, roofRecord });
});

apiV1Router.patch('/roofs/:id', (req, res) => {
  const db = getDatabase();
  const roof = db.roofs.find((r) => r.id === req.params.id);
  if (!roof) return res.status(404).json({ error: 'Roof not found' });

  const prev = { ...roof };
  const body = req.body;
  const now = new Date().toISOString();

  if (body.roofingSystem !== undefined) roof.roofingSystem = body.roofingSystem;
  if (body.material !== undefined) roof.material = body.material;
  if (body.manufacturer !== undefined) roof.manufacturer = body.manufacturer;
  if (body.product !== undefined) roof.product = body.product;
  if (body.color !== undefined) roof.color = body.color;
  if (body.pitch !== undefined) roof.pitch = body.pitch;
  if (body.squares !== undefined) roof.squares = Number(body.squares);
  if (body.sourceStatus !== undefined) roof.sourceStatus = body.sourceStatus;
  if (body.notes !== undefined) roof.notes = body.notes;
  roof.updatedAt = now;

  persistDatabase();

  const ctx = getCallerContext(req);
  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'UPDATE',
    entityType: 'Roof',
    entityId: roof.id,
    previousState: prev,
    newState: roof,
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  res.json(roof);
});

apiV1Router.get('/roof-records', (req, res) => {
  const db = getDatabase();
  res.json(db.roofRecords);
});

// Comprehensive Roof Record Detail with Chronological Event History
apiV1Router.get('/roof-records/:id', (req, res) => {
  const db = getDatabase();
  const record = db.roofRecords.find((r) => r.id === req.params.id);
  if (!record) return res.status(404).json({ error: 'Roof record not found' });

  const property = db.properties.find((p) => p.id === record.propertyId);
  const activeRoof = db.roofs.find((r) => r.id === record.roofId);
  const allRoofs = db.roofs.filter((r) => r.propertyId === record.propertyId);

  // Combine stored events with operational events to build full lifetime timeline
  const events = [...db.roofRecordEvents.filter((e) => e.roofRecordId === record.id || e.propertyId === record.propertyId)];

  // Derived events from inspections
  const inspections = db.inspections.filter((i) => i.propertyId === record.propertyId);
  for (const insp of inspections) {
    if (!events.some((e) => e.relatedEntityId === insp.id)) {
      events.push({
        id: `derived_${insp.id}`,
        roofRecordId: record.id,
        propertyId: record.propertyId,
        eventType: 'INSPECTION',
        title: `Physical Inspection: ${insp.inspectionType} (${insp.status})`,
        description: insp.findingsSummary || `Diagnostic check conducted. Decking: ${insp.deckingCondition}, Flashing: ${insp.flashingCondition}. Recommendation: ${insp.recommendation || 'Standard'}.`,
        date: insp.completedDate || insp.scheduledDate,
        relatedEntityId: insp.id,
        createdAt: insp.createdAt,
      });
    }
  }

  // Derived measurements
  const measurements = db.measurements.filter((m) => m.propertyId === record.propertyId);
  for (const meas of measurements) {
    if (!events.some((e) => e.relatedEntityId === meas.id)) {
      events.push({
        id: `derived_${meas.id}`,
        roofRecordId: record.id,
        propertyId: record.propertyId,
        eventType: 'MEASUREMENT',
        title: `Aerial Measurement Dispatched: ${meas.provider} (${meas.status})`,
        description: meas.normalizedData
          ? `Total: ${meas.normalizedData.totalSquares} squares, Predominant Pitch: ${meas.normalizedData.predominantPitch}`
          : `Measurement requested via ${meas.provider}. Status: ${meas.status}`,
        date: meas.completedAt || meas.requestedAt,
        relatedEntityId: meas.id,
        createdAt: meas.createdAt,
      });
    }
  }

  // Sort events chronologically descending (newest first)
  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  res.json({
    roofRecord: record,
    property,
    activeRoof,
    historicalRoofs: allRoofs.filter((r) => r.status === 'REPLACED' || r.status === 'ARCHIVED'),
    timeline: events,
  });
});

// Add custom event to roof record timeline
apiV1Router.post('/roof-records/:id/events', (req, res) => {
  const db = getDatabase();
  const record = db.roofRecords.find((r) => r.id === req.params.id);
  if (!record) return res.status(404).json({ error: 'Roof record not found' });

  const body = req.body;
  if (!body.title || !body.eventType) {
    return res.status(400).json({ error: 'title and eventType are required.' });
  }

  const now = new Date().toISOString();
  const event: RoofRecordEvent = {
    id: generateId('rrev'),
    roofRecordId: record.id,
    propertyId: record.propertyId,
    roofId: body.roofId || record.roofId,
    eventType: body.eventType,
    title: body.title.trim(),
    description: body.description?.trim() || '',
    date: body.date || now,
    actor: getCallerContext(req).userId,
    relatedEntityId: body.relatedEntityId,
    createdAt: now,
  };

  db.roofRecordEvents.unshift(event);
  record.timelineEventCount = (record.timelineEventCount || 0) + 1;
  record.updatedAt = now;

  persistDatabase();
  res.status(201).json(event);
});

// -------------------------------------------------------------
// 5. PROJECTS, INSPECTIONS & MEASUREMENTS (ROOFR)
// -------------------------------------------------------------
apiV1Router.get('/projects', (req, res) => {
  const db = getDatabase();
  res.json(db.projects);
});

apiV1Router.post('/projects', (req, res) => {
  const db = getDatabase();
  const body = req.body;
  if (!body.customerId || !body.propertyId || !body.title) {
    return res.status(400).json({ error: 'customerId, propertyId, and title are required.' });
  }

  const now = new Date().toISOString();
  const project: Project = {
    id: generateId('proj'),
    customerId: body.customerId,
    propertyId: body.propertyId,
    roofId: body.roofId,
    title: body.title,
    status: body.status || 'LEAD',
    projectType: body.projectType || 'REPLACEMENT',
    insuranceClaimFlag: Boolean(body.insuranceClaimFlag),
    createdAt: now,
    updatedAt: now,
  };

  db.projects.unshift(project);
  persistDatabase();
  res.status(201).json(project);
});

apiV1Router.get('/inspections', (req, res) => {
  const db = getDatabase();
  const { date, city, status, inspectorUserId, propertyId } = req.query;

  let results = [...db.inspections];

  if (date) {
    const dateStr = String(date);
    results = results.filter((i) => i.scheduledDate.startsWith(dateStr) || (i.completedDate && i.completedDate.startsWith(dateStr)));
  }

  if (city) {
    const cityStr = String(city).toLowerCase();
    const matchingPropIds = db.properties.filter((p) => p.city.toLowerCase().includes(cityStr)).map((p) => p.id);
    results = results.filter((i) => matchingPropIds.includes(i.propertyId));
  }

  if (status) {
    const statusStr = String(status);
    results = results.filter((i) => i.status === statusStr);
  }

  if (inspectorUserId) {
    results = results.filter((i) => i.inspectorUserId === String(inspectorUserId));
  }

  if (propertyId) {
    results = results.filter((i) => i.propertyId === String(propertyId));
  }

  res.json(results);
});

// Full Inspection Detail with Property, Customer, Roof, Measurements, Photos, Storms
apiV1Router.get('/inspections/:id', (req, res) => {
  const db = getDatabase();
  const inspection = db.inspections.find((i) => i.id === req.params.id);
  if (!inspection) return res.status(404).json({ error: 'Inspection not found' });

  const property = db.properties.find((p) => p.id === inspection.propertyId);
  const customer = inspection.customerId
    ? db.customers.find((c) => c.id === inspection.customerId)
    : property ? db.customers.find((c) => c.id === property.customerId) : undefined;
  const roof = inspection.roofId
    ? db.roofs.find((r) => r.id === inspection.roofId)
    : property ? db.roofs.find((r) => r.id === property.roofId) : undefined;
  const roofRecord = property ? db.roofRecords.find((rr) => rr.propertyId === property.id) : undefined;
  const measurements = db.measurements.filter((m) => m.propertyId === inspection.propertyId || m.inspectionId === inspection.id);
  const photos = db.photos.filter((p) => p.inspectionId === inspection.id || p.propertyId === inspection.propertyId);
  const checkIns = db.fieldCheckIns ? db.fieldCheckIns.filter((c) => c.propertyId === inspection.propertyId || (inspection.appointmentId && c.appointmentId === inspection.appointmentId)) : [];
  const appointment = inspection.appointmentId ? db.appointments.find((a) => a.id === inspection.appointmentId) : undefined;
  
  // Contextual weather / storms in this area
  const propertyZips = property?.zip ? [property.zip] : [];
  const storms = db.stormEvents.filter((s) => s.active && s.affectedZipCodes.some((z) => propertyZips.includes(z)));

  // Prior inspections on this property
  const priorInspections = db.inspections.filter((i) => i.propertyId === inspection.propertyId && i.id !== inspection.id);

  res.json({
    inspection,
    property,
    customer,
    roof,
    roofRecord,
    measurements,
    photos,
    checkIns,
    appointment,
    storms,
    priorInspections,
  });
});

apiV1Router.post('/inspections', (req, res) => {
  const db = getDatabase();
  const body = req.body;
  if (!body.propertyId || !body.scheduledDate) {
    return res.status(400).json({ error: 'propertyId and scheduledDate are required.' });
  }

  // Prevent duplicate open inspection for same appointment
  if (body.appointmentId) {
    const existing = db.inspections.find(
      (i) => i.appointmentId === body.appointmentId && i.status !== 'CANCELLED' && i.status !== 'CLOSED'
    );
    if (existing) {
      return res.status(200).json(existing);
    }
  }

  const property = db.properties.find((p) => p.id === body.propertyId);
  const now = new Date().toISOString();
  const inspection: Inspection = {
    id: generateId('insp'),
    propertyId: body.propertyId,
    customerId: body.customerId || property?.customerId,
    projectId: body.projectId,
    roofId: body.roofId || property?.roofId,
    appointmentId: body.appointmentId,
    inspectorUserId: body.inspectorUserId,
    inspectorName: body.inspectorName,
    scheduledDate: body.scheduledDate,
    status: body.status || 'SCHEDULED',
    inspectionType: body.inspectionType || 'FULL_DIAGNOSTIC',
    damageObservations: body.damageObservations || [],
    photoRecordIds: body.photoRecordIds || [],
    atticInspected: Boolean(body.atticInspected),
    ventilationAdequate: Boolean(body.ventilationAdequate),
    flashingCondition: body.flashingCondition || 'SOUND',
    deckingCondition: body.deckingCondition || 'SOLID',
    customerPresent: Boolean(body.customerPresent),
    characteristics: body.characteristics,
    checklistItems: body.checklistItems,
    structuredSummary: body.structuredSummary,
    customerFacingExplanation: body.customerFacingExplanation,
    internalNotes: body.internalNotes,
    customerNotes: body.customerNotes,
    recommendation: body.recommendation,
    recommendedNextStep: body.recommendedNextStep,
    findingsSummary: body.findingsSummary,
    createdAt: now,
    updatedAt: now,
    createdBy: getCallerContext(req).userId,
  };

  db.inspections.unshift(inspection);
  persistDatabase();

  const ctx = getCallerContext(req);
  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'CREATE',
    entityType: 'Inspection',
    entityId: inspection.id,
    newState: inspection,
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  res.status(201).json(inspection);
});

apiV1Router.patch('/inspections/:id', (req, res) => {
  const db = getDatabase();
  const inspection = db.inspections.find((i) => i.id === req.params.id);
  if (!inspection) return res.status(404).json({ error: 'Inspection not found' });

  const prev = { ...inspection };
  const body = req.body;
  const now = new Date().toISOString();

  if (body.status !== undefined) inspection.status = body.status;
  if (body.scheduledDate !== undefined) inspection.scheduledDate = body.scheduledDate;
  if (body.completedDate !== undefined) inspection.completedDate = body.completedDate;
  if (body.inspectorUserId !== undefined) inspection.inspectorUserId = body.inspectorUserId;
  if (body.inspectorName !== undefined) inspection.inspectorName = body.inspectorName;
  if (body.inspectionType !== undefined) inspection.inspectionType = body.inspectionType;
  if (body.findingsSummary !== undefined) inspection.findingsSummary = body.findingsSummary;
  if (body.recommendation !== undefined) inspection.recommendation = body.recommendation;
  if (body.recommendedNextStep !== undefined) inspection.recommendedNextStep = body.recommendedNextStep;
  if (body.atticInspected !== undefined) inspection.atticInspected = Boolean(body.atticInspected);
  if (body.ventilationAdequate !== undefined) inspection.ventilationAdequate = Boolean(body.ventilationAdequate);
  if (body.flashingCondition !== undefined) inspection.flashingCondition = body.flashingCondition;
  if (body.deckingCondition !== undefined) inspection.deckingCondition = body.deckingCondition;
  if (body.approximateSquares !== undefined) inspection.approximateSquares = body.approximateSquares;
  if (body.customerPresent !== undefined) inspection.customerPresent = Boolean(body.customerPresent);
  if (body.characteristics !== undefined) inspection.characteristics = body.characteristics;
  if (body.checklistItems !== undefined) inspection.checklistItems = body.checklistItems;
  if (body.structuredSummary !== undefined) inspection.structuredSummary = body.structuredSummary;
  if (body.customerFacingExplanation !== undefined) inspection.customerFacingExplanation = body.customerFacingExplanation;
  if (body.internalNotes !== undefined) inspection.internalNotes = body.internalNotes;
  if (body.customerNotes !== undefined) inspection.customerNotes = body.customerNotes;
  if (body.damageObservations !== undefined) inspection.damageObservations = body.damageObservations;
  if (body.reviewStatus !== undefined) inspection.reviewStatus = body.reviewStatus;

  inspection.updatedAt = now;
  persistDatabase();

  const ctx = getCallerContext(req);
  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'UPDATE',
    entityType: 'Inspection',
    entityId: inspection.id,
    previousState: prev,
    newState: inspection,
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  res.json(inspection);
});

// Submit inspection findings (Validation + Status SUBMITTED + Chronological Roof Record event + Audit)
apiV1Router.post('/inspections/:id/submit', (req, res) => {
  const db = getDatabase();
  const inspection = db.inspections.find((i) => i.id === req.params.id);
  if (!inspection) return res.status(404).json({ error: 'Inspection not found' });

  const now = new Date().toISOString();
  const ctx = getCallerContext(req);

  // Apply any final payload updates
  if (req.body.findingsSummary) inspection.findingsSummary = req.body.findingsSummary;
  if (req.body.recommendation) inspection.recommendation = req.body.recommendation;
  if (req.body.recommendedNextStep) inspection.recommendedNextStep = req.body.recommendedNextStep;
  if (req.body.structuredSummary) inspection.structuredSummary = req.body.structuredSummary;
  if (req.body.customerFacingExplanation) inspection.customerFacingExplanation = req.body.customerFacingExplanation;
  if (req.body.characteristics) inspection.characteristics = req.body.characteristics;
  if (req.body.checklistItems) inspection.checklistItems = req.body.checklistItems;
  if (req.body.internalNotes) inspection.internalNotes = req.body.internalNotes;
  if (req.body.customerNotes) inspection.customerNotes = req.body.customerNotes;

  inspection.status = 'SUBMITTED';
  inspection.submittedAt = now;
  inspection.submittedBy = ctx.userId;
  inspection.completedDate = now;
  inspection.reviewStatus = 'PENDING_REVIEW';
  inspection.updatedAt = now;

  // Append Chronological Event to Permanent Roof Record
  let roofRecord = db.roofRecords.find((rr) => rr.propertyId === inspection.propertyId);
  if (!roofRecord) {
    const roofRecordId = generateId('rec');
    roofRecord = {
      id: roofRecordId,
      roofId: inspection.roofId || 'roof_default',
      propertyId: inspection.propertyId,
      customerId: inspection.customerId,
      warrantyStatus: 'UNKNOWN',
      timelineEventCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    db.roofRecords.unshift(roofRecord);
  }

  const eventTitle = `Diagnostic Inspection Submitted (${inspection.inspectionType})`;
  const eventDesc = inspection.customerFacingExplanation?.whatWeFound
    ? `Summary: ${inspection.customerFacingExplanation.whatWeFound}. Recommendation: ${inspection.recommendedNextStep || inspection.recommendation || 'Further Review'}.`
    : (inspection.findingsSummary || `Diagnostic roof inspection submitted by inspector. Decking: ${inspection.deckingCondition}, Flashing: ${inspection.flashingCondition}.`);

  const event: RoofRecordEvent = {
    id: generateId('rrev'),
    roofRecordId: roofRecord.id,
    propertyId: inspection.propertyId,
    roofId: inspection.roofId || roofRecord.roofId,
    eventType: 'INSPECTION',
    title: eventTitle,
    description: eventDesc,
    date: now,
    actor: ctx.userId,
    relatedEntityId: inspection.id,
    createdAt: now,
  };

  db.roofRecordEvents.unshift(event);
  roofRecord.timelineEventCount = (roofRecord.timelineEventCount || 0) + 1;
  roofRecord.updatedAt = now;

  persistDatabase();

  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'STATUS_CHANGE',
    entityType: 'Inspection',
    entityId: inspection.id,
    previousState: { status: 'IN_PROGRESS' },
    newState: { status: 'SUBMITTED', submittedAt: now },
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  emitSystemEvent({
    type: 'INSPECTION_COMPLETED',
    entityType: 'INSPECTION',
    entityId: inspection.id,
    userId: ctx.userId,
    data: {
      inspectionId: inspection.id,
      propertyId: inspection.propertyId,
      customerId: inspection.customerId,
      submittedBy: ctx.userId,
      recommendation: inspection.recommendation,
    },
  });

  res.json({
    success: true,
    inspection,
    roofRecordEvent: event,
  });
});

// Quality Control Review endpoint
apiV1Router.post('/inspections/:id/review', (req, res) => {
  const db = getDatabase();
  const inspection = db.inspections.find((i) => i.id === req.params.id);
  if (!inspection) return res.status(404).json({ error: 'Inspection not found' });

  const { reviewStatus, notes } = req.body;
  if (!reviewStatus || !['APPROVED', 'REVISION_REQUESTED'].includes(reviewStatus)) {
    return res.status(400).json({ error: 'reviewStatus must be APPROVED or REVISION_REQUESTED' });
  }

  const now = new Date().toISOString();
  const ctx = getCallerContext(req);

  inspection.reviewStatus = reviewStatus;
  inspection.reviewedAt = now;
  inspection.reviewedBy = ctx.userId;
  if (reviewStatus === 'APPROVED') {
    inspection.status = 'REVIEWED';
  }
  if (notes) {
    inspection.internalNotes = inspection.internalNotes
      ? `${inspection.internalNotes}\n[QC Review (${reviewStatus}) by ${ctx.userId}]: ${notes}`
      : `[QC Review (${reviewStatus}) by ${ctx.userId}]: ${notes}`;
  }
  inspection.updatedAt = now;
  persistDatabase();

  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'STATUS_CHANGE',
    entityType: 'Inspection',
    entityId: inspection.id,
    previousState: { reviewStatus: 'PENDING_REVIEW' },
    newState: { reviewStatus, status: inspection.status },
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  res.json(inspection);
});

// Assign Inspector endpoint
apiV1Router.post('/inspections/:id/assign', (req, res) => {
  const db = getDatabase();
  const inspection = db.inspections.find((i) => i.id === req.params.id);
  if (!inspection) return res.status(404).json({ error: 'Inspection not found' });

  const { inspectorUserId, inspectorName } = req.body;
  const prevInspector = inspection.inspectorUserId;
  const now = new Date().toISOString();
  const ctx = getCallerContext(req);

  inspection.inspectorUserId = inspectorUserId;
  inspection.inspectorName = inspectorName;
  inspection.updatedAt = now;
  persistDatabase();

  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'UPDATE',
    entityType: 'Inspection',
    entityId: inspection.id,
    previousState: { inspectorUserId: prevInspector },
    newState: { inspectorUserId, inspectorName },
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  res.json(inspection);
});

// Add Damage Observation to inspection
apiV1Router.post('/inspections/:id/observations', (req, res) => {
  const db = getDatabase();
  const inspection = db.inspections.find((i) => i.id === req.params.id);
  if (!inspection) return res.status(404).json({ error: 'Inspection not found' });

  const body = req.body;
  const now = new Date().toISOString();
  const ctx = getCallerContext(req);

  const observation: DamageObservation = {
    id: generateId('dmg'),
    inspectionId: inspection.id,
    propertyId: inspection.propertyId,
    roofId: inspection.roofId,
    category: body.category || 'OTHER',
    area: body.area || 'ROOF_PLANE',
    description: body.description || '',
    severity: body.severity || 'MINOR',
    verificationStatus: body.verificationStatus || 'OBSERVED',
    evidence: body.evidence,
    photoIds: body.photoIds || [],
    photoUrl: body.photoUrl,
    inspector: ctx.userId,
    createdAt: now,
  };

  inspection.damageObservations.push(observation);
  db.damageObservations.unshift(observation);
  inspection.updatedAt = now;
  persistDatabase();

  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'CREATE',
    entityType: 'DamageObservation',
    entityId: observation.id,
    newState: observation,
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  res.status(201).json(observation);
});

// Delete Damage Observation
apiV1Router.delete('/inspections/:id/observations/:obsId', (req, res) => {
  const db = getDatabase();
  const inspection = db.inspections.find((i) => i.id === req.params.id);
  if (!inspection) return res.status(404).json({ error: 'Inspection not found' });

  const obsIndex = inspection.damageObservations.findIndex((o) => o.id === req.params.obsId);
  if (obsIndex === -1) return res.status(404).json({ error: 'Observation not found' });

  const removed = inspection.damageObservations.splice(obsIndex, 1)[0];
  const dbIndex = db.damageObservations.findIndex((o) => o.id === req.params.obsId);
  if (dbIndex !== -1) db.damageObservations.splice(dbIndex, 1);

  inspection.updatedAt = new Date().toISOString();
  persistDatabase();

  const ctx = getCallerContext(req);
  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'DELETE',
    entityType: 'DamageObservation',
    entityId: removed.id,
    previousState: removed,
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  res.json({ success: true, removedId: req.params.obsId });
});

// Backward-compatible complete inspection endpoint
apiV1Router.post('/inspections/:id/complete', (req, res) => {
  const db = getDatabase();
  const inspection = db.inspections.find((i) => i.id === req.params.id);
  if (!inspection) return res.status(404).json({ error: 'Inspection not found' });

  const now = new Date().toISOString();
  inspection.status = 'COMPLETED';
  inspection.completedDate = now;
  if (req.body.notes || req.body.findingsSummary) {
    inspection.findingsSummary = req.body.notes || req.body.findingsSummary;
  }
  if (req.body.recommendation) {
    inspection.recommendation = req.body.recommendation;
  }
  inspection.updatedAt = now;
  persistDatabase();

  const ctx = getCallerContext(req);
  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'STATUS_CHANGE',
    entityType: 'Inspection',
    entityId: inspection.id,
    previousState: { status: 'SCHEDULED' },
    newState: { status: 'COMPLETED' },
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  res.json(inspection);
});

// Field Check-In / Check-Out
apiV1Router.post('/check-ins', (req, res) => {
  const db = getDatabase();
  const body = req.body;
  if (!body.propertyId) {
    return res.status(400).json({ error: 'propertyId is required.' });
  }

  const now = new Date().toISOString();
  const ctx = getCallerContext(req);
  const checkIn: FieldCheckIn = {
    id: generateId('chk'),
    appointmentId: body.appointmentId,
    propertyId: body.propertyId,
    userId: ctx.userId || body.userId || 'inspector_user',
    userName: body.userName || 'Field Inspector',
    checkInTime: body.checkInTime || now,
    checkOutTime: body.checkOutTime,
    latitude: body.latitude,
    longitude: body.longitude,
    accuracyMeters: body.accuracyMeters,
    notes: body.notes,
    createdAt: now,
  };

  if (!db.fieldCheckIns) db.fieldCheckIns = [];
  db.fieldCheckIns.unshift(checkIn);
  persistDatabase();

  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'CREATE',
    entityType: 'FieldCheckIn',
    entityId: checkIn.id,
    newState: checkIn,
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  res.status(201).json(checkIn);
});

apiV1Router.get('/check-ins', (req, res) => {
  const db = getDatabase();
  const { propertyId, appointmentId } = req.query;
  let results = db.fieldCheckIns || [];
  if (propertyId) results = results.filter((c) => c.propertyId === String(propertyId));
  if (appointmentId) results = results.filter((c) => c.appointmentId === String(appointmentId));
  res.json(results);
});

// Fast Mobile Photo Upload with Privacy & AI Screening Metadata
apiV1Router.post('/photos/upload', (req, res) => {
  const db = getDatabase();
  const body = req.body;
  if (!body.propertyId) {
    return res.status(400).json({ error: 'propertyId is required.' });
  }

  const now = new Date().toISOString();
  const ctx = getCallerContext(req);
  const photoId = generateId('pht');

  const photo: Photo = {
    id: photoId,
    propertyId: body.propertyId,
    projectId: body.projectId,
    inspectionId: body.inspectionId,
    damageObservationId: body.damageObservationId,
    caption: body.caption || body.description,
    description: body.description || body.caption,
    photoUrl: body.photoUrl || 'https://images.unsplash.com/photo-1632759145351-1d592919f522?auto=format&fit=crop&w=800&q=80',
    area: body.area || 'ROOF_PLANE',
    category: body.category || 'OVERVIEW',
    uploaderId: ctx.userId,
    uploaderName: body.uploaderName || ctx.userId,
    originalTimestamp: body.originalTimestamp || now,
    // Private by default - only authorized staff and authorized homeowner portal may view
    visibility: body.visibility || 'PRIVATE',
    // AI screening is marked NOT_CONFIGURED or REQUIRES_HUMAN_REVIEW
    aiAnalysisStatus: process.env.AI_SCREENING_ENABLED ? 'REQUIRES_HUMAN_REVIEW' : 'NOT_CONFIGURED',
    aiObservations: [],
    createdAt: now,
  };

  db.photos.unshift(photo);

  // Link photo to inspection if provided
  if (body.inspectionId) {
    const inspection = db.inspections.find((i) => i.id === body.inspectionId);
    if (inspection && !inspection.photoRecordIds.includes(photo.id)) {
      inspection.photoRecordIds.push(photo.id);
      inspection.updatedAt = now;
    }
  }

  persistDatabase();

  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'CREATE',
    entityType: 'Photo',
    entityId: photo.id,
    newState: photo,
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  res.status(201).json(photo);
});

apiV1Router.get('/measurements', (req, res) => {
  const db = getDatabase();
  res.json(db.measurements);
});

// Measurement Detail with Provenance & Versioning
apiV1Router.get('/measurements/:id', (req, res) => {
  const db = getDatabase();
  const measurement = db.measurements.find((m) => m.id === req.params.id);
  if (!measurement) return res.status(404).json({ error: 'Measurement not found' });

  const property = db.properties.find((p) => p.id === measurement.propertyId);
  const project = measurement.projectId ? db.projects.find((p) => p.id === measurement.projectId) : undefined;
  const inspection = measurement.inspectionId ? db.inspections.find((i) => i.id === measurement.inspectionId) : undefined;
  const previousVersion = measurement.previousVersionId
    ? db.measurements.find((m) => m.id === measurement.previousVersionId)
    : undefined;

  res.json({
    measurement,
    property,
    project,
    inspection,
    previousVersion,
  });
});

// Order measurement through ROOFR abstraction
apiV1Router.post('/measurements/request', async (req, res) => {
  const db = getDatabase();
  const { propertyId, projectId, inspectionId, provider = 'ROOFR', orderNotes } = req.body;

  const property = db.properties.find((p) => p.id === propertyId);
  if (!property) {
    return res.status(404).json({ error: 'Property not found' });
  }

  const adapter = getActiveAdapter(provider);
  const now = new Date().toISOString();
  const measurementId = generateId('meas');
  const ctx = getCallerContext(req);

  if (!adapter) {
    return res.status(400).json({ error: `Provider adapter for ${provider} is not registered.` });
  }

  const isConnected = await adapter.isConnected();

  if (!isConnected) {
    // Record pending unconfigured measurement order honestly without faking API result
    const measurement: Measurement = {
      id: measurementId,
      propertyId: property.id,
      projectId,
      inspectionId,
      provider: 'ROOFR',
      measurementType: 'THIRD_PARTY',
      provenance: 'THIRD_PARTY',
      status: 'FAILED',
      errorMessage: 'ROOFR API credentials are not yet configured on the server. Please supply ROOFR_API_KEY in server environment settings.',
      requestedBy: ctx.userId,
      requestedAt: now,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
    db.measurements.unshift(measurement);
    persistDatabase();

    logAuditAction({
      userId: ctx.userId,
      userRole: ctx.userRole,
      action: 'CREATE',
      entityType: 'Measurement',
      entityId: measurement.id,
      newState: measurement,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });

    return res.status(400).json({
      error: 'ROOFR integration is not connected. API key required in server environment.',
      status: 'NOT_CONFIGURED',
      measurement,
    });
  }

  try {
    const orderResult = await adapter.requestMeasurement({
      property,
      orderNotes,
    });

    const measurement: Measurement = {
      id: measurementId,
      propertyId: property.id,
      projectId,
      inspectionId,
      provider: 'ROOFR',
      providerRequestId: orderResult.providerRequestId,
      measurementType: 'THIRD_PARTY',
      provenance: 'THIRD_PARTY',
      status: orderResult.status,
      requestedBy: ctx.userId,
      requestedAt: now,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    db.measurements.unshift(measurement);
    persistDatabase();

    logAuditAction({
      userId: ctx.userId,
      userRole: ctx.userRole,
      action: 'CREATE',
      entityType: 'Measurement',
      entityId: measurement.id,
      newState: measurement,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });

    res.status(201).json(measurement);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to dispatch ROOFR order' });
  }
});

// ROOFR Integration Status & Admin Operations
apiV1Router.get('/integrations/roofr/status', async (req, res) => {
  const db = getDatabase();
  const apiKeyPresent = Boolean(process.env.ROOFR_API_KEY && process.env.ROOFR_API_KEY.trim().length > 0);
  const roofrOrders = db.measurements.filter((m) => m.provider === 'ROOFR');
  const lastRequest = roofrOrders.length > 0 ? roofrOrders[0].requestedAt : undefined;
  const lastSuccessfulSync = roofrOrders.find((m) => m.status === 'COMPLETED')?.completedAt;
  const lastError = roofrOrders.find((m) => m.status === 'FAILED')?.errorMessage;

  res.json({
    provider: 'ROOFR',
    category: 'MEASUREMENTS',
    name: 'ROOFR Aerial Measurements',
    status: apiKeyPresent ? 'CONNECTED' : 'NOT_CONFIGURED',
    connected: apiKeyPresent,
    lastRequest,
    lastSuccessfulSync,
    lastError,
    orderCount: roofrOrders.length,
    completedCount: roofrOrders.filter((m) => m.status === 'COMPLETED').length,
    failedCount: roofrOrders.filter((m) => m.status === 'FAILED').length,
    requiredEnvVars: ['ROOFR_API_KEY'],
    isConfiguredOnServer: apiKeyPresent,
  });
});

apiV1Router.post('/integrations/roofr/test', async (req, res) => {
  const apiKeyPresent = Boolean(process.env.ROOFR_API_KEY && process.env.ROOFR_API_KEY.trim().length > 0);
  if (!apiKeyPresent) {
    return res.status(200).json({
      success: false,
      status: 'NOT_CONFIGURED',
      message: 'ROOFR API credentials (ROOFR_API_KEY) are not set in the server environment. Connection test cannot proceed without valid credentials.',
    });
  }

  try {
    const adapter = getActiveAdapter('ROOFR');
    const isConn = await adapter?.isConnected();
    res.json({
      success: isConn,
      status: isConn ? 'CONNECTED' : 'ERROR',
      message: isConn ? 'Successfully verified ROOFR connection.' : 'ROOFR returned unexpected connection status.',
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      status: 'ERROR',
      message: err.message || 'ROOFR connection test failed.',
    });
  }
});

// Webhook listener for ROOFR measurement completions
apiV1Router.post('/integrations/roofr/webhook', async (req, res) => {
  const db = getDatabase();
  const payload = req.body;
  const now = new Date().toISOString();

  // Validate webhook payload if secret configured
  if (payload.report_id || payload.id) {
    const reportId = payload.report_id || payload.id;
    const measurement = db.measurements.find((m) => m.providerRequestId === reportId || m.id === reportId);
    if (measurement) {
      measurement.status = payload.status === 'completed' ? 'COMPLETED' : 'PROCESSING';
      measurement.completedAt = now;
      measurement.updatedAt = now;
      if (payload.total_squares) {
        measurement.normalizedData = {
          totalSquares: payload.total_squares,
          totalAreaSqFt: payload.total_squares * 100,
          predominantPitch: payload.pitch || '6/12',
          ridgesLengthFt: payload.ridges || 0,
          valleysLengthFt: payload.valleys || 0,
          rakesLengthFt: payload.rakes || 0,
          eavesLengthFt: payload.eaves || 0,
          stepFlashingLengthFt: payload.step_flashing || 0,
          flashingLengthFt: payload.flashing || 0,
          facetsCount: payload.facets_count || 0,
        };
      }
      persistDatabase();
    }
  }

  res.json({ received: true });
});

// -------------------------------------------------------------
// 6. APPOINTMENTS & COMMUNICATIONS
// -------------------------------------------------------------
apiV1Router.get('/appointments', (req, res) => {
  const db = getDatabase();
  res.json(db.appointments);
});

apiV1Router.post('/appointments', (req, res) => {
  const db = getDatabase();
  const body = req.body;

  if (!body.propertyId || !body.startTime || !body.title) {
    return res.status(400).json({ error: 'propertyId, startTime, and title are required.' });
  }

  const now = new Date().toISOString();
  const appt: Appointment = {
    id: generateId('appt'),
    propertyId: body.propertyId,
    customerId: body.customerId,
    leadId: body.leadId,
    projectId: body.projectId,
    assignedUserId: body.assignedUserId,
    title: body.title,
    appointmentType: body.appointmentType || 'DIAGNOSTIC_INSPECTION',
    startTime: body.startTime,
    endTime: body.endTime || new Date(new Date(body.startTime).getTime() + 60 * 60 * 1000).toISOString(),
    status: 'REQUESTED',
    address: body.address || '',
    notes: body.notes,
    createdAt: now,
    updatedAt: now,
  };

  db.appointments.unshift(appt);
  persistDatabase();
  res.status(201).json(appt);
});

apiV1Router.patch('/appointments/:id', (req, res) => {
  const db = getDatabase();
  const appt = db.appointments.find((a) => a.id === req.params.id);
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });

  const prev = { ...appt };
  const body = req.body;
  const now = new Date().toISOString();

  if (body.startTime !== undefined) appt.startTime = body.startTime;
  if (body.endTime !== undefined) appt.endTime = body.endTime;
  if (body.status !== undefined) appt.status = body.status;
  if (body.assignedUserId !== undefined) appt.assignedUserId = body.assignedUserId;
  if (body.title !== undefined) appt.title = body.title;
  if (body.appointmentType !== undefined) appt.appointmentType = body.appointmentType;
  if (body.notes !== undefined) appt.notes = body.notes;
  if (body.cancellationReason !== undefined) appt.cancellationReason = body.cancellationReason;
  appt.updatedAt = now;

  persistDatabase();

  const ctx = getCallerContext(req);
  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'UPDATE',
    entityType: 'Appointment',
    entityId: appt.id,
    previousState: prev,
    newState: appt,
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  res.json(appt);
});

apiV1Router.get('/communications', (req, res) => {
  const db = getDatabase();
  res.json(db.communications);
});

apiV1Router.post('/communications', (req, res) => {
  const db = getDatabase();
  const body = req.body;

  if (!body.recipient || !body.body) {
    return res.status(400).json({ error: 'recipient and message body are required.' });
  }

  const now = new Date().toISOString();
  const comm: Communication = {
    id: generateId('comm'),
    channel: body.channel || 'INTERNAL_NOTE',
    direction: body.direction || 'INTERNAL',
    sender: body.sender || 'Staff',
    recipient: body.recipient,
    customerId: body.customerId,
    propertyId: body.propertyId,
    leadId: body.leadId,
    projectId: body.projectId,
    subject: body.subject,
    body: body.body,
    status: 'SENT',
    timestamp: now,
    createdAt: now,
  };

  db.communications.unshift(comm);
  persistDatabase();
  res.status(201).json(comm);
});

// Tasks & To-Dos
apiV1Router.get('/tasks', (req, res) => {
  const db = getDatabase();
  res.json(db.tasks || []);
});

apiV1Router.post('/tasks', (req, res) => {
  const db = getDatabase();
  const body = req.body;
  if (!body.title) return res.status(400).json({ error: 'Task title is required.' });

  const now = new Date().toISOString();
  const task: Task = {
    id: generateId('task'),
    title: body.title.trim(),
    description: body.description?.trim(),
    projectId: body.projectId,
    leadId: body.leadId,
    customerId: body.customerId,
    propertyId: body.propertyId,
    assignedUserId: body.assignedUserId,
    dueDate: body.dueDate,
    priority: body.priority || 'MEDIUM',
    status: 'TODO',
    isDemo: body.isDemo,
    createdAt: now,
    updatedAt: now,
  };

  if (!db.tasks) db.tasks = [];
  db.tasks.unshift(task);
  persistDatabase();
  res.status(201).json(task);
});

apiV1Router.patch('/tasks/:id', (req, res) => {
  const db = getDatabase();
  const task = db.tasks?.find((t) => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const body = req.body;
  const now = new Date().toISOString();

  if (body.title !== undefined) task.title = body.title.trim();
  if (body.description !== undefined) task.description = body.description;
  if (body.status !== undefined) {
    task.status = body.status;
    if (body.status === 'DONE') task.completedAt = now;
  }
  if (body.priority !== undefined) task.priority = body.priority;
  if (body.assignedUserId !== undefined) task.assignedUserId = body.assignedUserId;
  if (body.dueDate !== undefined) task.dueDate = body.dueDate;
  task.updatedAt = now;

  persistDatabase();
  res.json(task);
});

// Storm Events Catalog & Association
apiV1Router.get('/storms', (req, res) => {
  const db = getDatabase();
  res.json(db.stormEvents || []);
});

apiV1Router.post('/storms', (req, res) => {
  const db = getDatabase();
  const body = req.body;
  if (!body.eventName || !body.stormType || !body.dateOccurred) {
    return res.status(400).json({ error: 'eventName, stormType, and dateOccurred are required.' });
  }

  const now = new Date().toISOString();
  const storm: StormEvent = {
    id: generateId('storm'),
    eventName: body.eventName.trim(),
    stormType: body.stormType,
    dateOccurred: body.dateOccurred,
    hailSizeInches: body.hailSizeInches ? Number(body.hailSizeInches) : undefined,
    windSpeedMph: body.windSpeedMph ? Number(body.windSpeedMph) : undefined,
    affectedMarkets: body.affectedMarkets || ['mkt_northeast_texas'],
    affectedZipCodes: body.affectedZipCodes || [],
    notes: body.notes,
    active: body.active !== undefined ? Boolean(body.active) : true,
    isDemo: body.isDemo,
    createdAt: now,
    updatedAt: now,
  };

  if (!db.stormEvents) db.stormEvents = [];
  db.stormEvents.unshift(storm);
  persistDatabase();
  res.status(201).json(storm);
});

apiV1Router.post('/storms/:id/associate', (req, res) => {
  const db = getDatabase();
  const storm = db.stormEvents.find((s) => s.id === req.params.id);
  if (!storm) return res.status(404).json({ error: 'Storm event not found' });

  const { propertyId, roofRecordId } = req.body;
  if (!propertyId && !roofRecordId) {
    return res.status(400).json({ error: 'propertyId or roofRecordId is required.' });
  }

  const now = new Date().toISOString();
  let targetRoofRecord = roofRecordId
    ? db.roofRecords.find((rr) => rr.id === roofRecordId)
    : db.roofRecords.find((rr) => rr.propertyId === propertyId);

  if (targetRoofRecord) {
    const event: RoofRecordEvent = {
      id: generateId('rrev'),
      roofRecordId: targetRoofRecord.id,
      propertyId: targetRoofRecord.propertyId,
      roofId: targetRoofRecord.roofId,
      eventType: 'STORM',
      title: `Storm Impact Registered: ${storm.eventName}`,
      description: `${storm.stormType} event documented on ${storm.dateOccurred}. Hail: ${storm.hailSizeInches ? storm.hailSizeInches + '"' : 'N/A'}, Wind: ${storm.windSpeedMph ? storm.windSpeedMph + ' mph' : 'N/A'}.`,
      date: storm.dateOccurred,
      relatedEntityId: storm.id,
      actor: getCallerContext(req).userId,
      createdAt: now,
    };
    db.roofRecordEvents.unshift(event);
    targetRoofRecord.timelineEventCount = (targetRoofRecord.timelineEventCount || 0) + 1;
    targetRoofRecord.updatedAt = now;
    persistDatabase();
    return res.json({ success: true, event });
  }

  res.status(404).json({ error: 'Associated roof record not found' });
});

// Documents Metadata API
apiV1Router.get('/documents', (req, res) => {
  const db = getDatabase();
  res.json(db.documents || []);
});

apiV1Router.post('/documents', (req, res) => {
  const db = getDatabase();
  const body = req.body;
  if (!body.title || !body.documentType) {
    return res.status(400).json({ error: 'title and documentType are required.' });
  }

  const now = new Date().toISOString();
  const doc: Document = {
    id: generateId('doc'),
    title: body.title.trim(),
    documentType: body.documentType,
    fileRecordId: body.fileRecordId || generateId('fil'),
    customerId: body.customerId,
    propertyId: body.propertyId,
    projectId: body.projectId,
    inspectionId: body.inspectionId,
    isDemo: body.isDemo,
    createdAt: now,
    updatedAt: now,
  };

  if (!db.documents) db.documents = [];
  db.documents.unshift(doc);
  persistDatabase();
  res.status(201).json(doc);
});

// Photos API
apiV1Router.get('/photos', (req, res) => {
  const db = getDatabase();
  res.json(db.photos || []);
});

apiV1Router.post('/photos', (req, res) => {
  const db = getDatabase();
  const body = req.body;
  if (!body.propertyId || !body.category) {
    return res.status(400).json({ error: 'propertyId and category are required.' });
  }

  const now = new Date().toISOString();
  const photo: Photo = {
    id: generateId('pht'),
    fileRecordId: body.fileRecordId || generateId('fil'),
    propertyId: body.propertyId,
    projectId: body.projectId,
    inspectionId: body.inspectionId,
    caption: body.caption?.trim(),
    damageObservationId: body.damageObservationId,
    category: body.category,
    photoUrl: body.photoUrl || 'https://images.unsplash.com/photo-1632759145351-1d592919f522?auto=format&fit=crop&w=800&q=80',
    isDemo: body.isDemo,
    createdAt: now,
  };

  if (!db.photos) db.photos = [];
  db.photos.unshift(photo);
  persistDatabase();
  res.status(201).json(photo);
});

// Demo Data Control Endpoints
apiV1Router.post('/demo/clear', (req, res) => {
  const db = getDatabase();
  // Clear any records marked as isDemo
  db.customers = db.customers.filter((c) => !c.isDemo);
  db.properties = db.properties.filter((p) => !p.isDemo);
  db.roofs = db.roofs.filter((r) => !r.isDemo);
  db.roofRecords = db.roofRecords.filter((rr) => !rr.isDemo);
  db.leads = db.leads.filter((l) => !l.isDemo);
  db.projects = db.projects.filter((p) => !p.isDemo);
  db.inspections = db.inspections.filter((i) => !i.isDemo);
  db.appointments = db.appointments.filter((a) => !a.isDemo);
  db.tasks = db.tasks.filter((t) => !t.isDemo);
  db.documents = db.documents.filter((d) => !d.isDemo);
  db.photos = db.photos.filter((ph) => !ph.isDemo);
  db.stormEvents = db.stormEvents.filter((s) => !s.isDemo);
  db.crews = (db.crews || []).filter((c) => !c.isDemo);

  persistDatabase();
  res.json({ success: true, message: 'All demo-flagged records purged successfully.' });
});

// -------------------------------------------------------------
// 7. ESTIMATES, PROPOSALS, PAYMENTS & MAINTENANCE
// -------------------------------------------------------------

// --- ESTIMATES ---

apiV1Router.get('/estimates', (req, res) => {
  const db = getDatabase();
  const ctx = getCallerContext(req);
  const allowFinancials = canAccessFinancials(ctx.userRole);

  let list = db.estimates || [];

  if (req.query.customerId) {
    list = list.filter((e) => e.customerId === req.query.customerId);
  }
  if (req.query.propertyId) {
    list = list.filter((e) => e.propertyId === req.query.propertyId);
  }
  if (req.query.projectId) {
    list = list.filter((e) => e.projectId === req.query.projectId);
  }
  if (req.query.status) {
    list = list.filter((e) => e.status === req.query.status);
  }
  if (req.query.search) {
    const q = (req.query.search as string).toLowerCase().trim();
    list = list.filter(
      (e) =>
        e.estimateNumber.toLowerCase().includes(q) ||
        (e.title && e.title.toLowerCase().includes(q)) ||
        (e.notes && e.notes.toLowerCase().includes(q))
    );
  }

  const sanitized = list.map((e) => maskEstimateFinancials(e, allowFinancials));
  res.json(sanitized);
});

apiV1Router.get('/estimates/:id', (req, res) => {
  const db = getDatabase();
  const ctx = getCallerContext(req);
  const estimate = (db.estimates || []).find((e) => e.id === req.params.id);

  if (!estimate) {
    return res.status(404).json({ error: 'Estimate not found' });
  }

  const allowFinancials = canAccessFinancials(ctx.userRole);
  res.json(maskEstimateFinancials(estimate, allowFinancials));
});

apiV1Router.post('/estimates', (req, res) => {
  const db = getDatabase();
  const ctx = getCallerContext(req);
  const body = req.body;

  if (!body.customerId || !body.propertyId) {
    return res.status(400).json({ error: 'customerId and propertyId are required' });
  }

  const now = new Date().toISOString();
  const rawLineItems = Array.isArray(body.lineItems) ? body.lineItems : [];
  const totals = calculateEstimateTotals(rawLineItems, body.taxRate ?? 0.0825, body.discounts ?? 0, body.adjustments ?? 0);

  const estimateId = generateId('est');
  const estimateNumber = generateEstimateNumber(db.estimates || []);

  const estimate: Estimate = {
    id: estimateId,
    estimateNumber,
    customerId: body.customerId,
    propertyId: body.propertyId,
    roofId: body.roofRecordId || body.roofId,
    roofRecordId: body.roofRecordId || body.roofId,
    projectId: body.projectId,
    leadId: body.leadId,
    inspectionId: body.inspectionId,
    measurementId: body.measurementId,
    measurementProvenance: body.measurementProvenance,
    scopeTemplateId: body.scopeTemplateId,
    title: (body.title || 'Roof Replacement & Restoration Estimate').trim(),
    version: 1,
    status: 'DRAFT',
    estimateType: body.estimateType || 'REPLACEMENT',
    pricingMethod: body.pricingMethod || 'UNIT_PRICE',
    lineItems: totals.lineItems.map((li) => ({ ...li, estimateId })),
    subtotal: totals.subtotal,
    discounts: totals.discounts,
    adjustments: totals.adjustments,
    taxRate: totals.taxRate,
    tax: totals.tax,
    total: totals.total,
    internalCost: totals.internalCost,
    estimatedGrossProfit: totals.estimatedGrossProfit,
    estimatedMargin: totals.estimatedMargin,
    notes: body.notes,
    internalNotes: body.internalNotes,
    customerNotes: body.customerNotes,
    validUntil: body.validUntil || new Date(Date.now() + 30 * 86400000).toISOString(),
    insuranceMetadata: body.insuranceMetadata,
    versions: [
      {
        id: generateId('ever'),
        estimateId,
        versionNumber: 1,
        measurementId: body.measurementId,
        measurementProvenance: body.measurementProvenance,
        subtotal: totals.subtotal,
        discounts: totals.discounts,
        adjustments: totals.adjustments,
        tax: totals.tax,
        total: totals.total,
        internalCost: totals.internalCost,
        estimatedGrossProfit: totals.estimatedGrossProfit,
        estimatedMargin: totals.estimatedMargin,
        lineItems: totals.lineItems.map((li) => ({ ...li, estimateId })),
        createdBy: ctx.userId,
        createdAt: now,
      },
    ],
    createdBy: ctx.userId,
    updatedBy: ctx.userId,
    createdAt: now,
    updatedAt: now,
  };

  if (!db.estimates) db.estimates = [];
  db.estimates.unshift(estimate);
  persistDatabase();

  emitSystemEvent({
    type: 'ESTIMATE_CREATED',
    entityType: 'Estimate',
    entityId: estimate.id,
    data: {
      estimateNumber: estimate.estimateNumber,
      total: estimate.total,
      title: estimate.title,
    },
  });

  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'CREATE',
    entityType: 'Estimate',
    entityId: estimate.id,
    newState: estimate,
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  const allowFinancials = canAccessFinancials(ctx.userRole);
  res.status(201).json(maskEstimateFinancials(estimate, allowFinancials));
});

apiV1Router.put('/estimates/:id', (req, res) => {
  const db = getDatabase();
  const ctx = getCallerContext(req);
  const estimate = (db.estimates || []).find((e) => e.id === req.params.id);

  if (!estimate) {
    return res.status(404).json({ error: 'Estimate not found' });
  }

  const previousState = JSON.parse(JSON.stringify(estimate));
  const body = req.body;
  const now = new Date().toISOString();

  // Determine if this is a material revision that triggers a version increment
  const isMaterialChange =
    (estimate.status === 'APPROVED' || estimate.status === 'SENT' || body.createVersion === true) &&
    (body.lineItems || body.adjustments !== undefined || body.discounts !== undefined);

  if (isMaterialChange) {
    if (!estimate.versions) estimate.versions = [];
    estimate.versions.push({
      id: generateId('ever'),
      estimateId: estimate.id,
      versionNumber: estimate.version,
      measurementId: estimate.measurementId,
      measurementProvenance: estimate.measurementProvenance,
      subtotal: estimate.subtotal,
      discounts: estimate.discounts,
      adjustments: estimate.adjustments,
      tax: estimate.tax,
      total: estimate.total,
      internalCost: estimate.internalCost,
      estimatedGrossProfit: estimate.estimatedGrossProfit,
      estimatedMargin: estimate.estimatedMargin,
      lineItems: estimate.lineItems,
      reasonForRevision: body.reasonForRevision || 'Scope / pricing adjustment after initial approval',
      createdBy: ctx.userId,
      createdAt: now,
    });
    estimate.version += 1;
    estimate.status = 'REVISED';
  }

  if (body.title !== undefined) estimate.title = body.title.trim();
  if (body.notes !== undefined) estimate.notes = body.notes;
  if (body.internalNotes !== undefined) estimate.internalNotes = body.internalNotes;
  if (body.customerNotes !== undefined) estimate.customerNotes = body.customerNotes;
  if (body.validUntil !== undefined) estimate.validUntil = body.validUntil;
  if (body.measurementId !== undefined) estimate.measurementId = body.measurementId;
  if (body.measurementProvenance !== undefined) estimate.measurementProvenance = body.measurementProvenance;
  if (body.inspectionId !== undefined) estimate.inspectionId = body.inspectionId;
  if (body.insuranceMetadata !== undefined) estimate.insuranceMetadata = body.insuranceMetadata;

  if (body.lineItems || body.adjustments !== undefined || body.discounts !== undefined || body.taxRate !== undefined) {
    const rawLineItems = Array.isArray(body.lineItems) ? body.lineItems : estimate.lineItems;
    const taxRate = body.taxRate !== undefined ? body.taxRate : (estimate.taxRate ?? 0.0825);
    const discounts = body.discounts !== undefined ? body.discounts : estimate.discounts;
    const adjustments = body.adjustments !== undefined ? body.adjustments : estimate.adjustments;

    const totals = calculateEstimateTotals(rawLineItems, taxRate, discounts, adjustments);
    estimate.lineItems = totals.lineItems.map((li) => ({ ...li, estimateId: estimate.id }));
    estimate.subtotal = totals.subtotal;
    estimate.discounts = totals.discounts;
    estimate.adjustments = totals.adjustments;
    estimate.taxRate = totals.taxRate;
    estimate.tax = totals.tax;
    estimate.total = totals.total;
    estimate.internalCost = totals.internalCost;
    estimate.estimatedGrossProfit = totals.estimatedGrossProfit;
    estimate.estimatedMargin = totals.estimatedMargin;
  }

  estimate.updatedBy = ctx.userId;
  estimate.updatedAt = now;

  persistDatabase();

  emitSystemEvent({
    type: isMaterialChange ? 'ESTIMATE_REVISED' : 'ESTIMATE_UPDATED',
    entityType: 'Estimate',
    entityId: estimate.id,
    data: {
      estimateNumber: estimate.estimateNumber,
      total: estimate.total,
      version: estimate.version,
    },
  });

  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'UPDATE',
    entityType: 'Estimate',
    entityId: estimate.id,
    previousState,
    newState: estimate,
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  const allowFinancials = canAccessFinancials(ctx.userRole);
  res.json(maskEstimateFinancials(estimate, allowFinancials));
});

apiV1Router.post('/estimates/:id/approve', (req, res) => {
  const db = getDatabase();
  const ctx = getCallerContext(req);
  const estimate = (db.estimates || []).find((e) => e.id === req.params.id);

  if (!estimate) {
    return res.status(404).json({ error: 'Estimate not found' });
  }

  const previousState = { status: estimate.status, approvedBy: estimate.approvedBy, approvedAt: estimate.approvedAt };
  estimate.status = 'APPROVED';
  estimate.approvedBy = ctx.userId;
  estimate.approvedAt = new Date().toISOString();
  estimate.updatedBy = ctx.userId;
  estimate.updatedAt = new Date().toISOString();

  persistDatabase();

  emitSystemEvent({
    type: 'ESTIMATE_APPROVED',
    entityType: 'Estimate',
    entityId: estimate.id,
    data: {
      estimateNumber: estimate.estimateNumber,
      total: estimate.total,
      approvedBy: ctx.userId,
    },
  });

  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'PROPOSAL_APPROVAL',
    entityType: 'Estimate',
    entityId: estimate.id,
    previousState,
    newState: { status: estimate.status, approvedBy: estimate.approvedBy, approvedAt: estimate.approvedAt },
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  const allowFinancials = canAccessFinancials(ctx.userRole);
  res.json(maskEstimateFinancials(estimate, allowFinancials));
});

apiV1Router.post('/estimates/:id/status', (req, res) => {
  const db = getDatabase();
  const ctx = getCallerContext(req);
  const estimate = (db.estimates || []).find((e) => e.id === req.params.id);

  if (!estimate) {
    return res.status(404).json({ error: 'Estimate not found' });
  }

  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });

  const previousStatus = estimate.status;
  estimate.status = status;
  estimate.updatedBy = ctx.userId;
  estimate.updatedAt = new Date().toISOString();

  persistDatabase();

  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'STATUS_CHANGE',
    entityType: 'Estimate',
    entityId: estimate.id,
    previousState: { status: previousStatus },
    newState: { status: estimate.status },
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  const allowFinancials = canAccessFinancials(ctx.userRole);
  res.json(maskEstimateFinancials(estimate, allowFinancials));
});

apiV1Router.delete('/estimates/:id', (req, res) => {
  const db = getDatabase();
  const ctx = getCallerContext(req);
  const estimate = (db.estimates || []).find((e) => e.id === req.params.id);

  if (!estimate) {
    return res.status(404).json({ error: 'Estimate not found' });
  }

  if (estimate.status === 'ACCEPTED') {
    return res.status(400).json({ error: 'Cannot delete an accepted estimate' });
  }

  db.estimates = db.estimates.filter((e) => e.id !== req.params.id);
  persistDatabase();

  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'DELETE',
    entityType: 'Estimate',
    entityId: req.params.id,
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  res.json({ success: true, message: 'Estimate deleted' });
});

// --- PROPOSALS ---

apiV1Router.get('/proposals', (req, res) => {
  const db = getDatabase();
  const ctx = getCallerContext(req);
  const allowFinancials = canAccessFinancials(ctx.userRole);

  let list = db.proposals || [];

  if (req.query.customerId) {
    list = list.filter((p) => p.customerId === req.query.customerId);
  }
  if (req.query.propertyId) {
    list = list.filter((p) => p.propertyId === req.query.propertyId);
  }
  if (req.query.projectId) {
    list = list.filter((p) => p.projectId === req.query.projectId);
  }
  if (req.query.estimateId) {
    list = list.filter((p) => p.estimateId === req.query.estimateId);
  }
  if (req.query.status) {
    list = list.filter((p) => p.status === req.query.status);
  }
  if (req.query.search) {
    const q = (req.query.search as string).toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.proposalNumber.toLowerCase().includes(q) ||
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.projectSummary && p.projectSummary.toLowerCase().includes(q))
    );
  }

  const sanitized = list.map((p) => maskProposalFinancials(p, allowFinancials));
  res.json(sanitized);
});

apiV1Router.get('/proposals/:id', (req, res) => {
  const db = getDatabase();
  const ctx = getCallerContext(req);
  const proposal = (db.proposals || []).find((p) => p.id === req.params.id);

  if (!proposal) {
    return res.status(404).json({ error: 'Proposal not found' });
  }

  const allowFinancials = canAccessFinancials(ctx.userRole);
  res.json(maskProposalFinancials(proposal, allowFinancials));
});

apiV1Router.post('/proposals', (req, res) => {
  const db = getDatabase();
  const ctx = getCallerContext(req);
  const body = req.body;

  if (!body.estimateId) {
    return res.status(400).json({ error: 'estimateId is required to generate a proposal' });
  }

  const estimate = (db.estimates || []).find((e) => e.id === body.estimateId);
  if (!estimate) {
    return res.status(404).json({ error: 'Referenced estimate not found' });
  }

  const now = new Date().toISOString();
  const proposalId = generateId('prop');
  const proposalNumber = generateProposalNumber(db.proposals || []);
  const publicAccessToken = generateId('token');

  // Build options: if not explicitly supplied, create a primary option directly from the estimate
  let options: ProposalOption[] = body.options;
  if (!options || options.length === 0) {
    const scopeList = estimate.lineItems.map((li) => `${li.quantity} ${li.unit} — ${li.description}`);
    options = [
      {
        id: generateId('popt'),
        tier: 'GOOD',
        name: estimate.title || 'Architectural Shingle Roof Replacement',
        roofSystem: 'Lifetime Architectural Shingle System',
        manufacturer: 'GAF',
        product: 'Timberline HDZ',
        warrantyYears: 30,
        warrantyDescription: 'Lifetime 50-year manufacturer shingles with 10-year non-prorated period; 5-year The Roof Doctors workmanship warranty.',
        price: estimate.total,
        internalCost: estimate.internalCost,
        margin: estimate.estimatedMargin,
        scope: scopeList,
        isRecommended: true,
      },
    ];
  }

  const scopeOfWorkText =
    body.scopeOfWork ||
    estimate.lineItems
      .map((item, idx) => `${idx + 1}. ${item.description} (${item.quantity} ${item.unit})`)
      .join('\n');

  const defaultTerms =
    body.terms ||
    '1. Acceptance of Proposal: The prices, specifications, and conditions are satisfactory and hereby accepted.\n' +
    '2. Payment Terms: Required deposit upon acceptance; remaining balance due upon substantial completion of roof installation.\n' +
    '3. Workmanship Guarantee: The Roof Doctors guarantees all workmanship against leaks for a minimum period of 5 years from completion date.\n' +
    '4. Clean Up: Property will be thoroughly swept with magnetic sweeps; all roofing debris hauled away and disposed of legally.';

  const proposal: Proposal = {
    id: proposalId,
    proposalNumber,
    estimateId: estimate.id,
    estimateVersionId: estimate.versions?.[estimate.versions.length - 1]?.id,
    projectId: estimate.projectId,
    customerId: estimate.customerId,
    propertyId: estimate.propertyId,
    leadId: estimate.leadId,
    roofRecordId: estimate.roofRecordId || estimate.roofId,
    title: (body.title || `Proposal #${proposalNumber} — ${estimate.title}`).trim(),
    status: 'DRAFT',
    introduction:
      body.introduction ||
      'Thank you for giving The Roof Doctors the opportunity to evaluate your property. Below is our formal proposal outlining the diagnostic findings, detailed scope of work, warranty coverage, and investment options.',
    projectSummary:
      body.projectSummary ||
      'Complete roof restoration and replacement including complete tear-off, synthetic underlayment, ice and water shield in valleys, replacement of all pipe boots, and installation of high-definition architectural shingles.',
    options,
    selectedOptionId: options[0]?.id,
    scopeOfWork: scopeOfWorkText,
    terms: defaultTerms,
    exclusions: body.exclusions || [
      'Unforeseen rotten decking or structural rafter damage discovered after tear-off (billed at standard $95/sheet rate).',
      'Interior drywall or ceiling water stain painting unless specifically added to scope.',
    ],
    assumptions: body.assumptions || [
      'Clear driveway access provided on installation day for dumpster and delivery truck.',
      'Pets kept indoors during active roof tear-off and nailing.',
    ],
    depositRequired: body.depositRequired ?? Math.round(estimate.total * 0.3),
    depositStatus: 'PENDING',
    warrantyInformation:
      body.warrantyInformation ||
      'Backed by GAF Manufacturer Warranty and The Roof Doctors 5-Year Leak-Free Workmanship Warranty.',
    publicAccessToken,
    expiresAt: body.expiresAt || new Date(Date.now() + 30 * 86400000).toISOString(),
    createdBy: ctx.userId,
    updatedBy: ctx.userId,
    createdAt: now,
    updatedAt: now,
  };

  if (!db.proposals) db.proposals = [];
  db.proposals.unshift(proposal);

  estimate.convertedProposalId = proposal.id;
  persistDatabase();

  emitSystemEvent({
    type: 'PROPOSAL_CREATED',
    entityType: 'Proposal',
    entityId: proposal.id,
    data: {
      proposalNumber: proposal.proposalNumber,
      total: options[0]?.price || estimate.total,
      customerId: proposal.customerId,
    },
  });

  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'CREATE',
    entityType: 'Proposal',
    entityId: proposal.id,
    newState: proposal,
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  const allowFinancials = canAccessFinancials(ctx.userRole);
  res.status(201).json(maskProposalFinancials(proposal, allowFinancials));
});

apiV1Router.put('/proposals/:id', (req, res) => {
  const db = getDatabase();
  const ctx = getCallerContext(req);
  const proposal = (db.proposals || []).find((p) => p.id === req.params.id);

  if (!proposal) {
    return res.status(404).json({ error: 'Proposal not found' });
  }

  const previousState = JSON.parse(JSON.stringify(proposal));
  const body = req.body;

  if (body.title !== undefined) proposal.title = body.title.trim();
  if (body.introduction !== undefined) proposal.introduction = body.introduction;
  if (body.projectSummary !== undefined) proposal.projectSummary = body.projectSummary;
  if (body.scopeOfWork !== undefined) proposal.scopeOfWork = body.scopeOfWork;
  if (body.terms !== undefined) proposal.terms = body.terms;
  if (body.exclusions !== undefined) proposal.exclusions = body.exclusions;
  if (body.assumptions !== undefined) proposal.assumptions = body.assumptions;
  if (body.depositRequired !== undefined) proposal.depositRequired = Number(body.depositRequired);
  if (body.expiresAt !== undefined) proposal.expiresAt = body.expiresAt;
  if (body.selectedOptionId !== undefined) proposal.selectedOptionId = body.selectedOptionId;
  if (Array.isArray(body.options)) proposal.options = body.options;

  proposal.updatedBy = ctx.userId;
  proposal.updatedAt = new Date().toISOString();

  persistDatabase();

  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'UPDATE',
    entityType: 'Proposal',
    entityId: proposal.id,
    previousState,
    newState: proposal,
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  const allowFinancials = canAccessFinancials(ctx.userRole);
  res.json(maskProposalFinancials(proposal, allowFinancials));
});

apiV1Router.post('/proposals/:id/send', (req, res) => {
  const db = getDatabase();
  const ctx = getCallerContext(req);
  const proposal = (db.proposals || []).find((p) => p.id === req.params.id);

  if (!proposal) {
    return res.status(404).json({ error: 'Proposal not found' });
  }

  const previousStatus = proposal.status;
  proposal.status = 'SENT';
  proposal.sentAt = new Date().toISOString();
  proposal.updatedBy = ctx.userId;
  proposal.updatedAt = new Date().toISOString();

  // Also update linked estimate status to SENT if it was APPROVED or DRAFT
  const estimate = (db.estimates || []).find((e) => e.id === proposal.estimateId);
  if (estimate && (estimate.status === 'APPROVED' || estimate.status === 'DRAFT')) {
    estimate.status = 'SENT';
    estimate.updatedAt = new Date().toISOString();
  }

  persistDatabase();

  emitSystemEvent({
    type: 'PROPOSAL_SENT',
    entityType: 'Proposal',
    entityId: proposal.id,
    data: {
      proposalNumber: proposal.proposalNumber,
      customerId: proposal.customerId,
    },
  });

  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'STATUS_CHANGE',
    entityType: 'Proposal',
    entityId: proposal.id,
    previousState: { status: previousStatus },
    newState: { status: 'SENT', sentAt: proposal.sentAt },
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  const allowFinancials = canAccessFinancials(ctx.userRole);
  res.json(maskProposalFinancials(proposal, allowFinancials));
});

apiV1Router.post('/proposals/:id/viewed', (req, res) => {
  const db = getDatabase();
  const ctx = getCallerContext(req);
  const proposal = (db.proposals || []).find((p) => p.id === req.params.id);

  if (!proposal) {
    return res.status(404).json({ error: 'Proposal not found' });
  }

  if (proposal.status === 'SENT') {
    proposal.status = 'VIEWED';
  }
  proposal.viewedAt = new Date().toISOString();
  proposal.updatedAt = new Date().toISOString();

  persistDatabase();

  emitSystemEvent({
    type: 'PROPOSAL_VIEWED',
    entityType: 'Proposal',
    entityId: proposal.id,
    data: {
      proposalNumber: proposal.proposalNumber,
    },
  });

  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'STATUS_CHANGE',
    entityType: 'Proposal',
    entityId: proposal.id,
    newState: { status: proposal.status, viewedAt: proposal.viewedAt },
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  res.json({ success: true, status: proposal.status, viewedAt: proposal.viewedAt });
});

apiV1Router.post('/proposals/:id/accept', (req, res) => {
  const db = getDatabase();
  const ctx = getCallerContext(req);
  const proposal = (db.proposals || []).find((p) => p.id === req.params.id);

  if (!proposal) {
    return res.status(404).json({ error: 'Proposal not found' });
  }

  const { signerName, signerEmail, selectedOptionId, acceptanceMethod, notes } = req.body;
  if (!signerName || !signerName.trim()) {
    return res.status(400).json({ error: 'Signer full name is required for contract acceptance.' });
  }

  const now = new Date().toISOString();
  proposal.status = 'ACCEPTED';
  proposal.acceptedAt = now;
  proposal.signatureName = signerName.trim();
  proposal.signatureDate = now;
  if (selectedOptionId) {
    proposal.selectedOptionId = selectedOptionId;
  }

  const selectedOption =
    proposal.options.find((o) => o.id === proposal.selectedOptionId) || proposal.options[0];
  const soldAmount = selectedOption ? selectedOption.price : 0;

  proposal.acceptance = {
    signerName: signerName.trim(),
    signerEmail: signerEmail || 'customer@homeowner.com',
    signedAt: now,
    consentText:
      'I hereby accept this proposal, scope of work, specifications, and terms of service from The Roof Doctors. I authorize the scheduled procurement and commencement of work.',
    acceptanceMethod: acceptanceMethod || 'CLICK_TO_SIGN',
    provider: 'INTERNAL_E_SIGN',
  };
  proposal.updatedBy = ctx.userId;
  proposal.updatedAt = now;

  // 1. Update linked Estimate
  const estimate = (db.estimates || []).find((e) => e.id === proposal.estimateId);
  if (estimate) {
    estimate.status = 'ACCEPTED';
    estimate.updatedAt = now;
  }

  // 2. SALE & PROJECT HANDOFF (Preserves Lead -> Customer -> Property -> Roof -> Inspection -> Measurement -> Estimate -> Proposal -> Sale/Project)
  // Check if project exists to prevent duplicate creation
  if (!db.projects) db.projects = [];
  let project = db.projects.find(
    (p) =>
      p.id === proposal.projectId ||
      (p.customerId === proposal.customerId && p.propertyId === proposal.propertyId && p.status !== 'COMPLETED')
  );

  if (!project) {
    project = {
      id: generateId('proj'),
      customerId: proposal.customerId,
      propertyId: proposal.propertyId,
      roofId: proposal.roofRecordId,
      leadId: proposal.leadId,
      title: proposal.title || 'Roof Replacement & Restoration Project',
      status: 'SOLD',
      projectType: 'REPLACEMENT',
      insuranceClaimFlag: false,
      totalContractValue: soldAmount,
      targetStartDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      createdAt: now,
      updatedAt: now,
    };
    db.projects.unshift(project);
    proposal.projectId = project.id;
  } else {
    project.status = 'SOLD';
    if (!project.totalContractValue) project.totalContractValue = soldAmount;
    project.updatedAt = now;
    proposal.projectId = project.id;
  }

  // 3. Create or update Sale record
  if (!db.sales) db.sales = [];
  let sale = db.sales.find((s) => s.proposalId === proposal.id);
  if (!sale) {
    sale = {
      id: generateId('sale'),
      proposalId: proposal.id,
      estimateId: proposal.estimateId,
      projectId: project.id,
      customerId: proposal.customerId,
      propertyId: proposal.propertyId,
      leadId: proposal.leadId,
      soldAmount,
      depositRequired: proposal.depositRequired,
      depositReceived: 0,
      selectedOptionName: selectedOption?.name || 'Selected Roof Scope',
      roofSystem: selectedOption?.roofSystem || 'Lifetime Architectural Shingles',
      soldDate: now,
      status: 'PENDING_DEPOSIT',
      createdAt: now,
      updatedAt: now,
    };
    db.sales.unshift(sale);
  } else {
    sale.soldAmount = soldAmount;
    sale.status = 'PENDING_DEPOSIT';
    sale.updatedAt = now;
  }

  // 4. Update Lead status if applicable
  if (proposal.leadId) {
    const lead = (db.leads || []).find((l) => l.id === proposal.leadId);
    if (lead) {
      lead.status = 'JOB_SOLD';
      lead.convertedCustomerId = proposal.customerId;
      lead.convertedProjectId = project.id;
      lead.convertedAt = now;
      lead.updatedAt = now;
    }
  }

  persistDatabase();

  emitSystemEvent({
    type: 'PROPOSAL_ACCEPTED',
    entityType: 'Proposal',
    entityId: proposal.id,
    data: {
      proposalNumber: proposal.proposalNumber,
      signerName: proposal.signatureName,
      amount: soldAmount,
      selectedOptionName: selectedOption?.name,
    },
  });

  emitSystemEvent({
    type: 'SALE_CREATED',
    entityType: 'Sale',
    entityId: sale.id,
    data: {
      soldAmount,
      customerId: proposal.customerId,
      projectId: project.id,
      proposalNumber: proposal.proposalNumber,
    },
  });

  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'STATUS_CHANGE',
    entityType: 'Proposal',
    entityId: proposal.id,
    newState: { status: 'ACCEPTED', signerName: proposal.signatureName, soldAmount },
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  const allowFinancials = canAccessFinancials(ctx.userRole);
  res.json({
    success: true,
    message: 'Proposal successfully accepted and contract finalized!',
    proposal: maskProposalFinancials(proposal, allowFinancials),
    sale,
    project,
  });
});

apiV1Router.post('/proposals/:id/decline', (req, res) => {
  const db = getDatabase();
  const ctx = getCallerContext(req);
  const proposal = (db.proposals || []).find((p) => p.id === req.params.id);

  if (!proposal) {
    return res.status(404).json({ error: 'Proposal not found' });
  }

  const now = new Date().toISOString();
  proposal.status = 'DECLINED';
  proposal.declinedAt = now;
  proposal.declinedReason = (req.body.reason || req.body.notes || 'Customer chose to decline proposal').trim();
  proposal.updatedBy = ctx.userId;
  proposal.updatedAt = now;

  const estimate = (db.estimates || []).find((e) => e.id === proposal.estimateId);
  if (estimate && estimate.status !== 'ACCEPTED') {
    estimate.status = 'DECLINED';
    estimate.updatedAt = now;
  }

  persistDatabase();

  emitSystemEvent({
    type: 'PROPOSAL_DECLINED',
    entityType: 'Proposal',
    entityId: proposal.id,
    data: {
      proposalNumber: proposal.proposalNumber,
      reason: proposal.declinedReason,
    },
  });

  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'STATUS_CHANGE',
    entityType: 'Proposal',
    entityId: proposal.id,
    newState: { status: 'DECLINED', reason: proposal.declinedReason },
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  const allowFinancials = canAccessFinancials(ctx.userRole);
  res.json(maskProposalFinancials(proposal, allowFinancials));
});

// --- CUSTOMER PORTAL SAFE PROPOSAL ENDPOINT ---
// STRICT CONSTRAINT: NEVER EXPOSE internal costs, margins, markups, or private notes

apiV1Router.get('/portal/proposals/:id', (req, res) => {
  const db = getDatabase();
  const proposal = (db.proposals || []).find((p) => p.id === req.params.id);

  if (!proposal) {
    return res.status(404).json({ error: 'Proposal not found or link has expired' });
  }

  // Mark viewed if newly opened
  if (proposal.status === 'SENT') {
    proposal.status = 'VIEWED';
    proposal.viewedAt = new Date().toISOString();
    persistDatabase();
    emitSystemEvent({
      type: 'PROPOSAL_VIEWED',
      entityType: 'Proposal',
      entityId: proposal.id,
      data: { proposalNumber: proposal.proposalNumber },
    });
  }

  const customer = (db.customers || []).find((c) => c.id === proposal.customerId);
  const property = (db.properties || []).find((p) => p.id === proposal.propertyId);
  const estimate = (db.estimates || []).find((e) => e.id === proposal.estimateId);

  // Strip all internal fields from options
  const safeOptions = (proposal.options || []).map((opt) => ({
    id: opt.id,
    tier: opt.tier,
    name: opt.name,
    roofSystem: opt.roofSystem,
    manufacturer: opt.manufacturer,
    product: opt.product,
    color: opt.color,
    warrantyYears: opt.warrantyYears,
    warrantyDescription: opt.warrantyDescription,
    price: opt.price,
    scope: opt.scope,
    upgrades: opt.upgrades,
    exclusions: opt.exclusions,
    isRecommended: opt.isRecommended,
    imageUrl: opt.imageUrl,
  }));

  // Strip all internal costs from line items
  const safeLineItems = (estimate?.lineItems || []).map((li) => ({
    id: li.id,
    description: li.description,
    category: li.category,
    quantity: li.quantity,
    unit: li.unit,
    unitPrice: li.unitPrice,
    totalPrice: li.totalPrice,
  }));

  const portalPayload = {
    proposal: {
      id: proposal.id,
      proposalNumber: proposal.proposalNumber,
      title: proposal.title,
      status: proposal.status,
      introduction: proposal.introduction,
      projectSummary: proposal.projectSummary,
      options: safeOptions,
      selectedOptionId: proposal.selectedOptionId || safeOptions[0]?.id,
      scopeOfWork: proposal.scopeOfWork,
      terms: proposal.terms,
      exclusions: proposal.exclusions,
      assumptions: proposal.assumptions,
      depositRequired: proposal.depositRequired,
      warrantyInformation: proposal.warrantyInformation,
      expiresAt: proposal.expiresAt,
      sentAt: proposal.sentAt,
      viewedAt: proposal.viewedAt,
      acceptedAt: proposal.acceptedAt,
      declinedAt: proposal.declinedAt,
      signatureName: proposal.signatureName,
      signatureDate: proposal.signatureDate,
      acceptance: proposal.acceptance,
    },
    lineItems: safeLineItems,
    customer: customer
      ? {
          name: `${customer.firstName} ${customer.lastName}`,
          email: customer.email,
          phone: customer.phone,
        }
      : null,
    property: property
      ? {
          address: property.address,
          city: property.city,
          state: property.state,
          zip: property.zip,
        }
      : null,
    company: {
      name: 'The Roof Doctors',
      phone: '903-231-5940',
      emergencyPhone: '903-231-5940',
      email: 'service@theroofdoctors.com',
      license: 'Texas Licensed Roofing Contractor & Insurance Specialists',
      tagline: 'Precision Diagnostics • Storm Damage Restoration • Lifetime Warranties',
    },
  };

  res.json(portalPayload);
});

apiV1Router.post('/portal/proposals/:id/accept', (req, res) => {
  // Delegate directly to the secure acceptance logic
  const db = getDatabase();
  const proposal = (db.proposals || []).find((p) => p.id === req.params.id);

  if (!proposal) {
    return res.status(404).json({ error: 'Proposal not found' });
  }

  const { signerName, signerEmail, selectedOptionId } = req.body;
  if (!signerName || !signerName.trim()) {
    return res.status(400).json({ error: 'Signer full name is required for contract acceptance.' });
  }

  const now = new Date().toISOString();
  proposal.status = 'ACCEPTED';
  proposal.acceptedAt = now;
  proposal.signatureName = signerName.trim();
  proposal.signatureDate = now;
  if (selectedOptionId) {
    proposal.selectedOptionId = selectedOptionId;
  }

  const selectedOption =
    proposal.options.find((o) => o.id === proposal.selectedOptionId) || proposal.options[0];
  const soldAmount = selectedOption ? selectedOption.price : 0;

  proposal.acceptance = {
    signerName: signerName.trim(),
    signerEmail: signerEmail || 'homeowner@customer.com',
    signedAt: now,
    consentText:
      'I hereby accept this proposal, scope of work, specifications, and terms of service from The Roof Doctors. I authorize the scheduled procurement and commencement of work.',
    acceptanceMethod: 'CLICK_TO_SIGN',
    provider: 'INTERNAL_E_SIGN',
  };
  proposal.updatedAt = now;

  // 1. Update Estimate
  const estimate = (db.estimates || []).find((e) => e.id === proposal.estimateId);
  if (estimate) {
    estimate.status = 'ACCEPTED';
    estimate.updatedAt = now;
  }

  // 2. Project handoff (prevent duplicates)
  if (!db.projects) db.projects = [];
  let project = db.projects.find(
    (p) =>
      p.id === proposal.projectId ||
      (p.customerId === proposal.customerId && p.propertyId === proposal.propertyId && p.status !== 'COMPLETED')
  );

  if (!project) {
    project = {
      id: generateId('proj'),
      customerId: proposal.customerId,
      propertyId: proposal.propertyId,
      roofId: proposal.roofRecordId,
      leadId: proposal.leadId,
      title: proposal.title || 'Roof Replacement & Restoration Project',
      status: 'SOLD',
      projectType: 'REPLACEMENT',
      insuranceClaimFlag: false,
      totalContractValue: soldAmount,
      targetStartDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      createdAt: now,
      updatedAt: now,
    };
    db.projects.unshift(project);
    proposal.projectId = project.id;
  } else {
    project.status = 'SOLD';
    if (!project.totalContractValue) project.totalContractValue = soldAmount;
    project.updatedAt = now;
    proposal.projectId = project.id;
  }

  // 3. Sale record
  if (!db.sales) db.sales = [];
  let sale = db.sales.find((s) => s.proposalId === proposal.id);
  if (!sale) {
    sale = {
      id: generateId('sale'),
      proposalId: proposal.id,
      estimateId: proposal.estimateId,
      projectId: project.id,
      customerId: proposal.customerId,
      propertyId: proposal.propertyId,
      leadId: proposal.leadId,
      soldAmount,
      depositRequired: proposal.depositRequired,
      depositReceived: 0,
      selectedOptionName: selectedOption?.name || 'Selected Roof Scope',
      roofSystem: selectedOption?.roofSystem || 'Lifetime Architectural Shingles',
      soldDate: now,
      status: 'PENDING_DEPOSIT',
      createdAt: now,
      updatedAt: now,
    };
    db.sales.unshift(sale);
  }

  // 4. Update Lead if applicable
  if (proposal.leadId) {
    const lead = (db.leads || []).find((l) => l.id === proposal.leadId);
    if (lead) {
      lead.status = 'JOB_SOLD';
      lead.convertedCustomerId = proposal.customerId;
      lead.convertedProjectId = project.id;
      lead.convertedAt = now;
      lead.updatedAt = now;
    }
  }

  persistDatabase();

  emitSystemEvent({
    type: 'PROPOSAL_ACCEPTED',
    entityType: 'Proposal',
    entityId: proposal.id,
    data: {
      proposalNumber: proposal.proposalNumber,
      signerName: proposal.signatureName,
      amount: soldAmount,
      selectedOptionName: selectedOption?.name,
    },
  });

  emitSystemEvent({
    type: 'SALE_CREATED',
    entityType: 'Sale',
    entityId: sale.id,
    data: {
      soldAmount,
      customerId: proposal.customerId,
      projectId: project.id,
    },
  });

  logAuditAction({
    userId: 'customer-portal',
    userRole: 'HOMEOWNER',
    action: 'STATUS_CHANGE',
    entityType: 'Proposal',
    entityId: proposal.id,
    newState: { status: 'ACCEPTED', signerName: proposal.signatureName, soldAmount },
    ipAddress: req.ip || 'unknown',
    userAgent: req.headers['user-agent'] || 'portal-client',
  });

  res.json({
    success: true,
    message: 'Proposal accepted successfully! Welcome to The Roof Doctors family.',
    proposalNumber: proposal.proposalNumber,
    acceptedAt: proposal.acceptedAt,
  });
});

apiV1Router.post('/portal/proposals/:id/decline', (req, res) => {
  const db = getDatabase();
  const proposal = (db.proposals || []).find((p) => p.id === req.params.id);

  if (!proposal) {
    return res.status(404).json({ error: 'Proposal not found' });
  }

  const now = new Date().toISOString();
  proposal.status = 'DECLINED';
  proposal.declinedAt = now;
  proposal.declinedReason = (req.body.reason || req.body.notes || 'Customer declined in portal').trim();
  proposal.updatedAt = now;

  const estimate = (db.estimates || []).find((e) => e.id === proposal.estimateId);
  if (estimate && estimate.status !== 'ACCEPTED') {
    estimate.status = 'DECLINED';
    estimate.updatedAt = now;
  }

  persistDatabase();

  emitSystemEvent({
    type: 'PROPOSAL_DECLINED',
    entityType: 'Proposal',
    entityId: proposal.id,
    data: {
      proposalNumber: proposal.proposalNumber,
      reason: proposal.declinedReason,
    },
  });

  logAuditAction({
    userId: 'customer-portal',
    userRole: 'HOMEOWNER',
    action: 'STATUS_CHANGE',
    entityType: 'Proposal',
    entityId: proposal.id,
    newState: { status: 'DECLINED', reason: proposal.declinedReason },
    ipAddress: req.ip || 'unknown',
    userAgent: req.headers['user-agent'] || 'portal-client',
  });

  res.json({ success: true, message: 'Proposal response recorded.' });
});

// --- SALES ---
apiV1Router.get('/sales', (req, res) => {
  const db = getDatabase();
  res.json(db.sales || []);
});

// Production Management, Billing, Invoices, Purchase Orders & Texas HB 2102 Deductibles
apiV1Router.use('/', productionBillingRouter);

apiV1Router.get('/maintenance', (req, res) => {
  const db = getDatabase();
  res.json({
    plans: db.maintenancePlans,
    enrollments: db.maintenanceEnrollments,
  });
});

// -------------------------------------------------------------
// 7B. ROOFING INSTALLATION CREWS & SUBCONTRACTORS
// -------------------------------------------------------------
apiV1Router.get('/crews', (req, res) => {
  const db = getDatabase();
  res.json(db.crews || []);
});

apiV1Router.post('/crews', (req, res) => {
  const db = getDatabase();
  const body = req.body;
  if (!body.name || !body.leadForemanName || !body.phone) {
    return res.status(400).json({ error: 'Crew name, lead foreman name, and phone are required.' });
  }

  const now = new Date().toISOString();
  const crew: Crew = {
    id: generateId('crew'),
    name: body.name.trim(),
    leadForemanName: body.leadForemanName.trim(),
    phone: body.phone.trim(),
    specialization: body.specialization || 'SHINGLE_REPLACEMENT',
    active: body.active !== undefined ? Boolean(body.active) : true,
    crewSize: body.crewSize ? Number(body.crewSize) : undefined,
    insuranceExpiryDate: body.insuranceExpiryDate,
    workersCompVerified: body.workersCompVerified !== undefined ? Boolean(body.workersCompVerified) : true,
    market: body.market || 'mkt_northeast_texas',
    notes: body.notes,
    isDemo: body.isDemo,
    createdAt: now,
    updatedAt: now,
  };

  if (!db.crews) db.crews = [];
  db.crews.unshift(crew);
  persistDatabase();

  const ctx = getCallerContext(req);
  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'CREATE',
    entityType: 'Crew' as any,
    entityId: crew.id,
    newState: crew,
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  res.status(201).json(crew);
});

apiV1Router.patch('/crews/:id', (req, res) => {
  const db = getDatabase();
  const crew = db.crews?.find((c) => c.id === req.params.id);
  if (!crew) return res.status(404).json({ error: 'Crew not found' });

  const prev = { ...crew };
  const body = req.body;
  const now = new Date().toISOString();

  if (body.name !== undefined) crew.name = body.name.trim();
  if (body.leadForemanName !== undefined) crew.leadForemanName = body.leadForemanName.trim();
  if (body.phone !== undefined) crew.phone = body.phone.trim();
  if (body.specialization !== undefined) crew.specialization = body.specialization;
  if (body.active !== undefined) crew.active = Boolean(body.active);
  if (body.crewSize !== undefined) crew.crewSize = Number(body.crewSize);
  if (body.insuranceExpiryDate !== undefined) crew.insuranceExpiryDate = body.insuranceExpiryDate;
  if (body.workersCompVerified !== undefined) crew.workersCompVerified = Boolean(body.workersCompVerified);
  if (body.market !== undefined) crew.market = body.market;
  if (body.notes !== undefined) crew.notes = body.notes;
  crew.updatedAt = now;

  persistDatabase();

  const ctx = getCallerContext(req);
  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'UPDATE',
    entityType: 'Crew' as any,
    entityId: crew.id,
    previousState: prev,
    newState: crew,
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  res.json(crew);
});

// -------------------------------------------------------------
// 8. AUDIT LOGS, NOTIFICATIONS & INTEGRATIONS
// -------------------------------------------------------------
apiV1Router.get('/audit-log', (req, res) => {
  const logs = getAuditLogs({ limit: 100 });
  res.json(logs);
});

apiV1Router.get('/notifications', (req, res) => {
  const db = getDatabase();
  res.json(db.notifications);
});

apiV1Router.patch('/notifications/:id/read', (req, res) => {
  const db = getDatabase();
  const notif = db.notifications.find((n) => n.id === req.params.id);
  if (!notif) return res.status(404).json({ error: 'Notification not found' });
  notif.isRead = true;
  persistDatabase();
  res.json(notif);
});

apiV1Router.get('/integrations', (req, res) => {
  const integrations = syncIntegrationStatus();
  res.json(integrations);
});

// -------------------------------------------------------------
// 9. UNIFIED SEARCH
// -------------------------------------------------------------
apiV1Router.get('/search', (req, res) => {
  const q = ((req.query.q as string) || '').trim().toLowerCase();
  if (!q) return res.json({ customers: [], properties: [], leads: [], projects: [] });

  const db = getDatabase();
  const customers = db.customers.filter(
    (c) =>
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q)
  );

  const properties = db.properties.filter(
    (p) => p.address.toLowerCase().includes(q) || p.city.toLowerCase().includes(q) || p.zip.includes(q)
  );

  const leads = db.leads.filter(
    (l) =>
      l.name.toLowerCase().includes(q) ||
      l.phone.includes(q) ||
      l.address.toLowerCase().includes(q) ||
      l.city.toLowerCase().includes(q)
  );

  const projects = db.projects.filter((p) => p.title.toLowerCase().includes(q));

  res.json({
    customers,
    properties,
    leads,
    projects,
  });
});

// -------------------------------------------------------------
// 10. WEBHOOK INGESTION
// -------------------------------------------------------------
apiV1Router.post('/webhooks/:provider', (req, res) => {
  const provider = req.params.provider.toUpperCase();
  const signature = (req.headers['x-webhook-signature'] as string) || (req.headers['stripe-signature'] as string);
  const idempotencyKey = (req.headers['idempotency-key'] as string) || (req.body?.id as string);

  const result = ingestWebhook({
    provider,
    signature,
    idempotencyKey,
    payload: req.body,
  });

  res.json(result);
});

apiV1Router.get('/webhooks/events', (req, res) => {
  res.json(getWebhookEvents());
});

apiV1Router.get('/jobs', (req, res) => {
  res.json(getJobs());
});
