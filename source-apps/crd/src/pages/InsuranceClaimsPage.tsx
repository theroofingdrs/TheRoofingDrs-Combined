import React from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Building,
  Users,
  Camera,
  ArrowRight,
} from 'lucide-react';
import { SeoMeta } from '../components/SeoMeta';
import { Link } from '../router';
import { BUSINESS_INFO } from '../constants';
import { LeadType } from '../types';

interface InsuranceClaimsPageProps {
  onOpenInspection: (initialLeadType?: LeadType) => void;
  onOpenEmergency: () => void;
}

export const InsuranceClaimsPage: React.FC<InsuranceClaimsPageProps> = ({
  onOpenInspection,
}) => {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans-crd pb-24">
      <SeoMeta
        title="Commercial Roof Insurance Claims & Adjuster Coordination | CRD"
        description="Commercial roof insurance claim documentation, Xactimate estimating, adjuster walk-throughs, and scope alignment for commercial properties across the Ark-La-Tex."
        canonicalPath="/insurance-claims"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Insurance Claims', url: '/insurance-claims' },
        ]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#0e1424] via-[#0a0f1c] to-[#090d16] border-b border-slate-800 pt-14 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono-crd uppercase tracking-wider">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Commercial Insurance Scoping & Documentation</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight uppercase text-white leading-tight">
            Commercial Roof Claims.{' '}
            <span className="text-amber-500">Documented to Carrier Standards.</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Filing a commercial roof insurance claim requires rigorous physical proof, standardized line-item estimates, and professional representation during adjuster inspections.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onOpenInspection('Insurance Claim')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-black text-sm uppercase tracking-wider px-8 py-3.5 rounded shadow-xl shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Request Claim Documentation Audit</span>
            </button>
            <a
              href={`tel:${BUSINESS_INFO.phoneRaw}`}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-heading font-bold text-sm uppercase tracking-wider px-6 py-3.5 rounded"
            >
              Direct Claim Dispatch: {BUSINESS_INFO.phone}
            </a>
          </div>
        </div>
      </section>

      {/* MANDATORY LEGAL & REGULATORY INSURANCE DISCLAIMER */}
      <section className="bg-[#060911] border-b border-slate-800 py-6 px-4">
        <div className="max-w-4xl mx-auto p-4 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1">
          <span className="font-bold text-amber-400 uppercase font-mono-crd block">
            Mandatory Insurance Disclosure:
          </span>
          {BUSINESS_INFO.disclaimers.insurance}
        </div>
      </section>

      {/* What CRD Delivers for Insurance Adjusters */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="max-w-3xl">
          <div className="text-xs font-mono-crd text-amber-500 uppercase tracking-widest">
            Carrier-Grade Documentation
          </div>
          <h2 className="text-3xl font-heading font-black uppercase text-white mt-1">
            How CRD Builds an Unquestionable Commercial Claim File
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Insurance carriers reject or under-scope commercial claims when evidence is vague, photos lack GPS context, or estimates use non-standard formatting. We provide complete technical clarity:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-[#0e1422] border border-slate-800 p-6 rounded-xl space-y-3">
            <Camera className="w-6 h-6 text-amber-400" />
            <h3 className="font-heading font-bold text-lg uppercase text-white">CompanyCam Photo Evidence</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every photo is GPS-stamped, time-stamped, and organized by building section. Adjusters receive clear photographic proof of test squares, membrane splits, and curb flashings.
            </p>
          </div>

          <div className="bg-[#0e1422] border border-slate-800 p-6 rounded-xl space-y-3">
            <FileSpreadsheet className="w-6 h-6 text-amber-400" />
            <h3 className="font-heading font-bold text-lg uppercase text-white">Xactimate Line-Item Scoping</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We generate estimates in Xactimate—the exact software used by insurance carriers and independent adjusters—ensuring regional material and labor pricing consistency.
            </p>
          </div>

          <div className="bg-[#0e1422] border border-slate-800 p-6 rounded-xl space-y-3">
            <Users className="w-6 h-6 text-amber-400" />
            <h3 className="font-heading font-bold text-lg uppercase text-white">On-Roof Adjuster Meetings</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We climb the roof alongside the adjuster, point out subtle hail fractures and seam uplifts, and verify that the adjuster's initial scope accounts for all code requirements.
            </p>
          </div>
        </div>
      </section>

      {/* Conversion Banner */}
      <section className="pt-16 max-w-4xl mx-auto px-4 text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-heading font-black uppercase text-white">
          Navigating a Commercial Roof Claim in the Ark-La-Tex?
        </h2>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          Contact Commercial Roof Doctors for comprehensive pre-claim inspection, photographic evidence gathering, and line-item scoping.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => onOpenInspection('Insurance Claim')}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-black text-sm uppercase tracking-wider px-8 py-3.5 rounded shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            Request Claim Documentation
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
