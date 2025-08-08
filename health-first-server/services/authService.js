const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Provider } = require('../models/Provider');
const { AuthenticationError, ValidationError } = require('../utils/errors');

class AuthService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here';
    this.jwtExpiry = process.env.JWT_EXPIRY || '1h';
    this.saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  }

  /**
   * Authenticate provider with email and password
   * @param {string} email - Provider email
   * @param {string} password - Provider password
   * @returns {Object} Authentication result with JWT token
   */
  async authenticateProvider(email, password) {
    try {
      // Validate input
      if (!email || !password) {
        throw new ValidationError('Email and password are required');
      }

      // Find provider by email
      const provider = await Provider.findOne({ email: email.toLowerCase() });
      
      if (!provider) {
        throw new AuthenticationError('Invalid credentials');
      }

      // Check if provider account is active
      if (!provider.is_active) {
        throw new AuthenticationError('Account is deactivated');
      }

      // Check if provider is verified
      if (provider.verification_status !== 'verified') {
        throw new AuthenticationError('Account is not verified. Please contact administrator.');
      }

      // Verify password
      const isPasswordValid = await this.verifyPassword(password, provider.password_hash);
      
      if (!isPasswordValid) {
        throw new AuthenticationError('Invalid credentials');
      }

      // Generate JWT token
      const token = this.generateToken(provider);

      // Return authentication result
      return {
        success: true,
        message: 'Login successful',
        data: {
          access_token: token,
          expires_in: 3600, // 1 hour in seconds
          token_type: 'Bearer',
          provider: this.sanitizeProviderData(provider)
        }
      };

    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  /**
   * Verify password against hash
   * @param {string} password - Plain text password
   * @param {string} hash - Hashed password
   * @returns {boolean} Password validity
   */
  async verifyPassword(password, hash) {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
  }

  /**
   * Generate JWT token for provider
   * @param {Object} provider - Provider object
   * @returns {string} JWT token
   */
  generateToken(provider) {
    const payload = {
      provider_id: provider._id,
      email: provider.email,
      role: 'provider',
      specialization: provider.specialization,
      verification_status: provider.verification_status,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
    };

    return jwt.sign(payload, this.jwtSecret, { expiresIn: this.jwtExpiry });
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Object} Decoded token payload
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AuthenticationError('Token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new AuthenticationError('Invalid token');
      } else {
        throw new AuthenticationError('Token verification failed');
      }
    }
  }

  /**
   * Hash password
   * @param {string} password - Plain text password
   * @returns {string} Hashed password
   */
  async hashPassword(password) {
    try {
      return await bcrypt.hash(password, this.saltRounds);
    } catch (error) {
      console.error('Password hashing error:', error);
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Sanitize provider data for response
   * @param {Object} provider - Provider object
   * @returns {Object} Sanitized provider data
   */
  sanitizeProviderData(provider) {
    return {
      id: provider._id,
      first_name: provider.first_name,
      last_name: provider.last_name,
      email: provider.email,
      phone_number: provider.phone_number,
      specialization: provider.specialization,
      license_number: provider.license_number,
      years_of_experience: provider.years_of_experience,
      clinic_address: provider.clinic_address,
      verification_status: provider.verification_status,
      is_active: provider.is_active,
      created_at: provider.createdAt,
      updated_at: provider.updatedAt
    };
  }

  /**
   * Refresh token (for future implementation)
   * @param {string} refreshToken - Refresh token
   * @returns {Object} New access token
   */
  async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, this.jwtSecret);
      
      // Get provider data
      const provider = await Provider.findById(decoded.provider_id);
      
      if (!provider || !provider.is_active) {
        throw new AuthenticationError('Invalid refresh token');
      }

      // Generate new access token
      const newToken = this.generateToken(provider);

      return {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          access_token: newToken,
          expires_in: 3600,
          token_type: 'Bearer'
        }
      };

    } catch (error) {
      console.error('Token refresh error:', error);
      throw new AuthenticationError('Failed to refresh token');
    }
  }

  /**
   * Logout provider (for future implementation)
   * @param {string} token - JWT token to invalidate
   * @returns {Object} Logout result
   */
  async logout(token) {
    try {
      // In a production environment, you might want to add the token to a blacklist
      // For now, we'll just return a success message
      
      return {
        success: true,
        message: 'Logout successful'
      };

    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Failed to logout');
    }
  }
}

module.exports = AuthService; 