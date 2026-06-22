const MOBILE_PROVIDER_OPTIONS = ['Airtel', 'Jio', 'BSNL', 'Vi'];

function normalizeMobileProvider(provider) {
  if (provider == null) {
    return null;
  }

  const trimmed = `${provider}`.trim();
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

function resolveMobileProvider(provider, { required = false } = {}) {
  const normalized = normalizeMobileProvider(provider);

  if (!normalized) {
    if (required) {
      throw new Error(`Mobile provider is required. Choose one of: ${MOBILE_PROVIDER_OPTIONS.join(', ')}.`);
    }
    return null;
  }

  if (!MOBILE_PROVIDER_OPTIONS.includes(normalized)) {
    throw new Error(`Unsupported mobile provider "${provider}". Choose one of: ${MOBILE_PROVIDER_OPTIONS.join(', ')}.`);
  }

  return normalized;
}

function normalizeMobileRecord(record) {
  if (Array.isArray(record)) {
    return record.map(normalizeMobileRecord);
  }

  if (!record || typeof record !== 'object') {
    return record;
  }

  return {
    ...record,
    provider: normalizeMobileProvider(record.provider)
  };
}

module.exports = {
  MOBILE_PROVIDER_OPTIONS,
  normalizeMobileProvider,
  normalizeMobileRecord,
  resolveMobileProvider
};
