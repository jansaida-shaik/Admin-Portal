'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';

export default function NewInternetConnectionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetchApi('/locations').then(res => setLocations(res.data || [])).catch(() => {});
  }, []);

  const [formData, setFormData] = useState({
    provider: '',
    planDetails: '',
    speed: '',
    monthlyCost: '',
    dueDate: '',
    locationId: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = { ...formData };
      if (payload.speed) payload.speed = parseInt(payload.speed, 10);
      if (payload.monthlyCost) payload.monthlyCost = parseFloat(payload.monthlyCost);
      if (payload.dueDate) payload.dueDate = new Date(payload.dueDate).toISOString();

      await fetchApi('/internet-bills', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setSuccessMsg('Internet connection added successfully!');
      setTimeout(() => {
        router.push('/internet-bills');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add connection');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <Link href="/internet-bills" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '40px', height: '40px', borderRadius: '12px',
          background: 'rgba(255,255,255,0.05)', color: 'var(--text-sub)',
          border: '1px solid var(--border-main)', textDecoration: 'none'
        }}>
          <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: '20px', height: '20px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: 'var(--text-head)' }}>Add Connection</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-sub)', margin: '4px 0 0 0' }}>Register a new broadband or leased line.</p>
        </div>
      </div>

      {/* Form Container */}
      <div className="glass-card" style={{ padding: '32px', borderRadius: '24px' }}>
        {errorMsg && (
          <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', fontWeight: 500 }}>
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div style={{ padding: '12px 16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', fontWeight: 500 }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {/* Provider */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Service Provider
              </label>
              <input type="text" name="provider" required value={formData.provider} onChange={handleChange} placeholder="e.g. Airtel, Jio, ACT" style={{
                width: '100%', padding: '12px 16px', background: 'var(--bg-input)', border: '1px solid var(--border-main)', borderRadius: '12px', color: 'var(--text-head)', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
              }} />
            </div>

            {/* Plan Details */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Plan Details
              </label>
              <input type="text" name="planDetails" value={formData.planDetails} onChange={handleChange} placeholder="e.g. 300Mbps Unlimited" style={{
                width: '100%', padding: '12px 16px', background: 'var(--bg-input)', border: '1px solid var(--border-main)', borderRadius: '12px', color: 'var(--text-head)', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
              }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {/* Speed */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Speed (Mbps)
              </label>
              <input type="number" name="speed" value={formData.speed} onChange={handleChange} placeholder="e.g. 100" style={{
                width: '100%', padding: '12px 16px', background: 'var(--bg-input)', border: '1px solid var(--border-main)', borderRadius: '12px', color: 'var(--text-head)', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
              }} />
            </div>

            {/* Monthly Cost */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Monthly Cost (₹)
              </label>
              <input type="number" name="monthlyCost" value={formData.monthlyCost} onChange={handleChange} placeholder="e.g. 1499" style={{
                width: '100%', padding: '12px 16px', background: 'var(--bg-input)', border: '1px solid var(--border-main)', borderRadius: '12px', color: 'var(--text-head)', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
              }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {/* Location */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Installation Location
              </label>
              <select name="locationId" required value={formData.locationId} onChange={handleChange} style={{
                width: '100%', padding: '12px 16px', background: 'var(--bg-input)', border: '1px solid var(--border-main)', borderRadius: '12px', color: 'var(--text-head)', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
              }}>
                <option value="">Select a location...</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name} ({loc.city})</option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Billing Cycle Due Date
              </label>
              <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} style={{
                width: '100%', padding: '12px 16px', background: 'var(--bg-input)', border: '1px solid var(--border-main)', borderRadius: '12px', color: 'var(--text-head)', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
              }} />
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={isSubmitting} style={{
              background: 'var(--text-head)',
              color: 'var(--bg-panel)',
              border: 'none',
              padding: '14px 32px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 800,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
              transition: 'all 0.2s'
            }}>
              {isSubmitting ? 'Saving...' : 'Add Connection'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
