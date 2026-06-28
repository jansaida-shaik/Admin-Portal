'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';

export default function NewVendorPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    contact: ''
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
      await fetchApi('/vendors', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      setSuccessMsg('Vendor enrolled successfully!');
      setTimeout(() => {
        router.push('/vendors');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to enroll vendor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <Link href="/vendors" style={{
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
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: 'var(--text-head)' }}>Enroll Vendor</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-sub)', margin: '4px 0 0 0' }}>Register a new supplier or partner.</p>
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
            {/* Vendor Name */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Vendor / Supplier Name
              </label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="e.g. Reliance Digital, Apple Store" style={{
                width: '100%', padding: '12px 16px', background: 'var(--bg-input)', border: '1px solid var(--border-main)', borderRadius: '12px', color: 'var(--text-head)', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
              }} />
            </div>

            {/* Contact */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Primary Contact
              </label>
              <input type="text" name="contact" required value={formData.contact} onChange={handleChange} placeholder="Email, Phone, or Website" style={{
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
              {isSubmitting ? 'Enrolling...' : 'Enroll Vendor'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
