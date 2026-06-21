'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import Pagination from '@/components/Pagination';
import dynamic from 'next/dynamic';

const SearchableSelect = dynamic(() => import('@/components/SearchableSelect'), {
  loading: () => <div style={{ height: '42px', width: '100%', background: 'var(--bg-input)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
});
const FileUpload = dynamic(() => import('@/components/FileUpload'), {
  loading: () => <div style={{ height: '80px', width: '100%', background: 'var(--bg-input)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
});

export default function InternetBills() {
  const [bills, setBills] = useState([]);
  const [locations, setLocations] = useState([]); // For branch select dropdowns
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  const [sortBy, setSortBy] = useState('PROVIDER_ASC');

  // Edit Connection Modal State
  const [selectedBill, setSelectedBill] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    provider: '',
    planDetails: 'Retail',
    speed: '',
    monthlyCost: 0,
    dueDate: '',
    billingCycle: 'MONTHLY',
    status: 'ACTIVE',
    locationId: '',
    attachments: ''
  });
  const [selectedCity, setSelectedCity] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Advanced Dynamic Telemetry Aggregates
  const [aggStats, setAggStats] = useState({ active: 0, totalSpeed: 0, cost: 0, providers: [], loading: true });

  // Brand Vector Gradient Maps for various ISPs
  const getISPBrandInfo = (pName) => {
    const name = pName?.toLowerCase() || '';
    if (name.includes('act')) return { gradient: 'linear-gradient(135deg, #ef4444, #b91c1c)', color: '#ef4444' };
    if (name.includes('excitel')) return { gradient: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#f97316' };
    if (name.includes('jio')) return { gradient: 'linear-gradient(135deg, #245fb4, #1e3a8a)', color: '#245fb4' };
    if (name.includes('airtel')) return { gradient: 'linear-gradient(135deg, #dc2626, #991b1b)', color: '#dc2626' };
    if (name.includes('tata')) return { gradient: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#0284c7' };
    if (name.includes('bsnl')) return { gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#f59e0b' };
    return { gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#6366f1' }; // Default Purple-Indigo
  };

  async function loadData() {
    setLoading(true);
    try {
      const [billResult, locResult] = await Promise.all([
        fetchApi(`/internet-bills?page=${page}&limit=${limit}`),
        fetchApi('/locations')
      ]);
      
      setBills(billResult.data || []);
      setTotal(billResult.total || 0);
      setTotalPages(billResult.totalPages || 1);
      setLocations(locResult.data || locResult || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [page, limit]);

  // Run parallel side-fetch to calculate 100% accurate stats across the entire fleet
  useEffect(() => {
    async function fetchAggregates() {
      try {
        const res = await fetchApi('/internet-bills?limit=1000');
        const raw = res.data || [];
        const active = raw.filter(b => b.status === 'ACTIVE').length;
        const totalSpeed = raw.reduce((sum, b) => sum + (Number(b.speed) || 0), 0);
        const cost = raw.reduce((sum, b) => sum + (Number(b.monthlyCost) || 0), 0);
        const providers = Array.from(new Set(raw.map(b => b.provider).filter(Boolean)));
        
        setAggStats({ active, totalSpeed, cost, providers, loading: false });
      } catch (e) {
        console.error('Aggregated network diagnostics sync failed:', e.message);
      }
    }
    fetchAggregates();
  }, [total]);

  // Opens modal and pre-fills state
  const openEditModal = (bill) => {
    setSelectedBill(bill);
    setEditForm({
      provider: bill.provider || '',
      planDetails: bill.planDetails || 'Retail',
      speed: bill.speed ? bill.speed.toString() : '',
      monthlyCost: bill.monthlyCost || 0,
      dueDate: bill.dueDate ? bill.dueDate.substring(0, 10) : '',
      billingCycle: bill.billingCycle || 'MONTHLY',
      status: bill.status || 'ACTIVE',
      locationId: bill.locationId ? bill.locationId.toString() : '',
      attachments: bill.attachments || ''
    });
    setSelectedCity(bill.location?.city || '');
    setIsEditModalOpen(true);
  };

  // Submits edited fields back to backend PUT endpoint
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedBill) return;
    
    try {
      setIsSaving(true);
      await fetchApi(`/internet-bills/${selectedBill.id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm)
      });
      setIsEditModalOpen(false);
      loadData(); // Refresh from DB
    } catch (err) {
      alert(`Failed to update Connection: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusToggle = async (id, currentStatus, event) => {
    event.stopPropagation(); // Prevent opening the edit modal!
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await fetchApi(`/internet-bills/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      setBills(bills.map(b => b.id === id ? { ...b, status: newStatus } : b));
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const filtered = bills.filter(b => {
    const matchesSearch = b.provider?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const matchesCity = cityFilter === 'ALL' || (b.location && b.location.city === cityFilter);
    const matchesBranch = branchFilter === 'ALL' || (b.location && b.location.name === branchFilter);
    return matchesSearch && matchesStatus && matchesCity && matchesBranch;
  }).sort((a, b) => {
    if (sortBy === 'PROVIDER_ASC') return a.provider?.localeCompare(b.provider);
    if (sortBy === 'COST_DESC') return b.monthlyCost - a.monthlyCost;
    if (sortBy === 'COST_ASC') return a.monthlyCost - b.monthlyCost;
    return 0;
  });

  const selectStyle = {
    height: '100%',
    background: 'var(--bg-panel)', color: 'var(--text-head)', border: '1px solid var(--border-main)',
    borderRadius: '14px', padding: '0 12px', cursor: 'pointer', outline: 'none', fontSize: '13px', minWidth: '140px',
    boxSizing: 'border-box', fontWeight: 600
  };

  const inputStyle = {
    width: '100%', padding: '12px', background: 'var(--bg-input)', border: '1px solid var(--border-main)',
    borderRadius: '14px', color: 'var(--text-head)', fontSize: '14px', marginTop: '6px', outline: 'none', boxSizing: 'border-box'
  };

  const providerDisplay = aggStats.loading 
    ? 'Scanning...' 
    : aggStats.providers.length > 0 
      ? aggStats.providers.slice(0, 3).join(' / ') 
      : 'Scanning...';

  const totalSpeedDisplay = aggStats.loading 
    ? '...' 
    : aggStats.totalSpeed >= 1000 
      ? `${(aggStats.totalSpeed / 1000).toFixed(1)} Gbps` 
      : `${aggStats.totalSpeed} Mbps`;

  return (
    <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: '28px', boxSizing: 'border-box' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '13px', color: 'var(--text-sub)', marginBottom: '6px' }}>Infrastructure Telemetry</div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, var(--text-head) 30%, #F58220 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>ISP & Net Diagnostics</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-sub)', marginTop: '4px' }}>Broadband, SME lines, and dedicated corporate leased line (ILL) arrays.</p>
        </div>
        <button style={{
          background: 'linear-gradient(135deg, #F58220, #245fb4)',
          color: '#fff',
          border: 'none',
          borderRadius: '14px',
          padding: '12px 24px',
          fontWeight: 700,
          fontSize: '13px',
          cursor: 'pointer',
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
          + Add Connection
        </button>
      </div>

      {/* 📊 Network Infrastructure Metrics Header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {[
          { label: 'Total Assets', val: total, sub: 'Connected ISP Nodes', col: '#0B316F' },
          { label: 'Operational', val: aggStats.loading ? '...' : aggStats.active, sub: 'Active corporate pipes', col: '#10b981' },
          { label: 'Provider Matrix', val: providerDisplay, sub: `${aggStats.providers.length || 'Scanning'} Live ISP partners`, col: '#F58220' },
          { label: 'Aggregate Cost', val: aggStats.loading ? '...' : `₹${Number(aggStats.cost).toLocaleString('en-IN')}`, sub: 'Monthly telecom pool', col: '#8b5cf6' }
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

      {/* 🛠️ Premium Search & Filter Utilities Bar */}
      <div style={{ display: 'flex', gap: '12px', height: '44px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search ISP / Provider..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '260px', height: '100%', background: 'var(--bg-panel)', border: '1px solid var(--border-main)',
            borderRadius: '14px', padding: '0 16px', color: 'var(--text-head)', fontSize: '13px', outline: 'none', boxSizing: 'border-box'
          }}
        />
        <SearchableSelect 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)} 
          placeholder="All Statuses"
          options={[
            { value: 'ALL', label: 'All Statuses' },
            { value: 'ACTIVE', label: 'Active Pipe' },
            { value: 'INACTIVE', label: 'Inactive / Standby' }
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
            { value: 'PROVIDER_ASC', label: 'Provider A-Z' },
            { value: 'COST_DESC', label: 'Cost: Highest' },
            { value: 'COST_ASC', label: 'Cost: Lowest' }
          ]}
        />
        
        <div style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-sub)', fontWeight: 700 }}>
          Matched Nodes: <span style={{ color: 'var(--accent)' }}>{filtered.length}</span> of {total}
        </div>
      </div>

      {/* 📄 Main Asset Connection Matrix Grid */}
      {error ? (
        <div className="glass-card" style={{ color: '#ef4444', padding: '24px', borderRadius: '16px', textAlign: 'center', fontWeight: 600 }}>
          ⚠️ Net Diagnostics Failure: {error}
        </div>
      ) : loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px', color: 'var(--text-sub)', fontSize: '14px', fontWeight: 500 }}>
          Interrogating active corporate pipes...
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '20px',
        }}>
          {filtered.map(b => {
            const brand = getISPBrandInfo(b.provider);
            
            return (
              <div 
                key={b.id.toString()} 
                onClick={() => openEditModal(b)}
                className="glass-card"
                style={{
                  border: '1px solid var(--border-main)',
                  borderRadius: '24px',
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '22px',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = brand.color;
                  e.currentTarget.style.boxShadow = `0 12px 40px ${brand.color}09`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = 'var(--border-main)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Top Segment: Provider Badge & Status Block */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '14px',
                      background: b.status === 'ACTIVE' ? brand.gradient : 'var(--bg-input)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 800, fontSize: '20px',
                      boxShadow: b.status === 'ACTIVE' ? `0 4px 14px ${brand.color}40` : 'none',
                      border: b.status === 'ACTIVE' ? 'none' : '1px solid var(--border-main)'
                    }}>
                      {b.provider?.substring(0,2).toUpperCase() || '??'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--text-head)', letterSpacing: '-0.3px' }}>{b.provider}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                        <div style={{ color: brand.color, fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ opacity: 0.8 }}>📍 Location:</span> {b.location?.city || 'Global'}
                        </div>
                        <div style={{ color: 'var(--text-sub)', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ opacity: 0.8 }}>🏢 Branch:</span> {b.location?.name || 'Unlinked Hub'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => handleStatusToggle(b.id, b.status, e)}
                    style={{
                      background: b.status === 'ACTIVE' ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.04)',
                      color: b.status === 'ACTIVE' ? '#10b981' : 'var(--text-sub)',
                      border: `1px solid ${b.status === 'ACTIVE' ? 'rgba(16,185,129,0.2)' : 'var(--border-main)'}`,
                      padding: '6px 12px', borderRadius: '100px', fontSize: '10px', fontWeight: 800, cursor: 'pointer', letterSpacing: '0.5px', textTransform: 'uppercase'
                    }}
                  >
                    {b.status}
                  </button>
                </div>

                {/* Diagnostics Data Node Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '12px' }}>
                  <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '16px', border: '1px solid var(--border-main)' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-sub)', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Line Speed</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#60a5fa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      ⚡ {b.speed ? `${b.speed} Mbps` : 'Basic Tier'}
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '16px', border: '1px solid var(--border-main)' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-sub)', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cycle & Due</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-head)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      📅 {b.dueDate ? new Date(b.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Details String Pill */}
                <div style={{ background: 'var(--bg-input)', padding: '12px 16px', borderRadius: '14px', border: '1px solid var(--border-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: brand.color }} />
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {b.planDetails || 'Corporate Broadband Line'}
                  </div>
                </div>

                {/* Dynamic File Counter Badge */}
                {b.attachments && JSON.parse(b.attachments).length > 0 && (
                  <div style={{ fontSize:'11px', fontWeight:700, color:'#F58220', display:'flex', alignItems:'center', gap:'4px', opacity:0.9 }}>
                    📎 {JSON.parse(b.attachments).length} Linked Documents
                  </div>
                )}

                {/* Bottom Segment: Cost Calculation */}
                <div style={{
                  marginTop: 'auto', borderTop: '1px solid var(--border-main)', paddingTop: '20px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-sub)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Monthly Spend</span>
                  <span style={{ fontSize: '22px', fontWeight: 850, color: 'var(--text-head)', letterSpacing: '-0.5px' }}>
                    ₹{Number(b.monthlyCost).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}


      {/* Pagination Widget */}
      <Pagination 
        page={page} 
        limit={limit} 
        totalPages={totalPages} 
        total={total} 
        setPage={setPage} 
        setLimit={setLimit} 
      />

      {/* HIGH-FIDELITY EDIT ISP CONNECTION MODAL */}
      {isEditModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-panel)', border: '1px solid var(--border-main)',
            borderRadius: '16px', width: '100%', maxWidth: '500px', padding: '32px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)', boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-head)', margin: 0 }}>Edit ISP Connection</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-sub)', fontSize: '24px', cursor: 'pointer' }}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-sub)', fontWeight: 700 }}>ISP / PROVIDER NAME</label>
                <input 
                  type="text" required 
                  value={editForm.provider}
                  onChange={e => setEditForm({ ...editForm, provider: e.target.value })}
                  style={inputStyle} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#60a5fa', fontWeight: 700 }}>📍 OFFICE CITY</label>
                  <select 
                    required
                    value={selectedCity}
                    onChange={e => {
                      setSelectedCity(e.target.value);
                      setEditForm({ ...editForm, locationId: '' }); // Reset branch when city changes!
                    }}
                    style={{ ...inputStyle, borderColor: 'rgba(96,165,250,0.4)', background: 'rgba(96,165,250,0.02)' }}
                  >
                    <option value="">-- Select City --</option>
                    <option value="Vijayawada">Vijayawada</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Visakhapatnam">Visakhapatnam</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-sub)', fontWeight: 700 }}>🏢 CORPORATE BRANCH</label>
                  <select 
                    required
                    disabled={!selectedCity}
                    value={editForm.locationId}
                    onChange={e => setEditForm({ ...editForm, locationId: e.target.value })}
                    style={{ ...inputStyle, opacity: selectedCity ? 1 : 0.5 }}
                  >
                    <option value="">{selectedCity ? `-- Select Branch --` : 'Choose City First'}</option>
                    {locations
                      .filter(loc => loc.city === selectedCity)
                      .map(loc => (
                        <option key={loc.id.toString()} value={loc.id.toString()}>{loc.name}</option>
                      ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-sub)', fontWeight: 700 }}>MONTHLY COST (INR)</label>
                  <input 
                    type="number" required step="0.01"
                    value={editForm.monthlyCost}
                    onChange={e => setEditForm({ ...editForm, monthlyCost: e.target.value })}
                    style={inputStyle} 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-sub)', fontWeight: 700 }}>BILLING DUE DATE</label>
                  <input 
                    type="date" required
                    value={editForm.dueDate}
                    onChange={e => setEditForm({ ...editForm, dueDate: e.target.value })}
                    style={inputStyle} 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-sub)', fontWeight: 700 }}>BILLING CYCLE</label>
                  <select 
                    value={editForm.billingCycle}
                    onChange={e => setEditForm({ ...editForm, billingCycle: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="MONTHLY">Monthly Billing</option>
                    <option value="QUARTERLY">Quarterly Billing</option>
                    <option value="YEARLY">Yearly Billing</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-sub)', fontWeight: 700 }}>STATUS</label>
                  <select 
                    value={editForm.status}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#60a5fa', fontWeight: 700 }}>⚡ PLAN SPEED (MBPS)</label>
                  <input 
                    type="number" required min="1"
                    value={editForm.speed}
                    onChange={e => setEditForm({ ...editForm, speed: e.target.value })}
                    style={{ ...inputStyle, borderColor: 'rgba(96,165,250,0.4)' }} 
                    placeholder="e.g. 100, 300, 1000"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-sub)', fontWeight: 700 }}>PLAN DETAILS</label>
                  <select 
                    value={editForm.planDetails}
                    onChange={e => setEditForm({ ...editForm, planDetails: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="Retail">Retail</option>
                    <option value="SME">SME</option>
                    <option value="ILL">ILL (Leased Line)</option>
                  </select>
                </div>
              </div>



              <div>
                <FileUpload 
                  value={editForm.attachments} 
                  onChange={(val) => setEditForm({ ...editForm, attachments: val })}
                  label="Invoice & Payment Attachments"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  style={{
                    flex: 1, padding: '12px', background: 'var(--bg-input)', color: 'var(--text-head)',
                    border: '1px solid var(--border-main)', borderRadius: '14px', cursor: 'pointer', fontWeight: 600
                  }}>
                  Cancel
                </button>
                <button 
                  type="submit" disabled={isSaving}
                  style={{
                    flex: 1, padding: '12px', background: '#F58220', color: '#fff',
                    border: 'none', borderRadius: '14px', cursor: 'pointer', fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(255,95,56,0.25)'
                  }}>
                  {isSaving ? 'Updating Connection...' : 'Save Connection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
