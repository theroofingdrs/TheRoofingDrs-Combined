import express, { Request, Response } from 'express';
import { getDatabase, persistDatabase, generateId } from '../../db/database.ts';
import { logAuditAction } from '../../services/audit.ts';
import { emitSystemEvent } from '../../services/events.ts';
import type {
  Invoice,
  Payment,
  PurchaseOrder,
  PurchaseOrderItem,
  Material,
  Vendor,
  Project,
} from '../../../shared/types/index.ts';

export const productionBillingRouter = express.Router();

function getContext(req: Request) {
  return {
    userId: (req.headers['x-user-id'] as string) || 'usr_admin_1',
    userRole: (req.headers['x-user-role'] as string) || 'ADMIN',
    ipAddress: req.ip || req.socket.remoteAddress || '127.0.0.1',
    userAgent: req.headers['user-agent'] || 'Applet-API',
  };
}

// =============================================================
// INVOICING & BILLING
// =============================================================

productionBillingRouter.get('/invoices', (req: Request, res: Response) => {
  const db = getDatabase();
  const { projectId, customerId, status, search } = req.query;

  let invoices = [...(db.invoices || [])];

  if (projectId) {
    invoices = invoices.filter((i) => i.projectId === projectId);
  }
  if (customerId) {
    invoices = invoices.filter((i) => i.customerId === customerId);
  }
  if (status) {
    invoices = invoices.filter((i) => i.status === status);
  }
  if (search) {
    const q = String(search).toLowerCase();
    invoices = invoices.filter(
      (i) =>
        i.invoiceNumber.toLowerCase().includes(q) ||
        (i.title && i.title.toLowerCase().includes(q))
    );
  }

  // Enrich with customer and project titles
  const enriched = invoices.map((inv) => {
    const customer = (db.customers || []).find((c) => c.id === inv.customerId);
    const project = (db.projects || []).find((p) => p.id === inv.projectId);
    return {
      ...inv,
      customerName: customer ? `${customer.firstName} ${customer.lastName}` : 'Homeowner',
      customerPhone: customer?.phone,
      customerEmail: customer?.email,
      projectTitle: project?.title || 'Roof Replacement',
    };
  });

  res.json(enriched);
});

productionBillingRouter.get('/invoices/:id', (req: Request, res: Response) => {
  const db = getDatabase();
  const invoice = (db.invoices || []).find((i) => i.id === req.params.id);
  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  const customer = (db.customers || []).find((c) => c.id === invoice.customerId);
  const project = (db.projects || []).find((p) => p.id === invoice.projectId);
  const property = (db.properties || []).find((pr) => pr.id === project?.propertyId);
  const payments = (db.payments || []).filter((p) => p.invoiceId === invoice.id);

  res.json({
    ...invoice,
    customer,
    project,
    property,
    payments,
  });
});

productionBillingRouter.post('/invoices', (req: Request, res: Response) => {
  const db = getDatabase();
  const ctx = getContext(req);
  const {
    projectId,
    customerId,
    title,
    milestoneType,
    amountDue,
    dueDate,
    items,
    notes,
    paymentTerms,
    status,
  } = req.body;

  if (!projectId || !customerId || amountDue === undefined) {
    return res.status(400).json({ error: 'Missing required fields: projectId, customerId, and amountDue are mandatory' });
  }

  const project = (db.projects || []).find((p) => p.id === projectId);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const now = new Date().toISOString();
  const count = (db.invoices || []).length + 1;
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

  const finalStatus = status === 'ISSUED' ? 'ISSUED' : 'DRAFT';

  const newInvoice: Invoice = {
    id: generateId('inv'),
    projectId,
    customerId,
    invoiceNumber,
    title: title || `${milestoneType || 'Progress'} Billing`,
    milestoneType: milestoneType || 'PROGRESS',
    amountDue: Number(amountDue),
    amountPaid: 0,
    balance: Number(amountDue),
    status: finalStatus,
    dueDate: dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    issuedAt: finalStatus === 'ISSUED' ? now : undefined,
    paymentTerms: paymentTerms || 'Net 15 Days / Due upon receipt',
    items: items || [
      {
        description: title || 'Roof Replacement Milestone',
        quantity: 1,
        unit: 'EA',
        unitPrice: Number(amountDue),
        total: Number(amountDue),
      },
    ],
    notes,
    createdAt: now,
    updatedAt: now,
  };

  if (!db.invoices) db.invoices = [];
  db.invoices.unshift(newInvoice);
  persistDatabase();

  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'CREATE',
    entityType: 'Invoice',
    entityId: newInvoice.id,
    newState: { invoiceNumber, amountDue, milestoneType },
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  if (finalStatus === 'ISSUED') {
    emitSystemEvent({
      type: 'INVOICE_ISSUED',
      entityType: 'Invoice',
      entityId: newInvoice.id,
      data: { invoiceNumber, amountDue: newInvoice.amountDue, customerId },
    });
  }

  res.status(201).json(newInvoice);
});

