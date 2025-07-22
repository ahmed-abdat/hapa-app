import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import config from '@/payload.config'

/**
 * Custom media file serving route that redirects to R2 URLs
 * This overrides Payload's default local file serving
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string[] }> }
): Promise<NextResponse> {
  try {
    const { filename: filenameArray } = await params
    const filename = filenameArray.join('/')
    const decodedFilename = decodeURIComponent(filename)
    
    // Media file request for: ${decodedFilename}
    
    // Initialize Payload
    const payload = await getPayload({ config })
    
    // Search for the media document by filename
    // Try different filename variations since the URL might have size suffixes
    const baseFilename = decodedFilename.split('-')[0] // Remove size suffixes like -300x225
    const extension = decodedFilename.split('.').pop()
    
    const mediaQuery = await payload.find({
      collection: 'media',
      where: {
        or: [
          { filename: { equals: decodedFilename } },
          { filename: { equals: filename } },
          { filename: { contains: baseFilename } }
        ]
      },
      limit: 1,
    })
    
    if (!mediaQuery.docs.length) {
      return NextResponse.json(
        { error: 'Media file not found' },
        { status: 404 }
      )
    }
    
    // Media file found in database, proceed with URL generation
    
    // Generate R2 URL based on the storage configuration
    const customDomain = process.env.R2_CUSTOM_DOMAIN
    const publicUrl = process.env.R2_PUBLIC_URL
    const baseUrl = customDomain || publicUrl || `https://${process.env.R2_BUCKET_NAME}.r2.cloudflarestorage.com`
    
    // Determine the prefix based on the media type (same logic as Media collection hook)
    let prefix = 'media' // default
    const fileExtension = extension?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'svg'].includes(fileExtension || '')) {
      prefix = 'images'
    } else if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(fileExtension || '')) {
      prefix = 'docs'
    } else if (['mp4', 'mov', 'avi', 'webm', 'mkv'].includes(fileExtension || '')) {
      prefix = 'videos'
    } else if (['mp3', 'wav', 'ogg', 'aac', 'm4a'].includes(fileExtension || '')) {
      prefix = 'audio'
    }
    
    // Build the R2 URL
    const r2Url = `${baseUrl}/${prefix}/${decodedFilename}`
    
    // Redirecting to R2: ${decodedFilename} → ${r2Url}
    
    // Redirect to the R2 URL
    return NextResponse.redirect(r2Url)
    
  } catch (error) {
    console.error('Error serving media file:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}