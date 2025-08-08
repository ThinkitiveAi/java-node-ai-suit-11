const { 
  ValidationError, 
  DuplicateError, 
  DatabaseError, 
  AuthenticationError, 
  AuthorizationError, 
  NotFoundError, 
  RateLimitError 
} = require('../utils/errors');

/**
 * Global error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error response
  let statusCode = 500;
  let message = 'Internal server error';
  let errorCode = 'INTERNAL_ERROR';

  // Handle custom error types
  if (err instanceof ValidationError) {
    statusCode = 400;
    message = err.message;
    errorCode = 'VALIDATION_ERROR';
  } else if (err instanceof DuplicateError) {
    statusCode = 409;
    message = err.message;
    errorCode = 'DUPLICATE_ERROR';
  } else if (err instanceof DatabaseError) {
    statusCode = 500;
    message = 'Database operation failed';
    errorCode = 'DATABASE_ERROR';
  } else if (err instanceof AuthenticationError) {
    statusCode = 401;
    message = err.message;
    errorCode = 'AUTHENTICATION_ERROR';
  } else if (err instanceof AuthorizationError) {
    statusCode = 403;
    message = err.message;
    errorCode = 'AUTHORIZATION_ERROR';
  } else if (err instanceof NotFoundError) {
    statusCode = 404;
    message = err.message;
    errorCode = 'NOT_FOUND_ERROR';
  } else if (err instanceof RateLimitError) {
    statusCode = 429;
    message = err.message;
    errorCode = 'RATE_LIMIT_ERROR';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
    errorCode = 'TOKEN_EXPIRED';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    errorCode = 'INVALID_TOKEN';
  } else if (err.name === 'ValidationError' && err.isJoi) {
    statusCode = 400;
    message = err.details.map(detail => detail.message).join(', ');
    errorCode = 'VALIDATION_ERROR';
  } else if (err.code === 'ECONNREFUSED') {
    statusCode = 503;
    message = 'Service temporarily unavailable';
    errorCode = 'SERVICE_UNAVAILABLE';
  }

  // Build error response
  const errorResponse = {
    success: false,
    message: message,
    error_code: errorCode,
    timestamp: new Date().toISOString()
  };

  // Include stack trace only in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.details = {
      name: err.name,
      statusCode: statusCode
    };
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler; 