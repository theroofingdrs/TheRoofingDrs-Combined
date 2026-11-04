import React from 'react';
import { SeoHead } from '../../common/SeoHead.tsx';
import {
  MapPin,
  Compass,
  CloudRain,
  Wind,
  Sun,
  ShieldCheck,
  CalendarCheck,
  PhoneCall,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface ServiceAreasPageProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenIntake: (type?: 'DIAGNOSTIC' | 'STORM' | 'EMERGENCY' | 'REPLACEMENT') => void;
}

export const CITIES_DATA = [
  {
    slug: 'texarkana',
    name: 'Texarkana',
    county: 'Bowie & Miller Counties',
    hub: 'Core Residential Service Area',
    headline: 'Twin Cities Crossroads: High Storm Frequency & Pine Needle Ingress',
    weatherContext: 'Positioned in the Interstate 30 storm corridor, Texarkana experiences intense supercell thunderstorms, frequent spring hail swaths, and high winter rainfall that test valley seals and chimney step flashings.',
    zipCodes: ['75501', '75503', '75505'],
    responseTime: 'Same-Day Dispatch (under 2 hours for emergencies)',
  },
  {
    slug: 'atlanta',
    name: 'Atlanta',
    county: 'Cass County',
    hub: 'Residential Service Area',
    headline: 'Piney Woods Timberland: Dense Tree Canopies & Heavy Branch Punctures',
    weatherContext: 'Cass County’s towering loblolly pine canopies shed immense volumes of acidic needles, clogging roof valleys and promoting persistent moss and fungal rot in shaded roof planes.',
    zipCodes: ['75551'],
    responseTime: 'Same-Day Dispatch',
  },
  {
    slug: 'new-boston',
    name: 'New Boston',
    county: 'Bowie County (West)',
    hub: 'Residential Service Area',
    headline: 'Red River Wind Shear: Creased Shingle Tabs & Agricultural Wind Exposure',
    weatherContext: 'Open terrain near the Red River basin subjects residential roofs to severe crosswinds and microbursts over 60 mph that break factory thermal sealant strips on 3-tab shingles.',
    zipCodes: ['75570'],
    responseTime: 'Same-Day Dispatch',
  },
  {
    slug: 'paris',
    name: 'Paris',
    county: 'Lamar County',
    hub: 'Extended Area, Availability Confirmed by Request',
    headline: 'Prairie Hail Alley: Severe Convective Storms & Historic Architectural Rooflines',
    weatherContext: 'Located where the East Texas timber belt transitions into the open blackland prairies, Paris is directly exposed to intense hail supercells and rapid thermal swings that stress roof decking.',
    zipCodes: ['75460', '75462'],
    responseTime: 'Scheduled within 24 hours',
  },
  {
    slug: 'sulphur-springs',
    name: 'Sulphur Springs',
    county: 'Hopkins County',
    hub: 'Extended Area, Availability Confirmed by Request',
    headline: 'Thermal Expansion & Microburst Squalls in Hopkins County',
    weatherContext: 'Blistering summer heat reaching 100°F+ followed by sudden cold thunderstorm deluges causes severe thermal shock in asphalt shingles, requiring engineered expansion joints and balanced ridge ventilation.',
    zipCodes: ['75482', '75483'],
    responseTime: 'Scheduled within 24 hours',
  },
  {
    slug: 'longview',
    name: 'Longview',
    county: 'Gregg County',
    hub: 'Residential Service Area',
    headline: 'Dense Oak Canopies, Humidity & Shaded Valley Deterioration',
    weatherContext: 'Gregg County’s established residential neighborhoods feature mature hardwood trees that drop heavy limbs during spring squalls and create shaded environments where roof moss thrives.',
    zipCodes: ['75601', '75602', '75604', '75605'],
    responseTime: 'Scheduled within 24 hours',
  },
  {
    slug: 'tyler',
    name: 'Tyler',
    county: 'Smith County',
    hub: 'Extended Area, Availability Confirmed by Request',
    headline: 'Steep Architectural Pitches & Severe Spring Hail Corridors',
    weatherContext: 'Historic homes and luxury subdivisions with intricate multi-gable rooflines face high-frequency supercell hail tracks. Valley metals and lead plumbing boots require specialized craftsmanship.',
    zipCodes: ['75701', '75702', '75703', '75707'],
    responseTime: 'Scheduled within 24 hours',
  },
  {
    slug: 'marshall',
    name: 'Marshall',
    county: 'Harrison County',
    hub: 'Residential Service Area',
    headline: 'Cypress Bayou High Moisture, Acidic Needle Litter & Historic Flashings',
    weatherContext: 'High humidity from surrounding bayous and ancient hardwood canopies accelerate asphalt shingle binder erosion and degrade mortar counter-flashing around brick chimneys.',
    zipCodes: ['75670', '75672'],
    responseTime: 'Scheduled within 24 hours',
  },
];

