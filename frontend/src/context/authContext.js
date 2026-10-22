import { createContext } from 'react';

// Holds { user, status, isAuthenticated, isAdmin, isStoreOwner, canManage, mustChangePassword,
// login, register, updateProfile, changePassword, logout, refresh }.
export const AuthContext = createContext(null);
