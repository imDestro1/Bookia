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

  const updateProfile = useCallback(async (profile) => {
    const data = await authApi.updateMe(profile);
    setUser(data?.user ?? null);
    return data?.user;
  }, []);

  // Body { current_password, new_password }; clears must_change_password on success.
  const changePassword = useCallback(async (passwords) => {
    const data = await authApi.changePassword(passwords);
    setUser(data?.user ?? null);
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

  const value = useMemo(() => {
    const isAdmin = user?.role === 'admin';
    const isStoreOwner = user?.role === 'store_owner';
    return {
      user,
      status,
      isAuthenticated: status === 'authenticated',
      isAdmin,
      isStoreOwner,
      // Admins and store owners can enter the /admin panel.
      canManage: isAdmin || isStoreOwner,
      // True for accounts created by an admin until they replace the initial password.
      mustChangePassword: Boolean(user?.must_change_password),
      login,
      register,
      updateProfile,
      changePassword,
      logout,
      refresh,
    };
  }, [user, status, login, register, updateProfile, changePassword, logout, refresh]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
