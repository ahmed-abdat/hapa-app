/**
 * Form File Upload Utilities
 * 
 * Handles file uploads on form submission
 * Files are uploaded to R2 only when the form is actually submitted
 */

import { uploadFileWithRetry } from './file-upload'
import { logger } from '@/utilities/logger'
import { UPLOAD_RETRY_CONFIG } from './constants'

export interface FormFileUploadResult {
  success: boolean
  uploadedUrls: string[]
  failedFiles: Array<{
    fileName: string
    error: string
  }>
}

/**
 * Upload files when form is submitted
 * This function should be called from the form submission handler
 * 
 * @param files - Array of File objects to upload
 * @param fileType - Type of files being uploaded
 * @returns Object containing uploaded URLs and any failures
 */
export async function uploadFilesOnSubmit(
  files: File[],
  fileType: 'screenshot' | 'attachment' = 'attachment'
): Promise<FormFileUploadResult> {
  const sessionId = `FORM_SUBMIT_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
  
  logger.info('📤 Starting form file uploads', {
    component: 'FormFileUpload',
    action: 'upload_start',
    sessionId,
    metadata: {
      fileCount: files.length,
      fileType,
      totalSize: files.reduce((sum, f) => sum + f.size, 0)
    }
  })

  const uploadedUrls: string[] = []
  const failedFiles: Array<{ fileName: string; error: string }> = []

  // Upload files in parallel for better performance
  const uploadPromises = files.map(async (file, index) => {
    try {
      logger.info(`⬆️ Uploading file ${index + 1}/${files.length}`, {
        component: 'FormFileUpload',
        action: 'file_upload',
        sessionId,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          fileIndex: index
        }
      })

      // Upload with retry mechanism
      const result = await uploadFileWithRetry(
        file,
        UPLOAD_RETRY_CONFIG.MAX_RETRIES, // Use centralized retry config
        (attemptCount, delay) => {
          logger.info('🔄 Upload retry', {
            component: 'FormFileUpload',
            action: 'retry',
            sessionId,
            metadata: {
              fileName: file.name,
              attemptCount,
              retryDelay: delay
            }
          })
        },
        { 
          fileType, 
          fileIndex: `form_file_${index}`,
          skipValidation: true // Files were already validated in the component
        }
      )

      if (result.success && result.url) {
        logger.info('✅ File uploaded successfully', {
          component: 'FormFileUpload',
          action: 'upload_success',
          sessionId,
          metadata: {
            fileName: file.name,
            uploadUrl: result.url,
            fileIndex: index
          }
        })
        return { success: true, url: result.url, fileName: file.name, index }
      } else {
        const error = result.error || 'Upload failed'
        logger.error('❌ File upload failed', {
          component: 'FormFileUpload',
          action: 'upload_failed',
          sessionId,
          metadata: {
            fileName: file.name,
            error: error,
            fileIndex: index
          }
        })
        return { success: false, error, fileName: file.name, index }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      logger.error('❌ File upload error', {
        component: 'FormFileUpload',
        action: 'upload_error',
        sessionId,
        error: errorMessage,
        metadata: {
          fileName: file.name,
          fileIndex: index
        }
      })
      return { success: false, error: errorMessage, fileName: file.name, index }
    }
  })

  // Wait for all uploads to complete
  const uploadResults = await Promise.all(uploadPromises)
  
  // Process results in order
  uploadResults.forEach((result) => {
    if (result.success) {
      uploadedUrls.push(result.url!)
    } else {
      failedFiles.push({
        fileName: result.fileName,
        error: result.error!
      })
    }
  })

  const result: FormFileUploadResult = {
    success: failedFiles.length === 0,
    uploadedUrls,
    failedFiles
  }

  logger.info('📊 Form file uploads completed', {
    component: 'FormFileUpload',
    action: 'upload_complete',
    sessionId,
    metadata: {
      totalFiles: files.length,
      successCount: uploadedUrls.length,
      failureCount: failedFiles.length,
      success: result.success,
      uploadMode: 'parallel'
    }
  })

  return result
}

/**
 * Clean up blob URLs when component unmounts or files are removed
 * 
 * @param urls - Array of blob URLs to revoke
 */
export function cleanupBlobUrls(urls: string[]) {
  urls.forEach(url => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  })
}

/**
 * Convert File array to FormData for API submission
 * 
 * @param files - Array of File objects
 * @param fieldName - FormData field name for files
 * @returns FormData object ready for submission
 */
export function filesToFormData(files: File[], fieldName: string = 'files'): FormData {
  const formData = new FormData()
  
  files.forEach((file, index) => {
    formData.append(`${fieldName}[${index}]`, file)
  })
  
  return formData
}