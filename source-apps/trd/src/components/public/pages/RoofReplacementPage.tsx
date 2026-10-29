import React, { useState } from 'react';
import { SeoHead } from '../../common/SeoHead.tsx';
import {
  Layers,
  CheckCircle2,
  CalendarCheck,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Ruler,
  Clock,
  Trash2,
  Wind,
  Shield,
  Home,
  Check,
} from 'lucide-react';

interface RoofReplacementPageProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenIntake: (type?: 'DIAGNOSTIC' | 'STORM' | 'EMERGENCY' | 'REPLACEMENT') => void;
}

export const RoofReplacementPage: React.FC<RoofReplacementPageProps> = ({
  currentPath,
  onNavigate,
  onOpenIntake,
}) => {
  const [selectedMaterial, setSelectedMaterial] = useState<
    'architectural' | 'class4' | 'metal' | 'slate' | 'tile'
  >('architectural');

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 pb-20">
      <SeoHead
        title="Complete Roof Replacement & Transformation | The Roof Doctors"
        description="Engineered residential roof replacement systems in Northeast Texas. Complete tear-off down to decking, synthetic underlayment, Class 4 impact shingles, and lifetime warranties."
        canonicalPath={currentPath}
        schemaJson={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          serviceType: 'Residential Roof Replacement & Reroofing Systems',
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

      {/* Hero: Transformation & Engineering Focused */}
      <section className="bg-slate-950 text-white relative py-16 px-4 sm:px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Engineered Architectural Roof Systems</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
              Complete Roof Replacement. <br />
              <span className="text-red-500">Engineered For Decades.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Transform your home with a lifetime architectural roofing system. We never "roof-over" or nail on top of old shingles. Every installation begins with a clean tear-off down to bare sheathing, forensic structural deck inspection, synthetic underlayment, and manufacturer-certified high-wind nailing.
            </p>

            <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-300 pt-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
                <span>100% Tear-Off Down to Bare Sheathing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
                <span>ROOFR Satellite Precision Measurements</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
                <span>Continuous Ridge &amp; Soffit Balanced Ventilation</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => onOpenIntake('REPLACEMENT')}
                className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 text-center"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>GET REPLACEMENT ESTIMATE ($0 FEE)</span>
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
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="h-48 relative overflow-hidden">
                <img
                  src="/assets/images/new_roof_install.jpg"
                  alt="Completed architectural shingle roof replacement on single-family home with pristine ridge caps"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-4 bg-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded">
                  Completed Installation
                </span>
              </div>
              <div className="p-6 space-y-3 text-xs">
                <h3 className="font-bold text-white text-base">The Roof Doctors System Warranty</h3>
                <p className="text-slate-300 leading-relaxed">
                  Every new roof system includes Owens Corning or CertainTeed architectural shingles rated for 130 MPH winds, synthetic breathable underlayment, ice and water barrier in valleys, and magnetic debris sweeps.
                </p>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-slate-400 font-mono text-[11px]">
                  <span>Wind Resistance: 130 MPH</span>
                  <span>Algae Protection: 25-Year</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 7-Phase Replacement Process: Beginning to End */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-wider text-red-600 font-bold">
            Execution Standards
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight mt-1">
            The Complete Replacement Journey: What to Expect
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            From initial property preparation to final magnetic nail sweep, our process ensures an engineered installation with minimal disruption to your daily life.
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              step: '01',
              title: 'Phase 1: Property Shielding & Site Setup',
              desc: 'We position rubber-tired dump trailers on protective driveway boards. Landscaping, shrubbery, flower beds, and air conditioning units are covered with heavy-duty tarps and plywood armor boards to prevent debris damage.',
              timing: 'Morning of Day 1 (7:00 AM - 8:00 AM)',
            },
            {
              step: '02',
              title: 'Phase 2: Complete Tear-Off to Bare Wood',
              desc: 'We strip every layer of old asphalt shingles, brittle felt underlayment, and rusted nails down to the raw wood deck sheathing. We never install new shingles over old layers, which traps moisture and violates building codes.',
              timing: 'Day 1 Morning (8:00 AM - 11:30 AM)',
            },
            {
              step: '03',
              title: 'Phase 3: Forensic Deck Inspection & Rotted Wood Replacement',
              desc: 'Our project manager walks the bare decking to inspect every sheet of plywood or OSB. Any boards damaged by previous leaks, sagging, or delamination are cut out and replaced with fresh CDX grade exterior sheathing.',
              timing: 'Day 1 Midday (11:30 AM - 1:00 PM)',
            },
            {
              step: '04',
              title: 'Phase 4: Drip Edge & Synthetic Underlayment Barrier',
              desc: 'We install heavy-gauge galvanized drip edge along eaves and rakes. Self-adhering ice and water shield is sealed into valleys, roof-to-wall joints, and around chimneys, followed by 100% synthetic breathable underlayment across all slopes.',
              timing: 'Day 1 Early Afternoon',
            },
            {
              step: '05',
              title: 'Phase 5: Shingle Installation with 6-Nail High-Wind Pattern',
              desc: 'Architectural shingles are fastened using pneumatic coil nailers in an enhanced 6-nail per shingle pattern (exceeding the standard 4-nail pattern). Starter strip courses prevent wind uplift along the perimeter.',
              timing: 'Day 1 Afternoon',
            },
            {
              step: '06',
              title: 'Phase 6: Ventilation Optimization & High-Profile Ridge Caps',
              desc: 'We cut back the decking along the peak to install continuous, baffled ridge vents for balanced attic heat exhaust, capped with matching high-profile dimensional hip and ridge shingles.',
              timing: 'Day 1 Late Afternoon / Day 2',
            },
            {
              step: '07',
              title: 'Phase 7: Multi-Pass Magnetic Cleanup & Final Quality Certification',
              desc: 'We run industrial magnetic rollers across your lawn, driveway, flower beds, and sidewalk multiple times to capture every stray nail. The project manager completes a 21-point post-installation quality audit and provides your warranty file.',
              timing: 'Job Completion',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
            >
              <div className="flex items-start gap-4 max-w-3xl">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center justify-center shrink-0">
                  {item.step}
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-base">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
              <div className="shrink-0 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 py-1.5 px-3 rounded-lg whitespace-nowrap">
                {item.timing}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Anatomy of an Engineered Roof System */}
      <section className="bg-slate-900 text-white py-14 px-4 sm:px-6 border-y border-slate-800">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="max-w-3xl">
            <span className="text-xs uppercase tracking-wider text-red-400 font-bold">
              Engineering Specs
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mt-1">
              The Anatomy of an Engineered Roof System
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2">
              A durable roof is a multi-layered barrier system, not just shingles on plywood.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>1. Structural Decking Sheathing</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                7/16" OSB or 1/2" CDX exterior plywood securely fastened to rafters with zero sponginess or rotted sections.
              </p>
            </div>

            <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>2. Drip Edge &amp; Rake Metal</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                26-gauge baked enamel corrosion-proof metal edging directs rainwater away from fascia boards straight into gutters.
              </p>
            </div>

            <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>3. Self-Adhering Ice &amp; Water Barrier</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Modified bitumen membrane bonded directly to wood decking in valleys and penetrations to prevent wind-driven ice and rain dams.
              </p>
            </div>

            <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>4. Synthetic Breathable Underlayment</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                High-performance woven synthetic underlayment that does not tear, wrinkle, or absorb moisture like old organic 15# felt paper.
              </p>
            </div>

            <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>5. Starter Shingle Course</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Factory adhesive strips installed along eaves and rakes to lock shingle edges against 130 MPH straight-line winds.
              </p>
            </div>

            <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>6. Continuous Ridge Ventilation</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                External-baffled ridge vents draw cool air through soffit vents and expel trapped heat, extending shingle lifespan by 30%.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Material Selection: Architectural vs Class 4 vs Metal */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-wider text-red-600 font-bold">
            Custom Specification
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight mt-1">
            Choose Your Roofing Material System
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Compare material performance grades, Texas hail ratings, and insurance premium discounts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {/* Card 1: Architectural */}
          <div
            onClick={() => setSelectedMaterial('architectural')}
            className={`bg-white rounded-2xl border p-5 transition-all cursor-pointer flex flex-col justify-between ${
              selectedMaterial === 'architectural'
                ? 'border-red-600 shadow-md ring-2 ring-red-600/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase text-slate-500">Standard</span>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Great Value
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900">Architectural Shingles</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Multi-layered dimensional laminated shingles providing deep shadow lines and authentic cedar shake appearance.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>130 MPH Wind Rating</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>30-Yr Limited Warranty</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Algae Resistance</span>
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-red-600">
              {selectedMaterial === 'architectural' ? 'Selected ✓' : 'Select Spec &rarr;'}
            </div>
          </div>

          {/* Card 2: CertainTeed Grand Manor / Class 4 */}
          <div
            onClick={() => setSelectedMaterial('class4')}
            className={`bg-white rounded-2xl border p-5 transition-all cursor-pointer flex flex-col justify-between ${
              selectedMaterial === 'class4'
                ? 'border-red-600 shadow-md ring-2 ring-red-600/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase text-red-600">Class 4 IR</span>
                <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                  -25% Ins. Off
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900">CertainTeed Grand Manor®</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Heavyweight 425 lb slate-profile designer shingle with SBS polymer core and certified UL 2218 Class 4 impact resistance.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>UL 2218 Class 4 Certified</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Authentic Slate Appearance</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Up to 25% Texas Rebate</span>
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-red-600">
              {selectedMaterial === 'class4' ? 'Selected ✓' : 'Select Spec &rarr;'}
            </div>
          </div>

          {/* Card 3: Standing Seam Metal */}
          <div
            onClick={() => setSelectedMaterial('metal')}
            className={`bg-white rounded-2xl border p-5 transition-all cursor-pointer flex flex-col justify-between ${
              selectedMaterial === 'metal'
                ? 'border-red-600 shadow-md ring-2 ring-red-600/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase text-purple-600">Concealed</span>
                <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                  50+ Year Life
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900">Standing Seam Metal</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Architectural 24-gauge concealed fastener panels with raised seams that shed pine needles, snow, and rain effortlessly.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>140+ MPH Wind Uplift</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Class A Fire Rating</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Kynar 500® Finishes</span>
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-red-600">
              {selectedMaterial === 'metal' ? 'Selected ✓' : 'Select Spec &rarr;'}
            </div>
          </div>

          {/* Card 4: Natural Quarried Slate */}
          <div
            onClick={() => setSelectedMaterial('slate')}
            className={`bg-white rounded-2xl border p-5 transition-all cursor-pointer flex flex-col justify-between ${
              selectedMaterial === 'slate'
                ? 'border-red-600 shadow-md ring-2 ring-red-600/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase text-amber-700">Luxury Stone</span>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
                  100+ Year Life
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900">Natural Quarried Slate</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hand-split Vermont &amp; Buckingham natural stone tiles installed with solid copper flashings for multi-generational durability.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>ASTM C406 S1 Grade</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>100% Non-Combustible</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Copper Valleys &amp; Nails</span>
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-red-600">
              {selectedMaterial === 'slate' ? 'Selected ✓' : 'Select Spec &rarr;'}
            </div>
          </div>

          {/* Card 5: Mediterranean Tile */}
          <div
            onClick={() => setSelectedMaterial('tile')}
            className={`bg-white rounded-2xl border p-5 transition-all cursor-pointer flex flex-col justify-between ${
              selectedMaterial === 'tile'
                ? 'border-red-600 shadow-md ring-2 ring-red-600/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase text-amber-600">Thermal Deflection</span>
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                  50–100 Yrs
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900">Clay &amp; Concrete Tile</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Spanish barrel and interlocking concrete tiles providing natural convective air barriers to keep attics significantly cooler.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>130–150 MPH Fastened</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Cuts Attic Temps 20°F+</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Impervious to Rot/Pests</span>
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-red-600">
              {selectedMaterial === 'tile' ? 'Selected ✓' : 'Select Spec &rarr;'}
            </div>
          </div>
        </div>
      </section>

      {/* Primary CTA Band */}
      <section className="bg-slate-900 text-white py-14 px-4 sm:px-6 mt-12 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="text-xs uppercase tracking-wider text-red-400 font-bold">
            Precision Estimating • Complete Transparency
          </span>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
            Schedule Your Roof Replacement Consultation
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Get an exact, written proposal based on ROOFR satellite measurements and physical deck inspection. Serving Texarkana, Longview, Tyler, Paris, and all Northeast Texas.
          </p>
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onOpenIntake('REPLACEMENT')}
              className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-colors cursor-pointer"
            >
              SCHEDULE REPLACEMENT CONSULTATION
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
