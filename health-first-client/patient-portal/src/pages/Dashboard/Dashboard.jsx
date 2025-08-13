import React from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material'
import {
  Event as EventIcon,
  LocalHospital as HospitalIcon,
  Medication as MedicationIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material'

const Dashboard = () => {
  const upcomingAppointments = [
    { id: 1, doctor: 'Dr. Smith', date: '2024-02-15', time: '10:00 AM' },
    { id: 2, doctor: 'Dr. Johnson', date: '2024-02-20', time: '2:30 PM' },
  ]

  const recentMedications = [
    { id: 1, name: 'Aspirin', dosage: '100mg', frequency: 'Daily' },
    { id: 2, name: 'Vitamin D', dosage: '1000IU', frequency: 'Daily' },
  ]

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, Patient!
      </Typography>
      
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <EventIcon color="primary" sx={{ mr: 1 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Upcoming Appointments
                  </Typography>
                  <Typography variant="h5">2</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <HospitalIcon color="primary" sx={{ mr: 1 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Medications
                  </Typography>
                  <Typography variant="h5">3</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Health Score
                  </Typography>
                  <Typography variant="h5">85%</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <MedicationIcon color="primary" sx={{ mr: 1 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Last Checkup
                  </Typography>
                  <Typography variant="h5">2 weeks ago</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Appointments */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Appointments
            </Typography>
            <List>
              {upcomingAppointments.map((appointment) => (
                <ListItem key={appointment.id}>
                  <ListItemIcon>
                    <EventIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={appointment.doctor}
                    secondary={`${appointment.date} at ${appointment.time}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Recent Medications */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Medications
            </Typography>
            <List>
              {recentMedications.map((medication) => (
                <ListItem key={medication.id}>
                  <ListItemIcon>
                    <MedicationIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={medication.name}
                    secondary={`${medication.dosage} - ${medication.frequency}`}
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

export default Dashboard 