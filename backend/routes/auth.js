const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const User = require('../models/User');
const { verifySupabaseUser } = require('../middleware/verifySupabaseUser');

const router = express.Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://vblmjxagxeangahqjspv.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZibG1qeGFneGVhbmdhaHFqc3B2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjAxMzcwNiwiZXhwIjoyMDc3NTg5NzA2fQ.r4Xb5i2FpCLPe_NHWBltxVEZ6xU8ogkjbEarb8Vfrkg'
);

// This endpoint is no longer used - registration is handled directly in frontend with Supabase
router.post('/register', async (req, res) => {
  return res.status(410).json({ error: 'This endpoint is deprecated. Use frontend registration.' });
});

// Login with Supabase
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Get or create user in MongoDB
    let user = await User.findOne({ supabaseId: data.user.id });

    if (!user) {
      // Create user record if it doesn't exist
      user = new User({
        supabaseId: data.user.id,
        name: data.user.user_metadata?.name || data.user.email.split('@')[0],
        email: data.user.email,
        role: data.user.user_metadata?.role || 'client',
        location: data.user.user_metadata?.location || '',
        skills: data.user.user_metadata?.skills || [],
        phone: data.user.user_metadata?.phone || ''
      });
      await user.save();
      console.log('Created new MongoDB user:', user._id);
    } else {
      console.log('Found existing MongoDB user:', user._id);
    }

    res.json({
      user: {
        id: user._id,
        supabaseId: user.supabaseId,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        skills: user.skills,
        phone: user.phone
      },
      session: data.session
    });
  } catch (e) {
    console.error('Login error:', e);
    res.status(400).json({ error: e.message || 'Login failed' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.json({ message: 'Logged out successfully' });
  } catch (e) {
    res.status(400).json({ error: 'Logout failed' });
  }
});

// Verify email status
router.get('/verify', verifySupabaseUser, async (req, res) => {
  try {
    // Get user from Supabase to check verification status
    const { data: { user }, error } = await supabase.auth.getUser(req.header('Authorization').replace('Bearer ', ''));

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      verified: !!user.email_confirmed_at,
      email: user.email,
      confirmed_at: user.email_confirmed_at
    });
  } catch (e) {
    console.error('Verify email error:', e);
    res.status(400).json({ error: 'Failed to verify email status' });
  }
});

// Get profile (protected route)
router.get('/me', verifySupabaseUser, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (e) {
    res.status(400).json({ error: 'Failed to get user profile' });
  }
});

// Update profile
router.put('/me', verifySupabaseUser, async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = ['name', 'location', 'skills', 'phone'];

    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    const user = await User.findOneAndUpdate(
      { _id: req.user._id },
      filteredUpdates,
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (e) {
    res.status(400).json({ error: 'Failed to update profile' });
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // For Supabase, we need to resend the confirmation email
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email
    });

    if (error) {
      console.error('Supabase resend error:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Verification email sent successfully' });
  } catch (e) {
    console.error('Resend verification error:', e);
    res.status(400).json({ error: 'Failed to resend verification email' });
  }
});

// Create user profile in MongoDB after email verification
router.post('/createProfile', async (req, res) => {
  try {
    const { supabase_id, email, name, role, location, skills, phone } = req.body;

    // Check if user already exists in MongoDB
    const existingUser = await User.findOne({ supabaseId: supabase_id });
    if (existingUser) {
      return res.status(400).json({ error: 'Profile already exists' });
    }

    // Create user profile in MongoDB
    const user = new User({
      supabaseId: supabase_id,
      name,
      email,
      role,
      location,
      skills: Array.isArray(skills) ? skills : (typeof skills === 'string' ? skills.split(',').map(s => s.trim()) : []),
      phone,
      emailVerified: true
    });

    await user.save();
    res.status(201).json({ message: 'Profile created successfully!', user: { id: user._id, name, email, role } });
  } catch (e) {
    console.error('Create profile error:', e);
    res.status(400).json({ error: e.message || 'Failed to create profile' });
  }
});

// Supabase verify endpoint for callback (deprecated, use createProfile)
router.post('/supabase-verify', async (req, res) => {
  try {
    const { email, supabaseId } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      user.emailVerified = true;
      user.supabaseId = supabaseId;
      await user.save();
      return res.status(200).json({ message: 'User verified and updated' });
    }

    res.status(404).json({ message: 'User not found' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
