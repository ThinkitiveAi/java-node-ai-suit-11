const PatientAuthService = require('../services/patientAuthService');
const { AuthenticationError, AuthorizationError } = require('../utils/errors');

class PatientAuthMiddleware {
  constructor() {
    this.patientAuthService = new PatientAuthService();
  }

  /**
   * Authenticate patient token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async authenticate(req, res, next) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message: 'Access token is required',
          error_code: 'MISSING_TOKEN'
        });
      }

      // Check if token starts with 'Bearer '
      if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token format. Use Bearer token',
          error_code: 'INVALID_TOKEN_FORMAT'
        });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Get patient from token
      const patient = await this.patientAuthService.getPatientFromToken(token);

      // Attach patient to request object
      req.patient = patient;
      req.token = token;

      next();

    } catch (error) {
      if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
        return res.status(error.statusCode || 401).json({
          success: false,
          message: error.message,
          error_code: error.constructor.name.toUpperCase().replace('ERROR', '_ERROR')
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Authentication failed',
        error_code: 'AUTHENTICATION_ERROR'
      });
    }
  }

  /**
   * Optional authentication (doesn't fail if no token)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async optionalAuth(req, res, next) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // No token provided, continue without authentication
        req.patient = null;
        req.token = null;
        return next();
      }

      const token = authHeader.substring(7);

      // Try to get patient from token
      const patient = await this.patientAuthService.getPatientFromToken(token);

      // Attach patient to request object
      req.patient = patient;
      req.token = token;

      next();

    } catch (error) {
      // Token is invalid, but we don't fail the request
      req.patient = null;
      req.token = null;
      next();
    }
  }

  /**
   * Authorize patient (check if patient exists and is active)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async authorize(req, res, next) {
    try {
      if (!req.patient) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          error_code: 'AUTHENTICATION_REQUIRED'
        });
      }

      // Check if patient is active
      if (!req.patient.is_active) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated. Please contact support.',
          error_code: 'ACCOUNT_DEACTIVATED'
        });
      }

      next();

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Authorization failed',
        error_code: 'AUTHORIZATION_ERROR'
      });
    }
  }

  /**
   * Rate limiting for authentication endpoints
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  authRateLimit(req, res, next) {
    // This is a basic rate limiting implementation
    // In production, you might want to use a more sophisticated rate limiting library
    
    const clientIP = req.ip || req.connection.remoteAddress;
    const currentTime = Date.now();
    
    // Simple in-memory rate limiting (not suitable for production)
    if (!req.app.locals.authAttempts) {
      req.app.locals.authAttempts = {};
    }

    if (!req.app.locals.authAttempts[clientIP]) {
      req.app.locals.authAttempts[clientIP] = {
        count: 0,
        resetTime: currentTime + (15 * 60 * 1000) // 15 minutes
      };
    }

    const attempts = req.app.locals.authAttempts[clientIP];

    // Reset counter if time window has passed
    if (currentTime > attempts.resetTime) {
      attempts.count = 0;
      attempts.resetTime = currentTime + (15 * 60 * 1000);
    }

    // Check if rate limit exceeded
    if (attempts.count >= 5) { // 5 attempts per 15 minutes
      return res.status(429).json({
        success: false,
        message: 'Too many authentication attempts. Please try again later.',
        error_code: 'RATE_LIMIT_EXCEEDED'
      });
    }

    // Increment counter
    attempts.count++;

    next();
  }

  /**
   * Check if patient owns the resource (for patient-specific operations)
   * @param {string} resourceIdParam - Parameter name containing the resource ID
   * @returns {Function} Middleware function
   */
  ownsResource(resourceIdParam = 'id') {
    return (req, res, next) => {
      try {
        if (!req.patient) {
          return res.status(401).json({
            success: false,
            message: 'Authentication required',
            error_code: 'AUTHENTICATION_REQUIRED'
          });
        }

        const resourceId = req.params[resourceIdParam];
        
        if (!resourceId) {
          return res.status(400).json({
            success: false,
            message: 'Resource ID is required',
            error_code: 'MISSING_RESOURCE_ID'
          });
        }

        // Check if the resource belongs to the authenticated patient
        if (resourceId !== req.patient._id.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Access denied. You can only access your own resources.',
            error_code: 'ACCESS_DENIED'
          });
        }

        next();

      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'Authorization failed',
          error_code: 'AUTHORIZATION_ERROR'
        });
      }
    };
  }
}

module.exports = PatientAuthMiddleware; 