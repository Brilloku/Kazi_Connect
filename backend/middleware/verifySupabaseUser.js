/**
 * Authentication middleware for Kazilink
 * Verifies JWT tokens and attaches user information to requests
 * Supports both Authorization headers and httpOnly cookies
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to verify Supabase user authentication
 * Checks for JWT token in Authorization header or httpOnly cookie
 * Attaches authenticated user data to req.user
 */
const verifySupabaseUser = async (req, res, next) => {
  try {
    // Try Authorization header first (Bearer token)
    const authHeader = req.header('Authorization');
    let token = null;

    console.log(`verifySupabaseUser: URL=${req.url}, has Authorization header: ${!!authHeader}`);

    // Extract token from Authorization header
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
      console.log(`Found token in Authorization header, length: ${token.length}`);
    }

    // Fallback: check httpOnly cookie for backendToken
    // Cookies are more secure as they're not accessible via JavaScript
    if (!token) {
      if (req.cookies && req.cookies.backendToken) {
        token = req.cookies.backendToken;
        console.log(`Found token in req.cookies.backendToken`);
      } else if (req.headers && req.headers.cookie) {
        // Parse cookie header string if middleware isn't available
        const cookies = req.headers.cookie.split(';').map(c => c.trim());
        const match = cookies.find(c => c.startsWith('backendToken='));
        if (match) {
          token = match.split('=')[1];
          console.log(`Found token in cookie header string`);
        }
      }
    }

    // Return 401 if no token found
    if (!token) {
      console.log(`No token found, returning 401`);
      return res.status(401).json({ error: 'Authorization header or cookie missing or invalid' });
    }

    // Verify JWT token using secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    console.log(`Token verified successfully, userId: ${decoded.userId}`);

    // Fetch user from MongoDB to ensure they still exist
    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log(`User not found in MongoDB for userId: ${decoded.userId}`);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`User found: ${user.email}`);

    // Attach user data to request object (without sensitive fields)
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location,
      skills: user.skills,
      phone: user.phone,
      isEmailVerified: user.isEmailVerified,
      supabaseId: user.supabaseId
    };

    next();
  } catch (e) {
    console.error('Authentication middleware error:', e.message);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Admin authorization middleware
 * Requires user to have admin role
 */
const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin role required.' });
  }
  next();
};

module.exports = { verifySupabaseUser, adminAuth };
