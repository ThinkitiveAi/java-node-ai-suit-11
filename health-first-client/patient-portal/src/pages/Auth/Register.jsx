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
  Stepper,
  Step,
  StepLabel,
  Chip,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Phone,
  Lock,
  LocationOn,
  Favorite,
  Business,
  School,
  CalendarToday,
  ContactPhone,
  Security,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

const Register = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  
  const [activeStep, setActiveStep] = useState(0)
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    
    // Address
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    
    // Emergency Contact (Optional)
    emergencyName: '',
    emergencyRelationship: '',
    emergencyPhone: '',
    
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

  const steps = ['Personal Info', 'Address', 'Emergency Contact', 'Security']

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
      
      case 'dateOfBirth':
        if (!value) return 'Date of birth is required'
        // Simple date validation - YYYY-MM-DD format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        if (!dateRegex.test(value)) return 'Please enter date in YYYY-MM-DD format'
        
        const today = new Date()
        const birthDate = new Date(value)
        const age = today.getFullYear() - birthDate.getFullYear()
        if (age < 13) return 'You must be at least 13 years old to register'
        if (age > 120) return 'Please enter a valid date of birth'
        return ''
      
      case 'gender':
        if (!value) return 'Gender is required'
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
      
      case 'emergencyPhone':
        if (value && formData.emergencyPhone) {
          const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
          if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) return 'Please enter a valid phone number'
        }
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

  const validateStep = (step) => {
    const newErrors = {}
    let isValid = true

    switch (step) {
      case 0: // Personal Information
        ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender'].forEach(field => {
          const error = validateField(field, formData[field])
          if (error) {
            newErrors[field] = error
            isValid = false
          }
        })
        break
      
      case 1: // Address
        ['streetAddress', 'city', 'state', 'zipCode'].forEach(field => {
          const error = validateField(field, formData[field])
          if (error) {
            newErrors[field] = error
            isValid = false
          }
        })
        break
      
      case 2: // Emergency Contact (Optional - only validate if filled)
        if (formData.emergencyName || formData.emergencyPhone) {
          if (formData.emergencyName && !formData.emergencyPhone) {
            newErrors.emergencyPhone = 'Emergency phone is required if emergency contact name is provided'
            isValid = false
          }
          if (formData.emergencyPhone && !formData.emergencyName) {
            newErrors.emergencyName = 'Emergency contact name is required if emergency phone is provided'
            isValid = false
          }
          if (formData.emergencyPhone) {
            const error = validateField('emergencyPhone', formData.emergencyPhone)
            if (error) {
              newErrors.emergencyPhone = error
              isValid = false
            }
          }
        }
        break
      
      case 3: // Security
        ['password', 'confirmPassword'].forEach(field => {
          const error = validateField(field, formData[field])
          if (error) {
            newErrors[field] = error
            isValid = false
          }
        })
        break
    }

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

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setActiveStep(prev => prev - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateStep(activeStep)) {
      return
    }
    
    setIsLoading(true)
    setGeneralError('')
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate different error scenarios
      if (formData.email === 'duplicate@example.com') {
        throw new Error('An account with this email already exists.')
      }
      
      if (formData.phone === '1234567890') {
        throw new Error('A patient with this phone number is already registered.')
      }
      
      // Success
      setSuccessMessage('Registration successful! Please check your email to verify your account.')
      setTimeout(() => {
        navigate('/login')
      }, 3000)
      
    } catch (error) {
      setGeneralError(error.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
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
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
                disabled={isLoading}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
                disabled={isLoading}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                      <Phone color="action" />
                    </InputAdornment>
                  ),
                }}
                disabled={isLoading}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                error={!!errors.dateOfBirth}
                helperText={errors.dateOfBirth || 'Format: YYYY-MM-DD'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarToday color="action" />
                    </InputAdornment>
                  ),
                }}
                disabled={isLoading}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.gender} disabled={isLoading}>
                <InputLabel>Gender</InputLabel>
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  label="Gender"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                  <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
                </Select>
                {errors.gender && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {errors.gender}
                  </Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>
        )
      
      case 1:
        return (
          <Grid container spacing={2}>
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
                      <LocationOn color="action" />
                    </InputAdornment>
                  ),
                }}
                disabled={isLoading}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
          </Grid>
        )
      
      case 2:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: '#666' }}>
                Emergency Contact (Optional)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                This information will only be used in case of emergency
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Emergency Contact Name"
                name="emergencyName"
                value={formData.emergencyName}
                onChange={handleChange}
                error={!!errors.emergencyName}
                helperText={errors.emergencyName}
                disabled={isLoading}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Relationship"
                name="emergencyRelationship"
                value={formData.emergencyRelationship}
                onChange={handleChange}
                placeholder="e.g., Spouse, Parent, Friend"
                disabled={isLoading}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Emergency Phone Number"
                name="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={handleChange}
                error={!!errors.emergencyPhone}
                helperText={errors.emergencyPhone}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ContactPhone color="action" />
                    </InputAdornment>
                  ),
                }}
                disabled={isLoading}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
          </Grid>
        )
      
      case 3:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: '#666' }}>
                Create Your Password
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Choose a strong password to protect your health information
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password || 'Must be at least 8 characters with uppercase, lowercase, and number'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Security color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={isLoading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                disabled={isLoading}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                      <Security color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                disabled={isLoading}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
          </Grid>
        )
      
      default:
        return null
    }
  }

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          py: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Paper 
          elevation={isMobile ? 0 : 12} 
          sx={{ 
            p: isMobile ? 3 : 5, 
            width: '100%',
            borderRadius: isMobile ? 0 : 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Favorite 
                sx={{ 
                  fontSize: 48, 
                  color: '#e91e63',
                  mb: 1 
                }} 
              />
            </Box>
            <Typography 
              component="h1" 
              variant={isMobile ? "h5" : "h4"} 
              gutterBottom
              sx={{ 
                fontWeight: 600,
                color: '#2c3e50',
                mb: 1
              }}
            >
              Join Health First
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create your patient account to access healthcare services
            </Typography>
          </Box>

          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Success/Error Messages */}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              {successMessage}
            </Alert>
          )}
          
          {generalError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {generalError}
            </Alert>
          )}

          {/* Form Content */}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            {renderStepContent(activeStep)}

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0 || isLoading}
                onClick={handleBack}
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                Back
              </Button>
              
              <Box>
                {activeStep === steps.length - 1 ? (
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isLoading}
                    sx={{ 
                      py: 1.5,
                      px: 4,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      borderRadius: 2,
                      background: 'linear-gradient(45deg, #e91e63 30%, #ff5722 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #c2185b 30%, #e64a19 90%)',
                      }
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={isLoading}
                    sx={{ 
                      py: 1.5,
                      px: 4,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      borderRadius: 2,
                      background: 'linear-gradient(45deg, #e91e63 30%, #ff5722 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #c2185b 30%, #e64a19 90%)',
                      }
                    }}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
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
              borderColor: '#e91e63',
              color: '#e91e63',
              '&:hover': {
                borderColor: '#c2185b',
                backgroundColor: 'rgba(233, 30, 99, 0.04)',
              }
            }}
          >
            Sign In to Existing Account
          </Button>
        </Paper>

        {/* Footer */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="rgba(255, 255, 255, 0.8)">
            © 2024 Health First. Your health, our priority.
          </Typography>
        </Box>
      </Box>
    </Container>
  )
}

export default Register 