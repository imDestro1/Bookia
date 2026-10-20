import { act, renderHook } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { useSearchFilters } from './useSearchFilters';
import { ROUTER_FUTURE } from '../services/routerFuture';

function setup(initialUrl) {
  const wrapper = ({ children }) => (
    <MemoryRouter initialEntries={[initialUrl]} future={ROUTER_FUTURE}>
      {children}
    </MemoryRouter>
  );
  return renderHook(() => ({ ...useSearchFilters(), location: useLocation() }), { wrapper });
}

describe('useSearchFilters', () => {
  it('reads filters and page from the URL', () => {
    const { result } = setup('/?q=rulfo&genre=Novela&page=3');
    expect(result.current.filters.q).toBe('rulfo');
    expect(result.current.filters.genre).toBe('Novela');
    expect(result.current.filters.publisher).toBe('');
    expect(result.current.page).toBe(3);
  });

  it('defaults invalid pages to 1', () => {
    const { result } = setup('/?page=abc');
    expect(result.current.page).toBe(1);
  });

  it('applies filters, resetting the page and dropping blanks', () => {
    const { result } = setup('/?page=4');
    act(() => result.current.applyFilters({ q: '  borges ', genre: '', max_price: '300' }));
    expect(result.current.location.search).toBe('?q=borges&max_price=300');
    expect(result.current.page).toBe(1);
  });

  it('changes page keeping filters and clears everything', () => {
    const { result } = setup('/?q=paz');
    act(() => result.current.setPage(2));
    expect(result.current.location.search).toBe('?q=paz&page=2');
    act(() => result.current.setPage(1));
    expect(result.current.location.search).toBe('?q=paz');
    act(() => result.current.clearFilters());
    expect(result.current.location.search).toBe('');
  });
});