// Auto-generate standard 3-milestone billing structure for sold project
productionBillingRouter.post('/invoices/generate-milestones', (req: Request, res: Response) => {
  const db = getDatabase();
  const ctx = getContext(req);
  const { projectId, depositPercentage = 50, includeDeductible = false, deductibleAmount = 1000 } = req.body;

  const project = (db.projects || []).find((p) => p.id === projectId);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const totalValue = project.totalContractValue || 15000;
  const now = new Date().toISOString();
  const currentYear = new Date().getFullYear();
  const baseCount = (db.invoices || []).length;

  const depositPercent = Math.min(Math.max(Number(depositPercentage), 20), 60);
  const depositAmount = Math.round((totalValue * depositPercent) / 100);
  const progressPercent = 30;
  const progressAmount = Math.round((totalValue * progressPercent) / 100);
  const finalAmount = totalValue - depositAmount - progressAmount;

  const invoicesCreated: Invoice[] = [];

  // Milestone 1: Initial Deposit / ACV Advance
  const inv1: Invoice = {
    id: generateId('inv'),
    projectId: project.id,
    customerId: project.customerId,
    invoiceNumber: `INV-${currentYear}-${String(baseCount + 1).padStart(4, '0')}-DEP`,
    title: project.insuranceClaimFlag
      ? 'Milestone 1: Insurance ACV Initial Check & Project Deposit'
      : `Milestone 1: Project Initiation Deposit (${depositPercent}%)`,
    milestoneType: 'DEPOSIT',
    amountDue: depositAmount,
    amountPaid: 0,
    balance: depositAmount,
    status: 'ISSUED',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    issuedAt: now,
    paymentTerms: 'Due upon contract execution and scheduling',
    items: [
      {
        description: `Project Mobilization & Materials Procurement Deposit (${depositPercent}% of Contract Total)`,
        quantity: 1,
        unit: 'JOB',
        unitPrice: depositAmount,
        total: depositAmount,
      },
    ],
    notes: project.insuranceClaimFlag
      ? 'Initial insurance Actual Cash Value (ACV) check deposit. In accordance with Texas HB 2102, homeowner is responsible for paying their deductible in full.'
      : 'Initial deposit securing roofing crew schedule and supplier allocation.',
    createdAt: now,
    updatedAt: now,
  };
  invoicesCreated.push(inv1);

  // Milestone 2: Material Delivery / Tear-Off Progress
  const inv2: Invoice = {
    id: generateId('inv'),
    projectId: project.id,
    customerId: project.customerId,
    invoiceNumber: `INV-${currentYear}-${String(baseCount + 2).padStart(4, '0')}-PROG`,
    title: `Milestone 2: Rooftop Material Drop & Substantial Tear-Off (${progressPercent}%)`,
    milestoneType: 'PROGRESS',
    amountDue: progressAmount,
    amountPaid: 0,
    balance: progressAmount,
    status: 'DRAFT',
    dueDate: new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0],
    paymentTerms: 'Due upon rooftop conveyor material delivery and dry-in',
    items: [
      {
        description: 'Underlayment dry-in, valley ice & water shield installation, and shingle staging progress milestone',
        quantity: 1,
        unit: 'JOB',
        unitPrice: progressAmount,
        total: progressAmount,
      },
    ],
    notes: 'Issued upon confirmed ABC Supply rooftop delivery and initial decking dry-in.',
    createdAt: now,
    updatedAt: now,
  };
  invoicesCreated.push(inv2);

  // Milestone 3: Final Completion & Certification
  const inv3: Invoice = {
    id: generateId('inv'),
    projectId: project.id,
    customerId: project.customerId,
    invoiceNumber: `INV-${currentYear}-${String(baseCount + 3).padStart(4, '0')}-FIN`,
    title: project.insuranceClaimFlag
      ? 'Milestone 3: Final Completion, Quality Sign-Off & Depreciation Release'
      : 'Milestone 3: Final Quality Sign-Off & Warranty Release',
    milestoneType: 'FINAL_COMPLETION',
    amountDue: finalAmount,
    amountPaid: 0,
    balance: finalAmount,
    status: 'DRAFT',
    dueDate: new Date(Date.now() + 35 * 86400000).toISOString().split('T')[0],
    paymentTerms: 'Due upon final magnetic sweep, homeowner walkthrough, and warranty certificate issuance',
    items: [
      {
        description: 'Final installation completion, ridge vent activation, magnetic nail sweep verification, and manufacturer warranty package',
        quantity: 1,
        unit: 'JOB',
        unitPrice: finalAmount,
        total: finalAmount,
      },
    ],
    notes: project.insuranceClaimFlag
      ? 'Upon receipt of this final payment and Texas HB 2102 deductible confirmation, the Certificate of Completion is sent to the insurance carrier to release recoverable depreciation.'
      : 'Final balance due upon completed installation walkthrough.',
    createdAt: now,
    updatedAt: now,
  };
  invoicesCreated.push(inv3);

  if (!db.invoices) db.invoices = [];
  db.invoices.unshift(...invoicesCreated);
  persistDatabase();

  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'CREATE',
    entityType: 'InvoiceMilestones',
    entityId: project.id,
    newState: { totalValue, depositAmount, progressAmount, finalAmount },
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  emitSystemEvent({
    type: 'INVOICE_ISSUED',
    entityType: 'Invoice',
    entityId: inv1.id,
    data: { invoiceNumber: inv1.invoiceNumber, amountDue: inv1.amountDue, customerId: project.customerId },
  });

  res.status(201).json({
    success: true,
    message: 'Generated 3-milestone construction invoice package',
    invoices: invoicesCreated,
  });
});

