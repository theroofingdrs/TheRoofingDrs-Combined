import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Wind,
  Home,
  Compass,
} from 'lucide-react';

export interface ChecklistGroup {
  id: string;
  name: string;
  icon: React.ElementType;
  items: {
    key: string;
    label: string;
    description: string;
    criticality?: 'CRITICAL' | 'STANDARD';
  }[];
}

export const DIAGNOSTIC_GROUPS: ChecklistGroup[] = [
  {
    id: 'decking',
    name: '1. Decking & Substrate Integrity',
    icon: Home,
    items: [
      {
        key: 'deckingSolid',
        label: 'Continuous physical foot walk for soft spongy spots',
        description: 'Check for rotted, delaminated, or water-damaged plywood/OSB decking.',
        criticality: 'CRITICAL',
      },
      {
        key: 'deckingNailHold',
        label: 'Fastener nail pull-through & holding capacity',
        description: 'Verify roofing nails have not backed out or penetrated through soft decking.',
      },
      {
        key: 'spacedDeckingGaps',
        label: '1x Plank spacing & expansion gap check',
        description: 'Ensure spacing between planks conforms to manufacturer solid decking codes.',
      },
      {
        key: 'atticMoistureDry',
        label: 'Attic underside decking moisture & mold audit',
        description: 'Inspect interior attic side for dark water stains, active drips, or fungal growth.',
        criticality: 'CRITICAL',
      },
    ],
  },
  {
    id: 'shingles',
    name: '2. Shingle Surface & Storm Impacts',
    icon: Wind,
    items: [
      {
        key: 'shingleBondIntact',
        label: 'Thermal sealant strip adhesion & seal integrity',
        description: 'Verify shingles are thermally bonded to prevent wind uplift peel.',
      },
      {
        key: 'hailBruisingDocumented',
        label: '10x10 Test Square hail impact count',
        description: 'Objective count of circular fractures, bruised fiberglass mat, and spatter marks.',
        criticality: 'CRITICAL',
      },
      {
        key: 'windCreasesChecked',
        label: 'Horizontal crease lines & detached shingle tabs',
        description: 'Document stress fractures across the shingle upper tab from high wind flexing.',
      },
      {
        key: 'downspoutGranuleCheck',
        label: 'Excessive granule loss & UV asphalt exposure',
        description: 'Inspect gutter discharge and surfaces for protective mineral granule depletion.',
      },
      {
        key: 'starterShingleAdhesion',
        label: 'Eave & rake starter course adhesive bonding',
        description: 'Confirm starter strip is securely adhered to resist perimeter blow-off.',
      },
    ],
  },
  {
    id: 'flashings',
    name: '3. Flashings & Roof Penetrations',
    icon: Layers,
    items: [
      {
        key: 'pipeBootRubberFlexible',
        label: 'Plumbing stack neoprene pipe boot collar elasticity',
        description: 'Check for UV rot, cracking, and water entry around vent pipes.',
        criticality: 'CRITICAL',
      },
      {
        key: 'stepFlashingSound',
        label: 'Sidewall & dormer step flashing corrosion check',
        description: 'Ensure aluminum/galvanized step cards are properly integrated beneath shingles.',
      },
      {
        key: 'valleyIceWaterShieldPresent',
        label: 'Valley lining & self-adhering underlayment protection',
        description: 'Confirm closed-cut or open metal valley has adequate water diverter membrane.',
      },
      {
        key: 'chimneyCounterFlashingSecure',
        label: 'Chimney masonry mortar joint counter-flashing',
        description: 'Inspect reglet cuts, lead counter flashing, and cricket diverter saddle.',
      },
      {
        key: 'penetrationSealantFresh',
        label: 'Roof penetration polyurethane sealant integrity',
        description: 'Verify exhaust vents, furnace flue caps, and satellite penetrations are sealed.',
      },
    ],
  },
  {
    id: 'ventilation',
    name: '4. Attic Ventilation & Airflow',
    icon: Compass,
    items: [
      {
        key: 'ridgeVentUnobstructed',
        label: 'Exhaust ridge vent net free ventilating area (NFVA)',
        description: 'Verify continuous ridge baffle has not buckled or clogged with debris.',
      },
      {
        key: 'soffitIntakeClear',
        label: 'Soffit intake airflow clearance & insulation baffles',
        description: 'Ensure fiberglass attic insulation does not block airflow at the eaves.',
      },
      {
        key: 'atticMoldAbsent',
        label: 'Attic ventilation balance (prevents condensation rot)',
        description: 'Audit temperature and humidity differential between attic and exterior air.',
      },
      {
        key: 'atticDaylightCheck',
        label: 'Attic daylight penetration test around chimneys/valleys',
        description: 'Look for unintended sunlight showing through vulnerable flashing seams.',
      },
    ],
  },
  {
    id: 'perimeter',
    name: '5. Perimeter Grounds & Metal Collateral',
    icon: ShieldCheck,
    items: [
      {
        key: 'gutterSlopeProper',
        label: 'Gutter apron & drip edge water shedding alignment',
        description: 'Ensure water flows into gutters without wicking back onto the fascia board.',
      },
      {
        key: 'collateralMetalDents',
        label: 'AC condenser fins, gutters & soft metal dent evidence',
        description: 'Collateral damage verifying hail size and wind storm direction.',
      },
      {
        key: 'magneticNailSweepComplete',
        label: 'Grounds perimeter magnetic nail sweep verification',
        description: 'Safety check ensuring no stray roofing fasteners remain in driveway or yard.',
      },
    ],
  },
];

