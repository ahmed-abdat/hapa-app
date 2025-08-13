/**
 * File upload utilities for handling media uploads with retry mechanism
 */

import { logger } from '@/utilities/logger'

// Retry-related types
export interface RetryState {
  attemptCount: number
  maxRetries: number
  lastError?: string
  isRetrying: boolean
  nextRetryDelay?: number
  failureType?: 'network' | 'validation' | 'server' | 'security' | 'unknown'
}

export interface FileUploadResult {
  success: boolean
  url?: string
  error?: string
  retryState?: RetryState
  canRetry?: boolean
}

export interface ThumbnailResult {
  success: boolean
  thumbnailUrl?: string
  error?: string
}

export interface CompressionResult {
  success: boolean
  compressedFile?: File
  originalSize: number
  compressedSize: number
  compressionRatio: number
  savings: number
  error?: string
}

export interface CompressionOptions {
  maxSizeMB: number
  quality: number
  maxWidth?: number
  maxHeight?: number
  enableProgressiveCompression: boolean
  minQuality: number
}

// Note: File validation is now handled by production-file-validation.ts
// This module focuses on upload utilities, retry mechanisms, and file processing

/**
 * Sanitize filename for security
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .replace(/^\.+|\.+$/g, '') // Remove leading/trailing dots
    .substring(0, 255)
}

/**
 * Upload a single file to the server with security validation and retry mechanism
 */
export async function uploadFile(
  file: File, 
  retryState?: RetryState,
  options?: { fileType?: 'screenshot' | 'attachment', fileIndex?: string }
): Promise<FileUploadResult> {
  const currentRetryState = retryState || createRetryState()
  
  try {
    // Check network connectivity in browser environment
    if (isBrowser() && !isOnline()) {
      const error = new Error('Network is offline')
      const updatedRetryState = updateRetryState(currentRetryState, error as Error)
      return {
        success: false,
        error: 'No network connection',
        retryState: updatedRetryState,
        canRetry: updatedRetryState.attemptCount < updatedRetryState.maxRetries
      }
    }
    
    // Validate file using production-grade validation (non-retryable errors)
    const { validateFileProduction } = await import('@/lib/production-file-validation')
    const validationResult = await validateFileProduction(file)
    if (!validationResult.isValid) {
      const error = new Error(validationResult.error || 'Invalid file format detected')
      const updatedRetryState = updateRetryState(currentRetryState, error as Error)
      return {
        success: false,
        error: validationResult.error || 'Invalid file format detected',
        retryState: updatedRetryState,
        canRetry: false // Security errors are not retryable
      }
    }

    // Create sanitized file with safe filename
    const sanitizedFilename = sanitizeFilename(file.name)
    const sanitizedFile = new File([file], sanitizedFilename, { type: file.type })

    const formData = new FormData()
    formData.append('file', sanitizedFile)
    
    // Add optional metadata for form uploads
    if (options?.fileType) {
      formData.append('fileType', options.fileType)
    }
    if (options?.fileIndex) {
      formData.append('fileIndex', options.fileIndex)
    }

    const response = await fetch('/api/media/upload', {
      method: 'POST',
      body: formData,
      // Add timeout to detect network issues
      signal: AbortSignal.timeout(30000) // 30 second timeout
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Upload failed')
      const error = new Error(errorText) as Error & { status?: number }
      error.status = response.status
      throw error
    }

    const result = await response.json()
    return {
      success: true,
      url: result.url,
      retryState: currentRetryState
    }
  } catch (error: unknown) {
    const updatedRetryState = updateRetryState(currentRetryState, error as Error)
    const canRetry = updatedRetryState.attemptCount < updatedRetryState.maxRetries && 
                    isRetryableError(updatedRetryState.failureType || 'unknown')
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
      retryState: updatedRetryState,
      canRetry
    }
  }
}

/**
 * Upload file with automatic retry mechanism
 */
