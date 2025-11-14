const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifySupabaseUser = async (req, res, next) => {
  try {
    // Try Authorization header first
    const authHeader = req.header('Authorization');
    let token = null;

    console.log(`verifySupabaseUser: URL=${req.url}, has Authorization header: ${!!authHeader}`);

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
      console.log(`Found token in Authorization header, length: ${token.length}`);
    }

    // Fallback: check cookie header for backendToken (httpOnly cookies cannot be read by JS)
    if (!token) {
      // If cookie parser middleware is present, use req.cookies
      if (req.cookies && req.cookies.backendToken) {
        token = req.cookies.backendToken;
        console.log(`Found token in req.cookies.backendToken`);
      } else if (req.headers && req.headers.cookie) {
        const cookies = req.headers.cookie.split(';').map(c => c.trim());
        const match = cookies.find(c => c.startsWith('backendToken='));
        if (match) {
          token = match.split('=')[1];
          console.log(`Found token in cookie header string`);
        }
      }
    }

    if (!token) {
      console.log(`No token found, returning 401`);
      return res.status(401).json({ error: 'Authorization header or cookie missing or invalid' });
    }

    // Verify the JWT token (issued by our backend)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    console.log(`Token verified successfully, userId: ${decoded.userId}`);

    // Find user in MongoDB
    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log(`User not found in MongoDB for userId: ${decoded.userId}`);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`User found: ${user.email}`);

    // Attach MongoDB user to request
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

const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin role required.' });
  }
  next();
};

module.exports = { verifySupabaseUser, adminAuth };
