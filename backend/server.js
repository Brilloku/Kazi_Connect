/**
 * Main server file for Kazilink backend API
 * Handles Express server setup, MongoDB connection, CORS configuration,
 * and route mounting for the Kenyan youth services platform
 */

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Connect to MongoDB with fallback to local instance
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kazilink')
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

const cookieParser = require('cookie-parser');

const app = express();

// CORS configuration for cross-origin requests
// Allows requests from production frontend and local development servers
app.use(cors({
  origin: ['https://kazi-link-seven.vercel.app', 'http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true, // Allow cookies and authorization headers
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Parse JSON request bodies
app.use(express.json());

// Parse cookies for authentication
app.use(cookieParser());

// Debug middleware to log all incoming requests for development
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Basic health check route
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Mount API routes
app.use('/api/auth', require('./routes/auth'));        // Authentication routes
app.use('/api/tasks', require('./routes/tasks'));      // Task management routes
app.use('/api/chatsync', require('./routes/chatSync')); // Chat synchronization routes
// app.use('/api/admin', require('./routes/admin'));   // Admin routes (commented out)

// Log available API endpoints for development reference
console.log('Available routes:');
console.log('- GET    /');
console.log('- POST   /api/auth/register');
console.log('- POST   /api/auth/login');
console.log('- POST   /api/auth/logout');
console.log('- GET    /api/auth/verify');
console.log('- GET    /api/auth/me');
console.log('- PUT    /api/auth/me');
console.log('- POST   /api/auth/resend-verification');
console.log('- GET    /api/auth/user/:id (get user by ID)');
console.log('- POST   /api/tasks (create task)');
console.log('- GET    /api/tasks (list tasks)');
console.log('- GET    /api/tasks/:id (get task)');
console.log('- PATCH  /api/tasks/:id (update task)');
console.log('- PATCH  /api/tasks/:id/accept (apply for task)');
console.log('- PATCH  /api/tasks/:id/accept-applicant (accept applicant)');
console.log('- PATCH  /api/tasks/:id/assign/:userId (assign task)');
console.log('- PATCH  /api/tasks/:id/complete (mark complete)');
console.log('- PATCH  /api/tasks/:id/complete-client (mark complete by client)');
console.log('- DELETE /api/tasks/:id (delete task)');

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler for unmatched routes
app.use((req, res) => {
  console.log('404 for URL:', req.url);
  res.status(404).json({ error: `Route ${req.url} not found` });
});

// Start server on specified port or default to 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access at http://localhost:${PORT}`);
  console.log('Available routes:');
  console.log('- GET    /');
});
