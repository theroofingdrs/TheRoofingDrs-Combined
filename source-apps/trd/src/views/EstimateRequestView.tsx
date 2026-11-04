import { submitInquiry } from '../../../../shared/intake-client.ts';
import React, { useState } from 'react';

type EstimateRequestViewProps = { onNavigate: (path: string) => void };

const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-red-600 focus:outline-none';
const labelClass = 'mb-1 block text-sm font-semibold text-slate-700';

export const EstimateRequestView: React.FC<EstimateRequestViewProps> = ({ onNavigate }) => {
  const [form, setForm] = useState({
    name: '', address: '', city: '', state: 'TX', zip: '', phone: '', email: '',
    roofSize: '', complexity: 'Unknown', pitch: 'Unknown', material: 'Architectural shingles',
    reasonForWork: 'Not sure', dateOfLoss: '', insurer: '', policyNumber: '', claimNumber: '',
    adjusterName: '', adjusterPhone: '', notes: '', preferredContactMethod: 'PHONE',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await submitInquiry('/residential/api/v1/leads', {
          name: form.name.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state,
          zip: form.zip.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          leadType: form.reasonForWork.toLowerCase().includes('storm') || form.reasonForWork.toLowerCase().includes('wind') ? 'STORM_DAMAGE' : 'NOT_SURE',
          serviceRequested: 'Residential Roof Estimate Request',
          stormRelatedFlag: /storm|hail|wind/i.test(form.reasonForWork),
          insuranceRelatedFlag: Boolean(form.insurer || form.policyNumber || form.claimNumber || form.adjusterName || form.adjusterPhone),
          preferredContactMethod: form.preferredContactMethod,
          source: 'Residential Estimate Request',
          landingPage: '/residential/estimate-request',
          message: form.notes,
          estimateDetails: {
            approximateRoofSize: form.roofSize,
            complexity: form.complexity,
            pitch: form.pitch,
            requestedMaterial: form.material,
            reasonForWork: form.reasonForWork,
            dateOfLoss: form.dateOfLoss,
            insuranceCompany: form.insurer,
            policyNumber: form.policyNumber,
            claimNumber: form.claimNumber,
            adjusterName: form.adjusterName,
            adjusterPhone: form.adjusterPhone,
            notes: form.notes,
          },
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not save your request. Please call us instead.');
    } finally {
      setBusy(false);
    }
  };

  if (submitted) return (
    <main className="min-h-[70vh] bg-slate-50 px-4 py-16 text-slate-900">
      <section className="mx-auto max-w-2xl rounded-2xl border border-green-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold">Your estimate request has been received</h1>
        <p className="mt-3 text-slate-600">Our team will review the property and roof details and follow up. This is not a guaranteed quote. Final pricing depends on verified measurements, inspection findings, material selection, access, and scope.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a className="rounded-lg bg-red-700 px-5 py-3 font-semibold text-white" href="tel:9032315940">Call (903) 231-5940</a>
          <button className="rounded-lg border border-slate-300 px-5 py-3 font-semibold" onClick={() => onNavigate('/')}>Return to Home</button>
        </div>
      </section>
    </main>
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:py-14">
      <section className="mx-auto max-w-4xl">
        <button type="button" onClick={() => onNavigate('/')} className="mb-5 text-sm font-semibold text-red-700 hover:underline">← Back to The Roof Doctors</button>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-700">The Roof Doctors Residential</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Request a Roof Estimate</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Tell us about the property and roof. Your name and property address are required. Provide either a phone number or an email address so our team can follow up. Roof and insurance details are optional.</p>
          <form onSubmit={submit} className="mt-8 space-y-8">
            <section>
              <h2 className="mb-4 border-b border-slate-200 pb-2 text-lg font-bold">Your Contact and Property</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className={labelClass}>Full name *</label><input className={inputClass} autoComplete="name" required value={form.name} onChange={(e) => update('name', e.target.value)} /></div>
                <div><label className={labelClass}>Property address *</label><input className={inputClass} autoComplete="street-address" required value={form.address} onChange={(e) => update('address', e.target.value)} /></div>
                <div><label className={labelClass}>City</label><input className={inputClass} autoComplete="address-level2" value={form.city} onChange={(e) => update('city', e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-3"><div><label className={labelClass}>State</label><input className={inputClass} autoComplete="address-level1" value={form.state} onChange={(e) => update('state', e.target.value)} /></div><div><label className={labelClass}>ZIP</label><input className={inputClass} autoComplete="postal-code" value={form.zip} onChange={(e) => update('zip', e.target.value)} /></div></div>
                <div><label className={labelClass}>Phone {form.email.trim() ? '(optional)' : '*'}</label><input className={inputClass} autoComplete="tel" type="tel" required={!form.email.trim()} value={form.phone} onChange={(e) => update('phone', e.target.value)} /></div>
                <div><label className={labelClass}>Email {form.phone.trim() ? '(optional)' : '*'}</label><input className={inputClass} autoComplete="email" type="email" required={!form.phone.trim()} value={form.email} onChange={(e) => update('email', e.target.value)} /></div>
              </div>
            </section>
            <section>
              <h2 className="mb-4 border-b border-slate-200 pb-2 text-lg font-bold">Roof Details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className={labelClass}>Approximate roof size</label><input className={inputClass} placeholder="Square feet or roofing squares" value={form.roofSize} onChange={(e) => update('roofSize', e.target.value)} /></div>
                <div><label className={labelClass}>Roof complexity</label><select className={inputClass} value={form.complexity} onChange={(e) => update('complexity', e.target.value)}><option>Unknown</option><option>Simple</option><option>Moderate</option><option>Complex</option></select></div>
                <div><label className={labelClass}>Roof pitch</label><select className={inputClass} value={form.pitch} onChange={(e) => update('pitch', e.target.value)}><option>Unknown</option><option>Low slope</option><option>3/12</option><option>4/12</option><option>5/12</option><option>6/12</option><option>7/12 or greater</option></select></div>
                <div><label className={labelClass}>Preferred material</label><select className={inputClass} value={form.material} onChange={(e) => update('material', e.target.value)}><option>Architectural shingles</option><option>Impact resistant shingles</option><option>Metal roofing</option><option>Not sure</option></select></div>
                <div><label className={labelClass}>Reason for work</label><select className={inputClass} value={form.reasonForWork} onChange={(e) => update('reasonForWork', e.target.value)}><option>Not sure</option><option>Storm or hail damage</option><option>Wind damage</option><option>Water leak</option><option>Other damage</option><option>Age or normal wear</option><option>Planned upgrade</option></select></div>
                <div><label className={labelClass}>Preferred contact method</label><select className={inputClass} value={form.preferredContactMethod} onChange={(e) => update('preferredContactMethod', e.target.value)}><option value="PHONE">Phone</option><option value="EMAIL">Email</option><option value="SMS">Text message</option></select></div>
              </div>
            </section>
            <section>
              <h2 className="mb-1 text-lg font-bold">Insurance and Damage Details <span className="text-sm font-normal text-slate-500">(optional)</span></h2>
              <p className="mb-4 text-sm text-slate-600">Leave these blank if you are paying out of pocket or do not have a claim.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className={labelClass}>Date of loss, if known</label><input className={inputClass} type="date" value={form.dateOfLoss} onChange={(e) => update('dateOfLoss', e.target.value)} /></div>
                <div><label className={labelClass}>Insurance company</label><input className={inputClass} value={form.insurer} onChange={(e) => update('insurer', e.target.value)} /></div>
                <div><label className={labelClass}>Policy number</label><input className={inputClass} value={form.policyNumber} onChange={(e) => update('policyNumber', e.target.value)} /></div>
                <div><label className={labelClass}>Claim number</label><input className={inputClass} value={form.claimNumber} onChange={(e) => update('claimNumber', e.target.value)} /></div>
                <div><label className={labelClass}>Adjuster name</label><input className={inputClass} value={form.adjusterName} onChange={(e) => update('adjusterName', e.target.value)} /></div>
                <div><label className={labelClass}>Adjuster phone number</label><input className={inputClass} type="tel" value={form.adjusterPhone} onChange={(e) => update('adjusterPhone', e.target.value)} /></div>
                <div className="sm:col-span-2"><label className={labelClass}>Additional notes</label><textarea className={inputClass} rows={4} value={form.notes} onChange={(e) => update('notes', e.target.value)} /></div>
              </div>
            </section>
            {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row">
              <button type="submit" disabled={busy} className="rounded-lg bg-red-700 px-6 py-3 font-bold text-white hover:bg-red-800 disabled:opacity-60">{busy ? 'Submitting…' : 'Submit Estimate Request'}</button>
              <a href="tel:9032315940" className="rounded-lg border border-slate-300 px-6 py-3 text-center font-bold">Call (903) 231-5940</a>
            </div>
            <p className="text-xs leading-5 text-slate-500">We do not provide a guaranteed quote from customer supplied details alone. Final pricing depends on verified measurements, inspection, material, roof condition, and final scope. Do not enter payment information.</p>
          </form>
        </div>
      </section>
    </main>
  );
};
