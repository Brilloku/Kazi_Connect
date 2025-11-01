const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors({
  origin: ['https://kazi-connect-five.vercel.app', 'http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://kush_man:DOFCKYDCUvSc852U@service23.67pnkel.mongodb.net/Youth_services', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/admin', require('./routes/admin'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  console.log('404 for URL:', req.url);
  res.status(404).json({ error: `Route ${req.url} not found` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Available routes:');
  console.log('- GET    /');
  console.log('- POST   /api/auth/register');
  console.log('- POST   /api/auth/login');
  console.log('- POST   /api/auth/logout');
  console.log('- GET    /api/auth/me');
  console.log('- PUT    /api/auth/me');
  console.log('- POST   /api/auth/resend-verification');
});
