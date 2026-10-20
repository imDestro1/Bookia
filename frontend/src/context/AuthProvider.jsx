import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext } from './authContext';
import { authApi } from '../services/bookiaApi';

// status: 'loading' while checking the session, then 'authenticated' or 'anonymous'.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');

  const refresh = useCallback(async () => {
    try {
      const data = await authApi.me();
      setUser(data?.user ?? null);
      setStatus(data?.user ? 'authenticated' : 'anonymous');
    } catch {
      setUser(null);
      setStatus('anonymous');
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email, password, portal) => {
    const data = await authApi.login(email, password, portal);
    setUser(data?.user ?? null);
    setStatus('authenticated');
    return data?.user;
  }, []);

  const register = useCallback(async (account) => {
    const data = await authApi.register(account);
    setUser(data?.user ?? null);
    setStatus('authenticated');
    return data?.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setStatus('anonymous');
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authenticated',
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      refresh,
    }),
    [user, status, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
