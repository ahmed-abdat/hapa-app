/**
 * Server-side Media File Validation
 * Enhanced validation for video, audio, images, and documents
 * Matches client-side validation rules for consistency
 */

export interface ServerValidationResult {
  isValid: boolean
  error?: string
  fileType: 'video' | 'audio' | 'image' | 'document' | 'unknown'
  detectedMimeType?: string
  fileSize: number
  metadata?: {
    duration?: number
    dimensions?: { width: number; height: number }
  }
}

export interface FileValidationConfig {
  maxSizeMB: number
  allowedMimeTypes: string[]
  allowedExtensions: string[]
  maxDurationSeconds?: number
}

// Enhanced validation configurations matching client-side
export const SERVER_VALIDATION_CONFIGS: Record<string, FileValidationConfig> = {
  video: {
    maxSizeMB: 100,
    allowedMimeTypes: [
      'video/mp4',
      'video/webm', 
      'video/quicktime',
      'video/x-msvideo',
      'video/ogg'
    ],
    allowedExtensions: ['mp4', 'webm', 'mov', 'avi', 'ogv'],
    maxDurationSeconds: 600 // 10 minutes
  },
  audio: {
    maxSizeMB: 25,
    allowedMimeTypes: [
      'audio/mpeg',
      'audio/wav',
      'audio/mp4',
      'audio/ogg',
      'audio/webm',
      'audio/flac'
    ],
    allowedExtensions: ['mp3', 'wav', 'm4a', 'ogg', 'oga', 'flac'],
    maxDurationSeconds: 900 // 15 minutes
  },
  image: {
    maxSizeMB: 10,
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp']
  },
  document: {
    maxSizeMB: 15,
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ],
    allowedExtensions: ['pdf', 'doc', 'docx', 'txt']
  }
}

// File signature validation (magic numbers) - Server-side compatible
const FILE_SIGNATURES: Record<string, { signature: number[], mimeType: string }> = {
  // Video signatures
  mp4: { signature: [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], mimeType: 'video/mp4' },
  mp4_alt: { signature: [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70], mimeType: 'video/mp4' },
  webm: { signature: [0x1A, 0x45, 0xDF, 0xA3], mimeType: 'video/webm' },
  avi: { signature: [0x52, 0x49, 0x46, 0x46], mimeType: 'video/x-msvideo' },
  mov: { signature: [0x00, 0x00, 0x00, 0x14, 0x66, 0x74, 0x79, 0x70, 0x71, 0x74], mimeType: 'video/quicktime' },
  
  // Audio signatures  
  mp3: { signature: [0xFF, 0xFB], mimeType: 'audio/mpeg' },
  mp3_id3: { signature: [0x49, 0x44, 0x33], mimeType: 'audio/mpeg' },
  wav: { signature: [0x52, 0x49, 0x46, 0x46], mimeType: 'audio/wav' },
  ogg: { signature: [0x4F, 0x67, 0x67, 0x53], mimeType: 'audio/ogg' },
  flac: { signature: [0x66, 0x4C, 0x61, 0x43], mimeType: 'audio/flac' },
  m4a: { signature: [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x4D, 0x34, 0x41], mimeType: 'audio/mp4' },
  
  // Image signatures
  jpg: { signature: [0xFF, 0xD8, 0xFF], mimeType: 'image/jpeg' },
  png: { signature: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], mimeType: 'image/png' },
  gif: { signature: [0x47, 0x49, 0x46, 0x38], mimeType: 'image/gif' },
  webp: { signature: [0x52, 0x49, 0x46, 0x46], mimeType: 'image/webp' },
  
  // Document signatures
  pdf: { signature: [0x25, 0x50, 0x44, 0x46], mimeType: 'application/pdf' },
  doc: { signature: [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1], mimeType: 'application/msword' },
  docx: { signature: [0x50, 0x4B, 0x03, 0x04], mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
}

/**
 * Detect file type from MIME type and filename
 */
export function detectServerFileType(file: File): 'video' | 'audio' | 'image' | 'document' | 'unknown' {
  const mimeType = file.type.toLowerCase()
  
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio' 
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document'
  
  // Fallback to extension-based detection
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!extension) return 'unknown'
  
  if (['mp4', 'webm', 'mov', 'avi', 'ogv'].includes(extension)) return 'video'
  if (['mp3', 'wav', 'm4a', 'ogg', 'oga', 'flac'].includes(extension)) return 'audio'
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image'
  if (['pdf', 'doc', 'docx', 'txt'].includes(extension)) return 'document'
  
  return 'unknown'
}

/**
 * Validate file signature (magic number) - Server-side implementation
 */
