import { staffBookingRuntime } from '../../booking/runtime.ts';
import { validCalculatorInput } from '../../shared/intake-validation.ts';
import { deliverInquiry, IntakeError } from '../../shared/intake-server.ts';
import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { selectRows, upsertRows } from './server/supabaseRest';
import { uploadPublicLogo, uploadPrivateLeadFile } from './server/supabaseStorage';
import { requireOwnerAuth } from './server/requireOwnerAuth';

const PORT = Number(process.env.PORT) || 3000;
const app = express();
app.set('trust proxy', true);

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Database Persistence Layer
const DATA_DIR = process.env.WEBSITE_DATA_DIR || path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'crd-database.json');

interface CRDDatabase {
  organizations: any[];
  contacts: any[];
  properties: any[];
  roofs: any[];
  leads: any[];
  calculatorSubmissions: any[];
  timelineEvents: any[];
}

function emptyCRDDatabase(): CRDDatabase {
  return {
    organizations: [],
    contacts: [],
    properties: [],
    roofs: [],
    leads: [],
    calculatorSubmissions: [],
    timelineEvents: [],
  };
}

function hasDurableSupabaseConfig(): boolean {
  return Boolean(
    process.env.SUPABASE_URL?.startsWith('https://') &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function mergeById(localRows: any[], remoteRows: any[], idField: string): any[] {
  const rows = new Map<string, any>();
  for (const row of localRows || []) if (row?.[idField]) rows.set(String(row[idField]), row);
  for (const row of remoteRows || []) if (row?.[idField]) rows.set(String(row[idField]), row);
  return [...rows.values()];
}

async function initDB(): Promise<CRDDatabase> {
  let local = emptyCRDDatabase();
  if (fs.existsSync(DB_FILE)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('Local commercial database is not an object.');
      }
      local = { ...local, ...parsed };
    } catch (error) {
      throw new Error('Existing commercial database could not be read safely; refusing to discard it.', { cause: error });
    }
  }

  if (!hasDurableSupabaseConfig()) {
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_EPHEMERAL_DATABASE !== 'true') {
      throw new Error('Production commercial database startup blocked: Supabase server credentials are required.');
    }
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(local, null, 2), 'utf-8');
    console.warn('[CRD DB] Using local JSON only in development or explicit CI mode.');
    return local;
  }

  const [organizations, contacts, properties, roofs, timeline, leadRows, calculatorRows] = await Promise.all([
    selectRows<any>('crd_organizations', 'select=organization_id,payload'),
    selectRows<any>('crd_contacts', 'select=contact_id,payload'),
    selectRows<any>('crd_properties', 'select=property_id,payload'),
    selectRows<any>('crd_roofs', 'select=roof_id,payload'),
    selectRows<any>('crd_timeline_events', 'select=event_id,payload'),
    selectRows<any>('trd_records', 'select=id,payload&record_type=eq.lead'),
    selectRows<any>('crd_calculator_submissions', 'select=submission_id,payload'),
  ]);

  const restored: CRDDatabase = {
    organizations: mergeById(local.organizations, organizations.map(row => row.payload), 'organizationId'),
    contacts: mergeById(local.contacts, contacts.map(row => row.payload), 'contactId'),
    properties: mergeById(local.properties, properties.map(row => row.payload), 'propertyId'),
    roofs: mergeById(local.roofs, roofs.map(row => row.payload), 'roofId'),
    leads: mergeById(local.leads, leadRows.map(row => row.payload).filter(lead =>
      lead && (lead.leadId || lead.division === 'commercial' || lead.division === 'COMMERCIAL')
    ), 'leadId'),
    calculatorSubmissions: mergeById(local.calculatorSubmissions, calculatorRows.map(row => row.payload), 'id'),
    timelineEvents: mergeById(local.timelineEvents, timeline.map(row => row.payload), 'id'),
  };

  // Upsert legacy local rows and the normalized read model before serving traffic.
  await saveDB(restored);
  console.log('[CRD DB] Loaded durable Supabase records and completed any local-data migration.');
  return restored;
}

