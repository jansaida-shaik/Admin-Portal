'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import { usePaginatedData } from '@/lib/usePaginatedData';
import Pagination from '@/components/Pagination';

export default function AssetGroupsDirectory() {
  const {
    data: categories,
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
  } = usePaginatedData('/categories');
  
  // Modal State
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupItems, setGroupItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [itemSearchTerm, setItemSearchTerm] = useState('');

  // Stats State
  const [aggStats, setAggStats] = useState({ totalAssets: 0, totalStock: 0, loading: true });

  useEffect(() => {
    async function fetchTelemetry() {
      try {
        const res = await fetchApi('/items?limit=1000');
        const allItems = res.data || [];
        let stockCount = 0;
        allItems.forEach((i: any) => {
          stockCount += i.stocks ? i.stocks.reduce((acc: number, s: any) => acc + (Number(s.quantity) || 0), 0) : 0;
        });
        setAggStats({
          totalAssets: allItems.length,
          totalStock: stockCount,
          loading: false
        });
      } catch (e) {
        console.error('Telemetry error:', e.message);
      }
    }
    fetchTelemetry();
  }, []);

  const openGroupModal = async (cat: any) => {
    setSelectedGroup(cat);
    setLoadingItems(true);
    setItemSearchTerm('');
    try {
      const res = await fetchApi(`/items?limit=1000`);
      const allItems = res.data || [];
      const filtered = allItems.filter((i:any) => i.categoryId === cat.id || (i.category && i.category.id === cat.id));
      setGroupItems(filtered);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingItems(false);
    }
  };

  const closeGroupModal = () => {
    setSelectedGroup(null);
    setGroupItems([]);
  };

  const getCategoryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('laptop')) return '💻';
    if (n.includes('desktop')) return '🖥️';
    if (n.includes('printer')) return '🖨️';
    if (n.includes('network') || n.includes('router') || n.includes('switch')) return '🌐';
    if (n.includes('server')) return '🗄️';
    if (n.includes('mobile') || n.includes('phone')) return '📱';
    if (n.includes('accessory') || n.includes('mouse') || n.includes('keyboard')) return '🖱️';
    return '📦';
  };

  const filteredModalItems = groupItems.filter((i:any) => 
    i.name.toLowerCase().includes(itemSearchTerm.toLowerCase()) || 
    (i.description && i.description.toLowerCase().includes(itemSearchTerm.toLowerCase()))
  );

  const filteredCategories = categories.filter((c:any) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px', boxSizing: 'border-box', padding: '24px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{
            fontSize: '28px', fontWeight: 800,
            background: 'linear-gradient(135deg, var(--text-head) 30%, #F58220 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            margin: 0, letterSpacing: '-0.02em'
          }}>Asset Groups</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-sub)', marginTop: '4px' }}>Categorized hardware and IT inventory.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/assets/lost-devices" style={{
            background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '10px 18px',
            borderRadius: '14px', fontWeight: 600, fontSize: '13px', textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            ⚠️ Lost & Damaged
          </Link>
          <Link href="/assets/new" style={{
            background: 'linear-gradient(135deg, #F58220, #245fb4)', color: '#fff', padding: '10px 18px',
            borderRadius: '14px', fontWeight: 600, fontSize: '13px', textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', boxShadow: '0 4px 12px rgba(255, 90, 31, 0.2)', transition: 'all 0.3s ease'
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
      </div>

      {/* 📊 Analytics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'ASSET GROUPS', val: total, sub: 'Registered categories', col: '#245fb4' },
          { label: 'UNIQUE SKUS', val: aggStats.loading ? '...' : aggStats.totalAssets, sub: 'Hardware variations', col: '#10b981' },
          { label: 'TOTAL STOCK', val: aggStats.loading ? '...' : aggStats.totalStock, sub: 'Global active units', col: '#F58220' },
          { label: 'LOST/DAMAGED', val: 'Tracked', sub: 'Dedicated module active', col: '#ef4444' }
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
          placeholder="Search Groups..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{
            width: '220px', height: '100%', background: 'var(--bg-panel)', border: '1px solid var(--border-main)',
            borderRadius: '14px', padding: '0 16px', color: 'var(--text-head)', fontSize: '13px', outline: 'none', boxSizing: 'border-box'
          }}
        />
        <div style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-sub)', fontWeight: 600 }}>
          Displaying <span style={{ color: 'var(--text-head)' }}>{filteredCategories.length}</span> of {total}
        </div>
      </div>

      {error ? (
        <div style={{ color: 'red' }}>Error: {error}</div>
      ) : loading ? (
        <div style={{ color: 'var(--text-sub)', textAlign: 'center', padding: '40px' }}>Loading groups...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {filteredCategories.map((cat: any) => (
            <div 
              key={cat.id.toString()}
              onClick={() => openGroupModal(cat)}
              className="glass-card"
              style={{
                padding: '32px 24px', borderRadius: '24px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', transition: 'all 0.3s ease', border: '1px solid var(--border-main)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = '#F58220';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(245, 130, 32, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = 'var(--border-main)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px', background: 'rgba(255,255,255,0.02)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {getCategoryIcon(cat.name)}
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 800, color: 'var(--text-head)' }}>{cat.name}</h3>
              <div style={{ fontSize: '12px', color: 'var(--text-sub)', fontWeight: 700, background: 'var(--bg-input)', padding: '6px 14px', borderRadius: '100px', border: '1px solid var(--border-main)' }}>
                View Inventory →
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination 
        page={page} limit={limit} totalPages={totalPages} total={total} 
        setPage={setPage} setLimit={setLimit} 
      />

      {selectedGroup && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '24px'
        }}>
          <div className="glass-card" style={{
            background: 'var(--bg-panel)', width: '100%', maxWidth: '900px', maxHeight: '90vh',
            borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
            boxShadow: '0 24px 48px rgba(0,0,0,0.4)', border: '1px solid var(--border-main)'
          }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontSize: '32px' }}>{getCategoryIcon(selectedGroup.name)}</div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: 'var(--text-head)' }}>{selectedGroup.name} Inventory</h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-sub)' }}>{groupItems.length} registered SKUs in this group.</p>
                </div>
              </div>
              <button onClick={closeGroupModal} style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-main)',
                color: 'var(--text-head)', width: '36px', height: '36px', borderRadius: '50%',
                cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>✕</button>
            </div>

            <div style={{ padding: '16px 32px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-main)', display: 'flex', gap: '16px' }}>
              <input 
                type="text" 
                placeholder={`Search ${selectedGroup.name}...`}
                value={itemSearchTerm}
                onChange={e => setItemSearchTerm(e.target.value)}
                style={{
                  flex: 1, padding: '10px 16px', background: 'var(--bg-input)', color: 'var(--text-head)',
                  border: '1px solid var(--border-main)', borderRadius: '12px', outline: 'none'
                }}
              />
            </div>

            <div style={{ padding: '0', overflowY: 'auto', flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-main)' }}>
                    <th style={{ padding: '16px 32px', color: 'var(--text-sub)', fontSize: '12px', textTransform: 'uppercase' }}>Asset Name</th>
                    <th style={{ padding: '16px 32px', color: 'var(--text-sub)', fontSize: '12px', textTransform: 'uppercase' }}>ID</th>
                    <th style={{ padding: '16px 32px', color: 'var(--text-sub)', fontSize: '12px', textTransform: 'uppercase' }}>Global Stock</th>
                    <th style={{ padding: '16px 32px', color: 'var(--text-sub)', fontSize: '12px', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingItems ? (
                    <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-sub)' }}>Loading assets...</td></tr>
                  ) : filteredModalItems.length === 0 ? (
                    <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-sub)' }}>No assets match your search.</td></tr>
                  ) : (
                    filteredModalItems.map((i: any) => {
                      const stockQty = i.stocks ? i.stocks.reduce((acc: number, s: any) => acc + (Number(s.quantity) || 0), 0) : 0;
                      return (
                        <tr key={i.id} style={{ borderBottom: '1px solid var(--border-main)' }}>
                          <td style={{ padding: '16px 32px', fontWeight: 600, color: 'var(--text-head)' }}>{i.name}</td>
                          <td style={{ padding: '16px 32px', color: 'var(--text-sub)', fontFamily: 'monospace' }}>ID-{i.id}</td>
                          <td style={{ padding: '16px 32px', fontWeight: 700, color: stockQty > 0 ? '#10b981' : '#ef4444' }}>{stockQty} Units</td>
                          <td style={{ padding: '16px 32px', textAlign: 'right' }}>
                            <Link href={`/assets/${i.id}`} style={{
                              padding: '6px 12px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-head)',
                              borderRadius: '8px', textDecoration: 'none', fontSize: '12px', fontWeight: 600
                            }}>
                              View Details
                            </Link>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
