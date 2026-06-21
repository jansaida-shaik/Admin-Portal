'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';

export default function DataFetcher({ url, render, loadingElement, errorElement }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const result = await fetchApi(url);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (url) {
      loadData();
    }
  }, [url]);

  if (loading) {
    return loadingElement || <div style={{ padding: '24px', color: 'var(--text-sub)' }}>Loading...</div>;
  }

  if (error) {
    return errorElement ? errorElement(error) : <div style={{ color: 'red', padding: '24px' }}>Error: {error}</div>;
  }

  return render(data);
}
