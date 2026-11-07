import React from 'react';
import { Phone, FileText, AlertTriangle } from 'lucide-react';
import { BUSINESS_INFO } from '../constants';

interface MobileStickyBarProps {
  onOpenInspection: () => void;
  onOpenEmergency: () => void;
}

export const MobileStickyBar: React.FC<MobileStickyBarProps> = ({
  onOpenInspection,
  onOpenEmergency,
}) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#181818]/98 backdrop-blur-lg border-t border-[#2a2a2a] p-2.5 shadow-2xl">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.8fr)_40px] gap-2 max-w-md mx-auto items-center">
        {/* Call Button */}
        <a
          id="mobile-sticky-call-btn"
          href={`tel:${BUSINESS_INFO.phoneRaw}`}
          className="min-w-0 bg-[#242424] hover:bg-[#2c2c2c] text-white font-heading font-extrabold uppercase py-3 px-1 sm:px-2 rounded-none flex items-center justify-center gap-1 text-[10px] sm:text-xs tracking-wide border border-[#333333]"
        >
          <Phone className="w-4 h-4 text-[#d99a19] shrink-0" />
          <span>Call CRD</span>
        </a>

        {/* Request Inspection */}
        <button
          id="mobile-sticky-inspection-btn"
          onClick={onOpenInspection}
          className="min-w-0 bg-[#d99a19] hover:bg-[#b77e0f] text-[#111111] font-heading font-black uppercase py-3 px-1 sm:px-2 rounded-none flex items-center justify-center gap-1 text-[11px] sm:text-xs tracking-wide cursor-pointer transition-colors whitespace-nowrap"
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span>Request Inspection</span>
        </button>

        {/* Emergency Quick Trigger */}
        <button
          id="mobile-sticky-emergency-btn"
          onClick={onOpenEmergency}
          className="min-w-0 bg-[#b83232] hover:bg-[#9c2525] border border-[#9c2525] text-white py-3 rounded-none flex items-center justify-center cursor-pointer transition-colors"
          title="Report Roof Emergency"
          aria-label="Report Emergency"
        >
          <AlertTriangle className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
};
