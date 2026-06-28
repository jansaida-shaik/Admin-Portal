'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';

const Icons = {
  Dashboard: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '24px', height: '24px' }}>
      <path d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" fill="currentColor" fillOpacity="0.25" strokeWidth="0" />
      <path d="M14 12a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" fill="currentColor" fillOpacity="0.25" strokeWidth="0" />
      <path strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 12a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" />
    </svg>
  ),
  Analytics: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '24px', height: '24px' }}>
      <path d="M12 20V10M18 20V4M6 20v-6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 10a2 2 0 100-4 2 2 0 000 4zM18 4a2 2 0 100-4 2 2 0 000 4zM6 14a2 2 0 100-4 2 2 0 000 4z" fill="currentColor" fillOpacity="0.25" strokeWidth="0" />
    </svg>
  ),
  Directory: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '24px', height: '24px' }}>
      <path d="M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" fill="currentColor" fillOpacity="0.25" strokeWidth="0" />
      <path strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
  ),
  Vendors: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '24px', height: '24px' }}>
      <path d="M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" fill="currentColor" fillOpacity="0.25" strokeWidth="0" />
      <path strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Employees: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '24px', height: '24px' }}>
      <path d="M12 4.354a4 4 0 110 5.292" fill="currentColor" fillOpacity="0.25" strokeWidth="0" />
      <circle cx="9" cy="7" r="3" fill="currentColor" fillOpacity="0.25" strokeWidth="0" />
      <path strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Stock: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '24px', height: '24px' }}>
      <path d="M12 3L4 7l8 4 8-4-8-4z" fill="currentColor" fillOpacity="0.25" strokeWidth="0" />
      <path strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14v4m0 0l8 4m-8-4L4 11m8-4v10l-8-4m0-10v10l8 4" />
    </svg>
  ),
  Mobile: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '24px', height: '24px' }}>
      <path d="M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" fill="currentColor" fillOpacity="0.25" strokeWidth="0" />
      <path strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  Dollar: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '24px', height: '24px' }}>
      <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" fill="currentColor" fillOpacity="0.25" strokeWidth="0" />
      <path strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
    </svg>
  ),
  Audit: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '24px', height: '24px' }}>
      <path d="M5 7a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V7z" fill="currentColor" fillOpacity="0.25" strokeWidth="0" />
      <path strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
};

export default function Sidebar({ isOpen, onToggle, isMobile = false, onClose }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const showExpanded = isMobile || isOpen;

  const items = [
    { n: 'Dashboard', p: '/', i: Icons.Dashboard },
    { n: 'System Telemetry', p: '/analytics', i: Icons.Analytics },
    { n: 'Directory', p: '/assets', i: Icons.Directory },
    { n: 'Vendors', p: '/vendors', i: Icons.Vendors },
    { n: 'Employees', p: '/employees', i: Icons.Employees },
    { n: 'Mobile Numbers', p: '/mobile-numbers', i: Icons.Mobile },
    { n: 'Internet Bills', p: '/internet-bills', i: Icons.Dollar },
    { n: 'Stock Movement', p: '/assets/new', i: Icons.Stock },
    { n: 'Audit Log', p: '/transactions', i: Icons.Audit },
  ];

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      position: 'relative',
      width: '100%',
    }}>
      
      {/* Header with Brand Logo & Dynamic Collapse Toggle Button */}
      <div style={{
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: showExpanded ? 'space-between' : 'center',
        padding: showExpanded ? '0 20px 0 24px' : '0',
        borderBottom: '1px solid var(--border-main)',
        boxSizing: 'border-box',
        transition: 'all 0.3s ease',
      }}>
        {showExpanded ? (
          <>
            {/* Brand Logo Container */}
            <div style={{ 
              background: '#fff', 
              padding: '6px 12px', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-main)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              boxSizing: 'border-box',
            }}>
              <Image
                src="/CODEGNAN LOGO R mark.png"
                alt="Logo"
                width={120}
                height={32}
                priority
                style={{ width: isMobile ? '112px' : '120px', height: 'auto', display: 'block', objectFit: 'contain' }}
              />
            </div>
            
            {isMobile ? (
              <button onClick={onClose} style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-main)',
                color: 'var(--text-sub)',
                padding: '6px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s',
              }}>
                <svg fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            ) : (
              <button onClick={onToggle} style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-main)',
                color: 'var(--text-sub)',
                padding: '6px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s',
              }}>
                <svg fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
                </svg>
              </button>
            )}
          </>
        ) : (
          /* Closed State Toggle Icon / Custom Monogram */
          <div onClick={onToggle} style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <svg fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="var(--text-sub)" style={{ width: '18px', height: '18px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </div>
        )}
      </div>

      {/* Primary Navigation Rails */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: showExpanded ? '24px 16px' : '24px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: showExpanded ? 'stretch' : 'center',
        gap: '8px',
        boxSizing: 'border-box',
      }}>
        {items.map((item) => {
          const act = pathname === item.p;
          const Icon = item.i;
          
          return (
            <Link
              key={item.n}
              href={item.p}
              prefetch={true}
              title={!showExpanded ? item.n : ''}
              style={{ textDecoration: 'none' }}
              onClick={() => {
                if (isMobile && onClose) {
                  onClose();
                }
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: showExpanded ? 'flex-start' : 'center',
                gap: showExpanded ? '14px' : '0',
                padding: showExpanded ? '12px 16px' : '0',
                width: showExpanded ? 'auto' : '44px',
                height: showExpanded ? 'auto' : '44px',
                borderRadius: showExpanded ? '14px' : '50%',
                background: act ? 'var(--text-head)' : 'transparent',
                color: act ? (theme === 'light' ? '#fff' : '#000') : 'var(--text-sub)',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: act ? '0 4px 16px rgba(0,0,0,0.15)' : 'none',
                boxSizing: 'border-box',
              }}
              onMouseEnter={(e) => {
                if (!act) {
                  e.currentTarget.style.background = 'var(--bg-input)';
                  e.currentTarget.style.color = 'var(--text-head)';
                }
              }}
              onMouseLeave={(e) => {
                if (!act) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-sub)';
                }
              }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px' }}>
                  <Icon />
                </div>
                {showExpanded && (
                  <span style={{
                    fontSize: '13px',
                    fontWeight: act ? 800 : 600,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {item.n}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Theme Controls at the bottom — matches pagination bar height exactly */}
      <div style={{
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderTop: '1px solid var(--border-main)',
        marginTop: 'auto',
        boxSizing: 'border-box',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        background: 'var(--bg-pagination-transparent, rgba(10, 15, 26, 0.55))',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '4px',
          background: 'var(--bg-input)',
          border: '1px solid var(--border-main)',
          borderRadius: '12px',
          padding: '3px',
          cursor: 'pointer',
        }} onClick={toggleTheme}>
          
          {/* Sun Option */}
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '9px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: theme === 'light' ? 'var(--bg-panel)' : 'transparent',
            color: theme === 'light' ? 'var(--accent)' : 'var(--text-sub)',
            boxShadow: theme === 'light' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.3s ease',
          }}>
            <svg fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: '20px', height: '20px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
            </svg>
          </div>

          {/* Moon Option */}
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '9px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: theme === 'dark' ? 'var(--bg-panel)' : 'transparent',
            color: theme === 'dark' ? 'var(--accent)' : 'var(--text-sub)',
            boxShadow: theme === 'dark' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
            transition: 'all 0.3s ease',
          }}>
            <svg fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: '20px', height: '20px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
            </svg>
          </div>
        </div>
      </div>

    </div>
  );
}
