import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Award,
  Users,
  HardHat,
  FileSpreadsheet,
  ExternalLink,
  Phone,
  ArrowRight,
} from 'lucide-react';
import { SeoMeta } from '../components/SeoMeta';
import { BUSINESS_INFO } from '../constants';
import { LeadType } from '../types';

interface AboutPageProps {
  onOpenInspection: (initialLeadType?: LeadType) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onOpenInspection }) => {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans-crd pb-24">
      <SeoMeta
        title="About Commercial Roof Doctors | 22+ Years Roofing Authority"
        description="Learn about Commercial Roof Doctors: 22+ years commercial roofing authority, HAAG engineering standards, CertainTeed ShingleMaster credentials, and Ark-La-Tex disaster response."
        canonicalPath="/about"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'About', url: '/about' },
        ]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#0e1424] via-[#0a0f1c] to-[#090d16] border-b border-slate-800 pt-14 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono-crd uppercase tracking-wider">
            <span>22+ Years Commercial Field Authority</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight uppercase text-white leading-tight">
            Built On Forensic Diagnosis.{' '}
            <span className="text-amber-500">Not Contractor Sales Talk.</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Commercial Roof Doctors was founded on a singular engineering philosophy: treat commercial roofs as critical capital assets requiring objective diagnosis, scientific testing, and long-term asset management.
          </p>
        </div>
      </section>

      {/* Factual Pillars */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0e1422] border border-slate-800 p-6 rounded-xl space-y-3">
            <div className="text-3xl font-heading font-black text-amber-400">22+ Years</div>
            <h3 className="font-heading font-bold text-lg uppercase text-white">
              Commercial & Large-Loss Experience
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Over two decades navigating complex flat, low-slope, and architectural metal roofing projects across institutional, industrial, and multifamily sectors.
            </p>
          </div>

          <div className="bg-[#0e1422] border border-slate-800 p-6 rounded-xl space-y-3">
            <div className="text-3xl font-heading font-black text-amber-400">75-Mile</div>
            <h3 className="font-heading font-bold text-lg uppercase text-white">
              Regional Ark-La-Tex Service Footprint
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Centrally dispatched from Texarkana to serve Texas, Arkansas, Louisiana, and Oklahoma commercial facilities with dedicated field trucks.
            </p>
          </div>

          <div className="bg-[#0e1422] border border-slate-800 p-6 rounded-xl space-y-3">
            <div className="text-3xl font-heading font-black text-amber-400">Zero Hype</div>
            <h3 className="font-heading font-bold text-lg uppercase text-white">
              Transparent Engineering Standards
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We never push full roof tear-offs when restorative coatings or targeted repairs provide sound, code-compliant waterproofing performance.
            </p>
          </div>
        </div>
      </section>

      {/* Verified Certifications & Technologies */}
      <section className="py-16 bg-[#060911] border-y border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="max-w-3xl">
            <div className="text-xs font-mono-crd text-amber-500 uppercase tracking-widest">
              Industry Standard Verification
            </div>
            <h2 className="text-3xl font-heading font-black uppercase text-white mt-1">
              Verified Technical Credentials & Field Platforms
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BUSINESS_INFO.verifiedTechnologies.map((tech) => (
              <div key={tech.name} className="bg-[#0e1422] border border-slate-800 p-5 rounded-xl space-y-2">
                <div className="font-heading font-bold text-base text-amber-400 uppercase">{tech.name}</div>
                <p className="text-xs text-slate-300 leading-relaxed">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Transparency & Review Policy */}
      <section className="py-16 max-w-4xl mx-auto px-4 text-center space-y-6">
        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h3 className="font-heading font-bold text-xl uppercase text-white">
            Uncompromising Client Transparency
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Commercial Roof Doctors does not host simulated reviews or fabricated customer ratings on this website. Our reputation is built on real relationships with commercial property managers and facilities directors. Verified reviews can be examined directly on Google.
          </p>
          <div className="pt-2">
            <a
              href="https://www.google.com/search?q=Commercial+Roof+Doctors+Texarkana"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700"
            >
              <span>View Google Business Profile</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>

        <div className="pt-6">
          <button
            onClick={() => onOpenInspection('Inspection')}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-black text-sm uppercase tracking-wider px-8 py-3.5 rounded shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            Schedule a Diagnostic Assessment
          </button>
        </div>
      </section>
    </div>
  );
};
