// client/src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="text-center mt-20">
      <h1 className="text-6xl font-bold text-gray-800 dark:text-gray-200">
        404
      </h1>
      <p className="text-2xl text-gray-600 dark:text-gray-300 mt-4">
        Page Not Found
      </p>
      <p className="text-gray-500 dark:text-gray-400 mt-2">
        Sorry, the page you were looking for does not exist.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}