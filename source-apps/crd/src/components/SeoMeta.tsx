import React, { useEffect } from 'react';
import { BUSINESS_INFO } from '../constants';

interface FaqItem {
  question: string;
  answer: string;
}

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
  faqItems?: FaqItem[];
}

export const SeoMeta: React.FC<SeoMetaProps> = ({
  title,
  description,
  canonicalPath = '',
  breadcrumbs,
  serviceType,
  faqItems,
}) => {
  useEffect(() => {
    const toCommercialUrl = (path: string) => {
      const normalizedPath = path || '/';
      const prefixedPath = (normalizedPath === '/commercial' || normalizedPath.startsWith('/commercial/'))
        ? normalizedPath
        : `/commercial${normalizedPath === '/' ? '/' : normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`}`;
      return `${window.location.origin}${prefixedPath}`;
    };
    const fullUrl = toCommercialUrl(canonicalPath);

    // Document Title
    document.title = title.includes('Commercial Roof Doctors')
      ? title
      : `${title} | Commercial Roof Doctors`;

    // Meta Description
    let metaDesc = document.querySelector("meta[name='description']");
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // OpenGraph Title & Description
    let ogTitle = document.querySelector("meta[property='og:title']");
    if (ogTitle) ogTitle.setAttribute('content', title);
    let ogDesc = document.querySelector("meta[property='og:description']");
    if (ogDesc) ogDesc.setAttribute('content', description);

    // Canonical
    let canonical = document.querySelector("link[rel='canonical']");
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullUrl);

    // Clean up existing structured data injected by this component
    const oldScripts = document.querySelectorAll('script[data-crd-seo="true"]');
    oldScripts.forEach((s) => s.remove());

    // Structured Data: Organization / RoofingContractor
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
      areaServed: [
        {
          '@type': 'AdministrativeArea',
          name: 'Ark-La-Tex Region',
        },
        {
          '@type': 'GeoCircle',
          geoMidpoint: {
            '@type': 'GeoCoordinates',
            latitude: 33.4251,
            longitude: -94.0477,
          },
          geoRadius: '120000',
        },
      ],
      description: description,
    };

    const scriptOrg = document.createElement('script');
    scriptOrg.type = 'application/ld+json';
    scriptOrg.setAttribute('data-crd-seo', 'true');
    scriptOrg.textContent = JSON.stringify(organizationSchema);
    document.head.appendChild(scriptOrg);

    // Structured Data: BreadcrumbList
    if (breadcrumbs && breadcrumbs.length > 0) {
      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((item, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: item.name,
          item: toCommercialUrl(item.url),
        })),
      };

      const scriptBreadcrumb = document.createElement('script');
      scriptBreadcrumb.type = 'application/ld+json';
      scriptBreadcrumb.setAttribute('data-crd-seo', 'true');
      scriptBreadcrumb.textContent = JSON.stringify(breadcrumbSchema);
      document.head.appendChild(scriptBreadcrumb);
    }

    // Structured Data: FAQPage. Only include questions and answers rendered on this page.
    if (faqItems && faqItems.length > 0) {
      const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      };
      const scriptFaq = document.createElement('script');
      scriptFaq.type = 'application/ld+json';
      scriptFaq.setAttribute('data-crd-seo', 'true');
      scriptFaq.textContent = JSON.stringify(faqSchema);
      document.head.appendChild(scriptFaq);
    }

    // Structured Data: Service
    if (serviceType) {
      const serviceSchema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        serviceType: serviceType,
        provider: {
          '@type': 'RoofingContractor',
          name: BUSINESS_INFO.name,
          telephone: BUSINESS_INFO.phone,
        },
        areaServed: 'Ark-La-Tex and surrounding 75-mile radius',
        description: description,
      };

      const scriptService = document.createElement('script');
      scriptService.type = 'application/ld+json';
      scriptService.setAttribute('data-crd-seo', 'true');
      scriptService.textContent = JSON.stringify(serviceSchema);
      document.head.appendChild(scriptService);
    }
  }, [title, description, canonicalPath, breadcrumbs, serviceType, faqItems]);

  return null;
};
