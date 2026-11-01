import React from 'react';
import {
  Layers,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  FileText,
  DollarSign,
  CloudRain,
  Wrench,
  Search,
} from 'lucide-react';
import { SeoMeta } from './SeoMeta';
import { Link } from '../router';
import { BUSINESS_INFO } from '../constants';
import { LeadType, RoofSystemType } from '../types';

export interface RoofSystemPageData {
  title: string;
  metaDescription: string;
  canonicalPath: string;
  systemName: string;
  systemType: RoofSystemType;
  heroHeadline: string;
  heroSubtitle: string;
  whatItIs: string;
  whereItIsUsed: string[];
  advantages: string[];
  considerations: string[];
  commonProblems: { title: string; desc: string }[];
  inspectionProtocols: string[];
  repairApproach: string;
  restorationPotential: string;
  replacementTriggers: string[];
  maintenanceGuidelines: string[];
  stormConsiderations: string;
  costFactors: string[];
  faqs: { question: string; answer: string }[];
  relatedServices: { name: string; href: string }[];
  manufacturerLogoUrl?: string;
  manufacturerWebsiteUrl?: string;
  manufacturerBenefits?: string[];
  manufacturerWarrantyDetails?: string;
  manufacturerWarrantyUrl?: string;
  projectImageTitle?: string;
  projectImageUrl?: string;
  projectImageAlt?: string;
  projectImageCaption?: string;
  projectImageSourceUrl?: string;
}

interface RoofSystemPageTemplateProps {
  data: RoofSystemPageData;
  onOpenInspection: (initialLeadType?: LeadType) => void;
  onOpenEmergency: () => void;
}