productionBillingRouter.post('/invoices/:id/issue', (req: Request, res: Response) => {
  const db = getDatabase();
  const ctx = getContext(req);
  const invoice = (db.invoices || []).find((i) => i.id === req.params.id);
  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  const now = new Date().toISOString();
  invoice.status = 'ISSUED';
  invoice.issuedAt = now;
  invoice.updatedAt = now;
  persistDatabase();

  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'UPDATE',
    entityType: 'Invoice',
    entityId: invoice.id,
    newState: { status: 'ISSUED', invoiceNumber: invoice.invoiceNumber },
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  emitSystemEvent({
    type: 'INVOICE_ISSUED',
    entityType: 'Invoice',
    entityId: invoice.id,
    data: { invoiceNumber: invoice.invoiceNumber, amountDue: invoice.amountDue, customerId: invoice.customerId },
  });

  res.json(invoice);
});

productionBillingRouter.post('/invoices/:id/void', (req: Request, res: Response) => {
  const db = getDatabase();
  const ctx = getContext(req);
  const invoice = (db.invoices || []).find((i) => i.id === req.params.id);
  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  const now = new Date().toISOString();
  invoice.status = 'VOID';
  invoice.updatedAt = now;
  persistDatabase();

  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'UPDATE',
    entityType: 'Invoice',
    entityId: invoice.id,
    newState: { status: 'VOID', invoiceNumber: invoice.invoiceNumber },
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  res.json(invoice);
});

// =============================================================
// PAYMENTS & TEXAS HB 2102 DEDUCTIBLE COMPLIANCE
// =============================================================

productionBillingRouter.get('/payments', (req: Request, res: Response) => {
  const db = getDatabase();
  const { projectId, customerId, invoiceId } = req.query;

  let payments = [...(db.payments || [])];

  if (projectId) {
    payments = payments.filter((p) => p.projectId === projectId);
  }
  if (customerId) {
    payments = payments.filter((p) => p.customerId === customerId);
  }
  if (invoiceId) {
    payments = payments.filter((p) => p.invoiceId === invoiceId);
  }

  const enriched = payments.map((pay) => {
    const customer = (db.customers || []).find((c) => c.id === pay.customerId);
    const project = (db.projects || []).find((p) => p.id === pay.projectId);
    const invoice = (db.invoices || []).find((i) => i.id === pay.invoiceId);
    return {
      ...pay,
      customerName: customer ? `${customer.firstName} ${customer.lastName}` : 'Customer',
      projectTitle: project?.title || 'Project',
      invoiceNumber: invoice?.invoiceNumber || 'Direct Payment',
    };
  });

  res.json(enriched);
});

