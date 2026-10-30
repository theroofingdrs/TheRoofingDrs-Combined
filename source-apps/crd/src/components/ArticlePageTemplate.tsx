import React from 'react';
import { Link } from '../router';
import { BUSINESS_INFO } from '../constants';
import { SeoMeta } from './SeoMeta';
import { LeadType } from '../types';

export interface ArticlePageData {
  title: string;
  metaDescription: string;
  canonicalPath: string;
  eyebrow: string;
  headline: string;
  intro: string;
  sections: {
    heading: string;
    paragraphs: string[];
    bullets?: string[];
  }[];
  faqs: { question: string; answer: string }[];
  relatedLinks: { name: string; href: string }[];
}

interface ArticlePageTemplateProps {
  data: ArticlePageData;
  onOpenInspection: (initialLeadType?: LeadType) => void;
}

export const ArticlePageTemplate: React.FC<ArticlePageTemplateProps> = ({
  data,
  onOpenInspection,
}) => {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans-crd pb-24">
      <SeoMeta
        title={data.title}
        description={data.metaDescription}
        canonicalPath={data.canonicalPath}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Commercial Roof Coatings', url: '/commercial-roof-coatings' },
          { name: data.headline, url: data.canonicalPath },
        ]}
      />

      <section className="bg-gradient-to-b from-[#111a2b] via-[#0b1220] to-[#090d16] border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto space-y-5">
          <div className="text-xs font-mono-crd uppercase tracking-[0.2em] text-amber-400">
            {data.eyebrow}
          </div>
          <h1 className="text-4xl sm:text-5xl font-heading font-black uppercase leading-tight text-white">
            {data.headline}
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl">
            {data.intro}
          </p>
          <div className="text-xs text-slate-500 uppercase tracking-wider">
            Commercial Roof Doctors · Texarkana, Texas · Regional commercial service area
          </div>
        </div>
      </section>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
        {data.sections.map((section, index) => (
          <section key={index} className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-heading font-black uppercase text-white">
              {section.heading}
            </h2>
            {section.paragraphs.map((paragraph, paragraphIndex) => (
              <p key={paragraphIndex} className="text-sm sm:text-base text-slate-300 leading-7">
                {paragraph}
              </p>
            ))}
            {section.bullets && section.bullets.length > 0 && (
              <ul className="space-y-2 pl-5 list-disc marker:text-amber-500 text-sm sm:text-base text-slate-300 leading-7">
                {section.bullets.map((bullet, bulletIndex) => (
                  <li key={bulletIndex}>{bullet}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {data.faqs.length > 0 && (
          <section className="border-t border-slate-800 pt-10 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-heading font-black uppercase text-white">
              Frequently Asked Questions
            </h2>
            <div className="space-y-5">
              {data.faqs.map((faq, index) => (
                <div key={index} className="space-y-2">
                  <h3 className="font-heading font-bold uppercase text-white">{faq.question}</h3>
                  <p className="text-sm text-slate-300 leading-7">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="border-t border-slate-800 pt-10 space-y-5">
          <h2 className="text-2xl font-heading font-black uppercase text-white">
            Related Commercial Roof Resources
          </h2>
          <div className="flex flex-wrap gap-3">
            {data.relatedLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-amber-500 text-sm text-slate-200 hover:text-white transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-[#111a2b] border border-slate-800 rounded-xl p-7 sm:p-9 space-y-5">
          <div className="text-xs font-mono-crd uppercase tracking-[0.2em] text-amber-400">
            Commercial Roof Doctors
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-black uppercase text-white">
            Need to Know Whether Your Roof Can Be Restored?
          </h2>
          <p className="text-sm text-slate-300 leading-7">
            Request a documented evaluation of the existing roof assembly, moisture conditions, seams, fasteners, drainage and coating compatibility before deciding between repair, restoration and replacement.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onOpenInspection('Coating/Restoration')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-black text-sm uppercase tracking-wider px-7 py-3.5 rounded cursor-pointer"
            >
              Request Roof Evaluation
            </button>
            <a
              href={`tel:${BUSINESS_INFO.phoneRaw}`}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-heading font-bold text-sm uppercase tracking-wider px-6 py-3.5 rounded"
            >
              Call {BUSINESS_INFO.phone}
            </a>
          </div>
        </section>
      </article>
    </div>
  );
};
