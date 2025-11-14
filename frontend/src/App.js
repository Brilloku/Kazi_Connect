import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { RealtimeProvider } from './context/RealtimeContext';
import axiosInstance from './utils/axios';
import UserNavbar from './components/UserNavbar';
import PublicNavbar from './components/PublicNavbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import VerifyEmail from './pages/VerifyEmail';
import AuthCallback from './pages/AuthCallback';
import ResetPassword from './pages/ResetPassword';

import Dashboard from './pages/Dashboard';
import MyTasks from './pages/MyTasks';
import PostTask from './pages/PostTask';
import BrowseTasks from './pages/BrowseTasks';
import Admin from './pages/Admin';
import Profile from './pages/Profile';

function App() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await axiosInstance.get('/auth/me');
        setUser(data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <AuthProvider>
      <RealtimeProvider>
        <Router>
          <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/" element={<Home setUser={setUser} user={user} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard user={user} setUser={setUser} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-tasks"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <MyTasks user={user} setUser={setUser} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile user={user} setUser={setUser} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/post-task"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <PostTask user={user} setUser={setUser} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/browse-tasks"
              element={
                <ProtectedRoute allowedRoles={['youth']}>
                  <BrowseTasks user={user} setUser={setUser} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Admin user={user} setUser={setUser} />
                </ProtectedRoute>
              }
            />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
        </Router>
      </RealtimeProvider>
    </AuthProvider>
  );
}

export default App;
