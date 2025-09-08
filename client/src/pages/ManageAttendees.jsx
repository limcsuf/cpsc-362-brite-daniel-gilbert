// client/src/pages/ManageAttendees.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { apiFetch } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function ManageAttendees() {
  const { eventId } = useParams();
  const location = useLocation();
  const { user } = useAuth();

  const eventTitle = location.state?.eventTitle || "Event";

  const [attendees, setAttendees] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [attendeesData, allUsersData] = await Promise.all([
        apiFetch(`/events/${eventId}/attendees`),
        apiFetch("/users"),
      ]);
      setAttendees(attendeesData);
      setAllUsers(allUsersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const handleAddUser = async () => {
    if (!selectedUserId) return;
    try {
      await apiFetch(`/events/${eventId}/attendees`, {
        method: "POST",
        body: JSON.stringify({ userId: selectedUserId }),
      });
      fetchData(); // Refresh the list
      setSelectedUserId(""); // Reset dropdown
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveUser = async (userId) => {
    try {
      await apiFetch(`/events/${eventId}/attendees/${userId}`, {
        method: "DELETE",
      });
      fetchData(); // Refresh the list
    } catch (err) {
      setError(err.message);
    }
  };

  // Memoized list of users who can be added (not already attending)
  const usersToAdd = useMemo(() => {
    const attendeeIds = new Set(attendees.map((a) => a.user_id));
    return allUsers.filter((u) => !attendeeIds.has(u.user_id));
  }, [attendees, allUsers]);

  if (!user?.is_manager)
    return <div className="text-center mt-10 text-red-500">Access Denied.</div>;
  if (isLoading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <Link
          to="/dashboard"
          className="text-sm text-blue-500 hover:underline mb-4 block"
        >
          &larr; Back to Dashboard
        </Link>
        <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-200">
          Manage Attendees
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          For: {eventTitle}
        </p>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* --- Add User Section --- */}
        <div className="flex items-center space-x-2 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="flex-grow p-2 border rounded-md bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-500"
          >
            <option value="">-- Select a user to add --</option>
            {usersToAdd.map((u) => (
              <option key={u.user_id} value={u.user_id}>
                {u.name} {u.is_manager ? '(Manager)' : ''}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddUser}
            disabled={!selectedUserId}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400"
          >
            Add
          </button>
        </div>

        {/* --- Current Attendees List --- */}
        <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
          Current Attendees ({attendees.length})
        </h3>
        <div className="space-y-3">
          {attendees.length > 0 ? (
            attendees.map((attendee) => (
              <div
                key={attendee.user_id}
                className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-md"
              >
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {attendee.name}
                    {attendee.is_manager ? (
                      <span className="ml-2 text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900 px-2 py-0.5 rounded-full">
                        Manager
                      </span>
                    ) : null}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {attendee.email}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveUser(attendee.user_id)}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No users are currently attending this event.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
