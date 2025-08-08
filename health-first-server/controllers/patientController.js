const PatientService = require('../services/patientService');
const { ValidationError, DuplicateError, DatabaseError } = require('../utils/errors');

class PatientController {
  constructor() {
    this.patientService = new PatientService();
  }

  /**
   * Register a new patient
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async registerPatient(req, res, next) {
    try {
      // Sanitize input data
      const sanitizedData = this.sanitizePatientData(req.body);

      // Register patient
      const result = await this.patientService.registerPatient(sanitizedData);

      res.status(201).json(result);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get patient by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getPatientById(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Patient ID is required',
          error_code: 'MISSING_ID'
        });
      }

      const patient = await this.patientService.getPatientById(id);

      res.status(200).json({
        success: true,
        data: patient
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all patients with optional filtering
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getAllPatients(req, res, next) {
    try {
      const { page = 1, limit = 50, is_active, gender } = req.query;
      
      // Build filters
      const filters = {};
      if (is_active !== undefined) {
        filters.is_active = is_active === 'true';
      }
      if (gender) {
        filters.gender = gender;
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit)
      };

      const result = await this.patientService.getAllPatients(filters, options);

      res.status(200).json(result);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Update patient verification status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async updateVerificationStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { email_verified, phone_verified } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Patient ID is required',
          error_code: 'MISSING_ID'
        });
      }

      const verificationData = {};
      if (email_verified !== undefined) {
        verificationData.email_verified = email_verified;
      }
      if (phone_verified !== undefined) {
        verificationData.phone_verified = phone_verified;
      }

      const result = await this.patientService.updateVerificationStatus(id, verificationData);

      res.status(200).json(result);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Search patients
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async searchPatients(req, res, next) {
    try {
      const { q, page = 1, limit = 50 } = req.query;

      if (!q || q.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Search term is required',
          error_code: 'MISSING_SEARCH_TERM'
        });
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit)
      };

      const result = await this.patientService.searchPatients(q.trim(), options);

      res.status(200).json(result);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Update patient data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async updatePatient(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Patient ID is required',
          error_code: 'MISSING_ID'
        });
      }

      // Sanitize update data
      const sanitizedData = this.sanitizePatientData(updateData);

      const result = await this.patientService.updatePatient(id, sanitizedData);

      res.status(200).json(result);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete patient
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async deletePatient(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Patient ID is required',
          error_code: 'MISSING_ID'
        });
      }

      const result = await this.patientService.deletePatient(id);

      res.status(200).json(result);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate patient data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async validatePatientData(req, res, next) {
    try {
      const patientData = req.body;

      const result = await this.patientService.validatePatientData(patientData);

      if (result.isValid) {
        res.status(200).json({
          success: true,
          message: 'Patient data is valid',
          data: result.data
        });
      } else {
        res.status(422).json({
          success: false,
          message: 'Validation failed',
          errors: result.errors
        });
      }

    } catch (error) {
      next(error);
    }
  }

  /**
   * Sanitize patient data
   * @param {Object} data - Raw patient data
   * @returns {Object} Sanitized patient data
   */
  sanitizePatientData(data) {
    const sanitized = {};

    // Basic string fields
    const stringFields = [
      'first_name', 'last_name', 'email', 'phone_number',
      'password', 'confirm_password', 'gender'
    ];

    stringFields.forEach(field => {
      if (data[field] !== undefined) {
        sanitized[field] = typeof data[field] === 'string' ? data[field].trim() : data[field];
      }
    });

    // Address object
    if (data.address) {
      sanitized.address = {};
      if (data.address.street) {
        sanitized.address.street = typeof data.address.street === 'string' ? data.address.street.trim() : data.address.street;
      }
      if (data.address.city) {
        sanitized.address.city = typeof data.address.city === 'string' ? data.address.city.trim() : data.address.city;
      }
      if (data.address.state) {
        sanitized.address.state = typeof data.address.state === 'string' ? data.address.state.trim() : data.address.state;
      }
      if (data.address.zip) {
        sanitized.address.zip = typeof data.address.zip === 'string' ? data.address.zip.trim() : data.address.zip;
      }
    }

    // Emergency contact object
    if (data.emergency_contact) {
      sanitized.emergency_contact = {};
      if (data.emergency_contact.name) {
        sanitized.emergency_contact.name = typeof data.emergency_contact.name === 'string' ? data.emergency_contact.name.trim() : data.emergency_contact.name;
      }
      if (data.emergency_contact.phone) {
        sanitized.emergency_contact.phone = typeof data.emergency_contact.phone === 'string' ? data.emergency_contact.phone.trim() : data.emergency_contact.phone;
      }
      if (data.emergency_contact.relationship) {
        sanitized.emergency_contact.relationship = typeof data.emergency_contact.relationship === 'string' ? data.emergency_contact.relationship.trim() : data.emergency_contact.relationship;
      }
    }

    // Insurance info object
    if (data.insurance_info) {
      sanitized.insurance_info = {};
      if (data.insurance_info.provider) {
        sanitized.insurance_info.provider = typeof data.insurance_info.provider === 'string' ? data.insurance_info.provider.trim() : data.insurance_info.provider;
      }
      if (data.insurance_info.policy_number) {
        sanitized.insurance_info.policy_number = typeof data.insurance_info.policy_number === 'string' ? data.insurance_info.policy_number.trim() : data.insurance_info.policy_number;
      }
    }

    // Medical history array
    if (data.medical_history && Array.isArray(data.medical_history)) {
      sanitized.medical_history = data.medical_history.map(item => 
        typeof item === 'string' ? item.trim() : item
      );
    }

    // Date fields
    if (data.date_of_birth) {
      sanitized.date_of_birth = data.date_of_birth;
    }

    // Boolean fields
    if (data.email_verified !== undefined) {
      sanitized.email_verified = Boolean(data.email_verified);
    }
    if (data.phone_verified !== undefined) {
      sanitized.phone_verified = Boolean(data.phone_verified);
    }
    if (data.is_active !== undefined) {
      sanitized.is_active = Boolean(data.is_active);
    }

    return sanitized;
  }
}

module.exports = PatientController; 