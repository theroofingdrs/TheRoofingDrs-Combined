import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Calculator,
  Search,
  RefreshCw,
  Download,
  AlertTriangle,
  Clock,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ArrowLeft,
  Shield,
} from 'lucide-react';
import { Link } from '../router';
import { SeoMeta } from '../components/SeoMeta';

export interface AdminLeadItem {
  leadId: string;
  fullName: string;
  companyName?: string;
  phone: string;
  email?: string;
  propertyType?: string;
  propertyAddress?: string;
  roofSystem?: string;
  squareFootage?: number | string | null;
  urgency?: string;
  priority?: string;
  leadType: string;
  source?: string;
  status?: string;
  message?: string;
  notes?: string;
  photos?: Array<{ id?: string; dataUrl: string; name?: string }>;
  createdAt: string;
}

export interface AdminCalculatorItem {
  id: string;
  fullName: string;
  companyName?: string;
  phone: string;
  email?: string;
  propertyType?: string;
  propertyAddress?: string;
  squareFootage: number;
  selectedSystem?: string;
  currentCondition?: string;
  serviceIntent?: string;
  notes?: string;
  calculatedEstimate: {
    lowEstimate: number;
    highEstimate: number;
  };
  createdAt: string;
}

export const LeadsAdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'leads' | 'calculator'>('leads');
  const [leads, setLeads] = useState<AdminLeadItem[]>([]);
  const [calcSubmissions, setCalcSubmissions] = useState<AdminCalculatorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEmergency, setFilterEmergency] = useState(false);

  const staffRequest = (url: string) => {
    const token = localStorage.getItem('roof_docs_access_token');
    return fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leadsRes, calcRes] = await Promise.all([
        staffRequest('/api/leads'),
        staffRequest('/api/calculator'),
      ]);

      if (leadsRes.ok) {
        const data = await leadsRes.json();
        const rawLeads = Array.isArray(data) ? data : (data.leads || []);
        const formattedLeads: AdminLeadItem[] = rawLeads.map((l: any) => ({
          leadId: l.leadId || l.id || `lead_${Date.now()}`,
          fullName: l.fullName || l.name || 'Commercial Prospect',
          companyName: l.companyName || '',
          phone: l.phone || '',
          email: l.email || '',
          propertyType: l.propertyType || 'Commercial',
          propertyAddress: l.propertyAddress || l.address || '',
          roofSystem: l.roofSystem || 'Uncertain',
          squareFootage: l.squareFootage || null,
          urgency: l.priority || l.urgency || 'Standard',
          priority: l.priority || 'Normal',
          leadType: l.leadType || 'General',
          source: l.source || 'Website Form',
          status: l.status || 'New',
          message: l.message || '',
          notes: l.notes || l.message || '',
          photos: Array.isArray(l.photos) ? l.photos : [],
          createdAt: l.createdAt || new Date().toISOString(),
        }));
        setLeads(formattedLeads);
      }

      if (calcRes.ok) {
        const cData = await calcRes.json();
        const rawCalcs = Array.isArray(cData) ? cData : [];
        const formattedCalcs: AdminCalculatorItem[] = rawCalcs.map((c: any) => ({
          id: c.id || `calc_${Date.now()}`,
          fullName: c.inputs?.contactName || c.fullName || 'Calculator Prospect',
          companyName: c.inputs?.companyName || c.companyName || '',
          phone: c.inputs?.phone || c.phone || 'N/A',
          email: c.inputs?.email || c.email || 'N/A',
          propertyType: c.inputs?.propertyType || c.propertyType || 'Commercial',
          propertyAddress: c.inputs?.address || c.propertyAddress || 'Ark-La-Tex',
          squareFootage: Number(c.inputs?.squareFootage || c.squareFootage || 10000),
          selectedSystem: c.inputs?.roofSystem || c.selectedSystem || 'TPO',
          currentCondition: c.inputs?.condition || c.currentCondition || 'Aging',
          serviceIntent: c.inputs?.desiredWork || c.serviceIntent || 'Replacement',
          notes: c.notes || '',
          calculatedEstimate: {
            lowEstimate: Number(c.results?.estimatedLow || c.calculatedEstimate?.lowEstimate || 0),
            highEstimate: Number(c.results?.estimatedHigh || c.calculatedEstimate?.highEstimate || 0),
          },
          createdAt: c.createdAt || new Date().toISOString(),
        }));
        setCalcSubmissions(formattedCalcs);
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredLeads = leads.filter((lead) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      lead.fullName.toLowerCase().includes(q) ||
      (lead.companyName && lead.companyName.toLowerCase().includes(q)) ||
      lead.phone.includes(searchQuery) ||
      (lead.propertyAddress && lead.propertyAddress.toLowerCase().includes(q));
    const matchesEmergency = !filterEmergency || lead.leadType === 'Emergency' || lead.priority === 'Emergency';
    return matchesSearch && matchesEmergency;
  });

  const filteredCalcs = calcSubmissions.filter((calc) => {
    const q = searchQuery.toLowerCase();
    return (
      calc.fullName.toLowerCase().includes(q) ||
      (calc.companyName && calc.companyName.toLowerCase().includes(q)) ||
      calc.phone.includes(searchQuery) ||
      (calc.selectedSystem && calc.selectedSystem.toLowerCase().includes(q))
    );
  });

  const exportData = (type: 'leads' | 'calc') => {
    const dataToExport = type === 'leads' ? leads : calcSubmissions;
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crd-${type}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans-crd pb-24">
      <SeoMeta
        title="Commercial Inquiries & Lead Management | CRD Portal"
        description="Commercial Roof Doctors internal inquiry and calculator submission management portal."
        canonicalPath="/admin/leads"
      />

      {/* Header */}
      <section className="bg-gradient-to-b from-[#0e1422] to-[#090d16] border-b border-slate-800 pt-8 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold uppercase tracking-wider transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Website</span>
            </Link>
            <div className="flex items-center gap-2 text-[11px] font-mono-crd text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>CRD Staff Portal & Operations</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
            <div>
              <div className="text-xs font-mono-crd text-amber-500 uppercase tracking-widest">
                Field Operations Hub
              </div>
              <h1 className="text-2xl sm:text-4xl font-heading font-black uppercase text-white mt-1">
                Commercial Inquiries & Calculations
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Live database of incoming commercial inspection requests, emergency alerts, and calculator estimates.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchData}
                className="p-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => exportData(activeTab === 'leads' ? 'leads' : 'calc')}
                className="px-3 py-2 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-heading font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export {activeTab === 'leads' ? 'Leads' : 'Calculations'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('leads')}
              className={`px-4 py-2 rounded text-xs font-heading font-bold uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-2 ${
                activeTab === 'leads'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span>Commercial Leads & Inspections ({leads.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-4 py-2 rounded text-xs font-heading font-bold uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-2 ${
                activeTab === 'calculator'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Calculator Estimates ({calcSubmissions.length})</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search name, phone, address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-amber-500 outline-none w-64"
              />
            </div>

            {activeTab === 'leads' && (
              <button
                onClick={() => setFilterEmergency(!filterEmergency)}
                className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                  filterEmergency
                    ? 'bg-red-950 text-red-300 border-red-700'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>Emergencies Only</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Commercial Leads */}
        {activeTab === 'leads' && (
          <div className="space-y-4">
            {filteredLeads.length === 0 ? (
              <div className="p-12 text-center bg-[#0e1422] rounded-xl border border-slate-800 space-y-3">
                <Inbox className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-lg font-heading font-bold uppercase text-white">No Leads Found</h3>
                <p className="text-xs text-slate-400">
                  {searchQuery ? 'No inquiries match your filter criteria.' : 'New submissions from the website will appear here in real time.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredLeads.map((lead) => (
                  <div
                    key={lead.leadId}
                    className={`bg-[#0e1422] border rounded-xl p-5 transition-all space-y-4 ${
                      lead.leadType === 'Emergency' || lead.priority === 'Emergency'
                        ? 'border-red-600/70 shadow-lg shadow-red-600/5'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-3">
                        {lead.leadType === 'Emergency' || lead.priority === 'Emergency' ? (
                          <span className="px-2.5 py-1 rounded bg-red-600 text-white font-mono-crd text-xs font-black uppercase flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            EMERGENCY LEAK
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono-crd text-xs font-bold uppercase">
                            {lead.leadType}
                          </span>
                        )}
                        <h3 className="font-heading font-bold text-lg text-white uppercase">
                          {lead.fullName} {lead.companyName && <span className="text-slate-400 font-normal">({lead.companyName})</span>}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono-crd text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(lead.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                      <div className="space-y-1">
                        <span className="text-slate-400 block font-mono-crd uppercase">Contact Info</span>
                        <div className="flex items-center gap-1.5 font-bold text-slate-200">
                          <Phone className="w-3.5 h-3.5 text-amber-400" />
                          <a href={`tel:${lead.phone}`} className="hover:underline">{lead.phone || 'No phone'}</a>
                        </div>
                        {lead.email && (
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <a href={`mailto:${lead.email}`} className="hover:underline">{lead.email}</a>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-400 block font-mono-crd uppercase">Facility Details</span>
                        <div className="text-slate-200 font-medium">
                          {lead.propertyType || 'Commercial'}
                        </div>
                        {lead.propertyAddress && (
                          <div className="flex items-start gap-1 text-slate-300">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span>{lead.propertyAddress}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-400 block font-mono-crd uppercase">Roof Attributes</span>
                        <div className="text-slate-300">
                          System: <strong className="text-white">{lead.roofSystem || 'Uncertain'}</strong>
                        </div>
                        <div className="text-slate-300">
                          Est. Size: <strong className="text-white">{lead.squareFootage ? `${Number(lead.squareFootage).toLocaleString()} sq ft` : 'Pending'}</strong>
                        </div>
                        <div className="text-slate-300">
                          Priority: <strong className="text-white">{lead.priority || 'Normal'}</strong>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-400 block font-mono-crd uppercase">Source & Status</span>
                        <div className="text-slate-300">{lead.source || 'Website Form'}</div>
                        <div className="text-amber-400 font-mono-crd uppercase text-[11px]">
                          Status: {lead.status || 'New'}
                        </div>
                        {lead.photos && lead.photos.length > 0 && (
                          <div className="text-emerald-400 font-bold">
                            {lead.photos.length} Photo(s) Attached
                          </div>
                        )}
                      </div>
                    </div>

                    {lead.notes && (
                      <div className="p-3 bg-slate-900/80 rounded border border-slate-800 text-xs text-slate-300 space-y-1">
                        <span className="font-mono-crd text-slate-400 uppercase text-[10px] block">Client Notes / Issue Description:</span>
                        <p className="leading-relaxed">{lead.notes}</p>
                      </div>
                    )}

                    {lead.photos && lead.photos.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <span className="font-mono-crd text-slate-400 uppercase text-[10px] block">Uploaded Leak / Roof Photos:</span>
                        <div className="flex flex-wrap gap-2">
                          {lead.photos.map((photo, i) => (
                            <img
                              key={photo.id || i}
                              src={photo.dataUrl}
                              alt={photo.name || `Roof Photo ${i + 1}`}
                              className="w-16 h-16 object-cover rounded border border-slate-700 hover:border-amber-400 cursor-pointer"
                              onClick={() => {
                                const w = window.open('');
                                if (w) {
                                  w.document.write(`<img src="${photo.dataUrl}" style="max-width:100%; height:auto;" />`);
                                }
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Calculator Submissions */}
        {activeTab === 'calculator' && (
          <div className="space-y-4">
            {filteredCalcs.length === 0 ? (
              <div className="p-12 text-center bg-[#0e1422] rounded-xl border border-slate-800 space-y-3">
                <Calculator className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-lg font-heading font-bold uppercase text-white">No Calculator Submissions</h3>
                <p className="text-xs text-slate-400">
                  Submissions from the 5-step interactive cost calculator will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredCalcs.map((calc) => (
                  <div
                    key={calc.id}
                    className="bg-[#0e1422] border border-slate-800 hover:border-slate-700 rounded-xl p-5 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono-crd text-xs font-bold uppercase">
                          Calculator Quote Request
                        </span>
                        <h3 className="font-heading font-bold text-lg text-white uppercase">
                          {calc.fullName} {calc.companyName && <span className="text-slate-400 font-normal">({calc.companyName})</span>}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono-crd text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(calc.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                      <div className="space-y-1">
                        <span className="text-slate-400 block font-mono-crd uppercase">Contact</span>
                        <div className="font-bold text-white">{calc.phone}</div>
                        <div className="text-slate-300">{calc.email}</div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-400 block font-mono-crd uppercase">Facility & Location</span>
                        <div className="text-white">{calc.propertyType}</div>
                        <div className="text-slate-300">{calc.propertyAddress}</div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-400 block font-mono-crd uppercase">Roof Geometry & Condition</span>
                        <div className="text-white font-bold">{calc.squareFootage.toLocaleString()} Sq Ft</div>
                        <div className="text-slate-300">System: {calc.selectedSystem}</div>
                        <div className="text-slate-300">Condition: {calc.currentCondition}</div>
                      </div>

                      <div className="space-y-1 bg-slate-900/80 p-2.5 rounded border border-slate-800">
                        <span className="text-amber-400 block font-mono-crd uppercase font-bold text-[10px]">Estimated Range</span>
                        <div className="text-base font-heading font-black text-amber-400">
                          ${calc.calculatedEstimate.lowEstimate.toLocaleString()} – ${calc.calculatedEstimate.highEstimate.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Scope: {calc.serviceIntent}
                        </div>
                      </div>
                    </div>

                    {calc.notes && (
                      <div className="p-3 bg-slate-900/80 rounded border border-slate-800 text-xs text-slate-300">
                        <span className="font-mono-crd text-slate-400 uppercase text-[10px] block">Project Notes:</span>
                        <p>{calc.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
