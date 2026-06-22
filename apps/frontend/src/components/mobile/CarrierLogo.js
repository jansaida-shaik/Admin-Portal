'use client';

import { useId } from 'react';
import { getProviderKey } from '@/lib/mobileProviders';

export default function CarrierLogo({ provider, size = 44 }) {
  const providerKey = getProviderKey(provider);
  const tokenId = useId().replace(/:/g, '_');

  if (providerKey === 'jio') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
        <circle cx="50" cy="50" r="50" fill="#1F3A93" />
        <text
          x="50"
          y="57"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="white"
          fontWeight="900"
          fontSize="40"
          fontFamily="Arial, sans-serif"
        >
          Jio
        </text>
      </svg>
    );
  }

  if (providerKey === 'airtel') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
        <circle cx="50" cy="50" r="50" fill="#F61B1F" />
        <path
          d="M27 59C27 38 42 22 61 22C72 22 80 30 80 41C80 53 72 62 59 67C48 72 42 79 41 88"
          stroke="white"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M36 68C37 58 43 50 51 45C57 42 62 37 64 31"
          stroke="white"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    );
  }

  if (providerKey === 'bsnl') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
        <circle cx="50" cy="50" r="50" fill="#FDE1B8" />
        <defs>
          <radialGradient id={`${tokenId}_bsnl_orb`} cx="0" cy="0" r="1" gradientTransform="translate(48 34) rotate(90) scale(30)">
            <stop offset="0%" stopColor="#FFB36A" />
            <stop offset="100%" stopColor="#F97316" />
          </radialGradient>
        </defs>
        <circle cx="48" cy="33" r="24" fill={`url(#${tokenId}_bsnl_orb)`} />
        <path
          d="M31 58C43 44 55 32 74 18"
          stroke="#0A8B43"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M66 15C73 16 77 22 76 30"
          stroke="#0A8B43"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M29 59C39 51 50 42 58 33"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M24 64C34 49 46 39 58 33"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.9"
        />
        <text
          x="50"
          y="84"
          textAnchor="middle"
          fill="#213A8F"
          fontWeight="900"
          fontSize="28"
          fontFamily="Arial, sans-serif"
          letterSpacing="0.5"
        >
          BSNL
        </text>
      </svg>
    );
  }

  if (providerKey === 'vi') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
        <circle cx="50" cy="50" r="50" fill="#FF1A1A" />
        <text
          x="47"
          y="50"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="white"
          fontWeight="900"
          fontSize="52"
          fontFamily="Arial, sans-serif"
        >
          Vi
        </text>
        <circle cx="73" cy="71" r="7" fill="#FFD11A" />
      </svg>
    );
  }

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
