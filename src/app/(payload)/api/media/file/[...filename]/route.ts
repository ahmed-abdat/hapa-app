import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/utilities/logger'

/**
 * Optimized media file serving route with cache-first strategy
 * Serves files directly from R2 CDN without database queries for better performance
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string[] }> }
): Promise<NextResponse> {
  try {
    const { filename: filenameArray } = await params
    const filename = filenameArray.join('/')
    const decodedFilename = decodeURIComponent(filename)
    
    // Extract file extension for proper prefix determination
    const extension = decodedFilename.split('.').pop()?.toLowerCase()
    
    // Generate R2 URL with optimized path logic
    const customDomain = process.env.R2_CUSTOM_DOMAIN
    const publicUrl = process.env.R2_PUBLIC_URL
    const baseUrl = customDomain || publicUrl || `https://${process.env.R2_BUCKET_NAME}.r2.cloudflarestorage.com`
    
    // Determine the prefix based on file extension (faster than DB lookup)
    let prefix = 'media' // default
    if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'svg'].includes(extension || '')) {
      prefix = 'images'
    } else if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension || '')) {
      prefix = 'docs'
    } else if (['mp4', 'mov', 'avi', 'webm', 'mkv'].includes(extension || '')) {
      prefix = 'videos'
    } else if (['mp3', 'wav', 'ogg', 'aac', 'm4a'].includes(extension || '')) {
      prefix = 'audio'
    }
    
    // Build the R2 URL
    const r2Url = `${baseUrl}/${prefix}/${decodedFilename}`
    
    // Use 308 permanent redirect for better caching and performance
    const response = NextResponse.redirect(r2Url, 308)
    
    // Add caching headers to improve performance
    response.headers.set('Cache-Control', 'public, max-age=2592000, s-maxage=2592000, immutable')
    response.headers.set('CDN-Cache-Control', 'public, max-age=31536000')
    response.headers.set('Vercel-CDN-Cache-Control', 'public, max-age=31536000')
    
    return response
    
  } catch (error) {
    logger.error('Media serving error', error, {
      component: 'MediaFileAPI',
      action: 'serve_media_error',
      metadata: { 
        endpoint: '/api/media/file',
        filename: 'unknown' // params is not available in catch block
      }
    })
    return NextResponse.json(
      { error: 'Media file not found' },
      { status: 404 }
    )
  }
}