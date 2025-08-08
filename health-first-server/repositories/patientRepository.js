const { Patient } = require('../models/Patient');
const { DatabaseError, NotFoundError } = require('../utils/errors');

class PatientRepository {
  constructor() {
    this.model = Patient;
  }

  /**
   * Create a new patient
   * @param {Object} patientData - Patient data
   * @returns {Promise<Object>} Created patient
   */
  async create(patientData) {
    try {
      const patient = new this.model(patientData);
      const savedPatient = await patient.save();
      return savedPatient;
    } catch (error) {
      if (error.code === 11000) {
        // MongoDB duplicate key error
        const field = Object.keys(error.keyPattern)[0];
        throw new DatabaseError(`${field} already exists`);
      }
      throw new DatabaseError(`Failed to create patient: ${error.message}`);
    }
  }

  /**
   * Find patient by ID
   * @param {string} id - Patient ID
   * @returns {Promise<Object|null>} Patient object or null
   */
  async findById(id) {
    try {
      const patient = await this.model.findById(id);
      return patient;
    } catch (error) {
      throw new DatabaseError(`Failed to find patient by ID: ${error.message}`);
    }
  }

  /**
   * Find patient by email
   * @param {string} email - Patient email
   * @returns {Promise<Object|null>} Patient object or null
   */
  async findByEmail(email) {
    try {
      const patient = await this.model.findOne({ email: email.toLowerCase() });
      return patient;
    } catch (error) {
      throw new DatabaseError(`Failed to find patient by email: ${error.message}`);
    }
  }

  /**
   * Find patient by phone number
   * @param {string} phoneNumber - Patient phone number
   * @returns {Promise<Object|null>} Patient object or null
   */
  async findByPhone(phoneNumber) {
    try {
      const patient = await this.model.findOne({ phone_number: phoneNumber });
      return patient;
    } catch (error) {
      throw new DatabaseError(`Failed to find patient by phone: ${error.message}`);
    }
  }

  /**
   * Update patient verification status
   * @param {string} id - Patient ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object|null>} Updated patient
   */
  async updateVerificationStatus(id, updateData) {
    try {
      const patient = await this.model.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!patient) {
        throw new NotFoundError('Patient not found');
      }
      
      return patient;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(`Failed to update patient verification status: ${error.message}`);
    }
  }

  /**
   * Get all patients with optional filtering
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options (limit, skip, sort)
   * @returns {Promise<Array>} Array of patients
   */
  async findAll(filters = {}, options = {}) {
    try {
      const { limit = 50, skip = 0, sort = { created_at: -1 } } = options;
      
      const query = this.model.find(filters)
        .limit(limit)
        .skip(skip)
        .sort(sort)
        .select('-password_hash'); // Exclude password hash
      
      const patients = await query;
      return patients;
    } catch (error) {
      throw new DatabaseError(`Failed to fetch patients: ${error.message}`);
    }
  }

  /**
   * Count patients with optional filtering
   * @param {Object} filters - Filter criteria
   * @returns {Promise<number>} Count of patients
   */
  async count(filters = {}) {
    try {
      const count = await this.model.countDocuments(filters);
      return count;
    } catch (error) {
      throw new DatabaseError(`Failed to count patients: ${error.message}`);
    }
  }

  /**
   * Update patient by ID
   * @param {string} id - Patient ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object|null>} Updated patient
   */
  async updateById(id, updateData) {
    try {
      const patient = await this.model.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!patient) {
        throw new NotFoundError('Patient not found');
      }
      
      return patient;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new DatabaseError(`${field} already exists`);
      }
      throw new DatabaseError(`Failed to update patient: ${error.message}`);
    }
  }

  /**
   * Delete patient by ID
   * @param {string} id - Patient ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteById(id) {
    try {
      const result = await this.model.findByIdAndDelete(id);
      
      if (!result) {
        throw new NotFoundError('Patient not found');
      }
      
      return true;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(`Failed to delete patient: ${error.message}`);
    }
  }

  /**
   * Search patients by various criteria
   * @param {string} searchTerm - Search term
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Array of matching patients
   */
  async search(searchTerm, options = {}) {
    try {
      const { limit = 50, skip = 0 } = options;
      
      const searchQuery = {
        $or: [
          { first_name: { $regex: searchTerm, $options: 'i' } },
          { last_name: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } },
          { phone_number: { $regex: searchTerm, $options: 'i' } }
        ],
        is_active: true
      };
      
      const patients = await this.model.find(searchQuery)
        .limit(limit)
        .skip(skip)
        .sort({ created_at: -1 })
        .select('-password_hash');
      
      return patients;
    } catch (error) {
      throw new DatabaseError(`Failed to search patients: ${error.message}`);
    }
  }

  /**
   * Check if email exists
   * @param {string} email - Email to check
   * @returns {Promise<boolean>} True if exists
   */
  async emailExists(email) {
    try {
      const count = await this.model.countDocuments({ email: email.toLowerCase() });
      return count > 0;
    } catch (error) {
      throw new DatabaseError(`Failed to check email existence: ${error.message}`);
    }
  }

  /**
   * Check if phone number exists
   * @param {string} phoneNumber - Phone number to check
   * @returns {Promise<boolean>} True if exists
   */
  async phoneExists(phoneNumber) {
    try {
      const count = await this.model.countDocuments({ phone_number: phoneNumber });
      return count > 0;
    } catch (error) {
      throw new DatabaseError(`Failed to check phone existence: ${error.message}`);
    }
  }
}

module.exports = PatientRepository; 