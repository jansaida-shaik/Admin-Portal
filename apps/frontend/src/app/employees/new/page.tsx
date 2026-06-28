'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';

export default function NewEmployeePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'STAFF',
    branch: '',
    city: ''
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
      // Auto-generate dummy email if empty
      let finalEmail = formData.email;
      if (!finalEmail) {
        if (!formData.phone) {
          throw new Error("Phone number is required if email is blank.");
        }
        finalEmail = `${formData.phone.replace(/[^0-9]/g, '')}@codegnan.com`;
      }

      await fetchApi('/users', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          email: finalEmail
        })
      });

      setSuccessMsg('Employee registered successfully!');
      setTimeout(() => {
        router.push('/employees');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to register employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <Link href="/employees" style={{
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
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: 'var(--text-head)' }}>Register Employee</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-sub)', margin: '4px 0 0 0' }}>Add a new staff member to the directory.</p>
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
            {/* Name */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Full Name
              </label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="e.g. John Doe" style={{
                width: '100%', padding: '12px 16px', background: 'var(--bg-input)', border: '1px solid var(--border-main)', borderRadius: '12px', color: 'var(--text-head)', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
              }} />
            </div>

            {/* Role */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                System Role
              </label>
              <select name="role" value={formData.role} onChange={handleChange} style={{
                width: '100%', padding: '12px 16px', background: 'var(--bg-input)', border: '1px solid var(--border-main)', borderRadius: '12px', color: 'var(--text-head)', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
              }}>
                <option value="STAFF">Staff (Standard)</option>
                <option value="ADMIN">Administrator (Full Access)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {/* Phone */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Phone Number
              </label>
              <input type="text" name="phone" required value={formData.phone} onChange={handleChange} placeholder="10-digit mobile number" style={{
                width: '100%', padding: '12px 16px', background: 'var(--bg-input)', border: '1px solid var(--border-main)', borderRadius: '12px', color: 'var(--text-head)', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
              }} />
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Email Address (Optional)
              </label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Will default to phone if empty" style={{
                width: '100%', padding: '12px 16px', background: 'var(--bg-input)', border: '1px solid var(--border-main)', borderRadius: '12px', color: 'var(--text-head)', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
              }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {/* Branch */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Branch / Department
              </label>
              <input type="text" name="branch" value={formData.branch} onChange={handleChange} placeholder="e.g. Sales, Technical, Operations" style={{
                width: '100%', padding: '12px 16px', background: 'var(--bg-input)', border: '1px solid var(--border-main)', borderRadius: '12px', color: 'var(--text-head)', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
              }} />
            </div>

            {/* City */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Location / City
              </label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Vijayawada, Hyderabad" style={{
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
              {isSubmitting ? 'Registering...' : 'Register Employee'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
