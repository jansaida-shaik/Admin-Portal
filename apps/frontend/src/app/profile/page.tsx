'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import CarrierLogo from '@/components/mobile/CarrierLogo';
import { formatMobileNumber, normalizeMobileProvider } from '@/lib/mobileProviders';

export default function UserProfile() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  // Editable form
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', city: '', branch: ''
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await fetchApi('/me');
        if (data) {
          setMe(data);
          setFormData({
            name: data.name || '',
            email: data.email || '',
            password: data.password || '',
            phone: data.phone || '',
            city: data.city || '',
            branch: data.branch || ''
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await fetchApi('/me', {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      setMsg({ type: 'success', text: 'Account specifications updated successfully!' });
      const updated = await fetchApi('/me');
      if (updated) {
        setMe(updated);
      }
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', color: 'var(--text-sub)' }}>Authenticating profile ledger...</div>;

  if (!me) return <div style={{ padding: '40px', color: 'var(--text-sub)' }}>Unable to retrieve profile specifications. Please check your credentials.</div>;

  return (
    <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', flexDirection: 'column', gap: '16px', padding:'0px 16px', boxSizing:'border-box', height: '100%', justifyContent: 'center' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-head)', margin: 0, letterSpacing: '-0.02em' }}>Account Registry</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Editable Details Form */}
        <form onSubmit={handleSave} className="glass-card" style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-main)',
          borderRadius: '24px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position:'absolute', top:'-60px', right:'-60px', width:'160px', height:'160px', background:'rgba(245,130,32,0.08)', borderRadius:'50%', filter:'blur(40px)', pointerEvents:'none' }}></div>

          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var(--text-head)', borderBottom: '1px solid var(--border-main)', paddingBottom: '16px' }}>🔧 Configure Identity</h2>

          {msg && (
            <div style={{
              padding: '14px 18px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 700,
              background: msg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              border: msg.type === 'success' ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(239,68,68,0.2)',
              color: msg.type === 'success' ? '#10b981' : '#ef4444'
            }}>
              {msg.text}
            </div>
          )}

          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Full Name</label>
              <input type="text" value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} required style={{
                width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-main)', borderRadius: '12px', padding: '12px 16px', color: 'var(--text-head)', outline: 'none', boxSizing: 'border-box', fontSize:'14px', fontWeight:600
              }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Corporate Email</label>
              <input type="email" value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} required style={{
                width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-main)', borderRadius: '12px', padding: '12px 16px', color: 'var(--text-head)', outline: 'none', boxSizing: 'border-box', fontSize:'14px', fontWeight:600
              }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Password Hash</label>
              <input type="password" value={formData.password} onChange={e=>setFormData({...formData, password:e.target.value})} placeholder="••••••••" style={{
                width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-main)', borderRadius: '12px', padding: '12px 16px', color: 'var(--text-head)', outline: 'none', boxSizing: 'border-box', fontSize:'14px', fontWeight:600
              }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Location</label>
                <input type="text" value={formData.city} onChange={e=>setFormData({...formData, city:e.target.value})} placeholder="e.g. Hyderabad" style={{
                  width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-main)', borderRadius: '12px', padding: '12px 16px', color: 'var(--text-head)', outline: 'none', boxSizing: 'border-box', fontSize:'14px', fontWeight:600
                }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Branch</label>
                <input type="text" value={formData.branch} onChange={e=>setFormData({...formData, branch:e.target.value})} placeholder="e.g. IT Park" style={{
                  width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-main)', borderRadius: '12px', padding: '12px 16px', color: 'var(--text-head)', outline: 'none', boxSizing: 'border-box', fontSize:'14px', fontWeight:600
                }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Contact Number</label>
              <input type="text" value={formData.phone} onChange={e=>setFormData({...formData, phone:e.target.value})} placeholder="+91 00000 00000" style={{
                width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-main)', borderRadius: '12px', padding: '12px 16px', color: 'var(--text-head)', outline: 'none', boxSizing: 'border-box', fontSize:'14px', fontWeight:600
              }} />
            </div>
          </div>

          <button type="submit" disabled={saving || me.id === 'admin'} style={{
            marginTop: '8px',
            width: '100%',
            background: me.id === 'admin' ? 'var(--border-main)' : 'linear-gradient(135deg, #F58220, #245fb4)',
            color: '#fff',
            border: 'none',
            padding: '14px',
            borderRadius: '14px',
            fontSize: '14px',
            fontWeight: 800,
            cursor: saving || me.id === 'admin' ? 'not-allowed' : 'pointer',
            boxShadow: me.id === 'admin' ? 'none' : '0 8px 20px rgba(245, 130, 32, 0.25)',
            transition: 'transform 0.2s'
          }} onMouseEnter={e=>{ if(me.id !== 'admin') e.currentTarget.style.transform = 'translateY(-1px)' }} onMouseLeave={e=>e.currentTarget.style.transform = 'translateY(0)'}>
            {saving ? 'Synchronizing...' : me.id === 'admin' ? 'Superadmin is Protected' : 'Commit Account Updates'}
          </button>
        </form>

        {/* Right Column: Assigned Resource Telemetry */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Personnel Identity Box */}
          <div className="glass-card" style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-main)',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '20px',
              background: 'linear-gradient(135deg, #F58220, #245fb4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '28px', fontWeight: 800, boxShadow: '0 8px 20px rgba(245, 130, 32, 0.25)'
            }}>
              {me.name ? me.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 900, color: 'var(--text-head)' }}>{me.name}</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-sub)', fontWeight: 700, textTransform:'uppercase', letterSpacing:'0.05em' }}>{me.role} PROFILE</p>
              <div style={{ marginTop: '8px', fontSize: '13px', color: '#F58220', fontWeight: 600 }}>
                📍 {me.city || 'Primary'} • {me.branch || 'Hub'}
              </div>
            </div>
          </div>

          {/* Custody Audit */}
          <div className="glass-card" style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-main)',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            display:'flex',
            flexDirection:'column',
            gap:'16px'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-head)', display:'flex', alignItems:'center', gap:'8px' }}>
              🛡️ Verified Resource Custody
            </h3>

            {/* Combined Items Roster */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {!me.assignments || me.assignments.length === 0 ? (
                <div style={{ padding: '24px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px dotted var(--border-main)', textAlign: 'center', color: 'var(--text-sub)', fontSize: '13px' }}>
                  No hardware hardware allocations recorded.
                </div>
              ) : (
                me.assignments.map(a => (
                  <div key={a.id.toString()} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '16px 20px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-main)'
                  }}>
                    <div>
                      <div style={{ fontWeight: 750, color: 'var(--text-head)', fontSize: '14px' }}>{a.item?.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-sub)', fontWeight: 600, marginTop:'2px' }}>📌 Loc: {a.location?.city || 'Global'}</div>
                    </div>
                    <span style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(245,130,32,0.1)', color: '#F58220', fontSize: '11px', fontWeight: 800 }}>
                      ACTIVE
                    </span>
                  </div>
                ))
              )}

              {me.mobileNumbers && me.mobileNumbers.map(n => (
                <div key={n.id.toString()} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '16px 20px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-main)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <CarrierLogo provider={n.provider} size={30} />
                    <div>
                      <div style={{ fontWeight: 750, color: 'var(--text-head)', fontSize: '14px', fontFamily: 'monospace' }}>{formatMobileNumber(n.number)}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-sub)', fontWeight: 600, marginTop:'2px' }}>Provider: {normalizeMobileProvider(n.provider) || 'Airtel'}</div>
                    </div>
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', color: '#10b981', fontSize: '11px', fontWeight: 800 }}>
                    ACTIVE
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
