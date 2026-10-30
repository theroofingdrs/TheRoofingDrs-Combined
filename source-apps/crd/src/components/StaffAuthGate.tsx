import React, { useEffect, useState } from 'react';
import { Lock, LogOut, ShieldCheck } from 'lucide-react';
import { CrdLogo } from './CrdLogo';

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY || '';
const STAFF_EMAIL = 'theroofingdrs@gmail.com';
const TOKEN_KEY = 'roof_docs_access_token';

export const StaffAuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState('');
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState(STAFF_EMAIL);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const verifySession = async (candidate: string) => {
    if (!SUPABASE_URL || !SUPABASE_KEY || !candidate) return false;
    try {
      const response = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/user`, {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${candidate}` },
      });
      if (!response.ok) return false;
      const user = await response.json();
      return user?.email?.toLowerCase() === STAFF_EMAIL;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    let active = true;
    const existing = localStorage.getItem(TOKEN_KEY) || '';
    if (!existing) {
      setChecking(false);
      return () => { active = false; };
    }
    verifySession(existing).then((valid) => {
      if (!active) return;
      if (valid) setToken(existing);
      else {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('roof_docs_active_user');
      }
      setChecking(false);
    });
    return () => { active = false; };
  }, []);

  const signIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (email.trim().toLowerCase() !== STAFF_EMAIL) {
      setError('This account is not authorized for staff administration.');
      return;
    }
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      setError('Staff authentication is not configured. Contact the site administrator.');
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: SUPABASE_KEY },
        body: JSON.stringify({ email: STAFF_EMAIL, password }),
      });
      const result = await response.json();
      if (!response.ok || !result.access_token || result.user?.email?.toLowerCase() !== STAFF_EMAIL) {
        setError(result.error_description || result.msg || 'Email or password is incorrect.');
        return;
      }
      localStorage.setItem(TOKEN_KEY, result.access_token);
      localStorage.setItem('roof_docs_active_user', JSON.stringify({ id: result.user.id, email: result.user.email }));
      setToken(result.access_token);
      setPassword('');
    } catch {
      setError('Unable to reach the authentication service. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('roof_docs_active_user');
    setToken('');
  };

  if (checking) {
    return <div className="min-h-screen bg-[#090d16] text-slate-300 flex items-center justify-center">Verifying staff session…</div>;
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex items-center justify-center p-4">
        <form onSubmit={signIn} className="w-full max-w-md bg-[#0e1422] border border-slate-800 rounded-xl p-7 space-y-5 shadow-2xl">
          <div className="flex justify-center"><CrdLogo variant="full" theme="dark" className="h-12 w-auto" /></div>
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider"><Lock className="w-4 h-4" /> Staff Authentication Required</div>
            <h1 className="text-2xl font-black uppercase text-white">Commercial Staff Portal</h1>
            <p className="text-sm text-slate-400">Sign in with your authorized company staff credentials.</p>
          </div>
          {error && <div role="alert" className="rounded-lg border border-red-800 bg-red-950/50 p-3 text-sm text-red-200">{error}</div>}
          <label className="block text-xs font-semibold text-slate-300 space-y-1">
            <span>Staff email</span>
            <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-3 text-white" />
          </label>
          <label className="block text-xs font-semibold text-slate-300 space-y-1">
            <span>Password</span>
            <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-3 text-white" />
          </label>
          <button type="submit" disabled={submitting} className="w-full rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-60 px-4 py-3 text-sm font-black uppercase text-slate-950">
            {submitting ? 'Verifying…' : 'Sign In'}
          </button>
          <p className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1"><ShieldCheck className="w-3 h-3" /> Protected by Supabase authentication</p>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-[#090d16] border-b border-slate-800 px-4 py-2 flex justify-end">
        <button type="button" onClick={signOut} className="inline-flex items-center gap-2 text-xs text-slate-300 hover:text-white"><LogOut className="w-3.5 h-3.5" /> Sign out</button>
      </div>
      {children}
    </div>
  );
};
