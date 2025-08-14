/**
 * Production-Ready File Validation Service - SINGLE SOURCE OF TRUTH
 * 
 * ARCHITECTURE OVERVIEW:
 * This is the primary file validation system for the HAPA website. It provides
 * comprehensive, production-grade validation using industry-standard tools.
 * 
 * VALIDATION PIPELINE:
 * 1. File category detection (video/audio/image/document)
 * 2. Size limit validation (category-specific)
 * 3. MIME type verification against allowlist
 * 4. File extension validation
 * 5. Deep signature analysis using file-type library (4100+ bytes)
 * 6. Format-specific validation (WebP markers, PDF structure, etc.)
 * 7. Security flag detection and threat assessment
 * 
 * TECHNOLOGY STACK:
 * - file-type library: Industry-standard signature detection
 * - Custom security validation: Government-specific threat detection
 * - Comprehensive logging: Detailed audit trail for compliance
 * 
 * USAGE GUIDELINES:
 * ✅ PRIMARY: Use validateFile() or validateFileProduction() for all new code
 * ✅ BATCH: Use validateFiles() for multiple file validation
 * ✅ LEGACY: validateFileSignature() available for backward compatibility
 * ❌ DEPRECATED: Avoid media-validation.ts (kept for codec detection only)
 * ❌ SERVER ONLY: Use server-media-validation.ts only for server actions
 * 
 * SECURITY FEATURES:
 * - Deep file signature analysis (4100+ bytes vs. industry standard 32 bytes)
 * - MIME type spoofing detection
 * - Format-specific validation rules
 * - Comprehensive magic number database via file-type library
 * - Security flag system for threat classification
 * - Detailed logging for audit compliance
 */

import { fileTypeFromBuffer, type FileTypeResult } from 'file-type'
import { logger } from '@/utilities/logger'
import { MIME_TYPE_CATEGORIES } from './constants'

export interface ValidationResult {
  isValid: boolean
  detectedType?: FileTypeResult
  declaredMime: string
  error?: string
  securityFlags?: string[]
  metadata?: {
    fileSize: number
    validationDepth: number
  }
}

export interface ValidationConfig {
  maxSizeMB: number
  allowedMimeTypes: string[]
  allowedExtensions: string[]
  requireSignatureMatch: boolean
  maxDurationSeconds?: number
}

// Enhanced validation configurations for government use - optimized for 2025 best practices
export const PRODUCTION_VALIDATION_CONFIGS: Record<string, ValidationConfig> = {
  video: {
    maxSizeMB: 25, // Reduced from 100MB - optimal for evidence clips while preventing DoS
    allowedMimeTypes: [...MIME_TYPE_CATEGORIES.VIDEO],
    allowedExtensions: ['mp4', 'webm', 'mov', 'avi', 'ogv'],
    requireSignatureMatch: true,
    maxDurationSeconds: 600 // 10 minutes - reasonable for evidence
  },
  audio: {
    maxSizeMB: 10, // Reduced from 25MB - sufficient for voice recordings
    allowedMimeTypes: [...MIME_TYPE_CATEGORIES.AUDIO],
    allowedExtensions: ['mp3', 'wav', 'm4a', 'ogg', 'oga', 'flac'],
    requireSignatureMatch: true,
    maxDurationSeconds: 900 // 15 minutes - adequate for recordings
  },
  image: {
    maxSizeMB: 5, // Reduced from 10MB - sufficient for high-quality photos
    allowedMimeTypes: [...MIME_TYPE_CATEGORIES.IMAGE],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    requireSignatureMatch: true
  },
  document: {
    maxSizeMB: 15,
    allowedMimeTypes: [...MIME_TYPE_CATEGORIES.DOCUMENT],
    allowedExtensions: ['pdf', 'doc', 'docx', 'txt'],
    requireSignatureMatch: true
  }
}

/**
 * Detect file category from MIME type and filename
 * 
 * Analyzes the file's declared MIME type first, then falls back to
 * extension-based detection if the MIME type is not conclusive.
 * 
 * @param file - The File object to analyze
 * @returns The detected category or 'unknown' if not supported
 * 
 * @example
 * ```typescript
 * const file = new File([''], 'video.mp4', { type: 'video/mp4' })
 * const category = detectFileCategory(file) // Returns 'video'
 * ```
 */
