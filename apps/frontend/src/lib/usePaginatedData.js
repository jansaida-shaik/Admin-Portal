import { useState, useEffect } from 'react';
import { fetchApi } from './api';

export function usePaginatedData(endpoint, dependencies = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(search ? { search } : {})
        });
        const result = await fetchApi(`${endpoint}?${queryParams.toString()}`);
        setData(result.data || []);
        setTotal(result.total || 0);
        setTotalPages(result.totalPages || 1);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [endpoint, page, limit, search, ...dependencies]);

  return {
    data,
    loading,
    error,
    page,
    setPage,
    limit,
    setLimit,
    total,
    totalPages,
    search,
    setSearch
  };
}
