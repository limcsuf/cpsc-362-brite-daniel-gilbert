// src/components/header.jsx
// client/src/components/Header.jsx
import React from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          Event Manager
          {user && <span className="ml-2 text-gray-600 text-base sm:text-lg">- Welcome, {user.name}!</span>}
        </h1>
        {user && (
          <button
            onClick={logout}
            className="px-3 sm:px-4 py-1 sm:py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}