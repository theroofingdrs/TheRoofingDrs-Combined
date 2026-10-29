import React, { useState } from 'react';
import { SeoHead } from '../../common/SeoHead.tsx';
import {
  Wrench,
  Layers,
  CloudLightning,
  FileCheck2,
  AlertTriangle,
  Search,
  ArrowRight,
  ShieldCheck,
  CalendarCheck,
  PhoneCall,
  Wind,
  TreePine,
  CheckCircle2,
  Clock,
  HelpCircle,
} from 'lucide-react';

interface ServicesPageProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenIntake: (type?: 'DIAGNOSTIC' | 'STORM' | 'EMERGENCY' | 'REPLACEMENT') => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({
  currentPath,
  onNavigate,
  onOpenIntake,
}) => {
  const [activeSituation, setActiveSituation] = useState<string | null>(null);

  const pathways = [
    {
      id: 'repair',
      title: 'Precision Roof Repair',
      desc: 'Surgical leak diagnostics, pipe boot collar replacements, chimney flashing, and missing tab repairs without forced replacement.',
      path: '/roofing/roof-repair',
      badge: 'Targeted Restoration',
      icon: Wrench,
      highlight: 'Saves 70-90% over replacement when decking and surrounding shingles remain sound.',
    },
    {
      id: 'replacement',
      title: 'Complete Roof Replacement',
      desc: 'Engineered reroofing down to bare sheathing with Owens Corning or CertainTeed architectural shingles, synthetic barrier, and 130 mph warranty.',
      path: '/roofing/roof-replacement',
      badge: 'Lifetime Transformation',
      icon: Layers,
      highlight: 'ROOFR satellite measurements, full deck inspection, and magnetic site cleanup.',
    },
    {
      id: 'storm',
      title: 'Storm & Hail Damage Restoration',
      desc: 'Forensic evaluation of kinetic hail bruising, wind-lifted tabs, and fallen branch punctures with standardized 10x10 chalk test squares.',
      path: '/storm-damage',
      badge: 'Severe Weather Response',
      icon: CloudLightning,
      highlight: 'Objective evidence documentation satisfying insurance carrier requirements.',
    },
    {
      id: 'claims',
      title: 'Insurance Claim Guidance',
      desc: 'We physically meet your insurance adjuster on the roof to review test squares and verify complete building code compliance scopes.',
      path: '/insurance-claims',
      badge: 'Adjuster Collaboration',
      icon: FileCheck2,
      highlight: 'Texas HB 2102 compliant. We ensure overlooked slopes and drip edges are counted.',
    },
    {
      id: 'inspection',
      title: 'Free 21-Point Roof Health Inspection',
      desc: 'A comprehensive, zero-obligation physical diagnostic walk covering shingle adhesion, flashing seals, attic moisture, and pipe boots.',
      path: '/roofing/roof-inspection',
      badge: 'Preventive Diagnostic',
      icon: Search,
      highlight: 'Get an objective health report with zero high-pressure sales tactics.',
    },
    {
      id: 'emergency',
      title: 'Emergency Tarping & Rapid Dispatch',
      desc: 'Rapid sandbag-secured tarping to stop compounding interior water damage after severe thunderstorms, tornadoes, or tree strikes.',
      path: '/roofing/emergency-roof-repair',
      badge: '24/7 Immediate Response',
      icon: AlertTriangle,
      highlight: 'Protects furniture and meets insurance policy duty to mitigate loss.',
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 pb-20">
      <SeoHead
        title="Residential Roofing Services Directory | The Roof Doctors"
        description="Explore our specialized residential roofing services across Northeast Texas: leak repairs, complete replacements, storm damage diagnostics, and insurance claim support."
        canonicalPath={currentPath}
      />

      {/* Hero Header */}
      <section className="bg-slate-900 text-white py-14 px-4 sm:px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-red-600/20 text-red-400 border border-red-500/30 uppercase tracking-wide">
            <ShieldCheck className="w-4 h-4 text-red-400" />
            <span>Northeast Texas Residential Roofing Directory</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            Specialized Roofing Solutions &amp; Pathways
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Every roof challenge is distinct. Whether you are dealing with an active pipe collar leak, navigating an insurance claim after a hailstorm, or planning a full architectural replacement, select the dedicated service pathway tailored to your needs.
          </p>
        </div>
      </section>

      {/* Interactive Decision Guide */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight mb-3">
            Which Describes Your Current Situation?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                label: 'Active Ceiling Water Leak',
                rec: 'Schedule an emergency leak diagnosis to isolate pipe boot or flashing failure.',
                target: '/roofing/roof-repair',
              },
              {
                label: 'Recent Hail / Wind Storm',
                rec: 'Request a forensic storm inspection with 10x10 chalk test squares.',
                target: '/storm-damage',
              },
              {
                label: 'Roof Is 18–25 Years Old',
                rec: 'Explore full architectural replacement with lifetime warranty and ventilation.',
                target: '/roofing/roof-replacement',
              },
              {
                label: 'Adjuster Coming to My Home',
                rec: 'Schedule a certified project manager to meet your adjuster on the roof.',
                target: '/insurance-claims',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={() => onNavigate(item.target)}
                className="p-4 rounded-xl border border-slate-200 hover:border-red-500 bg-slate-50 hover:bg-red-50/30 transition-all cursor-pointer space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">{item.label}</div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{item.rec}</p>
                </div>
                <span className="text-[11px] font-bold text-red-600 flex items-center gap-1 pt-2">
                  View Pathway &rarr;
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Service Pathways Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pathways.map((service) => {
            const IconComponent = service.icon;
            return (
              <div
                key={service.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                      {service.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900">{service.title}</h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{service.desc}</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-700 leading-relaxed">
                    <strong>Key Advantage:</strong> {service.highlight}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onNavigate(service.path)}
                    className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Explore Service Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onOpenIntake(service.id === 'replacement' ? 'REPLACEMENT' : service.id === 'storm' ? 'STORM' : 'DIAGNOSTIC')}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Sub-Specialties: Hail, Wind, Trees */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-10 border border-slate-800">
          <div className="max-w-3xl space-y-3 mb-8">
            <span className="text-xs uppercase tracking-wider text-red-400 font-bold">
              Specific Severe Weather Specialties
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              Looking for a Specific Storm Impact Service?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Access in-depth documentation and case records for localized storm mechanisms.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div
              onClick={() => onNavigate('/storm-damage/hail-damage')}
              className="p-4 bg-slate-950 rounded-xl border border-slate-800 hover:border-red-500 transition-all cursor-pointer space-y-2"
            >
              <div className="font-bold text-white text-sm flex items-center gap-2">
                <CloudLightning className="w-4 h-4 text-amber-400" />
                <span>Hail Damage Diagnostics</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Hail impact test squares, sub-surface mat fracture audits, and insurance scope documentation.
              </p>
              <span className="text-red-400 font-bold text-[11px] block pt-1">Learn More &rarr;</span>
            </div>

            <div
              onClick={() => onNavigate('/storm-damage/wind-damage')}
              className="p-4 bg-slate-950 rounded-xl border border-slate-800 hover:border-red-500 transition-all cursor-pointer space-y-2"
            >
              <div className="font-bold text-white text-sm flex items-center gap-2">
                <Wind className="w-4 h-4 text-blue-400" />
                <span>High-Wind Shingle Repairs</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Thermal seal break tests, creased tab matching, and 130 mph high-wind perimeter securement.
              </p>
              <span className="text-red-400 font-bold text-[11px] block pt-1">Learn More &rarr;</span>
            </div>

            <div
              onClick={() => onNavigate('/storm-damage/fallen-tree-damage')}
              className="p-4 bg-slate-950 rounded-xl border border-slate-800 hover:border-red-500 transition-all cursor-pointer space-y-2"
            >
              <div className="font-bold text-white text-sm flex items-center gap-2">
                <TreePine className="w-4 h-4 text-emerald-400" />
                <span>Fallen Tree &amp; Limb Impact</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Emergency tree removal coordination, rafter sistering, and plywood deck structural replacement.
              </p>
              <span className="text-red-400 font-bold text-[11px] block pt-1">Learn More &rarr;</span>
            </div>
          </div>
        </div>
      </section>

      {/* Primary CTA Band */}
      <section className="bg-slate-900 text-white py-14 px-4 sm:px-6 mt-12 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="text-xs uppercase tracking-wider text-red-400 font-bold">
            Guaranteed Objective Diagnostics
          </span>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
            Not Sure Which Service You Need?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Schedule a $0 comprehensive 21-point roof health inspection. Our certified inspector will inspect your roof and provide an honest, written assessment.
          </p>
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onOpenIntake('DIAGNOSTIC')}
              className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-colors cursor-pointer"
            >
              REQUEST FREE 21-POINT DIAGNOSIS
            </button>
            <a
              href="tel:9032315940"
              className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>CALL 903-231-5940</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
