// client/src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";

import Header from "./components/Header.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import NotFound from "./pages/NotFound.jsx";
import EditEvent from "./pages/EditEvent.jsx";
import CreateEvent from "./pages/CreateEvent.jsx";
import ManageAttendees from "./pages/ManageAttendees.jsx";
import EventsPage from "./pages/EventsPage.jsx";
import LogEvent from "./pages/LogEvent.jsx";

// This component protects routes that require a logged-in user.
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    // If the auth state is still loading, you can show a loading spinner or placeholder
    return <div>Loading...</div>;
  }
  if (!user) {
    // If no user is logged in, redirect to the login page
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Header />
      <main className="container mx-auto p-4">
        <Routes>
          {/* Public routes accessible to everyone */}
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" /> : <Login />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/dashboard" /> : <Register />}
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Protected routes only accessible to logged-in users */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-event/:eventId"
            element={
              <ProtectedRoute>
                <EditEvent />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create-event"
            element={
              <ProtectedRoute>
                <CreateEvent />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-attendees/:eventId"
            element={
              <ProtectedRoute>
                <ManageAttendees />
              </ProtectedRoute>
            }
          />

          {/* Redirect from the root path based on login status */}
          <Route
            path="/"
            element={<Navigate to={user ? "/dashboard" : "/login"} />}
          />

          <Route 
            path="/events"
            element={<EventsPage />} 
          />

          <Route 
            path="/log"
            element={<LogEvent />}
          />

          {/* Catch-all route for any undefined paths */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
