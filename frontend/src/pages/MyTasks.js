import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../utils/axios';
import ChatModal from '../components/chat/ChatModal';
import ApplicantsModal from '../components/ApplicantsModal';
import EditTaskModal from '../components/EditTaskModal';
import UserNavbar from '../components/UserNavbar';

const MyTasks = () => {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTaskId, setChatTaskId] = useState(null);
  const [applicantsModalOpen, setApplicantsModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await axiosInstance.get('/auth/me');
        setUser(userRes.data);

        // Fetch all tasks to filter by client
        const tasksRes = await axiosInstance.get('/tasks');
        setTasks(tasksRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const markTaskComplete = async (id) => {
    try {
      await axiosInstance.patch(`/tasks/${id}/complete-client`);
      const tasksRes = await axiosInstance.get('/tasks');
      setTasks(tasksRes.data);
      toast.success('Task marked as complete!');
    } catch (err) {
      console.error('Complete task error:', err);
      toast.error('Failed to mark task as complete');
    }
  };

  const handleViewApplicants = (taskId) => {
    setSelectedTaskId(taskId);
    setApplicantsModalOpen(true);
  };

  const handleTaskUpdate = async () => {
    try {
      const tasksRes = await axiosInstance.get('/tasks');
      setTasks(tasksRes.data);
    } catch (err) {
      console.error('Error refreshing tasks:', err);
    }
  };

  // Filter tasks to show only those posted by this client
  const myTasks = tasks.filter(t => {
    const clientId = (t.client && (t.client._id || t.client.id || t.client))?.toString?.() || '';
    const currentUserId = (user && (user.id || user._id))?.toString?.() || '';
    return t.client && clientId === currentUserId;
  });

  // Group tasks by status
  const tasksByStatus = {
    open: myTasks.filter(t => t.status === 'open'),
    assigned: myTasks.filter(t => t.status === 'assigned'),
    completed: myTasks.filter(t => t.status === 'completed')
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
        <p className="text-red-600">Please log in to view your tasks.</p>
      </div>
    );
  }

  if (user.role !== 'client') {
    return (
      <div className="container mx-auto p-8 text-center">
        <p className="text-red-600">This page is only accessible to clients.</p>
      </div>
    );
  }

  return (
    <>
      <UserNavbar user={user} setUser={setUser} />
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Posted Tasks</h1>
          <Link
            to="/post-task"
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition duration-300"
          >
            <span className="text-xl">⊕</span> Post a New Task
          </Link>
        </div>

        {/* Task Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Open Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{tasksByStatus.open.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{tasksByStatus.assigned.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{tasksByStatus.completed.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks by Status */}
        {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
          <div key={status} className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700 capitalize">
              {status === 'assigned' ? 'In Progress' : status} Tasks ({statusTasks.length})
            </h2>

            {statusTasks.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {statusTasks.map(task => (
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
                      {task.assignedTo && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>Assigned to: {task.assignedTo.name || 'Youth'}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2">
                      {task.status === 'open' && (
                        <>
                          <button
                            onClick={() => { setSelectedTask(task); setEditModalOpen(true); }}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-300"
                          >
                            Edit Task
                          </button>
                          <button
                            onClick={() => handleViewApplicants(task._id)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                          >
                            View Applicants ({task.applicants?.length || 0})
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => { setChatTaskId(task._id); setChatOpen(true); }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
                      >
                        Open Chat
                      </button>
                      {task.status === 'assigned' && (
                        <button
                          onClick={() => markTaskComplete(task._id)}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300 flex items-center gap-2"
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
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-500">No {status} tasks</p>
              </div>
            )}
          </div>
        ))}

        {chatOpen && (
          <ChatModal
            open={chatOpen}
            onClose={() => setChatOpen(false)}
            taskId={chatTaskId}
            currentUserMongoId={user?.id || user?._id}
            currentUserName={user?.name}
            currentUserAvatar={user?.profilePicture}
            currentUser={user}
          />
        )}

        {applicantsModalOpen && (
          <ApplicantsModal
            open={applicantsModalOpen}
            onClose={() => setApplicantsModalOpen(false)}
            taskId={selectedTaskId}
            onTaskUpdate={handleTaskUpdate}
          />
        )}

        {editModalOpen && (
          <EditTaskModal
            open={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            task={selectedTask}
            onTaskUpdate={handleTaskUpdate}
          />
        )}
      </div>
    </>
  );
};

export default MyTasks;
