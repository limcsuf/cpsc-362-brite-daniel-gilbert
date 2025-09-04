// client/src/context/authcontext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "../services/api.js";
import { getToken, setToken, removeToken } from "../services/auth.js";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch full user data if token exists
  useEffect(() => {
    const fetchUser = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const data = await apiFetch("/me"); // GET current user endpoint
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        removeToken();
        setUser(null);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    // Authenticate
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    // Save token
    setToken(data.token);

    // Fetch full user record
    const fullUser = await apiFetch("/me"); 
    setUser(fullUser);
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);