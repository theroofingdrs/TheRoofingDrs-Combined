import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import type { UserRole } from '../../../shared/types/index.ts';
import { BrandLogo } from './BrandLogo.tsx';
import { ShieldAlert, Lock, ArrowRight, ArrowLeft, LogOut } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  experienceName: 'CRM / Operations Hub' | 'Field Operations' | 'Homeowner Portal';
  children: React.ReactNode;
  onNavigate: (path: string) => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  experienceName,
  children,
  onNavigate,
}) => {
  const { currentUser, isAuthenticated, loginStaff, loginHomeowner, signOut } = useAuth();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [homeownerInput, setHomeownerInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Not Authenticated State
  if (!isAuthenticated || !currentUser) {
    const isPortal = experienceName === 'Homeowner Portal';

    const handleStaffLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMessage('');
      setIsSubmitting(true);

      const res = await loginStaff(email, password);
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Authentication failed');
      }
    };

    const handleHomeownerLogin = (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMessage('');
      setIsSubmitting(true);

      const res = loginHomeowner(homeownerInput);
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Authentication failed');
      }
    };

    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex justify-center mb-2">
              <BrandLogo variant="light" size="sm" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-950 text-red-400 border border-red-800">
              <Lock className="w-3.5 h-3.5" />
              <span>Authentication Required</span>
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">
              {experienceName}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isPortal
                ? 'Sign in with your email or phone number to access your permanent Roof Record, diagnostic reports, and milestone tracking.'
                : 'Access to internal operations, CRM dispatch, and field management requires verified company staff credentials.'}
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-200 leading-relaxed">
              {errorMessage}
            </div>
          )}

          {isPortal ? (
            <form onSubmit={handleHomeownerLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Homeowner Email or Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={homeownerInput}
                  onChange={(e) => setHomeownerInput(e.target.value)}
                  placeholder="e.g. robert.sterling@example.com or 903-555-0198"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm disabled:opacity-50"
              >
                <span>Access My Roof Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 border-t border-slate-900 text-center">
                <button
                  type="button"
                  onClick={() => onNavigate('/')}
                  className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Public Website</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleStaffLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Staff Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="TheRoofingDrs@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm disabled:opacity-50"
              >
                <span>Sign In to Operations</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 border-t border-slate-900 text-center">
                <button
                  type="button"
                  onClick={() => onNavigate('/')}
                  className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Public Website</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // 2. Unauthorized Role State
  if (!allowedRoles.includes(currentUser.role)) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-950 border border-red-900/60 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-red-950 border border-red-800 text-red-400 mx-auto flex items-center justify-center mb-2">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">
              Access Restricted
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your active account (<span className="font-mono text-red-400 font-bold">{currentUser.role}</span>) does not have authorization to access {experienceName}.
            </p>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs space-y-3">
            <div className="space-y-2">
              {currentUser.role === 'HOMEOWNER' && (
                <button
                  onClick={() => onNavigate('/portal/my-roof')}
                  className="w-full py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Go to My Homeowner Portal</span>
                </button>
              )}

              <button
                onClick={() => {
                  signOut();
                  onNavigate('/');
                }}
                className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>

              <button
                onClick={() => onNavigate('/')}
                className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Return to Public Website</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authorized — Render Protected View
  return <>{children}</>;
};
