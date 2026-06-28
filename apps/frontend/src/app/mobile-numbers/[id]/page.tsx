'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import CarrierLogo from '@/components/mobile/CarrierLogo';
import MobileProviderPicker from '@/components/mobile/MobileProviderPicker';
import {
  formatMobileNumber,
  getTelecomBrandColor,
  normalizeMobileProvider
} from '@/lib/mobileProviders';

export default function MobileDetails({ params }) {
  const resolvedParams = use(params);
  const mobileId = resolvedParams.id;

  const [mobile, setMobile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    number: '',
    provider: '',
    planDetails: '',
    status: 'AVAILABLE',
    nextRechargeDate: '',
    userId: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  // Employee lookup state
  const [employees, setEmployees] = useState([]);
  const [empSearch, setEmpSearch] = useState('');

  const syncMobileState = (data) => {
    setMobile(data);
    setEditForm({
      number: data.number || '',
      provider: normalizeMobileProvider(data.provider) || 'Airtel',
      planDetails: data.planDetails || '',
      status: data.status || 'AVAILABLE',
      nextRechargeDate: data.nextRechargeDate ? data.nextRechargeDate.substring(0, 10) : '',
      userId: data.userId ? data.userId.toString() : ''
    });
    setEmpSearch(data.user?.name || data.assignedTo || '');
    setError(null);
  };

  const loadMobile = async () => {
    try {
      const data = await fetchApi(`/mobile-numbers/${mobileId}`);
      syncMobileState(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await fetchApi(`/mobile-numbers/${mobileId}`);
        if (!cancelled) {
          syncMobileState(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mobileId]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setLoading(true);
      const payload = { ...editForm };
      if (!payload.userId) delete payload.userId;
      const updated = await fetchApi(`/mobile-numbers/${mobileId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      setMobile(prev => ({ ...prev, ...updated }));
      setIsEditModalOpen(false);
      loadMobile(); 
    } catch (err) {
      alert(`Failed to update SIM profile: ${err.message}`);
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  const openEditModal = async () => {
    setIsEditModalOpen(true);
    if (employees.length === 0) {
      try {
        const res = await fetchApi('/users?limit=500');
        setEmployees(res.data || []);
      } catch (e) { console.error(e); }
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', color: 'var(--text-sub)', fontWeight:600 }}>Streaming cellular telemetry...</div>;
  
  if (error) {
    return (
      <div style={{ padding: '32px', background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '20px', color: '#ef4444' }}>
        <h3 style={{ margin: 0, fontSize:'20px', fontWeight:800 }}>⚠️ Connection Node Loading Error</h3>
        <p style={{ margin: '12px 0 24px 0', fontSize: '14px', opacity:0.8 }}>{error}</p>
        <Link href="/mobile-numbers" style={{ display: 'inline-block', background:'#ef4444', color: '#fff', padding:'10px 20px', borderRadius:'12px', fontWeight:700, textDecoration: 'none', fontSize:'13px' }}>← Back to Communications</Link>
      </div>
    );
  }

  if (!mobile) return <div style={{ padding:'40px', color:'var(--text-sub)' }}>Cellular node not registered in telemetry ledger.</div>;

  const getStatusConfig = (s) => {
    if (s === 'AVAILABLE') return { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)' };
    if (s === 'ASSIGNED') return { color: '#F58220', bg: 'rgba(245, 130, 32, 0.1)', border: 'rgba(245, 130, 32, 0.25)' };
    return { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)' };
  };

  const sStyle = getStatusConfig(mobile.status);
  const providerName = normalizeMobileProvider(mobile.provider) || 'Airtel';
  const brandColor = getTelecomBrandColor(providerName);
  const formattedNumber = formatMobileNumber(mobile.number);

  const cardStyle = {
    background: 'var(--bg-panel)', 
    border: '1px solid var(--border-main)',
    borderRadius: '24px', 
    padding: 'clamp(20px, 4vw, 28px)', 
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', background: 'var(--bg-input)', border: '1px solid var(--border-main)',
    borderRadius: '14px', color: 'var(--text-head)', fontSize: '14px', marginTop: '6px', outline: 'none', boxSizing: 'border-box', fontWeight: 600
  };

  return (
    <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px', boxSizing: 'border-box' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <Link href="/mobile-numbers" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700, color: '#F58220', textDecoration: 'none', transition:'transform 0.2s' }} onMouseEnter={e=>e.currentTarget.style.transform='translateX(-4px)'} onMouseLeave={e=>e.currentTarget.style.transform='translateX(0)'}>
          ← Back to Mobile Communications
        </Link>
        <button 
          onClick={() => openEditModal()}
          style={{
            background: 'rgba(255,255,255,0.03)', 
            border: '1px solid var(--border-main)', 
            color: 'var(--text-head)',
            padding: '10px 20px', 
            borderRadius: '14px', 
            fontWeight: 700, 
            fontSize: '13px', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background='var(--accent)'; e.currentTarget.style.color='#fff'; e.currentTarget.style.borderColor='transparent'; }}
          onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.color='var(--text-head)'; e.currentTarget.style.borderColor='var(--border-main)'; }}
        >
          ✏️ Edit SIM Profile
        </button>
      </div>

      {/* SIM Identity Banner Profile */}
      <div className="glass-card" style={{
        background: 'var(--bg-panel)', 
        border: '1px solid var(--border-main)', 
        borderRadius: '28px',
        padding: 'clamp(24px, 5vw, 40px)', 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '32px', 
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
      }}>
        {/* Ambient Glow Node */}
        <div style={{ position:'absolute', width:'150px', height:'150px', background:`${sStyle.color}15`, borderRadius:'50%', filter:'blur(50px)', top:'-50px', right:'-50px' }} />

        <div style={{
          width: '84px', height: '84px', borderRadius: '50%',
          overflow: 'hidden',
          flexShrink: 0,
          boxShadow: `0 8px 20px ${brandColor}30`
        }}>
          <CarrierLogo provider={providerName} size={84} />
        </div>

        <div style={{ flexGrow: 1, zIndex:1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 'clamp(24px, 6vw, 32px)', fontWeight: 900, color: 'var(--text-head)', margin: 0, fontFamily: 'monospace', letterSpacing: '1px', wordBreak: 'break-word' }}>
              {formattedNumber}
            </h1>
            <span style={{
              color: sStyle.color, 
              background: sStyle.bg,
              border: `1px solid ${sStyle.border}`,
              padding: '5px 14px', borderRadius: '100px', fontSize: '11px', fontWeight: 800,
              textTransform: 'uppercase', letterSpacing:'0.05em'
            }}>
              {mobile.status}
            </span>
          </div>
          <p style={{ margin: '10px 0 0 0', fontSize: '15px', color: 'var(--text-sub)', fontWeight:600 }}>
            Carrier: <span style={{ color: brandColor, fontWeight:800 }}>{providerName}</span> • <span style={{ opacity: 0.8 }}>Plan: {mobile.planDetails || 'Standard Corporate'}</span>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', zIndex:1, width: '100%' }}>
          {/* Recharge Countdown Grid Node */}
          <div className="glass-card" style={{ flex: '1 1 180px', minWidth: '180px', background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '20px', padding: '20px 24px' }}>
            <div style={{ fontSize: '10px', color: '#f59e0b', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>📅 Next Recharge</div>
            <div style={{ fontSize: '16px', fontWeight: 850, color: 'var(--text-head)', marginTop: '6px' }}>
              {mobile.nextRechargeDate 
                ? new Date(mobile.nextRechargeDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                : '12th Monthly Cycles'
              }
            </div>
          </div>

          {/* Active Personnel Assignee Grid Node */}
          <div className="glass-card" style={{ flex: '1 1 240px', minWidth: '240px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-main)', borderRadius: '20px', padding: '20px 24px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-sub)', textTransform: 'uppercase', fontWeight: 800, letterSpacing:'0.05em' }}>Registered Assignee</div>
            {mobile.user ? (
              <div style={{marginTop:'6px'}}>
                <Link href={`/employees/${mobile.userId}`} style={{ fontSize: '16px', fontWeight: 850, color: '#F58220', textDecoration: 'none', display:'block' }}>
                  👤 {mobile.user.name}
                </Link>
                <div style={{ fontSize:'11px', color:'var(--text-sub)', marginTop:'2px', fontWeight:600 }}>
                  📍 Loc: {mobile.user.city || 'Global'} • Branch: {mobile.user.branch || 'Main'}
                </div>
              </div>
            ) : mobile.assignedTo ? (
              <div style={{ fontSize: '16px', fontWeight: 850, color: 'var(--text-head)', marginTop: '6px' }}>
                👤 {mobile.assignedTo}
              </div>
            ) : (
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-sub)', fontStyle: 'italic', marginTop: '8px' }}>Available in Reserve</div>
            )}
          </div>
        </div>
      </div>

      {/* Multi-column Detail Log Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '28px' }}>
        
        {/* LEFT VECTOR: SIM CUSTODY LOG */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-head)', margin: '0 0 20px 0', borderBottom: '1px solid var(--border-main)', paddingBottom: '16px', display:'flex', alignItems:'center', gap:'8px' }}>
            <span style={{fontSize:'20px'}}>📋</span> Handover Registry Log
          </h2>
          {mobile.assignments && mobile.assignments.length > 0 ? (
            <div style={{ position: 'relative', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ position: 'absolute', left: '7px', top: '8px', bottom: '8px', width: '2px', background: 'var(--border-main)', opacity:0.5 }} />
              {mobile.assignments.map(a => (
                <div key={a.id.toString()} style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-21px', top: '6px', width: '8px', height: '8px', borderRadius: '50%', background: a.status === 'ACTIVE' ? '#F58220' : 'var(--text-sub)', border: '2px solid var(--bg-panel)', zIndex:1 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--text-head)', fontSize:'14px' }}>{a.user?.name || a.assignedTo}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginTop:'4px', fontWeight:600 }}>
                        {a.status === 'ACTIVE' ? '⚡ In Possession' : 'Released Line Back to Reserve'}
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-sub)', textAlign: 'right', fontWeight:600 }}>
                      <div>{new Date(a.assignedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                      {a.returnedAt && <div style={{ textDecoration: 'line-through', marginTop:'2px' }}>{new Date(a.returnedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-sub)', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-main)', borderRadius: '20px' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📎</div>
              <div style={{ fontWeight: 800, color:'var(--text-head)', fontSize:'15px' }}>No Handover Audit Trail</div>
              <div style={{ fontSize: '13px', marginTop: '6px', opacity:0.8 }}>This vector maintains legacy or single-node assignment records only.</div>
            </div>
          )}
        </div>

        {/* RIGHT VECTOR: RECHARGE DATA GRID */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-main)', paddingBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-head)', margin: 0, display:'flex', alignItems:'center', gap:'8px' }}>
              <span style={{fontSize:'20px'}}>💰</span> Recharge History Log
            </h2>
            <button style={{ background: 'rgba(245, 130, 32, 0.1)', color: '#F58220', border: '1px solid rgba(245,130,32,0.2)', padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition:'all 0.2s' }} onMouseEnter={e=>{e.currentTarget.style.background='#F58220'; e.currentTarget.style.color='#fff';}} onMouseLeave={e=>{e.currentTarget.style.background='rgba(245, 130, 32, 0.1)'; e.currentTarget.style.color='#F58220';}}>
              + Record Billing
            </button>
          </div>

          {mobile.recharges && mobile.recharges.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {mobile.recharges.map(rec => (
                <div key={rec.id.toString()} className="glass-card" style={{ padding: '18px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-main)', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--text-head)', fontSize:'14px' }}>{rec.planDetails || 'Prepaid Recharge Payload'}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginTop: '4px', fontWeight:600 }}>Cleared {new Date(rec.rechargeDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#10b981', letterSpacing:'-0.02em' }}>
                    ₹{rec.amount.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-sub)', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-main)', borderRadius: '20px' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>💳</div>
              <div style={{ fontWeight: 800, color: 'var(--text-head)', fontSize:'15px' }}>No Active Invoice Log</div>
              <div style={{ fontSize: '13px', marginTop: '6px', opacity:0.8 }}>You have not recorded billing sequences for this SIM vector.</div>
            </div>
          )}
        </div>
      </div>

      {/* GLASSMORPHIC DRAWER EDIT OVERLAY */}
      {isEditModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(10, 10, 12, 0.85)', backdropFilter: 'blur(16px) saturate(180%)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999,
          padding: '24px'
        }}>
          <div className="glass-card" style={{
            background: 'rgba(20, 20, 22, 0.95)', 
            border: '1px solid var(--border-main)',
            borderRadius: '28px', 
            width: '100%', 
            maxWidth: '500px', 
            padding: 'clamp(20px, 5vw, 36px)',
            boxShadow: '0 30px 60px rgba(0,0,0,0.5)', 
            boxSizing: 'border-box',
            position:'relative',
            animation: 'modalSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 850, color: 'var(--text-head)', margin: 0, letterSpacing:'-0.01em' }}>Modify Telecom Node</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-sub)', fontSize: '28px', cursor: 'pointer', lineHeight:1 }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-sub)', fontWeight: 800, letterSpacing:'0.05em' }}>CELLULAR VECTOR NUMBER</label>
                <input 
                  type="text" required 
                  value={editForm.number}
                  onChange={e => setEditForm({ ...editForm, number: e.target.value })}
                  style={inputStyle} 
                />
              </div>

              <MobileProviderPicker
                value={editForm.provider}
                onChange={(provider) => setEditForm({ ...editForm, provider })}
                label="OPERATOR CARRIER"
                helperText="Select the exact carrier logo and brand name to save."
                dense
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-sub)', fontWeight: 800, letterSpacing:'0.05em' }}>OPERATIONAL STATUS</label>
                  <select 
                    value={editForm.status}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="ASSIGNED">ASSIGNED</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 800, letterSpacing:'0.05em' }}>📅 NEXT RECHARGE CYCLICAL DATE</label>
                  <input 
                    type="date" 
                    value={editForm.nextRechargeDate}
                    onChange={e => setEditForm({ ...editForm, nextRechargeDate: e.target.value })}
                    style={{ ...inputStyle, border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }} 
                  />
                </div>
              </div>

              {/* Employee Lookup Picker */}
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-sub)', fontWeight: 800, letterSpacing:'0.05em' }}>ASSIGN TO EMPLOYEE</label>
                <div style={{ position: 'relative', marginTop: '8px' }}>
                  <input
                    type="text"
                    placeholder="Search employee name…"
                    value={empSearch}
                    onChange={e => {
                      setEmpSearch(e.target.value);
                      if (!e.target.value) setEditForm({ ...editForm, userId: '' });
                    }}
                    style={inputStyle}
                    autoComplete="off"
                  />
                  {empSearch && !editForm.userId && employees.filter(emp =>
                    emp.name.toLowerCase().includes(empSearch.toLowerCase())
                  ).length > 0 && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                      background: 'var(--bg-panel)', border: '1px solid var(--border-main)',
                      borderRadius: '12px', maxHeight: '200px', overflowY: 'auto',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.3)', marginTop: '4px'
                    }}>
                      {employees.filter(emp =>
                        emp.name.toLowerCase().includes(empSearch.toLowerCase())
                      ).slice(0, 8).map(emp => (
                        <div
                          key={emp.id.toString()}
                          onClick={() => {
                            setEditForm({ ...editForm, userId: emp.id.toString(), status: 'ASSIGNED' });
                            setEmpSearch(emp.name);
                          }}
                          style={{
                            padding: '12px 16px', cursor: 'pointer', display: 'flex',
                            alignItems: 'center', gap: '10px', fontSize: '13px',
                            borderBottom: '1px solid var(--border-main)',
                            transition: 'background 0.15s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-input)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                            background: 'linear-gradient(135deg, #F58220, #245fb4)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: '11px', fontWeight: 800
                          }}>{emp.name.charAt(0).toUpperCase()}</div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-head)' }}>{emp.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-sub)' }}>{emp.city || 'Global'} • {emp.branch || 'Main'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {editForm.userId && (
                    <button
                      type="button"
                      onClick={() => { setEditForm({ ...editForm, userId: '' }); setEmpSearch(''); }}
                      style={{
                        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                        background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444',
                        borderRadius: '6px', padding: '2px 8px', cursor: 'pointer', fontSize: '11px', fontWeight: 700
                      }}
                    >✕ Clear</button>
                  )}
                </div>
                {editForm.userId && (
                  <div style={{ fontSize: '11px', color: '#10b981', marginTop: '6px', fontWeight: 600 }}>
                    ✓ Linked to employee profile — will appear in their Mobile Lines section
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-sub)', fontWeight: 800, letterSpacing:'0.05em' }}>PLAN SPECIFICATIONS</label>
                <input 
                  type="text" 
                  value={editForm.planDetails}
                  onChange={e => setEditForm({ ...editForm, planDetails: e.target.value })}
                  style={inputStyle} 
                  placeholder="e.g. 899 corporate data pipe"
                />
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  style={{
                    flex: 1, padding: '14px', background: 'rgba(255,255,255,0.03)', color: 'var(--text-head)',
                    border: '1px solid var(--border-main)', borderRadius: '16px', cursor: 'pointer', fontWeight: 700, fontSize:'13px'
                  }}>
                  Dismiss
                </button>
                <button 
                  type="submit" disabled={isSaving}
                  style={{
                    flex: 1, padding: '14px', background: '#F58220', color: '#fff',
                    border: 'none', borderRadius: '16px', cursor: 'pointer', fontWeight: 800, fontSize:'13px',
                    boxShadow: '0 8px 20px rgba(245, 130, 32, 0.3)'
                  }}>
                  {isSaving ? 'Saving Node...' : 'Commit Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes modalSlide {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
