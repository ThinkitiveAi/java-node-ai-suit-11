const bcrypt = require('bcryptjs');
const { Provider } = require('../models/Provider');
const { DatabaseError, ValidationError, DuplicateError } = require('../utils/errors');

class ProviderService {
  constructor(providerRepository) {
    this.providerRepository = providerRepository;
  }

  /**
   * Register a new healthcare provider
   * @param {Object} providerData - Provider registration data
   * @returns {Object} Registration result
   */
  async registerProvider(providerData) {
    try {
      // Validate input data
      const validation = Provider.validate(providerData);
      if (validation.error) {
        throw new ValidationError('Validation failed', validation.error.details);
      }

      const validatedData = validation.value;

      // Check for existing email
      const existingEmail = await this.providerRepository.findByEmail(validatedData.email);
      if (existingEmail) {
        throw new DuplicateError('Email already registered');
      }

      // Check for existing phone number
      const existingPhone = await this.providerRepository.findByPhone(validatedData.phone_number);
      if (existingPhone) {
        throw new DuplicateError('Phone number already registered');
      }

      // Check for existing license number
      const existingLicense = await this.providerRepository.findByLicense(validatedData.license_number);
      if (existingLicense) {
        throw new DuplicateError('License number already registered');
      }

      // Hash password with bcrypt (12 salt rounds for security)
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(validatedData.password, saltRounds);

      // Create provider object
      const provider = new Provider({
        ...validatedData,
        password_hash: passwordHash
      });

      // Save to database
      const savedProvider = await this.providerRepository.create(provider);

      // Send verification email (placeholder for email service)
      await this.sendVerificationEmail(savedProvider.email, savedProvider.id);

      return {
        success: true,
        message: 'Provider registered successfully. Verification email sent.',
        data: {
          provider_id: savedProvider.id,
          email: savedProvider.email,
          verification_status: savedProvider.verification_status
        }
      };

    } catch (error) {
      if (error instanceof ValidationError || 
          error instanceof DuplicateError) {
        throw error;
      }
      
      console.error('Provider registration error:', error);
      throw new DatabaseError('Failed to register provider');
    }
  }

  /**
   * Verify provider password
   * @param {string} plainPassword - Plain text password
   * @param {string} hashedPassword - Hashed password from database
   * @returns {boolean} Password verification result
   */
  async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
  }

  /**
   * Get provider by ID
   * @param {string} providerId - Provider ID
   * @returns {Object} Provider data
   */
  async getProviderById(providerId) {
    try {
      const provider = await this.providerRepository.findById(providerId);
      if (!provider) {
        throw new ValidationError('Provider not found');
      }
      return provider.getPublicProfile();
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      console.error('Get provider error:', error);
      throw new DatabaseError('Failed to retrieve provider');
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
      const validStatuses = ['pending', 'verified', 'rejected'];
      if (!validStatuses.includes(status)) {
        throw new ValidationError('Invalid verification status');
      }

      const updatedProvider = await this.providerRepository.updateVerificationStatus(providerId, status);
      if (!updatedProvider) {
        throw new ValidationError('Provider not found');
      }

      return {
        success: true,
        message: `Provider verification status updated to ${status}`,
        data: {
          provider_id: updatedProvider.id,
          verification_status: updatedProvider.verification_status
        }
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      console.error('Update verification status error:', error);
      throw new DatabaseError('Failed to update verification status');
    }
  }

  /**
   * Send verification email (placeholder implementation)
   * @param {string} email - Provider email
   * @param {string} providerId - Provider ID
   */
  async sendVerificationEmail(email, providerId) {
    try {
      // TODO: Implement actual email service integration
      console.log(`📧 Verification email sent to ${email} for provider ${providerId}`);
      
      // Placeholder for email service
      // await emailService.sendVerificationEmail(email, providerId);
      
    } catch (error) {
      console.error('Email sending error:', error);
      // Don't throw error as email failure shouldn't fail registration
    }
  }

  /**
   * Sanitize provider data for response
   * @param {Object} provider - Provider object
   * @returns {Object} Sanitized provider data
   */
  sanitizeProviderData(provider) {
    if (!provider) return null;
    
    const sanitized = { ...provider };
    delete sanitized.password_hash;
    delete sanitized.password;
    return sanitized;
  }
}

module.exports = ProviderService; 