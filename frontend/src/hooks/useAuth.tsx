import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User } from '../types';
import { API_BASE } from '../lib/constants';

const AUTH_TOKEN_KEY = 'medistock_token';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (staffId: string, password: string, role: 'admin' | 'department') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    // #region agent log
    fetch('http://127.0.0.1:7938/ingest/4cc01ec9-c339-433d-bf09-8d0023db4574',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'55ad04'},body:JSON.stringify({sessionId:'55ad04',location:'useAuth.tsx:mount',message:'Auth restore attempt',data:{hasSavedToken:!!savedToken},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    if (!savedToken) {
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${savedToken}` },
    })
      .then(res => res.json())
      .then(data => {
        // #region agent log
        fetch('http://127.0.0.1:7938/ingest/4cc01ec9-c339-433d-bf09-8d0023db4574',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'55ad04'},body:JSON.stringify({sessionId:'55ad04',location:'useAuth.tsx:restore',message:'Auth restore result',data:{hasUser:!!data.user,staffId:data.user?.staff_id},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
        // #endregion
        if (data.user) {
          setToken(savedToken);
          setUser(data.user);
        } else {
          localStorage.removeItem(AUTH_TOKEN_KEY);
        }
      })
      .catch(() => localStorage.removeItem(AUTH_TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const login = async (staffId: string, password: string, role: 'admin' | 'department') => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
