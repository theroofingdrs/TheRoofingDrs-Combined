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
  category: 'before_after' | 'completed' | 'storm_damage' | 'repairs' | 'during_work';
  categoryLabel: string;
  location: string;
  imageUrl: string;
  beforeImageUrl?: string;
  description: string;
  specs: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'proj-1',
    title: 'Severe Hail Restoration & Class 4 Upgrade',
    category: 'before_after',
    categoryLabel: 'Before & After',
    location: 'Texarkana, TX',
    imageUrl: '/assets/images/new_roof_install.jpg',
    beforeImageUrl: '/assets/images/hail_damage_shingles.jpg',
    description: 'Homeowner suffered widespread 1.75-inch hail impact bruising across all four slopes. We managed the adjuster meeting, tore off damaged shingles, and installed Owens Corning Duration STORM Class 4 impact shingles in Onyx Black.',
    specs: 'Owens Corning Duration STORM • Synthetic Underlayment • Continuous Ridge Vent',
  },
  {
    id: 'proj-2',
    title: 'Modern Standing Seam Metal Architectural Installation',
    category: 'completed',
    categoryLabel: 'Completed Roofs',
    location: 'Tyler, TX (Azalea District)',
    imageUrl: '/assets/images/metal_roof_system.jpg',
    description: 'High-durability 24-gauge standing seam metal roof in Matte Charcoal with concealed clip fasteners, engineered for lifetime defense against Northeast Texas winds and hail.',
    specs: '24-Gauge Standing Seam Metal • High-Temperature Underlayment • Concealed Fasteners',
  },
  {
    id: 'proj-3',
    title: 'High-Wind Shingle Uplift & Crease Repair',
    category: 'repairs',
    categoryLabel: 'Repairs',
    location: 'New Boston, TX',
    imageUrl: '/assets/images/wind_damage_shingles.jpg',
    description: 'Straight-line 65 mph microburst gusts tore away and creased starter shingles. Surgical extraction and color-matched shingle replacement with thermal hand-sealing prevented a full roof replacement.',
    specs: '6-Nail Enhanced Fastening • Neoprene Pipe Jack Boot Seal • Leak Audit Passed',
  },
  {
    id: 'proj-4',
    title: 'Pine Tree Impact & Decking Structural Rebuild',
    category: 'storm_damage',
    categoryLabel: 'Storm Damage',
    location: 'Atlanta, TX (Cass County)',
    imageUrl: '/assets/images/fallen_tree_roof.jpg',
    description: 'A heavy pine limb punctured the roof decking over the bedroom during a spring squall. Emergency 3-hour tarp deployment followed by structural rafter reinforcement and matching shingle install.',
    specs: 'CDX 1/2" Plywood Deck Repair • Ice & Water Valley Shield • Rafter Sistering',
  },
  {
    id: 'proj-5',
    title: 'Full Tear-Off & Sheathing Inspection In Progress',
    category: 'during_work',
    categoryLabel: 'During Work',
    location: 'Longview, TX',
    imageUrl: '/assets/images/roof_tear_off.jpg',
    description: 'Midday progress shot showing full shingle removal down to bare OSB sheathing. Every sheet is walked and inspected for dry rot before synthetic underlayment is rolled out.',
    specs: 'Tarp Landscaping Armor • Magnetic Sweep in Progress • OSHA Harness Tie-Offs',
  },
  {
    id: 'proj-6',
    title: 'Chimney Saddle & Step Flashing Reconstruction',
    category: 'repairs',
    categoryLabel: 'Repairs',
    location: 'Paris, TX',
    imageUrl: '/assets/images/chimney_flashing_roof.jpg',
    description: 'Recurring ceiling stains in living room traced to improper chimney counterflashing installed 15 years prior. Custom flashing cut into mortar joints with polyurethane reglet seal.',
    specs: 'Custom Metal Cricket • Interlocking Step Flashing • Polyurethane Reglet Seal',
  },
  {
    id: 'proj-7',
    title: 'Suburban Ranch Transformation',
    category: 'before_after',
    categoryLabel: 'Before & After',
    location: 'Sulphur Springs, TX',
    imageUrl: '/assets/images/new_roof_install.jpg',
    beforeImageUrl: '/assets/images/old_damaged_shingles.jpg',
    description: 'Aging 3-tab 20-year shingle roof with severe granule loss and curling transformed into dimensional architectural system with balanced soffit-to-ridge airflow.',
    specs: 'GAF Timberline HDZ (Weathered Wood) • Cobra Continuous Ridge Vent • Drip Edge Upgrade',
  },
  {
    id: 'proj-8',
    title: '21-Point Forensic Roof Health Diagnostic Walk',
    category: 'completed',
    categoryLabel: 'Completed Roofs',
    location: 'Marshall, TX',
    imageUrl: '/assets/images/roof_inspection_walk.jpg',
    description: 'Comprehensive physical roof health walk verifying thermal seal adhesion, pipe collar integrity, and ventilation balance following an East Texas severe thunderstorm line.',
    specs: 'Thermal Seal Audit • Pipe Boot Inspection • Digital Photographic Report Delivered',
  },
  {
    id: 'proj-9',
    title: 'CertainTeed Grand Manor® Luxury Estate Transformation',
    category: 'completed',
    categoryLabel: 'Completed Roofs',
    location: 'Mount Pleasant, TX',
    imageUrl: '/assets/images/grand_manor_roof.jpg',
    description: 'Custom estate roof replacement featuring CertainTeed Grand Manor heavyweight slate-profile shingles. Multi-layered 425 lb dimensional tab construction delivering Class 4 impact resistance with genuine architectural depth.',
    specs: 'CertainTeed Grand Manor® (Gatehouse) • UL 2218 Class 4 • Copper Valley Flashing',
  },
  {
    id: 'proj-10',
    title: 'Historic Estate Natural Quarried Slate Restoration',
    category: 'completed',
    categoryLabel: 'Completed Roofs',
    location: 'Tyler, TX (Charnwood Historic District)',
    imageUrl: '/assets/images/slate_roofing.jpg',
    description: 'Meticulous replacement and installation of ASTM C406 S1 Grade genuine quarried slate tiles. Fastened with solid copper nails and custom copper standing seams for a century of maintenance-free luxury.',
    specs: 'Vermont Black Quarried Slate • Solid Copper Nails & Valleys • 100+ Year Lifespan',
  },
  {
    id: 'proj-11',
    title: 'Mediterranean Villa High-Barrel Clay Tile System',
    category: 'completed',
    categoryLabel: 'Completed Roofs',
    location: 'Longview, TX',
    imageUrl: '/assets/images/tile_roofing.jpg',
    description: 'Architectural terracotta clay barrel tile system engineered with mechanical elevated battens. Natural sub-tile convective airflow drops attic summer temperatures by over 20°F.',
    specs: 'Terracotta Barrel Tile • Mechanically Fastened 140 MPH • Self-Adhering High-Temp Underlayment',
  },
  {
    id: 'proj-12',
    title: 'Aerial Drone Diagnostic & Synthetic Underlayment Installation',
    category: 'during_work',
    categoryLabel: 'During Installation',
    location: 'Texarkana, TX',
    imageUrl: '/assets/images/aerial_roof_replacement.jpg',
    description: 'Top-down aerial drone view of full roof replacement showing high-grade synthetic underlayment installation, neat bundle staging on roof jacks, and extensive lawn & gazebo property protection.',
    specs: 'Synthetic Underlayment • Drone Verified Alignment • 100% Perimeter Tarping',
  },
  {
    id: 'proj-14',
    title: 'Certified Roofing Mechanics in Action',
    category: 'during_work',
    categoryLabel: 'During Installation',
    location: 'Tyler, TX',
    imageUrl: '/assets/images/active_crew_reroof.jpg',
    description: 'High-angle drone view of our certified installation crew executing a synchronized residential roof replacement, showing high-temp underlayment, staging jacks, and ground protection.',
    specs: 'Synchronized Crew Installation • High-Temp Underlayment • Full Property Shielding',
  },
  {
    id: 'proj-15',
    title: 'Sprawling Texas Brick Ranch Residence',
    category: 'completed',
    categoryLabel: 'Completed Roofs',
    location: 'Longview, TX',
    imageUrl: '/assets/images/brick_estate_roof.jpg',
    description: 'Complete tear-off and replacement featuring lifetime architectural shingles, crisp hip ridges, clean valley transitions, and custom chimney step flashing on a classic Texas estate.',
    specs: 'Lifetime Architectural Shingles • Hip & Ridge Cap System • Precision Valley Flashing',
  },
];

