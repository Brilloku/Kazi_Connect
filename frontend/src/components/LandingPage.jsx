import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiSearch, FiTrendingUp, FiShield, FiMapPin, FiCreditCard, FiTarget, FiStar } from 'react-icons/fi';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-blue-600">Kazilink</Link>
          <div className="space-x-6">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">Home</Link>
            <Link to="/about" className="text-gray-700 hover:text-blue-600 transition-colors">About</Link>
            <Link to="/opportunities" className="text-gray-700 hover:text-blue-600 transition-colors">Opportunities</Link>
            <Link to="/login" className="text-gray-700 hover:text-blue-600 transition-colors">Login</Link>
            <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-2xl hover:bg-blue-700 transition-colors">Register</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-4 py-20 flex flex-col md:flex-row items-center"
      >
        <div className="md:w-1/2 mb-10 md:mb-0">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Empowering Kenyan Youth to <span className="text-blue-600">Work, Learn & Grow</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Discover opportunities, connect with employers, and unlock your potential.
          </p>
          <div className="space-x-4">
            <Link to="/register" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg">
              Get Started
            </Link>
            <Link to="/login" className="bg-green-600 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-green-700 transition-all duration-300 shadow-md hover:shadow-lg">
              Browse Tasks
            </Link>
          </div>
        </div>
        <div className="md:w-1/2">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <img src="https://via.placeholder.com/400x300?text=Youth+Growth+Illustration" alt="Youth Growth" className="w-full rounded-2xl" />
          </div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white py-20"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ y: -10 }}
              className="bg-gray-50 p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              <FiUser className="text-4xl text-blue-600 mb-4" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Create a Profile</h3>
              <p className="text-gray-600">Sign up and showcase your skills to stand out to employers.</p>
            </motion.div>
            <motion.div
              whileHover={{ y: -10 }}
              className="bg-gray-50 p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              <FiSearch className="text-4xl text-green-600 mb-4" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Connect & Apply</h3>
              <p className="text-gray-600">Find jobs, gigs, or training opportunities near you.</p>
            </motion.div>
            <motion.div
              whileHover={{ y: -10 }}
              className="bg-gray-50 p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              <FiTrendingUp className="text-4xl text-yellow-600 mb-4" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Work & Earn</h3>
              <p className="text-gray-600">Grow your career and get rewarded for your hard work.</p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="py-20"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Why Choose Kazilink?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              <FiShield className="text-4xl text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Verified Employers</h3>
              <p className="text-gray-600">Connect with trusted companies and individuals.</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              <FiMapPin className="text-4xl text-green-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Local & Remote Jobs</h3>
              <p className="text-gray-600">Find opportunities both near and far.</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              <FiCreditCard className="text-4xl text-yellow-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Secure Payments</h3>
              <p className="text-gray-600">Get paid safely and on time.</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              <FiTarget className="text-4xl text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Skill-Based Matching</h3>
              <p className="text-gray-600">Get matched with tasks that fit your skills.</p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-gray-100 py-20"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">What Our Users Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ y: -10 }}
              className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4">J</div>
                <div>
                  <h4 className="font-semibold text-gray-800">Jane Doe</h4>
                  <div className="flex text-yellow-400">
                    <FiStar /><FiStar /><FiStar /><FiStar /><FiStar />
                  </div>
                </div>
              </div>
              <p className="text-gray-600">"Kazilink helped me find my first job and build my career. Highly recommended!"</p>
            </motion.div>
            <motion.div
              whileHover={{ y: -10 }}
              className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold mr-4">M</div>
                <div>
                  <h4 className="font-semibold text-gray-800">Mike Johnson</h4>
                  <div className="flex text-yellow-400">
                    <FiStar /><FiStar /><FiStar /><FiStar /><FiStar />
                  </div>
                </div>
              </div>
              <p className="text-gray-600">"The platform is easy to use and I got connected with great opportunities quickly."</p>
            </motion.div>
            <motion.div
              whileHover={{ y: -10 }}
              className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold mr-4">S</div>
                <div>
                  <h4 className="font-semibold text-gray-800">Sarah Lee</h4>
                  <div className="flex text-yellow-400">
                    <FiStar /><FiStar /><FiStar /><FiStar /><FiStar />
                  </div>
                </div>
              </div>
              <p className="text-gray-600">"Kazilink opened doors I never knew existed. Thank you for empowering youth!"</p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Call to Action Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-blue-600 py-20"
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-8">Join thousands of young Kenyans making an impact.</h2>
          <Link to="/register" className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-100 transition-all duration-300 shadow-md hover:shadow-lg">
            Sign Up Today
          </Link>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-2xl font-bold text-blue-400">Kazilink</h3>
            </div>
            <div className="flex space-x-6 mb-4 md:mb-0">
              <Link to="/" className="hover:text-blue-400 transition-colors">Home</Link>
              <Link to="/about" className="hover:text-blue-400 transition-colors">About</Link>
              <Link to="/opportunities" className="hover:text-blue-400 transition-colors">Opportunities</Link>
              <Link to="/contact" className="hover:text-blue-400 transition-colors">Contact</Link>
            </div>
            <div className="text-gray-400">
              © 2024 Kazilink. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
