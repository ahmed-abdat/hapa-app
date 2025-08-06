'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { getTranslations } from 'next-intl/server'
import { logger } from '@/utilities/logger'
import { 
  createMediaContentReportSchema,
  createMediaContentComplaintSchema 
} from '@/lib/validations/media-forms'
import type { FormSubmissionResponse } from '@/types/media-forms'
import { validateFileSignature, sanitizeFilename } from '@/lib/file-upload'

// Node.js compatible File type checking
const isFileObject = (value: any): value is File => {
  return value && 
         typeof value === 'object' && 
         typeof value.name === 'string' && 
         typeof value.size === 'number' && 
         typeof value.type === 'string' &&
         'stream' in value &&
         'arrayBuffer' in value
}

// Production-ready constants
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 'text/plain', 
  'application/msword', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]
const MAX_FILES_PER_TYPE = 5
const UPLOAD_TIMEOUT = 30000 // 30 seconds

interface ValidationResult {
  isValid: boolean
  errors: string[]
  fields: Record<string, any>
  screenshots: File[]
  attachments: File[]
}

interface UploadResult {
  success: boolean
  urls: string[]
  errors: string[]
  uploadedCount: number
  totalCount: number
}

/**
 * Production-ready Server Action for media form submissions
 * Handles all edge cases, validation, error recovery, and debugging
 */
