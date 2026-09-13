import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client.js";

const AuthContext = createContext(null);

const STORAGE_KEY = "bsfdm_session";

export const DEMO_ACCOUNT = { email: "admin@bsfdm.com", password: "bsfdm123" };
export const DEMO_OPERATOR_ACCOUNT = { email: "andi@bsfdm.com", password: "operator123" };

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadSession);
  // The real security boundary is the httpOnly cookie the server validates on
  // every request — this cached copy is only for instant UI on load. `checking`
  // stays true until that cookie has actually been confirmed (or rejected)
  // against the server, so route guards don't flash content before we know.
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!session) {
      setChecking(false);
      return;
    }
    api.get("/auth/me")
      .then((fresh) => {
        if (cancelled) return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
        setSession(fresh);
      })
      .catch(() => {
        if (cancelled) return;
        localStorage.removeItem(STORAGE_KEY);
        setSession(null);
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    const nextSession = await api.post("/auth/login", { email, password });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
    return nextSession;
  };

  const logout = async () => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
    try {
      await api.post("/auth/logout", {});
    } catch {
      // cookie may already be gone/expired — local state is cleared either way
    }
  };

  return (
    <AuthContext.Provider value={{ session, login, logout, isAuthenticated: !!session, checking }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
