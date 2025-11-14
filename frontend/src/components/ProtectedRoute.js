import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axios';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user: authUser, loading: authLoading } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const verifyUser = async () => {
      // Call backend to verify the session (cookies will be sent automatically)
      try {
        console.log('ProtectedRoute: Calling /auth/me to verify user');
        const { data } = await axiosInstance.get('/auth/me');
        console.log('ProtectedRoute: User verified successfully:', data);
        setUser(data);
      } catch (err) {
        console.error('ProtectedRoute: Auth verification failed:', err.response?.status, err.response?.data);
        setUser(null);
        // Clear stored cookies on auth failure
        // (backend httpOnly cookie will be cleared by server-side logout if implemented)
        // Optionally clear any helper cookies
        // clearAuthCookies();
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      verifyUser();
    }
  }, [authUser, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check if user is authenticated via backend (primary method)
  if (!user) {
    console.log('ProtectedRoute: No user authenticated, redirecting to login');
    toast.error('Please login to continue');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    toast.error('Access denied');
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
