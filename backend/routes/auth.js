const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const User = require('../models/userModel');
const RefreshToken = require('../models/RefreshToken');
const {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  verifyRefreshToken,
  getRefreshTokenExpiry
} = require('../utils/tokens');

// ============================================
// RATE LIMITING FOR AUTH ENDPOINTS
// ============================================

const authLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) || 10,
  message: 'Too many authentication attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// VALIDATION RULES
// ============================================

const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Username can only contain letters, numbers, underscores, and hyphens')
    .toLowerCase(),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail()
    .toLowerCase(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail()
    .toLowerCase(),
  body('password')
    .notEmpty().withMessage('Password is required')
];

// ============================================
// HELPER: Set refresh token cookie
// ============================================

const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/api/auth/refresh' // Only sent to refresh endpoint
  });
};

// ============================================
// HELPER: Clear refresh token cookie
// ============================================

const clearRefreshTokenCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/api/auth/refresh'
  });
};

// ============================================
// ROUTE: Register
// POST /api/auth/register
// ============================================

router.post('/register', authLimiter, registerValidation, async (req, res) => {
  try {
    // Validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, username, email, password } = req.body;

    // Check if email already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Check if username already exists
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken'
      });
    }

    // Hash password with bcrypt (cost factor 12)
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await User.create({
      name,
      username,
      email,
      password: hashedPassword
    });

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store hashed refresh token in database
    await RefreshToken.create({
      userId: user._id,
      tokenHash: hashToken(refreshToken),
      expiresAt: getRefreshTokenExpiry(),
      userAgent: req.headers['user-agent'] || '',
      ipAddress: req.ip || req.connection.remoteAddress
    });

    // Set refresh token cookie
    setRefreshTokenCookie(res, refreshToken);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
});

// ============================================
// ROUTE: Login
// POST /api/auth/login
// ============================================

router.post('/login', authLimiter, loginValidation, async (req, res) => {
  try {
    // Validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store hashed refresh token in database
    await RefreshToken.create({
      userId: user._id,
      tokenHash: hashToken(refreshToken),
      expiresAt: getRefreshTokenExpiry(),
      userAgent: req.headers['user-agent'] || '',
      ipAddress: req.ip || req.connection.remoteAddress
    });

    // Set refresh token cookie
    setRefreshTokenCookie(res, refreshToken);

    return res.json({
      success: true,
      message: 'Login successful',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
});

// ============================================
// ROUTE: Refresh Access Token
// POST /api/auth/refresh
// ============================================

router.post('/refresh', async (req, res) => {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not found'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    // Check if refresh token exists in database
    const tokenHash = hashToken(refreshToken);
    const storedToken = await RefreshToken.findOne({ tokenHash });

    if (!storedToken) {
      // REUSE DETECTION: Token not in DB means it was already used or revoked
      // Revoke ALL tokens for this user (security measure)
      await RefreshToken.deleteMany({ userId: decoded.userId });
      clearRefreshTokenCookie(res);
      
      return res.status(401).json({
        success: false,
        message: 'Refresh token reuse detected. All sessions revoked for security.'
      });
    }

    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      await RefreshToken.deleteOne({ _id: storedToken._id });
      clearRefreshTokenCookie(res);
      
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired'
      });
    }

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user || user.isBlocked) {
      await RefreshToken.deleteMany({ userId: decoded.userId });
      clearRefreshTokenCookie(res);
      
      return res.status(401).json({
        success: false,
        message: 'User not found or blocked'
      });
    }

    // ROTATION: Delete old refresh token
    await RefreshToken.deleteOne({ _id: storedToken._id });

    // Generate NEW tokens
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Store new hashed refresh token
    await RefreshToken.create({
      userId: user._id,
      tokenHash: hashToken(newRefreshToken),
      expiresAt: getRefreshTokenExpiry(),
      userAgent: req.headers['user-agent'] || '',
      ipAddress: req.ip || req.connection.remoteAddress
    });

    // Set new refresh token cookie
    setRefreshTokenCookie(res, newRefreshToken);

    return res.json({
      success: true,
      message: 'Token refreshed successfully',
      accessToken: newAccessToken
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during token refresh'
    });
  }
});

// ============================================
// ROUTE: Logout
// POST /api/auth/logout
// ============================================

router.post('/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      // Delete refresh token from database
      const tokenHash = hashToken(refreshToken);
      await RefreshToken.deleteOne({ tokenHash });
    }

    // Clear cookie
    clearRefreshTokenCookie(res);

    return res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during logout'
    });
  }
});

module.exports = router;
