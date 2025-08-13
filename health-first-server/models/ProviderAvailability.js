const mongoose = require('mongoose');
const Joi = require('joi');
const { isValidTimezone } = require('../utils/timezoneUtils');

// Joi validation schema
const providerAvailabilityValidationSchema = Joi.object({
  provider_id: Joi.string().required(),
  date: Joi.date().min('now').required(),
  start_time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  end_time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  timezone: Joi.string().custom((value, helpers) => {
    if (!isValidTimezone(value)) {
      return helpers.error('any.invalid');
    }
    return value;
  }, 'Invalid timezone').required(),
  is_recurring: Joi.boolean().default(false),
  recurrence_pattern: Joi.string().valid('daily', 'weekly', 'monthly'),
  recurrence_end_date: Joi.date().min('now'),
  slot_duration: Joi.number().integer().min(15).max(480).default(30),
  break_duration: Joi.number().integer().min(0).max(60).default(0),
  status: Joi.string().valid('available', 'booked', 'cancelled', 'blocked', 'maintenance').default('available'),
  max_appointments_per_slot: Joi.number().integer().min(1).max(10).default(1),
  current_appointments: Joi.number().integer().min(0).default(0),
  appointment_type: Joi.string().valid('consultation', 'follow_up', 'emergency', 'telemedicine').default('consultation'),
  location: Joi.object({
    type: Joi.string().valid('clinic', 'hospital', 'telemedicine', 'home_visit').required(),
    address: Joi.string().max(500),
    room_number: Joi.string().max(50)
  }).required(),
  pricing: Joi.object({
    base_fee: Joi.number().positive().required(),
    insurance_accepted: Joi.boolean().default(false),
    currency: Joi.string().length(3).default('USD')
  }).required(),
  special_requirements: Joi.array().items(Joi.string().max(200)),
  notes: Joi.string().max(500)
});

// Mongoose schema
const providerAvailabilitySchema = new mongoose.Schema({
  provider_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: [true, 'Provider ID is required'],
    index: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    validate: {
      validator: function(value) {
        return value >= new Date();
      },
      message: 'Date cannot be in the past'
    }
  },
  start_time: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:mm format']
  },
  end_time: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:mm format']
  },
  timezone: {
    type: String,
    required: [true, 'Timezone is required'],
    validate: {
      validator: function(value) {
        return isValidTimezone(value);
      },
      message: 'Invalid timezone'
    }
  },
  // UTC stored times for database queries
  utc_start_time: {
    type: Date,
    required: [true, 'UTC start time is required']
  },
  utc_end_time: {
    type: Date,
    required: [true, 'UTC end time is required']
  },
  is_recurring: {
    type: Boolean,
    default: false
  },
  recurrence_pattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly']
  },
  recurrence_end_date: {
    type: Date
  },
  slot_duration: {
    type: Number,
    min: [15, 'Slot duration must be at least 15 minutes'],
    max: [480, 'Slot duration cannot exceed 8 hours'],
    default: 30
  },
  break_duration: {
    type: Number,
    min: [0, 'Break duration cannot be negative'],
    max: [60, 'Break duration cannot exceed 60 minutes'],
    default: 0
  },
  status: {
    type: String,
    enum: ['available', 'booked', 'cancelled', 'blocked', 'maintenance'],
    default: 'available'
  },
  max_appointments_per_slot: {
    type: Number,
    min: [1, 'Max appointments per slot must be at least 1'],
    max: [10, 'Max appointments per slot cannot exceed 10'],
    default: 1
  },
  current_appointments: {
    type: Number,
    min: 0,
    default: 0
  },
  appointment_type: {
    type: String,
    enum: ['consultation', 'follow_up', 'emergency', 'telemedicine'],
    default: 'consultation'
  },
  location: {
    type: {
      type: String,
      required: [true, 'Location type is required'],
      enum: ['clinic', 'hospital', 'telemedicine', 'home_visit']
    },
    address: {
      type: String,
      maxlength: [500, 'Address cannot exceed 500 characters']
    },
    room_number: {
      type: String,
      maxlength: [50, 'Room number cannot exceed 50 characters']
    }
  },
  pricing: {
    base_fee: {
      type: Number,
      required: [true, 'Base fee is required'],
      min: [0, 'Base fee must be positive']
    },
    insurance_accepted: {
      type: Boolean,
      default: false
    },
    currency: {
      type: String,
      length: [3, 3],
      default: 'USD'
    }
  },
  special_requirements: [{
    type: String,
    maxlength: [200, 'Special requirement cannot exceed 200 characters']
  }],
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes
providerAvailabilitySchema.index({ provider_id: 1, date: 1 });
providerAvailabilitySchema.index({ date: 1, status: 1 });
providerAvailabilitySchema.index({ appointment_type: 1 });
providerAvailabilitySchema.index({ 'location.type': 1 });
providerAvailabilitySchema.index({ 'pricing.insurance_accepted': 1 });
providerAvailabilitySchema.index({ utc_start_time: 1, utc_end_time: 1 });
providerAvailabilitySchema.index({ provider_id: 1, utc_start_time: 1, utc_end_time: 1 });

