/**
 * FormFileUploadService - Reusable file upload service for forms
 * 
 * Provides consistent file upload handling across all forms with:
 * - Dual File/URL support for backward compatibility
 * - Progress tracking and error handling
 * - Logging and validation
 * - Type safety
 */

import { uploadFilesOnSubmit } from '@/lib/form-file-upload'
import { logger } from '@/utilities/logger'

export interface FileUploadField {
  files: File[] | string[]
  fieldName: string
  fileType: 'screenshot' | 'attachment'
}

export interface FileUploadProgress {
  setSubmissionProgress: (progress: number) => void
  setSubmissionStage: (stage: 'preparing' | 'uploading' | 'validating' | 'saving' | 'complete' | 'error') => void
  setSubmissionError: (error: string | undefined) => void
  setIsSubmitting: (isSubmitting: boolean) => void
}

export interface FileUploadResult {
  success: boolean
  uploadedUrls: Record<string, string[]>
  errors: string[]
}

export class FormFileUploadService {
  private sessionId: string
  private progressHandlers: FileUploadProgress

  constructor(sessionId: string, progressHandlers: FileUploadProgress) {
    this.sessionId = sessionId
    this.progressHandlers = progressHandlers
  }

  /**
   * Process multiple file fields with progress tracking
   */
  async processFileFields(fields: FileUploadField[]): Promise<FileUploadResult> {
    const result: FileUploadResult = {
      success: true,
      uploadedUrls: {},
      errors: []
    }

    if (fields.length === 0) {
      return result
    }

    const totalFields = fields.length
    let completedFields = 0

    try {
      for (const field of fields) {
        if (Array.isArray(field.files) && field.files.length > 0) {
          const fieldResult = await this.processFileField(field, completedFields, totalFields)
          
          if (fieldResult.success) {
            result.uploadedUrls[field.fieldName] = fieldResult.urls
          } else {
            result.success = false
            result.errors.push(`${field.fieldName}: ${fieldResult.error}`)
          }
        } else {
          // Empty field - set empty array
          result.uploadedUrls[field.fieldName] = []
        }

        completedFields++
      }

      if (result.success) {
        logger.info('✅ All file uploads completed', {
          component: 'FormFileUploadService',
          action: 'upload_complete',
          sessionId: this.sessionId,
          metadata: {
            uploadedFields: Object.keys(result.uploadedUrls).length,
            totalUrls: Object.values(result.uploadedUrls).flat().length
          }
        })
      }

    } catch (error) {
      result.success = false
      result.errors.push(error instanceof Error ? error.message : 'Unknown upload error')
      
      logger.error('❌ File upload service failed:', {
        component: 'FormFileUploadService',
        action: 'upload_error',
        sessionId: this.sessionId,
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      })

      this.progressHandlers.setSubmissionError(result.errors.join('; '))
      this.progressHandlers.setSubmissionStage('error')
      this.progressHandlers.setIsSubmitting(false)
    }

    return result
  }

  /**
   * Process a single file field (internal method)
   */
  private async processFileField(
    field: FileUploadField, 
    fieldIndex: number, 
    totalFields: number
  ): Promise<{ success: boolean; urls: string[]; error?: string }> {
    
    // Check if files are File objects (new workflow) or URLs (old workflow)
    if (field.files[0] instanceof File) {
      // New workflow: upload files to R2
      logger.info(`📁 Uploading ${field.fieldName} files`, {
        component: 'FormFileUploadService',
        action: 'field_upload_start',
        sessionId: this.sessionId,
        metadata: {
          fieldName: field.fieldName,
          count: field.files.length,
          fileType: field.fileType
        }
      })

      this.progressHandlers.setSubmissionStage('uploading')
      const baseProgress = 25 + (fieldIndex * 25)
      this.progressHandlers.setSubmissionProgress(baseProgress)

      const uploadResult = await uploadFilesOnSubmit(field.files as File[], field.fileType)

      if (!uploadResult.success || uploadResult.uploadedUrls.length === 0) {
        const errorMessage = `${field.fieldName} upload failed: ${uploadResult.uploadedUrls.length === 0 ? 'No files uploaded' : 'Upload failed'}`
        return { success: false, urls: [], error: errorMessage }
      }

      // Update progress for this field
      const progressIncrement = 25 / totalFields
      this.progressHandlers.setSubmissionProgress(baseProgress + progressIncrement)

      return { success: true, urls: uploadResult.uploadedUrls }

    } else {
      // Old workflow: URLs already provided
      logger.info(`🔗 Using existing URLs for ${field.fieldName}`, {
        component: 'FormFileUploadService',
        action: 'existing_urls',
        sessionId: this.sessionId,
        metadata: {
          fieldName: field.fieldName,
          count: field.files.length
        }
      })

      return { success: true, urls: field.files as string[] }
    }
  }

