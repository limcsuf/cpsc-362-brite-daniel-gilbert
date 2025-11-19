import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import AddressPicker from "../components/AddressPicker.jsx";
import DatePicker from "../components/DatePicker.jsx";

export default function CreateEvent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    date: null, // store as Date object
    address: "",
    category: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [existingCategories, setExistingCategories] = useState([]);
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await apiFetch("/events/categories");
        if (categories?.length) {
          setExistingCategories(categories);
          setFormData((prev) => ({ ...prev, category: categories[0] }));
        } else {
          setIsCreatingNewCategory(true);
        }
      } catch {
        setIsCreatingNewCategory(true);
      }
    };
    fetchCategories();
  }, []);

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

    if (!formData.date) {
      setError("Please select a valid date and time.");
      return;
    }

    try {
      const dateToSend = formData.date.toISOString(); // store UTC
      await apiFetch("/events", {
        method: "POST",
        body: JSON.stringify({ ...formData, date: dateToSend }),
      });
      setMessage("Event created successfully!");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setError(err.message || "Failed to create event.");
    }
  };

  if (!user?.is_manager)
    return <div className="text-center mt-10 text-red-500">Access Denied.</div>;

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
          Create New Event
        </h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {message && (
          <p className="text-green-500 text-center mb-4">{message}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <DatePicker
            selected={formData.date}
            onChange={(date) =>
              setFormData({
                ...formData,
                date: date,
              })
            }
            placeholder="Select date & time"
          />

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

          <AddressPicker
            initialAddress={formData.address}
            onAddressSelect={(address) => setFormData({ ...formData, address })}
          />

          <button
            type="submit"
            className="w-full p-3 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            Create Event
          </button>
        </form>
      </div>
    </div>
  );
}
