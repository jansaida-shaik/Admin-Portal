'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import dynamic from 'next/dynamic';

const SearchableSelect = dynamic(() => import('@/components/SearchableSelect'), {
  loading: () => <div style={{ height: '42px', width: '100%', background: 'var(--bg-input)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
});

export default function ServiceRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  
  // Add new request form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Core data load
  useEffect(() => {
    async function loadDesk() {
      try {
        const [user, reqs] = await Promise.all([fetchApi('/me'), fetchApi('/service-requests')]);
        setMe(user);
        setRequests(reqs);
      } catch (e) {
        console.error('Desk load failed:', e.message);
      } finally {
        setLoading(false);
      }
    }
    loadDesk();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetchApi('/service-requests', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          itemId: selectedItem || null
        })
      });
      setRequests([res, ...requests]);
      setTitle('');
      setDescription('');
      setSelectedItem('');
    } catch (e) {
      alert('Action failed: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const updated = await fetchApi(`/service-requests/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      setRequests(requests.map(r => r.id.toString() === id.toString() ? { ...r, status: updated.status } : r));
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <div style={{ padding:'40px', color:'var(--text-sub)' }}>Initializing IT Support Desk...</div>;

  const myItemsOptions = me?.assignments ? me.assignments.map(a => ({
    value: a.item.id.toString(),
    label: `${a.item.name} (${a.location?.name || 'Global'})`
  })) : [];

  const getStatusStyles = (status) => {
    switch (status) {
      case 'PENDING': return { bg: 'rgba(245,130,32,0.1)', color: '#F58220', border:'rgba(245,130,32,0.2)' };
      case 'RESOLVED': return { bg: 'rgba(16,185,129,0.1)', color: '#10b981', border:'rgba(16,185,129,0.2)' };
      case 'REJECTED': return { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', border:'rgba(239,68,68,0.2)' };
      default: return { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6', border:'rgba(59,130,246,0.2)' };
    }
  };

  return (
    <div style={{ width:'100%', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px', padding:'24px', boxSizing:'border-box' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-head)', margin: 0, letterSpacing: '-0.02em' }}>Support Desk</h1>
          <p style={{ margin:'4px 0 0 0', color:'var(--text-sub)', fontSize:'14px', fontWeight:600 }}>Submit system tickets or track corporate hardware maintenance logs.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '32px', alignItems: 'start' }}>
        
        {/* Ticketing Intake Drawer / Form */}
        <div className="glass-card" style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-main)',
          borderRadius: '28px',
          padding: '36px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          display: 'flex', flexDirection: 'column', gap: '24px'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var(--text-head)' }}>🎫 Open New Ticket</h2>
            <p style={{ margin:'4px 0 0 0', fontSize:'13px', color:'var(--text-sub)', fontWeight:600 }}>Log an operational failure or asset request.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Ticket Summary</label>
              <input type="text" required value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. MacBook Battery Degradation" style={{
                width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-main)', borderRadius: '12px', padding: '12px 16px', color: 'var(--text-head)', boxSizing:'border-box', fontSize:'14px', fontWeight:600, outline:'none'
              }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Relational Asset (Optional)</label>
              <SearchableSelect 
                options={myItemsOptions}
                placeholder="Choose dynamic custody item..."
                value={selectedItem}
                onChange={val => setSelectedItem(val)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Detailed Event Log</label>
              <textarea required rows="4" value={description} onChange={e=>setDescription(e.target.value)} placeholder="Outline technical context, steps to reproduce, or logistical requirements..." style={{
                width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-main)', borderRadius: '12px', padding: '12px 16px', color: 'var(--text-head)', boxSizing:'border-box', fontSize:'14px', fontWeight:600, outline:'none', resize:'vertical', fontFamily:'inherit'
              }} />
            </div>

            <button type="submit" disabled={submitting} style={{
              background: 'linear-gradient(135deg, #F58220, #245fb4)',
              color: '#fff',
              padding: '14px',
              border: 'none',
              borderRadius: '14px',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(245,130,32,0.25)',
              transition: 'transform 0.2s'
            }} onMouseEnter={e=>e.currentTarget.style.transform='translateY(-1px)'} onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
              {submitting ? 'Broadcasting ticket...' : 'Dispatch Support Request'}
            </button>
          </form>
        </div>

        {/* Log Streaming Registry */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text-head)' }}>🎫 Live Ticket Register ({requests.length})</h2>
          </div>

          {requests.length === 0 ? (
            <div className="glass-card" style={{ padding: '48px', textAlign: 'center', borderRadius: '24px', border: '1px solid var(--border-main)', color: 'var(--text-sub)' }}>
              <p style={{ margin:0, fontWeight:600 }}>Zero open support vectors found in your ledger.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {requests.map(r => {
                const style = getStatusStyles(r.status);
                return (
                  <div key={r.id.toString()} className="glass-card" style={{
                    background: 'var(--bg-panel)',
                    border: '1px solid var(--border-main)',
                    borderRadius: '20px',
                    padding: '24px',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap:'12px' }}>
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-sub)', letterSpacing:'0.05em' }}>
                          TKT-{r.id.toString().slice(-4)} • {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                        <h3 style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 800, color: 'var(--text-head)' }}>{r.title}</h3>
                        <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: 'var(--text-sub)', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{r.description}</p>
                      </div>
                      <span style={{
                        flexShrink: 0, padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 800,
                        background: style.bg, color: style.color, border: `1px solid ${style.border}`
                      }}>
                        {r.status}
                      </span>
                    </div>

                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid var(--border-main)', paddingTop:'14px', gap:'16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                        <div style={{ fontSize:'12px', fontWeight:700, color:'var(--text-sub)' }}>
                          Reporter: <span style={{color:'var(--text-head)'}}>{r.user?.name || 'General'}</span>
                        </div>
                        {r.item && (
                          <>
                            <span style={{opacity:0.3}}>•</span>
                            <div style={{ fontSize:'12px', fontWeight:700, color:'#F58220' }}>
                              💻 {r.item.name}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Admin Status Switchers */}
                      {me?.role === 'ADMIN' && r.status === 'PENDING' && (
                        <div style={{ display:'flex', gap:'8px' }}>
                          <button onClick={() => handleUpdateStatus(r.id, 'RESOLVED')} style={{
                            background: 'rgba(16,185,129,0.1)', color: '#10b981', border:'1px solid rgba(16,185,129,0.2)',
                            padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, cursor: 'pointer'
                          }}>
                            Resolve
                          </button>
                          <button onClick={() => handleUpdateStatus(r.id, 'REJECTED')} style={{
                            background: 'rgba(239,68,68,0.1)', color: '#ef4444', border:'1px solid rgba(239,68,68,0.2)',
                            padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, cursor: 'pointer'
                          }}>
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