async function saveDB(data: CRDDatabase): Promise<void> {
  if (!hasDurableSupabaseConfig()) {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return;
  }

  const now = new Date().toISOString();
  const writes: Promise<any>[] = [];
  if (data.organizations.length) writes.push(upsertRows('crd_organizations', data.organizations.map(row => ({
    organization_id: String(row.organizationId),
    payload: row,
    created_at: row.createdAt || now,
    updated_at: row.updatedAt || now,
  })), 'organization_id'));
  if (data.contacts.length) writes.push(upsertRows('crd_contacts', data.contacts.map(row => ({
    contact_id: String(row.contactId),
    organization_id: row.organizationId || null,
    payload: row,
    created_at: row.createdAt || now,
    updated_at: row.updatedAt || now,
  })), 'contact_id'));
  if (data.properties.length) writes.push(upsertRows('crd_properties', data.properties.map(row => ({
    property_id: String(row.propertyId),
    organization_id: row.organizationId || null,
    payload: row,
    created_at: row.createdAt || now,
    updated_at: row.updatedAt || now,
  })), 'property_id'));
  if (data.roofs.length) writes.push(upsertRows('crd_roofs', data.roofs.map(row => ({
    roof_id: String(row.roofId),
    property_id: row.propertyId || null,
    payload: row,
    created_at: row.createdAt || now,
    updated_at: row.updatedAt || now,
  })), 'roof_id'));
  if (data.leads.length) writes.push(upsertRows('trd_records', data.leads.map(row => ({
    id: String(row.leadId || row.id),
    record_type: 'lead',
    payload: row,
    created_at: row.createdAt || now,
    updated_at: row.updatedAt || now,
  })), 'id'));
  if (data.calculatorSubmissions.length) writes.push(upsertRows('crd_calculator_submissions', data.calculatorSubmissions.map(row => ({
    submission_id: String(row.id || row.submissionId),
    payload: row,
    created_at: row.createdAt || now,
  })), 'submission_id'));
  if (data.timelineEvents.length) writes.push(upsertRows('crd_timeline_events', data.timelineEvents.map(row => ({
    event_id: String(row.id),
    lead_id: String(row.leadId),
    payload: row,
    created_at: row.timestamp || now,
  })), 'event_id'));
  await Promise.all(writes);
}

let db: CRDDatabase = emptyCRDDatabase();

// Helper to generate IDs
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

// ---------------- API ROUTES ----------------

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Commercial Roof Doctors Lead & Operations Engine',
    timestamp: new Date().toISOString(),
    primaryPhone: '(903) 231-5940',
    primaryTerritory: 'Ark-La-Tex & 75-mile radius',
  });
});

// Logo branding asset is stored durably in Supabase Storage, not the Cloud Run filesystem.
app.post('/api/save-logo', requireOwnerAuth, async (req: Request, res: Response) => {
  try {
    const { dataBase64 } = req.body;
    if (typeof dataBase64 !== 'string' || dataBase64.length > 3_000_000) {
      return res.status(400).json({ error: 'Logo image must be a valid PNG under 2 MB.' });
    }
    const cleanBase64 = dataBase64.replace(/^data:image\/png;base64,/i, '');
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanBase64)) {
      return res.status(400).json({ error: 'Invalid base64 image data.' });
    }
    const buffer = Buffer.from(cleanBase64, 'base64');
    const stored = await uploadPublicLogo(buffer);
    return res.json({ success: true, filename: 'crd-logo-full.png', path: stored.publicUrl, storagePath: stored.path });
  } catch (err: any) {
    console.error('Error saving logo asset to Supabase Storage:', err);
    return res.status(503).json({ error: 'Logo storage is temporarily unavailable.' });
  }
});

// Staff calendar operations have their own verified-session and exact-division
// gate. Default-off runtime returns before any credential or provider access.
app.all('/api/staff/booking', async (req: Request, res: Response) => {
  const headers = new Headers();
  for (const name of ['authorization','origin','content-type']) { const value = req.get(name); if (value) headers.set(name,value); }
  const request = new globalThis.Request('https://theroofingdrs.com/commercial/api/staff/booking', {method:req.method,headers,...(['GET','HEAD'].includes(req.method)?{}:{body:JSON.stringify(req.body)})});
  const result = await staffBookingRuntime(request,process.env);
  result.headers.forEach((value,name)=>res.setHeader(name,value));
  res.status(result.status).send(await result.text());
});

// Mirror Express's case-insensitive, optional-trailing-slash routing. Only
// enumerated public endpoints may bypass verified staff authentication.
app.use('/api', (req: Request, res: Response, next) => {
  const route = req.path.toLowerCase().replace(/\/+$/, '') || '/';
  const publicRead = ['GET', 'HEAD'].includes(req.method) && route === '/health';
  const publicSubmission = req.method === 'POST' && ['/leads', '/emergency', '/calculator'].includes(route);
  if (publicRead || publicSubmission) return next();
  return requireOwnerAuth(req, res, next);
});

