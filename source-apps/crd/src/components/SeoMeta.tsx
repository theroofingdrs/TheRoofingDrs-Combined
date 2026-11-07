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
  areaServed?: string;
  faqItems?: FaqItem[];
}

export const SeoMeta: React.FC<SeoMetaProps> = ({
  title,
  description,
  canonicalPath = '',
  breadcrumbs,
  serviceType,
  areaServed,
  faqItems,
}) => {
  useEffect(() => {
    const toCommercialUrl = (path: string) => {
      const normalizedPath = path || '/';
      const prefixedPath = (normalizedPath === '/commercial' || normalizedPath.startsWith('/commercial/'))
        ? normalizedPath
        : `/commercial${normalizedPath === '/' ? '/' : normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`}`;
      return `https://theroofingdrs.com${prefixedPath}`;
    };
    const fullUrl = toCommercialUrl(canonicalPath);

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

    // Canonical
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
      '@type': 'Organization',
      name: BUSINESS_INFO.name,
      telephone: BUSINESS_INFO.phone,
      email: BUSINESS_INFO.email,
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
        serviceType,
        provider: {
          '@type': 'Organization',
          name: BUSINESS_INFO.name,
          telephone: BUSINESS_INFO.phone,
        },
        areaServed: areaServed ||
          'Commercial roofing service area across Texas, Arkansas, Louisiana and Oklahoma; project availability is confirmed based on location, roof type and scope',
        description,
      };

      const scriptService = document.createElement('script');
      scriptService.type = 'application/ld+json';
      scriptService.setAttribute('data-crd-seo', 'true');
      scriptService.textContent = JSON.stringify(serviceSchema);
      document.head.appendChild(scriptService);
    }
  }, [title, description, canonicalPath, breadcrumbs, serviceType, areaServed, faqItems]);

  return null;
};
