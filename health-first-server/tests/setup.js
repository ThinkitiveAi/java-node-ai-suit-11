// Test setup file for Jest
require('dotenv').config({ path: '.env.test' });

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DB_NAME = 'health_first_test';
process.env.PORT = 3001;

// Global test timeout
jest.setTimeout(10000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global test utilities
global.testUtils = {
  // Generate test provider data
  generateTestProvider: (overrides = {}) => ({
    first_name: "Test",
    last_name: "Provider",
    email: `test.provider.${Date.now()}@clinic.com`,
    phone_number: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    password: "SecurePassword123!",
    confirm_password: "SecurePassword123!",
    specialization: "Test Specialization",
    license_number: `TEST${Math.floor(Math.random() * 900000) + 100000}`,
    years_of_experience: 5,
    clinic_address: {
      street: "123 Test Street",
      city: "Test City",
      state: "TS",
      zip: "12345"
    },
    ...overrides
  }),

  // Generate invalid test data
  generateInvalidProvider: (field, value) => {
    const validData = global.testUtils.generateTestProvider();
    return {
      ...validData,
      [field]: value
    };
  },

  // Wait for async operations
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms))
}; 