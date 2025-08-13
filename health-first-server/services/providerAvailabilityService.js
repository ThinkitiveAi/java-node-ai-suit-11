const ProviderAvailabilityRepository = require('../repositories/providerAvailabilityRepository');
const { ValidationError, ConflictError, NotFoundError, DatabaseError } = require('../utils/errors');
const { providerAvailabilityValidationSchema } = require('../models/ProviderAvailability');
const { generateTimeSlots } = require('../utils/timezoneUtils');

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
        
        // Calculate total appointments available
        const totalAppointments = slots.reduce((total, slot) => {
          return total + slot.max_appointments_per_slot;
        }, 0);

        return {
          success: true,
          message: 'Availability slots created successfully',
          data: {
            availability_id: slots[0]?._id || 'generated',
            slots_created: slots.length,
            date_range: {
              start: value.date.toISOString().split('T')[0],
              end: value.recurrence_end_date.toISOString().split('T')[0]
            },
            total_appointments_available: totalAppointments
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
      const { page = 1, limit = 50, startDate, endDate, status, appointmentType, timezone } = options;
      
      const availability = await this.providerAvailabilityRepository.findByProviderId(providerId, {
        startDate,
        endDate,
        status,
        appointmentType
      });

      // Group availability by date
      const availabilityByDate = this.groupAvailabilityByDate(availability, timezone);

      const total = availability.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedAvailability = availabilityByDate.slice(startIndex, endIndex);

      // Calculate summary statistics
      const summary = this.calculateAvailabilitySummary(availability);

      return {
        success: true,
        data: {
          provider_id: providerId,
          availability_summary: summary,
          availability: paginatedAvailability
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

      // Format results to match requirements
      const formattedResults = this.formatSearchResults(result.availability);

      return {
        success: true,
        data: {
          search_criteria: {
            date: searchCriteria.startDate,
            specialization: searchCriteria.specialization,
            location: searchCriteria.location
          },
          total_results: result.availability.length,
          results: formattedResults
        }
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

  /**
   * Group availability by date for response formatting
   * @param {Array} availability - Array of availability objects
   * @param {string} timezone - Target timezone for display
   * @returns {Array} Grouped availability
   */
  groupAvailabilityByDate(availability, timezone) {
    const grouped = {};
    
    availability.forEach(avail => {
      const dateKey = avail.date.toISOString().split('T')[0];
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: dateKey,
          slots: []
        };
      }

      // Create slot object
      const slot = {
        slot_id: avail._id,
        start_time: avail.local_start_time || avail.start_time,
        end_time: avail.local_end_time || avail.end_time,
        status: avail.status,
        appointment_type: avail.appointment_type,
        location: avail.location,
        pricing: avail.pricing
      };

      grouped[dateKey].slots.push(slot);
    });

    return Object.values(grouped);
  }

  /**
   * Calculate availability summary statistics
   * @param {Array} availability - Array of availability objects
   * @returns {Object} Summary statistics
   */
  calculateAvailabilitySummary(availability) {
    let totalSlots = 0;
    let availableSlots = 0;
    let bookedSlots = 0;
    let cancelledSlots = 0;

    availability.forEach(avail => {
      totalSlots++;
      
      if (avail.status === 'available' && avail.current_appointments < avail.max_appointments_per_slot) {
        availableSlots++;
      } else if (avail.status === 'booked') {
        bookedSlots++;
      } else if (avail.status === 'cancelled') {
        cancelledSlots++;
      }
    });

    return {
      total_slots: totalSlots,
      available_slots: availableSlots,
      booked_slots: bookedSlots,
      cancelled_slots: cancelledSlots
    };
  }

  /**
   * Format search results to match requirements
   * @param {Array} availability - Array of availability objects
   * @returns {Array} Formatted results
   */
  formatSearchResults(availability) {
    const providerMap = new Map();

    availability.forEach(avail => {
      const providerId = avail.provider_id._id || avail.provider_id;
      
      if (!providerMap.has(providerId)) {
        providerMap.set(providerId, {
          provider: {
            id: providerId,
            name: `${avail.provider_id.first_name || ''} ${avail.provider_id.last_name || ''}`.trim(),
            specialization: avail.provider_id.specialization || 'General',
            years_of_experience: avail.provider_id.years_of_experience || 0,
            rating: avail.provider_id.rating || 0,
            clinic_address: avail.location?.address || 'Address not specified'
          },
          available_slots: []
        });
      }

      const provider = providerMap.get(providerId);
      
      const slot = {
        slot_id: avail._id,
        date: avail.date.toISOString().split('T')[0],
        start_time: avail.local_start_time || avail.start_time,
        end_time: avail.local_end_time || avail.end_time,
        appointment_type: avail.appointment_type,
        location: avail.location,
        pricing: avail.pricing,
        special_requirements: avail.special_requirements || []
      };

      provider.available_slots.push(slot);
    });

    return Array.from(providerMap.values());
  }
}

module.exports = ProviderAvailabilityService; 