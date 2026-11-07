import React from 'react';
import { Building2, ArrowRight } from 'lucide-react';
import { SeoMeta } from '../components/SeoMeta';
import { Link } from '../router';
import { NAVIGATION_LINKS } from '../constants';

export const IndustriesDirectoryPage: React.FC = () => (
  <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans-crd pb-24">
    <SeoMeta
      title="Commercial Roofing Industries We Serve | Commercial Roof Doctors"
      description="Explore commercial roofing solutions for churches, schools, healthcare facilities, industrial properties, retail centers, multifamily communities, HOAs, agricultural buildings and government facilities across the Ark-La-Tex."
      canonicalPath="/industries"
      breadcrumbs={[{ name: 'Home', url: '/' }, { name: 'Industries', url: '/industries' }]}
    />
    <section className="bg-gradient-to-b from-[#0e1424] via-[#0a0f1c] to-[#090d16] border-b border-slate-800 pt-16 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto text-center space-y-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono-crd uppercase tracking-wider">
          <Building2 className="w-3.5 h-3.5" />
          <span>Commercial Roofing By Property Type</span>
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight uppercase text-white leading-tight">
          Industries We Serve
        </h1>
        <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Different buildings place different demands on a roof. Commercial Roof Doctors plans inspections, repairs, restoration and replacement around each facility’s use, occupancy, access requirements and operating schedule.
        </p>
      </div>
    </section>
    <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {NAVIGATION_LINKS.industries.map((item) => (
          <Link key={item.href} to={item.href} className="group bg-[#0e1422] border border-slate-800 hover:border-amber-500/60 p-6 rounded-xl flex flex-col gap-4 transition-colors">
            <div className="space-y-2">
              <h2 className="font-heading font-bold text-lg uppercase text-white group-hover:text-amber-400">{item.name}</h2>
              <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
            <span className="inline-flex items-center gap-2 text-xs text-amber-400 font-bold uppercase tracking-wider mt-auto">
              Explore Roofing Solutions <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        ))}
      </div>
    </section>
    <section className="max-w-4xl mx-auto px-4 text-center space-y-4">
      <h2 className="text-2xl sm:text-3xl font-heading font-black uppercase text-white">Need a Roof Assessment?</h2>
      <p className="text-sm text-slate-300">We serve commercial properties throughout the Ark-La-Tex and surrounding region. Contact our team to discuss your facility and roof system.</p>
      <a href="tel:9032315940" className="inline-flex bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-black text-sm uppercase tracking-wider px-8 py-3.5 rounded">Call (903) 231-5940</a>
    </section>
  </div>
);
