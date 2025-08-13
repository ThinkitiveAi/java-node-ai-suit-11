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
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material'

const Appointments = () => {
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)

  const appointments = [
    {
      id: 1,
      patient: 'John Doe',
      date: '2024-02-15',
      time: '09:00 AM',
      type: 'Follow-up',
      status: 'Confirmed',
      notes: 'Regular checkup',
    },
    {
      id: 2,
      patient: 'Jane Smith',
      date: '2024-02-15',
      time: '10:30 AM',
      type: 'Consultation',
      status: 'Pending',
      notes: 'New patient consultation',
    },
    {
      id: 3,
      patient: 'Mike Johnson',
      date: '2024-02-15',
      time: '02:00 PM',
      type: 'Emergency',
      status: 'Confirmed',
      notes: 'Emergency visit',
    },
  ]

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setEditMode(true)
    setOpenDialog(true)
  }

  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setEditMode(false)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedAppointment(null)
    setEditMode(false)
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
        <Typography variant="h4">Appointments</Typography>
        <Button variant="contained">
          Schedule Appointment
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Patient</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>{appointment.patient}</TableCell>
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
                <TableCell>{appointment.notes}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleViewAppointment(appointment)}
                  >
                    <CheckCircleIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="secondary"
                    onClick={() => handleEditAppointment(appointment)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <CancelIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Appointment Details/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? 'Edit Appointment' : 'Appointment Details'}
        </DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Patient"
                  value={selectedAppointment.patient}
                  disabled={!editMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  value={selectedAppointment.date}
                  disabled={!editMode}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Time"
                  type="time"
                  value={selectedAppointment.time}
                  disabled={!editMode}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={!editMode}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={selectedAppointment.type}
                    label="Type"
                  >
                    <MenuItem value="Consultation">Consultation</MenuItem>
                    <MenuItem value="Follow-up">Follow-up</MenuItem>
                    <MenuItem value="Emergency">Emergency</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={!editMode}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={selectedAppointment.status}
                    label="Status"
                  >
                    <MenuItem value="Confirmed">Confirmed</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={3}
                  value={selectedAppointment.notes}
                  disabled={!editMode}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          {editMode && (
            <Button variant="contained">
              Save Changes
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Appointments 