import React, { useState, useEffect, useRef } from 'react';
import { BrandLogo } from '../common/BrandLogo.tsx';
import {
  PhoneCall,
  CalendarCheck,
  CloudLightning,
  MapPin,
  Menu,
  X,
  ChevronRight,
  Home,
} from 'lucide-react';

interface PublicHeaderProps {
  currentPath?: string;
  onNavigate: (path: string) => void;
  onOpenIntake: (type?: 'DIAGNOSTIC' | 'STORM' | 'EMERGENCY' | 'REPLACEMENT') => void;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({
  currentPath = '/',
  onNavigate,
  onOpenIntake,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape' && mobileMenuOpen) { setMobileMenuOpen(false); mobileToggleRef.current?.focus(); } };
    document.addEventListener('keydown', close); return () => document.removeEventListener('keydown', close);
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'Home', path: '/', isHome: true },
    { label: 'Roofing Services', path: '/roofing' },
    { label: 'Roof Repair/Replacement', path: '/roofing/roof-repair' },
    { label: 'Storm Damage', path: '/storm-damage', isStorm: true },
    { label: 'Insurance Claims', path: '/insurance-claims' },
    { label: 'Roofing Systems', path: '/roofing-systems' },
    { label: 'Service Areas', path: '/service-areas' },
    { label: 'FAQ', path: '/faq' },
    { label: 'Blog', path: '/blog' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const handleNavClick = (path: string) => {
    setMobileMenuOpen(false);
    if (path === '/faq' && (currentPath === '/' || currentPath === '')) {
      const el = document.getElementById('faq');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    onNavigate(path);
  };

  const handleModalClick = () => {
    setMobileMenuOpen(false);
    onOpenIntake('DIAGNOSTIC');
  };

  const isLinkActive = (path: string) => {
    if (path === '/') return currentPath === '/' || currentPath === '';
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  return (
    <>
      {/* 1. Emergency Top Notification Strip */}
      <div className="bg-slate-900 border-b border-slate-800 text-slate-200 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white uppercase tracking-wider">
              Emergency Dispatch
            </span>
            <span className="text-slate-300 hidden sm:inline">
              Active Leaks &amp; Storm Damage Response in Northeast Texas:
            </span>
            <a
              href="tel:9032315940"
              className="font-bold text-white hover:text-red-400 flex items-center gap-1 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-red-500" />
              <span>903-231-5940</span>
            </a>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-red-500" />
              <span>HQ: Texarkana, TX</span>
            </span>
            <span className="hidden md:inline text-slate-300">
              Serving All Northeast Texas • Fully Insured &amp; Bonded
            </span>
          </div>
        </div>
      </div>

      {/* 2. Primary Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl min-[1800px]:max-w-[1800px] mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-2 xl:gap-4">
          {/* Logo */}
          <button
            onClick={() => handleNavClick('/')}
            className="cursor-pointer text-left shrink-0 py-1"
            title="The Roof Doctors Home"
          >
            <BrandLogo size="md" />
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden min-[1800px]:flex items-center gap-2 xl:gap-3.5 text-xs xl:text-sm font-semibold text-slate-700 whitespace-nowrap">
            {navLinks.map((link) => {
              const active = isLinkActive(link.path);
              return (
                <button
                  key={link.path}
                  id={`nav-link-${link.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  onClick={() => handleNavClick(link.path)}
                  className={`py-1 px-1 transition-colors cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? 'text-red-600 font-bold border-b-2 border-red-600'
                      : 'hover:text-red-600'
                  }`}
                >
                  {link.isHome && (
                    <Home className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-red-600' : 'text-slate-400 group-hover:text-red-600'}`} />
                  )}
                  {link.isStorm && (
                    <CloudLightning className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  )}
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

                    <a href="/commercial/" className="hidden min-[1800px]:inline-flex items-center px-3 py-2 rounded-lg border border-slate-300 text-xs xl:text-sm font-bold text-slate-700 hover:border-red-500 hover:text-red-600 transition-colors whitespace-nowrap">Commercial Roofing</a>

          {/* Right Action CTA & Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              id="cta-nav-diagnosed-btn"
              onClick={handleModalClick}
              className="px-2 sm:px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-lg shadow-xs hover:shadow transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              <CalendarCheck className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">GET MY ROOF DIAGNOSED</span>
              <span className="sm:hidden">GET DIAGNOSED</span>
            </button>

            {/* Mobile Menu Hamburger Toggle */}
            <button
              id="mobile-nav-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-[1800px]:hidden p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              ref={mobileToggleRef}
              aria-controls="residential-mobile-navigation"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-slate-900" />
              ) : (
                <Menu className="w-6 h-6 text-slate-900" />
              )}
            </button>
          </div>
        </div>

        {/* 3. Mobile Navigation Dropdown Menu */}
        {mobileMenuOpen && (
          <div id="residential-mobile-navigation" role="navigation" aria-label="Residential mobile navigation" className="min-[1800px]:hidden bg-white border-t border-slate-200 px-4 py-4 shadow-xl divide-y divide-slate-100 max-h-[calc(100vh-120px)] overflow-y-auto">
            <div className="py-2 space-y-1">
              {navLinks.map((link) => {
                const active = isLinkActive(link.path);
                return (
                  <button
                    key={link.path}
                    id={`mobile-nav-link-${link.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    onClick={() => handleNavClick(link.path)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between transition-colors ${
                      active
                        ? 'bg-red-50 text-red-600 font-bold'
                        : 'text-slate-800 hover:bg-slate-50 hover:text-red-600'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      {link.isHome && (
                        <Home className={`w-4 h-4 shrink-0 ${active ? 'text-red-600' : 'text-slate-400'}`} />
                      )}
                      {link.isStorm && (
                        <CloudLightning className="w-4 h-4 text-amber-500 shrink-0" />
                      )}
                      <span>{link.label}</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                );
              })}
            </div>

                        <a href="/commercial/" onClick={() => setMobileMenuOpen(false)} className="block mt-3 px-3 py-3 rounded-lg border border-slate-200 text-sm font-bold text-slate-800 hover:bg-slate-50">Looking for commercial roofing? Visit Commercial Roof Doctors</a>

            {/* Mobile Actions in Menu */}
            <div className="pt-4 pb-2 space-y-2.5">
              <a
                href="tel:9032315940"
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors text-center"
              >
                <PhoneCall className="w-4 h-4 text-red-400" />
                <span>DIRECT CALL: 903-231-5940</span>
              </a>
              <button
                onClick={handleModalClick}
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs text-center cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>FREE DIAGNOSTIC ROOF INSPECTION</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
