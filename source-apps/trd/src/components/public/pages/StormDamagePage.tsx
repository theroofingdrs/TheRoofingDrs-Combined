import React, { useState } from 'react';
import { SeoHead } from '../../common/SeoHead.tsx';
import {
  CloudLightning,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  PhoneCall,
  CalendarCheck,
  ArrowRight,
  Eye,
  Camera,
  FileCheck2,
  Clock,
  HelpCircle,
  ChevronRight,
  Wind,
  Layers,
  TreePine,
  ShieldCheck,
} from 'lucide-react';

interface StormDamagePageProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenIntake: (type?: 'DIAGNOSTIC' | 'STORM' | 'EMERGENCY' | 'REPLACEMENT') => void;
}

export const StormDamagePage: React.FC<StormDamagePageProps> = ({
  currentPath,
  onNavigate,
  onOpenIntake,
}) => {
  const [activeTab, setActiveTab] = useState<'hail' | 'wind' | 'trees' | 'hidden'>('hail');

  // Specific sub-topic override if accessed via direct deep link
  const isHailPath = currentPath.includes('hail');
  const isWindPath = currentPath.includes('wind');
  const isTreePath = currentPath.includes('fallen-tree');
  const isPostStormPath = currentPath.includes('what-to-do');

  const pageTitle = isHailPath
    ? 'Hail Damage Roof Inspection & Forensic Diagnostics | The Roof Doctors'
    : isWindPath
    ? 'Wind Damage & Creased Shingle Inspection | The Roof Doctors'
    : isTreePath
    ? 'Fallen Tree & Structural Roof Impact Response | The Roof Doctors'
    : isPostStormPath
    ? 'What to Do Immediately After a Severe Storm | The Roof Doctors'
    : 'Storm Damage Roof Inspection & Forensic Diagnostics | The Roof Doctors';

  const pageDesc =
    'Specialized forensic storm damage inspections for hail bruising, wind-lifted shingles, and tree impacts across Northeast Texas. Objective photo documentation and adjuster scope support.';

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 pb-20">
      <SeoHead
        title={pageTitle}
        description={pageDesc}
        canonicalPath={currentPath}
        schemaJson={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          serviceType: 'Roof Storm Damage Inspection & Restoration',
          provider: {
            '@type': 'RoofingContractor',
            name: 'The Roof Doctors',
            telephone: '+1-903-231-5940',
            address: {
              '@type': 'PostalAddress',
              streetAddress: '1420 Richmond Rd',
              addressLocality: 'Texarkana',
              addressRegion: 'TX',
              postalCode: '75501',
              addressCountry: 'US',
            },
          },
        }}
      />

      {/* Hero: Storm & Problem Focused */}
      <section className="bg-slate-950 text-white relative py-16 px-4 sm:px-6 border-b border-slate-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-wide">
              <CloudLightning className="w-4 h-4 text-amber-400" />
              <span>Northeast Texas Severe Weather Response Unit</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
              Forensic Storm Damage Diagnostics. <br />
              <span className="text-red-500">Hail, Wind &amp; Impact Evidence.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              When severe weather strikes Northeast Texas, asphalt shingles absorb devastating kinetic energy. Hail bruises shatter the internal fiberglass matting beneath the granules, while microburst winds tear thermal adhesive seals—creating unseen leaks that rot roof decks for months before showing on ceilings.
            </p>

            <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-300 pt-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
                <span>Standardized 10x10 Chalk Test Squares</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
                <span>Underlayment &amp; Mat Fracture Diagnostics</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
                <span>Collateral Soft-Metal Documentation</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => onOpenIntake('STORM')}
                className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 text-center"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>SCHEDULE STORM DAMAGE INSPECTION</span>
              </button>
              <a
                href="tel:9032315940"
                className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 text-center"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>EMERGENCY DISPATCH: 903-231-5940</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-lg">
                Urgent Storm Alert
              </div>
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>When to Request an Emergency Inspection</span>
              </h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                If your neighborhood experienced hail over 1 inch, wind gusts exceeding 50 mph, or fallen tree limbs, request an inspection before secondary water intrusion damages attic insulation and drywall.
              </p>
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-1 shrink-0" />
                  <div>
                    <strong className="text-slate-200">Active Interior Drips:</strong> Immediate emergency tarping required to satisfy your insurance policy duty to mitigate loss.
                  </div>
                </div>
                <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0" />
                  <div>
                    <strong className="text-slate-200">Shingle Tabs in Lawn:</strong> Indicates wind-lift thermal seal failure across multiple slope exposures.
                  </div>
                </div>
                <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0" />
                  <div>
                    <strong className="text-slate-200">Dent In AC Unit or Gutters:</strong> Definitive ground collateral confirming roof-level hail impacts.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Immediate Homeowner Safety Protocols: What to Do After a Storm */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="max-w-3xl mb-8">
            <span className="text-xs uppercase tracking-wider text-red-600 font-bold">
              Immediate Safety &amp; Protection Protocols
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight mt-1">
              What Homeowners Should Do Immediately After a Storm
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Taking the correct initial steps protects your personal safety, prevents compounding water damage, and ensures proper claim documentation for your insurance provider.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DO's */}
            <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-5 space-y-3">
              <h3 className="font-bold text-emerald-950 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>CRITICAL ACTIONS: What You SHOULD Do</span>
              </h3>
              <ul className="space-y-2.5 text-xs text-emerald-900">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-emerald-700">1.</span>
                  <span><strong>Inspect from ground level only:</strong> Walk your perimeter and safely photograph dented downspouts, mailboxes, air conditioners, window screens, and fallen branches.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-emerald-700">2.</span>
                  <span><strong>Mitigate active indoor leaks:</strong> Place buckets under active drips and cover furniture with plastic to prevent secondary personal property destruction.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-emerald-700">3.</span>
                  <span><strong>Preserve fallen shingles:</strong> Keep any shingle tabs blown into your yard—they serve as evidence of seal failure for your insurance adjuster.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-emerald-700">4.</span>
                  <span><strong>Call a licensed local roofing specialist:</strong> Schedule a certified physical roof diagnostic walk before filing an unverified claim.</span>
                </li>
              </ul>
            </div>

            {/* DONT's */}
            <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-5 space-y-3">
              <h3 className="font-bold text-rose-950 text-sm flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>DANGEROUS MISTAKES: What You SHOULD NEVER Do</span>
              </h3>
              <ul className="space-y-2.5 text-xs text-rose-900">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-rose-700">&bull;</span>
                  <span><strong>DO NOT climb onto a wet roof:</strong> Wet shingles and hail-bruised granules lose friction instantly. Steep-slope falls cause catastrophic injuries.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-rose-700">&bull;</span>
                  <span><strong>DO NOT sign blank contingency contracts:</strong> Out-of-state storm chasers flood storm areas demanding signed "Assignment of Benefits" forms before doing an inspection.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-rose-700">&bull;</span>
                  <span><strong>DO NOT attempt permanent DIY repairs:</strong> Improper caulking or nail placement can void manufacturer warranties and complicate adjuster approval.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-rose-700">&bull;</span>
                  <span><strong>DO NOT agree to illegal deductible waivers:</strong> Texas HB 2102 strictly criminalizes contractor deductible rebates or payment schemes.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why Damage May Be Invisible from the Ground */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-10 border border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs uppercase tracking-wider text-red-400 font-bold flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                <span>Forensic Reality</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                Why 80% of Roof Storm Damage Is Invisible From the Ground
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Homeowners frequently assume that because their shingles aren’t missing, their roof survived unscathed. However, hail impacts do not always punch holes through shingles. Instead, hailstones deliver a blunt kinetic shock that fractures the asphalt-saturated fiberglass mat underneath.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <strong className="text-red-400 block font-bold">Sub-Surface Mat Fractures</strong>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Granules stay in place initially, but the waterproof membrane beneath is split. Within 6–12 months, UV exposure erodes the bruised area, causing active leaks.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <strong className="text-amber-400 block font-bold">Creased Thermal Seal Breaks</strong>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Winds lift the shingle tab, break the adhesive seal, and drop it back into place. From the street, the shingle looks normal, but wind-driven rain now flows beneath it.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Camera className="w-4 h-4 text-red-500" />
                <span>The Diagnostic Test Square Method</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Insurance companies require objective proof. Our inspectors physically climb every cardinal slope and outline a standardized 10-foot by 10-foot (100 sq ft) test square with non-destructive chalk.
              </p>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-[11px] text-slate-300 space-y-1">
                <div className="font-bold text-white">&bull; Objective Impact Counts</div>
                <div>We count and circle verified hail bruising pits per test square across North, South, East, and West slopes.</div>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-[11px] text-slate-300 space-y-1">
                <div className="font-bold text-white">&bull; Soft Metal Collateral Audit</div>
                <div>We document indentation depths on ridge vents, box vents, lead pipe boots, and chimney flashings to corroborate hail size.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Specific Damage Types: Hail, Wind, Fallen Trees, Punctures, Flashing */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-wider text-red-600 font-bold">
            Comprehensive Analysis
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight mt-1">
            Northeast Texas Storm Damage Categories
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Each weather mechanism requires distinct forensic documentation to substantiate insurance restoration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Hail */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col">
            <div className="h-44 bg-slate-100 relative overflow-hidden">
              <img
                src="/assets/images/hail_damage_shingles.jpg"
                alt="Severe hail damage bruised architectural shingle with inspection chalk test circle"
                className="w-full h-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                Hail Damage
              </span>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Hail Impact Mat Fracture</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Hail stones break the asphalt bond and displace protective ceramic granules. Displaced areas expose raw bitumen to rapid ultraviolet deterioration.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[11px] font-semibold text-red-600">
                Action: Chalk Test Square &amp; Insurance Scope
              </div>
            </div>
          </div>

          {/* Card 2: Wind */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col">
            <div className="h-44 bg-slate-100 relative overflow-hidden">
              <img
                src="/assets/images/wind_damage_shingles.jpg"
                alt="Wind-lifted and torn residential roof shingles with horizontal crease damage"
                className="w-full h-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-2 left-2 bg-amber-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                Wind &amp; Uplift
              </span>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Wind-Lifted &amp; Creased Tabs</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Microburst gusts over 50 mph break factory thermal sealant strips. When shingles flutter, dark horizontal crease marks develop across the top of the shingle.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[11px] font-semibold text-amber-600">
                Action: Thermal Seal Test &amp; Shingle Matching
              </div>
            </div>
          </div>

          {/* Card 3: Fallen Trees & Debris */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col">
            <div className="h-44 bg-slate-100 relative overflow-hidden">
              <img
                src="/assets/images/fallen_tree_roof.jpg"
                alt="Fallen tree limb roof puncture impact and emergency tarp restoration"
                className="w-full h-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                Tree &amp; Debris Impact
              </span>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Puncture &amp; Rafter Displacement</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Heavy pine or oak branches punch through OSB/plywood decking, fracturing roof trusses and puncturing underlayment, creating immediate water cascade risks.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[11px] font-semibold text-purple-600">
                Action: Structural Tarping &amp; Deck Framing
              </div>
            </div>
          </div>

          {/* Card 4: Flashing Damage */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col">
            <div className="h-44 bg-slate-100 relative overflow-hidden">
              <img
                src="/assets/images/valley_flashing_roof.jpg"
                alt="Damaged roof valley metal flashing and water channel"
                className="w-full h-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                Flashing &amp; Valleys
              </span>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Flashing Puncture &amp; Tear-Away</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Chimney step flashing, sidewalls, and valley metals can be dented, unseated, or lifted during intense storms, channeling water directly behind interior walls.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[11px] font-semibold text-blue-600">
                Action: Metal Reflashing &amp; Counter-Seal
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Professional Storm Inspection Process */}
      <section className="bg-slate-100 py-14 px-4 sm:px-6 border-y border-slate-200">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="max-w-3xl">
            <span className="text-xs uppercase tracking-wider text-red-600 font-bold">
              Standard Operating Procedure
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight mt-1">
              Our 5-Step Storm Damage Diagnostic Protocol
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              How The Roof Doctors systematically evaluates and prepares your property for complete restoration.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-red-600 text-white font-black text-xs flex items-center justify-center">
                1
              </div>
              <h4 className="font-bold text-slate-900 text-xs uppercase">Ground Collateral Audit</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Inspect AC condenser fins, gutters, siding, window wraps, and painted fences for physical hail indentations.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-red-600 text-white font-black text-xs flex items-center justify-center">
                2
              </div>
              <h4 className="font-bold text-slate-900 text-xs uppercase">Physical 10x10 Test Square</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Measure test squares on all slope exposures to quantify bruising hits per square required by insurance carrier guidelines.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-red-600 text-white font-black text-xs flex items-center justify-center">
                3
              </div>
              <h4 className="font-bold text-slate-900 text-xs uppercase">Attic &amp; Decking Inspection</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Inspect the attic for daylight penetration, water stains along rafters, and decking moisture using digital moisture meters.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-red-600 text-white font-black text-xs flex items-center justify-center">
                4
              </div>
              <h4 className="font-bold text-slate-900 text-xs uppercase">Transparent Digital Report</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Receive high-resolution photographs with date/GPS timestamps detailing verified damage or certifying a clean bill of health.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-red-600 text-white font-black text-xs flex items-center justify-center">
                5
              </div>
              <h4 className="font-bold text-slate-900 text-xs uppercase">Adjuster On-Roof Support</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                If damage warrants a claim, we physically meet your insurance adjuster on the roof to ensure all damaged slopes are counted.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Temporary Protection and Emergency Tarping Precautions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-amber-900">
                <Clock className="w-4 h-4 text-amber-700" />
                <span>Emergency Tarping &amp; Rapid Mitigation</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Need Immediate Emergency Roof Tarping?
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                If tree limbs pierced your decking or wind tore away large sections of shingles, call us immediately. We dispatch heavy-duty, sandbag-secured commercial tarps that prevent ongoing interior water damage while your insurance claim is processed.
              </p>
            </div>
            <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <a
                href="tel:9032315940"
                className="px-5 py-3 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm rounded-xl text-center flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>903-231-5940</span>
              </a>
              <button
                onClick={() => onOpenIntake('EMERGENCY')}
                className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl text-center cursor-pointer transition-colors"
              >
                DISPATCH EMERGENCY TARP
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Storm Damage FAQs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-3xl mb-6">
          <span className="text-xs uppercase tracking-wider text-red-600 font-bold">
            Homeowner Inquiries
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase">
            Frequently Asked Questions About Roof Storm Damage
          </h3>
        </div>

        <div className="space-y-3">
          <details className="bg-white border border-slate-200 rounded-xl p-4 cursor-pointer">
            <summary className="font-bold text-xs sm:text-sm text-slate-900 flex justify-between items-center">
              <span>How long do I have to file an insurance claim after a storm in Texas?</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </summary>
            <p className="text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100 leading-relaxed">
              Most standard homeowner insurance policies in Texas require claims to be filed within one year (12 months) of the date of loss. However, notifying your insurer promptly and having a verified inspection report minimizes disputes over secondary interior damage.
            </p>
          </details>

          <details className="bg-white border border-slate-200 rounded-xl p-4 cursor-pointer">
            <summary className="font-bold text-xs sm:text-sm text-slate-900 flex justify-between items-center">
              <span>Will filing a storm damage roof claim raise my personal homeowners insurance rates?</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </summary>
            <p className="text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100 leading-relaxed">
              In Texas, insurance companies generally cannot single out an individual policyholder and increase rates solely because of an Act of God claim like hail or wind. Rate adjustments, if any, are made across entire geographic zip code risk pools.
            </p>
          </details>

          <details className="bg-white border border-slate-200 rounded-xl p-4 cursor-pointer">
            <summary className="font-bold text-xs sm:text-sm text-slate-900 flex justify-between items-center">
              <span>What if the insurance adjuster claims there is no hail damage?</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </summary>
            <p className="text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100 leading-relaxed">
              If an adjuster misses damage or conducts an incomplete ground-only inspection, we provide detailed photographic evidence and request a re-inspection with a senior adjuster. We physically accompany the adjuster on the roof to review chalk test squares together.
            </p>
          </details>
        </div>
      </section>

      {/* Primary Page CTA */}
      <section className="bg-slate-900 text-white py-14 px-4 sm:px-6 mt-12 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="text-xs uppercase tracking-wider text-red-400 font-bold">
            Objective Answers • Zero High Pressure
          </span>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
            Schedule Your Forensic Storm Damage Inspection
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Our certified inspectors document your property with photographic precision. Free 21-point physical walk across Texarkana, Longview, Tyler, Paris, and all of Northeast Texas.
          </p>
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onOpenIntake('STORM')}
              className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-colors cursor-pointer"
            >
              SCHEDULE FREE STORM INSPECTION
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