// Admin stats use the shared lead store so counts survive Cloud Run restarts.
app.get('/api/admin/stats', async (req: Request, res: Response) => {
  let leads: any[];
  try {
    const rows = await selectRows<any>('trd_records', 'select=id,payload&record_type=eq.lead&order=created_at.desc');
    leads = rows.map((row) => row.payload).filter((lead) =>
      lead.division === 'commercial' || lead.division === 'COMMERCIAL' || Boolean(lead.leadId)
    );
  } catch (error) {
    console.error('Shared commercial lead stats failed:', error);
    return res.status(503).json({ error: 'Lead storage is temporarily unavailable.' });
  }
  const stats = {
    total: leads.length,
    emergency: leads.filter((l) => l.priority === 'Emergency' || l.leadType === 'Emergency').length,
    storm: leads.filter((l) => l.leadType === 'Storm Damage' || l.leadType === 'Hail Damage' || l.leadType === 'Wind Damage').length,
    insurance: leads.filter((l) => l.leadType === 'Insurance Claim').length,
    inspection: leads.filter((l) => l.leadType === 'Inspection').length,
    ppp: leads.filter((l) => l.leadType === 'PPP/Maintenance' || l.leadType === 'Property Management').length,
    calculator: (await selectRows<any>('crd_calculator_submissions', 'select=submission_id')).length,
    byStatus: {
      New: leads.filter((l) => l.status === 'New').length,
      Contacted: leads.filter((l) => l.status === 'Contacted').length,
      'Inspection Scheduled': leads.filter((l) => l.status === 'Inspection Scheduled').length,
      Inspected: leads.filter((l) => l.status === 'Inspected').length,
      'Scope Developed': leads.filter((l) => l.status === 'Scope Developed').length,
      'Proposal Sent': leads.filter((l) => l.status === 'Proposal Sent').length,
      Won: leads.filter((l) => l.status === 'Won').length,
      Lost: leads.filter((l) => l.status === 'Lost').length,
    },
  };
  res.json(stats);
});

// GET /api/leads - Query leads with filtering
app.get('/api/leads', async (req: Request, res: Response) => {
  const { status, priority, leadType } = req.query;
  let filtered: any[];
  try {
    const rows = await selectRows<any>('trd_records', 'select=id,payload&record_type=eq.lead&order=created_at.desc');
    filtered = rows.map((row) => row.payload).filter((lead) => lead.division === 'commercial' || lead.division === 'COMMERCIAL' || lead.leadId);
  } catch (error) {
    console.error('Shared commercial lead list failed:', error);
    return res.status(503).json({ error: 'Lead storage is temporarily unavailable.' });
  }

  if (status && typeof status === 'string') {
    filtered = filtered.filter((l) => l.status === status);
  }
  if (priority && typeof priority === 'string') {
    filtered = filtered.filter((l) => l.priority === priority);
  }
  if (leadType && typeof leadType === 'string') {
    filtered = filtered.filter((l) => l.leadType === leadType);
  }

  // Sort descending by creation date
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const enriched = filtered.map((lead) => {
    const org = lead.organizationRecord || db.organizations.find((o) => o.organizationId === lead.organizationId);
    const cnt = lead.contactRecord || db.contacts.find((c) => c.contactId === lead.contactId);
    const prp = lead.propertyRecord || db.properties.find((p) => p.propertyId === lead.propertyId);
    return {
      ...lead,
      fullName: cnt ? `${cnt.firstName} ${cnt.lastName}`.trim() : 'Commercial Client',
      phone: cnt?.phone || lead.phone || '',
      email: cnt?.email || lead.email || '',
      companyName: org?.companyName || lead.companyName || '',
      propertyAddress: prp?.address ? `${prp.address}, ${prp.city} ${prp.state}` : (lead.propertyAddress || ''),
      squareFootage: prp?.approximateRoofArea || lead.approximateRoofArea || null,
    };
  });

  res.json({ leads: enriched, count: enriched.length });
});