// Static method to validate
providerAvailabilitySchema.statics.validate = function(data) {
  return providerAvailabilityValidationSchema.validate(data, { abortEarly: false });
};

// Instance methods
providerAvailabilitySchema.methods.isAvailable = function() {
  return this.status === 'available' && 
         this.current_appointments < this.max_appointments_per_slot;
};

providerAvailabilitySchema.methods.canBeBooked = function() {
  return this.isAvailable() && this.date >= new Date();
};

providerAvailabilitySchema.methods.incrementAppointments = function() {
  if (this.current_appointments < this.max_appointments_per_slot) {
    this.current_appointments += 1;
    if (this.current_appointments >= this.max_appointments_per_slot) {
      this.status = 'booked';
    }
    return true;
  }
  return false;
};

providerAvailabilitySchema.methods.decrementAppointments = function() {
  if (this.current_appointments > 0) {
    this.current_appointments -= 1;
    if (this.status === 'booked' && this.current_appointments < this.max_appointments_per_slot) {
      this.status = 'available';
    }
    return true;
  }
  return false;
};

// Pre-save middleware
providerAvailabilitySchema.pre('save', function(next) {
  if (this.start_time && this.end_time) {
    const startMinutes = this.timeToMinutes(this.start_time);
    const endMinutes = this.timeToMinutes(this.end_time);
    
    if (endMinutes <= startMinutes) {
      return next(new Error('End time must be after start time'));
    }
  }

  // Set UTC times if not already set
  if (this.start_time && this.end_time && this.date && this.timezone) {
    try {
      const { localToUTC } = require('../utils/timezoneUtils');
      
      // Convert local times to UTC for storage
      this.utc_start_time = localToUTC(this.start_time, this.date.toISOString().split('T')[0], this.timezone);
      this.utc_end_time = localToUTC(this.end_time, this.date.toISOString().split('T')[0], this.timezone);
    } catch (error) {
      return next(new Error(`Timezone conversion failed: ${error.message}`));
    }
  }

  next();
});

// Helper methods
providerAvailabilitySchema.methods.timeToMinutes = function(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

providerAvailabilitySchema.methods.minutesToTime = function(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Virtual for local time display
providerAvailabilitySchema.virtual('local_start_time').get(function() {
  if (this.utc_start_time && this.timezone) {
    const { utcToLocal } = require('../utils/timezoneUtils');
    const local = utcToLocal(this.utc_start_time, this.timezone);
    return local.time;
  }
  return this.start_time;
});

providerAvailabilitySchema.virtual('local_end_time').get(function() {
  if (this.utc_end_time && this.timezone) {
    const { utcToLocal } = require('../utils/timezoneUtils');
    const local = utcToLocal(this.utc_end_time, this.timezone);
    return local.time;
  }
  return this.end_time;
});

// Ensure virtuals are included when converting to JSON
providerAvailabilitySchema.set('toJSON', { virtuals: true });
providerAvailabilitySchema.set('toObject', { virtuals: true });

const ProviderAvailability = mongoose.model('ProviderAvailability', providerAvailabilitySchema);

module.exports = {
  ProviderAvailability,
  providerAvailabilityValidationSchema
}; 