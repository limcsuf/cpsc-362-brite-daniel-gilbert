// client/src/components/Header.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 bg-white dark:bg-gray-800 shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <div className="flex items-baseline space-x-2">
          <Link
            to="/dashboard"
            className="text-2xl font-bold text-gray-800 dark:text-gray-200 cursor-pointer"
          >
            Event Manager
          </Link>
          {user !== null ? (
            <span className="text-xl italic text-gray-600 dark:text-gray-400">
              - Welcome, {user?.name || "Guest"}!
            </span>
          ) : null}
        </div>
        <nav className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="px-2.5 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-lg"
            title="Toggle Theme"
          >
            {theme === "dark" ? "🌙" : "☀️"}
          </button>
          {user ? (
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
