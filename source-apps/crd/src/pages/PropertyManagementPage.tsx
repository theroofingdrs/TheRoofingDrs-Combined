import React from 'react';
import {
  Building,
  CheckCircle2,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  Phone,
  Layers,
  FolderKanban,
  ClipboardList,
} from 'lucide-react';
import { SeoMeta } from '../components/SeoMeta';
import { Link } from '../router';
import { BUSINESS_INFO } from '../constants';
import { LeadType } from '../types';

interface PropertyManagementPageProps {
  onOpenInspection: (initialLeadType?: LeadType) => void;
  onOpenEmergency: () => void;
}

export const PropertyManagementPage: React.FC<PropertyManagementPageProps> = ({
  onOpenInspection,
}) => {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans-crd pb-24">
      <SeoMeta
        title="Commercial Roof Management for Property Managers | Commercial ROOF Doctors"
        description="Commercial ROOF Doctors helps commercial real estate managers and property owners organize property-by-property roof inspections, photo records, objective 1–5 condition ratings, repair tracking, maintenance priorities and replacement planning across the Ark-La-Tex region."
        canonicalPath="/property-management"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Property Protection', url: '/property-management' },
        ]}
      />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-[#0e1424] via-[#0b101c] to-[#090d16] border-b border-slate-800 pt-14 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono-crd uppercase tracking-wider">
            <Building className="w-4 h-4" />
            Commercial Real Estate & Portfolio Management
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight uppercase text-white leading-tight">
            One Roofing Partner.{' '}
            <span className="text-amber-500">Every Property.</span> One Roof at a Time.
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Bring inspections, roof-condition records, repair priorities and long-range planning into one coordinated process. Commercial ROOF Doctors works with property owners and managers as a commercial roofing evaluation, planning and field-service partner across eligible markets.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onOpenInspection('Property Management')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-black text-sm uppercase tracking-wider px-8 py-3.5 rounded shadow-xl shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Request Portfolio Roof Assessment</span>
            </button>
            <Link
              to="/crd-ppp"
              className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-heading font-bold text-sm uppercase tracking-wider px-6 py-3.5 rounded"
            >
              Explore CRD PPP™ Plans
            </Link>
          </div>
        </div>
      </section>

      {/* Core Challenges for Property Managers */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0e1422] border border-slate-800 p-6 rounded-xl space-y-3">
            <div className="text-amber-500 font-heading text-lg font-bold uppercase">
              No Visibility Across Portfolios
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Managing buildings across multiple sites can leave roof ages, inspection records, active leaks and repair history scattered across vendors and spreadsheets.
            </p>
            <div className="text-xs text-slate-200 font-semibold pt-2 border-t border-slate-800">
              CRD Approach: Property-by-property roof inventories, inspection records and photo documentation.
            </div>
          </div>

          <div className="bg-[#0e1422] border border-slate-800 p-6 rounded-xl space-y-3">
            <div className="text-amber-500 font-heading text-lg font-bold uppercase">
              Tenant Disruption & Liability
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              A roof leak can interrupt tenants, customers, employees, inventory, equipment and day-to-day business operations.
            </p>
            <div className="text-xs text-slate-200 font-semibold pt-2 border-t border-slate-800">
              CRD Approach: Documented issue intake, emergency response coordination and practical mitigation recommendations, with timing confirmed by location and availability.
            </div>
          </div>

          <div className="bg-[#0e1422] border border-slate-800 p-6 rounded-xl space-y-3">
            <div className="text-amber-500 font-heading text-lg font-bold uppercase">
              Unclear Repair-versus-Replacement Decisions
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Owners need to know whether a roof is a candidate for targeted repair, restoration or replacement—and what supports that recommendation.
            </p>
            <div className="text-xs text-slate-200 font-semibold pt-2 border-t border-slate-800">
              CRD Approach: Roof-system evaluation and documented options based on observed conditions, compatibility, scope and long-term property needs.
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Features */}
      <section className="py-16 bg-[#060911] border-y border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="max-w-3xl">
            <div className="text-xs font-mono-crd text-amber-500 uppercase tracking-widest">
              Commercial Facility Management
            </div>
            <h2 className="text-3xl font-heading font-black uppercase text-white mt-1">
              What Property Managers Receive from Commercial ROOF Doctors
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Portfolio Roof Inventories',
                desc: 'A complete inventory of all properties, buildings, roof sections, square footages, membrane types, and estimated installation years.',
              },
              {
                title: 'Condition Ratings & Photo Records',
                desc: 'Property-by-property inspection records, photo-documented conditions and an objective 1–5 roof condition rating to help compare buildings and prioritize attention.',
              },
              {
                title: 'Repair Priorities & Response Coordination',
                desc: 'Document active issues, urgency, recommended next steps and response coordination. Dispatch timing is confirmed for each property based on location, conditions and availability.',
              },
              {
                title: 'Adjuster & Insurance Support',
                desc: 'We attend insurance adjuster walk-throughs with full Xactimate estimates and EagleView roof geometry to advocate for complete scope.',
              },
              {
                title: 'Centralized Repair Tracking',
                desc: 'Keep property-level repair needs, photo records, recommended actions and follow-up status organized for easier review across the portfolio.',
              },
              {
                title: 'Maintenance & Capital Planning',
                desc: 'Identify maintenance opportunities and develop repair, restoration and replacement planning inputs that owners can use in annual and multi-year capital discussions.',
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-[#0e1422] border border-slate-800 p-6 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <h3 className="font-heading font-bold text-lg uppercase text-white">{item.title}</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conversion Banner */}
      <section className="pt-16 max-w-4xl mx-auto px-4 text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-heading font-black uppercase text-white">
          Consolidate Your Commercial Roof Management
        </h2>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          Start with a portfolio roof assessment. CRD can review the properties, organize current roof conditions and help define practical inspection, repair, maintenance and capital-planning next steps.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => onOpenInspection('Property Management')}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-black text-sm uppercase tracking-wider px-8 py-3.5 rounded shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            Request Portfolio Assessment
          </button>
          <a
            href={`tel:${BUSINESS_INFO.phoneRaw}`}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-heading font-bold text-sm uppercase tracking-wider px-6 py-3.5 rounded"
          >
            Call Dispatch: {BUSINESS_INFO.phone}
          </a>
        </div>
      </section>
    </div>
  );
};
