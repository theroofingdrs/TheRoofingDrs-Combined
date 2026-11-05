import React from 'react';

interface BrandLogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  variant = 'dark',
  size = 'md',
  showTagline = false,
}) => {
  const isLight = variant === 'light';

  const logoSizes = {
    sm: 'h-7 sm:h-8',
    md: 'h-9 sm:h-10',
    lg: 'h-12 sm:h-14',
  };

  return (
    <div className={`inline-flex flex-col select-none max-w-full ${className}`}>
      <img
        src={`${import.meta.env.BASE_URL}the_roof_doctors_logo_transparent.png`}
        alt="The Roof Doctors"
        className={`${logoSizes[size]} w-auto max-w-full object-contain shrink-0`}
        loading="eager"
        decoding="async"
      />
      {showTagline && (
        <span
          className={`font-semibold uppercase tracking-wider text-[9px] mt-1 ${
            isLight ? 'text-slate-300' : 'text-red-700'
          }`}
        >
          Residential Roofing &amp; Storm Damage Specialists
        </span>
      )}
    </div>
  );
};
