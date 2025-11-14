import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance, { clearAuthCookies } from '../utils/axios';
import { supabase } from '../utils/supabase';
import { RealtimeContext } from '../context/RealtimeContext';

const UserNavbar = ({ user, setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState(user);
  const { events, unreadCount, markAllRead } = useContext(RealtimeContext);

  useEffect(() => {
    setUserData(user);
  }, [user]);

  useEffect(() => {
    if (!userData) {
      const fetchUser = async () => {
        try {
          const { data } = await axiosInstance.get('/auth/me');
          setUserData(data);
          setUser(data);
        } catch (err) {
          console.error('Error fetching user:', err);
          setUserData(null);
          setUser(null);
          // If not authenticated, redirect to login
          navigate('/login');
        }
      };
      fetchUser();
    }
  }, [userData, setUser, navigate]);

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
      setUserData(null);
      setUser(null);
      // Clear any client-side cookies/session and supabase client session
      try {
        clearAuthCookies();
      } catch (e) {
        console.warn('Failed to clear client cookies', e);
      }
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signOut error', e);
      }
      toast.success('Logged out successfully');
      navigate('/login');
      // Force a full reload so App re-checks /auth/me and switches to PublicNavbar
      setTimeout(() => {
        try { window.location.reload(); } catch (e) { /* ignore */ }
      }, 200);
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Logout failed');
    }
  };

  const isActive = (path) => location.pathname === path ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-700 hover:text-blue-600';

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            K
          </div>
          <span>Kazilink</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {userData && (
            <>
              <div className="relative">
                <button
                  onClick={() => { setNotifOpen(!notifOpen); if (unreadCount) markAllRead(); }}
                  className="relative p-2 rounded-full hover:bg-gray-100"
                  title="Notifications"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{unreadCount}</span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="p-3 border-b font-medium">Notifications</div>
                    <div className="max-h-56 overflow-auto">
                      {events.length === 0 && <div className="p-3 text-sm text-gray-500">No notifications</div>}
                      {events.map((ev, idx) => (
                        <div key={idx} className="p-3 hover:bg-gray-50 text-sm border-b">
                          <div className="font-medium">{ev.type}</div>
                          <div className="text-gray-600">{ev.payload?.message || JSON.stringify(ev.payload)}</div>
                          <div className="text-xs text-gray-400 mt-1">{new Date(ev.created_at).toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <Link to="/dashboard" className={`pb-2 transition ${isActive('/dashboard')}`}>
                Dashboard
              </Link>

              {userData.role === 'client' && (
                <>
                  <Link to="/my-tasks" className={`pb-2 transition ${isActive('/my-tasks')}`}>
                    My Tasks
                  </Link>
                  <Link to="/post-task" className={`pb-2 transition ${isActive('/post-task')}`}>
                    Post Task
                  </Link>
                </>
              )}
              
              {userData.role === 'youth' && (
                <Link to="/browse-tasks" className={`pb-2 transition ${isActive('/browse-tasks')}`}>
                  Browse Tasks
                </Link>
              )}

              {userData.role === 'admin' && (
                <Link to="/admin" className={`pb-2 transition ${isActive('/admin')}`}>
                  Admin
                </Link>
              )}
            </>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="hidden md:flex items-center gap-4">
          {userData && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {userData.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-medium text-gray-700">{userData.name}</span>
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-t-lg"
                    onClick={() => setDropdownOpen(false)}
                  >
                    👤 My Profile
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-b-lg"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 p-4 space-y-3">
          {userData && (
            <>
              <Link
                to="/profile"
                className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                👤 My Profile
              </Link>
              <Link
                to="/dashboard"
                className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              {userData.role === 'client' && (
                <>
                  <Link
                    to="/my-tasks"
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Tasks
                  </Link>
                  <Link
                    to="/post-task"
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Post Task
                  </Link>
                </>
              )}
              {userData.role === 'youth' && (
                <Link
                  to="/browse-tasks"
                  className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse Tasks
                </Link>
              )}
              {userData.role === 'admin' && (
                <Link
                  to="/admin"
                  className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                🚪 Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default UserNavbar;
