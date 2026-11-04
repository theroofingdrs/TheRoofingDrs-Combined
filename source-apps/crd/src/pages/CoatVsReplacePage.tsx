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
                  <strong className="text-white block text-sm">Lower Initial Scope Cost (When the Roof Qualifies)</strong>
                  <span className="text-slate-400">A qualified restoration may avoid full tear-off and disposal. Actual savings depend on roof condition, moisture removal, repairs, coating chemistry, required dry-film thickness and warranty scope.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block text-sm">Potentially Less Disruption</strong>
                  <span className="text-slate-400">Restoration often avoids broad tear-off, but cleaning, repairs, equipment, odors, noise, access restrictions and weather can still affect building operations. A site-specific plan is required.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block text-sm">Tax Treatment Requires Project-Specific Review</strong>
                  <span className="text-slate-400">Tax treatment depends on the actual scope and applicable IRS rules. Do not assume a coating qualifies for an immediate deduction or Section 179D benefit. Owners should consult their tax professional.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block text-sm">Seamless Monolithic Barrier</strong>
                  <span className="text-slate-400">A properly specified fluid-applied system can create a continuous weathering surface, but seams, penetrations, transitions and existing defects must be repaired and reinforced as required by the approved system.</span>
                </div>
              </div>

              <div className="p-3 rounded bg-emerald-950/40 border border-emerald-900/60 text-emerald-200">
                <strong>Best Candidate:</strong> A roof with a sound, adequately attached substrate and deck, functioning drainage, compatible membrane/coating combination, and moisture conditions that meet the coating manufacturer's written requirements. Wet or deteriorated materials must be removed and replaced.
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
                  <strong className="text-white block text-sm">Higher Initial Capital Outlay</strong>
                  <span className="text-slate-400">Replacement generally has a higher initial cost and may be treated as a capital improvement for tax purposes. Actual tax treatment and recovery period depend on the project and current law; consult a qualified tax professional.</span>
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
                <strong>Consider Replacement When:</strong> Widespread wet insulation, deteriorated deck, failed attachment, widespread membrane failure, incompatible existing layers, or adopted code requirements make restoration or recover unsuitable.
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
                Use a moisture survey appropriate to the roof assembly and confirm suspect areas with test cuts or cores. There is no universal 20% or 25% pass/fail threshold for every roof or coating system. Wet insulation and deteriorated materials identified in the assessment must be removed and replaced before restoration.
              </p>
            </div>

            <div className="bg-[#0e1422] border border-slate-800 p-6 rounded-xl space-y-3">
              <div className="font-mono-crd text-amber-500 font-black text-xl">02. Pull-Adhesion Testing</div>
              <h3 className="font-heading font-bold text-base uppercase text-white">Manufacturer-Approved Adhesion Test</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Apply a representative test area and evaluate adhesion using the coating manufacturer's written procedure and acceptance criteria for the specific substrate. The applicable test method depends on the material and system; do not apply one ASTM method or generic pound-force threshold to every roof.
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
                The adopted building code and the authority having jurisdiction determine whether a recover is permitted and how existing roof coverings are counted. A fluid-applied coating is not a blanket exemption from code, fire, wind-uplift, drainage or substrate requirements. Verify the proposed assembly and local requirements before specifying the work.
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
          Contact Commercial Roof Doctors to schedule a core sample and infrared moisture audit on your Texas, Arkansas, Louisiana, or Oklahoma facility.
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
