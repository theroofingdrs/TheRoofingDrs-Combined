import React, { useState, useEffect, useMemo } from 'react';
import type {
  Estimate,
  EstimateLineItem,
  Customer,
  Property,
  RoofRecord,
  Inspection,
  Measurement,
  Integration,
} from '../../../shared/types/index.ts';
import { api } from '../../lib/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Send,
  XCircle,
  Edit3,
  Trash2,
  ArrowUp,
  ArrowDown,
  Ruler,
  AlertTriangle,
  History,
  DollarSign,
  Layers,
  ChevronRight,
  Home,
  User,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Info,
} from 'lucide-react';

interface EstimateWorkspaceProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
  customers: Customer[];
  properties: Property[];
  roofRecords?: RoofRecord[];
  inspections: Inspection[];
  measurements: Measurement[];
  integrations?: Integration[];
  onCreateProposalFromEstimate?: (estimate: Estimate) => void;
}

export const EstimateWorkspace: React.FC<EstimateWorkspaceProps> = ({
  currentPath = '/app/estimates',
  onNavigate,
  customers,
  properties,
  roofRecords = [],
  inspections,
  measurements,
  integrations = [],
  onCreateProposalFromEstimate,
}) => {
  const { currentUser, hasPermission } = useAuth();
  const canViewFinancials =
    currentUser?.role &&
    ['OWNER', 'ADMIN', 'ADMINISTRATOR', 'EXECUTIVE', 'SALES', 'SALES_MANAGER', 'OFFICE', 'PROJECT_MANAGER'].includes(
      currentUser.role.toUpperCase()
    );

  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedEstimateId, setSelectedEstimateId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Form State for Active Estimate Editor
  const [activeEstimate, setActiveEstimate] = useState<Estimate | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  // New Estimate Form State
  const [newEstimateCustomerId, setNewEstimateCustomerId] = useState('');
  const [newEstimatePropertyId, setNewEstimatePropertyId] = useState('');
  const [newEstimateInspectionId, setNewEstimateInspectionId] = useState('');
  const [newEstimateMeasurementId, setNewEstimateMeasurementId] = useState('');
  const [newEstimateTitle, setNewEstimateTitle] = useState('Roof Replacement & Storm Restoration');

  // Check if ROOFR integration is connected
  const roofrIntegration = integrations.find((i) => i.provider === 'ROOFR');
  const isRoofrConnected = roofrIntegration?.status === 'CONNECTED';

  // Load Estimates
  const loadEstimates = async () => {
    setLoading(true);
    try {
      const data = await api.getEstimates();
      setEstimates(data);
    } catch (err: any) {
      console.error('Failed to load estimates:', err);
      setFeedbackMessage({ type: 'error', text: 'Failed to load estimates.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEstimates();
  }, []);

  // Sync with URL route parameter if path contains /app/estimates/:id
  useEffect(() => {
    if (currentPath && currentPath.startsWith('/app/estimates/')) {
      const id = currentPath.replace('/app/estimates/', '').trim();
      if (id && id !== 'new') {
        setSelectedEstimateId(id);
      }
    }
  }, [currentPath]);

  // Load full detail when an estimate is selected
  useEffect(() => {
    if (!selectedEstimateId) {
      setActiveEstimate(null);
      return;
    }
    const found = estimates.find((e) => e.id === selectedEstimateId);
    if (found) {
      setActiveEstimate(JSON.parse(JSON.stringify(found)));
    } else {
      api.getEstimate(selectedEstimateId)
        .then((est) => setActiveEstimate(est))
        .catch(() => setFeedbackMessage({ type: 'error', text: 'Estimate not found.' }));
    }
  }, [selectedEstimateId, estimates]);

  // Recalculate local totals for active estimate
  const recalculateActiveTotals = (lineItems: EstimateLineItem[], taxRate = 0.0825, discounts = 0, adjustments = 0) => {
    const subtotal = Math.round(lineItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0) * 100) / 100;
    const taxableSubtotal = Math.round(
      lineItems.filter((i) => i.taxable !== false).reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0) * 100
    ) / 100;
    const netTaxable = Math.max(0, taxableSubtotal - discounts + adjustments);
    const tax = Math.round(netTaxable * taxRate * 100) / 100;
    const total = Math.max(0, Math.round((subtotal - discounts + adjustments + tax) * 100) / 100);

    const internalCost = Math.round(
      lineItems.reduce((acc, item) => acc + (item.quantity * (item.internalUnitCost || 0)), 0) * 100
    ) / 100;
    const grossProfit = Math.round((total - tax - internalCost) * 100) / 100;
    const margin = total - tax > 0 ? Math.round((grossProfit / (total - tax)) * 1000) / 10 : 0;

    return { subtotal, tax, total, internalCost, estimatedGrossProfit: grossProfit, estimatedMargin: margin };
  };

  // Line item handlers
  const handleAddLineItem = () => {
    if (!activeEstimate) return;
    const newItem: EstimateLineItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      estimateId: activeEstimate.id,
      description: 'Architectural Shingles (GAF Timberline HDZ)',
      category: 'ROOFING',
      quantity: 25,
      unit: 'SQ',
      unitPrice: 385,
      totalPrice: 25 * 385,
      internalUnitCost: 210,
      internalExtendedCost: 25 * 210,
      margin: 45.4,
      taxable: true,
      sortOrder: (activeEstimate.lineItems?.length || 0) + 1,
    };

    const updatedItems = [...(activeEstimate.lineItems || []), newItem];
    const calc = recalculateActiveTotals(
      updatedItems,
      activeEstimate.taxRate,
      activeEstimate.discounts,
      activeEstimate.adjustments
    );

    setActiveEstimate({
      ...activeEstimate,
      lineItems: updatedItems,
      ...calc,
    });
  };

  const handleUpdateLineItem = (id: string, updates: Partial<EstimateLineItem>) => {
    if (!activeEstimate) return;
    const updatedItems = (activeEstimate.lineItems || []).map((item) => {
      if (item.id !== id) return item;
      const merged = { ...item, ...updates };
      merged.totalPrice = Math.round(merged.quantity * merged.unitPrice * 100) / 100;
      if (merged.internalUnitCost !== undefined) {
        merged.internalExtendedCost = Math.round(merged.quantity * merged.internalUnitCost * 100) / 100;
      }
      return merged;
    });

    const calc = recalculateActiveTotals(
      updatedItems,
      activeEstimate.taxRate,
      activeEstimate.discounts,
      activeEstimate.adjustments
    );

    setActiveEstimate({
      ...activeEstimate,
      lineItems: updatedItems,
      ...calc,
    });
  };

  const handleDeleteLineItem = (id: string) => {
    if (!activeEstimate) return;
    const updatedItems = (activeEstimate.lineItems || []).filter((item) => item.id !== id);
    const calc = recalculateActiveTotals(
      updatedItems,
      activeEstimate.taxRate,
      activeEstimate.discounts,
      activeEstimate.adjustments
    );

    setActiveEstimate({
      ...activeEstimate,
      lineItems: updatedItems,
      ...calc,
    });
  };

  const handleMoveLineItem = (index: number, direction: 'up' | 'down') => {
    if (!activeEstimate || !activeEstimate.lineItems) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= activeEstimate.lineItems.length) return;

    const items = [...activeEstimate.lineItems];
    const temp = items[index];
    items[index] = items[targetIndex];
    items[targetIndex] = temp;

    // re-index sortOrder
    const reindexed = items.map((it, idx) => ({ ...it, sortOrder: idx + 1 }));
    setActiveEstimate({ ...activeEstimate, lineItems: reindexed });
  };

  // Save changes to server
  const handleSaveEstimate = async () => {
    if (!activeEstimate) return;
    setIsSaving(true);
    try {
      const updated = await api.updateEstimate(activeEstimate.id, {
        title: activeEstimate.title,
        lineItems: activeEstimate.lineItems,
        notes: activeEstimate.notes,
        customerNotes: activeEstimate.customerNotes,
        internalNotes: activeEstimate.internalNotes,
        discounts: activeEstimate.discounts,
        adjustments: activeEstimate.adjustments,
        taxRate: activeEstimate.taxRate,
        measurementId: activeEstimate.measurementId,
        measurementProvenance: activeEstimate.measurementProvenance,
      });

      setActiveEstimate(updated);
      await loadEstimates();
      setFeedbackMessage({ type: 'success', text: `Estimate ${updated.estimateNumber} saved successfully.` });
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Failed to save estimate.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Approve Estimate
  const handleApproveEstimate = async () => {
    if (!activeEstimate) return;
    setIsSaving(true);
    try {
      const approved = await api.approveEstimate(activeEstimate.id);
      setActiveEstimate(approved);
      await loadEstimates();
      setFeedbackMessage({
        type: 'success',
        text: `Estimate ${approved.estimateNumber} approved! Ready to generate formal customer proposal.`,
      });
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Failed to approve estimate.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Create Proposal directly from this estimate
  const handleCreateProposal = () => {
    if (!activeEstimate) return;
    if (onCreateProposalFromEstimate) {
      onCreateProposalFromEstimate(activeEstimate);
    } else if (onNavigate) {
      onNavigate(`/app/proposals?newFromEstimate=${activeEstimate.id}`);
    }
  };

  // Create Brand New Estimate
  const handleCreateNewEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEstimateCustomerId || !newEstimatePropertyId) {
      setFeedbackMessage({ type: 'error', text: 'Please select both a Customer and a Property.' });
      return;
    }

    setIsSaving(true);
    try {
      // Pre-fill initial line items based on measurement if available
      const measurement = measurements.find((m) => m.id === newEstimateMeasurementId);
      const squares = measurement?.normalizedData?.totalSquares || 28;

      const initialLineItems: Partial<EstimateLineItem>[] = [
        {
          description: 'Roof Tear-Off: Complete removal of existing shingle layers and felt down to wood deck',
          category: 'LABOR',
          quantity: squares,
          unit: 'SQ',
          unitPrice: 55,
          internalUnitCost: 32,
          taxable: false,
        },
        {
          description: 'Synthetic Underlayment: High-traction water-resistant breathable synthetic felt',
          category: 'MATERIAL',
          quantity: squares,
          unit: 'SQ',
          unitPrice: 28,
          internalUnitCost: 14,
          taxable: true,
        },
        {
          description: 'Architectural Shingles: GAF Timberline HDZ Lifetime Shingles with LayerLock Technology',
          category: 'ROOFING',
          quantity: squares,
          unit: 'SQ',
          unitPrice: 385,
          internalUnitCost: 195,
          taxable: true,
        },
        {
          description: 'Ice & Water Shield: Self-adhering leak barrier installed in all valleys and eaves',
          category: 'MATERIAL',
          quantity: Math.ceil(squares * 0.2),
          unit: 'SQ',
          unitPrice: 95,
          internalUnitCost: 52,
          taxable: true,
        },
        {
          description: 'Ventilation & Flashing: High-profile ridge cap vents and neoprene plumbing pipe boots',
          category: 'ACCESSORIES',
          quantity: 1,
          unit: 'LS',
          unitPrice: 650,
          internalUnitCost: 280,
          taxable: true,
        },
      ];

      const created = await api.createEstimate({
        customerId: newEstimateCustomerId,
        propertyId: newEstimatePropertyId,
        inspectionId: newEstimateInspectionId || undefined,
        measurementId: newEstimateMeasurementId || undefined,
        measurementProvenance: measurement?.provenance || (measurement ? 'VERIFIED_MEASUREMENT' : undefined),
        title: newEstimateTitle.trim(),
        lineItems: initialLineItems as any,
        notes: 'Includes complete magnetic nail sweep, haul away, and 5-year The Roof Doctors workmanship guarantee.',
      });

      setIsCreatingNew(false);
      await loadEstimates();
      setSelectedEstimateId(created.id);
      setFeedbackMessage({ type: 'success', text: `New Estimate #${created.estimateNumber} created successfully!` });
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Failed to create estimate.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered estimates list
  const filteredEstimates = useMemo(() => {
    return estimates.filter((e) => {
      const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const customer = customers.find((c) => c.id === e.customerId);
      const property = properties.find((p) => p.id === e.propertyId);

      const matchesSearch =
        !q ||
        e.estimateNumber.toLowerCase().includes(q) ||
        e.title.toLowerCase().includes(q) ||
        (customer && `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(q)) ||
        (property && property.address.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [estimates, statusFilter, searchQuery, customers, properties]);

  // Selected details
  const activeCustomer = customers.find((c) => c.id === activeEstimate?.customerId);
  const activeProperty = properties.find((p) => p.id === activeEstimate?.propertyId);
  const activeMeasurement = measurements.find((m) => m.id === activeEstimate?.measurementId);
  const activeInspection = inspections.find((i) => i.id === activeEstimate?.inspectionId);

  // Status Badge Component
  const renderStatusBadge = (status: Estimate['status']) => {
    switch (status) {
      case 'DRAFT':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">DRAFT</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> APPROVED</span>;
      case 'SENT':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1"><Send className="w-3 h-3" /> SENT</span>;
      case 'ACCEPTED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300 font-black flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> ACCEPTED / SOLD</span>;
      case 'DECLINED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">DECLINED</span>;
      case 'REVISED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1"><History className="w-3 h-3" /> REVISED (v{activeEstimate?.version || 2})</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-600" />
              <span>Estimates &amp; Scopes of Work</span>
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono font-bold">
              {estimates.length} Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Surgical calculation engine connecting Diagnostic Inspections and Aerial Measurements into precision estimates.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadEstimates}
            disabled={loading}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh Estimates"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              setIsCreatingNew(true);
              setSelectedEstimateId(null);
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Estimate</span>
          </button>
        </div>
      </div>

      {/* ROOFR Integration Status Alert */}
      {!isRoofrConnected && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900">
            <span className="font-bold">ROOFR Provider Status:</span> ROOFR aerial measurement integration is currently{' '}
            <span className="font-semibold underline">disconnected</span> in this environment. Estimates can still be generated using verified manual inspections, historical roof records, or custom measurements.
          </div>
        </div>
      )}

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between border ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : feedbackMessage.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}
        >
          <span>{feedbackMessage.text}</span>
          <button onClick={() => setFeedbackMessage(null)} className="text-xs font-bold hover:underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Workspace Layout: List (left) + Detail/Editor (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Estimates Directory */}
        <div className={`lg:col-span-4 space-y-4 ${selectedEstimateId ? 'hidden lg:block' : 'block'}`}>
          {/* Search & Filter Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-3 shadow-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search estimate #, customer, address..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-semibold no-scrollbar">
              {['ALL', 'DRAFT', 'APPROVED', 'SENT', 'ACCEPTED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    statusFilter === status
                      ? 'bg-slate-900 text-white font-bold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* List Items */}
          <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
            {filteredEstimates.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
                No estimates found matching the filter criteria.
              </div>
            ) : (
              filteredEstimates.map((est) => {
                const customer = customers.find((c) => c.id === est.customerId);
                const property = properties.find((p) => p.id === est.propertyId);
                const isSelected = est.id === selectedEstimateId;

                return (
                  <div
                    key={est.id}
                    onClick={() => {
                      setSelectedEstimateId(est.id);
                      setIsCreatingNew(false);
                      onNavigate?.(`/app/estimates/${est.id}`);
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all bg-white hover:border-slate-300 ${
                      isSelected
                        ? 'border-red-500 ring-2 ring-red-500/10 shadow-xs'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="font-mono text-[10px] font-bold text-red-600 block">
                          {est.estimateNumber}
                        </span>
                        <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{est.title}</h4>
                      </div>
                      {renderStatusBadge(est.status)}
                    </div>

                    <div className="mt-2 text-[11px] text-slate-600 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="truncate">
                          {customer ? `${customer.firstName} ${customer.lastName}` : 'Customer Not Linked'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Home className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{property ? property.address : 'Property Not Linked'}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="font-bold text-slate-900 font-mono">
                        ${est.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <span>v{est.version || 1}</span>
                        <span>•</span>
                        <span>{est.lineItems?.length || 0} items</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Estimate Editor / Detail View */}
        <div className="lg:col-span-8">
          {/* Create New Estimate Modal View */}
          {isCreatingNew && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Draft New Precision Estimate</h3>
                  <p className="text-xs text-slate-500">
                    Bind a customer and property to auto-inject aerial squares and inspection findings.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreatingNew(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateNewEstimate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Select Customer */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Customer <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newEstimateCustomerId}
                      onChange={(e) => {
                        setNewEstimateCustomerId(e.target.value);
                        // Auto-select first matching property
                        const matchingProp = properties.find((p) => p.customerId === e.target.value);
                        if (matchingProp) setNewEstimatePropertyId(matchingProp.id);
                      }}
                      required
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                    >
                      <option value="">-- Select Customer --</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.firstName} {c.lastName} ({c.phone || c.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Property */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Property &amp; Roof Location <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newEstimatePropertyId}
                      onChange={(e) => setNewEstimatePropertyId(e.target.value)}
                      required
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                    >
                      <option value="">-- Select Property --</option>
                      {properties.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.address}, {p.city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Estimate Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estimate Title / Scope Summary</label>
                  <input
                    type="text"
                    value={newEstimateTitle}
                    onChange={(e) => setNewEstimateTitle(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>

                {/* Link Diagnostic Inspection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Link Diagnostic Inspection</label>
                    <select
                      value={newEstimateInspectionId}
                      onChange={(e) => setNewEstimateInspectionId(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                    >
                      <option value="">-- Optional (Select Completed Inspection) --</option>
                      {inspections.map((ins) => (
                        <option key={ins.id} value={ins.id}>
                          {ins.id} — {ins.inspectionType} ({ins.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Link Measurement */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Link Aerial Measurement</label>
                    <select
                      value={newEstimateMeasurementId}
                      onChange={(e) => setNewEstimateMeasurementId(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                    >
                      <option value="">-- Optional (Select Aerial Measurement) --</option>
                      {measurements.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.provider} — {m.normalizedData?.totalSquares || 0} SQ (Pitch {m.normalizedData?.predominantPitch || 'N/A'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(false)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {isSaving ? 'Creating...' : 'Initialize Estimate'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Active Estimate Detail / Editor */}
          {!isCreatingNew && activeEstimate && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-200">
              {/* Header with Title, Status & Primary Actions */}
              <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-red-600 px-2 py-0.5 bg-red-50 border border-red-200 rounded">
                      {activeEstimate.estimateNumber}
                    </span>
                    {renderStatusBadge(activeEstimate.status)}
                    <span className="text-[11px] text-slate-400 font-mono">v{activeEstimate.version || 1}</span>
                  </div>
                  <input
                    type="text"
                    value={activeEstimate.title}
                    onChange={(e) => setActiveEstimate({ ...activeEstimate, title: e.target.value })}
                    className="text-base font-bold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-red-500 focus:outline-none w-full"
                  />
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setShowVersionHistory(!showVersionHistory)}
                    className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5 text-slate-500" />
                    <span>Versions ({activeEstimate.versions?.length || 1})</span>
                  </button>

                  <button
                    onClick={handleSaveEstimate}
                    disabled={isSaving}
                    className="px-4 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                    <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
                  </button>

                  {activeEstimate.status === 'DRAFT' && (
                    <button
                      onClick={handleApproveEstimate}
                      disabled={isSaving}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve Estimate</span>
                    </button>
                  )}

                  <button
                    onClick={handleCreateProposal}
                    className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Create Proposal</span>
                  </button>
                </div>
              </div>

              {/* Version History Drawer (if opened) */}
              {showVersionHistory && (
                <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs space-y-2">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <History className="w-4 h-4 text-purple-600" />
                    <span>Estimate Revision History</span>
                  </div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {(activeEstimate.versions || []).map((ver) => (
                      <div
                        key={ver.id}
                        className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-slate-900">Version {ver.versionNumber}</span>
                          <span className="text-slate-500 ml-2">
                            {ver.createdAt ? new Date(ver.createdAt).toLocaleDateString() : 'Original'}
                          </span>
                          {ver.reasonForRevision && (
                            <span className="text-slate-400 block text-[10px] mt-0.5">{ver.reasonForRevision}</span>
                          )}
                        </div>
                        <div className="font-mono font-bold text-slate-900">${ver.total.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer, Property, Roof & Measurement Context Bar */}
              <div className="p-5 bg-slate-50/70 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                {/* Customer */}
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer</span>
                  <div className="font-bold text-slate-900">
                    {activeCustomer ? `${activeCustomer.firstName} ${activeCustomer.lastName}` : 'No Customer Linked'}
                  </div>
                  <div className="text-[11px] text-slate-500">{activeCustomer?.phone || activeCustomer?.email}</div>
                </div>

                {/* Property & Roof */}
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Property &amp; Roof</span>
                  <div className="font-bold text-slate-900">{activeProperty?.address || 'No Property Linked'}</div>
                  <div className="text-[11px] text-slate-500">
                    {activeProperty ? `${activeProperty.city}, ${activeProperty.state}` : ''}
                  </div>
                </div>

                {/* Inspection Reference */}
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Diagnostic Inspection</span>
                  <div className="font-bold text-slate-900 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{activeInspection ? activeInspection.id : 'None Linked'}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {activeInspection ? `${activeInspection.findings?.length || 0} findings recorded` : 'Unlinked'}
                  </div>
                </div>

                {/* Measurement Reference */}
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Measurement Provenance</span>
                  <div className="font-bold text-slate-900 flex items-center gap-1">
                    <Ruler className="w-3.5 h-3.5 text-blue-600" />
                    <span>
                      {activeMeasurement
                        ? `${activeMeasurement.provider} (${activeMeasurement.normalizedData?.totalSquares || 0} SQ)`
                        : 'No measurement available'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {activeMeasurement ? `Pitch: ${activeMeasurement.normalizedData?.predominantPitch || 'N/A'}` : 'Manual Entry'}
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Line Items &amp; Material Breakdown</h4>
                    <p className="text-[11px] text-slate-500">
                      Precision quantities, unit prices, and Texas HB 2102 tax calculation.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 w-10 text-center">#</th>
                        <th className="py-2.5 px-3">Description / Specification</th>
                        <th className="py-2.5 px-3 w-28">Category</th>
                        <th className="py-2.5 px-3 w-20 text-right">Qty</th>
                        <th className="py-2.5 px-3 w-16 text-center">Unit</th>
                        <th className="py-2.5 px-3 w-28 text-right">Unit Price</th>
                        {canViewFinancials && <th className="py-2.5 px-3 w-24 text-right text-purple-700">Cost</th>}
                        <th className="py-2.5 px-3 w-28 text-right">Total</th>
                        <th className="py-2.5 px-3 w-20 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(activeEstimate.lineItems || []).map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleUpdateLineItem(item.id, { description: e.target.value })}
                              className="w-full bg-transparent font-medium text-slate-900 focus:outline-none focus:bg-white focus:ring-1 focus:ring-red-400 rounded px-1"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <select
                              value={item.category || 'ROOFING'}
                              onChange={(e) => handleUpdateLineItem(item.id, { category: e.target.value as any })}
                              className="text-[11px] bg-transparent border border-transparent hover:border-slate-200 rounded px-1 py-0.5 focus:outline-none"
                            >
                              <option value="ROOFING">Roofing</option>
                              <option value="MATERIAL">Material</option>
                              <option value="LABOR">Labor</option>
                              <option value="FLASHING">Flashing</option>
                              <option value="ACCESSORIES">Accessories</option>
                              <option value="DISPOSAL">Disposal</option>
                              <option value="OTHER">Other</option>
                            </select>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <input
                              type="number"
                              step="0.01"
                              value={item.quantity}
                              onChange={(e) => handleUpdateLineItem(item.id, { quantity: Number(e.target.value) || 0 })}
                              className="w-16 text-right font-mono text-xs bg-transparent border border-transparent hover:border-slate-200 rounded px-1 focus:outline-none focus:bg-white"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="text"
                              value={item.unit}
                              onChange={(e) => handleUpdateLineItem(item.id, { unit: e.target.value.toUpperCase() })}
                              className="w-12 text-center font-mono text-[11px] bg-transparent border border-transparent hover:border-slate-200 rounded px-1 focus:outline-none"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end font-mono">
                              <span>$</span>
                              <input
                                type="number"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) => handleUpdateLineItem(item.id, { unitPrice: Number(e.target.value) || 0 })}
                                className="w-20 text-right bg-transparent border border-transparent hover:border-slate-200 rounded px-1 focus:outline-none focus:bg-white"
                              />
                            </div>
                          </td>
                          {canViewFinancials && (
                            <td className="py-2.5 px-3 text-right text-purple-700 font-mono text-[11px]">
                              ${((item.internalUnitCost || 0) * item.quantity).toFixed(2)}
                            </td>
                          )}
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">
                            ${(item.quantity * item.unitPrice).toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1 text-slate-400">
                              <button
                                type="button"
                                onClick={() => handleMoveLineItem(idx, 'up')}
                                disabled={idx === 0}
                                title="Move up"
                                className="p-1 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveLineItem(idx, 'down')}
                                disabled={idx === (activeEstimate.lineItems?.length || 1) - 1}
                                title="Move down"
                                className="p-1 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteLineItem(item.id)}
                                title="Delete item"
                                className="p-1 hover:text-red-600 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial Summary & Adjustments */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                  {/* Left: Notes & Texas HB 2102 Disclosures */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Customer Visible Notes</label>
                      <textarea
                        rows={2}
                        value={activeEstimate.customerNotes || ''}
                        onChange={(e) => setActiveEstimate({ ...activeEstimate, customerNotes: e.target.value })}
                        placeholder="Notes visible to homeowner on proposal..."
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Internal Staff Notes</label>
                      <textarea
                        rows={2}
                        value={activeEstimate.internalNotes || ''}
                        onChange={(e) => setActiveEstimate({ ...activeEstimate, internalNotes: e.target.value })}
                        placeholder="Private notes (decking condition, crew requirements, insurance deductible details)..."
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  {/* Right: Calculations Totals Box */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal:</span>
                      <span className="font-mono font-semibold">${activeEstimate.subtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span>Adjustments / Scope Credits:</span>
                      <div className="flex items-center gap-1">
                        <span>$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={activeEstimate.adjustments || 0}
                          onChange={(e) => {
                            const adj = Number(e.target.value) || 0;
                            const calc = recalculateActiveTotals(
                              activeEstimate.lineItems || [],
                              activeEstimate.taxRate,
                              activeEstimate.discounts,
                              adj
                            );
                            setActiveEstimate({ ...activeEstimate, adjustments: adj, ...calc });
                          }}
                          className="w-20 text-right font-mono bg-white border border-slate-200 rounded px-1.5 py-0.5 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span>Promotional Discount:</span>
                      <div className="flex items-center gap-1">
                        <span>$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={activeEstimate.discounts || 0}
                          onChange={(e) => {
                            const disc = Number(e.target.value) || 0;
                            const calc = recalculateActiveTotals(
                              activeEstimate.lineItems || [],
                              activeEstimate.taxRate,
                              disc,
                              activeEstimate.adjustments
                            );
                            setActiveEstimate({ ...activeEstimate, discounts: disc, ...calc });
                          }}
                          className="w-20 text-right font-mono bg-white border border-slate-200 rounded px-1.5 py-0.5 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>Texas Sales Tax (8.25%):</span>
                      <span className="font-mono font-semibold">${activeEstimate.tax.toFixed(2)}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-black text-slate-900">
                      <span>Total Investment:</span>
                      <span className="text-base font-mono text-red-600">${activeEstimate.total.toFixed(2)}</span>
                    </div>

                    {/* Financial Visibility for Staff */}
                    {canViewFinancials && (
                      <div className="mt-3 pt-3 border-t border-dashed border-purple-200 bg-purple-50/50 p-2.5 rounded-lg text-purple-900 text-[11px] space-y-1">
                        <div className="flex justify-between font-medium">
                          <span>Internal Material &amp; Labor Cost:</span>
                          <span className="font-mono">${activeEstimate.internalCost?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Estimated Gross Profit:</span>
                          <span className="font-mono text-emerald-700">
                            ${activeEstimate.estimatedGrossProfit?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Gross Margin:</span>
                          <span className="font-mono text-emerald-700">{activeEstimate.estimatedMargin || 0}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fallback Empty State */}
          {!isCreatingNew && !activeEstimate && (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Select or Create an Estimate</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Select an estimate from the directory on the left or click "Create New Estimate" to bind aerial measurements and inspection findings into an itemized proposal.
              </p>
              <button
                onClick={() => setIsCreatingNew(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Estimate</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
