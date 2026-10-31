import { createContext, useContext, useMemo, useState } from "react";
import { apiCall, endpoints } from "../services/api";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("cinebook_token"));
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cinebook_user") || "null"); }
    catch { return null; }
  });

  const login = async (credentials) => {
    const data = await apiCall("post", endpoints.login, credentials);
    const jwt = data?.token || data?.accessToken || data?.jwt;
    if (!jwt) throw new Error("Login succeeded but no token field was found. Check AuthResponseDTO.");
    localStorage.setItem("cinebook_token", jwt);
    setToken(jwt);
    try {
      const profile = await apiCall("get", endpoints.me);
      setUser(profile);
      localStorage.setItem("cinebook_user", JSON.stringify(profile));
    } catch {
      const fallback = { email: credentials.email };
      setUser(fallback);
      localStorage.setItem("cinebook_user", JSON.stringify(fallback));
    }
    return data;
  };

  const register = (payload) => apiCall("post", endpoints.register, payload);
  const logout = () => {
    localStorage.removeItem("cinebook_token");
    localStorage.removeItem("cinebook_user");
    setToken(null); setUser(null);
  };

  const refreshProfile = async () => {
    const profile = await apiCall("get", endpoints.me);
    setUser(profile);
    localStorage.setItem("cinebook_user", JSON.stringify(profile));
    return profile;
  };

  const value = useMemo(() => ({
    token, user, isAuthenticated: Boolean(token), login, register, logout, refreshProfile, setUser
  }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}