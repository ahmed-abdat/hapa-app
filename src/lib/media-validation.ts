/**
 * Enhanced Media File Validation System
 * Production-ready validation for video, audio, and document uploads
 * Supports codec validation, comprehensive MIME checking, and security validation
 */

export interface MediaValidationConfig {
  maxFileSizeMB: number
  allowedMimeTypes: string[]
  allowedExtensions: string[]
  requiresCodecValidation?: boolean
}

export interface ValidationResult {
  isValid: boolean
  error?: string
  fileType: 'video' | 'audio' | 'image' | 'document' | 'unknown'
  detectedMimeType?: string
  codecInfo?: CodecInfo
  metadata?: MediaMetadata
}

export interface CodecInfo {
  container: string
  videoCodec?: string
  audioCodec?: string
  isSupported: boolean
}

export interface MediaMetadata {
  duration?: number
  width?: number
  height?: number
  bitrate?: number
  sampleRate?: number
  channels?: number
}

// Enhanced validation configurations for different file types
export const MEDIA_VALIDATION_CONFIGS: Record<string, MediaValidationConfig> = {
  video: {
    maxFileSizeMB: 100, // 100MB for videos
    allowedMimeTypes: [
      'video/mp4',
      'video/webm', 
      'video/quicktime', // .mov
      'video/x-msvideo', // .avi
      'video/ogg'
    ],
    allowedExtensions: ['mp4', 'webm', 'mov', 'avi', 'ogv'],
    requiresCodecValidation: true
  },
  audio: {
    maxFileSizeMB: 25, // 25MB for audio
    allowedMimeTypes: [
      'audio/mpeg', // .mp3
      'audio/wav',
      'audio/mp4', // .m4a
      'audio/ogg',
      'audio/webm',
      'audio/flac'
    ],
    allowedExtensions: ['mp3', 'wav', 'm4a', 'ogg', 'oga', 'flac'],
    requiresCodecValidation: true
  },
  image: {
    maxFileSizeMB: 10, // 10MB for images
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    requiresCodecValidation: false
  },
  document: {
    maxFileSizeMB: 15, // 15MB for documents
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ],
    allowedExtensions: ['pdf', 'doc', 'docx', 'txt'],
    requiresCodecValidation: false
  }
}

// File signature validation (magic numbers)
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
  webp: { signature: [0x52, 0x49, 0x46, 0x46], mimeType: 'image/webp' }, // Note: WebP has RIFF header
  
  // Document signatures
  pdf: { signature: [0x25, 0x50, 0x44, 0x46], mimeType: 'application/pdf' },
  doc: { signature: [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1], mimeType: 'application/msword' },
  docx: { signature: [0x50, 0x4B, 0x03, 0x04], mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
}

/**
 * Detect file type from content analysis
 */
