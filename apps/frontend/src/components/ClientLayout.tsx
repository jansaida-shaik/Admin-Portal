'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import dynamic from 'next/dynamic';

const Sidebar = dynamic(() => import('@/components/Sidebar'), { 
  ssr: false,
  loading: () => <div style={{ width: '84px', height: '100%', background: 'rgba(255,255,255,0.01)' }} />
});

const Topbar = dynamic(() => import('@/components/Topbar'), { 
  ssr: false,
  loading: () => <div style={{ height: '80px', background: 'rgba(255,255,255,0.01)' }} />
});
import { useTheme } from '@/context/ThemeContext';

export default function ClientLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useAuth();
  const { theme } = useTheme();

  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (status === 'unauthenticated' && !isLoginPage) {
      router.push('/login');
    }
  }, [status, isLoginPage, router]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const mediaQuery = window.matchMedia('(max-width: 960px)');
    const syncViewport = (event) => {
      const mobileViewport = event.matches;
      setIsMobile(mobileViewport);
      setIsSidebarVisible(!mobileViewport);

      if (mobileViewport) {
        setIsSidebarOpen(true);
      }
    };

    syncViewport(mediaQuery);
    mediaQuery.addEventListener('change', syncViewport);

    return () => mediaQuery.removeEventListener('change', syncViewport);
  }, []);

  useEffect(() => {
    if (!isMobile) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = isSidebarVisible ? 'hidden' : '';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobile, isSidebarVisible]);

  if (status === 'loading') {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: '#09090b', fontFamily: 'sans-serif' }}>Loading System...</div>;
  }

  if (status === 'unauthenticated' && !isLoginPage) {
    return null;
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  const sidebarWidth = isMobile ? 'min(84vw, 320px)' : (isSidebarOpen ? '260px' : '84px');
  const toggleSidebar = () => {
    if (isMobile) {
      setIsSidebarVisible((currentValue) => !currentValue);
      return;
    }

    setIsSidebarOpen((currentValue) => !currentValue);
  };

  return (
    <div className="app-shell" style={{
      display: 'flex',
      height: '100dvh',
      width: '100%',
      background: 'transparent',
      overflow: 'hidden',
      color: 'var(--text-head)',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: isMobile ? '0' : '16px 20px 20px 20px',
      boxSizing: 'border-box',
      position: 'fixed',
      inset: 0,
    }}>
      <div className="glass-frame app-shell__frame" style={{
        flex: 1,
        display: 'flex',
        borderRadius: isMobile ? '0' : '24px',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {isMobile && isSidebarVisible && (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setIsSidebarVisible(false)}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(3, 6, 11, 0.62)',
              border: 'none',
              padding: 0,
              zIndex: 30,
              cursor: 'pointer',
            }}
          />
        )}

        {/* 1. Slim/Expandable Sidebar Column */}
        <div className="app-shell__sidebar" style={{
          width: sidebarWidth,
          transition: isMobile
            ? 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)'
            : 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          flexShrink: 0,
          height: '100%',
          borderRight: '1px solid var(--border-main)',
          background: isMobile ? 'var(--bg-glass)' : 'rgba(255,255,255,0.01)',
          backdropFilter: isMobile ? 'blur(40px)' : 'none',
          WebkitBackdropFilter: isMobile ? 'blur(40px)' : 'none',
          overflow: 'hidden',
          position: isMobile ? 'absolute' : 'relative',
          inset: isMobile ? '0 auto 0 0' : 'auto',
          zIndex: isMobile ? 40 : 'auto',
          transform: isMobile
            ? (isSidebarVisible ? 'translateX(0)' : 'translateX(-105%)')
            : 'none',
          boxShadow: isMobile ? '0 28px 60px rgba(0, 0, 0, 0.42)' : 'none',
        }}>
           <Sidebar
             isOpen={isSidebarOpen}
             isMobile={isMobile}
             onClose={() => setIsSidebarVisible(false)}
             onToggle={toggleSidebar}
           />
        </div>

        {/* 2. Fluid Content Column */}
        <div className="app-shell__content" style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minWidth: 0,
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Integrated Topbar Nav */}
          <div className="app-shell__topbar" style={{
            minHeight: isMobile ? '72px' : '80px',
            flexShrink: 0,
            borderBottom: '1px solid var(--border-main)',
            background: 'rgba(255,255,255,0.01)',
            transition: 'background 0.2s ease',
          }}>
            <Topbar isMobile={isMobile} onOpenSidebar={toggleSidebar} />
          </div>
          
          {/* Responsive Canvas viewport — scrollbar lives here, between topbar and pagination bar */}
          <main className="app-shell__main" style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: isMobile ? '20px 16px 24px' : '32px 36px 32px 40px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(255,255,255,0.01)',
          }}>
            {children}
          </main>

          {/* Pagination bottom bar — flex sibling of main, always pinned at bottom of content column */}
          <div id="pagination-portal-root" style={{ flexShrink: 0 }} />
        </div>

      </div>
    </div>
  );
}
