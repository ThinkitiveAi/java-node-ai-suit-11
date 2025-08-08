const PatientAuthService = require('../services/patientAuthService');
const { ValidationError, AuthenticationError, AuthorizationError } = require('../utils/errors');

class PatientAuthController {
  constructor() {
    this.patientAuthService = new PatientAuthService();
  }

  /**
   * Patient login
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async login(req, res, next) {
    try {
      // Sanitize input data
      const sanitizedData = this.sanitizeLoginData(req.body);

      // Authenticate patient
      const result = await this.patientAuthService.authenticatePatient(sanitizedData);

      res.status(200).json(result);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh patient token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async refreshToken(req, res, next) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token is required',
          error_code: 'MISSING_TOKEN'
        });
      }

      const result = await this.patientAuthService.refreshToken(token);

      res.status(200).json(result);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Patient logout
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async logout(req, res, next) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token is required',
          error_code: 'MISSING_TOKEN'
        });
      }

      const result = await this.patientAuthService.logoutPatient(token);

      res.status(200).json(result);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current patient profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getCurrentPatient(req, res, next) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Access token is required',
          error_code: 'MISSING_TOKEN'
        });
      }

      const result = await this.patientAuthService.getCurrentPatient(token);

      res.status(200).json(result);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate patient token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async validateToken(req, res, next) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token is required',
          error_code: 'MISSING_TOKEN'
        });
      }

      const verification = this.patientAuthService.verifyToken(token);

      if (verification.isValid) {
        res.status(200).json({
          success: true,
          message: 'Token is valid',
          data: {
            payload: verification.payload
          }
        });
      } else {
        res.status(401).json({
          success: false,
          message: 'Token is invalid',
          error_code: 'INVALID_TOKEN'
        });
      }

    } catch (error) {
      next(error);
    }
  }

  /**
   * Sanitize login data
   * @param {Object} data - Raw login data
   * @returns {Object} Sanitized login data
   */
  sanitizeLoginData(data) {
    const sanitized = {};

    // Sanitize email
    if (data.email !== undefined) {
      sanitized.email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : data.email;
    }

    // Sanitize password
    if (data.password !== undefined) {
      sanitized.password = typeof data.password === 'string' ? data.password.trim() : data.password;
    }

    return sanitized;
  }
}

module.exports = PatientAuthController; 