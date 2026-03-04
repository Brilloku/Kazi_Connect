import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axios';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user: authUser, backendUser, loading: authLoading, verifySession } = useAuth();
  const [internalLoading, setInternalLoading] = useState(!backendUser);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      if (!authUser) {
        setInternalLoading(false);
        return;
      }

      if (!backendUser) {
        await verifySession(axiosInstance);
      }
      setInternalLoading(false);
    };

    if (!authLoading) {
      checkAuth();
    }
  }, [authUser, authLoading, backendUser, verifySession]);

  if (authLoading || internalLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check if user is authenticated via backend
  if (!backendUser) {
    console.log('ProtectedRoute: No user authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(backendUser.role)) {
    toast.error('Access denied');
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
