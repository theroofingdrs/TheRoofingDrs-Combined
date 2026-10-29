import React, { useState } from 'react';
import { api } from '../../lib/api.ts';
import type { Inspection, Property, Customer } from '../../../shared/types/index.ts';
import {
  X,
  ShieldCheck,
  MapPin,
  Calendar,
  User,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Camera,
  CheckSquare,
  Award,
  Layers,
} from 'lucide-react';

interface InspectionDetailModalProps {
  inspection: Inspection | null;
  property?: Property;
  customer?: Customer;
  isOpen: boolean;
  onClose: () => void;
  onInspectionUpdated?: (updated: Inspection) => void;
}

export const InspectionDetailModal: React.FC<InspectionDetailModalProps> = ({
  inspection,
  property,
  customer,
  isOpen,
  onClose,
  onInspectionUpdated,
}) => {
  const [qcNotes, setQcNotes] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  if (!isOpen || !inspection) return null;

  const handleReviewAction = async (status: 'REVIEWED' | 'SUBMITTED') => {
    setIsReviewing(true);
    setReviewMessage(null);
    try {
      const updated = await api.reviewInspection(inspection.id, {
        reviewStatus: status === 'REVIEWED' ? 'APPROVED' : 'REVISION_REQUESTED',
        notes: qcNotes || (status === 'REVIEWED' ? 'QC Approved - All 21 points verified sound.' : 'Revision requested by Production Supt.'),
      });
      if (onInspectionUpdated) onInspectionUpdated(updated);
      setReviewMessage(status === 'REVIEWED' ? 'Inspection approved by Quality Control.' : 'Revision request sent to field inspector.');
    } catch (err: any) {
      console.error('Failed to update inspection review:', err);
      setReviewMessage('Review status update failed.');
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-800 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">
                  Inspection #{inspection.id}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                  {inspection.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Diagnostic 21-Point Walk &bull; Conducted {new Date(inspection.scheduledDate || inspection.completedDate || '').toLocaleDateString()}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {reviewMessage && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{reviewMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* Top Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Property Address</span>
              <span className="font-semibold text-white text-xs block truncate">
                {property?.address || 'Site Address'}
              </span>
              <span className="text-[11px] text-slate-400">
                {property?.city || 'Texarkana'}, {property?.state || 'TX'} {property?.zip || '75501'}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Homeowner / Contact</span>
              <span className="font-semibold text-white text-xs block">
                {customer ? `${customer.firstName} ${customer.lastName}` : 'Homeowner on Record'}
              </span>
              <span className="text-[11px] text-slate-400">{customer?.phone || '903-231-5940'}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Decking &amp; Flashing</span>
              <span className="font-semibold text-white text-xs block">
                Decking: <strong className="text-emerald-400">{inspection.deckingCondition || 'SOLID'}</strong>
              </span>
              <span className="text-[11px] text-slate-400">
                Flashing: <strong className="text-slate-200">{inspection.flashingCondition || 'SOUND'}</strong>
              </span>
            </div>
          </div>

          {/* Diagnostic Findings */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-red-500" />
              <span>Inspector Findings &amp; Forensic Evaluation</span>
            </h4>
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2 text-slate-200">
              <p className="leading-relaxed whitespace-pre-line text-xs">
                {inspection.findingsSummary || 'Full 21-point physical walk documented. All critical points inspected.'}
              </p>
            </div>
          </div>

          {/* Plain-Language Homeowner Sections */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">
                What This Means For Protection
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {inspection.whatItMayMean || 'Standard roof performance. Decking is structurally solid with no active interior moisture hazards.'}
              </p>
            </div>

            <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">
                Recommended Next Step
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {inspection.recommendation || 'VERIFIED'} &bull; {inspection.whatWeRecommendNext || 'Follow up with preventative maintenance plan.'}
              </p>
            </div>
          </div>

          {/* Damage Observations if any */}
          {inspection.damageObservations && inspection.damageObservations.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>Damage Observations ({inspection.damageObservations.length})</span>
              </h4>
              <div className="space-y-1.5">
                {inspection.damageObservations.map((obs) => (
                  <div key={obs.id} className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg flex justify-between items-start text-xs">
                    <div>
                      <div className="font-semibold text-white">
                        {obs.category.replace('_', ' ')} &mdash; {obs.area.replace('_', ' ')}
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">{obs.description}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                      {obs.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quality Control Review Section */}
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-white">
                Production Quality Control &amp; Sign-Off
              </h4>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                QC Reviewer Notes (Carlos Ruiz / Estimating Supt.):
              </label>
              <input
                type="text"
                value={qcNotes}
                onChange={(e) => setQcNotes(e.target.value)}
                placeholder="e.g. Verified decking solid, photographic evidence meets warranty criteria."
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 text-slate-100 rounded-lg text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
              <button
                type="button"
                disabled={isReviewing}
                onClick={() => handleReviewAction('SUBMITTED')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Request Revisions
              </button>

              <button
                type="button"
                disabled={isReviewing}
                onClick={() => handleReviewAction('REVIEWED')}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve &amp; Finalize Audit</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
