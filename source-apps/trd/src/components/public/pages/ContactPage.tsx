import React, { useState } from 'react';
import { SeoHead } from '../../common/SeoHead.tsx';
import {
  PhoneCall,
  Mail,
  Clock,
  ShieldCheck,
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  Send,
  Loader2,
} from 'lucide-react';
import { api } from '../../../lib/api.ts';

interface ContactPageProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenIntake: (type?: 'DIAGNOSTIC' | 'STORM' | 'EMERGENCY' | 'REPLACEMENT') => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  currentPath,
  onNavigate,
  onOpenIntake,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: 'TX',
    zip: '',
    service: 'DIAGNOSTIC_INSPECTION',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.createLead({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim().toUpperCase() || 'TX',
        zip: formData.zip.trim(),
        leadType: 'INSPECTION' as any,
        serviceRequested: formData.service as any,
        message: formData.notes,
        source: 'Direct',
      });

      setSubmitted(true);
    } catch (err: any) {
      console.error('Lead submission failed:', err);
      setError(err instanceof Error ? err.message : 'Delivery is not confirmed. Please retry or call 903-231-5940.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 pb-20">
      <SeoHead
        title="Contact The Roof Doctors | Northeast Texas Roofing Dispatch"
        description="Contact The Roof Doctors in Texarkana, TX. Phone: 903-231-5940. Email: TheRoofingDrs@gmail.com. Schedule a free 21-point inspection or 24/7 storm dispatch."
        canonicalPath={currentPath}
      />

      {/* Hero Header */}
      <section className="bg-slate-950 text-white py-14 px-4 sm:px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-red-600/20 text-red-400 border border-red-500/30 uppercase tracking-wide">
            <PhoneCall className="w-4 h-4 text-red-400" />
            <span>Direct Dispatch &amp; Inspection Scheduling</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            Connect With The Roof Doctors
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Based in Texarkana, TX, our certified inspectors provide rapid dispatch across Bowie, Cass, Lamar, Hopkins, Gregg, Smith, and Harrison Counties.
          </p>
        </div>
      </section>

      {/* Contact Channels & Direct Intake Form */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Verified Contact Coordinates */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                Contact & Dispatch
              </h2>

              <div className="space-y-5 text-xs text-slate-600">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-slate-900 block font-bold text-sm">Telephone Dispatch</strong>
                    <a href="tel:9032315940" className="text-slate-900 font-bold hover:text-red-600 text-sm">
                      903-231-5940
                    </a>
                    <span className="block text-[11px] text-slate-500">24/7 Emergency Storm Tarping Available</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-slate-900 block font-bold text-sm">Email Inquiries</strong>
                    <a href="mailto:TheRoofingDrs@gmail.com" className="text-slate-900 font-bold hover:text-red-600">
                      TheRoofingDrs@gmail.com
                    </a>
                    <span className="block text-[11px] text-slate-500">Official Site: www.TheRoofingDrs.com</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-slate-900 block font-bold text-sm">Business Hours</strong>
                    <span>Monday – Saturday: 7:00 AM – 7:00 PM</span>
                    <span className="block text-red-600 font-bold text-[11px]">Sunday: On-Call for Severe Weather Emergencies</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>Texas HB 2102 Compliant Business</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                The Roof Doctors operates with complete legal and ethical transparency. We never waive, absorb, or rebate insurance deductibles, protecting our homeowners from insurance fraud liability.
              </p>
            </div>
          </div>

          {/* Right Column: Direct Dispatch Booking Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">
                Request an Inspection or Dispatch
              </h2>
              <p className="text-xs text-slate-600 mb-6">
                Fill out your details below for prompt dispatch or call us directly at 903-231-5940.
              </p>

              {submitted ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-4">
                  <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-emerald-950">
                    Inspection Request Received
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-900 max-w-md mx-auto leading-relaxed">
                    Thank you! A certified diagnostic project manager from our dispatch team has received your request and will call you shortly at <strong>{formData.phone}</strong> to confirm scheduling.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="residential-contact-name">
                        Full Name *
                      </label>
                      <input id="residential-contact-name" name="name" autoComplete="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Smith"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-red-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="residential-contact-phone">
                        Phone Number *
                      </label>
                      <input id="residential-contact-phone" name="phone" autoComplete="tel" inputMode="tel"
                        type="tel"
                        required={!formData.email.trim()}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="903-555-0199"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-red-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="residential-contact-email">
                      Email Address *
                    </label>
                    <input id="residential-contact-email" name="email" autoComplete="email" inputMode="email"
                      type="email"
                      required={!formData.phone.trim()}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="residential-contact-address">
                      Street Address *
                    </label>
                    <input id="residential-contact-address" name="address" autoComplete="address-line1"
                      type="text"

                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="e.g. 1420 Richmond Rd"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-12 sm:col-span-6">
                      <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="residential-contact-city">
                        City *
                      </label>
                      <input id="residential-contact-city" name="city" autoComplete="address-level2"
                        type="text"

                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="e.g. Texarkana, Longview, Shreveport..."
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-red-600"
                      />
                    </div>

                    <div className="col-span-4 sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="residential-contact-state">
                        State *
                      </label>
                      <input id="residential-contact-state" name="state" autoComplete="address-level1"
                        type="text"
                        maxLength={2}

                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                        placeholder="TX"
                        className="w-full px-2.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 text-center font-bold uppercase focus:outline-none focus:border-red-600"
                      />
                    </div>

                    <div className="col-span-8 sm:col-span-4">
                      <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="residential-contact-zip">
                        Zip Code
                      </label>
                      <input id="residential-contact-zip" name="zip" autoComplete="postal-code" inputMode="numeric"
                        type="text"
                        value={formData.zip}
                        onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                        placeholder="75501"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-red-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Service Requested *
                    </label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-red-600"
                    >
                      <option value="DIAGNOSTIC_INSPECTION">Free 21-Point Roof Health Inspection ($0 Fee)</option>
                      <option value="STORM_DAMAGE">Recent Storm / Hail Damage Assessment</option>
                      <option value="ROOF_REPAIR">Active Leak / Pipe Boot / Flashing Repair</option>
                      <option value="ROOF_REPLACEMENT">Full Roof Replacement Consultation</option>
                      <option value="INSURANCE_CLAIM">Insurance Claim & Adjuster Meeting Support</option>
                      <option value="EMERGENCY_TARP">Emergency Tarping Dispatch</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Describe What You Are Experiencing
                    </label>
                    <textarea
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="e.g., We had hail yesterday, active leak in hallway ceiling, or looking for replacement quote..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting Request...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>SUBMIT INSPECTION REQUEST</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
