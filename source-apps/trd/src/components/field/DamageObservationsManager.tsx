import React, { useState } from 'react';
import { api } from '../../lib/api.ts';
import type { DamageObservation, RoofArea } from '../../../shared/types/index.ts';
import {
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle2,
  Camera,
  Info,
  Flame,
  ShieldAlert,
} from 'lucide-react';

interface DamageObservationsManagerProps {
  inspectionId?: string;
  propertyId?: string;
  roofId?: string;
  observations: DamageObservation[];
  onObservationAdded: (obs: DamageObservation) => void;
  onObservationDeleted: (obsId: string) => void;
}

export const DamageObservationsManager: React.FC<DamageObservationsManagerProps> = ({
  inspectionId,
  propertyId,
  roofId,
  observations,
  onObservationAdded,
  onObservationDeleted,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [category, setCategory] = useState<string>('HAIL');
  const [area, setArea] = useState<RoofArea>('SOUTH_SLOPE');
  const [severity, setSeverity] = useState<'MINOR' | 'MODERATE' | 'SEVERE' | 'EMERGENCY'>('MODERATE');
  const [verificationStatus, setVerificationStatus] = useState<'OBSERVED' | 'POSSIBLE' | 'REQUIRES_FURTHER_REVIEW'>('OBSERVED');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const predefinedDescriptions: Record<string, string> = {
    HAIL: 'Observed 7-9 discrete circular fractures in mineral granules exposing fiberglass mat per 100 sq ft test square. Accompanying soft metal denting on gutter apron.',
    WIND: 'Observed horizontal crease marks across shingle tabs with broken thermal adhesive bonds causing shingle uplift on windward exposure.',
    FLASHING: 'Counter-flashing sealant along masonry chimney mortar joints has dried and split, creating direct water pathway into attic decking.',
    PIPE_BOOT: 'Neoprene rubber collar around 3-inch plumbing vent stack has cracked from UV degradation, allowing rainwater infiltration.',
    DECKING: 'Spongy soft spot detected beneath valley lining under foot traffic. Localized moisture rot observed on underside from attic crawlspace.',
    GRANULE_LOSS: 'Accelerated mineral granule shedding along water runoff flow lines, leaving bare black asphalt exposed to direct sun damage.',
  };

  const handleApplySampleDesc = () => {
    if (predefinedDescriptions[category]) {
      setDescription(predefinedDescriptions[category]);
    }
  };

  const handleSaveObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setStatusMessage('Please enter a factual observation description.');
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      if (inspectionId) {
        const created = await api.addDamageObservation(inspectionId, {
          propertyId,
          roofId,
          category,
          area,
          severity,
          verificationStatus,
          description: description.trim(),
          photoUrl: photoUrl.trim() || undefined,
        });
        onObservationAdded(created);
      } else {
        // Local fallback if inspection hasn't been persisted yet
        const localObs: DamageObservation = {
          id: `dmg_${Date.now()}`,
          inspectionId: inspectionId || 'insp_local',
          category: category as any,
          area: area as any,
          severity: severity as any,
          verificationStatus,
          description: description.trim(),
          photoUrl: photoUrl.trim() || undefined,
          createdAt: new Date().toISOString(),
        };
        onObservationAdded(localObs);
      }

      setDescription('');
      setPhotoUrl('');
      setShowAddForm(false);
      setStatusMessage('Observation logged with verified audit status.');
    } catch (err) {
      console.error('Failed to add observation:', err);
      setStatusMessage('Failed to record observation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (obsId: string) => {
    if (inspectionId) {
      try {
        await api.deleteDamageObservation(inspectionId, obsId);
      } catch (err) {
        console.warn('Backend delete sync note:', err);
      }
    }
    onObservationDeleted(obsId);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <h3 className="font-bold text-sm text-white">Damage &amp; Vulnerability Observations</h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Objective, factual forensic documentation of physical anomalies.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showAddForm ? 'Cancel' : 'Log Observation'}</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Add Observation Form */}
      {showAddForm && (
        <form
          onSubmit={handleSaveObservation}
          className="p-3.5 bg-slate-950/70 border border-slate-700/80 rounded-xl space-y-3 animate-in fade-in duration-200 text-xs"
        >
          <div className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>New Forensic Observation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Damage Category:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-slate-100 rounded-lg text-xs font-semibold focus:outline-none focus:border-red-500"
              >
                <option value="HAIL">Hail Bruise / Spatter (ASTM D3746)</option>
                <option value="WIND">Wind Crease / Detached Tab</option>
                <option value="FLASHING">Flashing / Reglet Separation</option>
                <option value="PIPE_BOOT">Pipe Boot Collar Dry Rot</option>
                <option value="DECKING">Spongy / Delaminated Decking</option>
                <option value="GRANULE_LOSS">Accelerated Granule Erosion</option>
                <option value="TREE">Tree Limb Impact / Abrasion</option>
                <option value="ANIMAL">Animal / Rodent Penetration</option>
                <option value="OTHER">Other Anomaly</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Roof Plane / Location:
              </label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-slate-100 rounded-lg text-xs font-semibold focus:outline-none focus:border-red-500"
              >
                <option value="SOUTH_SLOPE">South Slope (High Sun / Weather)</option>
                <option value="NORTH_SLOPE">North Slope (Moisture / Algae)</option>
                <option value="EAST_SLOPE">East Slope</option>
                <option value="WEST_SLOPE">West Slope (Prevailing Storm)</option>
                <option value="FRONT_VALLEY">Front Elevation Valley</option>
                <option value="REAR_RIDGE">Main Ridge Line</option>
                <option value="CHIMNEY">Chimney Counter-Flashing Saddle</option>
                <option value="EAVES">Eave Perimeter / Gutter Apron</option>
                <option value="DORMER">Dormer Sidewall Step Flashing</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Severity Level:
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-slate-100 rounded-lg text-xs font-semibold focus:outline-none focus:border-red-500"
              >
                <option value="MINOR">Minor / Cosmetic (Monitor)</option>
                <option value="MODERATE">Moderate / Vulnerable to Water Ingress</option>
                <option value="SEVERE">Severe / Active Degradation</option>
                <option value="EMERGENCY">Emergency / Imminent Interior Leak</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Verification Standard:
              </label>
              <select
                value={verificationStatus}
                onChange={(e) => setVerificationStatus(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-slate-100 rounded-lg text-xs font-semibold focus:outline-none focus:border-red-500"
              >
                <option value="OBSERVED">Observed &amp; Tactile Verified</option>
                <option value="POSSIBLE">Possible / Suspected</option>
                <option value="REQUIRES_FURTHER_REVIEW">Requires Closer Drone / Attic Review</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-slate-300">
                Factual Forensic Description:
              </label>
              <button
                type="button"
                onClick={handleApplySampleDesc}
                className="text-[10px] text-red-400 hover:text-red-300 cursor-pointer font-medium"
              >
                Auto-fill Standard Language
              </button>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="State observed physical facts (e.g., 'Observed 8 discrete impacts per test square on West slope. Granules crushed into asphalt mat.')."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-slate-100 rounded-lg text-xs focus:outline-none focus:border-red-500 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Evidence Photo URL (Optional):
            </label>
            <input
              type="text"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://... or attach from photo tab"
              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 text-slate-100 rounded-lg text-xs focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{loading ? 'Saving...' : 'Add Observation'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Observations List */}
      {observations.length === 0 ? (
        <div className="p-6 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-800 text-slate-400 space-y-1">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto opacity-70" />
          <p className="text-xs font-semibold text-slate-300">No Damage Observations Logged</p>
          <p className="text-[11px] text-slate-500">
            If hail bruising, wind creasing, or flashing failures exist, click &quot;Log Observation&quot; above.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {observations.map((obs) => {
            const severityColor =
              obs.severity === 'EMERGENCY'
                ? 'bg-red-950 text-red-300 border-red-800'
                : obs.severity === 'SEVERE'
                ? 'bg-amber-950 text-amber-300 border-amber-800'
                : obs.severity === 'MODERATE'
                ? 'bg-blue-950 text-blue-300 border-blue-800'
                : 'bg-slate-800 text-slate-300 border-slate-700';

            return (
              <div
                key={obs.id}
                className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs space-y-2 relative group hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                      {obs.category.replace('_', ' ')}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                      {obs.area.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${severityColor}`}
                    >
                      {obs.severity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(obs.id)}
                      className="text-slate-500 hover:text-red-400 p-1 cursor-pointer transition-colors"
                      title="Delete observation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-[12px] text-slate-200 leading-relaxed pl-1 border-l-2 border-slate-700">
                  {obs.description}
                </p>

                {obs.photoUrl && (
                  <div className="pt-1">
                    <img
                      src={obs.photoUrl}
                      alt={obs.category}
                      className="w-full max-w-xs h-32 object-cover rounded-lg border border-slate-700"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                  <span>Status: {obs.verificationStatus || 'OBSERVED'}</span>
                  <span>ID: {obs.id}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