export const RoofSystemPageTemplate: React.FC<RoofSystemPageTemplateProps> = ({
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
        serviceType={data.systemName}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Roof Systems', url: '/tpo-roofing' },
          { name: data.systemName, url: data.canonicalPath },
        ]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#0e1424] via-[#0a0f1c] to-[#090d16] border-b border-slate-800 pt-14 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono-crd uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Commercial Roof System Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight uppercase text-white leading-tight">
            {data.heroHeadline}
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {data.heroSubtitle}
          </p>
          {data.manufacturerLogoUrl && (
            <div className="pt-5 flex justify-center">
              <a
                href={data.manufacturerWebsiteUrl || 'https://www.certainteed.com/'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit CertainTeed, manufacturer of Flintlastic modified bitumen roofing"
                className="inline-flex items-center justify-center bg-white rounded-lg border border-slate-700 px-6 py-3 shadow-lg"
              >
                <img
                  src={data.manufacturerLogoUrl}
                  alt="CertainTeed manufacturer logo"
                  className="w-44 sm:w-52 h-auto max-h-20 object-contain"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </a>
            </div>
          )}
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onOpenInspection('Inspection')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-black text-sm uppercase tracking-wider px-8 py-3.5 rounded shadow-xl shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Request {data.systemName} Assessment</span>
            </button>
            <Link
              to="/commercial-roof-cost-calculator"
              className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-heading font-bold text-sm uppercase tracking-wider px-6 py-3.5 rounded"
            >
              Cost Calculator
            </Link>
          </div>
        </div>
      </section>

      {data.projectImageUrl && (
        <section className="pb-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto overflow-hidden rounded-xl border border-slate-800 bg-[#0e1422]">
            <img src={data.projectImageUrl} alt={data.projectImageAlt || 'Commercial modified-bitumen roof'} className="w-full h-auto max-h-[620px] object-cover" loading="lazy" />
            <div className="px-5 py-4 space-y-2">
              <h2 className="text-lg font-heading font-bold uppercase text-white">{data.projectImageTitle || 'Commercial Roof System Installation'}</h2>
              <p className="text-sm text-slate-300 leading-relaxed">{data.projectImageCaption}</p>
              {data.projectImageSourceUrl && <a href={data.projectImageSourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:underline">Photo reference: Polyglass project gallery</a>}
            </div>
          </div>
        </section>
      )}

      {/* 1. What It Is & Where It's Used */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-6 space-y-4">
            <div className="text-xs font-mono-crd text-amber-500 uppercase tracking-widest">
              System Engineering
            </div>
            <h2 className="text-3xl font-heading font-black uppercase text-white">
              What Is {data.systemName}?
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {data.whatItIs}
            </p>
            {/* Mandatory Anti-Fabrication Service-Life Notice */}
            <div className="p-4 rounded bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-1">
              <span className="font-bold text-amber-400 uppercase font-mono-crd block">
                Realistic Service Life Philosophy:
              </span>
              Commercial Roof Doctors does not promise arbitrary fixed lifespans. Actual service life depends heavily on original installation craftsmanship, regional Ark-La-Tex storm exposure, preventative maintenance adherence, rooftop foot traffic, drainage performance, and thermal cycling.
            </div>
          </div>

          <div className="lg:col-span-6 bg-[#0e1422] border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="font-heading font-bold text-base uppercase text-white border-b border-slate-800 pb-2">
              Where {data.systemName} Is Commonly Deployed
            </h3>
            <div className="space-y-2.5">
              {data.whereItIsUsed.map((use, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{use}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {data.manufacturerBenefits && data.manufacturerBenefits.length > 0 && (
        <section className="py-14 bg-[#0b1220] border-b border-slate-800 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="text-center">
              <div className="text-xs font-mono-crd text-amber-500 uppercase tracking-widest">Manufacturer Product Advantages</div>
              <h2 className="text-3xl font-heading font-black uppercase text-white mt-1">Why Specify CertainTeed Flintlastic?</h2>
              <p className="text-sm text-slate-300 max-w-3xl mx-auto mt-3">Product-specific benefits from CertainTeed’s Flintlastic commercial roofing line. Actual performance depends on the selected membrane and complete approved roof assembly.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.manufacturerBenefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 rounded-lg border border-slate-800 bg-[#0e1422] p-5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-200 leading-relaxed">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {data.manufacturerWarrantyDetails && (
        <section className="py-14 bg-[#060911] border-b border-slate-800 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-5">
            <div className="text-center">
              <div className="text-xs font-mono-crd text-amber-500 uppercase tracking-widest">Manufacturer Warranty Information</div>
              <h2 className="text-3xl font-heading font-black uppercase text-white mt-1">CertainTeed Flintlastic Warranty Options</h2>
            </div>
            <div className="rounded-xl border border-amber-500/30 bg-[#0e1422] p-6 space-y-4">
              <p className="text-sm text-slate-200 leading-relaxed">{data.manufacturerWarrantyDetails}</p>
              <a href={data.manufacturerWarrantyUrl || 'https://www.certainteed.com/commercial-roofing-warranties'} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-amber-400 hover:underline">
                View CertainTeed’s official commercial roofing warranty requirements <ArrowRight className="w-4 h-4" />
              </a>
              <p className="text-xs text-slate-400">CRD will confirm warranty eligibility in the project specification. No warranty term is promised until CertainTeed approves and issues the written project-specific warranty.</p>
            </div>
          </div>
        </section>
      )}
      {/* 2. Advantages vs Considerations */}
      <section className="py-16 bg-[#060911] border-y border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-xs font-mono-crd text-amber-500 uppercase tracking-widest">
              Technical Comparison
            </div>
            <h2 className="text-3xl font-heading font-black uppercase text-white mt-1">
              Engineering Advantages & Practical Considerations
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#0e1422] border border-slate-800 p-6 rounded-xl space-y-3">
              <h3 className="font-heading font-bold text-lg uppercase text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                System Advantages
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {data.advantages.map((adv, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{adv}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#0e1422] border border-slate-800 p-6 rounded-xl space-y-3">
              <h3 className="font-heading font-bold text-lg uppercase text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Engineering Considerations
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {data.considerations.map((con, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Common Problems & Inspection Protocols */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-heading text-lg font-bold uppercase">
              <AlertTriangle className="w-5 h-5" />
              Common {data.systemName} Vulnerabilities
            </div>
            <div className="space-y-3">
              {data.commonProblems.map((prob, i) => (
                <div key={i} className="bg-[#0e1422] border border-slate-800 p-4 rounded-lg space-y-1">
                  <div className="font-heading font-bold text-xs uppercase text-white">{prob.title}</div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">{prob.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-heading text-lg font-bold uppercase">
              <Search className="w-5 h-5" />
              CRD {data.systemName} Inspection Protocols
            </div>
            <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-6 space-y-3">
              <p className="text-xs text-slate-400">
                Our technicians follow systematic procedures to verify membrane integrity:
              </p>
              <div className="space-y-2 text-xs">
                {data.inspectionProtocols.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 bg-slate-900 rounded border border-slate-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5"></span>
                    <span className="text-slate-200">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Repair, Restoration & Replacement Lifecycle */}
      <section className="py-16 bg-[#060911] border-y border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-xs font-mono-crd text-amber-500 uppercase tracking-widest">
              Lifecycle Engineering
            </div>
            <h2 className="text-3xl font-heading font-black uppercase text-white mt-1">
              Repair, Restoration & Replacement Strategy
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0e1422] border border-slate-800 p-6 rounded-xl space-y-3">
              <div className="font-heading font-bold text-base uppercase text-amber-400">
                Repair Approach
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {data.repairApproach}
              </p>
            </div>

            <div className="bg-[#0e1422] border border-slate-800 p-6 rounded-xl space-y-3">
              <div className="font-heading font-bold text-base uppercase text-amber-400">
                Restoration Potential
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {data.restorationPotential}
              </p>
            </div>

            <div className="bg-[#0e1422] border border-slate-800 p-6 rounded-xl space-y-3">
              <div className="font-heading font-bold text-base uppercase text-amber-400">
                Replacement Triggers
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {data.replacementTriggers.map((trig, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5"></span>
                    <span>{trig}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Storm Damage & Cost Factors */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#140e15] border border-red-950 p-6 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-red-400 font-heading text-lg font-bold uppercase">
              <CloudRain className="w-5 h-5" />
              Storm & Hail Damage on {data.systemName}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {data.stormConsiderations}
            </p>
            <div className="pt-2">
              <Link to="/storm-damage" className="text-xs text-red-400 hover:underline font-bold">
                Learn how CRD handles Ark-La-Tex storm claims →
              </Link>
            </div>
          </div>

          <div className="bg-[#0e1422] border border-slate-800 p-6 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-heading text-lg font-bold uppercase">
              <DollarSign className="w-5 h-5" />
              Commercial Project Cost Factors
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {data.costFactors.map((cf, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{cf}</span>
                </li>
              ))}
            </ul>
            <div className="pt-2">
              <Link to="/commercial-roof-cost-calculator" className="text-xs text-amber-400 hover:underline font-bold">
                Use our interactive Cost Calculator →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQs */}
      {data.faqs.length > 0 && (
        <section className="py-16 bg-[#060911] border-y border-slate-800 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl sm:text-3xl font-heading font-black uppercase text-white text-center">
              Frequently Asked Questions About {data.systemName}
            </h2>
            <div className="space-y-3">
              {data.faqs.map((faq, idx) => (
                <div key={idx} className="bg-[#0e1422] border border-slate-800 p-5 rounded-xl space-y-2">
                  <div className="font-heading font-bold text-sm uppercase text-white flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{faq.question}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pl-6">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Conversion Banner */}
      <section className="pt-16 max-w-4xl mx-auto px-4 text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-heading font-black uppercase text-white">
          Inspect Your {data.systemName} Commercial Roof
        </h2>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          Schedule an on-roof evaluation with Commercial Roof Doctors to determine true remaining service life and repair options.
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
