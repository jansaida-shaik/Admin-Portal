'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import dynamic from 'next/dynamic';

const PlacementModal = dynamic(() => import('@/components/modals/PlacementModal'), {
  loading: () => (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex: 9999
    }}>
      <div className="glass-card" style={{
        background: 'var(--bg-panel)', border: '1px solid var(--border-main)', borderRadius: '28px',
        width: '100%', maxWidth: '460px', height: '350px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.4)', animation: 'pulse 1.5s infinite'
      }} />
    </div>
  )
});

export default function PlacementOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);

  // Submission States
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [branchName, setBranchName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [user, ords] = await Promise.all([fetchApi('/me'), fetchApi('/placements')]);
        setMe(user);
        setOrders(ords);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    loadData();
  }, []);

  const handleModalSubmit = async (data) => {
    try {
      const res = await fetchApi('/placements', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      setOrders([res, ...orders]);
      setShowModal(false);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleFulfill = async (id, statusStr = 'FULFILLED') => {
    try {
      const updated = await fetchApi(`/placements/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: statusStr })
      });
      setOrders(orders.map(o => o.id.toString() === id.toString() ? updated : o));
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <div style={{ padding: '40px', color: 'var(--text-sub)' }}>Querying logistics deployment queues...</div>;

  return (
    <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:'32px', padding:'24px', boxSizing:'border-box' }}>
      
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-head)', margin: 0, letterSpacing: '-0.02em' }}>Placement Logistics</h1>
          <p style={{ margin:'4px 0 0 0', color:'var(--text-sub)', fontSize:'14px', fontWeight:600 }}>Track and dispatch bulk inventory orders dispatched for branch fulfillment.</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{
          background: 'linear-gradient(135deg, #F58220, #245fb4)', 
          color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '14px',
          fontWeight: 800, fontSize: '13px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(245,130,32,0.25)'
        }}>
          ➕ Dispatch Order
        </button>
      </div>

      {/* Bulk Placement Grid */}
      {orders.length === 0 ? (
        <div className="glass-card" style={{ padding:'64px', borderRadius:'24px', border:'1px solid var(--border-main)', color:'var(--text-sub)', textAlign:'center' }}>
          <p style={{ margin:0, fontWeight:600, fontSize:'15px' }}>No active bulk fulfillment queues exist.</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'24px' }}>
          {orders.map(o => {
            const done = o.status === 'FULFILLED';
            return (
              <div key={o.id.toString()} className="glass-card" style={{
                background: 'var(--bg-panel)', border: '1px solid var(--border-main)', borderRadius: '24px',
                padding: '28px', display:'flex', flexDirection:'column', gap:'16px', boxShadow:'0 12px 30px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'12px' }}>
                  <div>
                    <span style={{ fontSize:'11px', fontWeight:800, color:'var(--text-sub)', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                      BATCH-{o.id.toString().slice(-4)}
                    </span>
                    <h3 style={{ margin:'4px 0 0 0', fontSize:'18px', fontWeight:800, color:'var(--text-head)' }}>{o.title}</h3>
                  </div>
                  <div style={{
                    padding:'6px 12px', borderRadius:'12px', background: done ? 'rgba(16,185,129,0.1)' : 'rgba(245,130,32,0.1)',
                    border: `1px solid ${done ? 'rgba(16,185,129,0.2)' : 'rgba(245,130,32,0.2)'}`,
                    color: done ? '#10b981' : '#F58220', fontSize:'11px', fontWeight:800
                  }}>
                    {o.status}
                  </div>
                </div>

                <div style={{ display:'flex', gap:'16px', borderTop:'1px solid var(--border-main)', borderBottom:'1px solid var(--border-main)', padding:'16px 0' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:'11px', fontWeight:800, color:'var(--text-sub)', textTransform:'uppercase', marginBottom:'2px' }}>Consignment Size</div>
                    <div style={{ fontSize:'20px', fontWeight:900, color:'var(--text-head)' }}>{o.quantity} <span style={{fontSize:'13px', color:'var(--text-sub)', fontWeight:700}}>Units</span></div>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:'11px', fontWeight:800, color:'var(--text-sub)', textTransform:'uppercase', marginBottom:'2px' }}>Branch Target</div>
                    <div style={{ fontSize:'14px', fontWeight:800, color:'#F58220', marginTop:'6px' }}>📍 {o.branchName}</div>
                  </div>
                </div>

                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:'12px', color:'var(--text-sub)', fontWeight:600 }}>
                    Logged: {new Date(o.createdAt).toLocaleDateString()}
                  </span>

                  {!done && me?.role === 'ADMIN' && (
                    <button onClick={() => handleFulfill(o.id)} style={{
                      background:'linear-gradient(135deg, #10b981, #059669)',
                      color:'#fff', border:'none', padding:'8px 16px', borderRadius:'10px',
                      fontWeight:800, fontSize:'11px', cursor:'pointer', boxShadow:'0 4px 12px rgba(16,185,129,0.25)'
                    }}>
                      ✓ Ship Consignment
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dynamically Loaded Form Modal */}
      {showModal && (
        <PlacementModal 
          onClose={() => setShowModal(false)}
          onSubmit={handleModalSubmit}
        />
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

    </div>
  );
}
