/**
 * Main App component for Kazilink
 * Sets up routing, authentication, and real-time context providers
 * Handles protected routes with role-based access control
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context providers for global state management
import { AuthProvider } from './context/AuthContext';
import { RealtimeProvider } from './context/RealtimeContext';

// HTTP client with interceptors
import axiosInstance from './utils/axios';

// Navigation components
import UserNavbar from './components/UserNavbar';
import PublicNavbar from './components/PublicNavbar';

// Route protection component
import ProtectedRoute from './components/ProtectedRoute';

// Page components
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import VerifyEmail from './pages/VerifyEmail';
import AuthCallback from './pages/AuthCallback';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import MyTasks from './pages/MyTasks';
import PostTask from './pages/PostTask';
import BrowseTasks from './pages/BrowseTasks';
import Admin from './pages/Admin';
import Profile from './pages/Profile';

function App() {
  return (
    // Authentication context provider
    <AuthProvider>
      {/* Real-time notifications context provider */}
      <RealtimeProvider>
        <Router>
          <div className="min-h-screen bg-gray-100">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected routes with role-based access */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Client-only routes */}
              <Route
                path="/my-tasks"
                element={
                  <ProtectedRoute allowedRoles={['client']}>
                    <MyTasks />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/post-task"
                element={
                  <ProtectedRoute allowedRoles={['client']}>
                    <PostTask />
                  </ProtectedRoute>
                }
              />

              {/* Youth-only routes */}
              <Route
                path="/browse-tasks"
                element={
                  <ProtectedRoute allowedRoles={['youth']}>
                    <BrowseTasks />
                  </ProtectedRoute>
                }
              />

              {/* Admin-only routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Admin />
                  </ProtectedRoute>
                }
              />

              {/* Profile route (all authenticated users) */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
            </Routes>

            {/* Toast notifications container */}
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </div>
        </Router>
      </RealtimeProvider>
    </AuthProvider>
  );
}

export default App;
