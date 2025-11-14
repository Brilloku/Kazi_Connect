const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  supabaseMessageId: { type: String, required: true, unique: true },
  taskId: { type: String, required: true },
  senderMongoId: { type: String, required: true },
  message: { type: String, required: true },
  senderName: { type: String },
  senderAvatar: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
