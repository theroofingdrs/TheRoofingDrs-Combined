import React from 'react';
import {
  CloudLightning,
  Wind,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
  Phone,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { SeoMeta } from '../components/SeoMeta';
import { Link } from '../router';
import { BUSINESS_INFO } from '../constants';
import { LeadType } from '../types';

interface StormDamagePageProps {
  onOpenInspection: (initialLeadType?: LeadType) => void;
  onOpenEmergency: () => void;
}

export const StormDamagePage: React.FC<StormDamagePageProps> = ({
  onOpenInspection,
  onOpenEmergency,
}) => {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans-crd pb-24">
      <SeoMeta
        title="Commercial Storm Damage Response | Ark-La-Tex Roof Doctors"
        description="When the storm hits, CRD responds. Storm damage doesn't wait. Forensic commercial hail and wind damage inspection, emergency dry-in, and insurance claim coordination."
        canonicalPath="/storm-damage"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Storm Response', url: '/storm-damage' },
        ]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#190d12] via-[#10080d] to-[#090d16] border-b border-red-950 pt-14 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono-crd uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            Commercial Storm & Disaster Field Response
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight uppercase text-white leading-tight">
            When the Storm Hits, <span className="text-red-500">CRD Responds.</span>
          </h1>
          <p className="text-base sm:text-lg text-red-200 max-w-2xl mx-auto leading-relaxed">
            Storm damage doesn't wait. Neither should your inspection. Rapid emergency stabilization, forensic hail and wind mapping, and carrier claim coordination across the Ark-La-Tex.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <button
              onClick={onOpenEmergency}
              className="bg-red-600 hover:bg-red-500 text-white font-heading font-black text-sm uppercase tracking-wider px-8 py-3.5 rounded shadow-xl shadow-red-600/30 flex items-center gap-2 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-white" />
              <span>Report Active Roof Emergency</span>
            </button>
            <button
              onClick={() => onOpenInspection('Storm Damage')}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-heading font-bold text-sm uppercase tracking-wider px-6 py-3.5 rounded cursor-pointer"
            >
              Schedule Storm Inspection
            </button>
          </div>
        </div>
      </section>

      {/* Why Commercial Storm Damage is Often Hidden */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="text-xs font-mono-crd text-red-400 uppercase tracking-widest">
              Concealed Failure Mechanisms
            </div>
            <h2 className="text-3xl font-heading font-black uppercase text-white">
              Why Commercial Storm Damage Is Often Invisible from the Ground
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Unlike residential shingle roofs where missing shingles or granule loss are obvious, commercial flat and low-slope roofing systems experience subtle, insidious trauma during severe weather:
            </p>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">•</span>
                <span><strong>Micro-fractured single-ply membranes:</strong> Hail impacts crack the underlying reinforcement scrim of aged TPO or PVC without immediately leaking.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">•</span>
                <span><strong>Substrate insulation bruising:</strong> Polyisocyanurate insulation boards fracture under hail stone kinetic energy, creating moisture sinks.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">•</span>
                <span><strong>Perimeter uplift fatigue:</strong> Straight-line winds tear edge metal cleats and peel perimeter base attachments.</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6 bg-[#120d18] border border-red-950/80 rounded-2xl p-6 sm:p-8 space-y-4">
            <h3 className="font-heading font-bold text-xl uppercase text-white border-b border-red-950 pb-3">
              The CRD Forensic Storm Inspection Protocol
            </h3>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded bg-slate-900/60 border border-slate-800">
                <strong className="text-amber-400 block mb-0.5">100 Sq. Ft. Test Squares:</strong> We physically mark test squares, tactilely check for fractured reinforcement scrim, and photograph every distinct impact.
              </div>
              <div className="p-3 rounded bg-slate-900/60 border border-slate-800">
                <strong className="text-amber-400 block mb-0.5">Mechanical Rooftop Unit (RTU) Audits:</strong> Condenser coil comb checks, exhaust fan housing dents, and rooftop gas line alignment verification.
              </div>
              <div className="p-3 rounded bg-slate-900/60 border border-slate-800">
                <strong className="text-amber-400 block mb-0.5">High-Resolution Drone Imagery:</strong> Full-facility orthogonal grid mapping documenting uplift patterns and structural perimeter distortion.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hail vs Wind Storm Pathways */}
      <section className="py-16 bg-[#060911] border-y border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-xs font-mono-crd text-red-400 uppercase tracking-widest">
              Damage Profiles
            </div>
            <h2 className="text-3xl font-heading font-black uppercase text-white">
              Specialized Storm Pathways
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0e1422] border border-slate-800 p-6 rounded-xl space-y-3">
              <CloudLightning className="w-8 h-8 text-amber-400" />
              <h3 className="font-heading font-bold text-xl uppercase text-white">Hail Damage Analysis</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hail impact sizing, spatter mark directional analysis, membrane puncture logging, and insulation core sampling.
              </p>
              <Link to="/hail-damage" className="inline-flex items-center gap-1 text-xs text-amber-400 hover:underline font-bold pt-2">
                Hail Damage Details →
              </Link>
            </div>

            <div className="bg-[#0e1422] border border-slate-800 p-6 rounded-xl space-y-3">
              <Wind className="w-8 h-8 text-amber-400" />
              <h3 className="font-heading font-bold text-xl uppercase text-white">Wind Uplift & Tear-Off</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Corner vortex pressure failures, coping metal peel-backs, fastener pull-outs, and air infiltration membrane ballooning.
              </p>
              <Link to="/wind-damage" className="inline-flex items-center gap-1 text-xs text-amber-400 hover:underline font-bold pt-2">
                Wind Damage Details →
              </Link>
            </div>

            <div className="bg-[#0e1422] border border-slate-800 p-6 rounded-xl space-y-3">
              <FileSpreadsheet className="w-8 h-8 text-amber-400" />
              <h3 className="font-heading font-bold text-xl uppercase text-white">Insurance Claims</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Xactimate pricing alignment, meeting independent adjusters on the roof deck, and drafting scope supplements for code upgrades.
              </p>
              <Link to="/insurance-claims" className="inline-flex items-center gap-1 text-xs text-amber-400 hover:underline font-bold pt-2">
                Insurance Coordination →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Conversion Banner */}
      <section className="pt-16 max-w-4xl mx-auto px-4 text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-heading font-black uppercase text-white">
          Ark-La-Tex Severe Weather Response
        </h2>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          If your commercial facility was in the path of recent hail or straight-line wind storms, request a documented forensic inspection today.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => onOpenInspection('Storm Damage')}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-black text-sm uppercase tracking-wider px-8 py-3.5 rounded shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            Request Storm Inspection
          </button>
          <button
            onClick={onOpenEmergency}
            className="bg-red-600 hover:bg-red-500 text-white font-heading font-black text-sm uppercase tracking-wider px-8 py-3.5 rounded shadow-lg shadow-red-600/30 cursor-pointer"
          >
            Report Emergency Leak
          </button>
        </div>
      </section>
    </div>
  );
};
