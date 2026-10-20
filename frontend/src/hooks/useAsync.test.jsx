import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useAsync } from './useAsync';

describe('useAsync', () => {
  it('loads data and reloads on demand', async () => {
    const loader = vi.fn().mockResolvedValueOnce('first').mockResolvedValueOnce('second');
    const { result } = renderHook(() => useAsync(loader, []));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.data).toBe('first'));
    act(() => result.current.reload());
    await waitFor(() => expect(result.current.data).toBe('second'));
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it('exposes errors', async () => {
    const { result } = renderHook(() => useAsync(() => Promise.reject(new Error('fallo')), []));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error.message).toBe('fallo');
  });

  it('ignores aborts and aborts on unmount', async () => {
    let captured;
    const loader = ({ signal }) => {
      captured = signal;
      return Promise.reject(new DOMException('aborted', 'AbortError'));
    };
    const { result, unmount } = renderHook(() => useAsync(loader, []));
    await Promise.resolve();
    expect(result.current.error).toBeNull();
    unmount();
    expect(captured.aborted).toBe(true);
  });
});
