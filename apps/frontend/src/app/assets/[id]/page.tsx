'use client';
import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';

export default function AssetDetails({ params }) {
  const resolvedParams = use(params);
  const itemId = resolvedParams.id;

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadItem() {
      try {
        setLoading(true);
        const data = await fetchApi(`/items/${itemId}`);
        setItem(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadItem();
  }, [itemId]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', color: 'var(--text-sub)', fontSize:'14px', fontWeight:600 }}>Syncing asset profile telemetry...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '32px', background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '20px', color: '#ef4444' }}>
        <h3 style={{ margin: 0, fontSize:'20px', fontWeight:800 }}>⚠️ Profile Loading Failure</h3>
        <p style={{ margin: '12px 0 24px 0', fontSize: '14px', opacity: 0.8 }}>{error}</p>
        <Link href="/assets" style={{ display: 'inline-block', background:'#ef4444', color: '#fff', padding:'10px 20px', borderRadius:'12px', fontWeight:700, textDecoration: 'none', fontSize:'13px' }}>← Return to Inventory</Link>
      </div>
    );
  }

  if (!item) return <div style={{ padding:'40px', color:'var(--text-sub)' }}>Catalog node not found in physical ledger.</div>;

  const activeAssignments = item.assignments?.filter(a => a.status === 'ACTIVE') || [];
  const historicalAssignments = item.assignments?.filter(a => a.status !== 'ACTIVE') || [];
  const totalStock = item.stocks?.reduce((acc, s) => acc + (Number(s.quantity) || 0), 0) || 0;

  const cardStyle = {
    background: 'var(--bg-panel)', 
    border: '1px solid var(--border-main)',
    borderRadius: '24px', 
    padding: '28px', 
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  };

  return (
    <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px', boxSizing: 'border-box', padding:'24px' }}>
      
      <div>
        <Link href="/assets" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700, color: '#F58220', textDecoration: 'none', transition:'transform 0.2s ease' }} onMouseEnter={e=>e.currentTarget.style.transform='translateX(-4px)'} onMouseLeave={e=>e.currentTarget.style.transform='translateX(0)'}>
          ← Back to Physical Inventory
        </Link>
      </div>

      {/* Top Banner Profile Header */}
      <div className="glass-card" style={{
        background: 'var(--bg-panel)', 
        border: '1px solid var(--border-main)', 
        borderRadius: '28px',
        padding: '40px', 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '32px', 
        alignItems: 'center',
        position:'relative',
        overflow:'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
      }}>
        {/* Glowing ambient decorative node */}
        <div style={{ position:'absolute', width:'150px', height:'150px', background:'rgba(245, 130, 32, 0.15)', borderRadius:'50%', filter:'blur(50px)', top:'-50px', right:'-50px', zIndex:0 }} />

        <div style={{
          width: '90px', height: '90px', borderRadius: '24px',
          background: 'linear-gradient(135deg, #F58220, #245fb4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: '36px', flexShrink: 0,
          boxShadow: '0 8px 24px rgba(245,130,32,0.25)',
          zIndex:1
        }}>
          {item.name.charAt(0)}
        </div>

        <div style={{ flexGrow: 1, zIndex:1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 850, color: 'var(--text-head)', margin: 0, letterSpacing:'-0.02em' }}>{item.name}</h1>
            <span style={{ background: 'rgba(245, 130, 32, 0.12)', color: '#F58220', border:'1px solid rgba(245,130,32,0.25)', padding: '5px 14px', borderRadius: '100px', fontSize: '11px', fontWeight: 800, letterSpacing:'0.05em', textTransform:'uppercase' }}>
              {item.category?.name || 'General'}
            </span>
          </div>
          <p style={{ margin: '10px 0 0 0', fontSize: '15px', color: 'var(--text-sub)', maxWidth:'600px', lineHeight:1.5, fontWeight:500 }}>{item.description || 'No physical specifications provided.'}</p>
        </div>

        <div style={{ display: 'flex', gap: '20px', zIndex:1 }}>
          <div className="glass-card" style={{ padding: '18px 28px', background: 'var(--bg-input)', border: '1px solid var(--border-main)', borderRadius: '20px', textAlign: 'center', minWidth:'120px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-sub)', textTransform: 'uppercase', fontWeight: 800, letterSpacing:'0.05em' }}>Total Stock</div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-head)', marginTop: '4px' }}>{totalStock}</div>
          </div>
          <div className="glass-card" style={{ padding: '18px 28px', background: 'var(--bg-input)', border: '1px solid var(--border-main)', borderRadius: '20px', textAlign: 'center', minWidth:'120px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-sub)', textTransform: 'uppercase', fontWeight: 800, letterSpacing:'0.05em' }}>Assignments</div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: '#10b981', marginTop: '4px' }}>{activeAssignments.length}</div>
          </div>
        </div>
      </div>

      {/* Main Details Segment Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '28px' }}>
        
        {/* LEFT VECTOR: ASSIGNMENT CUSTODY */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* 👤 ACTIVE CUSTODIANS */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-head)', margin: '0 0 20px 0', borderBottom: '1px solid var(--border-main)', paddingBottom: '16px', display:'flex', alignItems:'center', gap:'8px' }}>
              <span style={{fontSize:'20px'}}>👤</span> Current Custodians
            </h2>
            {activeAssignments.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {activeAssignments.map(a => (
                  <div key={a.id.toString()} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '16px 20px', 
                    background: 'rgba(16,185,129,0.04)', 
                    border: '1px solid rgba(16,185,129,0.15)', 
                    borderRadius: '16px' 
                  }}>
                    <div>
                      <Link href={`/employees/${a.userId}`} style={{ fontWeight: 800, fontSize:'15px', color: 'var(--text-head)', textDecoration: 'none', display:'block', marginBottom:'4px' }}>{a.user.name}</Link>
                      <div style={{ fontSize: '12px', color: 'var(--text-sub)', fontWeight: 600 }}>
                        📍 <strong style={{color:'var(--text-head)'}}>Location:</strong> {a.location.city || 'Global'} • <strong style={{color:'var(--text-head)'}}>Branch:</strong> {a.location.name}
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-sub)', textAlign: 'right', fontWeight:600 }}>
                      Assigned On
                      <div style={{ fontWeight: 800, color: 'var(--text-head)', fontSize:'13px', marginTop:'2px' }}>{new Date(a.assignedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year:'numeric' })}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '24px', textAlign:'center', color: 'var(--text-sub)', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-main)', borderRadius: '16px', fontSize: '13px', fontWeight:600 }}>
                Not currently deployed to any active custodian.
              </div>
            )}
          </div>

          {/* ⏳ CUSTODIAN HISTORY TIMELINE */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-head)', margin: '0 0 20px 0', borderBottom: '1px solid var(--border-main)', paddingBottom: '16px', display:'flex', alignItems:'center', gap:'8px' }}>
              <span style={{fontSize:'20px'}}>⏳</span> Custody History Log
            </h2>
            {historicalAssignments.length > 0 ? (
              <div style={{ position: 'relative', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Vertical visual vector */}
                <div style={{ position: 'absolute', left: '7px', top: '8px', bottom: '8px', width: '2px', background: 'var(--border-main)', opacity: 0.5 }} />
                
                {historicalAssignments.map(a => (
                  <div key={a.id.toString()} style={{ position: 'relative' }}>
                    {/* Radial marker */}
                    <div style={{ position: 'absolute', left: '-21px', top: '6px', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-sub)', border: '2px solid var(--bg-panel)', zIndex:1 }} />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems:'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--text-head)', fontSize:'14px' }}>{a.user.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginTop:'4px', fontWeight:600 }}>
                          Released from <strong style={{color:'var(--text-head)'}}>Location:</strong> {a.location.city || 'Global'} • <strong style={{color:'var(--text-head)'}}>Branch:</strong> {a.location.name}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--text-sub)', fontWeight: 600 }}>
                        <div>{new Date(a.assignedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</div>
                        <div style={{marginTop:'2px'}}>to {new Date(a.returnedAt || a.assignedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '24px', textAlign:'center', color: 'var(--text-sub)', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-main)', borderRadius: '16px', fontSize: '13px', fontWeight:600 }}>
                No historical handovers logged for this node.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT VECTOR: MAINTENANCE & VENDOR PIPELINES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* 📋 LOGISTIC TRANSACTIONS & RECEIPTS */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-head)', margin: '0 0 20px 0', borderBottom: '1px solid var(--border-main)', paddingBottom: '16px', display:'flex', alignItems:'center', gap:'8px' }}>
              <span style={{fontSize:'20px'}}>📋</span> Procurement & Logistics Ledger
            </h2>
            {item.transactions && item.transactions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {item.transactions.map(t => {
                  let files = [];
                  try { if(t.attachments) files = JSON.parse(t.attachments); } catch(e){}
                  const isTransfer = t.type === 'TRANSFER';
                  return (
                    <div key={t.id.toString()} style={{ padding:'16px', background:'rgba(255,255,255,0.02)', border:'1px solid var(--border-main)', borderRadius:'16px', display:'flex', flexDirection:'column', gap:'12px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                        <div>
                          <span style={{
                            fontSize:'9px', fontWeight:900, textTransform:'uppercase', padding:'3px 8px', borderRadius:'6px', letterSpacing:'0.05em',
                            background: t.type === 'IN' ? 'rgba(16,185,129,0.12)' : (t.type === 'OUT' ? 'rgba(239,68,68,0.12)' : 'rgba(59,130,246,0.12)'),
                            color: t.type === 'IN' ? '#10b981' : (t.type === 'OUT' ? '#ef4444' : '#3b82f6'),
                            border: `1px solid ${t.type === 'IN' ? 'rgba(16,185,129,0.2)' : (t.type === 'OUT' ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)')}`
                          }}>
                            STOCK {t.type}
                          </span>
                          <div style={{ fontSize:'14px', fontWeight:800, color:'var(--text-head)', marginTop:'8px' }}>
                            {t.quantity} Unit(s) {isTransfer ? `transferred` : (t.type === 'IN' ? 'injected' : 'extracted')}
                          </div>
                          <div style={{ fontSize:'12px', color:'var(--text-sub)', fontWeight:600, marginTop:'4px' }}>
                            {isTransfer 
                              ? `From ${t.fromLocation?.name} ➔ To ${t.toLocation?.name}` 
                              : `Branch Target: ${t.type === 'IN' ? t.toLocation?.name : t.fromLocation?.name}`
                            }
                          </div>
                        </div>
                        <div style={{ textAlign:'right', fontSize:'11px', fontWeight:600, color:'var(--text-sub)' }}>
                          {new Date(t.transactionDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })}
                        </div>
                      </div>

                      {/* Attached Files render channel */}
                      {files.length > 0 && (
                        <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', borderTop:'1px dotted var(--border-main)', paddingTop:'10px' }}>
                          {files.map((url, idx) => {
                            const filename = url.split('/').pop().substring(14);
                            return (
                              <a key={idx} href={url} target="_blank" rel="noopener noreferrer" style={{
                                display:'inline-flex', alignItems:'center', gap:'6px', padding:'6px 10px', background:'rgba(245,130,32,0.08)', border:'1px solid rgba(245,130,32,0.2)', borderRadius:'8px',
                                fontSize:'11px', color:'#F58220', fontWeight:750, textDecoration:'none'
                              }}>
                                📎 {filename.length > 12 ? filename.substring(0,10) + '...' : filename}
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding:'32px', textAlign:'center', color:'var(--text-sub)', background:'rgba(255,255,255,0.01)', border:'1px dashed var(--border-main)', borderRadius:'16px', fontSize:'13px', fontWeight:600 }}>
                No ledger transactions exist for this item.
              </div>
            )}
          </div>

          {/* ⚙️ REPAIRS */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-main)', paddingBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-head)', margin: 0, display:'flex', alignItems:'center', gap:'8px' }}>
                <span style={{fontSize:'20px'}}>⚙️</span> Servicing & Repair Audits
              </h2>
              <button style={{ background: 'rgba(245, 130, 32, 0.1)', color: '#F58220', border: '1px solid rgba(245,130,32,0.2)', padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition:'all 0.2s' }} onMouseEnter={e=>{e.currentTarget.style.background='#F58220'; e.currentTarget.style.color='#fff';}} onMouseLeave={e=>{e.currentTarget.style.background='rgba(245, 130, 32, 0.1)'; e.currentTarget.style.color='#F58220';}}>
                + Log Repair
              </button>
            </div>

            {item.repairs && item.repairs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {item.repairs.map(repair => (
                  <div key={repair.id.toString()} className="glass-card" style={{ padding: '18px', background: 'var(--bg-input)', border: '1px solid var(--border-main)', borderRadius: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{ fontSize: '9px', fontWeight: 900, color: repair.status === 'COMPLETED' ? '#10b981' : '#f59e0b', background: repair.status === 'COMPLETED' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase', border:`1px solid ${repair.status === 'COMPLETED' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`, letterSpacing:'0.05em' }}>
                          {repair.status}
                        </span>
                        <h4 style={{ margin: '10px 0 4px 0', color: 'var(--text-head)', fontSize: '15px', fontWeight:750 }}>{repair.description}</h4>
                        <div style={{ fontSize: '12px', color: 'var(--text-sub)', fontWeight:600 }}>📍 Serviced by: <span style={{color:'var(--text-head)'}}>{repair.vendorName || 'Internal IT'}</span></div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 900, color: 'var(--text-head)', fontSize: '18px', letterSpacing:'-0.02em' }}>₹{repair.cost.toLocaleString('en-IN')}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-sub)', marginTop: '4px', fontWeight:600 }}>{new Date(repair.repairDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-sub)', background: 'var(--bg-input)', border: '1px dashed var(--border-main)', borderRadius: '20px' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🛡️</div>
                <div style={{ fontWeight: 800, color: 'var(--text-head)', fontSize:'16px' }}>Excellent Operating Status</div>
                <div style={{ fontSize: '13px', marginTop: '6px', fontWeight:500, maxWidth:'280px', margin:'6px auto 0 auto', opacity:0.8 }}>No pending technical failures or service logs exist.</div>
              </div>
            )}
          </div>

          {/* 🏢 SOURCED VENDOR LINK */}
          {item.vendor && (
            <div style={{ ...cardStyle, position:'relative', overflow:'hidden', background: 'linear-gradient(135deg, rgba(245,130,32,0.03), rgba(36,95,180,0.03))' }}>
              <div style={{ position:'absolute', right:'-20px', bottom:'-20px', fontSize:'80px', opacity:0.03, fontWeight:900 }}>🤝</div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-sub)', fontWeight: 800, letterSpacing:'0.05em' }}>Sourced Logistics Node</div>
              <h3 style={{ margin: '8px 0 12px 0', color: 'var(--text-head)', fontSize:'20px', fontWeight:850 }}>{item.vendor.name}</h3>
              <Link href={`/vendors/${item.vendorId}`} style={{ color: '#F58220', fontSize: '13px', fontWeight: 800, textDecoration: 'none', display:'inline-flex', alignItems:'center', gap:'6px' }}>
                Explore Supply Channel Profile →
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
