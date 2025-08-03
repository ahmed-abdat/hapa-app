/**
 * Development-aware logging utility
 * Automatically handles console logging based on environment
 */

const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  /**
   * Log info messages (only in development)
   */
  log: (message: string, data?: any) => {
    if (isDevelopment) {
      if (data !== undefined) {
        console.log(message, data)
      } else {
        console.log(message)
      }
    }
  },

  /**
   * Log error messages (always logged for debugging)
   */
  error: (message: string, error?: any) => {
    if (error !== undefined) {
      console.error(message, error)
    } else {
      console.error(message)
    }
  },

  /**
   * Log warning messages (only in development)
   */
  warn: (message: string, data?: any) => {
    if (isDevelopment) {
      if (data !== undefined) {
        console.warn(message, data)
      } else {
        console.warn(message)
      }
    }
  },

  /**
   * Log debug messages (only in development)
   */
  debug: (message: string, data?: any) => {
    if (isDevelopment) {
      if (data !== undefined) {
        console.debug(message, data)
      } else {
        console.debug(message)
      }
    }
  },

  /**
   * Log form submission start
   */
  formSubmission: (formType: string, data?: any) => {
    if (isDevelopment) {
      console.log(`🚀 ${formType} form submission started`, data ? { data } : '')
    }
  },

  /**
   * Log API responses
   */
  apiResponse: (status: number, data?: any) => {
    if (isDevelopment) {
      console.log(`📡 API response status: ${status}`)
      if (data) {
        console.log('📦 API response data:', data)
      }
    }
  },

  /**
   * Log success messages
   */
  success: (message: string, id?: string) => {
    if (isDevelopment) {
      console.log(`✅ ${message}`, id ? `ID: ${id}` : '')
    }
  },

  /**
   * Log file operations
   */
  fileOperation: (operation: string, filename?: string) => {
    if (isDevelopment) {
      console.log(`📁 ${operation}`, filename || '')
    }
  }
}