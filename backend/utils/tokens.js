const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Generate access token (short-lived, stored in memory/local storage)
 */
const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m' }
  );
};

/**
 * Generate refresh token (long-lived, stored in httpOnly cookie)
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d' }
  );
};

/**
 * Hash a refresh token for storage in database
 * Using HMAC-SHA256 for fast, secure hashing
 */
const hashToken = (token) => {
  return crypto
    .createHmac('sha256', process.env.JWT_REFRESH_SECRET)
    .update(token)
    .digest('hex');
};

/**
 * Verify access token
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Get token expiration timestamp
 */
const getRefreshTokenExpiry = () => {
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';
  
  // Parse duration string (e.g., "30d", "7d", "24h")
  const match = expiresIn.match(/^(\d+)([dhms])$/);
  if (!match) {
    throw new Error('Invalid REFRESH_TOKEN_EXPIRES_IN format');
  }
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  const now = new Date();
  
  switch (unit) {
    case 'd': // days
      return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
    case 'h': // hours
      return new Date(now.getTime() + value * 60 * 60 * 1000);
    case 'm': // minutes
      return new Date(now.getTime() + value * 60 * 1000);
    case 's': // seconds
      return new Date(now.getTime() + value * 1000);
    default:
      throw new Error('Invalid time unit');
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  verifyAccessToken,
  verifyRefreshToken,
  getRefreshTokenExpiry
};
