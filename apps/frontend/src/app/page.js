'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';

const DashIcons = {
  Folder: () => <svg fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: '24px', height: '24px', color: '#245fb4' }}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-19.5 0A2.25 2.25 0 0 0 4.5 15h15a2.25 2.25 0 0 0 2.25-2.25m-19.5 0v.25A2.25 2.25 0 0 0 4.5 15.25h15a2.25 2.25 0 0 0 2.25-2.25v-.25" /></svg>,
  Briefcase: () => <svg fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: '24px', height: '24px', color: '#fbbf24' }}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25" /></svg>,
  Cube: () => <svg fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: '24px', height: '24px', color: '#34d399' }}><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25" /></svg>,
  Cog: () => <svg fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: '24px', height: '24px', color: '#94a3b8' }}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>,
  User: () => <svg fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: '11px', height: '11px', color: 'var(--text-sub)' }}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
};

export default function GlassInventoryDashboard() {
  const { data: session } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('List View');

  // Core Inventory Data
  const totalAssets = 1248;
  const assignedCount = 984;
  const availableCount = totalAssets - assignedCount;
  const assignedRatio = Math.round((assignedCount / totalAssets) * 100); // ~79%

  // Design Tokens adapted from Noteflow/Codegnan
  const accentColor = '#F58220'; // Main coral-orange
  const cardBg = 'var(--bg-panel, rgba(255, 255, 255, 0.9))';
  const borderMain = 'var(--border-main, rgba(0, 0, 0, 0.05))';
  const textPrimary = 'var(--text-head, #0f172a)';
  const textSecondary = 'var(--text-sub, #64748b)';

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '28px',
      background: 'transparent',
      color: textPrimary,
      fontFamily: '"Outfit", "Inter", system-ui, sans-serif',
      boxSizing: 'border-box',
      opacity: 1,
      transform: 'translateY(0)',
      transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      
      {/* 1. Top Greeting & Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 800, 
          letterSpacing: '-0.03em', 
          color: 'var(--text-head)',
          margin: 0 
        }}>
          Good morning, {session?.user?.name || 'Operator'}
        </h1>
        <p style={{ color: textSecondary, fontSize: '14px', fontWeight: 500 }}>
          Stay on top of your assets, monitor global metrics, and track assignment logs.
        </p>
      </div>


      {/* 3. Wide Micro-Metric Cards Grid (Noteflow Mockup Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: `${totalAssets.toLocaleString()} Items`, sub: 'Total Registry', icon: DashIcons.Folder, bg: '#e0f2fe' },
          { title: `${assignedCount.toLocaleString()} Units`, sub: 'Active Allocation', icon: DashIcons.Briefcase, bg: '#fef3c7' },
          { title: `${availableCount.toLocaleString()} Assets`, sub: 'Available In Stock', icon: DashIcons.Cube, bg: '#dcfce7' },
          { title: '49 Devices', sub: 'Under Servicing', icon: DashIcons.Cog, bg: '#f1f5f9' },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
          <div key={i} className="glass-card" style={{
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'transform 0.2s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'var(--bg-input)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--text-head)' }}>{card.title}</h4>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', fontWeight: 600, color: textSecondary }}>{card.sub}</p>
              </div>
            </div>
            <div style={{ color: textSecondary, fontSize: '18px', cursor: 'pointer' }}>⋮</div>
          </div>
          );
        })}
      </div>

      {/* 4. Sub-Navigation Tabs & Primary Sub-Bar Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '8px',
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Telemetry Console</h3>
          <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: textSecondary }}>System metrics and deployment logs.</p>
        </div>

        {/* Right Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>

          {/* Main Create Button */}
          <Link href="/assets/new" style={{ textDecoration: 'none' }}>
            <button style={{
              background: 'var(--text-head)',
              color: 'var(--bg-panel)',
              border: 'none',
              borderRadius: '100px',
              padding: '8px 18px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = 0.9}
            onMouseLeave={(e) => e.currentTarget.style.opacity = 1}
            >
              <span style={{ fontSize: '14px', lineHeight: 0 }}>+</span> Procure Unit
            </button>
          </Link>
        </div>
      </div>

      {/* 5. Primary Fluid Dashboard Workspace (Grid Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* LEFT COLUMN (Spline Curve + Connections Grid) */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          
          {/* Spline Curve Dashboard Visualization */}
          <div className="glass-card" style={{
            borderRadius: '20px',
            padding: '24px',
            position: 'relative',
            height: '360px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Chart Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>Procurement Activity Flow</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: textSecondary }}>Dynamic asset influx tracker.</p>
              </div>
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                background: 'var(--bg-input)',
                padding: '4px 12px',
                borderRadius: '10px',
              }}>
                Past 30 Days
              </div>
            </div>

            {/* Dynamic Peach Spline Curve container */}
            <div style={{ flex: 1, minHeight: 0, position: 'relative', marginTop: '16px', display: 'flex', flexDirection: 'column' }}>
              {/* Background Grid Lines */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', opacity: 0.4 }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} style={{ width: '100%', borderTop: '1px dashed var(--border-main)', height: 0 }} />
                ))}
              </div>

              {/* SVG Vector Canvas */}
              <svg viewBox="0 0 600 180" preserveAspectRatio="none" style={{ width: '100%', flex: 1, minHeight: 0, position: 'relative', zIndex: 2 }}>
                <defs>
                  <linearGradient id="coralGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={accentColor} stopOpacity="0.2" />
                    <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Filled reflection curve */}
                <path d="M0,140 C100,120 150,40 250,80 C350,120 400,20 500,50 C550,65 600,30 600,30 L600,180 L0,180 Z" fill="url(#coralGrad)" />
                {/* Bolder Peach Curve */}
                <path d="M0,140 C100,120 150,40 250,80 C350,120 400,20 500,50 C550,65 600,30 600,30" fill="none" stroke={accentColor} strokeWidth="4" strokeLinecap="round" style={{ filter: `drop-shadow(0 4px 8px rgba(255, 90, 31, 0.2))` }} />

                {/* Central Vector Node Circle */}
                <circle cx="250" cy="80" r="5" fill={accentColor} stroke="var(--bg-panel)" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 6px rgba(255, 90, 31, 0.4))' }} />
              </svg>

              {/* SVG Timeline Label Grid */}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: textSecondary, fontSize: '11px', marginTop: '12px', fontWeight: 700 }}>
                <span>Week 1</span>
                <span>Week 2</span>
                <span>Week 3</span>
                <span>Week 4</span>
              </div>
            </div>
          </div>

          {/* Row components beneath graph */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Node Providers */}
            <div className="glass-card" style={{
              borderRadius: '20px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800 }}>Distribution Nodes</h4>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: textSecondary }}>Active logistics partners.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { name: 'Azure Stack Registry', load: '92%', c: '#245fb4' },
                  { name: 'FedEx Logistic Node', load: '74%', c: '#c084fc' },
                  { name: 'Codegnan Intranet Hub', load: '61%', c: '#4ade80' },
                ].map((node, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'var(--bg-input)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: node.c }} />
                      <span style={{ fontSize: '12px', fontWeight: 650 }}>{node.name}</span>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: textSecondary }}>{node.load}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ratios Deployment Gauge */}
            <div className="glass-card" style={{
              borderRadius: '20px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800 }}>Allocation Weight</h4>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: textSecondary }}>System assignment ratio.</p>
              </div>

              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                padding: '8px 0',
              }}>
                <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                  <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <circle cx="18" cy="18" r="16" fill="none" stroke="var(--border-main)" strokeWidth="3.5" />
                    <circle cx="18" cy="18" r="16" fill="none" stroke={accentColor} strokeWidth="3.5" strokeDasharray="100" strokeDashoffset={100 - assignedRatio} strokeLinecap="round" style={{ filter: `drop-shadow(0 2px 6px rgba(255,90,31,0.25))` }} />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 900 }}>
                    {assignedRatio}%
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (Live Updates Task Board Style) */}
        <div className="lg:col-span-1 flex flex-col gap-5">
          
          {/* Live Audit Action Feed */}
          <div className="glass-card" style={{
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            flex: 1,
            boxSizing: 'border-box',
          }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>Audit Action Log</h4>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: textSecondary }}>Recent live operational events.</p>
            </div>

            {/* High-Fidelity Task/Row Cards representing recent operations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { event: 'Laptop Unit Assigned', entity: 'MacBook Pro M2', user: 'Alice Smith', stat: 'Low', tc: '#10b981', bg: '#ecfdf5' },
                { event: 'New Router Procured', entity: 'TP-Link AX6000', user: 'System Bot', stat: 'High', tc: '#ef4444', bg: '#fef2f2' },
                { event: 'License Expired', entity: 'Adobe CC 1-Year', user: 'Admin Panel', stat: 'Med', tc: '#f59e0b', bg: '#fffbeb' },
                { event: 'Employee De-provisioned', entity: 'John Doe Assets', user: 'HR Portal', stat: 'Low', tc: '#10b981', bg: '#ecfdf5' },
              ].map((item, idx) => (
                <div key={idx} style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-main)',
                  borderRadius: '14px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'transform 0.2s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      color: item.tc,
                      background: item.bg,
                      padding: '2px 8px',
                      borderRadius: '100px',
                    }}>
                      {item.stat}
                    </span>
                    <span style={{ fontSize: '10px', color: textSecondary, fontWeight: 600 }}>Just Now</span>
                  </div>

                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 750, color: 'var(--text-head)' }}>{item.event}</div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: textSecondary, marginTop: '2px' }}>{item.entity}</div>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    marginTop: '4px',
                    paddingTop: '8px', 
                    borderTop: '1px solid var(--border-main)' 
                  }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-head)' }}>By {item.user}</span>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--bg-panel)', border: '1px solid var(--border-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <DashIcons.User />
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
