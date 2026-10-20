import { createContext } from 'react';

// Holds { user, status, error, login, logout, refresh }.
export const AuthContext = createContext(null);
