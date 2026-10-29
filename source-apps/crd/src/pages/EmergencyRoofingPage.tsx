import React from 'react';
import {
  AlertTriangle,
  Phone,
  CheckCircle2,
  ShieldAlert,
  Clock,
  MapPin,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { SeoMeta } from '../components/SeoMeta';
import { BUSINESS_INFO } from '../constants';

interface EmergencyRoofingPageProps {
  onOpenEmergency: () => void;
}

export const EmergencyRoofingPage: React.FC<EmergencyRoofingPageProps> = ({ onOpenEmergency }) => {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans-crd pb-24">
      <SeoMeta
        title="Commercial Emergency Roofing & Disaster Response | Ark-La-Tex"
        description="24/7 commercial roof emergency response, active leak mitigation, structural dry-in, and storm stabilization across the Ark-La-Tex. Call (903) 231-5940."
        canonicalPath="/emergency-roofing"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Emergency Roofing', url: '/emergency-roofing' },
        ]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#200b12] via-[#14080e] to-[#090d16] border-b border-red-900/60 pt-14 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-red-600/20 border border-red-500/40 text-red-300 text-xs font-mono-crd uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            Direct Field Dispatch Hotline
          </div>
          <h1 className="text-4xl sm:text-6xl font-heading font-black tracking-tight uppercase text-white leading-tight">
            Commercial Roof Emergency?{' '}
            <span className="text-red-500">Call (903) 231-5940</span>
          </h1>
          <p className="text-base sm:text-lg text-red-200/90 max-w-2xl mx-auto leading-relaxed font-normal">
            When active water infiltration threatens manufacturing machinery, retail inventory, sensitive medical equipment, or tenant safety, Commercial Roof Doctors deploys immediate emergency stabilization.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={`tel:${BUSINESS_INFO.phoneRaw}`}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white font-heading font-black text-lg uppercase tracking-wider px-8 py-4 rounded shadow-2xl shadow-red-600/40 flex items-center justify-center gap-3 cursor-pointer"
            >
              <Phone className="w-5 h-5 text-white animate-bounce" />
              <span>Call Dispatch: {BUSINESS_INFO.phone}</span>
            </a>
            <button
              onClick={onOpenEmergency}
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-heading font-bold text-base uppercase tracking-wider px-6 py-4 rounded cursor-pointer flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span>Submit Emergency Form</span>
            </button>
          </div>
        </div>
      </section>

      {/* Triage Protocols */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="max-w-3xl">
          <div className="text-xs font-mono-crd text-red-400 uppercase tracking-widest">
            Emergency Execution Standards
          </div>
          <h2 className="text-3xl font-heading font-black uppercase text-white mt-1">
            What CRD Emergency Crews Deliver On-Site
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Our priority in an emergency is stopping water progression immediately while strictly adhering to commercial rooftop safety standards:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-[#120d18] border border-red-950 p-6 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-red-400 font-heading font-bold text-lg uppercase">
              <Clock className="w-5 h-5" />
              Rapid Field Triage
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Fast arrival across our Texarkana and 75-mile Ark-La-Tex operating territory with emergency dry-in trucks equipped with commercial pumps, cold-applied primers, and heat-weld equipment.
            </p>
          </div>

          <div className="bg-[#120d18] border border-red-950 p-6 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-red-400 font-heading font-bold text-lg uppercase">
              <ShieldAlert className="w-5 h-5" />
              Temporary Dry-In & Patches
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Industrial mastic, fluid elastomeric flashings, membrane sandwich patches, and sandbag hold-downs designed to survive until permanent repairs or replacement can be scheduled.
            </p>
          </div>

          <div className="bg-[#120d18] border border-red-950 p-6 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-red-400 font-heading font-bold text-lg uppercase">
              <FileText className="w-5 h-5" />
              Insurance Documentation
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Complete photographic logging of original storm or equipment failure damage before emergency measures are installed, protecting your insurance claim rights.
            </p>
          </div>
        </div>
      </section>

      {/* Emergency Phone Bar */}
      <section className="bg-[#0e1422] border-y border-slate-800 py-10 px-4 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <h3 className="font-heading font-bold text-2xl uppercase text-white">
            Need Immediate Commercial Roofer on Site?
          </h3>
          <p className="text-xs text-slate-400">
            Directly connect with our emergency field supervisor.
          </p>
          <div className="pt-2">
            <a
              href={`tel:${BUSINESS_INFO.phoneRaw}`}
              className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white font-heading font-black text-xl uppercase px-8 py-3 rounded-lg shadow-xl shadow-red-600/30"
            >
              <Phone className="w-6 h-6" />
              <span>{BUSINESS_INFO.phone}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
