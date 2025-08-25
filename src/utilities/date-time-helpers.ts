/**
 * Date and Time Helper Utilities
 * For separating and combining date/time fields
 */

import { format, parse, isValid } from 'date-fns'
import { fr, ar } from 'date-fns/locale'
import type { Locale } from '@/utilities/locale'

/**
 * Combine separate date and time fields into ISO string
 * @param date - Date in YYYY-MM-DD format
 * @param time - Optional time in HH:mm format (24-hour)
 * @returns ISO date string
 */
export function combineDateTimeFields(date: string, time?: string): string {
  if (!date) {
    throw new Error('Date is required')
  }

  try {
    // Parse the date
    const dateObj = new Date(date)
    
    if (!isValid(dateObj)) {
      throw new Error('Invalid date format')
    }

    // If time is provided, parse and set it
    if (time) {
      const [hours, minutes] = time.split(':').map(Number)
      
      if (isNaN(hours) || isNaN(minutes)) {
        throw new Error('Invalid time format')
      }
      
      dateObj.setHours(hours, minutes, 0, 0)
    } else {
      // Default to 00:00 if no time provided
      dateObj.setHours(0, 0, 0, 0)
    }

    return dateObj.toISOString()
  } catch (error) {
    console.error('Error combining date/time fields:', error)
    throw error
  }
}

/**
 * Separate ISO date string into date and time components
 * @param datetime - ISO date string
 * @returns Object with separate date and time strings
 */
export function separateDateTimeFields(datetime: string): {
  date: string
  time: string | null
} {
  if (!datetime) {
    return { date: '', time: null }
  }

  try {
    const dateObj = new Date(datetime)
    
    if (!isValid(dateObj)) {
      return { date: '', time: null }
    }

    const date = format(dateObj, 'yyyy-MM-dd')
    const hours = dateObj.getHours()
    const minutes = dateObj.getMinutes()
    
    // Only return time if it's not 00:00
    const time = (hours === 0 && minutes === 0) 
      ? null 
      : format(dateObj, 'HH:mm')
    
    return { date, time }
  } catch (error) {
    console.error('Error separating date/time fields:', error)
    return { date: '', time: null }
  }
}

/**
 * Format date for display based on locale
 * @param date - Date string or Date object
 * @param locale - Locale (fr or ar)
 * @returns Formatted date string
 */
export function formatDateForLocale(date: string | Date, locale: Locale): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    if (!isValid(dateObj)) {
      return ''
    }

    // Format based on locale
    const formatString = locale === 'ar' ? 'yyyy/MM/dd' : 'dd/MM/yyyy'
    const localeObj = locale === 'ar' ? ar : fr
    
    return format(dateObj, formatString, { locale: localeObj })
  } catch (error) {
    console.error('Error formatting date:', error)
    return ''
  }
}

/**
 * Format time for display (with optional 12-hour format)
 * @param time - Time string in HH:mm format
 * @param use12Hour - Whether to use 12-hour format
 * @returns Formatted time string
 */
export function formatTimeForDisplay(time: string, use12Hour: boolean = false): string {
  if (!time) return ''
  
  try {
    // Create a date object with the time
    const [hours, minutes] = time.split(':').map(Number)
    const dateObj = new Date()
    dateObj.setHours(hours, minutes, 0, 0)
    
    if (!isValid(dateObj)) {
      return time
    }

    return use12Hour 
      ? format(dateObj, 'h:mm a')
      : format(dateObj, 'HH:mm')
  } catch (error) {
    console.error('Error formatting time:', error)
    return time
  }
}

/**
 * Validate date string
 * @param date - Date string to validate
 * @param minDate - Optional minimum date
 * @param maxDate - Optional maximum date
 * @returns Validation result
 */
export function validateDate(
  date: string,
  minDate?: Date,
  maxDate?: Date
): { isValid: boolean; error?: string } {
  if (!date) {
    return { isValid: false, error: 'Date is required' }
  }

  try {
    const dateObj = new Date(date)
    
    if (!isValid(dateObj)) {
      return { isValid: false, error: 'Invalid date format' }
    }

    if (minDate && dateObj < minDate) {
      return { isValid: false, error: 'Date is before minimum allowed date' }
    }

    if (maxDate && dateObj > maxDate) {
      return { isValid: false, error: 'Date is after maximum allowed date' }
    }

    return { isValid: true }
  } catch (error) {
    return { isValid: false, error: 'Invalid date' }
  }
}

/**
 * Validate time string
 * @param time - Time string in HH:mm format
 * @param required - Whether time is required
 * @returns Validation result
 */
export function validateTime(
  time: string,
  required: boolean = false
): { isValid: boolean; error?: string } {
  if (!time && !required) {
    return { isValid: true }
  }

  if (!time && required) {
    return { isValid: false, error: 'Time is required' }
  }

  // Check format HH:mm
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  
  if (!timeRegex.test(time)) {
    return { isValid: false, error: 'Invalid time format (HH:mm)' }
  }

  return { isValid: true }
}

/**
 * Generate time options for dropdown
 * @param interval - Minute interval (1, 5, 10, 15, 30)
 * @param use12Hour - Whether to format in 12-hour
 * @returns Array of time options
 */
export function generateTimeOptions(
  interval: 1 | 5 | 10 | 15 | 30 = 15,
  use12Hour: boolean = false
): Array<{ value: string; label: string }> {
  const options: Array<{ value: string; label: string }> = []
  
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      
      const label = use12Hour 
        ? formatTimeForDisplay(time24, true)
        : time24
      
      options.push({ value: time24, label })
    }
  }
  
  return options
}