import React, { useState } from 'react';
import crdLogoMarkDark from '../assets/crd-logo-mark.png';
import crdLogoMarkLight from '../assets/crd-logo-mark-light.png';

export interface CRDLogoProps {
  variant?: 'full' | 'mark';
  theme?: 'light' | 'dark';
  className?: string;
  alt?: string;
  src?: string;
  style?: React.CSSProperties;
}

/**
 * Official Commercial Roof Doctors Brand Asset Map
 * Imported directly so Vite hashes the asset at build time (/assets/crd-logo-full-dark-[hash].png),
 * permanently eliminating any CDN/browser stale caching or path resolution mismatches between environments.
 */
const BUNDLED_LOGOS = {
  full: {
    dark: '/commercial/assets/CRD-logo-1296x367.png',
    light: '/commercial/assets/CRD-logo-1296x367.png',
  },
  mark: {
    dark: crdLogoMarkDark,
    light: crdLogoMarkLight,
  },
};

export const CRDLogo: React.FC<CRDLogoProps> = ({
  variant = 'full',
  theme = 'dark',
  className = '',
  alt = 'Commercial Roof Doctors',
  src,
  style,
}) => {
  const isFull = variant === 'full';
  const defaultSource = isFull
    ? (theme === 'light' ? BUNDLED_LOGOS.full.light : BUNDLED_LOGOS.full.dark)
    : (theme === 'light' ? BUNDLED_LOGOS.mark.light : BUNDLED_LOGOS.mark.dark);

  const [currentSrc, setCurrentSrc] = useState<string>(src || defaultSource);

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={`object-contain select-none ${className}`}
      style={{
        height: 'auto',
        maxHeight: '65px',
        width: 'auto',
        maxWidth: '100%',
        display: 'inline-block',
        ...style,
      }}
      loading="eager"
      decoding="async"
      onError={() => {
        if (currentSrc !== defaultSource) {
          setCurrentSrc(defaultSource);
        }
      }}
    />
  );
};

// Aliases for unified brand usage across the codebase
export const CrdLogo = CRDLogo;
export const CrdShield: React.FC<{ className?: string; theme?: 'light' | 'dark' }> = ({
  className,
  theme = 'dark',
}) => <CRDLogo variant="mark" theme={theme} className={className} />;

