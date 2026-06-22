'use client';

import Image from 'next/image';
import { getProviderKey } from '@/lib/mobileProviders';

const LOGO_MAP = {
  airtel: '/carriers/airtel.svg',
  jio: '/carriers/jio.svg',
  bsnl: '/carriers/bsnl.svg',
  vi: '/carriers/vi.svg',
};

export default function CarrierLogo({ provider, size = 44 }) {
  const providerKey = getProviderKey(provider);
  const src = LOGO_MAP[providerKey];

  if (!src) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
        <circle cx="50" cy="50" r="50" fill="#374151" />
        <rect x="28" y="56" width="8" height="12" rx="2" fill="white" />
        <rect x="40" y="48" width="8" height="20" rx="2" fill="white" />
        <rect x="52" y="40" width="8" height="28" rx="2" fill="white" />
        <rect x="64" y="32" width="8" height="36" rx="2" fill="white" opacity="0.35" />
      </svg>
    );
  }

  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
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
