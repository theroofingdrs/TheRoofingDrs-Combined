import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.ts';
import type { Property, Roof, RoofRecord, RoofRecordEvent } from '../../../shared/types/index.ts';
import { StatusBadge } from '../common/StatusBadge.tsx';
import {
  X,
  MapPin,
  Home,
  ShieldCheck,
  Calendar,
  CloudLightning,
  Ruler,
  AlertTriangle,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
  FileText,
  Save,
  ArrowRight,
} from 'lucide-react';

interface PropertyIntelligenceModalProps {
  propertyId: string | null;
  onClose: () => void;
  onPropertyUpdated?: () => void;
}

export const PropertyIntelligenceModal: React.FC<PropertyIntelligenceModalProps> = ({
  propertyId,
  onClose,
  onPropertyUpdated,
}) => {
  const [data, setData] = useState<{
    property: Property;
    customers: any[];
    roofs: Roof[];
    roofRecord?: RoofRecord;
    roofRecordEvents: RoofRecordEvent[];
    leads: any[];
    appointments: any[];
    inspections: any[];
    damageObservations: any[];
    measurements: any[];
    projects: any[];
    documents: any[];
    photos: any[];
    storms: any[];
    communications: any[];
  } | null>(null);

  const [recordDetail, setRecordDetail] = useState<{
    roofRecord: RoofRecord;
    activeRoof?: Roof;
    historicalRoofs: Roof[];
    timeline: any[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Sub-forms
  const [showReplaceForm, setShowReplaceForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);

  // Replacement Form State
  const [replacementForm, setReplacementForm] = useState({
    roofingSystem: 'Architectural Shingles',
    material: 'Asphalt Shingle',
    manufacturer: 'CertainTeed',
    product: 'Landmark Pro',
    color: 'Weathered Wood',
    pitch: '6/12',
    squares: 28,
    replacementReason: 'Full storm damage restoration and insurance replacement.',
  });

  // Custom Event Form State
  const [eventForm, setEventForm] = useState({
    title: '',
    eventType: 'INSPECTION',
    description: '',
  });

  const [saving, setSaving] = useState(false);

  const loadPropertyData = async () => {
    if (!propertyId) return;
    setLoading(true);
    try {
      const propRes = await api.getPropertyDetail(propertyId);
      setData(propRes);

      if (propRes.roofRecord?.id) {
        const detail = await api.getRoofRecordDetail(propRes.roofRecord.id);
        setRecordDetail(detail);
      }
    } catch (err: any) {
      console.error(err);
      setFeedback(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPropertyData();
  }, [propertyId]);

  if (!propertyId) return null;

  const handleDocumentReplacement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.property) return;
    setSaving(true);
    try {
      await api.createRoof({
        propertyId: data.property.id,
        roofingSystem: replacementForm.roofingSystem,
        material: replacementForm.material,
        manufacturer: replacementForm.manufacturer,
        product: replacementForm.product,
        color: replacementForm.color,
        pitch: replacementForm.pitch,
        squares: Number(replacementForm.squares),
        replacesRoofId: data.property.roofId,
        replacementReason: replacementForm.replacementReason,
      });

      setShowReplaceForm(false);
      setFeedback('Roof replacement documented & appended to lifetime record.');
      await loadPropertyData();
      onPropertyUpdated?.();
    } catch (err: any) {
      setFeedback(`Replacement error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.roofRecord?.id || !eventForm.title) return;
    setSaving(true);
    try {
      await api.addRoofRecordEvent(data.roofRecord.id, {
        title: eventForm.title,
        eventType: eventForm.eventType,
        description: eventForm.description,
      });
      setShowEventForm(false);
      setEventForm({ title: '', eventType: 'INSPECTION', description: '' });
      setFeedback('Milestone added to permanent Roof Record.');
      await loadPropertyData();
      onPropertyUpdated?.();
    } catch (err: any) {
      setFeedback(`Event error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAssociateStorm = async (stormId: string) => {
    if (!data?.roofRecord?.id) return;
    try {
      await api.associateStorm(stormId, {
        propertyId: data.property.id,
        roofRecordId: data.roofRecord.id,
      });
      setFeedback('Storm event impact registered on Roof Record.');
      await loadPropertyData();
      onPropertyUpdated?.();
    } catch (err: any) {
      setFeedback(`Storm error: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 font-bold">
                Property Intelligence &amp; Roof Record
              </span>
              <span className="text-[10px] font-mono text-slate-400">ID: {propertyId}</span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-3 mt-0.5">
              {data ? `${data.property.address}, ${data.property.city}, TX` : 'Loading property...'}
              {data && <StatusBadge status={data.property.verificationStatus} />}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="px-6 py-2 bg-blue-50 border-b border-blue-200 text-blue-800 text-xs flex items-center justify-between">
            <span>{feedback}</span>
            <button onClick={() => setFeedback(null)} className="text-blue-500 hover:text-blue-700 font-bold">
              &times;
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 flex-1">
          {loading ? (
            <div className="flex items-center justify-center p-12 gap-2 text-slate-500 font-medium">
              <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              <span>Loading permanent Roof Record and property intelligence...</span>
            </div>
          ) : !data ? (
            <div className="text-center p-8 text-slate-400">Property records could not be loaded.</div>
          ) : (
            <>
              {/* SECTION 1: ACTIVE ROOF SYSTEM SPECIFICATIONS */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-black text-slate-900 text-sm uppercase tracking-wide flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Active Roof System Specification</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Currently installed system on file for this structure.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowReplaceForm(!showReplaceForm)}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{showReplaceForm ? 'Cancel' : 'Document Roof Replacement'}</span>
                  </button>
                </div>

                {showReplaceForm ? (
                  <form onSubmit={handleDocumentReplacement} className="bg-white p-4 rounded-xl border border-slate-300 space-y-3">
                    <div className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Document New Roof Replacement (Texas Compliance)
                    </div>
                    <p className="text-[11px] text-slate-500">
                      This will archive the current roof and add a permanent REPLACEMENT milestone to the lifetime Roof Record.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Roofing System</label>
                        <select
                          value={replacementForm.roofingSystem}
                          onChange={(e) => setReplacementForm({ ...replacementForm, roofingSystem: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                        >
                          <option value="Architectural Shingles">Architectural Shingles</option>
                          <option value="CertainTeed Grand Manor Luxury Shingles">CertainTeed Grand Manor Luxury Shingles</option>
                          <option value="Impact-Resistant Class 4 Shingles">Impact-Resistant Class 4 Shingles</option>
                          <option value="Standing Seam Metal">Standing Seam Metal</option>
                          <option value="Natural Quarried Slate">Natural Quarried Slate</option>
                          <option value="Clay / Concrete Tile">Clay / Concrete Tile</option>
                          <option value="TPO Flat System">TPO Flat System</option>
                          <option value="Stone-Coated Steel">Stone-Coated Steel</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Manufacturer</label>
                        <input
                          type="text"
                          value={replacementForm.manufacturer}
                          onChange={(e) => setReplacementForm({ ...replacementForm, manufacturer: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                          placeholder="e.g. CertainTeed, GAF, Owens Corning"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Product Line</label>
                        <input
                          type="text"
                          value={replacementForm.product}
                          onChange={(e) => setReplacementForm({ ...replacementForm, product: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                          placeholder="e.g. Landmark Pro, Timberline HDZ"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Color</label>
                        <input
                          type="text"
                          value={replacementForm.color}
                          onChange={(e) => setReplacementForm({ ...replacementForm, color: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                          placeholder="e.g. Weathered Wood, Charcoal"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Pitch</label>
                        <input
                          type="text"
                          value={replacementForm.pitch}
                          onChange={(e) => setReplacementForm({ ...replacementForm, pitch: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                          placeholder="e.g. 6/12"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Squares (SQ)</label>
                        <input
                          type="number"
                          value={replacementForm.squares}
                          onChange={(e) => setReplacementForm({ ...replacementForm, squares: Number(e.target.value) })}
                          className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Replacement Reason / Scope</label>
                      <input
                        type="text"
                        value={replacementForm.replacementReason}
                        onChange={(e) => setReplacementForm({ ...replacementForm, replacementReason: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                        placeholder="e.g. Insurance hail restoration, age replacement, storm damage"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowReplaceForm(false)}
                        className="px-3 py-1.5 text-slate-600 hover:text-slate-900 font-semibold text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs cursor-pointer"
                      >
                        {saving ? 'Recording Replacement...' : 'Save & Archive Old System'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">System</span>
                      <span className="font-bold text-slate-900">
                        {recordDetail?.activeRoof?.roofingSystem || 'Architectural Shingles'}
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">Material &amp; Maker</span>
                      <span className="font-bold text-slate-900">
                        {recordDetail?.activeRoof?.manufacturer || 'CertainTeed'}{' '}
                        {recordDetail?.activeRoof?.product || recordDetail?.activeRoof?.material || 'Asphalt'}
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">Color &amp; Pitch</span>
                      <span className="font-bold text-slate-900">
                        {recordDetail?.activeRoof?.color || 'Standard'}, Pitch: {recordDetail?.activeRoof?.pitch || '6/12'}
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">Verification</span>
                      <span className="font-bold text-emerald-700">
                        {recordDetail?.activeRoof?.sourceStatus || 'VERIFIED'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: STORM IMPACTS IN MARKET */}
              {data.storms && data.storms.length > 0 && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <CloudLightning className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <h4 className="font-bold text-amber-900 text-xs uppercase tracking-wider">
                        Severe Weather Impact History (Zip {data.property.zip})
                      </h4>
                      <p className="text-[11px] text-amber-800">
                        Storm events documented in this market area.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {data.storms.map((st: any) => (
                      <div key={st.id} className="bg-white/90 p-3 rounded-lg border border-amber-200 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 text-xs">{st.eventName}</span>
                          <div className="text-[11px] text-slate-500">
                            Date: {new Date(st.dateOccurred).toLocaleDateString()} &bull; Hail:{' '}
                            {st.hailSizeInches ? `${st.hailSizeInches}"` : 'None'} &bull; Wind:{' '}
                            {st.windSpeedMph ? `${st.windSpeedMph} mph` : 'N/A'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAssociateStorm(st.id)}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-bold cursor-pointer"
                        >
                          Log Storm Impact
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 3: PERMANENT ROOF RECORD LIFETIME TIMELINE */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-black text-slate-900 text-sm uppercase tracking-wide flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-600" />
                      <span>Permanent Roof Record Lifetime History</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Immutable chronological audit log of installations, inspections, measurements, and weather impacts.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEventForm(!showEventForm)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showEventForm ? 'Cancel' : 'Add Milestone Event'}</span>
                  </button>
                </div>

                {showEventForm && (
                  <form onSubmit={handleAddEvent} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Add Custom Lifetime Milestone Event
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Event Title</label>
                        <input
                          type="text"
                          required
                          value={eventForm.title}
                          onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                          placeholder="e.g. Annual Diagnostic QC Inspection"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Event Type</label>
                        <select
                          value={eventForm.eventType}
                          onChange={(e) => setEventForm({ ...eventForm, eventType: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                        >
                          <option value="INSPECTION">INSPECTION</option>
                          <option value="MEASUREMENT">MEASUREMENT</option>
                          <option value="REPAIR">REPAIR</option>
                          <option value="STORM">STORM</option>
                          <option value="WARRANTY">WARRANTY</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Description / Findings</label>
                      <textarea
                        rows={2}
                        value={eventForm.description}
                        onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                        placeholder="Detail physical decking condition, hail bruising, wind crease findings..."
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowEventForm(false)}
                        className="px-3 py-1.5 text-slate-600 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-1.5 bg-slate-900 text-white rounded font-bold text-xs"
                      >
                        {saving ? 'Adding...' : 'Append to Timeline'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Timeline display */}
                <div className="relative pl-6 space-y-6 before:absolute before:top-2 before:bottom-2 before:left-2.5 before:w-0.5 before:bg-slate-200">
                  {recordDetail?.timeline && recordDetail.timeline.length > 0 ? (
                    recordDetail.timeline.map((event: any, idx: number) => {
                      const isReplacement = event.eventType === 'REPLACEMENT';
                      const isInspection = event.eventType === 'INSPECTION';
                      const isStorm = event.eventType === 'STORM';
                      return (
                        <div key={event.id || idx} className="relative">
                          {/* Dot marker */}
                          <div
                            className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs ${
                              isReplacement
                                ? 'bg-purple-600'
                                : isStorm
                                ? 'bg-amber-500'
                                : isInspection
                                ? 'bg-blue-600'
                                : 'bg-emerald-600'
                            }`}
                          />
                          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span
                                className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase ${
                                  isReplacement
                                    ? 'bg-purple-100 text-purple-800'
                                    : isStorm
                                    ? 'bg-amber-100 text-amber-800'
                                    : isInspection
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {event.eventType}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {event.date ? new Date(event.date).toLocaleDateString() : 'Historical'}
                              </span>
                            </div>
                            <div className="font-bold text-slate-900 text-xs">{event.title}</div>
                            {event.description && (
                              <p className="text-slate-600 text-[11px] leading-relaxed">{event.description}</p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-slate-400 italic text-xs">No lifetime events logged yet.</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