productionBillingRouter.post('/payments', (req: Request, res: Response) => {
  const db = getDatabase();
  const ctx = getContext(req);
  const {
    projectId,
    customerId,
    invoiceId,
    amount,
    paymentMethod = 'CHECK',
    receiptNumber,
    notes,
    isDeductiblePayment = false,
    texasHb2102DeclarationConfirmed = false,
  } = req.body;

  if (!projectId || !customerId || amount === undefined || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Valid projectId, customerId, and positive amount are required' });
  }

  const numAmount = Number(amount);
  const now = new Date().toISOString();
  const count = (db.payments || []).length + 1;
  const genReceiptNumber = receiptNumber || `REC-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

  const newPayment: Payment = {
    id: generateId('pay'),
    projectId,
    customerId,
    invoiceId: invoiceId || undefined,
    amount: numAmount,
    currency: 'USD',
    paymentMethod,
    status: 'PAID',
    receiptNumber: genReceiptNumber,
    processedAt: now,
    notes,
    isDeductiblePayment: Boolean(isDeductiblePayment),
    texasHb2102DeclarationConfirmed: Boolean(texasHb2102DeclarationConfirmed),
    createdAt: now,
    updatedAt: now,
  };

  if (!db.payments) db.payments = [];
  db.payments.unshift(newPayment);

  // Reconcile Invoice if linked
  let updatedInvoice: Invoice | undefined;
  if (invoiceId) {
    const invoice = (db.invoices || []).find((i) => i.id === invoiceId);
    if (invoice) {
      invoice.amountPaid = (invoice.amountPaid || 0) + numAmount;
      invoice.balance = Math.max(0, invoice.amountDue - invoice.amountPaid);
      if (invoice.balance <= 0) {
        invoice.status = 'PAID';
        invoice.paidAt = now;
      } else {
        invoice.status = 'PARTIALLY_PAID';
      }
      invoice.updatedAt = now;
      updatedInvoice = invoice;
    }
  }

  // Update Project Texas HB 2102 details if deductible payment confirmed
  const project = (db.projects || []).find((p) => p.id === projectId);
  if (project && (isDeductiblePayment || texasHb2102DeclarationConfirmed)) {
    project.texasHb2102Verified = true;
    project.texasHb2102DeductibleAmount = numAmount;
    project.texasHb2102PaymentMethod = paymentMethod;
    project.texasHb2102VerifiedDate = now;
    project.texasHb2102ReceiptNumber = genReceiptNumber;
    project.updatedAt = now;
  }

  persistDatabase();

  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'CREATE',
    entityType: 'Payment',
    entityId: newPayment.id,
    newState: {
      amount: numAmount,
      paymentMethod,
      invoiceId,
      receiptNumber: genReceiptNumber,
      isDeductiblePayment,
    },
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  emitSystemEvent({
    type: 'PAYMENT_RECEIVED',
    entityType: 'Payment',
    entityId: newPayment.id,
    data: {
      amount: numAmount,
      receiptNumber: genReceiptNumber,
      projectId,
      customerId,
      invoiceId,
      isDeductiblePayment,
    },
  });

  if (isDeductiblePayment || (project && project.texasHb2102Verified)) {
    emitSystemEvent({
      type: 'DEDUCTIBLE_VERIFIED',
      entityType: 'Project',
      entityId: projectId,
      data: {
        deductibleAmount: numAmount,
        receiptNumber: genReceiptNumber,
        verifiedAt: now,
      },
    });
  }

  res.status(201).json({
    success: true,
    payment: newPayment,
    invoice: updatedInvoice,
    project,
  });
});

// Dedicated Texas HB 2102 statutory verification endpoint
productionBillingRouter.post('/projects/:id/verify-deductible', (req: Request, res: Response) => {
  const db = getDatabase();
  const ctx = getContext(req);
  const project = (db.projects || []).find((p) => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const {
    deductibleAmount,
    paymentMethod = 'CHECK',
    receiptNumber,
    homeownerConfirmed = true,
    notes,
  } = req.body;

  if (!deductibleAmount || Number(deductibleAmount) <= 0) {
    return res.status(400).json({ error: 'A valid deductible amount is required' });
  }

  const now = new Date().toISOString();
  const numAmount = Number(deductibleAmount);
  const receipt = receiptNumber || `DED-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;

  project.texasHb2102Verified = true;
  project.texasHb2102DeductibleAmount = numAmount;
  project.texasHb2102PaymentMethod = paymentMethod;
  project.texasHb2102VerifiedDate = now;
  project.texasHb2102ReceiptNumber = receipt;
  project.updatedAt = now;

  // Create or update receipt payment record for legal paper trail
  const paymentRecord: Payment = {
    id: generateId('pay'),
    projectId: project.id,
    customerId: project.customerId,
    amount: numAmount,
    currency: 'USD',
    paymentMethod,
    status: 'PAID',
    receiptNumber: receipt,
    processedAt: now,
    notes: notes || 'Texas HB 2102 Mandatory Homeowner Deductible Payment Verification',
    isDeductiblePayment: true,
    texasHb2102DeclarationConfirmed: Boolean(homeownerConfirmed),
    createdAt: now,
    updatedAt: now,
  };

  if (!db.payments) db.payments = [];
  db.payments.unshift(paymentRecord);

  persistDatabase();

  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'STATUS_CHANGE',
    entityType: 'Project',
    entityId: project.id,
    newState: {
      deductibleAmount: numAmount,
      receiptNumber: receipt,
      paymentMethod,
      statutoryDeclaration: 'Verified under Texas Insurance Code § 707.006 without rebate or waiver.',
    },
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  emitSystemEvent({
    type: 'DEDUCTIBLE_VERIFIED',
    entityType: 'Project',
    entityId: project.id,
    data: {
      deductibleAmount: numAmount,
      receiptNumber: receipt,
      verifiedAt: now,
    },
  });

  res.json({
    success: true,
    message: 'Texas HB 2102 Deductible Compliance verified successfully',
    project,
    paymentRecord,
  });
});

// =============================================================
// PRODUCTION MANAGEMENT, SCHEDULING & QUALITY CHECKLIST
// =============================================================

