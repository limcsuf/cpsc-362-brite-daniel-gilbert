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
        // Decode the token to get user info without a network call
        const decodedUser = jwtDecode(token);
        // Optional: You could add a check here to see if the token is expired
        setUser({
          user_id: decodedUser.user_id,
          is_manager: decodedUser.is_manager,
          // Note: The token only contains id and manager status.
          // Full user data like name/email is fetched upon login.
        });
      } catch (error) {
        console.error("Invalid token:", error);
        removeToken(); // Clear bad token
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    // The backend expects '/api/login' and returns token + user data
    const data = await apiFetch("/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    // The response from your backend already contains the token and user object
    setToken(data.token);
    setUser(data.user);
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
