import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
  PieChart,
  Pie,
} from 'recharts';
import type { Lead, LeadStatus } from '../../../shared/types/index.ts';
import {
  TrendingUp,
  ArrowRight,
  Filter,
  CheckCircle2,
  Calendar,
  FileText,
  Trophy,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Flame,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface LeadStageTrackerProps {
  leads: Lead[];
  onSelectStage?: (stage: LeadStatus | 'ALL') => void;
  onViewPipeline?: () => void;
  selectedStage?: LeadStatus | 'ALL';
}

interface StageDefinition {
  key: string;
  statuses: LeadStatus[];
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const STAGE_DEFINITIONS: StageDefinition[] = [
  {
    key: 'NEW',
    statuses: ['NEW'],
    label: 'New Intake',
    shortLabel: 'New',
    color: '#EF4444', // Red
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    icon: Flame,
    description: 'Uncontacted website & diagnostic inquiries needing immediate response',
  },
  {
    key: 'CONTACTED',
    statuses: ['CONTACTED'],
    label: 'Contacted',
    shortLabel: 'Contacted',
    color: '#6366F1', // Indigo
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    textColor: 'text-indigo-700',
    icon: Zap,
    description: 'Homeowner contacted, roof symptoms verified & appointment being set',
  },
  {
    key: 'INSPECTION_SCHEDULED',
    statuses: ['INSPECTION_SCHEDULED'],
    label: 'Inspection Scheduled',
    shortLabel: 'Inspection Sched',
    color: '#2563EB', // Blue
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    icon: Calendar,
    description: 'Inspector dispatched for physical 21-point roof & attic diagnostic',
  },
  {
    key: 'INSPECTION_COMPLETED',
    statuses: ['INSPECTION_COMPLETED'],
    label: 'Inspection Complete',
    shortLabel: 'Inspected',
    color: '#0D9488', // Teal
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    textColor: 'text-teal-700',
    icon: ShieldCheck,
    description: 'Forensic photos & condition report submitted; scope in drafting',
  },
  {
    key: 'ESTIMATE_SENT',
    statuses: ['ESTIMATE_SENT'],
    label: 'Quote / Estimate Sent',
    shortLabel: 'Quote Sent',
    color: '#9333EA', // Purple
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    icon: FileText,
    description: 'Official proposal delivered; awaiting homeowner / adjuster sign-off',
  },
  {
    key: 'WON',
    statuses: ['WON', 'JOB_SOLD', 'COMPLETED'],
    label: 'Won & Sold',
    shortLabel: 'Won',
    color: '#059669', // Emerald
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    icon: Trophy,
    description: 'Contract executed; scheduled for material drop & crew tear-off',
  },
  {
    key: 'LOST',
    statuses: ['LOST'],
    label: 'Lost / Disqualified',
    shortLabel: 'Lost',
    color: '#94A3B8', // Slate
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    textColor: 'text-slate-600',
    icon: AlertCircle,
    description: 'Denied insurance claim, out of service territory, or competitor chosen',
  },
];

export const LeadStageTracker: React.FC<LeadStageTrackerProps> = ({
  leads,
  onSelectStage,
  onViewPipeline,
  selectedStage = 'ALL',
}) => {
  const [divisionFilter, setDivisionFilter] = useState<'ALL' | 'RESIDENTIAL' | 'COMMERCIAL'>('ALL');
  const [viewMode, setViewMode] = useState<'bar' | 'donut'>('bar');
  const [hoveredStageKey, setHoveredStageKey] = useState<string | null>(null);

  // Filter leads based on division
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (divisionFilter === 'ALL') return true;
      const isCommercial =
        lead.division === 'COMMERCIAL' ||
        lead.serviceRequested?.toLowerCase().includes('commercial') ||
        lead.leadType === 'COMMERCIAL';
      return divisionFilter === 'COMMERCIAL' ? isCommercial : !isCommercial;
    });
  }, [leads, divisionFilter]);

  const totalFiltered = filteredLeads.length;

  // Compute stage aggregates
  const stageStats = useMemo(() => {
    return STAGE_DEFINITIONS.map((def) => {
      const stageLeads = filteredLeads.filter((l) => def.statuses.includes(l.status));
      const count = stageLeads.length;
      const percentage = totalFiltered > 0 ? (count / totalFiltered) * 100 : 0;
      const emergencyCount = stageLeads.filter((l) => l.emergencyFlag).length;
      const stormCount = stageLeads.filter((l) => l.stormRelatedFlag).length;
      const avgScore =
        count > 0 ? Math.round(stageLeads.reduce((acc, l) => acc + (l.score || 0), 0) / count) : 0;

      return {
        key: def.key,
        statuses: def.statuses,
        name: def.label,
        shortName: def.shortLabel,
        count,
        percentage: Number(percentage.toFixed(1)),
        color: def.color,
        bgColor: def.bgColor,
        borderColor: def.borderColor,
        textColor: def.textColor,
        icon: def.icon,
        description: def.description,
        emergencyCount,
        stormCount,
        avgScore,
      };
    });
  }, [filteredLeads, totalFiltered]);

  // Funnel progression (excluding Lost) for conversion steps
  const funnelStages = useMemo(() => {
    return stageStats.filter((s) => s.key !== 'LOST');
  }, [stageStats]);

  // Overall win rate
  const wonCount = stageStats.find((s) => s.key === 'WON')?.count || 0;
  const lostCount = stageStats.find((s) => s.key === 'LOST')?.count || 0;
  const closedCount = wonCount + lostCount;
  const winRate = closedCount > 0 ? ((wonCount / closedCount) * 100).toFixed(1) : '0.0';
  const pipelineActiveCount = totalFiltered - wonCount - lostCount;

  // Donut chart distribution data
  const donutData = useMemo(() => {
    return [
      { name: 'Active In Pipeline', value: Math.max(pipelineActiveCount, 0), color: '#3B82F6' },
      { name: 'Won & Sold', value: wonCount, color: '#10B981' },
      { name: 'Lost / Closed', value: lostCount, color: '#94A3B8' },
    ].filter((d) => d.value > 0);
  }, [pipelineActiveCount, wonCount, lostCount]);

  const handleStageClick = (stage: (typeof stageStats)[0]) => {
    if (!onSelectStage) return;
    // Map stage key to primary lead status
    const primaryStatus = stage.statuses[0];
    onSelectStage(primaryStatus);
  };

  // Custom Recharts Tooltip
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs min-w-[200px]">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span className="font-bold flex items-center gap-1.5" style={{ color: data.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
              {data.name}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">{data.percentage}% of leads</span>
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Leads:</span>
              <span className="font-black text-white text-sm">{data.count}</span>
            </div>
            {data.avgScore > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Avg Lead Score:</span>
                <span className="font-semibold text-slate-200">{data.avgScore}/100</span>
              </div>
            )}
            {data.emergencyCount > 0 && (
              <div className="flex justify-between items-center text-red-400">
                <span>Active Emergencies:</span>
                <span className="font-bold">{data.emergencyCount}</span>
              </div>
            )}
            {data.stormCount > 0 && (
              <div className="flex justify-between items-center text-sky-400">
                <span>Storm Impact:</span>
                <span className="font-bold">{data.stormCount}</span>
              </div>
            )}
          </div>
          <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 leading-tight">
            {data.description}
          </div>
          <div className="mt-2 text-[10px] text-indigo-300 font-bold text-center">
            Click bar to filter lead table &rarr;
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Header & Division Controls */}
      <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-slate-50 via-white to-slate-50">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-100 text-red-700 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
              Lead Pipeline Stage Distribution &amp; Progress Tracker
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
              {totalFiltered} Total Leads
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Visual pipeline distribution tracking leads from first contact to inspection, estimate, and closed roof contracts.
          </p>
        </div>

        {/* Division & View Mode Selectors */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Division Filter */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-semibold shadow-2xs">
            <button
              onClick={() => setDivisionFilter('ALL')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                divisionFilter === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              All Divisions
            </button>
            <button
              onClick={() => setDivisionFilter('RESIDENTIAL')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                divisionFilter === 'RESIDENTIAL'
                  ? 'bg-red-700 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Residential
            </button>
            <button
              onClick={() => setDivisionFilter('COMMERCIAL')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                divisionFilter === 'COMMERCIAL'
                  ? 'bg-blue-700 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Commercial
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-semibold shadow-2xs">
            <button
              onClick={() => setViewMode('bar')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'bar'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Stages
            </button>
            <button
              onClick={() => setViewMode('donut')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'donut'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Status Split
            </button>
          </div>

          {onViewPipeline && (
            <button
              onClick={onViewPipeline}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 px-2.5 py-1 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <span>View Full Pipeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Visual Pipeline Funnel Progress Stepper */}
      <div className="px-5 sm:px-6 pt-5 pb-3 border-b border-slate-100 bg-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Conversion Funnel Sequence
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            Active in Pipeline: <strong className="text-slate-900">{pipelineActiveCount}</strong> • Closed Win Rate:{' '}
            <strong className="text-emerald-700">{winRate}%</strong>
          </span>
        </div>

        {/* Stepper Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {funnelStages.map((stage, idx) => {
            const Icon = stage.icon;
            const isSelected = selectedStage === stage.statuses[0];
            const isHovered = hoveredStageKey === stage.key;

            return (
              <button
                key={stage.key}
                onClick={() => handleStageClick(stage)}
                onMouseEnter={() => setHoveredStageKey(stage.key)}
                onMouseLeave={() => setHoveredStageKey(null)}
                className={`relative p-3 rounded-xl border text-left transition-all cursor-pointer group ${
                  isSelected
                    ? 'ring-2 ring-slate-900 border-transparent shadow-sm'
                    : isHovered
                    ? `${stage.borderColor} shadow-xs`
                    : 'border-slate-200 hover:border-slate-300'
                } ${stage.bgColor}/40 hover:${stage.bgColor}`}
              >
                {/* Step indicator number */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    0{idx + 1}
                  </span>
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center text-white"
                    style={{ backgroundColor: stage.color }}
                  >
                    <Icon className="w-3 h-3" />
                  </div>
                </div>

                <div className="text-[11px] font-bold text-slate-800 truncate">
                  {stage.shortName}
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-lg font-black text-slate-900">{stage.count}</span>
                  <span className="text-[10px] font-semibold text-slate-500">
                    {stage.percentage}%
                  </span>
                </div>

                {/* Micro Progress Bar */}
                <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(stage.percentage * 2, 100)}%`,
                      backgroundColor: stage.color,
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Visual Tracker: Recharts Chart Section */}
      <div className="p-5 sm:p-6">
        {totalFiltered === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No leads found for this filter.</p>
            <p className="text-xs text-slate-400 mt-1">Try switching back to &quot;All Divisions&quot;.</p>
          </div>
        ) : viewMode === 'bar' ? (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <div className="text-xs font-semibold text-slate-700">
                <span>Distribution by Stage Volume</span>
                <span className="text-slate-400 font-normal ml-2">
                  (Click any bar to filter leads below)
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-red-500" />
                  <span>New</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-600" />
                  <span>Scheduled</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-purple-600" />
                  <span>Estimate Sent</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
                  <span>Won</span>
                </span>
              </div>
            </div>

            {/* Recharts BarChart */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stageStats}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="shortName"
                    tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
                    axisLine={{ stroke: '#E2E8F0' }}
                    tickLine={false}
                    interval={0}
                  />
                  <YAxis
                    tick={{ fill: '#94A3B8', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }} />
                  <Bar
                    dataKey="count"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={52}
                    className="cursor-pointer transition-opacity duration-200"
                  >
                    {stageStats.map((entry) => (
                      <Cell
                        key={`cell-${entry.key}`}
                        fill={entry.color}
                        onClick={() => handleStageClick(entry)}
                        className="cursor-pointer"
                        opacity={
                          hoveredStageKey
                            ? hoveredStageKey === entry.key
                              ? 1
                              : 0.4
                            : selectedStage !== 'ALL'
                            ? entry.statuses.includes(selectedStage as LeadStatus)
                              ? 1
                              : 0.4
                            : 0.95
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          /* Donut / Status Split View */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="h-60 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val} Leads`, name]}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#FFF',
                      fontSize: '11px',
                    }}
                  />
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`donut-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Pipeline Health Summary
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-blue-50/60 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <span className="text-xs font-semibold text-slate-800">Active In Pipeline</span>
                  </div>
                  <span className="text-xs font-black text-blue-900">{pipelineActiveCount} leads</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-emerald-50/60 rounded-lg border border-emerald-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <span className="text-xs font-semibold text-slate-800">Won &amp; Sold Contracts</span>
                  </div>
                  <span className="text-xs font-black text-emerald-900">{wonCount} leads</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    <span className="text-xs font-semibold text-slate-700">Lost / Disqualified</span>
                  </div>
                  <span className="text-xs font-black text-slate-700">{lostCount} leads</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Conversion Win Rate:</span>
                <span className="font-black text-emerald-700 text-sm">{winRate}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Stage Filter Buttons Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Quick Filter:</span>
            <button
              onClick={() => onSelectStage?.('ALL')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                selectedStage === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              All ({totalFiltered})
            </button>
            {stageStats.map((s) => {
              const isSelected = selectedStage === s.statuses[0];
              return (
                <button
                  key={s.key}
                  onClick={() => handleStageClick(s)}
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span>{s.shortName}</span>
                  <span className="text-[9px] opacity-75 font-mono">({s.count})</span>
                </button>
              );
            })}
          </div>

          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Updated live from CRM database</span>
          </div>
        </div>
      </div>
    </div>
  );
};
