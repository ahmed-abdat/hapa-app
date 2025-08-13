import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sanitizeFilename } from '@/lib/file-upload'
import { validateFileProduction } from '@/lib/production-file-validation'
import { logger } from '@/utilities/logger'

// For Node.js compatibility - File is a browser API
const isFileObject = (value: any): value is File => {
  return value && 
         typeof value === 'object' && 
         typeof value.name === 'string' && 
         typeof value.size === 'number' && 
         typeof value.type === 'string' &&
         'stream' in value &&
         'arrayBuffer' in value
}

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
    
    // Process upload request
    
    const file = formData.get('file') as File | null
    const fileType = formData.get('fileType') as string | null
    const fileIndex = formData.get('fileIndex') as string | null

    if (!file) {
      logger.error('❌ UPLOAD ENDPOINT: No file provided in FormData')
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    logger.log('Processing file upload:', { name: file.name, size: `${(file.size / 1024).toFixed(1)}KB`, type: file.type })

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

    // Validate file using production-grade validation system
    const validationResult = await validateFileProduction(file)
    if (!validationResult.isValid) {
      logger.error('❌ Production file validation failed', {
        error: validationResult.error,
        securityFlags: validationResult.securityFlags,
        fileName: file.name,
        fileType: file.type
      })
      return NextResponse.json(
        { error: validationResult.error || 'Invalid file format detected' },
        { status: 400 }
      )
    }

    // Generate custom filename for form uploads with form_ prefix
    const timestamp = Date.now()
    const index = fileIndex || '0'
    const originalName = sanitizeFilename(file.name)
    const extension = originalName.substring(originalName.lastIndexOf('.'))
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'))
    
    let customFilename: string
    if (fileType === 'screenshot') {
      customFilename = `hapa_form_screenshot_${timestamp}_${index}${extension}`
    } else if (fileType === 'attachment') {
      customFilename = `hapa_form_attachment_${timestamp}_${index}${extension}`
    } else {
      // Fallback for regular uploads or when fileType is not specified
      customFilename = `hapa_form_${nameWithoutExt}_${timestamp}${extension}`
    }

    // Use custom filename instead of original sanitized filename
    const finalFilename = customFilename

    // Determine collection based on fileType - form uploads go to separate collection
    const isFormUpload = fileType === 'screenshot' || fileType === 'attachment'
    const collection = isFormUpload ? 'form-media' : 'media'
    
    // Upload file through Payload CMS
    const result = await payload.create({
      collection,
      data: isFormUpload ? {
        alt: finalFilename,
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
        // Form-specific metadata
        formType: 'report', // Default, can be updated
        fileType: fileType,
        submissionDate: new Date().toISOString(),
        filesize: file.size,
        mimeType: file.type,
      } : {
        alt: finalFilename,
        // Regular admin upload caption
        caption: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: `Admin upload on ${new Date().toISOString()}`,
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
        name: finalFilename,
        size: file.size,
      },
    })

    const uploadTime = Date.now() - startTime
    logger.success(`File uploaded successfully: ${file.name} in ${uploadTime}ms`, `URL: ${result.url}`)

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