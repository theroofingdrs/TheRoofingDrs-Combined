import React, { ReactNode } from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryAction?: ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  secondaryAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-slate-200 bg-white shadow-xs max-w-lg mx-auto my-6">
      <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            {actionLabel}
          </button>
        )}
        {secondaryAction}
      </div>
    </div>
  );
};
