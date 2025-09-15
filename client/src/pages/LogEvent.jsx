import React, { useState } from "react";

export default function LogEvent() {
  const [form, setForm] = useState({ name: "", date: "", location: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("New event logged:", form);
    alert(`Event "${form.name}" logged! (console only for now)`);
    setForm({ name: "", date: "", location: "" });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Log a New Event</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Event Name: </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Date: </label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Location: </label>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Log Event</button>
      </form>
    </div>
  );
}