interface DiagnosticChecklistSectionProps {
  checklist: Record<string, boolean>;
  onToggle: (key: string) => void;
  onSetCategoryAll?: (keys: string[], value: boolean) => void;
  deckingCondition: 'SOLID' | 'SOFT_SPOTS' | 'ROTTED';
  onDeckingConditionChange: (val: 'SOLID' | 'SOFT_SPOTS' | 'ROTTED') => void;
  flashingCondition: 'SOUND' | 'DETERIORATED' | 'MISSING';
  onFlashingConditionChange: (val: 'SOUND' | 'DETERIORATED' | 'MISSING') => void;
}

export const DiagnosticChecklistSection: React.FC<DiagnosticChecklistSectionProps> = ({
  checklist,
  onToggle,
  onSetCategoryAll,
  deckingCondition,
  onDeckingConditionChange,
  flashingCondition,
  onFlashingConditionChange,
}) => {
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [showAllDetails, setShowAllDetails] = useState(true);

  const totalPoints = DIAGNOSTIC_GROUPS.reduce((acc, g) => acc + g.items.length, 0);
  const checkedPoints = Object.values(checklist).filter(Boolean).length;

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
      {/* Header & Overall Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-red-500 shrink-0" />
            <h3 className="font-bold text-sm text-white">21-Point Physical Roof &amp; Attic Audit</h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Conduct manual tactile verification. Tap sound items; leave vulnerable items unverified.
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="text-right">
            <span className="text-xs font-bold text-red-400">
              {checkedPoints} / {totalPoints}
            </span>
            <span className="text-[10px] text-slate-400 block">Verified Sound</span>
          </div>
          <button
            type="button"
            onClick={() => setShowAllDetails(!showAllDetails)}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
          >
            {showAllDetails ? 'Collapse All' : 'Expand All'}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-red-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(checkedPoints / totalPoints) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>0%</span>
          <span>50%</span>
          <span>100% Diagnostic Completeness</span>
        </div>
      </div>

      {/* Condition Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
            Decking Condition Walked:
          </label>
          <select
            value={deckingCondition}
            onChange={(e) => onDeckingConditionChange(e.target.value as any)}
            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-slate-100 rounded-lg text-xs font-semibold focus:outline-none focus:border-red-500"
          >
            <option value="SOLID">Solid (No Spongy Sag)</option>
            <option value="SOFT_SPOTS">Soft Spots Observed (Moisture Penetration)</option>
            <option value="ROTTED">Rotted / Structural Replacement Needed</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
            Flashing Seam Condition:
          </label>
          <select
            value={flashingCondition}
            onChange={(e) => onFlashingConditionChange(e.target.value as any)}
            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-slate-100 rounded-lg text-xs font-semibold focus:outline-none focus:border-red-500"
          >
            <option value="SOUND">Sound (Properly Lapped &amp; Sealed)</option>
            <option value="DETERIORATED">Deteriorated / Rust / Gaps</option>
            <option value="MISSING">Missing / Urgent Water Vulnerability</option>
          </select>
        </div>
      </div>

      {/* Structured Category Groups */}
      <div className="space-y-3">
        {DIAGNOSTIC_GROUPS.map((group) => {
          const GroupIcon = group.icon;
          const isCollapsed = !showAllDetails || collapsedGroups[group.id];
          const groupChecked = group.items.filter((item) => checklist[item.key]).length;

          return (
            <div
              key={group.id}
              className="bg-slate-950/40 border border-slate-800 rounded-xl overflow-hidden"
            >
              {/* Category Header */}
              <div
                onClick={() => toggleGroup(group.id)}
                className="p-3 bg-slate-800/40 hover:bg-slate-800/60 cursor-pointer flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <GroupIcon className="w-4 h-4 text-red-400" />
                  <span className="font-bold text-xs text-slate-200">{group.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      groupChecked === group.items.length
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {groupChecked} / {group.items.length}
                  </span>
                  {isCollapsed ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Items List */}
              {!isCollapsed && (
                <div className="p-2 space-y-1.5 border-t border-slate-800/80 bg-slate-900/40">
                  {onSetCategoryAll && (
                    <div className="flex justify-end gap-2 px-1 pb-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSetCategoryAll(
                            group.items.map((i) => i.key),
                            true
                          );
                        }}
                        className="text-[10px] text-red-400 hover:text-red-300 cursor-pointer font-medium"
                      >
                        Verify All
                      </button>
                      <span className="text-slate-600 text-[10px]">|</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSetCategoryAll(
                            group.items.map((i) => i.key),
                            false
                          );
                        }}
                        className="text-[10px] text-slate-400 hover:text-slate-300 cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                  )}

                  {group.items.map((item) => {
                    const isChecked = Boolean(checklist[item.key]);
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => onToggle(item.key)}
                        className={`w-full flex items-start justify-between p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-red-950/30 border-red-800/80 text-white'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="pr-3 space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs font-semibold">
                            <span>{item.label}</span>
                            {item.criticality === 'CRITICAL' && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-amber-950 border border-amber-800 text-amber-300 font-bold uppercase">
                                Primary Check
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 leading-tight">
                            {item.description}
                          </p>
                        </div>

                        <div className="mt-0.5 shrink-0">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-red-500" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-500" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
