/**
 * Authentication routes for Kazilink
 * Handles user registration, login, email verification, and profile management
 * Uses hybrid approach: Supabase for email verification, MongoDB for user data
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const { verifySupabaseUser } = require('../middleware/verifySupabaseUser');
const User = require('../models/User');

const router = express.Router();

// Initialize Supabase client for email verification only
// Uses service role key for admin operations like password updates
const supabase = createClient(
  process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SUPABASE_SERVICE_ROLE_KEY'
);

/**
 * POST /api/auth/register
 * Register new user with Supabase email verification
 * Creates Supabase account first, then MongoDB profile after email verification
 */
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

/**
 * POST /api/auth/login
 * Authenticate user with MongoDB credentials
 * Returns JWT token for session management
 */
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

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(400).json({ error: 'Please verify your email before logging in' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    // Set httpOnly cookie with the token
    res.cookie('backendToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        skills: user.skills,
        phone: user.phone,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * POST /api/auth/logout
 * Logout user by clearing authentication cookie
 */
router.post('/logout', (req, res) => {
  res.clearCookie('backendToken');
  res.json({ message: 'Logged out successfully' });
});

/**
 * GET /api/auth/verify
 * Verify email using token from Supabase email link
 */
router.get('/verify', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ error: 'Verification token required' });
    }

    // Verify token with Supabase
    const { data, error } = await supabase.auth.verifyOtp({
      token,
      type: 'signup'
    });

    if (error) {
      console.error('Supabase verify error:', error);
      return res.status(400).json({ error: error.message });
    }

    // Create MongoDB user profile after successful verification
    const user = data.user;
    const userData = user.user_metadata;

    // Hash the password from metadata
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Create MongoDB user
    const newUser = new User({
      name: userData.name,
      email: user.email,
      password: hashedPassword,
      role: userData.role || 'client',
      location: userData.location,
      skills: userData.skills || [],
      phone: userData.phone,
      isEmailVerified: true,
      supabaseId: user.id
    });

    await newUser.save();
    console.log(`MongoDB user created: ${user.email}`);

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (e) {
    console.error('Verification error:', e);
    res.status(500).json({ error: 'Verification failed' });
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user's profile
 * Requires valid JWT token
 */
router.get('/me', verifySupabaseUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
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
      bio: user.bio,
      profilePicture: user.profilePicture,
      isEmailVerified: user.isEmailVerified,
      rating: user.rating,
      completedTasks: user.completedTasks,
      createdAt: user.createdAt
    });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

/**
 * PUT /api/auth/me
 * Update current user's profile
 */
router.put('/me', verifySupabaseUser, async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = ['name', 'location', 'skills', 'phone', 'bio'];

    // Filter out disallowed fields
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        if (key === 'skills' && typeof updates[key] === 'string') {
          filteredUpdates[key] = updates[key].split(',').map(s => s.trim());
        } else {
          filteredUpdates[key] = updates[key];
        }
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      filteredUpdates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Error updating user profile:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * POST /api/auth/resend-verification
 * Resend email verification link
 */
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    // Find user in MongoDB
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Resend verification email via Supabase
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
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
});

/**
 * POST /api/auth/forgot-password
 * Send password reset email
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Find user in MongoDB
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Send password reset email via Supabase
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

/**
 * POST /api/auth/reset-password
 * Reset password using token from email
 */
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

/**
 * GET /api/auth/user/:id
 * Get user by ID (for applicants modal)
 * Returns limited user information for task applications
 */
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
