// client/src/pages/CreateEvent.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import AddressPicker from "../components/AddressPicker.jsx";

export default function CreateEvent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    date: "",
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
        // This assumes you created the '/events/categories' endpoint
        const categories = await apiFetch("/events/categories");
        if (categories && categories.length > 0) {
          setExistingCategories(categories);
          // Default the form's category to the first one in the list
          setFormData((prev) => ({ ...prev, category: categories[0] }));
        } else {
          // If no categories exist, force creation mode
          setIsCreatingNewCategory(true);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        // If the fetch fails, default to creation mode as a fallback
        setIsCreatingNewCategory(true);
      }
    };
    fetchCategories();
  }, []); // Empty dependency array means this runs once on mount

  const handleCategoryToggle = (e) => {
    const isCreating = e.target.checked;
    setIsCreatingNewCategory(isCreating);
    // Reset category in form data when toggling
    if (isCreating) {
      setFormData({ ...formData, category: "" });
    } else {
      // Default to the first existing category when switching back
      setFormData({ ...formData, category: existingCategories[0] || "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      // Convert date to ISO format for sending to the backend
      const dateToSend = new Date(formData.date).toISOString();

      await apiFetch("/events", {
        method: "POST",
        body: JSON.stringify({ ...formData, date: dateToSend }),
      });

      setMessage("Event created successfully!");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  // Security check to ensure only managers can access this page
  if (!user?.is_manager) {
    return <div className="text-center mt-10 text-red-500">Access Denied.</div>;
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
            className="w-full p-3 border rounded-md bg-gray-700 text-white border-gray-600"
            required
          />
          <input
            type="datetime-local"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full p-3 border rounded-md bg-gray-700 text-white border-gray-600"
            required
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
                className="ml-2 text-sm text-gray-300"
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
                className="w-full p-3 border rounded-md bg-gray-700 text-white border-gray-600"
                required
              />
            ) : (
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full p-3 border rounded-md bg-gray-700 text-white border-gray-600"
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
            onAddressSelect={(address) =>
              setFormData({ ...formData, address: address })
            }
          />
          <button
            type="submit"
            className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Event
          </button>
        </form>
      </div>
    </div>
  );
}
