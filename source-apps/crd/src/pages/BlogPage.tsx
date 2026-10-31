import React, { useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, Clock3, Search } from 'lucide-react';
import { SeoMeta } from '../components/SeoMeta';
import { Link } from '../router';
import { LeadType } from '../types';

type Section = { heading: string; paragraphs: string[] };
type Post = { slug: string; title: string; excerpt: string; category: string; date: string; readTime: string; image: string; alt: string; sections: Section[] };

const posts: Post[] = [
  {
    slug: 'commercial-roof-coatings-vs-replacement',
    title: 'Commercial Roof Coatings vs. Replacement: How to Evaluate the Options',
    excerpt: 'A coating is not the right answer for every roof. Learn which conditions should be evaluated before comparing restoration with tear-off and replacement.',
    category: 'Coatings & Restoration', date: 'October 31, 2026', readTime: '7 min read',
    image: '/assets/images/commercial_roof_coating_1788537043385.jpg', alt: 'Fluid-applied coating being installed on a commercial roof',
    sections: [
      { heading: 'Begin with the existing roof assembly', paragraphs: ['A restoration decision starts with a condition assessment, not a coating product. The evaluation should identify the existing membrane or metal system, roof age and repair history, moisture conditions, drainage, seams, penetrations, flashings, and substrate integrity.', 'The purpose is to determine whether the existing assembly is a suitable candidate for restoration and what preparation or repairs would be required.'] },
      { heading: 'Conditions that can support restoration', paragraphs: ['A roof with a serviceable substrate, manageable moisture conditions, sound attachment, and repairable details may be a candidate for a properly specified restoration system. The selected chemistry must be compatible with the existing roof and intended service conditions.', 'Preparation is critical. Cleaning, repairs, adhesion testing where required, reinforcement, and correct application thickness are part of the system, not optional extras.'] },
      { heading: 'When replacement may be the responsible choice', paragraphs: ['Extensive trapped moisture, saturated insulation, widespread structural deterioration, severe deck issues, or an assembly that cannot be reliably prepared may make restoration unsuitable. Building use, code requirements, warranty objectives, and long-term capital plans also matter.', 'A responsible proposal should identify exclusions and explain why the recommended scope is appropriate for the roof that was actually inspected.'] },
      { heading: 'Compare lifecycle value, not just initial price', paragraphs: ['Compare the complete scope, preparation, insulation implications, disruption, warranty terms, maintenance expectations, and expected service life. Avoid assuming a coating automatically delivers a specific energy saving or tax benefit.', 'Commercial Roof Doctors evaluates commercial roof systems and restoration options across Texas, Arkansas, Louisiana, and Oklahoma.'] }
    ]
  },
  {
    slug: 'tpo-vs-epdm-commercial-roofing',
    title: 'TPO vs. EPDM: Comparing Two Common Commercial Roofing Systems',
    excerpt: 'Understand the practical differences in membrane composition, seams, detailing, maintenance, and project considerations.',
    category: 'Roof Systems', date: 'October 31, 2026', readTime: '6 min read',
    image: '/assets/images/commercial_logistics_tpo_1788537681612.jpg', alt: 'Commercial building with a single-ply membrane roof',
    sections: [
      { heading: 'Different materials, different installation methods', paragraphs: ['TPO is a thermoplastic single-ply membrane commonly installed with heat-welded seams. EPDM is a synthetic rubber membrane that uses system-specific seam tapes, adhesives, and detailing components.', 'Neither system is automatically best for every building. Design, substrate, insulation, wind requirements, roof geometry, contractor experience, and manufacturer specifications should guide selection.'] },
      { heading: 'Details and transitions deserve attention', paragraphs: ['Penetrations, drains, curbs, perimeter edges, expansion joints, and transitions are frequent sources of roof performance problems when they are poorly designed or installed.', 'A bid comparison should make these details visible instead of focusing only on the membrane name or thickness.'] },
      { heading: 'Maintenance and repair considerations', paragraphs: ['Both systems require periodic inspection and maintenance. Keep drains clear, monitor seams and flashings, address punctures promptly, and document repairs. Use materials and procedures approved for the specific membrane system.', 'Existing roof conditions may influence whether a repair, recover, restoration, or full replacement is technically appropriate.'] },
      { heading: 'Specify the whole assembly', paragraphs: ['Evaluate membrane, insulation, cover board, attachment method, vapor control, edge metal, drainage, and warranty requirements as one roof assembly. Confirm code and manufacturer requirements for the actual project.', 'A documented roof assessment helps owners compare options on a consistent basis.'] }
    ]
  },
  {
    slug: 'commercial-roof-coatings-energy-performance',
    title: 'Can Commercial Roof Coatings Help with Building Energy Performance?',
    excerpt: 'Reflective roof surfaces can influence solar heat gain, but real results depend on climate, insulation, HVAC, roof condition, and the complete building.',
    category: 'Energy & Building Performance', date: 'October 31, 2026', readTime: '5 min read',
    image: '/assets/images/commercial-roof-restoration.jpg', alt: 'Restored commercial roof surface',
    sections: [
      { heading: 'Understand reflectivity and emittance', paragraphs: ['Some roof coating systems are designed to create a reflective surface that can reduce the amount of solar energy absorbed by a roof. The effect on building energy use depends on many factors, including climate, insulation levels, HVAC efficiency, occupancy, roof area, and operating schedules.', 'A reflective coating is not a substitute for sound insulation, air sealing, or properly maintained mechanical equipment.'] },
      { heading: 'Start with the roof and the building', paragraphs: ['Before projecting savings, document the existing roof assembly, current surface condition, insulation, moisture, and HVAC configuration. A building energy assessment may be needed to estimate potential changes in cooling demand.', 'Do not assume a published product rating translates directly into a guaranteed utility-bill reduction for a specific property.'] },
      { heading: 'Consider the complete restoration scope', paragraphs: ['A roof coating project may require repairs, cleaning, primer, reinforcement at seams and penetrations, and application at a specified dry-film thickness. The proposal should identify the tested system, substrate compatibility, preparation, and warranty.', 'If the roof has extensive moisture or structural concerns, the right solution may involve more than a surface coating.'] },
      { heading: 'Verify incentives before including them in a budget', paragraphs: ['Tax treatment and energy incentives depend on current law, project facts, ownership, and applicable program rules. Owners should confirm eligibility with their tax and energy advisors before relying on an incentive in a project decision.', 'Commercial Roof Doctors can help document roof conditions and compare restoration and replacement scopes.'] }
    ]
  }
];

