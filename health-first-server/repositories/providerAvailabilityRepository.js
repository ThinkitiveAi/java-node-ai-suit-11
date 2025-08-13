const { ProviderAvailability } = require('../models/ProviderAvailability');
const { DatabaseError, NotFoundError, ConflictError } = require('../utils/errors');
const { generateTimeSlots } = require('../utils/timezoneUtils');

class ProviderAvailabilityRepository {
  constructor() {
    this.model = ProviderAvailability;
  }

  /**
   * Create new availability
   * @param {Object} availabilityData - Availability data
   * @returns {Promise<Object>} Created availability
   */
  async create(availabilityData) {
    try {
      // Check for conflicts
      const hasConflict = await this.checkForConflicts(
        availabilityData.provider_id,
        availabilityData.date,
        availabilityData.start_time,
        availabilityData.end_time
      );

      if (hasConflict) {
        throw new ConflictError('Time slot conflicts with existing availability');
      }

      const availability = new this.model(availabilityData);
      const savedAvailability = await availability.save();
      return savedAvailability;
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      throw new DatabaseError(`Failed to create availability: ${error.message}`);
    }
  }

  /**
   * Get availability by ID
   * @param {string} id - Availability ID
   * @returns {Promise<Object|null>} Availability object or null
   */
  async findById(id) {
    try {
      const availability = await this.model.findById(id).populate('provider_id', 'first_name last_name email specialization years_of_experience rating');
      return availability;
    } catch (error) {
      throw new DatabaseError(`Failed to find availability by ID: ${error.message}`);
    }
  }

  /**
   * Get availability by provider ID
   * @param {string} providerId - Provider ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of availability slots
   */
  async findByProviderId(providerId, options = {}) {
    try {
      const { startDate, endDate, status, appointmentType } = options;
      
      const query = { provider_id: providerId };
      
      if (startDate && endDate) {
        query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
      }
      
      if (status) {
        query.status = status;
      }
      
      if (appointmentType) {
        query.appointment_type = appointmentType;
      }

      const availability = await this.model.find(query)
        .populate('provider_id', 'first_name last_name email specialization years_of_experience rating')
        .sort({ date: 1, start_time: 1 });

      return availability;
    } catch (error) {
      throw new DatabaseError(`Failed to find availability by provider ID: ${error.message}`);
    }
  }

  /**
   * Update availability by ID
   * @param {string} id - Availability ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object|null>} Updated availability
   */
  async updateById(id, updateData) {
    try {
      // Check for conflicts if time is being updated
      if (updateData.start_time || updateData.end_time || updateData.date) {
        const existing = await this.findById(id);
        if (!existing) {
          throw new NotFoundError('Availability not found');
        }

        const startTime = updateData.start_time || existing.start_time;
        const endTime = updateData.end_time || existing.end_time;
        const date = updateData.date || existing.date;

        const hasConflict = await this.checkForConflicts(
          existing.provider_id,
          date,
          startTime,
          endTime,
          id // Exclude current availability from conflict check
        );

        if (hasConflict) {
          throw new ConflictError('Time slot conflicts with existing availability');
        }
      }

      const availability = await this.model.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('provider_id', 'first_name last_name email specialization years_of_experience rating');

      if (!availability) {
        throw new NotFoundError('Availability not found');
      }

      return availability;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      throw new DatabaseError(`Failed to update availability: ${error.message}`);
    }
  }

