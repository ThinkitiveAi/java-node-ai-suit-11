const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const PatientRepository = require('../repositories/patientRepository');
const { ValidationError, AuthenticationError, AuthorizationError } = require('../utils/errors');

class PatientAuthService {
  constructor() {
    this.patientRepository = new PatientRepository();
  }

  /**
   * Authenticate patient login
   * @param {Object} loginData - Login credentials
   * @returns {Promise<Object>} Authentication result with JWT token
   */
  async authenticatePatient(loginData) {
    try {
      // Validate input data
      const { error, value } = this.validateLoginInput(loginData);
      if (error) {
        throw new ValidationError('Login validation failed', error);
      }

      // Find patient by email
      const patient = await this.patientRepository.findByEmail(value.email);
      if (!patient) {
        throw new AuthenticationError('Invalid credentials');
      }

      // Check if patient is active
      if (!patient.is_active) {
        throw new AuthorizationError('Account is deactivated. Please contact support.');
      }

      // Verify password
      const isPasswordValid = await patient.comparePassword(value.password);
      if (!isPasswordValid) {
        throw new AuthenticationError('Invalid credentials');
      }

      // Generate JWT token
      const token = this.generateToken(patient);

      // Return success response
      return {
        success: true,
        message: 'Login successful',
        data: {
          access_token: token,
          expires_in: 1800, // 30 minutes
          token_type: 'Bearer',
          patient: patient.getPublicProfile()
        }
      };

    } catch (error) {
      if (error instanceof ValidationError || 
          error instanceof AuthenticationError || 
          error instanceof AuthorizationError) {
        throw error;
      }
      throw new AuthenticationError('Authentication failed');
    }
  }

  /**
   * Validate login input data
   * @param {Object} data - Login data to validate
   * @returns {Object} Validation result
   */
  validateLoginInput(data) {
    const errors = {};

    // Validate email
    if (!data.email || typeof data.email !== 'string') {
      errors.email = ['Email is required'];
    } else {
      const email = data.email.trim().toLowerCase();
      const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
      
      if (!emailRegex.test(email)) {
        errors.email = ['Please provide a valid email address'];
      }
    }

    // Validate password
    if (!data.password || typeof data.password !== 'string') {
      errors.password = ['Password is required'];
    } else if (data.password.trim().length === 0) {
      errors.password = ['Password cannot be empty'];
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      data: {
        email: data.email ? data.email.trim().toLowerCase() : '',
        password: data.password || ''
      }
    };
  }

  /**
   * Generate JWT token for patient
   * @param {Object} patient - Patient object
   * @returns {string} JWT token
   */
  generateToken(patient) {
    const payload = {
      patient_id: patient._id,
      email: patient.email,
      role: 'patient',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 1800 // 30 minutes
    };

    const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-change-in-production';
    
    return jwt.sign(payload, secret, {
      algorithm: 'HS256',
      expiresIn: '30m'
    });
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token to verify
   * @returns {Object} Decoded token payload
   */
  verifyToken(token) {
    try {
      const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-change-in-production';
      const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
      
      return {
        isValid: true,
        payload: decoded
      };
    } catch (error) {
      return {
        isValid: false,
        error: error.message
      };
    }
  }

  /**
   * Get patient from token
   * @param {string} token - JWT token
   * @returns {Promise<Object>} Patient data
   */
  async getPatientFromToken(token) {
    try {
      const verification = this.verifyToken(token);
      
      if (!verification.isValid) {
        throw new AuthenticationError('Invalid token');
      }

      const { patient_id } = verification.payload;
      const patient = await this.patientRepository.findById(patient_id);
      
      if (!patient) {
        throw new AuthenticationError('Patient not found');
      }

      if (!patient.is_active) {
        throw new AuthorizationError('Account is deactivated');
      }

      return patient;
    } catch (error) {
      if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
        throw error;
      }
      throw new AuthenticationError('Token verification failed');
    }
  }

  /**
   * Refresh patient token
   * @param {string} token - Current JWT token
   * @returns {Promise<Object>} New token data
   */
  async refreshToken(token) {
    try {
      const patient = await this.getPatientFromToken(token);
      const newToken = this.generateToken(patient);

      return {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          access_token: newToken,
          expires_in: 1800,
          token_type: 'Bearer',
          patient: patient.getPublicProfile()
        }
      };
    } catch (error) {
      throw new AuthenticationError('Token refresh failed');
    }
  }

  /**
   * Logout patient (blacklist token if needed)
   * @param {string} token - JWT token to logout
   * @returns {Promise<Object>} Logout result
   */
  async logoutPatient(token) {
    try {
      // In a production environment, you might want to blacklist the token
      // For now, we'll just return a success response
      
      return {
        success: true,
        message: 'Logout successful'
      };
    } catch (error) {
      throw new AuthenticationError('Logout failed');
    }
  }

  /**
   * Get current patient profile
   * @param {string} token - JWT token
   * @returns {Promise<Object>} Patient profile
   */
  async getCurrentPatient(token) {
    try {
      const patient = await this.getPatientFromToken(token);
      
      return {
        success: true,
        data: patient.getPublicProfile()
      };
    } catch (error) {
      throw new AuthenticationError('Failed to get patient profile');
    }
  }
}

module.exports = PatientAuthService; 