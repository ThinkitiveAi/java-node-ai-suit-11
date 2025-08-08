const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const PatientRepository = require('../repositories/patientRepository');
const { ValidationError, DuplicateError, DatabaseError } = require('../utils/errors');
const { patientValidationSchema } = require('../models/Patient');

class PatientService {
  constructor() {
    this.patientRepository = new PatientRepository();
  }

  /**
   * Register a new patient
   * @param {Object} patientData - Patient registration data
   * @returns {Promise<Object>} Registration result
   */
  async registerPatient(patientData) {
    try {
      // Validate input data
      const { error, value } = patientValidationSchema.validate(patientData, {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        const errors = {};
        error.details.forEach(detail => {
          const field = detail.path.join('.');
          if (!errors[field]) {
            errors[field] = [];
          }
          errors[field].push(detail.message);
        });
        throw new ValidationError('Validation failed', errors);
      }

      // Check for duplicate email
      const emailExists = await this.patientRepository.emailExists(value.email);
      if (emailExists) {
        throw new DuplicateError('Email is already registered');
        }

      // Check for duplicate phone number
      const phoneExists = await this.patientRepository.phoneExists(value.phone_number);
      if (phoneExists) {
        throw new DuplicateError('Phone number is already registered');
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
      const passwordHash = await bcrypt.hash(value.password, saltRounds);

      // Prepare patient data for database
      const patientDataForDB = {
        first_name: value.first_name,
        last_name: value.last_name,
        email: value.email.toLowerCase(),
        phone_number: value.phone_number,
        password_hash: passwordHash,
        date_of_birth: new Date(value.date_of_birth),
        gender: value.gender,
        address: value.address,
        emergency_contact: value.emergency_contact || null,
        medical_history: value.medical_history || [],
        insurance_info: value.insurance_info || null,
        email_verified: false,
        phone_verified: false,
        is_active: true
      };

      // Save patient to database
      const savedPatient = await this.patientRepository.create(patientDataForDB);

      // Send verification email (placeholder for future implementation)
      await this.sendVerificationEmail(savedPatient.email, savedPatient._id);

      // Return success response
      return {
        success: true,
        message: 'Patient registered successfully. Verification email sent.',
        data: {
          patient_id: savedPatient._id,
          email: savedPatient.email,
          phone_number: savedPatient.phone_number,
          email_verified: savedPatient.email_verified,
          phone_verified: savedPatient.phone_verified
        }
      };

    } catch (error) {
      if (error instanceof ValidationError || error instanceof DuplicateError) {
        throw error;
      }
      throw new DatabaseError(`Failed to register patient: ${error.message}`);
    }
  }

  /**
   * Get patient by ID
   * @param {string} patientId - Patient ID
   * @returns {Promise<Object>} Patient data
   */
  async getPatientById(patientId) {
    try {
      const patient = await this.patientRepository.findById(patientId);
      
      if (!patient) {
        throw new Error('Patient not found');
      }

      return patient.getPublicProfile();
    } catch (error) {
      throw new DatabaseError(`Failed to get patient: ${error.message}`);
    }
  }

  /**
   * Get all patients with optional filtering
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Patients data with pagination
   */
  async getAllPatients(filters = {}, options = {}) {
    try {
      const { page = 1, limit = 50 } = options;
      const skip = (page - 1) * limit;

      const patients = await this.patientRepository.findAll(filters, {
        limit,
        skip,
        sort: { created_at: -1 }
      });

      const total = await this.patientRepository.count(filters);

      return {
        success: true,
        data: {
          patients: patients.map(patient => patient.getPublicProfile()),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };
    } catch (error) {
      throw new DatabaseError(`Failed to get patients: ${error.message}`);
    }
  }

  /**
   * Update patient verification status
   * @param {string} patientId - Patient ID
   * @param {Object} verificationData - Verification data
   * @returns {Promise<Object>} Updated patient data
   */
  async updateVerificationStatus(patientId, verificationData) {
    try {
      const updatedPatient = await this.patientRepository.updateVerificationStatus(
        patientId,
        verificationData
      );

      return {
        success: true,
        message: 'Patient verification status updated successfully',
        data: updatedPatient.getPublicProfile()
      };
    } catch (error) {
      throw new DatabaseError(`Failed to update verification status: ${error.message}`);
    }
  }

  /**
   * Search patients
   * @param {string} searchTerm - Search term
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results
   */
  async searchPatients(searchTerm, options = {}) {
    try {
      const { page = 1, limit = 50 } = options;
      const skip = (page - 1) * limit;

      const patients = await this.patientRepository.search(searchTerm, {
        limit,
        skip
      });

      return {
        success: true,
        data: {
          patients: patients.map(patient => patient.getPublicProfile()),
          search_term: searchTerm,
          total: patients.length
        }
      };
    } catch (error) {
      throw new DatabaseError(`Failed to search patients: ${error.message}`);
    }
  }

  /**
   * Update patient data
   * @param {string} patientId - Patient ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated patient data
   */
  async updatePatient(patientId, updateData) {
    try {
      // Remove sensitive fields from update data
      const { password, confirm_password, password_hash, ...safeUpdateData } = updateData;

      const updatedPatient = await this.patientRepository.updateById(patientId, safeUpdateData);

      return {
        success: true,
        message: 'Patient updated successfully',
        data: updatedPatient.getPublicProfile()
      };
    } catch (error) {
      throw new DatabaseError(`Failed to update patient: ${error.message}`);
    }
  }

  /**
   * Delete patient
   * @param {string} patientId - Patient ID
   * @returns {Promise<Object>} Deletion result
   */
  async deletePatient(patientId) {
    try {
      await this.patientRepository.deleteById(patientId);

      return {
        success: true,
        message: 'Patient deleted successfully'
      };
    } catch (error) {
      throw new DatabaseError(`Failed to delete patient: ${error.message}`);
    }
  }

  /**
   * Send verification email (placeholder for future implementation)
   * @param {string} email - Patient email
   * @param {string} patientId - Patient ID
   * @returns {Promise<void>}
   */
  async sendVerificationEmail(email, patientId) {
    try {
      // TODO: Implement email service integration
      console.log(`📧 Verification email would be sent to: ${email} for patient: ${patientId}`);
      
      // Placeholder for email service
      // const emailService = new EmailService();
      // await emailService.sendVerificationEmail(email, patientId);
      
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Don't throw error as email sending failure shouldn't prevent registration
    }
  }

  /**
   * Validate patient data
   * @param {Object} data - Patient data to validate
   * @returns {Promise<Object>} Validation result
   */
  async validatePatientData(data) {
    try {
      const { error, value } = patientValidationSchema.validate(data, {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        const errors = {};
        error.details.forEach(detail => {
          const field = detail.path.join('.');
          if (!errors[field]) {
            errors[field] = [];
          }
          errors[field].push(detail.message);
        });
        return {
          isValid: false,
          errors
        };
      }

      return {
        isValid: true,
        data: value
      };
    } catch (error) {
      return {
        isValid: false,
        errors: { general: ['Validation failed'] }
      };
    }
  }
}

module.exports = PatientService; 