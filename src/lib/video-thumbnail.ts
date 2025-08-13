/**
 * Video Thumbnail Generation Utility
 * Generates thumbnail images from video files for admin previews
 * Supports multiple thumbnail formats and sizes
 */

export interface ThumbnailOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
  timeOffset?: number // Seconds into video to capture thumbnail
  multiple?: boolean // Generate multiple thumbnails at different times
  count?: number // Number of thumbnails to generate (if multiple)
}

export interface ThumbnailResult {
  dataUrl: string
  blob: Blob
  width: number
  height: number
  size: number
  timeOffset: number
}

export interface MultiThumbnailResult {
  thumbnails: ThumbnailResult[]
  duration: number
  videoWidth: number
  videoHeight: number
}

/**
 * Generate a single thumbnail from a video file
 */
export async function generateVideoThumbnail(
  videoFile: File,
  options: ThumbnailOptions = {}
): Promise<ThumbnailResult> {
  const {
    width = 320,
    height = 240,
    quality = 0.8,
    format = 'jpeg',
    timeOffset = 1
  } = options

  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Unable to get canvas context'))
      return
    }

    video.crossOrigin = 'anonymous'
    video.muted = true
    video.preload = 'metadata'

    const cleanup = () => {
      URL.revokeObjectURL(video.src)
      video.remove()
      canvas.remove()
    }

    video.onloadedmetadata = () => {
      // Set canvas dimensions
      const aspectRatio = video.videoWidth / video.videoHeight
      let canvasWidth = width
      let canvasHeight = height

      // Maintain aspect ratio
      if (width && !height) {
        canvasHeight = width / aspectRatio
      } else if (height && !width) {
        canvasWidth = height * aspectRatio
      } else if (width && height) {
        // Use provided dimensions (might distort)
        canvasWidth = width
        canvasHeight = height
      }

      canvas.width = canvasWidth
      canvas.height = canvasHeight

      // Seek to the desired time
      video.currentTime = Math.min(timeOffset, video.duration - 0.1)
    }

    video.onseeked = () => {
      try {
        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              cleanup()
              reject(new Error('Failed to generate thumbnail blob'))
              return
            }

            // Create data URL
            const reader = new FileReader()
            reader.onload = () => {
              const result: ThumbnailResult = {
                dataUrl: reader.result as string,
                blob,
                width: canvas.width,
                height: canvas.height,
                size: blob.size,
                timeOffset: video.currentTime
              }

              cleanup()
              resolve(result)
            }
            reader.onerror = () => {
              cleanup()
              reject(new Error('Failed to read thumbnail blob'))
            }
            reader.readAsDataURL(blob)
          },
          `image/${format}`,
          quality
        )
      } catch (error) {
        cleanup()
        reject(error)
      }
    }

    video.onerror = () => {
      cleanup()
      reject(new Error('Video loading failed'))
    }

    video.onabort = () => {
      cleanup()
      reject(new Error('Video loading aborted'))
    }

    // Start loading video
    video.src = URL.createObjectURL(videoFile)
  })
}

/**
 * Generate multiple thumbnails from a video file at different time offsets
 */
export async function generateMultipleVideoThumbnails(
  videoFile: File,
  options: ThumbnailOptions & { count: number } = { count: 3 }
): Promise<MultiThumbnailResult> {
  const { count = 3, ...thumbnailOptions } = options

  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.crossOrigin = 'anonymous'
    video.muted = true
    video.preload = 'metadata'

    video.onloadedmetadata = async () => {
      const duration = video.duration
      const videoWidth = video.videoWidth
      const videoHeight = video.videoHeight

      try {
        const thumbnails: ThumbnailResult[] = []

        // Generate thumbnails at evenly spaced intervals
        for (let i = 0; i < count; i++) {
          const timeOffset = (duration / (count + 1)) * (i + 1)
          
          const thumbnail = await generateVideoThumbnail(videoFile, {
            ...thumbnailOptions,
            timeOffset
          })

          thumbnails.push(thumbnail)
        }

        URL.revokeObjectURL(video.src)
        video.remove()

        resolve({
          thumbnails,
          duration,
          videoWidth,
          videoHeight
        })
      } catch (error) {
        URL.revokeObjectURL(video.src)
        video.remove()
        reject(error)
      }
    }

    video.onerror = () => {
      URL.revokeObjectURL(video.src)
      video.remove()
      reject(new Error('Video loading failed'))
    }

    video.src = URL.createObjectURL(videoFile)
  })
}

