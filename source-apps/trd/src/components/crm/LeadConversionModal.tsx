import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.ts';
import type { Lead, Customer, Property } from '../../../shared/types/index.ts';
import {
  AlertTriangle,
  UserCheck,
  Building,
  UserPlus,
  CheckCircle2,
  X,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface LeadConversionModalProps {
  lead: Lead | null;
  onClose: () => void;
  onConverted: (result: any) => void;
}

export const LeadConversionModal: React.FC<LeadConversionModalProps> = ({
  lead,
  onClose,
  onConverted,
}) => {
  const [checking, setChecking] = useState(true);
  const [duplicateData, setDuplicateData] = useState<{
    hasMatch: boolean;
    matchedCustomers: Customer[];
    matchedLeads: Lead[];
    reasons: string[];
  } | null>(null);

  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);

  // Conversion Mode
  const [resolutionMode, setResolutionMode] = useState<'NEW' | 'LINK_EXISTING'>('NEW');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [converting, setConverting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!lead) return;

    const runDuplicateCheck = async () => {
      setChecking(true);
      setErrorMessage(null);
      try {
        const [dupRes, custs, props] = await Promise.all([
          api.checkLeadDuplicates({
            phone: lead.phone,
            email: lead.email,
            address: lead.address,
            excludeLeadId: lead.id,
          }),
          api.getCustomers(),
          api.getProperties(),
        ]);

        setDuplicateData(dupRes);
        setAllCustomers(custs);
        setAllProperties(props);

        if (dupRes.hasMatch && dupRes.matchedCustomers.length > 0) {
          setResolutionMode('LINK_EXISTING');
          setSelectedCustomerId(dupRes.matchedCustomers[0].id);
          // If customer has properties, pre-select first property
          const custProps = props.filter((p) => p.customerId === dupRes.matchedCustomers[0].id);
          if (custProps.length > 0) {
            setSelectedPropertyId(custProps[0].id);
          }
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to check duplicate records');
      } finally {
        setChecking(false);
      }
    };

    runDuplicateCheck();
  }, [lead]);

  if (!lead) return null;

  const handleConvert = async () => {
    setConverting(true);
    setErrorMessage(null);
    try {
      const payload: { existingCustomerId?: string; existingPropertyId?: string } = {};
      if (resolutionMode === 'LINK_EXISTING') {
        if (!selectedCustomerId) {
          throw new Error('Please select an existing customer to link.');
        }
        payload.existingCustomerId = selectedCustomerId;
        if (selectedPropertyId) {
          payload.existingPropertyId = selectedPropertyId;
        }
      }

      const res = await api.convertLead(lead.id, payload);
      onConverted(res);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to convert lead');
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-red-400">
              Audited Lead Conversion
            </span>
            <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              <span>Convert Lead:</span>
              <span className="text-slate-300 font-semibold">{lead.name}</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Inbound Lead Summary Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Inbound Inquiry Details
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500">Contact:</span>{' '}
                <span className="font-semibold text-slate-900">{lead.name}</span>
                <div className="text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{lead.phone}</span>
                </div>
                {lead.email && (
                  <div className="text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{lead.email}</span>
                  </div>
                )}
              </div>
              <div>
                <span className="text-slate-500">Address:</span>
                <div className="font-semibold text-slate-900 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>{lead.address || 'Address unlisted'}, {lead.city}, TX {lead.zip}</span>
                </div>
                <div className="mt-1">
                  <span className="text-slate-500">Service:</span>{' '}
                  <span className="font-semibold text-slate-800">{lead.serviceRequested}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Checking Spinner */}
          {checking && (
            <div className="flex items-center justify-center p-6 gap-2 text-slate-500 font-medium">
              <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              <span>Scanning database for duplicate customers, phones, and addresses...</span>
            </div>
          )}

          {/* Duplicate Detection Warning Banner */}
          {!checking && duplicateData?.hasMatch && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-amber-900 text-sm uppercase tracking-wide">
                    ⚠️ Possible Existing Customer / Property Detected
                  </h4>
                  <p className="text-amber-800 text-[11px] mt-0.5">
                    Database intelligence matched this lead to existing records. Link to the existing customer profile to prevent duplicate customer fragmentation.
                  </p>
                </div>
              </div>

              <div className="bg-white/80 rounded-lg p-3 border border-amber-200 space-y-1.5 text-[11px]">
                <div className="font-bold text-amber-950">Match Diagnostics:</div>
                <ul className="list-disc pl-4 space-y-1 text-amber-900">
                  {duplicateData.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Resolution Options */}
          {!checking && (
            <div className="space-y-3">
              <div className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Select Conversion Action:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option A: Link Existing */}
                <label
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    resolutionMode === 'LINK_EXISTING'
                      ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-blue-600" />
                        <span className="font-black text-slate-900 text-xs">Link to Existing Profile</span>
                      </div>
                      <input
                        type="radio"
                        name="resolutionMode"
                        checked={resolutionMode === 'LINK_EXISTING'}
                        onChange={() => setResolutionMode('LINK_EXISTING')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Attaches this new inquiry and project to an existing customer record and prevents creating duplicate clients.
                    </p>
                  </div>
                </label>

                {/* Option B: Create New */}
                <label
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    resolutionMode === 'NEW'
                      ? 'border-slate-900 bg-slate-50 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-slate-900" />
                        <span className="font-black text-slate-900 text-xs">Create New Customer</span>
                      </div>
                      <input
                        type="radio"
                        name="resolutionMode"
                        checked={resolutionMode === 'NEW'}
                        onChange={() => setResolutionMode('NEW')}
                        className="text-slate-900 focus:ring-slate-900"
                      />
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Creates a brand new verified customer profile, property record, and permanent roof history file.
                    </p>
                  </div>
                </label>
              </div>

              {/* Existing Customer Dropdown Picker */}
              {resolutionMode === 'LINK_EXISTING' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Choose Existing Customer:
                    </label>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => {
                        setSelectedCustomerId(e.target.value);
                        const custProps = allProperties.filter((p) => p.customerId === e.target.value);
                        setSelectedPropertyId(custProps.length > 0 ? custProps[0].id : '');
                      }}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Select Customer Profile --</option>
                      {allCustomers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.firstName} {c.lastName} &bull; {c.phone} &bull; ({c.propertyIds?.length || 0} properties)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Property Association:
                    </label>
                    <select
                      value={selectedPropertyId}
                      onChange={(e) => setSelectedPropertyId(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Create New Property for this Customer --</option>
                      {allProperties
                        .filter((p) => p.customerId === selectedCustomerId)
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            Use Existing Property: {p.address}, {p.city}
                          </option>
                        ))}
                    </select>
                    <p className="text-[10px] text-slate-500 mt-1">
                      If the lead specifies a new address, keep &quot;Create New Property&quot; selected to add a second property to this customer.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold text-xs cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={converting || checking}
            onClick={handleConvert}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs cursor-pointer flex items-center gap-2 disabled:opacity-50 shadow-sm"
          >
            {converting ? (
              <span>Converting &amp; Logging Audit...</span>
            ) : (
              <>
                <span>Confirm &amp; Convert Lead</span>
                <ArrowRight className="w-4 h-4 text-red-400" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
