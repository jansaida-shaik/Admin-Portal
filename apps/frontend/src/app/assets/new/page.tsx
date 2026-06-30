'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import dynamic from 'next/dynamic';

const FileUpload = dynamic(() => import('@/components/FileUpload'), {
  loading: () => <div style={{ height: '80px', width: '100%', background: 'var(--bg-input)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
});

export default function StockMovement() {
  const router = useRouter();
  const [movementType, setMovementType] = useState('IN');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Dynamic Registry Arrays
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Get local format for datetime-local (YYYY-MM-DDThh:mm)
  const getNowLocal = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    itemId: '',
    fromLocationId: '',
    toLocationId: '',
    quantity: 1,
    vendor: '',
    sentById: '',
    receivedById: '',
    transactionDate: getNowLocal(),
    attachments: ''
  });

  // 1. Pre-fetch all actual assets, branches, vendors, and personnel on Component Mount
  useEffect(() => {
    async function preloadManifests() {
      try {
        setLoadingData(true);
        const [itemsRes, locsRes, vensRes, empsRes] = await Promise.all([
          fetchApi('/items?limit=1000'),
          fetchApi('/locations'),
          fetchApi('/vendors'),
          fetchApi('/users?limit=1000'),
        ]);
        
        setItems(itemsRes.data || itemsRes || []);
        setLocations(locsRes.data || locsRes || []);
        setVendors(vensRes.data || vensRes || []);
        setEmployees(empsRes.data || empsRes || []);
      } catch (err) {
        console.error('Manifest loading failed:', err.message);
      } finally {
        setLoadingData(false);
      }
    }
    preloadManifests();
  }, []);

  // Handle type resets to clean form state
  const handleTypeToggle = (type) => {
    setMovementType(type);
    setErrorMsg('');
    setSuccessMsg('');
    setFormData({
      itemId: '',
      fromLocationId: '',
      toLocationId: '',
      quantity: 1,
      vendor: '',
      sentById: '',
      receivedById: '',
      transactionDate: getNowLocal(),
      attachments: ''
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. Connect form directly to standard transactional API stream
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Form validation logic
      if (!formData.itemId) throw new Error('Please select a catalog item.');
      if (movementType === 'OUT' && !formData.fromLocationId) throw new Error('Source location is mandatory for withdrawals.');
      if (movementType === 'IN' && !formData.toLocationId) throw new Error('Destination location is mandatory for stock injections.');
      if (movementType === 'TRANSFER') {
        if (!formData.fromLocationId || !formData.toLocationId) throw new Error('Both source and destination are mandatory for routing.');
        if (formData.fromLocationId === formData.toLocationId) throw new Error('Source and target destination cannot be identical branches.');
      }

      // Construct backend mapping
      const payload = {
        itemId: formData.itemId,
        quantity: formData.quantity,
        type: movementType,
        fromLocationId: formData.fromLocationId || null,
        toLocationId: formData.toLocationId || null,
        vendor: movementType === 'IN' ? (formData.vendor || null) : null,
        sentById: formData.sentById || null,
        receivedById: formData.receivedById || null,
        transactionDate: formData.transactionDate ? new Date(formData.transactionDate).toISOString() : null,
        attachments: formData.attachments || null,
      };

      await fetchApi('/stocks', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setSuccessMsg(`Successfully processed ${movementType} transaction for ${formData.quantity} unit(s)!`);
      setTimeout(() => {
        router.push('/assets'); // Automatically route back to directory
      }, 300);

    } catch (err) {
      setErrorMsg(err.message || 'Logistics vector failed to commit transaction stream.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectStyle = {
    width: '100%',
    height: '48px',
    background: 'var(--bg-panel)',
    border: '1px solid var(--border-main)',
    borderRadius: '14px',
    padding: '0 16px',
    color: 'var(--text-head)',
    fontSize: '14px',
    fontWeight: 600,
    boxSizing: 'border-box',
    outline: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  const inputStyle = {
    width: '100%',
    height: '48px',
    background: 'var(--bg-panel)',
    border: '1px solid var(--border-main)',
    borderRadius: '14px',
    padding: '0 16px',
    color: 'var(--text-head)',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'all 0.2s',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 800,
    color: 'var(--text-sub)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: '8px',
  };

  const getActiveColor = () => {
    if (movementType === 'IN') return '#10b981';
    if (movementType === 'OUT') return '#ef4444';
    return '#245fb4';
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '32px', boxSizing: 'border-box', padding: '24px' }}>
      
      {/* 🌟 Premium Banner Segment */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 800,
            background: 'linear-gradient(135deg, var(--text-head) 30%, #F58220 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            letterSpacing: '-0.02em'
          }}>Logistics Vector</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-sub)', marginTop: '4px' }}>Register entries, extractions, and inter-branch allocation routing manifests.</p>
        </div>
        <Link href="/assets" style={{ textDecoration:'none' }}>
          <button style={{
            background: 'var(--bg-panel)', 
            border: '1px solid var(--border-main)', 
            color: 'var(--text-head)', 
            borderRadius: '14px',
            padding: '10px 20px', 
            fontWeight: 700, 
            fontSize: '13px', 
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-main)'; e.currentTarget.style.background = 'var(--bg-panel)'; }}
          >
            ← Back to Directory
          </button>
        </Link>
      </div>

      <div className="glass-card" style={{
        maxWidth: '760px',
        borderRadius: '24px',
        border: '1px solid var(--border-main)',
        padding: '32px',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {/* Dynamic Glowing Indicator Accent */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
          background: `linear-gradient(90deg, transparent, ${getActiveColor()}, transparent)`,
          opacity: 0.7
        }} />

        {/* 🕹️ Operational Grid Tabs Selectors */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          marginBottom: '36px', 
          padding: '6px', 
          background: 'var(--bg-input)', 
          borderRadius: '16px',
          border: '1px solid var(--border-main)'
        }}>
          {[
            { type: 'IN', label: 'IN (Add Stock)', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
            { type: 'OUT', label: 'OUT (Remove)', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
            { type: 'TRANSFER', label: 'ROUTING (Transfer)', color: '#245fb4', bg: 'rgba(36, 95, 180, 0.12)' }
          ].map((op) => (
            <button 
              key={op.type}
              type="button"
              onClick={() => handleTypeToggle(op.type)} 
              style={{
                flex: 1, 
                padding: '12px', 
                borderRadius: '12px', 
                cursor: 'pointer', 
                fontSize: '13px', 
                fontWeight: 800,
                border: 'none',
                outline: 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: movementType === op.type ? op.bg : 'transparent',
                color: movementType === op.type ? op.color : 'var(--text-sub)',
                boxShadow: movementType === op.type ? `inset 0 0 0 1px ${op.color}30` : 'none',
              }}
              onMouseEnter={(e) => { if(movementType !== op.type) e.currentTarget.style.color = 'var(--text-head)'; }}
              onMouseLeave={(e) => { if(movementType !== op.type) e.currentTarget.style.color = 'var(--text-sub)'; }}
            >
              {op.label}
            </button>
          ))}
        </div>

        {/* ⚡ Success / Error Alerts */}
        {successMsg && (
          <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', padding: '14px', borderRadius: '14px', marginBottom: '24px', fontSize: '14px', fontWeight: 700, textAlign: 'center' }}>
            ✅ {successMsg}
          </div>
        )}
        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '14px', borderRadius: '14px', marginBottom: '24px', fontSize: '14px', fontWeight: 700, textAlign: 'center' }}>
            ⚠️ Error: {errorMsg}
          </div>
        )}

        {loadingData ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-sub)', fontSize: '14px', fontWeight: 600 }}>
            Syncing asset indexes and personnel registries...
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Row 1: Catalog Mapping & Quantity Node */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Catalog Item</label>
                <select name="itemId" required value={formData.itemId} onChange={handleChange} style={selectStyle}>
                  <option value="">Choose target stock item...</option>
                  {items.map(i => (
                    <option key={i.id.toString()} value={i.id.toString()}>{i.name} {i.category ? `(${i.category.name})` : ''}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={labelStyle}>Quantity Node</label>
                <input 
                  type="number" 
                  name="quantity" 
                  min="1" 
                  required 
                  value={formData.quantity} 
                  onChange={handleChange} 
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = getActiveColor()}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-main)'}
                />
              </div>
            </div>

            {/* Row 2: Spatial Vectoring (Source & Target Mapping) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              {(movementType === 'OUT' || movementType === 'TRANSFER') && (
                <div>
                  <label style={labelStyle}>Source Branch (Location)</label>
                  <select name="fromLocationId" required value={formData.fromLocationId} onChange={handleChange} style={selectStyle}>
                    <option value="">Origin branch...</option>
                    {locations.map(loc => (
                      <option key={loc.id.toString()} value={loc.id.toString()}>{loc.name} ({loc.city || 'Global'})</option>
                    ))}
                  </select>
                </div>
              )}

              {(movementType === 'IN' || movementType === 'TRANSFER') && (
                <div>
                  <label style={labelStyle}>Target Branch (Location)</label>
                  <select name="toLocationId" required value={formData.toLocationId} onChange={handleChange} style={selectStyle}>
                    <option value="">Destination branch...</option>
                    {locations.map(loc => (
                      <option key={loc.id.toString()} value={loc.id.toString()}>{loc.name} ({loc.city || 'Global'})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* 👤 Row 3: Dynamic Custody Dispatch (Who Sent & Who Received) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Who Sent (Sender)</label>
                <select name="sentById" value={formData.sentById} onChange={handleChange} style={selectStyle}>
                  <option value="">Select sender personnel...</option>
                  {employees.map(e => (
                    <option key={e.id.toString()} value={e.id.toString()}>{e.name} ({e.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Who Received (Receiver)</label>
                <select name="receivedById" value={formData.receivedById} onChange={handleChange} style={selectStyle}>
                  <option value="">Select receiver personnel...</option>
                  {employees.map(e => (
                    <option key={e.id.toString()} value={e.id.toString()}>{e.name} ({e.email})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 📅 Row 4: DateTime Vectoring */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Transaction Timestamp (When / Date)</label>
                <input 
                  type="datetime-local"
                  name="transactionDate"
                  required
                  value={formData.transactionDate}
                  onChange={handleChange}
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = getActiveColor()}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-main)'}
                />
              </div>

              {movementType === 'IN' && (
                 <div>
                   <label style={labelStyle}>Fulfillment Partner (Vendor)</label>
                   <select name="vendor" value={formData.vendor || ''} onChange={handleChange} style={selectStyle}>
                      <option value="">External partner...</option>
                      {vendors.map(v => (
                        <option key={v.id.toString()} value={v.name}>{v.name}</option>
                      ))}
                   </select>
                 </div>
              )}
            </div>

            <div>
              <FileUpload 
                value={formData.attachments}
                onChange={(val) => setFormData({ ...formData, attachments: val })}
                label="Transaction Receipts & Logistic Files"
              />
            </div>

            {/* 🔥 Commitment Vector Action */}
            <div style={{ marginTop: '16px', paddingTop: '28px', borderTop: '1px solid var(--border-main)' }}>
               <button 
                 type="submit" 
                 disabled={isSubmitting}
                 style={{
                   width: '100%', 
                   background: getActiveColor(),
                   color: '#fff', 
                   border: 'none', 
                   borderRadius: '14px', 
                   padding: '14px',
                   fontWeight: 800, 
                   fontSize: '14px', 
                   letterSpacing: '0.5px',
                   cursor: isSubmitting ? 'not-allowed' : 'pointer', 
                   opacity: isSubmitting ? 0.7 : 1,
                   boxShadow: `0 4px 20px ${getActiveColor()}35`,
                   transition: 'all 0.2s ease'
                 }}
                 onMouseEnter={(e) => {
                   if(!isSubmitting) {
                     e.currentTarget.style.transform = 'translateY(-1px)';
                     e.currentTarget.style.boxShadow = `0 8px 24px ${getActiveColor()}50`;
                   }
                 }}
                 onMouseLeave={(e) => {
                   if(!isSubmitting) {
                     e.currentTarget.style.transform = 'none';
                     e.currentTarget.style.boxShadow = `0 4px 20px ${getActiveColor()}35`;
                   }
                 }}
               >
                 {isSubmitting ? 'Committing Transaction Stream...' : `Commit ${movementType} Transaction Stream`}
               </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}
