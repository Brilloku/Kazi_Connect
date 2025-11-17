/**
 * Email service utilities for Kazilink
 * Provides helper functions for email verification and password reset
 */

const crypto = require('crypto');

/**
 * Generate a secure random token for email verification
 * Uses cryptographically secure random bytes
 * @returns {string} Hex-encoded token
 */
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = {
  generateVerificationToken,
};
