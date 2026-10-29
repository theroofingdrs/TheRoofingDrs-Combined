import React, { useState } from 'react';
import { api } from '../../lib/api.ts';
import type { Customer, Property, Inspection } from '../../../shared/types/index.ts';
import {
  X,
  SearchCheck,
  Building,
  User,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Save,
  CheckSquare,
  Square,
  ShieldAlert,
  Ruler,
} from 'lucide-react';

interface SubmitDiagnosticReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  customers: Customer[];
  onReportSubmitted: (inspection: Inspection, message: string) => void;
}

export const SubmitDiagnosticReportModal: React.FC<SubmitDiagnosticReportModalProps> = ({
  isOpen,
  onClose,
  properties,
  customers,
  onReportSubmitted,
}) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(
    properties.length > 0 ? properties[0].id : ''
  );
  const [inspectorName, setInspectorName] = useState('Carlos Ruiz (Production Supt.)');
  const [inspectionType, setInspectionType] = useState<Inspection['inspectionType']>('FULL_DIAGNOSTIC');
  const [deckingCondition, setDeckingCondition] = useState<Inspection['deckingCondition']>('SOLID');
  const [flashingCondition, setFlashingCondition] = useState<Inspection['flashingCondition']>('SOUND');
  const [atticInspected, setAtticInspected] = useState(true);
  const [ventilationAdequate, setVentilationAdequate] = useState(true);
  const [customerPresent, setCustomerPresent] = useState(true);
  const [recommendation, setRecommendation] = useState<string>('REPLACEMENT');
  
  // 21-point checklist state
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    deckingSolid: true,
    shingleBondIntact: true,
    hailBruisingDocumented: false,
    windCreasesChecked: false,
    pipeBootRubberFlexible: true,
    stepFlashingSound: true,
    valleyIceWaterShieldPresent: true,
    chimneyCounterFlashingSecure: true,
    ridgeVentUnobstructed: true,
    soffitIntakeClear: true,
    atticMoistureDry: true,
    atticMoldAbsent: true,
    atticDaylightCheck: true,
    gutterSlopeProper: true,
    dripEdgePresent: true,
    starterShingleAdhesion: true,
    collateralMetalDents: false,
    downspoutGranuleCheck: true,
    underlaymentSynthetic: true,
    penetrationSealantFresh: true,
    magneticNailSweepComplete: true,
  });

  // Plain English customer-facing explanation
  const [findingsSummary, setFindingsSummary] = useState(
    'Conducted complete 21-point exterior and attic diagnostic inspection. Shingle granules are generally intact with minor weathering. Decking walked solid with no soft moisture rot. Flashing around chimney and valleys is securely sealed.'
  );
  const [whatItMayMean, setWhatItMayMean] = useState(
    'Current roofing system is performing well with normal seasonal wear. No emergency leak risks detected.'
  );
  const [whatWeRecommendNext, setWhatWeRecommendNext] = useState(
    'Schedule annual maintenance checkup in 12 months. Monitor south-facing slope after heavy hail events.'
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleCheck = (key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const checkedPointsCount = Object.values(checklist).filter(Boolean).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedPropertyId) {
      setError('Please select a property for this diagnostic report.');
      return;
    }

    setSaving(true);
    try {
      const targetProperty = properties.find((p) => p.id === selectedPropertyId);
      const targetCustomer = customers.find((c) => c.id === targetProperty?.primaryCustomerId);

      // Create structured inspection record
      const now = new Date().toISOString();
      const inspection = await api.createInspection({
        propertyId: selectedPropertyId,
        customerId: targetCustomer?.id,
        scheduledDate: now.split('T')[0],
        status: 'COMPLETED',
        inspectionType,
        inspectorUserId: inspectorName,
        deckingCondition,
        flashingCondition,
        atticInspected,
        ventilationAdequate,
        customerPresent,
        completedDate: now,
        findingsSummary: `${findingsSummary}\n\nWhat It May Mean: ${whatItMayMean}\n\nRecommended Next Action: ${whatWeRecommendNext}\n\nChecklist verified: ${checkedPointsCount}/21 points sound.`,
        recommendation: recommendation as any,
      });

      // Also append chronological event to roof record timeline
      try {
        const roofRecords = await api.getRoofRecords();
        const matchingRecord = roofRecords.find((r) => r.propertyId === selectedPropertyId);
        if (matchingRecord) {
          await api.addRoofRecordEvent(matchingRecord.id, {
            title: `Diagnostic Walk Completed: ${inspectionType}`,
            eventType: 'INSPECTION',
            description: `Physical 21-point diagnostic completed (${checkedPointsCount}/21 sound). Decking: ${deckingCondition}, Flashing: ${flashingCondition}. Recommendation: ${recommendation}.`,
            relatedEntityId: inspection.id,
            date: now,
          });
        }
      } catch (evtErr) {
        console.warn('Could not attach timeline event to roof record:', evtErr);
      }

      onReportSubmitted(
        inspection,
        `Diagnostic report #${inspection.id} successfully saved and registered to Roof Record!`
      );
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save diagnostic report.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <SearchCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Submit Production Diagnostic Report
              </h2>
              <p className="text-xs text-slate-400">
                Log verified 21-point physical walk, attic audit, and homeowner summary to Roof Record
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Target Property Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Property *
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <select
                  required
                  value={selectedPropertyId}
                  onChange={(e) => setSelectedPropertyId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500 font-medium"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.address}, {p.city} ({p.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Inspector / Production Lead *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Inspection Type
              </label>
              <select
                value={inspectionType}
                onChange={(e) => setInspectionType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500 font-medium"
              >
                <option value="FULL_DIAGNOSTIC">Full 21-Point Diagnostic</option>
                <option value="STORM_DAMAGE">Storm &amp; Hail Assessment</option>
                <option value="EMERGENCY_TARPPING">Emergency Leak &amp; Tarp</option>
                <option value="MAINTENANCE">Annual Shield Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Decking Condition
              </label>
              <select
                value={deckingCondition}
                onChange={(e) => setDeckingCondition(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500 font-medium"
              >
                <option value="SOLID">Solid (Walked &amp; Sound)</option>
                <option value="SPONGY">Spongy Spots Detected</option>
                <option value="ROT_SUSPECTED">Rot / Moisture Damage</option>
                <option value="PARTIAL_REPLACEMENT_NEEDED">Replacement Needed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Flashing Condition
              </label>
              <select
                value={flashingCondition}
                onChange={(e) => setFlashingCondition(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500 font-medium"
              >
                <option value="SOUND">Sound &amp; Properly Step-Flashed</option>
                <option value="SEALANT_DEGRADED">Sealant Degraded</option>
                <option value="CORRODED">Corroded / Rusted</option>
                <option value="DAMAGED">Damaged / Detached</option>
              </select>
            </div>
          </div>

          {/* Checkboxes for physical walk metadata */}
          <div className="flex flex-wrap items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={atticInspected}
                onChange={(e) => setAtticInspected(e.target.checked)}
                className="rounded text-red-600 focus:ring-red-500"
              />
              <span className="font-semibold text-slate-800">Attic Interior Checked</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={ventilationAdequate}
                onChange={(e) => setVentilationAdequate(e.target.checked)}
                className="rounded text-red-600 focus:ring-red-500"
              />
              <span className="font-semibold text-slate-800">Ventilation Ratio Adequate</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={customerPresent}
                onChange={(e) => setCustomerPresent(e.target.checked)}
                className="rounded text-red-600 focus:ring-red-500"
              />
              <span className="font-semibold text-slate-800">Homeowner Present for Walk</span>
            </label>
          </div>

          {/* 21-Point Walk Interactive Checklist */}
          <div className="space-y-2 border border-slate-200 rounded-xl p-4 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">
                21-Point Verification Walk Status
              </span>
              <span className="text-xs font-bold text-red-600">
                {checkedPointsCount} of 21 Points Sound
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2">
              {[
                { key: 'deckingSolid', label: '1. Decking walked for soft spongy spots' },
                { key: 'shingleBondIntact', label: '2. Thermal seal strip bond integrity' },
                { key: 'hailBruisingDocumented', label: '3. 10x10 Test Square hail bruising count' },
                { key: 'windCreasesChecked', label: '4. Horizontal wind crease lines checked' },
                { key: 'pipeBootRubberFlexible', label: '5. Plumbing soil stack rubber collars' },
                { key: 'stepFlashingSound', label: '6. Sidewall step flashing integration' },
                { key: 'valleyIceWaterShieldPresent', label: '7. Valley underlayment condition' },
                { key: 'chimneyCounterFlashingSecure', label: '8. Chimney masonry mortar & reglet' },
                { key: 'ridgeVentUnobstructed', label: '9. Ridge vent net free ventilation area' },
                { key: 'soffitIntakeClear', label: '10. Soffit airflow intake unobstructed' },
                { key: 'atticMoistureDry', label: '11. Attic underside decking moisture test' },
                { key: 'atticMoldAbsent', label: '12. Attic mold / mildew absence verified' },
                { key: 'atticDaylightCheck', label: '13. Attic penetration daylight inspection' },
                { key: 'gutterSlopeProper', label: '14. Gutter apron & drip edge alignment' },
                { key: 'dripEdgePresent', label: '15. Perimeter drip edge installation' },
                { key: 'starterShingleAdhesion', label: '16. Eave starter strip adhesive bond' },
                { key: 'collateralMetalDents', label: '17. AC fins & soft metal collateral proof' },
                { key: 'downspoutGranuleCheck', label: '18. Downspout discharge granule check' },
                { key: 'underlaymentSynthetic', label: '19. Synthetic vs felt underlayment status' },
                { key: 'penetrationSealantFresh', label: '20. Vent collar polyurethane sealant' },
                { key: 'magneticNailSweepComplete', label: '21. Perimeter grounds clean & safe' },
              ].map((pt) => {
                const isChecked = checklist[pt.key] || false;
                return (
                  <button
                    key={pt.key}
                    type="button"
                    onClick={() => toggleCheck(pt.key)}
                    className={`flex items-center justify-between p-2 rounded-lg border text-left transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-medium'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="truncate pr-2">{pt.label}</span>
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Plain English Customer Findings & Recommendations */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Customer-Facing Plain-English Findings
            </h4>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                What We Found (Observable Facts)
              </label>
              <textarea
                rows={2}
                value={findingsSummary}
                onChange={(e) => setFindingsSummary(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  What It May Mean
                </label>
                <textarea
                  rows={2}
                  value={whatItMayMean}
                  onChange={(e) => setWhatItMayMean(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Recommended Next Steps
                </label>
                <textarea
                  rows={2}
                  value={whatWeRecommendNext}
                  onChange={(e) => setWhatWeRecommendNext(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Final Recommendation Status
              </label>
              <select
                value={recommendation}
                onChange={(e) => setRecommendation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500 font-bold"
              >
                <option value="REPLACEMENT">Full System Replacement Recommended</option>
                <option value="REPAIR">Targeted Flashing or Pipe Boot Repair</option>
                <option value="MAINTENANCE_MONITORING">Annual Maintenance Monitoring (Roof is Sound)</option>
                <option value="FURTHER_INSPECTION">Requires Structural Engineer Review</option>
                <option value="NO_ACTION_NEEDED">No Action Needed at This Time</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting &amp; Logging...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Submit Diagnostic Report &amp; Save</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
