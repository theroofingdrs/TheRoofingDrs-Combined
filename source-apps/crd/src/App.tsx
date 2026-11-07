import React, { useState } from 'react';
import { RouterProvider, useRouter } from './router';
import { EmergencyBanner } from './components/EmergencyBanner';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MobileStickyBar } from './components/MobileStickyBar';
import { InspectionModal } from './components/InspectionModal';
import { EmergencyModal } from './components/EmergencyModal';

// Pages
import { HomePage } from './pages/HomePage';
import { CalculatorPage } from './pages/CalculatorPage';
import { CrdPppPage } from './pages/CrdPppPage';
import { PropertyManagementPage } from './pages/PropertyManagementPage';
import { CoatVsReplacePage } from './pages/CoatVsReplacePage';
import { RestorationCenterPage } from './pages/RestorationCenterPage';
import { StormDamagePage } from './pages/StormDamagePage';
import { InsuranceClaimsPage } from './pages/InsuranceClaimsPage';
import { EmergencyRoofingPage } from './pages/EmergencyRoofingPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { BlogPage } from './pages/BlogPage';
import { IndustriesDirectoryPage } from './pages/IndustriesDirectoryPage';

// Reusable Templates
import { ServicePageTemplate } from './components/ServicePageTemplate';
import { RoofSystemPageTemplate } from './components/RoofSystemPageTemplate';
import { IndustryPageTemplate } from './components/IndustryPageTemplate';
import { ServiceAreaTemplate } from './components/ServiceAreaTemplate';
import { ArticlePageTemplate } from './components/ArticlePageTemplate';

// Content Dictionaries
import { SERVICES_CONTENT } from './siteContent';
import {
  ROOF_SYSTEMS_CONTENT,
  INDUSTRIES_CONTENT,
  SERVICE_AREAS_CONTENT,
  CITY_SERVICE_AREAS_CONTENT,
  COATING_ARTICLES_CONTENT,
} from './siteSystemsContent';
import { LeadType } from './types';

const OPERATIONS_PORTAL_URL = 'https://operations.theroofingdrs.com';

