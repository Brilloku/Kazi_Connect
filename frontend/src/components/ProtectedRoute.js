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
      if (!authUser) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await axiosInstance.get('/auth/me');
        setUser(data);
      } catch (err) {
        console.error('Auth verification failed:', err);
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

  if (!authUser || !user) {
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
