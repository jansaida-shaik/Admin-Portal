'use client';
import { useState } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import { usePaginatedData } from '@/lib/usePaginatedData';
import Pagination from '@/components/Pagination';
import dynamic from 'next/dynamic';
import { CITY_FILTER_OPTIONS, CITY_COLOR } from '@/lib/locations';

const SearchableSelect = dynamic(() => import('@/components/SearchableSelect'), {
  loading: () => <div style={{ height: '42px', width: '100%', background: 'var(--bg-input)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
});

export default function RosterPage() {
  const {
    data: roster,
    loading,
    error,
    page,
    setPage,
    limit,
    setLimit,
    total,
    totalPages,
    search,
    setSearch
  } = usePaginatedData('/housekeeping/roster');

  const [locFilter, setLocFilter] = useState('ALL');

  const filtered = roster.filter(r => {
    const matchesSearch = r.user?.name?.toLowerCase().includes(search.toLowerCase()) || false;
    const matchesLoc = locFilter === 'ALL' || (r.location?.name && r.location.name.includes(locFilter)) || (r.locationId && r.locationId.toString() === locFilter);
    return matchesSearch && matchesLoc;
  });

  return (
    <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px', boxSizing: 'border-box', padding: '24px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Link href="/housekeeping" style={{ color: 'var(--text-sub)', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Housekeeping</Link>
            <span style={{ color: 'var(--text-sub)' }}>/</span>
            <span style={{ color: 'var(--text-head)', fontSize: '14px', fontWeight: 600 }}>Duty Allocation</span>
          </div>
          <h1 style={{
            fontSize: '28px', fontWeight: 800,
            background: 'linear-gradient(135deg, var(--text-head) 30%, #F58220 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            margin: 0, letterSpacing: '-0.02em'
          }}>Duty Allocation</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-sub)', marginTop: '4px' }}>Manage shift rosters and branch allocations.</p>
        </div>
        <Link href="/housekeeping/roster/new" style={{
          background: 'linear-gradient(135deg, #F58220, #245fb4)', color: '#fff', padding: '10px 18px',
          borderRadius: '14px', fontWeight: 600, fontSize: '13px', textDecoration: 'none',
          boxShadow: '0 4px 12px rgba(255, 90, 31, 0.2)', transition: 'all 0.3s ease', display: 'inline-flex', alignItems: 'center'
        }}>
          + Allocate Duty
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'TOTAL ALLOCATIONS', val: total, sub: 'Active rosters', col: '#245fb4' }
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

      <div className="responsive-filter-bar" style={{ display: 'flex', gap: '12px', height: '42px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search Employee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '240px', height: '100%', background: 'var(--bg-panel)', border: '1px solid var(--border-main)',
            borderRadius: '14px', padding: '0 16px', color: 'var(--text-head)', fontSize: '13px', outline: 'none', boxSizing: 'border-box'
          }}
        />

        <SearchableSelect 
          value={locFilter} 
          onChange={(e) => setLocFilter(e.target.value)} 
          placeholder="All Branches"
          options={CITY_FILTER_OPTIONS}
          renderOption={(opt: any, isSelected: boolean) => {
            const dotColor = CITY_COLOR[opt.value] || 'transparent';
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {opt.value !== 'ALL' && (
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
                )}
                <span style={{ color: isSelected ? '#fff' : 'inherit' }}>{opt.label}</span>
              </div>
            );
          }}
        />

        <div style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-sub)', fontWeight: 600 }}>
          Displaying <span style={{ color: 'var(--text-head)' }}>{filtered.length}</span> records
        </div>
      </div>

      {error ? (
        <div style={{ color: 'red' }}>Error: {error}</div>
      ) : loading ? (
        <div style={{ color: 'var(--text-sub)', textAlign: 'center', padding: '40px' }}>Loading rosters...</div>
      ) : (
        <div className="glass-card" style={{ borderRadius: '24px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-main)' }}>
                <th style={{ padding: '16px 24px', color: 'var(--text-sub)', fontSize: '12px', textTransform: 'uppercase' }}>Employee</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-sub)', fontSize: '12px', textTransform: 'uppercase' }}>Branch</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-sub)', fontSize: '12px', textTransform: 'uppercase' }}>Shift Time</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-sub)', fontSize: '12px', textTransform: 'uppercase' }}>Assigned Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-sub)' }}>No rosters found.</td></tr>
              ) : (
                filtered.map((record: any) => {
                  return (
                    <tr key={record.id} style={{ borderBottom: '1px solid var(--border-main)' }}>
                      <td style={{ padding: '16px 24px', color: 'var(--text-head)', fontWeight: 600 }}>{record.user?.name || 'Unknown'}</td>
                      <td style={{ padding: '16px 24px', color: 'var(--text-sub)' }}>{record.location?.name || 'Unknown'}</td>
                      <td style={{ padding: '16px 24px', color: 'var(--text-head)' }}>{record.shiftTime}</td>
                      <td style={{ padding: '16px 24px', color: 'var(--text-sub)' }}>{new Date(record.assignedDate).toLocaleDateString('en-GB')}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      <Pagination 
        page={page} limit={limit} totalPages={totalPages} total={total} 
        setPage={setPage} setLimit={setLimit} 
      />
    </div>
  );
}
