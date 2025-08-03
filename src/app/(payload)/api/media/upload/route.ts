import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { validateFileSignature, sanitizeFilename } from '@/lib/file-upload'
import { logger } from '@/utilities/logger'

/**
 * Maximum file sizes
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB for images

/**
 * Allowed MIME types for security
 */
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]


/**
 * Upload file through Payload CMS with enhanced security
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now()
  
  try {
    const payload = await getPayload({ config })
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    logger.fileOperation(`📤 Processing upload through Payload: ${file.name} (Size: ${(file.size / 1024).toFixed(1)}KB)`)

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      logger.error('❌ Invalid file type:', file.type)
      return NextResponse.json(
        { error: `File type not allowed: ${file.type}` },
        { status: 400 }
      )
    }

    // Validate file size
    const isImage = file.type.startsWith('image/')
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_FILE_SIZE
    
    if (file.size > maxSize) {
      logger.error('❌ File too large:', `${(file.size / 1024 / 1024).toFixed(1)}MB`)
      return NextResponse.json(
        { error: `File too large. Maximum size: ${maxSize / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Validate file signature for security
    const isValidSignature = await validateFileSignature(file)
    if (!isValidSignature) {
      logger.error('❌ Invalid file signature detected')
      return NextResponse.json(
        { error: 'Invalid file format detected' },
        { status: 400 }
      )
    }

    // Sanitize filename for security
    const sanitizedFilename = sanitizeFilename(file.name)

    // Upload file through Payload CMS
    const result = await payload.create({
      collection: 'media',
      data: {
        alt: sanitizedFilename,
        // Add metadata for tracking via caption
        caption: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: `Uploaded via media forms on ${new Date().toISOString()}`,
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
      },
      file: {
        data: Buffer.from(await file.arrayBuffer()),
        mimetype: file.type,
        name: sanitizedFilename,
        size: file.size,
      },
    })

    const uploadTime = Date.now() - startTime
    logger.success('✅ File uploaded successfully through Payload:', `ID: ${result.id}`)
    logger.log('Upload details:', {
      id: result.id,
      filename: result.filename,
      size: file.size,
      type: file.type,
      uploadTime: `${uploadTime}ms`,
      url: result.url
    })

    return NextResponse.json({
      success: true,
      url: result.url,
      id: result.id,
      filename: result.filename,
      originalName: file.name,
      size: file.size,
      type: file.type,
      uploadTime
    })

  } catch (error) {
    const uploadTime = Date.now() - startTime
    logger.error('❌ Payload upload failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      uploadTime: `${uploadTime}ms`
    })

    // Don't expose internal errors to client
    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS handler for CORS
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  })
}