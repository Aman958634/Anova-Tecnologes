import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'anova-token';

const readStoredToken = () => {
  const sessionToken = sessionStorage.getItem(TOKEN_KEY);
  if (sessionToken) return sessionToken;

  // One-time migration path from previous localStorage-based sessions.
  const legacyToken = localStorage.getItem(TOKEN_KEY);
  if (legacyToken) {
    sessionStorage.setItem(TOKEN_KEY, legacyToken);
    localStorage.removeItem(TOKEN_KEY);
  }
  return legacyToken;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => readStoredToken());
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    let cancelled = false;

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    sessionStorage.setItem(TOKEN_KEY, token);
    api.get('/auth/me')
      .then((response) => {
        if (!cancelled) {
          setUser(response.data);
        }
      })
      .catch(() => {
        sessionStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(TOKEN_KEY);
        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    setToken(response.data.token);
    setUser(response.data.user);
    sessionStorage.setItem(TOKEN_KEY, response.data.token);
    localStorage.removeItem(TOKEN_KEY);
    return response.data.user;
  };

  const logout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ user, token, loading, login, logout, isAuthenticated: Boolean(token && user) }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
