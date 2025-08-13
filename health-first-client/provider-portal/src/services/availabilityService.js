import axios from 'axios'
import { format, parseISO, addDays, addWeeks, addMonths } from 'date-fns'
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz'

// Base API URL - replace with your actual API endpoint
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api'

class AvailabilityService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add request interceptor for authentication
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })
  }

  // Get all availability slots for a date range
  async getAvailabilitySlots(startDate, endDate, providerId = null) {
    try {
      const params = {
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
      }
      
      if (providerId) {
        params.providerId = providerId
      }

      const response = await this.api.get('/availability/slots', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching availability slots:', error)
      throw error
    }
  }

  // Create a new availability slot
  async createAvailabilitySlot(slotData) {
    try {
      const response = await this.api.post('/availability/slots', slotData)
      return response.data
    } catch (error) {
      console.error('Error creating availability slot:', error)
      throw error
    }
  }

  // Update an existing availability slot
  async updateAvailabilitySlot(slotId, slotData) {
    try {
      const response = await this.api.put(`/availability/slots/${slotId}`, slotData)
      return response.data
    } catch (error) {
      console.error('Error updating availability slot:', error)
      throw error
    }
  }

  // Delete an availability slot
  async deleteAvailabilitySlot(slotId, reason = '') {
    try {
      const response = await this.api.delete(`/availability/slots/${slotId}`, {
        data: { reason }
      })
      return response.data
    } catch (error) {
      console.error('Error deleting availability slot:', error)
      throw error
    }
  }

  // Create recurring availability slots
  async createRecurringSlots(slotData, recurrence, endDate) {
    try {
      const response = await this.api.post('/availability/slots/recurring', {
        ...slotData,
        recurrence,
        endDate: format(endDate, 'yyyy-MM-dd')
      })
      return response.data
    } catch (error) {
      console.error('Error creating recurring slots:', error)
      throw error
    }
  }

  // Get availability conflicts for a time slot
  async checkConflicts(slotData) {
    try {
      const response = await this.api.post('/availability/conflicts', slotData)
      return response.data
    } catch (error) {
      console.error('Error checking conflicts:', error)
      throw error
    }
  }

  // Get provider's default availability settings
  async getDefaultSettings(providerId) {
    try {
      const response = await this.api.get(`/availability/settings/${providerId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching default settings:', error)
      throw error
    }
  }

  // Update provider's default availability settings
  async updateDefaultSettings(providerId, settings) {
    try {
      const response = await this.api.put(`/availability/settings/${providerId}`, settings)
      return response.data
    } catch (error) {
      console.error('Error updating default settings:', error)
      throw error
    }
  }

  // Utility functions for timezone conversion
  convertToProviderTimezone(date, time, providerTimezone) {
    const dateTimeString = `${format(date, 'yyyy-MM-dd')}T${time}:00`
    const utcDate = new Date(dateTimeString)
    return utcToZonedTime(utcDate, providerTimezone)
  }

  convertToPatientTimezone(date, time, patientTimezone) {
    const dateTimeString = `${format(date, 'yyyy-MM-dd')}T${time}:00`
    const utcDate = new Date(dateTimeString)
    return utcToZonedTime(utcDate, patientTimezone)
  }

  // Validation functions
  validateSlotData(slotData) {
    const errors = []

    if (!slotData.date) {
      errors.push('Date is required')
    }

    if (!slotData.startTime) {
      errors.push('Start time is required')
    }

    if (!slotData.endTime) {
      errors.push('End time is required')
    }

    if (slotData.startTime && slotData.endTime) {
      if (slotData.startTime >= slotData.endTime) {
        errors.push('Start time must be before end time')
      }
    }

    if (slotData.slotDuration && (slotData.slotDuration < 15 || slotData.slotDuration > 120)) {
      errors.push('Slot duration must be between 15 and 120 minutes')
    }

    if (slotData.breakDuration && (slotData.breakDuration < 0 || slotData.breakDuration > 60)) {
      errors.push('Break duration must be between 0 and 60 minutes')
    }

    if (slotData.maxAppointments && (slotData.maxAppointments < 1 || slotData.maxAppointments > 10)) {
      errors.push('Max appointments must be between 1 and 10')
    }

    if (slotData.locationType === 'in-person' && !slotData.locationAddress) {
      errors.push('Address is required for in-person appointments')
    }

    return errors
  }

  // Generate recurring dates based on recurrence type
  generateRecurringDates(startDate, recurrence, endDate) {
    const dates = []
    let currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate))

      switch (recurrence) {
        case 'daily':
          currentDate = addDays(currentDate, 1)
          break
        case 'weekly':
          currentDate = addWeeks(currentDate, 1)
          break
        case 'monthly':
          currentDate = addMonths(currentDate, 1)
          break
        default:
          break
      }
    }

    return dates
  }

  // Check for time slot conflicts
  checkTimeConflicts(existingSlots, newSlot) {
    return existingSlots.some(slot => {
      // Skip the slot being edited
      if (newSlot.id && slot.id === newSlot.id) {
        return false
      }

      const newStart = newSlot.startTime
      const newEnd = newSlot.endTime
      const existingStart = slot.startTime
      const existingEnd = slot.endTime

      // Check for overlap
      return (
        (newStart >= existingStart && newStart < existingEnd) ||
        (newEnd > existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      )
    })
  }

  // Format time for display
  formatTime(time, timezone = null) {
    if (!time) return ''
    
    if (timezone) {
      // Convert to specified timezone
      const [hours, minutes] = time.split(':')
      const date = new Date()
      date.setHours(parseInt(hours), parseInt(minutes), 0)
      return format(utcToZonedTime(date, timezone), 'HH:mm')
    }
    
    return time
  }

  // Get available time slots for a specific date
  getAvailableSlotsForDate(date, existingSlots = []) {
    const slots = []
    const startHour = 8 // 8 AM
    const endHour = 18 // 6 PM
    const slotDuration = 30 // 30 minutes

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        
        // Check if this time slot conflicts with existing slots
        const hasConflict = existingSlots.some(slot => {
          const slotStart = slot.startTime
          const slotEnd = slot.endTime
          return time >= slotStart && time < slotEnd
        })

        if (!hasConflict) {
          slots.push(time)
        }
      }
    }

    return slots
  }
}

export default new AvailabilityService() 