import React from 'react';
import { SeoHead } from '../../common/SeoHead.tsx';
import {
  Layers,
  ShieldCheck,
  CheckCircle2,
  CalendarCheck,
  PhoneCall,
  Sparkles,
  Zap,
  Check,
  X,
  ArrowRight,
  Info,
  DollarSign,
  Wind,
} from 'lucide-react';

interface RoofingSystemsPageProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenIntake: (type?: 'DIAGNOSTIC' | 'STORM' | 'EMERGENCY' | 'REPLACEMENT') => void;
}

export const RoofingSystemsPage: React.FC<RoofingSystemsPageProps> = ({
  currentPath,
  onNavigate,
  onOpenIntake,
}) => {
  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 pb-20">
      <SeoHead
        title="Roofing Systems & Material Comparison | The Roof Doctors"
        description="Compare Architectural Shingles, CertainTeed Grand Manor Class 4 Luxury Shingles, Standing Seam Metal, Natural Quarried Slate, and Clay/Concrete Tile roofing for Northeast Texas homes."
        canonicalPath={currentPath}
      />

      {/* Hero Header */}
      <section className="bg-slate-950 text-white py-16 px-4 sm:px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wide">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Material Science &amp; System Engineering</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
            Residential Roofing Systems Compared. <br />
            <span className="text-red-500">Engineered For Northeast Texas Weather.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
            Not all roofing materials perform equally against Northeast Texas hail, high summer humidity, and 60+ mph microburst gusts. Explore our 5 residential and architectural roofing systems—from dependable architectural shingles to luxury CertainTeed Grand Manor, Standing Seam Metal, Natural Quarried Slate, and Mediterranean Tile.
          </p>
        </div>
      </section>

      {/* Side-by-Side System Comparison Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs uppercase tracking-wider text-red-600 font-bold">Comprehensive Portfolio</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Select Your Architectural Standard
            </h2>
          </div>
          <span className="hidden sm:inline-block text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
            5 Distinct System Grades
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1: Architectural Shingles */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between">
            <div className="h-52 relative overflow-hidden bg-slate-100">
              <img
                src="/assets/images/new_roof_install.jpg"
                alt="Installed architectural dimensional shingles with deep shadow lines"
                className="w-full h-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-xs text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-md">
                Standard Premium
              </span>
            </div>
            <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Residential Baseline
                </span>
                <h3 className="text-2xl font-black text-slate-900">Architectural Shingles</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Laminated dual-layer dimensional asphalt shingles. The dependable gold standard for Northeast Texas suburban residences, delivering multi-tonal shadow lines and genuine shake appearance.
                </p>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Wind Rating:</span>
                    <span className="font-bold text-slate-900">130 MPH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hail Resistance:</span>
                    <span className="font-bold text-slate-900">Class 1-2 (Standard)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Lifespan:</span>
                    <span className="font-bold text-slate-900">25–30 Years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Weight:</span>
                    <span className="font-bold text-slate-900">240 lbs / Square</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Insurance Discount:</span>
                    <span className="font-bold text-slate-900">Standard Rates</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-700">
                  <strong className="text-slate-900 block font-bold">Best For:</strong>
                  <p className="text-slate-600 leading-relaxed">
                    Homeowners seeking reliable 130 mph wind defense, proven curb appeal, and exceptional cost efficiency without specialized structural decking alterations.
                  </p>
                </div>
              </div>

              <button
                onClick={() => onOpenIntake('REPLACEMENT')}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer mt-4"
              >
                Request Architectural Estimate
              </button>
            </div>
          </div>

          {/* Card 2: CertainTeed Grand Manor (Class IV Impact-Resistant Shingles) */}
          <div className="bg-white rounded-3xl border-2 border-red-600 overflow-hidden shadow-xl relative flex flex-col justify-between">
            <div className="absolute top-3 right-3 z-10 bg-red-600 text-white text-[11px] font-black uppercase px-3.5 py-1 rounded-full shadow-md">
              Most Recommended in Texas
            </div>
            <div className="h-52 relative overflow-hidden bg-slate-100">
              <img
                src="/assets/images/grand_manor_roof.jpg"
                alt="CertainTeed Grand Manor luxury heavyweight designer shingle roof with slate tabs and deep shadow lines"
                className="w-full h-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-md">
                UL 2218 Class 4 • Luxury Slate Profile
              </span>
            </div>

            <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-black uppercase text-red-600 tracking-wider">
                  CertainTeed Designer Luxury
                </span>
                <h3 className="text-2xl font-black text-slate-900">CertainTeed Grand Manor®</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Heavyweight 425 lb/square luxury designer shingles replicating the grand scale and depth of natural slate. Engineered with SBS polymer-modified asphalt to deliver certified UL 2218 Class 4 kinetic impact protection.
                </p>

                <div className="p-4 bg-red-50/50 rounded-2xl border border-red-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Wind Rating:</span>
                    <span className="font-bold text-slate-900">130 MPH Enhanced</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hail Resistance:</span>
                    <span className="font-bold text-emerald-600">UL 2218 Class 4 (Severe)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Lifespan:</span>
                    <span className="font-bold text-slate-900">40–50 Years (Lifetime)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Weight:</span>
                    <span className="font-bold text-slate-900">425 lbs / Square (Heavy)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Insurance Discount:</span>
                    <span className="font-bold text-red-600">Up to 25% Off Annually</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-700">
                  <strong className="text-slate-900 block font-bold">Best For:</strong>
                  <p className="text-slate-600 leading-relaxed">
                    Distinguished estates and executive homes in hail-prone corridors (Texarkana, Tyler, Longview, Paris). The annual insurance discount often reimburses the material premium in under 4 years.
                  </p>
                </div>
              </div>

              <button
                onClick={() => onOpenIntake('REPLACEMENT')}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer mt-4"
              >
                Request Grand Manor Quote
              </button>
            </div>
          </div>

          {/* Card 3: Standing Seam Metal */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between">
            <div className="h-52 relative overflow-hidden bg-slate-100">
              <img
                src="/assets/images/metal_roof_system.jpg"
                alt="Architectural matte charcoal standing seam metal roof"
                className="w-full h-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-xs text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-md">
                Concealed Fasteners
              </span>
            </div>
            <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-black uppercase text-purple-600 tracking-wider">
                  Lifetime Modern Luxury
                </span>
                <h3 className="text-2xl font-black text-slate-900">Standing Seam Metal</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Continuous 24-gauge architectural steel panels with concealed clip fasteners and raised interlocking vertical seams. Completely impervious to rot, moss, and burning ember wildfire hazards.
                </p>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Wind Rating:</span>
                    <span className="font-bold text-slate-900">140+ MPH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hail Resistance:</span>
                    <span className="font-bold text-slate-900">Class 4 Impact Proof</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Lifespan:</span>
                    <span className="font-bold text-slate-900">50+ Years (Lifetime)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Weight:</span>
                    <span className="font-bold text-slate-900">120–150 lbs / Square</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Insurance Discount:</span>
                    <span className="font-bold text-slate-900">Class A Fire &amp; Hail Discounts</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-700">
                  <strong className="text-slate-900 block font-bold">Best For:</strong>
                  <p className="text-slate-600 leading-relaxed">
                    Modern farmhouse and luxury craftsman residences. Easily sheds heavy pine needles, acorns, and snow without granule erosion or maintenance.
                  </p>
                </div>
              </div>

              <button
                onClick={() => onOpenIntake('REPLACEMENT')}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer mt-4"
              >
                Request Standing Seam Proposal
              </button>
            </div>
          </div>

          {/* Card 4: Natural Slate Roofing (NEW LUXURY OPTION 1) */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between">
            <div className="h-52 relative overflow-hidden bg-slate-100">
              <img
                src="/assets/images/slate_roofing.jpg"
                alt="Genuine hand-split natural slate stone roof on luxury estate"
                className="w-full h-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-xs text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-md">
                100-Year Generational Stone
              </span>
            </div>
            <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-black uppercase text-amber-700 tracking-wider">
                  Heirloom Natural Stone
                </span>
                <h3 className="text-2xl font-black text-slate-900">Natural Slate Roofing</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Authentic quarried metamorphic rock tiles hand-split to precision thickness. Unrivaled organic texture and permanence installed with solid copper valley channels, copper flashing, and non-corroding copper nails.
                </p>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Wind Rating:</span>
                    <span className="font-bold text-slate-900">150+ MPH Tested</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hail Resistance:</span>
                    <span className="font-bold text-emerald-600">ASTM C406 Grade S1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Lifespan:</span>
                    <span className="font-bold text-slate-900">75–125+ Years (Centennial)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Weight:</span>
                    <span className="font-bold text-slate-900">800–1,200 lbs / Square</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Fire Rating:</span>
                    <span className="font-bold text-emerald-600">Class A Non-Combustible</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-700">
                  <strong className="text-slate-900 block font-bold">Best For:</strong>
                  <p className="text-slate-600 leading-relaxed">
                    Historic landmark manors, luxury French country and Tudor estates in Tyler, Marshall, and Texarkana where generational longevity and authentic stone aesthetics are paramount.
                  </p>
                </div>
              </div>

              <button
                onClick={() => onOpenIntake('REPLACEMENT')}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer mt-4"
              >
                Request Slate Consultation
              </button>
            </div>
          </div>

          {/* Card 5: Mediterranean Tile Roofing (NEW LUXURY OPTION 2) */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between">
            <div className="h-52 relative overflow-hidden bg-slate-100">
              <img
                src="/assets/images/tile_roofing.jpg"
                alt="Spanish barrel clay tile and high-density concrete roof on Mediterranean villa"
                className="w-full h-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-xs text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-md">
                Mediterranean &amp; Spanish Profile
              </span>
            </div>
            <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-black uppercase text-amber-600 tracking-wider">
                  Thermal Deflection Luxury
                </span>
                <h3 className="text-2xl font-black text-slate-900">Clay &amp; Concrete Tile</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Authentic terra cotta Spanish S-tiles and ultra-dense interlocking concrete tiles. The curved design fosters continuous natural airflow beneath the tiles, drastically reducing attic heat gain in humid Texas summers.
                </p>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Wind Rating:</span>
                    <span className="font-bold text-slate-900">130–150 MPH Fastened</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hail Resistance:</span>
                    <span className="font-bold text-slate-900">Class 3 to Class 4</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Lifespan:</span>
                    <span className="font-bold text-slate-900">50–100 Years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Weight:</span>
                    <span className="font-bold text-slate-900">600–950 lbs / Square</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Thermal Benefit:</span>
                    <span className="font-bold text-amber-600">Cuts Attic Temp up to 22°F</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-700">
                  <strong className="text-slate-900 block font-bold">Best For:</strong>
                  <p className="text-slate-600 leading-relaxed">
                    Spanish Colonial, Tuscan, and modern Southwestern luxury homes seeking dramatic curb appeal, non-combustible Class A fire armor, and maximum energy insulation.
                  </p>
                </div>
              </div>

              <button
                onClick={() => onOpenIntake('REPLACEMENT')}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer mt-4"
              >
                Request Tile Roofing Proposal
              </button>
            </div>
          </div>

          {/* Card 6: Architectural Consultation & Engineering Sample Box */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-8 border border-slate-800 shadow-xl flex flex-col justify-between">
            <div className="space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                  Custom Engineering &amp; Samples
                </span>
                <h3 className="text-2xl font-black text-white mt-1">Not Sure Which System Fits Your Architecture?</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Our senior roofing inspectors carry full physical sample kits to every appointment, including CertainTeed Grand Manor color selections, 24-gauge standing seam metal profiles, quarried Vermont slate tiles, and authentic clay tile profiles.
                </p>
              </div>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-center gap-2.5 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Complimentary Structural Decking Load Analysis</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Physical Manufacturer Color Boards Brought to Your Door</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Texas Department of Insurance (TDI) Rebate Verification</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800/80 space-y-3">
              <button
                onClick={() => onOpenIntake('REPLACEMENT')}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg transition-colors cursor-pointer"
              >
                Schedule Free Design &amp; Deck Audit
              </button>
              <p className="text-[11px] text-center text-slate-400">
                Includes digital ROOFR satellite aerial report at zero obligation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Comparison Table Across All 5 Systems */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs uppercase tracking-wider text-red-600 font-bold">Engineering Matrix</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Side-by-Side System Specifications
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Compare structural load, fire resistance, storm survivability, and longevity across all 5 roofing options.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold">
                  <th className="p-3.5 rounded-l-lg">System Option</th>
                  <th className="p-3.5">Material Composition</th>
                  <th className="p-3.5">Hail Resistance</th>
                  <th className="p-3.5">Wind Rating</th>
                  <th className="p-3.5">Lifespan</th>
                  <th className="p-3.5">Fire Rating</th>
                  <th className="p-3.5">Weight / Sq</th>
                  <th className="p-3.5 rounded-r-lg">Texas Ins. Savings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900">Architectural Shingles</td>
                  <td className="p-3.5">Laminated Fiberglass Asphalt</td>
                  <td className="p-3.5">Class 1 – 2</td>
                  <td className="p-3.5">130 MPH</td>
                  <td className="p-3.5">25–30 Years</td>
                  <td className="p-3.5">Class A</td>
                  <td className="p-3.5">~240 lbs</td>
                  <td className="p-3.5 text-slate-500">Standard Rates</td>
                </tr>
                <tr className="bg-red-50/40 hover:bg-red-50/70 transition-colors font-medium">
                  <td className="p-3.5 font-bold text-red-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-600"></span>
                    CertainTeed Grand Manor®
                  </td>
                  <td className="p-3.5">SBS Polymer Heavyweight Shingle</td>
                  <td className="p-3.5 font-bold text-emerald-700">UL 2218 Class 4</td>
                  <td className="p-3.5">130 MPH Enhanced</td>
                  <td className="p-3.5 font-bold text-slate-900">40–50 Years</td>
                  <td className="p-3.5">Class A</td>
                  <td className="p-3.5">~425 lbs</td>
                  <td className="p-3.5 font-bold text-red-600">Up to 25% Off</td>
                </tr>
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900">Standing Seam Metal</td>
                  <td className="p-3.5">24-Ga. Steel / Kynar 500®</td>
                  <td className="p-3.5 font-bold text-emerald-700">Class 4 Impact Proof</td>
                  <td className="p-3.5">140+ MPH</td>
                  <td className="p-3.5 font-bold text-slate-900">50+ Years (Lifetime)</td>
                  <td className="p-3.5">Class A</td>
                  <td className="p-3.5">120–150 lbs</td>
                  <td className="p-3.5 text-emerald-700 font-semibold">Fire &amp; Hail Credit</td>
                </tr>
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900">Natural Quarried Slate</td>
                  <td className="p-3.5">100% Metamorphic Stone</td>
                  <td className="p-3.5 font-bold text-emerald-700">ASTM C406 S1 Grade</td>
                  <td className="p-3.5">150+ MPH</td>
                  <td className="p-3.5 font-bold text-purple-900">75–125+ Years</td>
                  <td className="p-3.5 font-bold text-emerald-700">Class A Non-Combustible</td>
                  <td className="p-3.5 text-amber-700 font-semibold">800–1,200 lbs*</td>
                  <td className="p-3.5 text-emerald-700 font-semibold">Maximum Fire Credit</td>
                </tr>
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900">Clay &amp; Concrete Tile</td>
                  <td className="p-3.5">Kiln-Fired Clay / High-Density Cement</td>
                  <td className="p-3.5">Class 3 – Class 4</td>
                  <td className="p-3.5">130–150 MPH</td>
                  <td className="p-3.5 font-bold text-slate-900">50–100 Years</td>
                  <td className="p-3.5 font-bold text-emerald-700">Class A Non-Combustible</td>
                  <td className="p-3.5 text-amber-700 font-semibold">600–950 lbs*</td>
                  <td className="p-3.5 text-emerald-700 font-semibold">Wind &amp; Fire Credit</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-500 italic">
            *Note on Heavyweight Systems: Slate and tile systems require an attic rafter and structural load audit to confirm roof trusses can bear the extra dead weight. The Roof Doctors includes structural verification with all heavy-gauge installations.
          </p>
        </div>
      </section>

      {/* Texas Insurance Discount Explanation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-800">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs uppercase tracking-wider text-red-400 font-bold">
              Texas Insurance Code Incentive
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              How Class 4 Shingles Lower Your Texas Home Insurance
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              In Texas, homeowners insurance companies spend billions annually paying for hail damage claims. Under Texas Department of Insurance guidelines, most major carriers (including State Farm, Allstate, USAA, and Farmers) offer mandatory premium discounts ranging from 15% to 28% for homes with verified UL 2218 Class 4 roofing installations.
            </p>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
              <strong className="text-white block font-bold">We Provide Your Certificate of Installation:</strong>
              <span>Upon completion of your Class 4 roof replacement, we furnish a notarized TDI/UL 2218 building compliance certificate to send directly to your insurance agent.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Primary CTA Band */}
      <section className="bg-slate-900 text-white py-14 px-4 sm:px-6 mt-12 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="text-xs uppercase tracking-wider text-red-400 font-bold">
            Physical Sample Boards Delivered to Your Door
          </span>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
            Compare Shingle Colors &amp; Systems In Person
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Schedule a free consultation. Our project manager will bring physical manufacturer sample boards and satellite roof measurements to your home.
          </p>
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onOpenIntake('REPLACEMENT')}
              className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-colors cursor-pointer"
            >
              REQUEST SAMPLE BOARDS &amp; ESTIMATE
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
