const ProviderAvailabilityService = require('../services/providerAvailabilityService');
const { ValidationError, ConflictError, NotFoundError, DatabaseError } = require('../utils/errors');

class ProviderAvailabilityController {
  constructor() {
    this.providerAvailabilityService = new ProviderAvailabilityService();
  }

  /**
   * Create new availability
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async createAvailability(req, res, next) {
    try {
      // Add provider ID from authenticated user
      const availabilityData = {
        ...req.body,
        provider_id: req.provider._id
      };

      const result = await this.providerAvailabilityService.createAvailability(availabilityData);

      res.status(201).json(result);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get availability by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getAvailabilityById(req, res, next) {
    try {
      const { id } = req.params;
      const availability = await this.providerAvailabilityService.getAvailabilityById(id);

      res.status(200).json({
        success: true,
        data: availability
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get availability by provider ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getAvailabilityByProviderId(req, res, next) {
    try {
      const { provider_id } = req.params;
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 50,
        startDate: req.query.start_date,
        endDate: req.query.end_date,
        status: req.query.status,
        appointmentType: req.query.appointment_type
      };

      const result = await this.providerAvailabilityService.getAvailabilityByProviderId(provider_id, options);

      res.status(200).json(result);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Update availability
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async updateAvailability(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const result = await this.providerAvailabilityService.updateAvailability(id, updateData);

      res.status(200).json(result);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete availability
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async deleteAvailability(req, res, next) {
    try {
      const { id } = req.params;
      const { delete_recurring } = req.query;
      const deleteRecurring = delete_recurring === 'true';

      const result = await this.providerAvailabilityService.deleteAvailability(id, deleteRecurring);

      res.status(200).json(result);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Search availability slots (public endpoint)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async searchAvailability(req, res, next) {
    try {
      const searchCriteria = {
        startDate: req.query.start_date,
        endDate: req.query.end_date,
        appointmentType: req.query.appointment_type,
        locationType: req.query.location_type,
        insuranceAccepted: req.query.insurance_accepted === 'true',
        maxPrice: req.query.max_price ? parseFloat(req.query.max_price) : undefined,
        timezone: req.query.timezone,
        availableOnly: req.query.available_only !== 'false',
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 50
      };

      const options = {
        sortBy: req.query.sort_by || 'date',
        sortOrder: req.query.sort_order || 'asc'
      };

      const result = await this.providerAvailabilityService.searchAvailability(searchCriteria, options);

      res.status(200).json(result);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get availability statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getAvailabilityStatistics(req, res, next) {
    try {
      const { provider_id } = req.params;
      const options = {
        startDate: req.query.start_date,
        endDate: req.query.end_date
      };

      const result = await this.providerAvailabilityService.getAvailabilityStatistics(provider_id, options);

      res.status(200).json(result);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Check slot availability
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async checkSlotAvailability(req, res, next) {
    try {
      const { id } = req.params;
      const result = await this.providerAvailabilityService.checkSlotAvailability(id);

      res.status(200).json(result);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Book appointment slot
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async bookSlot(req, res, next) {
    try {
      const { id } = req.params;
      const result = await this.providerAvailabilityService.bookSlot(id);

      res.status(200).json(result);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel appointment slot
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async cancelSlot(req, res, next) {
    try {
      const { id } = req.params;
      const result = await this.providerAvailabilityService.cancelSlot(id);

      res.status(200).json(result);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate availability data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async validateAvailabilityData(req, res, next) {
    try {
      const result = await this.providerAvailabilityService.validateAvailabilityData(req.body);

      if (result.isValid) {
        res.status(200).json({
          success: true,
          message: 'Availability data is valid',
          data: result.data
        });
      } else {
        res.status(422).json({
          success: false,
          message: 'Validation failed',
          errors: result.errors
        });
      }

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get my availability (for authenticated providers)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getMyAvailability(req, res, next) {
    try {
      const providerId = req.provider._id;
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 50,
        startDate: req.query.start_date,
        endDate: req.query.end_date,
        status: req.query.status,
        appointmentType: req.query.appointment_type
      };

      const result = await this.providerAvailabilityService.getAvailabilityByProviderId(providerId, options);

      res.status(200).json(result);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get my availability statistics (for authenticated providers)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getMyAvailabilityStatistics(req, res, next) {
    try {
      const providerId = req.provider._id;
      const options = {
        startDate: req.query.start_date,
        endDate: req.query.end_date
      };

      const result = await this.providerAvailabilityService.getAvailabilityStatistics(providerId, options);

      res.status(200).json(result);

    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProviderAvailabilityController; 