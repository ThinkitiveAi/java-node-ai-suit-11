import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
} from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'

const Appointments = () => {
  const [open, setOpen] = useState(false)
  const [appointments] = useState([
    {
      id: 1,
      doctor: 'Dr. Smith',
      specialty: 'Cardiology',
      date: '2024-02-15',
      time: '10:00 AM',
      status: 'Confirmed',
      type: 'Follow-up',
    },
    {
      id: 2,
      doctor: 'Dr. Johnson',
      specialty: 'Dermatology',
      date: '2024-02-20',
      time: '2:30 PM',
      status: 'Pending',
      type: 'Consultation',
    },
  ])

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'success'
      case 'Pending':
        return 'warning'
      case 'Cancelled':
        return 'error'
      default:
        return 'default'
    }
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">My Appointments</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          Book Appointment
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Doctor</TableCell>
              <TableCell>Specialty</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>{appointment.doctor}</TableCell>
                <TableCell>{appointment.specialty}</TableCell>
                <TableCell>{appointment.date}</TableCell>
                <TableCell>{appointment.time}</TableCell>
                <TableCell>{appointment.type}</TableCell>
                <TableCell>
                  <Chip
                    label={appointment.status}
                    color={getStatusColor(appointment.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button size="small" color="primary">
                    Reschedule
                  </Button>
                  <Button size="small" color="error">
                    Cancel
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Book Appointment Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Book New Appointment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Select Doctor"
                select
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">Select a doctor</option>
                <option value="dr-smith">Dr. Smith - Cardiology</option>
                <option value="dr-johnson">Dr. Johnson - Dermatology</option>
                <option value="dr-williams">Dr. Williams - Neurology</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Appointment Type"
                select
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">Select type</option>
                <option value="consultation">Consultation</option>
                <option value="follow-up">Follow-up</option>
                <option value="emergency">Emergency</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Preferred Date"
                type="date"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Preferred Time"
                type="time"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reason for Visit"
                multiline
                rows={3}
                placeholder="Please describe your symptoms or reason for the appointment"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleClose} variant="contained">
            Book Appointment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Appointments 