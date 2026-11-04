import React from 'react';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Phone,
  Layers,
  Search,
  Wrench,
  RotateCcw,
} from 'lucide-react';
import { SeoMeta } from './SeoMeta';
import { Link } from '../router';
import { BUSINESS_INFO } from '../constants';
import { LeadType } from '../types';

export interface ServicePageData {
  title: string;
  metaDescription: string;
  canonicalPath: string;
  eyebrow: string;
  heroHeadline: string;
  heroSubtitle: string;
  heroImage?: string;
  problemStatement: {
    heading: string;
    description: string;
    points: string[];
  };
  whatCrdDoes: {
    heading: string;
    description: string;
    deliverables: string[];
  };
  whatCrdInspects: string[];
  commonFailurePoints: { title: string; desc: string }[];
  whenRepairMakesSense: string[];
  whenRestorationMakesSense: string[];
  whenReplacementAppropriate: string[];
  relevantRoofSystems: { name: string; href: string }[];
  relevantIndustries: { name: string; href: string }[];
  faqs: { question: string; answer: string }[];
  relatedServices: { name: string; href: string }[];
  defaultLeadType?: LeadType;
}

interface ServicePageTemplateProps {
  data: ServicePageData;
  onOpenInspection: (initialLeadType?: LeadType) => void;
  onOpenEmergency: () => void;
}

