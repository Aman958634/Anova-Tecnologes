import { useState, useCallback, useEffect } from 'react';
import { retryApi } from '../config/api';

export function useResource(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetchFn();
      setData(response.data?.data || response.data || []);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to load data.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const retry = useCallback(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, retry, refetch: fetch };
}

export function createFetchFn(apiCall) {
  return async () => {
    const response = await apiCall();
    return response;
  };
}
