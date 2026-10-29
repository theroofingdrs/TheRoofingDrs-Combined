import React, { useState, useEffect } from 'react';
import { api } from '../lib/api.ts';
import { StatusBadge } from '../components/common/StatusBadge.tsx';
import { BrandLogo } from '../components/common/BrandLogo.tsx';
import { FieldCheckInWidget } from '../components/field/FieldCheckInWidget.tsx';
import { DiagnosticChecklistSection } from '../components/field/DiagnosticChecklistSection.tsx';
import { DamageObservationsManager } from '../components/field/DamageObservationsManager.tsx';
import { PhotoCaptureUploader } from '../components/field/PhotoCaptureUploader.tsx';
import { MeasurementSatelliteCard } from '../components/field/MeasurementSatelliteCard.tsx';
import { InspectionDetailModal } from '../components/field/InspectionDetailModal.tsx';
import type {
  Inspection,
  Property,
  Customer,
  DamageObservation,
  Photo,
  Measurement,
} from '../../shared/types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  MapPin,
  Camera,
  CheckSquare,
  Navigation,
  PhoneCall,
  Save,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  Layers,
  Ruler,
  Briefcase,
  Eye,
  FileText,
  User,
  ChevronDown,
  ChevronUp,
  LogOut,
} from 'lucide-react';

