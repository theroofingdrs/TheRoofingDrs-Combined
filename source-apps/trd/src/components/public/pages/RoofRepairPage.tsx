import React from 'react';
import { SeoHead } from '../../common/SeoHead.tsx';
import {
  Wrench,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  CalendarCheck,
  ChevronRight,
  Clock,
  ShieldCheck,
  ArrowRight,
  Droplets,
  Search,
  Check,
  Compass,
  FileText,
} from 'lucide-react';

interface RoofRepairPageProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenIntake: (type?: 'DIAGNOSTIC' | 'STORM' | 'EMERGENCY' | 'REPLACEMENT') => void;
}

export const RoofRepairPage: React.FC<RoofRepairPageProps> = ({
  currentPath,
  onNavigate,
  onOpenIntake,
}) => {
  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 pb-20">
      <SeoHead
        title="Precision Roof Repair & Diagnostic Leak Fix | The Roof Doctors"
        description="Targeted forensic roof repairs in Northeast Texas. Pipe boot seals, chimney flashing, missing shingles, and valley leak diagnostics without forced replacement."
        canonicalPath={currentPath}
        schemaJson={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          serviceType: 'Residential Roof Repair & Leak Diagnostics',
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

      {/* Hero: Repair & Diagnosis Focused */}
      <section className="bg-slate-900 text-white relative py-16 px-4 sm:px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase tracking-wide">
              <Wrench className="w-4 h-4 text-blue-400" />
              <span>Surgical Restoration • Fix What's Broken</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
              Precision Roof Repair. <br />
              <span className="text-red-500">Zero Forced Replacements.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Not every roof leak warrants a full $20,000 roof replacement. Over 85% of active residential leaks originate at isolated penetrations—dry-rotted plumbing pipe collars, degraded step flashing around chimneys, or a handful of wind-torn shingles. We isolate the true entry point and execute permanent, watertight repairs.
            </p>

            <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-300 pt-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Water Path Ingress Tracing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Matching Shingle Weave &amp; Seal</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Heavy-Duty Lead &amp; Neoprene Flashings</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => onOpenIntake('DIAGNOSTIC')}
                className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 text-center"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>SCHEDULE LEAK DIAGNOSIS ($0 FEE)</span>
              </button>
              <a
                href="tel:9032315940"
                className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 text-center"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>CALL 903-231-5940</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="text-[11px] uppercase font-bold text-red-400">
                The Leak Diagnostic Guarantee
              </div>
              <h3 className="text-lg font-bold text-white">
                How We Locate Hidden Water Pathways
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Water rarely enters directly above your ceiling water spot. Roof leaks travel horizontally along rafters, underlayment seams, and electrical wiring before dripping. Our inspectors physically crawl the attic to trace the origin back to the exterior roof deck.
              </p>
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Plumbing Pipe Boot Collar</span>
                  <span className="text-emerald-400 font-bold">1-2 Hour Repair</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Chimney Counter-Flashing</span>
                  <span className="text-emerald-400 font-bold">Same-Day Fix</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Wind-Blown Shingle Tab Section</span>
                  <span className="text-emerald-400 font-bold">Color-Matched</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Valley Metal Leak Infiltration</span>
                  <span className="text-emerald-400 font-bold">Deck Wood Replaced</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 5-Stage Repair-Specific Process */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-wider text-red-600 font-bold">
            Methodology That Protects Your Budget
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight mt-1">
            Our 5-Stage Precision Repair Workflow
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Every repair adheres to engineered installation guidelines rather than temporary roofing tar patches that fail during the next Texas thunderstorm.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 text-red-600 font-black text-sm flex items-center justify-center">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
              Diagnostic Inspection
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We inspect both the rooftop surface and the attic underside with moisture meters to trace the exact water ingress channel.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 text-red-600 font-black text-sm flex items-center justify-center">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
              Root Cause Diagnosis
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We determine whether failure was caused by UV rubber degradation, wind-shear, rusted fasteners, or inadequate pitch flashing.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 text-red-600 font-black text-sm flex items-center justify-center">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
              Targeted Repair Plan
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              You receive a written, fixed-cost scope specifying the replacement materials, shingle brand/color match, and warranties.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 text-red-600 font-black text-sm flex items-center justify-center">
              4
            </div>
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
              Surgical Execution
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Damaged shingles are unfastened without harming adjacent courses. Rotted sheathing is cut out and replaced with fresh CDX plywood.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 text-red-600 font-black text-sm flex items-center justify-center">
              5
            </div>
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
              Watertight Final Check
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We perform a physical water test when required, seal exposed fasteners with UV-stable polyurethane, and provide completed photos.
            </p>
          </div>
        </div>
      </section>

      {/* When Repair Makes Sense vs When Replacement Is Needed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs">
          <div className="max-w-3xl mb-8">
            <span className="text-xs uppercase tracking-wider text-red-600 font-bold">
              Honest Diagnostic Guidance
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight mt-1">
              When Does a Roof Repair Make Sense?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              We believe in treating roofs with surgical common sense. Here is how our certified inspectors evaluate whether an isolated repair will preserve your roof or if full replacement is genuinely unavoidable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* When Repair Makes Sense */}
            <div className="p-6 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 font-black text-emerald-950 text-base">
                <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Repair Is Strictly Recommended When:</span>
              </div>
              <ul className="space-y-3 text-xs text-emerald-900">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-emerald-700">&bull;</span>
                  <span><strong>The roof is under 15 years old:</strong> Shingles still retain sufficient asphalt oil and flexibility to allow lifting and re-fastening without breaking adjacent tabs.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-emerald-700">&bull;</span>
                  <span><strong>Damage is isolated to penetrations:</strong> Leaks originate at pipe jacks, step flashing, skylight frames, or chimney caps, while the field shingles are in sound condition.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-emerald-700">&bull;</span>
                  <span><strong>Wind damage is localized:</strong> Fewer than 10–15 shingle tabs were lifted by a isolated gust, and the decking beneath remains dry and structural.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-emerald-700">&bull;</span>
                  <span><strong>Decking is structurally sound:</strong> The plywood or tongue-and-groove deck has zero widespread sponginess, delamination, or sagging rafters.</span>
                </li>
              </ul>
            </div>

            {/* When Replacement Is Better */}
            <div className="p-6 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 font-black text-amber-950 text-base">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Replacement Becomes Necessary When:</span>
              </div>
              <ul className="space-y-3 text-xs text-amber-900">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-700">&bull;</span>
                  <span><strong>Shingles fail the brittleness bend test:</strong> When shingles are too brittle from age to bend 45 degrees without snapping, installing a repair creates new cracks in surrounding shingles.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-700">&bull;</span>
                  <span><strong>Multi-slope severe hail bruising:</strong> When hail mat fractures occur across 3 or 4 slope exposures, piecemeal repairs will leave hundreds of latent micro-leaks.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-700">&bull;</span>
                  <span><strong>Systemic decking rot:</strong> Inadequate attic ventilation has baked the decking from the underside, causing chronic delamination throughout the roof plane.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-700">&bull;</span>
                  <span><strong>Repeated recurring repairs:</strong> When homeowners spend $800+ every six months on different leak spots, cumulative repair costs rapidly outstrip a warranted new roof.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Common Types of Repairs & Actual Repair Focus */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="max-w-3xl mb-10">
          <span className="text-xs uppercase tracking-wider text-red-600 font-bold">
            Targeted Repair Solutions
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight mt-1">
            Common Roof Penetration &amp; Leak Repairs We Perform
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Each roofing vulnerability requires specific industrial materials, proper lapping techniques, and mechanical fastening.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="h-44 bg-slate-100 overflow-hidden">
              <img
                src="/assets/images/pipe_boot_roof.jpg"
                alt="Plumbing pipe vent boot rubber gasket collar on shingle roof"
                className="w-full h-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-5 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">Plumbing Pipe Boots &amp; Collars</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Texas UV rays bake neoprene rubber collars until they crack, allowing rain to run directly down the plumbing stack into ceilings. We install heavy-duty, all-lead or premium silicone boots guaranteed not to dry-rot.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="h-44 bg-slate-100 overflow-hidden">
              <img
                src="/assets/images/chimney_flashing_roof.jpg"
                alt="Chimney metal step flashing and mortar counterflashing"
                className="w-full h-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-5 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">Chimney &amp; Wall Step Flashing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Where roof shingles meet brick chimneys or vertical walls, rusty step flashing and separated mortar joints cause hidden water intrusion. We grind mortar lines, install custom counterflashing, and seal with polyurethane.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="h-44 bg-slate-100 overflow-hidden">
              <img
                src="/assets/images/valley_flashing_roof.jpg"
                alt="Valley leak repair and ice water shield metal valley channel"
                className="w-full h-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-5 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">Valley Reflashing &amp; Ice Barrier</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Roof valleys channel thousands of gallons of stormwater per hour. We peel back leaking valley shingles, install self-adhering SBS modified bitumen ice and water shield, and weave heavy-duty open or closed valley channels.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 font-bold flex items-center justify-center mb-2">
              <Wrench className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Missing Shingle Tab Replacement</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              When wind rips shingles off, exposed nail heads rust and water penetrates the felt underlayment. We hand-seal exact brand and color-matched shingles to preserve your home’s curb appeal.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 font-bold flex items-center justify-center mb-2">
              <Wrench className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Fascia &amp; Soffit Wood Restoration</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Overflowing gutters or missing drip edge allows water to run back onto the fascia board and into soffit vents. We replace rotted wood framing and install 26-gauge galvanized drip edge.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 font-bold flex items-center justify-center mb-2">
              <Wrench className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Attic Ventilation &amp; Ridge Vent Fixes</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Blown-off ridge caps or clogged soffits trap heat and condensation inside your attic, curling shingles prematurely. We balance intake and exhaust airflow with baffled continuous ridge vents.
            </p>
          </div>
        </div>
      </section>

      {/* Primary CTA Band */}
      <section className="bg-slate-900 text-white py-14 px-4 sm:px-6 mt-12 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="text-xs uppercase tracking-wider text-red-400 font-bold">
            Transparent Diagnosis • No Obligation
          </span>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
            Schedule a Precision Roof Repair &amp; Leak Diagnosis
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Stop water from damaging your home’s ceilings and structural framing. Free 21-point physical diagnostic walk by certified technicians.
          </p>
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onOpenIntake('DIAGNOSTIC')}
              className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-colors cursor-pointer"
            >
              REQUEST REPAIR INSPECTION
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
