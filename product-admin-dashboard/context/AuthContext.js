"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { loginRequest } from "@/lib/api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  // "checking" until we've read localStorage once, so protected pages
  // don't flash a redirect to /login before we even know.
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        // corrupted storage, ignore
      }
    }
    setStatus("ready");
  }, []);

  const login = useCallback(async (username, password) => {
    const data = await loginRequest(username, password);
    const { accessToken, token: legacyToken, ...userFields } = data;
    const finalToken = accessToken || legacyToken;
    localStorage.setItem("token", finalToken);
    localStorage.setItem("user", JSON.stringify(userFields));
    setToken(finalToken);
    setUser(userFields);
    return userFields;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token),
        status,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