  /**
   * Validate uploaded URLs
   */
  validateUploadedUrls(uploadedUrls: Record<string, string[]>): string[] {
    const errors: string[] = []

    Object.entries(uploadedUrls).forEach(([fieldName, urls]) => {
      urls.forEach((url, index) => {
        // Accept both relative URLs (starting with /) and absolute URLs (starting with http)
        // Relative URLs are valid for same-domain file uploads
        if (!url || typeof url !== 'string' || (!url.startsWith('http') && !url.startsWith('/'))) {
          const error = `${fieldName} ${index + 1} has invalid URL: ${url}`
          errors.push(error)
          logger.error('Invalid URL:', {
            component: 'FormFileUploadService',
            action: 'url_validation_error',
            sessionId: this.sessionId,
            metadata: {
              fieldName,
              index: index + 1,
              url
            }
          })
        }
      })
    })

    return errors
  }

  /**
   * Create submission data with uploaded URLs
   */
  createSubmissionData<T extends Record<string, any>>(
    originalData: T,
    uploadedUrls: Record<string, string[]>,
    additionalData: Record<string, any> = {}
  ): T {
    return {
      ...originalData,
      ...uploadedUrls,
      ...additionalData
    }
  }

  /**
   * Log form submission details
   */
  logFormSubmission(formType: string, uploadedUrls: Record<string, string[]>): void {
    const summary = Object.entries(uploadedUrls).reduce((acc, [fieldName, urls]) => {
      acc[fieldName] = urls.length
      return acc
    }, {} as Record<string, number>)

    logger.formSubmission(formType, {
      sessionId: this.sessionId,
      ...summary,
      totalFiles: Object.values(uploadedUrls).flat().length
    })
  }
}

/**
 * Convenience function for simple single-field uploads
 */
export async function uploadSingleFileField(
  files: File[] | string[],
  fieldName: string,
  fileType: 'screenshot' | 'attachment',
  sessionId: string
): Promise<{ success: boolean; urls: string[]; error?: string }> {
  
  if (!Array.isArray(files) || files.length === 0) {
    return { success: true, urls: [] }
  }

  // Check if files are File objects (new workflow) or URLs (old workflow)
  if (files[0] instanceof File) {
    logger.info(`📁 Uploading ${fieldName} files`, {
      component: 'FormFileUploadService',
      action: 'single_field_upload',
      sessionId,
      metadata: {
        fieldName,
        count: files.length,
        fileType
      }
    })

    const uploadResult = await uploadFilesOnSubmit(files as File[], fileType)

    if (!uploadResult.success || uploadResult.uploadedUrls.length === 0) {
      const errorMessage = `${fieldName} upload failed`
      return { success: false, urls: [], error: errorMessage }
    }

    return { success: true, urls: uploadResult.uploadedUrls }

  } else {
    // Old workflow: URLs already provided
    logger.info(`🔗 Using existing URLs for ${fieldName}`, {
      component: 'FormFileUploadService',
      action: 'single_field_existing',
      sessionId,
      metadata: {
        fieldName,
        count: files.length
      }
    })

    return { success: true, urls: files as string[] }
  }
}