import { createContext } from 'react';

// Holds { user, status, isAuthenticated, isAdmin, isStoreOwner, canManage, login, register, updateProfile, logout, refresh }.
export const AuthContext = createContext(null);