// GET /api/leads/:id - Single lead detail with relations
app.get('/api/leads/:id', async (req: Request, res: Response) => {
  let lead: any;
  try {
    const rows = await selectRows<any>('trd_records', `select=id,payload&record_type=eq.lead&id=eq.${encodeURIComponent(req.params.id)}&limit=1`);
    lead = rows[0]?.payload;
  } catch (error) {
    console.error('Shared commercial lead lookup failed:', error);
    return res.status(503).json({ error: 'Lead storage is temporarily unavailable.' });
  }
  if (!lead || !(lead.leadId || lead.division === 'commercial' || lead.division === 'COMMERCIAL')) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  const organization = lead.organizationRecord || db.organizations.find((o) => o.organizationId === lead.organizationId) || null;
  const contact = lead.contactRecord || db.contacts.find((c) => c.contactId === lead.contactId) || null;
  const property = lead.propertyRecord || db.properties.find((p) => p.propertyId === lead.propertyId) || null;
  const timeline = Array.isArray(lead.timeline) ? lead.timeline : db.timelineEvents.filter((t) => t.leadId === lead.leadId);

  res.json({
    lead,
    organization,
    contact,
    property,
    timeline,
  });
});

// PATCH /api/leads/:id - Update lead status, priority, or internal notes
app.patch('/api/leads/:id', async (req: Request, res: Response) => {
  let currentLead: any;
  try {
    const rows = await selectRows<any>('trd_records', `select=id,payload&record_type=eq.lead&id=eq.${encodeURIComponent(req.params.id)}&limit=1`);
    currentLead = rows[0]?.payload;
  } catch (error) {
    console.error('Shared commercial lead lookup failed:', error);
    return res.status(503).json({ error: 'Lead storage is temporarily unavailable.' });
  }
  if (!currentLead || !(currentLead.leadId || currentLead.division === 'commercial' || currentLead.division === 'COMMERCIAL')) {
    return res.status(404).json({ error: 'Lead not found' });
  }
  const leadIndex = db.leads.findIndex((l) => l.leadId === req.params.id);
  const { status, priority, assignedTo, notes, newNote } = req.body;

  const previousStatus = currentLead.status;
  if (!Array.isArray(currentLead.timeline)) currentLead.timeline = [];
  if (status && status !== previousStatus) {
    currentLead.status = status;
    const event = {
      id: generateId('evt'),
      leadId: currentLead.leadId,
      title: 'Status Updated',
      description: `Status transitioned from "${previousStatus}" to "${status}"`,
      timestamp: new Date().toISOString(),
      author: 'Operations Staff',
    };
    currentLead.timeline.push(event);
    db.timelineEvents.push(event);
  }

  if (priority) currentLead.priority = priority;
  if (assignedTo !== undefined) currentLead.assignedTo = assignedTo;
  if (notes !== undefined) currentLead.notes = notes;

  if (newNote && typeof newNote === 'string') {
    const event = {
      id: generateId('evt'),
      leadId: currentLead.leadId,
      title: 'Internal Note Added',
      description: newNote,
      timestamp: new Date().toISOString(),
      author: 'Operations Staff',
    };
    if (!Array.isArray(currentLead.timeline)) currentLead.timeline = [];
    currentLead.timeline.push(event);
    db.timelineEvents.push(event);
  }

  currentLead.updatedAt = new Date().toISOString();
  if (leadIndex >= 0) db.leads[leadIndex] = currentLead;
  try {
    await upsertRows('trd_records', [{ id: currentLead.leadId, record_type: 'lead', payload: currentLead, updated_at: currentLead.updatedAt }], 'id');
  } catch (error) {
    console.error('Shared commercial lead update failed:', error);
    return res.status(503).json({ error: 'Lead update could not be saved.' });
  }
  await saveDB(db);

  res.json({ success: true, lead: currentLead });
});

