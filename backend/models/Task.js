/**
 * Task model for Kazilink
 * Defines the MongoDB schema for task postings
 * Manages the complete lifecycle from creation to completion
 */

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  // Task basic information
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },

  // Financial details
  price: {
    type: Number,
    required: true,
    min: 0
  },

  // Location for task matching
  location: {
    type: String,
    required: true,
    trim: true
  },

  // Required skills for the task
  skills: [{
    type: String,
    trim: true
  }],

  // Task status lifecycle
  status: {
    type: String,
    enum: ['open', 'assigned', 'completed'],
    default: 'open'
  },

  // Relationships
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // Array of users who applied for this task
  applicants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  }
});

// Update the updatedAt field before saving
taskSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Task', taskSchema);
