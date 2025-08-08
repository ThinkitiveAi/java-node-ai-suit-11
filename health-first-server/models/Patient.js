const Joi = require('joi');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Joi validation schema for patient registration
const patientValidationSchema = Joi.object({
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

  date_of_birth: Joi.date()
    .max('now')
    .required()
    .custom((value, helpers) => {
      const age = Math.floor((new Date() - value) / (365.25 * 24 * 60 * 60 * 1000));
      if (age < 13) {
        return helpers.error('any.invalid', { message: 'Must be at least 13 years old for COPPA compliance' });
      }
      return value;
    })
    .messages({
      'date.max': 'Date of birth cannot be in the future',
      'any.required': 'Date of birth is required',
      'any.invalid': 'Must be at least 13 years old for COPPA compliance'
    }),

  gender: Joi.string()
    .valid('male', 'female', 'other', 'prefer_not_to_say')
    .required()
    .messages({
      'any.only': 'Gender must be one of: male, female, other, prefer_not_to_say',
      'any.required': 'Gender is required'
    }),

  address: Joi.object({
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
      .messages({
        'string.pattern.base': 'ZIP code must be in format 12345 or 12345-6789',
        'any.required': 'ZIP code is required'
      })
  }).required(),

  emergency_contact: Joi.object({
    name: Joi.string()
      .max(100)
      .trim()
      .pattern(/^[a-zA-Z\s]+$/)
      .messages({
        'string.max': 'Emergency contact name cannot exceed 100 characters',
        'string.pattern.base': 'Name can only contain letters and spaces'
      }),

    phone: Joi.string()
      .pattern(/^\+[1-9]\d{1,14}$/)
      .messages({
        'string.pattern.base': 'Phone number must be in international format (e.g., +1234567890)'
      }),

    relationship: Joi.string()
      .max(50)
      .trim()
      .pattern(/^[a-zA-Z\s]+$/)
      .messages({
        'string.max': 'Relationship cannot exceed 50 characters',
        'string.pattern.base': 'Relationship can only contain letters and spaces'
      })
  }).optional(),

  medical_history: Joi.array()
    .items(Joi.string().max(500))
    .optional()
    .messages({
      'array.base': 'Medical history must be an array of strings'
    }),

  insurance_info: Joi.object({
    provider: Joi.string()
      .max(100)
      .trim()
      .messages({
        'string.max': 'Insurance provider name cannot exceed 100 characters'
      }),

    policy_number: Joi.string()
      .max(50)
      .trim()
      .pattern(/^[A-Za-z0-9\-]+$/)
      .messages({
        'string.max': 'Policy number cannot exceed 50 characters',
        'string.pattern.base': 'Policy number can only contain letters, numbers, and hyphens'
      })
  }).optional()
});

// Mongoose schema for MongoDB
const patientSchema = new mongoose.Schema({
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
    match: [/^\+[1-9]\d{1,14}$/, 'Phone number must be in international format (e.g., +1234567890)']
  },

  password_hash: {
    type: String,
    required: [true, 'Password hash is required']
  },

  date_of_birth: {
    type: Date,
    required: [true, 'Date of birth is required'],
    validate: {
      validator: function(value) {
        const age = Math.floor((new Date() - value) / (365.25 * 24 * 60 * 60 * 1000));
        return age >= 13;
      },
      message: 'Must be at least 13 years old for COPPA compliance'
    }
  },

  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: {
      values: ['male', 'female', 'other', 'prefer_not_to_say'],
      message: 'Gender must be one of: male, female, other, prefer_not_to_say'
    }
  },

  address: {
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
      match: [/^\d{5}(-\d{4})?$/, 'ZIP code must be in format 12345 or 12345-6789']
    }
  },

  emergency_contact: {
    name: {
      type: String,
      maxlength: [100, 'Emergency contact name cannot exceed 100 characters'],
      trim: true,
      match: [/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces']
    },
    phone: {
      type: String,
      match: [/^\+[1-9]\d{1,14}$/, 'Phone number must be in international format (e.g., +1234567890)']
    },
    relationship: {
      type: String,
      maxlength: [50, 'Relationship cannot exceed 50 characters'],
      trim: true,
      match: [/^[a-zA-Z\s]+$/, 'Relationship can only contain letters and spaces']
    }
  },

  medical_history: [{
    type: String,
    maxlength: [500, 'Medical history item cannot exceed 500 characters']
  }],

  insurance_info: {
    provider: {
      type: String,
      maxlength: [100, 'Insurance provider name cannot exceed 100 characters'],
      trim: true
    },
    policy_number: {
      type: String,
      maxlength: [50, 'Policy number cannot exceed 50 characters'],
      trim: true,
      match: [/^[A-Za-z0-9\-]+$/, 'Policy number can only contain letters, numbers, and hyphens']
    }
  },

  email_verified: {
    type: Boolean,
    default: false
  },

  phone_verified: {
    type: Boolean,
    default: false
  },

  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Create indexes for better query performance
patientSchema.index({ email: 1 });
patientSchema.index({ phone_number: 1 });
patientSchema.index({ is_active: 1 });

// Static method to validate patient data
patientSchema.statics.validate = function(data) {
  return patientValidationSchema.validate(data, { abortEarly: false });
};

// Instance method to get public profile (without sensitive data)
patientSchema.methods.getPublicProfile = function() {
  const patient = this.toObject();
  delete patient.password_hash;
  delete patient.__v;
  return patient;
};

// Pre-save middleware to hash password if modified
patientSchema.pre('save', async function(next) {
  if (this.isModified('password_hash')) {
    try {
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
      this.password_hash = await bcrypt.hash(this.password_hash, saltRounds);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Method to compare password
patientSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password_hash);
};

const Patient = mongoose.model('Patient', patientSchema);

module.exports = {
  Patient,
  patientValidationSchema
}; 