export async function validateServerFileSignature(file: File): Promise<{ isValid: boolean, detectedMimeType?: string }> {
  try {
    // Read first 32 bytes of file
    const buffer = await file.slice(0, 32).arrayBuffer()
    const bytes = new Uint8Array(buffer)
    
    // Check against known signatures
    for (const [type, { signature, mimeType }] of Object.entries(FILE_SIGNATURES)) {
      if (matchesSignature(bytes, signature)) {
        return { isValid: true, detectedMimeType: mimeType }
      }
    }
    
    // Special case for WebP (needs additional validation after RIFF)
    if (matchesSignature(bytes, FILE_SIGNATURES.webp.signature)) {
      const webpMarker = new TextDecoder().decode(bytes.slice(8, 12))
      if (webpMarker === 'WEBP') {
        return { isValid: true, detectedMimeType: 'image/webp' }
      }
    }
    
    return { isValid: false }
  } catch (error) {
    console.error('Server file signature validation error:', error)
    return { isValid: false }
  }
}

function matchesSignature(bytes: Uint8Array, signature: number[]): boolean {
  if (bytes.length < signature.length) return false
  
  for (let i = 0; i < signature.length; i++) {
    if (bytes[i] !== signature[i]) return false
  }
  return true
}

/**
 * Main server-side validation function
 */
export async function validateServerMediaFile(file: File): Promise<ServerValidationResult> {
  const fileType = detectServerFileType(file)
  
  if (fileType === 'unknown') {
    return {
      isValid: false,
      error: 'Unsupported file type',
      fileType: 'unknown',
      fileSize: file.size
    }
  }
  
  const config = SERVER_VALIDATION_CONFIGS[fileType]
  
  // Size validation
  const fileSizeMB = file.size / (1024 * 1024)
  if (fileSizeMB > config.maxSizeMB) {
    return {
      isValid: false,
      error: `File size (${fileSizeMB.toFixed(1)}MB) exceeds limit of ${config.maxSizeMB}MB`,
      fileType,
      fileSize: file.size
    }
  }
  
  // MIME type validation
  if (!config.allowedMimeTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `MIME type ${file.type} is not allowed`,
      fileType,
      fileSize: file.size
    }
  }
  
  // Extension validation  
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!extension || !config.allowedExtensions.includes(extension)) {
    return {
      isValid: false,
      error: `File extension .${extension} is not allowed`,
      fileType,
      fileSize: file.size
    }
  }
  
  // File signature validation
  const signatureResult = await validateServerFileSignature(file)
  if (!signatureResult.isValid) {
    return {
      isValid: false,
      error: 'File signature validation failed - file may be corrupted or not what it claims to be',
      fileType,
      fileSize: file.size
    }
  }
  
  // Additional validation for media files would require FFmpeg or similar
  // For now, we'll validate on the client side and trust the results
  
  return {
    isValid: true,
    fileType,
    detectedMimeType: signatureResult.detectedMimeType,
    fileSize: file.size
  }
}

/**
 * Validate multiple files with detailed results
 */
export async function validateMultipleServerFiles(files: File[]): Promise<ServerValidationResult[]> {
  const results: ServerValidationResult[] = []
  
  for (const file of files) {
    const result = await validateServerMediaFile(file)
    results.push(result)
  }
  
  return results
}

/**
 * Get file type specific size limits
 */
export function getFileSizeLimit(fileType: string): number {
  const config = SERVER_VALIDATION_CONFIGS[fileType]
  return config ? config.maxSizeMB * 1024 * 1024 : 10 * 1024 * 1024 // Default 10MB
}

/**
 * Check if file type supports duration limits
 */
export function hasDurationLimit(fileType: string): boolean {
  const config = SERVER_VALIDATION_CONFIGS[fileType]
  return !!(config && config.maxDurationSeconds)
}

/**
 * Get duration limit for file type
 */
export function getDurationLimit(fileType: string): number | undefined {
  const config = SERVER_VALIDATION_CONFIGS[fileType]
  return config?.maxDurationSeconds
}

/**
 * Create validation summary for admin/logging
 */
export function createValidationSummary(results: ServerValidationResult[]): {
  totalFiles: number
  validFiles: number
  invalidFiles: number
  errors: string[]
  fileTypes: Record<string, number>
  totalSize: number
} {
  const summary = {
    totalFiles: results.length,
    validFiles: 0,
    invalidFiles: 0,
    errors: [] as string[],
    fileTypes: {} as Record<string, number>,
    totalSize: 0
  }
  
  results.forEach(result => {
    if (result.isValid) {
      summary.validFiles++
    } else {
      summary.invalidFiles++
      if (result.error) {
        summary.errors.push(result.error)
      }
    }
    
    summary.fileTypes[result.fileType] = (summary.fileTypes[result.fileType] || 0) + 1
    summary.totalSize += result.fileSize
  })
  
  return summary
}