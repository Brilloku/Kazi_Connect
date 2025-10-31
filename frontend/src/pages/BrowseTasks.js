import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BrowseTasks = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get('http://localhost:5000/api/tasks', config);
        setTasks(res.data);
      }
    };
    fetchTasks();
  }, []);

  const acceptTask = async (id) => {
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    await axios.patch(`http://localhost:5000/api/tasks/${id}/accept`, {}, config);
    window.location.reload();
  };

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">Browse Tasks</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.filter(t => t.status === 'open').map(task => (
          <div key={task._id} className="bg-white shadow-lg rounded-lg p-6 border">
            <h3 className="text-xl font-bold mb-2">{task.title}</h3>
            <p className="text-gray-700 mb-2">{task.description}</p>
            <p className="text-sm text-gray-500 mb-1"><strong>Location:</strong> {task.location}</p>
            <p className="text-sm text-gray-500 mb-1"><strong>Price:</strong> KSh {task.price}</p>
            <p className="text-sm text-gray-500 mb-4"><strong>Skills:</strong> {task.skills.join(', ')}</p>
            <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onClick={() => acceptTask(task._id)}>Accept Task</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrowseTasks;
