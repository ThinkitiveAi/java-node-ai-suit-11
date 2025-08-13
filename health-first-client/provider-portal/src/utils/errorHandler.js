// Error handling utility for API responses
export const handleApiError = (error) => {
  let errorMessage = 'An unexpected error occurred. Please try again.'
  
  // Handle CORS errors specifically
  if (error.code === 'ERR_NETWORK' || error.message.includes('CORS') || error.message.includes('Network Error')) {
    errorMessage = 'CORS Error: Unable to connect to the server. Please check if the server is running and CORS is properly configured.'
    console.error('CORS Error Details:', error)
    return errorMessage
  }
  
  if (error.response?.data?.message) {
    errorMessage = error.response.data.message
  } else if (error.response?.status) {
    switch (error.response.status) {
      case 400:
        errorMessage = 'Bad request. Please check your information and try again.'
        break
      case 401:
        errorMessage = 'Unauthorized. Please check your credentials.'
        break
      case 403:
        errorMessage = 'Access forbidden. Your account may be locked.'
        break
      case 404:
        errorMessage = 'Resource not found.'
        break
      case 409:
        errorMessage = 'Conflict. This resource already exists.'
        break
      case 422:
        errorMessage = 'Validation error. Please check your input.'
        break
      case 500:
        errorMessage = 'Server error. Please try again later.'
        break
      case 502:
        errorMessage = 'Bad gateway. Please try again later.'
        break
      case 503:
        errorMessage = 'Service unavailable. Please try again later.'
        break
      default:
        errorMessage = 'Network error. Please check your connection.'
    }
  } else if (error.code === 'NETWORK_ERROR') {
    errorMessage = 'Network error. Please check your connection and try again.'
  } else if (error.code === 'ECONNABORTED') {
    errorMessage = 'Request timeout. Please try again.'
  } else if (error.message) {
    errorMessage = error.message
  }
  
  return errorMessage
}

// Success message handler
export const handleApiSuccess = (response, defaultMessage = 'Operation completed successfully.') => {
  return response?.data?.message || defaultMessage
} 