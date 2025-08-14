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
 * Sanitize media ID with strict validation (no character removal)
 * Only trims whitespace and validates format - does not normalize or collapse characters
 * @param id - Media ID to validate
 * @returns string - Trimmed and validated media ID
 * @throws TypeError if input is not a string
 * @throws Error if invalid format or empty
 */
export function sanitizeMediaId(id: unknown): string {
  // Explicit type check
  if (typeof id !== 'string') {
    throw new TypeError('Media ID must be a string')
  }
  
  // Only trim whitespace, no character removal
  const trimmed = id.trim()
  
  // Verify non-empty and valid format
  if (trimmed.length === 0) {
    throw new Error('Media ID cannot be empty')
  }
  
  if (!isValidObjectId(trimmed)) {
    throw new Error(`Invalid ObjectId format: ${trimmed}`)
  }
  
  return trimmed
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
 * Sanitize URL for safe usage - preserves relative URLs, rejects credentials
 * @param url - URL to validate
 * @returns string - Validated URL (relative URLs unchanged, absolute URLs validated)
 * @throws TypeError if input is not a string
 * @throws URIError if invalid format, contains credentials, or invalid protocol
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') {
    throw new TypeError('URL must be a string')
  }
  
  const trimmed = url.trim()
  
  // Check if it's a relative URL (no scheme)
  if (!trimmed.includes('://')) {
    // Return relative URLs unchanged
    return trimmed
  }
  
  // Handle absolute URLs
  let urlObj: URL
  try {
    urlObj = new URL(trimmed) // No base URL
  } catch (error) {
    throw new URIError(`Invalid URL format: ${trimmed}`)
  }
  
  // Reject URLs with embedded credentials
  if (urlObj.username || urlObj.password) {
    throw new URIError('URL contains credentials')
  }
  
  // Only allow safe protocols
  if (!['http:', 'https:'].includes(urlObj.protocol)) {
    throw new URIError('Invalid URL protocol')
  }
  
  return urlObj.toString()
}