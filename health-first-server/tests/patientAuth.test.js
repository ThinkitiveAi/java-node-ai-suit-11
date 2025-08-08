const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { Patient } = require('../models/Patient');

// Import the app
const app = require('../server');

describe('Patient Authentication Module Tests', () => {
  let testPatientId;
  let testToken;

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
  });

  describe('Patient Login API', () => {
    beforeEach(async () => {
      // Register a test patient
      const testPatientData = {
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
        }
      };

      const response = await request(app)
        .post('/api/v1/patient/register')
        .send(testPatientData);
      testPatientId = response.body.data.patient_id;
    });

    test('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'jane.smith@email.com',
        password: 'SecurePassword123!'
      };

      const response = await request(app)
        .post('/api/v1/patient/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data).toHaveProperty('access_token');
      expect(response.body.data).toHaveProperty('expires_in', 1800);
      expect(response.body.data).toHaveProperty('token_type', 'Bearer');
      expect(response.body.data).toHaveProperty('patient');
      expect(response.body.data.patient).toHaveProperty('email', 'jane.smith@email.com');

      testToken = response.body.data.access_token;
    });

    test('should reject login with invalid credentials', async () => {
      const loginData = {
        email: 'jane.smith@email.com',
        password: 'WrongPassword123!'
      };

      const response = await request(app)
        .post('/api/v1/patient/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    test('should reject login with missing email', async () => {
      const loginData = {
        password: 'SecurePassword123!'
      };

      const response = await request(app)
        .post('/api/v1/patient/auth/login')
        .send(loginData)
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toHaveProperty('email');
    });
  });

  describe('JWT Token Tests', () => {
    beforeEach(async () => {
      // Register and login to get a token
      const testPatientData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@email.com',
        phone_number: '+1234567891',
        password: 'SecurePassword123!',
        confirm_password: 'SecurePassword123!',
        date_of_birth: '1985-03-20',
        gender: 'male',
        address: {
          street: '123 Oak Avenue',
          city: 'New York',
          state: 'NY',
          zip: '10001'
        }
      };

      await request(app)
        .post('/api/v1/patient/register')
        .send(testPatientData);

      const loginResponse = await request(app)
        .post('/api/v1/patient/auth/login')
        .send({
          email: 'john.doe@email.com',
          password: 'SecurePassword123!'
        });

      testToken = loginResponse.body.data.access_token;
    });

    test('should generate valid JWT token with correct payload', () => {
      const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-change-in-production';
      const decoded = jwt.verify(testToken, secret);

      expect(decoded).toHaveProperty('patient_id');
      expect(decoded).toHaveProperty('email', 'john.doe@email.com');
      expect(decoded).toHaveProperty('role', 'patient');
      expect(decoded).toHaveProperty('iat');
      expect(decoded).toHaveProperty('exp');
    });

    test('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/patient/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid token');
    });
  });

  describe('Get Current Patient Profile', () => {
    beforeEach(async () => {
      // Register and login to get a token
      const testPatientData = {
        first_name: 'Alice',
        last_name: 'Johnson',
        email: 'alice.johnson@email.com',
        phone_number: '+1234567892',
        password: 'SecurePassword123!',
        confirm_password: 'SecurePassword123!',
        date_of_birth: '1988-12-25',
        gender: 'female',
        address: {
          street: '555 Test Ave',
          city: 'Miami',
          state: 'FL',
          zip: '33101'
        }
      };

      await request(app)
        .post('/api/v1/patient/register')
        .send(testPatientData);

      const loginResponse = await request(app)
        .post('/api/v1/patient/auth/login')
        .send({
          email: 'alice.johnson@email.com',
          password: 'SecurePassword123!'
        });

      testToken = loginResponse.body.data.access_token;
    });

    test('should get current patient profile with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/patient/auth/me')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('email', 'alice.johnson@email.com');
      expect(response.body.data).toHaveProperty('first_name', 'Alice');
      expect(response.body.data).not.toHaveProperty('password_hash');
    });

    test('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/v1/patient/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token is required');
    });
  });

  describe('Token Validation API', () => {
    beforeEach(async () => {
      // Register and login to get a token
      const testPatientData = {
        first_name: 'Bob',
        last_name: 'Wilson',
        email: 'bob.wilson@email.com',
        phone_number: '+1234567893',
        password: 'SecurePassword123!',
        confirm_password: 'SecurePassword123!',
        date_of_birth: '1992-07-15',
        gender: 'male',
        address: {
          street: '777 Different St',
          city: 'Seattle',
          state: 'WA',
          zip: '98101'
        }
      };

      await request(app)
        .post('/api/v1/patient/register')
        .send(testPatientData);

      const loginResponse = await request(app)
        .post('/api/v1/patient/auth/login')
        .send({
          email: 'bob.wilson@email.com',
          password: 'SecurePassword123!'
        });

      testToken = loginResponse.body.data.access_token;
    });

    test('should validate valid token', async () => {
      const response = await request(app)
        .post('/api/v1/patient/auth/validate')
        .send({ token: testToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Token is valid');
      expect(response.body.data).toHaveProperty('payload');
      expect(response.body.data.payload).toHaveProperty('email', 'bob.wilson@email.com');
      expect(response.body.data.payload).toHaveProperty('role', 'patient');
    });

    test('should reject invalid token', async () => {
      const response = await request(app)
        .post('/api/v1/patient/auth/validate')
        .send({ token: 'invalid-token' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Token is invalid');
    });
  });
}); 