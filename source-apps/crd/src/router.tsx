import React, { createContext, useContext, useState, useEffect } from 'react';

interface RouterContextType {
  currentPath: string;
  navigate: (path: string) => void;
}

const RouterContext = createContext<RouterContextType>({
  currentPath: '/',
  navigate: () => {},
});

export const useRouter = () => useContext(RouterContext);

// The combined site mounts the commercial app below /commercial/.
// Keep the app's route table root-relative while preserving that public URL prefix.
const COMMERCIAL_BASE_PATH = '/commercial';

const getAppPath = (pathname: string) => {
  if (pathname === COMMERCIAL_BASE_PATH) return '/';
  if (pathname.startsWith(`${COMMERCIAL_BASE_PATH}/`)) {
    return pathname.slice(COMMERCIAL_BASE_PATH.length) || '/';
  }
  return pathname || '/';
};

const getBrowserPath = (path: string) => {
  const isMountedUnderCommercial =
    window.location.pathname === COMMERCIAL_BASE_PATH ||
    window.location.pathname.startsWith(`${COMMERCIAL_BASE_PATH}/`);
  if (!isMountedUnderCommercial) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${COMMERCIAL_BASE_PATH}${normalizedPath === '/' ? '/' : normalizedPath}`;
};

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return getAppPath(window.location.pathname);
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(getAppPath(window.location.pathname));
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (path === currentPath) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const browserPath = getBrowserPath(path);
    window.history.pushState({}, '', browserPath);
    setCurrentPath(getAppPath(browserPath));
    window.scrollTo(0, 0);
  };

  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  className?: string;
  children: React.ReactNode;
  id?: string;
}

export const Link: React.FC<LinkProps> = ({ to, className, children, onClick, id, ...rest }) => {
  const { navigate, currentPath } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (!e.defaultPrevented && !e.metaKey && !e.ctrlKey && !e.shiftKey && !to.startsWith('http') && !to.startsWith('tel:') && !to.startsWith('mailto:')) {
      e.preventDefault();
      navigate(to);
    }
  };

  const isActive = currentPath === to;

  return (
    <a
      id={id}
      href={to}
      onClick={handleClick}
      className={`${className || ''} ${isActive ? 'active-link' : ''}`}
      {...rest}
    >
      {children}
    </a>
  );
};
