/**
 * Legacy Media File Validation System (DEPRECATED)
 * 
 * @deprecated Use production-file-validation.ts for all new validation needs
 * This file is kept only for codec validation and media metadata extraction
 * which are not yet available in the production validation system
 */

import { validateFileProduction } from '@/lib/production-file-validation'

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
 * Enhanced media file validation using production-grade validation + codec validation
 * @deprecated Consider using production-file-validation.ts directly for most use cases
 */
export async function validateMediaFile(file: File): Promise<{
  isValid: boolean
  error?: string
  fileType: 'video' | 'audio' | 'image' | 'document' | 'unknown'
  detectedMimeType?: string
  codecInfo?: CodecInfo
  metadata?: MediaMetadata
}> {
  // Use production validation as the primary validation
  const productionResult = await validateFileProduction(file)
  
  if (!productionResult.isValid) {
    return {
      isValid: false,
      error: productionResult.error,
      fileType: productionResult.detectedType ? 
        (productionResult.detectedType.mime.startsWith('video/') ? 'video' :
         productionResult.detectedType.mime.startsWith('audio/') ? 'audio' :
         productionResult.detectedType.mime.startsWith('image/') ? 'image' : 'document') : 'unknown',
      detectedMimeType: productionResult.detectedType?.mime
    }
  }

  const fileType = productionResult.detectedType?.mime.startsWith('video/') ? 'video' :
                   productionResult.detectedType?.mime.startsWith('audio/') ? 'audio' :
                   productionResult.detectedType?.mime.startsWith('image/') ? 'image' : 'document'
  
  // Additional codec validation for media files
  let codecInfo: CodecInfo | undefined
  let metadata: MediaMetadata | undefined
  
  if (fileType === 'video' || fileType === 'audio') {
    try {
      codecInfo = await validateCodec(file, fileType)
      if (!codecInfo.isSupported) {
        return {
          isValid: false,
          error: 'Unsupported video/audio codec or corrupted file',
          fileType,
          codecInfo,
          detectedMimeType: productionResult.detectedType?.mime
        }
      }
      
      // Extract metadata
      metadata = await extractMediaMetadata(file, fileType)
      
      // Additional validation for media files (already handled by production validation)
      // Duration limits are enforced in production-file-validation.ts
      
    } catch (error) {
      return {
        isValid: false,
        error: 'Failed to validate media codec',
        fileType,
        detectedMimeType: productionResult.detectedType?.mime
      }
    }
  }
  
  return {
    isValid: true,
    fileType,
    detectedMimeType: productionResult.detectedType?.mime,
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
): Promise<{
  isValid: boolean
  error?: string
  fileType: 'video' | 'audio' | 'image' | 'document' | 'unknown'
  detectedMimeType?: string
  codecInfo?: CodecInfo
  metadata?: MediaMetadata
}[]> {
  const results: {
    isValid: boolean
    error?: string
    fileType: 'video' | 'audio' | 'image' | 'document' | 'unknown'
    detectedMimeType?: string
    codecInfo?: CodecInfo
    metadata?: MediaMetadata
  }[] = []
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    onProgress?.(i / files.length, file.name)
    
    const result = await validateMediaFile(file)
    results.push(result)
  }
  
  onProgress?.(1, 'Validation complete')
  return results
}