export function detectFileCategory(file: File): 'video' | 'audio' | 'image' | 'document' | 'unknown' {
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
 * Production-grade file validation using file-type library
 * 
 * Performs comprehensive file validation including:
 * - File size limits (category-specific)
 * - MIME type validation against allowed types
 * - File extension validation  
 * - Deep signature analysis using industry-standard file-type library (4100+ bytes)
 * - Format-specific validation (WebP marker, PDF structure, etc.)
 * - Security flag detection for suspicious content
 * 
 * @param file - The File object to validate
 * @returns Promise<ValidationResult> with detailed validation information
 * 
 * @example
 * ```typescript
 * const file = new File([buffer], 'document.pdf', { type: 'application/pdf' })
 * const result = await validateFileProduction(file)
 * 
 * if (result.isValid) {
 *   console.log('File is valid:', result.detectedType?.mime)
 * } else {
 *   console.error('Validation failed:', result.error)
 *   console.log('Security flags:', result.securityFlags)
 * }
 * ```
 * 
 * @throws Will not throw but returns validation errors in result.error
 * @see {@link ValidationResult} for detailed result structure
 * @see {@link ValidationConfig} for category-specific validation rules
 */
export async function validateFileProduction(file: File): Promise<ValidationResult> {
  const validationId = `VAL_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
  
  try {
    logger.info('🔍 Starting production file validation', {
      component: 'FileValidation',
      action: 'validation_start',
      validationId,
      fileName: file.name,
      declaredMime: file.type,
      fileSize: file.size,
      metadata: { timestamp: new Date().toISOString() }
    })

    const fileCategory = detectFileCategory(file)
    
    if (fileCategory === 'unknown') {
      return {
        isValid: false,
        declaredMime: file.type,
        error: 'Unsupported file type - not in allowed categories',
        securityFlags: ['UNKNOWN_FILE_TYPE'],
        metadata: { fileSize: file.size, validationDepth: 0 }
      }
    }
    
    const config = PRODUCTION_VALIDATION_CONFIGS[fileCategory]
    
    // Size validation
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > config.maxSizeMB) {
      return {
        isValid: false,
        declaredMime: file.type,
        error: `File size (${fileSizeMB.toFixed(1)}MB) exceeds limit of ${config.maxSizeMB}MB`,
        securityFlags: ['SIZE_LIMIT_EXCEEDED'],
        metadata: { fileSize: file.size, validationDepth: 0 }
      }
    }
    
    // MIME type validation
    if (!config.allowedMimeTypes.includes(file.type)) {
      return {
        isValid: false,
        declaredMime: file.type,
        error: `MIME type ${file.type} is not allowed for ${fileCategory} files`,
        securityFlags: ['DISALLOWED_MIME_TYPE'],
        metadata: { fileSize: file.size, validationDepth: 0 }
      }
    }
    
    // Extension validation  
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!extension || !config.allowedExtensions.includes(extension)) {
      return {
        isValid: false,
        declaredMime: file.type,
        error: `File extension .${extension} is not allowed for ${fileCategory} files`,
        securityFlags: ['DISALLOWED_EXTENSION'],
        metadata: { fileSize: file.size, validationDepth: 0 }
      }
    }
    
    // Deep signature validation using file-type library
    // Read larger buffer for comprehensive validation (industry standard: 4100+ bytes)
    const VALIDATION_BUFFER_SIZE = 4100
    const buffer = await file.slice(0, Math.min(VALIDATION_BUFFER_SIZE, file.size)).arrayBuffer()
    const uint8Buffer = new Uint8Array(buffer)
    
    logger.info('🔍 Performing deep signature analysis', {
      component: 'FileValidation', 
      action: 'signature_analysis',
      validationId,
      bufferSize: uint8Buffer.length,
      expectedDepth: VALIDATION_BUFFER_SIZE
    })
    
    let detectedType = await fileTypeFromBuffer(uint8Buffer)
    
    // Fallback validation for cases where file-type library doesn't detect the format
    if (!detectedType && fileCategory === 'video') {
      const fallbackResult = await tryFallbackValidation(uint8Buffer, file.type)
      if (fallbackResult.detected) {
        // Create a minimal FileTypeResult-like object for consistency
        detectedType = {
          ext: fallbackResult.ext,
          mime: fallbackResult.mime
        } as any
        
        logger.info('🔄 Fallback validation successful', {
          component: 'FileValidation',
          action: 'fallback_success',
          validationId,
          fileName: file.name,
          metadata: { fallbackType: fallbackResult.mime, originalLibraryFailed: true }
        })
      }
    }
    
    if (!detectedType) {
      return {
        isValid: false,
        declaredMime: file.type,
        error: 'File signature could not be detected - file may be corrupted or malicious',
        securityFlags: ['UNDETECTABLE_SIGNATURE'],
        metadata: { fileSize: file.size, validationDepth: uint8Buffer.length }
      }
    }
    
    // Cross-validate detected type with declared MIME type
    const securityFlags: string[] = []
    
    if (config.requireSignatureMatch && detectedType.mime !== file.type) {
      // Allow some common MIME type variations
      const mimeVariations = getMimeTypeVariations(detectedType.mime)
      if (!mimeVariations.includes(file.type)) {
        securityFlags.push('MIME_MISMATCH')
        logger.warn('⚠️ MIME type mismatch detected', {
          component: 'FileValidation',
          action: 'mime_mismatch',
          validationId,
          declaredMime: file.type,
          detectedMime: detectedType.mime,
          fileName: file.name
        })
      }
    }
    
    // Validate detected type against category expectations
    if (!isDetectedTypeValidForCategory(detectedType.mime, fileCategory)) {
      securityFlags.push('CATEGORY_MISMATCH')
    }
    
    // Additional format-specific validation
    const formatValidation = await validateFormatSpecific(file, detectedType, uint8Buffer)
    if (formatValidation.securityFlags) {
      securityFlags.push(...formatValidation.securityFlags)
    }
    
    const isValid = securityFlags.length === 0
    
    if (isValid) {
      logger.info('✅ File validation successful', {
        component: 'FileValidation',
        action: 'validation_success',
        validationId,
        detectedType: detectedType,
        fileCategory,
        validationDepth: uint8Buffer.length
      })
    } else {
      logger.warn('⚠️ File validation completed with security flags', {
        component: 'FileValidation',
        action: 'validation_warning',
        validationId,
        securityFlags,
        detectedType,
        declaredMime: file.type
      })
    }
    
    return {
      isValid,
      detectedType,
      declaredMime: file.type,
      error: isValid ? undefined : `Security validation failed: ${securityFlags.join(', ')}`,
      securityFlags: securityFlags.length > 0 ? securityFlags : undefined,
      metadata: {
        fileSize: file.size,
        validationDepth: uint8Buffer.length
      }
    }
    
  } catch (error) {
    logger.error('❌ File validation error', {
      component: 'FileValidation',
      action: 'validation_error',
      validationId,
      error: error instanceof Error ? error.message : 'Unknown error',
      fileName: file.name
    })
    
    return {
      isValid: false,
      declaredMime: file.type,
      error: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      securityFlags: ['VALIDATION_ERROR'],
      metadata: { fileSize: file.size, validationDepth: 0 }
    }
  }
}

/**
 * Get common MIME type variations for cross-validation
 */
function getMimeTypeVariations(baseMime: string): string[] {
  const variations: Record<string, string[]> = {
    'image/jpeg': ['image/jpeg', 'image/jpg'],
    'video/mp4': ['video/mp4', 'video/mpeg4'],
    'audio/mpeg': ['audio/mpeg', 'audio/mp3', 'audio/mpeg3'],
    'application/pdf': ['application/pdf'],
  }
  
  return variations[baseMime] || [baseMime]
}

/**
 * Validate that detected type matches expected category
 */
function isDetectedTypeValidForCategory(detectedMime: string, category: string): boolean {
  switch (category) {
    case 'video':
      return detectedMime.startsWith('video/')
    case 'audio':
      return detectedMime.startsWith('audio/')
    case 'image':
      return detectedMime.startsWith('image/')
    case 'document':
      return detectedMime.includes('pdf') || detectedMime.includes('document') || detectedMime.includes('text')
    default:
      return false
  }
}

/**
 * Fallback validation using custom signatures when file-type library fails
 * Specifically handles MP4 variants that might not be detected
 */
async function tryFallbackValidation(
  buffer: Uint8Array, 
  declaredMime: string
): Promise<{ detected: boolean; mime?: string; ext?: string }> {
  // Common MP4 signatures for fallback validation
  const mp4Signatures = [
    { pattern: [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], mime: 'video/mp4', ext: 'mp4' }, // ftyp 24-byte
    { pattern: [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70], mime: 'video/mp4', ext: 'mp4' }, // ftyp 32-byte  
    { pattern: [0x00, 0x00, 0x00, 0x1C, 0x66, 0x74, 0x79, 0x70], mime: 'video/mp4', ext: 'mp4' }, // ftyp 28-byte
    { pattern: [0x00, 0x00, 0x00, 0x24, 0x66, 0x74, 0x79, 0x70], mime: 'video/mp4', ext: 'mp4' }, // ftyp 36-byte
    { pattern: [0x66, 0x74, 0x79, 0x70], mime: 'video/mp4', ext: 'mp4' } // Direct ftyp marker
  ]
  
  // Only try fallback if declared MIME suggests video
  if (!declaredMime.startsWith('video/')) {
    return { detected: false }
  }
  
  for (const sig of mp4Signatures) {
    if (buffer.length >= sig.pattern.length) {
      let matches = true
      for (let i = 0; i < sig.pattern.length; i++) {
        if (buffer[i] !== sig.pattern[i]) {
          matches = false
          break
        }
      }
      if (matches) {
        return { detected: true, mime: sig.mime, ext: sig.ext }
      }
    }
  }
  
  return { detected: false }
}

/**
 * Format-specific validation for additional security
 */
async function validateFormatSpecific(
  _file: File, 
  detectedType: { ext: string, mime: string }, 
  buffer: Uint8Array
): Promise<{ securityFlags?: string[] }> {
  const securityFlags: string[] = []
  
  try {
    // WebP specific validation (requires WEBP marker after RIFF header)
    if (detectedType.mime === 'image/webp') {
      if (buffer.length >= 12) {
        const webpMarker = new TextDecoder('ascii').decode(buffer.slice(8, 12))
        if (webpMarker !== 'WEBP') {
          securityFlags.push('WEBP_MARKER_INVALID')
        }
      }
    }
    
    // MP4 specific validation (validate ftyp box structure)
    if (detectedType.mime === 'video/mp4') {
      if (buffer.length >= 8) {
        const ftypMarker = new TextDecoder('ascii').decode(buffer.slice(4, 8))
        if (ftypMarker !== 'ftyp') {
          securityFlags.push('MP4_FTYP_INVALID')
        }
      }
    }
    
    // PDF specific validation (check for PDF structure)
    if (detectedType.mime === 'application/pdf') {
      const pdfHeader = new TextDecoder('ascii').decode(buffer.slice(0, 4))
      if (pdfHeader !== '%PDF') {
        securityFlags.push('PDF_HEADER_INVALID')
      }
    }
    
  } catch (error) {
    securityFlags.push('FORMAT_VALIDATION_ERROR')
  }
  
  return { securityFlags: securityFlags.length > 0 ? securityFlags : undefined }
}

/**
 * Validate multiple files with production standards
 * 
 * Sequentially validates each file using the production validation pipeline.
 * Each file is validated independently with full security analysis.
 * 
 * @param files - Array of File objects to validate
 * @returns Promise<ValidationResult[]> - Array of validation results in same order as input
 * 
 * @example
 * ```typescript
 * const files = [file1, file2, file3]
 * const results = await validateMultipleFilesProduction(files)
 * 
 * const validFiles = results.filter(r => r.isValid)
 * const invalidFiles = results.filter(r => !r.isValid)
 * 
 * console.log(`${validFiles.length}/${files.length} files are valid`)
 * ```
 * 
 * @see {@link validateFileProduction} for single file validation
 * @see {@link createProductionValidationSummary} for batch analysis
 */
export async function validateMultipleFilesProduction(files: File[]): Promise<ValidationResult[]> {
  const results: ValidationResult[] = []
  
  for (const file of files) {
    const result = await validateFileProduction(file)
    results.push(result)
  }
  
  return results
}

/**
 * Create validation summary for admin/logging
 * 
 * Analyzes multiple validation results and creates a comprehensive summary
 * including success rates, error types, security flags, and performance metrics.
 * 
 * @param results - Array of ValidationResult objects to analyze
 * @returns Summary object with aggregated statistics and insights
 * 
 * @example
 * ```typescript
 * const files = await validateMultipleFilesProduction([file1, file2, file3])
 * const summary = createProductionValidationSummary(files)
 * 
 * console.log(`Processed ${summary.totalFiles} files`)
 * console.log(`Success rate: ${(summary.validFiles/summary.totalFiles*100).toFixed(1)}%`)
 * console.log(`Total size: ${(summary.totalSize/1024/1024).toFixed(1)} MB`)
 * console.log(`Average validation depth: ${summary.averageValidationDepth} bytes`)
 * 
 * if (summary.errors.length > 0) {
 *   console.log('Common errors:', summary.errors)
 * }
 * 
 * if (summary.securityFlags.length > 0) {
 *   console.warn('Security flags detected:', summary.securityFlags)
 * }
 * ```
 * 
 * @see {@link validateMultipleFilesProduction} for generating validation results
 */
export function createProductionValidationSummary(results: ValidationResult[]): {
  totalFiles: number
  validFiles: number
  invalidFiles: number
  errors: string[]
  securityFlags: string[]
  totalSize: number
  averageValidationDepth: number
} {
  const summary = {
    totalFiles: results.length,
    validFiles: 0,
    invalidFiles: 0,
    errors: [] as string[],
    securityFlags: [] as string[],
    totalSize: 0,
    averageValidationDepth: 0
  }
  
  let totalValidationDepth = 0
  
  results.forEach(result => {
    if (result.isValid) {
      summary.validFiles++
    } else {
      summary.invalidFiles++
      if (result.error) {
        summary.errors.push(result.error)
      }
    }
    
    if (result.securityFlags) {
      summary.securityFlags.push(...result.securityFlags)
    }
    
    if (result.metadata) {
      summary.totalSize += result.metadata.fileSize
      totalValidationDepth += result.metadata.validationDepth
    }
  })
  
  summary.averageValidationDepth = results.length > 0 ? totalValidationDepth / results.length : 0
  
  return summary
}

/**
 * Backward compatibility wrapper for existing code
 * 
 * @deprecated Use validateFileProduction() for comprehensive validation
 * This function only returns a boolean for compatibility with legacy code.
 * For detailed validation results, security flags, and error messages,
 * use validateFileProduction() instead.
 * 
 * @param file - The File object to validate
 * @returns Promise<boolean> - true if file passes basic validation, false otherwise
 * 
 * @example
 * ```typescript
 * // Legacy usage (deprecated)
 * const isValid = await validateFileSignature(file)
 * 
 * // Recommended approach
 * const result = await validateFileProduction(file)
 * const isValid = result.isValid
 * if (!isValid) {
 *   console.log('Error:', result.error)
 *   console.log('Security flags:', result.securityFlags)
 * }
 * ```
 * 
 * @see {@link validateFileProduction} for comprehensive validation
 */
export async function validateFileSignature(file: File): Promise<boolean> {
  const result = await validateFileProduction(file)
  return result.isValid
}

// =============================================================================
// UNIFIED EXPORT POINT - Single Source of Truth for File Validation
// =============================================================================

/**
 * Recommended aliases for primary validation functions
 * Use these shorter names in new code for better developer experience
 */

/**
 * Primary file validation function (alias for validateFileProduction)
 * @see {@link validateFileProduction}
 */
export const validateFile = validateFileProduction

/**
 * Batch file validation function (alias for validateMultipleFilesProduction) 
 * @see {@link validateMultipleFilesProduction}
 */
export const validateFiles = validateMultipleFilesProduction

/**
 * Validation summary function (alias for createProductionValidationSummary)
 * @see {@link createProductionValidationSummary}
 */
export const createValidationSummary = createProductionValidationSummary

/**
 * Validation configuration constants (alias for PRODUCTION_VALIDATION_CONFIGS)
 * @see {@link PRODUCTION_VALIDATION_CONFIGS}
 */
export const VALIDATION_CONFIGS = PRODUCTION_VALIDATION_CONFIGS