const express = require('express');
const { body } = require('express-validator');
const PatientAuthController = require('../controllers/patientAuthController');
const PatientAuthMiddleware = require('../middleware/patientAuthMiddleware');
const { sanitizeInput } = require('../middleware/sanitization');

const router = express.Router();
const patientAuthController = new PatientAuthController();
const patientAuthMiddleware = new PatientAuthMiddleware();

// Validation middleware for patient login
const validatePatientLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 1 })
    .withMessage('Password is required')
    .trim()
];

// Validation middleware for token operations
const validateToken = [
  body('token')
    .isLength({ min: 1 })
    .withMessage('Token is required')
    .trim()
];

// Routes

/**
 * @route   POST /api/v1/patient/auth/login
 * @desc    Patient login
 * @access  Public
 */
router.post('/login',
  validatePatientLogin,
  sanitizeInput,
  patientAuthMiddleware.authRateLimit,
  patientAuthController.login.bind(patientAuthController)
);

/**
 * @route   POST /api/v1/patient/auth/refresh
 * @desc    Refresh patient token
 * @access  Public
 */
router.post('/refresh',
  validateToken,
  sanitizeInput,
  patientAuthController.refreshToken.bind(patientAuthController)
);

/**
 * @route   POST /api/v1/patient/auth/logout
 * @desc    Patient logout
 * @access  Public
 */
router.post('/logout',
  validateToken,
  sanitizeInput,
  patientAuthController.logout.bind(patientAuthController)
);

/**
 * @route   GET /api/v1/patient/auth/me
 * @desc    Get current patient profile
 * @access  Private
 */
router.get('/me',
  patientAuthMiddleware.authenticate.bind(patientAuthMiddleware),
  patientAuthMiddleware.authorize.bind(patientAuthMiddleware),
  patientAuthController.getCurrentPatient.bind(patientAuthController)
);

/**
 * @route   POST /api/v1/patient/auth/validate
 * @desc    Validate patient token
 * @access  Public
 */
router.post('/validate',
  validateToken,
  sanitizeInput,
  patientAuthController.validateToken.bind(patientAuthController)
);

module.exports = router; 