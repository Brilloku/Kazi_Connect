import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axios';
import AuthBackground from '../components/AuthBackground';

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await signIn(formData.email, formData.password);

      if (error) {
        toast.error(error.message);
        return;
      }

      // Get or create user profile from backend
      try {
        const res = await axiosInstance.post('/auth/login', formData);
        toast.success('Login successful!');

        // Redirect based on user role
        const { role } = res.data.user;
        switch (role) {
          case 'admin':
            navigate('/admin');
            break;
          case 'youth':
            navigate('/browse-tasks');
            break;
          case 'client':
            navigate('/dashboard');
            break;
          default:
            navigate('/dashboard');
        }
      } catch (backendError) {
        console.error('Backend login error:', backendError);
        // Even if backend fails, user is logged in with Supabase
        toast.success('Login successful!');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorData = err.response?.data;
      toast.error(errorData?.error || 'Login failed');
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
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 relative">
        <h2 className="text-2xl font-bold mb-2">Login</h2>
        <p className="text-gray-600 mb-6">Welcome back! Please enter your details</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              onChange={handleChange}
              className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              onChange={handleChange}
              className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200"
          >
            Sign in
          </button>
        </form>



        <div className="mt-6 text-center space-y-2">
          <p className="text-gray-600">Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700">
              Sign up
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Login;
