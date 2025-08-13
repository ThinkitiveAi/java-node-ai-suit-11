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
} from '@mui/icons-material'

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1990-05-15',
    address: '123 Main St, City, State 12345',
    bloodType: 'O+',
    emergencyContact: 'Jane Doe',
    emergencyPhone: '+1 (555) 987-6543',
  })

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSave = () => {
    // TODO: Implement save logic
    console.log('Saving profile:', profileData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const medicalHistory = [
    { condition: 'Hypertension', status: 'Controlled', date: '2020-01-15' },
    { condition: 'Diabetes Type 2', status: 'Managed', date: '2018-03-20' },
    { condition: 'Allergies', status: 'Active', date: '2015-06-10' },
  ]

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">My Profile</Typography>
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
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={handleChange}
                  disabled={!isEditing}
                  InputLabelProps={{
                    shrink: true,
                  }}
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
              Medical Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Blood Type"
                  name="bloodType"
                  value={profileData.bloodType}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Emergency Contact"
                  name="emergencyContact"
                  value={profileData.emergencyContact}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Emergency Phone"
                  name="emergencyPhone"
                  value={profileData.emergencyPhone}
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
              <PersonIcon sx={{ fontSize: 60 }} />
            </Avatar>
            <Typography variant="h6" gutterBottom>
              {profileData.firstName} {profileData.lastName}
            </Typography>
            <Typography color="textSecondary" gutterBottom>
              Patient ID: P-12345
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

          {/* Medical History */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Medical History
            </Typography>
            <List>
              {medicalHistory.map((item, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={item.condition}
                    secondary={`${item.status} - ${item.date}`}
                  />
                  <Chip
                    label={item.status}
                    color={item.status === 'Active' ? 'error' : 'success'}
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