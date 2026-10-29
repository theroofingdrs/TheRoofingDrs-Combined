import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.ts';
import { BrandLogo } from '../common/BrandLogo.tsx';
import {
  FileText,
  CheckCircle2,
  PhoneCall,
  ShieldCheck,
  Home,
  User,
  Calendar,
  Layers,
  Sparkles,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Printer,
  Download,
  Clock,
  DollarSign,
  RefreshCw,
} from 'lucide-react';

interface CustomerProposalPortalViewProps {
  proposalId: string;
  onNavigate?: (path: string) => void;
}

export const CustomerProposalPortalView: React.FC<CustomerProposalPortalViewProps> = ({
  proposalId,
  onNavigate,
}) => {
  const [data, setData] = useState<{
    proposal: any;
    lineItems: any[];
    customer: { name: string; email?: string; phone?: string } | null;
    property: { address: string; city: string; state: string; zip: string } | null;
    company: any;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signerName, setSignerName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [actionSuccess, setActionSuccess] = useState<{
    type: 'accepted' | 'declined';
    message: string;
    acceptedAt?: string;
  } | null>(null);

  const loadPortalProposal = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getPortalProposal(proposalId);
      setData(res);
      if (res.customer) {
        setSignerName(res.customer.name || '');
        setSignerEmail(res.customer.email || '');
      }
      if (res.proposal?.options?.length > 0) {
        setSelectedOptionId(res.proposal.options[0].id);
      }
      // If already accepted, mark confirmation state
      if (res.proposal?.status === 'ACCEPTED') {
        setActionSuccess({
          type: 'accepted',
          message: `Proposal #${res.proposal.proposalNumber} has been signed and accepted.`,
          acceptedAt: res.proposal.acceptedAt,
        });
      }
    } catch (err: any) {
      console.error('Failed to load portal proposal:', err);
      setError(err.message || 'Proposal not found or access expired.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (proposalId) {
      loadPortalProposal();
    }
  }, [proposalId]);

  const handleAcceptProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signerName.trim() || !agreedToTerms) return;

    setIsSubmitting(true);
    try {
      const res = await api.acceptPortalProposal(proposalId, {
        signerName: signerName.trim(),
        signerEmail: signerEmail.trim() || undefined,
        selectedOptionId: selectedOptionId || undefined,
      });

      setActionSuccess({
        type: 'accepted',
        message: `Contract accepted successfully. Confirmation #${res.proposalNumber}`,
        acceptedAt: res.acceptedAt,
      });
      // Reload proposal data to reflect accepted state
      await loadPortalProposal();
    } catch (err: any) {
      setError(err.message || 'Failed to submit proposal acceptance.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeclineProposal = async () => {
    setIsSubmitting(true);
    try {
      await api.declinePortalProposal(proposalId, {
        reason: declineReason || 'Customer requested changes or declined at this time.',
      });

      setActionSuccess({
        type: 'declined',
        message: 'Proposal has been marked as declined.',
      });
      setShowDeclineForm(false);
      await loadPortalProposal();
    } catch (err: any) {
      setError(err.message || 'Failed to submit decline response.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
        <RefreshCw className="w-8 h-8 text-red-600 animate-spin mb-3" />
        <h3 className="font-bold text-slate-800 text-sm">Loading Proposal &amp; Scope of Work...</h3>
        <p className="text-xs text-slate-500 mt-1">Retrieving verified diagnostic details and investment tiers.</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-lg text-slate-900">Proposal Unavailable</h3>
        <p className="text-xs text-slate-600">{error || 'This proposal link could not be resolved.'}</p>
        <div className="pt-2">
          <button
            onClick={() => onNavigate?.('/portal/my-roof')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer"
          >
            Return to My Roof Portal
          </button>
        </div>
      </div>
    );
  }

  const { proposal, lineItems, customer, property, company } = data;
  const isAccepted = proposal.status === 'ACCEPTED' || actionSuccess?.type === 'accepted';
  const isDeclined = proposal.status === 'DECLINED' || actionSuccess?.type === 'declined';

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Contractor & Proposal Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <BrandLogo size="md" showTagline={true} />
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              Verified Roofing Contractor
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {company.address} • Phone: {company.phone} • Emergency: {company.emergency}
          </p>
          <div className="text-[11px] text-slate-400">
            Texas HB 2102 Deductible Compliance Guarantee • Fully Insured &amp; Bonded
          </div>
        </div>

        <div className="text-left md:text-right space-y-1">
          <div className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">
            Proposal Reference
          </div>
          <div className="font-mono text-base font-black text-red-600">{proposal.proposalNumber}</div>
          <div className="text-xs text-slate-500">
            Issued: {proposal.createdAt ? new Date(proposal.createdAt).toLocaleDateString() : 'Active'}
          </div>
          {proposal.expiresAt && (
            <div className="text-[11px] text-amber-700 font-semibold">
              Valid Through: {new Date(proposal.expiresAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Banner if Accepted */}
      {isAccepted && (
        <div className="bg-emerald-50 border-2 border-emerald-500/30 rounded-2xl p-6 text-emerald-900 space-y-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-base text-emerald-950">
                Proposal Authorized &amp; Contract Accepted!
              </h3>
              <p className="text-xs text-emerald-800">
                Authorized by <span className="font-bold">{proposal.signatureName || signerName}</span> on{' '}
                {proposal.acceptedAt || actionSuccess?.acceptedAt
                  ? new Date(proposal.acceptedAt || actionSuccess?.acceptedAt!).toLocaleString()
                  : 'Today'}
                .
              </p>
            </div>
          </div>
          <div className="bg-white/80 rounded-xl p-4 text-xs text-emerald-900 border border-emerald-200/60 space-y-1.5">
            <span className="font-bold text-emerald-950 block">Next Steps for Your Project:</span>
            <ul className="list-disc pl-4 space-y-1 text-emerald-800">
              <li>Our production team will contact you within 24 business hours to confirm delivery dates.</li>
              <li>City/County permit filing and materials ordering have been scheduled.</li>
              <li>You can view project updates, permits, and crew timelines directly in your homeowner portal.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Declined Banner if Declined */}
      {isDeclined && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-rose-900 flex items-center gap-3">
          <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold block">This proposal has been declined.</span>
            If you have questions or wish to adjust the scope or budget, please contact your project manager directly at {company.phone}.
          </div>
        </div>
      )}

      {/* Customer & Property Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>Prepared For</span>
          </span>
          <div className="font-bold text-slate-900 text-sm">{customer?.name || 'Homeowner'}</div>
          <div className="text-slate-500">{customer?.phone || ''}</div>
          <div className="text-slate-500">{customer?.email || ''}</div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Home className="w-3.5 h-3.5 text-slate-400" />
            <span>Job Site &amp; Property Address</span>
          </span>
          <div className="font-bold text-slate-900 text-sm">{property?.address || 'Site Location'}</div>
          <div className="text-slate-500">
            {property?.city}, {property?.state} {property?.zip}
          </div>
        </div>
      </div>

      {/* Diagnostic & Project Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-slate-900">{proposal.title}</h3>
        {proposal.introduction && (
          <p className="text-xs text-slate-600 leading-relaxed">{proposal.introduction}</p>
        )}
        {proposal.projectSummary && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900 block mb-1">Diagnostic Inspection Findings:</span>
            {proposal.projectSummary}
          </div>
        )}
      </div>

      {/* Pricing / Investment Options Tiers */}
      {proposal.options && proposal.options.length > 0 && (
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">Recommended Roofing System &amp; Warranty</h3>
            <p className="text-xs text-slate-500">
              Select your preferred roofing system specifications and warranty coverage tier.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {proposal.options.map((option: any) => {
              const isSelected = selectedOptionId === option.id;
              return (
                <div
                  key={option.id}
                  onClick={() => !isAccepted && setSelectedOptionId(option.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer bg-white ${
                    isSelected
                      ? 'border-red-600 ring-2 ring-red-500/20 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-red-600 uppercase tracking-wider">
                        {option.tier} System
                      </span>
                      <h4 className="font-bold text-base text-slate-900">{option.name}</h4>
                      <span className="text-xs text-slate-500">{option.roofSystem}</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-[10px] text-slate-400 block font-sans">Investment</span>
                      <span className="text-xl font-black text-slate-900">${option.price.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>{option.warrantyYears || 30}-Year Comprehensive Warranty</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      {option.warrantyDescription || 'Complete coverage including materials, tear-off labor, and flashing.'}
                    </p>
                  </div>

                  {option.scope && option.scope.length > 0 && (
                    <div className="mt-3 text-xs space-y-1.5">
                      <span className="font-bold text-slate-700">Included System Highlights:</span>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-600 text-[11px]">
                        {option.scope.map((s: string, idx: number) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Itemized Scope of Work Breakdown (Customer-Safe: NO internal costs or margins) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-base text-slate-900">Itemized Specifications &amp; Materials</h3>
          <p className="text-xs text-slate-500">
            Precision line-item scope of work verified against aerial measurements and local building code.
          </p>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3">Item / Specification</th>
                <th className="py-2.5 px-3 w-28">Category</th>
                <th className="py-2.5 px-3 w-20 text-right">Quantity</th>
                <th className="py-2.5 px-3 w-16 text-center">Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lineItems.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-900">{item.description}</td>
                  <td className="py-2.5 px-3 text-slate-500">{item.category || 'Roofing'}</td>
                  <td className="py-2.5 px-3 text-right font-mono">{item.quantity}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-500">{item.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Narrative Scope if provided */}
        {proposal.scopeOfWork && (
          <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-700 font-mono whitespace-pre-line border border-slate-100">
            {proposal.scopeOfWork}
          </div>
        )}
      </div>

      {/* Terms of Service & Texas HB 2102 Guarantees */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3 text-xs text-slate-600">
        <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Terms of Service, Guarantees &amp; Legal Disclosures</span>
        </h4>
        <div className="space-y-2 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
          <p>
            <strong>Texas Insurance Code HB 2102 Notice:</strong> Texas law requires property owners to pay any deductible required under their insurance policy. It is a violation of law for a contractor or roofer to pay, waive, rebate, or absorb a property insurance deductible. The Roof Doctors strictly adheres to state compliance.
          </p>
          <p>
            <strong>Workmanship Guarantee:</strong> All roofing installations performed by The Roof Doctors include our complete 5-Year Workmanship Guarantee against installation defects, alongside manufacturer material warranties.
          </p>
          <p>
            <strong>Property Protection:</strong> Full magnetic nail sweep of lawn and driveway, daily debris disposal, and ground tarping are included in every installation.
          </p>
        </div>
      </div>

      {/* Digital Acceptance Section */}
      {!isAccepted && !isDeclined && (
        <div className="bg-white rounded-2xl border-2 border-red-500/30 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
            <div className="w-9 h-9 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Authorize &amp; Accept Proposal</h3>
              <p className="text-xs text-slate-500">
                Review the terms above and enter your legal signature to authorize the project into production.
              </p>
            </div>
          </div>

          <form onSubmit={handleAcceptProposal} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Legal Name (Electronic Signature) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="e.g. Robert Sterling"
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirmation Email</label>
                <input
                  type="email"
                  value={signerEmail}
                  onChange={(e) => setSignerEmail(e.target.value)}
                  placeholder="homeowner@email.com"
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                />
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-2">
              <input
                type="checkbox"
                id="agree-terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                required
                className="mt-1 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
              />
              <label htmlFor="agree-terms" className="text-xs text-slate-600 cursor-pointer leading-relaxed">
                I hereby accept and authorize the scope of work described in this proposal for the stated investment amount. I acknowledge receipt of the Texas HB 2102 deductible compliance notice and terms of service.
              </label>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDeclineForm(!showDeclineForm)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Questions or wish to decline?
              </button>

              <button
                type="submit"
                disabled={!signerName.trim() || !agreedToTerms || isSubmitting}
                className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Authorizing...' : 'Accept Proposal & Authorize Project'}</span>
              </button>
            </div>
          </form>

          {/* Optional Decline Sub-form */}
          {showDeclineForm && (
            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
              <span className="font-bold text-slate-800 block">Decline Proposal</span>
              <textarea
                rows={2}
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Optional: Please share why this proposal does not fit your requirements..."
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeclineForm(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 text-xs font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeclineProposal}
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-rose-600 text-white rounded text-xs font-bold hover:bg-rose-700 cursor-pointer"
                >
                  Confirm Decline
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
