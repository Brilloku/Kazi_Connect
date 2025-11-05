const { createClient } = require('@supabase/supabase-js');
const User = require('../models/User');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
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
      console.error('Supabase JWT verification error:', error);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Check if user is email verified
    if (!user.email_confirmed_at) {
      return res.status(403).json({ error: 'Email not verified' });
    }

    // Get user from MongoDB
    const mongoUser = await User.findOne({ supabaseId: user.id });
    if (!mongoUser) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    // Attach user to request
    req.user = mongoUser;
    req.supabaseUser = user;

    next();
  } catch (e) {
    console.error('Supabase user verification error:', e);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = verifySupabaseUser;
