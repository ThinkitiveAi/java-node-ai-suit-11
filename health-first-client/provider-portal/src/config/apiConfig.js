// API Configuration
export const API_CONFIG = {
  // Base URL for the API
  BASE_URL: 'http://192.168.11.9:8084/api/v1',
  
  // Timeout settings
  TIMEOUT: 30000, // 30 seconds
  
  // Headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'accept': '/',
  },
  
  // Endpoints
  ENDPOINTS: {
    // Provider endpoints
    PROVIDER: {
      REGISTER: '/provider/register',
      LOGIN: '/provider/login',
      PROFILE: '/provider/profile',
      LOGOUT: '/provider/logout',
    },
    
    // Patient endpoints (for future use)
    PATIENT: {
      LIST: '/patients',
      DETAILS: '/patients/:id',
    },
    
    // Appointment endpoints (for future use)
    APPOINTMENT: {
      LIST: '/appointments',
      CREATE: '/appointments',
      UPDATE: '/appointments/:id',
      DELETE: '/appointments/:id',
    },
  },
  
  // Error messages
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Network error. Please check your connection and try again.',
    TIMEOUT_ERROR: 'Request timeout. Please try again.',
    SERVER_ERROR: 'Server error. Please try again later.',
    UNAUTHORIZED: 'Unauthorized. Please log in again.',
    FORBIDDEN: 'Access forbidden. Your account may be locked.',
    NOT_FOUND: 'Resource not found.',
    VALIDATION_ERROR: 'Please check your input and try again.',
  },
  
  // Success messages
  SUCCESS_MESSAGES: {
    REGISTER: 'Registration successful! Please check your email to verify your account.',
    LOGIN: 'Login successful! Welcome back.',
    LOGOUT: 'Logged out successfully.',
    PROFILE_UPDATE: 'Profile updated successfully.',
  },
}

export default API_CONFIG 