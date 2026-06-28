'use client';
import { useState } from 'react';

export default function PlacementModal({ onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [branchName, setBranchName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit({ title, branchName, quantity });
    setSubmitting(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex: 9999
    }}>
      <div className="glass-card" style={{
        background: 'var(--bg-panel)', border: '1px solid var(--border-main)', borderRadius: '28px',
        padding: '36px', width: '100%', maxWidth: '460px', display:'flex', flexDirection:'column', gap:'24px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.4)', animation: 'fadeIn 0.3s ease-out'
      }}>
        <div>
          <h2 style={{ margin:0, fontSize:'22px', fontWeight:900, color:'var(--text-head)' }}>🛫 Broadcast Consignment</h2>
          <p style={{ margin:'4px 0 0 0', color:'var(--text-sub)', fontSize:'13px', fontWeight:600 }}>Register a bulk deployment ledger entry.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display:'grid', gap:'20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Order Contents</label>
            <input type="text" required value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Dell Inspiron Lab Setup" style={{
              width:'100%', background:'rgba(0,0,0,0.2)', border:'1px solid var(--border-main)', borderRadius:'12px', padding:'12px', color:'var(--text-head)', fontSize:'14px', outline:'none', boxSizing:'border-box'
            }} />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Branch Location Target</label>
              <input type="text" required value={branchName} onChange={e=>setBranchName(e.target.value)} placeholder="e.g. Kakinada" style={{
                width:'100%', background:'rgba(0,0,0,0.2)', border:'1px solid var(--border-main)', borderRadius:'12px', padding:'12px', color:'var(--text-head)', fontSize:'14px', outline:'none', boxSizing:'border-box'
              }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Quantity</label>
              <input type="number" required min="1" value={quantity} onChange={e=>setQuantity(e.target.value)} style={{
                width:'100%', background:'rgba(0,0,0,0.2)', border:'1px solid var(--border-main)', borderRadius:'12px', padding:'12px', color:'var(--text-head)', fontSize:'14px', outline:'none', boxSizing:'border-box'
              }} />
            </div>
          </div>

          <div style={{ display:'flex', gap:'12px', marginTop:'12px' }}>
            <button type="button" onClick={onClose} disabled={submitting} style={{
              flex:1, background:'transparent', border:'1px solid var(--border-main)', color:'var(--text-head)',
              padding:'12px', borderRadius:'12px', fontWeight:800, fontSize:'13px', cursor:'pointer'
            }}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} style={{
              flex:1, background:'linear-gradient(135deg, #F58220, #245fb4)', color:'#fff', border:'none',
              padding:'12px', borderRadius:'12px', fontWeight:800, fontSize:'13px', cursor:'pointer',
              boxShadow:'0 8px 20px rgba(245,130,32,0.25)'
            }}>
              {submitting ? 'Broadcasting...' : 'Log Consignment'}
            </button>
          </div>
        </form>
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