export const GalleryPage: React.FC<GalleryPageProps> = ({
  currentPath,
  onNavigate,
  onOpenIntake,
}) => {
  const [filter, setFilter] = useState<'all' | 'before_after' | 'completed' | 'storm_damage' | 'repairs' | 'during_work'>('all');
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  const filteredItems = filter === 'all'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter((item) => item.category === filter);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 pb-20">
      <SeoHead
        title="Roofing Project Gallery & Before-and-After Portfolio | The Roof Doctors"
        description="Browse real residential roofing transformations in Northeast Texas. Before-and-after hail restorations, architectural shingle replacements, and precision repairs."
        canonicalPath={currentPath}
      />

      {/* Hero Header */}
      <section className="bg-slate-900 text-white py-14 px-4 sm:px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-red-600/20 text-red-400 border border-red-500/30 uppercase tracking-wide">
            <ImageIcon className="w-4 h-4 text-red-400" />
            <span>Verified Northeast Texas Workmanship</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            Roofing Project Portfolio &amp; Transformations
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Real roofs on real homes across Texarkana, Longview, Tyler, Paris, and surrounding Ark-La-Tex communities. Click any photo to inspect high-resolution details, technical specifications, and project scope notes.
          </p>

          {/* Filter Pills */}
          <div className="pt-4 flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Projects' },
              { id: 'before_after', label: 'Before & After' },
              { id: 'completed', label: 'Completed Roofs' },
              { id: 'storm_damage', label: 'Storm Damage' },
              { id: 'repairs', label: 'Repairs & Flashing' },
              { id: 'during_work', label: 'During Installation' },
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
                    View Project &rarr;
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
                <span className="text-slate-500 font-bold uppercase tracking-wider">Specifications</span>
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
                  DISCUSS A SIMILAR PROJECT FOR MY HOME
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
            Real Roofs • Verified Results
          </span>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
            Inspired by One of Our Installations?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Schedule a free consultation. We’ll bring physical shingle color boards, Class 4 impact samples, and satellite roof measurements directly to your kitchen table.
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
