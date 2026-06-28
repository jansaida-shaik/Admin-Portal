'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import Pagination from '@/components/Pagination';
import dynamic from 'next/dynamic';
import CarrierLogo from '@/components/mobile/CarrierLogo';
import {
  formatMobileNumber,
  getTelecomBrandColor,
  normalizeMobileProvider
} from '@/lib/mobileProviders';
import { CITY_FILTER_OPTIONS } from '@/lib/locations';

const SearchableSelect = dynamic(() => import('@/components/SearchableSelect'), {
  loading: () => <div style={{ height: '42px', width: '100%', background: 'var(--bg-input)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
});

const getStatusColor = (s) => {
  if (s === 'AVAILABLE') return '#10b981';
  if (s === 'ASSIGNED')  return '#F58220';
  if (s === 'INACTIVE')  return '#ef4444';
  return '#6b7280';
};

export default function MobileNumbers() {
  const [numbers, setNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aggStats, setAggStats] = useState({ assigned: 0, available: 0, providers: [], loading: true });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
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

  useEffect(() => {
    async function fetchAggregates() {
      try {
        const result = await fetchApi('/mobile-numbers?limit=1000');
        const rawData = result.data || [];
        setAggStats({
          assigned:  rawData.filter(i => i.status === 'ASSIGNED').length,
          available: rawData.filter(i => i.status === 'AVAILABLE').length,
          providers: Array.from(new Set(rawData.map(i => normalizeMobileProvider(i.provider)).filter(Boolean))),
          loading: false
        });
      } catch (e) { console.error(e); }
    }
    fetchAggregates();
  }, [total]);

  const filtered = numbers.filter(n => {
    const matchesSearch = n.number.includes(search) ||
      (n.user?.name && n.user.name.toLowerCase().includes(search.toLowerCase())) ||
      (n.assignedTo && n.assignedTo.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus   = statusFilter === 'ALL' || n.status === statusFilter;
    const matchesSimClass = simClassFilter === 'ALL' ||
      (simClassFilter === 'DUMMY' && n.isDummy) ||
      (simClassFilter === 'OFFICIAL' && !n.isDummy);
    const matchesCity   = cityFilter === 'ALL' || n.user?.city === cityFilter;
    const matchesBranch = branchFilter === 'ALL' || n.user?.branch === branchFilter;
    return matchesSearch && matchesStatus && matchesSimClass && matchesCity && matchesBranch;
  }).sort((a, b) => {
    if (sortBy === 'NUM_ASC')  return a.number.localeCompare(b.number);
    if (sortBy === 'NUM_DESC') return b.number.localeCompare(a.number);
    if (sortBy === 'USER_ASC') return (a.user?.name || 'zz').localeCompare(b.user?.name || 'zz');
    return 0;
  });

  const providerDisplay = aggStats.loading ? 'Scanning…'
    : aggStats.providers.length > 0 ? aggStats.providers.slice(0, 3).join(' / ') : 'Airtel / Jio';

  return (
    <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: '28px', boxSizing: 'border-box' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '13px', color: 'var(--text-sub)', marginBottom: '6px' }}>Communications Registry</div>
          <h1 style={{
            fontSize: '32px', fontWeight: 800, letterSpacing: '-0.03em', margin: 0,
            background: 'linear-gradient(135deg, var(--text-head) 30%, #F58220 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>Mobile Assets Registry</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-sub)', marginTop: '4px' }}>Centralized directory of corporate SIM nodes, network bands, and telecom carriers.</p>
        </div>
        <Link href="/mobile-numbers/new" style={{
          background: 'linear-gradient(135deg, #F58220, #245fb4)', color: '#fff',
          padding: '12px 24px', borderRadius: '14px', fontWeight: 700, fontSize: '13px',
          textDecoration: 'none', boxShadow: '0 4px 12px rgba(245,130,32,0.2)',
          transition: 'all 0.3s ease', display: 'inline-flex', alignItems: 'center',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(245,130,32,0.35)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(245,130,32,0.2)'; }}
        >+ Register New SIM</Link>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '16px' }}>
        {[
          { label: 'Total Connected',  val: total, sub: 'SIM units registered', col: '#0B316F' },
          { label: 'Assigned Lines',   val: aggStats.loading ? '…' : aggStats.assigned, sub: 'Active in-use nodes', col: '#F58220' },
          { label: 'Available Pool',   val: aggStats.loading ? '…' : aggStats.available, sub: 'Standing idle stock', col: '#10b981' },
          { label: 'Carrier Split',    val: providerDisplay, sub: `${aggStats.providers.length || '—'} active carriers`, col: '#245fb4' },
          { label: 'Est. Monthly Spend', val: `₹${(total * 499).toLocaleString()}`, sub: 'Communications pool', col: '#8b5cf6' },
        ].map((m, i) => (
          <div key={i} className="glass-card" style={{
            padding: '18px 20px', borderRadius: '20px', display: 'flex',
            flexDirection: 'column', gap: '4px', borderLeft: `4px solid ${m.col}`,
            transition: 'transform 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-sub)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{m.label}</div>
            <div style={{ fontSize: m.val.toString().length > 14 ? '18px' : '22px', fontWeight: 800, color: 'var(--text-head)', margin: '4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={m.val.toString()}>{m.val}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-sub)', fontWeight: 500 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Filter Bar ── */}
      <div className="responsive-filter-bar" style={{ display: 'flex', gap: '12px', minHeight: '44px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '240px', maxWidth: '360px', height: '100%' }}>
          <input type="text" placeholder="Search numbers, SIM IDs, assignees…"
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ width: '100%', height: '100%', background: 'var(--bg-panel)', border: '1px solid var(--border-main)', borderRadius: '14px', padding: '0 16px', color: 'var(--text-head)', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <SearchableSelect value={statusFilter} onChange={e => setStatusFilter(e.target.value)} placeholder="All Statuses"
          options={[{ value: 'ALL', label: 'All Statuses' }, { value: 'AVAILABLE', label: 'Available' }, { value: 'ASSIGNED', label: 'Assigned' }, { value: 'INACTIVE', label: 'Inactive' }]}
        />
        <SearchableSelect value={simClassFilter} onChange={e => setSimClassFilter(e.target.value)} placeholder="All SIM Classes"
          options={[{ value: 'ALL', label: 'All SIM Classes' }, { value: 'OFFICIAL', label: 'Official Corporate' }, { value: 'DUMMY', label: '🤖 Dummy / Test' }]}
        />
        <SearchableSelect value={cityFilter} onChange={e => { setCityFilter(e.target.value); setBranchFilter('ALL'); }} placeholder="All Locations"
          options={[{ value: 'ALL', label: 'All Locations' }, ...CITY_FILTER_OPTIONS.slice(1)]}
        />
        <SearchableSelect value={branchFilter} onChange={e => setBranchFilter(e.target.value)} placeholder="All Branches"
          options={[{ value: 'ALL', label: 'All Branches' }, ...locations.filter(l => cityFilter === 'ALL' || l.city === cityFilter).map(l => ({ value: l.name, label: l.name }))]}
        />
        <SearchableSelect value={sortBy} onChange={e => setSortBy(e.target.value)} placeholder="Sort Order"
          options={[{ value: 'NUM_ASC', label: 'Num: Ascending' }, { value: 'NUM_DESC', label: 'Num: Descending' }, { value: 'USER_ASC', label: 'Assignee: Name' }]}
        />
        <div className="mobile-filter-meta" style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-sub)', fontWeight: 700 }}>
          Matched: <span style={{ color: 'var(--accent)' }}>{filtered.length}</span> of {total}
        </div>
      </div>

      {/* ── Card Grid ── */}
      {error ? (
        <div className="glass-card" style={{ color: '#ef4444', padding: '24px', borderRadius: '16px', textAlign: 'center', fontWeight: 600 }}>
          ⚠️ Error: {error}
        </div>
      ) : loading ? (
        <div className="mobile-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{
              borderRadius: '16px', height: '200px',
              background: 'var(--bg-panel)', border: '1px solid var(--border-main)',
              animation: 'pulse 1.5s ease-in-out infinite', opacity: 1 - i * 0.06
            }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 24px', borderRadius: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📡</div>
          <div style={{ fontWeight: 700, color: 'var(--text-head)', fontSize: '16px' }}>No SIM nodes found</div>
          <div style={{ color: 'var(--text-sub)', fontSize: '13px', marginTop: '6px' }}>Try adjusting your filters</div>
        </div>
      ) : (
        <div className="mobile-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
          {filtered.map(n => {
            const providerName  = normalizeMobileProvider(n.provider) || 'Unknown';
            const brandColor    = getTelecomBrandColor(providerName);
            const statusColor   = getStatusColor(n.status);
            const assigneeName  = n.user?.name || n.assignedTo || null;
            const assigneeInit  = assigneeName ? assigneeName.charAt(0).toUpperCase() : null;
            const formattedNumber = formatMobileNumber(n.number);

            return (
              <div key={n.id.toString()} className="glass-card"
                style={{
                  borderRadius: '16px',
                  border: '1px solid var(--border-main)',
                  overflow: 'hidden',
                  height: '200px',                       /* uniform height */
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s cubic-bezier(0.4,0,0.2,1), box-shadow 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 16px 40px ${brandColor}25`;
                  e.currentTarget.style.borderColor = `${brandColor}55`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'var(--border-main)';
                }}
              >
                {/* ① TOP — carrier logo + phone number */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 16px 0' }}>
                  <CarrierLogo provider={providerName} size={44} />
                  <div style={{ minWidth: 0 }}>
                    <Link href={`/mobile-numbers/${n.id}`}
                      style={{
                        display: 'block',
                        fontFamily: "'Courier New', monospace",
                        fontWeight: 800, fontSize: '15px', letterSpacing: '0.06em',
                        color: 'var(--text-head)', textDecoration: 'none',
                        whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = brandColor}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-head)'}
                    >
                      {formattedNumber}
                    </Link>
                    <div style={{
                      fontSize: '11px',
                      color: brandColor,
                      fontWeight: 800,
                      marginTop: '4px',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase'
                    }}>
                      {providerName}
                    </div>
                  </div>
                </div>

                {/* ② MIDDLE spacer — fills remaining space */}
                <div style={{ flex: 1 }} />

                {/* ③ INFO ROW — status pill + SIM class */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: '100px', fontSize: '10px',
                    fontWeight: 800, letterSpacing: '0.4px', whiteSpace: 'nowrap',
                    color: statusColor, background: `${statusColor}18`,
                    border: `1px solid ${statusColor}35`,
                  }}>
                    {n.status}
                  </span>
                  <div style={{ flex: 1 }} />
                  {n.isDummy && (
                    <span style={{
                      fontSize: '8px', fontWeight: 900, flexShrink: 0,
                      color: 'var(--text-sub)', border: '1px solid var(--border-main)',
                      background: 'rgba(255,255,255,0.03)',
                      padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.06em',
                    }}>🤖 TEST</span>
                  )}
                </div>

                {/* ④ DIVIDER */}
                <div style={{ height: '1px', background: 'var(--border-main)', margin: '10px 16px' }} />

                {/* ⑤ BOTTOM ROW — assignee + edit btn */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px 14px' }}>
                  {/* Avatar */}
                  <div style={{
                    width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                    background: n.user
                      ? 'linear-gradient(135deg, #F58220, #245fb4)'
                      : 'rgba(255,255,255,0.07)',
                    border: n.user ? 'none' : '1px solid var(--border-main)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '10px', fontWeight: 800,
                  }}>
                    {assigneeInit || <span style={{ opacity: 0.4, fontSize: '14px' }}>—</span>}
                  </div>

                  {/* Assignee name */}
                  <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                    {assigneeName ? (
                      n.user ? (
                        <Link href={`/employees/${n.user.id}`} style={{
                          display: 'block', fontSize: '11px', fontWeight: 600,
                          color: 'var(--text-sub)', textDecoration: 'none',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-sub)'}
                        >
                          {n.user.name}
                        </Link>
                      ) : (
                        <Link href={`/employees/lookup?name=${encodeURIComponent(n.assignedTo)}`} style={{
                          display: 'block', fontSize: '11px', fontWeight: 600,
                          color: 'var(--text-sub)', textDecoration: 'none',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-sub)'}
                        >
                          {n.assignedTo}
                        </Link>
                      )
                    ) : (
                      <span style={{ fontSize: '10px', color: 'var(--text-sub)', fontStyle: 'italic', opacity: 0.45 }}>
                        Unallocated
                      </span>
                    )}
                  </div>

                  {/* Edit button */}
                  <Link href={`/mobile-numbers/${n.id}`}
                    style={{
                      flexShrink: 0,
                      background: 'var(--bg-input)', border: '1px solid var(--border-main)',
                      color: 'var(--text-sub)', borderRadius: '7px',
                      padding: '4px 10px', fontSize: '10px', fontWeight: 700,
                      textDecoration: 'none', transition: 'all 0.18s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = brandColor;
                      e.currentTarget.style.borderColor = brandColor;
                      e.currentTarget.style.background = `${brandColor}12`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = 'var(--text-sub)';
                      e.currentTarget.style.borderColor = 'var(--border-main)';
                      e.currentTarget.style.background = 'var(--bg-input)';
                    }}
                  >Edit →</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination page={page} limit={limit} totalPages={totalPages} total={total} setPage={setPage} setLimit={setLimit} />
    </div>
  );
}
