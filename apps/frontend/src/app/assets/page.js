'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import Pagination from '@/components/Pagination';
import dynamic from 'next/dynamic';
import { CITY_FILTER_OPTIONS, CITY_COLOR } from '@/lib/locations';

const SearchableSelect = dynamic(() => import('@/components/SearchableSelect'), {
  loading: () => <div style={{ height: '42px', width: '100%', background: 'var(--bg-input)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
});

export default function AssetDirectory() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters State
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('ALL');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('NAME_ASC');
  
  // Dynamic Manifest Lists
  const [locations, setLocations] = useState([]); 
  const [categories, setCategories] = useState([]);
  const [aggStats, setAggStats] = useState({ totalQty: 0, lowStock: 0, categoriesCount: 0, loading: true });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [result, locResult, catResult] = await Promise.all([
          fetchApi(`/items?page=${page}&limit=${limit}`),
          fetchApi('/locations'),
          fetchApi('/categories')
        ]);
        setAssets(result.data || []);
        setTotal(result.total || 0);
        setTotalPages(result.totalPages || 1);
        setLocations(locResult.data || locResult || []);
        setCategories(catResult.data || catResult || []);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [page, limit]);

  // Side-fetch for exact, high-fidelity aggregate metrics
  useEffect(() => {
    async function fetchTelemetry() {
      try {
        const res = await fetchApi('/items?limit=1000');
        const allItems = res.data || [];
        
        let qtySum = 0;
        let lowStockCount = 0;
        
        allItems.forEach(item => {
          const sum = item.stocks ? item.stocks.reduce((a, s) => a + (Number(s.quantity) || 0), 0) : 0;
          qtySum += sum;
          if (sum < 10) lowStockCount++;
        });

        setAggStats({
          totalQty: qtySum,
          lowStock: lowStockCount,
          categoriesCount: new Set(allItems.map(i => i.categoryId?.toString()).filter(Boolean)).size,
          loading: false
        });
      } catch (e) {
        console.error('Asset telemetry error:', e.message);
      }
    }
    fetchTelemetry();
  }, [total]);

  const filtered = assets.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || 
                          (a.description && a.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = catFilter === 'ALL' || (a.category && a.category.name === catFilter);
    
    // Dynamic mapping for cascading Location checks across nested Stocks
    const stockCities = a.stocks && a.stocks.length > 0 ? a.stocks.map(s => s.location?.city).filter(Boolean) : [];
    const stockBranches = a.stocks && a.stocks.length > 0 ? a.stocks.map(s => s.location?.name).filter(Boolean) : [];
    
    const matchesCity = cityFilter === 'ALL' || stockCities.some(c => c === cityFilter);
    const matchesBranch = branchFilter === 'ALL' || stockBranches.some(b => b === branchFilter);
    
    return matchesSearch && matchesCat && matchesCity && matchesBranch;
  }).sort((a, b) => {
    const stockA = a.stocks ? a.stocks.reduce((acc, s) => acc + (Number(s.quantity) || 0), 0) : 0;
    const stockB = b.stocks ? b.stocks.reduce((acc, s) => acc + (Number(s.quantity) || 0), 0) : 0;

    if (sortBy === 'NAME_ASC') return a.name.localeCompare(b.name);
    if (sortBy === 'NAME_DESC') return b.name.localeCompare(a.name);
    if (sortBy === 'STOCK_DESC') return stockB - stockA;
    if (sortBy === 'STOCK_ASC') return stockA - stockB;
    return 0;
  });

  const getStatus = (stockQuantity) => {
    if (stockQuantity <= 0) return 'Out';
    if (stockQuantity < 10) return 'Low';
    return 'Good';
  };

  const getStatusColor = (s) => {
    if (s === 'Out') return '#ef4444';
    if (s === 'Low') return '#f59e0b';
    return '#10b981';
  };

  const getStatusBg = (s) => {
    if (s === 'Out') return 'rgba(239,68,68,0.1)';
    if (s === 'Low') return 'rgba(245,158,11,0.1)';
    return 'rgba(16,185,129,0.1)';
  };

  const selectStyle = {
    height: '100%',
    background: 'var(--bg-panel)', color: 'var(--text-head)', border: '1px solid var(--border-main)',
    borderRadius: '14px', padding: '0 12px', cursor: 'pointer', outline: 'none', fontSize: '13px', minWidth: '130px',
    boxSizing: 'border-box'
  };

  return (
    <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px', boxSizing: 'border-box' }}>
      
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
          }}>Asset Directory</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-sub)', marginTop: '4px' }}>Unified inventory registry.</p>
        </div>
        <Link href="/assets/new" 
          style={{
            background: 'linear-gradient(135deg, #F58220, #245fb4)',
            color: '#fff',
            padding: '10px 18px',
            borderRadius: '14px',
            fontWeight: 600,
            fontSize: '13px',
            textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(255, 90, 31, 0.2)',
            transition: 'all 0.3s ease',
            display: 'inline-flex',
            alignItems: 'center',
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
          + Procure Asset
        </Link>
      </div>

      {/* 📊 Global Asset & Inventory Metrics Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {[
          { label: 'TOTAL SKUS', val: total, sub: 'Unique catalog lines', col: '#0B316F' },
          { label: 'ACTIVE STOCK UNITS', val: aggStats.loading ? '...' : aggStats.totalQty, sub: 'Aggregated units globally', col: '#10b981' },
          { label: 'LOW STOCK ALERTS', val: aggStats.loading ? '...' : aggStats.lowStock, sub: 'Under 10 reserve units', col: '#ef4444' },
          { label: 'CATEGORY MATRIX', val: aggStats.loading ? '...' : aggStats.categoriesCount, sub: 'Unique operational classes', col: '#F58220' }
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

      <div style={{ display: 'flex', gap: '12px', height: '42px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search Asset or SKU"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '240px', height: '100%', background: 'var(--bg-panel)', border: '1px solid var(--border-main)',
            borderRadius: '14px', padding: '0 16px', color: 'var(--text-head)', fontSize: '13px', outline: 'none', boxSizing: 'border-box'
          }}
        />
        <SearchableSelect 
          value={catFilter} 
          onChange={(e) => setCatFilter(e.target.value)} 
          placeholder="All Categories"
          options={[
            { value: 'ALL', label: 'All Categories' },
            ...categories.map(c => ({ value: c.name, label: c.name }))
          ]}
        />

        {/* 📍 Location Filter */}
        <SearchableSelect 
          value={cityFilter} 
          onChange={(e) => { setCityFilter(e.target.value); setBranchFilter('ALL'); }} 
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
            { value: 'NAME_ASC', label: 'Name A-Z' },
            { value: 'NAME_DESC', label: 'Name Z-A' },
            { value: 'STOCK_DESC', label: 'Stock (High)' },
            { value: 'STOCK_ASC', label: 'Stock (Low)' }
          ]}
        />
        
        <div style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-sub)', fontWeight: 600 }}>
          Showing <span style={{ color: 'var(--text-head)' }}>{filtered.length}</span> of {total}
        </div>
      </div>

      {error ? (
        <div style={{ color: 'red' }}>Error: {error}</div>
      ) : loading ? (
        <div style={{ color: 'var(--text-sub)' }}>Loading assets...</div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px',
        }}>
          {filtered.map(a => {
            const stockQuantity = a.stocks ? a.stocks.reduce((acc, s) => acc + (Number(s.quantity) || 0), 0) : 0;
            const locationNames = a.stocks && a.stocks.length > 0 
              ? a.stocks.map(s => `Loc: ${s.location.city || 'Global'} • Branch: ${s.location.name}`).join(', ') 
              : 'Unassigned';
            const statusStr = getStatus(stockQuantity);

            return (
              <Link href={`/assets/${a.id}`} key={a.id.toString()} style={{
                background: 'var(--bg-panel)',
                border: '1px solid var(--border-main)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                textDecoration: 'none',
                minHeight: '220px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.06)';
                e.currentTarget.style.borderColor = '#F58220';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'var(--border-main)';
              }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '10px',
                      background: 'linear-gradient(135deg, #F58220, #245fb4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: '18px',
                      boxShadow: '0 4px 12px rgba(255, 90, 31, 0.15)'
                    }}>
                      {a.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-head)' }}>{a.name}</div>
                      <div style={{ color: 'var(--text-sub)', fontSize: '12px', marginTop: '2px', fontFamily: 'monospace' }}>
                        ID-{a.id.toString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1, border: '1px solid var(--border-main)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-sub)', textTransform: 'uppercase', fontWeight: 700 }}>Category</span>
                    <span style={{ color: 'var(--text-head)', fontSize: '12px', fontWeight: 600 }}>{a.category?.name || 'Uncategorized'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-sub)', textTransform: 'uppercase', fontWeight: 700 }}>Location</span>
                    <span style={{ color: 'var(--text-head)', fontSize: '12px', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '150px' }}>{locationNames}</span>
                  </div>
                </div>

                <div style={{
                  marginTop: 'auto', borderTop: '1px solid var(--border-main)', paddingTop: '16px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <span style={{
                    background: getStatusBg(statusStr), color: getStatusColor(statusStr),
                    padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700,
                    border: `1px solid ${getStatusColor(statusStr)}30`
                  }}>
                    {statusStr}
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-head)', fontFamily: 'monospace' }}>
                    {stockQuantity} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-sub)', fontFamily: 'sans-serif' }}>Units</span>
                  </span>
                </div>
              </Link>
            );
          })}
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
