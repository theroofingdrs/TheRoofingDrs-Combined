import React, { useState, useEffect, useMemo } from 'react';
import type {
  Proposal,
  ProposalOption,
  Estimate,
  Customer,
  Property,
  Project,
  Sale,
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
  Eye,
  ExternalLink,
  Copy,
  Check,
  ShieldAlert,
  ArrowRight,
  User,
  Home,
  DollarSign,
  AlertCircle,
  Shield,
  Layers,
  Sparkles,
  RefreshCw,
  Edit3,
} from 'lucide-react';

interface ProposalWorkspaceProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
  customers: Customer[];
  properties: Property[];
  estimates: Estimate[];
  preSelectedEstimateId?: string | null;
  onProposalAccepted?: (sale: Sale, project: Project) => void;
}

export const ProposalWorkspace: React.FC<ProposalWorkspaceProps> = ({
  currentPath = '/app/proposals',
  onNavigate,
  customers,
  properties,
  estimates,
  preSelectedEstimateId,
  onProposalAccepted,
}) => {
  const { currentUser } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const [activeProposal, setActiveProposal] = useState<Proposal | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // New Proposal Form State
  const [selectedEstimateIdForNew, setSelectedEstimateIdForNew] = useState(preSelectedEstimateId || '');
  const [newProposalTitle, setNewProposalTitle] = useState('');
  const [newProposalDeposit, setNewProposalDeposit] = useState<number | ''>('');

  // Staff Manual Acceptance Modal State
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [signerFullName, setSignerFullName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [selectedOptionForAccept, setSelectedOptionForAccept] = useState('');

  // Staff Decline Modal State
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  // Load proposals
  const loadProposals = async () => {
    setLoading(true);
    try {
      const data = await api.getProposals();
      setProposals(data);
    } catch (err: any) {
      console.error('Failed to load proposals:', err);
      setFeedbackMessage({ type: 'error', text: 'Failed to load proposals.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProposals();
  }, []);

  // Sync with URL or preselected estimate
  useEffect(() => {
    if (preSelectedEstimateId) {
      setSelectedEstimateIdForNew(preSelectedEstimateId);
      setIsCreatingNew(true);
      const est = estimates.find((e) => e.id === preSelectedEstimateId);
      if (est) {
        setNewProposalTitle(`Proposal — ${est.title}`);
        setNewProposalDeposit(Math.round(est.total * 0.3));
      }
    }
  }, [preSelectedEstimateId, estimates]);

  useEffect(() => {
    if (currentPath && currentPath.startsWith('/app/proposals/')) {
      const id = currentPath.replace('/app/proposals/', '').trim();
      if (id && id !== 'new') {
        setSelectedProposalId(id);
      }
    }
  }, [currentPath]);

  // Load active proposal
  useEffect(() => {
    if (!selectedProposalId) {
      setActiveProposal(null);
      return;
    }
    const found = proposals.find((p) => p.id === selectedProposalId);
    if (found) {
      setActiveProposal(JSON.parse(JSON.stringify(found)));
    } else {
      api.getProposal(selectedProposalId)
        .then((p) => setActiveProposal(p))
        .catch(() => setFeedbackMessage({ type: 'error', text: 'Proposal not found.' }));
    }
  }, [selectedProposalId, proposals]);

  // Copy portal link
  const handleCopyPortalLink = (proposalId: string) => {
    const url = `${window.location.origin}/portal/proposals/${proposalId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Open customer preview in new tab or portal route
  const handleOpenCustomerView = (proposalId: string) => {
    if (onNavigate) {
      onNavigate(`/portal/proposals/${proposalId}`);
    } else {
      window.open(`/portal/proposals/${proposalId}`, '_blank');
    }
  };

  // Actions
  const handleSaveDraft = async () => {
    if (!activeProposal) return;
    setIsSaving(true);
    try {
      const updated = await api.updateProposal(activeProposal.id, {
        title: activeProposal.title,
        introduction: activeProposal.introduction,
        projectSummary: activeProposal.projectSummary,
        scopeOfWork: activeProposal.scopeOfWork,
        terms: activeProposal.terms,
        depositRequired: activeProposal.depositRequired,
        expiresAt: activeProposal.expiresAt,
        options: activeProposal.options,
      });
      setActiveProposal(updated);
      await loadProposals();
      setFeedbackMessage({ type: 'success', text: `Proposal ${updated.proposalNumber} updated successfully.` });
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Failed to update proposal.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendProposal = async () => {
    if (!activeProposal) return;
    setIsSaving(true);
    try {
      const sent = await api.sendProposal(activeProposal.id);
      setActiveProposal(sent);
      await loadProposals();
      setFeedbackMessage({
        type: 'success',
        text: `Proposal ${sent.proposalNumber} marked as SENT! Homeowner can now review and sign via their portal link.`,
      });
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Failed to send proposal.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSimulateViewed = async () => {
    if (!activeProposal) return;
    try {
      const res = await api.recordProposalViewed(activeProposal.id);
      setActiveProposal({ ...activeProposal, status: res.status as any, viewedAt: res.viewedAt });
      await loadProposals();
      setFeedbackMessage({ type: 'info', text: 'Proposal marked as VIEWED by customer.' });
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Failed to record viewed status.' });
    }
  };

  const handleConfirmStaffAccept = async () => {
    if (!activeProposal || !signerFullName.trim()) return;
    setIsSaving(true);
    try {
      const res = await api.acceptProposal(activeProposal.id, {
        signerName: signerFullName.trim(),
        signerEmail: signerEmail.trim() || undefined,
        selectedOptionId: selectedOptionForAccept || activeProposal.options[0]?.id,
        acceptanceMethod: 'STAFF_ASSISTED_VERBAL',
        notes: 'Signed via staff-assisted consultation with homeowner authorization.',
      });

      setActiveProposal(res.proposal);
      setShowAcceptModal(false);
      await loadProposals();
      setFeedbackMessage({
        type: 'success',
        text: `Proposal ${res.proposal.proposalNumber} ACCEPTED! Sale record #${res.sale.id} established and Project #${res.project.id} converted to production pipeline.`,
      });

      if (onProposalAccepted) {
        onProposalAccepted(res.sale, res.project);
      }
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Failed to record acceptance.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDecline = async () => {
    if (!activeProposal) return;
    setIsSaving(true);
    try {
      const declined = await api.declineProposal(activeProposal.id, {
        reason: declineReason || 'Customer chose not to proceed at this time.',
      });
      setActiveProposal(declined);
      setShowDeclineModal(false);
      await loadProposals();
      setFeedbackMessage({ type: 'info', text: `Proposal ${declined.proposalNumber} marked as DECLINED.` });
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Failed to record decline.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Create from estimate
  const handleCreateNewProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEstimateIdForNew) {
      setFeedbackMessage({ type: 'error', text: 'Please select an estimate to build this proposal.' });
      return;
    }

    const estimate = estimates.find((est) => est.id === selectedEstimateIdForNew);
    if (!estimate) {
      setFeedbackMessage({ type: 'error', text: 'Selected estimate not found.' });
      return;
    }

    setIsSaving(true);
    try {
      const created = await api.createProposal({
        estimateId: estimate.id,
        title: newProposalTitle.trim() || `Roof Replacement Proposal — ${estimate.estimateNumber}`,
        depositRequired: Number(newProposalDeposit) || Math.round(estimate.total * 0.3),
      });

      setIsCreatingNew(false);
      await loadProposals();
      setSelectedProposalId(created.id);
      setFeedbackMessage({
        type: 'success',
        text: `Proposal #${created.proposalNumber} generated from Estimate ${estimate.estimateNumber}!`,
      });
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Failed to create proposal.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered proposals
  const filteredProposals = useMemo(() => {
    return proposals.filter((p) => {
      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const customer = customers.find((c) => c.id === p.customerId);
      const property = properties.find((pr) => pr.id === p.propertyId);

      const matchesSearch =
        !q ||
        p.proposalNumber.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        (customer && `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(q)) ||
        (property && property.address.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [proposals, statusFilter, searchQuery, customers, properties]);

  const activeCustomer = customers.find((c) => c.id === activeProposal?.customerId);
  const activeProperty = properties.find((p) => p.id === activeProposal?.propertyId);
  const activeEstimate = estimates.find((e) => e.id === activeProposal?.estimateId);

  // Status Badge Component
  const renderStatusBadge = (status: Proposal['status']) => {
    switch (status) {
      case 'DRAFT':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">DRAFT</span>;
      case 'SENT':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1"><Send className="w-3 h-3" /> SENT</span>;
      case 'VIEWED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1"><Eye className="w-3 h-3" /> VIEWED BY CLIENT</span>;
      case 'ACCEPTED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 font-black flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> ACCEPTED / SOLD</span>;
      case 'DECLINED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1"><XCircle className="w-3 h-3" /> DECLINED</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-600" />
              <span>Customer Proposals &amp; Sales Contracts</span>
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono font-bold">
              {proposals.length} Proposals
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Structured customer-facing agreements with clean warranty tiers, digital acceptance, and automated project handoff.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadProposals}
            disabled={loading}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh Proposals"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              setIsCreatingNew(true);
              setSelectedProposalId(null);
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Proposal From Estimate</span>
          </button>
        </div>
      </div>

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

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Proposals List */}
        <div className={`lg:col-span-4 space-y-4 ${selectedProposalId ? 'hidden lg:block' : 'block'}`}>
          {/* Search & Filter */}
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-3 shadow-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search proposal #, customer, address..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-semibold no-scrollbar">
              {['ALL', 'DRAFT', 'SENT', 'VIEWED', 'ACCEPTED'].map((status) => (
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

          {/* Proposals Directory */}
          <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
            {filteredProposals.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
                No proposals found matching the filter criteria.
              </div>
            ) : (
              filteredProposals.map((prop) => {
                const customer = customers.find((c) => c.id === prop.customerId);
                const property = properties.find((p) => p.id === prop.propertyId);
                const isSelected = prop.id === selectedProposalId;
                const totalAmount = prop.options?.[0]?.price || 0;

                return (
                  <div
                    key={prop.id}
                    onClick={() => {
                      setSelectedProposalId(prop.id);
                      setIsCreatingNew(false);
                      onNavigate?.(`/app/proposals/${prop.id}`);
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
                          {prop.proposalNumber}
                        </span>
                        <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{prop.title}</h4>
                      </div>
                      {renderStatusBadge(prop.status)}
                    </div>

                    <div className="mt-2 text-[11px] text-slate-600 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="truncate">
                          {customer ? `${customer.firstName} ${customer.lastName}` : 'Customer'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Home className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{property ? property.address : 'Property'}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="font-bold text-slate-900 font-mono">
                        ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <span>
                          {prop.acceptedAt
                            ? 'Accepted'
                            : prop.sentAt
                            ? 'Sent'
                            : 'Draft'}
                        </span>
                        <span>•</span>
                        <span>{prop.options?.length || 1} Tier</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Proposal Editor / Inspector */}
        <div className="lg:col-span-8">
          {/* Create New Proposal Modal */}
          {isCreatingNew && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Generate Proposal From Approved Estimate</h3>
                  <p className="text-xs text-slate-500">
                    Transform an internal estimate into a structured, customer-ready digital contract.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreatingNew(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateNewProposal} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Base Estimate <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedEstimateIdForNew}
                    onChange={(e) => {
                      setSelectedEstimateIdForNew(e.target.value);
                      const est = estimates.find((item) => item.id === e.target.value);
                      if (est) {
                        setNewProposalTitle(`Proposal — ${est.title}`);
                        setNewProposalDeposit(Math.round(est.total * 0.3));
                      }
                    }}
                    required
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                  >
                    <option value="">-- Choose Approved / Draft Estimate --</option>
                    {estimates.map((est) => {
                      const cust = customers.find((c) => c.id === est.customerId);
                      return (
                        <option key={est.id} value={est.id}>
                          {est.estimateNumber} — {est.title} (${est.total.toFixed(2)}) — {cust ? `${cust.firstName} ${cust.lastName}` : ''} [{est.status}]
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Customer-Facing Proposal Title</label>
                  <input
                    type="text"
                    value={newProposalTitle}
                    onChange={(e) => setNewProposalTitle(e.target.value)}
                    required
                    placeholder="e.g. Complete Lifetime Architectural Roof Replacement"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Required Deposit Upon Contract Signing ($)
                  </label>
                  <input
                    type="number"
                    value={newProposalDeposit}
                    onChange={(e) => setNewProposalDeposit(e.target.value ? Number(e.target.value) : '')}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Default is standard 30% materials procurement deposit.
                  </span>
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
                    {isSaving ? 'Generating...' : 'Build Proposal'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Active Proposal Workspace */}
          {!isCreatingNew && activeProposal && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-200">
              {/* Header */}
              <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-red-600 px-2 py-0.5 bg-red-50 border border-red-200 rounded">
                      {activeProposal.proposalNumber}
                    </span>
                    {renderStatusBadge(activeProposal.status)}
                  </div>
                  <input
                    type="text"
                    value={activeProposal.title}
                    onChange={(e) => setActiveProposal({ ...activeProposal, title: e.target.value })}
                    className="text-base font-bold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-red-500 focus:outline-none w-full"
                  />
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Copy Portal Link */}
                  <button
                    onClick={() => handleCopyPortalLink(activeProposal.id)}
                    className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    title="Copy Homeowner Portal Proposal Link"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copiedLink ? 'Link Copied!' : 'Copy Portal URL'}</span>
                  </button>

                  {/* Customer Portal Preview */}
                  <button
                    onClick={() => handleOpenCustomerView(activeProposal.id)}
                    className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    <span>Customer Portal View</span>
                  </button>

                  {/* Save Draft */}
                  <button
                    onClick={handleSaveDraft}
                    disabled={isSaving}
                    className="px-4 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                    <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
                  </button>

                  {/* Send to Homeowner */}
                  {activeProposal.status === 'DRAFT' && (
                    <button
                      onClick={handleSendProposal}
                      disabled={isSaving}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send to Customer</span>
                    </button>
                  )}

                  {/* Record Viewed (Test helper) */}
                  {activeProposal.status === 'SENT' && (
                    <button
                      onClick={handleSimulateViewed}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                      title="Record customer viewed timestamp"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Record Viewed</span>
                    </button>
                  )}

                  {/* Staff Manual Accept */}
                  {activeProposal.status !== 'ACCEPTED' && activeProposal.status !== 'DECLINED' && (
                    <button
                      onClick={() => {
                        setSignerFullName(activeCustomer ? `${activeCustomer.firstName} ${activeCustomer.lastName}` : '');
                        setSignerEmail(activeCustomer?.email || '');
                        setShowAcceptModal(true);
                      }}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Accept / Record Sale</span>
                    </button>
                  )}

                  {/* Decline */}
                  {activeProposal.status !== 'ACCEPTED' && activeProposal.status !== 'DECLINED' && (
                    <button
                      onClick={() => setShowDeclineModal(true)}
                      className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      <span>Decline</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Acceptance Callout Banner (if accepted) */}
              {activeProposal.status === 'ACCEPTED' && (
                <div className="p-4 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold">Legally Accepted by {activeProposal.signatureName || 'Customer'}</span>
                      <span className="text-emerald-700 ml-2">
                        on {activeProposal.acceptedAt ? new Date(activeProposal.acceptedAt).toLocaleString() : 'Recent'}
                      </span>
                      <span className="text-[11px] text-emerald-800 block">
                        Project and Sale handoff completed. Production scheduling authorized.
                      </span>
                    </div>
                  </div>
                  <div className="font-mono font-black text-sm text-emerald-900">
                    ${(activeProposal.options?.[0]?.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              )}

              {/* Context Bar */}
              <div className="p-5 bg-slate-50/70 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer</span>
                  <div className="font-bold text-slate-900">
                    {activeCustomer ? `${activeCustomer.firstName} ${activeCustomer.lastName}` : 'Homeowner'}
                  </div>
                  <div className="text-[11px] text-slate-500">{activeCustomer?.phone}</div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Property</span>
                  <div className="font-bold text-slate-900">{activeProperty?.address || 'Property Location'}</div>
                  <div className="text-[11px] text-slate-500">{activeProperty ? `${activeProperty.city}, ${activeProperty.state}` : ''}</div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Linked Estimate</span>
                  <div className="font-bold text-slate-900 font-mono text-red-600">
                    {activeEstimate?.estimateNumber || 'Estimate'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Total: ${activeEstimate?.total.toFixed(2) || '0.00'}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deposit Required</span>
                  <div className="font-bold text-slate-900 font-mono">
                    ${activeProposal.depositRequired?.toFixed(2) || '0.00'}
                  </div>
                  <div className="text-[11px] text-slate-500">Status: {activeProposal.depositStatus || 'PENDING'}</div>
                </div>
              </div>

              {/* Proposal Content & Scope of Work */}
              <div className="p-5 space-y-6">
                {/* Introduction & Summary */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Executive Introduction</label>
                    <textarea
                      rows={2}
                      value={activeProposal.introduction || ''}
                      onChange={(e) => setActiveProposal({ ...activeProposal, introduction: e.target.value })}
                      className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Project Diagnostic Summary</label>
                    <textarea
                      rows={2}
                      value={activeProposal.projectSummary || ''}
                      onChange={(e) => setActiveProposal({ ...activeProposal, projectSummary: e.target.value })}
                      className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>

                {/* Proposal Option(s) / Pricing Tiers */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Investment Package / Selected Scope</span>
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(activeProposal.options || []).map((opt) => (
                      <div
                        key={opt.id}
                        className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-red-600 uppercase tracking-wider">
                              {opt.tier} TIER
                            </span>
                            <h5 className="font-bold text-sm text-slate-900">{opt.name}</h5>
                            <span className="text-xs text-slate-500">{opt.roofSystem}</span>
                          </div>
                          <div className="text-right font-mono">
                            <span className="text-xs text-slate-400 block font-sans">Investment</span>
                            <span className="text-lg font-black text-slate-900">${opt.price.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-100 space-y-1">
                          <div className="font-bold text-slate-800">Warranty Coverage:</div>
                          <div>{opt.warrantyDescription || `${opt.warrantyYears || 30}-Year Manufacturer Warranty`}</div>
                        </div>

                        {opt.scope && opt.scope.length > 0 && (
                          <div className="text-xs space-y-1">
                            <span className="font-bold text-slate-700">Included Scope Highlights:</span>
                            <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                              {opt.scope.slice(0, 5).map((s, idx) => (
                                <li key={idx} className="line-clamp-1">{s}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detailed Scope of Work */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Formal Scope of Work</label>
                  <textarea
                    rows={4}
                    value={activeProposal.scopeOfWork || ''}
                    onChange={(e) => setActiveProposal({ ...activeProposal, scopeOfWork: e.target.value })}
                    className="w-full p-2.5 font-mono text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>

                {/* Terms of Service & Guarantees */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Terms of Service &amp; Workmanship Guarantees</label>
                  <textarea
                    rows={3}
                    value={activeProposal.terms || ''}
                    onChange={(e) => setActiveProposal({ ...activeProposal, terms: e.target.value })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isCreatingNew && !activeProposal && (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Select or Create a Proposal</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Generate a formal customer proposal from any approved estimate to enable digital acceptance and automated project conversion.
              </p>
              <button
                onClick={() => setIsCreatingNew(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>New Proposal From Estimate</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Staff Manual Accept Modal */}
      {showAcceptModal && activeProposal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">Record Customer Acceptance</h3>
              </div>
              <button
                onClick={() => setShowAcceptModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              This authorizes proposal #{activeProposal.proposalNumber} and triggers the Sale and Project handoff to production.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Customer Legal Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={signerFullName}
                  onChange={(e) => setSignerFullName(e.target.value)}
                  placeholder="e.g. Robert Sterling"
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Confirmation Email</label>
                <input
                  type="email"
                  value={signerEmail}
                  onChange={(e) => setSignerEmail(e.target.value)}
                  placeholder="customer@email.com"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-[11px] space-y-1">
                <div className="font-bold text-slate-800">Automatic Downstream Actions:</div>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Creates / updates production Project record</li>
                  <li>Generates active Sale record for commission &amp; billing</li>
                  <li>Marks linked Estimate as ACCEPTED</li>
                  <li>Logs audit event with caller identity and timestamp</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                onClick={() => setShowAcceptModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStaffAccept}
                disabled={!signerFullName.trim() || isSaving}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isSaving ? 'Processing...' : 'Confirm Acceptance & Establish Sale'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Reason Modal */}
      {showDeclineModal && activeProposal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900">Decline Proposal</h3>
              <button
                onClick={() => setShowDeclineModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block font-bold text-slate-700">Reason for Decline</label>
              <textarea
                rows={3}
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="e.g. Budget constraints, chose competitor, delaying project..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                onClick={() => setShowDeclineModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDecline}
                disabled={isSaving}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
