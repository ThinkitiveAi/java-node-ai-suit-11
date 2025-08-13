import api from './api'
import API_CONFIG from '../config/apiConfig'

// Provider API Service
export const providerApi = {
  // Register Provider
  register: async (providerData) => {
    try {
      // Transform data to match API schema exactly as per curl request
      const requestData = {
        firstName: providerData.firstName,
        lastName: providerData.lastName,
        email: providerData.email,
        phoneNumber: providerData.phone,
        password: providerData.password,
        confirmPassword: providerData.confirmPassword,
        specialization: providerData.specialization,
        licenseNumber: providerData.licenseNumber,
        yearsOfExperience: parseInt(providerData.yearsExperience),
        clinicAddress: {
          street: providerData.streetAddress,
          city: providerData.city,
          state: providerData.state,
          zip: providerData.zipCode,
        }
      }

      // Log the request data for debugging
      console.log('Provider Registration Request:', {
        url: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROVIDER.REGISTER}`,
        data: requestData,
        headers: {
          'Content-Type': 'application/json',
          'accept': '/'
        }
      })

      const response = await api.post(API_CONFIG.ENDPOINTS.PROVIDER.REGISTER, requestData)
      
      // Log successful response
      console.log('Provider Registration Response:', response.data)
      
      return response.data
    } catch (error) {
      console.error('Provider Registration Error:', error)
      throw error
    }
  },

  // Login Provider
  login: async (credentials) => {
    try {
      const response = await api.post(API_CONFIG.ENDPOINTS.PROVIDER.LOGIN, {
        email: credentials.email,
        password: credentials.password,
      })
      
      // Store token if login successful
      if (response.data.token) {
        localStorage.setItem('provider_token', response.data.token)
        localStorage.setItem('provider_data', JSON.stringify(response.data.provider))
      }
      
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get Provider Profile
  getProfile: async () => {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.PROVIDER.PROFILE)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Update Provider Profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put(API_CONFIG.ENDPOINTS.PROVIDER.PROFILE, profileData)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Logout Provider
  logout: () => {
    localStorage.removeItem('provider_token')
    localStorage.removeItem('provider_data')
  },

  // Check if provider is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('provider_token')
  },

  // Get stored provider data
  getStoredProviderData: () => {
    const data = localStorage.getItem('provider_data')
    return data ? JSON.parse(data) : null
  }
}

export default providerApi 