export async function uploadFileWithRetry(
  file: File, 
  maxRetries: number = 3,
  onRetryAttempt?: (attemptCount: number, nextDelay: number) => void,
  options?: { fileType?: 'screenshot' | 'attachment', fileIndex?: string }
): Promise<FileUploadResult> {
  let retryState = createRetryState(maxRetries)
  let lastResult: FileUploadResult
  
  while (retryState.attemptCount <= maxRetries) {
    lastResult = await uploadFile(file, retryState, options)
    
    if (lastResult.success) {
      return lastResult
    }
    
    retryState = lastResult.retryState!
    
    // If we can't retry or have exceeded max attempts, return the failure
    if (!lastResult.canRetry || retryState.attemptCount >= maxRetries) {
      return lastResult
    }
    
    // Wait before retrying
    const delay = retryState.nextRetryDelay || calculateRetryDelay(retryState.attemptCount)
    
    // Notify about retry attempt
    if (onRetryAttempt) {
      onRetryAttempt(retryState.attemptCount, delay)
    }
    
    await sleep(delay)
    
    // Update retry state for next attempt
    retryState.isRetrying = true
  }
  
  return lastResult!
}

/**
 * Manual retry function for user-initiated retries
 */
export async function retryFileUpload(
  file: File,
  currentRetryState: RetryState,
  options?: { fileType?: 'screenshot' | 'attachment', fileIndex?: string }
): Promise<FileUploadResult> {
  // Allow unlimited manual retries by not incrementing attempt count
  const manualRetryState: RetryState = {
    ...currentRetryState,
    isRetrying: true,
    lastError: undefined
  }
  
  return uploadFile(file, manualRetryState, options)
}

/**
 * Upload multiple files with retry mechanism and return URLs
 */
export async function uploadFiles(
  files: File[], 
  maxRetries: number = 3,
  onProgress?: (fileIndex: number, result: FileUploadResult) => void
): Promise<string[]> {
  const results: FileUploadResult[] = []
  
  // Upload files sequentially to avoid overwhelming the server
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const result = await uploadFileWithRetry(file, maxRetries)
    results.push(result)
    
    // Notify progress
    if (onProgress) {
      onProgress(i, result)
    }
  }
  
  // Return only successful uploads
  return results
    .filter(result => result.success)
    .map(result => result.url!)
}

/**
 * Convert form data object to FormData for multipart requests
 */
export function convertToFormData(data: Record<string, any>): FormData {
  const formData = new FormData()
  const conversionSessionId = `CONVERT_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
  
  // Converting form data to FormData
  
  // Check for files to convert
  const screenshotCount = Array.isArray(data.screenshotFiles) ? data.screenshotFiles.length : 0
  const attachmentCount = Array.isArray(data.attachmentFiles) ? data.attachmentFiles.length : 0

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) {
      // Skip null/undefined fields
      continue
    }

    if (Array.isArray(value)) {
      // Handle arrays (like reasons, attachmentTypes, files)
      
      if (value.length === 0) {
        // Skip empty arrays
        continue
      }
      
      value.forEach((item, index) => {
        if (item instanceof File) {
          // Appending file to FormData
          formData.append(key, item)
        } else {
          // Appending string to array
          formData.append(key, item.toString())
        }
      })
    } else if (value instanceof File) {
      // Appending single file
      formData.append(key, value)
    } else {
      // Appending string value
      formData.append(key, value.toString())
    }
  }

  // FormData conversion complete

  return formData
}

/**
 * Check if file is an image that can have thumbnails generated
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/') && 
         ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(file.type.toLowerCase())
}

/**
 * Generate thumbnail for image files with lazy loading support
 */
export async function generateThumbnail(
  file: File, 
  maxWidth: number = 100, 
  maxHeight: number = 100,
  quality: number = 0.8
): Promise<ThumbnailResult> {
  return new Promise((resolve) => {
    try {
      if (!isImageFile(file)) {
        resolve({
          success: false,
          error: 'File is not a supported image type'
        })
        return
      }

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        try {
          // Calculate dimensions maintaining aspect ratio
          let { width, height } = img
          
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width
              width = maxWidth
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height
              height = maxHeight
            }
          }

          // Set canvas dimensions
          canvas.width = width
          canvas.height = height

          // Draw the image
          ctx?.drawImage(img, 0, 0, width, height)

          // Convert to blob and create URL
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const thumbnailUrl = URL.createObjectURL(blob)
                resolve({
                  success: true,
                  thumbnailUrl
                })
              } else {
                resolve({
                  success: false,
                  error: 'Failed to generate thumbnail blob'
                })
              }
            },
            'image/jpeg',
            quality
          )
        } catch (error) {
          resolve({
            success: false,
            error: `Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`
          })
        }
      }

      img.onerror = () => {
        resolve({
          success: false,
          error: 'Failed to load image for thumbnail generation'
        })
      }

      // Create object URL for the image
      const imageUrl = URL.createObjectURL(file)
      img.src = imageUrl

      // Clean up the temporary URL after a delay
      setTimeout(() => {
        URL.revokeObjectURL(imageUrl)
      }, 1000)

    } catch (error) {
      resolve({
        success: false,
        error: `Thumbnail generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }
  })
}

