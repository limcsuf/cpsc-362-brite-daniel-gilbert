// client/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "../services/api.js";
import { getToken, setToken, removeToken } from "../services/auth.js";
import { jwtDecode } from "jwt-decode"; // You'll need to install this

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On initial load, check for an existing token in localStorage
  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        const decodedUser = jwtDecode(token);

        // Check if token is expired (optional but recommended)
        const currentTime = Date.now() / 1000;
        if (decodedUser.exp < currentTime) {
          throw new Error("Token expired");
        }

        // Set user state directly from the token
        setUser({
          user_id: decodedUser.user_id,
          is_manager: decodedUser.is_manager,
          name: decodedUser.name, // <--- Now available from the token!
        });
      } catch (error) {
        console.error("Invalid or expired token:", error);
        removeToken();
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const data = await apiFetch("/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    setToken(data.token);
    setUser(data.user); // Set user state from response
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
