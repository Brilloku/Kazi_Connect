/**
 * Axios HTTP client configuration for Kazilink
 * Sets up interceptors for authentication, error handling, and cookie management
 * Handles JWT tokens via httpOnly cookies for security
 */

import axios from 'axios';
import { toast } from 'react-toastify';
import { supabase } from './supabase';

// Determine API base URL from environment variables
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_URL = baseURL.endsWith('/api') ? baseURL : `${baseURL}/api`;
console.log('API URL:', API_URL);

// Create axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
  withCredentials: true, // Enable cookies for authentication
});

/**
 * Request interceptor
 * Adds authentication headers and logs request details
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Check if backendToken cookie is present
    const hasCookie = typeof document !== 'undefined' && document.cookie && document.cookie.includes('backendToken=');

    if (hasCookie) {
      // Cookie will be sent automatically with `withCredentials: true`
      console.log('Request to', config.url, '- backendToken cookie present; not adding Authorization header');
    } else {
      // No cookie present; server will handle unauthorized requests
      console.log('Request to', config.url, '- No backendToken cookie present; not adding Authorization header');
    }

    // Log request details for debugging
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

/**
 * Response interceptor
 * Handles API errors and authentication failures
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);

    if (error.response) {
      // Handle specific HTTP status codes
      switch (error.response.status) {
        case 401: // Unauthorized
        case 403: // Forbidden
          // Clear authentication cookies
          clearAuthCookies();
          // Sign out from Supabase to clean up client session
          supabase.auth.signOut();
          // Redirect to login if not already there
          if (!window.location.pathname.includes('/login')) {
            toast.error('Session expired. Please login again.');
            window.location.href = '/login';
          }
          break;
        default:
          // Show error message from server or generic message
          const message = error.response.data?.error || 'Something went wrong';
          toast.error(message);
      }
    } else if (error.request) {
      // Request made but no response received (network error)
      toast.error('No response from server. Please try again.');
    } else {
      // Something else happened
      toast.error('An error occurred. Please try again.');
    }

    return Promise.reject(error);
  }
);

/**
 * Set a cookie with security flags
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} days - Days until expiration
 */
export const setCookie = (name, value, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  const cookieString = `${name}=${value};expires=${expires.toUTCString()};path=/;Secure;SameSite=Strict`;
  document.cookie = cookieString;
};

/**
 * Get a cookie value by name
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null if not found
 */
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

/**
 * Clear authentication-related cookies
 * Removes backendToken and user cookies
 */
export const clearAuthCookies = () => {
  // Clear auth-related cookies by setting expiration to past date
  document.cookie = 'backendToken=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
  document.cookie = 'user=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
};

export default axiosInstance;
