import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'lead' | 'project' | 'appointment' | 'proposal' | 'payment' | 'condition' | 'general';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'general' }) => {
  const getStyle = (): string => {
    switch (status) {
      // CRM Statuses & Emergencies
      case 'NEW':
        return 'bg-red-50 text-red-700 border-red-200 font-bold';
      case 'CONTACTED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'INSPECTION_SCHEDULED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'INSPECTION_COMPLETED':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'ESTIMATE_SENT':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'WON':
      case 'JOB_SOLD':
      case 'COMPLETED':
      case 'PAID':
      case 'SOLD':
      case 'ACCEPTED':
      case 'VERIFIED':
      case 'ACTIVE':
      case 'EXCELLENT':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'LOST':
        return 'bg-slate-100 text-slate-600 border-slate-300';

      // Emergency / Urgency
      case 'EMERGENCY':
      case 'CRITICAL_LEAK':
      case 'STORM_DAMAGED':
      case 'FAILED':
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200';

      // Warning / Active Review
      case 'REQUESTED':
      case 'ESTIMATING':
      case 'PENDING':
      case 'PROCESSING':
      case 'MODERATE':
      case 'NEEDS_FIELD_CHECK':
        return 'bg-amber-50 text-amber-700 border-amber-200';

      // In Progress / Action
      case 'INSPECTION':
      case 'IN_PROGRESS':
      case 'CONFIRMED':
      case 'SCHEDULED':
        return 'bg-blue-50 text-blue-700 border-blue-200';

      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const formatText = (str: string): string => {
    switch (str) {
      case 'INSPECTION_COMPLETED':
        return 'Inspection Complete';
      case 'INSPECTION_SCHEDULED':
        return 'Inspection Scheduled';
      case 'ESTIMATE_SENT':
        return 'Estimate Sent';
      case 'JOB_SOLD':
      case 'WON':
        return 'Won';
      case 'LOST':
        return 'Lost';
      case 'CONTACTED':
        return 'Contacted';
      case 'NEW':
        return 'New';
      default:
        return str.replace(/_/g, ' ');
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${getStyle()} whitespace-nowrap`}
    >
      {formatText(status)}
    </span>
  );
};
