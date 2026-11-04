import React, { useState } from 'react';
import { SeoHead } from '../../common/SeoHead.tsx';
import {
  Image as ImageIcon,
  CheckCircle2,
  CalendarCheck,
  PhoneCall,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Maximize2,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface GalleryPageProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenIntake: (type?: 'DIAGNOSTIC' | 'STORM' | 'EMERGENCY' | 'REPLACEMENT') => void;
}

interface GalleryItem {
  id: string;
  title: string;
  category: 'installation' | 'systems' | 'inspection' | 'repairs';
  categoryLabel: string;
  location: string;
  imageUrl: string;
  beforeImageUrl?: string;
  description: string;
  specs: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gallery-01',
    title: 'Residential roof installation',
    category: 'installation',
    categoryLabel: 'Roof Installation',
    location: 'Residential roofing',
    imageUrl: '/assets/images/library/residential-roof-installation-01.jpg',
    description: 'Photograph illustrating a residential roof installation. Contact our team to discuss the materials and scope appropriate for your property.',
    specs: 'Installation imagery',
  },
  {
    id: 'gallery-02',
    title: 'Residential roof installation detail',
    category: 'installation',
    categoryLabel: 'Roof Installation',
    location: 'Residential roofing',
    imageUrl: '/assets/images/library/residential-roof-installation-02.jpg',
    description: 'A closer look at residential roofing work. Specific products and project details are confirmed individually.',
    specs: 'Installation imagery',
  },
  {
    id: 'gallery-03',
    title: 'Residential roof installation',
    category: 'installation',
    categoryLabel: 'Roof Installation',
    location: 'Residential roofing',
    imageUrl: '/assets/images/library/residential-roof-installation-03.jpg',
    description: 'Residential installation photography for homeowners comparing roofing approaches.',
    specs: 'Installation imagery',
  },
  {
    id: 'gallery-04',
    title: 'Residential roof installation detail',
    category: 'installation',
    categoryLabel: 'Roof Installation',
    location: 'Residential roofing',
    imageUrl: '/assets/images/library/residential-roof-installation-04.jpg',
    description: 'A visual reference for residential roofing work and installation details.',
    specs: 'Installation imagery',
  },
  {
    id: 'gallery-05',
    title: 'Residential roof installation',
    category: 'installation',
    categoryLabel: 'Roof Installation',
    location: 'Residential roofing',
    imageUrl: '/assets/images/library/residential-roof-installation-05.jpg',
    description: 'Residential roofing photography. Actual project specifications vary by property and selected system.',
    specs: 'Installation imagery',
  },
  {
    id: 'gallery-06',
    title: 'Residential roof installation detail',
    category: 'installation',
    categoryLabel: 'Roof Installation',
    location: 'Residential roofing',
    imageUrl: '/assets/images/library/residential-roof-installation-06.jpg',
    description: 'A further example of residential roofing installation imagery.',
    specs: 'Installation imagery',
  },
  {
    id: 'gallery-07',
    title: 'Residential metal roofing',
    category: 'systems',
    categoryLabel: 'Metal Roofing',
    location: 'Residential roofing',
    imageUrl: '/assets/images/library/residential-metal-roof-01.jpg',
    description: 'Metal roofing imagery to help explore roof appearance and system options.',
    specs: 'Metal roofing',
  },
  {
    id: 'gallery-08',
    title: 'Residential metal roofing detail',
    category: 'systems',
    categoryLabel: 'Metal Roofing',
    location: 'Residential roofing',
    imageUrl: '/assets/images/library/residential-metal-roof-02.jpg',
    description: 'A closer visual reference for residential metal roofing.',
    specs: 'Metal roofing',
  },
  {
    id: 'gallery-09',
    title: 'Residential roof repair detail',
    category: 'repairs',
    categoryLabel: 'Repairs & Flashing',
    location: 'Residential roofing',
    imageUrl: '/assets/images/library/residential-chimney-flashing.jpg',
    description: 'Roof-to-wall and chimney flashing imagery. The correct repair depends on the existing roof assembly and site conditions.',
    specs: 'Repair detail',
  },
  {
    id: 'gallery-10',
    title: 'Residential roof repair',
    category: 'repairs',
    categoryLabel: 'Repairs & Flashing',
    location: 'Residential roofing',
    imageUrl: '/assets/images/library/residential-roof-repair.jpg',
    description: 'Residential roof repair photography for common maintenance and repair conversations.',
    specs: 'Repair imagery',
  },
  {
    id: 'gallery-11',
    title: 'Roof condition inspection',
    category: 'inspection',
    categoryLabel: 'Inspection',
    location: 'Residential roofing',
    imageUrl: '/assets/images/library/roof-damage-inspection.jpg',
    description: 'Roof condition imagery illustrating why a careful inspection matters before selecting a repair or replacement approach.',
    specs: 'Inspection imagery',
  },
  {
    id: 'gallery-12',
    title: 'Residential roof inspection detail',
    category: 'inspection',
    categoryLabel: 'Inspection',
    location: 'Residential roofing',
    imageUrl: '/assets/images/library/residential-roofing-inspection.jpg',
    description: 'A visual reference for residential roof inspection and condition assessment.',
    specs: 'Inspection imagery',
  },
  {
    id: 'gallery-13',
    title: 'Residential roofing project overview',
    category: 'installation',
    categoryLabel: 'Roofing Projects',
    location: 'Residential roofing',
    imageUrl: '/assets/images/library/residential-roof-project-01.jpg',
    description: 'Residential roofing project photography. Ask us about the options that fit your roof and goals.',
    specs: 'Project photography',
  },
  {
    id: 'gallery-14',
    title: 'Residential roofing project overview',
    category: 'installation',
    categoryLabel: 'Roofing Projects',
    location: 'Residential roofing',
    imageUrl: '/assets/images/library/residential-roof-project-02.jpg',
    description: 'Additional residential roofing imagery for exploring roof styles and project considerations.',
    specs: 'Project photography',
  },
  {
    id: 'gallery-15',
    title: 'Residential roofing detail',
    category: 'systems',
    categoryLabel: 'Roofing Systems',
    location: 'Residential roofing',
    imageUrl: '/assets/images/library/residential-roof-project-detail.jpg',
    description: 'A closer look at residential roofing materials and roof details.',
    specs: 'Roofing systems',
  }
];

