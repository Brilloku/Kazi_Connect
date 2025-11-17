/**
 * User model for Kazilink
 * Defines the MongoDB schema for user profiles
 * Supports both clients and youth users with role-based access
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Basic user information
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },

  // User role for access control
  role: {
    type: String,
    enum: ['client', 'youth', 'admin'],
    default: 'client'
  },

  // Location for task matching
  location: {
    type: String,
    trim: true
  },

  // Skills array for youth profiles (used for task matching)
  skills: [{
    type: String,
    trim: true
  }],

  // Contact information
  phone: {
    type: String,
    trim: true
  },

  // Email verification status
  isEmailVerified: {
    type: Boolean,
    default: false
  },

  // Link to Supabase auth user
  supabaseId: {
    type: String,
    sparse: true // Allows null values but ensures uniqueness when present
  },

  // Profile customization
  profilePicture: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500
  },

  // Reputation system
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  completedTasks: {
    type: Number,
    default: 0
  },

  // Account status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Database indexes for query optimization
userSchema.index({ role: 1 });      // For role-based queries
userSchema.index({ isActive: 1 });  // For active user filtering

module.exports = mongoose.model('User', userSchema);
