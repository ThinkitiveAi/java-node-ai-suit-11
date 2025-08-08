const { Provider } = require('../models/Provider');
const { DatabaseError } = require('../utils/errors');

class ProviderRepository {
  constructor() {
    // No need to pass database connection as we use Mongoose model directly
  }

  /**
   * Create a new provider
   * @param {Object} providerData - Provider data
   * @returns {Object} Created provider
   */
  async create(providerData) {
    try {
      const provider = new Provider(providerData);
      const savedProvider = await provider.save();
      return savedProvider;
    } catch (error) {
      console.error('Create provider error:', error);
      
      // Handle MongoDB duplicate key errors
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new DatabaseError(`${field} already exists`);
      }
      
      throw new DatabaseError('Failed to create provider');
    }
  }

  /**
   * Find provider by ID
   * @param {string} id - Provider ID
   * @returns {Object|null} Provider object or null
   */
  async findById(id) {
    try {
      const provider = await Provider.findById(id);
      return provider;
    } catch (error) {
      console.error('Find provider by ID error:', error);
      throw new DatabaseError('Failed to retrieve provider');
    }
  }

  /**
   * Find provider by email
   * @param {string} email - Provider email
   * @returns {Object|null} Provider object or null
   */
  async findByEmail(email) {
    try {
      const provider = await Provider.findOne({ email: email.toLowerCase() });
      return provider;
    } catch (error) {
      console.error('Find provider by email error:', error);
      throw new DatabaseError('Failed to check email existence');
    }
  }

  /**
   * Find provider by phone number
   * @param {string} phoneNumber - Provider phone number
   * @returns {Object|null} Provider object or null
   */
  async findByPhone(phoneNumber) {
    try {
      const provider = await Provider.findOne({ phone_number: phoneNumber });
      return provider;
    } catch (error) {
      console.error('Find provider by phone error:', error);
      throw new DatabaseError('Failed to check phone number existence');
    }
  }

  /**
   * Find provider by license number
   * @param {string} licenseNumber - Provider license number
   * @returns {Object|null} Provider object or null
   */
  async findByLicense(licenseNumber) {
    try {
      const provider = await Provider.findOne({ license_number: licenseNumber.toUpperCase() });
      return provider;
    } catch (error) {
      console.error('Find provider by license error:', error);
      throw new DatabaseError('Failed to check license number existence');
    }
  }

  /**
   * Update provider verification status
   * @param {string} id - Provider ID
   * @param {string} status - New verification status
   * @returns {Object|null} Updated provider or null
   */
  async updateVerificationStatus(id, status) {
    try {
      const updatedProvider = await Provider.findByIdAndUpdate(
        id,
        { 
          verification_status: status,
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      );
      return updatedProvider;
    } catch (error) {
      console.error('Update verification status error:', error);
      throw new DatabaseError('Failed to update verification status');
    }
  }

  /**
   * Get all providers with pagination
   * @param {number} page - Page number (1-based)
   * @param {number} limit - Items per page
   * @param {string} status - Filter by verification status
   * @returns {Object} Paginated providers
   */
  async findAll(page = 1, limit = 10, status = null) {
    try {
      const skip = (page - 1) * limit;
      
      // Build query
      const query = {};
      if (status) {
        query.verification_status = status;
      }

      // Get providers with pagination
      const providers = await Provider.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // Get total count
      const total = await Provider.countDocuments(query);

      return {
        providers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Find all providers error:', error);
      throw new DatabaseError('Failed to retrieve providers');
    }
  }

  /**
   * Delete provider by ID
   * @param {string} id - Provider ID
   * @returns {boolean} Success status
   */
  async deleteById(id) {
    try {
      const result = await Provider.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Delete provider error:', error);
      throw new DatabaseError('Failed to delete provider');
    }
  }

  /**
   * Update provider data
   * @param {string} id - Provider ID
   * @param {Object} updateData - Data to update
   * @returns {Object|null} Updated provider or null
   */
  async updateById(id, updateData) {
    try {
      const updatedProvider = await Provider.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      return updatedProvider;
    } catch (error) {
      console.error('Update provider error:', error);
      
      // Handle MongoDB duplicate key errors
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new DatabaseError(`${field} already exists`);
      }
      
      throw new DatabaseError('Failed to update provider');
    }
  }

  /**
   * Search providers by criteria
   * @param {Object} searchCriteria - Search criteria
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Object} Search results with pagination
   */
  async search(searchCriteria, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      
      // Build search query
      const query = {};
      
      if (searchCriteria.name) {
        query.$or = [
          { first_name: { $regex: searchCriteria.name, $options: 'i' } },
          { last_name: { $regex: searchCriteria.name, $options: 'i' } }
        ];
      }
      
      if (searchCriteria.specialization) {
        query.specialization = { $regex: searchCriteria.specialization, $options: 'i' };
      }
      
      if (searchCriteria.verification_status) {
        query.verification_status = searchCriteria.verification_status;
      }

      // Get providers with pagination
      const providers = await Provider.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // Get total count
      const total = await Provider.countDocuments(query);

      return {
        providers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Search providers error:', error);
      throw new DatabaseError('Failed to search providers');
    }
  }
}

module.exports = ProviderRepository; 