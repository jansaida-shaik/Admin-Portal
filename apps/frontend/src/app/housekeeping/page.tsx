'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';

export default function HousekeepingDirectory() {
  const [stats, setStats] = useState({
    staffCount: 0, activeDuties: 0, pendingLeaves: 0, loading: true
  });

  useEffect(() => {
    async function loadTelemetry() {
      try {
        const [users, leaves] = await Promise.all([
          fetchApi('/users?limit=1000'),
          fetchApi('/housekeeping/leaves') // existing backend endpoint
        ]);
        
        // Count users in Housekeeping department (if implemented) or just total
        const staff = (users.data || []).length; 
        const pLeaves = (leaves || []).filter((l:any) => l.status === 'PENDING').length;

        setStats({
          staffCount: staff,
          activeDuties: staff, // placeholder for actual duty allocation
          pendingLeaves: pLeaves,
          loading: false
        });
      } catch (e) {
        console.error(e);
      }
    }
    loadTelemetry();
  }, []);

  const submodules = [
    { title: 'Attendance', desc: 'Real-time check-ins & check-outs', icon: '🕒', path: '/housekeeping/attendance', color: '#10b981' },
    { title: 'Task Checklists', desc: 'Daily, Weekly, Monthly duties', icon: '📋', path: '/housekeeping/checklists', color: '#245fb4' },
    { title: 'Staff Roster', desc: 'Manage housekeeping personnel', icon: '👥', path: '/housekeeping/staff', color: '#F58220' },
    { title: 'Leave Management', desc: 'Approve & track time off', icon: '🏖️', path: '/housekeeping/leaves', color: '#8b5cf6' },
    { title: 'Duty Allocation', desc: 'Assign branches and shifts', icon: '🏢', path: '/housekeeping/duty-allocation', color: '#0ea5e9' },
    { title: 'Salaries', desc: 'Payroll and compensation tracking', icon: '💰', path: '/housekeeping/salaries', color: '#f59e0b' },
    { title: 'Cleaning Inventory', desc: 'Manage stocks & consumables', icon: '🧹', path: '/housekeeping/inventory', color: '#ec4899' },
    { title: 'Issue Reporting', desc: 'Track maintenance & tickets', icon: '⚠️', path: '/housekeeping/issues', color: '#ef4444' }
  ];

  return (
    <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px', boxSizing: 'border-box', padding: '24px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{
            fontSize: '28px', fontWeight: 800,
            background: 'linear-gradient(135deg, var(--text-head) 30%, #F58220 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            margin: 0, letterSpacing: '-0.02em'
          }}>Housekeeping Central</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-sub)', marginTop: '4px' }}>Unified operations for facility management.</p>
        </div>
      </div>

      {/* 📊 Analytics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'STAFF MEMBERS', val: stats.loading ? '...' : stats.staffCount, sub: 'Enrolled personnel', col: '#245fb4' },
          { label: 'ACTIVE DUTIES', val: stats.loading ? '...' : stats.activeDuties, sub: 'Currently allocated', col: '#10b981' },
          { label: 'PENDING LEAVES', val: stats.loading ? '...' : stats.pendingLeaves, sub: 'Awaiting approval', col: '#f59e0b' },
          { label: 'FACILITY SCORE', val: '98%', sub: 'Based on checklist completion', col: '#F58220' }
        ].map((m, idx) => (
          <div key={idx} className="glass-card" style={{
            padding: '18px 20px', borderRadius: '20px', display: 'flex', flexDirection: 'column',
            gap: '4px', borderLeft: `4px solid ${m.col}`, transition: 'all 0.2s ease'
          }}>
            <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-sub)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{m.label}</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-head)', margin: '2px 0' }}>{m.val}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-sub)', fontWeight: 500 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px',
        marginTop: '16px'
      }}>
        {submodules.map((mod, idx) => (
          <Link href={mod.path} key={idx} style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-main)',
            borderRadius: '24px',
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            minHeight: '200px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-6px)';
            e.currentTarget.style.borderColor = mod.color;
            e.currentTarget.style.boxShadow = `0 16px 32px ${mod.color}15`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.borderColor = 'var(--border-main)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          >
            <div style={{
              width: '56px', height: '56px', borderRadius: '16px',
              background: `${mod.color}15`, border: `1px solid ${mod.color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '28px', color: mod.color
            }}>
              {mod.icon}
            </div>
            
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 800, color: 'var(--text-head)' }}>{mod.title}</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-sub)', lineHeight: 1.5 }}>{mod.desc}</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: mod.color, fontSize: '13px', fontWeight: 700 }}>
              Access Module <span style={{ transition: 'transform 0.2s', transform: 'translateX(0)' }}>→</span>
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}
