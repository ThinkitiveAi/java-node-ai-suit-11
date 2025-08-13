import { format, parseISO } from 'date-fns'
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz'

// Common timezone options
export const TIMEZONE_OPTIONS = [
  { value: 'America/New_York', label: 'Eastern Time (ET)', offset: '-05:00' },
  { value: 'America/Chicago', label: 'Central Time (CT)', offset: '-06:00' },
  { value: 'America/Denver', label: 'Mountain Time (MT)', offset: '-07:00' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', offset: '-08:00' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)', offset: '-09:00' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)', offset: '-10:00' },
  { value: 'UTC', label: 'UTC', offset: '+00:00' },
  { value: 'Europe/London', label: 'British Time (GMT)', offset: '+00:00' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)', offset: '+01:00' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)', offset: '+09:00' },
  { value: 'Asia/Shanghai', label: 'China Standard Time (CST)', offset: '+08:00' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)', offset: '+10:00' },
]

// Get timezone offset for display
export const getTimezoneOffset = (timezone) => {
  const option = TIMEZONE_OPTIONS.find(tz => tz.value === timezone)
  return option ? option.offset : '+00:00'
}

// Convert time between timezones
export const convertTimeBetweenTimezones = (time, fromTimezone, toTimezone) => {
  if (!time || !fromTimezone || !toTimezone) return time

  try {
    const [hours, minutes] = time.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes), 0)

    // Convert from source timezone to UTC
    const utcDate = zonedTimeToUtc(date, fromTimezone)
    
    // Convert from UTC to target timezone
    const targetDate = utcToZonedTime(utcDate, toTimezone)
    
    return format(targetDate, 'HH:mm')
  } catch (error) {
    console.error('Error converting time between timezones:', error)
    return time
  }
}

// Format time with timezone
export const formatTimeWithTimezone = (time, timezone) => {
  if (!time || !timezone) return time

  const offset = getTimezoneOffset(timezone)
  return `${time} (${offset})`
}

// Get current time in specified timezone
export const getCurrentTimeInTimezone = (timezone) => {
  try {
    const now = new Date()
    const zonedTime = utcToZonedTime(now, timezone)
    return format(zonedTime, 'HH:mm')
  } catch (error) {
    console.error('Error getting current time in timezone:', error)
    return format(new Date(), 'HH:mm')
  }
}

// Validate time format (HH:mm)
export const validateTimeFormat = (time) => {
  if (!time) return false
  
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  return timeRegex.test(time)
}

// Validate time range
export const validateTimeRange = (startTime, endTime) => {
  if (!startTime || !endTime) return false
  
  if (!validateTimeFormat(startTime) || !validateTimeFormat(endTime)) {
    return false
  }

  const start = new Date(`2000-01-01T${startTime}:00`)
  const end = new Date(`2000-01-01T${endTime}:00`)
  
  return start < end
}

// Get time difference in minutes
export const getTimeDifference = (startTime, endTime) => {
  if (!startTime || !endTime) return 0
  
  const start = new Date(`2000-01-01T${startTime}:00`)
  const end = new Date(`2000-01-01T${endTime}:00`)
  
  return Math.round((end - start) / (1000 * 60))
}

// Generate time slots between start and end time
export const generateTimeSlots = (startTime, endTime, slotDuration = 30) => {
  if (!validateTimeRange(startTime, endTime)) return []
  
  const slots = []
  const start = new Date(`2000-01-01T${startTime}:00`)
  const end = new Date(`2000-01-01T${endTime}:00`)
  
  let current = new Date(start)
  
  while (current < end) {
    slots.push(format(current, 'HH:mm'))
    current.setMinutes(current.getMinutes() + slotDuration)
  }
  
  return slots
}

// Check if time slot overlaps with existing slots
export const checkTimeSlotOverlap = (newSlot, existingSlots) => {
  return existingSlots.some(slot => {
    const newStart = new Date(`2000-01-01T${newSlot.startTime}:00`)
    const newEnd = new Date(`2000-01-01T${newSlot.endTime}:00`)
    const existingStart = new Date(`2000-01-01T${slot.startTime}:00`)
    const existingEnd = new Date(`2000-01-01T${slot.endTime}:00`)
    
    return (
      (newStart >= existingStart && newStart < existingEnd) ||
      (newEnd > existingStart && newEnd <= existingEnd) ||
      (newStart <= existingStart && newEnd >= existingEnd)
    )
  })
}

// Format duration for display
export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes} min`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`
  }
  
  return `${hours}h ${remainingMinutes}m`
}

// Get business hours validation
export const validateBusinessHours = (time, businessHours = { start: '08:00', end: '18:00' }) => {
  if (!time) return false
  
  const timeDate = new Date(`2000-01-01T${time}:00`)
  const startDate = new Date(`2000-01-01T${businessHours.start}:00`)
  const endDate = new Date(`2000-01-01T${businessHours.end}:00`)
  
  return timeDate >= startDate && timeDate <= endDate
}

// Get timezone abbreviation
export const getTimezoneAbbreviation = (timezone) => {
  const abbreviations = {
    'America/New_York': 'ET',
    'America/Chicago': 'CT',
    'America/Denver': 'MT',
    'America/Los_Angeles': 'PT',
    'America/Anchorage': 'AKT',
    'Pacific/Honolulu': 'HST',
    'UTC': 'UTC',
    'Europe/London': 'GMT',
    'Europe/Paris': 'CET',
    'Asia/Tokyo': 'JST',
    'Asia/Shanghai': 'CST',
    'Australia/Sydney': 'AET',
  }
  
  return abbreviations[timezone] || timezone
}

// Detect user's timezone
export const detectUserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch (error) {
    console.error('Error detecting user timezone:', error)
    return 'UTC'
  }
}

// Get timezone display name
export const getTimezoneDisplayName = (timezone) => {
  const option = TIMEZONE_OPTIONS.find(tz => tz.value === timezone)
  return option ? option.label : timezone
} 