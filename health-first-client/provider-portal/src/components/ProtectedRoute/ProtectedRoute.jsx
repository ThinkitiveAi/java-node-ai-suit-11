import React from 'react'
import { Navigate } from 'react-router-dom'
import { providerApi } from '../../services/providerApi'

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = providerApi.isAuthenticated()
  
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />
  }
  
  return children
}

export default ProtectedRoute 