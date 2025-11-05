const { createClient } = require('@supabase/supabase-js');
const User = require('../models/User');

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://vblmjxagxeangahqjspv.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZibG1qeGFneGVhbmdhaHFqc3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMTM3MDYsImV4cCI6MjA3NzU4OTcwNn0.gKqyz4lOh6FHkc4tJ_5g4C-ZgeCzA0RwG3-HZ2m9aGA'
);

const verifySupabaseUser = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header missing or invalid' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify the JWT with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('Supabase token verification error:', error);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Find the corresponding MongoDB user
    const mongoUser = await User.findOne({ supabaseId: user.id });
    if (!mongoUser) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    req.user = mongoUser;
    next();
  } catch (e) {
    console.error('Authentication middleware error:', e);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin role required.' });
  }
  next();
};

module.exports = { verifySupabaseUser, adminAuth };
