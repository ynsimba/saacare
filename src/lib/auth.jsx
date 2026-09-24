import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, clearToken, getToken, setToken, SESSION_EXPIRED_EVENT } from "./api";

const AuthContext = createContext(null);

export function homeForRole(role) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "prestataire") return "/prestataire/dashboard";
  return "/client/dashboard";
}

export function roleLabel(role) {
  if (role === "admin") return "Admin";
  if (role === "prestataire") return "Prestataire";
  return "Client";
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
    } catch (err) {
      // Seul un refus explicite invalide la session : une coupure réseau
      // ou une API momentanément indisponible ne doit pas déconnecter.
      if (err?.status === 401 || err?.status === 403) {
        clearToken();
        setUser(null);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await api.login(credentials);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const loginWithGoogle = useCallback(async (credential) => {
    const data = await api.loginGoogle({ credential });
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

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      /* ignore */
    }
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
      loginWithGoogle,
      register,
      logout,
      refresh,
      updateProfile,
      changePassword,
    }),
    [user, loading, login, loginWithGoogle, register, logout, refresh, updateProfile, changePassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider.");
  return ctx;
}
