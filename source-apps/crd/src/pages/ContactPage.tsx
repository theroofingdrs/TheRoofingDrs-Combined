import { submitInquiry } from '../../../../shared/intake-client.ts';
import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  AlertTriangle,
  Building,
  ShieldCheck,
} from 'lucide-react';
import { SeoMeta } from '../components/SeoMeta';
import { BUSINESS_INFO } from '../constants';
import { LeadType, PropertyType } from '../types';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    propertyAddress: '',
    propertyType: 'Commercial Retail / Office' as PropertyType,
    leadType: 'Inspection' as LeadType,
    isEmergency: false,
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || (!formData.phone.trim() && !formData.email.trim())) {
      setErrorMsg('Please provide your name and a phone number or email address.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      await submitInquiry('/commercial/api/leads', {
          fullName: formData.name,
          companyName: formData.company,
          email: formData.email,
          phone: formData.phone,
          propertyAddress: formData.propertyAddress,
          propertyType: formData.propertyType,
          leadType: formData.isEmergency ? 'Emergency' : formData.leadType,
          urgency: formData.isEmergency ? 'Emergency (Active Leak)' : 'Standard Business Hours',
          notes: formData.message,
          source: 'Contact Page Form',
      });
      setSubmitted(true);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Delivery is not confirmed. Please retry or call (903) 231-5940.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans-crd pb-24">
      <SeoMeta
        title="Contact Commercial Roof Doctors | Texarkana Commercial Roofing"
        description="Contact Commercial Roof Doctors in Texarkana, TX. Phone: (903) 231-5940. Commercial roof inspections, emergency response, and property protection programs."
        canonicalPath="/contact"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Contact', url: '/contact' },
        ]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#0e1424] via-[#0a0f1c] to-[#090d16] border-b border-slate-800 pt-14 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono-crd uppercase tracking-wider">
            <span>Direct Commercial Dispatch</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight uppercase text-white leading-tight">
            Connect With Commercial Roof Doctors
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Reach our field management team for emergency leak triage, detailed roof condition audits, or commercial asset management planning.
          </p>
        </div>
      </section>

      {/* Main Contact Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Direct Info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-[#0e1422] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
              <h2 className="text-2xl font-heading font-black uppercase text-white border-b border-slate-800 pb-3">
                Commercial Dispatch
              </h2>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-amber-400 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs font-mono-crd uppercase">Direct Phone Line</span>
                    <a href={`tel:${BUSINESS_INFO.phoneRaw}`} className="text-white text-base font-bold hover:text-amber-400">
                      {BUSINESS_INFO.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-amber-400 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs font-mono-crd uppercase">Commercial Inquiries Email</span>
                    <a href={`mailto:${BUSINESS_INFO.email}`} className="text-white text-base font-bold hover:text-amber-400">
                      {BUSINESS_INFO.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-amber-400 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs font-mono-crd uppercase">Commercial Service Area</span>
                    <span className="text-white text-sm font-semibold block">
                      {BUSINESS_INFO.statesCovered.join(", ")}
                    </span>
                    <span className="text-slate-400 text-xs">
                      Service area extends up to 250 miles from Texarkana. Project availability is confirmed by location and scope.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-amber-400 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs font-mono-crd uppercase">Operating Schedule</span>
                    <span className="text-white text-sm font-semibold block">
                      {BUSINESS_INFO.hours}
                    </span>
                    <span className="text-red-400 text-xs font-bold">
                      Emergency response teams on-call 24/7 for storm events
                    </span>
                  </div>
                </div>
              </div>

              {/* Service-Area Disclosure */}
              <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-1">
                <span className="font-bold text-amber-400 uppercase font-mono-crd block">
                  On-Site Commercial Service Model:
                </span>
                Our field teams travel directly to commercial properties throughout our service area. Diagnostics, inspections, and repairs are performed on-site at your facility.
              </div>
            </div>
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="lg:col-span-7 bg-[#0e1422] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <h2 className="text-2xl font-heading font-black uppercase text-white border-b border-slate-800 pb-3">
              Direct Commercial Inquiry Form
            </h2>

            {submitted ? (
              <div className="p-8 text-center space-y-4 bg-slate-900/60 rounded-xl border border-emerald-500/40">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="text-2xl font-heading font-bold uppercase text-white">Inquiry Received</h3>
                <p className="text-sm text-slate-300 max-w-md mx-auto">
                  Thank you. Your inquiry has reached our Operations team. Our team will contact you to confirm your needs and availability. No appointment is booked yet.
                </p>
                <div className="pt-2 text-xs font-mono-crd text-slate-400">
                  Direct Immediate Dispatch: <a href={`tel:${BUSINESS_INFO.phoneRaw}`} className="text-amber-400 font-bold">{BUSINESS_INFO.phone}</a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-red-950/60 border border-red-800 rounded text-xs text-red-300">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-mono-crd uppercase text-slate-400" htmlFor="commercial-contact-name">Your Full Name *</label>
                    <input id="commercial-contact-name" name="name" autoComplete="name"
                      type="text"
                      required
                      placeholder="e.g., Mark Davis"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm text-white focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono-crd uppercase text-slate-400" htmlFor="commercial-contact-company">Company / Property Entity</label>
                    <input id="commercial-contact-company" name="company" autoComplete="organization"
                      type="text"
                      placeholder="e.g., Ark-La Logistics LLC"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm text-white focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-mono-crd uppercase text-slate-400" htmlFor="commercial-contact-phone">Direct Phone *</label>
                    <input id="commercial-contact-phone" name="phone" autoComplete="tel" inputMode="tel"
                      type="tel"
                      required={!formData.email.trim()}
                      placeholder="(903) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm text-white focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono-crd uppercase text-slate-400" htmlFor="commercial-contact-email">Email Address</label>
                    <input id="commercial-contact-email" name="email" autoComplete="email" inputMode="email"
                      type="email"
                      placeholder="mark@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm text-white focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono-crd uppercase text-slate-400" htmlFor="commercial-contact-propertyAddress">Property Address / City</label>
                  <input id="commercial-contact-propertyAddress" name="propertyAddress" autoComplete="address-line1"
                    type="text"
                    placeholder="e.g., 1200 Industrial Pkwy, Texarkana, TX"
                    value={formData.propertyAddress}
                    onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm text-white focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-mono-crd uppercase text-slate-400">Property Type</label>
                    <select
                      value={formData.propertyType}
                      onChange={(e) => setFormData({ ...formData, propertyType: e.target.value as PropertyType })}
                      className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm text-white focus:border-amber-500 outline-none"
                    >
                      <option value="Commercial Retail / Office">Commercial Retail / Office</option>
                      <option value="Industrial / Warehouse / Manufacturing">Industrial / Warehouse</option>
                      <option value="Multifamily / Apartments / Condos">Multifamily / Apartments</option>
                      <option value="Church / Religious Facility">Church / Religious Facility</option>
                      <option value="School / Educational Institution">School / Educational</option>
                      <option value="Healthcare / Medical Clinic / Hospital">Healthcare / Medical</option>
                      <option value="Government / Municipal Building">Government / Municipal</option>
                      <option value="Other Commercial Facility">Other Commercial Facility</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono-crd uppercase text-slate-400">Inquiry Nature</label>
                    <select
                      value={formData.leadType}
                      onChange={(e) => setFormData({ ...formData, leadType: e.target.value as LeadType })}
                      className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm text-white focus:border-amber-500 outline-none"
                    >
                      <option value="Inspection">Commercial Roof Inspection</option>
                      <option value="Repair">Active Roof Leak / Repair</option>
                      <option value="Storm Damage">Storm Damage / Hail / Wind</option>
                      <option value="Insurance Claim">Insurance Claim Documentation</option>
                      <option value="Coating/Restoration">Roof Coating / Restoration Feasibility</option>
                      <option value="Replacement">Commercial Replacement (Re-Roof)</option>
                      <option value="PPP/Maintenance">CRD PPP™ Asset Protection</option>
                      <option value="Property Management">Multi-Property Portfolio</option>
                    </select>
                  </div>
                </div>

                {/* Emergency Toggle */}
                <div className="p-3 rounded bg-red-950/40 border border-red-900/60 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="contact-emergency-check"
                    checked={formData.isEmergency}
                    onChange={(e) => setFormData({ ...formData, isEmergency: e.target.checked })}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                  />
                  <label htmlFor="contact-emergency-check" className="text-xs text-red-200 cursor-pointer font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    <span>This is an active commercial leak emergency requiring immediate dispatch</span>
                  </label>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono-crd uppercase text-slate-400">Details / Specific Issues</label>
                  <textarea
                    rows={3}
                    placeholder="Describe leak location, roof age, square footage, or storm date..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm text-white focus:border-amber-500 outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Submitting...' : 'Submit Commercial Inquiry'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
