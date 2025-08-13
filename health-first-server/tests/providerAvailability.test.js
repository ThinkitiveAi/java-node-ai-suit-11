const request = require('supertest');
const mongoose = require('mongoose');
const { ProviderAvailability } = require('../models/ProviderAvailability');
const { AppointmentSlot } = require('../models/AppointmentSlot');
const { Provider } = require('../models/Provider');
const { Patient } = require('../models/Patient');
const app = require('../server');
const { generateToken } = require('../utils/jwt');

describe('Provider Availability API', () => {
  let providerToken;
  let patientToken;
  let providerId;
  let patientId;
  let availabilityId;

  beforeAll(async () => {
    // Create test provider
    const provider = new Provider({
      first_name: 'Dr. John',
      last_name: 'Doe',
      email: 'john.doe@test.com',
      password: 'password123',
      specialization: 'Cardiology',
      years_of_experience: 15,
      rating: 4.8
    });
    await provider.save();
    providerId = provider._id;

    // Create test patient
    const patient = new Patient({
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@test.com',
      password: 'password123'
    });
    await patient.save();
    patientId = patient._id;

    // Generate tokens
    providerToken = generateToken({ id: providerId, role: 'provider' });
    patientToken = generateToken({ id: patientId, role: 'patient' });
  });

  afterAll(async () => {
    await Provider.deleteMany({});
    await Patient.deleteMany({});
    await ProviderAvailability.deleteMany({});
    await AppointmentSlot.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await ProviderAvailability.deleteMany({});
    await AppointmentSlot.deleteMany({});
  });

  describe('POST /api/v1/provider/availability', () => {
    it('should create new availability slot', async () => {
      const availabilityData = {
        date: '2024-12-15',
        start_time: '09:00',
        end_time: '17:00',
        timezone: 'America/New_York',
        slot_duration: 30,
        break_duration: 15,
        appointment_type: 'consultation',
        location: {
          type: 'clinic',
          address: '123 Medical Center Dr, New York, NY 10001',
          room_number: 'Room 205'
        },
        pricing: {
          base_fee: 150.00,
          insurance_accepted: true,
          currency: 'USD'
        },
        special_requirements: ['fasting_required', 'bring_insurance_card'],
        notes: 'Standard consultation slots'
      };

      const response = await request(app)
        .post('/api/v1/provider/availability')
        .set('Authorization', `Bearer ${providerToken}`)
        .send(availabilityData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Availability created successfully');
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.provider_id).toBe(providerId.toString());
      expect(response.body.data.utc_start_time).toBeDefined();
      expect(response.body.data.utc_end_time).toBeDefined();

      availabilityId = response.body.data._id;
    });

    it('should create recurring availability slots', async () => {
      const availabilityData = {
        date: '2024-12-15',
        start_time: '09:00',
        end_time: '17:00',
        timezone: 'America/New_York',
        slot_duration: 30,
        break_duration: 15,
        is_recurring: true,
        recurrence_pattern: 'weekly',
        recurrence_end_date: '2025-01-15',
        appointment_type: 'consultation',
        location: {
          type: 'clinic',
          address: '123 Medical Center Dr, New York, NY 10001',
          room_number: 'Room 205'
        },
        pricing: {
          base_fee: 150.00,
          insurance_accepted: true,
          currency: 'USD'
        },
        special_requirements: ['fasting_required'],
        notes: 'Weekly consultation slots'
      };

      const response = await request(app)
        .post('/api/v1/provider/availability')
        .set('Authorization', `Bearer ${providerToken}`)
        .send(availabilityData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Availability slots created successfully');
      expect(response.body.data.slots_created).toBeGreaterThan(0);
      expect(response.body.data.date_range).toBeDefined();
      expect(response.body.data.total_appointments_available).toBeGreaterThan(0);
    });

    it('should validate timezone', async () => {
      const availabilityData = {
        date: '2024-12-15',
        start_time: '09:00',
        end_time: '17:00',
        timezone: 'Invalid/Timezone',
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
        .set('Authorization', `Bearer ${providerToken}`)
        .send(availabilityData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should prevent overlapping time slots', async () => {
      // Create first availability
      const availability1 = new ProviderAvailability({
        provider_id: providerId,
        date: '2024-12-15',
        start_time: '09:00',
        end_time: '17:00',
        timezone: 'America/New_York',
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
      });
      await availability1.save();

      // Try to create overlapping availability
      const availabilityData = {
        date: '2024-12-15',
        start_time: '10:00',
        end_time: '18:00',
        timezone: 'America/New_York',
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
        .set('Authorization', `Bearer ${providerToken}`)
        .send(availabilityData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('conflict');
    });
  });

  describe('GET /api/v1/provider/:provider_id/availability', () => {
    beforeEach(async () => {
      // Create test availability
      const availability = new ProviderAvailability({
        provider_id: providerId,
        date: '2024-12-15',
        start_time: '09:00',
        end_time: '17:00',
        timezone: 'America/New_York',
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
      });
      await availability.save();
      availabilityId = availability._id;
    });

    it('should get availability by provider ID', async () => {
      const response = await request(app)
        .get(`/api/v1/provider/${providerId}/availability`)
        .query({
          start_date: '2024-12-15',
          end_date: '2024-12-15'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.provider_id).toBe(providerId.toString());
      expect(response.body.data.availability_summary).toBeDefined();
      expect(response.body.data.availability).toHaveLength(1);
      expect(response.body.data.availability[0].slots).toHaveLength(1);
    });

    it('should filter by appointment type', async () => {
      const response = await request(app)
        .get(`/api/v1/provider/${providerId}/availability`)
        .query({
          appointment_type: 'consultation'
        })
        .expect(200);

      expect(response.body.data.availability).toHaveLength(1);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get(`/api/v1/provider/${providerId}/availability`)
        .query({
          status: 'available'
        })
        .expect(200);

      expect(response.body.data.availability).toHaveLength(1);
    });
  });

  describe('GET /api/v1/availability/search', () => {
    beforeEach(async () => {
      // Create test availability
      const availability = new ProviderAvailability({
        provider_id: providerId,
        date: '2024-12-15',
        start_time: '09:00',
        end_time: '17:00',
        timezone: 'America/New_York',
        appointment_type: 'consultation',
        location: {
          type: 'clinic',
          address: '123 Medical Center Dr, New York, NY 10001'
        },
        pricing: {
          base_fee: 150.00,
          insurance_accepted: true,
          currency: 'USD'
        },
        special_requirements: ['fasting_required']
      });
      await availability.save();
    });

    it('should search availability by date', async () => {
      const response = await request(app)
        .get('/api/v1/availability/search')
        .query({
          date: '2024-12-15'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total_results).toBeGreaterThan(0);
      expect(response.body.data.results).toHaveLength(1);
      expect(response.body.data.results[0].provider.name).toContain('Dr. John Doe');
    });

    it('should search by specialization', async () => {
      const response = await request(app)
        .get('/api/v1/availability/search')
        .query({
          specialization: 'cardiology'
        })
        .expect(200);

      expect(response.body.data.results).toHaveLength(1);
    });

    it('should search by location', async () => {
      const response = await request(app)
        .get('/api/v1/availability/search')
        .query({
          location: 'New York'
        })
        .expect(200);

      expect(response.body.data.results).toHaveLength(1);
    });

    it('should search by insurance accepted', async () => {
      const response = await request(app)
        .get('/api/v1/availability/search')
        .query({
          insurance_accepted: 'true'
        })
        .expect(200);

      expect(response.body.data.results).toHaveLength(1);
    });

    it('should search by max price', async () => {
      const response = await request(app)
        .get('/api/v1/availability/search')
        .query({
          max_price: 200
        })
        .expect(200);

      expect(response.body.data.results).toHaveLength(1);
    });
  });

  describe('PUT /api/v1/provider/availability/:id', () => {
    beforeEach(async () => {
      const availability = new ProviderAvailability({
        provider_id: providerId,
        date: '2024-12-15',
        start_time: '09:00',
        end_time: '17:00',
        timezone: 'America/New_York',
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
      });
      await availability.save();
      availabilityId = availability._id;
    });

    it('should update availability', async () => {
      const updateData = {
        start_time: '10:00',
        end_time: '18:00',
        notes: 'Updated consultation time',
        pricing: {
          base_fee: 175.00
        }
      };

      const response = await request(app)
        .put(`/api/v1/provider/availability/${availabilityId}`)
        .set('Authorization', `Bearer ${providerToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Availability updated successfully');
    });
  });

  describe('DELETE /api/v1/provider/availability/:id', () => {
    beforeEach(async () => {
      const availability = new ProviderAvailability({
        provider_id: providerId,
        date: '2024-12-15',
        start_time: '09:00',
        end_time: '17:00',
        timezone: 'America/New_York',
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
      });
      await availability.save();
      availabilityId = availability._id;
    });

    it('should delete availability', async () => {
      const response = await request(app)
        .delete(`/api/v1/provider/availability/${availabilityId}`)
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Availability deleted successfully');
    });

    it('should not delete availability with appointments', async () => {
      // Update availability to have appointments
      await ProviderAvailability.findByIdAndUpdate(availabilityId, {
        current_appointments: 1
      });

      const response = await request(app)
        .delete(`/api/v1/provider/availability/${availabilityId}`)
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(409);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/provider/availability/:id/book', () => {
    beforeEach(async () => {
      const availability = new ProviderAvailability({
        provider_id: providerId,
        date: '2024-12-15',
        start_time: '09:00',
        end_time: '17:00',
        timezone: 'America/New_York',
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
      });
      await availability.save();
      availabilityId = availability._id;
    });

    it('should book appointment slot', async () => {
      const response = await request(app)
        .post(`/api/v1/provider/availability/${availabilityId}/book`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Slot booked successfully');
      expect(response.body.data.current_appointments).toBe(1);
    });

    it('should not book already booked slot', async () => {
      // Book the slot first
      await request(app)
        .post(`/api/v1/provider/availability/${availabilityId}/book`)
        .expect(200);

      // Try to book again
      const response = await request(app)
        .post(`/api/v1/provider/availability/${availabilityId}/book`)
        .expect(409);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/provider/availability/:id/cancel', () => {
    beforeEach(async () => {
      const availability = new ProviderAvailability({
        provider_id: providerId,
        date: '2024-12-15',
        start_time: '09:00',
        end_time: '17:00',
        timezone: 'America/New_York',
        appointment_type: 'consultation',
        location: {
          type: 'clinic',
          address: '123 Medical Center Dr'
        },
        pricing: {
          base_fee: 150.00,
          insurance_accepted: true,
          currency: 'USD'
        },
        current_appointments: 1
      });
      await availability.save();
      availabilityId = availability._id;
    });

    it('should cancel appointment slot', async () => {
      const response = await request(app)
        .post(`/api/v1/provider/availability/${availabilityId}/cancel`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Appointment cancelled successfully');
      expect(response.body.data.current_appointments).toBe(0);
    });

    it('should not cancel slot with no appointments', async () => {
      // Cancel the appointment first
      await request(app)
        .post(`/api/v1/provider/availability/${availabilityId}/cancel`)
        .expect(200);

      // Try to cancel again
      const response = await request(app)
        .post(`/api/v1/provider/availability/${availabilityId}/cancel`)
        .expect(409);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/provider/availability/:id/check', () => {
    beforeEach(async () => {
      const availability = new ProviderAvailability({
        provider_id: providerId,
        date: '2024-12-15',
        start_time: '09:00',
        end_time: '17:00',
        timezone: 'America/New_York',
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
      });
      await availability.save();
      availabilityId = availability._id;
    });

    it('should check slot availability', async () => {
      const response = await request(app)
        .get(`/api/v1/provider/availability/${availabilityId}/check`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.is_available).toBe(true);
      expect(response.body.data.can_be_booked).toBe(true);
    });
  });

  describe('Timezone handling', () => {
    it('should store UTC times correctly', async () => {
      const availabilityData = {
        date: '2024-12-15',
        start_time: '09:00',
        end_time: '17:00',
        timezone: 'America/New_York',
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
        .set('Authorization', `Bearer ${providerToken}`)
        .send(availabilityData)
        .expect(201);

      expect(response.body.data.utc_start_time).toBeDefined();
      expect(response.body.data.utc_end_time).toBeDefined();
      expect(response.body.data.local_start_time).toBe('09:00');
      expect(response.body.data.local_end_time).toBe('17:00');
    });
  });
}); 