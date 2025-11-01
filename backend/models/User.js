const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  supabaseId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['client', 'youth', 'admin'], required: true },
  location: { type: String },
  skills: [{ type: String }], // For youths
  phone: { type: String },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
