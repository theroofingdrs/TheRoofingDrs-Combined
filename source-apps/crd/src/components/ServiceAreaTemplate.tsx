import React from 'react';
import {
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Phone,
  FileText,
  Building,
  CloudLightning,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { SeoMeta } from './SeoMeta';
import { Link } from '../router';
import { BUSINESS_INFO } from '../constants';
import { LeadType } from '../types';

export interface ServiceAreaData {
  title: string;
  metaDescription: string;
  canonicalPath: string;
  regionName: string;
  heroHeadline: string;
  heroSubtitle: string;
  weatherAndStormFactors: string;
  countiesAndCitiesServed: string[];
  keyIndustriesInRegion: string[];
  serviceCapabilities: string[];
}

interface ServiceAreaTemplateProps {
  data: ServiceAreaData;
  onOpenInspection: (initialLeadType?: LeadType) => void;
  onOpenEmergency: () => void;
}

export const ServiceAreaTemplate: React.FC<ServiceAreaTemplateProps> = ({
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
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Service Areas', url: '/service-areas' },
          { name: data.regionName, url: data.canonicalPath },
        ]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#0e1424] via-[#0a0f1c] to-[#090d16] border-b border-slate-800 pt-14 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono-crd uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5" />
            <span>Four-State Commercial Roofing Coverage</span>
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
              <span>Request Regional Inspection</span>
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

      {/* Transparent Service-Area Notice */}
      <section className="bg-[#060911] border-b border-slate-800 py-6 px-4">
        <div className="max-w-4xl mx-auto p-4 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1">
          <span className="font-bold text-amber-400 uppercase font-mono-crd block">
            Service-Area Business Model Disclosure:
          </span>
          Commercial Roof Doctors serves commercial properties across Texas, Arkansas, Louisiana, and Oklahoma. Our Texarkana operations hub at 614 Robison Rd coordinates field logistics and dispatch; project availability and travel are confirmed based on location and scope.
        </div>
      </section>

      {/* Regional Weather & Weathering Profile */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono-crd text-amber-500 uppercase tracking-widest">
              <CloudLightning className="w-4 h-4" />
              Regional Climate & Storm Dynamics
            </div>
            <h2 className="text-3xl font-heading font-black uppercase text-white">
              Weathering Impact in {data.regionName}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {data.weatherAndStormFactors}
            </p>
          </div>

          <div className="lg:col-span-6 bg-[#0e1422] border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="font-heading font-bold text-base uppercase text-white border-b border-slate-800 pb-2">
              Example Markets & Communities
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.countiesAndCitiesServed.map((loc, idx) => (
                <span key={idx} className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-slate-300">
                  {loc}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-16 bg-[#060911] border-y border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="max-w-3xl">
            <div className="text-xs font-mono-crd text-amber-500 uppercase tracking-widest">
              Field Deployments
            </div>
            <h2 className="text-3xl font-heading font-black uppercase text-white mt-1">
              Commercial Capabilities in {data.regionName}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.serviceCapabilities.map((cap, idx) => (
              <div key={idx} className="p-4 bg-[#0e1422] border border-slate-800 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-200 leading-relaxed">{cap}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conversion Banner */}
      <section className="pt-16 max-w-4xl mx-auto px-4 text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-heading font-black uppercase text-white">
          Commercial Roofing in {data.regionName}
        </h2>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          Contact Commercial Roof Doctors for rapid field assessment, storm damage forensics, or multi-property capital budgeting.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => onOpenInspection('Inspection')}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-black text-sm uppercase tracking-wider px-8 py-3.5 rounded shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            Request Regional Inspection
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
