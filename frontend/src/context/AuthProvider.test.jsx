import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from './AuthProvider';
import { useAuth } from '../hooks/useAuth';
import { jsonResponse, mockFetch } from '../test/mockFetch';

const ADMIN = { _id: 'u1', email: 'admin@bookia.mx', role: 'admin' };
const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe('AuthProvider / useAuth', () => {
  it('throws when used outside the provider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(/AuthProvider/);
  });

  it('restores an existing session from /auth/me', async () => {
    mockFetch(() => jsonResponse({ user: ADMIN }));
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current.status).toBe('authenticated'));
    expect(result.current.user).toEqual(ADMIN);
    expect(result.current.isAdmin).toBe(true);
  });

  it('is anonymous when /auth/me returns 401', async () => {
    mockFetch(() => jsonResponse({ message: 'No autenticado' }, 401));
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe('anonymous'));
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('is anonymous when /auth/me returns no user', async () => {
    mockFetch(() => jsonResponse({}));
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe('anonymous'));
  });

  it('logs in and logs out', async () => {
    const fetchMock = mockFetch((url) => {
      if (url.endsWith('/auth/me')) return jsonResponse({ message: 'No' }, 401);
      if (url.endsWith('/auth/login')) return jsonResponse({ user: ADMIN });
      return { ok: true, status: 204, text: () => Promise.resolve('') };
    });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe('anonymous'));

    await act(() => result.current.login('admin@bookia.mx', 'secret'));
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user.email).toBe('admin@bookia.mx');

    await act(() => result.current.logout());
    expect(result.current.user).toBeNull();
    expect(result.current.status).toBe('anonymous');
    expect(fetchMock.mock.calls.some(([url]) => url.endsWith('/auth/logout'))).toBe(true);
  });

  it('propagates login errors and stays anonymous', async () => {
    mockFetch((url) =>
      url.endsWith('/auth/login')
        ? jsonResponse({ message: 'Credenciales inválidas' }, 401)
        : jsonResponse({ message: 'No' }, 401),
    );
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe('anonymous'));
    await expect(result.current.login('x@y.mx', 'bad')).rejects.toThrow('Credenciales inválidas');
    expect(result.current.isAuthenticated).toBe(false);
  });
});
