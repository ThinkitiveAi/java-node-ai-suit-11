const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Provider } = require('../models/Provider');
const AuthService = require('../services/authService');
const AuthMiddleware = require('../middleware/authMiddleware');

// Import the app
const app = require('../server');

describe('Authentication Tests', () => {
  let authService;
  let authMiddleware;
  let testProvider;
  let testToken;

  beforeAll(async () => {
    // Initialize services
    authService = new AuthService();
    authMiddleware = new AuthMiddleware();

    // Create test provider
    const hashedPassword = await bcrypt.hash('SecurePassword123!', 12);
    testProvider = new Provider({
      first_name: 'Test',
      last_name: 'Provider',
      email: 'test.provider@example.com',
      phone_number: '+1234567890',
      password_hash: hashedPassword,
      specialization: 'Cardiology',
      license_number: 'TEST12345',
      years_of_experience: 5,
      clinic_address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zip: '12345'
      },
      verification_status: 'verified',
      is_active: true
    });

    await testProvider.save();

    // Generate test token
    testToken = authService.generateToken(testProvider);
  });

  afterAll(async () => {
    // Clean up
    await Provider.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Reset provider status before each test
    await Provider.findByIdAndUpdate(testProvider._id, {
      verification_status: 'verified',
      is_active: true
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test.provider@example.com',
          password: 'SecurePassword123!'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data).toHaveProperty('access_token');
      expect(response.body.data).toHaveProperty('expires_in');
      expect(response.body.data).toHaveProperty('token_type', 'Bearer');
      expect(response.body.data).toHaveProperty('provider');
      expect(response.body.data.provider.email).toBe('test.provider@example.com');
    });

    it('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SecurePassword123!'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should fail with invalid password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test.provider@example.com',
          password: 'WrongPassword123!'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should fail with unverified account', async () => {
      // Set provider as unverified
      await Provider.findByIdAndUpdate(testProvider._id, {
        verification_status: 'pending'
      });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test.provider@example.com',
          password: 'SecurePassword123!'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Account is not verified. Please contact administrator.');
    });

    it('should fail with deactivated account', async () => {
      // Deactivate provider
      await Provider.findByIdAndUpdate(testProvider._id, {
        is_active: false
      });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test.provider@example.com',
          password: 'SecurePassword123!'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Account is deactivated');
    });

    it('should fail with missing email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          password: 'SecurePassword123!'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with missing password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test.provider@example.com'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid email format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid-email',
          password: 'SecurePassword123!'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    it('should get provider profile with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Provider profile retrieved successfully');
      expect(response.body.data).toHaveProperty('provider');
      expect(response.body.data.provider.email).toBe('test.provider@example.com');
    });

    it('should fail without token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token is required');
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail with expired token', async () => {
      // Create expired token
      const expiredToken = jwt.sign(
        {
          provider_id: testProvider._id,
          email: testProvider.email,
          role: 'provider',
          specialization: testProvider.specialization,
          verification_status: testProvider.verification_status
        },
        'your-super-secret-jwt-key-here-change-in-production',
        { expiresIn: '0s' }
      );

      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully with valid token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout successful');
    });

    it('should fail without token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/validate', () => {
    it('should validate valid token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/validate')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Token is valid');
      expect(response.body.data).toHaveProperty('provider_id');
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data).toHaveProperty('role');
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/validate')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail without token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/validate')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('AuthService', () => {
    it('should generate valid JWT token', () => {
      const token = authService.generateToken(testProvider);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      // Verify token
      const decoded = jwt.verify(token, 'your-super-secret-jwt-key-here-change-in-production');
      expect(decoded.provider_id).toBe(testProvider._id.toString());
      expect(decoded.email).toBe(testProvider.email);
      expect(decoded.role).toBe('provider');
    });

    it('should verify valid password', async () => {
      const isValid = await authService.verifyPassword('SecurePassword123!', testProvider.password_hash);
      expect(isValid).toBe(true);
    });

    it('should reject invalid password', async () => {
      const isValid = await authService.verifyPassword('WrongPassword123!', testProvider.password_hash);
      expect(isValid).toBe(false);
    });

    it('should verify valid token', () => {
      const decoded = authService.verifyToken(testToken);
      expect(decoded.provider_id).toBe(testProvider._id.toString());
      expect(decoded.email).toBe(testProvider.email);
    });

    it('should reject invalid token', () => {
      expect(() => {
        authService.verifyToken('invalid-token');
      }).toThrow();
    });
  });

  describe('AuthMiddleware', () => {
    it('should extract token from Authorization header', () => {
      const req = {
        headers: {
          authorization: 'Bearer test-token'
        }
      };

      const token = authMiddleware.extractToken(req);
      expect(token).toBe('test-token');
    });

    it('should return null for missing Authorization header', () => {
      const req = {
        headers: {}
      };

      const token = authMiddleware.extractToken(req);
      expect(token).toBeNull();
    });

    it('should return null for invalid Authorization format', () => {
      const req = {
        headers: {
          authorization: 'InvalidFormat test-token'
        }
      };

      const token = authMiddleware.extractToken(req);
      expect(token).toBeNull();
    });
  });

  describe('Rate Limiting', () => {
    it('should allow normal login attempts', async () => {
      // First attempt should succeed
      const response1 = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test.provider@example.com',
          password: 'SecurePassword123!'
        });

      expect(response1.status).toBe(200);

      // Second attempt should also succeed
      const response2 = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test.provider@example.com',
          password: 'SecurePassword123!'
        });

      expect(response2.status).toBe(200);
    });
  });
}); 