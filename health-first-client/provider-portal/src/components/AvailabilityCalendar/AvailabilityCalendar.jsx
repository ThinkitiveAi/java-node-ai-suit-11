import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Grid,
  Typography,
  IconButton,
  Card,
  CardContent,
  Chip,
  Button,
  Tooltip,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material'
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material'
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, parseISO } from 'date-fns'
import { DatePicker } from '@mui/x-date-pickers'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

const AvailabilityCalendar = ({
  availabilityData = {},
  onSlotClick,
  onAddSlot,
  onEditSlot,
  onDeleteSlot,
  selectedDate,
  onDateChange,
  loading = false,
  viewMode = 'week', // 'week', 'month'
}) => {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date())
  const [quickAddDialog, setQuickAddDialog] = useState(false)
  const [quickAddForm, setQuickAddForm] = useState({
    startTime: '09:00',
    endTime: '10:00',
    appointmentType: 'consultation',
    locationType: 'in-person',
  })

  // Appointment types with colors
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

  useEffect(() => {
    if (selectedDate) {
      setCurrentDate(selectedDate)
    }
  }, [selectedDate])

  const getWeekDays = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 }) // Monday start
    const end = endOfWeek(currentDate, { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }

  const getMonthDays = () => {
    // For month view, we'll show 4-5 weeks
    const start = startOfWeek(currentDate, { weekStartsOn: 1 })
    const end = endOfWeek(addDays(currentDate, 28), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }

  const getDaysToShow = () => {
    return viewMode === 'week' ? getWeekDays() : getMonthDays()
  }

  const getSlotsForDate = (date) => {
    const dateKey = format(date, 'yyyy-MM-dd')
    return availabilityData[dateKey] || []
  }

  const getAppointmentTypeColor = (type) => {
    const appointmentType = appointmentTypes.find(t => t.value === type)
    return appointmentType?.color || 'default'
  }

  const getAppointmentTypeLabel = (type) => {
    const appointmentType = appointmentTypes.find(t => t.value === type)
    return appointmentType?.label || type
  }

  const getLocationTypeIcon = (type) => {
    switch (type) {
      case 'in-person':
        return <LocationIcon fontSize="small" />
      case 'virtual':
        return <ScheduleIcon fontSize="small" />
      case 'hybrid':
        return <LocationIcon fontSize="small" />
      default:
        return <ScheduleIcon fontSize="small" />
    }
  }

  const handlePreviousWeek = () => {
    const newDate = subDays(currentDate, 7)
    setCurrentDate(newDate)
    onDateChange?.(newDate)
  }

  const handleNextWeek = () => {
    const newDate = addDays(currentDate, 7)
    setCurrentDate(newDate)
    onDateChange?.(newDate)
  }

  const handleToday = () => {
    const today = new Date()
    setCurrentDate(today)
    onDateChange?.(today)
  }

  const handleQuickAdd = () => {
    setQuickAddDialog(true)
  }

  const handleQuickAddSubmit = () => {
    if (onAddSlot) {
      onAddSlot({
        ...quickAddForm,
        date: currentDate,
      })
    }
    setQuickAddDialog(false)
    setQuickAddForm({
      startTime: '09:00',
      endTime: '10:00',
      appointmentType: 'consultation',
      locationType: 'in-person',
    })
  }

  const handleSlotClick = (slot, date) => {
    if (onSlotClick) {
      onSlotClick(slot, date)
    }
  }

  const handleEditSlot = (slot, event) => {
    event.stopPropagation()
    if (onEditSlot) {
      onEditSlot(slot)
    }
  }

  const handleDeleteSlot = (slot, event) => {
    event.stopPropagation()
    if (onDeleteSlot) {
      onDeleteSlot(slot)
    }
  }

  const renderTimeSlot = (slot, date) => (
    <Card
      key={slot.id}
      sx={{
        mb: 1,
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 2,
        },
        border: slot.booked > 0 ? '2px solid #f44336' : '1px solid #e0e0e0',
      }}
      onClick={() => handleSlotClick(slot, date)}
    >
      <CardContent sx={{ py: 1, px: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Typography variant="caption" color="primary" fontWeight="bold">
              {slot.startTime} - {slot.endTime}
            </Typography>
            <Typography variant="caption" display="block">
              {getAppointmentTypeLabel(slot.appointmentType)}
            </Typography>
            {slot.booked > 0 && (
              <Typography variant="caption" color="error">
                {slot.booked}/{slot.maxAppointments} booked
              </Typography>
            )}
            {slot.fee && (
              <Typography variant="caption" color="textSecondary">
                ${slot.fee}
              </Typography>
            )}
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <Tooltip title={getLocationTypeLabel(slot.locationType)}>
              <Box color="text.secondary">
                {getLocationTypeIcon(slot.locationType)}
              </Box>
            </Tooltip>
            <IconButton
              size="small"
              onClick={(e) => handleEditSlot(slot, e)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={(e) => handleDeleteSlot(slot, e)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )

  const getLocationTypeLabel = (type) => {
    const locationType = locationTypes.find(t => t.value === type)
    return locationType?.label || type
  }

  const renderDayColumn = (day) => {
    const slots = getSlotsForDate(day)
    const isCurrentDay = isToday(day)

    return (
      <Grid item xs={12} md={viewMode === 'week' ? 1.7 : 2.4} key={day.toISOString()}>
        <Paper
          sx={{
            p: 2,
            minHeight: viewMode === 'week' ? 200 : 150,
            border: isCurrentDay ? '2px solid #1976d2' : '1px solid #e0e0e0',
            backgroundColor: isCurrentDay ? '#f3f6f9' : 'white',
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6" color={isCurrentDay ? 'primary' : 'text.primary'}>
              {format(day, 'EEE')}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {format(day, 'MMM dd')}
            </Typography>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={100}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Box>
              {slots.length > 0 ? (
                slots.map((slot) => renderTimeSlot(slot, day))
              ) : (
                <Typography variant="body2" color="textSecondary" textAlign="center">
                  No slots
                </Typography>
              )}
            </Box>
          )}
        </Paper>
      </Grid>
    )
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Calendar Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton onClick={handlePreviousWeek}>
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="h6">
              {viewMode === 'week' 
                ? `${format(getWeekDays()[0], 'MMM dd')} - ${format(getWeekDays()[6], 'MMM dd, yyyy')}`
                : format(currentDate, 'MMMM yyyy')
              }
            </Typography>
            <IconButton onClick={handleNextWeek}>
              <ChevronRightIcon />
            </IconButton>
            <Button
              variant="outlined"
              startIcon={<TodayIcon />}
              onClick={handleToday}
              size="small"
            >
              Today
            </Button>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <DatePicker
              label="Go to Date"
              value={currentDate}
              onChange={(newValue) => {
                setCurrentDate(newValue)
                onDateChange?.(newValue)
              }}
              renderInput={(params) => <TextField {...params} size="small" />}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleQuickAdd}
              size="small"
            >
              Quick Add
            </Button>
          </Box>
        </Box>

        {/* Calendar Grid */}
        <Grid container spacing={2}>
          {getDaysToShow().map((day) => renderDayColumn(day))}
        </Grid>

        {/* Quick Add Dialog */}
        <Dialog open={quickAddDialog} onClose={() => setQuickAddDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Quick Add Time Slot</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Time"
                  type="time"
                  value={quickAddForm.startTime}
                  onChange={(e) => setQuickAddForm(prev => ({ ...prev, startTime: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Time"
                  type="time"
                  value={quickAddForm.endTime}
                  onChange={(e) => setQuickAddForm(prev => ({ ...prev, endTime: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Appointment Type</InputLabel>
                  <Select
                    value={quickAddForm.appointmentType}
                    onChange={(e) => setQuickAddForm(prev => ({ ...prev, appointmentType: e.target.value }))}
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
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Location Type</InputLabel>
                  <Select
                    value={quickAddForm.locationType}
                    onChange={(e) => setQuickAddForm(prev => ({ ...prev, locationType: e.target.value }))}
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
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setQuickAddDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleQuickAddSubmit}>
              Add Slot
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  )
}

export default AvailabilityCalendar 