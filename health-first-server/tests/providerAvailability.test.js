const request = require('supertest');
const mongoose = require('mongoose');
const { ProviderAvailability } = require('../models/ProviderAvailability');
const { Provider } = require('../models/Provider');

// Import the app
const app = require('../server');

describe('Provider Availability Module Tests', () => {
  let testProviderId;
  let testAvailabilityId;
  let testToken;

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/health_first_test';
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await ProviderAvailability.deleteMany({});
    await Provider.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await ProviderAvailability.deleteMany({});
    await Provider.deleteMany({});
  });

  describe('Provider Setup and Authentication', () => {
    test('should register provider and login', async () => {
      // Register provider
      const providerData = {
        first_name: 'Dr. John',
        last_name: 'Smith',
        email: 'john.smith@healthcare.com',
        phone_number: '+1234567890',
        password: 'SecurePassword123!',
        confirm_password: 'SecurePassword123!',
        license_number: 'MD123456789',
        specialization: 'Cardiology',
        years_of_experience: 10,
        address: {
          street: '123 Medical Center Dr',
          city: 'Boston',
          state: 'MA',
          zip: '02101'
        }
      };

      const registerResponse = await request(app)
        .post('/api/v1/provider/register')
        .send(providerData)
        .expect(201);

      testProviderId = registerResponse.body.data.provider_id;

      // Login provider
      const loginData = {
        email: 'john.smith@healthcare.com',
        password: 'SecurePassword123!'
      };

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200);

      testToken = loginResponse.body.data.access_token;
    });
  });

  describe('Create Availability', () => {
    test('should create single availability slot', async () => {
      const availabilityData = {
        date: '2024-01-15',
        start_time: '09:00',
        end_time: '17:00',
        timezone: 'America/New_York',
        slot_duration: 30,
        appointment_type: 'consultation',
        location: {
          type: 'clinic',
          address: '123 Medical Center Dr'
        },
        pricing: {
          base_fee: 150.00,
          insurance_accepted: true,
          currency: 'USD'
        }
      };

      const response = await request(app)
        .post('/api/v1/provider/availability')
        .set('Authorization', `Bearer ${testToken}`)
        .send(availabilityData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.provider_id).toBe(testProviderId);

      testAvailabilityId = response.body.data._id;
    });

    test('should reject invalid time format', async () => {
      const availabilityData = {
        date: '2024-01-15',
        start_time: '9:00', // Invalid format
        end_time: '17:00',
        timezone: 'America/New_York',
        location: {
          type: 'clinic',
          address: '123 Medical Center Dr'
        },
        pricing: {
          base_fee: 150.00
        }
      };

      const response = await request(app)
        .post('/api/v1/provider/availability')
        .set('Authorization', `Bearer ${testToken}`)
        .send(availabilityData)
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toHaveProperty('start_time');
    });
  });

  describe('Get Availability', () => {
    beforeEach(async () => {
      // Create test availability
      const availabilityData = {
        date: '2024-01-15',
        start_time: '09:00',
        end_time: '17:00',
        timezone: 'America/New_York',
        slot_duration: 30,
        appointment_type: 'consultation',
        location: {
          type: 'clinic',
          address: '123 Medical Center Dr'
        },
        pricing: {
          base_fee: 150.00
        }
      };

      const response = await request(app)
        .post('/api/v1/provider/availability')
        .set('Authorization', `Bearer ${testToken}`)
        .send(availabilityData);

      testAvailabilityId = response.body.data._id;
    });

    test('should get availability by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/provider/availability/${testAvailabilityId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id', testAvailabilityId);
    });

    test('should get my availability (authenticated)', async () => {
      const response = await request(app)
        .get('/api/v1/provider/availability/me')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('availability');
      expect(response.body.data.availability.length).toBeGreaterThan(0);
    });
  });

  describe('Update and Delete Availability', () => {
    beforeEach(async () => {
      // Create test availability
      const availabilityData = {
        date: '2024-01-15',
        start_time: '09:00',
        end_time: '17:00',
        timezone: 'America/New_York',
        slot_duration: 30,
        appointment_type: 'consultation',
        location: {
          type: 'clinic',
          address: '123 Medical Center Dr'
        },
        pricing: {
          base_fee: 150.00
        }
      };

      const response = await request(app)
        .post('/api/v1/provider/availability')
        .set('Authorization', `Bearer ${testToken}`)
        .send(availabilityData);

      testAvailabilityId = response.body.data._id;
    });

    test('should update availability', async () => {
      const updateData = {
        start_time: '10:00',
        end_time: '18:00',
        pricing: {
          base_fee: 200.00
        }
      };

      const response = await request(app)
        .put(`/api/v1/provider/availability/${testAvailabilityId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.start_time).toBe('10:00');
      expect(response.body.data.pricing.base_fee).toBe(200.00);
    });

    test('should delete availability', async () => {
      const response = await request(app)
        .delete(`/api/v1/provider/availability/${testAvailabilityId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Availability deleted successfully');
    });
  });

  describe('Search Availability (Public)', () => {
    beforeEach(async () => {
      // Create test availabilities
      const availabilities = [
        {
          date: '2024-01-15',
          start_time: '09:00',
          end_time: '17:00',
          timezone: 'America/New_York',
          appointment_type: 'consultation',
          location: { type: 'clinic', address: '123 Medical Center Dr' },
          pricing: { base_fee: 150.00, insurance_accepted: true }
        },
        {
          date: '2024-01-16',
          start_time: '10:00',
          end_time: '18:00',
          timezone: 'America/New_York',
          appointment_type: 'telemedicine',
          location: { type: 'telemedicine' },
          pricing: { base_fee: 100.00, insurance_accepted: false }
        }
      ];

      for (const availabilityData of availabilities) {
        await request(app)
          .post('/api/v1/provider/availability')
          .set('Authorization', `Bearer ${testToken}`)
          .send(availabilityData);
      }
    });

    test('should search availability with filters', async () => {
      const response = await request(app)
        .get('/api/v1/availability/search')
        .query({
          start_date: '2024-01-15',
          end_date: '2024-01-16',
          appointment_type: 'consultation',
          location_type: 'clinic',
          insurance_accepted: 'true',
          max_price: '200',
          available_only: 'true'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('availability');
      expect(response.body.data.availability.length).toBeGreaterThan(0);
    });

    test('should search availability without filters', async () => {
      const response = await request(app)
        .get('/api/v1/availability/search')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('availability');
      expect(response.body.data.availability.length).toBeGreaterThan(0);
    });
  });

  describe('Slot Booking', () => {
    beforeEach(async () => {
      // Create test availability
      const availabilityData = {
        date: '2024-01-15',
        start_time: '09:00',
        end_time: '17:00',
        timezone: 'America/New_York',
        slot_duration: 30,
        max_appointments_per_slot: 2,
        appointment_type: 'consultation',
        location: {
          type: 'clinic',
          address: '123 Medical Center Dr'
        },
        pricing: {
          base_fee: 150.00
        }
      };

      const response = await request(app)
        .post('/api/v1/provider/availability')
        .set('Authorization', `Bearer ${testToken}`)
        .send(availabilityData);

      testAvailabilityId = response.body.data._id;
    });

    test('should check slot availability', async () => {
      const response = await request(app)
        .get(`/api/v1/availability/${testAvailabilityId}/check`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('is_available', true);
      expect(response.body.data).toHaveProperty('can_be_booked', true);
    });

    test('should book and cancel appointment slot', async () => {
      // Book slot
      const bookResponse = await request(app)
        .post(`/api/v1/availability/${testAvailabilityId}/book`)
        .expect(200);

      expect(bookResponse.body.success).toBe(true);
      expect(bookResponse.body.data.current_appointments).toBe(1);

      // Cancel slot
      const cancelResponse = await request(app)
        .post(`/api/v1/availability/${testAvailabilityId}/cancel`)
        .expect(200);

      expect(cancelResponse.body.success).toBe(true);
      expect(cancelResponse.body.data.current_appointments).toBe(0);
    });
  });
}); 