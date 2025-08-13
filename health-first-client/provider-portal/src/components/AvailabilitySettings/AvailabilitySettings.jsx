import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  InputAdornment,
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Business as BusinessIcon,
  Save as SaveIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material'

const AvailabilitySettings = ({ providerId, onSave }) => {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [settings, setSettings] = useState({
    // General Settings
    autoConfirmAppointments: true,
    requireInsuranceVerification: false,
    sendConfirmationEmails: true,
    sendReminderEmails: true,
    allowPatientCancellation: true,
    requireCancellationNotice: 24, // hours

    // Working Hours
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    defaultStartTime: '09:00',
    defaultEndTime: '17:00',
    lunchStartTime: '12:00',
    lunchEndTime: '13:00',
    timezone: 'America/New_York',

    // Slot Settings
    defaultSlotDuration: 30,
    defaultBreakDuration: 15,
    maxAppointmentsPerSlot: 1,
    bufferTimeBeforeAppointment: 0,
    bufferTimeAfterAppointment: 0,

    // Pricing Settings
    defaultFee: 150,
    defaultCurrency: 'USD',
    acceptInsurance: true,
    requirePrePayment: false,
    cancellationFee: 0,

    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    reminderTime: 24, // hours before appointment
    followUpReminders: true,
    followUpDays: 7,

    // Security Settings
    requirePatientConsent: true,
    logAllActivities: true,
    dataRetentionDays: 365,
    allowDataExport: true,
  })

  const workingDaysOptions = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
  ]

  const timezoneOptions = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'UTC', label: 'UTC' },
  ]

  const currencyOptions = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'CAD', label: 'CAD (C$)' },
  ]

  useEffect(() => {
    // Load settings from API
    loadSettings()
  }, [providerId])

  const loadSettings = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API call
      // const response = await availabilityService.getDefaultSettings(providerId)
      // setSettings(response.data)
      
      // For now, use default settings
      setLoading(false)
    } catch (error) {
      console.error('Error loading settings:', error)
      setLoading(false)
    }
  }

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
    setSaved(false)
  }

  const handleWorkingDayChange = (day, checked) => {
    const newWorkingDays = checked
      ? [...settings.workingDays, day]
      : settings.workingDays.filter(d => d !== day)
    
    handleSettingChange('workingDays', newWorkingDays)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API call
      // await availabilityService.updateDefaultSettings(providerId, settings)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSaved(true)
      onSave?.(settings)
      
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderGeneralSettings = () => (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box display="flex" alignItems="center" gap={1}>
          <SettingsIcon />
          <Typography variant="h6">General Settings</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoConfirmAppointments}
                  onChange={(e) => handleSettingChange('autoConfirmAppointments', e.target.checked)}
                />
              }
              label="Auto-confirm appointments"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.requireInsuranceVerification}
                  onChange={(e) => handleSettingChange('requireInsuranceVerification', e.target.checked)}
                />
              }
              label="Require insurance verification"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.sendConfirmationEmails}
                  onChange={(e) => handleSettingChange('sendConfirmationEmails', e.target.checked)}
                />
              }
              label="Send confirmation emails"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.allowPatientCancellation}
                  onChange={(e) => handleSettingChange('allowPatientCancellation', e.target.checked)}
                />
              }
              label="Allow patient cancellation"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Cancellation Notice (hours)"
              type="number"
              value={settings.requireCancellationNotice}
              onChange={(e) => handleSettingChange('requireCancellationNotice', parseInt(e.target.value))}
              inputProps={{ min: 0, max: 72 }}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  )

  const renderWorkingHours = () => (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box display="flex" alignItems="center" gap={1}>
          <ScheduleIcon />
          <Typography variant="h6">Working Hours</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Working Days</Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {workingDaysOptions.map((day) => (
                <FormControlLabel
                  key={day.value}
                  control={
                    <Switch
                      checked={settings.workingDays.includes(day.value)}
                      onChange={(e) => handleWorkingDayChange(day.value, e.target.checked)}
                      size="small"
                    />
                  }
                  label={day.label}
                />
              ))}
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Default Start Time"
              type="time"
              value={settings.defaultStartTime}
              onChange={(e) => handleSettingChange('defaultStartTime', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Default End Time"
              type="time"
              value={settings.defaultEndTime}
              onChange={(e) => handleSettingChange('defaultEndTime', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Lunch Start Time"
              type="time"
              value={settings.lunchStartTime}
              onChange={(e) => handleSettingChange('lunchStartTime', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Lunch End Time"
              type="time"
              value={settings.lunchEndTime}
              onChange={(e) => handleSettingChange('lunchEndTime', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Timezone</InputLabel>
              <Select
                value={settings.timezone}
                onChange={(e) => handleSettingChange('timezone', e.target.value)}
                label="Timezone"
              >
                {timezoneOptions.map((tz) => (
                  <MenuItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  )

  const renderSlotSettings = () => (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box display="flex" alignItems="center" gap={1}>
          <BusinessIcon />
          <Typography variant="h6">Slot Settings</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Default Slot Duration (minutes)"
              type="number"
              value={settings.defaultSlotDuration}
              onChange={(e) => handleSettingChange('defaultSlotDuration', parseInt(e.target.value))}
              inputProps={{ min: 15, max: 120 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Default Break Duration (minutes)"
              type="number"
              value={settings.defaultBreakDuration}
              onChange={(e) => handleSettingChange('defaultBreakDuration', parseInt(e.target.value))}
              inputProps={{ min: 0, max: 60 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Max Appointments per Slot"
              type="number"
              value={settings.maxAppointmentsPerSlot}
              onChange={(e) => handleSettingChange('maxAppointmentsPerSlot', parseInt(e.target.value))}
              inputProps={{ min: 1, max: 10 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Buffer Time Before (minutes)"
              type="number"
              value={settings.bufferTimeBeforeAppointment}
              onChange={(e) => handleSettingChange('bufferTimeBeforeAppointment', parseInt(e.target.value))}
              inputProps={{ min: 0, max: 60 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Buffer Time After (minutes)"
              type="number"
              value={settings.bufferTimeAfterAppointment}
              onChange={(e) => handleSettingChange('bufferTimeAfterAppointment', parseInt(e.target.value))}
              inputProps={{ min: 0, max: 60 }}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  )

  const renderPricingSettings = () => (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box display="flex" alignItems="center" gap={1}>
          <AttachMoney />
          <Typography variant="h6">Pricing Settings</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Default Fee"
              type="number"
              value={settings.defaultFee}
              onChange={(e) => handleSettingChange('defaultFee', parseFloat(e.target.value))}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Default Currency</InputLabel>
              <Select
                value={settings.defaultCurrency}
                onChange={(e) => handleSettingChange('defaultCurrency', e.target.value)}
                label="Default Currency"
              >
                {currencyOptions.map((currency) => (
                  <MenuItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.acceptInsurance}
                  onChange={(e) => handleSettingChange('acceptInsurance', e.target.checked)}
                />
              }
              label="Accept insurance"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.requirePrePayment}
                  onChange={(e) => handleSettingChange('requirePrePayment', e.target.checked)}
                />
              }
              label="Require pre-payment"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Cancellation Fee"
              type="number"
              value={settings.cancellationFee}
              onChange={(e) => handleSettingChange('cancellationFee', parseFloat(e.target.value))}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  )

  const renderNotificationSettings = () => (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box display="flex" alignItems="center" gap={1}>
          <NotificationsIcon />
          <Typography variant="h6">Notification Settings</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.emailNotifications}
                  onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                />
              }
              label="Email notifications"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.smsNotifications}
                  onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                />
              }
              label="SMS notifications"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.appointmentReminders}
                  onChange={(e) => handleSettingChange('appointmentReminders', e.target.checked)}
                />
              }
              label="Appointment reminders"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Reminder Time (hours before)"
              type="number"
              value={settings.reminderTime}
              onChange={(e) => handleSettingChange('reminderTime', parseInt(e.target.value))}
              inputProps={{ min: 1, max: 72 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.followUpReminders}
                  onChange={(e) => handleSettingChange('followUpReminders', e.target.checked)}
                />
              }
              label="Follow-up reminders"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Follow-up Days"
              type="number"
              value={settings.followUpDays}
              onChange={(e) => handleSettingChange('followUpDays', parseInt(e.target.value))}
              inputProps={{ min: 1, max: 30 }}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  )

  const renderSecuritySettings = () => (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box display="flex" alignItems="center" gap={1}>
          <SecurityIcon />
          <Typography variant="h6">Security Settings</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.requirePatientConsent}
                  onChange={(e) => handleSettingChange('requirePatientConsent', e.target.checked)}
                />
              }
              label="Require patient consent"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.logAllActivities}
                  onChange={(e) => handleSettingChange('logAllActivities', e.target.checked)}
                />
              }
              label="Log all activities"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Data Retention (days)"
              type="number"
              value={settings.dataRetentionDays}
              onChange={(e) => handleSettingChange('dataRetentionDays', parseInt(e.target.value))}
              inputProps={{ min: 30, max: 2555 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.allowDataExport}
                  onChange={(e) => handleSettingChange('allowDataExport', e.target.checked)}
                />
              }
              label="Allow data export"
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  )

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Availability Settings</Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : 'Save Settings'}
        </Button>
      </Box>

      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully!
        </Alert>
      )}

      {renderGeneralSettings()}
      {renderWorkingHours()}
      {renderSlotSettings()}
      {renderPricingSettings()}
      {renderNotificationSettings()}
      {renderSecuritySettings()}
    </Box>
  )
}

export default AvailabilitySettings 