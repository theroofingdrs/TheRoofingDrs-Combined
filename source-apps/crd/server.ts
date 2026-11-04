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

function initDB(): CRDDatabase {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading database file, resetting:', e);
    }
  }

  const defaultDb: CRDDatabase = {
    organizations: [],
    contacts: [],
    properties: [],
    roofs: [],
    leads: [],
    calculatorSubmissions: [],
    timelineEvents: [],
  };

  saveDB(defaultDb);
  return defaultDb;
}

function saveDB(data: CRDDatabase) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving database file:', e);
  }
}

let db = initDB();

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

// Protect commercial CRM data and mutations. Public lead, emergency, calculator,
// health, and branding submissions remain available without a staff session.
app.use((req: Request, res: Response, next) => {
  const isStaffRoute =
    req.path === '/api/admin/stats' ||
    req.path === '/api/calculator' && req.method === 'GET' ||
    req.path === '/api/leads' && req.method !== 'POST' ||
    /^\/api\/leads\/[^/]+/.test(req.path) ||
    req.path === '/api/save-logo' && req.method !== 'POST';
  if (!isStaffRoute) return next();
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
  saveDB(db);

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

// POST /api/leads - Generic Commercial Lead Submission
app.post('/api/leads', async (req: Request, res: Response) => {
  const body = req.body;
  const textFields = ['companyName','firstName','lastName','name','email','phone','address','propertyAddress','city','state','zip','message','notes'];
  if (!body || typeof body !== 'object' || Array.isArray(body) || textFields.some(field => body[field] !== undefined && (typeof body[field] !== 'string' || body[field].length > 10000))) {
    return res.status(400).json({ error: 'Please enter valid contact and property details.' });
  }
  try {
    const {
      companyName,
      firstName,
      lastName,
      name,
      email,
      phone,
      role,
      propertyName,
      address,
      propertyAddress,
      city,
      state,
      zip,
      propertyType,
      approximateRoofArea,
      roofSystem,
      leadType = 'Inspection',
      priority = 'Normal',
      source = 'Website Lead Form',
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      landingPage,
      referrer,
      message,
      notes,
      photos = [],
      // Storm-specific fields
      stormDate,
      stormDamageType,
      existingClaim,
      claimNumber,
      carrier,
      adjusterAssigned,
      adjusterInspectionScheduled,
      needCrdPresent,
      // Emergency fields
      emergencyType,
      waterEnteringBuilding,
      buildingOccupied,
    } = req.body;

    // Split name if single field provided
    let fName = firstName || '';
    let lName = lastName || '';
    if (!fName && name) {
      const parts = name.trim().split(' ');
      fName = parts[0] || '';
      lName = parts.slice(1).join(' ') || '';
    }

    // Validation
    if (!phone?.trim() && !email?.trim()) {
      return res.status(400).json({ error: 'A phone number or email address is required.' });
    }

    const orgId = generateId('org');
    const contactId = generateId('cnt');
    const propertyId = generateId('prp');
    const leadId = generateId('lead');

    // Create Organization Record
    const newOrg = {
      organizationId: orgId,
      companyName: companyName || propertyName || `${fName} ${lName} Enterprise`.trim() || 'Commercial Property',
      propertyManager: role === 'Property Manager' || role === 'HOA Manager',
      industry: propertyType || 'Commercial',
      notes: notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.organizations.push(newOrg);

    // Create Contact Record
    const newContact = {
      contactId,
      organizationId: orgId,
      firstName: fName,
      lastName: lName,
      email: email || '',
      phone: phone || '',
      role: role || 'Property Owner / Representative',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.contacts.push(newContact);

    // Create Property Record
    const newProperty = {
      propertyId,
      organizationId: orgId,
      propertyName: propertyName || companyName || 'Commercial Facility',
      address: address || propertyAddress || '',
      city: city || 'Texarkana Region',
      state: state || 'TX',
      zip: zip || '',
      propertyType: propertyType || 'Commercial',
      approximateRoofArea: approximateRoofArea || '',
      roofSystem: roofSystem || 'Unknown',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.properties.push(newProperty);

    // Create Lead Record
    const newLead = {
      leadId,
      division: 'commercial',
      organizationId: orgId,
      contactId,
      propertyId,
      leadType: leadType || 'Inspection',
      propertyType: propertyType || 'Commercial',
      roofSystem: roofSystem || 'Unknown',
      priority: priority || (leadType === 'Emergency' ? 'Emergency' : 'Normal'),
      source: source || 'Website',
      utmSource: utmSource || '',
      utmMedium: utmMedium || '',
      utmCampaign: utmCampaign || '',
      utmTerm: utmTerm || '',
      utmContent: utmContent || '',
      landingPage: landingPage || '/',
      referrer: referrer || '',
      status: 'New',
      assignedTo: 'Dispatch / Estimating',
      message: message || '',
      notes: notes || '',
      photos: Array.isArray(photos) ? photos : [],
      // Extra operational attributes preserved for future CRM
      stormMetadata: {
        stormDate,
        stormDamageType,
        existingClaim,
        claimNumber,
        carrier,
        adjusterAssigned,
        adjusterInspectionScheduled,
        needCrdPresent,
      },
      emergencyMetadata: {
        emergencyType,
        waterEnteringBuilding,
        buildingOccupied,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    // Keep the related commercial records with the canonical shared lead so
    // the detail view does not depend on ephemeral Cloud Run filesystem data.
    const initialTimeline = {
      id: generateId('evt'),
      leadId,
      title: 'Lead Ingested',
      description: `New ${newLead.leadType} lead received via ${newLead.source}. Priority: ${newLead.priority}.`,
      timestamp: new Date().toISOString(),
      author: 'CRD Ingestion Engine',
    };
    const durableLead = {
      ...newLead,
      division: 'commercial',
      organizationRecord: newOrg,
      contactRecord: newContact,
      propertyRecord: newProperty,
      timeline: [initialTimeline],
    };

    // Fail the request rather than claiming success if durable storage is unavailable.
    await upsertRows('trd_records', [{
      id: leadId,
      record_type: 'lead',
      payload: durableLead,
      created_at: newLead.createdAt,
      updated_at: newLead.updatedAt,
    }], 'id');

    db.leads.push(newLead);

    // Mirror the initial timeline entry locally for existing in-process views.
    db.timelineEvents.push(initialTimeline);

    saveDB(db);

    // Send notifications only after the commercial lead is durably saved.
    // Email failures are logged but never discard or reject the saved lead.
    const resendKey = process.env.RESEND_API_KEY?.trim();
    const fromAddress = process.env.RESEND_FROM_EMAIL || 'Commercial Roof Doctors <notifications@theroofingdrs.com>';
    const recipient = 'TheRoofingDrs@gmail.com';
    const fullName = (fName + ' ' + lName).trim() || name || 'Commercial inquiry';
    const propertyLocation = [address || propertyAddress, city, state, zip].filter(Boolean).join(', ') || 'Not provided';
    const escapeEmailHtml = (value: unknown) => String(value ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const valueText = (value: unknown, fallback = 'Not provided') =>
      value === undefined || value === null || value === '' ? fallback : String(value);
    const row = (label: string, value: unknown) => value === undefined || value === null || value === ''
      ? ''
      : '<tr><td style="padding:9px 10px;border-bottom:1px solid #e8e8e8;color:#686868;width:38%;vertical-align:top;">' + escapeEmailHtml(label) + '</td><td style="padding:9px 10px;border-bottom:1px solid #e8e8e8;color:#222;font-weight:600;vertical-align:top;">' + escapeEmailHtml(value) + '</td></tr>';
    const section = (title: string, rows: string) => rows
      ? '<div style="margin:18px 0;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;"><div style="padding:11px 14px;background:#f4f4f2;color:#242424;font-size:12px;font-weight:800;letter-spacing:1px;">' + escapeEmailHtml(title) + '</div><table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:13px;">' + rows + '</table></div>'
      : '';
    const logoPath = path.join(process.cwd(), 'dist', 'assets', 'crd-logo-full-light.png');
    const logoExists = fs.existsSync(logoPath);
    const logoAttachment = logoExists ? {
      filename: 'commercial-roof-doctors-logo.png',
      content: fs.readFileSync(logoPath).toString('base64'),
      content_type: 'image/png',
      content_id: 'crd-logo',
    } : null;
    if (!logoExists) console.warn('[CRD Email] Official CRD logo asset not found in dist/assets; using text brand header.');
    const logoMarkup = logoAttachment
      ? '<img src="cid:crd-logo" alt="Commercial Roof Doctors" width="245" style="display:block;width:245px;max-width:100%;height:auto;border:0;">'
      : '<div style="font-size:22px;font-weight:800;color:#ffffff;">COMMERCIAL ROOF DOCTORS</div>';
    const emailShell = (title: string, body: string) =>
      '<!doctype html><html><body style="margin:0;padding:24px 12px;background:#f2f2ef;font-family:Arial,Helvetica,sans-serif;color:#252525;"><div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #deded9;border-radius:10px;overflow:hidden;"><div style="padding:22px 26px;background:#191919;border-bottom:4px solid #e87524;">' + logoMarkup + '<div style="margin-top:15px;color:#fff;font-size:19px;font-weight:700;">' + escapeEmailHtml(title) + '</div></div><div style="padding:24px 26px;">' + body + '</div><div style="padding:18px 26px;background:#f3f3f0;border-top:1px solid #e2e2de;text-align:center;color:#666;font-size:12px;line-height:1.7;"><strong style="color:#292929;">Commercial Roof Doctors</strong><br><a href="tel:9032315940" style="color:#c65d18;text-decoration:none;font-weight:700;">903-231-5940</a> | <a href="mailto:TheRoofingDrs@gmail.com" style="color:#c65d18;text-decoration:none;">TheRoofingDrs@gmail.com</a></div></div></body></html>';

    const contactRows = [
      row('Contact name', fullName), row('Company / property entity', newOrg.companyName),
      row('Role', role), row('Phone', phone), row('Email', email),
    ].join('');
    const propertyRows = [
      row('Property name', propertyName || newProperty.propertyName), row('Address', propertyLocation),
      row('Property type', propertyType || newProperty.propertyType),
      row('Approximate roof area', approximateRoofArea), row('Roof system', roofSystem || newProperty.roofSystem),
    ].join('');
    const projectRows = [
      row('Inquiry type', leadType || 'Inspection'), row('Priority', priority || 'Normal'),
      row('Project details', message || notes),
    ].join('');
    const stormRows = [
      row('Storm date', stormDate), row('Damage type', stormDamageType), row('Existing claim', existingClaim),
      row('Claim number', claimNumber), row('Insurance carrier', carrier), row('Adjuster assigned', adjusterAssigned),
      row('Adjuster inspection scheduled', adjusterInspectionScheduled), row('CRD representation requested', needCrdPresent),
    ].join('');
    const emergencyRows = [
      row('Emergency type', emergencyType), row('Water entering building', waterEnteringBuilding),
      row('Building occupied', buildingOccupied),
    ].join('');
    const additionalRows = [
      row('Lead source', source || 'Website Lead Form'), row('Lead ID', leadId),
      row('Landing page', landingPage), row('Referrer', referrer),
      row('UTM source', utmSource), row('UTM medium', utmMedium),
      row('UTM campaign', utmCampaign), row('UTM term', utmTerm), row('UTM content', utmContent),
    ].join('');
    const internalBody =
      '<p style="margin:0 0 8px;color:#555;font-size:14px;line-height:1.6;">A new commercial roofing inquiry has been received and saved.</p>' +
      section('CONTACT INFORMATION', contactRows) +
      section('PROPERTY INFORMATION', propertyRows) +
      section('PROJECT INFORMATION', projectRows) +
      section('STORM AND INSURANCE INFORMATION', stormRows) +
      section('EMERGENCY INFORMATION', emergencyRows) +
      section('ADDITIONAL DETAILS', additionalRows) +
      '<div style="margin-top:20px;padding:14px 16px;background:#fff5ed;border-left:4px solid #e87524;border-radius:4px;font-size:13px;">Dispatch: <a href="tel:9032315940" style="color:#c65d18;font-weight:700;text-decoration:none;">903-231-5940</a></div>';
    const internalHtml = emailShell('New Commercial Lead Received', internalBody);
    const internalText = [
      'COMMERCIAL ROOF DOCTORS | NEW COMMERCIAL LEAD', '',
      'CONTACT INFORMATION', 'Name: ' + fullName, 'Company / Property Entity: ' + newOrg.companyName,
      'Role: ' + valueText(role), 'Phone: ' + valueText(phone), 'Email: ' + valueText(email), '',
      'PROPERTY INFORMATION', 'Property: ' + (propertyName || newProperty.propertyName),
      'Address: ' + propertyLocation, 'Property Type: ' + (propertyType || newProperty.propertyType),
      'Approximate Roof Area: ' + valueText(approximateRoofArea),
      'Roof System: ' + (roofSystem || newProperty.roofSystem), '',
      'PROJECT INFORMATION', 'Inquiry Type: ' + (leadType || 'Inspection'),
      'Priority: ' + (priority || 'Normal'), 'Details: ' + valueText(message || notes), '',
      'STORM AND INSURANCE INFORMATION', 'Storm Date: ' + valueText(stormDate),
      'Damage Type: ' + valueText(stormDamageType), 'Existing Claim: ' + valueText(existingClaim),
      'Claim Number: ' + valueText(claimNumber), 'Carrier: ' + valueText(carrier),
      'Adjuster Assigned: ' + valueText(adjusterAssigned),
      'Adjuster Inspection Scheduled: ' + valueText(adjusterInspectionScheduled),
      'CRD Representation Requested: ' + valueText(needCrdPresent), '',
      'EMERGENCY INFORMATION', 'Emergency Type: ' + valueText(emergencyType),
      'Water Entering Building: ' + valueText(waterEnteringBuilding),
      'Building Occupied: ' + valueText(buildingOccupied), '',
      'Lead ID: ' + leadId, 'Source: ' + (source || 'Website Lead Form'), '',
      'Dispatch: 903-231-5940',
    ].join('\n');

    if (!resendKey) {
      console.error('[CRD Email] RESEND_API_KEY is not configured. Lead saved; notification not sent.');
    } else {
      const sendResendEmail = async (to: string, subject: string, htmlBody: string, textBody: string) => {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + resendKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: fromAddress, to: [to], subject, html: htmlBody, text: textBody,
            ...(logoAttachment ? { attachments: [logoAttachment] } : {}),
          }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error('Resend returned ' + response.status + ': ' + JSON.stringify(result));
        return result;
      };

      try {
        const result = await sendResendEmail(
          recipient,
          'COMMERCIAL ROOF LEAD | ' + fullName + ' | ' + (city || 'Texarkana Region'),
          internalHtml,
          internalText,
        );
        console.log('[CRD Email] Internal HTML lead notification queued (Resend ID: ' + (result.id || 'accepted') + ').');
      } catch (emailError) {
        console.error('[CRD Email] Internal lead notification failed; lead remains saved:', emailError);
      }

      if (typeof email === 'string' && email.includes('@')) {
        try {
          const customerBody =
            '<p style="margin:0 0 14px;font-size:15px;line-height:1.65;">Hello <strong>' + escapeEmailHtml(fullName) + '</strong>,</p>' +
            '<p style="margin:0 0 18px;color:#555;font-size:14px;line-height:1.7;">Thank you for contacting Commercial Roof Doctors. We have received your commercial roofing inquiry. Our team will review the information and follow up using the contact details you provided.</p>' +
            section('YOUR INQUIRY SUMMARY', [
              row('Company / property entity', newOrg.companyName), row('Property', propertyName || newProperty.propertyName),
              row('Location', propertyLocation), row('Inquiry type', leadType || 'Inspection'),
              row('Roof system', roofSystem || newProperty.roofSystem), row('Project details', message || notes),
            ].join('')) +
            '<div style="margin:20px 0;padding:16px;background:#f4f4f2;border-radius:7px;"><div style="font-size:14px;font-weight:700;margin-bottom:7px;">What happens next</div><div style="font-size:13px;line-height:1.7;color:#555;">A member of our commercial team will review your request and contact you to discuss the property, your roofing needs, and appropriate next steps. If additional information is needed, we will reach out directly.</div></div>' +
            '<div style="margin-top:18px;padding:15px;background:#fff5ed;border:1px solid #f2d3bd;border-radius:7px;text-align:center;"><div style="font-size:13px;font-weight:700;color:#68401f;">For an urgent active leak or immediate commercial roofing concern</div><div style="margin-top:7px;font-size:19px;font-weight:800;"><a href="tel:9032315940" style="color:#c65d18;text-decoration:none;">903-231-5940</a></div></div>';
          const customerHtml = emailShell('We Have Received Your Inquiry', customerBody);
          const customerText = [
            'Hello ' + fullName + ',', '',
            'Thank you for contacting Commercial Roof Doctors. We have received your commercial roofing inquiry. Our team will review the information and follow up using the contact details you provided.',
            '', 'YOUR INQUIRY SUMMARY', 'Company / Property Entity: ' + newOrg.companyName,
            'Property: ' + (propertyName || newProperty.propertyName), 'Location: ' + propertyLocation,
            'Inquiry Type: ' + (leadType || 'Inspection'), 'Roof System: ' + (roofSystem || newProperty.roofSystem),
            'Project Details: ' + valueText(message || notes), '',
            'WHAT HAPPENS NEXT',
            'A member of our commercial team will review your request and contact you to discuss the property, your roofing needs, and appropriate next steps.',
            '', 'For an urgent active leak or immediate commercial roofing concern, call 903-231-5940.',
            '', 'Commercial Roof Doctors', '903-231-5940 | TheRoofingDrs@gmail.com',
          ].join('\n');
          const result = await sendResendEmail(
            email.trim(),
            'Your Commercial Roofing Inquiry Has Been Received | Commercial Roof Doctors',
            customerHtml,
            customerText,
          );
          console.log('[CRD Email] Customer HTML confirmation queued (Resend ID: ' + (result.id || 'accepted') + ').');
        } catch (emailError) {
          console.error('[CRD Email] Customer confirmation failed; lead remains saved:', emailError);
        }
      }
    }

    console.log(`[CRD API] Ingested Lead ${leadId} (${newLead.leadType}, Priority: ${newLead.priority}) for ${fName} ${lName}`);

    res.status(201).json({
      success: true,
      leadId,
      organizationId: orgId,
      contactId,
      propertyId,
      message: 'Commercial roof request submitted successfully. A CRD commercial specialist will review the details.',
    });
  } catch (error: any) {
    console.error('Lead submission error:', error);
    res.status(503).json({ error: 'Failed to record commercial lead. Please call CRD at (903) 231-5940.' });
  }
});

// POST /api/emergency - Dedicated Emergency Flow
app.post('/api/emergency', (req: Request, res: Response) => {
  req.body.leadType = 'Emergency';
  req.body.priority = 'Emergency';
  req.body.source = 'Emergency Form';
  // Forward to leads handler internally
  return (app as any)._router.handle({ ...req, url: '/api/leads', method: 'POST' }, res);
});

// POST /api/calculator - Cost Calculator submission and calculation
app.post('/api/calculator', async (req: Request, res: Response) => {
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

    // If user provided contact info, also create an associated Lead
    let leadId = null;
    if (submitLead) {
      leadId = generateId('lead');
      const orgId = generateId('org');
      const contactId = generateId('cnt');
      const propertyId = generateId('prp');

      const parts = (contactName || '').trim().split(' ');
      const firstName = parts[0] || 'Commercial';
      const lastName = parts.slice(1).join(' ') || 'Prospect';

      db.organizations.push({
        organizationId: orgId,
        companyName: companyName || `${firstName} ${lastName} Commercial`,
        propertyManager: false,
        industry: propertyType || 'Commercial',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      db.contacts.push({
        contactId,
        organizationId: orgId,
        firstName,
        lastName,
        email: email || '',
        phone: phone || '',
        role: 'Decision Maker',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      db.properties.push({
        propertyId,
        organizationId: orgId,
        propertyName: companyName || `${address || 'Commercial Facility'}`,
        address: address || 'Ark-La-Tex',
        city: 'Texarkana',
        state: 'TX',
        zip: '75501',
        propertyType: propertyType || 'Commercial',
        approximateRoofArea: sqft,
        roofSystem: roofSystem || 'TPO',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const lead = {
        leadId,
        organizationId: orgId,
        contactId,
        propertyId,
        leadType: 'Cost Calculator',
        propertyType: propertyType || 'Commercial',
        roofSystem: roofSystem || 'TPO',
        priority: 'Normal',
        source: 'Commercial Roof Cost Calculator',
        status: 'New',
        assignedTo: 'Dispatch / Estimating',
        message: `Calculator estimate generated: ${sqft.toLocaleString()} sq ft ${roofSystem || 'TPO'} for ${desiredWork}. Range: ${estimatedLow.toLocaleString()} - ${estimatedHigh.toLocaleString()}`,
        notes: [`User completed commercial calculator. Address: ${address}`, notes].filter(Boolean).join(' | '),
        stormMetadata: {
          reasonForWork,
          stormDate: dateOfLoss || '',
          stormDamageType: reasonForWork,
          carrier: insurer || '',
          policyNumber: policyNumber || '',
          claimNumber: claimNumber || '',
          adjusterName: adjusterName || '',
          adjusterPhone: adjusterPhone || '',
        },
        photos: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await upsertRows('trd_records', [{ id: leadId, record_type: 'lead', payload: { ...lead, division: 'commercial', organizationRecord: db.organizations.find((o) => o.organizationId === orgId), contactRecord: db.contacts.find((c) => c.contactId === contactId), propertyRecord: db.properties.find((p) => p.propertyId === propertyId) }, updated_at: lead.updatedAt }], 'id');
      db.leads.push(lead);
    }

    if (submitLead) saveDB(db);

    res.json({
      success: true,
      calculationId: calcId,
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
    res.status(500).json({ error: 'Failed to calculate estimate range.' });
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

// ---------------- VITE & FRONTEND MOUNTING ----------------

// Serve static assets from public directory
app.use(express.static(path.join(process.cwd(), 'public'), {
  maxAge: 0,
  etag: true,
}));

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
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
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Commercial Roof Doctors] Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
