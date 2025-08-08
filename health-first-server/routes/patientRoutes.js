const express = require('express');
const { body, param, query } = require('express-validator');
const PatientController = require('../controllers/patientController');
const { sanitizeInput } = require('../middleware/sanitization');

const router = express.Router();
const patientController = new PatientController();

// Validation middleware for patient registration
const validatePatientRegistration = [
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
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('phone_number')
    .trim()
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

  body('date_of_birth')
    .isISO8601()
    .withMessage('Date of birth must be a valid date')
    .custom((value) => {
      const age = Math.floor((new Date() - new Date(value)) / (365.25 * 24 * 60 * 60 * 1000));
      if (age < 13) {
        throw new Error('Must be at least 13 years old for COPPA compliance');
      }
      return true;
    }),

  body('gender')
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Gender must be one of: male, female, other, prefer_not_to_say'),

  body('address.street')
    .trim()
    .isLength({ max: 200 })
    .withMessage('Street address cannot exceed 200 characters'),

  body('address.city')
    .trim()
    .isLength({ max: 100 })
    .withMessage('City name cannot exceed 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('City name can only contain letters and spaces'),

  body('address.state')
    .trim()
    .isLength({ max: 50 })
    .withMessage('State name cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('State name can only contain letters and spaces'),

  body('address.zip')
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage('ZIP code must be in format 12345 or 12345-6789'),

  body('emergency_contact.name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Emergency contact name cannot exceed 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Emergency contact name can only contain letters and spaces'),

  body('emergency_contact.phone')
    .optional()
    .matches(/^\+[1-9]\d{1,14}$/)
    .withMessage('Emergency contact phone must be in international format'),

  body('emergency_contact.relationship')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Relationship cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Relationship can only contain letters and spaces'),

  body('medical_history')
    .optional()
    .isArray()
    .withMessage('Medical history must be an array'),

  body('medical_history.*')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Medical history item cannot exceed 500 characters'),

  body('insurance_info.provider')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Insurance provider name cannot exceed 100 characters'),

  body('insurance_info.policy_number')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Policy number cannot exceed 50 characters')
    .matches(/^[A-Za-z0-9\-]+$/)
    .withMessage('Policy number can only contain letters, numbers, and hyphens')
];

// Validation middleware for patient ID
const validatePatientId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid patient ID format')
];

// Validation middleware for query parameters
const validateQueryParams = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be true or false'),

  query('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Gender must be one of: male, female, other, prefer_not_to_say'),

  query('q')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search term cannot be empty')
];

// Validation middleware for verification status update
const validateVerificationUpdate = [
  param('id')
    .isMongoId()
    .withMessage('Invalid patient ID format'),

  body('email_verified')
    .optional()
    .isBoolean()
    .withMessage('email_verified must be true or false'),

  body('phone_verified')
    .optional()
    .isBoolean()
    .withMessage('phone_verified must be true or false')
];

// Routes

/**
 * @route   POST /api/v1/patient/register
 * @desc    Register a new patient
 * @access  Public
 */
router.post('/register', 
  validatePatientRegistration,
  sanitizeInput,
  patientController.registerPatient.bind(patientController)
);

/**
 * @route   GET /api/v1/patient/:id
 * @desc    Get patient by ID
 * @access  Private
 */
router.get('/:id',
  validatePatientId,
  patientController.getPatientById.bind(patientController)
);

/**
 * @route   GET /api/v1/patient
 * @desc    Get all patients with optional filtering
 * @access  Private
 */
router.get('/',
  validateQueryParams,
  patientController.getAllPatients.bind(patientController)
);

/**
 * @route   PATCH /api/v1/patient/:id/verify
 * @desc    Update patient verification status
 * @access  Private
 */
router.patch('/:id/verify',
  validateVerificationUpdate,
  sanitizeInput,
  patientController.updateVerificationStatus.bind(patientController)
);

/**
 * @route   GET /api/v1/patient/search
 * @desc    Search patients
 * @access  Private
 */
router.get('/search',
  validateQueryParams,
  patientController.searchPatients.bind(patientController)
);

/**
 * @route   PUT /api/v1/patient/:id
 * @desc    Update patient data
 * @access  Private
 */
router.put('/:id',
  validatePatientId,
  sanitizeInput,
  patientController.updatePatient.bind(patientController)
);

/**
 * @route   DELETE /api/v1/patient/:id
 * @desc    Delete patient
 * @access  Private
 */
router.delete('/:id',
  validatePatientId,
  patientController.deletePatient.bind(patientController)
);

/**
 * @route   POST /api/v1/patient/validate
 * @desc    Validate patient data without registration
 * @access  Public
 */
router.post('/validate',
  validatePatientRegistration,
  sanitizeInput,
  patientController.validatePatientData.bind(patientController)
);

module.exports = router; 