export const ServiceAreasPage: React.FC<ServiceAreasPageProps> = ({
  currentPath,
  onOpenIntake,
}) => {
  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 pb-20">
      <SeoHead
        title="Service Areas Across Northeast Texas & Ark-La-Tex | The Roof Doctors"
        description="The Roof Doctors provides forensic roof inspections, storm repairs, and lifetime reroofing across Texarkana, Longview, Tyler, Paris, Atlanta, and all Northeast Texas."
        canonicalPath={currentPath}
      />

      {/* Hero Header */}
      <section className="bg-slate-900 text-white py-14 px-4 sm:px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-red-600/20 text-red-400 border border-red-500/30 uppercase tracking-wide">
            <MapPin className="w-4 h-4 text-red-400" />
            <span>Residential Roofing Coverage</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            Residential Roofing Service Area
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            The Roof Doctors' core residential service area is generally within 75 miles of Texarkana. Projects outside that range may be considered individually, depending on location, scope, and scheduling. Contact us to confirm availability before assuming service coverage.
          </p>
        </div>
      </section>

      {/* Regional Climate Factors */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6">
          <div className="max-w-3xl">
            <span className="text-xs uppercase tracking-wider text-red-600 font-bold">
              Regional Building Science
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight mt-1">
              How Northeast Texas Weather Challenges Residential Roofs
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Our geographic location in the Ark-La-Tex creates unique microclimates that place severe structural stress on asphalt shingle systems:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <Sun className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Thermal Shock &amp; Intense UV</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Roof decks routinely heat to 145°F during East Texas summers. When cold thunderstorm rain hits super-heated shingles, rapid thermal contraction cracks low-grade asphalt and splits unreinforced seams.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Wind className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Red River Valley Wind Shear</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Microburst gusts funneling across the open plains break standard 4-nail shingle seals. We install an enhanced 6-nail pattern on every replacement to achieve true 130 MPH wind resistance.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CloudRain className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Pine Needles &amp; Tree Canopies</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The Piney Woods timber belt drops acidic pine needles that form damp mats in roof valleys, rotting underlying decking and eroding shingle granules twice as fast as open suburban areas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Hub Explorer: Links to Individual City Pages */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="max-w-3xl mb-8">
          <span className="text-xs uppercase tracking-wider text-red-600 font-bold">
            Residential Service Area
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight mt-1">
            Explore Residential Service Areas
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Select a community to learn about local roofing conditions and services. Coverage beyond our usual 75-mile residential service area is confirmed case by case.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CITIES_DATA.map((city) => (
            <a
              key={city.slug}
              href={`/residential/service-areas/${city.slug}`}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-lg hover:border-red-500 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 uppercase">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{city.county}</span>
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  {city.name}, TX
                </h3>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {city.headline}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs font-bold text-red-600 flex items-center justify-between">
                <span>View Local Roofing Information</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Primary CTA Band */}
      <section className="bg-slate-900 text-white py-14 px-4 sm:px-6 mt-12 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="text-xs uppercase tracking-wider text-red-400 font-bold">
            Serving Northeast Texas with Accountability
          </span>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
            Check Residential Service Availability
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Our core residential service area is generally within 75 miles of Texarkana. Contact us to confirm availability for your property and project.
          </p>
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onOpenIntake('DIAGNOSTIC')}
              className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-colors cursor-pointer"
            >
              CHECK RESIDENTIAL SERVICE AVAILABILITY
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
