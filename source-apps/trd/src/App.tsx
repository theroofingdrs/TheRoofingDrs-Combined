import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext.tsx';
import { ProtectedRoute } from './components/common/ProtectedRoute.tsx';
import { PublicWebsiteView } from './views/PublicWebsiteView.tsx';
import { HomeownerPortalView } from './views/HomeownerPortalView.tsx';
import { EstimateRequestView } from './views/EstimateRequestView.tsx';

const OPERATIONS_PORTAL_URL = 'https://operations.theroofingdrs.com';
const RESIDENTIAL_BASE = '/residential';
const stripResidentialBase = (path: string) => (path.replace(/^\/residential(?=\/|$)/, '') || '/');
const withResidentialBase = (path: string) => `${RESIDENTIAL_BASE}${path === '/' ? '/' : path.startsWith('/') ? path : `/${path}`}`;

function AppContent() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return stripResidentialBase(window.location.pathname || '/');
  });

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
  const isEstimateRequestRoute = currentPath.startsWith('/estimate-request');

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Dynamic Route View */}
      <div className="flex-1">
        {isEstimateRequestRoute ? (
          <EstimateRequestView onNavigate={navigate} />
        ) : isInternalStaffRoute ? (
          <div className="min-h-[70vh] bg-slate-950 text-slate-100 flex items-center justify-center p-6">
            <div className="max-w-md w-full border border-slate-800 bg-slate-900 rounded-2xl p-8 text-center space-y-4">
              <h1 className="text-2xl font-black">Operations Portal</h1>
              <p className="text-sm text-slate-400">Staff and administrator access has moved to the secure TRD and CRD Operations Center.</p>
              <a href={OPERATIONS_PORTAL_URL} className="inline-flex items-center justify-center rounded-lg bg-red-600 hover:bg-red-700 px-5 py-3 text-sm font-bold text-white">Open Secure Operations Center</a>
            </div>
          </div>
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
