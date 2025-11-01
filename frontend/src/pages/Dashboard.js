import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../utils/axios';
import ShareInvite from '../components/ShareInvite';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, tasksRes] = await Promise.all([
          axiosInstance.get('/auth/me'),
          axiosInstance.get('/tasks')
        ]);
        setUser(userRes.data);
        setTasks(tasksRes.data);
      } catch (err) {
        // Error handling is now done by axios interceptor
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    
    fetchData();
  }, []);

  const acceptTask = async (id) => {
    try {
      await axiosInstance.patch(`/tasks/${id}/accept`);
      const tasksRes = await axiosInstance.get('/tasks');
      setTasks(tasksRes.data);
      toast.success('Task accepted successfully!');
    } catch (err) {
      // Error toast is handled by axios interceptor
      console.error('Accept task error:', err);
    }
  };

  const markTaskComplete = async (id) => {
    try {
      await axiosInstance.patch(`/tasks/${id}/complete`);
      const tasksRes = await axiosInstance.get('/tasks');
      setTasks(tasksRes.data);
      toast.success('Task marked as complete!');
    } catch (err) {
      // Error toast is handled by axios interceptor
      console.error('Complete task error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-8 text-center">
        <p className="text-red-600">Please log in to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          {user.role === 'client' ? 'My Posted Tasks' : 'Available Tasks'}
        </h1>
        {user.role === 'client' && (
          <Link 
            to="/post-task" 
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition duration-300"
          >
            <span className="text-xl">⊕</span> Post a New Task
          </Link>
        )}
      </div>
      
      {/* Share Invite Section */}
      <div className="mb-8">
        <ShareInvite userRole={user.role} />
      </div>

      {user.role === 'client' && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Active Tasks</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tasks.filter(t => t.client && t.client._id === user._id).map(task => (
              <div key={task._id} className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">{task.title}</h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    task.status === 'open' ? 'bg-blue-100 text-blue-800' :
                    task.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.status.toUpperCase()}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2 text-gray-600">
                    <svg className="w-5 h-5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{task.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span>{task.skills.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium text-gray-800">KSh {task.price.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Posted {new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex justify-end">
                  {task.status === 'open' && (
                    <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-300">
                      View Applicants
                    </button>
                  )}
                  {task.status === 'assigned' && (
                    <button 
                      onClick={() => markTaskComplete(task._id)}
                      className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition duration-300 flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Mark as Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {user.role === 'youth' && (
        <div>
          <h3 className="text-xl font-bold mb-2">Available Tasks</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.filter(t => t.status === 'open').map(task => (
              <div key={task._id} className="bg-white shadow-lg rounded-lg p-6 border">
                <h4 className="text-xl font-bold mb-2">{task.title}</h4>
                <p className="text-gray-700 mb-2">{task.description}</p>
                <p className="text-sm text-gray-500 mb-1"><strong>Location:</strong> {task.location}</p>
                <p className="text-sm text-gray-500 mb-1"><strong>Price:</strong> KSh {task.price}</p>
                <p className="text-sm text-gray-500 mb-4"><strong>Skills:</strong> {task.skills.join(', ')}</p>
                <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onClick={() => acceptTask(task._id)}>Accept Task</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
