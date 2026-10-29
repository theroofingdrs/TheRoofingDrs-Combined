import React, { useState, useEffect } from 'react';
import { BrandLogo } from '../components/common/BrandLogo.tsx';
import { SeoHead } from '../components/common/SeoHead.tsx';
import { PublicSubpageView } from '../components/public/PublicSubpageView.tsx';
import { PublicHeader } from '../components/public/PublicHeader.tsx';
import { PublicFooter } from '../components/public/PublicFooter.tsx';
import { InspectionRequestModal } from '../components/public/InspectionRequestModal.tsx';
import { FaqSection, getFaqPageSchema } from '../components/public/FaqSection.tsx';
import { api } from '../lib/api.ts';
import type { Service, ServiceArea, FAQ, Resource, RoofingSystem, ProblemType } from '../../shared/types/index.ts';
import {
  ShieldAlert,
  PhoneCall,
  CalendarCheck,
  CheckCircle,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  HelpCircle,
  BookOpen,
  CloudLightning,
  ChevronRight,
  ShieldCheck,
  FileCheck2,
  Wrench,
  SearchCheck,
  Camera,
  Maximize2,
  Eye,
  X,
} from 'lucide-react';

interface FeaturedPhoto {
  id: string;
  src: string;
  title: string;
  tag: string;
  location: string;
  description: string;
  specs: string;
}

const HOME_FEATURED_PHOTOS: FeaturedPhoto[] = [
  {
    id: 'photo-aerial',
    src: '/assets/images/aerial_roof_replacement.jpg',
    title: 'Aerial Drone Diagnostic & Active Replacement',
    tag: 'Drone Diagnostics',
    location: 'Texarkana, TX',
    description: 'High-altitude 90° bird’s-eye drone capture documenting synthetic underlayment installation, neat bundle staging on roof jacks, and comprehensive yard & gazebo protection tarps.',
    specs: 'Synthetic Underlayment • Drone Verified Alignment • 100% Perimeter Tarping',
  },
  {
    id: 'photo-stone',
    src: '/assets/images/stone_commercial_roof.jpg',
    title: 'Custom Stone & Heavy Timber Architecture',
    tag: 'Commercial & Estate',
    location: 'Mount Pleasant, TX',
    description: 'Distinctive stacked stone and brick architectural building with heavy timber cedar porch trusses, paired with freshly installed dark charcoal dimensional architectural shingles.',
    specs: 'Heavy Timber Trusses • Dimensional Charcoal Shingles • Architectural Flashings',
  },
  {
    id: 'photo-crew',
    src: '/assets/images/active_crew_reroof.jpg',
    title: 'Certified Roofing Mechanics in Action',
    tag: 'Active Field Operations',
    location: 'Tyler, TX',
    description: 'High-angle drone view of our certified installation crew executing a synchronized residential roof replacement, showing high-temp underlayment, staging jacks, and ground protection.',
    specs: 'Synchronized Crew Installation • High-Temp Underlayment • Full Property Shielding',
  },
  {
    id: 'photo-brick',
    src: '/assets/images/brick_estate_roof.jpg',
    title: 'Sprawling Texas Brick Ranch Residence',
    tag: 'Completed Installation',
    location: 'Longview, TX',
    description: 'Complete tear-off and replacement featuring lifetime architectural shingles, crisp hip ridges, clean valley transitions, and custom chimney step flashing on a classic Texas estate.',
    specs: 'Lifetime Architectural Shingles • Hip & Ridge Cap System • Precision Valley Flashing',
  },
];

