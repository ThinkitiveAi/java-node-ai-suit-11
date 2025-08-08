const request = require('supertest');
const app = require('../server');
const bcrypt = require('bcryptjs');
const { Provider } = require('../models/Provider');

describe('Provider Registration API', () => {
  const validProviderData = {
    first_name: "John",
    last_name: "Doe",
    email: "john.doe@clinic.com",
    phone_number: "+1234567890",
    password: "SecurePassword123!",
    confirm_password: "SecurePassword123!",
    specialization: "Cardiology",
    license_number: "MD123456789",
    years_of_experience: 10,
    clinic_address: {
      street: "123 Medical Center Dr",
      city: "New York",
      state: "NY",
      zip: "10001"
    }
  };

  describe('POST /api/v1/provider/register', () => {
    test('should register a new provider with valid data', async () => {
      const response = await request(app)
        .post('/api/v1/provider/register')
        .send(validProviderData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Provider registered successfully. Verification email sent.');
      expect(response.body.data).toHaveProperty('provider_id');
      expect(response.body.data).toHaveProperty('email', validProviderData.email);
      expect(response.body.data).toHaveProperty('verification_status', 'pending');
    });

    test('should reject registration with duplicate email', async () => {
      // First registration
      await request(app)
        .post('/api/v1/provider/register')
        .send(validProviderData);

      // Second registration with same email
      const duplicateData = { ...validProviderData };
      duplicateData.phone_number = "+1987654321";
      duplicateData.license_number = "MD987654321";

      const response = await request(app)
        .post('/api/v1/provider/register')
        .send(duplicateData)
        .expect(409);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Email already registered');
    });

    test('should reject registration with duplicate phone number', async () => {
      // First registration
      await request(app)
        .post('/api/v1/provider/register')
        .send(validProviderData);

      // Second registration with same phone
      const duplicateData = { ...validProviderData };
      duplicateData.email = "different@clinic.com";
      duplicateData.license_number = "MD987654321";

      const response = await request(app)
        .post('/api/v1/provider/register')
        .send(duplicateData)
        .expect(409);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Phone number already registered');
    });

    test('should reject registration with duplicate license number', async () => {
      // First registration
      await request(app)
        .post('/api/v1/provider/register')
        .send(validProviderData);

      // Second registration with same license
      const duplicateData = { ...validProviderData };
      duplicateData.email = "different@clinic.com";
      duplicateData.phone_number = "+1987654321";

      const response = await request(app)
        .post('/api/v1/provider/register')
        .send(duplicateData)
        .expect(409);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('License number already registered');
    });
  });

  describe('Validation Tests', () => {
    test('should reject invalid email format', async () => {
      const invalidData = { ...validProviderData };
      invalidData.email = "invalid-email";

      const response = await request(app)
        .post('/api/v1/provider/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'email',
          message: expect.stringContaining('valid email')
        })
      );
    });

    test('should reject invalid phone number format', async () => {
      const invalidData = { ...validProviderData };
      invalidData.phone_number = "1234567890"; // Missing + prefix

      const response = await request(app)
        .post('/api/v1/provider/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'phone_number',
          message: expect.stringContaining('international format')
        })
      );
    });

    test('should reject weak password', async () => {
      const invalidData = { ...validProviderData };
      invalidData.password = "weak";
      invalidData.confirm_password = "weak";

      const response = await request(app)
        .post('/api/v1/provider/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'password',
          message: expect.stringContaining('at least 8 characters')
        })
      );
    });

    test('should reject mismatched passwords', async () => {
      const invalidData = { ...validProviderData };
      invalidData.confirm_password = "DifferentPassword123!";

      const response = await request(app)
        .post('/api/v1/provider/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'confirm_password',
          message: expect.stringContaining('Passwords do not match')
        })
      );
    });

    test('should reject invalid license number format', async () => {
      const invalidData = { ...validProviderData };
      invalidData.license_number = "MD-123-456"; // Contains hyphens

      const response = await request(app)
        .post('/api/v1/provider/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'license_number',
          message: expect.stringContaining('uppercase letters and numbers')
        })
      );
    });

    test('should reject invalid years of experience', async () => {
      const invalidData = { ...validProviderData };
      invalidData.years_of_experience = 60; // Exceeds maximum

      const response = await request(app)
        .post('/api/v1/provider/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'years_of_experience',
          message: expect.stringContaining('between 0 and 50')
        })
      );
    });

    test('should reject invalid ZIP code format', async () => {
      const invalidData = { ...validProviderData };
      invalidData.clinic_address.zip = "1234"; // Too short

      const response = await request(app)
        .post('/api/v1/provider/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'clinic_address.zip',
          message: expect.stringContaining('valid format')
        })
      );
    });
  });

  describe('Provider Model Tests', () => {
    test('should validate provider data correctly', () => {
      const validation = Provider.validate(validProviderData);
      expect(validation.error).toBeUndefined();
      expect(validation.value).toBeDefined();
    });

    test('should reject invalid provider data', () => {
      const invalidData = { ...validProviderData };
      delete invalidData.email;

      const validation = Provider.validate(invalidData);
      expect(validation.error).toBeDefined();
      expect(validation.error.details).toHaveLength(1);
      expect(validation.error.details[0].path).toContain('email');
    });

    test('should create provider instance correctly', () => {
      const provider = new Provider(validProviderData);
      expect(provider.id).toBeDefined();
      expect(provider.email).toBe(validProviderData.email.toLowerCase());
      expect(provider.license_number).toBe(validProviderData.license_number.toUpperCase());
      expect(provider.verification_status).toBe('pending');
      expect(provider.is_active).toBe(true);
    });

    test('should sanitize provider data correctly', () => {
      const provider = new Provider(validProviderData);
      const sanitized = provider.toJSON();
      
      expect(sanitized).not.toHaveProperty('password_hash');
      expect(sanitized).toHaveProperty('id');
      expect(sanitized).toHaveProperty('email');
    });
  });

  describe('Password Hashing Tests', () => {
    test('should hash password correctly', async () => {
      const password = "SecurePassword123!";
      const hash = await bcrypt.hash(password, 12);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(20);
    });

    test('should verify password correctly', async () => {
      const password = "SecurePassword123!";
      const hash = await bcrypt.hash(password, 12);
      
      const isValid = await bcrypt.compare(password, hash);
      expect(isValid).toBe(true);
    });

    test('should reject incorrect password', async () => {
      const password = "SecurePassword123!";
      const wrongPassword = "WrongPassword123!";
      const hash = await bcrypt.hash(password, 12);
      
      const isValid = await bcrypt.compare(wrongPassword, hash);
      expect(isValid).toBe(false);
    });
  });

  describe('Health Check', () => {
    test('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Health First Server is running');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
}); 