export const ServicePageTemplate: React.FC<ServicePageTemplateProps> = ({
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
        serviceType={data.heroHeadline}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Services', url: '/commercial-roofing' },
          { name: data.heroHeadline, url: data.canonicalPath },
        ]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0e1424] via-[#0a0f1c] to-[#090d16] border-b border-slate-800 pt-14 pb-16 px-4 sm:px-6 lg:px-8">
        <img src={data.heroImage || '/assets/images/library/commercial-roofing-feature.jpg'} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0e1424]/65 via-[#0a0f1c]/75 to-[#090d16]/95" />
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono-crd uppercase tracking-wider">
            <span>{data.eyebrow}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight uppercase text-white leading-tight">
            {data.heroHeadline}
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {data.heroSubtitle}
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onOpenInspection(data.defaultLeadType || 'Inspection')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-black text-sm uppercase tracking-wider px-8 py-3.5 rounded shadow-xl shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Request Inspection</span>
            </button>
            <button
              onClick={onOpenEmergency}
              className="bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 font-heading font-bold text-sm uppercase tracking-wider px-6 py-3.5 rounded flex items-center gap-2 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>Emergency Response</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. The Problem */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-mono-crd text-amber-500 uppercase tracking-widest">
              Commercial Diagnosis
            </div>
            <h2 className="text-3xl font-heading font-black uppercase text-white">
              {data.problemStatement.heading}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {data.problemStatement.description}
            </p>
          </div>
          <div className="lg:col-span-7 bg-[#0e1422] border border-slate-800 rounded-xl p-6 space-y-3">
            <h3 className="font-heading font-bold text-base uppercase text-amber-400 border-b border-slate-800 pb-2">
              Critical Risk Factors & Warning Signs
            </h3>
            <div className="space-y-2.5">
              {data.problemStatement.points.map((pt, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5"></span>
                  <span className="leading-relaxed">{pt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. What CRD Does */}
      <section className="py-16 bg-[#060911] border-y border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="max-w-3xl">
            <div className="text-xs font-mono-crd text-amber-500 uppercase tracking-widest">
              Field Execution
            </div>
            <h2 className="text-3xl font-heading font-black uppercase text-white mt-1">
              {data.whatCrdDoes.heading}
            </h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              {data.whatCrdDoes.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.whatCrdDoes.deliverables.map((item, idx) => (
              <div key={idx} className="bg-[#0e1422] border border-slate-800 p-5 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span className="font-heading font-bold text-sm uppercase text-white">Execution Standard {idx + 1}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. What CRD Inspects & Common Failure Points */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* What We Inspect */}
          <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-heading text-lg font-bold uppercase">
              <Search className="w-5 h-5" />
              What CRD Inspects on Your Roof
            </div>
            <p className="text-xs text-slate-400">
              Our forensic evaluations examine every mechanical, chemical, and structural detail:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {data.whatCrdInspects.map((pt, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-slate-900/60 rounded border border-slate-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                  <span className="text-slate-200">{pt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Common Failure Points */}
          <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-heading text-lg font-bold uppercase">
              <AlertTriangle className="w-5 h-5" />
              Common Failure Points
            </div>
            <p className="text-xs text-slate-400">
              Where commercial roofing systems commonly suffer breakdown under regional weather:
            </p>
            <div className="space-y-3">
              {data.commonFailurePoints.map((fail, i) => (
                <div key={i} className="p-3 bg-slate-900/60 rounded border border-slate-800 space-y-1">
                  <div className="font-heading font-bold text-xs uppercase text-white">{fail.title}</div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">{fail.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Decision Framework: When Repair vs Restoration vs Replacement */}
      <section className="py-16 bg-[#060911] border-y border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-xs font-mono-crd text-amber-500 uppercase tracking-widest">
              Objective Decision Framework
            </div>
            <h2 className="text-3xl font-heading font-black uppercase text-white mt-1">
              Repair, Restore, or Replace?
            </h2>
            <p className="text-xs text-slate-400 mt-2">
              We never push pre-determined solutions. We align our recommendations with actual physical condition.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0d1322] border border-slate-800 p-6 rounded-xl space-y-3">
              <div className="font-heading font-black text-lg uppercase text-amber-400 flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                When Repair Makes Sense
              </div>
              <ul className="text-xs text-slate-300 space-y-2">
                {data.whenRepairMakesSense.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#0d1322] border border-slate-800 p-6 rounded-xl space-y-3">
              <div className="font-heading font-black text-lg uppercase text-amber-400 flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                When Restoration Makes Sense
              </div>
              <ul className="text-xs text-slate-300 space-y-2">
                {data.whenRestorationMakesSense.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#0d1322] border border-slate-800 p-6 rounded-xl space-y-3">
              <div className="font-heading font-black text-lg uppercase text-amber-400 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                When Replacement Is Appropriate
              </div>
              <ul className="text-xs text-slate-300 space-y-2">
                {data.whenReplacementAppropriate.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Systems & Industries Cross Links */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <h3 className="font-heading font-bold text-lg uppercase text-white border-b border-slate-800 pb-2">
              Relevant Commercial Roof Systems
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.relevantRoofSystems.map((sys) => (
                <Link
                  key={sys.href}
                  to={sys.href}
                  className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 hover:border-amber-500 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  {sys.name} →
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-heading font-bold text-lg uppercase text-white border-b border-slate-800 pb-2">
              Relevant Commercial Industries
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.relevantIndustries.map((ind) => (
                <Link
                  key={ind.href}
                  to={ind.href}
                  className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 hover:border-amber-500 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  {ind.name} →
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQs */}
      {data.faqs.length > 0 && (
        <section className="py-16 bg-[#060911] border-y border-slate-800 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <div className="text-xs font-mono-crd text-amber-500 uppercase tracking-widest">
                Technical Clarity
              </div>
              <h2 className="text-3xl font-heading font-black uppercase text-white mt-1">
                Frequently Asked Commercial Questions
              </h2>
            </div>

            <div className="space-y-4">
              {data.faqs.map((faq, idx) => (
                <div key={idx} className="bg-[#0e1422] border border-slate-800 rounded-xl p-5 space-y-2">
                  <div className="font-heading font-bold text-base uppercase text-white flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{faq.question}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pl-6">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. Conversion Banner */}
      <section className="pt-16 max-w-4xl mx-auto px-4 text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-heading font-black uppercase text-white">
          Schedule a Technical Field Evaluation
        </h2>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          Contact Commercial Roof Doctors for an objective diagnosis of your facility roof conditions in the Ark-La-Tex.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => onOpenInspection(data.defaultLeadType || 'Inspection')}
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
