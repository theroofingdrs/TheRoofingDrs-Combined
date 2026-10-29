import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.ts';
import type { Lead, User, LeadStatus } from '../../../shared/types/index.ts';
import { StatusBadge } from '../common/StatusBadge.tsx';
import {
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building,
  UserCheck,
  Clock,
  Send,
  Save,
  Edit3,
  ShieldAlert,
  History,
  MessageSquare,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface LeadDetailModalProps {
  leadId: string;
  users: User[];
  onClose: () => void;
  onLeadUpdated: (updatedLead: Lead) => void;
  onConvert?: (lead: Lead) => void;
}

const CRM_STATUSES: { value: LeadStatus; label: string }[] = [
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'INSPECTION_SCHEDULED', label: 'Inspection Scheduled' },
  { value: 'INSPECTION_COMPLETED', label: 'Inspection Complete' },
  { value: 'ESTIMATE_SENT', label: 'Estimate Sent' },
  { value: 'WON', label: 'Won' },
  { value: 'LOST', label: 'Lost' },
];

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  leadId,
  users,
  onClose,
  onLeadUpdated,
  onConvert,
}) => {
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Timeline
  const [timelineActivities, setTimelineActivities] = useState<any[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  // Note composition
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  // Edit Mode
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Lead>>({});

  const fetchLeadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [leadData, timelineData] = await Promise.all([
        api.getLead(leadId),
        api.getLeadTimeline(leadId).catch(() => null),
      ]);
      setLead(leadData);
      setEditForm({
        name: leadData.name,
        phone: leadData.phone,
        email: leadData.email,
        address: leadData.address,
        city: leadData.city,
        state: leadData.state,
        zip: leadData.zip,
        serviceRequested: leadData.serviceRequested,
        division: leadData.division || 'RESIDENTIAL',
        source: leadData.source,
        message: leadData.message || '',
      });
      if (timelineData && timelineData.activities) {
        setTimelineActivities(timelineData.activities);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load lead details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (leadId) {
      fetchLeadData();
    }
  }, [leadId]);

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (!lead) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await api.updateLead(lead.id, { status: newStatus });
      setLead(updated);
      onLeadUpdated(updated);
      setSuccessMessage(`Status updated to ${CRM_STATUSES.find((s) => s.value === newStatus)?.label || newStatus}.`);
      setTimeout(() => setSuccessMessage(null), 3000);
      // Refresh timeline
      const tl = await api.getLeadTimeline(lead.id).catch(() => null);
      if (tl?.activities) setTimelineActivities(tl.activities);
    } catch (err: any) {
      setError(err.message || 'Failed to update status.');
    } finally {
      setSaving(false);
    }
  };

  const handleAssignChange = async (newUserId: string) => {
    if (!lead) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await api.assignLead(lead.id, newUserId || undefined);
      setLead(updated);
      onLeadUpdated(updated);
      const assignedUser = users.find((u) => u.id === newUserId);
      setSuccessMessage(`Lead assigned to ${assignedUser ? assignedUser.name : 'Unassigned'}.`);
      setTimeout(() => setSuccessMessage(null), 3000);
      // Refresh timeline
      const tl = await api.getLeadTimeline(lead.id).catch(() => null);
      if (tl?.activities) setTimelineActivities(tl.activities);
    } catch (err: any) {
      setError(err.message || 'Failed to assign lead.');
    } finally {
      setSaving(false);
    }
  };

  const handleDivisionChange = async (newDivision: 'RESIDENTIAL' | 'COMMERCIAL') => {
    if (!lead) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await api.updateLead(lead.id, { division: newDivision });
      setLead(updated);
      onLeadUpdated(updated);
      setSuccessMessage(`Division changed to ${newDivision === 'COMMERCIAL' ? 'Commercial Roof Doctors' : 'The Roof Doctors (Residential)'}.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update division.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEditForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await api.updateLead(lead.id, editForm);
      setLead(updated);
      onLeadUpdated(updated);
      setIsEditing(false);
      setSuccessMessage('Lead information updated successfully.');
      setTimeout(() => setSuccessMessage(null), 3000);
      // Refresh timeline
      const tl = await api.getLeadTimeline(lead.id).catch(() => null);
      if (tl?.activities) setTimelineActivities(tl.activities);
    } catch (err: any) {
      setError(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !newNote.trim()) return;
    setSubmittingNote(true);
    setError(null);
    try {
      await api.addLeadNote(lead.id, newNote.trim());
      setNewNote('');
      setSuccessMessage('Internal note added.');
      setTimeout(() => setSuccessMessage(null), 3000);
      // Reload timeline
      const tl = await api.getLeadTimeline(lead.id).catch(() => null);
      if (tl?.activities) setTimelineActivities(tl.activities);
    } catch (err: any) {
      setError(err.message || 'Failed to add note.');
    } finally {
      setSubmittingNote(false);
    }
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      id="lead-detail-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-4 sm:my-8 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 px-5 sm:px-6 py-4 flex items-center justify-between text-white border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 font-black">
              RD
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-red-400 font-bold">
                  {lead?.division === 'COMMERCIAL' ? 'Commercial Roof Doctors' : 'The ROOF Doctors — Residential'}
                </span>
                {lead?.status === 'NEW' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500 text-white animate-pulse">
                    NEW LEAD
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                {lead ? lead.name : 'Loading Lead Details...'}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLeadData}
              title="Refresh Lead"
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Notifications */}
        {error && (
          <div className="px-6 py-2.5 bg-red-50 border-b border-red-200 text-red-700 text-xs font-medium flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {successMessage && (
          <div className="px-6 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Content Body */}
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-slate-400 mb-3" />
            <p className="text-sm font-semibold">Retrieving lead records from CRM database...</p>
          </div>
        ) : !lead ? (
          <div className="p-12 text-center text-slate-500">
            <p className="text-sm font-semibold">Lead record could not be found.</p>
          </div>
        ) : (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
            {/* Top Quick Status & Actions Bar */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-1">
                    Current CRM Status
                  </label>
                  <select
                    id="lead-status-selector"
                    value={lead.status}
                    disabled={saving}
                    onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
                    className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500 cursor-pointer"
                  >
                    {CRM_STATUSES.map((st) => (
                      <option key={st.value} value={st.value}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-1">
                    Assigned Staff
                  </label>
                  <select
                    id="lead-assigned-selector"
                    value={lead.assignedUserId || ''}
                    disabled={saving}
                    onChange={(e) => handleAssignChange(e.target.value)}
                    className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500 cursor-pointer"
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-1">
                    Division
                  </label>
                  <select
                    id="lead-division-selector"
                    value={lead.division || 'RESIDENTIAL'}
                    disabled={saving}
                    onChange={(e) => handleDivisionChange(e.target.value as 'RESIDENTIAL' | 'COMMERCIAL')}
                    className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500 cursor-pointer"
                  >
                    <option value="RESIDENTIAL">The ROOF Doctors (Residential)</option>
                    <option value="COMMERCIAL">Commercial Roof Doctors (Commercial)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                    isEditing
                      ? 'bg-slate-200 text-slate-800 border-slate-300'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Cancel Edit' : 'Edit Lead Info'}</span>
                </button>

                {onConvert && (
                  <button
                    onClick={() => onConvert(lead)}
                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Convert to Customer</span>
                  </button>
                )}
              </div>
            </div>

            {/* If Editing Mode: Show Edit Form */}
            {isEditing ? (
              <form onSubmit={handleSaveEditForm} className="bg-slate-50 border border-slate-300 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-red-600" />
                    <span>Edit Lead Information</span>
                  </h3>
                  <span className="text-xs text-slate-500">Changes will be logged in the lead history timeline</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Customer Full Name *</label>
                    <input
                      type="text"
                      required
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={editForm.phone || ''}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={editForm.email || ''}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Street Address</label>
                    <input
                      type="text"
                      value={editForm.address || ''}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">City</label>
                      <input
                        type="text"
                        value={editForm.city || ''}
                        onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">State</label>
                      <input
                        type="text"
                        value={editForm.state || 'TX'}
                        onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">ZIP</label>
                      <input
                        type="text"
                        value={editForm.zip || ''}
                        onChange={(e) => setEditForm({ ...editForm, zip: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Service Requested</label>
                    <input
                      type="text"
                      value={editForm.serviceRequested || ''}
                      onChange={(e) => setEditForm({ ...editForm, serviceRequested: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Lead Source</label>
                    <input
                      type="text"
                      value={editForm.source || ''}
                      onChange={(e) => setEditForm({ ...editForm, source: e.target.value as any })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block font-semibold text-slate-700 mb-1">Customer Message / Notes</label>
                    <textarea
                      rows={2}
                      value={editForm.message || ''}
                      onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            ) : null}

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Box 1: Customer Information */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Customer Information</span>
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400">ID: {lead.id}</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Full Name</span>
                    <span className="font-bold text-slate-900 text-sm">{lead.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <a
                      href={`tel:${lead.phone}`}
                      className="font-bold text-red-600 hover:underline"
                    >
                      {lead.phone}
                    </a>
                  </div>

                  {lead.email ? (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-slate-700 hover:text-slate-900 hover:underline"
                      >
                        {lead.email}
                      </a>
                    </div>
                  ) : (
                    <div className="text-slate-400 italic">No email provided</div>
                  )}

                  <div className="pt-1">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Preferred Contact</span>
                    <span className="font-medium text-slate-700">{lead.preferredContactMethod || 'PHONE'}</span>
                  </div>
                </div>
              </div>

              {/* Box 2: Property Information */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Property Information</span>
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400">Northeast Texas / Texarkana</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Street Address</span>
                    <span className="font-bold text-slate-900">
                      {lead.address || 'Address unlisted or pending verification'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">City</span>
                      <span className="font-semibold text-slate-800">{lead.city || 'Texarkana'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">State</span>
                      <span className="font-semibold text-slate-800">{lead.state || 'TX'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">ZIP Code</span>
                      <span className="font-semibold text-slate-800">{lead.zip || '75501'}</span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Full Address String</span>
                    <span className="text-slate-600">
                      {[lead.address, lead.city, lead.state, lead.zip].filter(Boolean).join(', ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Box 3: Request & Diagnostic Information */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>Request &amp; Diagnostic Need</span>
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-sm bg-slate-100 text-slate-800">
                      Score: {lead.score} / 100
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Service Requested</span>
                    <span className="font-bold text-slate-900 text-sm">{lead.serviceRequested}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {lead.emergencyFlag && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-100 text-red-700 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        EMERGENCY DISPATCH
                      </span>
                    )}
                    {lead.stormRelatedFlag && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        ⚡ STORM DAMAGE
                      </span>
                    )}
                    {lead.insuranceRelatedFlag && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        📋 INSURANCE CLAIM
                      </span>
                    )}
                  </div>

                  {lead.message && (
                    <div className="mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">
                        Homeowner Message / Reported Condition
                      </span>
                      <p className="text-slate-700 italic font-medium">&quot;{lead.message}&quot;</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Box 4: Intake Attribution & Metadata */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Intake Attribution &amp; Dates</span>
                  </h3>
                  <StatusBadge status={lead.status} />
                </div>

                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Date Received</span>
                      <span className="font-semibold text-slate-800">{formatDateTime(lead.createdAt)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Last Updated</span>
                      <span className="font-semibold text-slate-800">{formatDateTime(lead.updatedAt)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Lead Source</span>
                      <span className="font-semibold text-slate-800">{lead.source || 'Direct Website Inbound'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned To</span>
                      <span className="font-semibold text-slate-800">
                        {users.find((u) => u.id === lead.assignedUserId)?.name || 'Unassigned'}
                      </span>
                    </div>
                  </div>

                  {lead.scoreReasons && lead.scoreReasons.length > 0 && (
                    <div className="pt-1">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
                        Auditable Scoring Factors
                      </span>
                      <ul className="text-[11px] text-slate-600 space-y-0.5">
                        {lead.scoreReasons.map((reason, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-red-500 font-bold">&bull;</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Row: Internal Notes & Chronological Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Left: Add Internal Note */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-red-600" />
                    <span>Add Internal CRM Note</span>
                  </h3>
                  <span className="text-[10px] text-slate-400">Staff-only auditable log</span>
                </div>

                <form onSubmit={handleAddNote} className="space-y-3">
                  <textarea
                    id="new-lead-note-input"
                    rows={3}
                    placeholder="Enter diagnostic notes, phone contact summary, homeowner roof history, or dispatch instructions..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingNote || !newNote.trim()}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5 text-red-400" />
                      <span>{submittingNote ? 'Saving Note...' : 'Post Internal Note'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Right: Activity & History Timeline */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-slate-500" />
                    <span>Chronological Activity &amp; History</span>
                  </h3>
                  <span className="text-[10px] text-slate-400">{timelineActivities.length} Events</span>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1 text-xs">
                  {timelineActivities.length === 0 ? (
                    <p className="text-slate-400 italic text-center py-4">No logged activity recorded yet.</p>
                  ) : (
                    timelineActivities.map((act, index) => (
                      <div
                        key={act.id || index}
                        className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-1 hover:bg-slate-100/70 transition-colors"
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span className="font-bold text-slate-700 uppercase">
                            {act.activityType?.replace(/_/g, ' ') || 'ACTIVITY'}
                          </span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <Clock className="w-3 h-3" />
                            {formatDateTime(act.createdAt)}
                          </span>
                        </div>
                        <p className="text-slate-800 text-xs font-medium leading-relaxed">{act.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            {lead ? `Record updated: ${formatDateTime(lead.updatedAt)}` : ''}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold cursor-pointer transition-colors"
          >
            Close Record
          </button>
        </div>
      </div>
    </div>
  );
};
