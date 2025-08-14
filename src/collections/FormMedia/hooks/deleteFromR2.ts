/**
 * R2 File Deletion Hook for FormMedia Collection
 * Integrates with existing R2 client and handles cleanup of physical files
 */

import type { CollectionBeforeDeleteHook } from 'payload'
import { DeleteObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3'
import { getR2Client } from '@/utilities/r2-client'
import { logger } from '@/utilities/logger'

/**
 * Get R2 file path based on extension (matches FormMedia beforeChange hook logic)
 */
function getR2FilePath(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase()
  let folder = 'forms/misc'
  
  // Match the logic from FormMedia beforeChange hook
  if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'svg'].includes(extension || '')) {
    folder = 'forms/images'
  } else if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension || '')) {
    folder = 'forms/documents'
  } else if (['mp4', 'mov', 'avi', 'webm', 'mkv'].includes(extension || '')) {
    folder = 'forms/videos'
  } else if (['mp3', 'wav', 'ogg', 'aac', 'm4a'].includes(extension || '')) {
    folder = 'forms/audio'
  }
  
  return `${folder}/${filename}`
}

/**
 * Delete single file from R2 with error handling
 */
async function deleteSingleFileFromR2(
  filename: string, 
  submissionId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const r2Client = getR2Client()
    const filePath = getR2FilePath(filename)
    
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: filePath,
    })

    await r2Client.send(deleteCommand)
    
    logger.info('✅ R2 file deleted successfully', {
      component: 'FormMediaCleanup',
      action: 'file_deleted',
      metadata: {
        filename,
        filePath,
        submissionId,
      }
    })

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    logger.error('❌ Failed to delete file from R2', {
      component: 'FormMediaCleanup', 
      action: 'file_deletion_failed',
      metadata: {
        filename,
        submissionId,
        error: errorMessage,
      }
    })

    return { success: false, error: errorMessage }
  }
}

/**
 * Bulk delete multiple files from R2 (up to 1000 per batch)
 */
export async function bulkDeleteFromR2(
  filenames: string[],
  submissionId?: string
): Promise<{ deleted: number; failed: number; errors: string[] }> {
  if (filenames.length === 0) {
    return { deleted: 0, failed: 0, errors: [] }
  }

  const errors: string[] = []
  let deleted = 0
  let failed = 0

  try {
    const r2Client = getR2Client()
    const BATCH_SIZE = 1000 // R2/S3 maximum

    // Process in batches
    for (let i = 0; i < filenames.length; i += BATCH_SIZE) {
      const batch = filenames.slice(i, i + BATCH_SIZE)
      const objects = batch.map(filename => ({
        Key: getR2FilePath(filename)
      }))

      try {
        const deleteCommand = new DeleteObjectsCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Delete: {
            Objects: objects,
            Quiet: false, // Get detailed results
          },
        })

        const result = await r2Client.send(deleteCommand)

        // Count successful deletions
        if (result.Deleted) {
          deleted += result.Deleted.length
        }

        // Handle errors within the batch
        if (result.Errors && result.Errors.length > 0) {
          result.Errors.forEach(error => {
            const filename = error.Key?.replace(/^forms\/[^\/]+\//, '') // Extract filename
            errors.push(`${filename}: ${error.Code} - ${error.Message}`)
            failed++
          })
        }

        logger.info(`📦 R2 bulk deletion batch completed`, {
          component: 'FormMediaCleanup',
          action: 'bulk_delete_batch',
          metadata: {
            batchSize: batch.length,
            deleted: result.Deleted?.length || 0,
            failed: result.Errors?.length || 0,
            submissionId,
          }
        })

      } catch (batchError) {
        const errorMessage = batchError instanceof Error ? batchError.message : 'Unknown batch error'
        
        // All files in this batch failed
        batch.forEach(filename => {
          errors.push(`${filename}: ${errorMessage}`)
          failed++
        })

        logger.error('❌ R2 bulk deletion batch failed', {
          component: 'FormMediaCleanup',
          action: 'bulk_delete_batch_failed', 
          metadata: {
            batchSize: batch.length,
            error: errorMessage,
            submissionId,
          }
        })
      }
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    logger.error('❌ R2 bulk deletion completely failed', {
      component: 'FormMediaCleanup',
      action: 'bulk_delete_failed',
      metadata: {
        totalFiles: filenames.length,
        error: errorMessage,
        submissionId,
      }
    })

    // All files failed
    failed = filenames.length
    errors.push(`Bulk deletion failed: ${errorMessage}`)
  }

  return { deleted, failed, errors }
}

/**
 * FormMedia beforeDelete hook - cleans up individual file
 */
export const deleteFormMediaFromR2: CollectionBeforeDeleteHook = async ({
  req,
  id,
}) => {
  try {
    // Skip if this deletion is part of a bulk cleanup to avoid double deletion
    if (req.context?.skipR2Cleanup) {
      return
    }

    // Get the document to access file information
    const mediaDoc = await req.payload.findByID({
      collection: 'form-media',
      id,
      showHiddenFields: true,
    })

    if (!mediaDoc || !mediaDoc.filename) {
      logger.warn('⚠️ FormMedia document not found or missing filename', {
        component: 'FormMediaCleanup',
        action: 'document_not_found',
        metadata: { id }
      })
      return
    }

    // Delete the main file
    const result = await deleteSingleFileFromR2(
      mediaDoc.filename, 
      mediaDoc.submissionId?.toString()
    )

    if (!result.success) {
      // Log error but don't throw - allow database deletion to proceed
      logger.warn('⚠️ R2 file deletion failed but allowing database deletion to proceed', {
        component: 'FormMediaCleanup',
        action: 'r2_deletion_failed_continuing',
        metadata: {
          id,
          filename: mediaDoc.filename,
          error: result.error,
        }
      })
    }

    // TODO: Handle thumbnail/size files if Payload generates them for FormMedia
    // This would require checking mediaDoc.sizes if it exists

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    logger.error('❌ Error in FormMedia R2 cleanup hook', {
      component: 'FormMediaCleanup',
      action: 'hook_error',
      metadata: {
        id,
        error: errorMessage,
      }
    })

    // Don't throw - allow database deletion to proceed even if R2 cleanup fails
    // This prevents database inconsistency
  }
}