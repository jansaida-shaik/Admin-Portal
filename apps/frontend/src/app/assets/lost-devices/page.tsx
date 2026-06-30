'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { usePaginatedData } from '@/lib/usePaginatedData';
import Pagination from '@/components/Pagination';
import dynamic from 'next/dynamic';

const SearchableSelect = dynamic(() => import('@/components/SearchableSelect'), {
  loading: () => <div style={{ height: '42px', width: '100%', background: 'var(--bg-input)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
});

export default function LostDevicesDirectory() {
  const {
    data: incidents,
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
  } = usePaginatedData('/lost-devices');

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({
    itemId: '', userId: '', locationId: '', status: 'LOST', incidentDate: '', description: '', insuranceDetails: ''
  });

  // Stats State
  const [aggStats, setAggStats] = useState({ lostCount: 0, damagedCount: 0, loading: true });

  useEffect(() => {
    async function fetchTelemetry() {
      try {
        const res = await fetchApi('/lost-devices?limit=1000');
        const allIncidents = res.data || [];
        setAggStats({
          lostCount: allIncidents.filter(i => i.status === 'LOST').length,
          damagedCount: allIncidents.filter(i => i.status === 'DAMAGED').length,
          loading: false
        });
      } catch (e) {
        console.error('Telemetry error:', e.message);
      }
    }
    fetchTelemetry();
  }, [total]);

  const fetchSupportData = async () => {
    if (items.length > 0) return; // already fetched
    try {
      const [it, loc] = await Promise.all([
        fetchApi('/items?limit=1000'),
        fetchApi('/locations')
      ]);
      setItems(it.data || []);
      setLocations(loc.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = incidents.filter(i => {
    const matchesSearch = (i.item?.name || '').toLowerCase().includes(search.toLowerCase()) || 
                          (i.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'LOST': return '#ef4444';
      case 'STOLEN': return '#dc2626';
      case 'DAMAGED': return '#f59e0b';
      case 'UNDER_REPAIR': return '#3b82f6';
      case 'RECOVERED': return '#10b981';
      default: return '#6b7280';
    }
  };

  const handleReportOpen = () => {
    setIsModalOpen(true);
    fetchSupportData();
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await fetchApi('/lost-devices', { method: 'POST', body: JSON.stringify(formData) });
      setIsModalOpen(false);
      window.location.reload(); // Quick refresh to show new data
    } catch (err) {
      console.error(err);
      alert('Failed to report incident');
    }
  };

  return (
    <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px', boxSizing: 'border-box', padding: '24px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{
            fontSize: '28px', fontWeight: 800,
            background: 'linear-gradient(135deg, var(--text-head) 30%, #F58220 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            margin: 0, letterSpacing: '-0.02em'
          }}>Lost & Damaged Devices</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-sub)', marginTop: '4px' }}>Track incidents, repairs, and missing assets.</p>
        </div>
        <button onClick={handleReportOpen} style={{
          background: 'linear-gradient(135deg, #ef4444, #b91c1c)', color: '#fff', padding: '10px 18px',
          border: 'none', borderRadius: '14px', fontWeight: 600, fontSize: '13px', cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)', transition: 'all 0.3s ease', display: 'inline-flex', alignItems: 'center'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.35)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.2)';
        }}
        >
          + Report Incident
        </button>
      </div>

      {/* 📊 Analytics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'TOTAL INCIDENTS', val: total, sub: 'All reported cases', col: '#245fb4' },
          { label: 'LOST ASSETS', val: aggStats.loading ? '...' : aggStats.lostCount, sub: 'Currently unrecovered', col: '#ef4444' },
          { label: 'DAMAGED / REPAIR', val: aggStats.loading ? '...' : aggStats.damagedCount, sub: 'Pending maintenance', col: '#f59e0b' },
          { label: 'RECOVERY RATE', val: aggStats.loading ? '...' : `${total > 0 ? Math.round(((total - aggStats.lostCount - aggStats.damagedCount) / total) * 100) : 0}%`, sub: 'Resolved incidents', col: '#10b981' }
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
          placeholder="Search Incidents"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{
            width: '220px', height: '100%', background: 'var(--bg-panel)', border: '1px solid var(--border-main)',
            borderRadius: '14px', padding: '0 16px', color: 'var(--text-head)', fontSize: '13px', outline: 'none', boxSizing: 'border-box'
          }}
        />
        
        <SearchableSelect 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)} 
          placeholder="Incident Status"
          options={[
            { value: 'ALL', label: 'All Statuses' },
            { value: 'LOST', label: 'Lost' },
            { value: 'DAMAGED', label: 'Damaged' },
            { value: 'STOLEN', label: 'Stolen' },
            { value: 'UNDER_REPAIR', label: 'Under Repair' },
            { value: 'RECOVERED', label: 'Recovered' }
          ]}
        />

        <div style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-sub)', fontWeight: 600 }}>
          Displaying <span style={{ color: 'var(--text-head)' }}>{filtered.length}</span> of {total}
        </div>
      </div>

      {error ? (
        <div style={{ color: 'red' }}>Error: {error}</div>
      ) : loading ? (
        <div style={{ color: 'var(--text-sub)', textAlign: 'center', padding: '40px' }}>Loading incident reports...</div>
      ) : (
        <div className="glass-card" style={{ borderRadius: '24px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-main)' }}>
                <th style={{ padding: '16px 24px', color: 'var(--text-sub)', fontSize: '12px', textTransform: 'uppercase' }}>Asset</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-sub)', fontSize: '12px', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-sub)', fontSize: '12px', textTransform: 'uppercase' }}>Location</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-sub)', fontSize: '12px', textTransform: 'uppercase' }}>Incident Date</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-sub)', fontSize: '12px', textTransform: 'uppercase' }}>Description</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-sub)' }}>No incidents reported.</td></tr>
              ) : (
                filtered.map((inc: any) => {
                  const color = getStatusColor(inc.status);
                  return (
                    <tr key={inc.id} style={{ borderBottom: '1px solid var(--border-main)' }}>
                      <td style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-head)' }}>{inc.item?.name}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ 
                          padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700,
                          background: `${color}15`, color: color, border: `1px solid ${color}30`
                        }}>
                          {inc.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', color: 'var(--text-sub)' }}>{inc.location?.name || 'Unknown'}</td>
                      <td style={{ padding: '16px 24px', color: 'var(--text-head)' }}>{new Date(inc.incidentDate).toLocaleDateString()}</td>
                      <td style={{ padding: '16px 24px', color: 'var(--text-sub)', fontSize: '13px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {inc.description}
                      </td>
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

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px'
        }}>
          <div className="glass-card" style={{ background: 'var(--bg-panel)', width: '100%', maxWidth: '600px', borderRadius: '24px', padding: '32px' }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: 800, color: 'var(--text-head)' }}>Report Incident</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '8px' }}>ASSET</label>
                  <select required value={formData.itemId} onChange={e => setFormData({...formData, itemId: e.target.value})} style={{
                    width: '100%', padding: '12px', background: 'var(--bg-input)', border: '1px solid var(--border-main)', borderRadius: '12px', color: 'var(--text-head)', outline: 'none'
                  }}>
                    <option value="">Select Asset...</option>
                    {items.map((i:any) => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '8px' }}>STATUS</label>
                  <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{
                    width: '100%', padding: '12px', background: 'var(--bg-input)', border: '1px solid var(--border-main)', borderRadius: '12px', color: 'var(--text-head)', outline: 'none'
                  }}>
                    <option value="LOST">Lost</option>
                    <option value="DAMAGED">Damaged</option>
                    <option value="STOLEN">Stolen</option>
                    <option value="UNDER_REPAIR">Under Repair</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '8px' }}>LOCATION (BRANCH)</label>
                  <select value={formData.locationId} onChange={e => setFormData({...formData, locationId: e.target.value})} style={{
                    width: '100%', padding: '12px', background: 'var(--bg-input)', border: '1px solid var(--border-main)', borderRadius: '12px', color: 'var(--text-head)', outline: 'none'
                  }}>
                    <option value="">Select Branch...</option>
                    {locations.map((l:any) => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '8px' }}>INCIDENT DATE</label>
                  <input type="date" required value={formData.incidentDate} onChange={e => setFormData({...formData, incidentDate: e.target.value})} style={{
                    width: '100%', padding: '12px', background: 'var(--bg-input)', border: '1px solid var(--border-main)', borderRadius: '12px', color: 'var(--text-head)', outline: 'none', colorScheme: 'dark'
                  }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '8px' }}>DESCRIPTION</label>
                <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{
                  width: '100%', padding: '12px', background: 'var(--bg-input)', border: '1px solid var(--border-main)', borderRadius: '12px', color: 'var(--text-head)', outline: 'none'
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{
                  background: 'transparent', color: 'var(--text-head)', border: '1px solid var(--border-main)', padding: '12px 24px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer'
                }}>Cancel</button>
                <button type="submit" style={{
                  background: '#ef4444', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer'
                }}>Submit Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
