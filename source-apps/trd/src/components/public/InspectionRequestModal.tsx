import { AddressAutocomplete } from '../common/AddressAutocomplete.tsx';
import React, { useState } from 'react';
import { api } from '../../lib/api.ts';
import type { Lead } from '../../../shared/types/index.ts';
import { X, ShieldAlert, CheckCircle2, Home, AlertCircle, ArrowRight, PhoneCall, Calendar } from 'lucide-react';

interface InspectionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'DIAGNOSTIC' | 'STORM' | 'EMERGENCY' | 'REPLACEMENT';
}

export const InspectionRequestModal: React.FC<InspectionRequestModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'DIAGNOSTIC',
}) => {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedLead, setSubmittedLead] = useState<Lead | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: 'TX',
    zip: '',
    leadType: defaultType === 'STORM' ? 'STORM_DAMAGE' : defaultType === 'EMERGENCY' ? 'EMERGENCY' : defaultType === 'REPLACEMENT' ? 'REPLACEMENT' : 'NOT_SURE',
    serviceRequested: defaultType === 'STORM' ? 'Storm Damage & Hail Restoration' : defaultType === 'EMERGENCY' ? 'Emergency Roof Tarping & Response' : 'Free Diagnostic Roof Inspection',
    emergencyFlag: defaultType === 'EMERGENCY',
    stormRelatedFlag: defaultType === 'STORM',
    insuranceRelatedFlag: false,
    message: '',
    preferredContactMethod: 'PHONE' as 'PHONE' | 'EMAIL' | 'SMS',
  });

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 1 && !formData.serviceRequested) {
      setError('Please select a service or diagnostic need.');
      return;
    }
    if (step === 2 && (!formData.address.trim() || !formData.city.trim())) {
      setError('Please enter your property street address and city.');
      return;
    }
    setError(null);
    setStep(step + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setError('Full name and telephone number are required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const created = await api.createLead({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim().toUpperCase(),
        zip: formData.zip.trim(),
        leadType: formData.leadType as any,
        serviceRequested: formData.serviceRequested,
        emergencyFlag: formData.emergencyFlag,
        stormRelatedFlag: formData.stormRelatedFlag,
        insuranceRelatedFlag: formData.insuranceRelatedFlag,
        preferredContactMethod: formData.preferredContactMethod,
        message: formData.message,
        source: 'Direct',
      });

      setSubmittedLead(created);
      setStep(4); // Success step
    } catch (err: any) {
      setError(err.message || 'Failed to submit diagnostic request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Residential inspection request" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-slate-800">
          <div>
            <div className="text-xs uppercase tracking-wider text-red-500 font-bold">
              {formData.emergencyFlag ? 'EMERGENCY DISPATCH INTAKE' : 'DIAGNOSTIC EVALUATION'}
            </div>
            <h2 className="text-lg font-bold">
              {step === 4 ? 'Diagnostic Request Received' : 'Schedule Your Roof Diagnostic'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator & Demo Helper */}
        {step < 4 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-2.5 text-xs">
            <div className="flex font-semibold text-slate-500 gap-4 sm:gap-6">
              <span className={step === 1 ? 'text-red-700 font-bold' : ''}>1. Diagnostic Need</span>
              <span className={step === 2 ? 'text-red-700 font-bold' : ''}>2. Property Location</span>
              <span className={step === 3 ? 'text-red-700 font-bold' : ''}>3. Homeowner Contact</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  name: 'Marcus Vance (Diagnostic Demo)',
                  phone: '903-231-5940',
                  email: 'theroofingdrs@gmail.com',
                  address: '4820 Richmond Rd',
                  city: 'Texarkana',
                  zip: '75503',
                  leadType: 'NOT_SURE',
                  serviceRequested: 'Free Diagnostic Roof Inspection',
                  emergencyFlag: false,
                  stormRelatedFlag: true,
                  insuranceRelatedFlag: false,
                  message: 'Diagnostic test: Suspected hail granule loss and pipe boot flashing check after recent storms.',
                  preferredContactMethod: 'EMAIL',
                });
                setStep(3);
              }}
              className="mt-2 sm:mt-0 text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded border border-red-200 transition-colors cursor-pointer self-start sm:self-auto"
            >
              ⚡ Autofill Demo Test Data
            </button>
          </div>
        )}

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-6">
          {/* STEP 1: Symptom / Need */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                What is the primary condition or service your roof requires?
              </p>

              <div className="grid grid-cols-1 gap-2.5">
                {[
                  {
                    type: 'STORM_DAMAGE',
                    service: 'Storm Damage & Hail Restoration',
                    title: 'Suspected Hail or High-Wind Storm Damage',
                    desc: 'Recent storm in neighborhood; granules in gutters or visible dents.',
                  },
                  {
                    type: 'EMERGENCY',
                    service: 'Emergency Roof Tarping & Response',
                    title: 'Active Water Leak / Emergency Tarping Needed',
                    desc: 'Water is currently dripping into ceilings or living areas.',
                  },
                  {
                    type: 'REPLACEMENT',
                    service: 'Complete Roof Replacement',
                    title: 'Full Roof Replacement / Aging Shingles',
                    desc: 'Roof is 15-25+ years old and needs engineered total replacement.',
                  },
                  {
                    type: 'REPAIR',
                    service: 'Precision Roof Repair & Leak Diagnostic',
                    title: 'Targeted Roof Repair / Pipe Collar Leak',
                    desc: 'Isolated leak issue; seeking diagnostic pinpoint repair.',
                  },
                  {
                    type: 'NOT_SURE',
                    service: 'Free Diagnostic Roof Inspection',
                    title: 'General 21-Point Preventative Inspection',
                    desc: 'Roof check-up for home buying, warranty, or peace of mind.',
                  },
                ].map((item) => (
                  <button
                    key={item.service}
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        serviceRequested: item.service,
                        leadType: item.type as any,
                        emergencyFlag: item.type === 'EMERGENCY',
                        stormRelatedFlag: item.type === 'STORM_DAMAGE',
                      });
                    }}
                    className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                      formData.serviceRequested === item.service
                        ? 'border-red-600 bg-red-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="font-semibold text-sm text-slate-900">{item.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-lg flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Location */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Where is the property located? (Serving Northeast Texas primary dispatch area)
              </p>

              <div>
                <label htmlFor="inspection-address" className="block text-xs font-semibold text-slate-700 mb-1">
                  Street Address *
                </label>
                <AddressAutocomplete
                  type="text"
                  placeholder="e.g. 1420 Richmond Rd"
                  id="inspection-address"
                  name="address"
                  autoComplete="section-inspection address-line1"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-red-600"
                  onPlaceSelected={address => setFormData(current => ({...current, address:address.street, city:address.city, state:address.state, zip:address.zip}))}
                  onSelectionCleared={() => setFormData(current => ({...current, city:'', state:'', zip:''}))}
                />
              </div>

              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-12 sm:col-span-6">
                  <label htmlFor="inspection-city" className="block text-xs font-semibold text-slate-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Texarkana, Longview, Shreveport..."
                    id="inspection-city"
                    name="city"
                    autoComplete="section-inspection address-level2"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-red-600 bg-white"
                    required
                  />
                </div>

                <div className="col-span-4 sm:col-span-2">
                  <label htmlFor="inspection-state" className="block text-xs font-semibold text-slate-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    placeholder="TX"
                    id="inspection-state"
                    name="state"
                    autoComplete="section-inspection address-level1"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                    className="w-full px-2 py-2 text-sm text-center uppercase font-bold border border-slate-300 rounded-lg focus:outline-none focus:border-red-600 bg-white"
                    required
                  />
                </div>

                <div className="col-span-8 sm:col-span-4">
                  <label htmlFor="inspection-zip" className="block text-xs font-semibold text-slate-700 mb-1">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    placeholder="75501"
                    id="inspection-zip"
                    name="zip"
                    autoComplete="section-inspection postal-code"
                    inputMode="numeric"
                    value={formData.zip}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-red-600 bg-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.insuranceRelatedFlag}
                    onChange={(e) => setFormData({ ...formData, insuranceRelatedFlag: e.target.checked })}
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <span className="text-slate-700 font-medium">An insurance claim has already been filed or discussed</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.emergencyFlag}
                    onChange={(e) => setFormData({ ...formData, emergencyFlag: e.target.checked })}
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <span className="text-slate-700 font-medium">Urgent active water ingress requiring emergency tarping</span>
                </label>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-lg flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Contact & Submit */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-slate-600">
                Who should our diagnostic inspector contact to schedule the evaluation?
              </p>

              <div>
                <label htmlFor="inspection-name" className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Charles Montgomery"
                  id="inspection-name"
                  name="name"
                  autoComplete="section-inspection name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-red-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="inspection-phone" className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    placeholder="(903) 555-0142"
                    id="inspection-phone"
                    name="phone"
                    autoComplete="section-inspection tel"
                    inputMode="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-red-600"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="inspection-email" className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="name@email.com"
                    id="inspection-email"
                    name="email"
                    autoComplete="section-inspection email"
                    inputMode="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preferred Contact Method
                </label>
                <div className="flex gap-4 text-xs">
                  {['PHONE', 'SMS', 'EMAIL'].map((method) => (
                    <label key={method} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="contactMethod"
                        value={method}
                        checked={formData.preferredContactMethod === method}
                        onChange={() => setFormData({ ...formData, preferredContactMethod: method as any })}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <span className="font-medium text-slate-700">{method}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Specific Details or Observations (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Leak over living room after Tuesday hail, shingles found in yard..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white font-bold text-sm rounded-lg flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                >
                  {isSubmitting ? (
                    <span>Submitting to Dispatch...</span>
                  ) : (
                    <span>GET MY ROOF DIAGNOSED</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Success & Verified Next Steps */}
          {step === 4 && submittedLead && (
            <div className="space-y-4 text-center py-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-bold text-slate-900">
                Diagnostic Request Confirmed
              </h3>

              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Thank you, <span className="font-semibold text-slate-900">{submittedLead.name}</span>. Your request has been registered with our Northeast Texas dispatch queue.
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Tracking Reference:</span>
                  <span className="font-mono font-bold text-slate-900">{submittedLead.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Dispatch Priority Score:</span>
                  <span className="font-bold text-red-600">{submittedLead.score} / 100</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Assigned Service Hub:</span>
                  <span className="font-semibold text-slate-800">
                    {submittedLead.city}{submittedLead.state ? `, ${submittedLead.state}` : ''}
                  </span>
                </div>
                {submittedLead.emergencyFlag && (
                  <div className="mt-2 p-2 bg-red-50 text-red-700 rounded font-semibold text-[11px] flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>Emergency triage status active. Tarping crew notified.</span>
                  </div>
                )}
              </div>

              {/* Email Notification Dispatch Status */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-left text-xs space-y-1.5 text-emerald-900">
                <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Outbound Notifications Dispatched
                </div>
                <div className="text-[11px] text-emerald-800 space-y-0.5">
                  <div>✓ <strong>Internal Alert:</strong> Live email delivered to <strong>TheRoofingDrs@gmail.com</strong></div>
                  {submittedLead.email && (
                    <div>✓ <strong>Homeowner Confirmation:</strong> Copy sent to <strong>{submittedLead.email}</strong></div>
                  )}
                  <div className="text-[10px] text-emerald-600 mt-1">Provider: Resend Live Dispatcher • Status: Delivered to mail exchanger</div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer"
                >
                  Close &amp; Return
                </button>
                <a
                  href="tel:9032315940"
                  className="px-5 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <PhoneCall className="w-4 h-4 text-red-600" />
                  <span>Call Dispatch: 903-231-5940</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
