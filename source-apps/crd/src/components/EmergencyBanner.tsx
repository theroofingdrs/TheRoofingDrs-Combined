import React from 'react';
import { AlertTriangle, Phone, Flame } from 'lucide-react';
import { BUSINESS_INFO } from '../constants';

interface EmergencyBannerProps {
  onOpenEmergency: () => void;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({ onOpenEmergency }) => {
  return (
    <div className="bg-[#b83232] border-b border-[#9c2525] text-white text-xs sm:text-sm py-2 px-4 font-sans-crd relative z-40">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-white inline-block"></span>
          <span className="font-bold tracking-wider uppercase font-heading text-sm sm:text-base text-white">
            Active Roof Leak or Severe Storm Damage?
          </span>
          <span className="hidden md:inline text-white/90 text-xs font-mono-crd">
            — Ark-La-Tex Commercial Emergency Field Response
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a
            id="emergency-banner-call-btn"
            href={`tel:${BUSINESS_INFO.phoneRaw}`}
            className="flex items-center gap-1.5 font-bold text-white hover:underline transition-colors whitespace-nowrap"
          >
            <Phone className="w-3.5 h-3.5 text-white" />
            <span>{BUSINESS_INFO.phone}</span>
          </a>
          <button
            id="emergency-banner-report-btn"
            onClick={onOpenEmergency}
            className="bg-[#181818] hover:bg-black text-white text-xs uppercase font-heading font-bold px-3 py-1.5 rounded-none transition-colors tracking-wider whitespace-nowrap cursor-pointer flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[#d99a19]" />
            Report Emergency
          </button>
        </div>
      </div>
    </div>
  );
};
