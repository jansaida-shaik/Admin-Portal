'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import Pagination from '@/components/Pagination';
import dynamic from 'next/dynamic';

const SearchableSelect = dynamic(() => import('@/components/SearchableSelect'), {
  loading: () => <div style={{ height: '42px', width: '100%', background: 'var(--bg-input)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
});

// Helper to resolve dynamic telecom brand colors
const getTelecomBrandColor = (providerName) => {
  const name = providerName?.toLowerCase() || '';
  if (name.includes('jio')) return '#245fb4';       // Brand Blue
  if (name.includes('airtel')) return '#ef4444';    // Airtel Red
  if (name.includes('bsnl')) return '#f59e0b';      // BSNL Amber
  if (name.includes('vi') || name.includes('vodafone')) return '#e11d48'; // Vi Red
  return '#F58220'; // Global theme default
};

// Sleek micro SVG for Network Signal indicator
function SignalBars({ provider }) {
  const activeColor = getTelecomBrandColor(provider);
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" style={{ verticalAlign: 'middle', marginRight: '6px' }}>
      <rect x="0" y="8" width="2.5" height="4" rx="0.5" fill={activeColor} />
      <rect x="4" y="6" width="2.5" height="6" rx="0.5" fill={activeColor} />
      <rect x="8" y="3" width="2.5" height="9" rx="0.5" fill={activeColor} />
      <rect x="12" y="0" width="2.5" height="12" rx="0.5" fill={activeColor} fillOpacity="0.3" />
    </svg>
  );
}

export default function MobileNumbers() {
  const [numbers, setNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Advanced Aggregate Stats for the Telemetry Header
  const [aggStats, setAggStats] = useState({ assigned: 0, available: 0, providers: [], loading: true });

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('NUM_ASC');
  const [simClassFilter, setSimClassFilter] = useState('ALL');
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [result, locResult] = await Promise.all([
          fetchApi(`/mobile-numbers?page=${page}&limit=${limit}&search=${search}`),
          fetchApi('/locations')
        ]);
        setNumbers(result.data || []);
        setTotal(result.total || 0);
        setTotalPages(result.totalPages || 1);
        setLocations(locResult.data || locResult || []);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [page, limit, search]);

  // Run parallel side-fetch to compute 100% accurate full aggregate stats
  useEffect(() => {
    async function fetchAggregates() {
      try {
        const result = await fetchApi('/mobile-numbers?limit=1000'); // grab full dataset for computing
        const rawData = result.data || [];
        setAggStats({
          assigned: rawData.filter(item => item.status === 'ASSIGNED').length,
          available: rawData.filter(item => item.status === 'AVAILABLE').length,
          providers: Array.from(new Set(rawData.map(item => item.provider).filter(Boolean))),
          loading: false
        });
      } catch (e) {
        console.error('Aggregate stats sync failed:', e.message);
      }
    }
    fetchAggregates();
  }, [total]); // refetch when the total database record count changes

  const filtered = numbers.filter(n => {
    const matchesSearch = n.number.includes(search) || 
                          (n.user?.name && n.user.name.toLowerCase().includes(search.toLowerCase())) ||
                          (n.assignedTo && n.assignedTo.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || n.status === statusFilter;
    const matchesSimClass = simClassFilter === 'ALL' || 
                           (simClassFilter === 'DUMMY' && n.isDummy === true) || 
                           (simClassFilter === 'OFFICIAL' && !n.isDummy);
    // Placeholder for structural layout consistency as MobileNumbers are unmapped to schema locations
    const matchesCity = cityFilter === 'ALL' || (n.user && n.user.city === cityFilter); 
    const matchesBranch = branchFilter === 'ALL' || (n.user && n.user.branch === branchFilter);
    return matchesSearch && matchesStatus && matchesSimClass && matchesCity && matchesBranch;
  }).sort((a, b) => {
    if (sortBy === 'NUM_ASC') return a.number.localeCompare(b.number);
    if (sortBy === 'NUM_DESC') return b.number.localeCompare(a.number);
    if (sortBy === 'USER_ASC') return (a.user?.name || 'zz').localeCompare(b.user?.name || 'zz');
    return 0;
  });

  const providerDisplay = aggStats.loading 
    ? 'Scanning...' 
    : aggStats.providers.length > 0 
      ? aggStats.providers.slice(0, 3).join(' / ') 
      : 'BSNL / Airtel';

  const getStatusColor = (s) => {
    if (s === 'AVAILABLE') return '#10b981';
    if (s === 'ASSIGNED') return '#F58220';
    if (s === 'INACTIVE') return '#ef4444';
    return '#6b7280';
  };

  const selectStyle = {
    height: '100%',
    background: 'var(--bg-panel)', 
    color: 'var(--text-head)', 
    border: '1px solid var(--border-main)',
    borderRadius: '14px', 
    padding: '0 12px', 
    cursor: 'pointer', 
    outline: 'none', 
    fontSize: '13px', 
    minWidth: '130px',
    boxSizing: 'border-box',
    fontWeight: 600,
  };

  return (
    <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: '28px', boxSizing: 'border-box' }}>
      
      {/* Title Banner Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '13px', color: 'var(--text-sub)', marginBottom: '6px' }}>Communications Registry</div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, var(--text-head) 30%, #F58220 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>Mobile Assets Registry</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-sub)', marginTop: '4px' }}>Centralized directory of corporate SIM nodes, network bands, and telecom carriers.</p>
        </div>
        <Link href="/mobile-numbers/new" 
          style={{
            background: 'linear-gradient(135deg, #F58220, #245fb4)',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '14px',
            fontWeight: 700,
            fontSize: '13px',
            textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(245, 130, 32, 0.2)',
            transition: 'all 0.3s ease',
            display: 'inline-flex',
            alignItems: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(245, 130, 32, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 130, 32, 0.2)';
          }}
        >
          + Register New SIM
        </Link>
      </div>

      {/* 📊 Mobile Module Telemetry Dashboard - Expanded with Assigned & Available Blocks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '16px' }}>
        {[
          { label: 'Total Connected', val: total, sub: 'SIM units registered', col: '#0B316F' },
          { label: 'Assigned Lines', val: aggStats.loading ? '...' : aggStats.assigned, sub: 'Active in-use nodes', col: '#F58220' },
          { label: 'Available Pool', val: aggStats.loading ? '...' : aggStats.available, sub: 'Standing idle stock', col: '#10b981' },
          { label: 'Carrier Split', val: providerDisplay, sub: `${aggStats.providers.length || 'Scanning'} active vectors`, col: '#245fb4' },
          { label: 'Est. Spend', val: `₹${(total * 499).toLocaleString()}`, sub: 'Monthly communications pool', col: '#8b5cf6' }
        ].map((metric, idx) => (
          <div key={idx} className="glass-card" style={{
            padding: '18px 20px',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            borderLeft: `4px solid ${metric.col}`,
            transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-sub)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{metric.label}</div>
            <div style={{ 
              fontSize: metric.val.toString().length > 14 ? '18px' : '22px', 
              fontWeight: 800, 
              color: 'var(--text-head)', 
              margin: '4px 0',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }} title={metric.val.toString()}>
              {metric.val}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-sub)', fontWeight: 500 }}>{metric.sub}</div>
          </div>
        ))}
      </div>
      {/* 🛠️ Filtering Bar & Utilities */}
      <div style={{ display: 'flex', gap: '12px', height: '44px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '240px', maxWidth: '360px', height: '100%' }}>
          <input
            type="text"
            placeholder="Search numbers, SIM IDs, assignees..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{
              width: '100%', height: '100%', background: 'var(--bg-panel)', border: '1px solid var(--border-main)',
              borderRadius: '14px', padding: '0 16px', color: 'var(--text-head)', fontSize: '13px', outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>
        
        <SearchableSelect 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)} 
          placeholder="All Statuses"
          options={[
            { value: 'ALL', label: 'All Statuses' },
            { value: 'AVAILABLE', label: 'Available' },
            { value: 'ASSIGNED', label: 'Assigned' },
            { value: 'INACTIVE', label: 'Inactive' }
          ]}
        />

        <SearchableSelect 
          value={simClassFilter} 
          onChange={(e) => setSimClassFilter(e.target.value)} 
          placeholder="All SIM Classes"
          options={[
            { value: 'ALL', label: 'All SIM Classes' },
            { value: 'OFFICIAL', label: 'Official Corporate' },
            { value: 'DUMMY', label: '🤖 Dummy / Test' }
          ]}
        />

        {/* 📍 Location Filter */}
        <SearchableSelect 
          value={cityFilter} 
          onChange={(e) => { setCityFilter(e.target.value); setBranchFilter('ALL'); }} 
          placeholder="All Locations"
          options={[
            { value: 'ALL', label: 'All Locations' },
            { value: 'Vijayawada', label: 'Vijayawada' },
            { value: 'Hyderabad', label: 'Hyderabad' },
            { value: 'Visakhapatnam', label: 'Visakhapatnam' }
          ]}
        />

        {/* 🏢 Branch Filter */}
        <SearchableSelect 
          value={branchFilter} 
          onChange={(e) => setBranchFilter(e.target.value)} 
          placeholder="All Branches"
          options={[
            { value: 'ALL', label: 'All Branches' },
            ...locations
              .filter(loc => cityFilter === 'ALL' || loc.city === cityFilter)
              .map(loc => ({ value: loc.name, label: loc.name }))
          ]}
        />

        <SearchableSelect 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)} 
          placeholder="Sort Order"
          options={[
            { value: 'NUM_ASC', label: 'Num: Ascending' },
            { value: 'NUM_DESC', label: 'Num: Descending' },
            { value: 'USER_ASC', label: 'Assignee: Name' }
          ]}
        />
        
        <div style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-sub)', fontWeight: 700 }}>
          Matched Records: <span style={{ color: 'var(--accent)' }}>{filtered.length}</span> of {total}
        </div>
      </div>

      {/* 📄 Data View Listing */}
      {error ? (
        <div className="glass-card" style={{ color: '#ef4444', padding: '24px', borderRadius: '16px', textAlign: 'center', fontWeight: 600 }}>
          ⚠️ System Overload: {error}
        </div>
      ) : loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px', color: 'var(--text-sub)', fontSize: '14px', fontWeight: 500 }}>
          Syncing wireless registries...
        </div>
      ) : (
        <div className="glass-card" style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--border-main)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-main)' }}>
                  <th style={{ padding: '18px 24px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-sub)' }}>Identity & Node</th>
                  <th style={{ padding: '18px 24px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-sub)' }}>Assignee Matrix</th>
                  <th style={{ padding: '18px 24px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-sub)' }}>Connection Status</th>
                  <th style={{ padding: '18px 24px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-sub)' }}>Carrier Vector</th>
                  <th style={{ padding: '18px 24px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-sub)', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(n => {
                  const providerName = n.provider || 'Airtel';
                  const providerColor = getTelecomBrandColor(providerName);
                  
                  return (
                    <tr key={n.id.toString()} style={{ borderBottom: '1px solid var(--border-main)', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Column 1: Phone Number Node */}
                      <td style={{ padding: '20px 24px' }}>
                        <Link href={`/mobile-numbers/${n.id}`} style={{ 
                          fontWeight: 800, 
                          fontFamily: 'monospace', 
                          fontSize: '17px', 
                          letterSpacing: '0.5px', 
                          color: 'var(--text-head)', 
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-head)'}
                        >
                          <span style={{ background: 'var(--bg-input)', padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--border-main)' }}>
                            {n.number.replace(/(\d{5})(\d{5})/, '+91 $1 $2')}
                          </span>
                          {n.isDummy && (
                            <span style={{ fontSize:'10px', fontWeight:900, background:'rgba(255,255,255,0.05)', color:'var(--text-sub)', border:'1px solid var(--border-main)', padding:'4px 8px', borderRadius:'8px', letterSpacing:'0.05em' }}>
                              🤖 DUMMY
                            </span>
                          )}
                        </Link>
                      </td>

                      {/* Column 2: Corporate Assignee Link */}
                      <td style={{ padding: '20px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {n.user ? (
                            <>
                              <div style={{
                                width: '32px', height: '32px', borderRadius: '50%', 
                                background: 'linear-gradient(135deg, #F58220, #245fb4)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                color: '#fff', fontSize: '12px', fontWeight: 800,
                                boxShadow: '0 2px 10px rgba(245,130,32,0.15)'
                              }}>
                                {n.user.name.charAt(0).toUpperCase()}
                              </div>
                              <Link href={`/employees/${n.user.id}`} style={{ 
                                fontWeight: 700, color: 'var(--text-head)', textDecoration: 'none' 
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
                              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-head)'}
                              >
                                {n.user.name}
                              </Link>
                            </>
                          ) : n.assignedTo ? (
                            <>
                              <div style={{
                                width: '32px', height: '32px', borderRadius: '50%', 
                                background: 'var(--bg-input)', border: '1px solid var(--border-main)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                color: 'var(--text-sub)', fontSize: '12px', fontWeight: 800
                              }}>
                                {n.assignedTo.charAt(0).toUpperCase()}
                              </div>
                              <span style={{ fontWeight: 600, color: 'var(--text-sub)' }}>{n.assignedTo}</span>
                            </>
                          ) : (
                            <span style={{ color: 'var(--text-sub)', fontStyle: 'italic', fontSize: '13px', opacity: 0.6 }}>Unallocated Node</span>
                          )}
                        </div>
                      </td>

                      {/* Column 3: Smart Status Pill */}
                      <td style={{ padding: '20px 24px' }}>
                        <span style={{
                          color: getStatusColor(n.status), 
                          background: `${getStatusColor(n.status)}12`,
                          padding: '6px 14px', 
                          borderRadius: '100px', 
                          fontSize: '11px', 
                          fontWeight: 800,
                          border: `1px solid ${getStatusColor(n.status)}25`,
                          letterSpacing: '0.5px'
                        }}>
                          {n.status}
                        </span>
                      </td>

                      {/* Column 4: Styled Carrier Vector (DYNAMIC COLORS) */}
                      <td style={{ padding: '20px 24px' }}>
                        <div style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          background: `${providerColor}10`,
                          border: `1px solid ${providerColor}30`,
                          color: providerColor,
                          padding: '6px 12px',
                          borderRadius: '10px',
                          fontSize: '13px',
                          fontWeight: 700
                        }}>
                          <SignalBars provider={providerName} />
                          {providerName}
                        </div>
                      </td>

                      {/* Column 5: Modern Action Box */}
                      <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                        <Link href={`/mobile-numbers/${n.id}`} style={{
                          background: 'var(--bg-input)', 
                          border: '1px solid var(--border-main)', 
                          color: 'var(--text-sub)',
                          borderRadius: '10px', 
                          padding: '8px 16px', 
                          fontSize: '12px', 
                          fontWeight: 700,
                          cursor: 'pointer', 
                          transition: 'all 0.2s',
                          textDecoration: 'none', 
                          display: 'inline-block'
                        }}
                        onMouseEnter={(e) => { 
                          e.currentTarget.style.color = 'var(--accent)'; 
                          e.currentTarget.style.borderColor = 'var(--accent)';
                          e.currentTarget.style.background = 'rgba(245, 130, 32, 0.03)';
                        }}
                        onMouseLeave={(e) => { 
                          e.currentTarget.style.color = 'var(--text-sub)'; 
                          e.currentTarget.style.borderColor = 'var(--border-main)';
                          e.currentTarget.style.background = 'var(--bg-input)';
                        }}
                        >
                          Configure
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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


