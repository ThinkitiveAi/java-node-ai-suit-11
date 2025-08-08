const express = require('express');
const { body, validationResult } = require('express-validator');
const ProviderController = require('../controllers/providerController');
const { ValidationError, DatabaseError } = require('../utils/errors');

const router = express.Router();

// Initialize controller
const providerController = new ProviderController();

// Validation middleware
const validateProviderRegistration = [
  body('first_name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),

  body('last_name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('phone_number')
    .matches(/^\+[1-9]\d{1,14}$/)
    .withMessage('Phone number must be in international format (e.g., +1234567890)'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

  body('confirm_password')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),

  body('specialization')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Specialization must be between 3 and 100 characters'),

  body('license_number')
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage('License number must be between 5 and 20 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('License number must contain only uppercase letters and numbers'),

  body('years_of_experience')
    .isInt({ min: 0, max: 50 })
    .withMessage('Years of experience must be between 0 and 50'),

  body('clinic_address.street')
    .trim()
    .isLength({ max: 200 })
    .withMessage('Street address cannot exceed 200 characters'),

  body('clinic_address.city')
    .trim()
    .isLength({ max: 100 })
    .withMessage('City name cannot exceed 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('City name can only contain letters and spaces'),

  body('clinic_address.state')
    .trim()
    .isLength({ max: 50 })
    .withMessage('State name cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('State name can only contain letters and spaces'),

  body('clinic_address.zip')
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage('ZIP code must be in valid format (e.g., 12345 or 12345-6789)')
];

// Sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Sanitize string inputs
  const stringFields = ['first_name', 'last_name', 'email', 'phone_number', 'specialization', 'license_number'];
  stringFields.forEach(field => {
    if (req.body[field]) {
      req.body[field] = req.body[field].toString().trim();
    }
  });

  // Sanitize clinic address
  if (req.body.clinic_address) {
    const addressFields = ['street', 'city', 'state', 'zip'];
    addressFields.forEach(field => {
      if (req.body.clinic_address[field]) {
        req.body.clinic_address[field] = req.body.clinic_address[field].toString().trim();
      }
    });
  }

  // Sanitize numeric fields
  if (req.body.years_of_experience) {
    req.body.years_of_experience = parseInt(req.body.years_of_experience);
  }

  next();
};

// Error handling middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    throw new ValidationError(errorMessages.join(', '));
  }
  next();
};

// Routes

/**
 * @route   POST /api/v1/provider/register
 * @desc    Register a new healthcare provider
 * @access  Public
 */
router.post('/register', 
  validateProviderRegistration,
  handleValidationErrors,
  sanitizeInput,
  async (req, res, next) => {
    try {
      const result = await providerController.registerProvider(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/v1/provider/:id
 * @desc    Get provider by ID
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
  try {
    const provider = await providerController.getProviderById(req.params.id);
    res.json(provider);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/provider
 * @desc    Get all providers with pagination
 * @access  Public
 */
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || null;

    const result = await providerController.getAllProviders(page, limit, status);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/v1/provider/:id/verify
 * @desc    Update provider verification status
 * @access  Public (should be protected in production)
 */
router.put('/:id/verify', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['pending', 'verified', 'rejected'].includes(status)) {
      throw new ValidationError('Invalid verification status');
    }

    const result = await providerController.updateVerificationStatus(req.params.id, status);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/provider/search
 * @desc    Search providers
 * @access  Public
 */
router.get('/search', async (req, res, next) => {
  try {
    const searchCriteria = {
      name: req.query.name,
      specialization: req.query.specialization,
      verification_status: req.query.verification_status
    };

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await providerController.searchProviders(searchCriteria, page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/v1/provider/:id
 * @desc    Delete provider
 * @access  Public (should be protected in production)
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await providerController.deleteProvider(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router; 