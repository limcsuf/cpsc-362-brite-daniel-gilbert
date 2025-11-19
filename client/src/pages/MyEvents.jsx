import React, { useState } from "react";

export default function Events() {
  // Temporary hardcoded data (replace with backend later)
  const [events] = useState([
    { id: 1, name: "Beach Cleanup", date: "2025-09-20", location: "Huntington Beach" },
    { id: 2, name: "Food Drive", date: "2025-09-22", location: "Fullerton Community Center" },
  ]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Upcoming Events</h2>
      {events.length === 0 ? (
        <p>No events yet.</p>
      ) : (
        <ul>
          {events.map((event) => (
            <li key={event.id}>
              <strong>{event.name}</strong> — {event.date} at {event.location}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}