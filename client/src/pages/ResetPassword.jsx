// client/src/pages/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api.js";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { token } = useParams();
  const navigate = useNavigate();

  const [redirectCountdown, setRedirectCountdown] = useState(5);

  // Optional: countdown redirect after success
  useEffect(() => {
    if (!message) return;

    const interval = setInterval(() => {
      setRedirectCountdown((c) => {
        if (c === 1) {
          navigate("/login");
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [message, navigate]);

  function validatePassword() {
    if (password.length < 8)
      return "Password must be at least 8 characters long.";

    if (!/[0-9]/.test(password))
      return "Password must contain at least one number.";

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
      return "Password must contain at least one special character.";

    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const validationError = validatePassword();
    if (validationError) return setError(validationError);

    if (password !== confirmPassword)
      return setError("Passwords do not match.");

    try {
      const data = await apiFetch(`/reset-password/${token}`, {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center mt-10">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
          <p className="text-red-500">Invalid or missing reset token.</p>
        </div>
      </div>
    );
  }

  if (message) {
    return (
      <div className="flex items-center justify-center mt-10">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
          <p className="text-green-600 mb-4">{message}</p>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Redirecting to login in {redirectCountdown}...
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Login Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center mt-10">
      <div className="max-w-md w-full bg-gray-100 dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-200">
          Enter New Password
        </h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Password Field */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 border rounded-md
                focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Confirm Password Field */}
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 border rounded-md
                focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-3"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
