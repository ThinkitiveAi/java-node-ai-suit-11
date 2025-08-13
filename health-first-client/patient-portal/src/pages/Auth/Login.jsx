import React, { useState } from 'react'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Checkbox,
  FormControlLabel,
  Link,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
  Chip,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Email,
  Phone,
  Lock,
  Favorite,
  Person,
  Help,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  
  const [formData, setFormData] = useState({
    loginIdentifier: '',
    password: '',
    rememberMe: false,
  })
  
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState('')
  const [inputType, setInputType] = useState('email') // 'email' or 'phone'

  // Validation functions
  const validateLoginIdentifier = (value) => {
    if (!value) return 'Email or phone number is required'
    
    // Check if it's an email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (emailRegex.test(value)) {
      setInputType('email')
      return ''
    }
    
    // Check if it's a phone number
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    const cleanPhone = value.replace(/[\s\-\(\)]/g, '')
    if (phoneRegex.test(cleanPhone)) {
      setInputType('phone')
      return ''
    }
    
    return 'Please enter a valid email address or phone number'
  }

  const validatePassword = (password) => {
    if (!password) return 'Password is required'
    if (password.length < 6) return 'Password must be at least 6 characters'
    return ''
  }

  const validateForm = () => {
    const newErrors = {}
    
    const identifierError = validateLoginIdentifier(formData.loginIdentifier)
    if (identifierError) newErrors.loginIdentifier = identifierError
    
    const passwordError = validatePassword(formData.password)
    if (passwordError) newErrors.password = passwordError
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rememberMe' ? checked : value
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
      return
    }
    
    setIsLoading(true)
    setGeneralError('')
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate different error scenarios
      if (formData.loginIdentifier === 'error@example.com' || formData.loginIdentifier === '1234567890') {
        throw new Error('Invalid credentials. Please check your login details and password.')
      }
      
      if (formData.loginIdentifier === 'locked@example.com' || formData.loginIdentifier === '0987654321') {
        throw new Error('Account is temporarily locked. Please contact support for assistance.')
      }
      
      if (formData.loginIdentifier === 'notfound@example.com' || formData.loginIdentifier === '5555555555') {
        throw new Error('Account not found. Please check your email/phone or create a new account.')
      }
      
      if (formData.loginIdentifier === 'network@example.com' || formData.loginIdentifier === '1111111111') {
        throw new Error('Network connection issue. Please check your internet and try again.')
      }
      
      // Success - redirect to dashboard
      console.log('Patient login successful:', formData)
      navigate('/dashboard')
      
    } catch (error) {
      setGeneralError(error.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = () => {
    // TODO: Implement forgot password flow
    console.log('Forgot password clicked')
  }

  const getInputIcon = () => {
    return inputType === 'email' ? <Email color="action" /> : <Phone color="action" />
  }

  const getInputLabel = () => {
    return inputType === 'email' ? 'Email Address' : 'Phone Number'
  }

  const getInputType = () => {
    return inputType === 'email' ? 'email' : 'tel'
  }

  return (
    <Container component="main" maxWidth="sm">
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
              Welcome Back
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Sign in to access your health information and manage your care
            </Typography>
            
            {/* Input Type Indicator */}
            <Chip
              icon={getInputIcon()}
              label={`Using ${inputType === 'email' ? 'Email' : 'Phone'}`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontSize: '0.75rem' }}
            />
          </Box>

          {/* Error Alert */}
          {generalError && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                '& .MuiAlert-message': {
                  fontSize: '0.9rem'
                }
              }}
            >
              {generalError}
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="loginIdentifier"
              label="Email or Phone Number"
              name="loginIdentifier"
              type={getInputType()}
              autoComplete={inputType === 'email' ? 'email' : 'tel'}
              autoFocus
              value={formData.loginIdentifier}
              onChange={handleChange}
              error={!!errors.loginIdentifier}
              helperText={errors.loginIdentifier || 'Enter your email address or phone number'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {getInputIcon()}
                  </InputAdornment>
                ),
              }}
              disabled={isLoading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    color="primary"
                    disabled={isLoading}
                  />
                }
                label="Remember me"
                sx={{ fontSize: '0.9rem' }}
              />
              <Link
                component="button"
                variant="body2"
                onClick={handleForgotPassword}
                disabled={isLoading}
                sx={{ 
                  textDecoration: 'none',
                  color: '#e91e63',
                  fontWeight: 500,
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                mb: 2,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 2,
                background: 'linear-gradient(45deg, #e91e63 30%, #ff5722 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #c2185b 30%, #e64a19 90%)',
                }
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                New to Health First?
              </Typography>
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate('/register')}
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
              Create Patient Account
            </Button>

            {/* Help Section */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Need help signing in?
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Link
                  component="button"
                  variant="body2"
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                  sx={{ 
                    textDecoration: 'none',
                    color: '#666',
                    fontSize: '0.8rem',
                    '&:hover': {
                      color: '#e91e63'
                    }
                  }}
                >
                  <Help sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                  Get Help
                </Link>
              </Box>
            </Box>
          </Box>
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

export default Login 