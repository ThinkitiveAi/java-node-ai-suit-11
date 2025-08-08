const express = require('express');
const { body, query } = require('express-validator');
const ProviderAvailabilityController = require('../controllers/providerAvailabilityController');
const AuthMiddleware = require('../middleware/authMiddleware');
const { sanitizeInput } = require('../middleware/sanitization');

const router = express.Router();
const providerAvailabilityController = new ProviderAvailabilityController();
const authMiddleware = new AuthMiddleware();

// Validation middleware for availability creation
const validateAvailabilityCreation = [
  body('date')
    .isISO8601()
    .withMessage('Date must be a valid ISO date')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      if (date <= now) {
        throw new Error('Date cannot be in the past');
      }
      return true;
    }),

  body('start_time')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:mm format'),

  body('end_time')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:mm format')
    .custom((value, { req }) => {
      if (req.body.start_time && value <= req.body.start_time) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),

  body('timezone')
    .notEmpty()
    .withMessage('Timezone is required'),

  body('slot_duration')
    .optional()
    .isInt({ min: 15, max: 480 })
    .withMessage('Slot duration must be between 15 and 480 minutes'),

  body('break_duration')
    .optional()
    .isInt({ min: 0, max: 60 })
    .withMessage('Break duration must be between 0 and 60 minutes'),

  body('max_appointments_per_slot')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Max appointments per slot must be between 1 and 10'),

  body('appointment_type')
    .optional()
    .isIn(['consultation', 'follow_up', 'emergency', 'telemedicine'])
    .withMessage('Invalid appointment type'),

  body('location.type')
    .isIn(['clinic', 'hospital', 'telemedicine', 'home_visit'])
    .withMessage('Invalid location type'),

  body('location.address')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Address cannot exceed 500 characters'),

  body('location.room_number')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Room number cannot exceed 50 characters'),

  body('pricing.base_fee')
    .isFloat({ min: 0 })
    .withMessage('Base fee must be a positive number'),

  body('pricing.insurance_accepted')
    .optional()
    .isBoolean()
    .withMessage('Insurance accepted must be a boolean'),

  body('pricing.currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be 3 characters'),

  body('special_requirements')
    .optional()
    .isArray()
    .withMessage('Special requirements must be an array'),

  body('special_requirements.*')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Special requirement cannot exceed 200 characters'),

  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
];

// Validation middleware for availability update
const validateAvailabilityUpdate = [
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO date')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      if (date <= now) {
        throw new Error('Date cannot be in the past');
      }
      return true;
    }),

  body('start_time')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:mm format'),

  body('end_time')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:mm format'),

  body('status')
    .optional()
    .isIn(['available', 'booked', 'cancelled', 'blocked', 'maintenance'])
    .withMessage('Invalid status')
];

// Validation middleware for search queries
const validateSearchQuery = [
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO date'),

  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO date'),

  query('appointment_type')
    .optional()
    .isIn(['consultation', 'follow_up', 'emergency', 'telemedicine'])
    .withMessage('Invalid appointment type'),

  query('location_type')
    .optional()
    .isIn(['clinic', 'hospital', 'telemedicine', 'home_visit'])
    .withMessage('Invalid location type'),

  query('insurance_accepted')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Insurance accepted must be true or false'),

  query('max_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Max price must be a positive number'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('sort_by')
    .optional()
    .isIn(['date', 'start_time', 'pricing.base_fee'])
    .withMessage('Invalid sort field'),

  query('sort_order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

// Routes

/**
 * @route   POST /api/v1/provider/availability
 * @desc    Create new availability (Provider only)
 * @access  Private
 */
router.post('/',
  authMiddleware.authenticate.bind(authMiddleware),
  authMiddleware.authorizeProvider.bind(authMiddleware),
  validateAvailabilityCreation,
  sanitizeInput,
  providerAvailabilityController.createAvailability.bind(providerAvailabilityController)
);

/**
 * @route   GET /api/v1/provider/availability/me
 * @desc    Get my availability (Provider only)
 * @access  Private
 */
router.get('/me',
  authMiddleware.authenticate.bind(authMiddleware),
  authMiddleware.authorizeProvider.bind(authMiddleware),
  validateSearchQuery,
  sanitizeInput,
  providerAvailabilityController.getMyAvailability.bind(providerAvailabilityController)
);

/**
 * @route   GET /api/v1/provider/availability/me/statistics
 * @desc    Get my availability statistics (Provider only)
 * @access  Private
 */
router.get('/me/statistics',
  authMiddleware.authenticate.bind(authMiddleware),
  authMiddleware.authorizeProvider.bind(authMiddleware),
  sanitizeInput,
  providerAvailabilityController.getMyAvailabilityStatistics.bind(providerAvailabilityController)
);

/**
 * @route   GET /api/v1/provider/availability/:id
 * @desc    Get availability by ID
 * @access  Public
 */
router.get('/:id',
  sanitizeInput,
  providerAvailabilityController.getAvailabilityById.bind(providerAvailabilityController)
);

/**
 * @route   GET /api/v1/provider/availability/provider/:provider_id
 * @desc    Get availability by provider ID
 * @access  Public
 */
router.get('/provider/:provider_id',
  validateSearchQuery,
  sanitizeInput,
  providerAvailabilityController.getAvailabilityByProviderId.bind(providerAvailabilityController)
);

/**
 * @route   PUT /api/v1/provider/availability/:id
 * @desc    Update availability (Provider only)
 * @access  Private
 */
router.put('/:id',
  authMiddleware.authenticate.bind(authMiddleware),
  authMiddleware.authorizeProvider.bind(authMiddleware),
  validateAvailabilityUpdate,
  sanitizeInput,
  providerAvailabilityController.updateAvailability.bind(providerAvailabilityController)
);

/**
 * @route   DELETE /api/v1/provider/availability/:id
 * @desc    Delete availability (Provider only)
 * @access  Private
 */
router.delete('/:id',
  authMiddleware.authenticate.bind(authMiddleware),
  authMiddleware.authorizeProvider.bind(authMiddleware),
  sanitizeInput,
  providerAvailabilityController.deleteAvailability.bind(providerAvailabilityController)
);

/**
 * @route   GET /api/v1/provider/availability/:provider_id/statistics
 * @desc    Get availability statistics by provider ID
 * @access  Public
 */
router.get('/:provider_id/statistics',
  sanitizeInput,
  providerAvailabilityController.getAvailabilityStatistics.bind(providerAvailabilityController)
);

/**
 * @route   GET /api/v1/provider/availability/:id/check
 * @desc    Check slot availability
 * @access  Public
 */
router.get('/:id/check',
  sanitizeInput,
  providerAvailabilityController.checkSlotAvailability.bind(providerAvailabilityController)
);

/**
 * @route   POST /api/v1/provider/availability/:id/book
 * @desc    Book appointment slot
 * @access  Public
 */
router.post('/:id/book',
  sanitizeInput,
  providerAvailabilityController.bookSlot.bind(providerAvailabilityController)
);

/**
 * @route   POST /api/v1/provider/availability/:id/cancel
 * @desc    Cancel appointment slot
 * @access  Public
 */
router.post('/:id/cancel',
  sanitizeInput,
  providerAvailabilityController.cancelSlot.bind(providerAvailabilityController)
);

/**
 * @route   POST /api/v1/provider/availability/validate
 * @desc    Validate availability data
 * @access  Public
 */
router.post('/validate',
  validateAvailabilityCreation,
  sanitizeInput,
  providerAvailabilityController.validateAvailabilityData.bind(providerAvailabilityController)
);

module.exports = router; 