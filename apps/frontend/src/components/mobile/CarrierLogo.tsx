'use client';

import Image from 'next/image';
import { getProviderKey } from '@/lib/mobileProviders';

const LOGO_MAP = {
  airtel: '/carriers/airtel.png',
  jio:    '/carriers/jio.png',
  bsnl:   '/carriers/bsnl.png',
  vi:     '/carriers/vi.png',
};

export default function CarrierLogo({ provider, size = 44 }) {
  const providerKey = getProviderKey(provider);
  const src = LOGO_MAP[providerKey];

  if (!src) {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
        <rect x="4"  y="26" width="6" height="10" rx="1.5" fill="currentColor" opacity="0.4"/>
        <rect x="13" y="20" width="6" height="16" rx="1.5" fill="currentColor" opacity="0.6"/>
        <rect x="22" y="13" width="6" height="23" rx="1.5" fill="currentColor" opacity="0.8"/>
        <rect x="31" y="6"  width="6" height="30" rx="1.5" fill="currentColor"/>
      </svg>
    );
  }

  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        unoptimized
        style={{
          width: size,
          height: size,
          display: 'block',
        }}
      />
    </span>
  );
}
