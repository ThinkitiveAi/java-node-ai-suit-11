import React, { useState } from 'react'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  alpha,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Phone,
  Lock,
  LocationOn,
  LocalHospital,
  Business,
  School,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { providerApi } from '../../services/providerApi'
import { handleApiError } from '../../utils/errorHandler'

const Register = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Professional Information
    specialization: '',
    licenseNumber: '',
    yearsExperience: '',
    
    // Clinic Address
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    
    // Account Security
    password: '',
    confirmPassword: '',
  })
  
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value) return `${name === 'firstName' ? 'First' : 'Last'} name is required`
        if (value.length < 2) return `${name === 'firstName' ? 'First' : 'Last'} name must be at least 2 characters`
        if (value.length > 50) return `${name === 'firstName' ? 'First' : 'Last'} name must be less than 50 characters`
        return ''
      
      case 'email':
        if (!value) return 'Email is required'
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) return 'Please enter a valid email address'
        return ''
      
      case 'phone':
        if (!value) return 'Phone number is required'
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) return 'Please enter a valid phone number'
        return ''
      
      case 'specialization':
        if (!value) return 'Specialization is required'
        if (value.length < 3) return 'Specialization must be at least 3 characters'
        if (value.length > 100) return 'Specialization must be less than 100 characters'
        return ''
      
      case 'licenseNumber':
        if (!value) return 'Medical license number is required'
        if (!/^[A-Za-z0-9\-]+$/.test(value)) return 'License number can only contain letters, numbers, and hyphens'
        return ''
      
      case 'yearsExperience':
        if (!value) return 'Years of experience is required'
        const years = parseInt(value)
        if (isNaN(years) || years < 0 || years > 50) return 'Years of experience must be between 0 and 50'
        return ''
      
      case 'streetAddress':
        if (!value) return 'Street address is required'
        if (value.length > 200) return 'Street address must be less than 200 characters'
        return ''
      
      case 'city':
        if (!value) return 'City is required'
        if (value.length > 100) return 'City must be less than 100 characters'
        return ''
      
      case 'state':
        if (!value) return 'State/Province is required'
        if (value.length > 50) return 'State/Province must be less than 50 characters'
        return ''
      
      case 'zipCode':
        if (!value) return 'ZIP/Postal code is required'
        const zipRegex = /^[A-Za-z0-9\s\-]{3,10}$/
        if (!zipRegex.test(value)) return 'Please enter a valid ZIP/Postal code'
        return ''
      
      case 'password':
        if (!value) return 'Password is required'
        if (value.length < 8) return 'Password must be at least 8 characters'
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        }
        return ''
      
      case 'confirmPassword':
        if (!value) return 'Please confirm your password'
        if (value !== formData.password) return 'Passwords do not match'
        return ''
      
      default:
        return ''
    }
  }

  const validateForm = () => {
    const newErrors = {}
    let isValid = true

    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field])
      if (error) {
        newErrors[field] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    
    // Clear general error when user makes changes
    if (generalError) {
      setGeneralError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      console.log('Form validation failed:', errors)
      return
    }
    
    setIsLoading(true)
    setGeneralError('')
    
    // Log form data for debugging
    console.log('Form Data being submitted:', formData)
    
    try {
      // Call the API
      const response = await providerApi.register(formData)
      
      // Success
      console.log('Registration successful:', response)
      setSuccessMessage('Registration successful! Redirecting to login...')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
      
    } catch (error) {
      // Handle API errors using utility function
      console.error('Registration error:', error)
      const errorMessage = handleApiError(error)
      setGeneralError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container component="main" maxWidth="lg">
        <Paper 
          elevation={isMobile ? 0 : 12} 
          sx={{ 
            p: isMobile ? 3 : 6, 
            width: '100%',
            borderRadius: isMobile ? 0 : 4,
            background: isMobile ? 'transparent' : 'background.paper',
            backdropFilter: 'blur(10px)',
            border: isMobile ? 'none' : `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            boxShadow: isMobile ? 'none' : `0 20px 40px ${alpha(theme.palette.common.black, 0.1)}`,
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mb: 3,
                position: 'relative'
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                }}
              >
                <LocalHospital 
                  sx={{ 
                    fontSize: 40, 
                    color: 'white',
                  }} 
                />
              </Box>
            </Box>
            <Typography 
              component="h1" 
              variant={isMobile ? "h4" : "h3"} 
              gutterBottom
              sx={{ 
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              Provider Registration
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
              Create your healthcare provider account
            </Typography>
          </Box>

          {/* Success/Error Messages */}
          {successMessage && (
            <Alert 
              severity="success" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  fontSize: '1.5rem',
                },
              }}
            >
              {successMessage}
            </Alert>
          )}
          
          {generalError && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  fontSize: '1.5rem',
                },
              }}
            >
              {generalError}
            </Alert>
          )}

          {/* Form Content */}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Grid container spacing={4}>
              {/* Personal Information */}
              <Grid item xs={12} md={6}>
                <Card 
                  elevation={0}
                  sx={{ 
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    borderRadius: 3,
                    height: '100%'
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}>
                      Personal Information
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="First Name"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          error={!!errors.firstName}
                          helperText={errors.firstName}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Person color="primary" />
                              </InputAdornment>
                            ),
                          }}
                          disabled={isLoading}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': {
                                borderColor: 'primary.main',
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Last Name"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          error={!!errors.lastName}
                          helperText={errors.lastName}
                          disabled={isLoading}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': {
                                borderColor: 'primary.main',
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Email Address"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          error={!!errors.email}
                          helperText={errors.email}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Email color="primary" />
                              </InputAdornment>
                            ),
                          }}
                          disabled={isLoading}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': {
                                borderColor: 'primary.main',
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Phone Number"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          error={!!errors.phone}
                          helperText={errors.phone}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Phone color="primary" />
                              </InputAdornment>
                            ),
                          }}
                          disabled={isLoading}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': {
                                borderColor: 'primary.main',
                              },
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Professional Information */}
              <Grid item xs={12} md={6}>
                <Card 
                  elevation={0}
                  sx={{ 
                    background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                    border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                    borderRadius: 3,
                    height: '100%'
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" sx={{ mb: 3, color: 'secondary.main', fontWeight: 600 }}>
                      Professional Information
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Specialization"
                          name="specialization"
                          value={formData.specialization}
                          onChange={handleChange}
                          error={!!errors.specialization}
                          helperText={errors.specialization}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Business color="secondary" />
                              </InputAdornment>
                            ),
                          }}
                          disabled={isLoading}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': {
                                borderColor: 'secondary.main',
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Medical License Number"
                          name="licenseNumber"
                          value={formData.licenseNumber}
                          onChange={handleChange}
                          error={!!errors.licenseNumber}
                          helperText={errors.licenseNumber}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocalHospital color="secondary" />
                              </InputAdornment>
                            ),
                          }}
                          disabled={isLoading}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': {
                                borderColor: 'secondary.main',
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Years of Experience"
                          name="yearsExperience"
                          type="number"
                          value={formData.yearsExperience}
                          onChange={handleChange}
                          error={!!errors.yearsExperience}
                          helperText={errors.yearsExperience}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <School color="secondary" />
                              </InputAdornment>
                            ),
                          }}
                          disabled={isLoading}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': {
                                borderColor: 'secondary.main',
                              },
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Clinic Address */}
              <Grid item xs={12} md={6}>
                <Card 
                  elevation={0}
                  sx={{ 
                    background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                    border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                    borderRadius: 3,
                    height: '100%'
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" sx={{ mb: 3, color: 'success.main', fontWeight: 600 }}>
                      Clinic Address
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Street Address"
                          name="streetAddress"
                          value={formData.streetAddress}
                          onChange={handleChange}
                          error={!!errors.streetAddress}
                          helperText={errors.streetAddress}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocationOn color="success" />
                              </InputAdornment>
                            ),
                          }}
                          disabled={isLoading}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': {
                                borderColor: 'success.main',
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="City"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          error={!!errors.city}
                          helperText={errors.city}
                          disabled={isLoading}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': {
                                borderColor: 'success.main',
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="State/Province"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          error={!!errors.state}
                          helperText={errors.state}
                          disabled={isLoading}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': {
                                borderColor: 'success.main',
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="ZIP/Postal Code"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleChange}
                          error={!!errors.zipCode}
                          helperText={errors.zipCode}
                          disabled={isLoading}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': {
                                borderColor: 'success.main',
                              },
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Account Security */}
              <Grid item xs={12} md={6}>
                <Card 
                  elevation={0}
                  sx={{ 
                    background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                    borderRadius: 3,
                    height: '100%'
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" sx={{ mb: 3, color: 'warning.main', fontWeight: 600 }}>
                      Account Security
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={handleChange}
                          error={!!errors.password}
                          helperText={errors.password}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Lock color="warning" />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowPassword(!showPassword)}
                                  edge="end"
                                  disabled={isLoading}
                                  sx={{ color: 'warning.main' }}
                                >
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          disabled={isLoading}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': {
                                borderColor: 'warning.main',
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Confirm Password"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          error={!!errors.confirmPassword}
                          helperText={errors.confirmPassword}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Lock color="warning" />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  edge="end"
                                  disabled={isLoading}
                                  sx={{ color: 'warning.main' }}
                                >
                                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          disabled={isLoading}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': {
                                borderColor: 'warning.main',
                              },
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Submit Button */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                sx={{ 
                  py: 2,
                  px: 6,
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                    boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
                  },
                }}
              >
                {isLoading ? (
                  <CircularProgress size={28} color="inherit" />
                ) : (
                  'Create Account'
                )}
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 4 }}>
            <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
              Already have an account?
            </Typography>
          </Divider>

          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate('/login')}
            disabled={isLoading}
            sx={{ 
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: 2,
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
              },
            }}
          >
            Sign In to Existing Account
          </Button>
        </Paper>

        {/* Enhanced Footer */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>
            © 2024 Health First. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}

export default Register 