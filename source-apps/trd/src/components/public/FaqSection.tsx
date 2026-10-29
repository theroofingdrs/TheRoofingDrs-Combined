import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  ChevronDown,
  Search,
  ShieldCheck,
  PhoneCall,
  CalendarCheck,
  CheckCircle2,
  FileText,
  BadgeAlert,
} from 'lucide-react';

export interface FaqItem {
  id: string;
  category: 'STORM' | 'INSURANCE' | 'COST' | 'INSPECTION' | 'MATERIALS';
  question: string;
  answer: string;
  badge?: string;
  statutoryNotice?: boolean;
}

export const ROOFING_FAQS: FaqItem[] = [
  {
    id: 'faq-hb2102',
    category: 'INSURANCE',
    question: 'Can a roofing contractor in Texas legally waive or pay my insurance deductible?',
    badge: 'Texas Law HB 2102',
    statutoryNotice: true,
    answer:
      'No. Under Texas House Bill 2102 (Texas Insurance Code Chapter 707, § 707.002), it is a state violation and crime for any roofing contractor to pay, waive, absorb, rebate, or promise to offset all or part of an insurance deductible. Any roofer who offers to "eat your deductible" or submit inflated invoices to cover your deductible is committing insurance fraud, which exposes the homeowner to felony liability and can void the entire insurance claim. The Roof Doctors operates with 100% legal compliance, providing transparent itemized Xactimate scopes and formal deductible verification certificates for your insurer.',
  },
  {
    id: 'faq-hail-damage',
    category: 'STORM',
    question: 'How do I know if my roof has hail damage if it is not currently leaking into the house?',
    badge: 'Storm Diagnostic',
    answer:
      'Hail damage rarely causes an immediate puncture or active drip into your ceiling. Instead, hail stones crush and bruise the asphalt fiberglass matting, dislodging the ceramic protective mineral granules. Once granules are knocked loose, the underlying raw asphalt is exposed to Northeast Texas UV radiation, rapidly decomposing the shingle. Over the next 6 to 18 months, thermal shock turns those bruised spots into severe leaks—often long after your insurance filing deadline has expired. An objective physical walk by The Roof Doctors documents granule loss, gutter debris, and soft metal dents with forensic photos before damage worsens.',
  },
  {
    id: 'faq-insurance-process',
    category: 'INSURANCE',
    question: 'Does homeowners insurance cover a full roof replacement after a wind or hail event?',
    badge: 'Insurance Coverage',
    answer:
      'Yes, if storm impact has caused functional damage across your roof slopes, most replacement cost value (RCV) policies in Texas will cover the full replacement cost, minus your statutory deductible. The Roof Doctors assists homeowners by providing objective photographic evidence and exact aerial measurements. We also meet directly with your insurance carrier\'s adjuster on your roof to ensure all components—including ice & water shield, valley metal, step flashings, and ridge vents—are properly documented on the carrier scope.',
  },
  {
    id: 'faq-cost',
    category: 'COST',
    question: 'How much does a new residential roof replacement cost in Texarkana and Northeast Texas?',
    badge: 'Transparent Pricing',
    answer:
      'For most standard residential homes (20 to 45 squares) in Northeast Texas, a complete architectural shingle roof replacement ranges between $7,500 and $18,500. The final investment depends on total square footage, pitch/slope steepness, waste factor, and whether deteriorated wood decking must be replaced. Class 4 impact-resistant shingles or standing seam metal systems carry a higher upfront investment but qualify homeowners for up to 25% annual discounts on their Texas home insurance premiums. The Roof Doctors provides guaranteed, itemized estimates with zero hidden costs.',
  },
  {
    id: 'faq-free-inspection',
    category: 'INSPECTION',
    question: 'Is your 21-point roof diagnostic inspection really 100% free with no obligation?',
    badge: 'Zero Pressure',
    answer:
      'Yes. Our 21-point physical roof diagnostic is 100% free for homeowners across Northeast Texas and Southwest Arkansas. A certified diagnostic inspector physically ascends your roof, tests shingle adhesion, checks flashing integrity around chimneys and valleys, inspects the attic for concealed leaks or moisture rot, and provides high-resolution photo documentation. If your roof is sound and only needs minor maintenance or nothing at all, we tell you directly with zero sales pressure.',
  },
  {
    id: 'faq-duration',
    category: 'MATERIALS',
    question: 'How long does a residential roof tear-off and replacement take from start to finish?',
    badge: '1–2 Day Turnaround',
    answer:
      'For the vast majority of standard residential homes (25 to 50 squares), our experienced production crews complete the entire process in just 1 to 2 days, weather permitting. We completely protect your landscaping, shrubbery, and lawn with heavy tarps during tear-off and conduct a continuous triple-pass magnetic sweep for stray nails so your driveway and yard remain clean and safe for children and pets.',
  },
  {
    id: 'faq-shingle-comparison',
    category: 'MATERIALS',
    question: 'What is the difference between standard 3-tab shingles and architectural shingles?',
    badge: 'Material Specs',
    answer:
      'Standard 3-tab shingles are a single flat layer, carry a 60 MPH wind rating, and typically last 15 to 20 years. Modern architectural (laminated/dimensional) shingles feature two bonded layers, provide high-definition shadow lines, carry a 130 MPH wind rating, and come with manufacturer lifetime warranties. In storm-prone Northeast Texas, architectural and Class 4 impact-resistant shingles resist hail bruising and wind uplift substantially better than traditional 3-tab shingles.',
  },
  {
    id: 'faq-emergency-leak',
    category: 'STORM',
    question: 'What should I do if an active leak or roof breach occurs during a severe storm?',
    badge: '24/7 Emergency Dispatch',
    answer:
      'First, prioritize family safety: avoid areas with sagging drywall and place containers to prevent water spreading across floors. Second, take clear photos and videos of active intrusion for insurance documentation. Third, call The Roof Doctors emergency dispatch line immediately at 903-231-5940. Our rapid response crew will dispatch to perform emergency roof tarping and weatherproofing, stopping water intrusion immediately and preventing costly secondary structural damage.',
  },
  {
    id: 'faq-warranties',
    category: 'MATERIALS',
    question: 'What warranties and workmanship guarantees protect my new roof?',
    badge: 'Dual Protection',
    answer:
      'Every complete roof replacement from The Roof Doctors comes with dual-tier protection: (1) A Manufacturer Lifetime Limited Warranty covering shingle material defects, algal resistance, and wind blow-off up to 130 MPH, and (2) The Roof Doctors Comprehensive Craftsmanship Workmanship Guarantee covering installation integrity, flashings, valley seals, and leak prevention.',
  },
  {
    id: 'faq-service-area',
    category: 'INSPECTION',
    question: 'Do you service both the Texas and Arkansas sides of Texarkana and rural communities?',
    badge: 'Regional Coverage',
    answer:
      'Yes. Headquartered in Texarkana, The Roof Doctors serves both Bowie County, TX and Miller County, AR, as well as Cass, Lamar, Hopkins, Gregg, Smith, and Harrison Counties. Our service corridor regularly includes Texarkana, Atlanta, New Boston, Paris, Sulphur Springs, Longview, Tyler, Marshall, and Mount Pleasant.',
  },
];

