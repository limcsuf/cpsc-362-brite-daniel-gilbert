// client/src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { apiFetch } from "../services/api.js";

export default function Dashboard() {
  const { user } = useAuth();
  const [allEvents, setAllEvents] = useState([]);
  const [attendingEventIds, setAttendingEventIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const handleAttend = async (eventId) => {
    try {
      await apiFetch(`/events/${eventId}/attend`, { method: "POST" });
      setAttendingEventIds((prevIds) => new Set(prevIds).add(eventId));
    } catch (err) {
      console.error("Attend error:", err);
      setError(err.message || "Failed to attend event.");
    }
  };

  const handleUnattend = async (eventId) => {
    try {
      await apiFetch(`/events/${eventId}/unattend`, { method: "DELETE" });
      setAttendingEventIds((prevIds) => {
        const newIds = new Set(prevIds);
        newIds.delete(eventId);
        return newIds;
      });
    } catch (err) {
      console.error("Unattend error:", err);
      setError(err.message || "Failed to leave event.");
    }
  };

  const fetchData = async () => {
    if (!user?.user_id) return;
    setIsLoading(true);
    setError("");
    try {
      const [eventsRes, attendingRes] = await Promise.all([
        apiFetch("/events"),
        apiFetch(`/users/${user.user_id}/attending`),
      ]);
      setAllEvents(Array.isArray(eventsRes) ? eventsRes : []);
      setAttendingEventIds(new Set(attendingRes));
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(err.message || "Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  if (!user)
    return (
      <div className="text-center mt-8">
        Please log in to view the dashboard.
      </div>
    );
  if (isLoading)
    return <div className="text-center mt-8">Loading dashboard...</div>;
  if (error)
    return <div className="text-center mt-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Event Dashboard</h2>
        {user.is_manager ? (
          <Link
            to="/create-event"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold"
          >
            Create New Event
          </Link>
        ) : null}
      </div>
      {error ? (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          Error: {error}
        </div>
      ) : null}
      {allEvents.length === 0 ? (
        <p className="text-gray-500">No events found.</p>
      ) : (
        <div className="space-y-4">
          {allEvents.map((event) => (
            <div
              key={event.event_id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex justify-between items-center"
            >
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  {event.title}
                  {attendingEventIds.has(event.event_id) ? (
                    <span className="ml-3 text-sm font-semibold text-green-600">
                      (Attending)
                    </span>
                  ) : null}
                </h3>
                <p className="text-gray-500">
                  {new Date(event.date).toLocaleString()}
                </p>
                <p className="text-gray-600 text-sm mt-1">{event.address}</p>
              </div>
              <div className="flex items-center space-x-3">
                {user.is_manager ? (
                  <>
                    <Link
                      to={`/manage-attendees/${event.event_id}`}
                      state={{ eventTitle: event.title }} // Pass title to the next page
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      Manage
                    </Link>
                    <Link
                      to={`/edit-event/${event.event_id}`}
                      state={{ event }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors text-sm font-medium"
                    >
                      Edit
                    </Link>
                  </>
                ) : null}
                {attendingEventIds.has(event.event_id) ? (
                  <button
                    onClick={() => handleUnattend(event.event_id)}
                    className="w-20 py-2 text-center bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors text-sm font-medium"
                  >
                    Leave
                  </button>
                ) : (
                  <button
                    onClick={() => handleAttend(event.event_id)}
                    className="w-20 py-2 text-center bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
                  >
                    Join
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
