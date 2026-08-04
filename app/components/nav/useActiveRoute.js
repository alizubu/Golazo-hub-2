'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function useActiveRoute() {
  const nextPathname = usePathname();
  const [pathname, setPathname] = useState(
    nextPathname || (typeof window !== 'undefined' ? window.location.pathname : '')
  );
  const [prevNextPathname, setPrevNextPathname] = useState(nextPathname);

  // Sync state during render when nextPathname changes (avoids cascading effect renders)
  if (nextPathname !== prevNextPathname) {
    setPrevNextPathname(nextPathname);
    setPathname(nextPathname || (typeof window !== 'undefined' ? window.location.pathname : ''));
  }

  useEffect(() => {
    const handlePop = () => setPathname(window.location.pathname);
    const handleTabChange = (e) => {
      if (e.detail) {
        setPathname('/' + e.detail.replace(/^\/+/, ''));
      }
    };
    
    window.addEventListener('popstate', handlePop);
    window.addEventListener('tab-change', handleTabChange);
    return () => {
      window.removeEventListener('popstate', handlePop);
      window.removeEventListener('tab-change', handleTabChange);
    };
  }, []);

  const isActive = (href, matchRoot = false) => {
    return matchRoot ? pathname === href : pathname.startsWith(href);
  };

  const handleNav = (e, href) => {
    e.preventDefault();
    const tabPath = href.replace(/^\/+/, '');
    window.history.pushState(null, '', `/${tabPath}`);
    window.dispatchEvent(new CustomEvent('tab-change', { detail: tabPath }));
  };

  return { pathname, isActive, handleNav };
}
