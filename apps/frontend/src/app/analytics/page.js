'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

// Custom mini-charting primitives for lightweight performance
function Sparkline({ data, color, height = 36 }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * 120;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width="100%" height={height} viewBox={`0 0 120 ${height}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`M0,${height} L${points} L120,${height} Z`}
        fill={`url(#grad-${color})`}
      />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export default function AnalyticsDashboard() {
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Analytical Mock Data Tailored for Codegnan Context
  const stats = [
    { 
      title: 'Total Asset Valuation', 
      value: '₹24,50,800', 
      change: '+12.5% YoY', 
      up: true, 
      sparkData: [15, 18, 17, 21, 20, 23, 24.5],
      color: '#F58220' // Official Orange
    },
    { 
      title: 'Hardware Health Index', 
      value: '94.8%', 
      change: 'Optimal Range', 
      up: true, 
      sparkData: [93.5, 94.1, 93.8, 94.2, 94.9, 94.5, 94.8],
      color: '#10b981' // Emerald Green
    },
    { 
      title: 'Active Utilities Run-Rate', 
      value: '₹84,200/mo', 
      change: '-4.2% Savings', 
      up: false, 
      sparkData: [92, 90, 89, 87, 86, 85, 84.2],
      color: '#245fb4' // Official Accent Blue
    },
    { 
      title: 'Asset Utilization Velocity', 
      value: '88.4%', 
      change: '+3.1% qtr/qtr', 
      up: true, 
      sparkData: [82, 84, 83, 86, 85, 87, 88.4],
      color: '#8b5cf6' // Purple
    }
  ];

  const branchDetails = {
    ALL: { assets: 842, valuation: '₹24.5L', activeUsers: 212 },
    HYD: { assets: 412, valuation: '₹12.8L', activeUsers: 104 },
    VIJ: { assets: 298, valuation: '₹8.1L', activeUsers: 78 },
    BLR: { assets: 132, valuation: '₹3.6L', activeUsers: 30 },
  };

  const categories = [
    { name: 'Computing (Laptops/PCs)', value: 54, count: 454, fill: '#F58220' },
    { name: 'Networking (Routers/Switches)', value: 22, count: 185, fill: '#245fb4' },
    { name: 'Office Automation (Printers)', value: 14, count: 118, fill: '#10b981' },
    { name: 'Peripherals & Furniture', value: 10, count: 85, fill: '#8b5cf6' },
  ];

  const activeData = branchDetails[selectedBranch] || branchDetails.ALL;

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px', minHeight: '100%' }}>
      
      {/* Header Row & Navigation Context */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px', color: 'var(--text-sub)', marginBottom: '8px' }}>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Dashboard</Link>
            <span>/</span>
            <span style={{ color: 'var(--accent)', fontWeight: 500 }}>System Telemetry</span>
          </div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 800, 
            letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, var(--text-head) 30%, var(--accent) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
          }}>
            System Telemetry & Analytics
          </h1>
          <p style={{ color: 'var(--text-sub)', fontSize: '14px', marginTop: '4px' }}>Real-time operational intelligence, capital flow, and asset velocity maps.</p>
        </div>

        {/* Branch Quick Filters */}
        <div style={{ 
          display: 'flex', 
          background: 'var(--bg-panel)', 
          padding: '4px', 
          borderRadius: '12px', 
          border: '1px solid var(--border-main)',
          gap: '4px'
        }}>
          {['ALL', 'HYD', 'VIJ', 'BLR'].map((b) => (
            <button 
              key={b}
              onClick={() => setSelectedBranch(b)}
              style={{
                border: 'none',
                background: selectedBranch === b ? 'var(--text-head)' : 'transparent',
                color: selectedBranch === b ? 'var(--bg-glass)' : 'var(--text-sub)',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {b === 'ALL' ? 'All Hubs' : b === 'HYD' ? 'Hyderabad' : b === 'VIJ' ? 'Vijayawada' : 'Bangalore'}
            </button>
          ))}
        </div>
      </div>

      {/* KPM Metrics Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        {stats.map((stat, i) => (
          <div key={i} className="glass-card" style={{ 
            borderRadius: '20px', 
            padding: '24px', 
            position: 'relative', 
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            transition: 'transform 0.3s ease, border-color 0.3s ease',
            cursor: 'default'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = stat.color;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.borderColor = 'var(--border-main)';
          }}>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-sub)', fontWeight: 500 }}>{stat.title}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
                <div style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text-head)' }}>{stat.value}</div>
                <div style={{ 
                  fontSize: '11px', 
                  fontWeight: 700, 
                  color: stat.up ? '#10b981' : '#ef4444', 
                  background: stat.up ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  padding: '2px 6px',
                  borderRadius: '6px'
                }}>
                  {stat.change}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '12px', width: '100%' }}>
              <Sparkline data={stat.sparkData} color={stat.color} />
            </div>
          </div>
        ))}
      </div>

      {/* Intelligence Analytics Grids */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* 1. Procurement & Volume Dynamics Curve */}
        <div className="glass-card" style={{ borderRadius: '24px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-head)', margin: 0 }}>Procurement Flow & Stock Velocity</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-sub)', marginTop: '4px' }}>Quarterly asset intake (Inward) vs user allocation lifecycle (Outward).</p>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-head)' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }} /> Inward Flow
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-head)' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-blue)' }} /> Outward Dispatch
              </span>
            </div>
          </div>

          {/* Interactive SVG Area Chart Container */}
          <div style={{ height: '240px', width: '100%', position: 'relative', paddingBottom: '20px' }}>
            <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
              {/* Horizontal Helper Grids */}
              <line x1="0" y1="50" x2="500" y2="50" stroke="var(--border-main)" strokeDasharray="4" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="var(--border-main)" strokeDasharray="4" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="var(--border-main)" strokeDasharray="4" />
              <line x1="0" y1="200" x2="500" y2="200" stroke="var(--border-main)" />

              {/* Gradient Grids */}
              <defs>
                <linearGradient id="procureGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="outGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#245fb4" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#245fb4" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Path 1: Outward (Blue) */}
              <path 
                d="M0,200 C50,160 100,140 150,170 C200,200 250,110 300,130 C350,150 400,80 450,90 C480,95 500,80 500,80 L500,200 Z" 
                fill="url(#outGrad)"
              />
              <path 
                d="M0,200 C50,160 100,140 150,170 C200,200 250,110 300,130 C350,150 400,80 450,90 C480,95 500,80 500,80" 
                fill="none" 
                stroke="#245fb4" 
                strokeWidth="3.5" 
                strokeLinecap="round"
              />

              {/* Path 2: Inward (Orange) */}
              <path 
                d="M0,200 C50,130 100,110 150,120 C200,130 250,60 300,80 C350,100 400,40 450,50 C480,55 500,30 500,30 L500,200 Z" 
                fill="url(#procureGrad)"
              />
              <path 
                d="M0,200 C50,130 100,110 150,120 C200,130 250,60 300,80 C350,100 400,40 450,50 C480,55 500,30 500,30" 
                fill="none" 
                stroke="var(--accent)" 
                strokeWidth="3.5" 
                strokeLinecap="round"
              />
            </svg>

            {/* Timeline Axis Text labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', position: 'absolute', bottom: '-5px', fontSize: '11px', fontWeight: 600, color: 'var(--text-sub)' }}>
              <span>Nov</span>
              <span>Dec</span>
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May (Active)</span>
            </div>
          </div>
        </div>

        {/* 2. Dynamic Allocation Donuts */}
        <div className="glass-card" style={{ borderRadius: '24px', padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-head)', margin: 0 }}>Category Allocation</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-sub)', marginTop: '4px' }}>Asset distribution index by hardware class.</p>
          </div>

          {/* Donut Visualization Simulated by Stacked Circular Vector */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', height: '140px', margin: '20px 0' }}>
            <svg width="120" height="120" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--border-main)" strokeWidth="3.5" />
              {/* Computing Ring - 54% */}
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F58220" strokeWidth="4" strokeDasharray="54 46" strokeDashoffset="0" strokeLinecap="round" />
              {/* Networking Ring - 22% (offset 54) */}
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#245fb4" strokeWidth="4" strokeDasharray="22 78" strokeDashoffset="-54" strokeLinecap="round" />
              {/* Automation Ring - 14% (offset 76) */}
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="14 86" strokeDashoffset="-76" strokeLinecap="round" />
              {/* Peripherals - 10% (offset 90) */}
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#8b5cf6" strokeWidth="4" strokeDasharray="10 90" strokeDashoffset="-90" strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-head)' }}>{activeData.assets}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-sub)', fontWeight: 600, textTransform: 'uppercase' }}>Total Units</div>
            </div>
          </div>

          {/* Legend with Volume count */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {categories.map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-head)', fontWeight: 500 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.fill }} />
                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '150px' }}>{c.name}</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', color: 'var(--text-sub)', fontWeight: 700 }}>
                  <span>{c.value}%</span>
                  <span style={{ color: 'var(--text-head)', opacity: 0.6 }}>({Math.round((c.value/100) * activeData.assets)})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Regional Operations and Vendor Intelligence */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px' }}>
        
        {/* Branch Operational Health metrics */}
        <div className="glass-card" style={{ borderRadius: '24px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-head)', margin: 0 }}>Regional Infrastructure Profiles</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-sub)', marginTop: '4px' }}>Sinking counts per branch hub.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { name: 'Hyderabad Hub', count: 412, budget: '₹12.8L', val: 95, city: 'Madhapur' },
              { name: 'Vijayawada Main', count: 298, budget: '₹8.1L', val: 69, city: 'Benz Circle' },
              { name: 'Bangalore Sector', count: 132, budget: '₹3.6L', val: 30, city: 'Koramangala' }
            ].map((b, i) => (
              <div key={i} style={{ 
                background: 'var(--bg-input)', 
                padding: '16px', 
                borderRadius: '16px', 
                border: '1px solid var(--border-main)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-head)' }}>{b.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-sub)', marginTop: '2px' }}>{b.city}</div>
                </div>
                <div style={{ display: 'flex', gap: '24px', textAlign: 'right' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent)' }}>{b.count}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-sub)', textTransform: 'uppercase', fontWeight: 600 }}>Units</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-head)' }}>{b.budget}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-sub)', textTransform: 'uppercase', fontWeight: 600 }}>Value</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Attention Modules (Predictive Telemetry) */}
        <div className="glass-card" style={{ 
          borderRadius: '24px', 
          padding: '28px', 
          background: 'linear-gradient(135deg, var(--bg-panel), rgba(245, 130, 32, 0.02))',
          display: 'flex', 
          flexDirection: 'column', 
          gap: '20px' 
        }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-head)', margin: 0 }}>Predictive Telemetry & Flags</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-sub)', marginTop: '4px' }}>Automated anomaly alerts flagging system bottlenecks.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { title: 'Idle Inventory Overhang', desc: '45 hardware units unassigned for 30+ days', urgency: 'HIGH', col: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
              { title: 'Pending Warranties Expiry', desc: '12 Laptops expiring warranty within 15 days', urgency: 'MEDIUM', col: 'var(--accent)', bg: 'rgba(245, 130, 32, 0.1)' },
              { title: 'Internet Billing Spikes', desc: 'Vijayawada hub bandwidth data limit crossed 90%', urgency: 'REVIEW', col: '#245fb4', bg: 'rgba(36, 95, 180, 0.1)' }
            ].map((flag, idx) => (
              <div key={idx} style={{ 
                padding: '14px 18px', 
                borderRadius: '14px', 
                background: 'var(--bg-input)', 
                border: '1px solid var(--border-main)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px'
              }}>
                <span style={{ 
                  padding: '4px 8px', 
                  borderRadius: '6px', 
                  fontSize: '10px', 
                  fontWeight: 800, 
                  color: flag.col, 
                  background: flag.bg,
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.5px'
                }}>
                  {flag.urgency}
                </span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-head)' }}>{flag.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginTop: '2px' }}>{flag.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
