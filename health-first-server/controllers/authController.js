const AuthService = require('../services/authService');
const { ValidationError } = require('../utils/errors');

class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Handle provider login
   * @param {Object} loginData - Login credentials
   * @returns {Object} Authentication result
   */
  async loginProvider(loginData) {
    try {
      // Sanitize and validate input
      const sanitizedData = this.sanitizeLoginInput(loginData);
      
      // Validate required fields
      this.validateLoginData(sanitizedData);
      
      // Authenticate provider
      const result = await this.authService.authenticateProvider(
        sanitizedData.email,
        sanitizedData.password
      );
      
      return result;
    } catch (error) {
      console.error('Provider login controller error:', error);
      throw error;
    }
  }

  /**
   * Handle token refresh
   * @param {string} refreshToken - Refresh token
   * @returns {Object} New access token
   */
  async refreshToken(refreshToken) {
    try {
      if (!refreshToken) {
        throw new ValidationError('Refresh token is required');
      }

      const result = await this.authService.refreshToken(refreshToken);
      return result;
    } catch (error) {
      console.error('Token refresh controller error:', error);
      throw error;
    }
  }

  /**
   * Handle provider logout
   * @param {string} token - JWT token to invalidate
   * @returns {Object} Logout result
   */
  async logoutProvider(token) {
    try {
      if (!token) {
        throw new ValidationError('Token is required');
      }

      const result = await this.authService.logout(token);
      return result;
    } catch (error) {
      console.error('Provider logout controller error:', error);
      throw error;
    }
  }

  /**
   * Get current provider profile
   * @param {Object} provider - Provider data from middleware
   * @returns {Object} Provider profile
   */
  async getCurrentProvider(provider) {
    try {
      if (!provider) {
        throw new ValidationError('Provider not authenticated');
      }

      return {
        success: true,
        message: 'Provider profile retrieved successfully',
        data: {
          provider: {
            id: provider.id,
            email: provider.email,
            role: provider.role,
            specialization: provider.specialization,
            verification_status: provider.verification_status
          }
        }
      };
    } catch (error) {
      console.error('Get current provider controller error:', error);
      throw error;
    }
  }

  /**
   * Validate JWT token
   * @param {string} token - JWT token to validate
   * @returns {Object} Validation result
   */
  async validateToken(token) {
    try {
      if (!token) {
        throw new ValidationError('Token is required');
      }

      const decoded = this.authService.verifyToken(token);
      
      return {
        success: true,
        message: 'Token is valid',
        data: {
          provider_id: decoded.provider_id,
          email: decoded.email,
          role: decoded.role,
          specialization: decoded.specialization,
          verification_status: decoded.verification_status,
          expires_at: new Date(decoded.exp * 1000).toISOString()
        }
      };
    } catch (error) {
      console.error('Token validation controller error:', error);
      throw error;
    }
  }

  /**
   * Sanitize login input data
   * @param {Object} data - Login input data
   * @returns {Object} Sanitized data
   */
  sanitizeLoginInput(data) {
    const sanitized = {};
    
    // Sanitize email
    if (data.email) {
      sanitized.email = String(data.email).trim().toLowerCase();
    }

    // Keep password as is (it will be verified)
    if (data.password) {
      sanitized.password = data.password;
    }

    return sanitized;
  }

  /**
   * Validate login data
   * @param {Object} data - Login data
   * @returns {boolean} Validation result
   */
  validateLoginData(data) {
    // Check required fields
    if (!data.email) {
      throw new ValidationError('Email is required');
    }

    if (!data.password) {
      throw new ValidationError('Password is required');
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(data.email)) {
      throw new ValidationError('Please provide a valid email address');
    }

    // Validate password length
    if (data.password.length < 1) {
      throw new ValidationError('Password cannot be empty');
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
      message: error.message || 'Authentication failed',
      error_code: this.getErrorCode(error),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get error code based on error type
   * @param {Error} error - Error object
   * @returns {string} Error code
   */
  getErrorCode(error) {
    if (error.name === 'ValidationError') {
      return 'VALIDATION_ERROR';
    } else if (error.name === 'AuthenticationError') {
      return 'INVALID_CREDENTIALS';
    } else if (error.name === 'TokenExpiredError') {
      return 'TOKEN_EXPIRED';
    } else if (error.name === 'JsonWebTokenError') {
      return 'INVALID_TOKEN';
    } else {
      return 'INTERNAL_ERROR';
    }
  }
}

module.exports = AuthController; 