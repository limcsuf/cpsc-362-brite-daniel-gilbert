// client/src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api.js';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', username: '', password: '', managerSecret: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const data = await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    }
  };
  
  if (message) {
    return (
      <div className="flex items-center justify-center mt-10">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
            <p className="text-green-600 mb-4 text-lg">{message}</p>
            <button onClick={() => navigate('/login')} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Go to Login
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center mt-10">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Create Account</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <input type="text" placeholder="Username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <input type="password" placeholder="Manager Secret Key (optional)" value={formData.managerSecret} onChange={(e) => setFormData({ ...formData, managerSecret: e.target.value })} className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button type="submit" className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Register
          </button>
        </form>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

