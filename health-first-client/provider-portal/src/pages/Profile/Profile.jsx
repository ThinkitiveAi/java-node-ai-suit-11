import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material'
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  LocalHospital as HospitalIcon,
} from '@mui/icons-material'

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    firstName: 'Dr. John',
    lastName: 'Smith',
    email: 'dr.smith@healthfirst.com',
    phone: '+1 (555) 123-4567',
    specialty: 'Cardiology',
    license: 'MD-12345',
    experience: '15 years',
    address: '123 Medical Center Dr, City, State 12345',
    education: 'Harvard Medical School',
    certifications: ['Board Certified Cardiologist', 'ACLS Certified'],
  })

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSave = () => {
    // TODO: Implement save logic
    console.log('Saving provider profile:', profileData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const recentPatients = [
    { name: 'John Doe', lastVisit: '2024-01-15', status: 'Active' },
    { name: 'Jane Smith', lastVisit: '2024-01-20', status: 'Active' },
    { name: 'Mike Johnson', lastVisit: '2024-01-10', status: 'Inactive' },
  ]

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Provider Profile</Typography>
        {!isEditing ? (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </Button>
        ) : (
          <Box>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </Box>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={profileData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="License Number"
                  name="license"
                  value={profileData.license}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={profileData.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Professional Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Specialty"
                  name="specialty"
                  value={profileData.specialty}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Years of Experience"
                  name="experience"
                  value={profileData.experience}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Education"
                  name="education"
                  value={profileData.education}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Profile Picture and Quick Info */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
            >
              <HospitalIcon sx={{ fontSize: 60 }} />
            </Avatar>
            <Typography variant="h6" gutterBottom>
              {profileData.firstName} {profileData.lastName}
            </Typography>
            <Typography color="textSecondary" gutterBottom>
              {profileData.specialty}
            </Typography>
            <Typography color="textSecondary" gutterBottom>
              License: {profileData.license}
            </Typography>
            <Chip label="Active" color="success" sx={{ mb: 2 }} />
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <EmailIcon />
                </ListItemIcon>
                <ListItemText primary={profileData.email} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PhoneIcon />
                </ListItemIcon>
                <ListItemText primary={profileData.phone} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LocationIcon />
                </ListItemIcon>
                <ListItemText primary={profileData.address} />
              </ListItem>
            </List>
          </Paper>

          {/* Certifications */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Certifications
            </Typography>
            <Box>
              {profileData.certifications.map((cert, index) => (
                <Chip
                  key={index}
                  label={cert}
                  color="primary"
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
          </Paper>

          {/* Recent Patients */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Patients
            </Typography>
            <List>
              {recentPatients.map((patient, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={patient.name}
                    secondary={`Last visit: ${patient.lastVisit}`}
                  />
                  <Chip
                    label={patient.status}
                    color={patient.status === 'Active' ? 'success' : 'default'}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Profile 