// POST /api/leads/:id/photos - Store lead files privately in Supabase Storage.
app.post('/api/leads/:id/photos', async (req: Request, res: Response) => {
  const { photos } = req.body;
  if (!Array.isArray(photos) || photos.length < 1 || photos.length > 10) {
    return res.status(400).json({ error: 'Submit between 1 and 10 files per upload.' });
  }

  let rows: any[];
  try {
    rows = await selectRows<any>('trd_records', `select=id,payload&record_type=eq.lead&id=eq.${encodeURIComponent(req.params.id)}&limit=1`);
  } catch (error) {
    console.error('Shared lead lookup failed before photo upload:', error);
    return res.status(503).json({ error: 'Lead storage is temporarily unavailable.' });
  }
  const currentLead = rows[0]?.payload;
  if (!currentLead || !(currentLead.leadId || currentLead.division === 'commercial' || currentLead.division === 'COMMERCIAL')) {
    return res.status(404).json({ error: 'Commercial lead not found.' });
  }

  try {
    const uploaded = [];
    for (const photo of photos) {
      const raw = typeof photo === 'string' ? photo : photo?.dataBase64;
      if (typeof raw !== 'string' || raw.length > 22_000_000) {
        return res.status(400).json({ error: 'Each file must be a supported image or PDF under 15 MB.' });
      }
      const match = raw.match(/^data:(image\/(?:jpeg|png|webp)|application\/pdf);base64,/i);
      const contentType = (typeof photo === 'object' && photo?.mimeType) || match?.[1]?.toLowerCase();
      const clean = raw.replace(/^data:[^;]+;base64,/i, '');
      if (!contentType || !/^[A-Za-z0-9+/]*={0,2}$/.test(clean)) {
        return res.status(400).json({ error: 'Each file must include a valid supported MIME type and base64 data.' });
      }
      const bytes = Buffer.from(clean, 'base64');
      if (bytes.length > 15 * 1024 * 1024 || bytes.length === 0) {
        return res.status(400).json({ error: 'Each file must be nonempty and under 15 MB.' });
      }
      if (contentType === 'image/png' && !bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
        return res.status(400).json({ error: 'Invalid PNG file.' });
      }
      if (contentType === 'image/jpeg' && !(bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[bytes.length - 2] === 0xff && bytes[bytes.length - 1] === 0xd9)) {
        return res.status(400).json({ error: 'Invalid JPEG file.' });
      }
      if (contentType === 'image/webp' && (bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WEBP')) {
        return res.status(400).json({ error: 'Invalid WebP file.' });
      }
      if (contentType === 'application/pdf' && bytes.toString('ascii', 0, 5) !== '%PDF-') {
        return res.status(400).json({ error: 'Invalid PDF file.' });
      }
      const name = typeof photo === 'object' && typeof photo?.name === 'string' ? photo.name : `upload.${contentType === 'image/jpeg' ? 'jpg' : contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : 'pdf'}`;
      uploaded.push(await uploadPrivateLeadFile(req.params.id, name, contentType, bytes));
    }

    const prior = Array.isArray(currentLead.photos) ? currentLead.photos : [];
    currentLead.photos = [...prior, ...uploaded];
    currentLead.updatedAt = new Date().toISOString();
    await upsertRows('trd_records', [{
      id: rows[0].id,
      record_type: 'lead',
      payload: currentLead,
      updated_at: currentLead.updatedAt,
    }], 'id');
    return res.json({ success: true, count: currentLead.photos.length, uploaded: uploaded.length });
  } catch (error) {
    console.error('Private lead file upload failed:', error);
    return res.status(503).json({ error: 'File storage is temporarily unavailable. Please retry.' });
  }
});

// Public inquiry paths all use the same atomic CRM destination.
async function handleCommercialInquiry(req: Request, res: Response) {
  const body = req.body;
  const fields = ['companyName','firstName','lastName','fullName','name','contactName','email','phone','address','propertyAddress','city','state','zip','message','notes'];
  if (!body || typeof body !== 'object' || Array.isArray(body) || fields.some(field => body[field] !== undefined && (typeof body[field] !== 'string' || body[field].length > 10000)) || (!body.phone?.trim() && !body.email?.trim()) || ![body.name,body.fullName,body.contactName,body.firstName,body.companyName].some(value => value?.trim())) {
    return res.status(400).json({ error: 'Enter a contact name and a phone number or email address.' });
  }
  const payload = req.path === '/api/emergency' ? {...body,leadType:'Emergency',emergencyFlag:true,source:'Emergency Form'} : body;
  try {
    const receipt = await deliverInquiry('CRD', req.get('Idempotency-Key'), payload);
    return res.status(receipt.replayed ? 200 : 201).json({success:true,leadId:receipt.source_id,crmLeadId:receipt.lead_id,deliveryStatus:'delivered'});
  } catch (error) {
    return res.status(error instanceof IntakeError ? error.status : 503).json({error:error instanceof Error ? error.message : 'Inquiry delivery is unavailable.'});
  }
}
app.post('/api/leads', handleCommercialInquiry);
app.post('/api/emergency', handleCommercialInquiry);

// POST /api/calculator - Cost Calculator submission and calculation
app.post('/api/calculator', async (req: Request, res: Response) => {
  if(!validCalculatorInput(req.body))return res.status(400).json({error:'Enter a valid roof area and contact details.'});
  try {
    const {
      squareFootage,
      roofSystem,
      propertyType,
      condition,
      desiredWork,
      accessComplexity = 'Standard',
      contactName,
      companyName,
      phone,
      email,
      address,
      reasonForWork = 'Not sure',
      dateOfLoss,
      insurer,
      policyNumber,
      claimNumber,
      adjusterName,
      adjusterPhone,
      notes,
      submitLead = false,
    } = req.body;

    if (submitLead && (!contactName?.trim() || !address?.trim() || !phone?.trim() || !email?.trim())) {
      return res.status(400).json({ error: 'Full name, property address, phone number, and email are required.' });
    }

    const sqft = Number(squareFootage) || 10000;
    
    // Preliminary commercial pricing. Existing defaults are preserved and can be
    // overridden through Cloud Run environment variables after owner approval.
    const pricing = {
      repairMin: Number(process.env.CRD_REPAIR_MIN_RATE ?? 1.5),
      repairMax: Number(process.env.CRD_REPAIR_MAX_RATE ?? 3.5),
      restorationMin: Number(process.env.CRD_RESTORATION_MIN_RATE ?? 3.5),
      restorationMax: Number(process.env.CRD_RESTORATION_MAX_RATE ?? 7.5),
      replacementMin: Number(process.env.CRD_REPLACEMENT_MIN_RATE ?? 8.0),
      replacementMax: Number(process.env.CRD_REPLACEMENT_MAX_RATE ?? 16.0),
      metalReplacementMinAdd: Number(process.env.CRD_METAL_REPLACEMENT_MIN_ADD ?? 3.0),
      metalReplacementMaxAdd: Number(process.env.CRD_METAL_REPLACEMENT_MAX_ADD ?? 6.0),
      pvcReplacementMinAdd: Number(process.env.CRD_PVC_REPLACEMENT_MIN_ADD ?? 1.5),
      pvcReplacementMaxAdd: Number(process.env.CRD_PVC_REPLACEMENT_MAX_ADD ?? 3.0),
      complexAccessMinMultiplier: Number(process.env.CRD_COMPLEX_ACCESS_MIN_MULTIPLIER ?? 1.25),
      complexAccessMaxMultiplier: Number(process.env.CRD_COMPLEX_ACCESS_MAX_MULTIPLIER ?? 1.35),
    };
    let minRate: number;
    let maxRate: number;

    if (desiredWork === 'Replacement') {
      minRate = pricing.replacementMin;
      maxRate = pricing.replacementMax;
      if (roofSystem === 'Metal') {
        minRate += pricing.metalReplacementMinAdd;
        maxRate += pricing.metalReplacementMaxAdd;
      }
      if (roofSystem === 'PVC') {
        minRate += pricing.pvcReplacementMinAdd;
        maxRate += pricing.pvcReplacementMaxAdd;
      }
    } else if (desiredWork === 'Restoration/Coating') {
      minRate = pricing.restorationMin;
      maxRate = pricing.restorationMax;
    } else if (desiredWork === 'Repair') {
      minRate = pricing.repairMin;
      maxRate = pricing.repairMax;
    } else {
      return res.status(400).json({ error: 'Choose a supported commercial work type before calculating a preliminary estimate.' });
    }

    if (accessComplexity === 'Complex / High-Rise') {
      minRate *= pricing.complexAccessMinMultiplier;
      maxRate *= pricing.complexAccessMaxMultiplier;
    }

    const estimatedLow = Math.round(sqft * minRate);
    const estimatedHigh = Math.round(sqft * maxRate);

    const calcId = generateId('calc');
    const calcSubmission = {
      id: calcId,
      inputs: {
        squareFootage: sqft,
        roofSystem: roofSystem || 'TPO',
        propertyType: propertyType || 'Commercial',
        condition: condition || 'Aging / Suspect',
        desiredWork: desiredWork || 'Replacement',
        accessComplexity,
        address: address || '',
        contactName: contactName || '',
        companyName: companyName || '',
        phone: phone || '',
        email: email || '',
        reasonForWork,
        dateOfLoss: dateOfLoss || '',
        insurer: insurer || '',
        policyNumber: policyNumber || '',
        claimNumber: claimNumber || '',
        adjusterName: adjusterName || '',
        adjusterPhone: adjusterPhone || '',
        notes: notes || '',
      },
      results: {
        estimatedLow,
        estimatedHigh,
        disclaimer: 'Planning estimate only. This calculator does not provide a binding quote, proposal, or guarantee of project cost. Actual project pricing depends on professional inspection, measurements, roof condition, system requirements, accessibility, code requirements, scope of work, and other project-specific factors.',
      },
      createdAt: new Date().toISOString(),
    };

    if (!submitLead) {
      await upsertRows('crd_calculator_submissions', [{ submission_id: calcId, payload: calcSubmission, created_at: calcSubmission.createdAt }], 'submission_id');
    }

    let leadId: string | null = null;
    let crmLeadId: string | null = null;
    if (submitLead) {
      const receipt = await deliverInquiry('CRD', req.get('Idempotency-Key'), {
        ...req.body, serviceRequested:'Commercial roof estimate', source:'Commercial Roof Cost Calculator',
      });
      leadId = receipt.source_id;
      crmLeadId = receipt.lead_id;
    }

    res.json({
      success: true,
      calculationId: calcId,
      crmLeadId,
      deliveryStatus: submitLead ? 'delivered' : undefined,
      leadId,
      estimatedLow,
      estimatedHigh,
      unitLow: Math.round(minRate * 100) / 100,
      unitHigh: Math.round(maxRate * 100) / 100,
      squareFootage: sqft,
      disclaimer: calcSubmission.results.disclaimer,
    });
  } catch (err) {
    console.error('Calculator calculation error:', err);
    res.status(err instanceof IntakeError ? err.status : 503).json({ error: err instanceof IntakeError ? err.message : 'Failed to calculate estimate range. Your request has not been confirmed.' });
  }
});

// GET /api/calculator - Retrieve calculator submissions
app.get('/api/calculator', async (req: Request, res: Response) => {
  try {
    const rows = await selectRows<any>('crd_calculator_submissions', 'select=submission_id,payload&order=created_at.desc');
    res.json(rows.map((row) => row.payload));
  } catch (error) {
    console.error('Shared calculator submission list failed:', error);
    res.status(503).json({ error: 'Calculator submission storage is temporarily unavailable.' });
  }
});

// Dynamic XML Sitemap
app.get('/sitemap.xml', (req: Request, res: Response) => {
  const host = req.get('host') || 'commercialroofdoctors.com';
  const protocol = req.protocol || 'https';
  const baseUrl = `${protocol}://${host}`;

  const routes = [
    '',
    '/commercial-roofing',
    '/commercial-roof-repair',
    '/commercial-roof-replacement',
    '/commercial-roof-inspection',
    '/commercial-roof-maintenance',
    '/new-commercial-construction',
    '/commercial-roof-coatings',
    '/commercial-roof-restoration',
    '/silicone-roof-coatings',
    '/acrylic-roof-coatings',
    '/polyurethane-roof-coatings',
    '/coat-vs-replace',
    '/storm-damage',
    '/hail-damage',
    '/wind-damage',
    '/emergency-roofing',
    '/insurance-claims',
    '/commercial-storm-inspections',
    '/adjuster-meetings',
    '/large-loss-roofing',
    '/tpo-roofing',
    '/epdm-roofing',
    '/pvc-roofing',
    '/modified-bitumen',
    '/built-up-roofing',
    '/metal-roofing',
    '/crd-ppp',
    '/property-management',
    '/roof-asset-management',
    '/multi-property-roofing',
    '/multifamily-roofing',
    '/hoa-roofing',
    '/industries/churches',
    '/industries/schools',
    '/industries/healthcare',
    '/industries/industrial',
    '/industries/retail',
    '/industries/apartments',
    '/commercial-roof-cost-calculator',
    '/about',
    '/about/credentials',
    '/service-areas',
    '/service-areas/texas',
    '/service-areas/arkansas',
    '/service-areas/louisiana',
    '/service-areas/oklahoma',
    '/contact',
  ];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (r) => `  <url>
    <loc>${baseUrl}/commercial${r === '' ? '/' : r}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${r === '' || r.includes('storm') || r.includes('emergency') ? 'daily' : 'weekly'}</changefreq>
    <priority>${r === '' ? '1.0' : r.includes('calculator') || r.includes('inspection') ? '0.9' : '0.8'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(sitemapXml);
});

// Robots.txt
app.get('/robots.txt', (req: Request, res: Response) => {
  const host = req.get('host') || 'commercialroofdoctors.com';
  const protocol = req.protocol || 'https';
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /commercial/admin
Disallow: /commercial/api/
Sitemap: ${protocol}://${host}/commercial/sitemap.xml
`);
});

