import React, { useState } from 'react';
import { api } from '../../lib/api.ts';
import type { Crew } from '../../../shared/types/index.ts';
import {
  X,
  Truck,
  Users,
  Phone,
  ShieldCheck,
  Calendar,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';

interface RegisterCrewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCrewRegistered: (crew: Crew) => void;
}

export const RegisterCrewModal: React.FC<RegisterCrewModalProps> = ({
  isOpen,
  onClose,
  onCrewRegistered,
}) => {
  const [name, setName] = useState('');
  const [leadForemanName, setLeadForemanName] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState<Crew['specialization']>('SHINGLE_REPLACEMENT');
  const [crewSize, setCrewSize] = useState<number>(6);
  const [market, setMarket] = useState('Northeast Texas (Texarkana / Tyler / Longview)');
  const [insuranceExpiryDate, setInsuranceExpiryDate] = useState('2027-04-15');
  const [workersCompVerified, setWorkersCompVerified] = useState(true);
  const [notes, setNotes] = useState('Equipped with hydraulic dump trailer, magnetic nail sweep bar, and OSHA fall arrest harness gear.');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide the crew or contractor trade name.');
      return;
    }
    if (!leadForemanName.trim()) {
      setError('Please provide the lead foreman name.');
      return;
    }
    if (!phone.trim()) {
      setError('Please provide a direct mobile phone number for dispatch.');
      return;
    }

    setSaving(true);
    try {
      const created = await api.createCrew({
        name: name.trim(),
        leadForemanName: leadForemanName.trim(),
        phone: phone.trim(),
        specialization,
        active: true,
        crewSize: Number(crewSize) || 6,
        market,
        insuranceExpiryDate,
        workersCompVerified,
        notes: notes.trim(),
      });
      onCrewRegistered(created);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to register crew.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Register Installation Crew</h2>
              <p className="text-xs text-slate-400">
                Add production crew, lead foreman, Texas compliance, and dispatch specs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Crew / Company Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apex Shingle Specialists"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lead Foreman Name *
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={leadForemanName}
                  onChange={(e) => setLeadForemanName(e.target.value)}
                  placeholder="e.g. Hector Morales"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Direct Dispatch Phone *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(903) 555-0192"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Primary Specialization
              </label>
              <div className="relative">
                <Wrench className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value as any)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500 font-medium"
                >
                  <option value="SHINGLE_REPLACEMENT">Architectural Shingle Replacement</option>
                  <option value="REPAIR_SPECIALISTS">Emergency Leak &amp; Flashing Repairs</option>
                  <option value="METAL_SPECIALISTS">Standing Seam &amp; Metal Specialists</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Crew Size (Installers)
              </label>
              <input
                type="number"
                min="1"
                max="25"
                value={crewSize}
                onChange={(e) => setCrewSize(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Insurance Certificate Expiry
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  value={insuranceExpiryDate}
                  onChange={(e) => setInsuranceExpiryDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500 font-medium"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Service Territory / Market
            </label>
            <input
              type="text"
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              placeholder="e.g. Northeast Texas (Texarkana, Longview, Tyler)"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500 font-medium"
            />
          </div>

          {/* Texas HB 2102 & Safety Compliance */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={workersCompVerified}
                onChange={(e) => setWorkersCompVerified(e.target.checked)}
                className="mt-0.5 rounded text-red-600 focus:ring-red-500"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 inline" />
                  Workers&apos; Compensation &amp; $1M General Liability Verified
                </span>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Certificate of Insurance verified on file. Meets Texas construction safety and OSHA residential fall protection standards.
                </p>
              </div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Equipment &amp; Clean-up Specifications
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Hydraulic dump trailer, magnetic nail sweep bar, ground tarps..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500 font-medium"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Register &amp; Activate Crew</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
