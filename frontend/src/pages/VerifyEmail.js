import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase } from '../utils/supabase';
import axiosInstance, { setCookie } from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import AuthBackground from '../components/AuthBackground';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // eslint-disable-line no-unused-vars
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [hasAttemptedVerification, setHasAttemptedVerification] = useState(false);

  useEffect(() => {
    const handleVerification = async (token) => {
      if (hasAttemptedVerification) return;
      setHasAttemptedVerification(true);

      try {
        setIsLoading(true);
        setMessage('Verifying your email and setting up your profile...');

        // Call our backend /verify endpoint which now handles PendingUser -> User migration
        const response = await axiosInstance.get(`/auth/verify?token=${token}`);

        if (response.status === 200) {
          toast.success('Email verified successfully!');
          setMessage('Email verified! Redirecting to login...');
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
      } catch (err) {
        console.error('Verification error:', err);
        const errorMsg = err.response?.data?.error || 'Verification failed. The link may have expired.';
        toast.error(errorMsg);
        setMessage(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    // 1. Check for token in URL (standard flow from email click)
    const token = searchParams.get('token') || new URLSearchParams(window.location.search).get('token');

    if (token) {
      handleVerification(token);
    } else if (user?.email_confirmed_at) {
      // 2. If user is already logged in and confirmed, they shouldn't be here
      navigate('/dashboard');
    } else {
      // 3. Just waiting for them to click the link
      setMessage('Please check your email and click the verification link to activate your account.');
      setIsLoading(false);
    }
  }, [searchParams, user, navigate, hasAttemptedVerification]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <AuthBackground />
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 relative">
        <h2 className="text-2xl font-bold mb-4">Email Verification</h2>
        {isLoading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Verifying your email...</p>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
