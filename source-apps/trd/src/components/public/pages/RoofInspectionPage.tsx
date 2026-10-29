import React from 'react';
import { SeoHead } from '../../common/SeoHead.tsx';
import {
  Search,
  CheckCircle2,
  CalendarCheck,
  PhoneCall,
  ShieldCheck,
  Camera,
  FileCheck2,
  AlertCircle,
  Eye,
  Layers,
  ThermometerSun,
  Droplets,
  ArrowRight,
  ClipboardList,
} from 'lucide-react';

interface RoofInspectionPageProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenIntake: (type?: 'DIAGNOSTIC' | 'STORM' | 'EMERGENCY' | 'REPLACEMENT') => void;
}

const INSPECTION_POINTS = [
  { num: '01', title: 'Shingle Adhesion & Thermal Seal Audit', desc: 'Hand-checking thermal bonding strips for wind lift and micro-creasing.' },
  { num: '02', title: 'Granule Retention & UV Bitumen Exposure', desc: 'Evaluating protective ceramic granule loss across south-facing slopes.' },
  { num: '03', title: '10x10 Chalk Test Square Hail Analysis', desc: 'Counting sub-surface fiberglass mat fractures per standardized square.' },
  { num: '04', title: 'Plumbing Vent Pipe Boots & Collars', desc: 'Inspecting neoprene rubber collars for dry-rot, splits, and seal failure.' },
  { num: '05', title: 'Chimney Step & Counter-Flashing Reglets', desc: 'Checking mortar joint integrity and rust on masonry intersections.' },
  { num: '06', title: 'Valley Metal & Ice Barrier Waterflow', desc: 'Auditing high-volume drainage channels for debris clogs and puncture tears.' },
  { num: '07', title: 'Attic Moisture & Rafter Stain Tracing', desc: 'Crawling the attic space to trace hidden water tracks and rotted trusses.' },
  { num: '08', title: 'Ridge & Hip Cap Shingle Securement', desc: 'Verifying high-profile cap fasteners against 130 mph straight-line gusts.' },
  { num: '09', title: 'Attic Ventilation Airflow Calculation', desc: 'Measuring continuous ridge exhaust vs. soffit intake net free area (NFA).' },
  { num: '10', title: 'Roof Decking Sheathing Deflection', desc: 'Walking roof planes to identify spongy, warped, or rotted plywood sheets.' },
  { num: '11', title: 'Drip Edge Metal Eave & Rake Protection', desc: 'Confirming code-mandated 26-gauge drip edge directs rain straight into gutters.' },
  { num: '12', title: 'Gutter Pitch, Sag & Downspout Flow', desc: 'Ensuring stormwater discharges properly away from home foundation walls.' },
  { num: '13', title: 'Fascia & Soffit Wood Dry Rot', desc: 'Inspecting wood framing behind gutters for water staining and pest damage.' },
  { num: '14', title: 'Skylight Lens, Frame & Step Flashing', desc: 'Auditing skylight perimeter seals and condensate weep holes.' },
  { num: '15', title: 'Roof-to-Wall Interlocking Kickout Flashing', desc: 'Verifying diverter kickout flashings prevent water entering exterior walls.' },
  { num: '16', title: 'Exhaust Box Vents & Turtle Flashing', desc: 'Checking metal caps for hail impact dents and bird/rodent screen tears.' },
  { num: '17', title: 'Exposed Fastener & Nail Pop Seal', desc: 'Locating backing-out nails and sealing with UV-resistant polyurethane.' },
  { num: '18', title: 'Tree Canopy Overhang & Scratch Hazard', desc: 'Identifying branches within 6 feet that abrade shingles during winds.' },
  { num: '19', title: 'Moss & Algae Microbial Colonization', desc: 'Evaluating moisture retention beneath gloeocapsa magma colonies.' },
  { num: '20', title: 'Soft Metal Collateral Damage Audit', desc: 'Documenting AC condenser fins, gutters, and siding for hail confirmation.' },
  { num: '21', title: 'Digital Forensic Photo Summary', desc: 'Providing date-stamped high-resolution photo documentation with clear findings.' },
];

export const RoofInspectionPage: React.FC<RoofInspectionPageProps> = ({
  currentPath,
  onNavigate,
  onOpenIntake,
}) => {
  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 pb-20">
      <SeoHead
        title="Free 21-Point Diagnostic Roof Inspection | The Roof Doctors"
        description="Comprehensive 21-point physical roof health inspection across Northeast Texas. Shingle adhesion, attic moisture, hail test squares, and digital photo reports. Zero sales pressure."
        canonicalPath={currentPath}
      />

      {/* Hero Header */}
      <section className="bg-slate-950 text-white py-16 px-4 sm:px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-red-600/20 text-red-400 border border-red-500/30 uppercase tracking-wide">
              <Search className="w-4 h-4 text-red-400" />
              <span>Medical-Grade Building Science</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
              The 21-Point Forensic <br />
              <span className="text-red-500">Roof Health Diagnosis.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              We don't do "quick drive-by glances." A certified diagnostic inspector physically climbs your roof, walks every slope, crawls your attic, and documents 21 specific building science vulnerability points with high-resolution photography.
            </p>

            <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-300 pt-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>$0 Homeowner Cost</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Attic &amp; Decking Moisture Testing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero High-Pressure Sales Quotas</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => onOpenIntake('DIAGNOSTIC')}
                className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 text-center"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>BOOK 21-POINT INSPECTION ($0 FEE)</span>
              </button>
              <a
                href="tel:9032315940"
                className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 text-center"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>CALL 903-231-5940</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="text-[11px] uppercase font-bold text-red-400">
                Transparent Homeowner Record
              </div>
              <h3 className="text-lg font-bold text-white">What You Receive After the Walk</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Within 2 hours of completing our inspection, you receive a full digital report on your phone or computer containing:
              </p>
              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  &bull; <strong>High-Resolution Photo Log:</strong> Close-ups of flashings, pipe boots, test squares, and attic decking.
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  &bull; <strong>Objective Condition Rating:</strong> Clear classification as Good, Minor Repair Required, or Storm Restorable.
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  &bull; <strong>No-Pressure Recommendations:</strong> Itemized scope with fixed upfront pricing if repairs are needed.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Full 21 Points Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-wider text-red-600 font-bold">
            Complete Physical Checklist
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight mt-1">
            The 21 Physical Inspection Checkpoints
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Our certified inspectors verify every critical component of your roofing assembly against manufacturer tolerances and local building codes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {INSPECTION_POINTS.map((pt) => (
            <div
              key={pt.num}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-start gap-4 space-y-1"
            >
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                {pt.num}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-xs uppercase">{pt.title}</h3>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{pt.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Primary CTA Band */}
      <section className="bg-slate-900 text-white py-14 px-4 sm:px-6 mt-12 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="text-xs uppercase tracking-wider text-red-400 font-bold">
            100% Free • No Obligation
          </span>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
            Schedule Your Free 21-Point Roof Inspection
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Get an objective diagnosis before water damages your home or before meeting with your insurance company. Serving Texarkana, Longview, Tyler, Paris, and all Northeast Texas.
          </p>
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onOpenIntake('DIAGNOSTIC')}
              className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-colors cursor-pointer"
            >
              SCHEDULE FREE 21-POINT INSPECTION
            </button>
            <a
              href="tel:9032315940"
              className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>DIRECT DISPATCH: 903-231-5940</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
