import React from 'react';
import { SeoHead } from '../../common/SeoHead.tsx';
import {
  MapPin,
  CheckCircle2,
  CalendarCheck,
  PhoneCall,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ArrowRight,
  HelpCircle,
  FileCheck2,
  Home,
  CloudLightning,
  Wind,
  TreePine,
  Sun,
  Wrench,
  Layers,
} from 'lucide-react';

interface CityPageProps {
  citySlug: string;
  onNavigate: (path: string) => void;
  onOpenIntake: (type?: 'DIAGNOSTIC' | 'STORM' | 'EMERGENCY' | 'REPLACEMENT') => void;
}

interface CityDetail {
  slug: string;
  name: string;
  county: string;
  tagline: string;
  heroImage: string;
  intro: string;
  climateAndGeography: string;
  localRoofProblems: { title: string; desc: string }[];
  localServices: { name: string; desc: string; path: string }[];
  whyLocalChooseUs: string[];
  localFaqs: { q: string; a: string }[];
  metaDescription: string;
  zipCodes: string[];
  permitInfo: string;
}

const CITY_DETAILS: Record<string, CityDetail> = {
  texarkana: {
    slug: 'texarkana',
    name: 'Texarkana',
    county: 'Bowie County (Texas) & Miller County (Arkansas)',
    tagline: 'Twin Cities Headquarters • 24/7 Immediate Storm Dispatch',
    heroImage: '/assets/images/new_roof_install.jpg',
    intro: 'As our central corporate headquarters, Texarkana represents the cornerstone of The Roof Doctors. Located along the bustling Interstate 30 transit corridor where Texas meets Arkansas, Texarkana homes range from historic craftsman bungalows in Beverly and downtown to modern executive estates around Pleasant Grove and Richmond Road.',
    climateAndGeography: 'Texarkana sits directly at the confluence of Gulf Coast moisture systems and cold Canadian plains fronts. This geographic crossroads creates high-frequency severe thunderstorms that produce baseball-sized hail and sudden microburst gusts. Furthermore, dense loblolly pines throughout Texarkana drop heavy blankets of acidic needles that trap moisture in roof valleys and accelerate shingle erosion.',
    localRoofProblems: [
      {
        title: 'Severe Hail Alley Bruising',
        desc: 'Texarkana regularly experiences severe spring hail storms. Hail impact bruising fractures the inner fiberglass mat of shingles, which remains invisible from the street until leaks emerge months later.',
      },
      {
        title: 'Valley Pine Needle Acid Decay',
        desc: 'In heavily wooded neighborhoods like Pleasant Grove and Wake Village, accumulated pine needles create acidic compost in valleys that eats through galvanized metal and rots wood decking.',
      },
      {
        title: 'Interstate 30 Corridor Wind Uplift',
        desc: 'High-speed thunderstorm winds sweeping down the I-30 corridor routinely break the thermal seal strips on 3-tab shingles, causing creased tabs and perimeter tear-offs.',
      },
      {
        title: 'Dual-State Building Code Compliance',
        desc: 'Operating on the state line requires deep technical familiarity with both Texas municipal building codes and Arkansas residential building standards for drip edge and ice shielding.',
      },
    ],
    localServices: [
      {
        name: 'Storm & Hail Damage Inspection',
        desc: 'Standardized 10x10 chalk test square documentation for Texarkana hail victims.',
        path: '/storm-damage',
      },
      {
        name: 'Precision Leak Repair',
        desc: 'Plumbing pipe boot replacements and chimney counter-flashing across Bowie County.',
        path: '/roofing/roof-repair',
      },
      {
        name: 'Class 4 Impact Roof Replacement',
        desc: 'Lifetime architectural shingles qualifying for up to 25% Texas insurance discounts.',
        path: '/roofing/roof-replacement',
      },
    ],
    whyLocalChooseUs: [
      'Permanent local office at 1420 Richmond Rd, Texarkana, TX 75501.',
      'True 2-hour emergency dispatch response for storm tarping in Texarkana and Wake Village.',
      'We physically meet Bowie County and Miller County insurance adjusters on your roof.',
      'Strictly compliant with Texas HB 2102 anti-deductible waiver laws.',
    ],
    localFaqs: [
      {
        q: 'Do I need a building permit to replace my roof in Texarkana, TX?',
        a: 'Yes. The City of Texarkana, Texas requires a building permit and final inspection for complete residential roof replacements. The Roof Doctors pulls all required municipal permits and schedules the final city building inspection on your behalf.',
      },
      {
        q: 'How quickly can your Texarkana team respond to an active roof leak?',
        a: 'Because our central fleet is dispatched from 1420 Richmond Rd, we offer same-day diagnostic service for active leaks, and emergency tarping dispatch within 2 hours following major storms.',
      },
      {
        q: 'Can you work on homes on both the Texas and Arkansas sides of Texarkana?',
        a: 'Yes. The Roof Doctors is fully licensed, registered, and insured to perform residential roofing in both Texas and Arkansas.',
      },
    ],
    metaDescription: 'Certified roofing contractors in Texarkana, TX. Free 21-point forensic roof inspections, hail damage repairs, and full replacements from our 1420 Richmond Rd HQ.',
    zipCodes: ['75501', '75503', '75505'],
    permitInfo: 'City of Texarkana Building Inspection Division (220 Texas Blvd)',
  },

  atlanta: {
    slug: 'atlanta',
    name: 'Atlanta',
    county: 'Cass County',
    tagline: 'Piney Woods Timberland Specialists • Tree Impact & Moss Mitigation',
    heroImage: '/assets/images/fallen_tree_roof.jpg',
    intro: 'Located in the heart of Cass County timber country, Atlanta, Texas is defined by scenic rolling hills, historic ranch properties, and dense pine forests. From the historic downtown district to sprawling acreage off Highway 59 and Highway 77, Atlanta homeowners face unique roofing challenges shaped by deep East Texas forestry.',
    climateAndGeography: 'Cass County receives over 50 inches of rainfall annually, surrounded by dense canopies of loblolly pines and sweetgums. This constant tree cover creates severe persistent shade, preventing roofs from drying fully and promoting heavy green moss and fungal colonies. Furthermore, winter ice storms and severe spring squalls cause heavy timber branches to puncture roof decking.',
    localRoofProblems: [
      {
        title: 'Heavy Pine Limb Punctures',
        desc: 'Overhanging pine branches saturated by heavy rains routinely break under thunderstorm gusts, punching cleanly through 7/16" OSB decking into attic living spaces.',
      },
      {
        title: 'Deep Shade Algae & Wood Rot',
        desc: 'Homes nestled in the timber belt suffer from dark gloeocapsa magma algae streaks and moss growth that lift shingle edges and retain moisture against roof sheathing.',
      },
      {
        title: 'Acidic Needle Valley Clogging',
        desc: 'Pine needles accumulate in roof-to-wall intersections and valley metal, holding stagnant water that causes premature rust and fastener failure.',
      },
      {
        title: 'Ice Storm Weight & Creep',
        desc: 'Occasional Cass County winter ice events weigh heavily on eaves, causing ice dam backup behind drip edges on low-slope patio additions.',
      },
    ],
    localServices: [
      {
        name: 'Fallen Tree Impact Restoration',
        desc: 'Emergency tree limb removal, structural rafter sistering, and deck rebuilds in Atlanta.',
        path: '/storm-damage/fallen-tree-damage',
      },
      {
        name: 'Algae-Resistant Shingle Upgrades',
        desc: 'Owens Corning StreakGuard™ architectural systems engineered for shaded timber lots.',
        path: '/roofing-systems',
      },
      {
        name: 'Valley Cleanout & Reflashing',
        desc: 'Installation of seamless W-valley metal and self-adhering ice barriers.',
        path: '/roofing/roof-repair',
      },
    ],
    whyLocalChooseUs: [
      'Specialized experience repairing tree-puncture framing and structural rafters in Cass County.',
      'We install premium 25-year algae-resistant shingles engineered specifically for shaded acreage.',
      'Year-round service across Atlanta, Queen City, Linden, and Bloomburg.',
      'Physical inspection of bare wood sheathing during every replacement to catch fungal decay.',
    ],
    localFaqs: [
      {
        q: 'Will homeowners insurance cover tree damage to my roof in Atlanta, TX?',
        a: 'Yes, if a storm causes a tree or large limb to fall onto your roof and damage the structure, standard homeowners insurance policies in Texas typically cover both the tree removal from the structure and the physical roof repair.',
      },
      {
        q: 'How do you prevent moss and algae from ruining shingles in wooded Atlanta lots?',
        a: 'We install premium architectural shingles featuring copper-infused ceramic granules (such as CertainTeed StreakFighter or Owens Corning StreakGuard) and optimize attic ventilation so roof decks dry rapidly.',
      },
    ],
    metaDescription: 'Trusted roofing contractor in Atlanta, TX (Cass County). Fallen tree limb repairs, shaded roof moss mitigation, and complete architectural replacements.',
    zipCodes: ['75551'],
    permitInfo: 'Cass County & City of Atlanta Code Compliance',
  },

  'new-boston': {
    slug: 'new-boston',
    name: 'New Boston',
    county: 'Bowie County (West)',
    tagline: 'Red River Valley Wind Specialists • Rapid Hwy 82 Dispatch',
    heroImage: '/assets/images/wind_damage_shingles.jpg',
    intro: 'Serving as the county seat of Bowie County, New Boston combines a proud rail and agricultural heritage with strategic proximity to the Red River Army Depot. Situated along US-82 and Interstate 30, New Boston features open pastoral farmland and expansive subdivisions that take the brunt of severe cross-country wind events.',
    climateAndGeography: 'Because New Boston sits on higher ground just south of the Red River valley, it experiences dramatic wind shear during convective storm fronts. Microbursts and straight-line winds exceeding 65 mph race across open agricultural fields, creating severe aerodynamic uplift on windward roof slopes.',
    localRoofProblems: [
      {
        title: 'Severe High-Wind Tab Creasing',
        desc: 'Open terrain wind shear lifts asphalt shingles, breaking thermal factory sealant lines. Once lifted, the shingle flaps back and forth, developing a permanent crease line.',
      },
      {
        title: 'Ridge Cap Blow-Offs',
        desc: 'Standard 3-tab shingles used as ridge caps in older New Boston subdivisions frequently blow off during spring squall lines, exposing the peak decking to rain.',
      },
      {
        title: 'Agricultural Dust & Granule Abrasion',
        desc: 'Strong seasonal prairie winds carry fine dust particles that scour exposed asphalt surfaces, accelerating granular erosion on south-facing slopes.',
      },
      {
        title: 'Chimney Flashing Separation',
        desc: 'High wind pressure causes chimneys to torque slightly, breaking brittle mortar joints and allowing rainwater to channel behind siding.',
      },
    ],
    localServices: [
      {
        name: 'High-Wind Creased Tab Repair',
        desc: 'Thermal seal testing and color-matched tab replacements throughout New Boston.',
        path: '/storm-damage/wind-damage',
      },
      {
        name: '130 MPH High-Wind System Replacement',
        desc: 'Enhanced 6-nail fastening patterns and starter strip locks on every eave and rake.',
        path: '/roofing/roof-replacement',
      },
      {
        name: 'Free 21-Point Wind & Hail Inspection',
        desc: 'Comprehensive physical walk for homeowners near Hwy 82 and RRAD.',
        path: '/roofing/roof-inspection',
      },
    ],
    whyLocalChooseUs: [
      'Fast 30-minute dispatch down I-30 and Hwy 82 from our Texarkana headquarters.',
      'We never use standard 4-nail installation; we mandate 6 nails per shingle for 130 mph wind certification.',
      'Deep relationships working with Bowie County homeowners and veterans near RRAD.',
      'Assistance meeting insurance adjusters on wind damage and creased shingle claims.',
    ],
    localFaqs: [
      {
        q: 'Why are my shingles creasing even if they haven’t blown completely off?',
        a: 'When winds exceed 50 mph, the uplift force breaks the adhesive seal and bends the shingle upward. The dark horizontal line across the top is fractured asphalt. Insurance guidelines in Texas recognize creased shingles as wind damage.',
      },
      {
        q: 'How fast can The Roof Doctors inspect my roof in New Boston?',
        a: 'We can typically dispatch an inspector to New Boston within 2 to 4 hours of your request.',
      },
    ],
    metaDescription: 'Expert roofing services in New Boston, TX. High-wind creased shingle repairs, 130 mph roof replacements, and storm damage claim inspections.',
    zipCodes: ['75570'],
    permitInfo: 'Bowie County & City of New Boston Permitting Department',
  },

  paris: {
    slug: 'paris',
    name: 'Paris',
    county: 'Lamar County',
    tagline: 'Western Prairie Storm Corridor • Historic & Modern Residential Systems',
    heroImage: '/assets/images/hail_damage_shingles.jpg',
    intro: 'Known worldwide for its iconic Eiffel Tower with the red cowboy hat, Paris, Texas is a vibrant cultural hub anchored by a rich architectural heritage. From historic Queen Anne and Victorian homes surrounding the downtown square to sprawling ranches and new residential construction, Paris represents a vital community in our Northeast Texas network.',
    climateAndGeography: 'Paris sits on the western edge of our service territory where the East Texas timber belt merges into the North Texas Blackland Prairie. This open, flat topography allows supercell thunderstorms developing over Oklahoma and the Red River to strike Paris with violent downbursts and golf-ball-to-baseball sized hail.',
    localRoofProblems: [
      {
        title: 'Large-Diameter Hail Impacts',
        desc: 'Open prairie storm cells over Lamar County frequently generate dense, hard hail that punctures shingle fiberglass cores and shatters ridge vent plastic.',
      },
      {
        title: 'Historic Multi-Gable Flashing Complexity',
        desc: 'Older homes in Paris feature intricate roof valleys, turrets, and masonry chimneys that require custom hand-soldered sheet metal flashings rather than prefabricated kits.',
      },
      {
        title: 'Rapid Temperature Swings & Thermal Fatigue',
        desc: 'Paris experiences intense winter cold fronts blowing off the plains immediately followed by sunny 75°F days, causing extreme expansion and contraction cycles.',
      },
      {
        title: 'Prairie Wind Shingle Uplift',
        desc: 'With few dense forest barriers to break the wind, Paris roofs endure continuous wind fatigue that breaks aging shingle seals.',
      },
    ],
    localServices: [
      {
        name: 'Forensic Hail Damage Documentation',
        desc: '10x10 chalk test square counts and collateral metal audits for Lamar County homeowners.',
        path: '/storm-damage/hail-damage',
      },
      {
        name: 'Historic & Architectural Replacement',
        desc: 'CertainTeed Landmark Pro dimensional shingles matching classic Texas architecture.',
        path: '/roofing/roof-replacement',
      },
      {
        name: 'Custom Chimney Saddle & Cricket Repair',
        desc: 'Precision masonry counter-flashing for older brick fireplaces.',
        path: '/roofing/roof-repair',
      },
    ],
    whyLocalChooseUs: [
      'Proven expertise restoring historic homes with complex rooflines and dormers.',
      'Physical adjuster accompaniment on every storm claim throughout Lamar County.',
      'We install Class 4 impact-resistant shingles that reduce Texas insurance premiums.',
      'Transparent digital photo reports provided after every inspection.',
    ],
    localFaqs: [
      {
        q: 'Does Paris, TX require permits for roof replacement?',
        a: 'Yes, the City of Paris Engineering and Building Department requires building permits for residential reroofs. The Roof Doctors handles the entire permitting and inspection coordination process.',
      },
      {
        q: 'Are Class 4 shingles worth the investment in Paris, Texas?',
        a: 'Absolutely. Due to frequent hail activity across Lamar County, installing Class 4 impact-resistant shingles typically earns homeowners a 15% to 25% discount on annual homeowners insurance premiums.',
      },
    ],
    metaDescription: 'Trusted roofing contractor in Paris, TX (Lamar County). Historic roof flashing repairs, hail damage assessments, and Class 4 impact shingle installations.',
    zipCodes: ['75460', '75462'],
    permitInfo: 'City of Paris Building Division (50 W Hickory St)',
  },

  'sulphur-springs': {
    slug: 'sulphur-springs',
    name: 'Sulphur Springs',
    county: 'Hopkins County',
    tagline: 'Heart of Hopkins County • Dairy Country Thermal Resistance',
    heroImage: '/assets/images/pipe_boot_roof.jpg',
    intro: 'Famed for its historic glass-walled downtown plaza and deep agricultural heritage, Sulphur Springs is the economic heart of Hopkins County. The community features a diverse housing landscape, from well-kept mid-century ranch homes and historic Victorian residences to expansive rural homesteads and equestrian acreage.',
    climateAndGeography: 'Hopkins County experiences severe convective weather formed when dry western prairie air collides with moist Gulf breezes. In addition to spring hail squalls, Sulphur Springs roofs must endure relentless summer heat where rooftop surface temperatures frequently exceed 150°F, followed by sudden torrential cloudbursts that create thermal shock.',
    localRoofProblems: [
      {
        title: 'Thermal Shock Binder Cracking',
        desc: 'Rapid temperature drops from 100°F heat to cold thunderstorm rain cause brittle asphalt shingles to craze, crack, and lose ceramic granules prematurely.',
      },
      {
        title: 'Attic Heat Bake & Inadequate Ventilation',
        desc: 'Older Hopkins County homes often have blocked soffits or undersized vents, trapping superheated air that bakes shingles from below and rots sheathing.',
      },
      {
        title: 'Agricultural Microburst Uplift',
        desc: 'Open acreage around Cooper Lake and rural dairy farmland exposes roof planes to sudden straight-line winds without windbreak protection.',
      },
      {
        title: 'Plumbing Boot UV Degradation',
        desc: 'Intense summer sun rots neoprene rubber pipe collar seals within 5–7 years, allowing rain to run down bathroom vent pipes directly into ceiling sheetrock.',
      },
    ],
    localServices: [
      {
        name: 'Attic Ventilation Optimization',
        desc: 'Continuous external-baffled ridge vents and intake soffit balancing.',
        path: '/roofing/roof-replacement',
      },
      {
        name: 'All-Lead Pipe Boot Upgrades',
        desc: 'Heavy-duty lead roof boots that never crack or dry-rot under intense UV exposure.',
        path: '/roofing/roof-repair',
      },
      {
        name: 'Storm Claim Scope Support',
        desc: 'Comprehensive line-item documentation for Hopkins County insurance adjusters.',
        path: '/insurance-claims',
      },
    ],
    whyLocalChooseUs: [
      'Comprehensive attic thermal diagnostics with digital temperature and moisture readings.',
      'We serve both city residential properties and rural acreage throughout Hopkins County.',
      '100% legal compliance with Texas HB 2102 deductible mandates.',
      'Superior cleanup standards with multiple magnetic sweeps across driveways and pastures.',
    ],
    localFaqs: [
      {
        q: 'Why did my pipe boot leak even though my shingles are relatively new in Sulphur Springs?',
        a: 'Standard rubber pipe boot collars dry-rot under Texas UV within 5 to 8 years—long before 30-year architectural shingles reach their end of life. We replace failed collars with lifetime lead or siliconized metal boots.',
      },
      {
        q: 'How does proper attic ventilation lower summer electric bills in Hopkins County?',
        a: 'By exhausting 140°F+ trapped heat through a continuous ridge vent, your air conditioner does not have to fight downward radiant heat, which can reduce cooling costs by up to 10-15%.',
      },
    ],
    metaDescription: 'Reliable roofing company in Sulphur Springs, TX (Hopkins County). Thermal ventilation solutions, hail storm restoration, and precision residential leak repairs.',
    zipCodes: ['75482', '75483'],
    permitInfo: 'City of Sulphur Springs Community Development',
  },

  longview: {
    slug: 'longview',
    name: 'Longview',
    county: 'Gregg & Harrison Counties',
    tagline: 'Heart of East Texas • Heavy Hardwood Canopies & Humidity Control',
    heroImage: '/assets/images/roof_tear_off.jpg',
    intro: 'Longview stands as a thriving commercial and cultural center in the Piney Woods of East Texas. From established neighborhoods shaded by century-old red oaks in Spring Hill and Pine Tree to newer custom home developments near Judson, Longview homeowners require roofing systems engineered for high humidity and dense tree cover.',
    climateAndGeography: 'Gregg County receives heavy rainfall and persistent summer humidity, creating microclimates where roof valleys remain damp for days after a storm. The city’s mature hardwood trees drop large limbs during thunderstorms, while airborne fungal spores produce persistent dark algae streaks on roof slopes.',
    localRoofProblems: [
      {
        title: 'Hardwood Oak Limb Strikes',
        desc: 'Severe spring gust fronts snap mature oak branches that crash onto roof eaves, puncturing decking and fracturing structural rafters.',
      },
      {
        title: 'Chronic Moisture & Valley Rot',
        desc: 'Shaded valleys filled with wet oak leaves hold stagnant water that eats through organic felt underlayment, leading to hidden deck rot.',
      },
      {
        title: 'Algae Discoloration & Thermal Absorption',
        desc: 'Gloeocapsa magma algae creates dark black streaks that absorb extra solar heat, driving up attic temperatures and degrading asphalt binder.',
      },
      {
        title: 'Flashing Leaks on Complex Multi-Level Roofs',
        desc: 'Custom multi-level Longview homes feature step flashings, headwalls, and valleys that require precision installation to prevent wall leaks.',
      },
    ],
    localServices: [
      {
        name: 'Architectural Reroofing & Tear-Off',
        desc: 'Full shingle tear-off with CDX decking inspection in Spring Hill and Pine Tree.',
        path: '/roofing/roof-replacement',
      },
      {
        name: 'Storm Tree Impact Repair',
        desc: 'Emergency rafter reinforcement, deck sheathing, and tarping across Gregg County.',
        path: '/storm-damage/fallen-tree-damage',
      },
      {
        name: 'Precision Flashing Restoration',
        desc: 'Chimney counter-flashing and step flashing reseals for established Longview homes.',
        path: '/roofing/roof-repair',
      },
    ],
    whyLocalChooseUs: [
      'Extensive experience navigating Gregg County insurance scopes and adjuster walk-throughs.',
      'We install premium algae-resistant shingles engineered for dense East Texas tree shade.',
      'Dedicated project managers on site from tear-off to final magnetic sweep.',
      'Full protection for manicured landscaping, pools, and flowerbeds.',
    ],
    localFaqs: [
      {
        q: 'How do you protect my landscaping during a roof replacement in Longview?',
        a: 'We construct protective plywood "catchers" over air conditioner condensers and drape heavy-duty tarps across all flowerbeds and shrubs. Debris is moved directly into rubber-tired trailers to protect your lawn and driveway.',
      },
      {
        q: 'Do you offer free roof inspections in Longview, TX?',
        a: 'Yes. We provide free, comprehensive 21-point physical roof health inspections with zero obligation throughout Longview, White Oak, and Gladewater.',
      },
    ],
    metaDescription: 'Expert roofing services in Longview, TX (Gregg County). Tree impact repairs, algae-resistant architectural shingles, and comprehensive storm damage restorations.',
    zipCodes: ['75601', '75602', '75604', '75605'],
    permitInfo: 'City of Longview Development Services (300 W Cotton St)',
  },

  tyler: {
    slug: 'tyler',
    name: 'Tyler',
    county: 'Smith County',
    tagline: 'Rose Capital Hub • Steep Architectural Pitches & Severe Hail Corridors',
    heroImage: '/assets/images/chimney_flashing_roof.jpg',
    intro: 'Known worldwide as the Rose Capital of America, Tyler is renowned for its historic brick streets, sprawling azalea trails, and prestigious residential architecture. From the heritage mansions of the Azalea Residential Historic District to luxury custom estates in Hollytree and Cumberland Academy, Tyler properties demand high-caliber craftsmanship.',
    climateAndGeography: 'Tyler’s rolling hills and geographic location in Smith County place it directly inside a high-intensity severe weather corridor. Supercells tracking eastward from Dallas-Fort Worth frequently intensify over Smith County, unleashing violent straight-line winds and multi-inch hail swaths that damage steep-pitch architectural roofs.',
    localRoofProblems: [
      {
        title: 'Severe Supercell Hail Shatter',
        desc: 'Smith County hail corridors regularly deliver 1.5-inch to 2.5-inch hail stones that fracture shingle cores, dent copper valleys, and crack skylights.',
      },
      {
        title: 'Steep-Pitch Valley Flashing Fatigue',
        desc: 'Intricate multi-gable rooflines (10/12 to 14/12 pitch) channel enormous volumes of water at high velocity, requiring reinforced metal valley liners.',
      },
      {
        title: 'Brick Chimney Counterflashing Mortar Leaks',
        desc: 'Historic Tyler homes feature multiple large brick chimneys where deteriorating mortar reglets allow rain to seep behind interior fireplace walls.',
      },
      {
        title: 'Architectural Deed Restriction Compliance',
        desc: 'Tyler HOA communities (such as Hollytree) mandate specific architectural shingle profiles and dimensional color palettes that must be strictly matched.',
      },
    ],
    localServices: [
      {
        name: 'Class 4 Impact-Resistant Upgrades',
        desc: 'UL 2218 Class 4 certified shingles saving up to 25% on Smith County home insurance.',
        path: '/roofing/roof-replacement',
      },
      {
        name: 'Historic Masonry & Chimney Flashing',
        desc: 'Hand-crafted reglet counterflashing and step flashing for Tyler heritage homes.',
        path: '/roofing/roof-repair',
      },
      {
        name: 'Forensic Hail Claim Adjuster Support',
        desc: 'We physically climb complex steep slopes to meet insurance adjusters.',
        path: '/insurance-claims',
      },
    ],
    whyLocalChooseUs: [
      'Mastery of steep-slope and high-pitch architectural roofing installations.',
      'Deep familiarity with Tyler HOA architectural guidelines and municipal permitting.',
      'We bring physical sample boards to your home to guarantee perfect aesthetic matches.',
      'Certified Haag Engineering damage assessment methodologies.',
    ],
    localFaqs: [
      {
        q: 'Does The Roof Doctors handle HOA approvals in Tyler subdivisions?',
        a: 'Yes. We provide complete manufacturer spec sheets, shingle color samples, and warranty documentation to submit directly to your HOA architectural review committee for rapid approval.',
      },
      {
        q: 'Can you work on steep roofs in historic Tyler neighborhoods?',
        a: 'Yes. Our crews are fully trained in OSHA steep-slope fall protection and harness rigging, allowing us to safely execute complex replacements on 10/12, 12/12, and turret roof structures.',
      },
    ],
    metaDescription: 'Premier roofing contractors in Tyler, TX (Smith County). High-pitch architectural replacements, Class 4 impact shingles, and historic chimney flashing repairs.',
    zipCodes: ['75701', '75702', '75703', '75707'],
    permitInfo: 'City of Tyler Building Inspection (423 W Ferguson St)',
  },

  marshall: {
    slug: 'marshall',
    name: 'Marshall',
    county: 'Harrison County',
    tagline: 'Historic Harrison County • Cypress Bayou Moisture & Historic Rooflines',
    heroImage: '/assets/images/roof_inspection_walk.jpg',
    intro: 'Steeped in 19th-century history, Marshall features magnificent historic landmark homes, towering cypress trees, and classical East Texas architecture. As the county seat of Harrison County, Marshall requires roofing professionals who respect architectural heritage while delivering modern meteorological durability.',
    climateAndGeography: 'Bordering Caddo Lake and the Cypress Bayou basin, Marshall has some of the highest ambient humidity levels in Texas. This persistent moisture environment accelerates the erosion of asphalt binders and causes untreated roof sheathing to mildew rapidly if proper ventilation is not engineered into the roof assembly.',
    localRoofProblems: [
      {
        title: 'Cypress Bayou Moisture & Wood Rot',
        desc: 'High ambient humidity and heavy canopy shade cause damp valleys to retain standing water, leading to hidden decking rot beneath old felt underlayment.',
      },
      {
        title: 'Historic Gable & Valley Flashing Separation',
        desc: 'Marshall’s historic residences often have non-standard pitches and aging sheet metal valleys that require custom metal bending and polyurethane sealing.',
      },
      {
        title: 'High-Wind Creased Shingle Blow-Offs',
        desc: 'Severe convective storms passing along the I-20 corridor routinely break the seal on 3-tab shingles across Harrison County.',
      },
      {
        title: 'Heavy Canopy Fallen Limb Punctures',
        desc: 'Massive hardwood limbs falling from mature oaks cause immediate structural punctures through decking into living spaces.',
      },
    ],
    localServices: [
      {
        name: 'Comprehensive Shingle Tear-Off & Re-Decking',
        desc: 'Replacing moisture-rotted decking with fresh CDX sheathing and synthetic underlayment.',
        path: '/roofing/roof-replacement',
      },
      {
        name: 'Historic Home Flashing Reconstruction',
        desc: 'Custom-bent 26-gauge drip edge and counterflashing for classic Marshall architecture.',
        path: '/roofing/roof-repair',
      },
      {
        name: 'Storm Damage Insurance Scope Walk',
        desc: 'Meeting Harrison County adjusters on-site to document all hail and wind damage.',
        path: '/insurance-claims',
      },
    ],
    whyLocalChooseUs: [
      'Unmatched experience preserving historic architectural aesthetics with modern lifetime materials.',
      'We replace rotted decking sheathing—never covering over soft or compromised wood.',
      'Rapid emergency tarping response for fallen limb punctures in Harrison County.',
      'Certified CertainTeed and Owens Corning installers with 130 mph wind warranties.',
    ],
    localFaqs: [
      {
        q: 'Do you inspect the wood decking underneath before putting new shingles on in Marshall?',
        a: 'Always. We perform a 100% complete tear-off down to the bare wood. Our project manager inspects every piece of sheathing, replacing any moisture-damaged or rotted wood before the synthetic barrier is rolled out.',
      },
      {
        q: 'How does The Roof Doctors assist with insurance claims in Harrison County?',
        a: 'We provide a complete photo report with chalk test squares, help you understand your policy scope, and physically meet your adjuster on the roof to ensure all damaged areas are verified.',
      },
    ],
    metaDescription: 'Trusted roofing contractor in Marshall, TX (Harrison County). Historic home roof restorations, moisture deck repair, and storm damage insurance claim inspections.',
    zipCodes: ['75670', '75672'],
    permitInfo: 'City of Marshall Building Inspection (401 S Alamo St)',
  },
};

