const express = require('express');
const { body, validationResult } = require('express-validator');
const AuthController = require('../controllers/authController');
const AuthMiddleware = require('../middleware/authMiddleware');
const { ValidationError } = require('../utils/errors');

const router = express.Router();

// Initialize controller and middleware
const authController = new AuthController();
const authMiddleware = new AuthMiddleware();

// Validation middleware for login
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Validation middleware for token refresh
const validateRefreshToken = [
  body('refresh_token')
    .notEmpty()
    .withMessage('Refresh token is required')
];

// Error handling middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    throw new ValidationError(errorMessages.join(', '));
  }
  next();
};

// Sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Sanitize email
  if (req.body.email) {
    req.body.email = req.body.email.toString().trim().toLowerCase();
  }

  // Keep password as is for verification
  next();
};

/**
 * @route   POST /api/v1/auth/login
 * @desc    Provider login with email and password
 * @access  Public
 */
router.post('/login',
  authMiddleware.authRateLimit(),
  validateLogin,
  handleValidationErrors,
  sanitizeInput,
  async (req, res, next) => {
    try {
      const result = await authController.loginProvider(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh JWT access token
 * @access  Public
 */
router.post('/refresh',
  validateRefreshToken,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const result = await authController.refreshToken(req.body.refresh_token);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Provider logout (invalidate token)
 * @access  Private
 */
router.post('/logout',
  authMiddleware.authenticate(),
  authMiddleware.authorize('provider'),
  async (req, res, next) => {
    try {
      const token = authMiddleware.extractToken(req);
      const result = await authController.logoutProvider(token);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Get current provider profile
 * @access  Private
 */
router.get('/profile',
  authMiddleware.authenticate(),
  authMiddleware.authorize('provider'),
  async (req, res, next) => {
    try {
      const result = await authController.getCurrentProvider(req.provider);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/v1/auth/validate
 * @desc    Validate JWT token
 * @access  Public
 */
router.post('/validate',
  async (req, res, next) => {
    try {
      const token = authMiddleware.extractToken(req);
      const result = await authController.validateToken(token);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current provider info (alternative to /profile)
 * @access  Private
 */
router.get('/me',
  authMiddleware.authenticate(),
  authMiddleware.authorize('provider'),
  async (req, res, next) => {
    try {
      const result = await authController.getCurrentProvider(req.provider);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router; 