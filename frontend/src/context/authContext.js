import { createContext } from 'react';

// Holds { user, status, isAuthenticated, isAdmin, login, register, updateProfile, logout, refresh }.
export const AuthContext = createContext(null);
