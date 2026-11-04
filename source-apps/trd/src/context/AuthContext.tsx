/**
 * The Roof Doctors — RBAC & Authentication Context
 * Manages user session, role-based access control, and route permissions.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, UserRole, Permission } from '../../shared/types/index.ts';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  OWNER: [
    'VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT', 'APPROVE', 'SEND',
    'MANAGE_FINANCIAL', 'MANAGE_CUSTOMERS', 'MANAGE_USERS', 'MANAGE_SETTINGS',
    'MANAGE_INTEGRATIONS', 'MANAGE_CONTENT', 'MANAGE_AUTOMATIONS'
  ],
  ADMINISTRATOR: [
    'VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT', 'APPROVE', 'SEND',
    'MANAGE_FINANCIAL', 'MANAGE_CUSTOMERS', 'MANAGE_USERS', 'MANAGE_SETTINGS',
    'MANAGE_INTEGRATIONS', 'MANAGE_CONTENT', 'MANAGE_AUTOMATIONS'
  ],
  SALES: ['VIEW', 'CREATE', 'EDIT', 'SEND', 'MANAGE_CUSTOMERS', 'EXPORT'],
  OFFICE: ['VIEW', 'CREATE', 'EDIT', 'SEND', 'MANAGE_CUSTOMERS'],
  INSPECTOR: ['VIEW', 'CREATE', 'EDIT', 'SEND'],
  PRODUCTION: ['VIEW', 'CREATE', 'EDIT', 'APPROVE'],
  PROJECT_MANAGER: ['VIEW', 'CREATE', 'EDIT', 'APPROVE', 'SEND'],
  MARKETING: ['VIEW', 'CREATE', 'EDIT', 'MANAGE_CONTENT', 'EXPORT'],
  CUSTOMER_SUPPORT: ['VIEW', 'CREATE', 'EDIT', 'SEND', 'MANAGE_CUSTOMERS'],
  CREW: ['VIEW'],
  SUBCONTRACTOR: ['VIEW'],
  HOMEOWNER: ['VIEW'],
};

export const PRESET_USERS: Record<UserRole, User> = {
  OWNER: {
    id: 'usr_owner_admin',
    email: 'theroofingdrs@gmail.com',
    name: 'Dr. Roof (Owner / Principal)',
    role: 'OWNER',
    permissions: ROLE_PERMISSIONS.OWNER,
    active: true,
    mfaEnabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  ADMINISTRATOR: {
    id: 'usr_admin_ops',
    email: 'ops@theroofdoctors.com',
    name: 'General Manager',
    role: 'ADMINISTRATOR',
    permissions: ROLE_PERMISSIONS.ADMINISTRATOR,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  SALES: {
    id: 'usr_sales_1',
    email: 'sales@theroofdoctors.com',
    name: 'Dan Walker (Estimator)',
    role: 'SALES',
    permissions: ROLE_PERMISSIONS.SALES,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  INSPECTOR: {
    id: 'usr_inspector_1',
    email: 'inspector@theroofdoctors.com',
    name: 'Marcus Bell (Diagnostic Inspector)',
    role: 'INSPECTOR',
    permissions: ROLE_PERMISSIONS.INSPECTOR,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  OFFICE: {
    id: 'usr_office_1',
    email: 'dispatch@theroofdoctors.com',
    name: 'Sarah Evans (Office Dispatch)',
    role: 'OFFICE',
    permissions: ROLE_PERMISSIONS.OFFICE,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  PRODUCTION: {
    id: 'usr_prod_1',
    email: 'production@theroofdoctors.com',
    name: 'Carlos Ruiz (Production Supt.)',
    role: 'PRODUCTION',
    permissions: ROLE_PERMISSIONS.PRODUCTION,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  PROJECT_MANAGER: {
    id: 'usr_pm_1',
    email: 'pm@theroofdoctors.com',
    name: 'Jason Reed (Project Manager)',
    role: 'PROJECT_MANAGER',
    permissions: ROLE_PERMISSIONS.PROJECT_MANAGER,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  MARKETING: {
    id: 'usr_mkt_1',
    email: 'marketing@theroofdoctors.com',
    name: 'Emily Vance (Marketing Lead)',
    role: 'MARKETING',
    permissions: ROLE_PERMISSIONS.MARKETING,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  CUSTOMER_SUPPORT: {
    id: 'usr_support_1',
    email: 'support@theroofdoctors.com',
    name: 'Tyler Hayes (Customer Support)',
    role: 'CUSTOMER_SUPPORT',
    permissions: ROLE_PERMISSIONS.CUSTOMER_SUPPORT,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  CREW: {
    id: 'usr_crew_1',
    email: 'crew@theroofdoctors.com',
    name: 'Lead Crew Foreman',
    role: 'CREW',
    permissions: ROLE_PERMISSIONS.CREW,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  SUBCONTRACTOR: {
    id: 'usr_sub_1',
    email: 'sub@gutterpro.com',
    name: 'Seamless Gutters Subcontractor',
    role: 'SUBCONTRACTOR',
    permissions: ROLE_PERMISSIONS.SUBCONTRACTOR,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  HOMEOWNER: {
    id: 'usr_homeowner_demo',
    email: 'homeowner@example.com',
    name: 'Robert & Clara Sterling',
    role: 'HOMEOWNER',
    permissions: ROLE_PERMISSIONS.HOMEOWNER,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  signInAsRole: (role: UserRole) => void;
  signOut: () => void;
  loginStaff: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginHomeowner: (identifier: string) => { success: boolean; error?: string };
  hasRole: (allowedRoles: UserRole[]) => boolean;
  hasPermission: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Default to null (anonymous visitor) for authentic public site visitor experience
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY || '';

  useEffect(() => {
    const token = localStorage.getItem('roof_docs_access_token');
    if (!token || !supabaseUrl || !supabaseAnonKey) return;
    fetch(`${supabaseUrl}/auth/v1/user`, { headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${token}` } })
      .then(async (response) => response.ok ? response.json() : null)
      .then((authUser) => {
        if (authUser?.email?.toLowerCase() === 'theroofingdrs@gmail.com') {
          const owner = { ...PRESET_USERS.OWNER, id: authUser.id, email: authUser.email };
          setCurrentUser(owner);
          localStorage.setItem('roof_docs_active_user', JSON.stringify(owner));
        } else {
          localStorage.removeItem('roof_docs_access_token');
          localStorage.removeItem('roof_docs_active_user');
        }
      })
      .catch(() => { localStorage.removeItem('roof_docs_access_token'); localStorage.removeItem('roof_docs_active_user'); });
  }, []);

  // Demo role switching is intentionally disabled. Staff must authenticate with Supabase.
  const signInAsRole = (_role: UserRole) => {
    setCurrentUser(null);
    localStorage.removeItem('roof_docs_active_user');
    localStorage.removeItem('roof_docs_access_token');
  };

  const loginStaff = async (email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail !== 'theroofingdrs@gmail.com') {
      return { success: false, error: 'This account is not authorized for staff administration.' };
    }
    if (!password) return { success: false, error: 'Enter your password.' };
    if (!supabaseUrl || !supabaseAnonKey) {
      return { success: false, error: 'Authentication is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.' };
    }
    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: supabaseAnonKey },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const result = await response.json();
      if (!response.ok || !result.access_token || result.user?.email?.toLowerCase() !== cleanEmail) {
        return { success: false, error: result.error_description || result.msg || 'Email or password is incorrect.' };
      }
      const owner = { ...PRESET_USERS.OWNER, id: result.user.id, email: result.user.email };
      localStorage.setItem('roof_docs_access_token', result.access_token);
      localStorage.setItem('roof_docs_active_user', JSON.stringify(owner));
      setCurrentUser(owner);
      return { success: true };
    } catch {
      return { success: false, error: 'Unable to reach the authentication service. Please try again.' };
    }
  };

  const loginHomeowner = (identifier: string) => {
    const clean = identifier.trim().toLowerCase().replace(/[^a-z0-9@.]/g, '');
    if (!clean) {
      return { success: false, error: 'Please enter the email address or phone number on your file.' };
    }

    // Check for homeowner identifier match
    const validHomeownerIdentifiers = [
      'homeowner@example.com',
      'robert.sterling@example.com',
      'robert@example.com',
      '9035550198',
      '903-555-0198',
      'sterling',
    ];

    if (validHomeownerIdentifiers.some((v) => clean.includes(v.replace(/[^a-z0-9@.]/g, '')))) {
      const homeowner = PRESET_USERS.HOMEOWNER;
      setCurrentUser(homeowner);
      localStorage.setItem('roof_docs_active_user', JSON.stringify(homeowner));
      return { success: true };
    }

    return {
      success: false,
      error: 'No active homeowner account found for this contact. Please call 903-231-5940 for assistance or request a diagnostic inspection.',
    };
  };

  const signOut = () => {
    setCurrentUser(null);
    localStorage.removeItem('roof_docs_active_user');
    localStorage.removeItem('roof_docs_access_token');
  };

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (!currentUser) return false;
    return allowedRoles.includes(currentUser.role);
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!currentUser) return false;
    return currentUser.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: currentUser !== null,
        signInAsRole,
        loginStaff,
        loginHomeowner,
        signOut,
        hasRole,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
