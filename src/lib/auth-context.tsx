import React, { createContext, useContext, useState, useEffect } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  subscriptionStatus: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("mk_token");
    const storedUser = localStorage.getItem("mk_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      fetch(`${BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${storedToken}` } })
        .then(r => r.ok ? r.json() : null)
        .then(fresh => {
          if (fresh) {
            setUser(fresh);
            localStorage.setItem("mk_user", JSON.stringify(fresh));
          }
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (user: User, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem("mk_token", token);
    localStorage.setItem("mk_user", JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("mk_token");
    localStorage.removeItem("mk_user");
  };

  const refreshUser = async () => {
    const t = localStorage.getItem("mk_token");
    if (!t) return;
    try {
      const res = await fetch(`${BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${t}` } });
      if (res.ok) {
        const fresh = await res.json();
        setUser(fresh);
        localStorage.setItem("mk_user", JSON.stringify(fresh));
      }
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
