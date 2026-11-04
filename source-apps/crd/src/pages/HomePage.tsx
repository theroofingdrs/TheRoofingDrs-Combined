import React from 'react';
import {
  FileText,
  AlertTriangle,
  ArrowRight,
  Phone,
  ExternalLink,
  ShieldCheck,
  Layers,
  Wrench,
  Search,
  Building,
  Wind,
  CloudLightning,
  FileSpreadsheet,
  RotateCcw,
  CheckCircle2,
  MapPin,
  Calculator,
} from 'lucide-react';
import { SeoMeta } from '../components/SeoMeta';
import { Link, useRouter } from '../router';
import { BUSINESS_INFO } from '../constants';
import { LeadType } from '../types';
import { CRDLogo } from '../components/CrdLogo';

interface HomePageProps {
  onOpenInspection: (initialLeadType?: LeadType) => void;
  onOpenEmergency: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenInspection, onOpenEmergency }) => {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-[#f4f3ef] text-[#181818] font-sans-crd selection:bg-[#181818] selection:text-[#f4f3ef]">
      <SeoMeta
        title="Commercial Roof Coatings | Texarkana"
        description="Commercial roof coatings and restoration for aging metal and low-slope roofs. Silicone, acrylic and polyurethane systems, inspections and repairs. Serving Texarkana and regional markets within 250 miles. Call (903) 231-5940."
        canonicalPath="/"
      />

      {/* -------------------------------------------------------------------------
          1. HERO: High-Impact Photographic Commercial Architecture
         ------------------------------------------------------------------------- */}
      <section className="relative min-h-[85vh] lg:min-h-[90vh] flex items-center bg-[#151515] border-b border-[#242424] overflow-hidden">
        {/* Editorial Commercial Roof Photography Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/images/library/owner-commercial-roof-inspection-01.jpeg"
            alt="Commercial roofing inspection documenting roof-surface conditions on a low-slope roof"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center brightness-[0.45] contrast-[1.05]"
          />
          {/* Restrained architectural gradient overlay for crisp readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-[#151515]/75 to-[#151515]/35" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#151515]/90 via-[#151515]/60 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative z-10 w-full">
          <div className="max-w-4xl space-y-7">
            {/* Prominent Full Brand Logo Placement Over Hero Photography */}
            <div className="pt-2">
              <CRDLogo
                variant="full"
                theme="light"
                className="h-12 sm:h-14 lg:h-16 w-auto max-h-[64px] max-w-[260px] object-contain"
              />
            </div>

            {/* Territorial Marker */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-2 bg-[#111111]/85 backdrop-blur-sm border border-[#333333] text-[#d99a19] text-xs font-mono-crd tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-[#d99a19] shrink-0 animate-pulse" />
              <span>Commercial Roof Coatings & Restoration • Texarkana Based</span>
            </div>

            {/* Hero Main Copy */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-black tracking-tight uppercase text-white leading-[0.92]">
                Commercial Roof Coatings.{' '}
                <span className="text-[#eeeeee]">Restoration.</span>{' '}
                <span className="text-[#eeeeee]">Metal Roof Renewal.</span>{' '}
                <span className="text-[#d99a19]">Done Right.</span>
              </h1>
            </div>

            {/* Supporting Paragraph */}
            <p className="text-lg sm:text-xl text-[#d4d4d4] max-w-2xl leading-relaxed font-normal">
              CRD evaluates aging commercial metal and low-slope roofs for restoration with professionally specified silicone, acrylic, and polyurethane coating systems. We inspect the roof first, address seams, fasteners, flashings and drainage, then determine whether coating, repair or replacement is the right investment.
            </p>

            {/* Primary & Secondary Action CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                id="hero-primary-inspection-btn"
                onClick={() => onOpenInspection('Inspection')}
                className="crd-button-accent font-heading font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 cursor-pointer group"
              >
                <FileText className="w-4 h-4 text-[#111111]" />
                <span>Request a Commercial Roof Inspection</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                id="hero-secondary-emergency-btn"
                onClick={onOpenEmergency}
                className="inline-flex items-center justify-center min-h-[52px] px-7 bg-[#b83232] hover:bg-[#9c2525] text-white font-heading font-bold text-sm uppercase tracking-wider gap-2.5 transition-all cursor-pointer rounded-none"
              >
                <AlertTriangle className="w-4 h-4 text-white" />
                <span>Report a Roof Emergency</span>
              </button>
            </div>

            {/* Supporting Line & Field Direct Dispatch */}
            <div className="pt-4 border-t border-[#333333]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#a0a0a0]">
              <div className="font-medium text-[#cccccc] tracking-wide">
                Commercial Roofing • Storm Response • Restoration • Replacement • Roof Asset Management
              </div>
              <div className="flex items-center gap-2 font-mono-crd text-[#888888]">
                <span>Dispatch:</span>
                <a href={`tel:${BUSINESS_INFO.phoneRaw}`} className="text-[#d99a19] font-bold hover:underline">
                  {BUSINESS_INFO.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------------
          2. AUTHORITY STRIP: Clean Architectural Columns (Not 4 Little Cards)
         ------------------------------------------------------------------------- */}
      <section className="bg-white border-b border-[#e6e4df]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 divide-y sm:divide-y-0 sm:divide-x divide-[#e6e4df]">
            {/* Block 1 */}
            <div className="pt-4 sm:pt-0 sm:pr-6">
              <div className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl text-[#181818] tracking-tight leading-none">
                22+
              </div>
              <div className="text-xs uppercase tracking-wider font-heading font-bold text-[#181818] mt-2">
                Years of Roofing & Construction
              </div>
              <p className="text-xs text-[#666666] mt-1 leading-relaxed">
                Extensive field experience spanning industrial, retail, institutional, and low-slope facilities.
              </p>
            </div>

            {/* Block 2 */}
            <div className="pt-4 sm:pt-0 sm:px-6">
              <div className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-[#181818] tracking-tight leading-none uppercase">
                Large Loss
              </div>
              <div className="text-xs uppercase tracking-wider font-heading font-bold text-[#181818] mt-2">
                Storm & Insurance Experience
              </div>
              <p className="text-xs text-[#666666] mt-1 leading-relaxed">
                Forensic hail/wind damage mapping, Xactimate line-item scoping, and on-roof adjuster collaboration.
              </p>
            </div>

            {/* Block 3 */}
            <div className="pt-4 sm:pt-0 sm:px-6">
              <div className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-[#181818] tracking-tight leading-none uppercase">
                Multi-System
              </div>
              <div className="text-xs uppercase tracking-wider font-heading font-bold text-[#181818] mt-2">
                TPO • EPDM • PVC • Metal • Coatings
              </div>
              <p className="text-xs text-[#666666] mt-1 leading-relaxed">
                Full technical specification across single-ply, built-up, architectural standing seam, and fluid chemistries.
              </p>
            </div>

            {/* Block 4 */}
            <div className="pt-4 sm:pt-0 sm:pl-6">
              <div className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-[#181818] tracking-tight leading-none uppercase">
                Four States
              </div>
              <div className="text-xs uppercase tracking-wider font-heading font-bold text-[#181818] mt-2">
                Commercial Coverage
              </div>
              <p className="text-xs text-[#666666] mt-1 leading-relaxed">
                Regional commercial coverage extending up to 250 miles from Texarkana across TX, AR, LA, and OK.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------------
          3. INTENT SELECTOR: Large Editorial Navigation Blocks
         ------------------------------------------------------------------------- */}
      <section className="bg-[#f4f3ef] border-b border-[#e6e4df] py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="max-w-3xl space-y-2">
            <div className="text-xs font-mono-crd text-[#666666] uppercase tracking-wider">
              FACILITY ROUTING & TRIAGE
            </div>
            <h2 className="text-3xl sm:text-5xl font-heading font-black uppercase text-[#181818] tracking-tight">
              What Does Your Roof Need?
            </h2>
            <p className="text-base text-[#555555] leading-relaxed">
              Whether you're dealing with an active problem, planning ahead, or managing multiple properties, start with the situation you're facing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Choice 1: Roof Problem */}
            <div
              onClick={() => onOpenInspection('Repair')}
              className="group relative bg-[#181818] min-h-[340px] flex flex-col justify-end p-6 overflow-hidden cursor-pointer transition-all hover:translate-y-[-3px]"
            >
              <img
                src="/assets/images/library/crd-commercial-roof-drain-inspection.jpg"
                alt="Commercial roof leak diagnostic examination"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover brightness-[0.35] group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-[#151515]/80 to-transparent" />
              <div className="relative z-10 space-y-2">
                <div className="text-[11px] font-mono-crd text-[#d99a19] uppercase tracking-wider">
                  ACTIVE ISSUE
                </div>
                <h3 className="font-heading font-black text-2xl uppercase text-white group-hover:text-[#d99a19] transition-colors leading-tight">
                  I Have a Roof Problem
                </h3>
                <p className="text-xs text-[#cccccc] leading-relaxed">
                  Leaks • deterioration • unknown condition • ponding water • flashing failures
                </p>
                <div className="pt-3 flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider group-hover:text-[#d99a19]">
                  <span>Diagnose Leak</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>

            {/* Choice 2: Storm Damage */}
            <div
              onClick={() => onOpenInspection('Storm Damage')}
              className="group relative bg-[#181818] min-h-[340px] flex flex-col justify-end p-6 overflow-hidden cursor-pointer transition-all hover:translate-y-[-3px]"
            >
              <img
                src="/assets/images/library/commercial-roof-maintenance.jpg"
                alt="Commercial flat roof storm wind damage and emergency response"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover brightness-[0.35] group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-[#151515]/80 to-transparent" />
              <div className="relative z-10 space-y-2">
                <div className="text-[11px] font-mono-crd text-[#b83232] uppercase tracking-wider">
                  RAPID RESPONSE
                </div>
                <h3 className="font-heading font-black text-2xl uppercase text-white group-hover:text-[#b83232] transition-colors leading-tight">
                  I Have Storm Damage
                </h3>
                <p className="text-xs text-[#cccccc] leading-relaxed">
                  Hail fractures • wind tear-off • perimeter uplift • insurance documentation
                </p>
                <div className="pt-3 flex items-center gap-2 text-xs font-bold text-[#b83232] uppercase tracking-wider">
                  <span>Schedule Storm Inspection</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>

            {/* Choice 3: Planning a Project */}
            <div
              onClick={() => onOpenInspection('Replacement')}
              className="group relative bg-[#181818] min-h-[340px] flex flex-col justify-end p-6 overflow-hidden cursor-pointer transition-all hover:translate-y-[-3px]"
            >
              <img
                src="/assets/images/library/commercial-property-roofing-01.jpg"
                alt="Commercial roof replacement and restoration planning"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover brightness-[0.35] group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-[#151515]/80 to-transparent" />
              <div className="relative z-10 space-y-2">
                <div className="text-[11px] font-mono-crd text-[#d99a19] uppercase tracking-wider">
                  CAPITAL SCOPE
                </div>
                <h3 className="font-heading font-black text-2xl uppercase text-white group-hover:text-[#d99a19] transition-colors leading-tight">
                  I'm Planning a Project
                </h3>
                <p className="text-xs text-[#cccccc] leading-relaxed">
                  Replacement • fluid restoration • coatings • structural tear-offs
                </p>
                <div className="pt-3 flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider group-hover:text-[#d99a19]">
                  <span>Explore Project Scopes</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>

            {/* Choice 4: Managing Multiple Properties */}
            <div
              onClick={() => navigate('/property-management')}
              className="group relative bg-[#181818] min-h-[340px] flex flex-col justify-end p-6 overflow-hidden cursor-pointer transition-all hover:translate-y-[-3px]"
            >
              <img
                src="/assets/images/library/commercial-property-roofing-02.jpg"
                alt="Commercial property management portfolio flat rooftops and facilities"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover brightness-[0.35] group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-[#151515]/80 to-transparent" />
              <div className="relative z-10 space-y-2">
                <div className="text-[11px] font-mono-crd text-[#d99a19] uppercase tracking-wider">
                  PORTFOLIO ASSETS
                </div>
                <h3 className="font-heading font-black text-2xl uppercase text-white group-hover:text-[#d99a19] transition-colors leading-tight">
                  I Manage Multiple Properties
                </h3>
                <p className="text-xs text-[#cccccc] leading-relaxed">
                  Maintenance programs • condition audits • asset planning • budget forecasting
                </p>
                <div className="pt-3 flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider group-hover:text-[#d99a19]">
                  <span>Portfolio Assessment</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------------
          4. CORE CRD PHILOSOPHY: Split Architectural Composition (Inspect -> Diagnose -> Recommend -> Execute)
         ------------------------------------------------------------------------- */}
      <section className="bg-white border-b border-[#e6e4df] py-18 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Authentic Inspection Image */}
          <div className="lg:col-span-6 relative">
            <div className="relative overflow-hidden bg-[#181818] border border-[#e6e4df]">
              <img
                src="/assets/images/library/commercial-roof-inspection-detail.jpg"
                alt="Commercial roof technical inspection in progress"
                referrerPolicy="no-referrer"
                className="w-full h-[460px] sm:h-[540px] object-cover contrast-[1.05]"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-[#181818]/90 backdrop-blur-sm p-4 border-t border-[#333333] flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono-crd text-[#d99a19] uppercase">CRD Field Diagnostic Standard</div>
                  <div className="text-xs text-white font-bold">Physical Core Testing & Seam Weld Integrity</div>
                </div>
                <span className="text-[11px] font-mono-crd text-[#888888]">Non-Destructive Scanning</span>
              </div>
            </div>
          </div>

          {/* Right Column: The Philosophy & 4-Step Typographic Progression */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-3">
              <div className="text-xs font-mono-crd text-[#666666] uppercase tracking-wider">
                THE CRD APPROACH
              </div>
              <h2 className="text-3xl sm:text-5xl font-heading font-black uppercase text-[#181818] tracking-tight leading-[0.95]">
                We Don't Start With a Proposal.{' '}
                <span className="block text-[#d99a19]">We Start With the Roof.</span>
              </h2>
              <p className="text-base text-[#444444] leading-relaxed pt-2">
                A commercial roof is a system, not a square-foot number. We inspect the roof, identify the failure points, document the condition and determine what makes the most sense — repair, maintain, restore or replace.
              </p>
            </div>

            {/* Simple Typographic Steps (No 4 Giant Bordered Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 pt-4 border-t border-[#e6e4df]">
              {/* Step 01 */}
              <div className="space-y-1.5">
                <div className="font-heading font-black text-2xl text-[#d99a19]">01 INSPECT</div>
                <p className="text-xs text-[#555555] leading-relaxed">
                  Physical probe testing of seams, checking curb flashings, core-sampling insulation moisture, and high-resolution drone mapping.
                </p>
              </div>

              {/* Step 02 */}
              <div className="space-y-1.5">
                <div className="font-heading font-black text-2xl text-[#d99a19]">02 DIAGNOSE</div>
                <p className="text-xs text-[#555555] leading-relaxed">
                  Identifying the root mechanism of failure—thermal shrinkage, fastener fatigue, micro-cracking, or drainage backup—rather than patching symptoms.
                </p>
              </div>

              {/* Step 03 */}
              <div className="space-y-1.5">
                <div className="font-heading font-black text-2xl text-[#d99a19]">03 RECOMMEND</div>
                <p className="text-xs text-[#555555] leading-relaxed">
                  Objective options: targeted repair, restorative fluid-applied coating, or complete engineered replacement based on remaining service life.
                </p>
              </div>

              {/* Step 04 */}
              <div className="space-y-1.5">
                <div className="font-heading font-black text-2xl text-[#d99a19]">04 EXECUTE</div>
                <p className="text-xs text-[#555555] leading-relaxed">
                  Strict adherence to manufacturer specifications, safety protocols, and daily photo verification via CompanyCam with minimal tenant disturbance.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onOpenInspection('Inspection')}
                className="crd-button-primary text-xs font-heading font-bold uppercase tracking-wider flex items-center gap-2"
              >
                <span>Request Comprehensive Field Inspection</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------------
          5. COMMERCIAL ROOFING: Scope Without Guesswork (Repair / Restore / Replace)
         ------------------------------------------------------------------------- */}
      <section className="bg-[#f4f3ef] border-b border-[#e6e4df] py-18 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-14">
          <div className="max-w-3xl space-y-3">
            <div className="text-xs font-mono-crd text-[#666666] uppercase tracking-wider">
              FULL-SPECTRUM COMMERCIAL CAPABILITY
            </div>
            <h2 className="text-3xl sm:text-5xl font-heading font-black uppercase text-[#181818] tracking-tight">
              Commercial Roofing Without the Guesswork.
            </h2>
            <p className="text-base text-[#444444] leading-relaxed">
              Commercial facilities cannot afford arbitrary sales recommendations. We provide engineered solutions across inspections, leak investigation, maintenance, restoration coatings, replacements, and multi-year asset planning.
            </p>
          </div>

          {/* Three Strong Editorial Panels: REPAIR, RESTORE, REPLACE */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Panel 1: REPAIR */}
            <div className="bg-white border border-[#e6e4df] p-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="h-48 overflow-hidden bg-[#181818]">
                  <img
                    src="/assets/images/library/commercial-roof-maintenance-detail.jpg"
                    alt="Commercial roof repair and curb flashing work"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-xs font-mono-crd text-[#666666] uppercase">SURGICAL INTERVENTION</div>
                  <h3 className="font-heading font-black text-3xl uppercase text-[#181818] mt-1">Repair</h3>
                </div>
                <p className="text-xs text-[#555555] leading-relaxed">
                  Targeted leak stopping for isolated penetration failures, split seams, curb flashings, and storm-compromised drainage bowls. We restore watertight integrity without costly unneeded tear-offs.
                </p>
              </div>
              <div className="pt-4 border-t border-[#e6e4df]">
                <Link
                  to="/commercial-roof-repair"
                  className="inline-flex items-center gap-2 text-xs font-heading font-bold uppercase text-[#181818] hover:text-[#d99a19] tracking-wider transition-colors"
                >
                  <span>Explore Commercial Repair</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Panel 2: RESTORE */}
            <div className="bg-white border border-[#e6e4df] p-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="h-48 overflow-hidden bg-[#181818]">
                  <img
                    src="/assets/images/library/commercial-single-ply-roofing-01.jpg"
                    alt="Commercial roof silicone restoration coating application"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-xs font-mono-crd text-[#d99a19] uppercase font-bold">LIFE-EXTENSION COATINGS</div>
                  <h3 className="font-heading font-black text-3xl uppercase text-[#181818] mt-1">Restore</h3>
                </div>
                <p className="text-xs text-[#555555] leading-relaxed">
                  Seamless fluid-applied silicone and acrylic elastomeric systems sprayed over existing sound membranes. Eliminates mechanical seams, stops UV aging, and defers capital replacement for 10–20 years.
                </p>
              </div>
              <div className="pt-4 border-t border-[#e6e4df]">
                <Link
                  to="/commercial-roof-restoration"
                  className="inline-flex items-center gap-2 text-xs font-heading font-bold uppercase text-[#181818] hover:text-[#d99a19] tracking-wider transition-colors"
                >
                  <span>Explore Roof Restoration</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Panel 3: REPLACE */}
            <div className="bg-white border-2 border-[#181818] p-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="h-48 overflow-hidden bg-[#181818]">
                  <img
                    src="/assets/images/library/commercial-roof-replacement.jpg"
                    alt="Engineered commercial roof replacement and complete tear-off"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-xs font-mono-crd text-[#181818] uppercase font-bold">TOTAL RE-ROOFING</div>
                  <h3 className="font-heading font-black text-3xl uppercase text-[#181818] mt-1">Replace</h3>
                </div>
                <p className="text-xs text-[#555555] leading-relaxed">
                  Complete tear-offs and engineered re-roofing across TPO, EPDM, PVC, and standing seam metal. Designed with tapered insulation, new R-value energy codes, and manufacturer NDL warranty compliance.
                </p>
              </div>
              <div className="pt-4 border-t border-[#e6e4df]">
                <Link
                  to="/commercial-roof-replacement"
                  className="inline-flex items-center gap-2 text-xs font-heading font-bold uppercase text-[#181818] hover:text-[#d99a19] tracking-wider transition-colors"
                >
                  <span>Engineered Replacement</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------------
          6. STORM RESPONSE: Dramatic Cinematic Full-Width Mood Shift
         ------------------------------------------------------------------------- */}
      <section className="relative bg-[#151515] border-y border-[#2a2a2a] text-white py-20 sm:py-32 overflow-hidden">
        {/* Full-width dramatic storm photograph backdrop */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=2000&q=85"
            alt="Severe storm front over commercial architecture"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center brightness-[0.35] contrast-[1.1]"
          />
          <div className="absolute inset-0 bg-[#151515]/80" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono-crd text-[#b83232] uppercase tracking-wider font-bold">
              <span className="w-2 h-2 bg-[#b83232]" />
              COMMERCIAL STORM RESPONSE
            </div>
            <h2 className="text-4xl sm:text-6xl font-heading font-black uppercase text-white tracking-tight leading-none">
              When the Storm Hits, CRD Responds.
            </h2>
            <p className="text-xl sm:text-2xl text-[#d4d4d4] font-medium leading-snug">
              Storm damage doesn't wait. Neither should your inspection.
            </p>
            <p className="text-sm text-[#aaaaaa] leading-relaxed max-w-2xl">
              Hail and high winds compromise commercial roof assemblies in ways invisible from the ground. Single-ply membranes fracture beneath insulation, edge metal peels loose, and internal moisture begins corroding roof decks.
            </p>
          </div>

          {/* Simple Architectural Links (Not Three Red Cards) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-white/15">
            <Link
              to="/hail-damage"
              className="group py-4 border-b-2 border-transparent hover:border-[#b83232] transition-colors"
            >
              <div className="text-xs font-mono-crd text-[#b83232] uppercase">DIAGNOSTIC</div>
              <div className="font-heading font-bold text-xl uppercase text-white group-hover:text-[#b83232] mt-1">
                Hail Damage
              </div>
              <div className="text-xs text-[#888888] mt-1">Microscopic scrim tears & bruised polyiso</div>
            </Link>

            <Link
              to="/wind-damage"
              className="group py-4 border-b-2 border-transparent hover:border-[#b83232] transition-colors"
            >
              <div className="text-xs font-mono-crd text-[#b83232] uppercase">PERIMETER</div>
              <div className="font-heading font-bold text-xl uppercase text-white group-hover:text-[#b83232] mt-1">
                Wind Damage
              </div>
              <div className="text-xs text-[#888888] mt-1">Edge metal uplift & corner zone detachment</div>
            </Link>

            <Link
              to="/insurance-claims"
              className="group py-4 border-b-2 border-transparent hover:border-[#b83232] transition-colors"
            >
              <div className="text-xs font-mono-crd text-[#b83232] uppercase">SCOPING</div>
              <div className="font-heading font-bold text-xl uppercase text-white group-hover:text-[#b83232] mt-1">
                Insurance Claims
              </div>
              <div className="text-xs text-[#888888] mt-1">Xactimate line-iteming & adjuster meetings</div>
            </Link>

            <Link
              to="/emergency-roofing"
              className="group py-4 border-b-2 border-transparent hover:border-[#b83232] transition-colors"
            >
              <div className="text-xs font-mono-crd text-[#b83232] uppercase">ACTIVE LEAKS</div>
              <div className="font-heading font-bold text-xl uppercase text-white group-hover:text-[#b83232] mt-1">
                Emergency Roofing
              </div>
              <div className="text-xs text-[#888888] mt-1">Immediate dry-in containment & triage</div>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={onOpenEmergency}
              className="bg-[#b83232] hover:bg-[#9c2525] text-white font-heading font-black text-xs uppercase tracking-wider px-7 py-4 rounded-none cursor-pointer flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-white" />
              <span>Report Commercial Emergency</span>
            </button>
            <button
              onClick={() => onOpenInspection('Storm Damage')}
              className="bg-transparent hover:bg-white/10 text-white border border-white/30 font-heading font-bold text-xs uppercase tracking-wider px-7 py-4 rounded-none cursor-pointer"
            >
              Request Post-Storm Inspection
            </button>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------------
          7. RESTORATION / COATINGS: Architectural Light Section
         ------------------------------------------------------------------------- */}
      <section className="bg-white border-b border-[#e6e4df] py-18 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="text-xs font-mono-crd text-[#666666] uppercase tracking-wider">
              SUSTAINABLE ASSET RENEWAL
            </div>
            <h2 className="text-3xl sm:text-5xl font-heading font-black uppercase text-[#181818] tracking-tight leading-[0.95]">
              Restore the Roof Before You Replace It.
            </h2>
            <p className="text-base text-[#444444] leading-relaxed">
              When the roof is a candidate for restoration, a properly designed system can extend service life and defer full replacement.
            </p>
            <p className="text-sm text-[#555555] leading-relaxed">
              Commercial elastomeric coatings create a seamless, monolithic membrane over existing single-ply, metal, or modified bitumen assemblies. By reinforcing all seams, curbs, and penetrations before applying high-solids silicone or acrylic chemistries, facilities avoid tenant disruption, interior dust, and landfill disposal costs.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#e6e4df]">
              <div>
                <div className="font-heading font-bold text-sm uppercase text-[#181818]">Membrane Chemistries</div>
                <div className="text-xs text-[#666666] mt-0.5">High-solids silicone, acrylic & polyurethane</div>
              </div>
              <div>
                <div className="font-heading font-bold text-sm uppercase text-[#181818]">System Upgrades</div>
                <div className="text-xs text-[#666666] mt-0.5">Seam reinforcement & flashing encapsulation</div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/coat-vs-replace"
                className="crd-button-primary text-xs font-heading font-bold uppercase tracking-wider"
              >
                Coat vs. Replace Guide
              </Link>
              <Link
                to="/commercial-roof-coatings"
                className="inline-flex items-center gap-2 text-xs font-heading font-bold uppercase text-[#181818] hover:text-[#d99a19] px-4 py-3 tracking-wider transition-colors"
              >
                <span>Fluid-Applied Systems</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative overflow-hidden bg-[#181818] border border-[#e6e4df]">
              <img
                src="/assets/images/library/commercial-single-ply-roofing-02.jpg"
                alt="Seamless high-solids silicone commercial roof restoration membrane"
                referrerPolicy="no-referrer"
                className="w-full h-[440px] sm:h-[500px] object-cover"
              />
              <div className="p-4 bg-[#181818] text-white border-t border-[#333333] flex items-center justify-between">
                <span className="text-xs font-mono-crd text-[#d99a19]">Monolithic Fluid System</span>
                <span className="text-xs text-[#aaaaaa]">10–20 Year Renewable Lifecycle</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------------
          8. CRD PPP™: Architectural Asset Lifecycle Diagram
         ------------------------------------------------------------------------- */}
      <section className="bg-[#f4f3ef] border-b border-[#e6e4df] py-18 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-mono-crd text-[#181818] uppercase tracking-wider font-bold">
              <ShieldCheck className="w-4 h-4 text-[#d99a19]" />
              CRD PPP™ — PROPERTY PROTECTION PROGRAM
            </div>
            <h2 className="text-3xl sm:text-5xl font-heading font-black uppercase text-[#181818] tracking-tight">
              Your Roof Is an Asset. Manage It Like One.
            </h2>
            <p className="text-base text-[#444444] leading-relaxed">
              Don't wait for a roof problem to become a building problem. CRD PPP™ creates a structured plan for inspection, documentation, maintenance, repair, storm readiness and long-term capital planning.
            </p>
          </div>

          {/* Large Commercial Facility Architectural Visual & Lifecycle Composition */}
          <div className="bg-white border border-[#e6e4df] overflow-hidden">
            {/* Architectural Property Banner */}
            <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-[#181818]">
              <img
                src="/assets/images/library/commercial-property-roofing-02.jpg"
                alt="Commercial asset management and multi-facility roof lifecycle protection"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover brightness-[0.6] contrast-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-transparent to-black/30" />
              <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
                <div>
                  <div className="text-[11px] font-mono-crd text-[#d99a19] uppercase tracking-wider">
                    PREDICTIVE ASSET ARCHITECTURE
                  </div>
                  <div className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-wide">
                    Extending Service Life • Controlling Capital Outlay
                  </div>
                </div>
                <div className="text-xs font-mono-crd text-[#bbbbbb] shrink-0">
                  Documented Four-State Portfolios
                </div>
              </div>
            </div>

            {/* Architectural Lifecycle Schematic */}
            <div className="p-6 sm:p-10 space-y-8">
              <div>
                <div className="text-xs font-mono-crd text-[#77736b] uppercase tracking-wider mb-2">
                  THE CRD ASSET LIFECYCLE:
                </div>
                <p className="text-xs text-[#666666]">
                  A continuous, closed-loop framework for commercial roofs, eliminating unexpected capital shocks.
                </p>
              </div>

              {/* Connected Flow Steps */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-2">
                {[
                  { step: 'INSPECT', desc: 'Core diagnostics & scans' },
                  { step: 'DOCUMENT', desc: 'Baseline photo record' },
                  { step: 'MAINTAIN', desc: 'Drain, seal & debris clears' },
                  { step: 'REPAIR', desc: 'Surgical leak remediation' },
                  { step: 'RESTORE', desc: 'Fluid elastomeric renewal' },
                  { step: 'RESPOND', desc: 'Post-storm priority triage' },
                  { step: 'PLAN', desc: 'Multi-year reserve models' },
                  { step: 'REPLACE', desc: 'Engineered re-roofing' },
                ].map((item, idx, arr) => (
                  <div key={item.step} className="relative p-3.5 bg-[#f4f3ef] border border-[#e6e4df] flex flex-col justify-between group hover:border-[#181818] transition-colors">
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-mono-crd text-[#888888] mb-1">
                        <span>0{idx + 1}</span>
                        {idx < arr.length - 1 && (
                          <span className="hidden lg:inline text-[#d99a19] font-bold">→</span>
                        )}
                      </div>
                      <div className="font-heading font-black text-sm uppercase text-[#181818] group-hover:text-[#d99a19] transition-colors">
                        {item.step}
                      </div>
                    </div>
                    <div className="text-[10px] text-[#666666] mt-2 leading-tight">
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-[#e6e4df] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1 max-w-xl">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#181818]">
                    Available in Four Structured Program Tiers:
                  </div>
                  <p className="text-xs text-[#555555] leading-relaxed">
                    <strong>PPP Essential</strong> (preventative clears & bi-annual audits), <strong>PPP Professional</strong> (storm priority & baseline warranties), <strong>PPP Complete</strong> (priority labor & repair credits), and <strong>PPP Portfolio</strong> (multi-property centralized dispatch).
                  </p>
                </div>
                <Link
                  to="/crd-ppp"
                  className="crd-button-accent text-xs font-heading font-black uppercase tracking-wider whitespace-nowrap self-start sm:self-auto"
                >
                  Build My CRD PPP™ Plan
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------------
          9. PROPERTY MANAGEMENT: Dedicated Commercial Portfolio Section
         ------------------------------------------------------------------------- */}
      <section className="bg-white border-b border-[#e6e4df] py-18 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6 relative order-2 lg:order-1">
            <img
              src="/assets/images/library/commercial-property-roofing-03.jpg"
              alt="Multi-property commercial real estate roof assets and facility management"
              referrerPolicy="no-referrer"
              className="w-full h-[460px] object-cover border border-[#e6e4df]"
            />
          </div>

          <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
            <div className="text-xs font-mono-crd text-[#666666] uppercase tracking-wider">
              COMMERCIAL REAL ESTATE & PORTFOLIOS
            </div>
            <h2 className="text-3xl sm:text-5xl font-heading font-black uppercase text-[#181818] tracking-tight leading-[0.95]">
              One Roofing Partner. Every Property.
            </h2>
            <p className="text-base text-[#444444] leading-relaxed">
              Managing multiple commercial properties requires more than calling a roofer when something leaks. CRD can organize property-level inspections, documentation, repairs, storm inspections, maintenance opportunities and replacement planning across a portfolio.
            </p>

            {/* Portfolio Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 pt-2 text-xs text-[#333333]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#d99a19] shrink-0" />
                <span>Portfolio-level inspections</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#d99a19] shrink-0" />
                <span>Property-by-property photo records</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#d99a19] shrink-0" />
                <span>Objective condition ratings (1-5)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#d99a19] shrink-0" />
                <span>Centralized repair tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#d99a19] shrink-0" />
                <span>Rapid post-storm priority triage</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#d99a19] shrink-0" />
                <span>Multi-year capital forecasting</span>
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={() => onOpenInspection('Property Management')}
                className="crd-button-primary text-xs font-heading font-bold uppercase tracking-wider"
              >
                Request a Property Roof Assessment
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------------
          10. ROOF SYSTEMS: Clean Architectural System Matrix
         ------------------------------------------------------------------------- */}
      <section className="bg-[#f4f3ef] border-b border-[#e6e4df] py-18 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-14">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl space-y-2">
              <div className="text-xs font-mono-crd text-[#666666] uppercase tracking-wider">
                TECHNICAL SYSTEM PORTFOLIO
              </div>
              <h2 className="text-3xl sm:text-5xl font-heading font-black uppercase text-[#181818] tracking-tight">
                Roof Systems Engineered for Commercial Performance.
              </h2>
              <p className="text-base text-[#555555] leading-relaxed">
                We engineer, repair, restore, and replace all major low-slope and commercial steep-slope systems across Texas, Arkansas, Louisiana, and Oklahoma.
              </p>
            </div>
            <div className="text-xs font-mono-crd text-[#77736b] uppercase tracking-wider">
              Single-Ply • Multi-Ply Built-Up • Architectural Standing Seam
            </div>
          </div>

          {/* Editorial Split Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Primary Low-Slope Systems (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="text-xs font-mono-crd text-[#181818] uppercase tracking-wider font-bold border-b border-[#e6e4df] pb-2">
                LOW-SLOPE & MONOLITHIC MEMBRANES
              </div>
              <div className="space-y-3">
                {[
                  {
                    code: 'TPO',
                    title: 'Thermoplastic Polyolefin',
                    specs: '45 to 80-mil • Robotically Heat-Welded Seams',
                    desc: 'High solar reflectance (CRRC rated), energy cost reduction, puncture tolerance, and clean heat-welded seam strength.',
                    href: '/tpo-roofing',
                  },
                  {
                    code: 'EPDM',
                    title: 'Ethylene Propylene Diene Monomer',
                    specs: '45 to 90-mil • Vulcanized Synthetic Rubber',
                    desc: 'Designed for demanding regional thermal cycling, extreme UV resistance, hail elongation, and low life-cycle cost.',
                    href: '/epdm-roofing',
                  },
                  {
                    code: 'PVC',
                    title: 'Polyvinyl Chloride Polymer',
                    specs: '50 to 80-mil • Chemical & Oil Proof',
                    desc: 'Engineered specifically for restaurants, manufacturing, and food processing plants with continuous rooftop grease and chemical exhaust.',
                    href: '/pvc-roofing',
                  },
                  {
                    code: 'MOD-BIT & BUR',
                    title: 'Modified Bitumen & Built-Up Roofing',
                    specs: 'Multi-Ply Redundant Asphaltic Felt & Gravel',
                    desc: 'Heavy-duty multi-layer assemblies with high puncture resistance for facilities requiring frequent rooftop maintenance foot traffic.',
                    href: '/modified-bitumen',
                  },
                ].map((sys) => (
                  <Link
                    key={sys.code}
                    to={sys.href}
                    className="group block bg-white border border-[#e6e4df] p-5 hover:border-[#181818] transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                      <div className="flex items-baseline gap-3">
                        <span className="font-heading font-black text-2xl uppercase text-[#181818] group-hover:text-[#d99a19] transition-colors">
                          {sys.code}
                        </span>
                        <span className="text-xs font-bold uppercase text-[#444444]">
                          {sys.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono-crd text-[#888888]">
                        {sys.specs}
                      </span>
                    </div>
                    <p className="text-xs text-[#666666] mt-2 leading-relaxed">
                      {sys.desc}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Steep-Slope & Architectural Metal (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="text-xs font-mono-crd text-[#181818] uppercase tracking-wider font-bold border-b border-[#e6e4df] pb-2">
                ARCHITECTURAL METAL & STEEP-SLOPE
              </div>
              <div className="space-y-3">
                {[
                  {
                    code: 'COMMERCIAL METAL',
                    title: 'Standing Seam Architectural Systems',
                    specs: '24-Ga Steel / Aluminum • Kynar 500®',
                    desc: 'Concealed-fastener architectural panels with 50+ year service life for high-visibility commercial and industrial facades.',
                    href: '/metal-roofing',
                  },
                  {
                    code: 'COMMERCIAL SHINGLE',
                    title: 'Class 4 Impact Architectural Shingles',
                    specs: 'Heavy-Duty Fiberglass Laminates',
                    desc: 'Engineered for commercial multi-family, church sanctuaries, and office complexes requiring Class A fire and UL 2218 hail ratings.',
                    href: '/commercial-roofing',
                  },
                  {
                    code: 'TILE & SLATE',
                    title: 'Historic & Institutional Masonry Systems',
                    specs: 'Concrete, Clay Tile & Natural Slate',
                    desc: 'Specialized historical dry-in, copper valley flashing retrofits, and forensic leak diagnostics for institutional assets.',
                    href: '/commercial-roofing',
                  },
                ].map((sys) => (
                  <Link
                    key={sys.code}
                    to={sys.href}
                    className="group block bg-white border border-[#e6e4df] p-5 hover:border-[#181818] transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                      <span className="font-heading font-black text-xl uppercase text-[#181818] group-hover:text-[#d99a19] transition-colors">
                        {sys.code}
                      </span>
                      <span className="text-[10px] font-mono-crd text-[#888888]">
                        {sys.specs}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-[#555555] mt-0.5">
                      {sys.title}
                    </div>
                    <p className="text-xs text-[#666666] mt-2 leading-relaxed">
                      {sys.desc}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------------
          11. INDUSTRIES: Sector-Specific Commercial Priorities (All 12 Sectors)
         ------------------------------------------------------------------------- */}
      <section className="bg-white border-b border-[#e6e4df] py-18 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="max-w-3xl space-y-2">
            <div className="text-xs font-mono-crd text-[#666666] uppercase tracking-wider">
              FACILITY-SPECIFIC EXPERTISE
            </div>
            <h2 className="text-3xl sm:text-5xl font-heading font-black uppercase text-[#181818] tracking-tight">
              Different Buildings Have Different Roofing Priorities.
            </h2>
            <p className="text-base text-[#555555] leading-relaxed">
              We understand that a warehouse has completely different operational constraints than a hospital, church, or apartment community. We calibrate our schedule, staging, safety protocols, and execution methods around tenant operations.
            </p>
          </div>

          {/* 12 Industry Sectors Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Churches & Worship',
                priority: 'Sanctuary preservation, steep-to-flat transitions, weekend service scheduling.',
                href: '/industries/churches',
                img: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=600&q=80',
              },
              {
                title: 'Schools & Education',
                priority: 'Summer or off-hours staging, strict student safety perimeter zoning.',
                href: '/industries/schools',
                img: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80',
              },
              {
                title: 'Healthcare & Medical',
                priority: 'Zero leak tolerance, air-intake odor control, sensitive diagnostic equipment safety.',
                href: '/industries/healthcare',
                img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80',
              },
              {
                title: 'Industrial & Warehouses',
                priority: 'Zero operational downtime, massive low-slope acreage, high-traffic HVAC curbs.',
                href: '/industries/industrial',
                img: '/assets/images/library/commercial-property-roofing-04.jpg',
              },
              {
                title: 'Retail & Strip Centers',
                priority: 'Customer access safety, clear parking lanes, tenant merchandise protection.',
                href: '/industries/retail',
                img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
              },
              {
                title: 'Apartments & Multifamily',
                priority: 'Multi-building staging, rapid tenant notices, unit dry-in speed.',
                href: '/industries/apartments',
                img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80',
              },
              {
                title: 'HOA & Planned Communities',
                priority: 'Board approval documentation, architectural consistency, clean grounds cleanup.',
                href: '/commercial-roofing',
                img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
              },
              {
                title: 'Commercial Office',
                priority: 'Low-noise fastening methods, professional tenant impression, executive suites dry-in.',
                href: '/commercial-roofing',
                img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
              },
              {
                title: 'Hotels & Hospitality',
                priority: 'Guest comfort, strict noise curfews, zero disruption to guest room availability.',
                href: '/commercial-roofing',
                img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
              },
              {
                title: 'Restaurants & Food Service',
                priority: 'Grease-resistant PVC membranes, rooftop exhaust curb sealing, health code compliance.',
                href: '/pvc-roofing',
                img: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=600&q=80',
              },
              {
                title: 'Municipal & Institutional',
                priority: 'Public bid compliance, prevailing wage documentation, long-term civic warranties.',
                href: '/commercial-roofing',
                img: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80',
              },
              {
                title: 'Property Management',
                priority: 'Portfolio condition audits, capital reserve planning, single-call emergency dispatch.',
                href: '/property-management',
                img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
              },
            ].map((ind) => (
              <Link
                key={ind.title}
                to={ind.href}
                className="group block bg-[#f4f3ef] border border-[#e6e4df] overflow-hidden hover:border-[#181818] transition-colors"
              >
                <div className="h-32 overflow-hidden bg-[#181818]">
                  <img
                    src={ind.img}
                    alt={ind.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4 space-y-1.5">
                  <div className="font-heading font-black text-sm uppercase text-[#181818] group-hover:text-[#d99a19] transition-colors leading-tight">
                    {ind.title}
                  </div>
                  <div className="text-[11px] text-[#666666] leading-snug">
                    {ind.priority}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------------
          12. TECHNOLOGY & DOCUMENTATION: Editorial Technical Competence
         ------------------------------------------------------------------------- */}
      <section className="bg-[#f4f3ef] border-b border-[#e6e4df] py-18 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5 space-y-4">
            <div className="text-xs font-mono-crd text-[#666666] uppercase tracking-wider">
              VERIFIED FIELD PLATFORMS
            </div>
            <h2 className="text-3xl sm:text-5xl font-heading font-black uppercase text-[#181818] tracking-tight leading-[0.95]">
              The Roof Is Physical. The Documentation Should Be Precise.
            </h2>
            <p className="text-sm text-[#555555] leading-relaxed">
              We do not rely on guesses or subjective estimates. CRD equips all field personnel with industry-standard forensic mapping, certified damage evaluation standards, and aerial geometry verification.
            </p>
            <div className="pt-2">
              <Link
                to="/about/credentials"
                className="inline-flex items-center gap-2 text-xs font-heading font-bold uppercase text-[#181818] hover:text-[#d99a19] tracking-wider transition-colors"
              >
                <span>View All Verified Credentials</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BUSINESS_INFO.verifiedTechnologies.map((tech) => (
              <div key={tech.name} className="bg-white border border-[#e6e4df] p-5 space-y-1.5">
                <div className="text-[11px] font-mono-crd text-[#d99a19] uppercase">VERIFIED PLATFORM</div>
                <div className="font-heading font-bold text-base uppercase text-[#181818]">
                  {tech.name}
                </div>
                <p className="text-xs text-[#666666] leading-relaxed">
                  {tech.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------------
          13. REAL PROJECTS SHOWCASE: Architecture & Field Systems
         ------------------------------------------------------------------------- */}
      <section className="bg-white border-b border-[#e6e4df] py-18 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <div className="text-xs font-mono-crd text-[#666666] uppercase tracking-wider">
                FIELD CAPABILITY & REAL WORK
              </div>
              <h2 className="text-3xl sm:text-5xl font-heading font-black uppercase text-[#181818] tracking-tight">
                Commercial Project Showcases.
              </h2>
              <p className="text-sm text-[#555555]">
                Representative commercial roof scopes executing across low-slope, restoration, and storm reconstruction categories.
              </p>
            </div>
            <button
              onClick={() => onOpenInspection('Inspection')}
              className="crd-button-primary text-xs font-heading font-bold uppercase tracking-wider whitespace-nowrap self-start sm:self-auto"
            >
              Discuss Your Facility Scope
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Project Category 01 */}
            <div className="border border-[#e6e4df] bg-[#f4f3ef] overflow-hidden">
              <div className="h-64 sm:h-72 overflow-hidden bg-[#181818]">
                <img
                  src="/assets/images/library/commercial-industrial-roofing.jpg"
                  alt="Industrial distribution center heat-welded white TPO single-ply roofing"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono-crd text-[#666666]">
                  <span>SYSTEM: 60-MIL TPO HEAT-WELDED</span>
                  <span>FOUR-STATE SERVICE AREA</span>
                </div>
                <h3 className="font-heading font-bold text-2xl uppercase text-[#181818]">
                  Industrial Distribution Logistics Center
                </h3>
                <p className="text-xs text-[#555555] leading-relaxed">
                  Complete single-ply tear-off and replacement including polyiso R-30 insulation upgrade, 14 rooftop mechanical curb retrofits, and tapered cricket drainage redesign.
                </p>
              </div>
            </div>

            {/* Project Category 02 */}
            <div className="border border-[#e6e4df] bg-[#f4f3ef] overflow-hidden">
              <div className="h-64 sm:h-72 overflow-hidden bg-[#181818]">
                <img
                  src="/assets/images/library/commercial-roof-system-detail.jpg"
                  alt="Commercial standing seam metal roof restoration"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono-crd text-[#666666]">
                  <span>SYSTEM: STANDING SEAM RESTORATION</span>
                  <span>REGIONAL FACILITY</span>
                </div>
                <h3 className="font-heading font-bold text-2xl uppercase text-[#181818]">
                  Manufacturing Complex Metal Roof Renewal
                </h3>
                <p className="text-xs text-[#555555] leading-relaxed">
                  Fastener replacement, horizontal seam flashing encapsulation, and fluid-applied elastomeric topcoat halting severe oxidation without interior factory downtime.
                </p>
              </div>
            </div>

            {/* Project Category 03 */}
            <div className="border border-[#e6e4df] bg-[#f4f3ef] overflow-hidden">
              <div className="h-64 sm:h-72 overflow-hidden bg-[#181818]">
                <img
                  src="/assets/images/library/commercial-roofing-feature.jpg"
                  alt="Commercial medical pavilion high-solids silicone roof restoration"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono-crd text-[#d99a19] font-bold">
                  <span>SYSTEM: HIGH-SOLIDS SILICONE</span>
                  <span>HEALTHCARE / OFFICE</span>
                </div>
                <h3 className="font-heading font-bold text-2xl uppercase text-[#181818]">
                  Commercial Medical Pavilion Restoration
                </h3>
                <p className="text-xs text-[#555555] leading-relaxed">
                  Seamless fluid coating over an aged modified bitumen substrate, providing 100% ponding water resistance and extending system service life by 15 years.
                </p>
              </div>
            </div>

            {/* Project Category 04 */}
            <div className="border border-[#e6e4df] bg-[#f4f3ef] overflow-hidden">
              <div className="h-64 sm:h-72 overflow-hidden bg-[#181818]">
                <img
                  src="/assets/images/library/commercial-roof-inspection.jpg"
                  alt="Severe hail damage commercial forensic mapping"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono-crd text-[#b83232] font-bold">
                  <span>SYSTEM: POST-HAIL RECOVERY & XACTIMATE</span>
                  <span>RETAIL CENTER</span>
                </div>
                <h3 className="font-heading font-bold text-2xl uppercase text-[#181818]">
                  Commercial Center Hail Catastrophe Response
                </h3>
                <p className="text-xs text-[#555555] leading-relaxed">
                  Forensic membrane test-cuts, HVAC fin comb mapping, detailed Xactimate line-iteming, and successful on-roof collaboration with commercial adjusters.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------------
          14. COST / PLANNING: Professional Assessment & Planning Estimator
         ------------------------------------------------------------------------- */}
      <section className="bg-[#f4f3ef] border-b border-[#e6e4df] py-18 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="text-xs font-mono-crd text-[#666666] uppercase tracking-wider">
            CAPITAL BUDGETING & ESTIMATING
          </div>
          <h2 className="text-3xl sm:text-5xl font-heading font-black uppercase text-[#181818] tracking-tight">
            Planning a Commercial Roof Project?
          </h2>
          <p className="text-base text-[#444444] leading-relaxed max-w-2xl mx-auto">
            Commercial roofing costs vary dramatically by system, roof condition, accessibility, scope and building requirements.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/commercial-roof-cost-calculator"
              className="crd-button-accent text-xs font-heading font-black uppercase tracking-wider flex items-center gap-2"
            >
              <Calculator className="w-4 h-4 text-[#111111]" />
              <span>Use the Commercial Roof Cost Calculator</span>
            </Link>

            <button
              onClick={() => onOpenInspection('Inspection')}
              className="crd-button-primary text-xs font-heading font-bold uppercase tracking-wider"
            >
              Request a Professional Roof Assessment
            </button>
          </div>

          <div className="pt-6 border-t border-[#e6e4df] text-[11px] text-[#77736b] max-w-2xl mx-auto leading-relaxed">
            {BUSINESS_INFO.calculatorDisclaimer}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------------
          15. SERVICE AREA: Four-State Commercial Coverage
         ------------------------------------------------------------------------- */}
      <section className="bg-white border-b border-[#e6e4df] py-18 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div className="text-xs font-mono-crd text-[#666666] uppercase tracking-wider">
              FOUR-STATE OPERATING TERRITORY
            </div>
            <h2 className="text-3xl sm:text-5xl font-heading font-black uppercase text-[#181818] tracking-tight leading-[0.95]">
              Commercial Roofing Across Four States.
            </h2>
            <p className="text-sm text-[#444444] leading-relaxed">
              Commercial Roof Doctors serves commercial, industrial, and multi-site properties across Texas, Arkansas, Louisiana, and Oklahoma. Project availability, mobilization, and travel are confirmed during consultation based on property location and scope.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <Link
                to="/service-areas/texas"
                className="p-3 bg-[#f4f3ef] border border-[#e6e4df] hover:border-[#181818] transition-colors"
              >
                <div className="font-heading font-bold uppercase text-[#181818]">Texas Operations</div>
                <div className="text-[11px] text-[#666666]">Statewide commercial coverage</div>
              </Link>
              <Link
                to="/service-areas/arkansas"
                className="p-3 bg-[#f4f3ef] border border-[#e6e4df] hover:border-[#181818] transition-colors"
              >
                <div className="font-heading font-bold uppercase text-[#181818]">Arkansas Operations</div>
                <div className="text-[11px] text-[#666666]">Statewide commercial coverage</div>
              </Link>
              <Link
                to="/service-areas/louisiana"
                className="p-3 bg-[#f4f3ef] border border-[#e6e4df] hover:border-[#181818] transition-colors"
              >
                <div className="font-heading font-bold uppercase text-[#181818]">Louisiana Operations</div>
                <div className="text-[11px] text-[#666666]">Statewide commercial coverage</div>
              </Link>
              <Link
                to="/service-areas/oklahoma"
                className="p-3 bg-[#f4f3ef] border border-[#e6e4df] hover:border-[#181818] transition-colors"
              >
                <div className="font-heading font-bold uppercase text-[#181818]">Oklahoma Operations</div>
                <div className="text-[11px] text-[#666666]">Statewide commercial coverage</div>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 bg-[#181818] text-white p-8 border border-[#282828] space-y-4">
            <div className="text-xs font-mono-crd text-[#d99a19] uppercase">OPERATIONAL MODEL</div>
            <h3 className="font-heading font-bold text-2xl uppercase text-white">
              Field-Operated Commercial Contractor
            </h3>
            <p className="text-xs text-[#aaaaaa] leading-relaxed">
              {BUSINESS_INFO.disclaimerServiceArea}
            </p>
            <div className="pt-2 border-t border-[#333333] flex items-center justify-between text-xs font-mono-crd text-[#888888]">
              <span>Direct Dispatch Hotline:</span>
              <a href={`tel:${BUSINESS_INFO.phoneRaw}`} className="text-[#d99a19] font-bold hover:underline">
                {BUSINESS_INFO.phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------------
          16. REVIEWS / REPUTATION PROTOCOL: Zero-Fabrication Transparency
         ------------------------------------------------------------------------- */}
      <section className="bg-[#f4f3ef] border-b border-[#e6e4df] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="text-xs font-mono-crd text-[#666666] uppercase tracking-wider">
            VERIFIED CLIENT REPUTATION
          </div>
          <h3 className="font-heading font-bold text-3xl uppercase text-[#181818]">
            Transparent Client Feedback
          </h3>
          <p className="text-xs sm:text-sm text-[#666666] max-w-xl mx-auto leading-relaxed">
            Commercial Roof Doctors does not display fabricated ratings, simulated star counts, or synthetic testimonials. Verified customer reviews are maintained directly on Google Reviews.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <a
              href="https://www.google.com/search?q=Commercial+Roof+Doctors+Texarkana"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-[#e6e4df] text-xs font-bold text-[#181818] border border-[#d5d2ca] uppercase tracking-wider transition-colors"
            >
              <span>See Google Reviews</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#666666]" />
            </a>
            <a
              href="https://www.google.com/search?q=Commercial+Roof+Doctors+Texarkana"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-[#e6e4df] text-xs font-bold text-[#181818] border border-[#d5d2ca] uppercase tracking-wider transition-colors"
            >
              <span>Leave a Review</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#666666]" />
            </a>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------------
          17. FINAL CTA: Dark Minimal Architectural Finish
         ------------------------------------------------------------------------- */}
      <section className="bg-[#151515] text-white py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-t border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="max-w-2xl space-y-3">
            <div className="text-xs font-mono-crd text-[#d99a19] uppercase tracking-wider">
              PRECISION • PROTECTION • PERFORMANCE
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black uppercase tracking-tight text-white leading-none">
              Your Roof Is Too Important to Guess About.
            </h2>
            <p className="text-lg sm:text-xl text-[#cccccc] font-medium pt-1">
              Start with an inspection. Build the right plan.
            </p>
            <div className="pt-3 flex flex-wrap items-center gap-6 text-xs font-mono-crd text-[#888888]">
              <span>Direct: <a href={`tel:${BUSINESS_INFO.phoneRaw}`} className="text-white font-bold hover:text-[#d99a19] transition-colors">{BUSINESS_INFO.phone}</a></span>
              <span>Email: <a href={`mailto:${BUSINESS_INFO.email}`} className="text-white font-bold hover:text-[#d99a19] transition-colors">{BUSINESS_INFO.email}</a></span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button
              id="final-cta-inspection-btn"
              onClick={() => onOpenInspection('Inspection')}
              className="crd-button-accent text-xs font-heading font-black uppercase tracking-wider px-8 min-h-[52px] cursor-pointer flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4 text-[#111111]" />
              <span>Request a Commercial Roof Inspection</span>
            </button>

            <button
              id="final-cta-emergency-btn"
              onClick={onOpenEmergency}
              className="bg-[#b83232] hover:bg-[#9c2525] text-white font-heading font-bold text-xs uppercase tracking-wider px-7 min-h-[52px] cursor-pointer flex items-center justify-center gap-2 rounded-none transition-colors"
            >
              <AlertTriangle className="w-4 h-4 text-white" />
              <span>Report a Roof Emergency</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
