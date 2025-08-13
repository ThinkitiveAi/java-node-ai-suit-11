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
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from '@mui/material'
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from '@mui/icons-material'

const Patients = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)

  const patients = [
    {
      id: 1,
      name: 'John Doe',
      age: 35,
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      lastVisit: '2024-01-15',
      status: 'Active',
      bloodType: 'O+',
    },
    {
      id: 2,
      name: 'Jane Smith',
      age: 28,
      email: 'jane.smith@example.com',
      phone: '+1 (555) 234-5678',
      lastVisit: '2024-01-20',
      status: 'Active',
      bloodType: 'A-',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      age: 42,
      email: 'mike.johnson@example.com',
      phone: '+1 (555) 345-6789',
      lastVisit: '2024-01-10',
      status: 'Inactive',
      bloodType: 'B+',
    },
  ]

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedPatient(null)
  }

  const getStatusColor = (status) => {
    return status === 'Active' ? 'success' : 'default'
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Patients</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
        >
          Add New Patient
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search patients by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Last Visit</TableCell>
              <TableCell>Blood Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPatients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell>{patient.name}</TableCell>
                <TableCell>{patient.age}</TableCell>
                <TableCell>{patient.email}</TableCell>
                <TableCell>{patient.phone}</TableCell>
                <TableCell>{patient.lastVisit}</TableCell>
                <TableCell>{patient.bloodType}</TableCell>
                <TableCell>
                  <Chip
                    label={patient.status}
                    color={getStatusColor(patient.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleViewPatient(patient)}
                  >
                    <ViewIcon />
                  </IconButton>
                  <IconButton size="small" color="secondary">
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Patient Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Patient Details</DialogTitle>
        <DialogContent>
          {selectedPatient && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  value={selectedPatient.name}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Age"
                  value={selectedPatient.age}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  value={selectedPatient.email}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={selectedPatient.phone}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Blood Type"
                  value={selectedPatient.bloodType}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Last Visit"
                  value={selectedPatient.lastVisit}
                  disabled
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          <Button variant="contained">Edit Patient</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Patients 