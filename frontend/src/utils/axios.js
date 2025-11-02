import axios from 'axios';
import { toast } from 'react-toastify';
import { supabase } from './supabase';

console.log('API URL:', process.env.REACT_APP_API_URL || 'https://kazi-connect.onrender.com/api');

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://kazi-connect.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log all requests in development
axiosInstance.interceptors.request.use(request => {
  console.log('Starting Request:', {
    method: request.method,
    url: request.url,
    baseURL: request.baseURL
  });
  return request;
});

// Request interceptor to add Supabase JWT token
axiosInstance.interceptors.request.use(
  async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);

    if (error.response) {
      // Handle specific HTTP errors
      switch (error.response.status) {
        case 401:
        case 403:
          // Sign out user on auth errors
          supabase.auth.signOut();
          // Only redirect if we're not already on the login page
          if (!window.location.pathname.includes('/login')) {
            toast.error('Session expired. Please login again.');
            window.location.href = '/login';
          }
          break;
        default:
          const message = error.response.data?.error || 'Something went wrong';
          toast.error(message);
      }
    } else if (error.request) {
      // Request made but no response received
      toast.error('No response from server. Please try again.');
    } else {
      // Something else happened
      toast.error('An error occurred. Please try again.');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
