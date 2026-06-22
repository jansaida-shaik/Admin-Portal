'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import Pagination from '@/components/Pagination';
import dynamic from 'next/dynamic';
import { CITY_FILTER_OPTIONS } from '@/lib/locations';

const SearchableSelect = dynamic(() => import('@/components/SearchableSelect'), {
  loading: () => <div style={{ height: '42px', width: '100%', background: 'var(--bg-input)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
});

export default function Directory() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters State
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('NAME_ASC');
  const [locations, setLocations] = useState([]);
  
  const [aggStats, setAggStats] = useState({ admins: 0, totalAssignments: 0, locCoverage: 0, loading: true });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [result, locResult] = await Promise.all([
          fetchApi(`/users?page=${page}&limit=${limit}`),
          fetchApi('/locations')
        ]);
        setEmployees(result.data || []);
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
  }, [page, limit]);

  // Secondary async data telemetry loading for true global aggregations
  useEffect(() => {
    async function fetchGlobalStats() {
      try {
        const res = await fetchApi('/users?limit=1000');
        const allUsers = res.data || [];
        
        let adminCount = 0;
        let assignmentSum = 0;
        const uniqueLocs = new Set();

        allUsers.forEach(u => {
          if (u.role === 'ADMIN') adminCount++;
          assignmentSum += (u._count?.assignments || 0) + (u._count?.mobileNumbers || 0);
          if (u.city) uniqueLocs.add(u.city);
          else if (u.loc) uniqueLocs.add(u.loc);
        });

        setAggStats({
          admins: adminCount,
          totalAssignments: assignmentSum,
          locCoverage: uniqueLocs.size || 1,
          loading: false
        });
      } catch (e) {
        console.error('Employee stats fetch error:', e.message);
      }
    }
    fetchGlobalStats();
  }, [total]);

  const filtered = employees.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) || 
                          e.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || e.role === roleFilter;
    const matchesCity = cityFilter === 'ALL' || e.city === cityFilter || e.loc === cityFilter;
    const matchesBranch = branchFilter === 'ALL' || e.branch === branchFilter || e.location === branchFilter;
    return matchesSearch && matchesRole && matchesCity && matchesBranch;
  }).sort((a, b) => {
    const countA = (a._count?.assignments || 0) + (a._count?.mobileNumbers || 0);
    const countB = (b._count?.assignments || 0) + (b._count?.mobileNumbers || 0);
    
    if (sortBy === 'NAME_ASC') return a.name.localeCompare(b.name);
    if (sortBy === 'NAME_DESC') return b.name.localeCompare(a.name);
    if (sortBy === 'COUNT_DESC') return countB - countA;
    if (sortBy === 'COUNT_ASC') return countA - countB;
    return 0;
  });

  const selectStyle = {
    height: '100%',
    background: 'var(--bg-panel)', color: 'var(--text-head)', border: '1px solid var(--border-main)',
    borderRadius: '14px', padding: '0 12px', cursor: 'pointer', outline: 'none', fontSize: '13px', minWidth: '120px',
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
          }}>Employee Directory</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-sub)', marginTop: '4px' }}>Resource accountability registry.</p>
        </div>
        <Link href="/employees/new" 
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
          + Add Employee
        </Link>
      </div>

      {/* 📊 Personnel & Employee Custody Analytics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {[
          { label: 'TOTAL PERSONNEL', val: total, sub: 'Active registered accounts', col: '#F58220' },
          { label: 'SYSTEM ADMINISTRATORS', val: aggStats.loading ? '...' : aggStats.admins, sub: 'Elevated platform access', col: '#ef4444' },
          { label: 'ACTIVE ASSIGNMENTS', val: aggStats.loading ? '...' : aggStats.totalAssignments, sub: 'Deployments & SIM assets', col: '#10b981' },
          { label: 'LOCATION SPREAD', val: aggStats.loading ? '...' : aggStats.locCoverage, sub: 'Unique operating regions', col: '#0B316F' }
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
          placeholder="Find Employee"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '220px', height: '100%', background: 'var(--bg-panel)', border: '1px solid var(--border-main)',
            borderRadius: '14px', padding: '0 16px', color: 'var(--text-head)', fontSize: '13px', outline: 'none', boxSizing: 'border-box'
          }}
        />
        <SearchableSelect 
          value={roleFilter} 
          onChange={(e) => setRoleFilter(e.target.value)} 
          placeholder="All Roles"
          options={[
            { value: 'ALL', label: 'All Roles' },
            { value: 'ADMIN', label: 'Admin' },
            { value: 'STAFF', label: 'Staff' }
          ]}
        />

        {/* 📍 Location Filter */}
        <SearchableSelect 
          value={cityFilter} 
          onChange={(e) => { setCityFilter(e.target.value); setBranchFilter('ALL'); }} 
          placeholder="All Locations"
          options={CITY_FILTER_OPTIONS}
        />

        {/* 🏢 Branch Filter (Cascades depending on selected City!) */}
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
            { value: 'COUNT_DESC', label: 'Assets (High)' },
            { value: 'COUNT_ASC', label: 'Assets (Low)' }
          ]}
        />
        
        <div style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-sub)', fontWeight: 600 }}>
          Staff count: <span style={{ color: 'var(--text-head)' }}>{filtered.length}</span> / {total}
        </div>
      </div>

      {error ? (
        <div style={{ color: 'red' }}>Error: {error}</div>
      ) : loading ? (
        <div style={{ color: 'var(--text-sub)' }}>Loading employees...</div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px',
        }}>
          {filtered.map(emp => {
            const assignmentCount = (emp._count?.assignments || 0) + (emp._count?.mobileNumbers || 0);
            return (
              <Link href={`/employees/${emp.id}`} key={emp.id.toString()} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--border-main)',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
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
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '16px',
                      background: 'linear-gradient(135deg, #F58220, #245fb4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: '20px',
                      boxShadow: '0 4px 12px rgba(255, 90, 31, 0.15)'
                    }}>
                      {emp.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-head)', fontSize: '15px' }}>{emp.name}</div>
                      <div style={{ color: 'var(--text-sub)', fontSize: '13px', marginTop: '2px' }}>{emp.email}</div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.04)'
                  }}>
                    <span style={{
                      background: 'rgba(255,95,56,0.1)', padding: '4px 10px',
                      borderRadius: '20px', fontSize: '11px', fontWeight: 700, color: '#F58220'
                    }}>
                      {emp.role}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--text-sub)' }}>
                      <span style={{ fontWeight: 800, color: 'var(--text-head)' }}>{assignmentCount}</span> Assigned
                    </span>
                  </div>
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
