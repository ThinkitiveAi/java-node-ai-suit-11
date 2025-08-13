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
  People as PeopleIcon,
  Event as EventIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  LocalHospital as HospitalIcon,
} from '@mui/icons-material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

const Dashboard = () => {
  const todayAppointments = [
    { id: 1, patient: 'John Doe', time: '09:00 AM', type: 'Follow-up' },
    { id: 2, patient: 'Jane Smith', time: '10:30 AM', type: 'Consultation' },
    { id: 3, patient: 'Mike Johnson', time: '02:00 PM', type: 'Emergency' },
  ]

  const weeklyData = [
    { day: 'Mon', appointments: 8, patients: 6 },
    { day: 'Tue', appointments: 12, patients: 10 },
    { day: 'Wed', appointments: 10, patients: 8 },
    { day: 'Thu', appointments: 15, patients: 12 },
    { day: 'Fri', appointments: 9, patients: 7 },
    { day: 'Sat', appointments: 5, patients: 4 },
    { day: 'Sun', appointments: 2, patients: 2 },
  ]

  const monthlyRevenue = [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 48000 },
    { month: 'Apr', revenue: 61000 },
    { month: 'May', revenue: 55000 },
    { month: 'Jun', revenue: 67000 },
  ]

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, Dr. Smith!
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
                    Today's Appointments
                  </Typography>
                  <Typography variant="h5">8</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PeopleIcon color="primary" sx={{ mr: 1 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Patients
                  </Typography>
                  <Typography variant="h5">1,247</Typography>
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
                    Monthly Revenue
                  </Typography>
                  <Typography variant="h5">$67K</Typography>
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
                    Pending Reports
                  </Typography>
                  <Typography variant="h5">12</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Weekly Appointments & Patients
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="appointments" fill="#8884d8" name="Appointments" />
                <Bar dataKey="patients" fill="#82ca9d" name="Patients" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Today's Appointments */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Today's Schedule
            </Typography>
            <List>
              {todayAppointments.map((appointment) => (
                <ListItem key={appointment.id}>
                  <ListItemIcon>
                    <ScheduleIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={appointment.patient}
                    secondary={`${appointment.time} - ${appointment.type}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Revenue Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Revenue Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard 