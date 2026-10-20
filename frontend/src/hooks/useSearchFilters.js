import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export const FILTER_KEYS = ['q', 'genre', 'publisher', 'store_id', 'min_price', 'max_price'];
export const PAGE_SIZE = 12;

// Keeps search filters in the URL so searches are shareable.
export function useSearchFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => {
    const result = {};
    FILTER_KEYS.forEach((key) => {
      result[key] = searchParams.get(key) ?? '';
    });
    return result;
  }, [searchParams]);

  const page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1);

  const applyFilters = useCallback(
    (next) => {
      const params = new URLSearchParams();
      FILTER_KEYS.forEach((key) => {
        const value = String(next[key] ?? '').trim();
        if (value) params.set(key, value);
      });
      setSearchParams(params);
    },
    [setSearchParams],
  );

  const setPage = useCallback(
    (nextPage) => {
      const params = new URLSearchParams(searchParams);
      if (nextPage > 1) params.set('page', String(nextPage));
      else params.delete('page');
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  const clearFilters = useCallback(() => setSearchParams(new URLSearchParams()), [setSearchParams]);

  return { filters, page, applyFilters, setPage, clearFilters };
}
