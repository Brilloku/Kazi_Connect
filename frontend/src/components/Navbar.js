import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { toast } from 'react-toastify';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const { data } = await axiosInstance.get('/auth/me');
          setUser(data);
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-xl font-bold">Youth Services</Link>
        <div className="space-x-4">
          {!user ? (
            <>
              <Link to="/register" className="text-white hover:text-blue-200">Register</Link>
              <Link to="/login" className="text-white hover:text-blue-200">Login</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="text-white hover:text-blue-200">Dashboard</Link>
              {user.role === 'client' && (
                <Link to="/post-task" className="text-white hover:text-blue-200">Post a Task</Link>
              )}
              {user.role === 'youth' && (
                <Link to="/browse-tasks" className="text-white hover:text-blue-200">Browse Tasks</Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin" className="text-white hover:text-blue-200">Admin Panel</Link>
              )}
              <button onClick={handleLogout} className="text-white hover:text-blue-200">Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
