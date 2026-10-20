import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useNotice } from './useNotice';

describe('useNotice', () => {
  it('sets success, error and clears', () => {
    const { result } = renderHook(() => useNotice());
    act(() => result.current.success('Listo'));
    expect(result.current.notice).toEqual({ type: 'success', text: 'Listo' });
    act(() => result.current.fail(new Error('Mal')));
    expect(result.current.notice).toEqual({ type: 'error', text: 'Mal' });
    act(() => result.current.fail());
    expect(result.current.notice.text).toBe('Ocurrió un error.');
    act(() => result.current.clear());
    expect(result.current.notice).toBeNull();
  });
});
