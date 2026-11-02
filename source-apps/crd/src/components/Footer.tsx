import React from 'react';
import { Phone, Mail, MapPin, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { Link } from '../router';
import { BUSINESS_INFO } from '../constants';
import { CrdLogo } from './CrdLogo';

const OPERATIONS_PORTAL_URL = 'https://trd-crd-operations-687495157172.us-east1.run.app';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#151515] border-t border-[#262626] text-[#888888] font-sans-crd pt-16 pb-24 lg:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#262626]">
          {/* Col 1: Commercial Roof Doctors Identity */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block" aria-label="Commercial Roof Doctors Home">
              <CrdLogo
                variant="full"
                theme="dark"
                className="h-10 sm:h-12 w-auto max-h-[50px] max-w-[220px] object-contain"
              />
            </Link>

            <p className="text-sm text-[#cccccc] max-w-md leading-relaxed">
              Commercial roofing, membrane restoration, storm disaster response, and long-term roof asset management for property owners, facility directors, and commercial portfolios across the Ark-La-Tex and surrounding 75-mile radius.
            </p>

            <div className="space-y-2 pt-2 text-sm text-[#dddddd]">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#d99a19] shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-[#888888] block font-mono-crd">ARK-LA-TEX DIRECT DISPATCH</span>
                  <a href={`tel:${BUSINESS_INFO.phoneRaw}`} className="font-bold hover:text-[#d99a19] transition-colors">
                    {BUSINESS_INFO.phone}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#d99a19] shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-[#888888] block font-mono-crd">OFFICIAL INQUIRIES & CLAIMS</span>
                  <a href={`mailto:${BUSINESS_INFO.email}`} className="font-medium hover:text-[#d99a19] transition-colors">
                    {BUSINESS_INFO.email}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#d99a19] shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-[#888888] block font-mono-crd">OPERATIONS & DISPATCH BASE</span>
                  <span>{BUSINESS_INFO.address?.display || [BUSINESS_INFO.address?.street, BUSINESS_INFO.address?.city, BUSINESS_INFO.address?.state, BUSINESS_INFO.address?.zip].filter(Boolean).join(', ') || 'Texarkana, TX'}</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-none bg-[#1e1e1e] border border-[#2e2e2e] text-xs text-[#888888]">
              <span className="font-semibold text-[#cccccc] block mb-0.5">Field-Operated Commercial Model:</span>
              Commercial Roof Doctors operates directly at client commercial facilities. Our Texarkana location serves as logistics, equipment staging, and dispatch headquarters—not a walk-in retail storefront.
            </div>
          </div>

          {/* Col 2: Commercial Roofing & Restoration */}
          <div className="space-y-3">
            <div className="font-heading font-bold text-sm tracking-wider uppercase text-white border-b border-[#262626] pb-2">
              Commercial Roofing
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/commercial-roofing" className="hover:text-[#d99a19] text-[#aaaaaa] transition-colors">
                  Commercial Roofing
                </Link>
              </li>
              <li>
                <Link to="/commercial-roof-repair" className="hover:text-[#d99a19] text-[#aaaaaa] transition-colors">
                  Commercial Roof Repair
                </Link>
              </li>
              <li>
                <Link to="/commercial-roof-replacement" className="hover:text-[#d99a19] text-[#aaaaaa] transition-colors">
                  Commercial Replacement
                </Link>
              </li>
              <li>
                <Link to="/commercial-roof-inspection" className="hover:text-[#d99a19] text-[#aaaaaa] transition-colors">
                  Forensic Roof Inspection
                </Link>
              </li>
              <li>
                <Link to="/commercial-roof-maintenance" className="hover:text-[#d99a19] text-[#aaaaaa] transition-colors">
                  Preventative Maintenance
                </Link>
              </li>
              <li>
                <Link to="/commercial-roof-coatings" className="hover:text-[#d99a19] text-[#aaaaaa] transition-colors">
                  Commercial Roof Coatings
                </Link>
              </li>
              <li>
                <Link to="/commercial-roof-restoration" className="hover:text-[#d99a19] text-[#aaaaaa] transition-colors">
                  Membrane Restoration
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-[#d99a19] text-[#d99a19] font-semibold transition-colors">
                  Commercial Roofing Insights
                </Link>
              </li>
              <li>
                <Link to="/coat-vs-replace" className="hover:text-[#d99a19] text-[#d99a19] font-medium transition-colors">
                  Coat vs. Replace Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Storm & Insurance Response */}
          <div className="space-y-3">
            <div className="font-heading font-bold text-sm tracking-wider uppercase text-white border-b border-[#262626] pb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#b83232]"></span>
              Storm & Insurance
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/storm-damage" className="hover:text-[#d99a19] text-[#aaaaaa] transition-colors">
                  Storm Damage Overview
                </Link>
              </li>
              <li>
                <Link to="/hail-damage" className="hover:text-[#d99a19] text-[#aaaaaa] transition-colors">
                  Hail Damage Assessment
                </Link>
              </li>
              <li>
                <Link to="/wind-damage" className="hover:text-[#d99a19] text-[#aaaaaa] transition-colors">
                  Wind Uplift & Blow-Off
                </Link>
              </li>
              <li>
                <Link to="/emergency-roofing" className="hover:text-red-400 text-[#b83232] font-semibold transition-colors">
                  Emergency Roofing Response
                </Link>
              </li>
              <li>
                <Link to="/insurance-claims" className="hover:text-[#d99a19] text-[#aaaaaa] transition-colors">
                  Insurance Claim Documentation
                </Link>
              </li>
              <li>
                <Link to="/adjuster-meetings" className="hover:text-[#d99a19] text-[#aaaaaa] transition-colors">
                  Adjuster Meeting Coordination
                </Link>
              </li>
              <li>
                <Link to="/large-loss-roofing" className="hover:text-[#d99a19] text-[#aaaaaa] transition-colors">
                  Large-Loss Commercial Roofing
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Property Protection & Systems */}
          <div className="space-y-3">
            <div className="font-heading font-bold text-sm tracking-wider uppercase text-white border-b border-[#262626] pb-2">
              Asset Protection & Hubs
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/crd-ppp" className="hover:text-[#d99a19] font-bold text-[#d99a19] transition-colors">
                  CRD PPP™ Protection Program
                </Link>
              </li>
              <li>
                <Link to="/property-management" className="hover:text-[#d99a19] text-[#aaaaaa] transition-colors">
                  Property Managers & Portfolios
                </Link>
              </li>
              <li>
                <Link to="/roof-asset-management" className="hover:text-[#d99a19] text-[#aaaaaa] transition-colors">
                  Roof Asset Management
                </Link>
              </li>
              <li>
                <Link to="/multifamily-roofing" className="hover:text-[#d99a19] text-[#aaaaaa] transition-colors">
                  Multifamily & Apartments
                </Link>
              </li>
              <li>
                <Link to="/tpo-roofing" className="hover:text-[#d99a19] text-[#aaaaaa] transition-colors">
                  TPO Single-Ply Membrane
                </Link>
              </li>
              <li>
                <Link to="/metal-roofing" className="hover:text-[#d99a19] text-[#aaaaaa] transition-colors">
                  Commercial Metal Systems
                </Link>
              </li>
              <li>
                <Link to="/commercial-roof-cost-calculator" className="hover:text-[#d99a19] text-[#d99a19] font-semibold transition-colors">
                  Cost Planning Calculator
                </Link>
              </li>
              <li>
                <Link to="/service-areas" className="hover:text-[#d99a19] text-[#aaaaaa] transition-colors">
                  Service Area Hubs (TX/AR/LA/OK)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal, Disclaimers & Attribution */}
        <div className="pt-8 text-xs text-[#777777] space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p className="leading-relaxed">
              <strong className="text-[#aaaaaa]">Insurance Protocol Notice:</strong> {BUSINESS_INFO.insuranceDisclaimer}
            </p>
            <p className="leading-relaxed">
              <strong className="text-[#aaaaaa]">Estimating & Calculator Notice:</strong> {BUSINESS_INFO.calculatorDisclaimer}
            </p>
          </div>

          <div className="pt-4 border-t border-[#262626] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              © {new Date().getFullYear()} Commercial Roof Doctors. All rights reserved. Precision. Protection. Performance.
            </div>
            <div className="flex items-center gap-6">
              <Link to="/about" className="hover:text-[#cccccc] transition-colors">
                Company
              </Link>
              <Link to="/about/credentials" className="hover:text-[#cccccc] transition-colors">
                Credentials
              </Link>
              <Link to="/contact" className="hover:text-[#cccccc] transition-colors">
                Contact
              </Link>
              <a href={OPERATIONS_PORTAL_URL} className="hover:text-[#d99a19] font-mono-crd text-[11px] transition-colors">
                Staff Portal
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
