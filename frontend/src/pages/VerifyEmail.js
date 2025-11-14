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
    const createProfile = async (user) => {
      if (hasAttemptedVerification) return;
      setHasAttemptedVerification(true);

      try {
        setMessage('Creating your profile...');

        const response = await axiosInstance.post('/auth/createProfile', {
          supabase_id: user.id,
          email: user.email,
          name: user.user_metadata?.name,
          role: user.user_metadata?.role,
          location: user.user_metadata?.location,
          skills: user.user_metadata?.skills,
          phone: user.user_metadata?.phone,
          password: user.user_metadata?.password // Pass original password from signup
        });

        if (response.status === 200) {
          const result = response.data;
          console.log('MongoDB user profile created:', result);

          // Store backend token in a helper cookie for non-httpOnly reads (optional)
          // The backend also sets an httpOnly cookie - that is the primary auth mechanism.
          const { token, user: userData } = result;
          if (token) {
            setCookie('backendToken', token, 7);
          }

          toast.success('Account verified successfully!');
          setMessage('Account verified successfully! Redirecting to dashboard...');
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
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
        console.log('Auth state changed in VerifyEmail:', event, session);

        if (event === 'SIGNED_IN' && session?.user) {
          // Proceed to create profile when Supabase signs the user in (verification flow).
          // Some Supabase flows sign the user in but may not expose email_confirmed_at immediately,
          // so call createProfile regardless and let the backend upsert/update safely.
          createProfile(session.user);
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

        if (session && session.user) {
          // If session exists, proceed to create profile (backend upserts safely)
          console.log('Initial session in VerifyEmail:', session);
          createProfile(session.user);
          return;
        }

        // If there's no session, check for a verification token in the URL (supabase verify link)
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (token) {
          try {
            setMessage('Finalizing verification...');
            // Attempt to verify signup using Supabase verifyOtp. Some Supabase setups
            // will accept verifyOtp with only token and type: 'signup'. If it succeeds
            // a session/user will be returned and the onAuthStateChange handler will
            // fire; otherwise we still attempt to continue after this call.
            const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({ token, type: 'signup' });
            if (verifyError) {
              console.warn('verifyOtp error (signup):', verifyError.message || verifyError);
            } else if (verifyData?.user) {
              console.log('verifyOtp returned user:', verifyData.user.email);
              if (verifyData.user.email_confirmed_at) {
                createProfile(verifyData.user);
                return;
              }
            }
          } catch (e) {
            console.error('Error during verifyOtp:', e);
          }
        }

        // No active session and no usable token verification result
        setMessage('Waiting for email verification. Please check your email and click the verification link.');
        setIsLoading(false);
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
