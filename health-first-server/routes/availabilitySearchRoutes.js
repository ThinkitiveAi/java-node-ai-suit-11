const express = require('express');
const { query } = require('express-validator');
const ProviderAvailabilityController = require('../controllers/providerAvailabilityController');
const { sanitizeInput } = require('../middleware/sanitization');

const router = express.Router();
const providerAvailabilityController = new ProviderAvailabilityController();

// Validation middleware for search queries
const validateSearchQuery = [
  query('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO date'),

  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO date'),

  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO date'),

  query('specialization')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Specialization must be between 1 and 100 characters'),

  query('location')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Location must be between 1 and 200 characters'),

  query('appointment_type')
    .optional()
    .isIn(['consultation', 'follow_up', 'emergency', 'telemedicine'])
    .withMessage('Invalid appointment type'),

  query('insurance_accepted')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Insurance accepted must be true or false'),

  query('max_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Max price must be a positive number'),

  query('timezone')
    .optional()
    .notEmpty()
    .withMessage('Timezone cannot be empty'),

  query('available_only')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Available only must be true or false'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Routes

/**
 * @route   GET /api/v1/availability/search
 * @desc    Search availability slots (Public endpoint for patients)
 * @access  Public
 */
router.get('/search',
  validateSearchQuery,
  sanitizeInput,
  providerAvailabilityController.searchAvailability.bind(providerAvailabilityController)
);

/**
 * @route   GET /api/v1/availability/:id
 * @desc    Get availability by ID (Public endpoint)
 * @access  Public
 */
router.get('/:id',
  sanitizeInput,
  providerAvailabilityController.getAvailabilityById.bind(providerAvailabilityController)
);

/**
 * @route   GET /api/v1/availability/:id/check
 * @desc    Check slot availability (Public endpoint)
 * @access  Public
 */
router.get('/:id/check',
  sanitizeInput,
  providerAvailabilityController.checkSlotAvailability.bind(providerAvailabilityController)
);

/**
 * @route   POST /api/v1/availability/:id/book
 * @desc    Book appointment slot (Public endpoint)
 * @access  Public
 */
router.post('/:id/book',
  sanitizeInput,
  providerAvailabilityController.bookSlot.bind(providerAvailabilityController)
);

/**
 * @route   POST /api/v1/availability/:id/cancel
 * @desc    Cancel appointment slot (Public endpoint)
 * @access  Public
 */
router.post('/:id/cancel',
  sanitizeInput,
  providerAvailabilityController.cancelSlot.bind(providerAvailabilityController)
);

module.exports = router; 