/**
 * Generate thumbnails for multiple image files
 */
export async function generateThumbnails(
  files: File[],
  maxWidth: number = 100,
  maxHeight: number = 100,
  quality: number = 0.8
): Promise<(ThumbnailResult & { file: File })[]> {
  const thumbnailPromises = files.map(async (file) => {
    const result = await generateThumbnail(file, maxWidth, maxHeight, quality)
    return { ...result, file }
  })

  return Promise.all(thumbnailPromises)
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Calculate compression savings percentage
 */
export function calculateSavings(originalSize: number, compressedSize: number): number {
  if (originalSize === 0) return 0
  return Math.round(((originalSize - compressedSize) / originalSize) * 100)
}

/**
 * Retry utilities and network failure detection
 */

// Error categorization function
export function categorizeError(error: unknown): 'network' | 'validation' | 'server' | 'security' | 'unknown' {
  if (!error) return 'unknown'
  
  const errorMessage = (error instanceof Error ? error.message?.toLowerCase() : 
                       typeof error === 'string' ? error.toLowerCase() : 
                       String(error).toLowerCase()) || ''
  const status = (error as any)?.status || (error as any)?.response?.status
  
  // Network-related errors (retryable)
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('offline') ||
    (error instanceof Error && error.name === 'NetworkError') ||
    (error as any)?.code === 'NETWORK_ERROR' ||
    status === 0 || // Network failure
    status === 408 || // Request Timeout
    status === 503 || // Service Unavailable
    status === 504 // Gateway Timeout
  ) {
    return 'network'
  }
  
  // Security-related errors (non-retryable)
  if (
    errorMessage.includes('invalid file format') ||
    errorMessage.includes('file signature') ||
    errorMessage.includes('security') ||
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('forbidden') ||
    status === 401 ||
    status === 403
  ) {
    return 'security'
  }
  
  // Validation errors (non-retryable)
  if (
    errorMessage.includes('file too large') ||
    errorMessage.includes('unsupported') ||
    errorMessage.includes('invalid') ||
    errorMessage.includes('validation') ||
    status === 400 ||
    status === 422
  ) {
    return 'validation'
  }
  
  // Server errors (potentially retryable)
  if (status >= 500 && status < 600) {
    return 'server'
  }
  
  // Default to unknown
  return 'unknown'
}

// Check if error type is retryable
export function isRetryableError(failureType: string): boolean {
  return failureType === 'network' || failureType === 'server' || failureType === 'unknown'
}

// Calculate next retry delay with exponential backoff
export function calculateRetryDelay(attemptCount: number, baseDelay: number = 1000): number {
  // Exponential backoff: 1s, 2s, 4s with jitter to prevent thundering herd
  const delay = baseDelay * Math.pow(2, attemptCount)
  const jitter = Math.random() * 0.3 * delay // Add up to 30% jitter
  return Math.min(delay + jitter, 10000) // Cap at 10 seconds
}

// Create initial retry state
export function createRetryState(maxRetries: number = 3): RetryState {
  return {
    attemptCount: 0,
    maxRetries,
    isRetrying: false,
    failureType: undefined
  }
}

// Update retry state after a failure
export function updateRetryState(
  currentState: RetryState, 
  error: unknown
): RetryState {
  const failureType = categorizeError(error)
  const attemptCount = currentState.attemptCount + 1
  const canRetry = attemptCount < currentState.maxRetries && isRetryableError(failureType)
  
  return {
    ...currentState,
    attemptCount,
    lastError: error instanceof Error ? error.message : String(error),
    failureType,
    nextRetryDelay: canRetry ? calculateRetryDelay(attemptCount) : undefined,
    isRetrying: false
  }
}

// Sleep utility for delays
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Network connectivity check
export function isOnline(): boolean {
  return navigator.onLine
}

// Detect if we're in a browser environment
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof navigator !== 'undefined'
}

