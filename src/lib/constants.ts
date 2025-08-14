/**
 * Centralized constants for HAPA website
 * This file contains all configuration values that may need to be changed across the application
 */

// ===========================
// FILE UPLOAD SIZE LIMITS
// ===========================

/**
 * Base unit for calculations - 1 MB in bytes
 */
export const MB = 1024 * 1024

/**
 * File size limits by category (in bytes)
 * These limits are enforced in the upload API and validation functions
 */
export const FILE_SIZE_LIMITS = {
  // Media file type limits
  IMAGE: 5 * MB,        // 5MB for images (high quality photos)
  VIDEO: 25 * MB,       // 25MB for videos (reasonable for evidence clips)
  AUDIO: 10 * MB,       // 10MB for audio (sufficient for recordings)
  DOCUMENT: 15 * MB,    // 15MB for documents (PDFs, reports)
  
  // General fallback limit
  DEFAULT: 10 * MB,     // 10MB fallback for unspecified types
  
  // Form data limits
  FORM_DATA_TOTAL: 95 * MB,  // Conservative limit (5MB less than 100MB server limit)
  SINGLE_FILE_IN_FORM: 50 * MB,  // Maximum for individual files in forms
} as const

/**
 * MIME type categories for file type detection
 */
export const MIME_TYPE_CATEGORIES = {
  IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  VIDEO: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'],
  AUDIO: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm'],
  DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
} as const

/**
 * All allowed MIME types for uploads
 */
export const ALLOWED_MIME_TYPES = [
  ...MIME_TYPE_CATEGORIES.IMAGE,
  ...MIME_TYPE_CATEGORIES.VIDEO,
  ...MIME_TYPE_CATEGORIES.AUDIO,
  ...MIME_TYPE_CATEGORIES.DOCUMENT,
] as const

// ===========================
// FILE UPLOAD CONFIGURATION
// ===========================

/**
 * Upload retry configuration
 */
export const UPLOAD_RETRY_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_DELAY: 1000,  // 1 second
  MAX_DELAY: 10000,     // 10 seconds
  BACKOFF_MULTIPLIER: 2,
} as const

/**
 * Compression settings
 */
export const COMPRESSION_CONFIG = {
  IMAGE_QUALITY: 0.8,
  MAX_DIMENSION: 2048,
  THUMBNAIL_SIZE: 300,
} as const

/**
 * File validation limits
 */
export const FILE_VALIDATION_LIMITS = {
  MAX_FILES_PER_UPLOAD: 10,
  MAX_FILENAME_LENGTH: 255,
  MIN_FILE_SIZE: 1024,  // 1KB minimum
} as const

// ===========================
// FORM CONFIGURATION
// ===========================

/**
 * Form field limits
 */
export const FORM_LIMITS = {
  MAX_TEXT_LENGTH: 5000,
  MAX_DESCRIPTION_LENGTH: 10000,
  MAX_EMAIL_LENGTH: 254,
  MAX_PHONE_LENGTH: 20,
  MAX_NAME_LENGTH: 100,
} as const

// ===========================
// API CONFIGURATION
// ===========================

/**
 * API timeout and rate limiting
 */
export const API_CONFIG = {
  UPLOAD_TIMEOUT: 60000,    // 60 seconds
  DEFAULT_TIMEOUT: 30000,   // 30 seconds
  RATE_LIMIT_WINDOW: 15 * 60 * 1000,  // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
} as const

// ===========================
// UTILITY FUNCTIONS
// ===========================

/**
 * Get file size limit based on MIME type
 */
export function getFileSizeLimit(mimeType: string): number {
  if (MIME_TYPE_CATEGORIES.IMAGE.includes(mimeType as any)) {
    return FILE_SIZE_LIMITS.IMAGE
  }
  if (MIME_TYPE_CATEGORIES.VIDEO.includes(mimeType as any)) {
    return FILE_SIZE_LIMITS.VIDEO
  }
  if (MIME_TYPE_CATEGORIES.AUDIO.includes(mimeType as any)) {
    return FILE_SIZE_LIMITS.AUDIO
  }
  if (MIME_TYPE_CATEGORIES.DOCUMENT.includes(mimeType as any)) {
    return FILE_SIZE_LIMITS.DOCUMENT
  }
  return FILE_SIZE_LIMITS.DEFAULT
}

/**
 * Check if MIME type is allowed
 */
export function isMimeTypeAllowed(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType as any)
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/**
 * Convert MB to bytes
 */
export function mbToBytes(mb: number): number {
  return mb * MB
}

/**
 * Convert bytes to MB
 */
export function bytesToMb(bytes: number): number {
  return bytes / MB
}