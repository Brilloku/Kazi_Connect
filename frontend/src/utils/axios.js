import axios from 'axios';
import { toast } from 'react-toastify';
import { supabase } from './supabase';

// Determine API URL based on environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
console.log('API URL:', API_URL);

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
  withCredentials: true, // Enable cookies
});

// Request interceptor to add backend JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    // Prefer backend cookie when available (avoid sending stale header tokens).
    const hasCookie = typeof document !== 'undefined' && document.cookie && document.cookie.includes('backendToken=');
    if (hasCookie) {
      // Cookie will be sent automatically with `withCredentials: true`.
      console.log('Request to', config.url, '- backendToken cookie present; not adding Authorization header');
    } else {
      // No cookie present; rely on server to reject unauthorized requests.
      console.log('Request to', config.url, '- No backendToken cookie present; not adding Authorization header');
    }
    
    console.log('Starting Request:', {
      method: config.method,
      url: config.url,
      hasAuth: !!config.headers.Authorization
    });
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
          // Clear stored cookies on auth errors
          clearAuthCookies();
          // Sign out from Supabase to clean up any client session state
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

// Utility functions for cookie management
export const setCookie = (name, value, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  const cookieString = `${name}=${value};expires=${expires.toUTCString()};path=/;Secure;SameSite=Strict`;
  document.cookie = cookieString;
};

export const getCookie = (name) => {
  const nameEQ = name + '=';
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length);
    }
  }
  return null;
};

export const clearAuthCookies = () => {
  // Clear auth-related cookies
  document.cookie = 'backendToken=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
  document.cookie = 'user=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
};

export default axiosInstance;
