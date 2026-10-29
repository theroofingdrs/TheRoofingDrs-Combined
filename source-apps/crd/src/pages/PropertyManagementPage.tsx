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
        title="Commercial Roofing for Property Managers | Ark-La-Tex"
        description="One roofing partner. Every property. One roof at a time. Portfolio roof inventories, condition scorecards, emergency priority, and capital expenditure planning for property managers."
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
            Eliminate the hassle of managing multiple conflicting contractors across your commercial properties. Commercial Roof Doctors acts as your single-source commercial roofing advisor and field execution partner.
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
              Managing 5 to 50 buildings means fragmented records, unknown membrane ages, and surprise leaks that break annual maintenance budgets.
            </p>
            <div className="text-xs text-slate-200 font-semibold pt-2 border-t border-slate-800">
              CRD Solution: Comprehensive digital roof cataloging by building and section.
            </div>
          </div>

          <div className="bg-[#0e1422] border border-slate-800 p-6 rounded-xl space-y-3">
            <div className="text-amber-500 font-heading text-lg font-bold uppercase">
              Tenant Disruption & Liability
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              When water penetrates an office suite, medical clinic, or retail inventory, tenant dissatisfaction and lease disputes escalate instantly.
            </p>
            <div className="text-xs text-slate-200 font-semibold pt-2 border-t border-slate-800">
              CRD Solution: Priority emergency dispatch and certified interior water dry-in.
            </div>
          </div>

          <div className="bg-[#0e1422] border border-slate-800 p-6 rounded-xl space-y-3">
            <div className="text-amber-500 font-heading text-lg font-bold uppercase">
              Predatory "Total Replacement" Quotes
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Contractors pushing full tear-offs when 80% of your roof membrane has remaining service life or can be restored with fluid coatings.
            </p>
            <div className="text-xs text-slate-200 font-semibold pt-2 border-t border-slate-800">
              CRD Solution: Objective diagnostics with transparent coat-vs-replace modeling.
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
              What Property Managers Receive with Commercial Roof Doctors
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Portfolio Roof Inventories',
                desc: 'A complete inventory of all properties, buildings, roof sections, square footages, membrane types, and estimated installation years.',
              },
              {
                title: 'Condition Scorecards',
                desc: 'Objective condition grading (Good, Fair, Critical) with photo-verified defect tags so asset managers can prioritize capital allocation.',
              },
              {
                title: 'Priority Emergency Response',
                desc: 'Guaranteed dispatch queue during severe storm, wind, and hail outbreaks across the Ark-La-Tex region.',
              },
              {
                title: 'Adjuster & Insurance Support',
                desc: 'We attend insurance adjuster walk-throughs with full Xactimate estimates and EagleView roof geometry to advocate for complete scope.',
              },
              {
                title: 'Remaining-Life Forecasting',
                desc: 'Scientific analysis of membrane elasticity and seam integrity to project remaining service life and avoid surprise capital calls.',
              },
              {
                title: 'Multi-Year Budget Planning',
                desc: '1-to-5 year CapEx forecasts formatted for ownership boards, HOA directors, and asset investment committees.',
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
          Contact Commercial Roof Doctors to audit your properties and build a customized commercial service agreement.
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
