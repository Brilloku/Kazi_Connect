import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../utils/axios';

const Register = () => {
  const navigate = useNavigate();
  
  // Get role from URL parameters
  const params = new URLSearchParams(window.location.search);
  const roleFromUrl = params.get('role');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: roleFromUrl || 'client',
    location: '',
    skills: '',
    phone: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post('/auth/register', {
        ...formData,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : []
      });
      localStorage.setItem('token', res.data.token);
      toast.success('Registration successful! Welcome aboard!');
      navigate('/dashboard'); // Redirect to dashboard after successful registration
    } catch (err) {
      // Error is handled by axios interceptor
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <input type="text" name="name" placeholder="Name" onChange={handleChange} className="w-full p-2 mb-4 border" required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} className="w-full p-2 mb-4 border" required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} className="w-full p-2 mb-4 border" required />
        <select name="role" onChange={handleChange} className="w-full p-2 mb-4 border">
          <option value="client">Client</option>
          <option value="youth">Youth</option>
        </select>
        <input type="text" name="location" placeholder="Location" onChange={handleChange} className="w-full p-2 mb-4 border" />
        {formData.role === 'youth' && (
          <input type="text" name="skills" placeholder="Skills (comma separated)" onChange={handleChange} className="w-full p-2 mb-4 border" />
        )}
        <input type="text" name="phone" placeholder="Phone" onChange={handleChange} className="w-full p-2 mb-4 border" />
        <button type="submit" className="w-full bg-blue-600 text-white p-2">Register</button>
      </form>
    </div>
  );
};

export default Register;
