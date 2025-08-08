const ProviderAvailabilityRepository = require('../repositories/providerAvailabilityRepository');
const { ValidationError, ConflictError, NotFoundError, DatabaseError } = require('../utils/errors');
const { providerAvailabilityValidationSchema } = require('../models/ProviderAvailability');

class ProviderAvailabilityService {
  constructor() {
    this.providerAvailabilityRepository = new ProviderAvailabilityRepository();
  }

  /**
   * Create new availability
   * @param {Object} availabilityData - Availability data
   * @returns {Promise<Object>} Created availability
   */
  async createAvailability(availabilityData) {
    try {
      // Validate input data
      const { error, value } = providerAvailabilityValidationSchema.validate(availabilityData, {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        const errors = {};
        error.details.forEach(detail => {
          const field = detail.path.join('.');
          if (!errors[field]) {
            errors[field] = [];
          }
          errors[field].push(detail.message);
        });
        throw new ValidationError('Validation failed', errors);
      }

      // Handle recurring availability
      if (value.is_recurring) {
        const slots = await this.providerAvailabilityRepository.generateRecurringSlots(value);
        
        return {
          success: true,
          message: `Created ${slots.length} recurring availability slots`,
          data: {
            slots_created: slots.length,
            pattern: value.recurrence_pattern,
            end_date: value.recurrence_end_date
          }
        };
      } else {
        // Create single availability
        const availability = await this.providerAvailabilityRepository.create(value);
        
        return {
          success: true,
          message: 'Availability created successfully',
          data: availability
        };
      }

    } catch (error) {
      if (error instanceof ValidationError || error instanceof ConflictError) {
        throw error;
      }
      throw new DatabaseError(`Failed to create availability: ${error.message}`);
    }
  }

  /**
   * Get availability by ID
   * @param {string} availabilityId - Availability ID
   * @returns {Promise<Object>} Availability data
   */
  async getAvailabilityById(availabilityId) {
    try {
      const availability = await this.providerAvailabilityRepository.findById(availabilityId);
      
      if (!availability) {
        throw new NotFoundError('Availability not found');
      }

      return availability;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(`Failed to get availability: ${error.message}`);
    }
  }

  /**
   * Get availability by provider ID
   * @param {string} providerId - Provider ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Availability data with pagination
   */
  async getAvailabilityByProviderId(providerId, options = {}) {
    try {
      const { page = 1, limit = 50, startDate, endDate, status, appointmentType } = options;
      
      const availability = await this.providerAvailabilityRepository.findByProviderId(providerId, {
        startDate,
        endDate,
        status,
        appointmentType
      });

      const total = availability.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedAvailability = availability.slice(startIndex, endIndex);

      return {
        success: true,
        data: {
          availability: paginatedAvailability,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };
    } catch (error) {
      throw new DatabaseError(`Failed to get provider availability: ${error.message}`);
    }
  }

  /**
   * Update availability
   * @param {string} availabilityId - Availability ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated availability
   */
  async updateAvailability(availabilityId, updateData) {
    try {
      const updatedAvailability = await this.providerAvailabilityRepository.updateById(availabilityId, updateData);

      return {
        success: true,
        message: 'Availability updated successfully',
        data: updatedAvailability
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      throw new DatabaseError(`Failed to update availability: ${error.message}`);
    }
  }

  /**
   * Delete availability
   * @param {string} availabilityId - Availability ID
   * @param {boolean} deleteRecurring - Whether to delete recurring slots
   * @returns {Promise<Object>} Deletion result
   */
  async deleteAvailability(availabilityId, deleteRecurring = false) {
    try {
      const deleted = await this.providerAvailabilityRepository.deleteById(availabilityId, deleteRecurring);

      if (!deleted) {
        throw new NotFoundError('Availability not found');
      }

      return {
        success: true,
        message: deleteRecurring ? 'Recurring availability deleted successfully' : 'Availability deleted successfully'
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      throw new DatabaseError(`Failed to delete availability: ${error.message}`);
    }
  }

  /**
   * Search availability slots
   * @param {Object} searchCriteria - Search criteria
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Search results
   */
  async searchAvailability(searchCriteria, options = {}) {
    try {
      const result = await this.providerAvailabilityRepository.search(searchCriteria, options);

      return {
        success: true,
        data: result
      };
    } catch (error) {
      throw new DatabaseError(`Failed to search availability: ${error.message}`);
    }
  }

  /**
   * Get availability statistics
   * @param {string} providerId - Provider ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Statistics
   */
  async getAvailabilityStatistics(providerId, options = {}) {
    try {
      const stats = await this.providerAvailabilityRepository.getStatistics(providerId, options);

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      throw new DatabaseError(`Failed to get availability statistics: ${error.message}`);
    }
  }

  /**
   * Check slot availability
   * @param {string} availabilityId - Availability ID
   * @returns {Promise<Object>} Availability status
   */
  async checkSlotAvailability(availabilityId) {
    try {
      const availability = await this.getAvailabilityById(availabilityId);
      
      const isAvailable = availability.isAvailable();
      const canBeBooked = availability.canBeBooked();

      return {
        success: true,
        data: {
          availability_id: availabilityId,
          is_available: isAvailable,
          can_be_booked: canBeBooked,
          current_appointments: availability.current_appointments,
          max_appointments: availability.max_appointments_per_slot,
          status: availability.status
        }
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(`Failed to check slot availability: ${error.message}`);
    }
  }

  /**
   * Book appointment slot
   * @param {string} availabilityId - Availability ID
   * @returns {Promise<Object>} Booking result
   */
  async bookSlot(availabilityId) {
    try {
      const availability = await this.getAvailabilityById(availabilityId);
      
      if (!availability.canBeBooked()) {
        throw new ConflictError('Slot is not available for booking');
      }

      const booked = availability.incrementAppointments();
      if (!booked) {
        throw new ConflictError('Slot is already fully booked');
      }

      await availability.save();

      return {
        success: true,
        message: 'Slot booked successfully',
        data: {
          availability_id: availabilityId,
          current_appointments: availability.current_appointments,
          max_appointments: availability.max_appointments_per_slot,
          status: availability.status
        }
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      throw new DatabaseError(`Failed to book slot: ${error.message}`);
    }
  }

  /**
   * Cancel appointment slot
   * @param {string} availabilityId - Availability ID
   * @returns {Promise<Object>} Cancellation result
   */
  async cancelSlot(availabilityId) {
    try {
      const availability = await this.getAvailabilityById(availabilityId);
      
      if (availability.current_appointments <= 0) {
        throw new ConflictError('No appointments to cancel');
      }

      const cancelled = availability.decrementAppointments();
      if (!cancelled) {
        throw new ConflictError('Failed to cancel appointment');
      }

      await availability.save();

      return {
        success: true,
        message: 'Appointment cancelled successfully',
        data: {
          availability_id: availabilityId,
          current_appointments: availability.current_appointments,
          max_appointments: availability.max_appointments_per_slot,
          status: availability.status
        }
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      throw new DatabaseError(`Failed to cancel appointment: ${error.message}`);
    }
  }

  /**
   * Validate availability data
   * @param {Object} data - Availability data to validate
   * @returns {Promise<Object>} Validation result
   */
  async validateAvailabilityData(data) {
    try {
      const { error, value } = providerAvailabilityValidationSchema.validate(data, {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        const errors = {};
        error.details.forEach(detail => {
          const field = detail.path.join('.');
          if (!errors[field]) {
            errors[field] = [];
          }
          errors[field].push(detail.message);
        });
        return {
          isValid: false,
          errors
        };
      }

      return {
        isValid: true,
        data: value
      };
    } catch (error) {
      return {
        isValid: false,
        errors: { general: ['Validation failed'] }
      };
    }
  }
}

module.exports = ProviderAvailabilityService; 