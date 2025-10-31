import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const usersRes = await axios.get('http://kazi-connect.onrender.com/api/admin/users', config);
        setUsers(usersRes.data);
        const tasksRes = await axios.get('http://kazi-connect.onrender.com/api/admin/tasks', config);
        setTasks(tasksRes.data);
      }
    };
    fetchData();
  }, []);

  const verifyUser = async (id) => {
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    await axios.patch(`https://kazi-connect.onrender.com/api/admin/users/${id}/verify`, {}, config);
    window.location.reload();
  };

  return (
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
  );
};

export default Admin;
