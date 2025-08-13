const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for testing purposes
 * @param {Object} payload - Token payload
 * @returns {string} JWT token
 */
function generateToken(payload) {
  const secret = process.env.JWT_SECRET || 'test-secret-key';
  return jwt.sign(payload, secret, { expiresIn: '1h' });
}

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
function verifyToken(token) {
  const secret = process.env.JWT_SECRET || 'test-secret-key';
  return jwt.verify(token, secret);
}

/**
 * Decode JWT token without verification (for testing)
 * @param {string} token - JWT token to decode
 * @returns {Object} Decoded token payload
 */
function decodeToken(token) {
  return jwt.decode(token);
}

module.exports = {
  generateToken,
  verifyToken,
  decodeToken
}; 