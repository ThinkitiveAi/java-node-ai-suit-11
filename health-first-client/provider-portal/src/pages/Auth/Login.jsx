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
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { providerApi } from '../../services/providerApi'
import { handleApiError } from '../../utils/errorHandler'

const Login = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })

  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState('')

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) return 'Email is required'
    if (!emailRegex.test(email)) return 'Enter a valid email'
    return ''
  }

  const validatePassword = (password) => {
    if (!password) return 'Password is required'
    if (password.length < 6) return 'Minimum 6 characters'
    return ''
  }

  const validateForm = () => {
    const newErrors = {}
    const emailError = validateEmail(formData.email)
    const passwordError = validatePassword(formData.password)

    if (emailError) newErrors.email = emailError
    if (passwordError) newErrors.password = passwordError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'rememberMe' ? checked : value,
    }))

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
    if (generalError) setGeneralError('')
  }

  const handleSubmit = async (e) => {
    navigate('/register')
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setGeneralError('')

    try {
      const response = await providerApi.login(formData)
      console.log('Login success:', response)
     
    } catch (error) {
      const errorMessage = handleApiError(error)
      setGeneralError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container
      maxWidth="xs"
      sx={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // bgcolor: '#f9f9f9',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: '100%',
          p: 4,
          borderRadius: 3,
          backgroundColor: '#fff',
        }}
      >
        <Box mb={3}>
          <Typography variant="h5" fontWeight={600}>
            Log in to your account
          </Typography>
          <Typography variant="body2" mt={1} color="text.secondary">
            Welcome! Please enter your details.
          </Typography>
        </Box>

        {generalError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {generalError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="warning" />
                </InputAdornment>
              ),
            }}
            sx={{ borderRadius: 2 }}
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="warning" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <VisibilityOff color="warning" />
                    ) : (
                      <Visibility color="warning" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ borderRadius: 2 }}
          />

          <Box mt={1} display="flex" justifyContent="flex-end">
            <Link
              component="button"
              onClick={() => console.log('Forgot Password')}
              underline="none"
              sx={{ color: 'warning.main', fontWeight: 500 }}
            >
              Forgot Password?
            </Link>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="warning"
            onClick={handleSubmit}
            sx={{
              mt: 3,
              py: 1.5,
              fontWeight: 600,
              fontSize: '1rem',
              borderRadius: 2,
              textTransform: 'none',
            }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}

export default Login
