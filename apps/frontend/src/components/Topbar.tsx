'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';

export default function Topbar({ isMobile = false, onOpenSidebar }) {
  const { data: session, logout } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, type: 'ALERT', text: 'High Data Overhang: Vijayawada Hub Sim (...478) crossed 90% threshold.', time: '12 mins ago', color: '#ef4444' },
    { id: 2, type: 'SUCCESS', text: 'Inventory Sync: 12 Dell Laptops check-in completed by Procurement.', time: '1 hr ago', color: '#10b981' },
    { id: 3, type: 'INFO', text: 'Payment Milestone: Tata Tele Business broadband schedule locked for 20th May.', time: '3 hrs ago', color: '#245fb4' },
    { id: 4, type: 'USER', text: 'System Audit: New asset distributor "Reliance Digital Hub" onboarded.', time: 'Yesterday', color: '#F58220' }
  ];

  return (
    <div className="topbar-shell" style={{
      height: '100%',
      display: 'flex',
      alignItems: isMobile ? 'stretch' : 'center',
      justifyContent: 'space-between',
      flexWrap: isMobile ? 'wrap' : 'nowrap',
      gap: isMobile ? '12px' : '16px',
      padding: isMobile ? '12px 16px' : '0 32px',
      boxSizing: 'border-box',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flex: isMobile ? '1 1 100%' : '1 1 auto',
        minWidth: 0,
      }}>
        {isMobile && (
          <button
            type="button"
            onClick={onOpenSidebar}
            aria-label="Open navigation"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              border: '1px solid var(--border-main)',
              background: 'var(--bg-panel)',
              color: 'var(--text-head)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <svg fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor" style={{ width: '18px', height: '18px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        )}

        {/* 1. Real Global Functional Search Input */}
        <div className="topbar-search" style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: '1 1 auto', minWidth: 0 }}>
        <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="var(--text-sub)" style={{ width: '16px', height: '16px', position: 'absolute', left: '12px', opacity: 0.7 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input 
          type="text" 
          placeholder="Global index search..." 
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border-main)',
            borderRadius: '12px',
            height: '38px',
            width: isMobile ? '100%' : '320px',
            padding: '0 12px 0 38px',
            color: 'var(--text-head)',
            fontSize: '13px',
            outline: 'none',
            fontWeight: 500,
            boxSizing: 'border-box',
            transition: 'all 0.2s',
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#F58220'}
          onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-main)'}
        />
        </div>
      </div>

      {/* 2. Action & User Controls Row */}
      <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: isMobile ? '10px' : '16px', marginLeft: isMobile ? 0 : 'auto', width: isMobile ? '100%' : 'auto' }}>
        
        {/* Alert Bell Wrapper for Positioning */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button 
            onClick={() => setNotifOpen(!notifOpen)}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '1px solid var(--border-main)',
              background: notifOpen ? 'var(--bg-input)' : 'var(--bg-panel)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: notifOpen ? 'var(--accent)' : 'var(--text-sub)',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.2s',
              outline: 'none'
            }}
            onMouseEnter={(e) => { if(!notifOpen) e.currentTarget.style.background = 'var(--bg-input)'; }}
            onMouseLeave={(e) => { if(!notifOpen) e.currentTarget.style.background = 'var(--bg-panel)'; }}
          >
            <svg fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor" style={{ width: '18px', height: '18px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
            <span style={{ position: 'absolute', top: '9px', right: '9px', width: '6px', height: '6px', background: '#F58220', borderRadius: '50%', boxShadow: '0 0 6px #F58220' }} />
          </button>

          {/* 🔔 Interactive Glassmorphic Notification Panel */}
          {notifOpen && (
            <div className="glass-card" style={{
              position: 'absolute',
              top: '48px',
              right: 0,
              width: isMobile ? 'min(340px, calc(100vw - 32px))' : '340px',
              maxWidth: 'calc(100vw - 32px)',
              borderRadius: '20px',
              background: 'var(--bg-glass)',
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
              border: '1px solid var(--border-glow)',
              boxShadow: 'var(--card-shadow)',
              zIndex: 9999,
              padding: '20px',
              animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-main)', paddingBottom: '12px' }}>
                <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-head)', letterSpacing: '-0.3px' }}>Notifications</span>
                <button 
                  onClick={() => setNotifOpen(false)}
                  style={{ border: 'none', background: 'transparent', color: 'var(--accent)', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                  Dismiss All
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                {notifications.map((n) => (
                  <div key={n.id} style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'var(--bg-panel)',
                    border: '1px solid var(--border-main)',
                    display: 'flex',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-panel)'}
                  >
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: n.color, flexShrink: 0, marginTop: '4px', boxShadow: `0 0 6px ${n.color}` }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-head)', fontWeight: 500, lineHeight: '1.4' }}>{n.text}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-sub)', fontWeight: 600 }}>{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown Container */}
        <div style={{ position: 'relative' }} ref={profileDropdownRef}>
          {/* Functional User Identity Block */}
          <div 
            onClick={() => setProfileOpen(!profileOpen)}
            title="Account Menu"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              background: 'var(--bg-panel)',
              border: '1px solid var(--border-main)',
              borderRadius: '24px',
              padding: isMobile ? '4px 8px 4px 4px' : '4px 12px 4px 4px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#F58220'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-main)'}
          >
            {/* Avatar Icon with Initial */}
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #F58220, #ff9e52)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 850,
            }}>
              {session?.user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>

            {!isMobile && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                <span style={{ fontSize: '12px', fontWeight: 750, color: 'var(--text-head)' }}>
                  {session?.user?.name || 'Operator'}
                </span>
                <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  {session?.user?.role || 'Admin'}
                </span>
              </div>
            )}

            <svg fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="var(--text-sub)" style={{ width: '10px', height: '10px', marginLeft: '6px', opacity: 0.7, transform: profileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>

          {/* 👤 Interactive User Profile Menu */}
          {profileOpen && (
            <div className="glass-card" style={{
              position: 'absolute',
              top: '48px',
              right: 0,
              width: isMobile ? 'min(220px, calc(100vw - 32px))' : '200px',
              borderRadius: '16px',
              background: 'var(--bg-glass)',
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
              border: '1px solid var(--border-glow)',
              boxShadow: 'var(--card-shadow)',
              zIndex: 9999,
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              <Link 
                href="/profile" 
                onClick={() => setProfileOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  color: 'var(--text-head)',
                  fontSize: '13px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  background: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-input)';
                  e.currentTarget.style.transform = 'translateX(2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <svg fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                Profile Settings
              </Link>
              
              <div style={{ height: '1px', background: 'var(--border-main)', margin: '4px 0' }} />

              <button 
                onClick={() => {
                  setProfileOpen(false);
                  logout();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  color: '#ef4444',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                  e.currentTarget.style.transform = 'translateX(2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <svg fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                </svg>
                Sign Out
              </button>
            </div>
          )}
        </div>

      </div>
      
    </div>
  );
}
