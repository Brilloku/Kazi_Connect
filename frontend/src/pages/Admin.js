import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axios';
import UserNavbar from '../components/UserNavbar';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use axiosInstance which will send cookies automatically
        const usersRes = await axiosInstance.get('/admin/users');
        setUsers(usersRes.data);
        const tasksRes = await axiosInstance.get('/admin/tasks');
        setTasks(tasksRes.data);
      } catch (err) {
        console.error('Error fetching admin data:', err);
        // Admin endpoints not yet implemented; show empty lists
        setUsers([]);
        setTasks([]);
      }
    };
    fetchData();
  }, []);

  const verifyUser = async (id) => {
    try {
      await axiosInstance.patch(`/admin/users/${id}/verify`);
      // Refresh users list
      const usersRes = await axiosInstance.get('/admin/users');
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Error verifying user:', err);
    }
  };

  return (
    <>
      <UserNavbar user={null} setUser={() => {}} />
      <div className="container mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
      <h3 className="text-xl font-bold mb-2">Users</h3>
      {users.map(user => (
        <div key={user._id} className="border p-4 mb-2">
          <p>{user.name} - {user.email} - {user.role} - Verified: {user.verified ? 'Yes' : 'No'}</p>
          {!user.verified && <button className="bg-blue-600 text-white p-2" onClick={() => verifyUser(user._id)}>Verify</button>}
        </div>
      ))}
      <h3 className="text-xl font-bold mb-2">Tasks</h3>
      {tasks.map(task => (
        <div key={task._id} className="border p-4 mb-2">
          <p>{task.title} - {task.status}</p>
        </div>
      ))}
    </div>
    </>
  );
};

export default Admin;
