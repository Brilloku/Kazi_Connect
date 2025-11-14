import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axios';
import ChatModal from '../components/chat/ChatModal';
import { useAuth } from '../context/AuthContext';
import UserNavbar from '../components/UserNavbar';

const BrowseTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    skills: '',
    location: '',
    priceMin: '',
    priceMax: '',
    sortBy: 'newest'
  });
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTaskId, setChatTaskId] = useState(null);
  const { user: authUser } = useAuth();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await axiosInstance.get('/auth/me');
        setCurrentUser(res.data);
      } catch (e) {
        console.warn('Failed to load backend user for chat:', e?.response?.status || e.message);
      }
    };
    fetchMe();
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axiosInstance.get('/tasks?status=open');
        setTasks(res.data);
        setFilteredTasks(res.data);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setTasks([]);
        setFilteredTasks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = tasks;

    // Search by title or description
    if (searchTerm) {
      result = result.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by skills
    if (filters.skills) {
      const searchSkills = filters.skills.toLowerCase().split(',').map(s => s.trim());
      result = result.filter(task =>
        searchSkills.some(skill =>
          task.skills.some(taskSkill =>
            taskSkill.toLowerCase().includes(skill)
          )
        )
      );
    }

    // Filter by location
    if (filters.location) {
      result = result.filter(task =>
        task.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Filter by price range
    if (filters.priceMin) {
      result = result.filter(task => task.price >= parseFloat(filters.priceMin));
    }
    if (filters.priceMax) {
      result = result.filter(task => task.price <= parseFloat(filters.priceMax));
    }

    // Sort
    if (filters.sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (filters.sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (filters.sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    }

    setFilteredTasks(result);
  }, [searchTerm, filters, tasks]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      skills: '',
      location: '',
      priceMin: '',
      priceMax: '',
      sortBy: 'newest'
    });
  };

  const acceptTask = async (id) => {
    try {
      await axiosInstance.patch(`/tasks/${id}/accept`);
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task._id === id ? { ...task, applicants: [...(task.applicants || []), id] } : task
        )
      );
    } catch (err) {
      console.error('Error accepting task:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <UserNavbar user={currentUser} setUser={setCurrentUser} />
      <div className="container mx-auto p-8">
      <h2 className="text-3xl font-bold mb-8">Browse Tasks</h2>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search tasks by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
            <input
              type="text"
              name="skills"
              placeholder="e.g., plumbing"
              value={filters.skills}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              name="location"
              placeholder="e.g., Nairobi"
              value={filters.location}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (KSh)</label>
            <input
              type="number"
              name="priceMin"
              placeholder="Min"
              value={filters.priceMin}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (KSh)</label>
            <input
              type="number"
              name="priceMax"
              placeholder="Max"
              value={filters.priceMax}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        <button
          onClick={resetFilters}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
        >
          Reset Filters
        </button>
      </div>

      {/* Results Summary */}
      <div className="mb-4 text-gray-600">
        Showing {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
      </div>

      {/* Tasks Grid */}
      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map(task => (
            <div key={task._id} className="bg-white shadow-lg rounded-lg p-6 border hover:shadow-xl transition">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-gray-800">{task.title}</h3>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                  {task.status}
                </span>
              </div>
              
              <p className="text-gray-600 mb-3 line-clamp-2">{task.description}</p>
              
              <div className="space-y-2 mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span>{task.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-bold">KSh {task.price.toLocaleString()}</span>
                </div>
              </div>

              {task.skills.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-600 mb-1">Skills Required:</p>
                  <div className="flex flex-wrap gap-1">
                    {task.skills.map((skill, idx) => (
                      <span key={idx} className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => acceptTask(task._id)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition"
                >
                  Apply for Task
                </button>
                <button
                  onClick={() => { setChatTaskId(task._id); setChatOpen(true); }}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition"
                >
                  Open Chat
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No tasks found matching your criteria</p>
          <button
            onClick={resetFilters}
            className="mt-4 text-blue-600 hover:text-blue-800 underline"
          >
            Clear filters
          </button>
        </div>
      )}
      {chatOpen && (
        <ChatModal
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          taskId={chatTaskId}
          currentUserMongoId={currentUser?.id || currentUser?._id}
          currentUserName={currentUser?.name || authUser?.user_metadata?.name}
          currentUserAvatar={currentUser?.profilePicture}
          currentUser={currentUser}
        />
      )}
    </div>
    </>
  );
};

export default BrowseTasks;
