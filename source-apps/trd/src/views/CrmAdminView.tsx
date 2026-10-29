import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../lib/api.ts';
import { BrandLogo } from '../components/common/BrandLogo.tsx';
import { StatusBadge } from '../components/common/StatusBadge.tsx';
import { EmptyState } from '../components/common/EmptyState.tsx';
import type {
  User,
  Lead,
  Customer,
  Property,
  Project,
  Inspection,
  Measurement,
  Appointment,
  Communication,
  SystemHealth,
  Integration,
  AuditLog,
  FeatureFlag,
  Estimate,
  Proposal,
} from '../../shared/types/index.ts';
import {
  LayoutDashboard,
  Users,
  Home,
  Briefcase,
  SearchCheck,
  Ruler,
  Calendar,
  MessageSquare,
  Network,
  ShieldAlert,
  Activity,
  Sliders,
  Plus,
  ArrowUpRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  CreditCard,
  FileText,
  Send,
  CheckSquare,
  Truck,
  Package,
  Store,
  Star,
  BarChart3,
  Cpu,
  FileEdit,
  Settings,
  ShieldCheck,
  Filter,
  Trash2,
  Eye,
  EyeOff,
  PanelLeftClose,
  PanelLeft,
  Menu,
  HardHat,
  LogOut,
  UserCheck,
  RotateCcw,
  Building2,
  X,
} from 'lucide-react';
import type { Crew } from '../../shared/types/index.ts';
import { LeadDetailModal } from '../components/crm/LeadDetailModal.tsx';
import { Customer360Modal } from '../components/crm/Customer360Modal.tsx';
import { PropertyIntelligenceModal } from '../components/crm/PropertyIntelligenceModal.tsx';
import { LeadConversionModal } from '../components/crm/LeadConversionModal.tsx';
import { RegisterCrewModal } from '../components/crm/RegisterCrewModal.tsx';
import { SubmitDiagnosticReportModal } from '../components/crm/SubmitDiagnosticReportModal.tsx';
import { InspectionDetailModal } from '../components/field/InspectionDetailModal.tsx';
import { EstimateWorkspace } from '../components/crm/EstimateWorkspace.tsx';
import { ProposalWorkspace } from '../components/crm/ProposalWorkspace.tsx';
import { ProjectProductionModal } from '../components/production/ProjectProductionModal.tsx';
import { BillingPaymentsTab } from '../components/production/BillingPaymentsTab.tsx';
import { MaterialsVendorsTab } from '../components/production/MaterialsVendorsTab.tsx';
import { LeadStageTracker } from '../components/crm/LeadStageTracker.tsx';