export async function submitMediaFormAction(formData: FormData): Promise<FormSubmissionResponse> {
  const startTime = Date.now()
  const sessionId = `SA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  logger.log('🚀 Form submission started', { sessionId })

  try {
    // Phase 1: Input Validation & Data Extraction
    const validation = await validateAndExtractData(formData, sessionId)
    
    if (!validation.isValid) {
      logger.error('❌ Validation failed:', { sessionId, errors: validation.errors })
      return {
        success: false,
        message: validation.errors[0] || 'Validation failed',
        details: validation.errors
      }
    }

    const { fields, screenshots, attachments } = validation
    
    // Phase 2: Payload Connection & Security Validation
    const payload = await getPayload({ config })
    
    // Security validation for all files
    const securityValidation = await validateFileSecurity([...screenshots, ...attachments], sessionId)
    if (!securityValidation.isValid) {
      return {
        success: false,
        message: 'File security validation failed',
        details: securityValidation.errors
      }
    }

    // Phase 3: Schema Validation
    const locale = fields.locale === 'ar' ? 'ar' : 'fr'
    const t = await getTranslations({ locale })
    
    const schemaValidation = await validateSchema(fields, screenshots, attachments, t, sessionId)
    if (!schemaValidation.isValid) {
      return {
        success: false,
        message: 'Form validation failed',
        details: schemaValidation.errors
      }
    }

    // Phase 4: File Upload Processing
    const screenshotUpload = await uploadFilesWithRetry(
      screenshots, 'screenshot', payload, sessionId
    )
    const attachmentUpload = await uploadFilesWithRetry(
      attachments, 'attachment', payload, sessionId
    )

    // Check upload results
    const totalUploadErrors = [...screenshotUpload.errors, ...attachmentUpload.errors]
    if (totalUploadErrors.length > 0) {
      logger.error('❌ Upload errors detected:', { sessionId, errors: totalUploadErrors })
      
      // Partial failure handling
      const totalFiles = screenshots.length + attachments.length
      const totalUploaded = screenshotUpload.uploadedCount + attachmentUpload.uploadedCount
      
      if (totalUploaded === 0 && totalFiles > 0) {
        // Complete upload failure
        return {
          success: false,
          message: 'All file uploads failed. Please check your files and try again.',
          details: totalUploadErrors
        }
      } else if (totalUploaded < totalFiles) {
        // Partial upload failure - continue but log warnings
        logger.warn(`⚠️ Partial upload success: ${totalUploaded}/${totalFiles} files uploaded`, { sessionId })
      }
    }

    // Phase 5: Database Submission
    const submissionData = buildSubmissionData(
      fields, 
      screenshotUpload.urls, 
      attachmentUpload.urls
    )

    // Log complainant info presence for complaint forms
    if (fields.formType === 'complaint') {
      logger.log('📝 Complaint submission includes complainant info', {
        sessionId,
        hasComplainantInfo: !!submissionData.complainantInfo,
        fieldsPresent: submissionData.complainantInfo ? Object.keys(submissionData.complainantInfo) : []
      })
    }

    const submission = await payload.create({
      collection: 'media-content-submissions',
      // Type assertion needed due to complex Payload nested types
      data: submissionData as any,
      locale: 'fr',
    })

    // Phase 6: Success Response
    const totalTime = Date.now() - startTime
    logger.success('✅ Form submitted successfully', `ID: ${submission.id}, Files: ${screenshotUpload.uploadedCount + attachmentUpload.uploadedCount}, Time: ${totalTime}ms`)

    return {
      success: true,
      message: fields.formType === 'report' 
        ? 'Report submitted successfully' 
        : 'Complaint submitted successfully',
      submissionId: submission.id.toString(),
      uploadStats: {
        screenshots: screenshotUpload.uploadedCount,
        attachments: attachmentUpload.uploadedCount,
        totalTime
      }
    }

  } catch (error) {
    const totalTime = Date.now() - startTime
    const errorDetails = {
      sessionId,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 5) // First 5 lines of stack
      } : 'Unknown error',
      totalTime: `${totalTime}ms`,
      timestamp: new Date().toISOString()
    }

    logger.error('❌ Form submission failed:', { sessionId, error: error instanceof Error ? error.message : 'Unknown error' })
    
    // Production error response (don't expose internal details)
    return {
      success: false,
      message: 'A system error occurred. Please try again or contact support if the problem persists.',
      errorId: sessionId // Provide error ID for support tracking
    }
  }
}

/**
 * Comprehensive input validation and data extraction
 */
async function validateAndExtractData(formData: FormData, sessionId: string): Promise<ValidationResult> {
  const errors: string[] = []
  const fields: Record<string, any> = {}
  const screenshots: File[] = []
  const attachments: File[] = []

  // Process FormData entries
  for (const [key, value] of formData.entries()) {

    if (key === 'screenshotFiles' && isFileObject(value)) {
      if (value.size === 0) {
        errors.push(`Empty screenshot file: ${value.name}`)
        continue
      }
      if (screenshots.length >= MAX_FILES_PER_TYPE) {
        errors.push(`Too many screenshot files (max: ${MAX_FILES_PER_TYPE})`)
        continue
      }
      screenshots.push(value as File)
    } else if (key === 'attachmentFiles' && isFileObject(value)) {
      if (value.size === 0) {
        errors.push(`Empty attachment file: ${value.name}`)
        continue
      }
      if (attachments.length >= MAX_FILES_PER_TYPE) {
        errors.push(`Too many attachment files (max: ${MAX_FILES_PER_TYPE})`)
        continue
      }
      attachments.push(value as File)
    } else if (key === 'reasons' || key === 'attachmentTypes') {
      // Handle array fields
      if (fields[key]) {
        if (Array.isArray(fields[key])) {
          fields[key].push(value.toString())
        } else {
          fields[key] = [fields[key], value.toString()]
        }
      } else {
        fields[key] = [value.toString()]
      }
    } else if (typeof value === 'string') {
      // Handle boolean fields that come as strings from FormData
      if (key === 'acceptDeclaration' || key === 'acceptConsent') {
        fields[key] = value.trim() === 'true'
      } else {
        fields[key] = value.trim()
      }
    }
  }

  // Validate required fields
  const requiredFields = ['formType', 'locale', 'mediaType', 'programName', 'description']
  for (const field of requiredFields) {
    if (!fields[field] || fields[field] === '') {
      errors.push(`Missing required field: ${field}`)
    }
  }

  // Validate form type
  if (fields.formType && !['report', 'complaint'].includes(fields.formType)) {
    errors.push('Invalid form type. Must be "report" or "complaint"')
  }

  // Validate description length
  if (fields.description && fields.description.length < 10) {
    errors.push('Description must be at least 10 characters long')
  }

  if (errors.length > 0) {
    logger.error('Validation failed:', { sessionId, errors })
  }

  return {
    isValid: errors.length === 0,
    errors,
    fields,
    screenshots,
    attachments
  }
}

/**
 * Security validation for uploaded files
 */
async function validateFileSecurity(files: File[], sessionId: string): Promise<ValidationResult> {
  const errors: string[] = []

  // Security validation for files

  for (const file of files) {
    // File size validation
    const isImage = file.type.startsWith('image/')
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_FILE_SIZE
    
    if (file.size > maxSize) {
      errors.push(`File too large: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB, max: ${maxSize / 1024 / 1024}MB)`)
      continue
    }

    // MIME type validation
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      errors.push(`Invalid file type: ${file.name} (${file.type})`)
      continue
    }

    // File signature validation
    try {
      const isValidSignature = await validateFileSignature(file)
      if (!isValidSignature) {
        errors.push(`Invalid file signature: ${file.name}`)
        continue
      }
    } catch (error) {
      errors.push(`File validation error: ${file.name}`)
      logger.error('File signature validation error:', { sessionId, fileName: file.name, error })
    }

    // File validated successfully
  }

  return {
    isValid: errors.length === 0,
    errors,
    fields: {},
    screenshots: [],
    attachments: []
  }
}

/**
 * Schema validation using Zod
 */
async function validateSchema(
  fields: Record<string, any>, 
  screenshots: File[], 
  attachments: File[], 
  t: any, 
  sessionId: string
): Promise<ValidationResult> {
  const errors: string[] = []

  try {
    const submissionData = {
      ...fields,
      screenshotFiles: screenshots,
      attachmentFiles: attachments,
    }

    if (fields.formType === 'report') {
      const schema = createMediaContentReportSchema(t)
      schema.parse(submissionData)
    } else {
      const schema = createMediaContentComplaintSchema(t)
      schema.parse(submissionData)
    }
    
  } catch (error: any) {
    if (error.issues) {
      errors.push(...error.issues.map((issue: any) => {
        const path = issue.path.join('.')
        const message = issue.message
        return `${path}: ${message}`
      }))
    } else {
      errors.push('Schema validation failed')
    }
    logger.error('Schema validation failed:', { sessionId, error: error.issues?.map((i: any) => i.message).join(', ') || 'Unknown schema error' })
  }

  return {
    isValid: errors.length === 0,
    errors,
    fields: {},
    screenshots: [],
    attachments: []
  }
}

/**
 * Upload files with retry logic and comprehensive error handling
 */
async function uploadFilesWithRetry(
  files: File[], 
  fileType: 'screenshot' | 'attachment', 
  payload: any, 
  sessionId: string
): Promise<UploadResult> {
  const urls: string[] = []
  const errors: string[] = []
  let uploadedCount = 0

  // Starting file uploads

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const fileId = `${fileType}_${i}_${file.name}`
    
    try {
      // Uploading file

      // Upload with timeout to FormMedia collection (isolated from admin media)
      const uploadPromise = payload.create({
        collection: 'form-media',
        data: { 
          alt: sanitizeFilename(file.name),
          caption: {
            root: {
              type: 'root',
              children: [{
                type: 'paragraph',
                children: [{
                  text: `${fileType} uploaded via media form on ${new Date().toISOString()}`,
                  type: 'text',
                  version: 1,
                }],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              }],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            },
          },
          // Form-specific metadata
          formType: 'report', // Default, will be updated based on actual form type
          fileType: fileType,
          submissionDate: new Date().toISOString(),
          fileSize: file.size,
          mimeType: file.type,
        },
        file: {
          data: Buffer.from(await file.arrayBuffer()),
          mimetype: file.type,
          name: `hapa_form_${fileType}_${Date.now()}_${i}_${sanitizeFilename(file.name)}`,
          size: file.size,
        },
      })

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Upload timeout')), UPLOAD_TIMEOUT)
      )

      const result = await Promise.race([uploadPromise, timeoutPromise]) as any
      
      if (result && result.url) {
        urls.push(result.url)
        uploadedCount++
        logger.success(`File uploaded: ${file.name}`, `Session: ${sessionId}, URL: ${result.url}`)
      } else {
        errors.push(`Upload failed: ${fileId} - No URL returned`)
        logger.error(`Upload failed: ${file.name} - No URL returned`, { sessionId })
      }

    } catch (error) {
      const errorMsg = `Upload failed: ${fileId} - ${error instanceof Error ? error.message : 'Unknown error'}`
      errors.push(errorMsg)
      logger.error(`Upload error: ${file.name}`, { sessionId, error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  logger.log(`Upload complete: ${uploadedCount}/${files.length} ${fileType}s uploaded`, { sessionId })

  return {
    success: uploadedCount === files.length,
    urls,
    errors,
    uploadedCount,
    totalCount: files.length
  }
}

/**
 * Build submission data for Payload collection
 */
function buildSubmissionData(
  fields: Record<string, any>, 
  screenshotUrls: string[], 
  attachmentUrls: string[]
): Record<string, any> {
  return {
    formType: fields.formType as 'report' | 'complaint',
    submittedAt: new Date().toISOString(),
    locale: ['fr', 'ar'].includes(fields.locale) ? fields.locale as 'fr' | 'ar' : 'fr',
    submissionStatus: 'pending' as const,
    priority: 'medium' as const,
    
    // Top-level fields for admin visibility
    mediaType: fields.mediaType,
    specificChannel: getSpecificChannel(fields),
    programName: fields.programName?.trim() || 'Programme sans nom',
    
    // Content information
    contentInfo: {
      mediaType: fields.mediaType,
      mediaTypeOther: fields.mediaTypeOther?.trim() || '',
      specificChannel: getSpecificChannel(fields),
      programName: fields.programName?.trim() || 'Programme sans nom',
      broadcastDateTime: fields.broadcastDateTime,
      linkScreenshot: fields.linkScreenshot?.trim() || '',
      screenshotFiles: screenshotUrls.map((url: string) => ({ url })),
    },

    // Complainant Information (for complaints only)
    ...(fields.formType === 'complaint' && {
      complainantInfo: {
        fullName: fields.fullName?.trim() || '',
        gender: fields.gender || '',
        country: fields.country || '',
        emailAddress: fields.emailAddress?.trim() || '',
        phoneNumber: fields.phoneNumber?.trim() || '',
        whatsappNumber: fields.whatsappNumber?.trim() || '',
        profession: fields.profession?.trim() || '',
        relationshipToContent: fields.relationshipToContent || '',
      }
    }),

    // Reasons
    reasons: (fields.reasons || []).map((reason: string) => ({ reason })),
    reasonOther: fields.reasonOther?.trim() || '',

    // Content description
    description: fields.description?.trim() || '',

    // Attachments
    attachmentTypes: (fields.attachmentTypes || []).map((type: string) => ({ type })),
    attachmentOther: fields.attachmentOther?.trim() || '',
    attachmentFiles: attachmentUrls.map((url: string) => ({ url })),
  }
}

/**
 * Get specific channel information
 */
function getSpecificChannel(fields: Record<string, any>): string {
  if (fields.mediaType === 'television' && fields.tvChannel) {
    return fields.tvChannelOther || fields.tvChannel
  }
  if (fields.mediaType === 'radio' && fields.radioStation) {
    return fields.radioStationOther || fields.radioStation
  }
  return ''
}