import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { RoleBar } from './components/common/RoleBar.tsx';
import { ProtectedRoute } from './components/common/ProtectedRoute.tsx';
import { PublicWebsiteView } from './views/PublicWebsiteView.tsx';
import { CrmAdminView } from './views/CrmAdminView.tsx';
import { FieldOperationsView } from './views/FieldOperationsView.tsx';
import { HomeownerPortalView } from './views/HomeownerPortalView.tsx';

const RESIDENTIAL_BASE = '/residential';
const stripResidentialBase = (path: string) => (path.replace(/^\/residential(?=\/|$)/, '') || '/');
const withResidentialBase = (path: string) => `${RESIDENTIAL_BASE}${path === '/' ? '/' : path.startsWith('/') ? path : `/${path}`}`;

function AppContent() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return stripResidentialBase(window.location.pathname || '/');
  });
  const { currentUser } = useAuth();

  const navigate = (path: string) => {
    window.history.pushState({}, '', withResidentialBase(path));
    setCurrentPath(stripResidentialBase(path));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(stripResidentialBase(window.location.pathname || '/'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const isInternalStaffRoute = currentPath.startsWith('/app') || currentPath.startsWith('/field');
  const showStaffRoleBar = isInternalStaffRoute && currentUser && currentUser.role !== 'HOMEOWNER';

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* RoleBar ONLY rendered for authenticated internal staff while working in internal operations */}
      {showStaffRoleBar && (
        <RoleBar currentPath={currentPath} onNavigate={navigate} />
      )}

      {/* Dynamic Route View */}
      <div className="flex-1">
        {currentPath.startsWith('/app') ? (
          <ProtectedRoute
            allowedRoles={[
              'OWNER',
              'ADMINISTRATOR',
              'SALES',
              'OFFICE',
              'INSPECTOR',
              'PRODUCTION',
              'PROJECT_MANAGER',
              'MARKETING',
              'CUSTOMER_SUPPORT',
            ]}
            experienceName="CRM / Operations Hub"
            onNavigate={navigate}
          >
            <CrmAdminView currentPath={currentPath} onNavigate={navigate} />
          </ProtectedRoute>
        ) : currentPath.startsWith('/field') ? (
          <ProtectedRoute
            allowedRoles={[
              'OWNER',
              'ADMINISTRATOR',
              'INSPECTOR',
              'PRODUCTION',
              'PROJECT_MANAGER',
              'CREW',
              'SUBCONTRACTOR',
            ]}
            experienceName="Field Operations"
            onNavigate={navigate}
          >
            <FieldOperationsView currentPath={currentPath} onNavigate={navigate} />
          </ProtectedRoute>
        ) : currentPath.startsWith('/portal') ? (
          <ProtectedRoute
            allowedRoles={['HOMEOWNER', 'OWNER', 'ADMINISTRATOR', 'CUSTOMER_SUPPORT']}
            experienceName="Homeowner Portal"
            onNavigate={navigate}
          >
            <HomeownerPortalView currentPath={currentPath} onNavigate={navigate} />
          </ProtectedRoute>
        ) : (
          <PublicWebsiteView
            currentPath={currentPath}
            onNavigate={navigate}
          />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
