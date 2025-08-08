const AuthService = require('../services/authService');
const { AuthenticationError } = require('../utils/errors');

class AuthMiddleware {
  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Extract JWT token from Authorization header
   * @param {Object} req - Express request object
   * @returns {string|null} JWT token or null
   */
  extractToken(req) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  /**
   * Authentication middleware
   * Extracts JWT from Authorization header, verifies it, and attaches provider data
   */
  authenticate() {
    return async (req, res, next) => {
      try {
        // Extract token from Authorization header
        const token = this.extractToken(req);
        
        if (!token) {
          throw new AuthenticationError('Access token is required');
        }

        // Verify token
        const decoded = this.authService.verifyToken(token);
        
        // Attach provider data to request
        req.provider = {
          id: decoded.provider_id,
          email: decoded.email,
          role: decoded.role,
          specialization: decoded.specialization,
          verification_status: decoded.verification_status
        };

        next();
      } catch (error) {
        console.error('Authentication middleware error:', error);
        
        if (error instanceof AuthenticationError) {
          return res.status(401).json({
            success: false,
            message: error.message,
            error_code: 'AUTHENTICATION_FAILED'
          });
        }

        return res.status(500).json({
          success: false,
          message: 'Authentication error',
          error_code: 'INTERNAL_ERROR'
        });
      }
    };
  }

  /**
   * Authorization middleware
   * Checks if provider has required role and permissions
   * @param {string} requiredRole - Required role for access
   * @param {boolean} requireVerified - Whether account must be verified
   */
  authorize(requiredRole = 'provider', requireVerified = true) {
    return (req, res, next) => {
      try {
        // Check if provider data exists (authentication must be called first)
        if (!req.provider) {
          throw new AuthenticationError('Provider not authenticated');
        }

        // Check role
        if (req.provider.role !== requiredRole) {
          return res.status(403).json({
            success: false,
            message: 'Insufficient permissions',
            error_code: 'INSUFFICIENT_PERMISSIONS'
          });
        }

        // Check verification status if required
        if (requireVerified && req.provider.verification_status !== 'verified') {
          return res.status(403).json({
            success: false,
            message: 'Account not verified',
            error_code: 'ACCOUNT_NOT_VERIFIED'
          });
        }

        next();
      } catch (error) {
        console.error('Authorization middleware error:', error);
        
        if (error instanceof AuthenticationError) {
          return res.status(401).json({
            success: false,
            message: error.message,
            error_code: 'AUTHENTICATION_FAILED'
          });
        }

        return res.status(500).json({
          success: false,
          message: 'Authorization error',
          error_code: 'INTERNAL_ERROR'
        });
      }
    };
  }

  /**
   * Provider authorization middleware
   * Specifically for provider-only endpoints
   */
  authorizeProvider() {
    return this.authorize('provider', true);
  }

  /**
   * Optional authentication middleware
   * Similar to authenticate but doesn't require token
   * Useful for endpoints that can work with or without authentication
   */
  optionalAuth() {
    return async (req, res, next) => {
      try {
        const token = this.extractToken(req);
        
        if (token) {
          try {
            const decoded = this.authService.verifyToken(token);
            req.provider = {
              id: decoded.provider_id,
              email: decoded.email,
              role: decoded.role,
              specialization: decoded.specialization,
              verification_status: decoded.verification_status
            };
          } catch (tokenError) {
            // Token is invalid but we continue without authentication
            console.warn('Invalid token in optional auth:', tokenError.message);
          }
        }

        next();
      } catch (error) {
        console.error('Optional authentication middleware error:', error);
        next();
      }
    };
  }

  /**
   * Rate limiting middleware for authentication endpoints
   * Prevents brute force attacks
   */
  authRateLimit() {
    return (req, res, next) => {
      // This is a basic implementation
      // In production, you might want to use a more sophisticated rate limiting solution
      // like express-rate-limit with Redis storage
      
      const clientIP = req.ip || req.connection.remoteAddress;
      const now = Date.now();
      
      // Simple in-memory rate limiting (not suitable for production with multiple instances)
      if (!req.app.locals.authAttempts) {
        req.app.locals.authAttempts = new Map();
      }

      const attempts = req.app.locals.authAttempts.get(clientIP) || { count: 0, resetTime: now + 900000 }; // 15 minutes
      
      if (now > attempts.resetTime) {
        attempts.count = 0;
        attempts.resetTime = now + 900000;
      }

      if (attempts.count >= 5) { // Max 5 attempts per 15 minutes
        return res.status(429).json({
          success: false,
          message: 'Too many authentication attempts. Please try again later.',
          error_code: 'RATE_LIMIT_EXCEEDED'
        });
      }

      attempts.count++;
      req.app.locals.authAttempts.set(clientIP, attempts);

      next();
    };
  }
}

module.exports = AuthMiddleware; 