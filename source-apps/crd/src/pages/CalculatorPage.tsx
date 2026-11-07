import { submitInquiry } from '../../../../shared/intake-client.ts';
import React, { useState } from 'react';
import { Calculator, CheckCircle2, ArrowRight, ArrowLeft, ShieldAlert, FileText, AlertTriangle, Building, Layers, Wrench } from 'lucide-react';
import { SeoMeta } from '../components/SeoMeta';
import { BUSINESS_INFO } from '../constants';
import { PropertyType, RoofSystemType } from '../types';

interface CalculatorPageProps {
  onOpenInspection: () => void;
  onOpenEmergency: () => void;
}

export const CalculatorPage: React.FC<CalculatorPageProps> = ({ onOpenInspection, onOpenEmergency }) => {
  const [step, setStep] = useState<number>(1);
  const [inputs, setInputs] = useState({
    propertyType: 'Commercial' as PropertyType,
    address: '',
    squareFootage: 12000,
    roofSystem: 'TPO' as RoofSystemType,
    desiredWork: 'Replacement' as 'Replacement' | 'Restoration/Coating' | 'Repair',
    condition: 'Aging / Suspect',
    accessComplexity: 'Standard' as 'Standard' | 'Moderate' | 'Complex / High-Rise',
    contactName: '',
    companyName: '',
    phone: '',
    email: '',
    reasonForWork: 'Not sure',
    dateOfLoss: '',
    insurer: '',
    policyNumber: '',
    claimNumber: '',
    adjusterName: '',
    adjusterPhone: '',
    notes: '',
  });

  const [calculationResult, setCalculationResult] = useState<{
    estimatedLow: number;
    estimatedHigh: number;
    unitLow: number;
    unitHigh: number;
    disclaimer: string;
    calculationId?: string;
  } | null>(null);

  const [isCalculating, setIsCalculating] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState('');

  // Isolated calculation function
  const runCalculation = async () => {
    setIsCalculating(true);
    try {
      const res = await fetch('/api/calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCalculationResult(data);
        setStep(4);
      } else {
        throw new Error('Calculation failed');
      }
    } catch (e) {
      // Fallback local isolated calculation
      const sqft = Number(inputs.squareFootage) || 10000;
      let minRate = 4.5;
      let maxRate = 8.5;
      if (inputs.desiredWork === 'Replacement') {
        minRate = 8.0;
        maxRate = 16.0;
        if (inputs.roofSystem === 'Metal') { minRate += 3.0; maxRate += 6.0; }
        if (inputs.roofSystem === 'PVC') { minRate += 1.5; maxRate += 3.0; }
      } else if (inputs.desiredWork === 'Restoration/Coating') {
        minRate = 3.5;
        maxRate = 7.5;
      } else if (inputs.desiredWork === 'Repair') {
        minRate = 1.5;
        maxRate = 3.5;
      }
      if (inputs.accessComplexity === 'Complex / High-Rise') {
        minRate *= 1.25;
        maxRate *= 1.35;
      }

      setCalculationResult({
        estimatedLow: Math.round(sqft * minRate),
        estimatedHigh: Math.round(sqft * maxRate),
        unitLow: Math.round(minRate * 100) / 100,
        unitHigh: Math.round(maxRate * 100) / 100,
        disclaimer: BUSINESS_INFO.calculatorDisclaimer,
      });
      setStep(4);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    try {
      await submitInquiry('/commercial/api/calculator', { ...inputs, submitLead: true });
      setSubmissionError('');
      setSubmitted(true);
      setStep(5);
    } catch (e) {
      setSubmissionError(e instanceof Error ? e.message : 'Submission failed. Please retry.');
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans-crd pb-24">
      {submissionError && <p role="alert" className="p-4 text-red-300">{submissionError}</p>}
      <SeoMeta
        title="Commercial Roof Cost Calculator | Planning Estimates"
        description="Estimate commercial roof replacement, restoration, and coating planning budgets for facilities across Texas, Arkansas, Louisiana, and Oklahoma. Educational budget calculator."
        canonicalPath="/commercial-roof-cost-calculator"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Cost Calculator', url: '/commercial-roof-cost-calculator' },
        ]}
      />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-[#0e1424] to-[#090d16] border-b border-slate-800 pt-12 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono-crd uppercase tracking-wider">
            <Calculator className="w-3.5 h-3.5" />
            Commercial Capital Budgeting Tool
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-black tracking-tight uppercase text-white">
            Commercial Roof Cost Calculator
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Calculate preliminary planning budget ranges for commercial roof replacement, fluid-applied restoration coatings, and repairs across Texas, Arkansas, Louisiana, and Oklahoma.
          </p>
        </div>
      </section>

      {/* Calculator Container */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 mt-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 text-xs font-mono-crd">
          {[
            { num: 1, label: 'Property' },
            { num: 2, label: 'Roof' },
            { num: 3, label: 'Scope' },
            { num: 4, label: 'Planning Range' },
            { num: 5, label: 'Assessment' },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold transition-all ${
                  step === s.num
                    ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/20'
                    : step > s.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {step > s.num ? '✓' : s.num}
              </div>
              <span className={`hidden sm:inline ${step === s.num ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Wizard Card */}
        <div className="bg-[#0e1422] border border-slate-700/80 rounded-xl shadow-2xl p-6 sm:p-8">
          {/* STEP 1: PROPERTY */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-xl font-heading font-black uppercase text-white flex items-center gap-2">
                  <Building className="w-5 h-5 text-amber-500" />
                  Step 1: Commercial Property Information
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Identify the facility archetype and regional location to account for code and structural parameters.
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono-crd uppercase tracking-wider text-slate-300 mb-2">
                  Commercial Facility Type *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    'Commercial',
                    'Industrial',
                    'Retail',
                    'Office',
                    'Healthcare',
                    'School',
                    'Church',
                    'Apartment',
                    'HOA',
                  ].map((pt) => (
                    <button
                      key={pt}
                      type="button"
                      onClick={() => setInputs({ ...inputs, propertyType: pt as PropertyType })}
                      className={`p-3 rounded text-xs font-bold text-left border transition-all ${
                        inputs.propertyType === pt
                          ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-md shadow-amber-500/10'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {pt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono-crd uppercase tracking-wider text-slate-300 mb-1">
                  Property Address *
                </label>
                <input
                  type="text"
                  required
                  autoComplete="street-address"
                  placeholder="e.g. 1500 Industrial Pkwy, Texarkana, TX"
                  value={inputs.address}
                  onChange={(e) => setInputs({ ...inputs, address: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="border-t border-slate-800 pt-4 space-y-3">
                <h3 className="text-sm font-heading font-bold uppercase text-white">Your Contact Information</h3>
                <p className="text-xs text-slate-400">Enter your contact information before viewing a planning range. We use it to save your request and follow up about the property.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Full Name *</label>
                    <input required autoComplete="name" type="text" value={inputs.contactName} onChange={(e) => setInputs({ ...inputs, contactName: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2.5 text-sm text-white focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Company / Facility Name</label>
                    <input autoComplete="organization" type="text" value={inputs.companyName} onChange={(e) => setInputs({ ...inputs, companyName: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2.5 text-sm text-white focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Phone Number *</label>
                    <input required autoComplete="tel" type="tel" value={inputs.phone} onChange={(e) => setInputs({ ...inputs, phone: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2.5 text-sm text-white focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Email Address *</label>
                    <input required autoComplete="email" type="email" value={inputs.email} onChange={(e) => setInputs({ ...inputs, email: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2.5 text-sm text-white focus:border-amber-500" />
                  </div>
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <button type="button" onClick={() => {
                  if (!inputs.contactName.trim() || !inputs.address.trim() || !inputs.phone.trim() || !inputs.email.trim()) {
                    window.alert('Please enter your full name, property address, phone number, and email before continuing.');
                    return;
                  }
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputs.email.trim())) {
                    window.alert('Please enter a valid email address.');
                    return;
                  }
                  setStep(2);
                }} className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-black text-sm uppercase tracking-wider px-6 py-2.5 rounded flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20">
                  <span>Continue to Roof Parameters</span><ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: ROOF */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-xl font-heading font-black uppercase text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-500" />
                  Step 2: Roof Geometry & System
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Specify approximate square footage and existing or preferred membrane system.
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-mono-crd uppercase tracking-wider text-slate-300">
                    Approximate Square Footage *
                  </label>
                  <span className="text-amber-400 font-mono-crd font-bold text-sm">
                    {inputs.squareFootage.toLocaleString()} sq ft ({Math.round(inputs.squareFootage / 100)} squares)
                  </span>
                </div>
                <input
                  type="range"
                  min="2500"
                  max="100000"
                  step="2500"
                  value={inputs.squareFootage}
                  onChange={(e) => setInputs({ ...inputs, squareFootage: Number(e.target.value) })}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[11px] text-slate-500 font-mono-crd mt-1">
                  <span>2,500 sq ft</span>
                  <span>25,000 sq ft</span>
                  <span>50,000 sq ft</span>
                  <span>100,000+ sq ft</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono-crd uppercase tracking-wider text-slate-300 mb-2">
                  Existing or Target Roof System *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'TPO', label: 'TPO (Single-Ply)' },
                    { id: 'EPDM', label: 'EPDM (Rubber)' },
                    { id: 'PVC', label: 'PVC (Chemical Resistant)' },
                    { id: 'Modified Bitumen', label: 'Modified Bitumen' },
                    { id: 'BUR', label: 'Built-Up / Tar & Gravel' },
                    { id: 'Metal', label: 'Commercial Metal' },
                  ].map((sys) => (
                    <button
                      key={sys.id}
                      type="button"
                      onClick={() => setInputs({ ...inputs, roofSystem: sys.id as RoofSystemType })}
                      className={`p-3 rounded text-xs font-bold text-left border transition-all ${
                        inputs.roofSystem === sys.id
                          ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-md shadow-amber-500/10'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {sys.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 uppercase"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-black text-sm uppercase tracking-wider px-6 py-2.5 rounded flex items-center gap-2 cursor-pointer"
                >
                  <span>Continue to Scope</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SCOPE & CONDITION */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-xl font-heading font-black uppercase text-white flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-amber-500" />
                  Step 3: Desired Scope & Condition
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Select your primary objective: complete replacement, fluid-applied restoration coating, or repair.
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono-crd uppercase tracking-wider text-slate-300 mb-2">
                  Desired Project Scope *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'Replacement',
                      title: 'Complete Replacement',
                      desc: 'Full tear-off or re-cover with new engineered membrane & insulation',
                    },
                    {
                      id: 'Restoration/Coating',
                      title: 'Fluid Restoration Coating',
                      desc: 'Seamless silicone or acrylic coating over sound existing substrate',
                    },
                    {
                      id: 'Repair',
                      title: 'Targeted Commercial Repair',
                      desc: 'Flashing, seam, drain, and localized leak remediation',
                    },
                  ].map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setInputs({ ...inputs, desiredWork: w.id as any })}
                      className={`p-3.5 rounded text-left border transition-all ${
                        inputs.desiredWork === w.id
                          ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <div className="font-heading font-bold text-sm uppercase">{w.title}</div>
                      <div
                        className={`text-xs mt-1 ${
                          inputs.desiredWork === w.id ? 'text-slate-900' : 'text-slate-400'
                        }`}
                      >
                        {w.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono-crd uppercase tracking-wider text-slate-300 mb-2">
                  Current Roof Condition
                </label>
                <select
                  value={inputs.condition}
                  onChange={(e) => setInputs({ ...inputs, condition: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Good / Preventative">Good Condition (Planning Preventative Action)</option>
                  <option value="Aging / Suspect">Aging / Approaching Expected Service Life</option>
                  <option value="Active Leaks">Active Leaks in Isolated Areas</option>
                  <option value="Severe Storm / Hail Damaged">Severe Storm, Hail or Wind Impacted</option>
                  <option value="Unknown">Unknown (Need Comprehensive Forensic Audit)</option>
                </select>
              </div>

              <div className="border-t border-slate-800 pt-4 space-y-3">
                <h3 className="text-sm font-heading font-bold uppercase text-white">Damage and Insurance Details <span className="text-slate-500 font-normal normal-case">(optional)</span></h3>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Reason for Repair or Replacement</label>
                  <select value={inputs.reasonForWork} onChange={(e) => setInputs({ ...inputs, reasonForWork: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2.5 text-sm text-white focus:border-amber-500">
                    <option>Not sure</option><option>Storm or hail damage</option><option>Wind damage</option><option>Water leak</option><option>Other damage</option><option>Age or normal wear</option><option>Planned upgrade</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><label className="block text-xs text-slate-400 mb-1">Date of Loss, if known</label><input type="date" value={inputs.dateOfLoss} onChange={(e) => setInputs({ ...inputs, dateOfLoss: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2.5 text-sm text-white focus:border-amber-500" /></div>
                  <div><label className="block text-xs text-slate-400 mb-1">Insurance Company</label><input type="text" value={inputs.insurer} onChange={(e) => setInputs({ ...inputs, insurer: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2.5 text-sm text-white focus:border-amber-500" /></div>
                  <div><label className="block text-xs text-slate-400 mb-1">Policy Number</label><input type="text" value={inputs.policyNumber} onChange={(e) => setInputs({ ...inputs, policyNumber: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2.5 text-sm text-white focus:border-amber-500" /></div>
                  <div><label className="block text-xs text-slate-400 mb-1">Claim Number</label><input type="text" value={inputs.claimNumber} onChange={(e) => setInputs({ ...inputs, claimNumber: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2.5 text-sm text-white focus:border-amber-500" /></div>
                  <div><label className="block text-xs text-slate-400 mb-1">Adjuster Name</label><input type="text" value={inputs.adjusterName} onChange={(e) => setInputs({ ...inputs, adjusterName: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2.5 text-sm text-white focus:border-amber-500" /></div>
                  <div><label className="block text-xs text-slate-400 mb-1">Adjuster Phone Number</label><input type="tel" value={inputs.adjusterPhone} onChange={(e) => setInputs({ ...inputs, adjusterPhone: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2.5 text-sm text-white focus:border-amber-500" /></div>
                </div>
                <div><label className="block text-xs text-slate-400 mb-1">Additional Notes</label><textarea rows={3} value={inputs.notes} onChange={(e) => setInputs({ ...inputs, notes: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2.5 text-sm text-white focus:border-amber-500" /></div>
              </div>
              <div className="pt-4 flex justify-between">
                <button type="button" onClick={() => setStep(2)} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 uppercase"><ArrowLeft className="w-4 h-4" />Back</button>
                <button type="button" disabled={isCalculating} onClick={runCalculation} className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-black text-sm uppercase tracking-wider px-6 py-2.5 rounded flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"><span>{isCalculating ? 'Computing Range...' : 'Compute Planning Range'}</span><ArrowRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {/* STEP 4: PLANNING RANGE */}
          {step === 4 && calculationResult && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-xl font-heading font-black uppercase text-white flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-amber-500" />
                  Step 4: Preliminary Planning Range
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Based on {inputs.squareFootage.toLocaleString()} sq ft {inputs.roofSystem} for {inputs.desiredWork}.
                </p>
              </div>

              {/* Estimate Box */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-xl p-6 text-center space-y-3">
                <div className="text-xs font-mono-crd text-slate-400 uppercase tracking-widest">
                  Estimated Capital Planning Range
                </div>
                <div className="text-3xl sm:text-5xl font-heading font-black text-amber-400 tracking-tight">
                  ${calculationResult.estimatedLow.toLocaleString()} – ${calculationResult.estimatedHigh.toLocaleString()}
                </div>
                <div className="text-xs text-slate-400 font-mono-crd">
                  Approx. ${calculationResult.unitLow.toFixed(2)} – ${calculationResult.unitHigh.toFixed(2)} per sq ft
                </div>
              </div>

              {/* Mandatory Anti-Fabrication Disclaimer Box */}
              <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-600/40 text-xs text-amber-200/90 leading-relaxed flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-heading uppercase text-amber-300 text-sm mb-0.5">
                    Planning Estimate Only
                  </strong>
                  {BUSINESS_INFO.calculatorDisclaimer}
                </div>
              </div>

              {/* Appointment request and direct contact */}
              <form onSubmit={handleFinalSubmit} className="space-y-4 pt-2">
                <div className="text-sm font-heading font-bold uppercase text-white border-b border-slate-800 pb-1">Request a Professional Assessment</div>
                <p className="text-sm text-slate-300">Your contact information and optional damage or insurance details were entered before the planning range. Submit to save this request to the commercial lead queue.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button type="button" onClick={() => { window.location.href = 'tel:9032315940'; }} className="flex-1 border border-slate-600 hover:border-amber-500 text-white font-heading font-bold text-sm uppercase tracking-wider px-5 py-3 rounded">Call (903) 231-5940</button>
                  <button type="submit" disabled={isCalculating} className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-black text-sm uppercase tracking-wider px-5 py-3 rounded disabled:opacity-50">{isCalculating ? 'Submitting...' : 'Request Appointment'}</button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 5: ASSESSMENT SCHEDULED */}
          {step === 5 && (
            <div className="text-center py-8 space-y-4">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
              <h2 className="text-2xl font-heading font-black uppercase text-white">
                Planning Estimate & Assessment Logged
              </h2>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                Your parameters for {inputs.squareFootage.toLocaleString()} sq ft of {inputs.roofSystem} roofing have been recorded. A CRD commercial specialist will review the satellite geometry and follow up with you.
              </p>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg max-w-md mx-auto text-left text-xs text-slate-300 space-y-1">
                <div>• Planning Range: ${calculationResult?.estimatedLow.toLocaleString()} – ${calculationResult?.estimatedHigh.toLocaleString()}</div>
                <div>• Scope: {inputs.desiredWork} ({inputs.roofSystem})</div>
                <div>• Direct Dispatch Line: {BUSINESS_INFO.phone}</div>
              </div>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-heading uppercase font-bold tracking-wider"
                >
                  Start New Calculation
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
