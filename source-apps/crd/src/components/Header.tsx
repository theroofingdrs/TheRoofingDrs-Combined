import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Phone, ShieldAlert, FileText, Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, useRouter } from '../router';
import { BUSINESS_INFO, NAVIGATION_LINKS } from '../constants';
import { CrdLogo } from './CrdLogo';

const OPERATIONS_PORTAL_URL = 'https://trd-crd-operations-687495157172.us-east1.run.app';

interface HeaderProps {
  onOpenInspection: () => void;
  onOpenEmergency: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenInspection, onOpenEmergency }) => {
  const { currentPath } = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [currentPath]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#181818]/95 backdrop-blur-md border-b border-[#2a2a2a] text-white transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo / Brand Marker */}
          <Link to="/" id="brand-logo-link" className="flex items-center group py-1" aria-label="Commercial Roof Doctors Home">
            <CrdLogo
              variant="full"
              theme="dark"
              className="h-10 sm:h-12 lg:h-[60px] w-auto max-h-[65px] max-w-[210px] sm:max-w-[240px] lg:max-w-[260px] object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2" ref={dropdownRef}>
            {/* Services Dropdown */}
            <div className="relative">
              <button
                id="nav-services-btn"
                onClick={() => toggleDropdown('services')}
                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-none hover:text-[#d99a19] transition-colors ${
                  activeDropdown === 'services' || currentPath.includes('commercial-roof')
                    ? 'text-[#d99a19]'
                    : 'text-[#cccccc]'
                }`}
              >
                <span>Services</span>
                <ChevronDown className="w-4 h-4 opacity-70" />
              </button>
              {activeDropdown === 'services' && (
                <div className="absolute top-full left-0 w-80 bg-[#1e1e1e] border border-[#333333] shadow-2xl p-2 mt-1 z-50 rounded-none">
                  <div className="text-[10px] font-mono-crd text-[#d99a19] px-3 py-1 uppercase tracking-wider border-b border-[#2a2a2a]">
                    Commercial Services
                  </div>
                  {NAVIGATION_LINKS.services.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="block px-3 py-2 text-sm hover:bg-[#282828] transition-colors group rounded-none"
                    >
                      <div className="font-semibold text-[#eeeeee] group-hover:text-[#d99a19]">
                        {item.name}
                      </div>
                      <div className="text-xs text-[#888888] mt-0.5">{item.desc}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Roof Systems Dropdown */}
            <div className="relative">
              <button
                id="nav-systems-btn"
                onClick={() => toggleDropdown('systems')}
                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-none hover:text-[#d99a19] transition-colors ${
                  activeDropdown === 'systems' ||
                  currentPath.includes('tpo') ||
                  currentPath.includes('epdm') ||
                  currentPath.includes('metal')
                    ? 'text-[#d99a19]'
                    : 'text-[#cccccc]'
                }`}
              >
                <span>Roof Systems</span>
                <ChevronDown className="w-4 h-4 opacity-70" />
              </button>
              {activeDropdown === 'systems' && (
                <div className="absolute top-full left-0 w-80 bg-[#1e1e1e] border border-[#333333] shadow-2xl p-2 mt-1 z-50 rounded-none">
                  <div className="text-[10px] font-mono-crd text-[#d99a19] px-3 py-1 uppercase tracking-wider border-b border-[#2a2a2a]">
                    Low-Slope & Architectural Systems
                  </div>
                  {NAVIGATION_LINKS.systems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="block px-3 py-2 text-sm hover:bg-[#282828] transition-colors group rounded-none"
                    >
                      <div className="font-semibold text-[#eeeeee] group-hover:text-[#d99a19]">
                        {item.name}
                      </div>
                      <div className="text-xs text-[#888888] mt-0.5">{item.desc}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Storm & Insurance Dropdown */}
            <div className="relative">
              <button
                id="nav-storm-btn"
                onClick={() => toggleDropdown('storm')}
                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-none hover:text-[#d99a19] transition-colors ${
                  activeDropdown === 'storm' || currentPath.includes('storm') || currentPath.includes('insurance')
                    ? 'text-[#d99a19]'
                    : 'text-[#cccccc]'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#b83232] inline-block"></span>
                  Storm & Insurance
                </span>
                <ChevronDown className="w-4 h-4 opacity-70" />
              </button>
              {activeDropdown === 'storm' && (
                <div className="absolute top-full left-0 w-80 bg-[#1e1e1e] border border-[#333333] shadow-2xl p-2 mt-1 z-50 rounded-none">
                  <div className="text-[10px] font-mono-crd text-[#b83232] px-3 py-1 uppercase tracking-wider border-b border-[#2a2a2a]">
                    Hail, Wind & Disaster Recovery
                  </div>
                  {NAVIGATION_LINKS.storm.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="block px-3 py-2 text-sm hover:bg-[#282828] transition-colors group rounded-none"
                    >
                      <div className="font-semibold text-[#eeeeee] group-hover:text-[#d99a19]">
                        {item.name}
                      </div>
                      <div className="text-xs text-[#888888] mt-0.5">{item.desc}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Industries Dropdown */}
            <div className="relative">
              <button
                id="nav-industries-btn"
                onClick={() => toggleDropdown('industries')}
                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-none hover:text-[#d99a19] transition-colors ${
                  activeDropdown === 'industries' || currentPath.includes('industries')
                    ? 'text-[#d99a19]'
                    : 'text-[#cccccc]'
                }`}
              >
                <span>Industries</span>
                <ChevronDown className="w-4 h-4 opacity-70" />
              </button>
              {activeDropdown === 'industries' && (
                <div className="absolute top-full left-0 w-80 bg-[#1e1e1e] border border-[#333333] shadow-2xl p-2 mt-1 z-50 rounded-none">
                  <div className="text-[10px] font-mono-crd text-[#d99a19] px-3 py-1 uppercase tracking-wider border-b border-[#2a2a2a]">
                    Commercial Property Sectors
                  </div>
                  {NAVIGATION_LINKS.industries.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="block px-3 py-2 text-sm hover:bg-[#282828] transition-colors group rounded-none"
                    >
                      <div className="font-semibold text-[#eeeeee] group-hover:text-[#d99a19]">
                        {item.name}
                      </div>
                      <div className="text-xs text-[#888888] mt-0.5">{item.desc}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Property Protection Dropdown */}
            <div className="relative">
              <button
                id="nav-protection-btn"
                onClick={() => toggleDropdown('protection')}
                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-none hover:text-[#d99a19] transition-colors ${
                  activeDropdown === 'protection' || currentPath.includes('ppp') || currentPath.includes('property')
                    ? 'text-[#d99a19]'
                    : 'text-[#cccccc]'
                }`}
              >
                <span>Property Protection</span>
                <ChevronDown className="w-4 h-4 opacity-70" />
              </button>
              {activeDropdown === 'protection' && (
                <div className="absolute top-full left-0 w-80 bg-[#1e1e1e] border border-[#333333] shadow-2xl p-2 mt-1 z-50 rounded-none">
                  <div className="text-[10px] font-mono-crd text-[#d99a19] px-3 py-1 uppercase tracking-wider border-b border-[#2a2a2a]">
                    CRD PPP™ & Portfolio Asset Management
                  </div>
                  {NAVIGATION_LINKS.propertyProtection.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="block px-3 py-2 text-sm hover:bg-[#282828] transition-colors group rounded-none"
                    >
                      <div className="font-semibold text-[#eeeeee] group-hover:text-[#d99a19]">
                        {item.name}
                      </div>
                      <div className="text-xs text-[#888888] mt-0.5">{item.desc}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Resources Dropdown */}
            <div className="relative">
              <button
                id="nav-resources-btn"
                onClick={() => toggleDropdown('resources')}
                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-none hover:text-[#d99a19] transition-colors ${
                  activeDropdown === 'resources' ||
                  currentPath.includes('calculator') ||
                  currentPath.includes('coat-vs-replace') ||
                  currentPath.includes('coat') ||
                  currentPath.includes('restoration')
                    ? 'text-[#d99a19]'
                    : 'text-[#cccccc]'
                }`}
              >
                <span>Resources</span>
                <ChevronDown className="w-4 h-4 opacity-70" />
              </button>
              {activeDropdown === 'resources' && (
                <div className="absolute top-full right-0 w-80 bg-[#1e1e1e] border border-[#333333] shadow-2xl p-2 mt-1 z-50 rounded-none">
                  <div className="text-[10px] font-mono-crd text-[#d99a19] px-3 py-1 uppercase tracking-wider border-b border-[#2a2a2a]">
                    Tools, Guides & Restoration
                  </div>
                  <Link
                    to="/commercial-roof-cost-calculator"
                    className="block px-3 py-2 text-sm hover:bg-[#282828] transition-colors group rounded-none"
                  >
                    <div className="font-semibold text-[#eeeeee] group-hover:text-[#d99a19]">
                      Cost Calculator
                    </div>
                    <div className="text-xs text-[#888888] mt-0.5">Interactive commercial project planning tool</div>
                  </Link>
                  <Link
                    to="/coat-vs-replace"
                    className="block px-3 py-2 text-sm hover:bg-[#282828] transition-colors group rounded-none"
                  >
                    <div className="font-semibold text-[#eeeeee] group-hover:text-[#d99a19]">
                      Coat vs. Replace Guide
                    </div>
                    <div className="text-xs text-[#888888] mt-0.5">Technical capital decision framework</div>
                  </Link>
                  <Link
                    to="/commercial-roof-restoration"
                    className="block px-3 py-2 text-sm hover:bg-[#282828] transition-colors group rounded-none"
                  >
                    <div className="font-semibold text-[#eeeeee] group-hover:text-[#d99a19]">
                      Roof Restoration Systems
                    </div>
                    <div className="text-xs text-[#888888] mt-0.5">Renewing aged membranes without tear-off</div>
                  </Link>
                  <Link
                    to="/commercial-roof-coatings"
                    className="block px-3 py-2 text-sm hover:bg-[#282828] transition-colors group rounded-none"
                  >
                    <div className="font-semibold text-[#eeeeee] group-hover:text-[#d99a19]">
                      Commercial Roof Coatings
                    </div>
                    <div className="text-xs text-[#888888] mt-0.5">Fluid-applied silicone & acrylic elastomeric</div>
                  </Link>
                  <Link
                    to="/service-areas"
                    className="block px-3 py-2 text-sm hover:bg-[#282828] transition-colors group rounded-none"
                  >
                    <div className="font-semibold text-[#eeeeee] group-hover:text-[#d99a19]">
                      Ark-La-Tex Service Territory
                    </div>
                    <div className="text-xs text-[#888888] mt-0.5">Four-state commercial roofing coverage</div>
                  </Link>
                </div>
              )}
            </div>

            {/* About Link */}
            <Link
              id="nav-about-link"
              to="/about"
              className={`px-3 py-2 text-sm font-medium rounded-none hover:text-[#d99a19] transition-colors ${
                currentPath === '/about' ? 'text-[#d99a19]' : 'text-[#cccccc]'
              }`}
            >
              About
            </Link>
            <Link
              id="nav-blog-link"
              to="/blog"
              className={`px-3 py-2 text-sm font-medium rounded-none hover:text-[#d99a19] transition-colors ${
                currentPath.startsWith('/blog') ? 'text-[#d99a19]' : 'text-[#cccccc]'
              }`}
            >
              Blog
            </Link>
          </nav>

          {/* Action Hub / CTAs */}
          <div className="hidden xl:flex items-center gap-3">
            {/* Phone */}
            <a
              id="header-phone-link"
              href={`tel:${BUSINESS_INFO.phoneRaw}`}
              className="flex items-center gap-2 text-[#eeeeee] hover:text-[#d99a19] px-3 py-2 text-sm font-bold tracking-wide transition-colors"
            >
              <Phone className="w-4 h-4 text-[#d99a19]" />
              <span>{BUSINESS_INFO.phone}</span>
            </a>

            {/* Emergency CTA */}
            <button
              id="header-emergency-btn"
              onClick={onOpenEmergency}
              className="flex items-center gap-1.5 text-xs uppercase font-heading font-bold px-3.5 py-2.5 rounded-none bg-[#b83232] hover:bg-[#9c2525] text-white border border-[#9c2525] transition-colors tracking-wider cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-white" />
              Emergency
            </button>

            {/* Primary CTA */}
            <button
              id="header-inspection-btn"
              onClick={onOpenInspection}
              className="crd-button-accent text-xs uppercase font-heading font-extrabold px-4 min-h-[42px] tracking-wider rounded-none cursor-pointer flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Request Inspection
            </button>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              id="mobile-emergency-quick-btn"
              onClick={onOpenEmergency}
              className="bg-[#b83232] text-white p-2 rounded-none text-xs font-bold font-heading"
              title="Report Roof Emergency"
            >
              <ShieldAlert className="w-5 h-5" />
            </button>
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#cccccc] hover:text-white bg-[#222222] rounded-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#181818] border-b border-[#2a2a2a] px-4 pt-3 pb-8 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Quick Contact Header in Mobile */}
          <div className="bg-[#111111] p-3 rounded-none border border-[#333333] flex items-center justify-between">
            <div>
              <div className="text-xs text-[#888888] font-mono-crd">ARK-LA-TEX DISPATCH</div>
              <a href={`tel:${BUSINESS_INFO.phoneRaw}`} className="text-base font-bold text-[#d99a19]">
                {BUSINESS_INFO.phone}
              </a>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenEmergency();
              }}
              className="bg-[#b83232] hover:bg-[#9c2525] text-white text-xs font-heading font-bold px-3 py-1.5 rounded-none uppercase"
            >
              Emergency Form
            </button>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenInspection();
            }}
            className="w-full crd-button-accent font-heading font-extrabold uppercase py-3 rounded-none text-center tracking-wider text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            Request Commercial Roof Inspection
          </button>

          {/* Section: Commercial Services */}
          <div>
            <div className="text-xs font-mono-crd text-[#d99a19] uppercase tracking-wider py-1 border-b border-[#2a2a2a]">
              Commercial Services
            </div>
            <div className="grid grid-cols-1 gap-1 mt-1">
              {NAVIGATION_LINKS.services.map((s) => (
                <Link
                  key={s.href}
                  to={s.href}
                  className="py-1.5 text-sm text-[#cccccc] hover:text-[#d99a19] flex items-center justify-between"
                >
                  <span>{s.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#666666]" />
                </Link>
              ))}
            </div>
          </div>

          {/* Section: Roof Systems */}
          <div>
            <div className="text-xs font-mono-crd text-[#d99a19] uppercase tracking-wider py-1 border-b border-[#2a2a2a]">
              Roof Systems
            </div>
            <div className="grid grid-cols-1 gap-1 mt-1">
              {NAVIGATION_LINKS.systems.map((s) => (
                <Link
                  key={s.href}
                  to={s.href}
                  className="py-1.5 text-sm text-[#cccccc] hover:text-[#d99a19] flex items-center justify-between"
                >
                  <span>{s.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#666666]" />
                </Link>
              ))}
            </div>
          </div>

          {/* Section: Storm & Insurance */}
          <div>
            <div className="text-xs font-mono-crd text-[#b83232] uppercase tracking-wider py-1 border-b border-[#2a2a2a] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b83232] inline-block"></span>
              Storm & Insurance
            </div>
            <div className="grid grid-cols-1 gap-1 mt-1">
              {NAVIGATION_LINKS.storm.map((s) => (
                <Link
                  key={s.href}
                  to={s.href}
                  className="py-1.5 text-sm text-[#cccccc] hover:text-[#d99a19] flex items-center justify-between"
                >
                  <span>{s.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#666666]" />
                </Link>
              ))}
            </div>
          </div>

          {/* Section: Industries */}
          <div>
            <div className="text-xs font-mono-crd text-[#d99a19] uppercase tracking-wider py-1 border-b border-[#2a2a2a]">
              Property Types & Industries
            </div>
            <div className="grid grid-cols-1 gap-1 mt-1">
              {NAVIGATION_LINKS.industries.map((s) => (
                <Link
                  key={s.href}
                  to={s.href}
                  className="py-1.5 text-sm text-[#cccccc] hover:text-[#d99a19] flex items-center justify-between"
                >
                  <span>{s.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#666666]" />
                </Link>
              ))}
            </div>
          </div>

          {/* Section: Property Protection */}
          <div>
            <div className="text-xs font-mono-crd text-[#d99a19] uppercase tracking-wider py-1 border-b border-[#2a2a2a]">
              Property Protection & Portfolios
            </div>
            <div className="grid grid-cols-1 gap-1 mt-1">
              {NAVIGATION_LINKS.propertyProtection.map((s) => (
                <Link
                  key={s.href}
                  to={s.href}
                  className="py-1.5 text-sm text-[#cccccc] hover:text-[#d99a19] flex items-center justify-between"
                >
                  <span>{s.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#666666]" />
                </Link>
              ))}
            </div>
          </div>

          {/* Tools & Resources */}
          <div className="pt-2 border-t border-[#2a2a2a] space-y-1">
            <Link
              to="/commercial-roof-cost-calculator"
              className="block py-2 text-sm font-bold text-[#d99a19] hover:underline"
            >
              Commercial Roof Cost Calculator →
            </Link>
            <Link to="/about" className="block py-1.5 text-sm text-[#cccccc] hover:text-white">
              About CRD & Experience
            </Link>
            <Link to="/about/credentials" className="block py-1.5 text-sm text-[#cccccc] hover:text-white">
              Credentials, HAAG & Technologies
            </Link>
            <Link to="/service-areas" className="block py-1.5 text-sm text-[#cccccc] hover:text-white">
              Service Areas (TX, AR, LA, OK)
            </Link>
            <Link to="/blog" className="block py-1.5 text-sm font-bold text-[#d99a19] hover:underline">
              Commercial Roofing Blog
            </Link>
            <Link to="/contact" className="block py-1.5 text-sm text-[#cccccc] hover:text-white">
              Contact & Direct Inquiries
            </Link>
            <a href={OPERATIONS_PORTAL_URL} className="block py-1.5 text-xs font-mono-crd text-[#666666] hover:text-[#d99a19]">
              Staff / Admin Operations
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
