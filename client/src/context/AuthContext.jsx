import { createContext, useContext, useState, useCallback } from 'react';
import { getStoredCredentials, clearStoredCredentials, verifyCredentials } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authed, setAuthed] = useState(() => Boolean(getStoredCredentials()));

  const login = useCallback(async (username, password) => {
    const ok = await verifyCredentials(username, password);
    if (ok) setAuthed(true);
    return ok;
  }, []);

  const logout = useCallback(() => {
    clearStoredCredentials();
    setAuthed(false);
  }, []);

  return <AuthContext.Provider value={{ authed, login, logout, setAuthed }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
