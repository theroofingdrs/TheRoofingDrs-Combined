import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  FileText,
  AlertTriangle,
  Layers,
  ArrowRight,
  TrendingUp,
  FolderKanban,
  Building2,
  Camera,
} from 'lucide-react';
import { SeoMeta } from '../components/SeoMeta';
import { Link } from '../router';
import { BUSINESS_INFO } from '../constants';
import { LeadType } from '../types';

interface CrdPppPageProps {
  onOpenInspection: (initialLeadType?: LeadType) => void;
  onOpenEmergency: () => void;
}

export const CrdPppPage: React.FC<CrdPppPageProps> = ({ onOpenInspection }) => {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans-crd pb-24">
      <SeoMeta
        title="CRD PPP™ Property Protection Program | Commercial Roof Asset Management"
        description="Don't wait for a roof problem. Have a plan before it becomes one. Commercial roof asset management, scheduled preventative maintenance, and capital planning for the Ark-La-Tex."
        canonicalPath="/crd-ppp"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Property Protection', url: '/property-management' },
          { name: 'CRD PPP™', url: '/crd-ppp' },
        ]}
      />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-[#0e1424] via-[#0a0f1c] to-[#090d16] border-b border-slate-800 pt-14 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono-crd uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            CRD PPP™ — Property Protection Program
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight uppercase text-white leading-tight">
            Your Roof Is an Asset.{' '}
            <span className="text-amber-500">Manage It Like One.</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Don't wait for an active ceiling leak to disrupt your tenants, damage inventory, or force an emergency replacement. Establish a proactive commercial roof asset management plan.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onOpenInspection('PPP/Maintenance')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-black text-sm uppercase tracking-wider px-8 py-3.5 rounded shadow-xl shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Build My CRD PPP™ Plan</span>
            </button>
            <Link
              to="/property-management"
              className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-heading font-bold text-sm uppercase tracking-wider px-6 py-3.5 rounded"
            >
              Multi-Property Portfolios
            </Link>
          </div>
        </div>
      </section>

      {/* Conceptual Asset Hierarchy Display */}
      <section className="py-12 bg-[#060911] border-b border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="text-center">
            <div className="text-xs font-mono-crd text-amber-500 uppercase tracking-widest">
              Structured Asset Data Hierarchy
            </div>
            <h2 className="text-xl sm:text-2xl font-heading font-bold uppercase text-white mt-1">
              How Commercial Roof Doctors Catalogs Your Portfolio
            </h2>
          </div>

          <div className="p-4 bg-[#0d1322] border border-slate-800 rounded-xl overflow-x-auto">
            <div className="flex items-center justify-between min-w-[700px] text-xs font-mono-crd text-slate-300">
              <div className="flex items-center gap-1.5 p-2 bg-slate-900 rounded border border-slate-700">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>Property</span>
              </div>
              <span>→</span>
              <div className="p-2 bg-slate-900 rounded border border-slate-700">Building</div>
              <span>→</span>
              <div className="p-2 bg-slate-900 rounded border border-slate-700">Roof Section</div>
              <span>→</span>
              <div className="p-2 bg-slate-900 rounded border border-slate-700">Roof System</div>
              <span>→</span>
              <div className="p-2 bg-slate-900 rounded border border-slate-700">Age & Condition</div>
              <span>→</span>
              <div className="flex items-center gap-1 p-2 bg-slate-900 rounded border border-slate-700">
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span>GPS Photos</span>
              </div>
              <span>→</span>
              <div className="p-2 bg-slate-900 rounded border border-slate-700">Action Plan</div>
              <span>→</span>
              <div className="flex items-center gap-1 p-2 bg-amber-500/20 text-amber-300 font-bold rounded border border-amber-500/50">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Budget Forecast</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Program Tiers */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-heading font-black uppercase text-white">
            Program Tiers Designed For Commercial Real Estate
          </h2>
          <p className="text-sm text-slate-400">
            Select the tier aligned with your asset value, tenant criticality, and multi-year capital horizon.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Tier 1: PPP Essential */}
          <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-xs font-mono-crd text-amber-500 uppercase">Entry Asset Auditing</span>
                <h3 className="text-2xl font-heading font-black uppercase text-white mt-1">PPP Essential</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ideal for stable single-building facilities requiring annual third-party verification and insurance compliance.
              </p>
              <ul className="text-xs text-slate-300 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Annual physical on-roof forensic inspection</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Detailed photographic condition assessment</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Drainage, scupper, and gutter flow checks</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Prioritized maintenance recommendations</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onOpenInspection('PPP/Maintenance')}
              className="w-full py-2.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-heading font-bold uppercase tracking-wider text-slate-200 cursor-pointer"
            >
              Select Essential
            </button>
          </div>

          {/* Tier 2: PPP Professional */}
          <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-xs font-mono-crd text-amber-500 uppercase">Active Preventative</span>
                <h3 className="text-2xl font-heading font-black uppercase text-white mt-1">PPP Professional</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                For active commercial facilities requiring semi-annual tune-ups before and after extreme seasonal weather.
              </p>
              <ul className="text-xs text-slate-300 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Bi-annual inspections (Spring & Fall audits)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Minor preventative sealants & seam tune-ups</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Clearing leaves and debris from commercial drains</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Priority response dispatch during storm events</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onOpenInspection('PPP/Maintenance')}
              className="w-full py-2.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-heading font-bold uppercase tracking-wider text-slate-200 cursor-pointer"
            >
              Select Professional
            </button>
          </div>

          {/* Tier 3: PPP Complete */}
          <div className="bg-[#0e1422] border-2 border-amber-500/60 rounded-xl p-6 flex flex-col justify-between space-y-6 shadow-xl shadow-amber-500/10">
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <div className="inline-block px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono-crd uppercase mb-1">
                  Most Comprehensive
                </div>
                <h3 className="text-2xl font-heading font-black uppercase text-white">PPP Complete</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Full-lifecycle asset management with emergency disaster standby, storm audits, and capital budget forecasting.
              </p>
              <ul className="text-xs text-slate-300 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Scheduled seasonal inspections & preventative care</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Rapid post-storm damage inspections (Hail & Wind)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Adjuster packet preparation & meeting support</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Remaining-service-life analysis & 5-year budget plans</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onOpenInspection('PPP/Maintenance')}
              className="w-full py-2.5 rounded bg-amber-500 hover:bg-amber-400 text-xs font-heading font-black uppercase tracking-wider text-slate-950 cursor-pointer"
            >
              Select Complete
            </button>
          </div>

          {/* Tier 4: PPP Portfolio */}
          <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-xs font-mono-crd text-amber-500 uppercase">Enterprise Real Estate</span>
                <h3 className="text-2xl font-heading font-black uppercase text-white mt-1">PPP Portfolio</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Designed exclusively for commercial property management firms, multifamily operators, and institutional owners.
              </p>
              <ul className="text-xs text-slate-300 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Centralized multi-property roof database</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Property-by-property condition scorecards</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Consolidated annual reporting & board presentations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Dedicated CRD commercial account manager</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onOpenInspection('Property Management')}
              className="w-full py-2.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-heading font-bold uppercase tracking-wider text-slate-200 cursor-pointer"
            >
              Select Portfolio
            </button>
          </div>
        </div>
      </section>

      {/* What CRD Inspects under PPP */}
      <section className="py-16 bg-[#060911] border-y border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="max-w-3xl">
            <div className="text-xs font-mono-crd text-amber-500 uppercase tracking-widest">
              Technical Verification
            </div>
            <h2 className="text-3xl font-heading font-black uppercase text-white mt-1">
              What CRD Inspects During PPP Audits
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Commercial roof failures almost always begin at transitions, penetrations, and perimeter edges. We inspect every critical failure point.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
            {[
              'Membrane elasticity & crazing',
              'Heat-welded / adhesive seam integrity',
              'HVAC curb flashing & counterflashing',
              'Pipe boots & pitch pans',
              'Internal roof drains & clamping rings',
              'Scuppers, collector boxes & downspouts',
              'Edge metal & perimeter coping caps',
              'Parapet wall masonry & coping seals',
              'Mechanical fastener back-out',
              'Substrate insulation ponding & depression',
              'Hail fracture & bruised reinforcement',
              'Previous non-compatible patch repairs',
            ].map((pt) => (
              <div key={pt} className="p-3 bg-[#0d1322] border border-slate-800 rounded flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                <span className="text-slate-200 font-medium">{pt}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Conversion CTA */}
      <section className="pt-16 max-w-4xl mx-auto px-4 text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-heading font-black uppercase text-white">
          Ready to Protect Your Commercial Roof Assets?
        </h2>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          Contact Commercial Roof Doctors to review your property portfolio and establish your customized CRD PPP™ agreement.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => onOpenInspection('PPP/Maintenance')}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-black text-sm uppercase tracking-wider px-8 py-3.5 rounded shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            Build My CRD PPP™ Plan
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
