import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { selectRows, upsertRows } from './server/supabaseRest';
import { uploadPublicLogo, uploadPrivateLeadFile } from './server/supabaseStorage';

const PORT = Number(process.env.PORT) || 3000;
const app = express();
app.set('trust proxy', true);

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Database Persistence Layer
const DATA_DIR = path.join(process.cwd(), 'data');
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
app.post('/api/save-logo', async (req: Request, res: Response) => {
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
    calculator: db.calculatorSubmissions?.length || 0,
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
    if (!phone && !email) {
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
    res.status(500).json({ error: 'Failed to record commercial lead. Please call CRD at (903) 231-5940.' });
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
app.post('/api/calculator', (req: Request, res: Response) => {
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

    if (!submitLead) db.calculatorSubmissions.push(calcSubmission);

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
      db.leads.push(lead);
    }

    saveDB(db);

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
app.get('/api/calculator', (req: Request, res: Response) => {
  const list = [...(db.calculatorSubmissions || [])];
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(list);
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
    app.use(express.static(distPath, {
      maxAge: '1y',
      immutable: true,
      index: false,
    }));
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