/**
 * Generate Schema.org FAQPage structured data for Google rich snippets / People Also Ask
 */
export function getFaqPageSchema(): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: ROOFING_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

interface FaqSectionProps {
  onOpenIntake: (type?: 'DIAGNOSTIC' | 'STORM' | 'EMERGENCY' | 'REPLACEMENT') => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ onOpenIntake }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'faq-hb2102': true,
    'faq-hail-damage': true,
  });

  const categories = [
    { id: 'ALL', label: 'All Questions' },
    { id: 'STORM', label: 'Storm & Hail Damage' },
    { id: 'INSURANCE', label: 'Insurance & Texas HB 2102' },
    { id: 'COST', label: 'Pricing & Estimates' },
    { id: 'INSPECTION', label: 'Inspection & Process' },
    { id: 'MATERIALS', label: 'Materials & Warranties' },
  ];

  const filteredFaqs = useMemo(() => {
    return ROOFING_FAQS.filter((faq) => {
      const matchesCategory =
        selectedCategory === 'ALL' || faq.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q) ||
        (faq.badge && faq.badge.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const allOpen: Record<string, boolean> = {};
    filteredFaqs.forEach((faq) => {
      allOpen[faq.id] = true;
    });
    setOpenItems(allOpen);
  };

  const collapseAll = () => {
    setOpenItems({});
  };

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 bg-slate-50 border-t border-slate-200 scroll-mt-16">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Section Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Google "People Also Ask" Knowledge Base</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tight">
            Frequently Asked Roofing Questions
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Straightforward answers to the most common questions Northeast Texas homeowners ask regarding storm damage, insurance claims, Texas deductible laws, and replacement pricing.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search questions by keyword (e.g. deductible, hail, cost, insurance, warranty)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-600 focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <button
                onClick={expandAll}
                className="hover:text-slate-900 underline transition-colors cursor-pointer"
              >
                Expand all
              </button>
              <span>•</span>
              <button
                onClick={collapseAll}
                className="hover:text-slate-900 underline transition-colors cursor-pointer"
              >
                Collapse all
              </button>
            </div>
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-base font-bold text-slate-800">
                No matching questions found
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No questions matched your search query "{searchQuery}". Try searching for words like "insurance", "hail", "cost", or clear your filter.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                }}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = !!openItems[faq.id];
              return (
                <div
                  key={faq.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'border-slate-300 shadow-md ring-1 ring-slate-900/5'
                      : 'border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 cursor-pointer focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {faq.badge && (
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                              faq.statutoryNotice
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                          >
                            {faq.badge}
                          </span>
                        )}
                        <span className="text-[11px] font-semibold text-slate-400">
                          {faq.category.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {faq.question}
                      </h3>
                    </div>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                        isOpen
                          ? 'rotate-180 bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-6 sm:px-6 sm:pb-6 pt-1 text-slate-600 text-sm leading-relaxed border-t border-slate-100 space-y-3">
                      {faq.statutoryNotice && (
                        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-start gap-2.5">
                          <BadgeAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                          <div className="leading-relaxed">
                            <strong>Official Statutory Warning:</strong> It is a crime under Texas Insurance Code § 707.002 to waive or absorb any portion of a homeowner's insurance deductible. Always work with licensed, compliant contractors.
                          </div>
                        </div>
                      )}
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Direct Assistance Callout */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-slate-800">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Need Specific Technical or Claim Guidance?</span>
            </div>
            <h4 className="text-xl sm:text-2xl font-black tracking-tight">
              Have Questions About Your Roof or Adjuster Meeting?
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Our certified diagnostic specialists are on call to review your roof photos, evaluate hail conditions, or schedule a free 21-point on-site evaluation.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={() => onOpenIntake('DIAGNOSTIC')}
              className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Book Free Diagnostic</span>
            </button>
            <a
              href="tel:9032315940"
              className="w-full sm:w-auto px-5 py-3 border border-slate-700 hover:bg-slate-800 text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4 text-red-500" />
              <span>903-231-5940</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
