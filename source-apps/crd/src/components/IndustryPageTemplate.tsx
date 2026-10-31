import React from 'react';
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Phone,
  ArrowRight,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { SeoMeta } from './SeoMeta';
import { Link } from '../router';
import { BUSINESS_INFO } from '../constants';
import { LeadType, PropertyType } from '../types';

export interface IndustryPageData {
  title: string;
  metaDescription: string;
  canonicalPath: string;
  industryName: string;
  propertyType: PropertyType;
  heroHeadline: string;
  heroSubtitle: string;
  sectorChallenges: { title: string; desc: string }[];
  crdSolutions: string[];
  recommendedRoofSystems: { name: string; href: string; reason: string }[];
  complianceSafety: string;
  planningGuide?: { title: string; detail: string }[];
  inspectionChecklist?: string[];
  faqs?: { question: string; answer: string }[];
}

interface IndustryPageTemplateProps {
  data: IndustryPageData;
  onOpenInspection: (initialLeadType?: LeadType) => void;
  onOpenEmergency: () => void;
}

export const IndustryPageTemplate: React.FC<IndustryPageTemplateProps> = ({
  data,
  onOpenInspection,
  onOpenEmergency,
}) => {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans-crd pb-24">
      <SeoMeta
        title={data.title}
        description={data.metaDescription}
        canonicalPath={data.canonicalPath}
        serviceType={`Commercial roofing for ${data.industryName}`}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Industries', url: '/industries/churches' },
          { name: data.industryName, url: data.canonicalPath },
        ]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#0e1424] via-[#0a0f1c] to-[#090d16] border-b border-slate-800 pt-14 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono-crd uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            <span>Commercial Industry Solutions</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight uppercase text-white leading-tight">
            {data.heroHeadline}
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {data.heroSubtitle}
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onOpenInspection('Inspection')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-black text-sm uppercase tracking-wider px-8 py-3.5 rounded shadow-xl shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Request {data.industryName} Assessment</span>
            </button>
            <button
              onClick={onOpenEmergency}
              className="bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 font-heading font-bold text-sm uppercase tracking-wider px-6 py-3.5 rounded flex items-center gap-2 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>Emergency Dispatch</span>
            </button>
          </div>
        </div>
      </section>

      {/* Sector Specific Challenges */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="max-w-3xl">
          <div className="text-xs font-mono-crd text-amber-500 uppercase tracking-widest">
            Facility Environment
          </div>
          <h2 className="text-3xl font-heading font-black uppercase text-white mt-1">
            Unique Roofing Challenges in {data.industryName}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.sectorChallenges.map((item, idx) => (
            <div key={idx} className="bg-[#0e1422] border border-slate-800 p-6 rounded-xl space-y-2">
              <h3 className="font-heading font-bold text-lg uppercase text-amber-400">
                {item.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CRD Tailored Solutions */}
      <section className="py-16 bg-[#060911] border-y border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="max-w-3xl">
            <div className="text-xs font-mono-crd text-amber-500 uppercase tracking-widest">
              Engineered Protocols
            </div>
            <h2 className="text-3xl font-heading font-black uppercase text-white mt-1">
              How Commercial Roof Doctors Protects Your Facility
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.crdSolutions.map((sol, idx) => (
              <div key={idx} className="bg-[#0e1422] border border-slate-800 p-4 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-300 leading-relaxed">{sol}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended Roof Systems */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="max-w-3xl">
          <div className="text-xs font-mono-crd text-amber-500 uppercase tracking-widest">
            Recommended Membrane Specifications
          </div>
          <h2 className="text-3xl font-heading font-black uppercase text-white mt-1">
            Common Roof Systems for {data.industryName}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.recommendedRoofSystems.map((sys) => (
            <div key={sys.name} className="bg-[#0e1422] border border-slate-800 p-6 rounded-xl space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="font-heading font-bold text-xl uppercase text-white">{sys.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{sys.reason}</p>
              </div>
              <Link
                to={sys.href}
                className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold uppercase tracking-wider pt-2 border-t border-slate-800"
              >
                <span>View System Specifications</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Practical owner guidance */}
      {data.planningGuide?.length ? (
        <section className="py-16 bg-[#0b111e] border-y border-slate-800 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="max-w-3xl">
              <div className="text-xs font-mono-crd text-amber-500 uppercase tracking-widest">Property Owner's Field Guide</div>
              <h2 className="text-3xl font-heading font-black uppercase text-white mt-1">Decisions Worth Making Before You Approve Roof Work</h2>
              <p className="text-sm text-slate-400 mt-3 leading-relaxed">Use these points to prepare for an inspection, compare proposals and understand what a responsible scope should address. Final recommendations depend on field conditions and the specific roof assembly.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {data.planningGuide.map((item, idx) => (
                <article key={idx} className="bg-[#0e1422] border border-slate-800 p-6 rounded-xl space-y-2">
                  <h3 className="font-heading font-bold text-lg text-amber-400">{item.title}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {data.inspectionChecklist?.length ? (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <div className="text-xs font-mono-crd text-amber-500 uppercase tracking-widest">Inspection Scope</div>
              <h2 className="text-3xl font-heading font-black uppercase text-white mt-1">What a Useful Roof Assessment Should Document</h2>
              <p className="text-sm text-slate-400 mt-3 leading-relaxed">A useful report connects roof observations to building impact, urgency and next steps. Ask for labeled photographs and clear limits where areas could not be safely accessed.</p>
            </div>
            <ul className="space-y-3">
              {data.inspectionChecklist.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 bg-[#0e1422] border border-slate-800 rounded-lg p-4">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {data.faqs?.length ? (
        <section className="py-16 bg-[#060911] border-y border-slate-800 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <div>
              <div className="text-xs font-mono-crd text-amber-500 uppercase tracking-widest">Straight Answers</div>
              <h2 className="text-3xl font-heading font-black uppercase text-white mt-1">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-4">
              {data.faqs.map((item, idx) => (
                <article key={idx} className="border-b border-slate-800 pb-4">
                  <h3 className="font-heading font-bold text-lg text-white">{item.question}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed mt-2">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Conversion Banner */}
      <section className="pt-16 max-w-4xl mx-auto px-4 text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-heading font-black uppercase text-white">
          Protect Your {data.industryName} Facility
        </h2>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          Contact Commercial Roof Doctors for an objective on-site roof condition assessment.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => onOpenInspection('Inspection')}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-black text-sm uppercase tracking-wider px-8 py-3.5 rounded shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            Request Inspection
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
