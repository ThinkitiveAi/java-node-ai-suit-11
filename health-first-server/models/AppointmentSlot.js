const mongoose = require('mongoose');
const Joi = require('joi');

// Joi validation schema for appointment slots
const appointmentSlotValidationSchema = Joi.object({
  availability_id: Joi.string().required(),
  provider_id: Joi.string().required(),
  slot_start_time: Joi.date().required(),
  slot_end_time: Joi.date().required(),
  status: Joi.string().valid('available', 'booked', 'cancelled', 'blocked').default('available'),
  patient_id: Joi.string().allow(null),
  appointment_type: Joi.string().required(),
  booking_reference: Joi.string().required()
});

// Mongoose schema for appointment slots
const appointmentSlotSchema = new mongoose.Schema({
  availability_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProviderAvailability',
    required: [true, 'Availability ID is required'],
    index: true
  },
  provider_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: [true, 'Provider ID is required'],
    index: true
  },
  slot_start_time: {
    type: Date,
    required: [true, 'Slot start time is required'],
    index: true
  },
  slot_end_time: {
    type: Date,
    required: [true, 'Slot end time is required'],
    index: true
  },
  status: {
    type: String,
    enum: ['available', 'booked', 'cancelled', 'blocked'],
    default: 'available',
    index: true
  },
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    default: null
  },
  appointment_type: {
    type: String,
    required: [true, 'Appointment type is required'],
    enum: ['consultation', 'follow_up', 'emergency', 'telemedicine']
  },
  booking_reference: {
    type: String,
    required: [true, 'Booking reference is required'],
    unique: true,
    index: true
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for efficient querying
appointmentSlotSchema.index({ provider_id: 1, slot_start_time: 1 });
appointmentSlotSchema.index({ status: 1, slot_start_time: 1 });
appointmentSlotSchema.index({ patient_id: 1 });
appointmentSlotSchema.index({ appointment_type: 1 });

// Static method to validate
appointmentSlotSchema.statics.validate = function(data) {
  return appointmentSlotValidationSchema.validate(data, { abortEarly: false });
};

// Instance methods
appointmentSlotSchema.methods.isAvailable = function() {
  return this.status === 'available';
};

appointmentSlotSchema.methods.canBeBooked = function() {
  return this.isAvailable() && this.slot_start_time > new Date();
};

appointmentSlotSchema.methods.book = function(patientId) {
  if (this.canBeBooked()) {
    this.status = 'booked';
    this.patient_id = patientId;
    this.updated_at = new Date();
    return true;
  }
  return false;
};

appointmentSlotSchema.methods.cancel = function() {
  if (this.status === 'booked') {
    this.status = 'available';
    this.patient_id = null;
    this.updated_at = new Date();
    return true;
  }
  return false;
};

// Pre-save middleware
appointmentSlotSchema.pre('save', function(next) {
  if (this.slot_start_time && this.slot_end_time) {
    if (this.slot_end_time <= this.slot_start_time) {
      return next(new Error('Slot end time must be after start time'));
    }
  }
  
  // Generate booking reference if not provided
  if (!this.booking_reference) {
    this.booking_reference = `APPT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  
  next();
});

const AppointmentSlot = mongoose.model('AppointmentSlot', appointmentSlotSchema);

module.exports = {
  AppointmentSlot,
  appointmentSlotValidationSchema
}; 