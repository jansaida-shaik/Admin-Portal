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

  if (status === 'loading') {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: '#09090b', fontFamily: 'sans-serif' }}>Loading System...</div>;
  }

  if (status === 'unauthenticated' && !isLoginPage) {
    return null;
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      background: 'transparent',
      overflow: 'hidden',
      color: 'var(--text-head)',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '16px 20px 20px 20px', // Cinematic floating viewport padding
      boxSizing: 'border-box',
    }}>
      <div className="glass-frame" style={{
        flex: 1,
        display: 'flex',
        borderRadius: '24px', // Premium high-radius corners
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* 1. Slim/Expandable Sidebar Column */}
        <div style={{
          width: isSidebarOpen ? '260px' : '84px', // Dynamically scales for expanded drawer or sleek rail
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          flexShrink: 0,
          height: '100%',
          borderRight: '1px solid var(--border-main)',
          background: 'rgba(255,255,255,0.01)',
          overflow: 'hidden',
        }}>
           <Sidebar 
             isOpen={isSidebarOpen} 
             onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
           />
        </div>

        {/* 2. Fluid Content Column */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minWidth: 0,
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Integrated Topbar Nav */}
          <div style={{
            height: '80px',
            flexShrink: 0,
            borderBottom: '1px solid var(--border-main)',
            background: 'rgba(255,255,255,0.01)',
            transition: 'background 0.2s ease',
          }}>
            <Topbar />
          </div>
          
          {/* Responsive Canvas viewport — scrollbar lives here, between topbar and pagination bar */}
          <main style={{
            flex: 1,
            overflowY: 'scroll',
            overflowX: 'hidden',
            padding: '32px 36px 32px 40px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(255,255,255,0.01)',
            scrollbarGutter: 'stable',
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
