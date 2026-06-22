export const MOBILE_PROVIDER_OPTIONS = [
  {
    value: 'Airtel',
    key: 'airtel',
    color: '#EF0000',
    accent: '#FF4D3A',
    description: 'Red Airtel roundel with the white swoosh and lowercase airtel wordmark.'
  },
  {
    value: 'Jio',
    key: 'jio',
    color: '#0061FE',
    accent: '#5CA4FF',
    description: 'Deep-blue Jio roundel with the white wordmark.'
  },
  {
    value: 'BSNL',
    key: 'bsnl',
    color: '#0B3D91',
    accent: '#FBBF24',
    description: 'BSNL cream badge with the orange orb, green swoosh, and blue text.'
  },
  {
    value: 'Vi',
    key: 'vi',
    color: '#9333EA',
    accent: '#F97316',
    description: 'Red Vi roundel with the white VI mark, TM tag, and yellow dot.'
  }
];

export function normalizeMobileProvider(providerName) {
  if (providerName == null) {
    return null;
  }

  const trimmed = `${providerName}`.trim();
  if (!trimmed) {
    return null;
  }

  const normalized = trimmed.toLowerCase().replace(/\s+/g, ' ');

  if (normalized.includes('airtel')) return 'Airtel';
  if (normalized.includes('jio')) return 'Jio';
  if (normalized.includes('bsnl')) return 'BSNL';
  if (
    normalized === 'vi' ||
    normalized === 'v i' ||
    normalized.includes('idea') ||
    normalized.includes('vodafone')
  ) {
    return 'Vi';
  }

  return trimmed;
}

export function getProviderKey(providerName) {
  const normalized = normalizeMobileProvider(providerName);
  const match = MOBILE_PROVIDER_OPTIONS.find((option) => option.value === normalized);
  return match?.key || 'generic';
}

export function getTelecomBrandColor(providerName) {
  const normalized = normalizeMobileProvider(providerName);
  const match = MOBILE_PROVIDER_OPTIONS.find((option) => option.value === normalized);
  return match?.color || '#F58220';
}

export function formatMobileNumber(number) {
  const digits = `${number ?? ''}`.replace(/\D/g, '');
  const localNumber = digits.length > 10 ? digits.slice(-10) : digits;

  if (!localNumber) return '+91';
  if (localNumber.length <= 5) return `+91 ${localNumber}`;
  if (localNumber.length < 10) {
    const pivot = Math.ceil(localNumber.length / 2);
    return `+91 ${localNumber.slice(0, pivot)} ${localNumber.slice(pivot)}`;
  }

  return `+91 ${localNumber.slice(0, 5)} ${localNumber.slice(5)}`;
}

export function getMobileProviderMeta(providerName) {
  const normalized = normalizeMobileProvider(providerName);
  return MOBILE_PROVIDER_OPTIONS.find((option) => option.value === normalized) || null;
}
