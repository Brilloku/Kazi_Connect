import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase } from '../utils/supabase';
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
    const createProfile = async (user) => {
      if (hasAttemptedVerification) return;
      setHasAttemptedVerification(true);

      try {
        setMessage('Creating your profile...');

        const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://kazi-connect.onrender.com'}/api/auth/createProfile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            supabase_id: user.id,
            email: user.email,
            name: user.user_metadata?.name,
            role: user.user_metadata?.role,
            location: user.user_metadata?.location,
            skills: user.user_metadata?.skills,
            phone: user.user_metadata?.phone
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('MongoDB user profile created:', result);
          toast.success('Account verified successfully!');
          setMessage('Account verified successfully! Redirecting to dashboard...');
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          console.error('Failed to create user profile:', response.status, response.statusText);
          const errorText = await response.text();
          console.error('Error response:', errorText);
          setMessage('Account verification successful, but there was an issue creating your profile. Please try logging in.');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (err) {
        console.error('Error creating user profile:', err);
        setMessage('Account verification successful, but there was an issue creating your profile. Please try logging in.');
        setTimeout(() => navigate('/login'), 3000);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      // User is logged in, check if email is verified
      if (user.email_confirmed_at) {
        createProfile(user);
      } else {
        setMessage('Email verification is still pending. Please check your email and click the verification link.');
        setIsLoading(false);
      }
    } else {
      // Listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed in VerifyEmail:', event, session?.user?.email);

        if (event === 'SIGNED_IN' && session?.user) {
          if (session.user.email_confirmed_at) {
            createProfile(session.user);
          } else {
            setMessage('Email verification is still pending. Please check your email and click the verification link.');
            setIsLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          setMessage('Session expired. Please try logging in again.');
          setIsLoading(false);
        }
      });

      // Check initial session
      const checkInitialSession = async () => {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session check error:', error);
          setMessage('Unable to verify session. Please try again.');
          setIsLoading(false);
          return;
        }

        if (!session) {
          setMessage('Waiting for email verification. Please check your email and click the verification link.');
          setIsLoading(false);
        }
      };

      checkInitialSession();

      return () => subscription.unsubscribe();
    }
  }, [user, navigate, hasAttemptedVerification]);

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