  /**
   * Delete availability by ID
   * @param {string} id - Availability ID
   * @param {boolean} deleteRecurring - Whether to delete recurring slots
   * @returns {Promise<boolean>} Success status
   */
  async deleteById(id, deleteRecurring = false) {
    try {
      const availability = await this.findById(id);
      
      if (!availability) {
        throw new NotFoundError('Availability not found');
      }

      // Check if slot has appointments
      if (availability.current_appointments > 0) {
        throw new ConflictError('Cannot delete availability with existing appointments');
      }

      if (deleteRecurring && availability.is_recurring) {
        // Delete all recurring slots
        const result = await this.model.deleteMany({
          provider_id: availability.provider_id,
          is_recurring: true,
          recurrence_pattern: availability.recurrence_pattern,
          start_time: availability.start_time,
          end_time: availability.end_time
        });
        return result.deletedCount > 0;
      } else {
        // Delete single slot
        const result = await this.model.findByIdAndDelete(id);
        return !!result;
      }
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
   * @returns {Promise<Object>} Search results with pagination
   */
  async search(searchCriteria, options = {}) {
    try {
      const {
        date,
        startDate,
        endDate,
        specialization,
        location,
        appointmentType,
        insuranceAccepted,
        maxPrice,
        timezone,
        availableOnly = true,
        page = 1,
        limit = 50
      } = searchCriteria;

      // Build query
      const query = {};

      // Date filtering
      if (date) {
        const targetDate = new Date(date);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        query.date = { $gte: targetDate, $lt: nextDay };
      } else if (startDate && endDate) {
        query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
      }

      if (appointmentType) {
        query.appointment_type = appointmentType;
      }

      if (insuranceAccepted !== undefined) {
        query['pricing.insurance_accepted'] = insuranceAccepted;
      }

      if (maxPrice) {
        query['pricing.base_fee'] = { $lte: maxPrice };
      }

      if (timezone) {
        query.timezone = timezone;
      }

      if (availableOnly) {
        query.status = 'available';
        // Fix: Use proper MongoDB aggregation for this comparison
        query.$expr = {
          $lt: ['$current_appointments', '$max_appointments_per_slot']
        };
      }

      // Execute query with pagination
      const skip = (page - 1) * limit;
      
      let availability = await this.model.find(query)
        .populate('provider_id', 'first_name last_name email specialization years_of_experience rating')
        .sort({ date: 1, start_time: 1 })
        .skip(skip)
        .limit(limit);

      // Filter by specialization if provided
      if (specialization) {
        availability = availability.filter(avail => 
          avail.provider_id.specialization && 
          avail.provider_id.specialization.toLowerCase().includes(specialization.toLowerCase())
        );
      }

      // Filter by location if provided
      if (location) {
        availability = availability.filter(avail => 
          avail.location.address && 
          avail.location.address.toLowerCase().includes(location.toLowerCase())
        );
      }

      const total = await this.model.countDocuments(query);

      return {
        availability,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new DatabaseError(`Failed to search availability: ${error.message}`);
    }
  }

  /**
   * Check for time conflicts
   * @param {string} providerId - Provider ID
   * @param {Date} date - Date
   * @param {string} startTime - Start time
   * @param {string} endTime - End time
   * @param {string} excludeId - ID to exclude from check
   * @returns {Promise<boolean>} True if conflict exists
   */
  async checkForConflicts(providerId, date, startTime, endTime, excludeId = null) {
    try {
      const query = {
        provider_id: providerId,
        date: date,
        $or: [
          // New slot starts during existing slot
          {
            start_time: { $lte: startTime },
            end_time: { $gt: startTime }
          },
          // New slot ends during existing slot
          {
            start_time: { $lt: endTime },
            end_time: { $gte: endTime }
          },
          // New slot completely contains existing slot
          {
            start_time: { $gte: startTime },
            end_time: { $lte: endTime }
          }
        ]
      };

      if (excludeId) {
        query._id = { $ne: excludeId };
      }

      const conflicts = await this.model.find(query);
      return conflicts.length > 0;
    } catch (error) {
      throw new DatabaseError(`Failed to check for conflicts: ${error.message}`);
    }
  }

  /**
   * Get availability statistics
   * @param {string} providerId - Provider ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Statistics
   */
  async getStatistics(providerId, options = {}) {
    try {
      const { startDate, endDate } = options;
      
      const query = { provider_id: providerId };
      
      if (startDate && endDate) {
        query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
      }

      const stats = await this.model.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalSlots: { $sum: 1 },
            availableSlots: {
              $sum: {
                $cond: [
                  { $and: [
                    { $eq: ['$status', 'available'] },
                    { $lt: ['$current_appointments', '$max_appointments_per_slot'] }
                  ]},
                  1,
                  0
                ]
              }
            },
            bookedSlots: {
              $sum: {
                $cond: [
                  { $eq: ['$status', 'booked'] },
                  1,
                  0
                ]
              }
            },
            totalAppointments: { $sum: '$current_appointments' },
            totalRevenue: { $sum: '$pricing.base_fee' }
          }
        }
      ]);

      return stats[0] || {
        totalSlots: 0,
        availableSlots: 0,
        bookedSlots: 0,
        totalAppointments: 0,
        totalRevenue: 0
      };
    } catch (error) {
      throw new DatabaseError(`Failed to get statistics: ${error.message}`);
    }
  }

  /**
   * Generate recurring slots
   * @param {Object} availabilityData - Base availability data
   * @returns {Promise<Array>} Array of generated slots
   */
  async generateRecurringSlots(availabilityData) {
    try {
      const slots = [];
      const { date, recurrence_pattern, recurrence_end_date, slot_duration, break_duration } = availabilityData;
      
      let currentDate = new Date(date);
      const endDate = new Date(recurrence_end_date);
      
      while (currentDate <= endDate) {
        // Generate time slots for the current date
        const timeSlots = generateTimeSlots(
          availabilityData.start_time,
          availabilityData.end_time,
          slot_duration,
          break_duration
        );

        // Create availability for each time slot
        for (const timeSlot of timeSlots) {
          const slotData = {
            ...availabilityData,
            date: new Date(currentDate),
            start_time: timeSlot.start_time,
            end_time: timeSlot.end_time
          };

          // Check for conflicts
          const hasConflict = await this.checkForConflicts(
            slotData.provider_id,
            slotData.date,
            slotData.start_time,
            slotData.end_time
          );

          if (!hasConflict) {
            slots.push(slotData);
          }
        }

        // Move to next date based on pattern
        switch (recurrence_pattern) {
          case 'daily':
            currentDate.setDate(currentDate.getDate() + 1);
            break;
          case 'weekly':
            currentDate.setDate(currentDate.getDate() + 7);
            break;
          case 'monthly':
            currentDate.setMonth(currentDate.getMonth() + 1);
            break;
        }
      }

      // Bulk insert all slots
      if (slots.length > 0) {
        await this.model.insertMany(slots);
      }

      return slots;
    } catch (error) {
      throw new DatabaseError(`Failed to generate recurring slots: ${error.message}`);
    }
  }
}

module.exports = ProviderAvailabilityRepository; 