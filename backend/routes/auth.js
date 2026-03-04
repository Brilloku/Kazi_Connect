/**
 * Authentication routes for Kazilink
 * Handles user registration, login, email verification, and profile management
 * Uses hybrid approach: Supabase for email verification, MongoDB for user data
 */

const { createClient } = require('@supabase/supabase-js');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { verifySupabaseUser } = require('../middleware/verifySupabaseUser');
const User = require('../models/User');
const PendingUser = require('../models/PendingUser');

const router = express.Router();

// Rate limiter for authentication routes:
// 10 requests per 15 minutes per IP to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Too many authentication attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware to handle validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation schemas
const registerValidation = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').isEmail().withMessage('Invalid email format').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
  body('role').isIn(['client', 'youth']).withMessage('Invalid role selected')
];

const loginValidation = [
  body('email').isEmail().withMessage('Invalid email format').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

// Initialize Supabase client for email verification only
// Uses service role key for admin operations like password updates
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * POST /api/auth/register
 * Register new user with Supabase email verification
 * Creates Supabase account first, then MongoDB profile after email verification
 */
router.post('/register', authLimiter, registerValidation, validate, async (req, res) => {
  try {
    const { name, email, password, role = 'client', location, skills, phone } = req.body;

    // Check if user already exists in User collection
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash the password for local storage (higher security factor than the previous metadata approach)
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Upsert into PendingUser (overwrite if they resubmit)
    await PendingUser.findOneAndUpdate(
      { email },
      { name, email, password: hashedPassword, role, location, skills, phone },
      { upsert: true, new: true }
    );

    console.log(`Stored pending registration for: ${email}`);

    // Create Supabase account for email verification (WITHOUT the password in metadata)
    const { data: supabaseData, error: supabaseError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role }
      }
    });

    if (supabaseError) {
      console.log(`Supabase signup error: ${supabaseError.message}`);
      // Clean up the pending user record if Supabase tells us it definitely failed 
      // (though it often succeeds even if it sends an error for things like 'user already exists' for security reasons)
      return res.status(400).json({ error: supabaseError.message });
    }

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
router.post('/login', authLimiter, loginValidation, validate, async (req, res) => {
  try {
    const { email, password } = req.body;


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
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set httpOnly cookie with the token
    res.cookie('backendToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
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

    const { user } = data;

    // Look up data in our secure PendingUser collection
    const pendingData = await PendingUser.findOne({ email: user.email });
    if (!pendingData) {
      // Data might have expired or user clicked twice
      const existingUser = await User.findOne({ email: user.email });
      if (existingUser) {
        return res.json({ message: 'Email verified successfully. You can now log in.' });
      }
      return res.status(404).json({ error: 'Verification metadata expired. Please sign up again.' });
    }

    // Transfer record to User collection
    const newUser = new User({
      name: pendingData.name,
      email: pendingData.email,
      password: pendingData.password, // This is already hashed
      role: pendingData.role,
      location: pendingData.location,
      skills: pendingData.skills,
      phone: pendingData.phone,
      isEmailVerified: true,
      supabaseId: user.id
    });

    await newUser.save();
    console.log(`MongoDB user created from pending: ${user.email}`);

    // Cleanup the pending record
    await PendingUser.deleteOne({ _id: pendingData._id });

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

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    // Check if already verified in MongoDB (if user exists there)
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isEmailVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    const pendingUser = await PendingUser.findOne({ email });
    if (!pendingUser) {
      return res.status(404).json({ error: 'User registration data not found or expired. Please register again.' });
    }

    // Resend via Supabase — user may not yet exist in MongoDB (pending verification)
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
router.get('/user/:id', verifySupabaseUser, async (req, res) => {
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