interface CrmAdminViewProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export const CrmAdminView: React.FC<CrmAdminViewProps> = ({
  currentPath = '/app/dashboard',
  onNavigate,
}) => {
  const { currentUser, hasPermission, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarMinimized, setIsSidebarMinimized] = useState<boolean>(false);

  useEffect(() => {
    if (!currentPath) return;
    const path = currentPath.replace(/^\/app\/?/, '');
    const tabSlug = path.split('/')[0];
    if (tabSlug === 'audit-log') setActiveTab('audit');
    else if (tabSlug === 'system-health') setActiveTab('health');
    else if (tabSlug === 'roofs') setActiveTab('properties');
    else if (tabSlug) setActiveTab(tabSlug);
  }, [currentPath]);

  const handleTabSelect = (tab: string) => {
    setActiveTab(tab);
    setSearchResults(null);
    const target = tab === 'audit' ? 'audit-log' : tab === 'health' ? 'system-health' : tab;
    onNavigate?.(`/app/${target}`);
    // Minimize the navigation options once clicked to provide maximized dashboard workspace
    setIsSidebarMinimized(true);
  };

  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [preSelectedEstimateIdForProposal, setPreSelectedEstimateIdForProposal] = useState<string | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Lead Management Filters & Detail Selection
  const [selectedLeadIdForDetail, setSelectedLeadIdForDetail] = useState<string | null>(null);
  const [leadSearch, setLeadSearch] = useState<string>('');
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>('ALL');
  const [leadDivisionFilter, setLeadDivisionFilter] = useState<string>('ALL');
  const [leadSourceFilter, setLeadSourceFilter] = useState<string>('ALL');
  const [leadAssignedFilter, setLeadAssignedFilter] = useState<string>('ALL');

  // Modal Dialog States
  const [selectedLeadForConversion, setSelectedLeadForConversion] = useState<Lead | null>(null);
  const [selectedCustomerIdFor360, setSelectedCustomerIdFor360] = useState<string | null>(null);
  const [selectedPropertyIdForDetail, setSelectedPropertyIdForDetail] = useState<string | null>(null);
  const [showRegisterCrewModal, setShowRegisterCrewModal] = useState<boolean>(false);
  const [showDiagnosticModal, setShowDiagnosticModal] = useState<boolean>(false);
  const [selectedInspectionForDetail, setSelectedInspectionForDetail] = useState<Inspection | null>(null);
  const [selectedProjectForProduction, setSelectedProjectForProduction] = useState<Project | null>(null);

  // Demo Data Controls
  const [showDemoData, setShowDemoData] = useState<boolean>(true);
  const [confirmingClearDemo, setConfirmingClearDemo] = useState<boolean>(false);
  const [clearingDemo, setClearingDemo] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [l, u, c, p, pr, ins, m, appt, crws, intg, logs, h, flags, ests, propsList] = await Promise.all([
        api.getLeads(),
        api.getUsers().catch(() => []),
        api.getCustomers(),
        api.getProperties(),
        api.getProjects(),
        api.getInspections(),
        api.getMeasurements(),
        api.getAppointments(),
        api.getCrews().catch(() => []),
        api.getIntegrations(),
        api.getAuditLogs(),
        api.getHealth(),
        api.getFeatureFlags(),
        api.getEstimates().catch(() => []),
        api.getProposals().catch(() => []),
      ]);

      setLeads(l);
      setUsers(u || []);
      setCustomers(c);
      setProperties(p);
      setProjects(pr);
      setInspections(ins);
      setMeasurements(m);
      setAppointments(appt);
      setCrews(crws || []);
      setIntegrations(intg);
      setAuditLogs(logs);
      setHealth(h);
      setFeatureFlags(flags);
      setEstimates(ests || []);
      setProposals(propsList || []);
    } catch (err) {
      console.error('Error loading CRM data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConvertLead = (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      setSelectedLeadForConversion(lead);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClearDemo = async () => {
    setClearingDemo(true);
    try {
      const res = await api.clearDemoData();
      setActionMessage(res.message);
      setConfirmingClearDemo(false);
      await loadData();
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setClearingDemo(false);
    }
  };

  const handleOrderMeasurement = async (propertyId: string) => {
    try {
      await api.requestMeasurement(propertyId, 'ROOFR', 'Standard 21-point aerial order');
      setActionMessage('Measurement order dispatched to provider.');
      await loadData();
    } catch (err: any) {
      setActionMessage(`ROOFR Notice: ${err.message}`);
      await loadData();
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const res = await api.search(searchQuery);
      setSearchResults(res);
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered lists based on Demo Data Visibility
  const displayLeads = showDemoData ? leads : leads.filter((l) => !l.isDemo);
  const displayCustomers = showDemoData ? customers : customers.filter((c) => !c.isDemo);
  const displayProperties = showDemoData ? properties : properties.filter((p) => !p.isDemo);
  const displayProjects = showDemoData ? projects : projects.filter((pr) => !pr.isDemo);

  // Quick Stats
  const newLeadsCount = displayLeads.filter((l) => l.status === 'NEW').length;
  const emergencyCount = displayLeads.filter((l) => l.emergencyFlag).length;
  const activeProjectsCount = displayProjects.filter((p) => p.status !== 'COMPLETED' && p.status !== 'CANCELLED').length;

  // Real KPI metrics calculated from actual leads data
  const kpiTotalLeads = leads.length;
  const kpiNewLeads = leads.filter((l) => l.status === 'NEW').length;
  const kpiContacted = leads.filter((l) => l.status === 'CONTACTED').length;
  const kpiInspectionScheduled = leads.filter((l) => l.status === 'INSPECTION_SCHEDULED').length;
  const kpiInspectionCompleted = leads.filter((l) => l.status === 'INSPECTION_COMPLETED').length;
  const kpiEstimateSent = leads.filter((l) => l.status === 'ESTIMATE_SENT').length;
  const kpiWon = leads.filter((l) => l.status === 'WON' || l.status === 'JOB_SOLD').length;
  const kpiLost = leads.filter((l) => l.status === 'LOST').length;

  // Dynamic unique lead sources
  const dynamicSources = Array.from(new Set(leads.map((l) => l.source).filter(Boolean)));

  // Filtered Leads operating against actual database records
  const filteredLeads = leads.filter((lead) => {
    // Search by Name, Phone, Email, Street Address / City / Zip
    if (leadSearch.trim()) {
      const q = leadSearch.toLowerCase().trim();
      const cleanQ = q.replace(/\D/g, '');
      const cleanPhone = lead.phone ? lead.phone.replace(/\D/g, '') : '';
      const matchesName = lead.name?.toLowerCase().includes(q);
      const matchesPhone = (cleanQ.length >= 3 && cleanPhone.includes(cleanQ)) || lead.phone?.toLowerCase().includes(q);
      const matchesEmail = lead.email?.toLowerCase().includes(q);
      const matchesAddress =
        lead.address?.toLowerCase().includes(q) ||
        lead.city?.toLowerCase().includes(q) ||
        lead.state?.toLowerCase().includes(q) ||
        lead.zip?.toLowerCase().includes(q);
      if (!matchesName && !matchesPhone && !matchesEmail && !matchesAddress) {
        return false;
      }
    }

    // Status filter
    if (leadStatusFilter !== 'ALL') {
      if (leadStatusFilter === 'WON') {
        if (lead.status !== 'WON' && lead.status !== 'JOB_SOLD') return false;
      } else if (lead.status !== leadStatusFilter) {
        return false;
      }
    }

    // Division filter
    if (leadDivisionFilter !== 'ALL') {
      const div =
        lead.division ||
        (lead.serviceRequested?.toLowerCase().includes('commercial') || lead.leadType === 'COMMERCIAL'
          ? 'COMMERCIAL'
          : 'RESIDENTIAL');
      if (div !== leadDivisionFilter) return false;
    }

    // Source filter
    if (leadSourceFilter !== 'ALL') {
      if (lead.source !== leadSourceFilter) return false;
    }

    // Assigned To filter
    if (leadAssignedFilter !== 'ALL') {
      if (leadAssignedFilter === 'UNASSIGNED') {
        if (lead.assignedUserId) return false;
      } else if (lead.assignedUserId !== leadAssignedFilter) {
        return false;
      }
    }

    return true;
  });

  // Chronological sort: newest first
  const recentLeads = [...leads].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleKpiClick = (statusKey: string) => {
    setActiveTab('leads');
    setLeadStatusFilter(statusKey);
  };

  const handleResetFilters = () => {
    setLeadSearch('');
    setLeadStatusFilter('ALL');
    setLeadDivisionFilter('ALL');
    setLeadSourceFilter('ALL');
    setLeadAssignedFilter('ALL');
  };

  const handleQuickStatusChange = async (leadId: string, newStatus: any) => {
    try {
      const updated = await api.updateLead(leadId, { status: newStatus });
      setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      setActionMessage(`Lead ${updated.name} status updated to ${newStatus}.`);
      setTimeout(() => setActionMessage(null), 3500);
    } catch (err: any) {
      setActionMessage(`Failed to update status: ${err.message}`);
    }
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Action Notification Banner */}
      {actionMessage && (
        <div className="bg-slate-900 text-white text-xs px-4 py-2.5 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* Main CRM Shell */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <aside
          className={`bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800 transition-all duration-200 ${
            isSidebarMinimized ? 'w-full md:w-16' : 'w-full md:w-64'
          }`}
        >
          <div>
            <div className="p-3 border-b border-slate-800 flex items-center justify-between gap-2">
              {!isSidebarMinimized ? (
                <>
                  <div>
                    <BrandLogo variant="light" size="sm" />
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Operations Hub</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[9px]">
                        v1.0 Production
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsSidebarMinimized(true)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Minimize navigation"
                  >
                    <PanelLeftClose className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="w-full flex flex-col items-center gap-2">
                  <button
                    onClick={() => setIsSidebarMinimized(false)}
                    className="p-2 rounded-lg hover:bg-slate-800 text-red-500 hover:text-white transition-colors cursor-pointer"
                    title="Expand navigation menu"
                  >
                    <PanelLeft className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Quick Unified Search Input (shown when expanded) */}
            {!isSidebarMinimized && (
              <form onSubmit={handleSearch} className="p-3 border-b border-slate-800">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search leads, addresses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              </form>
            )}

            <nav className={`p-2 space-y-1 text-xs ${isSidebarMinimized ? 'flex flex-col items-center' : ''}`}>
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'leads', label: 'Leads & Inquiries', icon: Briefcase, count: newLeadsCount, countHighlight: true },
                { id: 'customers', label: 'Customers', icon: Users, count: customers.length },
                { id: 'properties', label: 'Properties & Roofs', icon: Home, count: properties.length },
                { id: 'projects', label: 'Projects Pipeline', icon: Briefcase, count: projects.length },
                { id: 'inspections', label: 'Diagnostic Inspections', icon: SearchCheck, count: inspections.length },
                { id: 'measurements', label: 'ROOFR Measurements', icon: Ruler, count: measurements.length },
                { id: 'appointments', label: 'Appointments', icon: Calendar, count: appointments.length },
                { id: 'communications', label: 'Communications & SMS', icon: MessageSquare },
                { id: 'estimates', label: 'Estimates & Scopes', icon: FileText, count: estimates.length },
                { id: 'proposals', label: 'Proposals & Contracts', icon: Send, count: proposals.length },
                { id: 'payments', label: 'Payments & Billing', icon: CreditCard },
                { id: 'crews', label: 'Crews & Subcontractors', icon: Truck, count: crews.length },
                { id: 'materials', label: 'Materials & Vendors', icon: Package },
                { id: 'analytics', label: 'Analytics & ROI', icon: BarChart3 },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id || (item.id === 'properties' && activeTab === 'roofs');
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabSelect(item.id)}
                    title={item.label}
                    className={`w-full flex items-center ${
                      isSidebarMinimized ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
                    } rounded-lg font-medium transition-colors cursor-pointer ${
                      isActive ? 'bg-red-600 text-white font-bold shadow-xs' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 relative">
                      <Icon className="w-4 h-4 shrink-0" />
                      {!isSidebarMinimized && <span>{item.label}</span>}
                      {isSidebarMinimized && item.count !== undefined && item.count > 0 && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-400 ring-2 ring-slate-900" />
                      )}
                    </div>
                    {!isSidebarMinimized && item.count !== undefined && (
                      <span
                        className={`text-[10px] font-bold ${
                          item.countHighlight && item.count > 0
                            ? 'px-1.5 py-0.2 rounded-full bg-red-500 text-white'
                            : 'text-slate-500'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}

              {!isSidebarMinimized && (
                <div className="pt-3 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  System &amp; Quality Gates
                </div>
              )}

              {[
                { id: 'integrations', label: 'Integrations Hub', icon: Network },
                { id: 'settings', label: 'Business Rules & Config', icon: Settings },
                { id: 'audit', label: 'Append-Only Audit Log', icon: ShieldAlert, count: auditLogs.length },
                { id: 'health', label: 'System Health', icon: Activity, dot: true },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabSelect(item.id)}
                    title={item.label}
                    className={`w-full flex items-center ${
                      isSidebarMinimized ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
                    } rounded-lg font-medium transition-colors cursor-pointer ${
                      isActive ? 'bg-red-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      {!isSidebarMinimized && <span>{item.label}</span>}
                    </div>
                    {!isSidebarMinimized && item.count !== undefined && (
                      <span className="text-[10px] text-slate-500 font-mono">{item.count}</span>
                    )}
                    {!isSidebarMinimized && item.dot && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-3 border-t border-slate-800 text-xs bg-slate-950">
            {!isSidebarMinimized ? (
              <>
                <div className="flex items-center justify-between text-slate-400">
                  <span className="truncate">User: {currentUser?.name || 'Guest'}</span>
                  <button
                    onClick={loadData}
                    disabled={loading}
                    className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
                    title="Refresh All Records"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Role: {currentUser?.role || 'PUBLIC'}
                </div>
                <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => {
                      signOut();
                      if (onNavigate) onNavigate('/');
                    }}
                    className="text-[11px] text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Sign Out</span>
                  </button>
                  {onNavigate && (
                    <button
                      onClick={() => onNavigate('/')}
                      className="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Public Site &rarr;
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex justify-center">
                <button
                  onClick={loadData}
                  disabled={loading}
                  className="text-slate-400 hover:text-white p-1.5 rounded transition-colors cursor-pointer"
                  title="Refresh All Records"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Production vs Demo Mode Top Toolbar */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 mb-6 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                  showDemoData ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                }`}
              >
                {showDemoData ? 'Demo & Seed Records Active' : 'Production Real Data Only'}
              </span>
              <span className="text-xs text-slate-500">
                {showDemoData
                  ? 'Showing seeded demonstration records alongside real customer inquiries.'
                  : 'Filtered: Demonstration entities hidden.'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowDemoData(!showDemoData)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                {showDemoData ? <EyeOff className="w-3.5 h-3.5 text-slate-500" /> : <Eye className="w-3.5 h-3.5 text-slate-500" />}
                <span>{showDemoData ? 'Hide Demo Data' : 'Show Demo Data'}</span>
              </button>

              <button
                type="button"
                onClick={() => setConfirmingClearDemo(true)}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                <span>Purge Demo Records</span>
              </button>
            </div>
          </div>

          {/* Search Overlay Results if user searched */}
          {searchResults && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">
                  Search Results for &quot;{searchQuery}&quot;
                </h3>
                <button
                  onClick={() => setSearchResults(null)}
                  className="text-xs text-slate-500 hover:text-slate-900"
                >
                  Clear Results
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-xs">
                <div>
                  <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2">
                    Leads ({searchResults.leads.length})
                  </h4>
                  {searchResults.leads.map((l: any) => (
                    <div key={l.id} className="p-2 border rounded mb-1 bg-slate-50">
                      <div className="font-semibold">{l.name} - {l.city}</div>
                      <div className="text-slate-500">{l.phone} | Score: {l.score}</div>
                    </div>
                  ))}
                  {searchResults.leads.length === 0 && <p className="text-slate-400">No leads matched.</p>}
                </div>

                <div>
                  <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2">
                    Properties ({searchResults.properties.length})
                  </h4>
                  {searchResults.properties.map((p: any) => (
                    <div key={p.id} className="p-2 border rounded mb-1 bg-slate-50">
                      <div className="font-semibold">{p.address}, {p.city}</div>
                      <div className="text-slate-500">{p.zip}</div>
                    </div>
                  ))}
                  {searchResults.properties.length === 0 && <p className="text-slate-400">No properties matched.</p>}
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                    Diagnostic Command Center
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time centralized CRM performance for The ROOF Doctors (Residential) &amp; Commercial Roof Doctors.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadData()}
                    disabled={loading}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-600' : 'text-slate-500'}`} />
                    <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('leads')}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  >
                    <span>View Lead Pipeline &rarr;</span>
                  </button>
                </div>
              </div>

              {/* Real-time KPI Cards (Calculated from Actual Lead Data) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Lead Pipeline Health &amp; Conversion Funnel
                  </span>
                  <span className="text-[10px] text-slate-400">Click any card to filter leads</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                  {/* 1. Total Leads */}
                  <button
                    onClick={() => handleKpiClick('ALL')}
                    className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-slate-400 hover:shadow-sm transition-all text-left cursor-pointer group"
                  >
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight truncate">
                      Total Leads
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-1">{kpiTotalLeads}</div>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <span>All Inbound</span>
                      <ArrowUpRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>

                  {/* 2. New Leads */}
                  <button
                    onClick={() => handleKpiClick('NEW')}
                    className="bg-white p-3.5 rounded-xl border border-red-200 bg-gradient-to-br from-white to-red-50/40 hover:border-red-400 hover:shadow-sm transition-all text-left cursor-pointer group"
                  >
                    <div className="text-[10px] font-bold text-red-600 uppercase tracking-tight truncate flex items-center justify-between">
                      <span>New</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    </div>
                    <div className="text-2xl font-black text-red-600 mt-1">{kpiNewLeads}</div>
                    <div className="text-[10px] text-red-500/80 mt-1 flex items-center gap-1 font-medium">
                      <span>Uncontacted</span>
                      <ArrowUpRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>

                  {/* 3. Contacted */}
                  <button
                    onClick={() => handleKpiClick('CONTACTED')}
                    className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all text-left cursor-pointer group"
                  >
                    <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-tight truncate">
                      Contacted
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-1">{kpiContacted}</div>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <span>In Touch</span>
                      <ArrowUpRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>

                  {/* 4. Inspection Scheduled */}
                  <button
                    onClick={() => handleKpiClick('INSPECTION_SCHEDULED')}
                    className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all text-left cursor-pointer group"
                  >
                    <div className="text-[10px] font-bold text-blue-600 uppercase tracking-tight truncate">
                      Scheduled
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-1">{kpiInspectionScheduled}</div>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <span>Inspections</span>
                      <ArrowUpRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>

                  {/* 5. Inspection Complete */}
                  <button
                    onClick={() => handleKpiClick('INSPECTION_COMPLETED')}
                    className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-sm transition-all text-left cursor-pointer group"
                  >
                    <div className="text-[10px] font-bold text-teal-600 uppercase tracking-tight truncate">
                      Inspected
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-1">{kpiInspectionCompleted}</div>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <span>Reports Ready</span>
                      <ArrowUpRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>

                  {/* 6. Estimate Sent */}
                  <button
                    onClick={() => handleKpiClick('ESTIMATE_SENT')}
                    className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-purple-300 hover:shadow-sm transition-all text-left cursor-pointer group"
                  >
                    <div className="text-[10px] font-bold text-purple-600 uppercase tracking-tight truncate">
                      Estimate Sent
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-1">{kpiEstimateSent}</div>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <span>Awaiting Sig</span>
                      <ArrowUpRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>

                  {/* 7. Won */}
                  <button
                    onClick={() => handleKpiClick('WON')}
                    className="bg-white p-3.5 rounded-xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50/40 hover:border-emerald-400 hover:shadow-sm transition-all text-left cursor-pointer group"
                  >
                    <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight truncate">
                      Won
                    </div>
                    <div className="text-2xl font-black text-emerald-600 mt-1">{kpiWon}</div>
                    <div className="text-[10px] text-emerald-600/80 mt-1 flex items-center gap-1 font-medium">
                      <span>Closed &amp; Sold</span>
                      <ArrowUpRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>

                  {/* 8. Lost */}
                  <button
                    onClick={() => handleKpiClick('LOST')}
                    className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-slate-400 hover:shadow-sm transition-all text-left cursor-pointer group"
                  >
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight truncate">
                      Lost
                    </div>
                    <div className="text-2xl font-black text-slate-700 mt-1">{kpiLost}</div>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <span>Archived</span>
                      <ArrowUpRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                </div>
              </div>

              {/* Secondary Operational Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Active Emergencies
                    </span>
                    <div className="text-xl font-black text-red-600 mt-0.5">{emergencyCount}</div>
                    <span className="text-[11px] text-slate-500">Active leaks requiring tarping</span>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Active Projects
                    </span>
                    <div className="text-xl font-black text-slate-900 mt-0.5">{activeProjectsCount}</div>
                    <span className="text-[11px] text-slate-500">In production or scheduling</span>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <Briefcase className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Verified Properties
                    </span>
                    <div className="text-xl font-black text-slate-900 mt-0.5">{properties.length}</div>
                    <span className="text-[11px] text-slate-500">With persistent Roof Records</span>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Home className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Visual Progress Tracker: Distribution of Leads by Stage (Recharts) */}
              <LeadStageTracker
                leads={leads}
                selectedStage={leadStatusFilter as any}
                onSelectStage={(stage) => handleKpiClick(stage)}
                onViewPipeline={() => setActiveTab('leads')}
              />

              {/* Recent Leads Priority Section */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>Recent Inbound Leads</span>
                      <span className="text-[11px] font-normal text-slate-500">
                        (Showing newest leads first across Residential &amp; Commercial divisions)
                      </span>
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('leads')}
                    className="text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer flex items-center gap-1"
                  >
                    <span>View All {leads.length} Leads</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {recentLeads.length === 0 ? (
                  <EmptyState
                    title="No Leads Logged Yet"
                    description="When homeowners or commercial property managers request a diagnostic evaluation on the website, leads will appear here immediately."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                        <tr>
                          <th className="px-4 py-3">Customer &amp; Contact</th>
                          <th className="px-4 py-3">Service Requested</th>
                          <th className="px-4 py-3">Division</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Date Received</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {recentLeads.slice(0, 8).map((lead) => {
                          const isCommercial =
                            lead.division === 'COMMERCIAL' ||
                            lead.serviceRequested?.toLowerCase().includes('commercial') ||
                            lead.leadType === 'COMMERCIAL';
                          return (
                            <tr
                              key={lead.id}
                              onClick={() => setSelectedLeadIdForDetail(lead.id)}
                              className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900">{lead.name}</span>
                                  {lead.status === 'NEW' && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-red-100 text-red-700 tracking-wider">
                                      NEW
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                                  <span>{lead.phone}</span>
                                  {lead.city && <span>&bull; {lead.city}, TX</span>}
                                </div>
                              </td>
                              <td className="px-4 py-3 font-medium text-slate-800">
                                <div>{lead.serviceRequested}</div>
                                {lead.emergencyFlag && (
                                  <span className="text-[9px] font-bold text-red-600">⚡ Emergency Intake</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    isCommercial
                                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                      : 'bg-blue-50 text-blue-800 border border-blue-200'
                                  }`}
                                >
                                  {isCommercial ? 'Commercial Roof Doctors' : 'The ROOF Doctors'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <StatusBadge status={lead.status} />
                              </td>
                              <td className="px-4 py-3 text-slate-500 text-[11px]">
                                {formatDateTime(lead.createdAt)}
                              </td>
                              <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => setSelectedLeadIdForDetail(lead.id)}
                                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-[11px] font-bold cursor-pointer transition-colors"
                                  >
                                    Open Record
                                  </button>
                                  {lead.status === 'NEW' && (
                                    <button
                                      onClick={() => handleConvertLead(lead.id)}
                                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-bold cursor-pointer transition-colors"
                                    >
                                      Convert
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: LEADS (MAIN LEAD MANAGEMENT TABLE) */}
          {activeTab === 'leads' && (
            <div className="space-y-5">
              {/* Header & Refresh */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                    Inbound Lead Pipeline &amp; Management
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Centralized CRM for The ROOF Doctors (Residential) &amp; Commercial Roof Doctors.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadData()}
                    disabled={loading}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-600' : 'text-slate-500'}`} />
                    <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
                  </button>
                  <button
                    onClick={() => setShowDiagnosticModal(true)}
                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Intake Diagnostics</span>
                  </button>
                </div>
              </div>

              {/* SEARCH & COMBINED FILTERS TOOLBAR */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
                  {/* Search Bar */}
                  <div className="lg:col-span-2 relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      id="lead-search-input"
                      type="text"
                      placeholder="Search name, phone, email, address..."
                      value={leadSearch}
                      onChange={(e) => setLeadSearch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-8 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
                    />
                    {leadSearch && (
                      <button
                        onClick={() => setLeadSearch('')}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Filter 1: Status */}
                  <div>
                    <select
                      id="filter-lead-status"
                      value={leadStatusFilter}
                      onChange={(e) => setLeadStatusFilter(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500 cursor-pointer"
                    >
                      <option value="ALL">All Statuses ({leads.length})</option>
                      <option value="NEW">New ({kpiNewLeads})</option>
                      <option value="CONTACTED">Contacted ({kpiContacted})</option>
                      <option value="INSPECTION_SCHEDULED">Inspection Scheduled ({kpiInspectionScheduled})</option>
                      <option value="INSPECTION_COMPLETED">Inspection Complete ({kpiInspectionCompleted})</option>
                      <option value="ESTIMATE_SENT">Estimate Sent ({kpiEstimateSent})</option>
                      <option value="WON">Won ({kpiWon})</option>
                      <option value="LOST">Lost ({kpiLost})</option>
                    </select>
                  </div>

                  {/* Filter 2: Division */}
                  <div>
                    <select
                      id="filter-lead-division"
                      value={leadDivisionFilter}
                      onChange={(e) => setLeadDivisionFilter(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500 cursor-pointer"
                    >
                      <option value="ALL">All Divisions</option>
                      <option value="RESIDENTIAL">The ROOF Doctors (Residential)</option>
                      <option value="COMMERCIAL">Commercial Roof Doctors (Commercial)</option>
                    </select>
                  </div>

                  {/* Filter 3: Lead Source */}
                  <div>
                    <select
                      id="filter-lead-source"
                      value={leadSourceFilter}
                      onChange={(e) => setLeadSourceFilter(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500 cursor-pointer"
                    >
                      <option value="ALL">All Sources</option>
                      {dynamicSources.map((src) => (
                        <option key={src} value={src}>
                          {src}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filter 4: Assigned Staff & Reset */}
                  <div className="flex items-center gap-1.5">
                    <select
                      id="filter-lead-assigned"
                      value={leadAssignedFilter}
                      onChange={(e) => setLeadAssignedFilter(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500 cursor-pointer"
                    >
                      <option value="ALL">All Staff</option>
                      <option value="UNASSIGNED">Unassigned</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleResetFilters}
                      title="Reset all filters"
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Filter Feedback Bar */}
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">
                      Showing {filteredLeads.length} of {leads.length} leads
                    </span>
                    {(leadSearch ||
                      leadStatusFilter !== 'ALL' ||
                      leadDivisionFilter !== 'ALL' ||
                      leadSourceFilter !== 'ALL' ||
                      leadAssignedFilter !== 'ALL') && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-bold border border-red-200">
                        Combined filters active
                      </span>
                    )}
                  </div>
                  {(leadSearch ||
                    leadStatusFilter !== 'ALL' ||
                    leadDivisionFilter !== 'ALL' ||
                    leadSourceFilter !== 'ALL' ||
                    leadAssignedFilter !== 'ALL') && (
                    <button
                      onClick={handleResetFilters}
                      className="text-red-600 hover:underline font-semibold text-[11px] cursor-pointer"
                    >
                      Reset all filters
                    </button>
                  )}
                </div>
              </div>

              {/* LEADS LIST / TABLE */}
              {filteredLeads.length === 0 ? (
                <EmptyState
                  title="No Leads Found Matching Filters"
                  description="Try clearing search keywords or switching filters to view other lead records in the database."
                />
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="px-3.5 py-3">Customer Name</th>
                          <th className="px-3.5 py-3">Phone</th>
                          <th className="px-3.5 py-3">Email</th>
                          <th className="px-3.5 py-3">Property Address</th>
                          <th className="px-3.5 py-3">Service Requested</th>
                          <th className="px-3.5 py-3">Division</th>
                          <th className="px-3.5 py-3">Lead Source</th>
                          <th className="px-3.5 py-3">Status</th>
                          <th className="px-3.5 py-3">Assigned To</th>
                          <th className="px-3.5 py-3">Date Received</th>
                          <th className="px-3.5 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredLeads.map((lead) => {
                          const isCommercial =
                            lead.division === 'COMMERCIAL' ||
                            lead.serviceRequested?.toLowerCase().includes('commercial') ||
                            lead.leadType === 'COMMERCIAL';
                          const assignedUser = users.find((u) => u.id === lead.assignedUserId);

                          return (
                            <tr
                              key={lead.id}
                              onClick={() => setSelectedLeadIdForDetail(lead.id)}
                              className="hover:bg-slate-50/90 cursor-pointer transition-colors"
                            >
                              {/* Customer Name */}
                              <td className="px-3.5 py-3 font-bold text-slate-900">
                                <div className="flex items-center gap-1.5">
                                  <span>{lead.name}</span>
                                  {lead.status === 'NEW' && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-red-100 text-red-700">
                                      NEW
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 font-normal">Score: {lead.score} / 100</div>
                              </td>

                              {/* Phone */}
                              <td className="px-3.5 py-3 text-slate-800" onClick={(e) => e.stopPropagation()}>
                                <a
                                  href={`tel:${lead.phone}`}
                                  className="font-semibold text-red-600 hover:underline"
                                >
                                  {lead.phone}
                                </a>
                              </td>

                              {/* Email */}
                              <td className="px-3.5 py-3 text-slate-600" onClick={(e) => e.stopPropagation()}>
                                {lead.email ? (
                                  <a href={`mailto:${lead.email}`} className="hover:underline text-slate-700">
                                    {lead.email}
                                  </a>
                                ) : (
                                  <span className="text-slate-400 italic">—</span>
                                )}
                              </td>

                              {/* Property Address */}
                              <td className="px-3.5 py-3 max-w-xs">
                                <div className="truncate font-medium text-slate-800">
                                  {lead.address || 'Address unlisted'}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {lead.city ? `${lead.city}, TX ${lead.zip || ''}` : 'Texarkana, TX'}
                                </div>
                              </td>

                              {/* Service Requested */}
                              <td className="px-3.5 py-3">
                                <div className="font-semibold text-slate-900">{lead.serviceRequested}</div>
                                {lead.emergencyFlag && (
                                  <span className="text-[9px] font-bold text-red-600 block">⚡ Emergency Tarp</span>
                                )}
                              </td>

                              {/* Division */}
                              <td className="px-3.5 py-3">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    isCommercial
                                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                      : 'bg-blue-50 text-blue-800 border border-blue-200'
                                  }`}
                                >
                                  {isCommercial ? 'Commercial' : 'Residential'}
                                </span>
                              </td>

                              {/* Lead Source */}
                              <td className="px-3.5 py-3 text-slate-600 text-[11px]">
                                {lead.source || 'Direct Inbound'}
                              </td>

                              {/* Status */}
                              <td className="px-3.5 py-3" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center gap-1.5">
                                  <StatusBadge status={lead.status} />
                                  <select
                                    value={lead.status}
                                    onChange={(e) => handleQuickStatusChange(lead.id, e.target.value)}
                                    className="text-[10px] bg-white border border-slate-200 rounded p-0.5 text-slate-600 focus:outline-hidden cursor-pointer"
                                    title="Quick change status"
                                  >
                                    <option value="NEW">New</option>
                                    <option value="CONTACTED">Contacted</option>
                                    <option value="INSPECTION_SCHEDULED">Inspection Scheduled</option>
                                    <option value="INSPECTION_COMPLETED">Inspection Complete</option>
                                    <option value="ESTIMATE_SENT">Estimate Sent</option>
                                    <option value="WON">Won</option>
                                    <option value="LOST">Lost</option>
                                  </select>
                                </div>
                              </td>

                              {/* Assigned To */}
                              <td className="px-3.5 py-3 text-slate-700">
                                {assignedUser ? (
                                  <span className="font-medium text-slate-900">{assignedUser.name}</span>
                                ) : (
                                  <span className="text-slate-400 italic">Unassigned</span>
                                )}
                              </td>

                              {/* Date/Time Received */}
                              <td className="px-3.5 py-3 text-slate-500 text-[11px] whitespace-nowrap">
                                {formatDateTime(lead.createdAt)}
                              </td>

                              {/* Actions */}
                              <td className="px-3.5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => setSelectedLeadIdForDetail(lead.id)}
                                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-[11px] font-bold cursor-pointer transition-colors"
                                  >
                                    Open
                                  </button>
                                  {lead.status === 'NEW' && (
                                    <button
                                      onClick={() => handleConvertLead(lead.id)}
                                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-bold cursor-pointer transition-colors"
                                    >
                                      Convert
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Responsive Cards (block md:hidden) */}
                  <div className="block md:hidden divide-y divide-slate-100">
                    {filteredLeads.map((lead) => {
                      const isCommercial =
                        lead.division === 'COMMERCIAL' ||
                        lead.serviceRequested?.toLowerCase().includes('commercial') ||
                        lead.leadType === 'COMMERCIAL';
                      const assignedUser = users.find((u) => u.id === lead.assignedUserId);

                      return (
                        <div
                          key={lead.id}
                          className="p-4 space-y-3 hover:bg-slate-50/80 transition-colors"
                        >
                          {/* Card Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 text-sm">{lead.name}</span>
                                {lead.status === 'NEW' && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-red-100 text-red-700">
                                    NEW
                                  </span>
                                )}
                              </div>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider mt-1 ${
                                  isCommercial
                                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                    : 'bg-blue-50 text-blue-800 border border-blue-200'
                                }`}
                              >
                                {isCommercial ? 'Commercial Roof Doctors' : 'The ROOF Doctors'}
                              </span>
                            </div>
                            <StatusBadge status={lead.status} />
                          </div>

                          {/* Contact & Address */}
                          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg">
                            <div>
                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Phone</span>
                              <a href={`tel:${lead.phone}`} className="font-bold text-red-600">
                                {lead.phone}
                              </a>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Email</span>
                              <span className="truncate text-slate-700 block">{lead.email || '—'}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Address</span>
                              <span className="text-slate-800">
                                {[lead.address, lead.city, 'TX', lead.zip].filter(Boolean).join(', ')}
                              </span>
                            </div>
                          </div>

                          {/* Details Row */}
                          <div className="flex items-center justify-between text-xs text-slate-600">
                            <div>
                              <span className="font-semibold text-slate-900">{lead.serviceRequested}</span>
                              <span className="text-[10px] text-slate-400 block">
                                Received: {formatDateTime(lead.createdAt)}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block">Assigned:</span>
                              <span className="font-semibold text-slate-800">
                                {assignedUser ? assignedUser.name : 'Unassigned'}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => setSelectedLeadIdForDetail(lead.id)}
                              className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold text-center cursor-pointer min-h-[44px] flex items-center justify-center"
                            >
                              Open Record
                            </button>
                            {lead.status === 'NEW' && (
                              <button
                                onClick={() => handleConvertLead(lead.id)}
                                className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold text-center cursor-pointer min-h-[44px] flex items-center justify-center"
                              >
                                Convert to Customer
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CUSTOMERS */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                  Customers &amp; Property Owners
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Single source of truth for residential clients, contact preferences, and associated roof records.
                </p>
              </div>

              {customers.length === 0 ? (
                <EmptyState
                  title="No Customers Registered"
                  description="Convert an inbound lead from the Leads tab or create a verified customer profile to populate this directory."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customers.map((cust) => (
                    <div key={cust.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-base text-slate-900">
                          {cust.firstName} {cust.lastName}
                        </h3>
                        <StatusBadge status={cust.status} />
                      </div>

                      <div className="space-y-1 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{cust.phone}</span>
                        </div>
                        {cust.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{cust.email}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Home className="w-3.5 h-3.5 text-slate-400" />
                          <span>Linked Properties: {cust.propertyIds?.length || 0}</span>
                        </div>
                      </div>

                      {cust.notes && (
                        <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                          {cust.notes}
                        </p>
                      )}

                      <button
                        onClick={() => setSelectedCustomerIdFor360(cust.id)}
                        className="w-full mt-3 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Users className="w-3.5 h-3.5 text-red-400" />
                        <span>Open Customer 360 &amp; Roofs</span>
                        <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PROPERTIES & ROOFS */}
          {activeTab === 'properties' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                  Properties &amp; Long-Lived Roof Records
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  The central asset of The Roof Doctors platform: permanent Roof Records tracking lifetime repairs, storms, and warranties.
                </p>
              </div>

              {properties.length === 0 ? (
                <EmptyState
                  title="No Properties Registered"
                  description="When a lead is converted, the property and its permanent roof record are linked automatically."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {properties.map((prop) => (
                    <div key={prop.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                            <h3 className="font-bold text-base text-slate-900">
                              {prop.address}
                            </h3>
                          </div>
                          <p className="text-xs text-slate-500 ml-6">
                            {prop.city}, {prop.state} {prop.zip}
                          </p>
                        </div>
                        <StatusBadge status={prop.verificationStatus} />
                      </div>

                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs space-y-1.5">
                        <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                          Permanent Roof Record
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Roof System:</span>
                          <span className="font-semibold text-slate-900">Architectural Shingles</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Record ID:</span>
                          <span className="font-mono text-[10px] text-slate-500">{prop.roofId || 'roof_unlinked'}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => setSelectedPropertyIdForDetail(prop.id)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Home className="w-3.5 h-3.5 text-red-400" />
                          <span>Roof Intelligence Record</span>
                        </button>
                        <button
                          onClick={() => handleOrderMeasurement(prop.id)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Ruler className="w-3.5 h-3.5" />
                          <span>Order ROOFR</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PROJECTS PIPELINE */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                    Residential Projects &amp; Production Pipeline
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    End-to-end execution: JOB SOLD &rarr; CREW SCHEDULING &rarr; WORK ORDERS &rarr; ROOFTOP POs &rarr; 5-POINT QC &rarr; CLOSEOUT.
                  </p>
                </div>
              </div>

              {projects.length === 0 ? (
                <EmptyState
                  title="No Active Projects"
                  description="Convert a qualified lead or accept a proposal to initiate the production pipeline."
                />
              ) : (
                <div className="space-y-3">
                  {projects.map((proj) => {
                    const assignedCrew = crews.find((c) => c.id === proj.assignedCrewId);
                    const allQcDone = proj.qualityChecklist && Object.values(proj.qualityChecklist).every(Boolean);

                    return (
                      <div
                        key={proj.id}
                        className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-sm text-slate-900">{proj.title}</h3>
                            <StatusBadge status={proj.status} />
                            {proj.texasHb2102Verified ? (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[11px] font-bold flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" />
                                <span>HB 2102 Verified</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[11px] font-semibold flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>Deductible Pending</span>
                              </span>
                            )}
                            {allQcDone && (
                              <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[11px] font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>5-Pt QC Passed</span>
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span>
                              WO: <strong className="font-mono text-slate-800">{proj.workOrderNumber || 'WO-PENDING'}</strong>
                            </span>
                            <span>&bull;</span>
                            <span>
                              Contract: <strong className="text-slate-900">${(proj.totalContractValue || 0).toLocaleString()}</strong>
                            </span>
                            <span>&bull;</span>
                            <span>
                              Crew: <strong className="text-slate-800">{assignedCrew ? assignedCrew.name : 'Unassigned'}</strong>
                            </span>
                            <span>&bull;</span>
                            <span>
                              Target Start: <strong className="text-slate-800">{proj.targetStartDate || 'TBD'}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {proj.insuranceClaimFlag && (
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-bold">
                              Insurance Claim
                            </span>
                          )}
                          <button
                            onClick={() => setSelectedProjectForProduction(proj)}
                            className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                          >
                            <HardHat className="w-3.5 h-3.5" />
                            <span>Manage Production &amp; WO</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: INSPECTIONS */}
          {activeTab === 'inspections' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                    Diagnostic Inspections &amp; Audits
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    21-point photographic roof inspections, attic audits, decking verification, and hail density analysis.
                  </p>
                </div>
                <button
                  onClick={() => setShowDiagnosticModal(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Submit Diagnostic Report</span>
                </button>
              </div>

              {inspections.length === 0 ? (
                <EmptyState
                  title="No Inspections Scheduled"
                  description="Inspections created by dispatch or field inspectors will be listed here with photo records and decking conditions."
                  action={
                    <button
                      onClick={() => setShowDiagnosticModal(true)}
                      className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs mx-auto"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Submit First Diagnostic Report</span>
                    </button>
                  }
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {inspections.map((insp) => {
                    const property = properties.find((p) => p.id === insp.propertyId);
                    return (
                      <div key={insp.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-800">{insp.id}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                              {insp.inspectionType || 'FULL_DIAGNOSTIC'}
                            </span>
                          </div>
                          <StatusBadge status={insp.status} />
                        </div>

                        {property && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
                            <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                            <span>{property.address}, {property.city}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 text-xs border-y border-slate-100 py-2 text-slate-600">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Scheduled / Logged:</span>
                            <strong className="text-slate-900">{insp.scheduledDate || insp.completedDate?.split('T')[0] || 'Scheduled'}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Inspector / Lead:</span>
                            <strong className="text-slate-900">{insp.inspectorUserId || 'Carlos Ruiz (Production)'}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Decking Walked:</span>
                            <span className="font-semibold text-slate-900">{insp.deckingCondition || 'SOLID'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Recommendation:</span>
                            <span className="font-bold text-red-600">{insp.recommendation || 'VERIFIED'}</span>
                          </div>
                        </div>

                        {insp.findingsSummary && (
                          <div className="bg-slate-50 p-2.5 rounded-lg text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                            {insp.findingsSummary}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => setSelectedInspectionForDetail(insp)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-red-400" />
                            <span>View Diagnostic Audit</span>
                          </button>

                          {insp.status === 'SUBMITTED' && (
                            <button
                              onClick={async () => {
                                try {
                                  const updated = await api.reviewInspection(insp.id, {
                                    reviewStatus: 'APPROVED',
                                    notes: 'QC Approved by Production Supt. Carlos Ruiz.',
                                  });
                                  setInspections((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
                                  setActionMessage(`Inspection #${insp.id} approved by Quality Control.`);
                                } catch (err: any) {
                                  setActionMessage(err.message || 'Failed to approve inspection.');
                                }
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve Audit (QC Sign-Off)</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: MEASUREMENTS (ROOFR) */}
          {activeTab === 'measurements' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                    Aerial Measurements Engine
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ROOFR satellite measurement integration for precise pitches, ridges, valleys, and total squares.
                  </p>
                </div>
              </div>

              {measurements.length === 0 ? (
                <EmptyState
                  title="No Measurement Orders"
                  description="Order a satellite aerial roof measurement on any verified property. The application does not fabricate fake measurement reports."
                />
              ) : (
                <div className="space-y-3">
                  {measurements.map((m) => (
                    <div key={m.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">Provider: {m.provider}</span>
                          <StatusBadge status={m.status} />
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Property: {m.propertyId} | Requested: {new Date(m.requestedAt).toLocaleString()}
                        </div>
                        {m.errorMessage && (
                          <div className="text-xs text-red-600 mt-1 bg-red-50 p-1.5 rounded border border-red-200">
                            {m.errorMessage}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                  Appointment Calendar
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inspection walkthroughs, adjuster meetings, and homeowner consultations.
                </p>
              </div>

              {appointments.length === 0 ? (
                <EmptyState
                  title="No Appointments Booked"
                  description="Appointments scheduled with homeowners will appear on the calendar dispatch view."
                />
              ) : (
                <div className="space-y-2">
                  {appointments.map((appt) => (
                    <div key={appt.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{appt.title}</h4>
                        <p className="text-xs text-slate-500">{new Date(appt.startTime).toLocaleString()} - {appt.address}</p>
                      </div>
                      <StatusBadge status={appt.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 9: INTEGRATIONS HUB */}
          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                  Integrations Hub &amp; Adapters
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Strict Zero-Fake Rule: Integrations are marked NOT_CONNECTED until real API credentials exist in server environment.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrations.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-base text-slate-900">{item.provider}</div>
                      <StatusBadge status={item.status} />
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      Category: <span className="font-semibold">{item.category}</span>
                    </p>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1 font-mono">
                      <div className="text-[10px] uppercase font-bold text-slate-500">Required Secrets:</div>
                      {item.configurationMetadata?.missingEnvVars?.length > 0 ? (
                        <div className="text-red-600">
                          Missing: {item.configurationMetadata.missingEnvVars.join(', ')}
                        </div>
                      ) : (
                        <div className="text-emerald-600">Credentials Active</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 10: AUDIT LOG */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                  Append-Only Security Audit Trail
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Protected tamper-resistant system log recording state transitions, role context, and caller metadata.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-3">Timestamp</th>
                        <th className="px-4 py-3">Actor / Role</th>
                        <th className="px-4 py-3">Action</th>
                        <th className="px-4 py-3">Target Entity</th>
                        <th className="px-4 py-3">State Transition</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      {auditLogs.slice(0, 25).map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/60">
                          <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="font-bold text-slate-900">{log.userId}</span> ({log.userRole})
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded font-semibold">
                              {log.action}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            {log.entityType} <span className="text-slate-400">({log.entityId})</span>
                          </td>
                          <td className="px-4 py-2.5 text-slate-600">
                            {JSON.stringify(log.newState || log.previousState || {})}
                          </td>
                        </tr>
                      ))}
                      {auditLogs.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-slate-400 font-sans">
                            No audit log events recorded yet. Actions like lead creation will log here.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: SYSTEM HEALTH */}
          {activeTab === 'health' && health && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                  System Health &amp; Infrastructure
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Status of Node API, file persistence layer, background workers, and feature flags.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500 uppercase">Database Engine</div>
                  <div className="text-xl font-bold text-emerald-600 mt-2 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{health.services.database.status}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Latency: {health.services.database.latencyMs}ms
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500 uppercase">API Server Uptime</div>
                  <div className="text-xl font-bold text-slate-900 mt-2">
                    {Math.floor(health.services.api.uptimeSeconds / 60)} minutes
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Status: {health.services.api.status}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500 uppercase">Background Job Queue</div>
                  <div className="text-xl font-bold text-slate-900 mt-2">
                    {health.services.jobQueue.pendingJobs} Pending
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Status: {health.services.jobQueue.status}
                  </div>
                </div>
              </div>

              {/* Feature Flags */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                <h3 className="font-bold text-base text-slate-900">
                  Feature Flags Architecture
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {featureFlags.map((flag) => (
                    <div key={flag.id} className="p-3 border rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">{flag.name}</div>
                        <div className="text-[11px] text-slate-500">{flag.description}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${flag.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                        {flag.enabled ? 'ACTIVE' : 'DISABLED'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: COMMUNICATIONS */}
          {activeTab === 'communications' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Unified Communications &amp; SMS Dispatch</h2>
                  <p className="text-xs text-slate-500">
                    Two-way conversational history with homeowners, field crews, and insurance adjusters.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
                <EmptyState
                  title="No Active Communication Threads"
                  description="SMS and email exchanges will appear here as leads and homeowners interact with dispatch or automated appointment reminders."
                />
              </div>
            </div>
          )}

          {/* TAB: ESTIMATES */}
          {activeTab === 'estimates' && (
            <EstimateWorkspace
              currentPath={currentPath}
              onNavigate={onNavigate}
              customers={customers}
              properties={properties}
              inspections={inspections}
              measurements={measurements}
              integrations={integrations}
              onCreateProposalFromEstimate={(est) => {
                setPreSelectedEstimateIdForProposal(est.id);
                handleTabSelect('proposals');
              }}
            />
          )}

          {/* TAB: PROPOSALS */}
          {activeTab === 'proposals' && (
            <ProposalWorkspace
              currentPath={currentPath}
              onNavigate={onNavigate}
              customers={customers}
              properties={properties}
              estimates={estimates}
              preSelectedEstimateId={preSelectedEstimateIdForProposal}
              onProposalAccepted={() => {
                loadData();
              }}
            />
          )}

          {/* TAB: PAYMENTS */}
          {activeTab === 'payments' && (
            <BillingPaymentsTab />
          )}

          {/* TAB: CREWS */}
          {activeTab === 'crews' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Roofing Installation Crews &amp; Subcontractors</h2>
                  <p className="text-xs text-slate-500">
                    Crew assignments, daily magnet nail sweeps, safety compliance, workers' comp verifications, and project schedules.
                  </p>
                </div>
                <button
                  onClick={() => setShowRegisterCrewModal(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Crew</span>
                </button>
              </div>

              {crews.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
                  <EmptyState
                    title="No Production Crews Registered"
                    description="Register certified roofing crews with Texas workers comp verification, insurance policies, and specialty skill certifications."
                    action={
                      <button
                        onClick={() => setShowRegisterCrewModal(true)}
                        className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs mx-auto"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Register First Crew</span>
                      </button>
                    }
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {crews.map((crew) => (
                    <div
                      key={crew.id}
                      className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-mono text-[10px] text-slate-400 font-bold block">{crew.id}</span>
                            <h3 className="font-bold text-base text-slate-900 leading-tight">{crew.name}</h3>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              crew.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : crew.status === 'ON_JOB'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {crew.status}
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs text-slate-600 border-y border-slate-100 py-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Foreman:</span>
                            <strong className="text-slate-900">{crew.foremanName}</strong>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Phone:</span>
                            <a href={`tel:${crew.phone}`} className="text-red-600 hover:underline font-medium">
                              {crew.phone}
                            </a>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Crew Size:</span>
                            <span className="font-semibold text-slate-800">{crew.crewSize || 6} Technicians</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Territory:</span>
                            <span className="font-medium text-slate-800">{crew.market || 'Texarkana Hub'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Workers' Comp:</span>
                            {crew.workersCompVerified ? (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Verified
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                Pending Audit
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">GL Policy Expires:</span>
                            <span className="font-medium text-slate-800">{crew.insuranceExpiryDate || 'Active on file'}</span>
                          </div>
                        </div>

                        {crew.specialties && crew.specialties.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {crew.specialties.map((spec, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700"
                              >
                                {spec}
                              </span>
                            ))}
                          </div>
                        )}

                        {crew.notes && (
                          <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded italic">
                            &quot;{crew.notes}&quot;
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Active Projects: <strong>{crew.assignedProjectIds?.length || 0}</strong></span>
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Nail Sweep Ready
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: MATERIALS & VENDORS */}
          {(activeTab === 'materials' || activeTab === 'vendors') && (
            <MaterialsVendorsTab />
          )}

          {/* TAB: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Analytics, Pipeline &amp; Marketing Attribution</h2>
                <p className="text-xs text-slate-500">
                  Lead source conversion rates, cost per inspection, and Northeast Texas territory penetration.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Leads Captured</span>
                  <div className="text-2xl font-black text-slate-900 mt-2">{leads.length}</div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Properties Audited</span>
                  <div className="text-2xl font-black text-slate-900 mt-2">{properties.length}</div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Inspections Completed</span>
                  <div className="text-2xl font-black text-slate-900 mt-2">
                    {inspections.filter((i) => i.status === 'COMPLETED').length}
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Pipeline Projects</span>
                  <div className="text-2xl font-black text-slate-900 mt-2">{projects.length}</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SETTINGS & CONFIG */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Business Rules &amp; Platform Configuration</h2>
                <p className="text-xs text-slate-500">
                  Manage Texas statutory rules, lead scoring thresholds, service territories, and integration credentials.
                </p>
              </div>

              <div className="space-y-4">
                {/* 1. Texas Insurance Code Chapter 707 & HB 2102 Rule */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-red-600" />
                      <h3 className="font-bold text-slate-900 text-sm">Texas HB 2102 Compliance Engine</h3>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      MANDATORY &bull; ACTIVE
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Under Texas law, roofing contractors are strictly prohibited from paying, waiving, absorbing, or rebating an insurance deductible. All proposals, homeowner portals, and invoices generated by The Roof Doctors enforce the statutory notice.
                  </p>
                </div>

                {/* 2. Service Area Geography Rule */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-red-600" />
                      <h3 className="font-bold text-slate-900 text-sm">Northeast Texas Service Territories</h3>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                      8 ACTIVE HUBS
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {['Texarkana (HQ)', 'Atlanta', 'New Boston', 'Paris', 'Sulphur Springs', 'Longview', 'Tyler', 'Marshall'].map((city) => (
                      <div key={city} className="p-2 bg-slate-50 border border-slate-200 rounded font-medium text-slate-700">
                        &bull; {city}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Lead Scoring Rules */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-red-600" />
                      <h3 className="font-bold text-slate-900 text-sm">Diagnostic Lead Scoring Matrix</h3>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                      CONFIGURED
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span>Active Ceiling Leak / Ceiling Infiltration Reported</span>
                      <strong className="text-red-600">+25 Points</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span>Recent Hail / Tornado Event Match (NOAA Swath)</span>
                      <strong className="text-red-600">+30 Points</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span>Homeowner Verified vs Tenant</span>
                      <strong className="text-slate-800">+20 Points</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Immediate Diagnostic Inspection Requested</span>
                      <strong className="text-slate-800">+25 Points</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Operational Modals */}
      {/* 1. Register Crew Modal */}
      <RegisterCrewModal
        isOpen={showRegisterCrewModal}
        onClose={() => setShowRegisterCrewModal(false)}
        onCrewRegistered={(newCrew) => {
          setCrews((prev) => [newCrew, ...prev]);
          setActionMessage(`Production crew "${newCrew.name}" registered successfully with Texas Workers' Comp verification.`);
          setShowRegisterCrewModal(false);
          loadData();
        }}
      />

      {/* 2. Submit Diagnostic Report Modal */}
      <SubmitDiagnosticReportModal
        isOpen={showDiagnosticModal}
        onClose={() => setShowDiagnosticModal(false)}
        properties={properties}
        customers={customers}
        onReportSubmitted={(newInspection, message) => {
          setInspections((prev) => [newInspection, ...prev]);
          setActionMessage(message);
          setShowDiagnosticModal(false);
          loadData();
        }}
      />

      {/* 2.5 Lead Detail & History Modal */}
      {selectedLeadIdForDetail && (
        <LeadDetailModal
          leadId={selectedLeadIdForDetail}
          users={users}
          onClose={() => setSelectedLeadIdForDetail(null)}
          onLeadUpdated={(updated) => {
            setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
            setActionMessage(`Lead record for "${updated.name}" updated successfully.`);
          }}
          onConvert={(leadToConvert) => {
            setSelectedLeadIdForDetail(null);
            setSelectedLeadForConversion(leadToConvert);
          }}
        />
      )}

      {/* 3. Lead Conversion Modal */}
      {selectedLeadForConversion && (
        <LeadConversionModal
          lead={selectedLeadForConversion}
          onClose={() => setSelectedLeadForConversion(null)}
          onConverted={(result) => {
            setActionMessage(`Lead converted to Customer #${result?.customer?.id || ''}! Permanent Roof Record generated.`);
            setSelectedLeadForConversion(null);
            loadData();
          }}
        />
      )}

      {/* 4. Customer 360 Modal */}
      {selectedCustomerIdFor360 && (
        <Customer360Modal
          customerId={selectedCustomerIdFor360}
          onClose={() => setSelectedCustomerIdFor360(null)}
          onSelectProperty={(propId) => {
            setSelectedCustomerIdFor360(null);
            setSelectedPropertyIdForDetail(propId);
          }}
          onCustomerUpdated={() => loadData()}
        />
      )}

      {/* 5. Property Intelligence Modal */}
      {selectedPropertyIdForDetail && (
        <PropertyIntelligenceModal
          propertyId={selectedPropertyIdForDetail}
          onClose={() => setSelectedPropertyIdForDetail(null)}
          onPropertyUpdated={() => loadData()}
        />
      )}

      {/* 6. Inspection Detail Modal */}
      {selectedInspectionForDetail && (
        <InspectionDetailModal
          inspection={selectedInspectionForDetail}
          property={properties.find((p) => p.id === selectedInspectionForDetail.propertyId)}
          customer={customers.find((c) => {
            const prop = properties.find((p) => p.id === selectedInspectionForDetail.propertyId);
            return c.id === prop?.customerId;
          })}
          isOpen={Boolean(selectedInspectionForDetail)}
          onClose={() => setSelectedInspectionForDetail(null)}
          onInspectionUpdated={(updated) => {
            setInspections((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
            setSelectedInspectionForDetail(updated);
            setActionMessage(`Inspection #${updated.id} status updated to ${updated.status}.`);
          }}
        />
      )}

      {/* 7. Project Production & Work Order Modal */}
      {selectedProjectForProduction && (
        <ProjectProductionModal
          project={selectedProjectForProduction}
          onClose={() => setSelectedProjectForProduction(null)}
          onUpdate={() => loadData()}
        />
      )}
    </div>
  );
};
