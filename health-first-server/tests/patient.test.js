const request = require('supertest');
const mongoose = require('mongoose');
const { Patient } = require('../models/Patient');
const { patientValidationSchema } = require('../models/Patient');

// Import the app
const app = require('../server');

describe('Patient Module Tests', () => {
  let testPatientId;
  let testPatientData;

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/health_first_test';
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await Patient.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Patient.deleteMany({});
    
    testPatientData = {
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@email.com',
      phone_number: '+1234567890',
      password: 'SecurePassword123!',
      confirm_password: 'SecurePassword123!',
      date_of_birth: '1990-05-15',
      gender: 'female',
      address: {
        street: '456 Main Street',
        city: 'Boston',
        state: 'MA',
        zip: '02101'
      },
      emergency_contact: {
        name: 'John Smith',
        phone: '+1234567891',
        relationship: 'spouse'
      },
      insurance_info: {
        provider: 'Blue Cross',
        policy_number: 'BC123456789'
      }
    };
  });

  describe('Patient Registration API', () => {
    test('should register a new patient successfully', async () => {
      const response = await request(app)
        .post('/api/v1/patient/register')
        .send(testPatientData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('patient_id');
      expect(response.body.data.email).toBe(testPatientData.email);
      
      testPatientId = response.body.data.patient_id;
    });

    test('should reject duplicate email registration', async () => {
      await request(app)
        .post('/api/v1/patient/register')
        .send(testPatientData)
        .expect(201);

      const duplicateData = { ...testPatientData, phone_number: '+1234567892' };
      const response = await request(app)
        .post('/api/v1/patient/register')
        .send(duplicateData)
        .expect(409);

      expect(response.body.message).toContain('Email is already registered');
    });

    test('should reject invalid patient data', async () => {
      const invalidData = { ...testPatientData, email: 'invalid-email' };
      const response = await request(app)
        .post('/api/v1/patient/register')
        .send(invalidData)
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toHaveProperty('email');
    });
  });

  describe('Patient Retrieval API', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/v1/patient/register')
        .send(testPatientData);
      testPatientId = response.body.data.patient_id;
    });

    test('should get patient by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/patient/${testPatientId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id', testPatientId);
      expect(response.body.data.first_name).toBe(testPatientData.first_name);
      expect(response.body.data).not.toHaveProperty('password_hash');
    });

    test('should get all patients with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/patient?page=1&limit=10')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('pagination');
    });
  });

  describe('Patient Verification API', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/v1/patient/register')
        .send(testPatientData);
      testPatientId = response.body.data.patient_id;
    });

    test('should update email verification status', async () => {
      const response = await request(app)
        .patch(`/api/v1/patient/${testPatientId}/verify`)
        .send({ email_verified: true })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email_verified).toBe(true);
    });
  });

  describe('Patient Search API', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/v1/patient/register')
        .send(testPatientData);
    });

    test('should search patients by name', async () => {
      const response = await request(app)
        .get('/api/v1/patient/search?q=Jane')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.patients.length).toBeGreaterThan(0);
    });
  });

  describe('Patient Model Validation', () => {
    test('should validate correct patient data', () => {
      const { error } = patientValidationSchema.validate(testPatientData);
      expect(error).toBeUndefined();
    });

    test('should reject invalid email format', () => {
      const invalidData = { ...testPatientData, email: 'invalid-email' };
      const { error } = patientValidationSchema.validate(invalidData);
      expect(error).toBeDefined();
    });

    test('should reject weak password', () => {
      const invalidData = { ...testPatientData, password: 'weak', confirm_password: 'weak' };
      const { error } = patientValidationSchema.validate(invalidData);
      expect(error).toBeDefined();
    });
  });
}); 