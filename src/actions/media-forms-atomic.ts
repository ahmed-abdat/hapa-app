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
import { sanitizeFilename } from '@/lib/file-upload'
import { 
  validateMultipleFilesProduction, 
  createProductionValidationSummary,
} from '@/lib/production-file-validation'

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
const MAX_FILES_PER_TYPE = 8
const UPLOAD_TIMEOUT = 60000 // 60 seconds for larger files
const ORPHAN_EXPIRY_HOURS = 24 // Files expire after 24 hours if not confirmed

interface FormValidationResult {
  isValid: boolean
  errors: string[]
  fields: Record<string, any>
  screenshots: File[]
  attachments: File[]
  screenshotUrls: string[]
  attachmentUrls: string[]
}

interface UploadResult {
  success: boolean
  urls: string[]
  fileIds: string[]
  errors: string[]
  uploadedCount: number
  totalCount: number
}

/**
 * Atomic Server Action for media form submissions
 * Uses database transactions to ensure data consistency
 */
export async function submitMediaFormActionAtomic(formData: FormData): Promise<FormSubmissionResponse> {
  const startTime = Date.now()
  const sessionId = `SA_ATOMIC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  logger.info('🔄 Starting atomic form submission', { sessionId })

  // Initialize Payload
  const payload = await getPayload({ config })
  
  // Initialize transaction variables
  let transactionID: string | undefined
  const uploadedFileIds: string[] = []
  
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

    const { fields, screenshots, attachments, screenshotUrls, attachmentUrls } = validation
    
    // Phase 2: Security Validation for all files
    const allFiles = [...screenshots, ...attachments]
    const securityValidation = await validateFilesWithProductionStandards(allFiles, sessionId)
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

    // Phase 4: BEGIN ATOMIC TRANSACTION
    // Based on research: Use payload.db transaction API with proper parameter passing
    transactionID = await payload.db.beginTransaction()
    logger.info('🔒 Transaction started', { sessionId, transactionID })

    try {
      // Step 1: Create submission record FIRST (within transaction)
      // Include idempotency key for duplicate prevention
      const idempotencyKey = `${fields.formType}_${sessionId}_${Date.now()}`
      const initialSubmissionData = {
        ...buildSubmissionData(fields, [], []),
        idempotencyKey,
        status: 'pending' // Start as pending per research recommendation
      }
      
      // Check for duplicate submission using idempotency key
      const existingSubmission = await payload.find({
        collection: 'media-content-submissions',
        where: {
          idempotencyKey: {
            equals: idempotencyKey
          }
        },
        limit: 1
      })
      
      if (existingSubmission.docs.length > 0) {
        logger.warn('Duplicate submission detected', { sessionId, idempotencyKey })
        return {
          success: true,
          message: 'Submission already processed',
          submissionId: existingSubmission.docs[0].id.toString()
        }
      }
      
      const submission = await payload.create({
        collection: 'media-content-submissions',
        data: initialSubmissionData as any,
        locale: 'fr',
        overrideAccess: true, // Per research: ensure transaction works
        transaction: transactionID // Correct parameter name per research
      })
      
      logger.info('✅ Submission record created', { 
        sessionId, 
        submissionId: submission.id,
        transactionID 
      })

      // Step 2: Upload files with submission reference
      const screenshotUpload = await uploadFilesWithSubmissionReference(
        screenshots, 
        'screenshot', 
        submission.id.toString(),
        payload, 
        sessionId,
        transactionID
      )
      
      const attachmentUpload = await uploadFilesWithSubmissionReference(
        attachments, 
        'attachment', 
        submission.id.toString(),
        payload, 
        sessionId,
        transactionID
      )

      // Collect all uploaded file IDs for potential cleanup
      uploadedFileIds.push(...screenshotUpload.fileIds, ...attachmentUpload.fileIds)

      // Check upload results
      const totalUploadErrors = [...screenshotUpload.errors, ...attachmentUpload.errors]
      if (totalUploadErrors.length > 0) {
        logger.error('❌ Upload errors detected:', { sessionId, errors: totalUploadErrors })
        
        const totalFiles = screenshots.length + attachments.length
        const totalUploaded = screenshotUpload.uploadedCount + attachmentUpload.uploadedCount
        
        if (totalUploaded === 0 && totalFiles > 0) {
          // Complete upload failure - rollback
          throw new Error('All file uploads failed. Please check your files and try again.')
        }
        // Partial uploads are acceptable, continue with available files
        logger.warn(`⚠️ Partial upload success: ${totalUploaded}/${totalFiles} files`, { sessionId })
      }

      // Step 3: Update submission with file URLs (within transaction)
      const allScreenshotUrls = [...screenshotUrls, ...screenshotUpload.urls]
      const allAttachmentUrls = [...attachmentUrls, ...attachmentUpload.urls]
      
      await payload.update({
        collection: 'media-content-submissions',
        id: submission.id,
        data: {
          'contentInfo.screenshotFiles': allScreenshotUrls.map(url => ({ url })),
          'attachmentFiles': allAttachmentUrls.map(url => ({ url }))
        } as any,
        locale: 'fr',
        overrideAccess: true,
        transaction: transactionID // Use correct parameter per research
      })

      // Step 4: Update submission status to complete within transaction
      await payload.update({
        collection: 'media-content-submissions',
        id: submission.id,
        data: {
          status: 'complete' // Mark as complete after successful file uploads
        } as any,
        locale: 'fr',
        overrideAccess: true,
        transaction: transactionID
      })

      // Step 5: COMMIT TRANSACTION
      await payload.db.commitTransaction(transactionID)
      logger.info('✅ Transaction committed successfully', { sessionId, transactionID })
      
      // Step 5: Mark uploaded files as confirmed (outside transaction for performance)
      if (uploadedFileIds.length > 0) {
        await confirmUploadedFiles(uploadedFileIds, payload, sessionId)
      }

      // Phase 5: Success Response
      const totalTime = Date.now() - startTime
      logger.info('✅ Atomic form submission completed', { 
        sessionId, 
        submissionId: submission.id,
        totalTime: `${totalTime}ms`
      })

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

    } catch (innerError) {
      // ROLLBACK TRANSACTION on any error
      if (transactionID) {
        logger.warn('⚠️ Rolling back transaction', { sessionId, transactionID })
        await payload.db.rollbackTransaction(transactionID)
      }
      
      // Cleanup any uploaded files
      if (uploadedFileIds.length > 0) {
        await cleanupOrphanedFiles(uploadedFileIds, payload, sessionId)
      }
      
      throw innerError
    }

  } catch (error) {
    const totalTime = Date.now() - startTime
    
    logger.error('❌ Atomic form submission failed:', { 
      sessionId, 
      error: error instanceof Error ? error.message : 'Unknown error',
      totalTime: `${totalTime}ms`
    })
    
    // Production error response (don't expose internal details)
    return {
      success: false,
      message: error instanceof Error && error.message.includes('validation') 
        ? error.message 
        : 'A system error occurred. Please try again or contact support if the problem persists.',
      errorId: sessionId // Provide error ID for support tracking
    }
  }
}

/**
 * Upload files with submission reference and transaction support
 */
async function uploadFilesWithSubmissionReference(
  files: File[], 
  fileType: 'screenshot' | 'attachment',
  submissionId: string,
  payload: any, 
  sessionId: string,
  transactionID?: string
): Promise<UploadResult> {
  const urls: string[] = []
  const fileIds: string[] = []
  const errors: string[] = []
  let uploadedCount = 0

  logger.info(`📤 Uploading ${files.length} ${fileType} files`, { 
    sessionId, 
    submissionId,
    transactionID 
  })

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const fileId = `${fileType}_${i}_${file.name}`
    
    try {
      // Calculate expiry date for orphan cleanup
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + ORPHAN_EXPIRY_HOURS)

      // Upload with timeout and transaction support
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
                  text: `${fileType} uploaded via media form submission ${submissionId}`,
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
          // Atomic fields
          submissionId: submissionId,
          uploadStatus: 'staging', // Start as staging
          expiresAt: expiresAt.toISOString(),
          // Form metadata
          formType: 'report', // Will be updated based on actual form type
          fileType: fileType,
          submissionDate: new Date().toISOString(),
          fileSize: file.size,
          mimeType: file.type,
        },
        file: {
          data: Buffer.from(await file.arrayBuffer()),
          mimetype: file.type,
          name: `hapa_form_${fileType}_${submissionId}_${i}_${sanitizeFilename(file.name)}`,
          size: file.size,
        },
        overrideAccess: true,
        transaction: transactionID // Use correct parameter format per research
      })

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Upload timeout')), UPLOAD_TIMEOUT)
      )

      const result = await Promise.race([uploadPromise, timeoutPromise]) as any
      
      if (result && result.url) {
        urls.push(result.url)
        fileIds.push(result.id)
        uploadedCount++
        logger.info(`✅ File uploaded`, { 
          sessionId, 
          fileId: result.id,
          fileName: file.name 
        })
      } else {
        errors.push(`Upload failed: ${fileId} - No URL returned`)
        logger.error(`Upload failed: ${file.name} - No URL returned`, { sessionId })
      }

    } catch (error) {
      const errorMsg = `Upload failed: ${fileId} - ${error instanceof Error ? error.message : 'Unknown error'}`
      errors.push(errorMsg)
      logger.error(`Upload error: ${file.name}`, { 
        sessionId, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    }
  }

  return {
    success: uploadedCount === files.length,
    urls,
    fileIds,
    errors,
    uploadedCount,
    totalCount: files.length
  }
}

/**
 * Mark uploaded files as confirmed after successful transaction
 */
async function confirmUploadedFiles(
  fileIds: string[], 
  payload: any, 
  sessionId: string
): Promise<void> {
  logger.info(`✅ Confirming ${fileIds.length} uploaded files`, { sessionId })
  
  for (const fileId of fileIds) {
    try {
      await payload.update({
        collection: 'form-media',
        id: fileId,
        data: {
          uploadStatus: 'confirmed',
          expiresAt: null // Remove expiry for confirmed files
        }
      })
    } catch (error) {
      logger.warn(`Failed to confirm file ${fileId}:`, error)
      // Non-critical error, continue with other files
    }
  }
}

/**
 * Cleanup orphaned files after transaction rollback
 */
async function cleanupOrphanedFiles(
  fileIds: string[], 
  payload: any, 
  sessionId: string
): Promise<void> {
  logger.warn(`🗑️ Cleaning up ${fileIds.length} orphaned files`, { sessionId })
  
  for (const fileId of fileIds) {
    try {
      // Delete will trigger R2 cleanup hook
      await payload.delete({
        collection: 'form-media',
        id: fileId
      })
      logger.info(`Deleted orphaned file ${fileId}`)
    } catch (error) {
      logger.error(`Failed to cleanup file ${fileId}:`, error)
      // Mark as orphaned for later cleanup
      try {
        await payload.update({
          collection: 'form-media',
          id: fileId,
          data: {
            uploadStatus: 'orphaned'
          }
        })
      } catch (updateError) {
        logger.error(`Failed to mark file as orphaned ${fileId}:`, updateError)
      }
    }
  }
}

// Re-use existing validation functions from original file
async function validateAndExtractData(formData: FormData, sessionId: string): Promise<FormValidationResult> {
  const errors: string[] = []
  const fields: Record<string, any> = {}
  const screenshots: File[] = []
  const attachments: File[] = []
  const screenshotUrls: string[] = []
  const attachmentUrls: string[] = []

  // Process FormData entries
  for (const [key, value] of formData.entries()) {
    if (key === 'screenshotFiles') {
      if (isFileObject(value)) {
        if (value.size === 0) {
          errors.push(`Empty screenshot file: ${value.name}`)
          continue
        }
        if (screenshots.length >= MAX_FILES_PER_TYPE) {
          errors.push(`Too many screenshot files (max: ${MAX_FILES_PER_TYPE})`)
          continue
        }
        screenshots.push(value as File)
      } else if (typeof value === 'string' && value.trim() !== '') {
        screenshotUrls.push(value.trim())
      }
    } else if (key === 'attachmentFiles') {
      if (isFileObject(value)) {
        if (value.size === 0) {
          errors.push(`Empty attachment file: ${value.name}`)
          continue
        }
        if (attachments.length >= MAX_FILES_PER_TYPE) {
          errors.push(`Too many attachment files (max: ${MAX_FILES_PER_TYPE})`)
          continue
        }
        attachments.push(value as File)
      } else if (typeof value === 'string' && value.trim() !== '') {
        attachmentUrls.push(value.trim())
      }
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
      // Handle boolean fields
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

  return {
    isValid: errors.length === 0,
    errors,
    fields,
    screenshots,
    attachments,
    screenshotUrls,
    attachmentUrls
  }
}

/**
 * Production security validation for uploaded files
 */
async function validateFilesWithProductionStandards(
  files: File[], 
  sessionId: string
): Promise<FormValidationResult> {
  logger.info('🔍 Starting production file validation', { sessionId, fileCount: files.length })

  try {
    const validationResults = await validateMultipleFilesProduction(files)
    const summary = createProductionValidationSummary(validationResults)
    
    const errors: string[] = []
    validationResults.forEach((result, index) => {
      if (!result.isValid) {
        const fileName = files[index]?.name || `file_${index}`
        if (result.error) {
          errors.push(`${fileName}: ${result.error}`)
        }
      }
    })
    
    const isValid = summary.invalidFiles === 0
    
    if (!isValid) {
      logger.error('❌ Production file validation failed', { 
        sessionId, 
        invalidFiles: summary.invalidFiles 
      })
    }
    
    return {
      isValid,
      errors,
      fields: {},
      screenshots: [],
      attachments: [],
      screenshotUrls: [],
      attachmentUrls: []
    }
  } catch (error) {
    logger.error('❌ Production file validation error', { sessionId, error })
    return {
      isValid: false,
      errors: [`Production validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      fields: {},
      screenshots: [],
      attachments: [],
      screenshotUrls: [],
      attachmentUrls: []
    }
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
): Promise<FormValidationResult> {
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
    logger.error('Schema validation failed:', { sessionId, errors })
  }

  return {
    isValid: errors.length === 0,
    errors,
    fields: {},
    screenshots: [],
    attachments: [],
    screenshotUrls: [],
    attachmentUrls: []
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