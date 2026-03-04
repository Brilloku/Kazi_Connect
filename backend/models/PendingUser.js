const mongoose = require('mongoose');

const pendingUserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['client', 'youth', 'admin'],
        default: 'client'
    },
    location: String,
    skills: [String],
    phone: String,
    // Automatically delete the record after 24 hours (86400 seconds)
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400
    }
});

module.exports = mongoose.model('PendingUser', pendingUserSchema);
