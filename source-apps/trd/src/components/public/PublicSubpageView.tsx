import React, { useState } from 'react';
import { SeoHead } from '../common/SeoHead.tsx';
import {
  ChevronRight,
  ShieldAlert,
  CalendarCheck,
  PhoneCall,
  AlertTriangle,
} from 'lucide-react';

import { StormDamagePage } from './pages/StormDamagePage.tsx';
import { RoofRepairPage } from './pages/RoofRepairPage.tsx';
import { RoofReplacementPage } from './pages/RoofReplacementPage.tsx';
import { InsuranceClaimsPage } from './pages/InsuranceClaimsPage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { GalleryPage } from './pages/GalleryPage.tsx';
import { ServicesPage } from './pages/ServicesPage.tsx';
import { ServiceAreasPage } from './pages/ServiceAreasPage.tsx';
import { CityPage } from './pages/CityPage.tsx';
import { RoofInspectionPage } from './pages/RoofInspectionPage.tsx';
import { RoofingSystemsPage } from './pages/RoofingSystemsPage.tsx';
import { ContactPage } from './pages/ContactPage.tsx';
import { FaqSection, getFaqPageSchema } from './FaqSection.tsx';
import { PublicFooter } from './PublicFooter.tsx';

interface PublicSubpageViewProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenIntake: (type?: 'DIAGNOSTIC' | 'STORM' | 'EMERGENCY' | 'REPLACEMENT') => void;
}

