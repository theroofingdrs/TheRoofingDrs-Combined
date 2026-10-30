import React from 'react';
import {
  RotateCcw,
  Layers,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  DollarSign,
  FileText,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { SeoMeta } from '../components/SeoMeta';
import { Link } from '../router';
import { BUSINESS_INFO } from '../constants';
import { LeadType } from '../types';

interface CoatVsReplacePageProps {
  onOpenInspection: (initialLeadType?: LeadType) => void;
  onOpenEmergency: () => void;
}

export const CoatVsReplacePage: React.FC<CoatVsReplacePageProps> = ({ onOpenInspection }) => {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans-crd pb-24">
      <SeoMeta
        title="Coat vs. Replace: Commercial Roof Decision Guide | CRD"
        description="Compare commercial roof restoration and replacement using roof condition, moisture, attachment, drainage, code and project cost factors."
        canonicalPath="/coat-vs-replace"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Technical Resources', url: '/coat-vs-replace' },
          { name: 'Coat vs. Replace', url: '/coat-vs-replace' },
        ]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#0e1424] via-[#0a0f1c] to-[#090d16] border-b border-slate-800 pt-14 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono-crd uppercase tracking-wider">
            <span>Engineering Decision Framework</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight uppercase text-white leading-tight">
            Commercial Roof: <span className="text-amber-500">Coat vs. Replace</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            A leaking or aging commercial roof does not automatically require a multi-hundred-thousand dollar tear-off. Understanding moisture saturation, membrane adhesion, and remaining service life helps you protect capital reserves.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onOpenInspection('Coating/Restoration')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-black text-sm uppercase tracking-wider px-8 py-3.5 rounded shadow-xl shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Schedule Coating Feasibility Audit</span>
            </button>
            <Link
              to="/commercial-roof-cost-calculator"
              className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-heading font-bold text-sm uppercase tracking-wider px-6 py-3.5 rounded"
            >
              Compare Costs in Calculator
            </Link>
          </div>
        </div>
      </section>

      {/* Side by Side Comparative Architecture */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <h2 className="text-3xl font-heading font-black uppercase text-white">
            Head-to-Head Comparison: Restorative Coatings vs. Complete Re-Roof
          </h2>
          <p className="text-sm text-slate-400">
            How both approaches stack up across cost, operational downtime, durability, and building code considerations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card: Restorative Coating */}
          <div className="bg-[#0e1422] border-2 border-emerald-500/50 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <div className="text-xs font-mono-crd text-emerald-400 font-bold uppercase">Option A: Restoration</div>
              <h3 className="text-2xl sm:text-3xl font-heading font-black uppercase text-white mt-1">
                Fluid-Applied Roof Coating (Silicone / Acrylic)
              </h3>
              <p className="text-xs text-slate-300 mt-2">
                A monolithic, seamless liquid elastomeric membrane applied directly over your prepared existing roof.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block text-sm">Potentially Lower Initial Project Cost</strong>
                  <span className="text-slate-400">A qualifying restoration may avoid some tear-off, disposal and replacement material costs. Actual savings depend on roof condition, repairs, preparation, system selection and project scope.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block text-sm">Zero Interior Operational Disruption</strong>
                  <span className="text-slate-400">No open roofs during rain, no falling dust or debris inside operating medical or manufacturing facilities.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block text-sm">Tax Treatment Requires Project-Specific Review</strong>
                  <span className="text-slate-400">Tax treatment depends on the facts, applicable tax rules and how the work is classified. CRD does not provide tax advice. Consult your tax professional before relying on a deduction or incentive.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block text-sm">Seamless Monolithic Barrier</strong>
                  <span className="text-slate-400">A fluid-applied system can create a continuous surface, but existing seams, penetrations, flashings and transitions still require inspection and reinforcement where specified.</span>
                </div>
              </div>

              <div className="p-3 rounded bg-emerald-950/40 border border-emerald-900/60 text-emerald-200">
                <strong>Potential Candidate:</strong> A dry, stable, adequately attached roof with repairable details and a coating system approved for the exact substrate.
              </div>
            </div>
          </div>

          {/* Card: Engineered Replacement */}
          <div className="bg-[#0e1422] border border-amber-500/40 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <div className="text-xs font-mono-crd text-amber-400 font-bold uppercase">Option B: Total Replacement</div>
              <h3 className="text-2xl sm:text-3xl font-heading font-black uppercase text-white mt-1">
                Engineered Tear-Off & Re-Roof
              </h3>
              <p className="text-xs text-slate-300 mt-2">
                Stripping existing materials down to structural metal, concrete, or wood decking and installing an all-new roof assembly.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block text-sm">Full Reset of Roof Life & Code Upgrades</strong>
                  <span className="text-slate-400">Replaces saturated polyiso insulation with code-compliant R-30 continuous thermal insulation.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block text-sm">Slope & Drainage Correction</strong>
                  <span className="text-slate-400">Allows installation of engineered tapered insulation crickets to eliminate chronic ponding water.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block text-sm">Higher Capital Outlay & Depreciation Schedule</strong>
                  <span className="text-slate-400">Replacement may involve higher initial costs, but accounting and tax treatment depend on the project and applicable rules. Obtain project-specific tax advice.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block text-sm">Operational Coordination Required</strong>
                  <span className="text-slate-400">Crane logistics, staging areas, and weather scheduling required to protect interior building spaces.</span>
                </div>
              </div>

              <div className="p-3 rounded bg-amber-950/40 border border-amber-900/60 text-amber-200">
                <strong>May Be Necessary When:</strong> Widespread wet insulation, structural deterioration, failed attachment, extensive membrane failure or code requirements make restoration unsuitable.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 4 Hard Engineering Criteria */}
      <section className="py-16 bg-[#060911] border-y border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="max-w-3xl">
            <div className="text-xs font-mono-crd text-amber-500 uppercase tracking-widest">
              Physical Diagnosis
            </div>
            <h2 className="text-3xl font-heading font-black uppercase text-white mt-1">
              The 4 Hard Engineering Criteria CRD Tests
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Before CRD recommends a coating, your roof must pass four rigorous physical tests:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#0e1422] border border-slate-800 p-6 rounded-xl space-y-3">
              <div className="font-mono-crd text-amber-500 font-black text-xl">01. Substrate Moisture</div>
              <h3 className="font-heading font-bold text-base uppercase text-white">Infrared & Core Sampling</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                There is no universal moisture percentage that determines coating suitability. Interpret infrared scans with verification such as core cuts or other diagnostics. Wet or deteriorated materials must be addressed before restoration, using project-specific criteria.
              </p>
            </div>

            <div className="bg-[#0e1422] border border-slate-800 p-6 rounded-xl space-y-3">
              <div className="font-mono-crd text-amber-500 font-black text-xl">02. Pull-Adhesion Testing</div>
              <h3 className="font-heading font-bold text-base uppercase text-white">Manufacturer-Specified Field Test</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Prepare representative test areas and perform the adhesion test method and acceptance criteria required by the coating manufacturer. Results must be evaluated with the substrate condition and complete assembly.
              </p>
            </div>

            <div className="bg-[#0e1422] border border-slate-800 p-6 rounded-xl space-y-3">
              <div className="font-mono-crd text-amber-500 font-black text-xl">03. Fastener Attachment</div>
              <h3 className="font-heading font-bold text-base uppercase text-white">Wind Uplift Resistance</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                A coating provides waterproofing—it does not provide mechanical holding power. If insulation boards, membrane or metal panels have failed attachment, the assembly needs an engineered repair or replacement plan before any coating is considered.
              </p>
            </div>

            <div className="bg-[#0e1422] border border-slate-800 p-6 rounded-xl space-y-3">
              <div className="font-mono-crd text-amber-500 font-black text-xl">04. Building Code Limits</div>
              <h3 className="font-heading font-bold text-base uppercase text-white">Maximum Roof Layers</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Roof-covering layer limits and coating classifications depend on the adopted code, existing assembly, product evaluation and local authority. Do not assume a coating is exempt from code requirements. Confirm the project with the building official and applicable manufacturer documentation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Conversion Banner */}
      <section className="pt-16 max-w-4xl mx-auto px-4 text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-heading font-black uppercase text-white">
          Need an Objective Diagnosis of Your Commercial Roof?
        </h2>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          Contact Commercial Roof Doctors to schedule a core sample and infrared moisture audit on your Ark-La-Tex facility.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => onOpenInspection('Coating/Restoration')}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-black text-sm uppercase tracking-wider px-8 py-3.5 rounded shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            Request Feasibility Audit
          </button>
          <a
            href={`tel:${BUSINESS_INFO.phoneRaw}`}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-heading font-bold text-sm uppercase tracking-wider px-6 py-3.5 rounded"
          >
            Call {BUSINESS_INFO.phone}
          </a>
        </div>
      </section>
    </div>
  );
};
