import React from 'react';
import { BrandLogo } from '../common/BrandLogo.tsx';

interface PublicFooterProps {
  onNavigate: (path: string) => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 py-12 px-4 sm:px-6 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Company Column */}
        <div className="space-y-3">
          <BrandLogo variant="light" size="sm" />
          <p className="text-slate-400 text-xs leading-relaxed">
            Residential Roofing &amp; Storm Damage Specialists providing forensic inspections, precision replacement systems, and emergency response across Northeast Texas.
          </p>
          <div className="text-slate-300 font-bold text-xs">
            Direct Dispatch: <a href="tel:9032315940" className="hover:text-red-400 underline decoration-slate-600">903-231-5940</a>
          </div>
        </div>

        {/* Roofing Services */}
        <div>
          <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">
            Diagnostic Services
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button
                onClick={() => onNavigate('/roofing/roof-replacement')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Complete Roof Replacement
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('/storm-damage')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Storm Damage &amp; Hail Restoration
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('/roofing/roof-repair')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Precision Roof Repair &amp; Leak Diagnostic
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('/roofing/roof-inspection')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Free Diagnostic Roof Inspection
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('/roofing/emergency-roof-repair')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Emergency Roof Tarping &amp; Response
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('/roofing/roof-maintenance')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Annual Roof Maintenance Program
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('/faq')}
                className="hover:text-white transition-colors cursor-pointer text-left font-semibold text-slate-300"
              >
                Frequently Asked Questions (FAQ)
              </button>
            </li>
          </ul>
        </div>

        {/* Dispatch Hubs */}
        <div>
          <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">
            Primary Dispatch Hubs
          </h4>
          <ul className="space-y-1.5 text-xs">
            <li>
              <button
                onClick={() => onNavigate('/service-areas/texarkana')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Texarkana, TX (HQ)
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('/service-areas/atlanta')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Atlanta &amp; New Boston, TX
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('/service-areas/paris')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Paris &amp; Sulphur Springs, TX
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('/service-areas/longview')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Longview &amp; Marshall, TX
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('/service-areas/tyler')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Tyler, TX
              </button>
            </li>
          </ul>
        </div>

        {/* Texas HB 2102 Consumer Notice */}
        <div>
          <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">
            Texas Consumer Protection
          </h4>
          <div className="space-y-2 text-xs text-slate-400">
            <p className="text-[11px] leading-relaxed">
              <strong className="text-slate-300">Texas HB 2102 Notice:</strong> Under Texas Insurance Code Chapter 707, it is a violation of Texas law for a roofing contractor to pay, waive, absorb, rebate, or promise to pay all or part of an insurance deductible.
            </p>
            <p className="text-[11px] leading-relaxed text-slate-500">
              The Roof Doctors operates with full transparency and compliance across Bowie, Cass, Titus, Lamar, Gregg, and Smith Counties.
            </p>
          </div>
        </div>
      </div>

      {/* Absolute Bottom Row with Discreet Admin Login */}
      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
        <div>
          &copy; {new Date().getFullYear()} The Roof Doctors LLC. All rights reserved.
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <span>Licensed &amp; Insured Residential Roofing Contractor</span>
          <span className="hidden sm:inline text-slate-700">&bull;</span>
          <span>Northeast Texas</span>
          <span className="hidden sm:inline text-slate-700">&bull;</span>
          {/* Discreet Admin Login Link */}
          <button
            onClick={() => onNavigate('/app')}
            className="text-slate-600 hover:text-slate-400 transition-colors cursor-pointer underline decoration-slate-800"
            title="Internal Staff &amp; Administrator Login"
          >
            Admin Login
          </button>
        </div>
      </div>
    </footer>
  );
};
