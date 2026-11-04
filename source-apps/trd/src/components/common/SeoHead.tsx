import React, { useEffect } from 'react';

interface SeoHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
  schemaJson?: Record<string, any> | Record<string, any>[];
  ogType?: 'website' | 'article';
}

export const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  canonicalPath = '/',
  schemaJson,
  ogType = 'website',
}) => {
  useEffect(() => {
    const toResidentialUrl = (path: string) => {
      const normalizedPath = path || '/';
      const prefixedPath = normalizedPath === '/residential' || normalizedPath.startsWith('/residential/')
        ? normalizedPath
        : `/residential${normalizedPath === '/' ? '/' : normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`}`;
      return `https://theroofingdrs.com${prefixedPath}`;
    };

    // 1. Update Document Title
    const fullTitle = title.includes('The Roof Doctors')
      ? title
      : `${title} | The Roof Doctors`;
    document.title = fullTitle;

    // 2. Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // 3. Update Open Graph Tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', fullTitle);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) {
      ogUrl = document.createElement('meta');
      ogUrl.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrl);
    }
    ogUrl.setAttribute('content', toResidentialUrl(canonicalPath));

    let ogTypeMeta = document.querySelector('meta[property="og:type"]');
    if (!ogTypeMeta) {
      ogTypeMeta = document.createElement('meta');
      ogTypeMeta.setAttribute('property', 'og:type');
      document.head.appendChild(ogTypeMeta);
    }
    ogTypeMeta.setAttribute('content', ogType);

    // 4. Update Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', toResidentialUrl(canonicalPath));

    // 5. Injected JSON-LD Schema
    const existingSchema = document.getElementById('route-schema-jsonld');
    if (existingSchema) {
      existingSchema.remove();
    }

    if (schemaJson) {
      const script = document.createElement('script');
      script.id = 'route-schema-jsonld';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schemaJson);
      document.head.appendChild(script);
    }

    return () => {
      const s = document.getElementById('route-schema-jsonld');
      if (s) s.remove();
    };
  }, [title, description, canonicalPath, schemaJson, ogType]);

  return null;
};