/**
 * Generate thumbnail for video with automatic optimal time selection
 * Analyzes the video to find a good frame (avoiding black frames, etc.)
 */
export async function generateOptimalVideoThumbnail(
  videoFile: File,
  options: ThumbnailOptions = {}
): Promise<ThumbnailResult> {
  const defaultOptions = {
    width: 320,
    height: 240,
    quality: 0.8,
    format: 'jpeg' as const
  }

  const finalOptions = { ...defaultOptions, ...options }

  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Unable to get canvas context'))
      return
    }

    video.crossOrigin = 'anonymous'
    video.muted = true
    video.preload = 'metadata'

    const cleanup = () => {
      URL.revokeObjectURL(video.src)
      video.remove()
      canvas.remove()
    }

    video.onloadedmetadata = async () => {
      try {
        const duration = video.duration
        const candidates: number[] = []

        // Try different time offsets to find good frames
        const sampleTimes = [
          duration * 0.1,  // 10% into video
          duration * 0.25, // 25% into video  
          duration * 0.5,  // 50% into video
          duration * 0.75, // 75% into video
          1, // 1 second (fallback)
        ].filter(t => t < duration - 0.1)

        let bestTime = sampleTimes[0]
        let bestScore = 0

        for (const time of sampleTimes) {
          video.currentTime = time
          
          // Wait for seek to complete
          await new Promise<void>((resolveSeek) => {
            const onSeeked = () => {
              video.removeEventListener('seeked', onSeeked)
              resolveSeek()
            }
            video.addEventListener('seeked', onSeeked)
          })

          // Set canvas dimensions
          const aspectRatio = video.videoWidth / video.videoHeight
          canvas.width = finalOptions.width || 320
          canvas.height = finalOptions.height || canvas.width / aspectRatio

          // Draw frame
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

          // Analyze frame quality (avoid black/blank frames)
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const score = analyzeFrameQuality(imageData)

          if (score > bestScore) {
            bestScore = score
            bestTime = time
          }
        }

        // Generate final thumbnail at best time
        const thumbnail = await generateVideoThumbnail(videoFile, {
          ...finalOptions,
          timeOffset: bestTime
        })

        cleanup()
        resolve(thumbnail)
      } catch (error) {
        cleanup()
        reject(error)
      }
    }

    video.onerror = () => {
      cleanup()
      reject(new Error('Video loading failed'))
    }

    video.src = URL.createObjectURL(videoFile)
  })
}

/**
 * Analyze frame quality to avoid black/blank frames
 * Returns a score from 0-100 where higher is better
 */
function analyzeFrameQuality(imageData: ImageData): number {
  const data = imageData.data
  let totalBrightness = 0
  let colorVariance = 0
  let nonBlackPixels = 0

  // Sample every 4th pixel for performance
  for (let i = 0; i < data.length; i += 16) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    
    const brightness = (r + g + b) / 3
    totalBrightness += brightness
    
    if (brightness > 10) {
      nonBlackPixels++
    }
    
    // Calculate color variance (more varied = better)
    const variance = Math.abs(r - brightness) + Math.abs(g - brightness) + Math.abs(b - brightness)
    colorVariance += variance
  }

  const pixelCount = data.length / 16
  const avgBrightness = totalBrightness / pixelCount
  const avgVariance = colorVariance / pixelCount
  const nonBlackRatio = nonBlackPixels / pixelCount

  // Score based on brightness, variance, and non-black pixels
  const brightnessScore = Math.min(avgBrightness / 2.55, 50) // Max 50 points
  const varianceScore = Math.min(avgVariance / 5, 30) // Max 30 points  
  const contentScore = nonBlackRatio * 20 // Max 20 points

  return brightnessScore + varianceScore + contentScore
}

