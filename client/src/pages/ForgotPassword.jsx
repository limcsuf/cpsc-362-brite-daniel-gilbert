// client/src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../services/api.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const data = await apiFetch('/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center mt-10">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Reset Password</h2>
            {message && <p className="text-center text-green-600 mb-4">{message}</p>}
            {error && <p className="text-center text-red-500 mb-4">{error}</p>}
            {!message && (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <p className="text-sm text-center text-gray-600">Enter your email and a reset link will be sent (check the server console).</p>
                    <input 
                        type="email" 
                        placeholder="Your Email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        required 
                    />
                    <button type="submit" className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Send Reset Link</button>
                </form>
            )}
             <div className="text-center mt-4">
                <Link to="/login" className="text-sm text-blue-600 hover:underline">Back to Login</Link>
            </div>
        </div>
    </div>
  );
}

