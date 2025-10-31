import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-8">Welcome to Kenyan Youth Services Platform</h1>
      <p className="text-lg text-center mb-8">Connect with skilled youths for your tasks or offer your services.</p>
      <div className="text-center space-x-4">
        <Link to="/register" className="bg-blue-600 text-white px-6 py-3 rounded">Get Started</Link>
        <Link to="/browse-tasks" className="bg-green-600 text-white px-6 py-3 rounded">Browse Tasks</Link>
      </div>
    </div>
  );
};

export default Home;
