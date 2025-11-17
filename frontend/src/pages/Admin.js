/**
 * Admin Panel Component for Kazilink
 * Provides administrative interface for managing users and tasks
 * Includes user verification, deactivation, and task oversight
 */

import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axios';
import UserNavbar from '../components/UserNavbar';

const Admin = () => {
  // State for users and tasks data
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * Fetch admin data on component mount
     * Retrieves users, tasks, and platform statistics
     */
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch users, tasks, and stats in parallel
        const [usersRes, tasksRes, statsRes] = await Promise.all([
          axiosInstance.get('/admin/users'),
          axiosInstance.get('/admin/tasks'),
          axiosInstance.get('/admin/stats')
        ]);

        setUsers(usersRes.data);
        setTasks(tasksRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error('Error fetching admin data:', err);
        // Set empty data if endpoints fail
        setUsers([]);
        setTasks([]);
        setStats({});
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /**
   * Verify a user's identity
   * @param {string} id - User ID to verify
   */
  const verifyUser = async (id) => {
    try {
      await axiosInstance.patch(`/admin/users/${id}/verify`);
      // Refresh users list after verification
      const usersRes = await axiosInstance.get('/admin/users');
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Error verifying user:', err);
    }
  };

  /**
   * Deactivate a user account
   * @param {string} id - User ID to deactivate
   */
  const deactivateUser = async (id) => {
    try {
      await axiosInstance.patch(`/admin/users/${id}/deactivate`);
      // Refresh users list after deactivation
      const usersRes = await axiosInstance.get('/admin/users');
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Error deactivating user:', err);
    }
  };

  /**
   * Delete a task (admin override)
   * @param {string} id - Task ID to delete
   */
  const deleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/admin/tasks/${id}`);
      // Refresh tasks list after deletion
      const tasksRes = await axiosInstance.get('/admin/tasks');
      setTasks(tasksRes.data);
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  if (loading) {
    return (
      <>
        <UserNavbar user={null} setUser={() => {}} />
        <div className="container mx-auto p-8">
          <div className="text-center">Loading admin panel...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <UserNavbar user={null} setUser={() => {}} />
      <div className="container mx-auto p-8">
        <h2 className="text-3xl font-bold mb-6">Admin Panel</h2>

        {/* Platform Statistics */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-bold mb-4">Platform Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalUsers || 0}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalTasks || 0}</div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.openTasks || 0}</div>
              <div className="text-sm text-gray-600">Open Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.completionRate || 0}%</div>
              <div className="text-sm text-gray-600">Completion Rate</div>
            </div>
          </div>
        </div>

        {/* Users Management */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-bold mb-4">Users Management</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Role</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} className="border-t">
                    <td className="px-4 py-2">{user.name}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2 capitalize">{user.role}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td className="px-4 py-2 space-x-2">
                      {!user.isVerified && (
                        <button
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                          onClick={() => verifyUser(user._id)}
                        >
                          Verify
                        </button>
                      )}
                      <button
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        onClick={() => deactivateUser(user._id)}
                      >
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tasks Management */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">Tasks Management</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-left">Client</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Price</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task._id} className="border-t">
                    <td className="px-4 py-2">{task.title}</td>
                    <td className="px-4 py-2">{task.client?.name || 'Unknown'}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs capitalize ${
                        task.status === 'open' ? 'bg-green-100 text-green-800' :
                        task.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">KSh {task.price}</td>
                    <td className="px-4 py-2">
                      <button
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        onClick={() => deleteTask(task._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default Admin;
