const ProviderService = require('../services/providerService');
const ProviderRepository = require('../repositories/providerRepository');

class ProviderController {
  constructor() {
    // Initialize repository and service
    this.providerRepository = new ProviderRepository();
    this.providerService = new ProviderService(this.providerRepository);
  }

  /**
   * Register a new healthcare provider
   * @param {Object} providerData - Provider registration data
   * @returns {Object} Registration result
   */
  async registerProvider(providerData) {
    try {
      // Sanitize and validate input data
      const sanitizedData = this.sanitizeInput(providerData);
      
      // Register provider through service layer
      const result = await this.providerService.registerProvider(sanitizedData);
      
      return result;
    } catch (error) {
      console.error('Provider registration controller error:', error);
      throw error;
    }
  }

  /**
   * Get provider by ID
   * @param {string} providerId - Provider ID
   * @returns {Object} Provider data
   */
  async getProviderById(providerId) {
    try {
      const provider = await this.providerService.getProviderById(providerId);
      return provider;
    } catch (error) {
      console.error('Get provider controller error:', error);
      throw error;
    }
  }

  /**
   * Get all providers with pagination
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @param {string} status - Filter by verification status
   * @returns {Object} Paginated providers
   */
  async getAllProviders(page = 1, limit = 10, status = null) {
    try {
      const result = await this.providerRepository.findAll(page, limit, status);
      
      return {
        data: result.providers.map(provider => this.providerService.sanitizeProviderData(provider)),
        pagination: result.pagination
      };
    } catch (error) {
      console.error('Get all providers controller error:', error);
      throw error;
    }
  }

  /**
   * Update provider verification status
   * @param {string} providerId - Provider ID
   * @param {string} status - New verification status
   * @returns {Object} Update result
   */
  async updateVerificationStatus(providerId, status) {
    try {
      const result = await this.providerService.updateVerificationStatus(providerId, status);
      return result;
    } catch (error) {
      console.error('Update verification status controller error:', error);
      throw error;
    }
  }

  /**
   * Search providers
   * @param {Object} searchCriteria - Search criteria
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Object} Search results
   */
  async searchProviders(searchCriteria, page = 1, limit = 10) {
    try {
      const result = await this.providerRepository.search(searchCriteria, page, limit);
      
      return {
        data: result.providers.map(provider => this.providerService.sanitizeProviderData(provider)),
        pagination: result.pagination
      };
    } catch (error) {
      console.error('Search providers controller error:', error);
      throw error;
    }
  }

  /**
   * Delete provider
   * @param {string} providerId - Provider ID
   * @returns {Object} Delete result
   */
  async deleteProvider(providerId) {
    try {
      const deleted = await this.providerRepository.deleteById(providerId);
      
      if (!deleted) {
        throw new Error('Provider not found');
      }

      return {
        success: true,
        message: 'Provider deleted successfully'
      };
    } catch (error) {
      console.error('Delete provider controller error:', error);
      throw error;
    }
  }

  /**
   * Sanitize input data to prevent injection attacks
   * @param {Object} data - Input data
   * @returns {Object} Sanitized data
   */
  sanitizeInput(data) {
    const sanitized = {};
    
    // Sanitize string fields
    const stringFields = [
      'first_name', 'last_name', 'email', 'phone_number', 
      'specialization', 'license_number'
    ];
    
    stringFields.forEach(field => {
      if (data[field]) {
        sanitized[field] = String(data[field]).trim();
      }
    });

    // Sanitize clinic address
    if (data.clinic_address) {
      sanitized.clinic_address = {
        street: String(data.clinic_address.street || '').trim(),
        city: String(data.clinic_address.city || '').trim(),
        state: String(data.clinic_address.state || '').trim(),
        zip: String(data.clinic_address.zip || '').trim()
      };
    }

    // Sanitize numeric fields
    if (data.years_of_experience !== undefined) {
      sanitized.years_of_experience = parseInt(data.years_of_experience) || 0;
    }

    // Keep password fields as is (they'll be hashed)
    if (data.password) {
      sanitized.password = data.password;
    }
    if (data.confirm_password) {
      sanitized.confirm_password = data.confirm_password;
    }

    return sanitized;
  }

  /**
   * Validate provider data format
   * @param {Object} data - Provider data
   * @returns {boolean} Validation result
   */
  validateProviderData(data) {
    const requiredFields = [
      'first_name', 'last_name', 'email', 'phone_number',
      'password', 'confirm_password', 'specialization',
      'license_number', 'years_of_experience', 'clinic_address'
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`${field} is required`);
      }
    }

    // Validate clinic address structure
    if (!data.clinic_address.street || !data.clinic_address.city || 
        !data.clinic_address.state || !data.clinic_address.zip) {
      throw new Error('Complete clinic address is required');
    }

    return true;
  }

  /**
   * Format error response
   * @param {Error} error - Error object
   * @returns {Object} Formatted error response
   */
  formatErrorResponse(error) {
    return {
      success: false,
      message: error.message || 'An error occurred',
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = ProviderController; 