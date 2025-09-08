// client/src/pages/EditEvent.jsx
import React, { useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import AddressPicker from '../components/AddressPicker.jsx';

// Helper function to format date for the datetime-local input
const formatDateTimeForInput = (isoDate) => {
    const date = new Date(isoDate);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
};

export default function EditEvent() {
    const { eventId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Get initial event data passed from the dashboard link
    const initialEvent = location.state?.event;
    
    const [formData, setFormData] = useState({
        title: initialEvent?.title || '',
        date: initialEvent ? formatDateTimeForInput(initialEvent.date) : '',
        address: initialEvent?.address || '',
    });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            // Convert local input time back to a format the backend can use (UTC or standard ISO)
            const dateToSend = new Date(formData.date).toISOString();
            
            await apiFetch(`/events/${eventId}`, {
                method: 'PUT',
                body: JSON.stringify({ ...formData, date: dateToSend }),
            });
            setMessage('Event updated successfully!');
            // Redirect back to dashboard after a short delay
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (err) {
            setError(err.message);
        }
    };

    // Protect the route to ensure only managers can see it
    if (!user?.is_manager) {
        return (
            <div className="text-center mt-10">
                <p className="text-red-500">Access Denied. Only managers can edit events.</p>
            </div>
        );
    }
    
    return (
        <div className="max-w-xl mx-auto mt-10">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
                <Link to="/dashboard" className="text-sm text-blue-500 hover:underline mb-4 block">&larr; Back to Dashboard</Link>
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-200">Edit Event</h2>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                {message && <p className="text-green-600 text-center mb-4">{message}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Event Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-3 border rounded-md bg-gray-700 text-white border-gray-600" required />
                    <input type="datetime-local" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full p-3 border rounded-md bg-gray-700 text-white border-gray-600" required />
                    <AddressPicker 
                        initialAddress={formData.address}
                        onAddressSelect={(address) => setFormData({ ...formData, address: address })}
                    />
                    <button type="submit" className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Update Event
                    </button>
                </form>
            </div>
        </div>
    );
}