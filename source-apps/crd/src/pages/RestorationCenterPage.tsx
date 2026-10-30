import React from 'react';
import { ArrowRight, Layers, Leaf, Sun } from 'lucide-react';
import { SeoMeta } from '../components/SeoMeta';
import { Link } from '../router';
import { BUSINESS_INFO } from '../constants';
import { LeadType } from '../types';

interface RestorationCenterPageProps {
  onOpenInspection: (initialLeadType?: LeadType) => void;
}

const systems = [
  { title: 'Metal Roofing', detail: 'Standing seam and exposed-fastener panels, including roofs with surface rust or corrosion. Evaluation covers panel condition, fasteners, seams, flashings, rust treatment, primers and compatible coating systems.', image: '/assets/images/commercial-metal-roof.jpg', href: '/metal-roofing' },
  { title: 'EPDM Rubber Roofing', detail: 'Existing rubber membranes may be candidates for restoration when the membrane, seams, attachment and insulation are sound and a compatible preparation and coating system is verified.', image: '/assets/images/commercial-portfolio-roofs.jpg', href: '/epdm-roofing' },
  { title: 'TPO Roofing', detail: 'Assessment focuses on heat-welded seams, membrane condition, attachment, repairs, surface preparation and coating compatibility established by the selected system manufacturer.', image: '/assets/images/commercial-logistics-tpo.jpg', href: '/tpo-roofing' },
  { title: 'PVC Roofing', detail: 'PVC restoration requires attention to membrane age, plasticizer migration, seams, contaminants, primers and documented compatibility with the proposed coating system.', image: '/assets/images/commercial-medical-silicone.jpg', href: '/pvc-roofing' },
  { title: 'Modified Bitumen', detail: 'Smooth and granulated cap sheets are evaluated for cracking, blisters, open laps, exposed asphalt, moisture and the need for compatible primers or reinforcement.', image: '/assets/images/commercial-fluid-membrane.jpg', href: '/modified-bitumen' },
  { title: 'Built-Up Roofing', detail: 'Gravel-surfaced and smooth BUR assemblies require careful evaluation of aggregate, asphalt condition, surface preparation, moisture and coating-system suitability.', image: '/assets/images/commercial-warehouse-roof.jpg', href: '/built-up-roofing' },
  { title: 'Spray Polyurethane Foam', detail: 'SPF roofs are assessed for coating erosion, exposed or damaged foam, moisture intrusion and the condition of the protective coating before renewal.', image: '/assets/images/commercial-roof-restoration.jpg', href: '/commercial-roof-coatings' },
];

const stages = [
  { title: 'Inspection & documentation', text: 'Identify the roof assembly, document existing conditions, locate leaks, review drainage and flashings, and determine whether further moisture investigation or core sampling is appropriate.', image: '/assets/images/commercial-hail-inspection.jpg', alt: 'Commercial roofing inspection and condition documentation' },
  { title: 'Repairs & surface preparation', text: 'Address identified defects, remove incompatible or poorly adhered material, clean the substrate, treat corrosion where specified and prepare details for the selected system.', image: '/assets/images/commercial-roof-repair.jpg', alt: 'Commercial roof repair and preparation before restoration coating' },
  { title: 'Primers & detail reinforcement', text: 'Apply specified primers and reinforce seams, fasteners, penetrations, transitions and other details according to the approved coating-system specification.', image: '/assets/images/commercial-fluid-membrane.jpg', alt: 'Commercial roof coating and reinforced detail application' },
  { title: 'Coating application', text: 'Apply the specified coating at the required coverage rate and dry-film thickness, observing weather, substrate and recoat requirements.', image: '/assets/images/commercial-roof-restoration.jpg', alt: 'Commercial roof restoration coating application' },
  { title: 'Final review & closeout', text: 'Document completed work, review coverage and details, record product and application information, and provide applicable warranty documentation.', image: '/assets/images/commercial-warehouse-roof.jpg', alt: 'Completed commercial roof restoration project' },
];