const MainAppContent: React.FC = () => {
  const { currentPath, navigate } = useRouter();

  // Global Conversion Modals state
  const [inspectionModalOpen, setInspectionModalOpen] = useState(false);
  const [inspectionInitialType, setInspectionInitialType] = useState<LeadType>('Inspection');
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);

  const handleOpenInspection = (initialLeadType?: LeadType) => {
    setInspectionInitialType(initialLeadType || 'Inspection');
    setInspectionModalOpen(true);
  };

  const handleOpenEmergency = () => {
    setEmergencyModalOpen(true);
  };

  // Route Dispatcher
  const renderCurrentPage = () => {
    // Clean and normalize currentPath: strip query/hash, strip trailing slash, normalize casing
    const rawPath = currentPath.split('?')[0].split('#')[0];
    const normalizedPath = (rawPath.replace(/\/+$/, '') || '/').toLowerCase();

    if (normalizedPath === '/industries') {
      return <IndustriesDirectoryPage />;
    }

    // Commercial roofing insights and individual articles
    if (normalizedPath === '/blog' || normalizedPath.startsWith('/blog/')) {
      return <BlogPage currentPath={normalizedPath} onOpenInspection={handleOpenInspection} />;
    }

    const articleData = COATING_ARTICLES_CONTENT[normalizedPath];
    if (articleData) return <ArticlePageTemplate data={articleData} onOpenInspection={handleOpenInspection} />;

    // 1. Core Dedicated Pages
    if (normalizedPath === '/' || normalizedPath === '') {
      return (
        <HomePage
          onOpenInspection={handleOpenInspection}
          onOpenEmergency={handleOpenEmergency}
        />
      );
    }

    if (normalizedPath === '/commercial-roof-cost-calculator') {
      return <CalculatorPage onOpenEmergency={handleOpenEmergency} />;
    }

    if (normalizedPath === '/crd-ppp') {
      return (
        <CrdPppPage
          onOpenInspection={handleOpenInspection}
          onOpenEmergency={handleOpenEmergency}
        />
      );
    }

    if (normalizedPath === '/property-management') {
      return (
        <PropertyManagementPage
          onOpenInspection={handleOpenInspection}
          onOpenEmergency={handleOpenEmergency}
        />
      );
    }

    if (normalizedPath === '/commercial-roof-restoration') {
      return <RestorationCenterPage onOpenInspection={handleOpenInspection} />;
    }

    if (normalizedPath === '/coat-vs-replace') {
      return (
        <CoatVsReplacePage
          onOpenInspection={handleOpenInspection}
          onOpenEmergency={handleOpenEmergency}
        />
      );
    }

    if (normalizedPath === '/storm-damage') {
      return (
        <StormDamagePage
          onOpenInspection={handleOpenInspection}
          onOpenEmergency={handleOpenEmergency}
        />
      );
    }

    if (normalizedPath === '/insurance-claims') {
      return (
        <InsuranceClaimsPage
          onOpenInspection={handleOpenInspection}
          onOpenEmergency={handleOpenEmergency}
        />
      );
    }

    // Legacy and campaign URLs used by the CRD navigation and storm-response content.
    // Keep these URLs live by routing them to the closest existing dedicated resources.
    if (normalizedPath === '/large-loss-roofing' || normalizedPath === '/adjuster-meetings') {
      return (
        <InsuranceClaimsPage
          onOpenInspection={handleOpenInspection}
          onOpenEmergency={handleOpenEmergency}
        />
      );
    }

    if (normalizedPath === '/commercial-storm-inspections') {
      return (
        <StormDamagePage
          onOpenInspection={handleOpenInspection}
          onOpenEmergency={handleOpenEmergency}
        />
      );
    }

    if (normalizedPath === '/emergency-roofing') {
      return <EmergencyRoofingPage onOpenEmergency={handleOpenEmergency} />;
    }

    if (normalizedPath === '/about') {
      return <AboutPage onOpenInspection={handleOpenInspection} />;
    }

    if (normalizedPath === '/contact') {
      return <ContactPage />;
    }

    // Legacy staff and admin URLs now point users to the secure Operations Center.
    if (
      normalizedPath === '/admin' ||
      normalizedPath === '/admin/leads' ||
      normalizedPath === '/admin/dashboard' ||
      normalizedPath === '/staff' ||
      normalizedPath === '/staff/leads' ||
      normalizedPath === '/staff-portal' ||
      normalizedPath === '/portal' ||
      normalizedPath === '/leads'
    ) {
      return (
        <div className="min-h-[70vh] bg-[#090d16] text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#0e1422] border border-slate-800 rounded-2xl p-8 text-center space-y-4">
            <h1 className="text-2xl font-black text-white">Operations Portal</h1>
            <p className="text-sm text-slate-400">The former staff and admin portal has moved to the secure TRD and CRD Operations Center.</p>
            <a href={OPERATIONS_PORTAL_URL} className="inline-flex items-center justify-center rounded-lg bg-amber-500 hover:bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950">Open Secure Operations Center</a>
          </div>
        </div>
      );
    }

    // 2. Commercial Services
    if (SERVICES_CONTENT[normalizedPath] || SERVICES_CONTENT[rawPath] || SERVICES_CONTENT[currentPath]) {
      return (
        <ServicePageTemplate
          data={SERVICES_CONTENT[normalizedPath] || SERVICES_CONTENT[rawPath] || SERVICES_CONTENT[currentPath]}
          onOpenInspection={handleOpenInspection}
          onOpenEmergency={handleOpenEmergency}
        />
      );
    }

    // 3. Roof Systems
    if (ROOF_SYSTEMS_CONTENT[normalizedPath] || ROOF_SYSTEMS_CONTENT[rawPath] || ROOF_SYSTEMS_CONTENT[currentPath]) {
      return (
        <RoofSystemPageTemplate
          data={ROOF_SYSTEMS_CONTENT[normalizedPath] || ROOF_SYSTEMS_CONTENT[rawPath] || ROOF_SYSTEMS_CONTENT[currentPath]}
          onOpenInspection={handleOpenInspection}
          onOpenEmergency={handleOpenEmergency}
        />
      );
    }

    // 4. Industries
    if (INDUSTRIES_CONTENT[normalizedPath] || INDUSTRIES_CONTENT[rawPath] || INDUSTRIES_CONTENT[currentPath]) {
      return (
        <IndustryPageTemplate
          data={INDUSTRIES_CONTENT[normalizedPath] || INDUSTRIES_CONTENT[rawPath] || INDUSTRIES_CONTENT[currentPath]}
          onOpenInspection={handleOpenInspection}
          onOpenEmergency={handleOpenEmergency}
        />
      );
    }

    // 5. Service Areas
    if (
      CITY_SERVICE_AREAS_CONTENT[normalizedPath] ||
      SERVICE_AREAS_CONTENT[normalizedPath] ||
      CITY_SERVICE_AREAS_CONTENT[rawPath] ||
      SERVICE_AREAS_CONTENT[rawPath] ||
      CITY_SERVICE_AREAS_CONTENT[currentPath] ||
      SERVICE_AREAS_CONTENT[currentPath]
    ) {
      return (
        <ServiceAreaTemplate
          data={
            CITY_SERVICE_AREAS_CONTENT[normalizedPath] ||
            SERVICE_AREAS_CONTENT[normalizedPath] ||
            CITY_SERVICE_AREAS_CONTENT[rawPath] ||
            SERVICE_AREAS_CONTENT[rawPath] ||
            CITY_SERVICE_AREAS_CONTENT[currentPath] ||
            SERVICE_AREAS_CONTENT[currentPath]
          }
          onOpenInspection={handleOpenInspection}
          onOpenEmergency={handleOpenEmergency}
        />
      );
    }

    // 6. 404 Fallback
    return (
      <div className="min-h-[70vh] bg-[#090d16] text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#0e1422] border border-slate-800 rounded-2xl p-8 text-center space-y-4">
          <div className="text-4xl font-heading font-black text-amber-500">404</div>
          <h1 className="text-2xl font-heading font-bold uppercase text-white">
            Page Not Found
          </h1>
          <p className="text-xs text-slate-400">
            The commercial roofing resource you requested does not exist or has been relocated.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => navigate('/')}
              className="w-full py-2.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-bold text-xs uppercase tracking-wider"
            >
              Return to Homepage
            </button>
            <button
              onClick={() => navigate('/commercial-roof-cost-calculator')}
              className="w-full py-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-heading font-bold text-xs uppercase tracking-wider"
            >
              Use Cost Calculator
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--crd-warm-white)] text-[var(--crd-ink)] flex flex-col selection:bg-[#181818] selection:text-[#f4f3ef]">
      {/* Top Emergency Action Bar */}
      <EmergencyBanner onOpenEmergency={handleOpenEmergency} />

      {/* Main Sticky Navigation Header */}
      <Header
        onOpenInspection={handleOpenInspection}
        onOpenEmergency={handleOpenEmergency}
      />

      {/* Dynamic Viewport Content */}
      <main className="flex-1">{renderCurrentPage()}</main>

      {/* Footer */}
      <Footer onOpenInspection={handleOpenInspection} />

      {/* Mobile Sticky Bar (Visible only on small viewports) */}
      <MobileStickyBar
        onOpenInspection={handleOpenInspection}
        onOpenEmergency={handleOpenEmergency}
      />

      {/* Global Interactive Modals */}
      <InspectionModal
        isOpen={inspectionModalOpen}
        onClose={() => setInspectionModalOpen(false)}
        initialLeadType={inspectionInitialType}
      />

      <EmergencyModal
        isOpen={emergencyModalOpen}
        onClose={() => setEmergencyModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <RouterProvider>
      <MainAppContent />
    </RouterProvider>
  );
}
