import { PUBLIC_BLOG_API, residentialBlogMetadata } from '../../../../../../shared/seo/blog.ts';
import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, Clock3, Search } from 'lucide-react';
import { SeoHead } from '../../common/SeoHead.tsx';

type Section = { heading: string; paragraphs: string[] };
type Post = { slug: string; title: string; excerpt: string; category: string; date: string; readTime: string; image: string; alt: string; sections: Section[]; body_markdown?: string; seoTitle?: string; seoDescription?: string; publishedAt?: string };


const BLOG_API = PUBLIC_BLOG_API;

function renderMarkdown(markdown: string) {
  return markdown.split(/\n\s*\n/).map((raw, index) => {
    const block = raw.trim();
    if (!block) return null;
    const heading = block.match(/^(#{2,3})\s+(.+)$/);
    if (heading) return heading[1].length === 2
      ? <h2 key={index} className="text-2xl font-bold my-5">{heading[2]}</h2>
      : <h3 key={index} className="text-xl font-bold my-4">{heading[2]}</h3>;
    const lines = block.split('\n');
    if (lines.every((line) => /^\s*[-*]\s+/.test(line))) {
      return <ul key={index} className="list-disc pl-6 my-4 space-y-2">{lines.map((line, i) => <li key={i}>{line.replace(/^\s*[-*]\s+/, '')}</li>)}</ul>;
    }
    if (lines.every((line) => /^\s*\d+\.\s+/.test(line))) {
      return <ol key={index} className="list-decimal pl-6 my-4 space-y-2">{lines.map((line, i) => <li key={i}>{line.replace(/^\s*\d+\.\s+/, '')}</li>)}</ol>;
    }
    return <p key={index} className="text-base leading-8 mb-4">{lines.join(' ')}</p>;
  });
}

const starterImages: Record<string, string> = {
  'repair-or-replace-your-roof': '/assets/images/old_damaged_shingles.jpg',
  'what-to-do-after-a-hailstorm': '/assets/images/hail_damage_shingles.jpg',
  'how-long-does-an-asphalt-shingle-roof-last': '/assets/images/new_roof_install.jpg',
};

function mapPublishedPost(row: Record<string, any>): Post {
  const body = String(row.body_markdown || '');
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  const publishedAt = String(row.published_at || row.created_at || '');
  return {
    slug: String(row.slug), title: String(row.title), excerpt: String(row.excerpt || ''),
    category: String(row.category || 'General'),
    date: publishedAt ? new Date(publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '',
    readTime: Math.max(1, Math.ceil(words / 220)) + ' min read',
    image: String(row.featured_image_url || starterImages[String(row.slug)] || '/assets/images/old_damaged_shingles.jpg'),
    alt: String(row.featured_image_alt || ''),
    sections: [], body_markdown: body,
    seoTitle: row.seo_title ? String(row.seo_title) : undefined,
    seoDescription: row.seo_description ? String(row.seo_description) : undefined,
    publishedAt,
  };
}

const posts: Post[] = [
  {
    slug: 'repair-or-replace-your-roof',
    title: 'Repair or Replace Your Roof? How to Make a Sound Decision',
    excerpt: 'Age matters, but it is only one part of the decision. Learn how roof condition, repair history, ventilation, and the extent of damage should guide your next step.',
    category: 'Roof Replacement & Costs', date: 'October 31, 2026', readTime: '6 min read',
    image: '/assets/images/old_damaged_shingles.jpg', alt: 'Worn asphalt shingles on a residential roof',
    sections: [
      { heading: 'Start with the condition, not the calendar', paragraphs: ['A roof’s age is useful context, but it does not tell the whole story. Two roofs installed in the same year can have very different remaining service lives because of installation quality, ventilation, weather exposure, maintenance, and the roofing material itself.', 'A useful evaluation documents shingle condition, flashing, penetrations, valleys, drainage, attic ventilation, and any signs of moisture below the roof surface.'] },
      { heading: 'When a repair may make sense', paragraphs: ['A targeted repair may be appropriate when damage is isolated, the surrounding roofing remains serviceable, and the repair can be completed without creating new vulnerabilities. Examples can include a damaged pipe boot, localized flashing failure, or a limited area of wind damage.', 'The repair should address the source of the problem, not simply cover the visible symptom. Ask for photographs and a clear explanation of what failed.'] },
      { heading: 'When replacement deserves serious consideration', paragraphs: ['Widespread granule loss, recurring leaks in multiple areas, brittle or failing shingles, extensive storm damage, and repeated repairs can indicate that patching is no longer the most dependable option.', 'A professional inspection should explain the evidence, outline practical options, and identify any decking or ventilation concerns that could affect a new roof.'] },
      { heading: 'Get the findings in writing', paragraphs: ['Compare documented condition and scope rather than relying on a verbal age estimate. A good recommendation should explain what was inspected, what was found, what can be repaired, and why replacement may or may not be justified.', 'The Roof Doctors provides residential roof inspections and clear recommendations for homeowners across Northeast Texas.'] }
    ]
  },
  {
    slug: 'what-to-do-after-a-hailstorm',
    title: 'What Homeowners Should Do After a Hailstorm',
    excerpt: 'A practical, safety-first checklist for documenting possible roof damage and deciding when to request a professional inspection.',
    category: 'Hail & Storm Damage', date: 'October 31, 2026', readTime: '5 min read',
    image: '/assets/images/hail_damage_shingles.jpg', alt: 'Hail impact damage on asphalt roof shingles',
    sections: [
      { heading: 'Put safety first', paragraphs: ['Do not climb onto a wet, steep, or storm-damaged roof. Look for visible damage from the ground and keep clear of downed power lines, unstable trees, and damaged structures.', 'If water is entering the home, protect belongings where it is safe to do so and arrange appropriate emergency mitigation.'] },
      { heading: 'Document what you can see', paragraphs: ['Take dated photos of visible exterior damage, ceiling stains, damaged screens, gutters, and other affected property. Keep notes about when the storm occurred and when leaks were first noticed.', 'Avoid disturbing damaged materials before they have been documented unless immediate action is necessary to prevent further damage.'] },
      { heading: 'Request a roof inspection', paragraphs: ['Hail impacts are not always obvious from the ground. A qualified inspection can document roof surfaces, soft metals, flashings, and related components with photographs and written observations.', 'Not every storm produces functional roof damage. The inspection should distinguish cosmetic marks from conditions that affect the roof’s ability to perform.'] },
      { heading: 'Understand your policy and deadlines', paragraphs: ['Review your insurance policy and contact your insurer if you believe a covered loss occurred. Coverage, deductibles, exclusions, and reporting deadlines depend on the policy and applicable law.', 'A roofing contractor can document observed conditions and explain the construction scope. Coverage decisions are made by the insurer, not the contractor.'] }
    ]
  },
  {
    slug: 'how-long-does-an-asphalt-shingle-roof-last',
    title: 'How Long Does an Asphalt Shingle Roof Really Last?',
    excerpt: 'Understand the factors that influence roof life, from installation and attic ventilation to weather exposure and maintenance.',
    category: 'Roofing Materials & Shingles', date: 'October 31, 2026', readTime: '5 min read',
    image: '/assets/images/new_roof_install.jpg', alt: 'New architectural asphalt shingles being installed',
    sections: [
      { heading: 'There is no single lifespan for every roof', paragraphs: ['Published service-life expectations are estimates, not guarantees. Actual performance depends on the shingle product, installation details, roof design, climate, ventilation, maintenance, and storm exposure.', 'Manufacturer warranties also have specific terms and limitations. A warranty period should not be treated as a promise that a roof will need no maintenance or last for that entire period.'] },
      { heading: 'Installation details matter', paragraphs: ['Correct underlayment, flashing, starter courses, fastening, ventilation, and manufacturer-compliant installation all contribute to roof performance. Weak details can become leak paths long before shingles reach the end of their expected service life.', 'Workmanship and product documentation are worth keeping with your home records.'] },
      { heading: 'Watch for changes over time', paragraphs: ['Look for recurring leaks, lifted or missing shingles, exposed fasteners, damaged flashing, granule accumulation, and staining in attic spaces. These observations do not all mean replacement is necessary, but they warrant attention.', 'After significant hail or wind, a focused inspection can help establish whether the roof was affected.'] },
      { heading: 'Use inspections to plan ahead', paragraphs: ['Periodic professional evaluations help homeowners understand current condition and budget for repairs or eventual replacement. The right interval depends on roof age, condition, and recent weather events.', 'The Roof Doctors can document the roof’s condition and discuss repair and replacement options without assuming that every roof needs to be replaced.'] }
    ]
  }
];

export const BlogPage: React.FC<{ currentPath: string; onNavigate: (path: string) => void; onOpenIntake: () => void }> = ({ currentPath, onNavigate, onOpenIntake }) => {
  const [category, setCategory] = useState('All Articles');
  const [query, setQuery] = useState('');
  const [remotePosts, setRemotePosts] = useState<Post[]>([]);
  const slug = currentPath.startsWith('/blog/') ? currentPath.slice('/blog/'.length) : '';
  useEffect(() => {
    let active = true;
    fetch(BLOG_API + '?division=TRD')
      .then((response) => { if (!response.ok) throw new Error('Blog feed unavailable'); return response.json(); })
      .then((data) => { if (active) setRemotePosts(Array.isArray(data.posts) ? data.posts.map(mapPublishedPost) : []); })
      .catch((error) => console.warn('Unable to load TRD blog posts:', error));
    return () => { active = false; };
  }, []);
  const allPosts = useMemo(() => {
    const remoteSlugs = new Set(remotePosts.map((post) => post.slug));
    return [...remotePosts, ...posts.filter((post) => !remoteSlugs.has(post.slug))];
  }, [remotePosts]);
  const categories = useMemo(() => ['All Articles', ...Array.from(new Set(allPosts.map((post) => post.category)))], [allPosts]);
  const article = allPosts.find((post) => post.slug === slug);
  const visiblePosts = useMemo(() => allPosts.filter((post) => (category === 'All Articles' || post.category === category) && (post.title + ' ' + post.excerpt).toLowerCase().includes(query.toLowerCase())), [allPosts, category, query]);

  if (slug && article) {
    return <div className="flex-1 bg-white"><SeoHead {...residentialBlogMetadata(article)} /><div className="max-w-4xl mx-auto px-5 py-12 sm:py-16"><button onClick={() => onNavigate('/blog')} className="text-sm font-bold text-red-600 mb-8">← All articles</button><div className="text-xs font-bold uppercase tracking-widest text-red-600">{article.category} · {article.readTime}</div><h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950 mt-3 mb-5">{article.title}</h1><p className="text-lg text-slate-600 leading-relaxed mb-8">{article.excerpt}</p><img src={article.image} alt={article.alt} className="w-full max-h-[460px] object-cover mb-10" /><div className="prose prose-slate max-w-none">{article.body_markdown ? renderMarkdown(article.body_markdown) : article.sections.map((section) => <section key={section.heading} className="mb-8"><h2 className="text-2xl font-bold text-slate-900 mb-3">{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph} className="text-base leading-8 text-slate-700 mb-4">{paragraph}</p>)}</section>)}</div><div className="mt-12 p-7 bg-slate-950 text-white"><h2 className="text-2xl font-bold mb-2">Have questions about your roof?</h2><p className="text-slate-300 mb-5">Get a documented residential roof inspection and straightforward recommendations.</p><button onClick={onOpenIntake} className="bg-red-600 hover:bg-red-700 px-5 py-3 font-bold text-sm">Request an Inspection <ArrowRight className="inline w-4 h-4 ml-1" /></button></div></div></div>;
  }

  return <div className="flex-1 bg-slate-50"><SeoHead title="Residential Roofing Blog & Homeowner Guides | The Roof Doctors" description="Practical homeowner guidance on roof replacement, repairs, hail and storm damage, roofing materials, and maintenance across Northeast Texas." canonicalPath="/blog" /><section className="bg-slate-950 text-white py-16 sm:py-20 px-5"><div className="max-w-7xl mx-auto"><div className="text-xs uppercase tracking-[.22em] text-red-400 font-bold mb-4">The Roof Doctors · Homeowner Resources</div><h1 className="text-4xl sm:text-6xl font-black tracking-tight max-w-4xl">Residential Roofing <span className="text-red-500">Insights.</span></h1><p className="text-slate-300 max-w-2xl mt-5 text-lg leading-relaxed">Clear, practical information to help homeowners understand roof condition, storm damage, repairs, and replacement decisions.</p></div></section><section className="max-w-7xl mx-auto px-5 py-12"><div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-8"><div className="flex flex-wrap gap-2">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`px-3 py-2 text-xs font-bold border ${category === item ? 'bg-slate-950 text-white border-slate-950' : 'bg-white text-slate-600 border-slate-200 hover:border-red-400'}`}>{item}</button>)}</div><label className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 min-w-64"><Search className="w-4 h-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search articles" className="outline-none text-sm w-full" /></label></div><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">{visiblePosts.map((post) => <article key={post.slug} className="bg-white border border-slate-200 group"><button onClick={() => onNavigate('/blog/' + post.slug)} className="block w-full text-left"><img src={post.image} alt={post.alt} className="w-full h-56 object-cover" /><div className="p-6"><div className="text-[11px] uppercase tracking-wider font-bold text-red-600 mb-3">{post.category}</div><h2 className="text-xl font-extrabold leading-snug text-slate-950 group-hover:text-red-600">{post.title}</h2><p className="text-sm text-slate-600 leading-relaxed mt-3">{post.excerpt}</p><div className="flex items-center gap-4 text-[11px] text-slate-500 mt-5"><span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" />{post.date}</span><span className="flex items-center gap-1"><Clock3 className="w-3.5 h-3.5" />{post.readTime}</span></div><span className="inline-flex items-center gap-2 mt-5 text-sm font-bold text-red-600">Read article <ArrowRight className="w-4 h-4" /></span></div></button></article>)}</div>{visiblePosts.length === 0 && <p className="py-16 text-center text-slate-500">No articles match that search.</p>}</section></div>;
};
