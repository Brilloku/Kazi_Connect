const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const { verifySupabaseUser } = require('../middleware/verifySupabaseUser');
const User = require('../models/User');

const router = express.Router();

// Initialize Supabase client (for email verification only)
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://vblmjxagxeangahqjspv.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZibG1qeGFneGVhbmdhaHFqc3B2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjAxMzcwNiwiZXhwIjoyMDc3NTg5NzA2fQ.r4Xb5i2FpCLPe_NHWBltxVEZ6xU8ogkjbEarb8Vfrkg'
);

// Register with MongoDB + Supabase email verification
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'client' } = req.body;
    console.log(`Register attempt for email: ${email}`);

    // Create Supabase account for email verification (don't create MongoDB user yet)
    const { data: supabaseData, error: supabaseError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          password // Store password in metadata for backend retrieval after verification
        }
      }
    });

    if (supabaseError) {
      console.log(`Supabase signup error: ${supabaseError.message}`);
      return res.status(400).json({ error: supabaseError.message });
    }

    console.log(`Supabase user created: ${email}, awaiting email verification`);

    res.status(201).json({
      message: 'User registered successfully. Please check your email for verification.',
      user: {
        id: supabaseData.user.id,
        email: supabaseData.user.email
      }
    });
  } catch (e) {
    console.error('Registration error:', e);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login with MongoDB
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Login attempt for email: ${email}`);

    // Find user in MongoDB
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User not found in MongoDB: ${email}`);
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    console.log(`User found in MongoDB: ${email}, isEmailVerified: ${user.isEmailVerified}`);

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`Password mismatch for user: ${email}`);
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    // Set secure HTTP-only cookie for token
    res.cookie('backendToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      // Use 'lax' in development so cookies are sent on top-level navigations from other origins (localhost:3000 -> localhost:5000)
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    console.log(`Login successful for user: ${email}, token generated`);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        skills: user.skills,
        phone: user.phone,
        isEmailVerified: user.isEmailVerified
      },
      token
    });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Create or update profile when Supabase verification completes
router.post('/createProfile', async (req, res) => {
  try {
    const { supabase_id, email, name, role = 'client', location, skills, phone, password } = req.body;
    console.log(`createProfile called for email: ${email}, has password: ${!!password}`);

    if (!email || !supabase_id) {
      console.log(`Missing required fields: email=${email}, supabase_id=${supabase_id}`);
      return res.status(400).json({ error: 'supabase_id and email are required' });
    }

    let hashedPassword = null;
    if (password) {
      // Use password provided during registration
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
      console.log(`Using provided password for: ${email}`);
    }

    // Use findOneAndUpdate with upsert to handle duplicate calls safely
    // Build separate $set and $setOnInsert objects to avoid setting the same
    // path in both (which causes ConflictingUpdateOperators errors).
    const setFields = {
      supabaseId: supabase_id,
      isEmailVerified: true
    };

    if (name) setFields.name = name;
    if (location) setFields.location = location;
    if (skills) setFields.skills = skills;
    if (phone) setFields.phone = phone;
    if (hashedPassword) setFields.password = hashedPassword;

    // Fields that should only be set when creating a new document
    const setOnInsert = { email, role };
    if (!name) setOnInsert.name = 'New User';
    if (!hashedPassword) setOnInsert.password = Math.random().toString(36).slice(-12);

    const user = await User.findOneAndUpdate(
      { email },
      {
        $set: setFields,
        $setOnInsert: setOnInsert
      },
      {
        upsert: true, // Create if doesn't exist
        new: true, // Return the updated document
        runValidators: true
      }
    );

    console.log(`User profile upserted: ${email}, isEmailVerified: true`);

    // Generate JWT token and set HTTP-only cookie
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' });
    res.cookie('backendToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    console.log(`Token generated for user: ${email}`);

    res.json({ user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location,
      skills: user.skills,
      phone: user.phone,
      isEmailVerified: user.isEmailVerified
    }, token });
  } catch (e) {
    console.error('createProfile error:', e);
    res.status(500).json({ error: 'Failed to create or update profile' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    // Clear the backendToken cookie
    // Clear cookie by setting an expired cookie on the same path
    res.cookie('backendToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      expires: new Date(0),
      path: '/'
    });

    // Also instruct client to clear cookie explicitly
    res.clearCookie('backendToken', { path: '/' });

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log(`Supabase logout note: ${error.message}`);
    }

    console.log('Logout successful, cookie cleared');
    res.json({ message: 'Logged out successfully' });
  } catch (e) {
    console.error('Logout error:', e);
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
    // User data is already attached by middleware
    console.log(`GET /auth/me - User: ${req.user?.email}, has user data: ${!!req.user}`);
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      location: req.user.location,
      skills: req.user.skills,
      phone: req.user.phone,
      isEmailVerified: req.user.isEmailVerified
    });
  } catch (e) {
    console.error('Error in GET /auth/me:', e);
    res.status(500).json({ error: 'Failed to get user profile' });
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

    // Update user in MongoDB
    const user = await User.findByIdAndUpdate(
      req.user.id,
      filteredUpdates,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location,
      skills: user.skills,
      phone: user.phone,
      isEmailVerified: user.isEmailVerified
    });
  } catch (e) {
    console.error('Profile update error:', e);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
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

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists in MongoDB
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Send reset email via Supabase
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password`
    });

    if (error) {
      console.error('Supabase reset password error:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Password reset email sent successfully' });
  } catch (e) {
    console.error('Forgot password error:', e);
    res.status(500).json({ error: 'Failed to send reset email' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    // Find user in MongoDB
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Verify token with Supabase
    const { data: supabaseData, error: supabaseError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'recovery'
    });

    if (supabaseError) {
      console.error('Supabase verify OTP error:', supabaseError);
      return res.status(400).json({ error: supabaseError.message });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password in MongoDB
    user.password = hashedPassword;
    await user.save();

    // Update password in Supabase using admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.supabaseId, {
      password: newPassword
    });

    if (updateError) {
      console.error('Supabase update password error:', updateError);
      // Don't fail the request if Supabase update fails, as MongoDB is updated
    }

    res.json({ message: 'Password reset successfully' });
  } catch (e) {
    console.error('Reset password error:', e);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Get user by ID (for applicants modal)
router.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name email profilePicture skills location phone');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      skills: user.skills,
      location: user.location,
      phone: user.phone
    });
  } catch (err) {
    console.error('Error fetching user by ID:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

module.exports = router;

