/**
 * MediaContentSubmissions cleanup hook
 * Handles cascade deletion of associated FormMedia files when a submission is deleted
 */

import type { CollectionBeforeDeleteHook } from 'payload'
import { bulkDeleteFromR2 } from '@/collections/FormMedia/hooks/deleteFromR2'
import { logger } from '@/utilities/logger'

/**
 * Extract all file URLs from submission data structure
 */
function extractFileUrls(data: any): string[] {
  const urls: string[] = []
  
  // Check contentInfo.screenshotFiles
  if (data.contentInfo?.screenshotFiles && Array.isArray(data.contentInfo.screenshotFiles)) {
    data.contentInfo.screenshotFiles.forEach((item: any) => {
      if (item?.url && typeof item.url === 'string') {
        urls.push(item.url)
      }
    })
  }
  
  // Check attachmentFiles
  if (data.attachmentFiles && Array.isArray(data.attachmentFiles)) {
    data.attachmentFiles.forEach((item: any) => {
      if (item?.url && typeof item.url === 'string') {
        urls.push(item.url)
      }
    })
  }
  
  return urls
}

/**
 * Extract filename from FormMedia URL
 * URLs are like: /api/form-media/file/hapa_form_screenshot_1234567890_0.jpg
 */
function extractFilenameFromUrl(url: string): string | null {
  try {
    // Handle both full URLs and relative paths
    const cleanUrl = url.startsWith('http') ? new URL(url).pathname : url
    
    // Extract filename from path like /api/form-media/file/filename.ext
    const pathParts = cleanUrl.split('/')
    const filename = pathParts[pathParts.length - 1]
    
    if (filename && filename.includes('.')) {
      return filename
    }
    
    return null
  } catch (error) {
    logger.warn('⚠️ Failed to extract filename from URL', {
      component: 'MediaCleanup',
      action: 'filename_extraction_failed',
      metadata: { url, error: error instanceof Error ? error.message : 'Unknown error' }
    })
    return null
  }
}

/**
 * Cleanup FormMedia files associated with a MediaContentSubmission
 */
export const cleanupFormMediaHook: CollectionBeforeDeleteHook = async ({
  req,
  id,
}) => {
  const submissionId = id.toString()
  
  try {
    logger.info('🧹 Starting FormMedia cleanup for submission', {
      component: 'MediaSubmissionCleanup',
      action: 'cleanup_start', 
      metadata: { submissionId }
    })

    // Strategy 1: Find FormMedia by submissionId (most reliable)
    const relatedMediaBySubmissionId = await req.payload.find({
      collection: 'form-media',
      where: {
        submissionId: {
          equals: submissionId,
        },
      },
      limit: 1000, // Adjust based on expected file count per submission
      showHiddenFields: true,
    })

    // Strategy 2: Also get the submission to extract file URLs as backup
    let submissionData: any = null
    try {
      submissionData = await req.payload.findByID({
        collection: 'media-content-submissions',
        id: submissionId,
        showHiddenFields: true,
      })
    } catch (error) {
      logger.warn('⚠️ Could not fetch submission data for URL extraction', {
        component: 'MediaSubmissionCleanup',
        action: 'submission_fetch_failed',
        metadata: { submissionId, error: error instanceof Error ? error.message : 'Unknown error' }
      })
    }

    // Collect all filenames to delete
    const filenamesToDelete = new Set<string>()

    // Add files found by submissionId
    relatedMediaBySubmissionId.docs.forEach(doc => {
      if (doc.filename) {
        filenamesToDelete.add(doc.filename)
      }
    })

    // Add files found by URL extraction (backup method)
    if (submissionData) {
      const extractedUrls = extractFileUrls(submissionData)
      extractedUrls.forEach(url => {
        const filename = extractFilenameFromUrl(url)
        if (filename) {
          filenamesToDelete.add(filename)
        }
      })
    }

    const totalFiles = filenamesToDelete.size
    const dbRecords = relatedMediaBySubmissionId.docs.length

    logger.info('📊 FormMedia cleanup analysis', {
      component: 'MediaSubmissionCleanup',
      action: 'cleanup_analysis',
      metadata: {
        submissionId,
        dbRecords,
        totalFiles,
        foundBySubmissionId: relatedMediaBySubmissionId.docs.length,
        foundByUrlExtraction: submissionData ? extractFileUrls(submissionData).length : 0,
      }
    })

    if (totalFiles === 0) {
      logger.info('✅ No FormMedia files to cleanup', {
        component: 'MediaSubmissionCleanup',
        action: 'cleanup_complete_no_files',
        metadata: { submissionId }
      })
      return
    }

    // Phase 1: Bulk delete files from R2
    const filenames = Array.from(filenamesToDelete)
    const r2Result = await bulkDeleteFromR2(filenames, submissionId)

    // Phase 2: Delete FormMedia database records
    let deletedRecords = 0
    let failedRecords = 0
    const recordErrors: string[] = []

    if (relatedMediaBySubmissionId.docs.length > 0) {
      const deletionPromises = relatedMediaBySubmissionId.docs.map(async (doc) => {
        try {
          await req.payload.delete({
            collection: 'form-media',
            id: doc.id,
            context: {
              skipR2Cleanup: true, // We already cleaned up R2 files above
            },
          })
          deletedRecords++
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          recordErrors.push(`${doc.id}: ${errorMessage}`)
          failedRecords++
          
          logger.error('❌ Failed to delete FormMedia database record', {
            component: 'MediaSubmissionCleanup',
            action: 'record_deletion_failed',
            metadata: {
              submissionId,
              recordId: doc.id,
              filename: doc.filename,
              error: errorMessage,
            }
          })
        }
      })

      await Promise.allSettled(deletionPromises)
    }

    // Final report
    const hasErrors = r2Result.failed > 0 || failedRecords > 0
    const logLevel = hasErrors ? 'warn' : 'info'
    const icon = hasErrors ? '⚠️' : '✅'

    logger[logLevel](`${icon} FormMedia cleanup completed`, {
      component: 'MediaSubmissionCleanup',
      action: 'cleanup_complete',
      metadata: {
        submissionId,
        r2Files: {
          deleted: r2Result.deleted,
          failed: r2Result.failed,
          errors: r2Result.errors,
        },
        dbRecords: {
          deleted: deletedRecords,
          failed: failedRecords,
          errors: recordErrors,
        },
        totals: {
          totalFiles,
          dbRecords,
        }
      }
    })

    // Don't throw errors - allow submission deletion to proceed
    // This prevents database inconsistency issues

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    logger.error('❌ Critical error in FormMedia cleanup hook', {
      component: 'MediaSubmissionCleanup',
      action: 'cleanup_critical_error',
      metadata: {
        submissionId,
        error: errorMessage,
      }
    })

    // Don't throw - allow submission deletion to proceed even if cleanup fails
    // This is better than leaving orphaned submission records
  }
}