'use client';

import CarrierLogo from '@/components/mobile/CarrierLogo';
import {
  MOBILE_PROVIDER_OPTIONS,
  getMobileProviderMeta,
  getTelecomBrandColor,
  normalizeMobileProvider
} from '@/lib/mobileProviders';

export default function MobileProviderPicker({
  value,
  onChange,
  label = 'Carrier',
  helperText = 'Select the carrier brand that should be stored in the portal.',
  dense = false
}) {
  const selectedProvider = normalizeMobileProvider(value);

  return (
    <div>
      <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-sub)', fontWeight: 800, letterSpacing: '0.05em' }}>
        {label}
      </label>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: dense ? 'repeat(2, minmax(0, 1fr))' : 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginTop: '10px'
        }}
      >
        {MOBILE_PROVIDER_OPTIONS.map((option) => {
          const isActive = selectedProvider === option.value;
          const brandColor = getTelecomBrandColor(option.value);

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: dense ? '12px 14px' : '14px 16px',
                background: isActive ? `${brandColor}16` : 'rgba(255,255,255,0.03)',
                border: isActive ? `1px solid ${brandColor}66` : '1px solid var(--border-main)',
                borderRadius: '18px',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: isActive ? `0 12px 28px ${brandColor}1f` : 'none',
                transition: 'transform 0.18s, box-shadow 0.18s, border-color 0.18s, background 0.18s'
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <CarrierLogo provider={option.value} size={dense ? 38 : 42} />
              <div style={{ minWidth: 0 }}>
                <div style={{ color: option.color, fontSize: '14px', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {option.value}
                </div>
                <div style={{ color: 'var(--text-sub)', fontSize: dense ? '11px' : '12px', marginTop: '3px', lineHeight: 1.35 }}>
                  {option.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <div style={{ color: getMobileProviderMeta(selectedProvider)?.color || 'var(--text-sub)', fontSize: '12px', fontWeight: 600, marginTop: '10px' }}>
        {helperText}
      </div>
    </div>
  );
}
