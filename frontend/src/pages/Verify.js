import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../utils/axios';
import AuthBackground from '../components/AuthBackground';

const Verify = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if there's a token in the URL for automatic verification
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      handleVerify(token);
    }
  }, []);

  const handleVerify = async (token) => {
    try {
      const res = await axiosInstance.get(`/auth/verify?token=${token}`);
      toast.success(res.data.message || 'Email verified successfully!');
      navigate('/login');
    } catch (err) {
      console.error('Verification error:', err);
      const errorData = err.response?.data;
      toast.error(errorData?.error || 'Verification failed');
    }
  };

  const handleResendVerification = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      const res = await axiosInstance.post('/auth/resend-verification', { email });
      toast.success(res.data.message || 'Verification email sent!');
    } catch (err) {
      console.error('Resend error:', err);
      const errorData = err.response?.data;
      toast.error(errorData?.error || 'Failed to resend verification email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <AuthBackground />

      {/* Top Logo */}
      <div className="fixed top-4 left-4 flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <img src="/favicon_io/favicon-32x32.png" alt="Kenya" className="w-6 h-6" />
        </div>
        <span className="text-lg font-semibold">Kazilink</span>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 relative my-8">
        <h2 className="text-2xl font-bold mb-2">Verify Your Email</h2>
        <p className="text-gray-600 mb-6">
          We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
        </p>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Didn't receive the email?</strong> Check your spam folder or resend the verification email below.
            </p>
          </div>

          <form onSubmit={handleResendVerification} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Resend Verification Email'}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center space-y-2">
          <p className="text-gray-600">
            Already verified?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700">
              Sign in
            </Link>
          </p>
          <p className="text-gray-600">
            Need to register?{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Verify;
