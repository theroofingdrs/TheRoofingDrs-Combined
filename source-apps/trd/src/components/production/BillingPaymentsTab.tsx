import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  ShieldCheck,
  Search,
  Filter,
  ArrowUpRight,
  FileText,
  CreditCard,
} from 'lucide-react';
import { api } from '../../lib/api.ts';
import type { Invoice, Payment, Project } from '../../../shared/types/index.ts';

interface BillingPaymentsTabProps {
  onSelectProject?: (project: Project) => void;
}

export const BillingPaymentsTab: React.FC<BillingPaymentsTabProps> = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [subTab, setSubTab] = useState<'invoices' | 'payments'>('invoices');

  // Modal for quick payment recording
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<string>('CHECK');
  const [payReceipt, setPayReceipt] = useState<string>('');
  const [payIsDeductible, setPayIsDeductible] = useState<boolean>(false);
  const [payConfirmed, setPayConfirmed] = useState<boolean>(false);
  const [payNotes, setPayNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Toast feedback
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invRes, payRes, projRes] = await Promise.all([
        api.getInvoices(),
        api.getPayments(),
        api.getProjects(),
      ]);
      setInvoices(invRes);
      setPayments(payRes);
      setProjects(projRes);
    } catch (err: any) {
      console.error('Failed to load billing and payments data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleIssueInvoice = async (invoiceId: string) => {
    try {
      await api.issueInvoice(invoiceId);
      showToast('Invoice issued successfully to homeowner.');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to issue invoice');
    }
  };

  const handleOpenPayment = (inv?: Invoice) => {
    if (inv) {
      setSelectedInvoice(inv);
      setPayAmount(inv.balance);
      setPayIsDeductible(inv.milestoneType === 'DEPOSIT' || inv.notes?.includes('deductible') || false);
    } else {
      setSelectedInvoice(null);
      setPayAmount(1000);
      setPayIsDeductible(false);
    }
    setPayMethod('CHECK');
    setPayReceipt(`REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setPayNotes('');
    setPayConfirmed(false);
    setShowPaymentModal(true);
  };

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payIsDeductible && !payConfirmed) {
      alert('You must check the Texas HB 2102 confirmation checkbox for insurance deductible payments.');
      return;
    }

    setSubmitting(true);
    try {
      const targetProjId = selectedInvoice ? selectedInvoice.projectId : projects[0]?.id || 'proj_demo_1';
      const targetCustId = selectedInvoice ? selectedInvoice.customerId : 'cust_demo_1';

      await api.recordPayment({
        projectId: targetProjId,
        customerId: targetCustId,
        invoiceId: selectedInvoice ? selectedInvoice.id : undefined,
        amount: Number(payAmount),
        paymentMethod: payMethod,
        receiptNumber: payReceipt || undefined,
        isDeductiblePayment: payIsDeductible,
        texasHb2102DeclarationConfirmed: payConfirmed,
        notes: payNotes || (payIsDeductible ? 'Texas HB 2102 Mandatory Homeowner Deductible Payment' : 'Standard milestone payment'),
      });

      showToast(`Recorded $${payAmount} payment with receipt ${payReceipt}!`);
      setShowPaymentModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  // Metrics
  const totalInvoiced = invoices.reduce((acc, i) => acc + (i.amountDue || 0), 0);
  const totalCollected = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalOutstanding = invoices.reduce((acc, i) => acc + (i.balance || 0), 0);
  const deductiblePayments = payments.filter((p) => p.isDeductiblePayment);

  // Filtered invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.title.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Billing, Invoices &amp; Texas HB 2102 Deductible Compliance</h2>
          <p className="text-xs text-slate-500">
            Milestone generation, ACV deposits, progress invoices, deductible verification receipts, and depreciation closeouts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenPayment()}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Record Payment / Receipt</span>
          </button>
        </div>
      </div>

      {/* Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Invoiced</span>
          <div className="text-2xl font-black text-slate-900 mt-1">${totalInvoiced.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>{invoices.length} total milestones</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Collected</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">${totalCollected.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
            <span>{payments.length} verified receipts</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Outstanding Balance</span>
          <div className="text-2xl font-black text-slate-900 mt-1">${totalOutstanding.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Awaiting progress/depreciation</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Texas HB 2102 Compliance</span>
          <div className="text-sm font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{deductiblePayments.length} Deductibles Verified</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Zero illegal rebates recorded</div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="border-b border-slate-200 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('invoices')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              subTab === 'invoices' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Invoices &amp; Billing Milestones ({invoices.length})
          </button>
          <button
            onClick={() => setSubTab('payments')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              subTab === 'payments' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Payment Receipts &amp; HB 2102 Ledger ({payments.length})
          </button>
        </div>

        {subTab === 'invoices' && (
          <div className="flex items-center gap-2 pb-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invoices..."
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="ISSUED">Issued</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="PAID">Paid</option>
            </select>
          </div>
        )}
      </div>

      {/* SUB-TAB 1: INVOICES TABLE */}
      {subTab === 'invoices' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {filteredInvoices.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <DollarSign className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-sm font-bold text-slate-700">No Invoices Found</div>
              <p className="text-xs text-slate-500">
                Invoices are generated automatically when a project transitions from SOLD into production milestones.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Milestone</th>
                    <th className="py-3 px-4">Customer / Project</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4 text-right">Amount Due</th>
                    <th className="py-3 px-4 text-right">Balance</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 block">{inv.title}</span>
                        <span className="text-[10px] text-slate-400 block">{inv.milestoneType}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-slate-700 block">{inv.customerId}</span>
                        <span className="text-[10px] text-slate-400 block">{inv.projectId}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{inv.dueDate}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">${(inv.amountDue || 0).toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-black text-slate-900">
                        {inv.balance > 0 ? (
                          <span className="text-amber-700">${inv.balance.toLocaleString()}</span>
                        ) : (
                          <span className="text-emerald-700">$0.00</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.status === 'ISSUED'
                            ? 'bg-blue-100 text-blue-800'
                            : inv.status === 'PARTIALLY_PAID'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        {inv.status === 'DRAFT' && (
                          <button
                            onClick={() => handleIssueInvoice(inv.id)}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold cursor-pointer transition-colors"
                          >
                            Issue
                          </button>
                        )}
                        {inv.status !== 'PAID' && (
                          <button
                            onClick={() => handleOpenPayment(inv)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold cursor-pointer transition-colors"
                          >
                            Pay
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: PAYMENT RECEIPTS LEDGER */}
      {subTab === 'payments' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {payments.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Receipt className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-sm font-bold text-slate-700">No Payments Recorded Yet</div>
              <p className="text-xs text-slate-500">
                Click "Record Payment / Receipt" above to record a customer check, credit card transaction, or verified Texas HB 2102 deductible payment.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Receipt #</th>
                    <th className="py-3 px-4">Date / Time</th>
                    <th className="py-3 px-4">Project &amp; Customer</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Texas HB 2102 Deductible Tag</th>
                    <th className="py-3 px-4 text-right">Amount Paid</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.receiptNumber || p.id}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {p.processedAt ? p.processedAt.split('T')[0] : p.createdAt.split('T')[0]}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 block">{p.projectId}</span>
                        <span className="text-[10px] text-slate-400 block">{p.customerId}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {p.isDeductiblePayment ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>Texas HB 2102 Verified</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Standard Milestone</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-emerald-700 text-sm">
                        +${(p.amount || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Record Payment &amp; Issue Receipt</h3>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="p-6 space-y-4">
              {selectedInvoice && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <span className="text-slate-500 block">Applying payment to:</span>
                  <span className="font-bold text-slate-900">{selectedInvoice.invoiceNumber} — {selectedInvoice.title}</span>
                  <span className="text-slate-600 block mt-0.5">Current Balance: ${selectedInvoice.balance.toLocaleString()}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Amount ($) *</label>
                  <input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    required
                    min={1}
                    step={10}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method *</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="CHECK">Homeowner Check</option>
                    <option value="CREDIT_CARD">Credit / Debit Card</option>
                    <option value="ACH">Bank ACH</option>
                    <option value="INSURANCE_CHECK">Insurance Two-Party Check</option>
                    <option value="FINANCING">Financing Disbursement</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Receipt / Check Number</label>
                <input
                  type="text"
                  value={payReceipt}
                  onChange={(e) => setPayReceipt(e.target.value)}
                  placeholder="e.g. CHK-1092 or REC-2026-0042"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Texas HB 2102 Deductible Toggle */}
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={payIsDeductible}
                    onChange={(e) => setPayIsDeductible(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                  />
                  <span className="text-xs font-bold text-blue-950 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>This is a Texas HB 2102 Insurance Deductible Payment</span>
                  </span>
                </label>

                {payIsDeductible && (
                  <label className="flex items-start gap-2 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={payConfirmed}
                      onChange={(e) => setPayConfirmed(e.target.checked)}
                      className="mt-0.5 w-3.5 h-3.5 text-blue-600 rounded border-slate-300"
                    />
                    <span className="text-[11px] text-blue-900 leading-tight">
                      Statutory Confirmation: I certify this deductible was paid in full by the insured from their own funds, without contractor rebate or discount, pursuant to Tex. Ins. Code &sect; 707.006.
                    </span>
                  </label>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs transition-colors"
                >
                  Confirm &amp; Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
