'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';

export default function NewSubscriptionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    vendor: '',
    plan: '',
    category: 'Software',
    licenseCount: '',
    cost: '',
    billingFrequency: 'YEARLY',
    purchaseDate: '',
    renewalDate: '',
    autoRenew: true,
    paymentMethod: '',
    owner: '',
    notes: ''
  });

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await fetchApi('/subscriptions', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      router.push('/subscriptions');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create subscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <Link href="/subscriptions" style={{
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
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: 'var(--text-head)' }}>Add Subscription</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-sub)', margin: '4px 0 0 0' }}>Register a new software or service license.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '32px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {errorMsg && (
          <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '12px', fontSize: '14px', fontWeight: 500 }}>
            {errorMsg}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: '8px' }}>Service Name</label>
            <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="e.g. MongoDB Atlas" style={{
              width: '100%', padding: '12px 16px', background: 'var(--bg-input)', border: '1px solid var(--border-main)', borderRadius: '12px', color: 'var(--text-head)', outline: 'none', boxSizing: 'border-box'
            }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: '8px' }}>Vendor</label>
            <input type="text" name="vendor" required value={formData.vendor} onChange={handleChange} placeholder="e.g. MongoDB Inc" style={{
              width: '100%', padding: '12px 16px', background: 'var(--bg-input)', border: '1px solid var(--border-main)', borderRadius: '12px', color: 'var(--text-head)', outline: 'none', boxSizing: 'border-box'
            }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: '8px' }}>Plan Details</label>
            <input type="text" name="plan" value={formData.plan} onChange={handleChange} placeholder="e.g. M10 Cluster" style={{
              width: '100%', padding: '12px 16px', background: 'var(--bg-input)', border: '1px solid var(--border-main)', borderRadius: '12px', color: 'var(--text-head)', outline: 'none', boxSizing: 'border-box'
            }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: '8px' }}>Cost (₹)</label>
            <input type="number" name="cost" required value={formData.cost} onChange={handleChange} placeholder="0.00" style={{
              width: '100%', padding: '12px 16px', background: 'var(--bg-input)', border: '1px solid var(--border-main)', borderRadius: '12px', color: 'var(--text-head)', outline: 'none', boxSizing: 'border-box'
            }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: '8px' }}>Billing Cycle</label>
            <select name="billingFrequency" value={formData.billingFrequency} onChange={handleChange} style={{
              width: '100%', padding: '12px 16px', background: 'var(--bg-input)', border: '1px solid var(--border-main)', borderRadius: '12px', color: 'var(--text-head)', outline: 'none', boxSizing: 'border-box'
            }}>
              <option value="MONTHLY">Monthly</option>
              <option value="QUARTERLY">Quarterly</option>
              <option value="HALF_YEARLY">Half-Yearly</option>
              <option value="YEARLY">Yearly</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: '8px' }}>Renewal Date</label>
            <input type="date" name="renewalDate" required value={formData.renewalDate} onChange={handleChange} style={{
              width: '100%', padding: '12px 16px', background: 'var(--bg-input)', border: '1px solid var(--border-main)', borderRadius: '12px', color: 'var(--text-head)', outline: 'none', boxSizing: 'border-box', colorScheme: 'dark'
            }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input type="checkbox" name="autoRenew" checked={formData.autoRenew} onChange={handleChange} style={{ width: '20px', height: '20px', accentColor: '#f58220' }} />
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-head)' }}>Auto-Renews Automatically</span>
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button type="submit" disabled={isSubmitting} style={{
            background: 'var(--text-head)', color: 'var(--bg-panel)',
            border: 'none', padding: '14px 32px', borderRadius: '12px',
            fontSize: '14px', fontWeight: 800, cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1
          }}>
            {isSubmitting ? 'Saving...' : 'Add Subscription'}
          </button>
        </div>
      </form>
    </div>
  );
}