/**
 * Create a video thumbnail sprite (multiple thumbnails in one image)
 * Useful for video preview scrubbing functionality
 */
export async function generateVideoThumbnailSprite(
  videoFile: File,
  options: {
    thumbnailWidth?: number
    thumbnailHeight?: number
    columns?: number
    rows?: number
    quality?: number
    format?: 'jpeg' | 'png' | 'webp'
  } = {}
): Promise<{
  spriteDataUrl: string
  spriteBlob: Blob
  spriteWidth: number
  spriteHeight: number
  thumbnailWidth: number
  thumbnailHeight: number
  columns: number
  rows: number
  totalThumbnails: number
}> {
  const {
    thumbnailWidth = 160,
    thumbnailHeight = 120,
    columns = 4,
    rows = 3,
    quality = 0.8,
    format = 'jpeg'
  } = options

  const totalThumbnails = columns * rows
  const spriteWidth = thumbnailWidth * columns
  const spriteHeight = thumbnailHeight * rows

  // Generate individual thumbnails
  const multiResult = await generateMultipleVideoThumbnails(videoFile, {
    width: thumbnailWidth,
    height: thumbnailHeight,
    quality,
    format,
    count: totalThumbnails
  })

  // Create sprite canvas
  const spriteCanvas = document.createElement('canvas')
  const spriteCtx = spriteCanvas.getContext('2d')

  if (!spriteCtx) {
    throw new Error('Unable to get sprite canvas context')
  }

  spriteCanvas.width = spriteWidth
  spriteCanvas.height = spriteHeight

  // Load and draw each thumbnail to sprite
  const thumbnailPromises = multiResult.thumbnails.map((thumbnail, index) => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const col = index % columns
        const row = Math.floor(index / columns)
        const x = col * thumbnailWidth
        const y = row * thumbnailHeight

        spriteCtx.drawImage(img, x, y, thumbnailWidth, thumbnailHeight)
        resolve()
      }
      img.onerror = reject
      img.src = thumbnail.dataUrl
    })
  })

  await Promise.all(thumbnailPromises)

  // Convert sprite to blob
  return new Promise((resolve, reject) => {
    spriteCanvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to generate sprite blob'))
          return
        }

        const reader = new FileReader()
        reader.onload = () => {
          resolve({
            spriteDataUrl: reader.result as string,
            spriteBlob: blob,
            spriteWidth,
            spriteHeight,
            thumbnailWidth,
            thumbnailHeight,
            columns,
            rows,
            totalThumbnails
          })
        }
        reader.onerror = () => reject(new Error('Failed to read sprite blob'))
        reader.readAsDataURL(blob)
      },
      `image/${format}`,
      quality
    )
  })
}

/**
 * Utility to check if video thumbnail generation is supported
 */
export function isVideoThumbnailSupported(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    return !!(ctx && canvas.toBlob)
  } catch {
    return false
  }
}

/**
 * Get video metadata without generating thumbnails
 */
export async function getVideoMetadata(videoFile: File): Promise<{
  duration: number
  width: number
  height: number
  aspectRatio: number
  fileSize: number
}> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.crossOrigin = 'anonymous'
    video.muted = true
    video.preload = 'metadata'

    video.onloadedmetadata = () => {
      const metadata = {
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        aspectRatio: video.videoWidth / video.videoHeight,
        fileSize: videoFile.size
      }

      URL.revokeObjectURL(video.src)
      video.remove()
      resolve(metadata)
    }

    video.onerror = () => {
      URL.revokeObjectURL(video.src)
      video.remove()
      reject(new Error('Video metadata loading failed'))
    }

    video.src = URL.createObjectURL(videoFile)
  })
}