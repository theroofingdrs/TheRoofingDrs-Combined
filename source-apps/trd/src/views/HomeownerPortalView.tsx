import React, { useState, useEffect } from 'react';
import { BrandLogo } from '../components/common/BrandLogo.tsx';
import { EmptyState } from '../components/common/EmptyState.tsx';
import { api } from '../lib/api.ts';
import type { Property, RoofRecord, Project, Appointment, Proposal } from '../../shared/types/index.ts';
import { CustomerProposalPortalView } from '../components/portal/CustomerProposalPortalView.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Home,
  ShieldCheck,
  Calendar,
  Wrench,
  Clock,
  PhoneCall,
  CheckCircle2,
  FileText,
  AlertTriangle,
  CreditCard,
  MessageSquare,
  User,
  Shield,
  FolderOpen,
  DollarSign,
  Receipt,
  ArrowRight,
  LogOut,
} from 'lucide-react';

interface HomeownerPortalViewProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export const HomeownerPortalView: React.FC<HomeownerPortalViewProps> = ({
  currentPath = '/portal/my-roof',
  onNavigate = (_path: string) => {},
}) => {
  const { signOut } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [roofRecords, setRoofRecords] = useState<RoofRecord[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [activeProperty, setActiveProperty] = useState<Property | null>(null);

  // Portal Invoices & Payments State
  const [portalInvoices, setPortalInvoices] = useState<any[]>([]);
  const [portalPayments, setPortalPayments] = useState<any[]>([]);
  const [portalProjects, setPortalProjects] = useState<any[]>([]);
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);

  const loadPortalData = () => {
    Promise.all([
      api.getProperties(),
      api.getRoofRecords(),
      api.getProjects(),
      api.getAppointments(),
      api.getProposals().catch(() => []),
      api.getPortalInvoices().catch(() => ({ invoices: [], payments: [] })),
      api.getPortalProjects().catch(() => []),
    ]).then(([props, records, projs, appts, propsList, billData, pProjs]) => {
      setProperties(props);
      setRoofRecords(records);
      setProjects(projs);
      setAppointments(appts);
      setProposals(propsList || []);
      setPortalInvoices(billData.invoices || []);
      setPortalPayments(billData.payments || []);
      setPortalProjects(pProjs || []);
      if (props.length > 0) {
        setActiveProperty(props[0]);
      }
    }).catch(console.error);
  };

  useEffect(() => {
    loadPortalData();
  }, []);

  const navItems = [
    { label: 'My Roof Record', path: '/portal/my-roof', icon: Home },
    { label: 'Proposals & Scopes', path: '/portal/proposals', icon: FileText },
    { label: 'Appointments', path: '/portal/appointments', icon: Calendar },
    { label: 'Projects', path: '/portal/projects', icon: Wrench },
    { label: 'Documents', path: '/portal/documents', icon: FileText },
    { label: 'Payments', path: '/portal/payments', icon: CreditCard },
    { label: 'Maintenance Shield', path: '/portal/maintenance', icon: ShieldCheck },
    { label: 'Messages', path: '/portal/messages', icon: MessageSquare },
    { label: 'Profile', path: '/portal/profile', icon: User },
  ];

  const activeTab = currentPath.replace('/portal/', '') || 'my-roof';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-7 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={() => onNavigate('/')} className="cursor-pointer text-left">
            <BrandLogo size="md" />
          </button>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-900">Robert Sterling</div>
              <div className="text-[11px] text-slate-500">Verified Homeowner Account</div>
            </div>
            <a
              href="tel:9032315940"
              className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-red-100 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>903-231-5940</span>
            </a>
            <button
              onClick={() => {
                signOut();
                onNavigate('/');
              }}
              title="Sign out of portal"
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sub-navigation Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 overflow-x-auto">
        <div className="max-w-6xl mx-auto flex items-center gap-1 whitespace-nowrap">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path || (item.path === '/portal/my-roof' && currentPath === '/portal');
            return (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`py-3 px-3.5 text-xs font-bold flex items-center gap-2 border-b-2 cursor-pointer transition-colors ${
                  isActive
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-6 space-y-6">
        {/* SPECIFIC PROPOSAL VIEW ROUTE: /portal/proposals/:id */}
        {currentPath.startsWith('/portal/proposals/') && currentPath.replace('/portal/proposals/', '').trim() !== '' && (
          <CustomerProposalPortalView
            proposalId={currentPath.replace('/portal/proposals/', '').split('?')[0].trim()}
            onNavigate={onNavigate}
          />
        )}

        {/* TAB: PROPOSALS & SCOPES LIST */}
        {(activeTab === 'proposals' || currentPath === '/portal/proposals') && !currentPath.startsWith('/portal/proposals/') && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Proposals, Scopes of Work &amp; Agreements</h2>
              <p className="text-xs text-slate-500">
                Official diagnostic scopes, material specifications, and digital authorization contracts.
              </p>
            </div>

            {proposals.length > 0 ? (
              <div className="space-y-4">
                {proposals.map((prop) => (
                  <div
                    key={prop.id}
                    className="p-5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                          {prop.proposalNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            prop.status === 'ACCEPTED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : prop.status === 'SENT' || prop.status === 'VIEWED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {prop.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900">{prop.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{prop.projectSummary || prop.introduction}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-sans">Investment</span>
                        <span className="font-mono font-black text-sm text-slate-900">
                          ${(prop.options?.[0]?.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <button
                        onClick={() => onNavigate(`/portal/proposals/${prop.id}`)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs transition-colors whitespace-nowrap"
                      >
                        {prop.status === 'ACCEPTED' ? 'View Authorized Agreement' : 'Review & Sign'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No Pending Proposals"
                description="Once a diagnostic inspection and roof measurement are completed, your precision Good / Better / Best options will appear here for review."
              />
            )}
          </div>
        )}

        {/* TAB 1: MY ROOF RECORD */}
        {(activeTab === 'my-roof' || activeTab === '') && !currentPath.startsWith('/portal/proposals') && (
          <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-slate-800">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-red-500 uppercase tracking-wider">
                  Permanent Roof Health Record
                </span>
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                  {activeProperty?.address || '1420 Richmond Rd'}
                </h1>
                <p className="text-xs text-slate-400">
                  {activeProperty ? `${activeProperty.city}, TX ${activeProperty.zip}` : 'Texarkana, TX 75503'}
                </p>
              </div>

              <div className="flex flex-col sm:items-end gap-1.5">
                <span className="text-xs text-slate-400">Verified Condition Status</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  SOUND &bull; FIELD VERIFIED
                </span>
              </div>
            </div>

            {/* Roof Specs & Shield Plan */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-[11px] uppercase font-bold text-slate-500">Roofing System</span>
                <h3 className="text-base font-bold text-slate-900">Architectural Shingles</h3>
                <p className="text-xs text-slate-500">High-wind 130 MPH rated laminated shingle with synthetic underlayment.</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-[11px] uppercase font-bold text-slate-500">Active Warranty</span>
                <h3 className="text-base font-bold text-slate-900">Doctor Guarantee</h3>
                <p className="text-xs text-slate-500">10-Year Craftsmanship &amp; Limited Lifetime Material Warranty.</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-[11px] uppercase font-bold text-slate-500">Protection Shield</span>
                <h3 className="text-base font-bold text-emerald-700">Annual Plan Active</h3>
                <p className="text-xs text-slate-500">Next scheduled preventative inspection due within 6 months.</p>
              </div>
            </div>

            {/* Lifetime Roof Timeline */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-600" />
                <span>Permanent Property Timeline</span>
              </h3>

              <div className="space-y-4 border-l-2 border-slate-100 pl-4 ml-2 text-xs">
                <div className="relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-600 absolute -left-[21px] top-1" />
                  <div className="text-[11px] font-bold text-slate-400">Active Record</div>
                  <h4 className="font-bold text-slate-900 mt-0.5">Permanent Roof Record Registered</h4>
                  <p className="text-slate-500 mt-0.5">
                    Property asset registered in The Roof Doctors Northeast Texas dispatch database.
                  </p>
                </div>

                <div className="relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 absolute -left-[21px] top-1" />
                  <div className="text-[11px] font-bold text-slate-400">Diagnostic Inspection</div>
                  <h4 className="font-bold text-slate-900 mt-0.5">21-Point Diagnostic Inspection Scheduled</h4>
                  <p className="text-slate-500 mt-0.5">
                    Senior field inspector Marcus Bell assigned for comprehensive deck walk and attic check.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: APPOINTMENTS */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900">Scheduled Diagnostic Visits &amp; Inspections</h2>
            {appointments.length > 0 ? (
              <div className="space-y-3">
                {appointments.map((appt) => (
                  <div key={appt.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-red-600 uppercase">{appt.type}</span>
                      <h4 className="font-bold text-sm text-slate-900">{new Date(appt.scheduledAt).toLocaleDateString()} at {new Date(appt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h4>
                      <p className="text-xs text-slate-500">Assigned Inspector: Marcus Bell &bull; Status: {appt.status}</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
                      Confirmed
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No Pending Appointments"
                description="You currently have no scheduled inspections or maintenance walks. Call dispatch at 903-231-5940 to book your next diagnostic inspection."
              />
            )}
          </div>
        )}

        {/* TAB 3: PROJECTS */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Active &amp; Completed Projects</h2>
                  <p className="text-xs text-slate-500">
                    Track your roof replacement progress from material delivery to 5-point quality certification.
                  </p>
                </div>
              </div>

              {(portalProjects.length > 0 ? portalProjects : projects).length > 0 ? (
                <div className="space-y-4">
                  {(portalProjects.length > 0 ? portalProjects : projects).map((proj) => {
                    const steps = [
                      { key: 'SOLD', label: 'Contract Signed' },
                      { key: 'SCHEDULED', label: 'Dispatched & Materials' },
                      { key: 'IN_PROGRESS', label: 'Tear-Off & Build' },
                      { key: 'QC', label: '5-Point QC' },
                      { key: 'COMPLETED', label: 'Closeout & Warranty' },
                    ];

                    const currentIdx = steps.findIndex((s) => s.key === proj.status);
                    const activeStepIdx = currentIdx >= 0 ? currentIdx : (proj.status === 'COMPLETED' ? 4 : 2);

                    const qcItems = proj.qualityChecklist
                      ? Object.entries(proj.qualityChecklist).filter(([k]) => k !== 'verifiedAt')
                      : [];

                    return (
                      <div key={proj.id} className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-base text-slate-900">{proj.title}</h3>
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[11px] font-bold rounded">
                                {proj.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Work Order: <strong className="font-mono text-slate-700">{proj.workOrderNumber || 'WO-PENDING'}</strong> &bull; Type: {proj.projectType}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {proj.texasHb2102Verified ? (
                              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                <span>HB 2102 Deductible Verified</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-amber-600" />
                                <span>Deductible Awaiting Verification</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Milestone Stepper */}
                        <div className="py-2">
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                            {steps.map((st, idx) => {
                              const isCompleted = idx < activeStepIdx;
                              const isCurrent = idx === activeStepIdx;

                              return (
                                <div
                                  key={st.key}
                                  className={`p-2.5 rounded-lg border text-center text-xs transition-all ${
                                    isCompleted
                                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                      : isCurrent
                                      ? 'bg-red-50 border-red-300 text-red-900 font-bold shadow-xs'
                                      : 'bg-white border-slate-200 text-slate-400'
                                  }`}
                                >
                                  <div className="flex items-center justify-center mb-1">
                                    {isCompleted ? (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    ) : isCurrent ? (
                                      <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                                    ) : (
                                      <span className="w-2 h-2 rounded-full bg-slate-300" />
                                    )}
                                  </div>
                                  <span className="block text-[11px] leading-tight">{st.label}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Assigned Crew & Schedule */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-lg border border-slate-200 text-xs">
                          <div>
                            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Production Lead / Foreman</span>
                            <span className="font-bold text-slate-900">{proj.foremanName || 'Certified Production Foreman'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Assigned Crew</span>
                            <span className="font-semibold text-slate-800">{proj.crewName || 'Red Dirt Certified Crew'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Scheduled Date</span>
                            <span className="font-semibold text-slate-800">{proj.targetStartDate || 'Scheduled with Dispatch'}</span>
                          </div>
                        </div>

                        {/* 5-Point Quality Assurance Status */}
                        {qcItems.length > 0 && (
                          <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2">
                            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                              <span>5-Point Manufacturer Quality Assurance Verification</span>
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              {qcItems.map(([key, val]) => (
                                <div key={key} className="flex items-center gap-2 text-slate-700">
                                  {val ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  ) : (
                                    <Clock className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                                  )}
                                  <span className="capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  title="No Active Construction Projects"
                  description="Once an estimate is approved, your real-time project milestone timeline and material delivery schedule will display here."
                />
              )}
            </div>
          </div>
        )}

        {/* TAB 4: DOCUMENTS */}
        {activeTab === 'documents' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900">Warranties &amp; Diagnostic Reports</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <FileText className="w-4 h-4 text-red-600" />
                  <span>21-Point Inspection Report (PDF)</span>
                </div>
                <p className="text-xs text-slate-500">Comprehensive photo checklist and attic moisture evaluation.</p>
                <button className="text-xs font-bold text-red-600 hover:underline cursor-pointer">
                  Download Certificate &rarr;
                </button>
              </div>

              <div className="p-4 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Manufacturer Warranty Registration</span>
                </div>
                <p className="text-xs text-slate-500">Limited lifetime shingle certificate on file.</p>
                <button className="text-xs font-bold text-red-600 hover:underline cursor-pointer">
                  View Warranty Terms &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PAYMENTS */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            {paymentSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{paymentSuccessMsg}</span>
              </div>
            )}

            {/* Invoices List */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Invoices &amp; Milestone Billing</h2>
                <p className="text-xs text-slate-500">
                  Manage insurance deductible payments, ACV milestone payments, and completion invoices.
                </p>
              </div>

              {portalInvoices.length > 0 ? (
                <div className="space-y-3">
                  {portalInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-slate-900">{inv.invoiceNumber}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            inv.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {inv.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 mt-1">{inv.title}</h4>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Milestone: {inv.milestoneType} &bull; Due: {inv.dueDate}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 justify-between sm:justify-end">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Balance</span>
                          <span className={`text-base font-black ${inv.balance > 0 ? 'text-slate-900' : 'text-emerald-700'}`}>
                            ${(inv.balance || 0).toLocaleString()}
                          </span>
                          <span className="text-[11px] text-slate-500 block">Total: ${(inv.amountDue || 0).toLocaleString()}</span>
                        </div>

                        {inv.balance > 0 && (
                          <button
                            disabled={payingInvoiceId === inv.id}
                            onClick={async () => {
                              try {
                                setPayingInvoiceId(inv.id);
                                await api.payPortalInvoice(inv.id, {
                                  paymentMethod: 'CREDIT_CARD',
                                  amount: inv.balance,
                                });
                                setPaymentSuccessMsg(`Payment of $${inv.balance.toLocaleString()} recorded successfully for ${inv.invoiceNumber}!`);
                                loadPortalData();
                              } catch (err: any) {
                                alert(err.message || 'Payment failed');
                              } finally {
                                setPayingInvoiceId(null);
                              }
                            }}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>{payingInvoiceId === inv.id ? 'Processing...' : 'Pay Online'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1 text-xs text-slate-500">
                  <DollarSign className="w-6 h-6 text-slate-400 mx-auto" />
                  <div className="font-bold text-slate-700">No Invoices Currently Due</div>
                  <div>Your initial diagnostic walk was completed with $0 balance. Project milestone invoices will display here once scheduled.</div>
                </div>
              )}
            </div>

            {/* Payment Receipts Ledger */}
            {portalPayments.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900">Verified Payment Receipts</h3>
                <div className="space-y-2">
                  {portalPayments.map((p) => (
                    <div key={p.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">{p.receiptNumber}</span>
                          {p.isDeductiblePayment && (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Texas HB 2102 Deductible Verified</span>
                            </span>
                          )}
                        </div>
                        <span className="text-slate-500 text-[11px] block mt-0.5">
                          Method: {p.paymentMethod} &bull; {p.processedAt ? p.processedAt.split('T')[0] : 'Confirmed'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-700 text-sm block">+${(p.amount || 0).toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400">Processed</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Texas HB 2102 Statutory Consumer Protection Advisory */}
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-950 space-y-1">
                <strong className="block font-bold">Texas Insurance Code Chapter 707 (HB 2102) Consumer Notice</strong>
                <p className="text-blue-900 leading-relaxed">
                  Texas law requires property owners to pay any deductible specified in their property insurance policy out-of-pocket. Contractors are prohibited from paying, waiving, rebating, or absorbing any portion of an insurance deductible. Red Dirt Roofing provides official statutory payment receipts so your insurance carrier can immediately release depreciation proceeds without compliance delays.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: MAINTENANCE */}
        {activeTab === 'maintenance' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900">Roof Doctor Maintenance Shield</h2>
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs text-emerald-950">
              <div className="font-bold text-sm text-emerald-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Active Protection Tier: Residential Standard</span>
              </div>
              <p className="text-emerald-800 leading-relaxed">
                Includes annual 21-point physical deck inspection, gutter debris clearing, pipe boot sealant renewal, and priority emergency dispatch after severe hail/wind storms.
              </p>
            </div>
          </div>
        )}

        {/* TAB 7: MESSAGES */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900">Direct Dispatch Messages</h2>
            <EmptyState
              title="No Unread Messages"
              description="Your direct line to office dispatch and your assigned field inspector. Active communications will be logged here."
            />
          </div>
        )}

        {/* TAB 8: PROFILE */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs text-xs">
            <h2 className="text-lg font-bold text-slate-900">Homeowner Profile &amp; Preferences</h2>
            <div className="space-y-3 max-w-lg">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  readOnly
                  value="Robert & Clara Sterling"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Primary Phone</label>
                <input
                  type="text"
                  readOnly
                  value="(903) 555-0198"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Primary Email</label>
                <input
                  type="text"
                  readOnly
                  value="homeowner@example.com"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Communication Channels</label>
                <div className="space-y-1 text-slate-600">
                  <div>&bull; SMS Inspection Updates: <strong>Active</strong></div>
                  <div>&bull; Severe Storm Alerts: <strong>Active</strong></div>
                  <div>&bull; Annual Maintenance Reminders: <strong>Active</strong></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