interface PublicWebsiteViewProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export const PublicWebsiteView: React.FC<PublicWebsiteViewProps> = ({
  currentPath = '/',
  onNavigate = (_path: string) => {},
}) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'DIAGNOSTIC' | 'STORM' | 'EMERGENCY' | 'REPLACEMENT'>('DIAGNOSTIC');

  const [services, setServices] = useState<Service[]>([]);
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [systems, setSystems] = useState<RoofingSystem[]>([]);
  const [problems, setProblems] = useState<ProblemType[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedArea, setSelectedArea] = useState<ServiceArea | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<FeaturedPhoto | null>(null);

  useEffect(() => {
    // Load live content from verified API
    api.getServices().then((data) => {
      setServices(data);
      if (data.length > 0) setSelectedService(data[0]);
    }).catch(console.error);

    api.getServiceAreas().then((data) => {
      setServiceAreas(data);
      if (data.length > 0) setSelectedArea(data[0]);
    }).catch(console.error);

    api.getFaqs().then(setFaqs).catch(console.error);
    api.getResources().then(setResources).catch(console.error);
    api.getRoofingSystems().then(setSystems).catch(console.error);
    api.getProblemTypes().then(setProblems).catch(console.error);
  }, []);

  const openIntake = (type: 'DIAGNOSTIC' | 'STORM' | 'EMERGENCY' | 'REPLACEMENT' = 'DIAGNOSTIC') => {
    setModalType(type);
    setModalOpen(true);
  };

  // If viewing a sub-route (e.g. /roofing/*, /storm-damage/*, /tools/*, etc.), render subpage view
  if (currentPath && currentPath !== '/' && currentPath !== '') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-red-500 selection:text-white">
        {/* Navigation bar header */}
        <PublicHeader
          currentPath={currentPath}
          onNavigate={onNavigate}
          onOpenIntake={openIntake}
        />

        <PublicSubpageView
          currentPath={currentPath}
          onNavigate={onNavigate}
          onOpenIntake={openIntake}
        />

        {/* Verified Footer with Discreet Admin Login */}
        <PublicFooter onNavigate={onNavigate} />

        {/* Mobile Persistent Actions Bar (Call & Get My Roof Diagnosed) */}
        <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-2.5 z-40 lg:hidden flex items-center gap-2 shadow-lg">
          <a
            href="tel:9032315940"
            className="flex-1 py-3 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors text-center"
          >
            <PhoneCall className="w-4 h-4 text-emerald-400" />
            <span>CALL 903-231-5940</span>
          </a>
          <button
            onClick={() => openIntake('DIAGNOSTIC')}
            className="flex-1 py-3 px-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs text-center cursor-pointer"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>GET MY ROOF DIAGNOSED</span>
          </button>
        </div>

        {/* Diagnostic Intake Modal */}
        <InspectionRequestModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          defaultType={modalType}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-red-500 selection:text-white pb-16 lg:pb-0">
      <SeoHead
        title="The Roof Doctors — Residential Roofing & Storm Damage Specialists"
        description="Objective residential roof diagnostics, forensic storm damage inspections, and precision restoration across Northeast Texas. Free 21-point physical inspection."
        canonicalPath="/"
        schemaJson={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'RoofingContractor',
              name: 'The Roof Doctors',
              alternateName: 'The Roof Doctors — Residential Roofing & Storm Damage Specialists',
              telephone: '+1-903-231-5940',
              email: 'TheRoofingDrs@gmail.com',
              address: {
                '@type': 'PostalAddress',
                streetAddress: '1420 Richmond Rd',
                addressLocality: 'Texarkana',
                addressRegion: 'TX',
                postalCode: '75501',
                addressCountry: 'US',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: 33.4565,
                longitude: -94.0732,
              },
              areaServed: [
                'Texarkana',
                'Atlanta',
                'New Boston',
                'Paris',
                'Sulphur Springs',
                'Longview',
                'Tyler',
                'Marshall',
                'Mount Pleasant',
              ],
              priceRange: '$$',
            },
            getFaqPageSchema(),
          ],
        }}
      />
      {/* 1. Restored Primary Navigation Header */}
      <PublicHeader
        currentPath={currentPath}
        onNavigate={onNavigate}
        onOpenIntake={openIntake}
      />

      {/* 3. Hero Section: Diagnostic Precision */}
      <section className="relative bg-slate-900 text-white pt-14 pb-20 px-4 sm:px-6 overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300">
              <ShieldCheck className="w-4 h-4 text-red-500" />
              <span>Northeast Texas Residential Roofing &amp; Storm Damage Specialists</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight uppercase">
              Objective Roof Diagnostics. <br />
              <span className="text-red-500">Forensic Restoration.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
              We diagnose what’s actually happening on your roof. Utilizing forensic 21-point physical inspections and aerial precision data, we deliver honest answers—whether you need a targeted leak repair or full storm damage insurance restoration.
            </p>

            {/* Badges / Guarantees */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs font-medium text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>100% Free Diagnostics</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>ROOFR Satellite Precision</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>No High-Pressure Sales</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>Texas HB 2102 Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>Insurance Adjuster Scope Support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>Emergency Tarp Dispatch</span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4">
              <button
                onClick={() => openIntake('DIAGNOSTIC')}
                className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>GET MY ROOF DIAGNOSED</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => openIntake('STORM')}
                className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <CloudLightning className="w-4 h-4 text-amber-400" />
                <span>CHECK FOR STORM DAMAGE</span>
              </button>
            </div>
          </div>

          {/* Hero Quick Diagnostic Card */}
          <div className="lg:col-span-5 bg-white text-slate-900 rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-red-600 font-bold">
                  21-Point Health Audit
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Request Diagnostic Visit
                </h3>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-md border border-emerald-200">
                $0 No Fee
              </span>
            </div>

            <div className="py-4 space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0 font-bold text-[11px]">
                  1
                </div>
                <div>
                  <strong className="text-slate-900">Physical Walk &amp; Decking Check:</strong> We inspect shingle bond strength, hail indentations, and flashing seals.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0 font-bold text-[11px]">
                  2
                </div>
                <div>
                  <strong className="text-slate-900">Attic &amp; Moisture Analysis:</strong> Checking underside decking for active staining or improper airflow.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0 font-bold text-[11px]">
                  3
                </div>
                <div>
                  <strong className="text-slate-900">Digital Photo Record:</strong> Complete transparent photographic report provided directly to you.
                </div>
              </div>
            </div>

            <button
              onClick={() => openIntake('DIAGNOSTIC')}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Schedule Inspection (Free)</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="text-center mt-3 text-[11px] text-slate-500 flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Typical response within 2 business hours</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Diagnostic Services Section */}
      <section id="services" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-wider text-red-600 font-bold">
            Comprehensive Solutions
          </span>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mt-1">
            Engineered Roofing &amp; Diagnostics
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Every service is grounded in transparent diagnostic evaluations, high-grade architectural materials, and manufacturer-certified installation practices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-600 mb-4">
                  {service.slug === 'emergency-roof-repair' ? (
                    <ShieldAlert className="w-5 h-5" />
                  ) : service.slug === 'storm-damage' ? (
                    <CloudLightning className="w-5 h-5" />
                  ) : service.slug === 'roof-inspection' ? (
                    <SearchCheck className="w-5 h-5" />
                  ) : (
                    <Wrench className="w-5 h-5" />
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {service.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {service.description}
                </p>

                {/* Diagnostic Process points */}
                <div className="border-t border-slate-100 pt-3 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Diagnostic Protocol:
                  </span>
                  {service.diagnosticProcess?.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-slate-700">
                      <CheckCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => openIntake(service.slug === 'storm-damage' ? 'STORM' : service.slug === 'emergency-roof-repair' ? 'EMERGENCY' : 'DIAGNOSTIC')}
                  className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>Request Service</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Real East Texas Craftsmanship & Field Photography Section */}
      <section id="featured-work" className="bg-slate-100 py-20 px-4 sm:px-6 border-t border-slate-200">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider mb-2">
                <Camera className="w-3.5 h-3.5" />
                <span>Real Field Craftsmanship</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tight">
                Recent Projects &amp; Active Field Operations
              </h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Explore real photography from our recent East Texas roof replacements—featuring aerial drone diagnostic documentation, custom commercial timber architecture, active crew execution, and completed residential estates.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                id="btn-home-view-gallery"
                onClick={() => onNavigate('/gallery')}
                className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>View Full Gallery</span>
                <ArrowRight className="w-3.5 h-3.5 text-red-600" />
              </button>
              <button
                id="btn-home-inspect-photos-cta"
                onClick={() => openIntake('DIAGNOSTIC')}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>Get Free Diagnosis</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 4 Photo Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOME_FEATURED_PHOTOS.map((photo) => (
              <div
                key={photo.id}
                id={`featured-photo-card-${photo.id}`}
                onClick={() => setPreviewPhoto(photo)}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer transform hover:-translate-y-1"
              >
                <div>
                  {/* Photo Container */}
                  <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden">
                    <img
                      src={photo.src}
                      alt={photo.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-80 group-hover:opacity-90 transition-opacity" />

                    {/* Tag badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-black/70 backdrop-blur-md text-white border border-white/20 shadow-sm">
                        {photo.tag}
                      </span>
                    </div>

                    {/* Inspect Icon Overlay */}
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-600 text-white text-[11px] font-bold shadow-md">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Photo</span>
                    </div>

                    {/* Location Badge */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] font-medium text-white/90 drop-shadow-sm">
                      <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                      <span>{photo.location}</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-3">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-red-600 transition-colors leading-snug">
                      {photo.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {photo.description}
                    </p>
                  </div>
                </div>

                {/* Specs Footer */}
                <div className="p-5 pt-0">
                  <div className="pt-3 border-t border-slate-100 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Verified Highlights:
                    </div>
                    <div className="text-xs text-slate-700 font-medium leading-normal flex items-start gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-[11px] text-slate-600">{photo.specs}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs font-bold text-red-600 group-hover:text-red-700 pt-2">
                    <span className="flex items-center gap-1">
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Click to View Full Size</span>
                    </span>
                    <ChevronRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Credential Bar */}
          <div className="mt-10 bg-white rounded-xl border border-slate-200 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2.5 text-slate-700 font-semibold">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>All installations are performed by certified, insured East Texas roofing mechanics backed by manufacturer lifetime warranties.</span>
            </div>
            <button
              onClick={() => onNavigate('/gallery')}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5 ml-auto cursor-pointer"
            >
              <span>Explore All Before &amp; After Projects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. Storm Damage Specialists Section */}
      <section id="storm-damage" className="bg-slate-900 text-white py-20 px-4 sm:px-6 border-y border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <CloudLightning className="w-3.5 h-3.5" />
              <span>Hail &amp; Wind Restoration</span>
            </span>

            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
              Forensic Storm Damage Assessments. <br />
              <span className="text-red-500">Zero Guesswork.</span>
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              Northeast Texas weather can be devastating to asphalt roofing shingles. Hailstones fracture the internal fiberglass matting beneath the granules, creating hidden degradation that leads to water leaks months after the storm passes.
            </p>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Adjuster-Ready Photo Documentation:</strong> Standardized chalk test squares, cardinal slope documentation, and gutter metal collateral proof.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Texas HB 2102 Legal Deductible Notice:</strong> We operate strictly within Texas legal statutes. We do not engage in illegal deductible absorption.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Emergency Perimeter Tarping:</strong> Immediate protection to satisfy policyholder duties to mitigate ongoing interior water ingress.
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => openIntake('STORM')}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-lg transition-colors cursor-pointer flex items-center gap-2"
              >
                <span>CHECK FOR STORM DAMAGE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-800 rounded-2xl border border-slate-700 p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-red-500" />
              <span>Common Forensic Hail &amp; Wind Findings</span>
            </h3>

            <div className="space-y-3 text-xs">
              {problems.map((prob) => (
                <div key={prob.id} className="p-3 bg-slate-900/60 rounded-lg border border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{prob.title}</span>
                    <span className="text-[10px] uppercase font-bold text-amber-400">
                      {prob.urgency}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-1 leading-normal">
                    {prob.consequencesIfDelayed}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Primary Service Areas in Northeast Texas */}
      <section id="service-areas" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-wider text-red-600 font-bold">
            Local Presence
          </span>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mt-1">
            Northeast Texas Dispatch Corridor
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Headquartered in Texarkana, our specialized diagnostic teams and crews serve homeowners throughout Northeast Texas.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {serviceAreas.map((area) => (
            <div
              key={area.id}
              onClick={() => setSelectedArea(area)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedArea?.id === area.id
                  ? 'border-red-600 bg-red-50/40 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 uppercase">
                <MapPin className="w-3.5 h-3.5" />
                <span>{area.county} County</span>
              </div>
              <h4 className="text-base font-bold text-slate-900 mt-1">
                {area.name}, TX
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {area.description}
              </p>
              <div className="mt-3 text-[11px] font-semibold text-slate-400">
                Zip Codes: {area.zipCodes.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Forensic Guides & Homeowner Education */}
      <section id="resources" className="bg-white py-16 px-4 sm:px-6 border-t border-slate-200">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-wider text-red-600 font-bold">
              Forensic Guides
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
              Homeowner Roofing Education
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Transparent, forensic guidance to help you recognize latent storm damage, understand Texas insurance laws, and evaluate lifetime roofing systems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resources.map((res) => (
              <div key={res.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors space-y-3">
                <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 uppercase tracking-wider">
                  {res.category.replace(/_/g, ' ')}
                </span>
                <h4 className="text-base font-bold text-slate-900 leading-snug">
                  {res.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {res.summary}
                </p>
                <div className="text-[11px] font-semibold text-slate-400 pt-2 border-t border-slate-200">
                  {res.readingTimeMinutes} min forensic read
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Dedicated FAQ Section with Schema Markup (Google People Also Ask) */}
      <FaqSection onOpenIntake={openIntake} />

      {/* 9. Call To Action Footer Band */}
      <section className="bg-red-600 text-white py-14 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
            Protect Your Home With A Verified Diagnosis
          </h2>
          <p className="text-sm sm:text-base text-red-100 max-w-xl mx-auto">
            Schedule your free, objective 21-point roof health inspection today. Serving Texarkana, Longview, Tyler, Paris, and all of Northeast Texas.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => openIntake('DIAGNOSTIC')}
              className="px-6 py-3 bg-white hover:bg-slate-100 text-red-600 font-bold text-sm rounded-xl shadow-md transition-colors cursor-pointer"
            >
              GET MY ROOF DIAGNOSED
            </button>
            <a
              href="tel:9032315940"
              className="px-6 py-3 bg-red-700 hover:bg-red-800 text-white font-bold text-sm rounded-xl transition-colors flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              <span>903-231-5940</span>
            </a>
          </div>
        </div>
      </section>

      {/* 9. Verified Footer with Discreet Admin Login */}
      <PublicFooter onNavigate={onNavigate} />

      {/* Mobile Persistent Actions Bar (Call & Get My Roof Diagnosed) */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-2.5 z-40 lg:hidden flex items-center gap-2 shadow-lg">
        <a
          href="tel:9032315940"
          className="flex-1 py-3 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors text-center"
        >
          <PhoneCall className="w-4 h-4 text-emerald-400" />
          <span>CALL 903-231-5940</span>
        </a>
        <button
          onClick={() => openIntake('DIAGNOSTIC')}
          className="flex-1 py-3 px-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs text-center cursor-pointer"
        >
          <CalendarCheck className="w-4 h-4" />
          <span>GET MY ROOF DIAGNOSED</span>
        </button>
      </div>

      {/* Diagnostic Intake Modal */}
      <InspectionRequestModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultType={modalType}
      />

      {/* Featured Photo Lightbox Modal */}
      {previewPhoto && (
        <div
          id="photo-lightbox-modal"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded bg-red-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
                  {previewPhoto.tag}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  <span>{previewPhoto.location}</span>
                </span>
              </div>
              <button
                id="btn-close-lightbox"
                onClick={() => setPreviewPhoto(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close photo preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Main Photo */}
            <div className="relative bg-black flex items-center justify-center max-h-[60vh] overflow-hidden">
              <img
                src={previewPhoto.src}
                alt={previewPhoto.title}
                referrerPolicy="no-referrer"
                className="w-full h-auto max-h-[60vh] object-contain"
              />
            </div>

            {/* Modal Details Footer */}
            <div className="p-6 bg-slate-900 border-t border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {previewPhoto.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    {previewPhoto.description}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setPreviewPhoto(null);
                    openIntake('DIAGNOSTIC');
                  }}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors shrink-0 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Diagnose Similar Roof</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Certified Scope: {previewPhoto.specs}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
