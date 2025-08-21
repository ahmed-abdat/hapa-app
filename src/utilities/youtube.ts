/**
 * YouTube utility functions for extracting video IDs and generating embed URLs
 */

/**
 * Extracts YouTube video ID from various URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null
  
  try {
    const urlObj = new URL(url)
    
    // Standard youtube.com/watch format
    if (urlObj.hostname.includes('youtube.com') && urlObj.pathname === '/watch') {
      return urlObj.searchParams.get('v')
    }
    
    // Short youtu.be format
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1) // Remove leading slash
    }
    
    // Embed format
    if (urlObj.hostname.includes('youtube.com') && urlObj.pathname.startsWith('/embed/')) {
      return urlObj.pathname.split('/embed/')[1]?.split('?')[0]
    }
    
    return null
  } catch {
    return null
  }
}

/**
 * Validates if a URL is a valid YouTube URL
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeVideoId(url) !== null
}

/**
 * Generates a privacy-friendly YouTube embed URL
 */
export function generateYouTubeEmbedUrl(
  videoId: string,
  options: {
    privacyMode?: boolean
    autoplay?: boolean
    muted?: boolean
    controls?: boolean
    modestBranding?: boolean
  } = {}
): string {
  const {
    privacyMode = true,
    autoplay = false,
    muted = false,
    controls = true,
    modestBranding = true,
  } = options

  const domain = privacyMode ? 'youtube-nocookie.com' : 'youtube.com'
  const params = new URLSearchParams()

  if (autoplay) params.set('autoplay', '1')
  if (muted) params.set('mute', '1')
  if (!controls) params.set('controls', '0')
  if (modestBranding) params.set('modestbranding', '1')
  
  // Enable captions by default for accessibility
  params.set('cc_load_policy', '1')
  
  const queryString = params.toString()
  return `https://www.${domain}/embed/${videoId}${queryString ? `?${queryString}` : ''}`
}

/**
 * Validates YouTube URL for Payload field validation
 */
export function validateYouTubeUrl(value: string | null | undefined): string | true {
  if (!value) return 'URL YouTube requis'
  
  if (!isValidYouTubeUrl(value)) {
    return 'Veuillez entrer une URL YouTube valide (ex: https://www.youtube.com/watch?v=VIDEO_ID ou https://youtu.be/VIDEO_ID)'
  }
  
  return true
}