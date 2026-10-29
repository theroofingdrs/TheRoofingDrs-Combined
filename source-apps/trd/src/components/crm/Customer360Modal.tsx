import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.ts';
import type { Customer, Property, Roof, Project, Inspection, Communication } from '../../../shared/types/index.ts';
import { StatusBadge } from '../common/StatusBadge.tsx';
import {
  X,
  Phone,
  Mail,
  MapPin,
  Home,
  Briefcase,
  SearchCheck,
  MessageSquare,
  FileText,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Send,
  Edit2,
  Save,
} from 'lucide-react';

interface Customer360ModalProps {
  customerId: string | null;
  onClose: () => void;
  onSelectProperty?: (propertyId: string) => void;
  onCustomerUpdated?: () => void;
}

export const Customer360Modal: React.FC<Customer360ModalProps> = ({
  customerId,
  onClose,
  onSelectProperty,
  onCustomerUpdated,
}) => {
  const [data, setData] = useState<{
    customer: Customer;
    properties: Property[];
    roofs: Roof[];
    roofRecords: any[];
    leads: any[];
    projects: Project[];
    inspections: Inspection[];
    appointments: any[];
    communications: Communication[];
    tasks: any[];
    documents: any[];
    estimates: any[];
    proposals: any[];
    payments: any[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'properties' | 'projects' | 'communications'>('overview');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Customer>>({});
  const [saving, setSaving] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [sendingNote, setSendingNote] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchCustomer360 = async () => {
    if (!customerId) return;
    setLoading(true);
    try {
      const res = await api.getCustomer360(customerId);
      setData(res);
      setEditForm({
        firstName: res.customer.firstName,
        lastName: res.customer.lastName,
        phone: res.customer.phone,
        alternatePhone: res.customer.alternatePhone || '',
        email: res.customer.email,
        preferredContactMethod: res.customer.preferredContactMethod,
        notes: res.customer.notes || '',
        status: res.customer.status,
      });
    } catch (err: any) {
      console.error(err);
      setFeedback(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer360();
  }, [customerId]);

  if (!customerId) return null;

  const handleSaveCustomer = async () => {
    setSaving(true);
    try {
      await api.updateCustomer(customerId, editForm);
      setEditing(false);
      setFeedback('Customer details saved successfully.');
      await fetchCustomer360();
      onCustomerUpdated?.();
    } catch (err: any) {
      setFeedback(`Save error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !data?.customer) return;
    setSendingNote(true);
    try {
      await api.createCommunication({
        channel: 'INTERNAL_NOTE',
        direction: 'INTERNAL',
        sender: 'Staff',
        recipient: 'Internal Record',
        customerId: data.customer.id,
        body: newNote.trim(),
      });
      setNewNote('');
      setFeedback('Staff note recorded on Customer timeline.');
      await fetchCustomer360();
    } catch (err: any) {
      setFeedback(`Note error: ${err.message}`);
    } finally {
      setSendingNote(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                Customer 360 Intelligence
              </span>
              <span className="text-[10px] font-mono text-slate-400">ID: {customerId}</span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-3">
              {data ? `${data.customer.firstName} ${data.customer.lastName}` : 'Loading customer...'}
              {data && <StatusBadge status={data.customer.status} />}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 bg-slate-50 border-b border-slate-200 flex gap-2">
          {[
            { id: 'overview', label: 'Profile & Contact', icon: FileText },
            { id: 'properties', label: `Properties & Roofs (${data?.properties?.length || 0})`, icon: Home },
            { id: 'projects', label: `Projects & Inspections (${data?.projects?.length || 0})`, icon: Briefcase },
            { id: 'communications', label: `Communications (${data?.communications?.length || 0})`, icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer transition-all ${
                  activeSubTab === tab.id
                    ? 'border-slate-900 text-slate-900 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="px-6 py-2 bg-blue-50 border-b border-blue-200 text-blue-800 text-xs flex items-center justify-between">
            <span>{feedback}</span>
            <button onClick={() => setFeedback(null)} className="text-blue-500 hover:text-blue-700 font-bold">
              &times;
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 flex-1">
          {loading ? (
            <div className="flex items-center justify-center p-12 gap-2 text-slate-500 font-medium">
              <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              <span>Compiling customer 360 portfolio...</span>
            </div>
          ) : !data ? (
            <div className="text-center p-8 text-slate-400">Customer records could not be loaded.</div>
          ) : (
            <>
              {/* SUBTAB 1: OVERVIEW & CONTACT */}
              {activeSubTab === 'overview' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                      Client Contact &amp; Compliance Details
                    </h3>
                    <button
                      onClick={() => setEditing(!editing)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>{editing ? 'Cancel Edit' : 'Edit Contact'}</span>
                    </button>
                  </div>

                  {editing ? (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">First Name</label>
                          <input
                            type="text"
                            value={editForm.firstName || ''}
                            onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                            className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Last Name</label>
                          <input
                            type="text"
                            value={editForm.lastName || ''}
                            onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                            className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Primary Phone</label>
                          <input
                            type="text"
                            value={editForm.phone || ''}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Email</label>
                          <input
                            type="email"
                            value={editForm.email || ''}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Internal Notes</label>
                        <textarea
                          rows={2}
                          value={editForm.notes || ''}
                          onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                        />
                      </div>
                      <div className="flex justify-end pt-2">
                        <button
                          disabled={saving}
                          onClick={handleSaveCustomer}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{saving ? 'Saving...' : 'Save Updates'}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Primary Contact
                        </div>
                        <div className="flex items-center gap-2 text-slate-800 font-semibold">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span>{data.customer.phone}</span>
                        </div>
                        {data.customer.email && (
                          <div className="flex items-center gap-2 text-slate-800 font-semibold">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <span>{data.customer.email}</span>
                          </div>
                        )}
                        <div className="text-slate-500 pt-1 text-[11px]">
                          Preferred Channel: <span className="font-bold text-slate-800">{data.customer.preferredContactMethod}</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Communication Opt-Ins (TCPA &amp; Storm Compliance)
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-600">SMS Appointment Reminders:</span>
                            <span className={`font-bold ${data.customer.communicationPreferences?.smsOptIn ? 'text-emerald-700' : 'text-slate-400'}`}>
                              {data.customer.communicationPreferences?.smsOptIn ? 'Opted In' : 'No'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-600">Email Reports &amp; Estimates:</span>
                            <span className={`font-bold ${data.customer.communicationPreferences?.emailOptIn ? 'text-emerald-700' : 'text-slate-400'}`}>
                              {data.customer.communicationPreferences?.emailOptIn ? 'Opted In' : 'No'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-600">Severe Weather &amp; Storm Alerts:</span>
                            <span className={`font-bold ${data.customer.communicationPreferences?.stormAlertsOptIn ? 'text-blue-700' : 'text-slate-400'}`}>
                              {data.customer.communicationPreferences?.stormAlertsOptIn ? 'Active Subscriber' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {data.customer.notes && (
                    <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-xl">
                      <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1">
                        Customer Notes:
                      </div>
                      <p className="text-amber-950 text-xs leading-relaxed">{data.customer.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* SUBTAB 2: PROPERTIES & ROOFS */}
              {activeSubTab === 'properties' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                      Properties &amp; Lifetime Roof Records ({data.properties.length})
                    </h3>
                  </div>

                  {data.properties.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-400">
                      No properties linked to this customer yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {data.properties.map((prop) => (
                        <div key={prop.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                                <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                                <span>{prop.address}</span>
                              </div>
                              <p className="text-slate-500 text-xs ml-5.5">
                                {prop.city}, {prop.state} {prop.zip}
                              </p>
                            </div>
                            <StatusBadge status={prop.verificationStatus} />
                          </div>

                          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] space-y-1">
                            <div className="flex justify-between text-slate-600">
                              <span>Year Built:</span>
                              <span className="font-semibold text-slate-800">{prop.yearBuilt || 'Field Check Required'}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                              <span>Roof Record:</span>
                              <span className="font-mono text-[10px] text-slate-500">{prop.roofId || 'Linked'}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onSelectProperty?.(prop.id);
                            }}
                            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                            <span>Inspect Lifetime Roof History</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SUBTAB 3: PROJECTS & INSPECTIONS */}
              {activeSubTab === 'projects' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                    Projects &amp; Field Diagnostic History
                  </h3>

                  {data.projects.length === 0 && data.inspections.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-400">
                      No projects or inspections on file yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {data.projects.map((proj) => (
                        <div key={proj.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{proj.title}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Type: <span className="font-semibold text-slate-700">{proj.projectType}</span> &bull; Claim:{' '}
                              <span className="font-semibold text-slate-700">{proj.insuranceClaimFlag ? 'Yes' : 'No'}</span>
                            </div>
                          </div>
                          <StatusBadge status={proj.status} />
                        </div>
                      ))}

                      {data.inspections.map((insp) => (
                        <div key={insp.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                          <div>
                            <div className="font-bold text-slate-900 text-sm">
                              Diagnostic Inspection ({insp.inspectionType})
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Scheduled: {insp.scheduledDate ? new Date(insp.scheduledDate).toLocaleDateString() : 'Pending'} &bull; Decking:{' '}
                              {insp.deckingCondition || 'Pending'}
                            </div>
                          </div>
                          <StatusBadge status={insp.status} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SUBTAB 4: COMMUNICATIONS & NOTES */}
              {activeSubTab === 'communications' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                      Communications &amp; Staff Notes
                    </h3>
                  </div>

                  {/* Add internal note form */}
                  <form onSubmit={handleAddNote} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Add Internal Staff Note
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Log customer contact, warranty discussion, or field note..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-slate-900"
                      />
                      <button
                        type="submit"
                        disabled={sendingNote || !newNote.trim()}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Log</span>
                      </button>
                    </div>
                  </form>

                  {data.communications.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-400">
                      No communications or staff notes recorded.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {data.communications.map((comm) => (
                        <div key={comm.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 shadow-2xs">
                          <div className="flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                                {comm.channel}
                              </span>
                              <span className="font-semibold text-slate-900">
                                {comm.sender} &rarr; {comm.recipient}
                              </span>
                            </div>
                            <span className="text-slate-400">{new Date(comm.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="text-slate-800 text-xs">{comm.body}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
