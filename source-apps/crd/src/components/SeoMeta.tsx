import React, { useEffect } from 'react';
import { BUSINESS_INFO } from '../constants';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface SeoMetaProps {
  title: string;
  description: string;
  canonicalPath?: string;
  breadcrumbs?: BreadcrumbItem[];
  serviceType?: string;
}

export const SeoMeta: React.FC<SeoMetaProps> = ({
  title,
  description,
  canonicalPath = '',
  breadcrumbs,
  serviceType,
}) => {
  useEffect(() => {
    const toCommercialPath = (path: string) => {
      const normalizedPath = path && path.startsWith('/') ? path : `/${path || ''}`;
      if (normalizedPath === '/commercial' || normalizedPath.startsWith('/commercial/')) {
        return normalizedPath;
      }
      return `/commercial${normalizedPath === '/' ? '/' : normalizedPath}`;
    };
    const fullUrl = `${window.location.origin}${toCommercialPath(canonicalPath || '/')}`;

    document.title =
      title.includes('Commercial Roof Doctors') || /\|\s*CRD$/i.test(title)
        ? title
        : `${title} | CRD`;

    const setMetaContent = (selector: string, attribute: string, key: string, value: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }
      element.setAttribute('content', value);
    };

    setMetaContent("meta[name='description']", 'name', 'description', description);
    setMetaContent("meta[property='og:title']", 'property', 'og:title', title);
    setMetaContent("meta[property='og:description']", 'property', 'og:description', description);
    setMetaContent("meta[property='og:url']", 'property', 'og:url', fullUrl);
    setMetaContent("meta[name='twitter:title']", 'name', 'twitter:title', title);
    setMetaContent("meta[name='twitter:description']", 'name', 'twitter:description', description);

    let canonical = document.querySelector("link[rel='canonical']");
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullUrl);

    const oldScripts = document.querySelectorAll('script[data-crd-seo="true"]');
    oldScripts.forEach((script) => script.remove());

    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'RoofingContractor',
      name: BUSINESS_INFO.name,
      telephone: BUSINESS_INFO.phone,
      email: BUSINESS_INFO.email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: BUSINESS_INFO.address.street,
        addressLocality: BUSINESS_INFO.address.city,
        addressRegion: BUSINESS_INFO.address.state,
        postalCode: BUSINESS_INFO.address.zip,
        addressCountry: 'US',
      },
      areaServed: ['Texas', 'Arkansas', 'Louisiana', 'Oklahoma'].map((state) => ({
        '@type': 'AdministrativeArea',
        name: state,
      })),
      description:
        'Commercial roofing evaluations, coatings, restoration, inspections, repairs and replacement planning for commercial properties across Texas, Arkansas, Louisiana and Oklahoma.',
    };

    const scriptOrg = document.createElement('script');
    scriptOrg.type = 'application/ld+json';
    scriptOrg.setAttribute('data-crd-seo', 'true');
    scriptOrg.textContent = JSON.stringify(organizationSchema);
    document.head.appendChild(scriptOrg);

    if (breadcrumbs && breadcrumbs.length > 0) {
      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((item, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: item.name,
          item: `${window.location.origin}${toCommercialPath(item.url)}`,
        })),
      };

      const scriptBreadcrumb = document.createElement('script');
      scriptBreadcrumb.type = 'application/ld+json';
      scriptBreadcrumb.setAttribute('data-crd-seo', 'true');
      scriptBreadcrumb.textContent = JSON.stringify(breadcrumbSchema);
      document.head.appendChild(scriptBreadcrumb);
    }

    if (serviceType) {
      const serviceSchema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        serviceType,
        provider: {
          '@type': 'RoofingContractor',
          name: BUSINESS_INFO.name,
          telephone: BUSINESS_INFO.phone,
        },
        areaServed:
          'Commercial roofing service area across Texas, Arkansas, Louisiana and Oklahoma; project availability is confirmed based on location, roof type and scope',
        description,
      };

      const scriptService = document.createElement('script');
      scriptService.type = 'application/ld+json';
      scriptService.setAttribute('data-crd-seo', 'true');
      scriptService.textContent = JSON.stringify(serviceSchema);
      document.head.appendChild(scriptService);
    }
  }, [title, description, canonicalPath, breadcrumbs, serviceType]);

  return null;
};