productionBillingRouter.post('/projects/:id/schedule', (req: Request, res: Response) => {
  const db = getDatabase();
  const ctx = getContext(req);
  const project = (db.projects || []).find((p) => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const {
    assignedCrewId,
    targetStartDate,
    dumpsterLocation,
    dumpsterDropDate,
    productionNotes,
  } = req.body;

  if (!targetStartDate) {
    return res.status(400).json({ error: 'targetStartDate is required' });
  }

  const now = new Date().toISOString();
  if (assignedCrewId) project.assignedCrewId = assignedCrewId;
  project.targetStartDate = targetStartDate;
  if (dumpsterLocation) project.dumpsterLocation = dumpsterLocation;
  if (dumpsterDropDate) project.dumpsterDropDate = dumpsterDropDate;
  if (productionNotes) project.productionNotes = productionNotes;

  // Advance status to SCHEDULED if currently SOLD or PRE_PRODUCTION
  if (project.status === 'SOLD' || project.status === 'PRE_PRODUCTION') {
    project.status = 'SCHEDULED';
  }
  project.updatedAt = now;

  // If workOrderNumber doesn't exist, assign one
  if (!project.workOrderNumber) {
    const count = (db.projects || []).filter((p) => p.workOrderNumber).length + 1;
    project.workOrderNumber = `WO-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;
  }

  persistDatabase();

  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'UPDATE',
    entityType: 'Project',
    entityId: project.id,
    newState: {
      action: 'SCHEDULE_PROJECT',
      assignedCrewId,
      targetStartDate,
      status: project.status,
    },
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  emitSystemEvent({
    type: 'PROJECT_SCHEDULED',
    entityType: 'Project',
    entityId: project.id,
    data: {
      targetStartDate,
      assignedCrewId,
      workOrderNumber: project.workOrderNumber,
    },
  });

  res.json({
    success: true,
    message: 'Project successfully scheduled for installation',
    project,
  });
});

productionBillingRouter.post('/projects/:id/start-production', (req: Request, res: Response) => {
  const db = getDatabase();
  const ctx = getContext(req);
  const project = (db.projects || []).find((p) => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const now = new Date().toISOString();
  project.status = 'IN_PROGRESS';
  project.actualStartDate = now;
  project.updatedAt = now;

  persistDatabase();

  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'UPDATE',
    entityType: 'Project',
    entityId: project.id,
    newState: { action: 'START_PRODUCTION', actualStartDate: now },
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  emitSystemEvent({
    type: 'PRODUCTION_STARTED',
    entityType: 'Project',
    entityId: project.id,
    data: { actualStartDate: now, title: project.title },
  });

  res.json({
    success: true,
    message: 'Project transitioned to IN_PROGRESS',
    project,
  });
});

productionBillingRouter.post('/projects/:id/quality-checklist', (req: Request, res: Response) => {
  const db = getDatabase();
  const ctx = getContext(req);
  const project = (db.projects || []).find((p) => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const {
    iceAndWaterShield,
    sixNailFastening,
    continuousRidgeVent,
    stepFlashing,
    magnetSweepCompleted,
    verifiedBy,
  } = req.body;

  const now = new Date().toISOString();
  project.qualityChecklist = {
    iceAndWaterShield: Boolean(iceAndWaterShield),
    sixNailFastening: Boolean(sixNailFastening),
    continuousRidgeVent: Boolean(continuousRidgeVent),
    stepFlashing: Boolean(stepFlashing),
    magnetSweepCompleted: Boolean(magnetSweepCompleted),
    verifiedBy: verifiedBy || ctx.userId,
    verifiedAt: now,
  };

  const allDone =
    project.qualityChecklist.iceAndWaterShield &&
    project.qualityChecklist.sixNailFastening &&
    project.qualityChecklist.continuousRidgeVent &&
    project.qualityChecklist.stepFlashing &&
    project.qualityChecklist.magnetSweepCompleted;

  if (allDone && project.status === 'IN_PROGRESS') {
    project.status = 'QC';
  }
  project.updatedAt = now;

  persistDatabase();

  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'UPDATE',
    entityType: 'ProjectQualityChecklist',
    entityId: project.id,
    newState: { qualityChecklist: project.qualityChecklist, allDone },
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  res.json({
    success: true,
    message: allDone ? 'Quality checklist complete; advanced to QC' : 'Quality checklist updated',
    project,
  });
});

productionBillingRouter.post('/projects/:id/complete', (req: Request, res: Response) => {
  const db = getDatabase();
  const ctx = getContext(req);
  const project = (db.projects || []).find((p) => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const now = new Date().toISOString();
  project.status = 'COMPLETED';
  project.completedDate = now;
  project.updatedAt = now;

  persistDatabase();

  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'UPDATE',
    entityType: 'Project',
    entityId: project.id,
    newState: { action: 'COMPLETE_PROJECT', completedDate: now },
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  emitSystemEvent({
    type: 'PROJECT_COMPLETED',
    entityType: 'Project',
    entityId: project.id,
    data: { completedDate: now, title: project.title },
  });

  res.json({
    success: true,
    message: 'Project marked COMPLETED with warranty packages ready for generation',
    project,
  });
});

// Full Printable Work Order Data
productionBillingRouter.get('/projects/:id/work-order', (req: Request, res: Response) => {
  const db = getDatabase();
  const project = (db.projects || []).find((p) => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const customer = (db.customers || []).find((c) => c.id === project.customerId);
  const property = (db.properties || []).find((pr) => pr.id === project.propertyId);
  const roof = (db.roofs || []).find((r) => r.propertyId === project.propertyId);
  const crew = (db.crews || []).find((cr) => cr.id === project.assignedCrewId);
  const estimate = (db.estimates || []).find((e) => e.projectId === project.id || (e.leadId && e.leadId === project.leadId));
  const purchaseOrders = (db.purchaseOrders || []).filter((po) => po.projectId === project.id);

  res.json({
    project,
    customer,
    property,
    roof,
    crew,
    estimate,
    purchaseOrders,
    company: {
      name: 'The Roof Doctors',
      phone: '903-231-5940',
      email: 'operations@theroofdoctors.com',
      serviceArea: 'Texarkana, Mount Pleasant, Marshall & East Texas',
    },
  });
});

// =============================================================
// MATERIALS, VENDORS & PURCHASE ORDERS
// =============================================================

productionBillingRouter.get('/materials', (_req: Request, res: Response) => {
  const db = getDatabase();
  res.json(db.materials || []);
});

productionBillingRouter.post('/materials', (req: Request, res: Response) => {
  const db = getDatabase();
  const ctx = getContext(req);
  const { name, sku, category, manufacturer, unit, costPerUnit } = req.body;

  if (!name || !sku || !category || costPerUnit === undefined) {
    return res.status(400).json({ error: 'name, sku, category, and costPerUnit are required' });
  }

  const newMaterial: Material = {
    id: generateId('mat'),
    name,
    sku,
    category,
    manufacturer: manufacturer || 'Standard',
    unit: unit || 'SQ',
    costPerUnit: Number(costPerUnit),
    active: true,
    createdAt: new Date().toISOString(),
  };

  if (!db.materials) db.materials = [];
  db.materials.push(newMaterial);
  persistDatabase();

  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'CREATE',
    entityType: 'Material',
    entityId: newMaterial.id,
    newState: { name, sku, costPerUnit },
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  res.status(201).json(newMaterial);
});

productionBillingRouter.get('/vendors', (_req: Request, res: Response) => {
  const db = getDatabase();
  res.json(db.vendors || []);
});

productionBillingRouter.post('/vendors', (req: Request, res: Response) => {
  const db = getDatabase();
  const ctx = getContext(req);
  const { name, contactName, phone, email, accountNumber, city, state } = req.body;

  if (!name || !phone || !city) {
    return res.status(400).json({ error: 'name, phone, and city are required' });
  }

  const newVendor: Vendor = {
    id: generateId('vend'),
    name,
    contactName: contactName || 'Branch Manager',
    phone,
    email: email || 'orders@supply.com',
    accountNumber,
    city,
    state: state || 'TX',
    active: true,
    createdAt: new Date().toISOString(),
  };

  if (!db.vendors) db.vendors = [];
  db.vendors.push(newVendor);
  persistDatabase();

  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'CREATE',
    entityType: 'Vendor',
    entityId: newVendor.id,
    newState: { name, city, accountNumber },
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  res.status(201).json(newVendor);
});

productionBillingRouter.get('/purchase-orders', (req: Request, res: Response) => {
  const db = getDatabase();
  const { projectId, vendorId, status } = req.query;

  let pos = [...(db.purchaseOrders || [])];
  if (projectId) pos = pos.filter((po) => po.projectId === projectId);
  if (vendorId) pos = pos.filter((po) => po.vendorId === vendorId);
  if (status) pos = pos.filter((po) => po.status === status);

  const enriched = pos.map((po) => {
    const vendor = (db.vendors || []).find((v) => v.id === po.vendorId);
    const project = (db.projects || []).find((p) => p.id === po.projectId);
    return {
      ...po,
      vendorName: vendor?.name || 'Roofing Supply Vendor',
      vendorPhone: vendor?.phone,
      projectTitle: project?.title || 'Project',
    };
  });

  res.json(enriched);
});

productionBillingRouter.get('/purchase-orders/:id', (req: Request, res: Response) => {
  const db = getDatabase();
  const po = (db.purchaseOrders || []).find((p) => p.id === req.params.id);
  if (!po) {
    return res.status(404).json({ error: 'Purchase Order not found' });
  }
  const vendor = (db.vendors || []).find((v) => v.id === po.vendorId);
  const project = (db.projects || []).find((p) => p.id === po.projectId);
  res.json({ ...po, vendor, project });
});

productionBillingRouter.post('/purchase-orders', (req: Request, res: Response) => {
  const db = getDatabase();
  const ctx = getContext(req);
  const {
    projectId,
    vendorId,
    deliveryDate,
    rooftopDelivery = true,
    deliveryAddress,
    deliveryInstructions,
    items = [],
    notes,
  } = req.body;

  if (!projectId || !vendorId) {
    return res.status(400).json({ error: 'projectId and vendorId are required' });
  }

  const totalCost = items.reduce((acc: number, it: PurchaseOrderItem) => acc + (it.totalCost || (it.quantity * it.unitCost) || 0), 0);
  const now = new Date().toISOString();
  const count = (db.purchaseOrders || []).length + 1;
  const poNumber = `PO-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

  const newPO: PurchaseOrder = {
    id: generateId('po'),
    projectId,
    vendorId,
    poNumber,
    status: 'DRAFT',
    totalCost,
    deliveryDate: deliveryDate || new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    rooftopDelivery: Boolean(rooftopDelivery),
    deliveryAddress,
    deliveryInstructions: deliveryInstructions || 'Deliver via boom conveyor directly to roof ridge. Protect concrete driveway.',
    items,
    notes,
    createdAt: now,
    updatedAt: now,
  };

  if (!db.purchaseOrders) db.purchaseOrders = [];
  db.purchaseOrders.unshift(newPO);
  persistDatabase();

  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'CREATE',
    entityType: 'PurchaseOrder',
    entityId: newPO.id,
    newState: { poNumber, vendorId, totalCost, rooftopDelivery },
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  res.status(201).json(newPO);
});

productionBillingRouter.post('/purchase-orders/:id/order', (req: Request, res: Response) => {
  const db = getDatabase();
  const ctx = getContext(req);
  const po = (db.purchaseOrders || []).find((p) => p.id === req.params.id);
  if (!po) {
    return res.status(404).json({ error: 'Purchase Order not found' });
  }

  const { supplierConfirmationNumber } = req.body;
  const now = new Date().toISOString();
  po.status = 'ORDERED';
  if (supplierConfirmationNumber) {
    po.supplierConfirmationNumber = supplierConfirmationNumber;
  }
  po.updatedAt = now;
  persistDatabase();

  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'UPDATE',
    entityType: 'PurchaseOrder',
    entityId: po.id,
    newState: { status: 'ORDERED', supplierConfirmationNumber },
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  emitSystemEvent({
    type: 'PO_ORDERED',
    entityType: 'PurchaseOrder',
    entityId: po.id,
    data: { poNumber: po.poNumber, vendorId: po.vendorId, totalCost: po.totalCost },
  });

  res.json(po);
});

productionBillingRouter.post('/purchase-orders/:id/deliver', (req: Request, res: Response) => {
  const db = getDatabase();
  const ctx = getContext(req);
  const po = (db.purchaseOrders || []).find((p) => p.id === req.params.id);
  if (!po) {
    return res.status(404).json({ error: 'Purchase Order not found' });
  }

  const now = new Date().toISOString();
  po.status = 'DELIVERED';
  po.updatedAt = now;
  persistDatabase();

  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'UPDATE',
    entityType: 'PurchaseOrder',
    entityId: po.id,
    newState: { status: 'DELIVERED' },
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  emitSystemEvent({
    type: 'PO_DELIVERED',
    entityType: 'PurchaseOrder',
    entityId: po.id,
    data: { poNumber: po.poNumber, projectId: po.projectId },
  });

  res.json(po);
});

// Auto-generate PO directly from Project / Roof Size
productionBillingRouter.post('/projects/:id/generate-po', (req: Request, res: Response) => {
  const db = getDatabase();
  const ctx = getContext(req);
  const project = (db.projects || []).find((p) => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const property = (db.properties || []).find((pr) => pr.id === project.propertyId);
  const roof = (db.roofs || []).find((r) => r.propertyId === project.propertyId);
  const vendors = db.vendors || [];
  const vendor = vendors[0] || { id: 'vend_abc_texarkana', name: 'ABC Supply Co.' };

  // Calculate required quantities based on roof squares or standard 32 SQ roof
  const totalSquares = (roof?.squares && roof.squares > 0) ? roof.squares : 32.5;
  const wasteMultiplier = 1.12; // 12% standard waste
  const orderedSquares = Math.ceil(totalSquares * wasteMultiplier);

  // Bundles of shingles = 3 bundles per square
  const shingleBundles = orderedSquares * 3;
  // Underlayment: 10 SQ per roll
  const underlaymentRolls = Math.ceil(orderedSquares / 10);
  // Ice & water shield: 2 rolls for standard eaves and valleys
  const iceWaterRolls = 2;
  // Starter strip: ~200 LF -> 2 bundles (105 LF each)
  const starterBundles = 2;
  // Ridge cap: ~70 LF -> 2 bundles (33 LF each)
  const ridgeCapBundles = 2;
  // Nails: 1 box coil nails per 30 squares
  const nailBoxes = Math.ceil(orderedSquares / 30);
  // Ridge vent: ~40 LF -> 10 sticks (4ft each)
  const ridgeVentSticks = 10;
  // Drip edge: ~240 LF -> 24 sticks (10ft each)
  const dripEdgeSticks = 24;

  const items: PurchaseOrderItem[] = [
    {
      description: `Owens Corning Duration Architectural Shingles (Estate Gray) — ${orderedSquares} SQ (${shingleBundles} Bundles)`,
      quantity: orderedSquares,
      unit: 'SQ',
      unitCost: 115.0,
      totalCost: orderedSquares * 115.0,
    },
    {
      description: 'Titanium UDL30 High-Performance Synthetic Underlayment (10 SQ Roll)',
      quantity: underlaymentRolls,
      unit: 'ROLL',
      unitCost: 145.0,
      totalCost: underlaymentRolls * 145.0,
    },
    {
      description: 'Owens Corning WeatherLock G Granulated Ice & Water Shield (2 SQ Roll)',
      quantity: iceWaterRolls,
      unit: 'ROLL',
      unitCost: 110.0,
      totalCost: iceWaterRolls * 110.0,
    },
    {
      description: 'Owens Corning Starter Strip Plus (105 LF/Bundle)',
      quantity: starterBundles,
      unit: 'BD',
      unitCost: 48.0,
      totalCost: starterBundles * 48.0,
    },
    {
      description: 'Owens Corning ProEdge Hip & Ridge Shingles (33 LF/Bundle)',
      quantity: ridgeCapBundles,
      unit: 'BD',
      unitCost: 58.0,
      totalCost: ridgeCapBundles * 58.0,
    },
    {
      description: '1-1/4" Electro-Galvanized Coil Roofing Nails (7,200/Box)',
      quantity: nailBoxes,
      unit: 'BOX',
      unitCost: 42.0,
      totalCost: nailBoxes * 42.0,
    },
    {
      description: 'Aluminum Drip Edge T-Style 10ft (White)',
      quantity: dripEdgeSticks,
      unit: 'EA',
      unitCost: 11.5,
      totalCost: dripEdgeSticks * 11.5,
    },
    {
      description: 'Continuous Shingle-Over Ridge Vent 4ft Sticks',
      quantity: ridgeVentSticks,
      unit: 'EA',
      unitCost: 14.5,
      totalCost: ridgeVentSticks * 14.5,
    },
  ];

  const totalCost = items.reduce((acc, it) => acc + it.totalCost, 0);
  const now = new Date().toISOString();
  const count = (db.purchaseOrders || []).length + 1;
  const poNumber = `PO-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

  const newPO: PurchaseOrder = {
    id: generateId('po'),
    projectId: project.id,
    vendorId: vendor.id,
    poNumber,
    status: 'DRAFT',
    totalCost,
    deliveryDate: project.targetStartDate || new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
    rooftopDelivery: true,
    deliveryAddress: property ? `${property.address}, ${property.city}, ${property.state} ${property.zip}` : 'Customer Address',
    deliveryInstructions: 'ROOFTOP CONVEYOR DELIVERY REQUIRED. Load bundles evenly distributed across roof planes. Protect driveway concrete.',
    items,
    notes: `Calculated for ${totalSquares} SQ actual measurement with 12% pitch/valley waste factor.`,
    createdAt: now,
    updatedAt: now,
  };

  if (!db.purchaseOrders) db.purchaseOrders = [];
  db.purchaseOrders.unshift(newPO);
  persistDatabase();

  logAuditAction({
    userId: ctx.userId,
    userRole: ctx.userRole,
    action: 'CREATE',
    entityType: 'PurchaseOrder',
    entityId: newPO.id,
    newState: { poNumber, vendorId: vendor.id, totalCost, totalSquares },
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  res.status(201).json({
    success: true,
    message: `Generated purchase order for ${orderedSquares} SQ rooftop delivery`,
    purchaseOrder: newPO,
  });
});

// =============================================================
// HOMEOWNER PORTAL CUSTOMER-FACING ENDPOINTS
// =============================================================

// Safe customer project view
productionBillingRouter.get('/portal/projects', (req: Request, res: Response) => {
  const db = getDatabase();
  const customerId = (req.query.customerId as string) || 'usr_homeowner_demo';

  const projects = (db.projects || []).filter((p) => p.customerId === customerId || p.customerId === 'cust_demo_1');

  const safeProjects = projects.map((p) => {
    const crew = (db.crews || []).find((cr) => cr.id === p.assignedCrewId);
    return {
      id: p.id,
      title: p.title,
      status: p.status,
      projectType: p.projectType,
      targetStartDate: p.targetStartDate,
      actualStartDate: p.actualStartDate,
      completedDate: p.completedDate,
      foremanName: crew?.leadForemanName || 'Field Operations Foreman',
      crewName: crew?.name || 'Certified Piney Woods Installation Crew',
      texasHb2102Verified: p.texasHb2102Verified || false,
      qualityChecklist: p.qualityChecklist || null,
      workOrderNumber: p.workOrderNumber,
    };
  });

  res.json(safeProjects);
});

// Safe customer billing view
productionBillingRouter.get('/portal/invoices', (req: Request, res: Response) => {
  const db = getDatabase();
  const customerId = (req.query.customerId as string) || 'usr_homeowner_demo';

  const invoices = (db.invoices || []).filter(
    (i) => (i.customerId === customerId || i.customerId === 'cust_demo_1') && i.status !== 'VOID'
  );

  const safeInvoices = invoices.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    title: inv.title,
    milestoneType: inv.milestoneType,
    amountDue: inv.amountDue,
    amountPaid: inv.amountPaid,
    balance: inv.balance,
    status: inv.status,
    dueDate: inv.dueDate,
    issuedAt: inv.issuedAt,
    paidAt: inv.paidAt,
    items: inv.items,
  }));

  const payments = (db.payments || []).filter(
    (p) => p.customerId === customerId || p.customerId === 'cust_demo_1'
  );

  res.json({
    invoices: safeInvoices,
    payments: payments.map((p) => ({
      id: p.id,
      amount: p.amount,
      paymentMethod: p.paymentMethod,
      receiptNumber: p.receiptNumber,
      processedAt: p.processedAt,
      isDeductiblePayment: p.isDeductiblePayment,
    })),
  });
});

// Customer-facing online payment action
productionBillingRouter.post('/portal/invoices/:id/pay', (req: Request, res: Response) => {
  const db = getDatabase();
  const ctx = getContext(req);
  const invoice = (db.invoices || []).find((i) => i.id === req.params.id);
  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  const { paymentMethod = 'CREDIT_CARD', amount } = req.body;
  const payAmount = amount ? Number(amount) : invoice.balance;

  if (payAmount <= 0) {
    return res.status(400).json({ error: 'No outstanding balance on this invoice' });
  }

  const now = new Date().toISOString();
  const count = (db.payments || []).length + 1;
  const receiptNumber = `PORTAL-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

  const newPayment: Payment = {
    id: generateId('pay'),
    projectId: invoice.projectId,
    customerId: invoice.customerId,
    invoiceId: invoice.id,
    amount: payAmount,
    currency: 'USD',
    paymentMethod,
    status: 'PAID',
    receiptNumber,
    processedAt: now,
    notes: 'Homeowner Portal Online Payment Confirmation',
    createdAt: now,
    updatedAt: now,
  };

  if (!db.payments) db.payments = [];
  db.payments.unshift(newPayment);

  invoice.amountPaid = (invoice.amountPaid || 0) + payAmount;
  invoice.balance = Math.max(0, invoice.amountDue - invoice.amountPaid);
  if (invoice.balance <= 0) {
    invoice.status = 'PAID';
    invoice.paidAt = now;
  } else {
    invoice.status = 'PARTIALLY_PAID';
  }
  invoice.updatedAt = now;

  persistDatabase();

  logAuditAction({
    userId: ctx.userId,
    userRole: 'HOMEOWNER',
    action: 'CREATE',
    entityType: 'PortalPayment',
    entityId: newPayment.id,
    newState: { invoiceNumber: invoice.invoiceNumber, amount: payAmount, receiptNumber },
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  emitSystemEvent({
    type: 'PAYMENT_RECEIVED',
    entityType: 'Payment',
    entityId: newPayment.id,
    data: {
      amount: payAmount,
      receiptNumber,
      invoiceNumber: invoice.invoiceNumber,
      fromPortal: true,
    },
  });

  res.json({
    success: true,
    message: `Payment of $${payAmount.toFixed(2)} processed successfully. Receipt #${receiptNumber} generated.`,
    payment: newPayment,
    invoice,
  });
});
