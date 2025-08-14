/**
 * Security utilities for input validation
 * 
 * CRITICAL: These functions prevent XSS attacks and validate user input
 * Used by: EnhancedMediaGallery PDF preview, media handling, URL validation
 */

/**
 * Validate MongoDB ObjectId format
 * @param id - String to validate as ObjectId
 * @returns boolean - true if valid 24-character hex string
 */
export function isValidObjectId(id: string): boolean {
  return /^[a-fA-F0-9]{24}$/.test(id)
}

/**
 * Sanitize media ID to prevent XSS attacks
 * @param id - Media ID to sanitize
 * @returns string - Sanitized media ID
 * @throws Error if invalid format
 */
export function sanitizeMediaId(id: string): string {
  // Remove any non-alphanumeric characters
  const cleaned = id.replace(/[^a-fA-F0-9]/g, '')
  
  // Validate format
  if (!isValidObjectId(cleaned)) {
    throw new Error('Invalid media ID format')
  }
  
  return cleaned
}

/**
 * Validate URL format for safe usage
 * @param url - URL string to validate
 * @returns boolean - true if valid HTTP/HTTPS URL
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
    // Only allow http/https protocols
    return ['http:', 'https:'].includes(urlObj.protocol)
  } catch {
    return false
  }
}

/**
 * Sanitize URL for safe usage - prevents XSS via javascript: protocol
 * @param url - URL to sanitize
 * @returns string - Sanitized URL
 * @throws Error if invalid format or protocol
 */
export function sanitizeUrl(url: string): string {
  if (!isValidUrl(url)) {
    throw new Error('Invalid URL format')
  }
  
  // Create URL object to parse and rebuild safely
  const urlObj = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
  
  // Only allow safe protocols - prevents javascript:, data:, file: attacks
  if (!['http:', 'https:'].includes(urlObj.protocol)) {
    throw new Error('Invalid URL protocol')
  }
  
  return urlObj.toString()
}