import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase } from '../utils/supabase';
import AuthBackground from '../components/AuthBackground';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Handle email verification from Supabase redirect
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Supabase session error:', error);
          setMessage('Verification failed. Please try again.');
          toast.error('Verification failed');
          setIsLoading(false);
          return;
        }

        if (data.session?.user) {
          // Check if email is confirmed
          if (data.session.user.email_confirmed_at) {
            toast.success('Email verified successfully!');
            setMessage('Email verified successfully! Creating your account...');

            // Create MongoDB user record
            try {
              const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://kazi-connect.onrender.com'}/api/auth/login`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${data.session.access_token}`
                },
                body: JSON.stringify({
                  email: data.session.user.email,
                  password: 'dummy' // Not used for Supabase auth
                })
              });

              if (response.ok) {
                const userData = await response.json();
                setMessage('Account created successfully! Redirecting to dashboard...');
                setTimeout(() => {
                  // Redirect based on user role
                  const role = userData.user?.role;
                  if (role === 'admin') navigate('/admin');
                  else if (role === 'youth') navigate('/browse-tasks');
                  else navigate('/dashboard');
                }, 2000);
              } else {
                console.error('Failed to create user record');
                setMessage('Account verification successful, but there was an issue setting up your profile. Please try logging in.');
                setTimeout(() => navigate('/login'), 3000);
              }
            } catch (err) {
              console.error('Error creating user record:', err);
              setMessage('Account verification successful, but there was an issue setting up your profile. Please try logging in.');
              setTimeout(() => navigate('/login'), 3000);
            }
          } else {
            setMessage('Email verification is still pending. Please check your email.');
            toast.info('Email verification pending');
          }
        } else {
          setMessage('No active session found. Please try logging in or request a new verification email.');
          toast.error('No active session found');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (err) {
        console.error('Verification error:', err);
        setMessage('An error occurred during verification. Please try again.');
        toast.error('Verification failed');
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [navigate]);

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
