import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../utils/axios';
import UserNavbar from '../components/UserNavbar';

const PostTask = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    skills: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axiosInstance.post('/tasks', {
        ...formData,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : []
      });
      toast.success('Task posted successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Task post error:', err);
      // Handle express-validator errors
      if (err.response?.data?.errors) {
        err.response.data.errors.forEach(e => toast.error(e.msg || e.error));
      } else {
        toast.error(err.response?.data?.error || 'Failed to post task');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <UserNavbar />
      <div className="container mx-auto p-8">
        <h2 className="text-2xl font-bold mb-4">Post a Task</h2>
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white shadow-lg rounded-lg p-6 border">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">Title</label>
            <input type="text" name="title" placeholder="Task Title" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">Description</label>
            <textarea name="description" placeholder="Task Description" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows="4" required />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">Price (KSh)</label>
            <input type="number" name="price" placeholder="Price in Kenyan Shillings" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">Location</label>
            <input type="text" name="location" placeholder="Task Location" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="skills">Required Skills</label>
            <input type="text" name="skills" placeholder="Skills (comma separated, e.g., plumbing, electrical)" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-blue-400"
          >
            {isSubmitting ? 'Posting...' : 'Post Task'}
          </button>
        </form>
      </div>
    </>
  );
};

export default PostTask;
