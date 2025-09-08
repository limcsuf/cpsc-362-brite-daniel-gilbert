// client/src/services/api.js
import { getToken } from "./auth.js";

const API_BASE = "/api"; // Proxy to backend server
const FETCH_TIMEOUT = 10000; // 10 seconds

export async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(id);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `Request failed with status: ${response.status}`,
      }));
      throw new Error(errorData.message || 'An unknown error occurred.');
    }

    if (response.status === 204) return null;

    // Safely parse JSON
    try {
      return await response.json();
    } catch (err) {
      throw new Error('Failed to parse server response as JSON.');
    }

  } catch (err) {
    // Handle network errors or abort
    if (err.name === 'AbortError') {
      throw new Error('Request timed out.');
    }
    throw new Error(err.message || 'Network error occurred.');
  }
}