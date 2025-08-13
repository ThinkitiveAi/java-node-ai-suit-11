import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Alert,
  Switch,
  FormControlLabel,
  Divider,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  Snackbar,
  CircularProgress,
  Autocomplete,
  Slider,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material'
import { DatePicker, TimePicker } from '@mui/x-date-pickers'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { format, addDays, addWeeks, addMonths, isSameDay, parseISO } from 'date-fns'
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz'
import AvailabilityCalendar from '../../components/AvailabilityCalendar/AvailabilityCalendar'
import AvailabilitySettings from '../../components/AvailabilitySettings/AvailabilitySettings'
import availabilityService from '../../services/availabilityService'

const Schedule = () => {
  const [openDialog, setOpenDialog] = useState(false)
  const [editSlot, setEditSlot] = useState(null)
  const [deleteSlot, setDeleteSlot] = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState('week') // 'week', 'month', 'list'
  const [availabilityData, setAvailabilityData] = useState({})
  const [providerId] = useState('provider-123') // TODO: Get from auth context

  // Form state
  const [slotForm, setSlotForm] = useState({
    date: new Date(),
    startTime: '09:00',
    endTime: '10:00',
    timezone: 'America/New_York',
    appointmentType: 'consultation',
    slotDuration: 30,
    breakDuration: 15,
    maxAppointments: 1,
    locationType: 'in-person',
    locationAddress: '',
    room: '',
    fee: '',
    currency: 'USD',
    insuranceAccepted: false,
    notes: '',
    tags: [],
    recurrence: 'none', // 'none', 'daily', 'weekly', 'monthly'
    recurrenceEndDate: null,
  })

  // Timezone options
  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'UTC', label: 'UTC' },
  ]

  // Appointment types
  const appointmentTypes = [
    { value: 'consultation', label: 'Consultation', color: 'primary' },
    { value: 'follow-up', label: 'Follow-up', color: 'secondary' },
    { value: 'checkup', label: 'Checkup', color: 'success' },
    { value: 'emergency', label: 'Emergency', color: 'error' },
    { value: 'procedure', label: 'Procedure', color: 'warning' },
  ]

  // Location types
  const locationTypes = [
    { value: 'in-person', label: 'In-Person' },
    { value: 'virtual', label: 'Virtual' },
    { value: 'hybrid', label: 'Hybrid' },
  ]

  // Load availability data on component mount
  useEffect(() => {
    loadAvailabilityData()
  }, [])

  const loadAvailabilityData = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API call
      // const data = await availabilityService.getAvailabilitySlots(
      //   addDays(new Date(), -7),
      //   addDays(new Date(), 30),
      //   providerId
      // )
      // setAvailabilityData(data)

      // For now, use sample data
      setAvailabilityData({
        '2024-01-15': [
          {
            id: 1,
            startTime: '09:00',
            endTime: '10:00',
            appointmentType: 'consultation',
            slotDuration: 30,
            maxAppointments: 2,
            locationType: 'in-person',
            fee: 150,
            currency: 'USD',
            insuranceAccepted: true,
            notes: 'General consultation',
            tags: ['new-patient'],
            booked: 1,
          },
          {
            id: 2,
            startTime: '14:00',
            endTime: '15:00',
            appointmentType: 'follow-up',
            slotDuration: 45,
            maxAppointments: 1,
            locationType: 'virtual',
            fee: 120,
            currency: 'USD',
            insuranceAccepted: true,
            notes: 'Follow-up consultation',
            tags: ['follow-up'],
            booked: 0,
          },
        ],
        '2024-01-16': [
          {
            id: 3,
            startTime: '10:00',
            endTime: '12:00',
            appointmentType: 'procedure',
            slotDuration: 60,
            maxAppointments: 1,
            locationType: 'in-person',
            fee: 300,
            currency: 'USD',
            insuranceAccepted: false,
            notes: 'Minor procedure',
            tags: ['procedure'],
            booked: 0,
          },
        ],
      })
    } catch (error) {
      console.error('Error loading availability data:', error)
      setSnackbar({
        open: true,
        message: 'Error loading availability data',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (slot = null) => {
    if (slot) {
      setEditSlot(slot)
      setSlotForm({
        ...slot,
        date: parseISO(slot.date || new Date().toISOString().split('T')[0]),
      })
    } else {
      setEditSlot(null)
      setSlotForm({
        date: new Date(),
        startTime: '09:00',
        endTime: '10:00',
        timezone: 'America/New_York',
        appointmentType: 'consultation',
        slotDuration: 30,
        breakDuration: 15,
        maxAppointments: 1,
        locationType: 'in-person',
        locationAddress: '',
        room: '',
        fee: '',
        currency: 'USD',
        insuranceAccepted: false,
        notes: '',
        tags: [],
        recurrence: 'none',
        recurrenceEndDate: null,
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditSlot(null)
  }

  const handleDeleteSlot = (slot) => {
    setDeleteSlot(slot)
  }

  const confirmDelete = async () => {
    try {
      // TODO: Replace with actual API call
      // await availabilityService.deleteAvailabilitySlot(deleteSlot.id)
      
      // Remove slot from availability data
      const dateKey = format(selectedDate, 'yyyy-MM-dd')
      const updatedSlots = availabilityData[dateKey]?.filter(s => s.id !== deleteSlot.id) || []
      
      setAvailabilityData(prev => ({
        ...prev,
        [dateKey]: updatedSlots
      }))
      
      setDeleteSlot(null)
      setSnackbar({
        open: true,
        message: 'Time slot deleted successfully',
        severity: 'success'
      })
    } catch (error) {
      console.error('Error deleting slot:', error)
      setSnackbar({
        open: true,
        message: 'Error deleting time slot',
        severity: 'error'
      })
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    
    // Validate form
    const errors = availabilityService.validateSlotData(slotForm)
    if (errors.length > 0) {
      setSnackbar({
        open: true,
        message: errors[0],
        severity: 'error'
      })
      setLoading(false)
      return
    }

    try {
      const dateKey = format(slotForm.date, 'yyyy-MM-dd')
      const existingSlots = availabilityData[dateKey] || []
      
      // Check for conflicts
      const hasConflict = availabilityService.checkTimeConflicts(existingSlots, slotForm)
      if (hasConflict) {
        setSnackbar({
          open: true,
          message: 'Time slot conflicts with existing availability',
          severity: 'warning'
        })
        setLoading(false)
        return
      }

      // Create new slot or update existing
      const newSlot = {
        id: editSlot?.id || Date.now(),
        ...slotForm,
        date: dateKey,
        booked: editSlot?.booked || 0,
      }

      // TODO: Replace with actual API call
      // if (editSlot) {
      //   await availabilityService.updateAvailabilitySlot(editSlot.id, newSlot)
      // } else {
      //   await availabilityService.createAvailabilitySlot(newSlot)
      // }

      const updatedSlots = editSlot 
        ? existingSlots.map(s => s.id === editSlot.id ? newSlot : s)
        : [...existingSlots, newSlot]

      setAvailabilityData(prev => ({
        ...prev,
        [dateKey]: updatedSlots
      }))

      setLoading(false)
      handleCloseDialog()
      setSnackbar({
        open: true,
        message: editSlot ? 'Time slot updated successfully' : 'Time slot created successfully',
        severity: 'success'
      })
    } catch (error) {
      console.error('Error saving slot:', error)
      setSnackbar({
        open: true,
        message: 'Error saving time slot',
        severity: 'error'
      })
      setLoading(false)
    }
  }

  const handleCalendarSlotClick = (slot, date) => {
    handleOpenDialog(slot)
  }

  const handleCalendarAddSlot = (slotData) => {
    setSlotForm({
      ...slotForm,
      ...slotData,
      date: selectedDate,
    })
    setOpenDialog(true)
  }

  const handleCalendarEditSlot = (slot) => {
    handleOpenDialog(slot)
  }

  const handleCalendarDeleteSlot = (slot) => {
    handleDeleteSlot(slot)
  }

  const handleSettingsSave = (settings) => {
    setSnackbar({
      open: true,
      message: 'Settings saved successfully',
      severity: 'success'
    })
  }

  const getAppointmentTypeColor = (type) => {
    const appointmentType = appointmentTypes.find(t => t.value === type)
    return appointmentType?.color || 'default'
  }

  const getAppointmentTypeLabel = (type) => {
    const appointmentType = appointmentTypes.find(t => t.value === type)
    return appointmentType?.label || type
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Availability Management</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Time Slot
          </Button>
        </Box>

        {/* View Mode Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Calendar View" />
            <Tab label="List View" />
            <Tab label="Settings" />
          </Tabs>
        </Paper>

        {/* Calendar View */}
        {activeTab === 0 && (
          <AvailabilityCalendar
            availabilityData={availabilityData}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onSlotClick={handleCalendarSlotClick}
            onAddSlot={handleCalendarAddSlot}
            onEditSlot={handleCalendarEditSlot}
            onDeleteSlot={handleCalendarDeleteSlot}
            loading={loading}
            viewMode={viewMode}
          />
        )}

        {/* List View */}
        {activeTab === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>All Time Slots</Typography>
            {Object.entries(availabilityData).map(([date, slots]) => (
              <Paper key={date} sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {format(parseISO(date), 'EEEE, MMMM dd, yyyy')}
                </Typography>
                <Grid container spacing={2}>
                  {slots.map((slot) => (
                    <Grid item xs={12} md={6} lg={4} key={slot.id}>
                      <Card>
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {slot.startTime} - {slot.endTime}
                              </Typography>
                              <Chip 
                                label={getAppointmentTypeLabel(slot.appointmentType)}
                                color={getAppointmentTypeColor(slot.appointmentType)}
                                size="small"
                                sx={{ mb: 1 }}
                              />
                              <Typography variant="body2" color="textSecondary">
                                Duration: {slot.slotDuration} min
                              </Typography>
                              {slot.fee && (
                                <Typography variant="body2">
                                  ${slot.fee} {slot.currency}
                                </Typography>
                              )}
                              {slot.booked > 0 && (
                                <Typography variant="body2" color="error">
                                  {slot.booked}/{slot.maxAppointments} appointments booked
                                </Typography>
                              )}
                            </Box>
                            <Box>
                              <IconButton onClick={() => handleOpenDialog(slot)}>
                                <EditIcon />
                              </IconButton>
                              <IconButton color="error" onClick={() => handleDeleteSlot(slot)}>
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            ))}
          </Box>
        )}

        {/* Settings View */}
        {activeTab === 2 && (
          <AvailabilitySettings
            providerId={providerId}
            onSave={handleSettingsSave}
          />
        )}

        {/* Add/Edit Slot Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editSlot ? 'Edit Time Slot' : 'Add New Time Slot'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Basic Information</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Date"
                  value={slotForm.date}
                  onChange={(newValue) => setSlotForm(prev => ({ ...prev, date: newValue }))}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Start Time"
                  type="time"
                  value={slotForm.startTime}
                  onChange={(e) => setSlotForm(prev => ({ ...prev, startTime: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="End Time"
                  type="time"
                  value={slotForm.endTime}
                  onChange={(e) => setSlotForm(prev => ({ ...prev, endTime: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={slotForm.timezone}
                    onChange={(e) => setSlotForm(prev => ({ ...prev, timezone: e.target.value }))}
                    label="Timezone"
                  >
                    {timezones.map((tz) => (
                      <MenuItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Appointment Type</InputLabel>
                  <Select
                    value={slotForm.appointmentType}
                    onChange={(e) => setSlotForm(prev => ({ ...prev, appointmentType: e.target.value }))}
                    label="Appointment Type"
                  >
                    {appointmentTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Duration Settings */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Duration Settings</Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Slot Duration (minutes)"
                  type="number"
                  value={slotForm.slotDuration}
                  onChange={(e) => setSlotForm(prev => ({ ...prev, slotDuration: parseInt(e.target.value) }))}
                  inputProps={{ min: 15, max: 120 }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Break Duration (minutes)"
                  type="number"
                  value={slotForm.breakDuration}
                  onChange={(e) => setSlotForm(prev => ({ ...prev, breakDuration: parseInt(e.target.value) }))}
                  inputProps={{ min: 0, max: 60 }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Max Appointments"
                  type="number"
                  value={slotForm.maxAppointments}
                  onChange={(e) => setSlotForm(prev => ({ ...prev, maxAppointments: parseInt(e.target.value) }))}
                  inputProps={{ min: 1, max: 10 }}
                />
              </Grid>

              {/* Location Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Location Information</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Location Type</InputLabel>
                  <Select
                    value={slotForm.locationType}
                    onChange={(e) => setSlotForm(prev => ({ ...prev, locationType: e.target.value }))}
                    label="Location Type"
                  >
                    {locationTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Room Number"
                  value={slotForm.room}
                  onChange={(e) => setSlotForm(prev => ({ ...prev, room: e.target.value }))}
                  placeholder="Room 101"
                />
              </Grid>

              {slotForm.locationType === 'in-person' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={slotForm.locationAddress}
                    onChange={(e) => setSlotForm(prev => ({ ...prev, locationAddress: e.target.value }))}
                    placeholder="123 Main St, City, State"
                  />
                </Grid>
              )}

              {/* Pricing Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Pricing Information</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Fee"
                  type="number"
                  value={slotForm.fee}
                  onChange={(e) => setSlotForm(prev => ({ ...prev, fee: e.target.value }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={slotForm.currency}
                    onChange={(e) => setSlotForm(prev => ({ ...prev, currency: e.target.value }))}
                    label="Currency"
                  >
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="EUR">EUR</MenuItem>
                    <MenuItem value="GBP">GBP</MenuItem>
                    <MenuItem value="CAD">CAD</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={slotForm.insuranceAccepted}
                      onChange={(e) => setSlotForm(prev => ({ ...prev, insuranceAccepted: e.target.checked }))}
                    />
                  }
                  label="Insurance Accepted"
                />
              </Grid>

              {/* Recurrence Settings */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Recurrence Settings</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Recurrence</InputLabel>
                  <Select
                    value={slotForm.recurrence}
                    onChange={(e) => setSlotForm(prev => ({ ...prev, recurrence: e.target.value }))}
                    label="Recurrence"
                  >
                    <MenuItem value="none">No Recurrence</MenuItem>
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {slotForm.recurrence !== 'none' && (
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="End Date"
                    value={slotForm.recurrenceEndDate}
                    onChange={(newValue) => setSlotForm(prev => ({ ...prev, recurrenceEndDate: newValue }))}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
              )}

              {/* Notes and Tags */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Additional Information</Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={3}
                  value={slotForm.notes}
                  onChange={(e) => setSlotForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes or special requirements..."
                />
              </Grid>

              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  freeSolo
                  options={['new-patient', 'follow-up', 'urgent', 'routine']}
                  value={slotForm.tags}
                  onChange={(event, newValue) => setSlotForm(prev => ({ ...prev, tags: newValue }))}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option}
                        {...getTagProps({ index })}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Tags"
                      placeholder="Add tags..."
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {editSlot ? 'Update Slot' : 'Create Slot'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteSlot} onClose={() => setDeleteSlot(null)}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this time slot?
            </Typography>
            {deleteSlot && (
              <Box mt={2}>
                <Typography variant="body2" color="textSecondary">
                  Date: {format(parseISO(deleteSlot.date), 'MMM dd, yyyy')}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Time: {deleteSlot.startTime} - {deleteSlot.endTime}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Type: {getAppointmentTypeLabel(deleteSlot.appointmentType)}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteSlot(null)}>Cancel</Button>
            <Button color="error" variant="contained" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  )
}

export default Schedule 