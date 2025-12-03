import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import AddressPicker from "../components/AddressPicker.jsx";
import DatePicker from "../components/DatePicker.jsx";

export default function EditEvent() {
  const { eventId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const initialEvent = location.state?.event;

  // Helper to safely parse backend date to local Date object
  const parseBackendDate = (isoDate) => {
    if (!isoDate) return null;
    const date = new Date(isoDate);
    return isNaN(date.getTime()) ? null : date;
  };

  // Form state
  const [formData, setFormData] = useState({
    title: initialEvent?.title || "",
    date: parseBackendDate(initialEvent?.date),
    address: initialEvent?.address || "",
    category: initialEvent?.category || "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [existingCategories, setExistingCategories] = useState([]);
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // New Loading State
  const [isLoading, setIsLoading] = useState(!initialEvent);

  // 1. Fetch Categories AND Event Details (if missing)
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch Categories
        const categories = await apiFetch("/events/categories");
        if (categories && categories.length > 0) {
          setExistingCategories(categories);
          // Only set default category if we don't already have one from initialEvent
          if (!formData.category) {
            setFormData((prev) => ({
              ...prev,
              category: categories[0],
            }));
          }
        } else {
          setIsCreatingNewCategory(true);
        }

        // Fetch Event Data if not provided via navigation state (Page Refresh)
        if (!initialEvent) {
          const fetchedEvent = await apiFetch(`/events/${eventId}`);

          if (fetchedEvent) {
            setFormData({
              title: fetchedEvent.title,
              date: parseBackendDate(fetchedEvent.date),
              address: fetchedEvent.address,
              category: fetchedEvent.category,
            });
          } else {
            setError("Event not found.");
          }
        }
      } catch (err) {
        console.error("Failed to load data:", err);
        setError("Failed to load event data.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [eventId, initialEvent]); // Run on mount

  const handleCategoryToggle = (e) => {
    const isCreating = e.target.checked;
    setIsCreatingNewCategory(isCreating);
    setFormData({
      ...formData,
      category: isCreating ? "" : existingCategories[0] || "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const dateToSend = formData.date ? formData.date.toISOString() : null;

      await apiFetch(`/events/${eventId}`, {
        method: "PUT",
        body: JSON.stringify({ ...formData, date: dateToSend }),
      });

      setMessage("Event updated successfully!");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteClick = () => setShowConfirm(true);

  const confirmDelete = async () => {
    setShowConfirm(false);
    try {
      await apiFetch(`/events/${eventId}`, { method: "DELETE" });
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to delete event:", err);
      alert("Failed to delete event. Please try again.");
    }
  };

  if (isLoading) {
    return <div className="text-center mt-10">Loading event data...</div>;
  }

  if (!user?.is_manager) {
    return (
      <div className="text-center mt-10">
        <p className="text-red-500">
          Access Denied. Only managers can edit events.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-10">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <Link
          to="/dashboard"
          className="text-sm text-blue-500 hover:underline mb-4 block"
        >
          &larr; Back to Dashboard
        </Link>

        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-200">
          Edit Event
        </h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {message && (
          <p className="text-green-500 text-center mb-4">{message}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Event Title */}
          <input
            type="text"
            placeholder="Event Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full p-3 border rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
            required
          />

          {/* Date/Time Picker */}
          <DatePicker
            selected={formData.date}
            onChange={(date) => setFormData((prev) => ({ ...prev, date }))}
            dateFormat="yyyy-MM-dd h:mm aa"
            showTimeSelect
            placeholder="Select date & time"
          />

          {/* Category Section */}
          <div className="p-3 border rounded-md border-gray-600 space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="new-category-toggle"
                checked={isCreatingNewCategory}
                onChange={handleCategoryToggle}
                className="h-4 w-4 rounded"
                disabled={existingCategories.length === 0}
              />
              <label
                htmlFor="new-category-toggle"
                className="ml-2 text-sm text-gray-600 dark:text-gray-300"
              >
                Create new category
              </label>
            </div>
            {isCreatingNewCategory ? (
              <input
                type="text"
                placeholder="Enter new category name"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full p-3 border rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
                required
              />
            ) : (
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full p-3 border rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
              >
                {existingCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Address Picker */}
          <AddressPicker
            key={isLoading ? "loading" : "loaded"}
            defaultValue={formData.address}
            onAddressSelect={(address) => setFormData({ ...formData, address })}
          />

          {/* Buttons */}
          <button
            type="submit"
            className="w-full p-3 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            Update Event
          </button>

          <button
            type="button"
            onClick={handleDeleteClick}
            className="w-full p-3 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
          >
            Delete Event
          </button>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition-opacity duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm transition-colors">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
              Confirm Delete
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-5">
              Are you sure you want to permanently delete this event? This
              action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
