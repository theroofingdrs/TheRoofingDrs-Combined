import React from 'react';
import { SeoHead } from '../../common/SeoHead.tsx';
import {
  FileCheck2,
  Users2,
  AlertTriangle,
  CheckCircle2,
  Check,
  CalendarCheck,
  PhoneCall,
  ShieldCheck,
  Camera,
  ClipboardList,
  Scale,
  Clock,
  ArrowRight,
  HelpCircle,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface InsuranceClaimsPageProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenIntake: (type?: 'DIAGNOSTIC' | 'STORM' | 'EMERGENCY' | 'REPLACEMENT') => void;
}

export const InsuranceClaimsPage: React.FC<InsuranceClaimsPageProps> = ({
  currentPath,
  onNavigate,
  onOpenIntake,
}) => {
  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 pb-20">
      <SeoHead
        title="Insurance Claim Guidance & Adjuster Scope Support | The Roof Doctors"
        description="Navigate storm damage roof insurance claims in Northeast Texas with forensic documentation. We meet your insurance adjuster on the roof to verify complete damage scopes."
        canonicalPath={currentPath}
        schemaJson={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          serviceType: 'Storm Damage Roof Insurance Claim Consultation & Documentation',
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

      {/* Hero: Guidance & Adjuster Collaboration Focused */}
      <section className="bg-slate-900 text-white relative py-16 px-4 sm:px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-wide">
              <FileCheck2 className="w-4 h-4 text-amber-400" />
              <span>Objective Scope Verification • Texas HB 2102 Compliant</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
              Navigating Storm Insurance Claims. <br />
              <span className="text-red-500">Forensic Proof For Your Carrier.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Filing an insurance claim after a severe Texas hail or wind storm shouldn’t feel like an adversarial battle. We provide the certified photo documentation, 10x10 chalk test square counts, and building code line-item verifications required by insurance adjusters—ensuring legitimate storm damage is never overlooked.
            </p>

            <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-300 pt-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
                <span>Adjuster-Ready Photo Packets</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
                <span>We Meet With Your Adjuster On The Roof</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
                <span>Line-Item Xactimate Scope Verification</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => onOpenIntake('STORM')}
                className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 text-center"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>SCHEDULE CLAIM INSPECTION ($0 FEE)</span>
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
                Texas HB 2102 Consumer Notice
              </div>
              <h3 className="text-lg font-bold text-white">
                Legal &amp; Ethical Deductible Compliance
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Under Texas Insurance Code Chapter 707, it is a crime for any contractor to pay, waive, rebate, or promise to absorb a homeowner’s insurance deductible.
              </p>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 space-y-2">
                <p>
                  Beware of fly-by-night storm chasers offering "free roofs" by inflating estimates or hiding deductibles.
                </p>
                <p className="text-emerald-400 font-semibold">
                  The Roof Doctors operates with 100% legal integrity, protecting you from insurance fraud audits and policy cancellation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Major Differentiator: WE MEET WITH YOUR ADJUSTER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="max-w-3xl space-y-5 relative z-10">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase bg-red-600 text-white">
              Major Industry Differentiator
            </span>

            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
              We Meet With Your Insurance Adjuster Directly On Your Roof
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Insurance adjusters often inspect 4 to 6 properties a day following a widespread storm. On steep slopes or two-story homes, an adjuster working alone may only inspect from a ladder edge or document a single slope—missing hundreds of hail bruises, damaged copper valleys, or detached ridge vents.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                <strong className="text-white block font-bold text-sm">Physical Roof Access</strong>
                <p className="text-slate-400 leading-relaxed">
                  We walk every slope alongside the adjuster, ensuring safe access to high-pitch dormers and difficult elevations.
                </p>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                <strong className="text-white block font-bold text-sm">Shared Test Squares</strong>
                <p className="text-slate-400 leading-relaxed">
                  We review our pre-marked 10x10 chalk squares together so both parties agree on physical impact counts before leaving the site.
                </p>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                <strong className="text-white block font-bold text-sm">Building Code Requirements</strong>
                <p className="text-slate-400 leading-relaxed">
                  We verify that municipal building code requirements (such as drip edge, ice barrier, and ventilation) are included in the adjuster’s initial scope.
                </p>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => onOpenIntake('STORM')}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl cursor-pointer transition-colors shadow-md"
              >
                REQUEST ADJUSTER MEETING SUPPORT &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* The Tripartite Roles: Homeowner, Contractor, Adjuster */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-wider text-red-600 font-bold">
            Transparent Collaboration
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight mt-1">
            Understanding Everyone’s Role in the Claim
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            A successful claim relies on clear boundaries and honest professional representation. We do not act as public adjusters or promise coverage, but we ensure the physical facts are undeniable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Homeowner Role */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center">
              <Users2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">The Homeowner's Role</h3>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Files the initial claim with the insurance carrier and receives the claim number.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Selects the licensed roofing contractor of their choice (you are not required to use an insurance company’s preferred network).</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Pays their legally mandated policy deductible directly to the chosen contractor upon project completion.</span>
              </li>
            </ul>
          </div>

          {/* Adjuster Role */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 font-bold flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">The Adjuster's Role</h3>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Represents the insurance carrier to evaluate storm-related damage against policy coverage limits.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Prepares the initial scope of loss using industry pricing databases such as Xactimate.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Authorizes actual cash value (ACV) and replacement cost value (RCV) claim payment disbursements.</span>
              </li>
            </ul>
          </div>

          {/* Contractor Role */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 font-bold flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">The Roof Doctors' Role</h3>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>Conducts a pre-claim forensic 21-point physical roof audit with 10x10 chalk squares.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>Meets the adjuster on-site, climbs the roof, and verifies all damaged elevations and flashings.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>Installs the warranted replacement system strictly matching approved scope specifications and local building code.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Storm Damage vs Normal Wear & Tear */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs">
          <div className="max-w-3xl mb-8">
            <span className="text-xs uppercase tracking-wider text-red-600 font-bold">
              Forensic Differentiation
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight mt-1">
              Storm Damage vs. Normal Shingle Wear &amp; Tear
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Insurance adjusters are trained to differentiate between acute storm impacts and deferred homeowner maintenance. Here is how our diagnostic inspectors substantiate legitimate covered losses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-600" />
                <span>Covered Storm Damage Characteristics:</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                <li>&bull; Random, omni-directional circular bruising patterns matching collateral hail marks on metal vents.</li>
                <li>&bull; Fresh fiberglass mat fractures where asphalt feels soft or spongy to the touch underneath the depression.</li>
                <li>&bull; Clean, sharp horizontal creasing across shingle tabs caused by sudden wind uplift.</li>
                <li>&bull; Impact punctures accompanied by broken tree branches or flying debris.</li>
              </ul>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Normal Aging &amp; Wear Characteristics:</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                <li>&bull; Uniform, widespread granule loss along gutter drip lines caused by 20+ years of rainfall abrasion.</li>
                <li>&bull; Vertical crazing and cracking caused by thermal shrinkage and drying of the asphalt binder.</li>
                <li>&bull; Blistering caused by trapped moisture gas bubbles during manufacturing or poor attic ventilation.</li>
                <li>&bull; Surface algae and moss growth due to persistent shade from overhanging trees.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Step-by-Step Claims Timeline */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-3xl mb-10">
          <span className="text-xs uppercase tracking-wider text-red-600 font-bold">
            Step-by-Step Roadmap
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight mt-1">
            The 6-Step Insurance Claim Lifecycle
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            What to expect from initial storm discovery to final completion certificate and depreciation release.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
            <span className="text-xs font-black text-red-600 uppercase">Step 1</span>
            <h4 className="font-bold text-slate-900 text-sm">Free Diagnostic Storm Walk</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              We perform a comprehensive 21-point inspection to verify if hail hits or creased shingles meet carrier thresholds before you file.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
            <span className="text-xs font-black text-red-600 uppercase">Step 2</span>
            <h4 className="font-bold text-slate-900 text-sm">Claim Filing with Carrier</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              You contact your insurance company to report the date of loss. We provide our photo packet for you to attach to the claim.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
            <span className="text-xs font-black text-red-600 uppercase">Step 3</span>
            <h4 className="font-bold text-slate-900 text-sm">Adjuster On-Roof Meeting</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our certified project manager climbs the roof with your adjuster, pointing out chalk test squares and collateral damage.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
            <span className="text-xs font-black text-red-600 uppercase">Step 4</span>
            <h4 className="font-bold text-slate-900 text-sm">Scope Review &amp; Supplements</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              We review the adjuster’s Xactimate estimate. If code items like drip edge or valley metal were omitted, we submit documented supplements.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
            <span className="text-xs font-black text-red-600 uppercase">Step 5</span>
            <h4 className="font-bold text-slate-900 text-sm">Precision Roof Installation</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              We complete the reroofing project adhering to 130 MPH high-wind specifications, continuous ventilation, and property cleanup.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
            <span className="text-xs font-black text-red-600 uppercase">Step 6</span>
            <h4 className="font-bold text-slate-900 text-sm">Certificate of Completion</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              We send final invoices, building permits, and completion photos to your insurer so they release your withheld recoverable depreciation.
            </p>
          </div>
        </div>
      </section>

      {/* Primary CTA Band */}
      <section className="bg-slate-900 text-white py-14 px-4 sm:px-6 mt-12 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="text-xs uppercase tracking-wider text-red-400 font-bold">
            Objective Proof • Peace of Mind
          </span>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
            Schedule a Storm Damage Claim Consultation
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Get an objective, certified assessment before meeting your adjuster. Serving Bowie, Cass, Titus, Lamar, Gregg, Smith, and Harrison Counties.
          </p>
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onOpenIntake('STORM')}
              className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-colors cursor-pointer"
            >
              SCHEDULE CLAIM CONSULTATION
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
