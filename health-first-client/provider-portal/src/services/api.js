import axios from 'axios'
import API_CONFIG from '../config/apiConfig'

// Create axios instance
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    ...API_CONFIG.DEFAULT_HEADERS,
    // Add CORS headers
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  },
  // Add withCredentials for CORS
  withCredentials: false,
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage if available
    const token = localStorage.getItem('provider_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add CORS headers to every request
    config.headers['Access-Control-Allow-Origin'] = '*'
    config.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    config.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
    
    // Log request for debugging
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      data: config.data,
      headers: config.headers,
    })
    
    return config
  },
  (error) => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response for debugging
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
      headers: response.headers,
    })
    
    return response
  },
  (error) => {
    console.error('Response Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
      headers: error.response?.headers,
    })
    
    // Handle CORS errors specifically
    if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
      console.error('CORS Error detected:', error)
      // You might want to show a specific CORS error message to the user
    }
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('provider_token')
      localStorage.removeItem('provider_data')
      window.location.href = '/login'
    }
    
    return Promise.reject(error)
  }
)

export default api 