export const CityPage: React.FC<CityPageProps> = ({
  citySlug,
  onNavigate,
  onOpenIntake,
}) => {
  // Normalize slug
  const normalized = citySlug.toLowerCase().replace(/[^a-z0-9-]/g, '');
  const city = CITY_DETAILS[normalized] || CITY_DETAILS['texarkana'];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 pb-20">
      <SeoHead
        title={`Roofing Contractor in ${city.name}, TX | The Roof Doctors`}
        description={city.metaDescription}
        canonicalPath={`/service-areas/${city.slug}`}
        schemaJson={{
          '@context': 'https://schema.org',
          '@type': 'RoofingContractor',
          name: `The Roof Doctors - ${city.name}`,
          telephone: '+1-903-231-5940',
          areaServed: {
            '@type': 'City',
            name: `${city.name}, TX`,
          },
          address: {
            '@type': 'PostalAddress',
            streetAddress: '1420 Richmond Rd',
            addressLocality: 'Texarkana',
            addressRegion: 'TX',
            postalCode: '75501',
            addressCountry: 'US',
          },
        }}
      />

      {/* Hero: City-Specific */}
      <section className="bg-slate-950 text-white relative py-16 px-4 sm:px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-red-600/20 text-red-400 border border-red-500/30 uppercase tracking-wide">
              <MapPin className="w-4 h-4 text-red-400" />
              <span>{city.county} • Dedicated Local Hub</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
              Roofing Excellence in <br />
              <span className="text-red-500">{city.name}, Texas</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              {city.tagline}. We deliver forensic diagnostic inspections, precision leak repairs, and lifetime architectural roof replacements tailored to {city.name}’s distinct building architecture and weather patterns.
            </p>

            <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-300 pt-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{city.zipCodes.join(', ')} Zip Code Coverage</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{city.permitInfo}</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => onOpenIntake('DIAGNOSTIC')}
                className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 text-center"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>SCHEDULE {city.name.toUpperCase()} INSPECTION ($0 FEE)</span>
              </button>
              <a
                href="tel:9032315940"
                className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 text-center"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>CALL 903-231-5940</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="h-52 relative overflow-hidden">
                <img
                  src={city.heroImage}
                  alt={`Roofing project completed in ${city.name} Texas`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-4 bg-red-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded">
                  {city.name} Project Record
                </span>
              </div>
              <div className="p-6 space-y-2 text-xs">
                <h3 className="font-bold text-white text-base">Local Service Guarantee</h3>
                <p className="text-slate-300 leading-relaxed">
                  Serving {city.name} with certified local crews, physical adjuster accompaniment on roof claims, and transparent photo reports.
                </p>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-slate-400 text-[11px]">
                  <span>County: {city.county.split('&')[0]}</span>
                  <span>Direct Dispatch: 903-231-5940</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* City-Specific Introduction & Geographic Context */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6">
          <div className="max-w-4xl space-y-4">
            <span className="text-xs uppercase tracking-wider text-red-600 font-bold">
              Local Architectural &amp; Meteorological Context
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
              Roofing in {city.name}, Texas: Heritage &amp; Climate
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {city.intro}
            </p>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-900 block font-bold mb-1">Local Climate &amp; Weather Profile:</strong>
              {city.climateAndGeography}
            </div>
          </div>
        </div>
      </section>

      {/* Localized Roofing Problems in that City */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="max-w-3xl mb-8">
          <span className="text-xs uppercase tracking-wider text-red-600 font-bold">
            Diagnostics In {city.name}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight mt-1">
            Common Roofing Problems Diagnosed in {city.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Our inspectors frequently identify these specific failure modes on homes throughout {city.county}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {city.localRoofProblems.map((prob, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-2"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <h3 className="font-bold text-slate-900 text-sm">{prob.title}</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{prob.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services Tailored to that Municipality */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-10 border border-slate-800">
          <div className="max-w-3xl space-y-3 mb-8">
            <span className="text-xs uppercase tracking-wider text-red-400 font-bold">
              Municipal Solutions
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              Roofing Services Available in {city.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              All services adhere to local municipal codes, manufacturer guidelines, and Texas insurance laws.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {city.localServices.map((srv, idx) => (
              <div
                key={idx}
                onClick={() => onNavigate(srv.path)}
                className="p-5 bg-slate-950 rounded-xl border border-slate-800 hover:border-red-500 transition-all cursor-pointer space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <h3 className="font-bold text-white text-sm">{srv.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{srv.desc}</p>
                </div>
                <div className="pt-2 border-t border-slate-800 text-xs font-bold text-red-400 flex items-center justify-between">
                  <span>Explore Service</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Homeowners in this City Choose The Roof Doctors */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6">
          <div className="max-w-3xl">
            <span className="text-xs uppercase tracking-wider text-red-600 font-bold">
              Community Accountability
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight mt-1">
              Why {city.name} Homeowners Choose The Roof Doctors
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              We stand apart from transient storm chasers through forensic diagnostic precision and local permanence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {city.whyLocalChooseUs.map((reason, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3 text-xs text-slate-700"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Local FAQs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="max-w-3xl mb-6">
          <span className="text-xs uppercase tracking-wider text-red-600 font-bold">
            Local Answers
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight mt-1">
            Frequently Asked Questions in {city.name}, TX
          </h2>
        </div>

        <div className="space-y-3">
          {city.localFaqs.map((faq, idx) => (
            <details
              key={idx}
              className="bg-white border border-slate-200 rounded-xl p-4 cursor-pointer"
            >
              <summary className="font-bold text-xs sm:text-sm text-slate-900 flex justify-between items-center">
                <span>{faq.q}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </summary>
              <p className="text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100 leading-relaxed">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Primary City CTA Band */}
      <section className="bg-slate-900 text-white py-14 px-4 sm:px-6 mt-12 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="text-xs uppercase tracking-wider text-red-400 font-bold">
            Direct Dispatch Across {city.county}
          </span>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
            Schedule a Free Inspection in {city.name}, TX
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Get an objective, physical 21-point roof health inspection from certified technicians. No sales pitch—just the honest facts about your roof.
          </p>
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onOpenIntake('DIAGNOSTIC')}
              className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-colors cursor-pointer"
            >
              REQUEST {city.name.toUpperCase()} INSPECTION
            </button>
            <a
              href="tel:9032315940"
              className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>DISPATCH: 903-231-5940</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
