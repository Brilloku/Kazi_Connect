/**
 * ChatMessage model for Kazilink
 * Stores chat messages synced from Supabase for persistence and search
 * Links messages to tasks and users for proper context
 */

const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  // Unique identifier from Supabase
  supabaseMessageId: {
    type: String,
    required: true,
    unique: true
  },

  // Associated task ID (string to match Supabase format)
  taskId: {
    type: String,
    required: true
  },

  // MongoDB user ID of the sender
  senderMongoId: {
    type: String,
    required: true
  },

  // Message content
  message: {
    type: String,
    required: true
  },

  // Optional display information
  senderName: {
    type: String,
    trim: true
  },
  senderAvatar: {
    type: String,
    trim: true
  },

  // Timestamp from Supabase or current time
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying by task
ChatMessageSchema.index({ taskId: 1, createdAt: 1 });

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