export const GalleryPage: React.FC<GalleryPageProps> = ({
  currentPath,
  onNavigate,
  onOpenIntake,
}) => {
  const [filter, setFilter] = useState<'all' | 'installation' | 'systems' | 'inspection' | 'repairs'>('all');
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  const filteredItems = filter === 'all'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter((item) => item.category === filter);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 pb-20">
      <SeoHead
        title="Roofing Project Gallery & Before-and-After Portfolio | The Roof Doctors"
        description="Explore residential roofing photography covering installations, roofing systems, inspections, and repair details."
        canonicalPath={currentPath}
      />

      {/* Hero Header */}
      <section className="bg-slate-900 text-white py-14 px-4 sm:px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-red-600/20 text-red-400 border border-red-500/30 uppercase tracking-wide">
            <ImageIcon className="w-4 h-4 text-red-400" />
            <span>Residential Roofing Photo Gallery</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            Residential Roofing Photo Gallery
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Explore photographs illustrating residential roofing installations, roof systems, inspection details, and repairs. Images are visual references; project locations, materials, and scopes are confirmed separately.
          </p>

          {/* Filter Pills */}
          <div className="pt-4 flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Projects' },
              { id: 'installation', label: 'Installations' },
              { id: 'systems', label: 'Roofing Systems' },
              { id: 'inspection', label: 'Inspections' },
              { id: 'repairs', label: 'Repairs & Flashing' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filter === tab.id
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveItem(item)}
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="relative h-60 bg-slate-100 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/30 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 text-white p-3 rounded-full backdrop-blur-xs">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="bg-slate-900/90 backdrop-blur-xs text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-md">
                    {item.categoryLabel}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white text-xs font-semibold drop-shadow-md">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  <span>{item.location}</span>
                </div>
              </div>

              <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-red-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-mono">{item.specs.split('•')[0]}</span>
                  <span className="font-bold text-red-600 flex items-center gap-1">
                    View Photo &rarr;
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Full-Screen Lightbox Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
          <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setActiveItem(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative h-72 sm:h-96 w-full bg-slate-950 overflow-hidden">
              <img
                src={activeItem.imageUrl}
                alt={activeItem.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-red-600 text-white text-xs font-bold uppercase px-3 py-1 rounded-lg">
                  {activeItem.categoryLabel}
                </span>
                <span className="bg-slate-900/80 backdrop-blur-xs text-slate-200 text-xs font-semibold px-3 py-1 rounded-lg flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  {activeItem.location}
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-4">
              <h2 className="text-2xl font-black text-white">{activeItem.title}</h2>
              <p className="text-sm text-slate-300 leading-relaxed">{activeItem.description}</p>

              {activeItem.beforeImageUrl && (
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">
                    Prior Condition Inspection Photo
                  </h4>
                  <div className="h-44 rounded-xl overflow-hidden">
                    <img
                      src={activeItem.beforeImageUrl}
                      alt="Before state showing storm or age deterioration"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              )}

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-1">
                <span className="text-slate-500 font-bold uppercase tracking-wider">Image category</span>
                <p className="text-slate-200 font-mono">{activeItem.specs}</p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setActiveItem(null);
                    onOpenIntake('DIAGNOSTIC');
                  }}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer text-center"
                >
                  DISCUSS MY ROOFING OPTIONS
                </button>
                <button
                  onClick={() => setActiveItem(null)}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer text-center"
                >
                  Close Lightbox
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Secondary Project Discussion CTA */}
      <section className="bg-slate-900 text-white py-14 px-4 sm:px-6 mt-12 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="text-xs uppercase tracking-wider text-red-400 font-bold">
            Residential Roofing Guidance
          </span>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
            Planning a Roofing Project?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Talk with our team about your roof, available materials, inspection findings, and next steps. Recommendations depend on the condition and requirements of your property.
          </p>
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onOpenIntake('REPLACEMENT')}
              className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-colors cursor-pointer"
            >
              REQUEST A FREE ESTIMATE
            </button>
            <a
              href="tel:9032315940"
              className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>DIRECT DISPATCH: 903-231-5940</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
