// client/src/pages/ResetPassword.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api.js';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const data = await apiFetch(`/reset-password/${token}`, {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center mt-10">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
          <p className="text-red-500">Invalid or missing reset token.</p>
        </div>
      </div>
    );
  }
  
  if (message) {
    return (
      <div className="flex items-center justify-center mt-10">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
          <p className="text-green-600 mb-4">{message}</p>
          <button onClick={() => navigate('/login')} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Go to Login</button>
        </div>
      </div>
    );
  }

  return (
     <div className="flex items-center justify-center mt-10">
        <div className="max-w-md w-full bg-gray-100 dark:bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-200">Enter New Password</h2>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <input 
                    type="password" 
                    placeholder="New Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    required 
                />
                <button type="submit" className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">Update Password</button>
            </form>
        </div>
     </div>
  );
}

