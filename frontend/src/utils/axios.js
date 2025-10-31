import axios from 'axios';
import { toast } from 'react-toastify';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
          localStorage.removeItem('token');
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