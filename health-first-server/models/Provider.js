const mongoose = require('mongoose');
const Joi = require('joi');

// MongoDB Schema for Provider
const providerSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, 'First name is required'],
    minlength: [2, 'First name must be at least 2 characters long'],
    maxlength: [50, 'First name cannot exceed 50 characters'],
    trim: true,
    match: [/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces']
  },
  last_name: {
    type: String,
    required: [true, 'Last name is required'],
    minlength: [2, 'Last name must be at least 2 characters long'],
    maxlength: [50, 'Last name cannot exceed 50 characters'],
    trim: true,
    match: [/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  phone_number: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^\+[1-9]\d{1,14}$/, 'Phone number must be in international format (e.g., +1234567890)']
  },
  password_hash: {
    type: String,
    required: [true, 'Password hash is required']
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    minlength: [3, 'Specialization must be at least 3 characters long'],
    maxlength: [100, 'Specialization cannot exceed 100 characters'],
    trim: true
  },
  license_number: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
    uppercase: true,
    trim: true,
    minlength: [5, 'License number must be at least 5 characters long'],
    maxlength: [20, 'License number cannot exceed 20 characters'],
    match: [/^[A-Z0-9]+$/, 'License number must contain only uppercase letters and numbers']
  },
  years_of_experience: {
    type: Number,
    required: [true, 'Years of experience is required'],
    min: [0, 'Years of experience cannot be negative'],
    max: [50, 'Years of experience cannot exceed 50']
  },
  clinic_address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      maxlength: [200, 'Street address cannot exceed 200 characters'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      maxlength: [100, 'City name cannot exceed 100 characters'],
      trim: true,
      match: [/^[a-zA-Z\s]+$/, 'City name can only contain letters and spaces']
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      maxlength: [50, 'State name cannot exceed 50 characters'],
      trim: true,
      match: [/^[a-zA-Z\s]+$/, 'State name can only contain letters and spaces']
    },
    zip: {
      type: String,
      required: [true, 'ZIP code is required'],
      trim: true,
      match: [/^\d{5}(-\d{4})?$/, 'ZIP code must be in valid format (e.g., 12345 or 12345-6789)']
    }
  },
  verification_status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: { 
    transform: function(doc, ret) {
      delete ret.password_hash;
      return ret;
    }
  }
});

// Create indexes for better performance (only the ones not already defined in schema)
providerSchema.index({ verification_status: 1 });
providerSchema.index({ createdAt: -1 });

// Joi validation schema for Provider registration (for API validation)
const providerValidationSchema = Joi.object({
  first_name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .trim()
    .pattern(/^[a-zA-Z\s]+$/)
    .messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name cannot exceed 50 characters',
      'string.pattern.base': 'First name can only contain letters and spaces',
      'any.required': 'First name is required'
    }),

  last_name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .trim()
    .pattern(/^[a-zA-Z\s]+$/)
    .messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name cannot exceed 50 characters',
      'string.pattern.base': 'Last name can only contain letters and spaces',
      'any.required': 'Last name is required'
    }),

  email: Joi.string()
    .email()
    .required()
    .trim()
    .lowercase()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),

  phone_number: Joi.string()
    .pattern(/^\+[1-9]\d{1,14}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone number must be in international format (e.g., +1234567890)',
      'any.required': 'Phone number is required'
    }),

  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required'
    }),

  confirm_password: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required'
    }),

  specialization: Joi.string()
    .min(3)
    .max(100)
    .required()
    .trim()
    .messages({
      'string.min': 'Specialization must be at least 3 characters long',
      'string.max': 'Specialization cannot exceed 100 characters',
      'any.required': 'Specialization is required'
    }),

  license_number: Joi.string()
    .pattern(/^[A-Z0-9]+$/)
    .min(5)
    .max(20)
    .required()
    .trim()
    .uppercase()
    .messages({
      'string.pattern.base': 'License number must contain only uppercase letters and numbers',
      'string.min': 'License number must be at least 5 characters long',
      'string.max': 'License number cannot exceed 20 characters',
      'any.required': 'License number is required'
    }),

  years_of_experience: Joi.number()
    .integer()
    .min(0)
    .max(50)
    .required()
    .messages({
      'number.base': 'Years of experience must be a number',
      'number.integer': 'Years of experience must be a whole number',
      'number.min': 'Years of experience cannot be negative',
      'number.max': 'Years of experience cannot exceed 50',
      'any.required': 'Years of experience is required'
    }),

  clinic_address: Joi.object({
    street: Joi.string()
      .max(200)
      .required()
      .trim()
      .messages({
        'string.max': 'Street address cannot exceed 200 characters',
        'any.required': 'Street address is required'
      }),

    city: Joi.string()
      .max(100)
      .required()
      .trim()
      .pattern(/^[a-zA-Z\s]+$/)
      .messages({
        'string.max': 'City name cannot exceed 100 characters',
        'string.pattern.base': 'City name can only contain letters and spaces',
        'any.required': 'City is required'
      }),

    state: Joi.string()
      .max(50)
      .required()
      .trim()
      .pattern(/^[a-zA-Z\s]+$/)
      .messages({
        'string.max': 'State name cannot exceed 50 characters',
        'string.pattern.base': 'State name can only contain letters and spaces',
        'any.required': 'State is required'
      }),

    zip: Joi.string()
      .pattern(/^\d{5}(-\d{4})?$/)
      .required()
      .trim()
      .messages({
        'string.pattern.base': 'ZIP code must be in valid format (e.g., 12345 or 12345-6789)',
        'any.required': 'ZIP code is required'
      })
  }).required().messages({
    'any.required': 'Clinic address is required'
  })
});

// Create the Mongoose model
const Provider = mongoose.model('Provider', providerSchema);

// Static method to validate provider data
Provider.validate = function(data) {
  return providerValidationSchema.validate(data, { abortEarly: false });
};

// Instance method to get public profile
providerSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    first_name: this.first_name,
    last_name: this.last_name,
    email: this.email,
    specialization: this.specialization,
    license_number: this.license_number,
    years_of_experience: this.years_of_experience,
    clinic_address: this.clinic_address,
    verification_status: this.verification_status,
    is_active: this.is_active,
    created_at: this.createdAt
  };
};

module.exports = {
  Provider,
  providerValidationSchema
}; 