// client/src/services/auth.js

// Utility functions to manage authentication tokens in localStorage

// Get the token from localStorage
export function getToken() {
  return localStorage.getItem("token");
}

// Set the token in localStorage
export function setToken(token) {
  localStorage.setItem("token", token);
}

// Remove the token from localStorage
export function removeToken() {
  localStorage.removeItem("token");
}

