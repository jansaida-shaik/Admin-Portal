'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CarrierLogo from '@/components/mobile/CarrierLogo';
import MobileProviderPicker from '@/components/mobile/MobileProviderPicker';
import { fetchApi } from '@/lib/api';
import { formatMobileNumber, getTelecomBrandColor } from '@/lib/mobileProviders';

export default function NewMobileNumberPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    number: '',
    provider: 'Airtel',
    planDetails: '',
    status: 'AVAILABLE',
    assignedTo: '',
    nextRechargeDate: '',
    isDummy: false
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: 'var(--bg-input)',
    border: '1px solid var(--border-main)',
    borderRadius: '12px',
    color: 'var(--text-head)',
    fontSize: '14px',
    marginTop: '8px',
    outline: 'none',
    boxSizing: 'border-box',
    fontWeight: 600
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const created = await fetchApi('/mobile-numbers', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          number: `${formData.number ?? ''}`.replace(/\D/g, '').slice(-10)
        })
      });

      router.push(`/mobile-numbers/${created.id}`);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  }

  const previewNumber = formatMobileNumber(formData.number || '9705243061');
  const brandColor = getTelecomBrandColor(formData.provider);

  return (
    <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: '28px', boxSizing: 'border-box', padding: '24px' }}>
      <div>
        <Link href="/mobile-numbers" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700, color: '#F58220', textDecoration: 'none' }}>
          ← Back to Mobile Communications
        </Link>
        <h1 style={{ margin: '14px 0 0 0', fontSize: '32px', fontWeight: 900, color: 'var(--text-head)', letterSpacing: '-0.02em' }}>
          Register New SIM
        </h1>
        <p style={{ margin: '6px 0 0 0', color: 'var(--text-sub)', fontSize: '14px' }}>
          Add a mobile number with a branded carrier selection for Airtel, Jio, BSNL, or Vi.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, 0.8fr)', gap: '28px', alignItems: 'start' }}>
        <form
          onSubmit={handleSubmit}
          className="glass-card"
          style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-main)',
            borderRadius: '28px',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}
        >
          {error && (
            <div style={{ padding: '14px 16px', borderRadius: '14px', border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontWeight: 700, fontSize: '13px' }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-sub)', fontWeight: 800, letterSpacing: '0.05em' }}>
              MOBILE NUMBER
            </label>
            <input
              type="text"
              required
              maxLength={16}
              value={formData.number}
              onChange={(event) => setFormData({ ...formData, number: event.target.value })}
              style={inputStyle}
              placeholder="Enter 10-digit mobile number"
            />
          </div>

          <MobileProviderPicker
            value={formData.provider}
            onChange={(provider) => setFormData({ ...formData, provider })}
            label="CARRIER LOGO + PROVIDER"
            helperText="This selection standardizes the database and portal UI to Jio, Airtel, BSNL, or Vi."
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-sub)', fontWeight: 800, letterSpacing: '0.05em' }}>
                STATUS
              </label>
              <select
                value={formData.status}
                onChange={(event) => setFormData({ ...formData, status: event.target.value })}
                style={inputStyle}
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-sub)', fontWeight: 800, letterSpacing: '0.05em' }}>
                NEXT RECHARGE
              </label>
              <input
                type="date"
                value={formData.nextRechargeDate}
                onChange={(event) => setFormData({ ...formData, nextRechargeDate: event.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-sub)', fontWeight: 800, letterSpacing: '0.05em' }}>
              ASSIGNED TO
            </label>
            <input
              type="text"
              value={formData.assignedTo}
              onChange={(event) => setFormData({ ...formData, assignedTo: event.target.value })}
              style={inputStyle}
              placeholder="Optional assignee or department"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-sub)', fontWeight: 800, letterSpacing: '0.05em' }}>
              PLAN DETAILS
            </label>
            <input
              type="text"
              value={formData.planDetails}
              onChange={(event) => setFormData({ ...formData, planDetails: event.target.value })}
              style={inputStyle}
              placeholder="Corporate plan, data pack, or billing note"
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-head)', fontWeight: 700, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.isDummy}
              onChange={(event) => setFormData({ ...formData, isDummy: event.target.checked })}
            />
            Mark as dummy or test SIM
          </label>

          <div style={{ display: 'flex', gap: '14px', marginTop: '8px' }}>
            <Link
              href="/mobile-numbers"
              style={{
                flex: 1,
                padding: '14px',
                background: 'rgba(255,255,255,0.03)',
                color: 'var(--text-head)',
                border: '1px solid var(--border-main)',
                borderRadius: '16px',
                textAlign: 'center',
                textDecoration: 'none',
                fontWeight: 700
              }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 1,
                padding: '14px',
                background: 'linear-gradient(135deg, #F58220, #245fb4)',
                color: '#fff',
                border: 'none',
                borderRadius: '16px',
                fontWeight: 800,
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: '0 12px 24px rgba(245,130,32,0.24)'
              }}
            >
              {saving ? 'Saving SIM...' : 'Create SIM'}
            </button>
          </div>
        </form>

        <div
          className="glass-card"
          style={{
            background: 'var(--bg-panel)',
            border: `1px solid ${brandColor}3d`,
            borderRadius: '28px',
            padding: '28px',
            boxShadow: `0 20px 40px ${brandColor}14`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <CarrierLogo provider={formData.provider} size={56} />
            <div>
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: '26px', fontWeight: 900, color: 'var(--text-head)', letterSpacing: '0.08em' }}>
                {previewNumber}
              </div>
              <div style={{ marginTop: '6px', color: brandColor, fontSize: '13px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                {formData.provider}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '28px', display: 'grid', gap: '14px' }}>
            <div style={{ padding: '14px 16px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-main)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-sub)', fontWeight: 800, letterSpacing: '0.05em' }}>STATUS</div>
              <div style={{ marginTop: '6px', color: 'var(--text-head)', fontWeight: 800 }}>{formData.status}</div>
            </div>
            <div style={{ padding: '14px 16px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-main)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-sub)', fontWeight: 800, letterSpacing: '0.05em' }}>ASSIGNEE</div>
              <div style={{ marginTop: '6px', color: 'var(--text-head)', fontWeight: 800 }}>{formData.assignedTo || 'Reserve Pool'}</div>
            </div>
            <div style={{ padding: '14px 16px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-main)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-sub)', fontWeight: 800, letterSpacing: '0.05em' }}>PLAN NOTE</div>
              <div style={{ marginTop: '6px', color: 'var(--text-head)', fontWeight: 700 }}>{formData.planDetails || 'Corporate plan pending entry'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