type SeoManifestRecord = {
  title: string;
  description: string;
  canonicalPath: string;
};

function escapeHtmlAttribute(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] || character);
}

function upsertHeadTag(html: string, matcher: RegExp, replacement: string): string {
  if (matcher.test(html)) return html.replace(matcher, replacement);
  return html.replace(/<\/head>/i, replacement + '\n  </head>');
}

function applySeoMetadata(html: string, metadata: SeoManifestRecord): string {
  const title = metadata.title.includes('Commercial Roof Doctors') || /\|\s*CRD$/i.test(metadata.title)
    ? metadata.title
    : metadata.title + ' | CRD';
  const description = escapeHtmlAttribute(metadata.description);
  const socialTitle = escapeHtmlAttribute(metadata.title);
  const canonicalPath = metadata.canonicalPath || '/';
  const pathWithoutPrefix = canonicalPath.replace(/^\/commercial(?=\/|$)/, '') || '/';
  const canonicalUrl = 'https://theroofingdrs.com/commercial' +
    (pathWithoutPrefix === '/' ? '/' : pathWithoutPrefix.startsWith('/') ? pathWithoutPrefix : '/' + pathWithoutPrefix);

  let output = html;
  output = upsertHeadTag(output, /<title>[\s\S]*?<\/title>/i, '<title>' + escapeHtmlAttribute(title) + '</title>');
  output = upsertHeadTag(output, /<meta\s+name=["']description["'][^>]*>/i, '<meta name="description" content="' + description + '" />');
  output = upsertHeadTag(output, /<link\s+rel=["']canonical["'][^>]*>/i, '<link rel="canonical" href="' + escapeHtmlAttribute(canonicalUrl) + '" />');
  output = upsertHeadTag(output, /<meta\s+property=["']og:title["'][^>]*>/i, '<meta property="og:title" content="' + socialTitle + '" />');
  output = upsertHeadTag(output, /<meta\s+property=["']og:description["'][^>]*>/i, '<meta property="og:description" content="' + description + '" />');
  output = upsertHeadTag(output, /<meta\s+property=["']og:url["'][^>]*>/i, '<meta property="og:url" content="' + escapeHtmlAttribute(canonicalUrl) + '" />');
  output = upsertHeadTag(output, /<meta\s+name=["']twitter:title["'][^>]*>/i, '<meta name="twitter:title" content="' + socialTitle + '" />');
  output = upsertHeadTag(output, /<meta\s+name=["']twitter:description["'][^>]*>/i, '<meta name="twitter:description" content="' + description + '" />');
  return output;
}

// ---------------- VITE & FRONTEND MOUNTING ----------------

// Serve static assets from public directory
app.use(express.static(path.join(process.cwd(), 'public'), {
  maxAge: 0,
  etag: true,
}));

async function start() {
  db = await initDB();
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    const indexHtml = fs.readFileSync(path.join(distPath, 'index.html'), 'utf8');
    let seoManifest: Record<string, SeoManifestRecord> = {};
    try {
      seoManifest = JSON.parse(fs.readFileSync(path.join(distPath, 'seo-manifest.json'), 'utf8'));
      console.log('[CRD SEO] Loaded ' + Object.keys(seoManifest).length + ' server-rendered route metadata entries.');
    } catch (error) {
      console.error('[CRD SEO] Route metadata manifest unavailable; serving default document metadata.', error);
    }

    app.use('/commercial', express.static(distPath, {
      maxAge: '1y',
      immutable: true,
      index: false,
    }));

    app.use(express.static(distPath, {
      maxAge: '1y',
      immutable: true,
      index: false,
    }));

    // Never serve the SPA HTML as a substitute for a missing JS, CSS, or media asset.
    // Browsers reject HTML returned for module scripts, which otherwise produces a blank page.
    app.use((req: Request, res: Response, next) => {
      const assetPath = req.path.startsWith('/assets/') || /\\.(?:js|mjs|css|map|woff2?|ttf|otf|png|jpe?g|gif|svg|webp|avif|ico)$/i.test(req.path);
      if (assetPath) {
        return res.status(404).type('text/plain').send('CRD asset not found');
      }
      next();
    });

    app.get('*', (req: Request, res: Response) => {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      const normalizedPath = (req.path.replace(new RegExp('/+$'), '') || '/').toLowerCase();
      const metadata = seoManifest[normalizedPath];
      res.type('html').send(metadata ? applySeoMetadata(indexHtml, metadata) : indexHtml);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Commercial Roof Doctors] Server running on http://0.0.0.0:${PORT}`);
  });
}

start().catch((error) => {
  console.error('[Commercial Roof Doctors] Failed to initialize durable database or start server:', error);
  process.exit(1);
});