export const RestorationCenterPage: React.FC<RestorationCenterPageProps> = ({ onOpenInspection }) => (
  <div className="min-h-screen bg-[#f4f3ef] text-[#181818] font-sans-crd">
    <SeoMeta
      title="Commercial Roof Restoration & Coatings | Metal, EPDM, TPO & More"
      description="Explore commercial roof restoration and coating options for metal, EPDM, TPO, PVC, modified bitumen, BUR and spray foam roofs. Commercial Roof Doctors serves the Ark-La-Tex region."
      canonicalPath="/commercial-roof-restoration"
      serviceType="Commercial roof restoration and fluid-applied roof coating evaluation"
      breadcrumbs={[{ name: 'Home', url: '/' }, { name: 'Commercial Roof Restoration & Coatings', url: '/commercial-roof-restoration' }]}
    />

    <section className="relative bg-[#181818] text-white overflow-hidden">
      <img src="/assets/images/commercial-roof-restoration.jpg" alt="Commercial roof restoration and protective coating system" className="absolute inset-0 w-full h-full object-cover opacity-35" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/25" />
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <div className="max-w-3xl space-y-6">
          <div className="text-xs font-mono-crd uppercase tracking-[0.2em] text-[#e0a52b]">Commercial Roof Doctors · Ark-La-Tex</div>
          <h1 className="text-4xl sm:text-6xl font-heading font-black leading-tight">Restore the Roof.<br/><span className="text-[#e0a52b]">Protect the Asset.</span></h1>
          <p className="text-lg sm:text-xl text-white/85 leading-relaxed">A complete guide to commercial roof restoration and fluid-applied coating systems. Explore options for metal, EPDM, TPO, PVC, modified bitumen, built-up and spray foam roofs before committing to replacement.</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button onClick={() => onOpenInspection('Coating/Restoration')} className="bg-[#d99a19] hover:bg-[#edb63f] text-black font-bold px-7 py-4 uppercase tracking-wide text-sm">Request a roof evaluation</button>
            <Link to="/coat-vs-replace" className="border border-white/60 hover:bg-white/10 text-white font-bold px-7 py-4 uppercase tracking-wide text-sm">Compare restore vs. replace <ArrowRight className="inline w-4 h-4 ml-1"/></Link>
          </div>
        </div>
      </div>
    </section>

    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 grid lg:grid-cols-[1.15fr_.85fr] gap-12 items-center">
      <div className="space-y-5">
        <div className="text-xs font-mono-crd uppercase tracking-widest text-[#a87510]">Make the decision with evidence</div>
        <h2 className="text-3xl sm:text-4xl font-heading font-black">Not every aging roof needs to be replaced. Not every roof can be restored.</h2>
        <p className="text-[#555] leading-relaxed">The right recommendation starts with the existing roof assembly, its attachment, moisture condition, drainage, details and remaining serviceability. A properly selected restoration system may renew protection and extend service life when the roof is a suitable candidate. Extensive trapped moisture, structural deterioration or failed attachment may make replacement the responsible choice.</p>
        <p className="text-[#555] leading-relaxed">Commercial Roof Doctors evaluates the roof first, then matches the repair, restoration or replacement recommendation to the actual conditions found.</p>
      </div>
      <img src="/assets/images/commercial-metal-roof.jpg" alt="Commercial metal roof evaluated for restoration" className="w-full aspect-[4/3] object-cover"/>
    </section>

    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="max-w-3xl mb-10">
          <div className="text-xs font-mono-crd uppercase tracking-widest text-[#a87510]">Roof system specific analysis</div>
          <h2 className="text-3xl sm:text-4xl font-heading font-black mt-2">Different roofs require different restoration systems.</h2>
          <p className="text-[#666] mt-3">Coating selection is not one-size-fits-all. Each substrate requires appropriate preparation, repairs, primers, adhesion verification and a manufacturer-supported system specification.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {systems.map((system) => (
            <article key={system.title} className="border border-[#dedbd3] bg-[#f8f7f4]">
              <img src={system.image} alt={system.title + ' commercial roofing system'} className="w-full h-52 object-cover" loading="lazy"/>
              <div className="p-6 space-y-3">
                <h3 className="text-xl font-heading font-bold">{system.title}</h3>
                <p className="text-sm text-[#5c5a55] leading-relaxed">{system.detail}</p>
                <Link to={system.href} className="inline-flex items-center gap-2 text-sm font-bold text-[#9a680c] hover:text-black">Explore roof system <ArrowRight className="w-4 h-4"/></Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="bg-[#202020] text-white py-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="max-w-3xl mb-10">
          <div className="text-xs font-mono-crd uppercase tracking-widest text-[#e0a52b]">Documented process</div>
          <h2 className="text-3xl sm:text-4xl font-heading font-black mt-2">From first inspection to final application.</h2>
          <p className="text-white/65 mt-3">A transparent project record helps owners understand what was found, what was repaired and how the restoration system was installed.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stages.map((stage, index) => (
            <article key={stage.title} className="border border-white/15">
              <img src={stage.image} alt={stage.alt} className="w-full h-52 object-cover" loading="lazy"/>
              <div className="p-5 space-y-2">
                <div className="text-xs font-mono-crd text-[#e0a52b]">STAGE 0{index + 1}</div>
                <h3 className="text-xl font-heading font-bold">{stage.title}</h3>
                <p className="text-sm text-white/65 leading-relaxed">{stage.text}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="text-xs text-white/45 mt-6">Images currently illustrate the restoration process. Project galleries will identify actual CRD projects separately and will not present illustrative images as completed CRD work.</p>
      </div>
    </section>

    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 grid md:grid-cols-3 gap-8">
      <div className="space-y-3"><Layers className="w-8 h-8 text-[#b77e0f]"/><h3 className="text-xl font-heading font-bold">Restore when the roof qualifies</h3><p className="text-sm text-[#666] leading-relaxed">Retaining a serviceable roof assembly can reduce tear-off, disposal and replacement material needs. Restoration is recommended only when inspection supports it.</p></div>
      <div className="space-y-3"><Leaf className="w-8 h-8 text-[#b77e0f]"/><h3 className="text-xl font-heading font-bold">Reduce avoidable waste</h3><p className="text-sm text-[#666] leading-relaxed">When an existing roof can be restored, retaining it may divert substantial roofing material from disposal and reduce the impacts associated with tear-off and hauling.</p></div>
      <div className="space-y-3"><Sun className="w-8 h-8 text-[#b77e0f]"/><h3 className="text-xl font-heading font-bold">Evaluate energy performance</h3><p className="text-sm text-[#666] leading-relaxed">A qualifying reflective roof surface may reduce solar heat gain and cooling demand. Actual savings depend on climate, insulation, HVAC, building use and the existing roof.</p></div>
    </section>

    <section className="bg-[#e9e6de] py-16">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 text-center space-y-5">
        <h2 className="text-3xl sm:text-4xl font-heading font-black">Start with an informed roof evaluation.</h2>
        <p className="text-[#555] max-w-2xl mx-auto">CRD can document the existing roof condition, identify repair needs and evaluate whether a compatible restoration system or replacement is appropriate for your property.</p>
        <button onClick={() => onOpenInspection('Coating/Restoration')} className="bg-[#181818] hover:bg-black text-white font-bold px-8 py-4 uppercase tracking-wide text-sm">Request a commercial roof evaluation</button>
        <p className="text-sm text-[#555]">Call {BUSINESS_INFO.phone} · {BUSINESS_INFO.email}</p>
      </div>
    </section>
  </div>
);
