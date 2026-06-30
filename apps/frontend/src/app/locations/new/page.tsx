'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';

export default function NewLocation() {
  const router = useRouter();
  const [formData, setFormData] = useState({ city: '', name: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await fetchApi('/locations', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      setSuccessMsg('Location hub enrolled successfully!');
      setTimeout(() => {
        router.push('/locations');
      }, 300);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to enroll location');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <Link href="/locations" style={{
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
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: 'var(--text-head)' }}>Register Location Hub</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-sub)', margin: '4px 0 0 0' }}>Add a new operational center to the registry.</p>
        </div>
      </div>

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
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                City (Region)
              </label>
              <input type="text" name="city" required value={formData.city} onChange={handleChange} placeholder="e.g. Hyderabad" style={{
                width: '100%', padding: '12px 16px', background: 'var(--bg-input)', border: '1px solid var(--border-main)', borderRadius: '12px', color: 'var(--text-head)', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
              }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Campus Name
              </label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="e.g. Kondapur Campus" style={{
                width: '100%', padding: '12px 16px', background: 'var(--bg-input)', border: '1px solid var(--border-main)', borderRadius: '12px', color: 'var(--text-head)', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
              }} />
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={isSubmitting} style={{
              background: 'linear-gradient(135deg, var(--accent-orange), #ff6b00)', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1, transition: 'all 0.2s', boxShadow: '0 8px 16px rgba(245,130,32,0.2)'
            }}>
              {isSubmitting ? 'Registering...' : 'Complete Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