interface FieldOperationsViewProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export const FieldOperationsView: React.FC<FieldOperationsViewProps> = ({
  currentPath = '/field/today',
  onNavigate = (_path: string) => {},
}) => {
  const { signOut } = useAuth();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);

  // Checklist state
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    deckingSolid: true,
    deckingNailHold: true,
    spacedDeckingGaps: true,
    atticMoistureDry: true,
    shingleBondIntact: true,
    hailBruisingDocumented: false,
    windCreasesChecked: false,
    downspoutGranuleCheck: true,
    starterShingleAdhesion: true,
    pipeBootRubberFlexible: true,
    stepFlashingSound: true,
    valleyIceWaterShieldPresent: true,
    chimneyCounterFlashingSecure: true,
    penetrationSealantFresh: true,
    ridgeVentUnobstructed: true,
    soffitIntakeClear: true,
    atticMoldAbsent: true,
    atticDaylightCheck: true,
    gutterSlopeProper: true,
    collateralMetalDents: false,
    magneticNailSweepComplete: true,
  });

  const [deckingCondition, setDeckingCondition] = useState<'SOLID' | 'SOFT_SPOTS' | 'ROTTED'>('SOLID');
  const [flashingCondition, setFlashingCondition] = useState<'SOUND' | 'DETERIORATED' | 'MISSING'>('SOUND');
  const [findingsSummary, setFindingsSummary] = useState(
    'Conducted 21-point physical walk across all roof elevations. Decking verified solid under foot traffic. Flashing and pipe boots inspected. No active water staining observed on underside of attic sheathing.'
  );
  const [whatItMayMean, setWhatItMayMean] = useState(
    'Roof is structurally sound with standard seasonal weathering. Weather seal integrity is intact.'
  );
  const [whatWeRecommendNext, setWhatWeRecommendNext] = useState(
    'Schedule routine preventative checkup in 12 months. Monitor south slope after severe hail events.'
  );
  const [recommendation, setRecommendation] = useState<string>('ROUTINE_MAINTENANCE');

  // Observations
  const [observations, setObservations] = useState<DamageObservation[]>([]);

  // UI state
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveSuccessDetails, setSaveSuccessDetails] = useState<{ id: string; date: string } | null>(null);
  const [isChecklistCollapsed, setIsChecklistCollapsed] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ins, props, custs, phs, meas] = await Promise.all([
        api.getInspections(),
        api.getProperties(),
        api.getCustomers().catch(() => []),
        api.getPhotos().catch(() => []),
        api.getMeasurements().catch(() => []),
      ]);

      setInspections(ins);
      setProperties(props);
      setCustomers(custs);
      setPhotos(phs);
      setMeasurements(meas);

      if (ins.length > 0) {
        const first = ins[0];
        setSelectedInspection(first);
        if (first.damageObservations) {
          setObservations(first.damageObservations);
        }
        if (first.deckingCondition) {
          setDeckingCondition(first.deckingCondition as any);
        }
        if (first.findingsSummary) {
          setFindingsSummary(first.findingsSummary);
        }
      }
    } catch (err) {
      console.error('Failed to load field operations data:', err);
    }
  };

  const handleSelectInspection = (insp: Inspection) => {
    setSelectedInspection(insp);
    setObservations(insp.damageObservations || []);
    if (insp.deckingCondition) {
      setDeckingCondition(insp.deckingCondition as any);
    }
    if (insp.findingsSummary) {
      setFindingsSummary(insp.findingsSummary);
    }
    setSaveSuccess(false);
  };

  const toggleCheck = (key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const setCategoryAll = (keys: string[], value: boolean) => {
    setChecklist((prev) => {
      const updated = { ...prev };
      keys.forEach((k) => {
        updated[k] = value;
      });
      return updated;
    });
  };

  const checkedCount = Object.values(checklist).filter(Boolean).length;

  const currentProperty = properties.find((p) => p.id === selectedInspection?.propertyId) || properties[0];
  const currentCustomer = customers.find((c) => c.id === currentProperty?.customerId);
  const filteredPhotos = photos.filter((p) => p.propertyId === currentProperty?.id);
  const filteredMeasurements = measurements.filter((m) => m.propertyId === currentProperty?.id);

  const handleSaveAudit = async () => {
    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      let targetInsp = selectedInspection;

      if (!targetInsp) {
        const targetPropId = currentProperty?.id || 'prop_default';
        targetInsp = await api.createInspection({
          propertyId: targetPropId,
          scheduledDate: now.split('T')[0],
          status: 'SUBMITTED',
          inspectionType: 'FULL_DIAGNOSTIC',
          deckingCondition,
          flashingCondition,
          atticInspected: checklist.atticMoistureDry,
          ventilationAdequate: checklist.ridgeVentUnobstructed,
          customerPresent: true,
          completedDate: now,
          findingsSummary,
          customerFacingExplanation: {
            whatWeFound: findingsSummary,
            whatItMayMean,
            whatWeRecommendNext,
            whatWeCannotConfirmYet: 'Concealed roof valley and rafter connections beneath underlayment pending decking exposure.',
          },
          recommendation: recommendation as any,
          damageObservations: observations,
        });
      } else {
        const result = await api.submitInspection(targetInsp.id, {
          findingsSummary,
          recommendation: recommendation as any,
          deckingCondition,
          flashingCondition,
          atticInspected: checklist.atticMoistureDry,
          ventilationAdequate: checklist.ridgeVentUnobstructed,
          customerFacingExplanation: {
            whatWeFound: findingsSummary,
            whatItMayMean,
            whatWeRecommendNext,
            whatWeCannotConfirmYet: 'Concealed roof valley and rafter connections beneath underlayment pending decking exposure.',
          },
          damageObservations: observations,
        });
        targetInsp = result.inspection;
      }

      // Attach chronological event to Roof Record
      try {
        const roofRecords = await api.getRoofRecords();
        const targetRecord = roofRecords.find((r) => r.propertyId === currentProperty?.id) || roofRecords[0];
        if (targetRecord) {
          await api.addRoofRecordEvent(targetRecord.id, {
            title: `21-Point Diagnostic Audit Completed: Inspection #${targetInsp.id}`,
            eventType: 'INSPECTION',
            description: `Field inspection submitted (${checkedCount}/21 points verified sound). Decking: ${deckingCondition}. Observations: ${observations.length} items. Submitted by Field Inspector.`,
            relatedEntityId: targetInsp.id,
            date: now,
          });
        }
      } catch (timelineErr) {
        console.warn('Roof record timeline sync note:', timelineErr);
      }

      setSelectedInspection(targetInsp);
      setSaveSuccess(true);
      setSaveSuccessDetails({
        id: targetInsp.id,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      setIsChecklistCollapsed(true);

      const insList = await api.getInspections();
      setInspections(insList);
    } catch (err) {
      console.error('Failed to submit diagnostic audit:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeTab = currentPath.includes('photos')
    ? 'photos'
    : currentPath.includes('inspections')
    ? 'inspection'
    : currentPath.includes('properties')
    ? 'property'
    : currentPath.includes('projects')
    ? 'project'
    : 'today';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans pb-16">
      {/* Mobile-First Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 py-3 sticky top-7 z-30 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <BrandLogo variant="light" size="sm" />
          <div className="hidden sm:block text-xs font-semibold text-slate-300 border-l border-slate-800 pl-3">
            Field Diagnostic Suite
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono text-slate-300">Inspector Dispatch</span>
          </div>
          <button
            onClick={() => {
              signOut();
              onNavigate('/');
            }}
            className="px-2 py-1 bg-slate-900 hover:bg-red-950 text-slate-400 hover:text-red-300 rounded text-xs flex items-center gap-1 cursor-pointer transition-colors border border-slate-800"
            title="Sign out of field operations"
          >
            <LogOut className="w-3 h-3" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Field Navigation Tabs */}
      <div className="bg-slate-950/90 border-b border-slate-800 px-4 flex items-center gap-2 overflow-x-auto text-xs whitespace-nowrap scrollbar-none">
        <button
          onClick={() => onNavigate('/field/today')}
          className={`py-2.5 px-3 font-bold flex items-center gap-1.5 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'today'
              ? 'border-red-500 text-red-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Today&apos;s Route</span>
        </button>

        <button
          onClick={() => onNavigate('/field/inspections/active')}
          className={`py-2.5 px-3 font-bold flex items-center gap-1.5 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'inspection'
              ? 'border-red-500 text-red-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>21-Pt Diagnostic Walk</span>
        </button>

        <button
          onClick={() => onNavigate('/field/photos/active')}
          className={`py-2.5 px-3 font-bold flex items-center gap-1.5 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'photos'
              ? 'border-red-500 text-red-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Damage &amp; Photos ({observations.length + filteredPhotos.length})</span>
        </button>

        <button
          onClick={() => onNavigate('/field/properties/active')}
          className={`py-2.5 px-3 font-bold flex items-center gap-1.5 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'property'
              ? 'border-red-500 text-red-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Ruler className="w-3.5 h-3.5" />
          <span>Satellite Aerial Specs</span>
        </button>

        <button
          onClick={() => onNavigate('/field/projects/active')}
          className={`py-2.5 px-3 font-bold flex items-center gap-1.5 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'project'
              ? 'border-red-500 text-red-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Work Orders</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="max-w-2xl mx-auto w-full p-4 space-y-4">
        {/* Save Confirmation Banner */}
        {saveSuccess && (
          <div className="p-4 bg-emerald-950/90 border border-emerald-600 text-emerald-200 rounded-2xl text-xs space-y-1.5 shadow-lg animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Diagnostic Report Saved &amp; Recorded</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900 border border-emerald-700 text-emerald-300 font-mono">
                {saveSuccessDetails?.date || 'SAVED'}
              </span>
            </div>
            <p className="text-[11px] text-emerald-300/90 pl-6">
              Report #{saveSuccessDetails?.id || selectedInspection?.id || 'ACTIVE'} was permanently registered to the Homeowner Roof Record.
            </p>
            <div className="pl-6 pt-1 flex items-center gap-3 text-[11px]">
              <span className="text-emerald-400 font-semibold">✓ 21-Pt Walk Recorded</span>
              <button
                type="button"
                onClick={() => setShowDetailModal(true)}
                className="text-white hover:underline cursor-pointer font-bold"
              >
                View Full Summary
              </button>
              <button
                type="button"
                onClick={() => setSaveSuccess(false)}
                className="text-emerald-400/80 hover:text-emerald-200 underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Dispatch Target Card */}
        <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-400">
                Active Job Site
              </span>
              {selectedInspection && (
                <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-slate-900 text-slate-300">
                  {selectedInspection.id}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowDetailModal(true)}
                className="text-[11px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Report Preview</span>
              </button>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white">
                PRIORITY
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">
              {currentProperty?.address || '742 Evergreen Terrace'}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-1">
              <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span>
                {currentProperty?.city || 'Texarkana'}, {currentProperty?.state || 'TX'}{' '}
                {currentProperty?.zip || '75501'}
              </span>
              {currentCustomer && (
                <span className="text-slate-400 ml-2">
                  &bull; Homeowner: <strong className="text-slate-200">{currentCustomer.firstName} {currentCustomer.lastName}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Inspection Switcher if multiple */}
          {inspections.length > 1 && (
            <div className="pt-1">
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Switch Scheduled Route Stop:
              </label>
              <select
                value={selectedInspection?.id || ''}
                onChange={(e) => {
                  const found = inspections.find((i) => i.id === e.target.value);
                  if (found) handleSelectInspection(found);
                }}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-red-500"
              >
                {inspections.map((insp) => {
                  const p = properties.find((pr) => pr.id === insp.propertyId);
                  return (
                    <option key={insp.id} value={insp.id}>
                      {insp.id} &mdash; {p?.address || insp.propertyId} ({insp.status})
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(
                `${currentProperty?.address || ''}, ${currentProperty?.city || ''} ${currentProperty?.state || ''}`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="py-2 px-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-blue-400" />
              <span>GPS Directions</span>
            </a>
            <a
              href={`tel:${currentCustomer?.phone || '9032315940'}`}
              className="py-2 px-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>Call Homeowner</span>
            </a>
          </div>
        </div>

        {/* GPS Check-In / Check-Out Widget */}
        <FieldCheckInWidget
          property={currentProperty}
          appointmentId={selectedInspection?.id}
          inspectorName="Carlos Ruiz (Production Supt.)"
        />

        {/* TAB 1: TODAY'S ROUTE & SUMMARY */}
        {activeTab === 'today' && (
          <div className="space-y-4">
            {/* Quick Action Banner */}
            <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-4 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white">Diagnostic Walk Progress</h3>
                  <p className="text-[11px] text-slate-400">
                    Tactile verification &bull; {checkedCount} of 21 points confirmed sound.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('/field/inspections/active')}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Start / Resume Walk
                </button>
              </div>

              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(checkedCount / 21) * 100}%` }}
                />
              </div>
            </div>

            {/* Damage & Evidence Preview */}
            <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-4 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-red-400" />
                  <h3 className="font-bold text-sm text-white">Field Evidence Logged</h3>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('/field/photos/active')}
                  className="text-xs text-red-400 hover:underline cursor-pointer font-semibold"
                >
                  Manage Photos &amp; Damage &rarr;
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Damage Items:</span>
                  <span className="font-bold text-white font-mono">{observations.length} Logged</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Photos Attached:</span>
                  <span className="font-bold text-white font-mono">{filteredPhotos.length} Photos</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 21-POINT DIAGNOSTIC AUDIT WALK */}
        {activeTab === 'inspection' && (
          <div className="space-y-4">
            <DiagnosticChecklistSection
              checklist={checklist}
              onToggle={toggleCheck}
              onSetCategoryAll={setCategoryAll}
              deckingCondition={deckingCondition}
              onDeckingConditionChange={setDeckingCondition}
              flashingCondition={flashingCondition}
              onFlashingConditionChange={setFlashingCondition}
            />

            {/* Plain English Customer Notes & Recommendations */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3 text-xs">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <FileText className="w-4 h-4 text-red-500" />
                <h3 className="font-bold text-sm text-white">Forensic Findings &amp; Homeowner Report</h3>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  1. What We Found (Plain English description of actual roof conditions):
                </label>
                <textarea
                  rows={2}
                  value={findingsSummary}
                  onChange={(e) => setFindingsSummary(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-slate-100 rounded-xl text-xs focus:outline-none focus:border-red-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  2. What It Means (How this affects structural protection and weather integrity):
                </label>
                <textarea
                  rows={2}
                  value={whatItMayMean}
                  onChange={(e) => setWhatItMayMean(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-slate-100 rounded-xl text-xs focus:outline-none focus:border-red-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    3. Recommended Action:
                  </label>
                  <select
                    value={recommendation}
                    onChange={(e) => setRecommendation(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg text-xs font-semibold focus:outline-none focus:border-red-500"
                  >
                    <option value="ROUTINE_MAINTENANCE">Routine Maintenance (No Critical Hazard)</option>
                    <option value="MINOR_REPAIR">Minor Repair (Pipe Boot / Flashing Reseal)</option>
                    <option value="SECTIONAL_REPLACEMENT">Sectional Replacement (Slope Specific)</option>
                    <option value="FULL_REPLACEMENT">Full Replacement (Severe Storm / Age)</option>
                    <option value="EMERGENCY_TARP">Emergency Tarp (Active Water Penetration)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    4. Next Steps Timeline:
                  </label>
                  <input
                    type="text"
                    value={whatWeRecommendNext}
                    onChange={(e) => setWhatWeRecommendNext(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg text-xs focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSaveAudit}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting & Registering Report...' : 'Complete & Submit Diagnostic Audit'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DAMAGE OBSERVATIONS & PHOTOS */}
        {activeTab === 'photos' && (
          <div className="space-y-4">
            <DamageObservationsManager
              inspectionId={selectedInspection?.id}
              propertyId={currentProperty?.id}
              observations={observations}
              onObservationAdded={(newObs) => setObservations((prev) => [newObs, ...prev])}
              onObservationDeleted={(obsId) => setObservations((prev) => prev.filter((o) => o.id !== obsId))}
            />

            <PhotoCaptureUploader
              propertyId={currentProperty?.id || 'prop_default'}
              inspectionId={selectedInspection?.id}
              photos={filteredPhotos}
              onPhotoUploaded={(newPhoto) => setPhotos((prev) => [newPhoto, ...prev])}
              onPhotoDeleted={(photoId) => setPhotos((prev) => prev.filter((p) => p.id !== photoId))}
            />
          </div>
        )}

        {/* TAB 4: SATELLITE AERIAL MEASUREMENTS */}
        {activeTab === 'property' && (
          <div className="space-y-4">
            <MeasurementSatelliteCard
              property={currentProperty}
              inspectionId={selectedInspection?.id}
              measurements={filteredMeasurements}
              onMeasurementRequested={(newMeas) => setMeasurements((prev) => [newMeas, ...prev])}
            />
          </div>
        )}

        {/* TAB 5: FIELD WORK ORDERS */}
        {activeTab === 'project' && (
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-4 shadow-lg space-y-3 text-xs">
            <h3 className="font-bold text-sm text-white">Active Field Work Orders</h3>
            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-700 space-y-2">
              <div className="font-bold text-white text-xs">
                Diagnostic Leak Inspection &amp; Valley Tarping
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Inspect northern valley leak penetration. Verify decking condition from attic crawlspace before tear-off. Take 6 photos of pipe collar rubber and valley overlap.
              </p>
              <div className="flex items-center justify-between text-[10px] pt-1">
                <span className="text-emerald-400 font-mono font-bold">STATUS: DISPATCHED</span>
                <span className="text-slate-400">Assigned: Carlos Ruiz (Production)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Full Diagnostic Inspection Detail Modal */}
      <InspectionDetailModal
        inspection={selectedInspection}
        property={currentProperty}
        customer={currentCustomer}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onInspectionUpdated={(updated) => {
          setSelectedInspection(updated);
          setInspections((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
        }}
      />
    </div>
  );
};
