// client/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiFetch } from '../services/api.js';

export default function Dashboard() {
    const { user } = useAuth();
    const [allEvents, setAllEvents] = useState([]);
    const [attendingEventIds, setAttendingEventIds] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [modal, setModal] = useState({ type: null, data: null });

    const fetchData = async () => {
        if (!user?.user_id) return;
        setIsLoading(true);
        setError('');
        try {
            const [eventsRes, attendingRes] = await Promise.all([
                apiFetch('/events'),
                apiFetch(`/users/${user.user_id}/attending`)
            ]);
            setAllEvents(Array.isArray(eventsRes) ? eventsRes : []);
            setAttendingEventIds(new Set(Array.isArray(attendingRes) ? attendingRes.map(e => e.event_id) : []));
        } catch (err) {
            console.error("Dashboard fetch error:", err);
            setError(err.message || 'Failed to load data.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    if (!user) return <div className="text-center mt-8">Please log in to view the dashboard.</div>;
    if (isLoading) return <div className="text-center mt-8">Loading dashboard...</div>;
    if (error) return <div className="text-center mt-8 text-red-500">Error: {error}</div>;

    return (
        <div className="p-4">
            <h2 className="text-3xl font-bold mb-6">Event Dashboard</h2>
            {allEvents.length === 0 ? (
                <p className="text-gray-500">No events found.</p>
            ) : (
                allEvents.map(event => (
                    <div key={event.event_id} className="bg-white p-4 rounded shadow mb-4 flex justify-between items-start">
                        <div>
                            <h3 className="font-bold">{event.title}</h3>
                            <p className="text-gray-500">{new Date(event.date).toLocaleString()}</p>
                        </div>
                        <div>
                            {attendingEventIds.has(event.event_id) ? (
                                <button
                                    onClick={() => handleUnattend(event.event_id)}
                                    className="px-3 py-1 bg-yellow-500 text-white rounded"
                                >Leave</button>
                            ) : (
                                <button
                                    onClick={() => handleAttend(event.event_id)}
                                    className="px-3 py-1 bg-green-500 text-white rounded"
                                >Join</button>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}