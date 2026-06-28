'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';

export default function EmployeeOnboarding() {
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New Personnel Induction Form
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadChecklists() {
      try {
        const data = await fetchApi('/onboarding');
        setChecklists(data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    loadChecklists();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetchApi('/onboarding', {
        method: 'POST',
        body: JSON.stringify({ employeeName: name, role, notes })
      });
      setChecklists([res, ...checklists]);
      setName('');
      setRole('');
      setNotes('');
      setShowForm(false);
    } catch (e) {
      alert('Failure: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleItem = async (checklist, fieldName) => {
    try {
      const updatedObj = {
        ...checklist,
        [fieldName]: !checklist[fieldName]
      };
      
      // Automatically upgrade status if everything is selected
      const keys = ['laptop', 'mouse', 'keyboard', 'headset', 'simCard'];
      const allDone = keys.every(k => updatedObj[k] === true);
      updatedObj.status = allDone ? 'COMPLETED' : 'IN_PROGRESS';

      const res = await fetchApi(`/onboarding/${checklist.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedObj)
      });

      setChecklists(checklists.map(c => c.id.toString() === checklist.id.toString() ? res : c));
    } catch (e) {
      alert('Toggle failed: ' + e.message);
    }
  };

  if (loading) return <div style={{ padding: '40px', color: 'var(--text-sub)' }}>Reticulating personnel onboarding rosters...</div>;

  return (
    <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:'32px', padding:'24px', boxSizing:'border-box' }}>
      
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-head)', margin: 0, letterSpacing: '-0.02em' }}>Induction Ledger</h1>
          <p style={{ margin:'4px 0 0 0', color:'var(--text-sub)', fontSize:'14px', fontWeight:600 }}>Configure essential hardware setups for newly dispatched corporate staff.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          background: 'linear-gradient(135deg, #F58220, #245fb4)', 
          color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '14px',
          fontWeight: 800, fontSize: '13px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(245,130,32,0.25)'
        }}>
          {showForm ? '✕ Dismiss Intake' : '➕ Stage New Employee'}
        </button>
      </div>

      {/* Sliding Intake Form Drawer */}
      {showForm && (
        <form onSubmit={handleCreate} className="glass-card" style={{
          background: 'var(--bg-panel)', border: '1px solid var(--border-main)', borderRadius: '24px',
          padding: '32px', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'20px',
          alignItems:'end', boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Staff Full Name</label>
            <input type="text" required value={name} onChange={e=>setName(e.target.value)} style={{
              width:'100%', background:'rgba(0,0,0,0.2)', border:'1px solid var(--border-main)', borderRadius:'12px', padding:'12px', color:'var(--text-head)', fontSize:'14px', outline:'none', boxSizing:'border-box'
            }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Designated Role</label>
            <input type="text" required value={role} onChange={e=>setRole(e.target.value)} placeholder="e.g. Lead Backend Architect" style={{
              width:'100%', background:'rgba(0,0,0,0.2)', border:'1px solid var(--border-main)', borderRadius:'12px', padding:'12px', color:'var(--text-head)', fontSize:'14px', outline:'none', boxSizing:'border-box'
            }} />
          </div>
          <div style={{ gridColumn:'span 2' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Logistical Specs / Notes</label>
            <input type="text" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="e.g. High-perf RAM laptop required" style={{
              width:'100%', background:'rgba(0,0,0,0.2)', border:'1px solid var(--border-main)', borderRadius:'12px', padding:'12px', color:'var(--text-head)', fontSize:'14px', outline:'none', boxSizing:'border-box'
            }} />
          </div>
          <button type="submit" disabled={submitting} style={{
            background:'#F58220', color:'#fff', border:'none', padding:'12px', borderRadius:'12px', fontWeight:800, fontSize:'13px', cursor:'pointer'
          }}>
            {submitting ? 'Staging...' : 'Commit Induction Vector'}
          </button>
        </form>
      )}

      {/* Live Induction Ledger Workspace */}
      {checklists.length === 0 ? (
        <div className="glass-card" style={{ padding:'64px', borderRadius:'24px', border:'1px solid var(--border-main)', color:'var(--text-sub)', textAlign:'center' }}>
          <p style={{ margin:0, fontWeight:600, fontSize:'15px' }}>No pending employee staging flows exist in the database.</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(340px, 1fr))', gap:'24px' }}>
          {checklists.map(c => {
            // Compute dynamic progress %
            const items = [c.laptop, c.mouse, c.keyboard, c.headset, c.simCard];
            const completedCount = items.filter(Boolean).length;
            const percent = Math.round((completedCount / 5) * 100);

            return (
              <div key={c.id.toString()} className="glass-card" style={{
                background: 'var(--bg-panel)', border: '1px solid var(--border-main)', borderRadius: '24px',
                padding: '28px', display:'flex', flexDirection:'column', gap:'20px', boxShadow:'0 12px 30px rgba(0,0,0,0.1)',
                transition:'transform 0.2s'
              }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div>
                    <h3 style={{ margin:0, fontSize:'18px', fontWeight:800, color:'var(--text-head)' }}>{c.employeeName}</h3>
                    <span style={{ fontSize:'12px', color:'var(--text-sub)', fontWeight:700 }}>{c.role}</span>
                  </div>
                  <span style={{
                    padding: '4px 10px', borderRadius:'8px', fontSize:'11px', fontWeight:800,
                    background: c.status === 'COMPLETED' ? 'rgba(16,185,129,0.1)' : 'rgba(245,130,32,0.1)',
                    color: c.status === 'COMPLETED' ? '#10b981' : '#F58220'
                  }}>
                    {c.status}
                  </span>
                </div>

                {/* Progress bar indicator */}
                <div style={{ width:'100%' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'11px', fontWeight:800, color:'var(--text-sub)', textTransform:'uppercase', marginBottom:'6px' }}>
                    <span>Provisioning Quotient</span>
                    <span style={{ color:'#F58220' }}>{percent}%</span>
                  </div>
                  <div style={{ height:'6px', background:'rgba(255,255,255,0.04)', borderRadius:'10px', overflow:'hidden', border:'1px solid var(--border-main)' }}>
                    <div style={{ height:'100%', background:'linear-gradient(90deg, #F58220, #245fb4)', width:`${percent}%`, transition:'width 0.4s ease-out' }}></div>
                  </div>
                </div>

                {/* Grid of interactive checkbox pill components */}
                <div style={{ display:'grid', gap:'8px' }}>
                  {[
                    { label: '📦 Enterprise Laptop', key: 'laptop' },
                    { label: '🖱️ Laser Input Mouse', key: 'mouse' },
                    { label: '⌨️ Multi-switch Keyboard', key: 'keyboard' },
                    { label: '🎧 Noise-Canceling Headset', key: 'headset' },
                    { label: '📶 SIM Activation Vector', key: 'simCard' }
                  ].map(item => {
                    const done = c[item.key];
                    return (
                      <button 
                        key={item.key}
                        onClick={() => toggleItem(c, item.key)}
                        style={{
                          display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 16px', borderRadius:'12px',
                          background: done ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${done ? 'rgba(16,185,129,0.2)' : 'var(--border-main)'}`,
                          cursor:'pointer', textAlign:'left', outline:'none', transition:'all 0.2s'
                        }}
                        onMouseEnter={e=>e.currentTarget.style.transform='translateX(2px)'}
                        onMouseLeave={e=>e.currentTarget.style.transform='translateX(0)'}
                      >
                        <span style={{ fontSize:'13px', fontWeight: done ? 800 : 650, color: done ? 'var(--text-head)' : 'var(--text-sub)' }}>
                          {item.label}
                        </span>
                        <div style={{
                          width:'18px', height:'18px', borderRadius:'6px', 
                          background: done ? '#10b981' : 'transparent',
                          border: `2px solid ${done ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
                          display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'10px', fontWeight:900
                        }}>
                          {done && '✓'}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {c.notes && (
                  <div style={{ background:'rgba(255,255,255,0.01)', border:'1px dotted var(--border-main)', padding:'12px 16px', borderRadius:'12px', fontSize:'12px', color:'var(--text-sub)', fontStyle:'italic' }}>
                    💡 {c.notes}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