export const PublicSubpageView: React.FC<PublicSubpageViewProps> = ({
  currentPath,
  onNavigate,
  onOpenIntake,
}) => {
  // State for Interactive Tools (Roof Problem Finder & Cost Estimator)
  const [problemCategory, setProblemCategory] = useState<string>('leak');
  const [roofAge, setRoofAge] = useState<string>('10_15');
  const [homeSqFt, setHomeSqFt] = useState<number>(2400);
  const [pitch, setPitch] = useState<'standard' | 'steep'>('standard');
  const [material, setMaterial] = useState<
    'architectural' | 'impact_resistant' | 'metal' | 'slate' | 'tile'
  >('architectural');

  // Breadcrumb generator for standard pages
  const pathSegments = currentPath.split('/').filter(Boolean);
  const breadcrumbs = [
    { label: 'Home', path: '/' },
    ...pathSegments.map((seg, idx) => {
      const fullPath = '/' + pathSegments.slice(0, idx + 1).join('/');
      const label = seg
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      return { label, path: fullPath };
    }),
  ];

  // 0. FAQ & KNOWLEDGE BASE (Google People Also Ask Target)
  if (currentPath === '/faq') {
    return (
      <div className="flex-1 flex flex-col">
        <SeoHead
          title="Frequently Asked Roofing Questions — The Roof Doctors"
          description="Straightforward answers to the most common customer questions about Texas HB 2102 deductible law, hail damage detection, roof replacement cost, and free 21-point diagnostics."
          canonicalPath="/faq"
          schemaJson={getFaqPageSchema()}
        />

        {/* Hero Banner */}
        <div className="bg-slate-900 text-white py-14 px-4 sm:px-6 border-b border-slate-800">
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300">
              <span>Homeowner Guidance &bull; Texas Statutory Compliance</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">
              Roofing FAQ &amp; Knowledge Base
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              Objective, forensic answers to help Texarkana and Northeast Texas homeowners understand hail damage, insurance adjuster meetings, Texas deductible laws, and replacement pricing.
            </p>
          </div>
        </div>

        <FaqSection onOpenIntake={onOpenIntake} />
        <PublicFooter onNavigate={onNavigate} />
      </div>
    );
  }

  // 1. STORM DAMAGE & RESTORATION (Hail, Wind, Tree, Safety Checklist, Emergency)
  if (currentPath.startsWith('/storm-damage')) {
    return (
      <StormDamagePage
        currentPath={currentPath}
        onNavigate={onNavigate}
        onOpenIntake={onOpenIntake}
      />
    );
  }

  // 2. ROOF REPAIR & LEAK MITIGATION
  if (
    currentPath === '/roofing/roof-repair' ||
    currentPath === '/roofing/emergency-roof-repair' ||
    currentPath === '/roof-problems'
  ) {
    return (
      <RoofRepairPage
        currentPath={currentPath}
        onNavigate={onNavigate}
        onOpenIntake={onOpenIntake}
      />
    );
  }

  // 3. ROOF REPLACEMENT & REROOFING COST
  if (
    currentPath === '/roofing/roof-replacement' ||
    currentPath === '/roofing-cost'
  ) {
    return (
      <RoofReplacementPage
        currentPath={currentPath}
        onNavigate={onNavigate}
        onOpenIntake={onOpenIntake}
      />
    );
  }

  // 4. 21-POINT FORENSIC ROOF INSPECTION
  if (currentPath === '/roofing/roof-inspection') {
    return (
      <RoofInspectionPage
        currentPath={currentPath}
        onNavigate={onNavigate}
        onOpenIntake={onOpenIntake}
      />
    );
  }

  // 5. ROOFING SYSTEMS & MATERIAL COMPARISON
  if (currentPath === '/roofing-systems') {
    return (
      <RoofingSystemsPage
        currentPath={currentPath}
        onNavigate={onNavigate}
        onOpenIntake={onOpenIntake}
      />
    );
  }

  // 6. INSURANCE CLAIM ASSISTANCE & ADJUSTER SUPPORT
  if (currentPath.startsWith('/insurance-claims')) {
    return (
      <InsuranceClaimsPage
        currentPath={currentPath}
        onNavigate={onNavigate}
        onOpenIntake={onOpenIntake}
      />
    );
  }

  // 7. ABOUT THE ROOF DOCTORS & PHILOSOPHY
  if (currentPath === '/about') {
    return (
      <AboutPage
        currentPath={currentPath}
        onNavigate={onNavigate}
        onOpenIntake={onOpenIntake}
      />
    );
  }

  // 8. PROJECT GALLERY, CASE STUDIES & REVIEWS
  if (
    currentPath === '/gallery' ||
    currentPath === '/projects' ||
    currentPath === '/reviews'
  ) {
    return (
      <GalleryPage
        currentPath={currentPath}
        onNavigate={onNavigate}
        onOpenIntake={onOpenIntake}
      />
    );
  }

  // 9. SERVICE AREAS: REGIONAL DIRECTORY OR INDIVIDUAL CITY PAGE
  if (currentPath === '/service-areas') {
    return (
      <ServiceAreasPage
        currentPath={currentPath}
        onNavigate={onNavigate}
        onOpenIntake={onOpenIntake}
      />
    );
  }

  if (currentPath.startsWith('/service-areas/')) {
    const citySlug = pathSegments[1] || 'texarkana';
    return (
      <CityPage
        citySlug={citySlug}
        onNavigate={onNavigate}
        onOpenIntake={onOpenIntake}
      />
    );
  }

  // 10. SERVICES DIRECTORY
  if (
    currentPath === '/roofing' ||
    currentPath === '/services' ||
    currentPath === '/roofing/roof-maintenance'
  ) {
    return (
      <ServicesPage
        currentPath={currentPath}
        onNavigate={onNavigate}
        onOpenIntake={onOpenIntake}
      />
    );
  }

  // 11. CONTACT & DIRECT DISPATCH HUB
  if (currentPath === '/contact') {
    return (
      <ContactPage
        currentPath={currentPath}
        onNavigate={onNavigate}
        onOpenIntake={onOpenIntake}
      />
    );
  }

  // 12. INTERACTIVE TOOLS (Problem Finder & Cost Estimator)
  if (
    currentPath === '/tools/roof-problem-finder' ||
    currentPath === '/tools/roof-cost-estimator'
  ) {
    const isProblemFinder = currentPath === '/tools/roof-problem-finder';
    const pageTitle = isProblemFinder
      ? 'Interactive Roof Problem Finder | The Roof Doctors'
      : 'Roof Replacement Cost Guide & Estimator | The Roof Doctors';
    const pageDesc = isProblemFinder
      ? 'Diagnose roof symptoms, identify leak origins, and determine if an emergency inspection is required.'
      : 'Transparent price factor guide explaining roofing squares, pitch difficulty, material grades, and Texas deductible laws.';

    return (
      <div className="bg-slate-50 min-h-screen text-slate-900 pb-20">
        <SeoHead
          title={pageTitle}
          description={pageDesc}
          canonicalPath={currentPath}
        />

        {/* Breadcrumb Header Bar */}
        <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-slate-500 overflow-x-auto whitespace-nowrap">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.path}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                {idx === breadcrumbs.length - 1 ? (
                  <span className="font-bold text-slate-900">{crumb.label}</span>
                ) : (
                  <button
                    onClick={() => onNavigate(crumb.path)}
                    className="hover:text-red-600 transition-colors cursor-pointer"
                  >
                    {crumb.label}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Subpage Hero Banner */}
        <section className="bg-slate-900 text-white py-12 px-4 sm:px-6 border-b border-slate-800">
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-950 text-red-400 border border-red-800">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Interactive Diagnostic Tool</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight">
              {pageTitle.split('|')[0].trim()}
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
              {pageDesc}
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => onOpenIntake('DIAGNOSTIC')}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>BOOK 21-POINT INSPECTION</span>
              </button>
              <a
                href="tel:9032315940"
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-lg flex items-center gap-2 transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>CALL 903-231-5940</span>
              </a>
            </div>
          </div>
        </section>

        {/* Main Content Body */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
          {isProblemFinder ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-900">
                  Interactive Diagnostic Problem Finder
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Select your symptoms to receive an objective preliminary assessment and recommended next steps.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Step 1 */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    1. Primary Observed Symptom
                  </label>
                  <div className="space-y-2 text-xs">
                    {[
                      { id: 'leak', label: 'Active Water Dripping or Ceiling Stain' },
                      { id: 'shingle', label: 'Missing, Blown-Off, or Damaged Shingles' },
                      { id: 'hail', label: 'Recent Hail / Wind Storm in Area' },
                      { id: 'granules', label: 'Excess Granules in Gutters / Downspouts' },
                      { id: 'age', label: 'Roof Age Exceeding 15-20 Years' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setProblemCategory(opt.id)}
                        className={`w-full p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          problemCategory === opt.id
                            ? 'bg-red-50 border-red-500 text-red-900 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 2 */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    2. Approximate Roof Age
                  </label>
                  <div className="space-y-2 text-xs">
                    {[
                      { id: 'under_5', label: 'Under 5 Years (Modern Installation)' },
                      { id: '5_10', label: '5 to 10 Years Old' },
                      { id: '10_15', label: '10 to 15 Years (Mid-Lifespan)' },
                      { id: 'over_15', label: 'Over 15+ Years (Near End of Life)' },
                      { id: 'unknown', label: 'Unknown / Inherited with Home' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setRoofAge(opt.id)}
                        className={`w-full p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          roofAge === opt.id
                            ? 'bg-red-50 border-red-500 text-red-900 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 3: Diagnostic Assessment */}
                <div className="bg-slate-900 text-white rounded-xl p-5 space-y-4 border border-slate-800">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-red-400">
                    Diagnostic Assessment
                  </div>

                  <div className="space-y-2 text-xs">
                    {problemCategory === 'leak' ? (
                      <div>
                        <h4 className="font-bold text-white text-sm">Targeted Penetration Repair Likely</h4>
                        <p className="text-slate-300 mt-1 leading-relaxed">
                          90% of active leaks stem from pipe collar gaskets, step flashing, or chimney counterflashing rather than entire field failure.
                        </p>
                        <div className="mt-2 text-amber-400 font-semibold">
                          Urgency: Immediate Tarp / Repair Recommended.
                        </div>
                      </div>
                    ) : problemCategory === 'hail' ? (
                      <div>
                        <h4 className="font-bold text-white text-sm">Hail Impact Verification Required</h4>
                        <p className="text-slate-300 mt-1 leading-relaxed">
                          Hail bruises fracture fiberglass mats underneath granule surface. Requires a 10x10 physical test square inspection.
                        </p>
                        <div className="mt-2 text-blue-400 font-semibold">
                          Action: Free 21-Point Insurance Scope Diagnostic.
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-bold text-white text-sm">Preventative Maintenance &amp; Seal Walk</h4>
                        <p className="text-slate-300 mt-1 leading-relaxed">
                          Granule loss and weathered shingles require decking checks and thermal seal evaluation to prevent wind-lift damage.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <button
                      onClick={() => onOpenIntake('DIAGNOSTIC')}
                      className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg text-center cursor-pointer transition-colors"
                    >
                      Schedule Diagnostic Walk Now &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-900">
                  Transparent Replacement Cost Guide &amp; Factors
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Roofing estimates are based on roof surface area (Squares = 100 sq ft), roof pitch, layers of tear-off, and material grade.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-5 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Approximate Living Area Footprint: <span className="text-red-600 font-black">{homeSqFt} sq ft</span>
                    </label>
                    <input
                      type="range"
                      min="1000"
                      max="5000"
                      step="100"
                      value={homeSqFt}
                      onChange={(e) => setHomeSqFt(Number(e.target.value))}
                      className="w-full accent-red-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>1,000 sq ft</span>
                      <span>3,000 sq ft</span>
                      <span>5,000 sq ft</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Roof Pitch / Slope</label>
                      <select
                        value={pitch}
                        onChange={(e: any) => setPitch(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                      >
                        <option value="standard">Standard Pitch (4/12 - 7/12)</option>
                        <option value="steep">Steep Pitch (8/12+ / Two-Story)</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Material Specification</label>
                      <select
                        value={material}
                        onChange={(e: any) => setMaterial(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                      >
                        <option value="architectural">Architectural Laminated Shingles</option>
                        <option value="impact_resistant">CertainTeed Grand Manor® Class 4 Luxury</option>
                        <option value="metal">Standing Seam Metal (Concealed Fastener)</option>
                        <option value="slate">Natural Quarried Slate (Heirloom Stone)</option>
                        <option value="tile">Clay &amp; Concrete Tile (Mediterranean)</option>
                      </select>
                    </div>
                  </div>

                  {/* Statutory Warning Box */}
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-950">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Texas HB 2102 Deductible Compliance Notice:</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Under Texas Insurance Code Chapter 707, it is a crime for any roofing contractor to waive, absorb, rebate, or promise to pay a homeowner’s insurance deductible. We assist with honest adjuster scope verification, but adhere strictly to Texas state law.
                    </p>
                  </div>
                </div>

                {/* Calculated Square Breakdown */}
                <div className="lg:col-span-5 bg-slate-900 text-white rounded-2xl p-6 space-y-4 border border-slate-800">
                  <span className="text-[11px] uppercase font-bold text-red-400">
                    Estimated Aerial Dimensions
                  </span>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Estimated Roof Squares:</span>
                      <span className="font-mono font-bold text-white">
                        ~{Math.round((homeSqFt * 1.35) / 100)} Squares ({(homeSqFt * 1.35).toFixed(0)} sq ft)
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Underlayment Spec:</span>
                      <span className="font-semibold text-white">Synthetic 100% Breathable</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Ventilation Balance:</span>
                      <span className="font-semibold text-white">Continuous Ridge Vent + Soffits</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Measurement Source:</span>
                      <span className="text-emerald-400 font-bold">ROOFR Satellite Available</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-[11px] text-slate-400 italic mb-3">
                      *Exact pricing requires our free physical roof diagnostic walk to measure hips, ridges, and inspect decking condition.
                    </p>
                    <button
                      onClick={() => onOpenIntake('REPLACEMENT')}
                      className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-md text-center"
                    >
                      Request Exact On-Site Diagnostic Estimate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // Fallback to Services Directory
  return (
    <ServicesPage
      currentPath={currentPath}
      onNavigate={onNavigate}
      onOpenIntake={onOpenIntake}
    />
  );
};
