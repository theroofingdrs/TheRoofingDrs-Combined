import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Truck,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  Package,
  Clock,
  Printer,
  ChevronRight,
  HardHat,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { api } from '../../lib/api.ts';
import type {
  Project,
  Crew,
  Invoice,
  Payment,
  PurchaseOrder,
} from '../../../shared/types/index.ts';

interface ProjectProductionModalProps {
  project: Project;
  onClose: () => void;
  onUpdate: () => void;
}

export const ProjectProductionModal: React.FC<ProjectProductionModalProps> = ({
  project: initialProject,
  onClose,
  onUpdate,
}) => {
  const [project, setProject] = useState<Project>(initialProject);
  const [activeTab, setActiveTab] = useState<'workOrder' | 'scheduling' | 'quality' | 'compliance' | 'purchasing' | 'billing'>('workOrder');
  const [crews, setCrews] = useState<Crew[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [workOrderData, setWorkOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states for scheduling
  const [assignedCrewId, setAssignedCrewId] = useState(project.assignedCrewId || '');
  const [targetStartDate, setTargetStartDate] = useState(project.targetStartDate || '');
  const [dumpsterLocation, setDumpsterLocation] = useState(project.dumpsterLocation || 'Right driveway apron; plywood underneath rollers to protect concrete.');
  const [dumpsterDropDate, setDumpsterDropDate] = useState(project.dumpsterDropDate || '');
  const [productionNotes, setProductionNotes] = useState(project.productionNotes || '');

  // Form states for quality checklist
  const [checklist, setChecklist] = useState({
    iceAndWaterShield: project.qualityChecklist?.iceAndWaterShield || false,
    sixNailFastening: project.qualityChecklist?.sixNailFastening || false,
    continuousRidgeVent: project.qualityChecklist?.continuousRidgeVent || false,
    stepFlashing: project.qualityChecklist?.stepFlashing || false,
    magnetSweepCompleted: project.qualityChecklist?.magnetSweepCompleted || false,
  });

  // Form states for Texas HB 2102 Deductible
  const [deductibleAmount, setDeductibleAmount] = useState(project.texasHb2102DeductibleAmount || 1000);
  const [deductiblePaymentMethod, setDeductiblePaymentMethod] = useState(project.texasHb2102PaymentMethod || 'CHECK');
  const [deductibleReceipt, setDeductibleReceipt] = useState(project.texasHb2102ReceiptNumber || '');
  const [statutoryConfirmed, setStatutoryConfirmed] = useState(project.texasHb2102Verified || false);

  // Load project details, work order, invoices, and POs
  const loadProjectData = async () => {
    try {
      setLoading(true);
      const [crewsRes, woRes, invRes, payRes, poRes] = await Promise.all([
        api.getCrews(),
        api.getWorkOrder(project.id).catch(() => null),
        api.getInvoices({ projectId: project.id }),
        api.getPayments({ projectId: project.id }),
        api.getPurchaseOrders({ projectId: project.id }),
      ]);

      setCrews(crewsRes);
      if (woRes) setWorkOrderData(woRes);
      setInvoices(invRes);
      setPayments(payRes);
      setPurchaseOrders(poRes);

      if (woRes?.project) {
        setProject(woRes.project);
        setAssignedCrewId(woRes.project.assignedCrewId || '');
        setTargetStartDate(woRes.project.targetStartDate || '');
        setDumpsterLocation(woRes.project.dumpsterLocation || 'Right driveway apron; plywood underneath rollers to protect concrete.');
        setDumpsterDropDate(woRes.project.dumpsterDropDate || '');
        setProductionNotes(woRes.project.productionNotes || '');
        if (woRes.project.qualityChecklist) {
          setChecklist({
            iceAndWaterShield: woRes.project.qualityChecklist.iceAndWaterShield || false,
            sixNailFastening: woRes.project.qualityChecklist.sixNailFastening || false,
            continuousRidgeVent: woRes.project.qualityChecklist.continuousRidgeVent || false,
            stepFlashing: woRes.project.qualityChecklist.stepFlashing || false,
            magnetSweepCompleted: woRes.project.qualityChecklist.magnetSweepCompleted || false,
          });
        }
      }
    } catch (err: any) {
      console.error('Failed to load project production data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [project.id]);

  const showToast = (msg: string, isError = false) => {
    if (isError) {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 5000);
    } else {
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  // Schedule project
  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStartDate) {
      showToast('Please select a target installation date', true);
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.scheduleProject(project.id, {
        assignedCrewId: assignedCrewId || undefined,
        targetStartDate,
        dumpsterLocation,
        dumpsterDropDate: dumpsterDropDate || undefined,
        productionNotes,
      });
      setProject(res.project);
      showToast('Project successfully scheduled for installation!');
      onUpdate();
    } catch (err: any) {
      showToast(err.message || 'Failed to schedule project', true);
    } finally {
      setActionLoading(false);
    }
  };

  // Start Production
  const handleStartProduction = async () => {
    setActionLoading(true);
    try {
      const res = await api.startProduction(project.id);
      setProject(res.project);
      showToast('Installation officially in progress!');
      onUpdate();
    } catch (err: any) {
      showToast(err.message || 'Failed to start production', true);
    } finally {
      setActionLoading(false);
    }
  };

  // Update Quality Checklist
  const handleSaveChecklist = async () => {
    setActionLoading(true);
    try {
      const res = await api.updateQualityChecklist(project.id, {
        ...checklist,
        verifiedBy: 'Current Inspector / Foreman',
      });
      setProject(res.project);
      const allDone = Object.values(checklist).every(Boolean);
      showToast(allDone ? '5-Point Checklist verified! Project advanced to QC stage.' : 'Checklist updated.');
      onUpdate();
    } catch (err: any) {
      showToast(err.message || 'Failed to update quality checklist', true);
    } finally {
      setActionLoading(false);
    }
  };

  // Complete Project
  const handleCompleteProject = async () => {
    if (!window.confirm('Are you sure you want to mark this project COMPLETED? This locks construction and prepares warranty release.')) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.completeProject(project.id);
      setProject(res.project);
      showToast('Project marked as COMPLETED! Warranty certificates ready.');
      onUpdate();
    } catch (err: any) {
      showToast(err.message || 'Failed to complete project', true);
    } finally {
      setActionLoading(false);
    }
  };

  // Texas HB 2102 Verification
  const handleVerifyDeductible = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statutoryConfirmed) {
      showToast('You must check the statutory declaration confirming deductible payment without rebate or waiver.', true);
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.verifyTexasHb2102Deductible(project.id, {
        deductibleAmount: Number(deductibleAmount),
        paymentMethod: deductiblePaymentMethod,
        receiptNumber: deductibleReceipt || undefined,
        homeownerConfirmed: statutoryConfirmed,
        notes: 'Texas HB 2102 Verified: Paid in full by homeowner without contractor absorption.',
      });
      setProject(res.project);
      showToast('Texas HB 2102 Deductible verified & legal receipt recorded!');
      await loadProjectData();
      onUpdate();
    } catch (err: any) {
      showToast(err.message || 'Failed to verify deductible', true);
    } finally {
      setActionLoading(false);
    }
  };

  // Generate 3-Milestone Invoices
  const handleGenerateMilestones = async () => {
    setActionLoading(true);
    try {
      const res = await api.generateMilestoneInvoices({
        projectId: project.id,
        depositPercentage: 50,
        includeDeductible: Boolean(project.insuranceClaimFlag),
        deductibleAmount: Number(deductibleAmount),
      });
      showToast(res.message);
      await loadProjectData();
      onUpdate();
    } catch (err: any) {
      showToast(err.message || 'Failed to generate milestone invoices', true);
    } finally {
      setActionLoading(false);
    }
  };

  // Auto-generate Purchase Order
  const handleGeneratePO = async () => {
    setActionLoading(true);
    try {
      const res = await api.generateProjectPO(project.id);
      showToast(res.message);
      await loadProjectData();
      onUpdate();
    } catch (err: any) {
      showToast(err.message || 'Failed to generate purchase order', true);
    } finally {
      setActionLoading(false);
    }
  };

  // Print Work Order
  const handlePrintWorkOrder = () => {
    window.print();
  };

  const currentCrew = crews.find((c) => c.id === project.assignedCrewId);
  const allChecklistItemsComplete = Object.values(checklist).every(Boolean);

  const statusColors: Record<string, string> = {
    SOLD: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    PRE_PRODUCTION: 'bg-amber-100 text-amber-800 border-amber-200',
    SCHEDULED: 'bg-blue-100 text-blue-800 border-blue-200',
    IN_PROGRESS: 'bg-purple-100 text-purple-800 border-purple-200',
    QC: 'bg-orange-100 text-orange-800 border-orange-200',
    COMPLETED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold shadow-xs">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">{project.title}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColors[project.status] || 'bg-slate-100 text-slate-700'}`}>
                  {project.status}
                </span>
                {project.texasHb2102Verified && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>HB 2102 Verified</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Work Order: <span className="font-mono font-semibold text-slate-700">{project.workOrderNumber || 'WO-PENDING'}</span> &bull; Contract Value:{' '}
                <span className="font-bold text-slate-900">${(project.totalContractValue || 0).toLocaleString()}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintWorkOrder}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
              title="Print Work Order"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Messages */}
        {successMessage && (
          <div className="px-6 py-2.5 bg-emerald-50 border-b border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="px-6 py-2.5 bg-red-50 border-b border-red-200 text-xs font-semibold text-red-800 flex items-center gap-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 bg-white flex items-center gap-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('workOrder')}
            className={`px-3 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'workOrder' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Work Order &amp; Spec</span>
          </button>
          <button
            onClick={() => setActiveTab('scheduling')}
            className={`px-3 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'scheduling' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Crew &amp; Logistics</span>
          </button>
          <button
            onClick={() => setActiveTab('quality')}
            className={`px-3 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'quality' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>5-Point QC Checklist</span>
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`px-3 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'compliance' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Texas HB 2102 Deductible</span>
          </button>
          <button
            onClick={() => setActiveTab('purchasing')}
            className={`px-3 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'purchasing' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Materials &amp; POs ({purchaseOrders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`px-3 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'billing' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Invoices &amp; Payments ({invoices.length})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: WORK ORDER & SPEC */}
          {activeTab === 'workOrder' && (
            <div className="space-y-6">
              {/* Quick Status Progression Ribbon */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Production Pipeline</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${project.status === 'SOLD' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'}`}>1. Sold</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${project.status === 'SCHEDULED' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>2. Scheduled</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${project.status === 'IN_PROGRESS' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-700'}`}>3. In Progress</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${project.status === 'QC' ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-700'}`}>4. 5-Point QC</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${project.status === 'COMPLETED' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`}>5. Completed</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {project.status === 'SCHEDULED' && (
                    <button
                      onClick={handleStartProduction}
                      disabled={actionLoading}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <HardHat className="w-3.5 h-3.5" />
                      <span>Start Tear-Off / Production</span>
                    </button>
                  )}
                  {(project.status === 'IN_PROGRESS' || project.status === 'QC') && allChecklistItemsComplete && (
                    <button
                      onClick={handleCompleteProject}
                      disabled={actionLoading}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Project Complete</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Work Order Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Homeowner & Property */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-red-600" />
                    <span>Jobsite &amp; Homeowner</span>
                  </h4>
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      {workOrderData?.customer ? `${workOrderData.customer.firstName} ${workOrderData.customer.lastName}` : 'Homeowner'}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">{workOrderData?.customer?.phone || '(903) 555-0199'}</div>
                    <div className="text-xs text-slate-500">{workOrderData?.customer?.email || 'homeowner@example.com'}</div>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Installation Address</span>
                    <span className="text-xs text-slate-800 font-medium block mt-0.5">
                      {workOrderData?.property?.address || '1204 Pinecrest Drive'}
                    </span>
                    <span className="text-xs text-slate-500">
                      {workOrderData?.property?.city || 'Texarkana'}, {workOrderData?.property?.state || 'TX'} {workOrderData?.property?.zip || '75503'}
                    </span>
                  </div>
                </div>

                {/* Roof Specs from Aerial ROOFR / Scope */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <HardHat className="w-3.5 h-3.5 text-blue-600" />
                    <span>Roof Engineering Spec</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Total Pitch &amp; Area</span>
                      <span className="font-bold text-slate-900">{workOrderData?.roof?.squares || 32.5} SQ</span>
                      <span className="text-[10px] text-slate-500 block">Pitch: {workOrderData?.roof?.pitch || '6/12'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">System Spec</span>
                      <span className="font-bold text-slate-900">{workOrderData?.roof?.roofingSystem || 'Architectural Shingle'}</span>
                      <span className="text-[10px] text-slate-500 block">Brand: {workOrderData?.roof?.manufacturer || 'Owens Corning'}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 text-xs">
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Approved Shingle Color</span>
                    <span className="font-semibold text-slate-800">{workOrderData?.roof?.color || 'Estate Gray (Architectural)'}</span>
                  </div>
                </div>

                {/* Assigned Crew & Foreman */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Field Dispatch</span>
                  </h4>
                  {currentCrew ? (
                    <div>
                      <div className="text-sm font-bold text-slate-900">{currentCrew.name}</div>
                      <div className="text-xs text-slate-600 mt-0.5">Lead Foreman: {currentCrew.leadForemanName}</div>
                      <div className="text-xs text-slate-500">Foreman Phone: {currentCrew.phone}</div>
                      <div className="mt-2 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block font-semibold">
                        Workers' Comp Verified &bull; Exp: {currentCrew.insuranceExpiryDate || '2027'}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                      No installation crew assigned yet. Click "Crew &amp; Logistics" to assign.
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-100 text-xs">
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Scheduled Install Date</span>
                    <span className="font-bold text-slate-900">{project.targetStartDate || 'Unscheduled'}</span>
                  </div>
                </div>
              </div>

              {/* Safety & Jobsite Hazard Briefing */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs space-y-2 text-amber-900">
                <div className="flex items-center gap-1.5 font-bold text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Jobsite Safety &amp; Protection Protocol</span>
                </div>
                <p className="text-amber-800 leading-relaxed">
                  Dumpster location must be verified before delivery. Plywood must be placed beneath all roll-off dumpster steel wheels to avoid driveway crack liability. Magnetic nail sweep is MANDATORY across all turf and walkways twice daily.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: SCHEDULING & LOGISTICS */}
          {activeTab === 'scheduling' && (
            <form onSubmit={handleSaveSchedule} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-red-600" />
                    <span>Crew Assignment &amp; Start Date</span>
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Installation Crew</label>
                    <select
                      value={assignedCrewId}
                      onChange={(e) => setAssignedCrewId(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">-- Select Roofing Crew --</option>
                      {crews.map((cr) => (
                        <option key={cr.id} value={cr.id}>
                          {cr.name} — Foreman: {cr.leadForemanName} ({cr.crewSize} Workers)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Target Installation Date *</label>
                    <input
                      type="date"
                      value={targetStartDate}
                      onChange={(e) => setTargetStartDate(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Standard tear-off and dry-in commences at 7:00 AM CST.</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span>Dumpster &amp; Waste Logistics</span>
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Dumpster Drop Date</label>
                    <input
                      type="date"
                      value={dumpsterDropDate}
                      onChange={(e) => setDumpsterDropDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Delivered late afternoon prior to installation day.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Dumpster Placement Instructions</label>
                    <input
                      type="text"
                      value={dumpsterLocation}
                      onChange={(e) => setDumpsterLocation(e.target.value)}
                      placeholder="e.g. Right driveway apron, plywood under wheels"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Production &amp; Safety Hazard Notes</label>
                <textarea
                  value={productionNotes}
                  onChange={(e) => setProductionNotes(e.target.value)}
                  rows={3}
                  placeholder="Special instructions regarding pets, delicate landscaping, overhead power lines, or steep pitch harness setup..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Save &amp; Schedule Project</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: 5-POINT QUALITY CHECKLIST */}
          {activeTab === 'quality' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>The Roof Doctors 5-Point Diagnostic Quality Audit</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mandatory field supervisor sign-off ensuring 130 MPH high-wind warranty compliance and zero leftover nails.
                </p>
              </div>

              <div className="space-y-3">
                {/* 1 */}
                <label className="flex items-start gap-3 p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={checklist.iceAndWaterShield}
                    onChange={(e) => setChecklist({ ...checklist, iceAndWaterShield: e.target.checked })}
                    className="mt-0.5 w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">1. Ice &amp; Water Shield in Valleys &amp; Penetrations</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Self-adhering membrane installed minimum 36" wide in all valleys, around all pipe boots, and along eaves.
                    </p>
                  </div>
                </label>

                {/* 2 */}
                <label className="flex items-start gap-3 p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={checklist.sixNailFastening}
                    onChange={(e) => setChecklist({ ...checklist, sixNailFastening: e.target.checked })}
                    className="mt-0.5 w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">2. 6-Nail Enhanced Fastening Pattern</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Strict 6 nails per shingle in nail zone for 130 MPH maximum wind resistance warranty qualification.
                    </p>
                  </div>
                </label>

                {/* 3 */}
                <label className="flex items-start gap-3 p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={checklist.continuousRidgeVent}
                    onChange={(e) => setChecklist({ ...checklist, continuousRidgeVent: e.target.checked })}
                    className="mt-0.5 w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">3. Continuous Shingle-Over Ridge Vent Unobstructed</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Slot cut clean 2-3 inches, external baffle clear, capped with matching Owens Corning ProEdge shingles.
                    </p>
                  </div>
                </label>

                {/* 4 */}
                <label className="flex items-start gap-3 p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={checklist.stepFlashing}
                    onChange={(e) => setChecklist({ ...checklist, stepFlashing: e.target.checked })}
                    className="mt-0.5 w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">4. Sidewall Step Flashing &amp; Counter Flashing Replaced</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      No reused rusted tin. Heavy-duty aluminum step flashing interwoven with every shingle course.
                    </p>
                  </div>
                </label>

                {/* 5 */}
                <label className="flex items-start gap-3 p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={checklist.magnetSweepCompleted}
                    onChange={(e) => setChecklist({ ...checklist, magnetSweepCompleted: e.target.checked })}
                    className="mt-0.5 w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">5. Multi-Pass Magnetic Nail Sweep Verification</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Front, side, and rear yard, driveway aprons, and flowerbeds thoroughly swept with commercial wheeled magnets.
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-slate-500">
                  {allChecklistItemsComplete ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      All 5 checkpoints satisfied. Ready for final project closeout.
                    </span>
                  ) : (
                    <span>Check off verified items as installation progresses.</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSaveChecklist}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Update Quality Checklist</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: TEXAS HB 2102 DEDUCTIBLE COMPLIANCE */}
          {activeTab === 'compliance' && (
            <div className="space-y-6">
              {/* Statutory Alert Banner */}
              <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-5 space-y-3 text-blue-950">
                <div className="flex items-center gap-2 font-bold text-sm text-blue-900">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <span>Texas Insurance Code Chapter 707 (HB 2102) Statutory Compliance</span>
                </div>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Under Texas law effective September 1, 2019, an insured homeowner is required to pay their property insurance deductible in full. It is a criminal offense (Class B misdemeanor) for a roofing contractor to pay, waive, rebate, or absorb a deductible, or to provide advertising promising "free roofs" or "deductible forgiveness".
                </p>
                <div className="text-[11px] font-semibold text-blue-900 bg-white/70 p-2.5 rounded-lg border border-blue-200/60">
                  "A person who sells goods or services to an insured under a property insurance policy may not pay, waive, rebate, or promise to pay, waive, or rebate any part of an insurance deductible." &mdash; Tex. Ins. Code &sect; 707.006
                </div>
              </div>

              {/* Status card */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Compliance Audit Status</span>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {project.texasHb2102Verified ? (
                      <span className="text-emerald-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Deductible Legally Verified (${(project.texasHb2102DeductibleAmount || 0).toLocaleString()} via {project.texasHb2102PaymentMethod})
                      </span>
                    ) : (
                      <span className="text-amber-700 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-600" />
                        Verification Pending &mdash; Proof of Deductible Payment Required Before Depreciation Release
                      </span>
                    )}
                  </div>
                  {project.texasHb2102ReceiptNumber && (
                    <span className="text-xs text-slate-500 font-mono mt-0.5 block">
                      Receipt #: {project.texasHb2102ReceiptNumber} &bull; Verified: {project.texasHb2102VerifiedDate?.split('T')[0]}
                    </span>
                  )}
                </div>
              </div>

              {/* Verification Form */}
              <form onSubmit={handleVerifyDeductible} className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Record Statutory Deductible Verification</h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Deductible Amount ($) *</label>
                    <input
                      type="number"
                      value={deductibleAmount}
                      onChange={(e) => setDeductibleAmount(Number(e.target.value))}
                      required
                      min={100}
                      step={50}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method *</label>
                    <select
                      value={deductiblePaymentMethod}
                      onChange={(e) => setDeductiblePaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="CHECK">Homeowner Check</option>
                      <option value="CREDIT_CARD">Credit / Debit Card</option>
                      <option value="ACH">Bank Electronic ACH</option>
                      <option value="FINANCING">Approved Homeowner Financing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Check / Receipt Number</label>
                    <input
                      type="text"
                      value={deductibleReceipt}
                      onChange={(e) => setDeductibleReceipt(e.target.value)}
                      placeholder="e.g. CHK-4091 or REC-2026-001"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <label className="flex items-start gap-2.5 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={statutoryConfirmed}
                    onChange={(e) => setStatutoryConfirmed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300"
                  />
                  <span className="text-[11px] text-slate-700 font-medium">
                    I confirm that the homeowner has paid this deductible in full from personal funds, that no rebate, waiver, or credit was offered or absorbed by The Roof Doctors, and that this receipt will be furnished to the insurance carrier upon depreciation release request.
                  </span>
                </label>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify Deductible &amp; Record Legal Proof</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 5: PURCHASING & ROOFTOP DELIVERY */}
          {activeTab === 'purchasing' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Package className="w-4 h-4 text-red-600" />
                    <span>Supplier Purchase Orders &amp; Rooftop Deliveries</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Orders direct from ABC Supply (Texarkana), Beacon (Tyler), or SRS (Longview) with conveyor rooftop delivery.
                  </p>
                </div>

                <button
                  onClick={handleGeneratePO}
                  disabled={actionLoading}
                  className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auto-Generate Rooftop PO (ABC Supply)</span>
                </button>
              </div>

              {purchaseOrders.length === 0 ? (
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 text-center space-y-3">
                  <Package className="w-10 h-10 text-slate-400 mx-auto" />
                  <div className="text-sm font-bold text-slate-800">No Purchase Orders Created Yet</div>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Click "Auto-Generate Rooftop PO" to calculate shingle bundles, underlayment rolls, starter strip, and ridge vent from this project's roof measurements.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {purchaseOrders.map((po) => (
                    <div key={po.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-slate-900">{po.poNumber}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              po.status === 'DELIVERED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : po.status === 'ORDERED'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}>
                              {po.status}
                            </span>
                            {po.rooftopDelivery && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                                <Truck className="w-3 h-3" />
                                <span>Rooftop Conveyor Delivery</span>
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 mt-0.5 block">
                            Supplier: ABC Supply Co. &bull; Delivery Target: {po.deliveryDate || 'Scheduled'}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-slate-400 block">Total Material Cost</span>
                          <span className="text-base font-black text-slate-900">${(po.totalCost || 0).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Line items list */}
                      {po.items && po.items.length > 0 && (
                        <div className="bg-slate-50 rounded-lg p-3 space-y-1.5 text-xs">
                          {po.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between items-center text-slate-700">
                              <span>
                                {it.quantity} {it.unit} &times; {it.description}
                              </span>
                              <span className="font-mono font-semibold">${(it.totalCost || 0).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Delivery Instructions */}
                      {po.deliveryInstructions && (
                        <div className="text-[11px] text-slate-600 bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/60">
                          <span className="font-bold text-amber-900">Rooftop Dispatch Note: </span>
                          {po.deliveryInstructions}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-2 pt-1">
                        {po.status === 'DRAFT' && (
                          <button
                            onClick={async () => {
                              const conf = prompt('Enter Supplier Confirmation / Order #:', `ABC-${Date.now().toString().slice(-5)}`);
                              if (!conf) return;
                              await api.orderPurchaseOrder(po.id, { supplierConfirmationNumber: conf });
                              showToast('PO marked as ORDERED with supplier confirmation.');
                              loadProjectData();
                            }}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                          >
                            Mark Ordered &amp; Transmit to ABC Supply
                          </button>
                        )}
                        {po.status === 'ORDERED' && (
                          <button
                            onClick={async () => {
                              await api.deliverPurchaseOrder(po.id);
                              showToast('PO marked as DELIVERED directly to roof ridge.');
                              loadProjectData();
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                          >
                            Confirm Rooftop Delivery Received
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: BILLING, INVOICES & PAYMENTS */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>Milestone Invoices &amp; Homeowner Receipts</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Deposit advance, material drop progress, deductible receipt, and final depreciation release.
                  </p>
                </div>

                {invoices.length === 0 && (
                  <button
                    onClick={handleGenerateMilestones}
                    disabled={actionLoading}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Standard 3-Milestone Invoices</span>
                  </button>
                )}
              </div>

              {/* Invoices List */}
              {invoices.length === 0 ? (
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 text-center space-y-3">
                  <DollarSign className="w-10 h-10 text-slate-400 mx-auto" />
                  <div className="text-sm font-bold text-slate-800">No Invoices Issued Yet</div>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Click "Generate Standard 3-Milestone Invoices" to create deposit (50%), progress (30%), and completion (20%) invoices with Texas HB 2102 statutory language.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {invoices.map((inv) => (
                    <div key={inv.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-slate-900">{inv.invoiceNumber}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              inv.status === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : inv.status === 'ISSUED'
                                ? 'bg-blue-100 text-blue-800'
                                : inv.status === 'PARTIALLY_PAID'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}>
                              {inv.status}
                            </span>
                            <span className="text-xs font-bold text-slate-700">{inv.title}</span>
                          </div>
                          <span className="text-xs text-slate-500 mt-0.5 block">
                            Milestone: {inv.milestoneType} &bull; Due Date: {inv.dueDate}
                          </span>
                        </div>

                        <div className="text-right">
                          <div className="text-xs text-slate-400">Balance / Amount Due</div>
                          <div className="text-base font-black text-slate-900">
                            ${(inv.balance || 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">/ ${(inv.amountDue || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Items */}
                      {inv.items && (
                        <div className="bg-slate-50 rounded-lg p-3 text-xs space-y-1">
                          {inv.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between text-slate-700">
                              <span>{it.description}</span>
                              <span className="font-semibold">${(it.total || 0).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Notes / Statutory declaration */}
                      {inv.notes && <div className="text-[11px] text-slate-500 italic">{inv.notes}</div>}

                      {/* Action buttons */}
                      <div className="flex items-center justify-end gap-2 pt-1">
                        {inv.status === 'DRAFT' && (
                          <button
                            onClick={async () => {
                              await api.issueInvoice(inv.id);
                              showToast(`Invoice ${inv.invoiceNumber} issued to homeowner.`);
                              loadProjectData();
                            }}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                          >
                            Issue to Customer
                          </button>
                        )}
                        {inv.status !== 'PAID' && inv.balance > 0 && (
                          <button
                            onClick={async () => {
                              const payMethod = prompt('Enter payment method (CHECK, CREDIT_CARD, ACH, INSURANCE_CHECK):', 'CHECK');
                              if (!payMethod) return;
                              const amt = prompt('Enter payment amount ($):', String(inv.balance));
                              if (!amt) return;
                              await api.recordPayment({
                                projectId: project.id,
                                customerId: project.customerId,
                                invoiceId: inv.id,
                                amount: Number(amt),
                                paymentMethod: payMethod,
                                notes: `Payment applied to ${inv.invoiceNumber}`,
                              });
                              showToast(`Recorded $${amt} payment on invoice ${inv.invoiceNumber}!`);
                              loadProjectData();
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Record Payment</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Customer ID: <span className="font-mono text-slate-700">{project.customerId}</span></span>
            <span>&bull;</span>
            <span>Texas HB 2102 Compliant: <strong className={project.texasHb2102Verified ? 'text-emerald-700' : 'text-amber-700'}>{project.texasHb2102Verified ? 'YES' : 'PENDING'}</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
