'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import { usePaginatedData } from '@/lib/usePaginatedData';
import Pagination from '@/components/Pagination';
import dynamic from 'next/dynamic';
import { CITY_FILTER_OPTIONS, CITY_COLOR } from '@/lib/locations';

const SearchableSelect = dynamic(() => import('@/components/SearchableSelect'), {
  loading: () => <div style={{ height: '42px', width: '100%', background: 'var(--bg-input)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
});

export default function VendorsDirectory() {
  const {
    data: vendors,
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
  } = usePaginatedData('/vendors');

  const [locFilter, setLocFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('NAME_ASC');

  // Stats State
  const [aggStats, setAggStats] = useState({ itemCoverage: 0, loading: true });

  // Load all to compute true global telemetry
  useEffect(() => {
    async function fetchTelemetry() {
      try {
        const res = await fetchApi('/vendors?limit=1000');
        const allVendors = res.data || [];
        const sum = allVendors.reduce((acc, v) => acc + (v._count?.items || 0), 0);
        setAggStats({ itemCoverage: sum, loading: false });
      } catch (e) {
        console.error('Vendor telemetry error:', e.message);
      }
    }
    fetchTelemetry();
  }, [total]);

  // Client-side filtering and sorting for current page view
  const filtered = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase()) || 
                           (v.contact && v.contact.toLowerCase().includes(search.toLowerCase()));
    const matchesLoc = locFilter === 'ALL' || v.loc === locFilter || v.location === locFilter;
    return matchesSearch && matchesLoc;
  }).sort((a, b) => {
    const countA = a._count?.items || 0;
    const countB = b._count?.items || 0;
    
    if (sortBy === 'NAME_ASC') return a.name.localeCompare(b.name);
    if (sortBy === 'NAME_DESC') return b.name.localeCompare(a.name);
    if (sortBy === 'COUNT_DESC') return countB - countA;
    if (sortBy === 'COUNT_ASC') return countA - countB;
    return 0;
  });

  return (
    <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px', boxSizing: 'border-box', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 800,
            background: 'linear-gradient(135deg, var(--text-head) 30%, #F58220 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            letterSpacing: '-0.02em'
          }}>Vendor Network</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-sub)', marginTop: '4px' }}>Verified logistics, procurement, and maintenance hubs.</p>
        </div>
        <button style={{
          background: 'linear-gradient(135deg, #F58220, #245fb4)',
          color: '#fff',
          border: 'none',
          borderRadius: '14px',
          padding: '10px 18px',
          fontWeight: 600,
          fontSize: '13px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(255, 90, 31, 0.2)',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(255, 90, 31, 0.35)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 90, 31, 0.2)';
        }}
        >
          + Enroll Vendor
        </button>
      </div>

      {/* 📊 Supply Chain & Vendor Analytics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'ENROLLED VENDORS', val: total, sub: 'Verified supply nodes', col: '#245fb4' },
          { label: 'TOTAL ITEM COVERAGE', val: aggStats.loading ? '...' : aggStats.itemCoverage, sub: 'Procured unique line items', col: '#10b981' },
          { label: 'LOCATIONS REACHED', val: 'Global', sub: 'Aggregated fulfillment spans', col: '#F58220' },
          { label: 'ACTIVE SERVICE RATE', val: '100%', sub: 'Operational partner nodes', col: '#0B316F' }
        ].map((m, idx) => (
          <div key={idx} className="glass-card" style={{
            padding: '18px 20px',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            borderLeft: `4px solid ${m.col}`,
            transition: 'all 0.2s ease'
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
          placeholder="Find Vendor"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{
            width: '220px', height: '100%', background: 'var(--bg-panel)', border: '1px solid var(--border-main)',
            borderRadius: '14px', padding: '0 16px', color: 'var(--text-head)', fontSize: '13px', outline: 'none', boxSizing: 'border-box'
          }}
        />
        
        <SearchableSelect 
          value={locFilter} 
          onChange={(e) => setLocFilter(e.target.value)} 
          placeholder="All Locations"
          options={CITY_FILTER_OPTIONS}
          renderOption={(opt, isSelected) => {
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

        <SearchableSelect 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)} 
          placeholder="Sort Order"
          options={[
            { value: 'NAME_ASC', label: 'Name A-Z' },
            { value: 'NAME_DESC', label: 'Name Z-A' },
            { value: 'COUNT_DESC', label: 'Items Supplied (High)' },
            { value: 'COUNT_ASC', label: 'Items Supplied (Low)' }
          ]}
        />

        <div style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-sub)', fontWeight: 600 }}>
          Displaying <span style={{ color: 'var(--text-head)' }}>{filtered.length}</span> of {total}
        </div>
      </div>

      {error ? (
        <div style={{ color: 'red' }}>Error: {error}</div>
      ) : loading ? (
        <div style={{ color: 'var(--text-sub)', textAlign:'center', padding:'40px' }}>Syncing fulfillment network index...</div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px',
          maxWidth: '100%',
        }}>
          {filtered.map(v => (
             <Link href={`/vendors/${v.id}`} key={v.id.toString()} style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--border-main)',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              minHeight: '230px',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#F58220';
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-main)';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', minHeight: '48px' }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '14px',
                  background: 'linear-gradient(135deg, #F58220, #245fb4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: '16px', flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(255, 90, 31, 0.15)'
                }}>
                  {v.name.charAt(0)}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ 
                    fontWeight: 700, 
                    fontSize: '16px', 
                    color: 'var(--text-head)',
                    lineHeight: 1.3,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {v.name}
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '14px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', border:'1px solid var(--border-main)' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-sub)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px', letterSpacing:'0.04em' }}>Representative</div>
                <div style={{ color: 'var(--text-head)', fontSize: '13px', wordBreak: 'break-all', fontWeight: 600 }}>{v.contact || 'No Contact'}</div>
              </div>

              <div style={{
                marginTop: 'auto', borderTop: '1px solid var(--border-main)', paddingTop: '12px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-head)' }}>
                  {v._count?.items || 0} <span style={{ color: 'var(--text-sub)', fontWeight: 500 }}>Items Supplied</span>
                </span>
                <span style={{ fontSize: '12px', color: '#F58220', fontWeight: 800 }}>Profile →</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Pagination 
        page={page} 
        limit={limit} 
        totalPages={totalPages} 
        total={total} 
        setPage={setPage} 
        setLimit={setLimit} 
      />
    </div>
  );
}
