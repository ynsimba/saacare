import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, clearToken, getToken, setToken } from "./api";

const AuthContext = createContext(null);

export function homeForRole(role) {
  if (role === "PROVIDER" || role === "ADMIN") return "/espace-prestataire";
  return "/espace-client";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const data = await api.me();
      setUser(data.user);
      return data.user;
    } catch {
      clearToken();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (credentials) => {
    const data = await api.login(credentials);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await api.register(payload);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const data = await api.updateProfile(payload);
    setUser(data.user);
    return data.user;
  }, []);

  const changePassword = useCallback(async (payload) => {
    await api.changePassword(payload);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refresh,
      updateProfile,
      changePassword,
    }),
    [user, loading, login, register, logout, refresh, updateProfile, changePassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider.");
  return ctx;
}
