import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'
import Layout from './components/Layout/Layout'
import Dashboard from './pages/Dashboard/Dashboard'
import Patients from './pages/Patients/Patients'
import Appointments from './pages/Appointments/Appointments'
import Schedule from './pages/Schedule/Schedule'
import Profile from './pages/Profile/Profile'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'

function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes - Dashboard and other pages */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="patients" element={<Patients />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        
        {/* Default redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
        {/* <Route path="/" element */}
      </Routes>
    </Box>
  )
}

export default App 