const categories = ['All Articles', ...Array.from(new Set(posts.map((post) => post.category)))];

export const BlogPage: React.FC<{ currentPath: string; onOpenInspection: (type?: LeadType) => void }> = ({ currentPath, onOpenInspection }) => {
  const [category, setCategory] = useState('All Articles');
  const [query, setQuery] = useState('');
  const slug = currentPath.startsWith('/blog/') ? currentPath.slice('/blog/'.length) : '';
  const article = posts.find((post) => post.slug === slug);
  const visiblePosts = useMemo(() => posts.filter((post) => (category === 'All Articles' || post.category === category) && (post.title + ' ' + post.excerpt).toLowerCase().includes(query.toLowerCase())), [category, query]);

  if (slug && article) {
    const canonical = 'https://theroofingdrs.com/commercial/blog/' + article.slug;
    return <div className="flex-1 bg-[#f4f3ef]"><SeoMeta title={article.title + ' | Commercial Roof Doctors Insights'} description={article.excerpt} canonicalPath={'/blog/' + article.slug} /><article className="max-w-4xl mx-auto px-5 py-14 sm:py-20"><Link to="/blog" className="inline-block text-sm font-bold text-[#a8750f] mb-8">← All insights</Link><div className="font-mono-crd text-xs uppercase tracking-widest text-[#a8750f] mb-3">{article.category} · {article.readTime}</div><h1 className="font-heading text-4xl sm:text-6xl font-black tracking-tight text-[#181818] mb-5">{article.title}</h1><p className="text-lg text-[#666666] leading-relaxed mb-8">{article.excerpt}</p><img src={article.image} alt={article.alt} className="w-full max-h-[480px] object-cover mb-10" /><div className="max-w-3xl">{article.sections.map((section) => <section key={section.heading} className="mb-9"><h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#181818] mb-3">{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph} className="text-base leading-8 text-[#555555] mb-4">{paragraph}</p>)}</section>)}</div><div className="mt-12 bg-[#181818] text-white p-8 sm:p-10"><div className="font-mono-crd text-xs uppercase tracking-widest text-[#d99a19] mb-3">Commercial Roof Doctors</div><h2 className="font-heading text-3xl sm:text-4xl font-bold mb-3">Make the next roof decision with better information.</h2><p className="text-[#cccccc] mb-6">Request a commercial roof inspection and a documented evaluation of your property.</p><button onClick={() => onOpenInspection('Inspection')} className="crd-button-accent">Request a Roof Assessment <ArrowRight className="inline w-4 h-4 ml-2" /></button></div></article></div>;
  }

  return <div className="flex-1 bg-[#f4f3ef]"><SeoMeta title="Commercial Roofing Insights & Restoration Guides" description="Technical commercial roofing guidance on coatings, restoration, TPO, EPDM, roof maintenance, energy performance, and replacement planning." canonicalPath="/blog" /><section className="bg-[#181818] text-white py-16 sm:py-20"><div className="max-w-7xl mx-auto px-5"><div className="font-mono-crd text-xs uppercase tracking-[.22em] text-[#d99a19] mb-4">Commercial Roof Doctors · Technical Resources</div><h1 className="font-heading text-5xl sm:text-7xl font-black tracking-tight max-w-4xl">Commercial Roofing <span className="text-[#d99a19]">Field Notes.</span></h1><p className="text-[#cccccc] max-w-2xl mt-5 text-lg leading-relaxed">Practical information for property owners, facility managers, and building operators evaluating roof repair, restoration, and replacement.</p></div></section><section className="max-w-7xl mx-auto px-5 py-12"><div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-8"><div className="flex flex-wrap gap-2">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`px-3 py-2 text-xs font-bold border ${category === item ? 'bg-[#181818] text-white border-[#181818]' : 'bg-white text-[#555555] border-[#dedbd4] hover:border-[#d99a19]'}`}>{item}</button>)}</div><label className="flex items-center gap-2 bg-white border border-[#dedbd4] px-3 py-2 min-w-64"><Search className="w-4 h-4 text-[#888888]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search insights" className="outline-none text-sm w-full bg-transparent" /></label></div><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">{visiblePosts.map((post) => <article key={post.slug} className="bg-white border border-[#dedbd4] group"><Link to={'/blog/' + post.slug} className="block"><img src={post.image} alt={post.alt} className="w-full h-56 object-cover" /><div className="p-6"><div className="font-mono-crd text-[11px] uppercase tracking-wider text-[#a8750f] mb-3">{post.category}</div><h2 className="font-heading text-2xl font-bold leading-tight text-[#181818] group-hover:text-[#a8750f]">{post.title}</h2><p className="text-sm text-[#666666] leading-relaxed mt-3">{post.excerpt}</p><div className="flex items-center gap-4 text-[11px] text-[#777777] mt-5"><span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" />{post.date}</span><span className="flex items-center gap-1"><Clock3 className="w-3.5 h-3.5" />{post.readTime}</span></div><span className="inline-flex items-center gap-2 mt-5 text-sm font-bold text-[#a8750f]">Read field note <ArrowRight className="w-4 h-4" /></span></div></Link></article>)}</div>{visiblePosts.length === 0 && <p className="py-16 text-center text-[#777777]">No articles match that search.</p>}</section></div>;
};
