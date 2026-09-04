import { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from '../lib/api.js';

const AuthContext = createContext(null);
const CUSTOMER_KEY = 'one_organic_customer';

function loadCustomer() {
  try {
    const raw = localStorage.getItem(CUSTOMER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(loadCustomer);
  const [initializing, setInitializing] = useState(!!getToken());

  useEffect(() => {
    if (customer) {
      localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
    } else {
      localStorage.removeItem(CUSTOMER_KEY);
    }
  }, [customer]);

  // Optimistically hydrate from localStorage above (avoids a logged-out
  // flash for a returning session), then confirm/refresh against the
  // server. A stale or revoked token self-heals here instead of leaving
  // RequireAuth trusting a dead session.
  useEffect(() => {
    if (!getToken()) {
      setInitializing(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => setCustomer(res.data))
      .catch(() => {
        setToken(null);
        setCustomer(null);
      })
      .finally(() => setInitializing(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password }, { auth: false });
    setToken(res.token);
    setCustomer(res.customer);
  }

  async function register(payload) {
    const res = await api.post('/auth/register', payload, { auth: false });
    setToken(res.token);
    setCustomer(res.customer);
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // Token may already be dead (e.g. another tab logged out first) —
      // local state still needs to clear either way.
    }
    setToken(null);
    setCustomer(null);
  }

  const value = {
    customer,
    initializing,
    isAuthenticated: !!customer,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
