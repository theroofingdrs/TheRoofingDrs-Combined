import React from 'react';
import { SeoHead } from '../../common/SeoHead.tsx';
import {
  ShieldCheck,
  Award,
  Users,
  HeartHandshake,
  PhoneCall,
  CalendarCheck,
  CheckCircle2,
  MapPin,
  Sparkles,
  Target,
  FileSpreadsheet,
  GraduationCap,
  Hammer,
} from 'lucide-react';

interface AboutPageProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenIntake: (type?: 'DIAGNOSTIC' | 'STORM' | 'EMERGENCY' | 'REPLACEMENT') => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  currentPath,
  onNavigate,
  onOpenIntake,
}) => {
  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 pb-20">
      <SeoHead
        title="About The Roof Doctors | Forensic Roofing Standards in Northeast Texas"
        description="Learn the story of The Roof Doctors. Founded to replace high-pressure sales tactics with honest diagnostic precision, certified craftsmanship, and community integrity."
        canonicalPath={currentPath}
        schemaJson={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          mainEntity: {
            '@type': 'RoofingContractor',
            name: 'The Roof Doctors',
            telephone: '+1-903-231-5940',
            email: 'TheRoofingDrs@gmail.com',
            url: 'https://www.TheRoofingDrs.com',
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

      {/* Hero: Story, Heritage & Trust */}
      <section className="bg-slate-900 text-white relative py-16 px-4 sm:px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-red-600/20 text-red-400 border border-red-500/30 uppercase tracking-wide">
              <HeartHandshake className="w-4 h-4 text-red-400" />
              <span>Diagnostic Integrity • Northeast Texas Roots</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
              Built on Forensic Truth. <br />
              <span className="text-red-500">Not Sales Pressure.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              The Roof Doctors was founded on a simple conviction: homeowners deserve an objective, medical-grade diagnostic examination of their roof before anyone attempts to sell them a $20,000 replacement. We approach every residential property as a building science case study—diagnosing root causes, repairing what is salvageable, and delivering lifetime reroofing systems when needed.
            </p>

            <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-300 pt-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero High-Pressure Sales Quotas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Certified Master Shingle Applicators</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Year-Round Local Presence Across Ark-La-Tex</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => onNavigate('/contact')}
                className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 text-center"
              >
                <Users className="w-4 h-4" />
                <span>CONNECT WITH OUR LEADERSHIP</span>
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
            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="h-52 relative overflow-hidden">
                <img
                  src="/assets/images/roof_inspection_walk.jpg"
                  alt="The Roof Doctors certified inspection technician conducting forensic roof health assessment"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-4 bg-red-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded">
                  Texarkana Diagnostics
                </span>
              </div>
              <div className="p-6 space-y-3 text-xs">
                <h3 className="font-bold text-white text-base">The Lifetime Roof Health Record</h3>
                <p className="text-slate-300 leading-relaxed">
                  Just as your personal physician maintains clinical health charts, we maintain a permanent digital record of your home's roof deck condition, previous storm dates, and repair history.
                </p>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-slate-400 text-[11px]">
                  <span>Office: 1420 Richmond Rd, Texarkana</span>
                  <span>Direct: 903-231-5940</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Founding Story: Why We Were Created */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-12 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <span className="text-xs uppercase tracking-wider text-red-600 font-bold">
                Our Genesis
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
                Why The Roof Doctors Was Founded
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                For years, severe weather across Northeast Texas brought waves of transient, out-of-state "storm chasers." These door-to-door sales crews signed up dozens of homeowners, subcontracted the work to the lowest bidder, and vanished before the first warranty claim arrived.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Meanwhile, traditional roofing companies often refused to perform surgical repairs—telling a family with a simple $350 plumbing boot leak that they needed an entire $18,000 roof replacement.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium text-slate-800">
                The Roof Doctors was formed to provide an ethical alternative: a team of certified building science practitioners who inspect roofs with forensic neutrality. If a repair is all your home needs, that is exactly what we recommend. If storm damage warrants a full insurance replacement, we supply verifiable evidence.
              </p>
            </div>

            <div className="lg:col-span-5 bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-red-600" />
                <span>Our Core Operating Guarantees</span>
              </h3>
              <div className="space-y-3 text-xs text-slate-700">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <strong className="text-slate-900 block font-bold">1. Truth in Diagnosis</strong>
                  <span>We never manufacture storm damage or exaggerate minor wear to force an unnecessary claim.</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <strong className="text-slate-900 block font-bold">2. Property Protection Protocol</strong>
                  <span>We protect your landscaping with tarping and run continuous magnetic nail sweeps on every site.</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <strong className="text-slate-900 block font-bold">3. Accountability Across Generations</strong>
                  <span>We are locally rooted in Texarkana, Longview, and Tyler, with a permanent office you can visit.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications & Continuing Education */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-wider text-red-600 font-bold">
            Technical Mastery
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight mt-1">
            Certifications &amp; Continuing Education
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Roofing standards evolve rapidly. Our project managers and installation crews undergo rigorous continuous training.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">CertainTeed &amp; Owens Corning Certified</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Certified in Master Shingle Applicator guidelines, ensuring all ventilation calculations and enhanced nail patterns qualify for non-prorated manufacturer system warranties.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Forensic Damage Assessment Training</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Trained in Haag Engineering methodology for identifying true kinetic hail depression versus manufacturing blisters, mechanical marring, and foot traffic scuffs.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">OSHA Steep-Slope Safety Compliance</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Strict adherence to fall protection, harness systems, and safety tie-offs. Fully insured with comprehensive General Liability and Workers' Compensation coverage.
            </p>
          </div>
        </div>
      </section>

      {/* How We Treat Homeowners and Their Property */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-10 border border-slate-800">
          <div className="max-w-3xl space-y-4 mb-8">
            <span className="text-xs uppercase tracking-wider text-red-400 font-bold">
              The Homeowner Experience
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              How We Treat You and Your Property
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              A roofing project shouldn't leave your flowerbeds ruined or your tires punctured by stray nails. We treat your property with the respect of a master craftsman.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <strong className="text-white block font-bold">Air Conditioner Armor</strong>
              <p className="text-slate-400 leading-relaxed">
                Plywood shields are placed over condenser fins to prevent falling shingles from damaging heat coils.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <strong className="text-white block font-bold">Landscaping Tarps</strong>
              <p className="text-slate-400 leading-relaxed">
                Heavy-duty mesh covers protect shrubs, rose bushes, and decorative plants from shingle tear-off dust.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <strong className="text-white block font-bold">Multi-Pass Magnet Sweep</strong>
              <p className="text-slate-400 leading-relaxed">
                Our team walks high-powered rolling magnets through driveways, sidewalks, and turf to collect stray fasteners.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <strong className="text-white block font-bold">Dedicated On-Site Manager</strong>
              <p className="text-slate-400 leading-relaxed">
                An English-speaking project supervisor remains on your property throughout the entire installation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Primary CTA Band */}
      <section className="bg-slate-900 text-white py-14 px-4 sm:px-6 mt-12 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="text-xs uppercase tracking-wider text-red-400 font-bold">
            Honest Advice • Diagnostic Certainty
          </span>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
            Meet The Roof Doctors Team
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Ready to experience roofing with zero pressure? Contact our team at 1420 Richmond Rd, Texarkana, TX, or schedule an inspection online.
          </p>
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('/contact')}
              className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-colors cursor-pointer"
            >
              CONTACT OUR LOCAL TEAM
            </button>
            <a
              href="tel:9032315940"
              className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>DIRECT: 903-231-5940</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
