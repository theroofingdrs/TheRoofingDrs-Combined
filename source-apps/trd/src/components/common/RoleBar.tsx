import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import type { UserRole } from '../../../shared/types/index.ts';
import { Shield, Globe, LayoutDashboard, Smartphone, Home, UserCheck, LogOut } from 'lucide-react';

interface RoleBarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const RoleBar: React.FC<RoleBarProps> = ({ currentPath, onNavigate }) => {
  const { currentUser, signInAsRole, signOut } = useAuth();

  const isCrm = currentPath.startsWith('/app');
  const isField = currentPath.startsWith('/field');
  const isPortal = currentPath.startsWith('/portal');
  const isPublic = !isCrm && !isField && !isPortal;

  const roles: { role: UserRole; label: string }[] = [
    { role: 'OWNER', label: 'Owner / Principal' },
    { role: 'ADMINISTRATOR', label: 'General Manager (Ops)' },
    { role: 'PRODUCTION', label: 'Production Manager' },
    { role: 'PROJECT_MANAGER', label: 'Project Manager' },
    { role: 'SALES', label: 'Sales & Estimating' },
    { role: 'INSPECTOR', label: 'Field Diagnostic Inspector' },
    { role: 'OFFICE', label: 'Office & Dispatch' },
    { role: 'CREW', label: 'Roofing Crew / Foreman' },
    { role: 'SUBCONTRACTOR', label: 'Subcontractor (Trades)' },
    { role: 'CUSTOMER_SUPPORT', label: 'Customer Support' },
    { role: 'MARKETING', label: 'Marketing Lead' },
    { role: 'HOMEOWNER', label: 'Homeowner / Client' },
  ];

  return (
    <div className="bg-slate-950 text-slate-200 text-xs py-1.5 px-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50">
      {/* Experience Switcher */}
      <div className="flex items-center gap-1">
        <span className="text-slate-400 font-medium mr-2 hidden sm:inline text-[11px] uppercase tracking-wider">
          Experience:
        </span>
        <button
          onClick={() => onNavigate('/')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
            isPublic ? 'bg-red-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Public Website</span>
        </button>

        <button
          onClick={() => onNavigate('/app/dashboard')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
            isCrm ? 'bg-red-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>CRM / Admin</span>
        </button>

        <button
          onClick={() => onNavigate('/field/today')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
            isField ? 'bg-red-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Field Operations</span>
        </button>

        <button
          onClick={() => onNavigate('/portal/my-roof')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
            isPortal ? 'bg-red-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Homeowner Portal</span>
        </button>
      </div>

      {/* RBAC Role Simulator for Quality Gates */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-slate-400">
          <Shield className="w-3.5 h-3.5 text-red-400" />
          <span className="hidden md:inline font-mono">RBAC Role:</span>
        </div>

        <select
          value={currentUser?.role || ''}
          onChange={(e) => {
            const val = e.target.value;
            if (val === 'LOGGED_OUT') {
              signOut();
            } else {
              const newRole = val as UserRole;
              signInAsRole(newRole);
              if (newRole === 'HOMEOWNER' && (isCrm || isField)) {
                onNavigate('/portal/my-roof');
              } else if ((newRole === 'CREW' || newRole === 'SUBCONTRACTOR') && isCrm) {
                onNavigate('/field/today');
              } else if (isPortal && newRole !== 'HOMEOWNER' && newRole !== 'OWNER' && newRole !== 'ADMINISTRATOR' && newRole !== 'CUSTOMER_SUPPORT') {
                onNavigate('/app/dashboard');
              }
            }
          }}
          className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-0.5 focus:outline-none focus:border-red-500 font-medium"
        >
          {roles.map((r) => (
            <option key={r.role} value={r.role}>
              {r.label}
            </option>
          ))}
          <option value="LOGGED_OUT">Public (Not Logged In)</option>
        </select>

        {currentUser ? (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-emerald-400 hidden lg:inline font-mono">
              {currentUser.name} ({currentUser.role})
            </span>
            <button
              onClick={() => {
                signOut();
                onNavigate('/');
              }}
              title="Sign out of operations"
              className="px-2 py-0.5 bg-slate-800 hover:bg-red-950 hover:text-red-300 text-slate-300 rounded text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <LogOut className="w-3 h-3" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        ) : (
          <span className="text-[11px] text-amber-400 hidden lg:inline font-mono">
            Guest / Anonymous
          </span>
        )}
      </div>
    </div>
  );
};
