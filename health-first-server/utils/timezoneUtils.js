/**
 * Timezone utility functions for handling UTC conversions and timezone operations
 */

/**
 * Convert local time to UTC
 * @param {string} localTime - Time in HH:mm format
 * @param {string} localDate - Date in YYYY-MM-DD format
 * @param {string} timezone - Timezone string (e.g., "America/New_York")
 * @returns {Date} UTC date object
 */
function localToUTC(localTime, localDate, timezone) {
  try {
    // Create a date string in the local timezone
    const dateTimeString = `${localDate}T${localTime}:00`;
    
    // Create a date object (this will be interpreted as local time)
    const localDateTime = new Date(dateTimeString);
    
    // Get the timezone offset in minutes
    const timezoneOffset = getTimezoneOffset(timezone, localDateTime);
    
    // Convert to UTC by subtracting the offset
    const utcDateTime = new Date(localDateTime.getTime() - (timezoneOffset * 60 * 1000));
    
    return utcDateTime;
  } catch (error) {
    throw new Error(`Failed to convert local time to UTC: ${error.message}`);
  }
}

/**
 * Convert UTC time to local time
 * @param {Date} utcDateTime - UTC date object
 * @param {string} timezone - Target timezone string
 * @returns {Object} Object with local date and time
 */
function utcToLocal(utcDateTime, timezone) {
  try {
    // Get the timezone offset in minutes
    const timezoneOffset = getTimezoneOffset(timezone, utcDateTime);
    
    // Convert to local time by adding the offset
    const localDateTime = new Date(utcDateTime.getTime() + (timezoneOffset * 60 * 1000));
    
    // Format the date and time
    const localDate = localDateTime.toISOString().split('T')[0];
    const localTime = localDateTime.toTimeString().slice(0, 5);
    
    return {
      date: localDate,
      time: localTime,
      datetime: localDateTime
    };
  } catch (error) {
    throw new Error(`Failed to convert UTC to local time: ${error.message}`);
  }
}

/**
 * Get timezone offset in minutes
 * @param {string} timezone - Timezone string
 * @param {Date} date - Date to get offset for
 * @returns {number} Offset in minutes
 */
function getTimezoneOffset(timezone, date) {
  try {
    // Create a date string in the target timezone
    const timeString = date.toLocaleString('en-US', { timeZone: timezone });
    const targetDate = new Date(timeString);
    
    // Get the offset between UTC and the target timezone
    const offset = targetDate.getTime() - date.getTime();
    
    return offset / (60 * 1000); // Convert to minutes
  } catch (error) {
    // Fallback: use a simple mapping for common timezones
    return getSimpleTimezoneOffset(timezone);
  }
}

/**
 * Simple timezone offset mapping for common timezones
 * @param {string} timezone - Timezone string
 * @returns {number} Offset in minutes
 */
function getSimpleTimezoneOffset(timezone) {
  const timezoneOffsets = {
    'America/New_York': -300, // EST/EDT
    'America/Chicago': -360,  // CST/CDT
    'America/Denver': -420,   // MST/MDT
    'America/Los_Angeles': -480, // PST/PDT
    'Europe/London': 0,       // GMT/BST
    'Europe/Paris': 60,       // CET/CEST
    'Asia/Tokyo': 540,        // JST
    'Asia/Shanghai': 480,     // CST
    'Asia/Kolkata': 330,      // IST
    'Australia/Sydney': 600,  // AEST/AEDT
    'UTC': 0
  };
  
  return timezoneOffsets[timezone] || 0;
}

/**
 * Check if a date is during daylight saving time
 * @param {Date} date - Date to check
 * @param {string} timezone - Timezone string
 * @returns {boolean} True if DST is in effect
 */
function isDST(date, timezone) {
  try {
    const jan = new Date(date.getFullYear(), 0, 1);
    const jul = new Date(date.getFullYear(), 6, 1);
    
    const janOffset = getTimezoneOffset(timezone, jan);
    const julOffset = getTimezoneOffset(timezone, jul);
    
    return Math.min(janOffset, julOffset) !== getTimezoneOffset(timezone, date);
  } catch (error) {
    return false;
  }
}

/**
 * Generate time slots between start and end time
 * @param {string} startTime - Start time in HH:mm format
 * @param {string} endTime - End time in HH:mm format
 * @param {number} slotDuration - Slot duration in minutes
 * @param {number} breakDuration - Break duration in minutes
 * @returns {Array} Array of time slots
 */
function generateTimeSlots(startTime, endTime, slotDuration = 30, breakDuration = 0) {
  const slots = [];
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  
  let currentTime = startMinutes;
  
  while (currentTime + slotDuration <= endMinutes) {
    const slotStart = minutesToTime(currentTime);
    const slotEnd = minutesToTime(currentTime + slotDuration);
    
    slots.push({
      start_time: slotStart,
      end_time: slotEnd
    });
    
    currentTime += slotDuration + breakDuration;
  }
  
  return slots;
}

/**
 * Convert time string to minutes
 * @param {string} timeStr - Time in HH:mm format
 * @returns {number} Minutes since midnight
 */
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes to time string
 * @param {number} minutes - Minutes since midnight
 * @returns {string} Time in HH:mm format
 */
function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Validate timezone string
 * @param {string} timezone - Timezone string to validate
 * @returns {boolean} True if valid timezone
 */
function isValidTimezone(timezone) {
  const validTimezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Kolkata',
    'Australia/Sydney'
  ];
  
  return validTimezones.includes(timezone);
}

module.exports = {
  localToUTC,
  utcToLocal,
  getTimezoneOffset,
  isDST,
  generateTimeSlots,
  timeToMinutes,
  minutesToTime,
  isValidTimezone
}; 