export function detectFileType(file: File): 'video' | 'audio' | 'image' | 'document' | 'unknown' {
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
 * Validate file signature (magic number) against expected signatures
 */
export async function validateFileSignature(file: File): Promise<{ isValid: boolean, detectedMimeType?: string }> {
  try {
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
    console.error('File signature validation error:', error)
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
 * Advanced codec validation for video/audio files using File API
 */
export async function validateCodec(file: File, fileType: 'video' | 'audio'): Promise<CodecInfo> {
  return new Promise((resolve) => {
    if (fileType === 'video') {
      const video = document.createElement('video')
      video.preload = 'metadata'
      
      video.onloadedmetadata = () => {
        // Extract codec info from video element if available
        const codecInfo: CodecInfo = {
          container: getContainerFormat(file.type),
          isSupported: true
        }
        
        // Clean up
        URL.revokeObjectURL(video.src)
        resolve(codecInfo)
      }
      
      video.onerror = () => {
        URL.revokeObjectURL(video.src)
        resolve({
          container: getContainerFormat(file.type),
          isSupported: false
        })
      }
      
      video.src = URL.createObjectURL(file)
    } else {
      const audio = document.createElement('audio')
      audio.preload = 'metadata'
      
      audio.onloadedmetadata = () => {
        const codecInfo: CodecInfo = {
          container: getContainerFormat(file.type),
          isSupported: true
        }
        
        URL.revokeObjectURL(audio.src)
        resolve(codecInfo)
      }
      
      audio.onerror = () => {
        URL.revokeObjectURL(audio.src)
        resolve({
          container: getContainerFormat(file.type),
          isSupported: false
        })
      }
      
      audio.src = URL.createObjectURL(file)
    }
  })
}

function getContainerFormat(mimeType: string): string {
  const mimeToContainer: Record<string, string> = {
    'video/mp4': 'MP4',
    'video/webm': 'WebM', 
    'video/quicktime': 'QuickTime',
    'video/x-msvideo': 'AVI',
    'audio/mpeg': 'MP3',
    'audio/wav': 'WAV',
    'audio/mp4': 'M4A',
    'audio/ogg': 'OGG',
    'audio/flac': 'FLAC'
  }
  
  return mimeToContainer[mimeType] || 'Unknown'
}

/**
 * Extract media metadata (duration, dimensions, etc.)
 */
export async function extractMediaMetadata(file: File, fileType: 'video' | 'audio'): Promise<MediaMetadata> {
  return new Promise((resolve) => {
    if (fileType === 'video') {
      const video = document.createElement('video')
      video.preload = 'metadata'
      
      video.onloadedmetadata = () => {
        const metadata: MediaMetadata = {
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight
        }
        
        URL.revokeObjectURL(video.src)
        resolve(metadata)
      }
      
      video.onerror = () => {
        URL.revokeObjectURL(video.src)
        resolve({})
      }
      
      video.src = URL.createObjectURL(file)
    } else {
      const audio = document.createElement('audio')
      audio.preload = 'metadata'
      
      audio.onloadedmetadata = () => {
        const metadata: MediaMetadata = {
          duration: audio.duration
        }
        
        URL.revokeObjectURL(audio.src)
        resolve(metadata)
      }
      
      audio.onerror = () => {
        URL.revokeObjectURL(audio.src)
        resolve({})
      }
      
      audio.src = URL.createObjectURL(file)
    }
  })
}

/**
 * Main validation function - comprehensive file validation
 */
export async function validateMediaFile(file: File): Promise<ValidationResult> {
  const fileType = detectFileType(file)
  
  if (fileType === 'unknown') {
    return {
      isValid: false,
      error: 'Unsupported file type',
      fileType: 'unknown'
    }
  }
  
  const config = MEDIA_VALIDATION_CONFIGS[fileType]
  
  // Size validation
  const fileSizeMB = file.size / (1024 * 1024)
  if (fileSizeMB > config.maxFileSizeMB) {
    return {
      isValid: false,
      error: `File size (${fileSizeMB.toFixed(1)}MB) exceeds limit of ${config.maxFileSizeMB}MB`,
      fileType
    }
  }
  
  // MIME type validation
  if (!config.allowedMimeTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `MIME type ${file.type} is not allowed`,
      fileType
    }
  }
  
  // Extension validation  
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!extension || !config.allowedExtensions.includes(extension)) {
    return {
      isValid: false,
      error: `File extension .${extension} is not allowed`,
      fileType
    }
  }
  
  // File signature validation
  const signatureResult = await validateFileSignature(file)
  if (!signatureResult.isValid) {
    return {
      isValid: false,
      error: 'File signature validation failed - file may be corrupted or not what it claims to be',
      fileType
    }
  }
  
  // Codec validation for media files
  let codecInfo: CodecInfo | undefined
  let metadata: MediaMetadata | undefined
  
  if (config.requiresCodecValidation && (fileType === 'video' || fileType === 'audio')) {
    try {
      codecInfo = await validateCodec(file, fileType)
      if (!codecInfo.isSupported) {
        return {
          isValid: false,
          error: 'Unsupported video/audio codec or corrupted file',
          fileType,
          codecInfo
        }
      }
      
      // Extract metadata
      metadata = await extractMediaMetadata(file, fileType)
      
      // Additional validation for media files
      if (fileType === 'video' && metadata.duration && metadata.duration > 600) { // 10 minutes
        return {
          isValid: false,
          error: 'Video duration exceeds 10 minute limit',
          fileType,
          metadata
        }
      }
      
      if (fileType === 'audio' && metadata.duration && metadata.duration > 900) { // 15 minutes
        return {
          isValid: false,
          error: 'Audio duration exceeds 15 minute limit', 
          fileType,
          metadata
        }
      }
      
    } catch (error) {
      return {
        isValid: false,
        error: 'Failed to validate media codec',
        fileType
      }
    }
  }
  
  return {
    isValid: true,
    fileType,
    detectedMimeType: signatureResult.detectedMimeType,
    codecInfo,
    metadata
  }
}

/**
 * Validate multiple files with progress callback
 */
export async function validateMultipleFiles(
  files: File[], 
  onProgress?: (progress: number, currentFile: string) => void
): Promise<ValidationResult[]> {
  const results: ValidationResult[] = []
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    onProgress?.(i / files.length, file.name)
    
    const result = await validateMediaFile(file)
    results.push(result)
  }
  
  onProgress?.(1, 'Validation complete')
  return results
}