/**
 * Compress image file using HTML5 Canvas with progressive quality reduction
 */
export async function compressImage(
  file: File,
  options: CompressionOptions
): Promise<CompressionResult> {
  return new Promise((resolve) => {
    try {
      if (!isImageFile(file)) {
        resolve({
          success: false,
          originalSize: file.size,
          compressedSize: file.size,
          compressionRatio: 1.0,
          savings: 0,
          error: 'File is not a supported image type'
        })
        return
      }

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      if (!ctx) {
        resolve({
          success: false,
          originalSize: file.size,
          compressedSize: file.size,  
          compressionRatio: 1.0,
          savings: 0,
          error: 'Canvas context not available'
        })
        return
      }

      img.onload = async () => {
        try {
          let { width, height } = img
          const originalSize = file.size

          // Calculate new dimensions if max dimensions are specified
          if (options.maxWidth || options.maxHeight) {
            const maxWidth = options.maxWidth || width
            const maxHeight = options.maxHeight || height
            
            const aspectRatio = width / height
            
            if (width > maxWidth) {
              width = maxWidth
              height = width / aspectRatio
            }
            
            if (height > maxHeight) {
              height = maxHeight
              width = height * aspectRatio
            }
          }

          // Set canvas dimensions
          canvas.width = Math.floor(width)
          canvas.height = Math.floor(height)

          // Draw the image with high quality
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(img, 0, 0, width, height)

          const maxSizeBytes = options.maxSizeMB * 1024 * 1024
          let currentQuality = options.quality
          let attempts = 0
          const maxAttempts = options.enableProgressiveCompression ? 10 : 1

          const tryCompression = (): Promise<CompressionResult> => {
            return new Promise((resolveCompression) => {
              canvas.toBlob(
                (blob) => {
                  if (!blob) {
                    resolveCompression({
                      success: false,
                      originalSize,
                      compressedSize: originalSize,
                      compressionRatio: 1.0,
                      savings: 0,
                      error: 'Failed to generate compressed blob'
                    })
                    return
                  }

                  const compressedSize = blob.size
                  attempts++

                  // Check if we meet the size requirement or have exhausted attempts
                  if (compressedSize <= maxSizeBytes || 
                      attempts >= maxAttempts || 
                      currentQuality <= options.minQuality) {
                    
                    // Create new file with same name but mark as compressed
                    const originalName = file.name
                    const extension = originalName.substring(originalName.lastIndexOf('.'))
                    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'))
                    const compressedName = `${nameWithoutExt}_compressed${extension}`
                    
                    const compressedFile = new File([blob], compressedName, {
                      type: file.type,
                      lastModified: Date.now()
                    })

                    const compressionRatio = compressedSize / originalSize
                    const savings = calculateSavings(originalSize, compressedSize)

                    resolveCompression({
                      success: true,
                      compressedFile,
                      originalSize,
                      compressedSize,
                      compressionRatio,
                      savings,
                    })
                  } else {
                    // Progressive compression: reduce quality and try again
                    currentQuality = Math.max(options.minQuality, currentQuality - 0.1)
                    setTimeout(() => {
                      tryCompression().then(resolveCompression)
                    }, 10) // Small delay to prevent blocking UI
                  }
                },
                file.type === 'image/png' ? 'image/png' : 'image/jpeg',
                currentQuality
              )
            })
          }

          const result = await tryCompression()
          resolve(result)

        } catch (error) {
          resolve({
            success: false,
            originalSize: file.size,
            compressedSize: file.size,
            compressionRatio: 1.0,
            savings: 0,
            error: `Failed to compress image: ${error instanceof Error ? error.message : 'Unknown error'}`
          })
        }
      }

      img.onerror = () => {
        resolve({
          success: false,
          originalSize: file.size,
          compressedSize: file.size,
          compressionRatio: 1.0,
          savings: 0,
          error: 'Failed to load image for compression'
        })
      }

      // Create object URL for the image
      const imageUrl = URL.createObjectURL(file)
      img.src = imageUrl

      // Clean up the temporary URL after loading
      img.addEventListener('load', () => {
        URL.revokeObjectURL(imageUrl)
      }, { once: true })

    } catch (error) {
      resolve({
        success: false,
        originalSize: file.size,
        compressedSize: file.size,
        compressionRatio: 1.0,
        savings: 0,
        error: `Compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }
  })
}

/**
 * Smart image compression with automatic quality adjustment
 */
export async function smartCompressImage(
  file: File,
  maxSizeMB: number = 2
): Promise<CompressionResult> {
  // Don't compress if file is already small enough
  if (file.size <= maxSizeMB * 1024 * 1024) {
    return {
      success: true,
      compressedFile: file,
      originalSize: file.size,
      compressedSize: file.size,
      compressionRatio: 1.0,
      savings: 0
    }
  }

  const options: CompressionOptions = {
    maxSizeMB,
    quality: 0.75, // Start with 75% quality
    enableProgressiveCompression: true,
    minQuality: 0.3, // Don't go below 30% quality
    maxWidth: 1920, // Reasonable max width for web
    maxHeight: 1080 // Reasonable max height for web
  }

  return compressImage(file, options)
}

/**
 * Calculate total size of form data including all files and text data
 */
export function calculateFormDataSize(data: Record<string, any>): {
  totalSize: number
  fileSize: number
  textSize: number
  fileCount: number
  details: {
    screenshots: { count: number; size: number }
    attachments: { count: number; size: number }
    textFields: number
  }
} {
  let fileSize = 0
  let textSize = 0
  let fileCount = 0
  let screenshotCount = 0
  let screenshotSize = 0
  let attachmentCount = 0
  let attachmentSize = 0

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) {
      continue
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        continue
      }
      
      value.forEach((item) => {
        if (item instanceof File) {
          fileSize += item.size
          fileCount++
          
          if (key === 'screenshotFiles') {
            screenshotCount++
            screenshotSize += item.size
          } else if (key === 'attachmentFiles') {
            attachmentCount++
            attachmentSize += item.size
          }
        } else {
          // Estimate text size (UTF-8 encoding)
          const itemText = item.toString()
          textSize += new Blob([itemText]).size
        }
      })
    } else if (value instanceof File) {
      fileSize += value.size
      fileCount++
    } else {
      // Estimate text size (UTF-8 encoding)
      const valueText = value.toString()
      textSize += new Blob([valueText]).size
    }
  }

  return {
    totalSize: fileSize + textSize,
    fileSize,
    textSize,
    fileCount,
    details: {
      screenshots: { count: screenshotCount, size: screenshotSize },
      attachments: { count: attachmentCount, size: attachmentSize },
      textFields: textSize
    }
  }
}

/**
 * Check if form data size exceeds server action body limit
 */
export function validateFormDataSize(
  data: Record<string, any>, 
  maxSizeMB: number = 95 // Conservative limit (5MB less than 100MB server limit)
): {
  isValid: boolean
  sizeInfo: ReturnType<typeof calculateFormDataSize>
  error?: string
  suggestions?: string[]
} {
  const sizeInfo = calculateFormDataSize(data)
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  
  if (sizeInfo.totalSize <= maxSizeBytes) {
    return {
      isValid: true,
      sizeInfo
    }
  }

  const suggestions: string[] = []
  const exceededBy = sizeInfo.totalSize - maxSizeBytes
  const exceededByMB = exceededBy / (1024 * 1024)

  // Generate helpful suggestions
  if (sizeInfo.details.screenshots.size > 50 * 1024 * 1024) { // > 50MB screenshots
    suggestions.push(`Réduisez la taille ou le nombre de captures d'écran (actuellement: ${formatFileSize(sizeInfo.details.screenshots.size)})`)
  }
  
  if (sizeInfo.details.attachments.size > 50 * 1024 * 1024) { // > 50MB attachments
    suggestions.push(`Réduisez la taille ou le nombre de pièces jointes (actuellement: ${formatFileSize(sizeInfo.details.attachments.size)})`)
  }

  if (sizeInfo.fileCount > 10) {
    suggestions.push(`Réduisez le nombre de fichiers (actuellement: ${sizeInfo.fileCount} fichiers)`)
  }

  return {
    isValid: false,
    sizeInfo,
    error: `La taille totale des données (${formatFileSize(sizeInfo.totalSize)}) dépasse la limite de ${maxSizeMB}MB de ${exceededByMB.toFixed(1)}MB.`,
    suggestions: suggestions.length > 0 ? suggestions : [
      'Réduisez la taille des fichiers ou leur nombre',
      'Compressez les images et vidéos',
      'Utilisez des formats plus efficaces si possible'
    ]
  }
}