import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('anova-token'));
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    localStorage.setItem('anova-token', token);
    api.get('/auth/me')
      .then((response) => setUser(response.data))
      .catch(() => {
        localStorage.removeItem('anova-token');
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    setToken(response.data.token);
    setUser(response.data.user);
    localStorage.setItem('anova-token', response.data.token);
    return response.data.user;
  };

  const logout = () => {
    localStorage.removeItem('anova-token');
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
