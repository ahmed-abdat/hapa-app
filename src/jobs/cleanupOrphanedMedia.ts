import { getPayload } from 'payload'
import config from '@payload-config'
import { logger } from '@/utilities/logger'

/**
 * Cleanup job for orphaned media files
 * Based on research: Uses lifecycle pattern with pending->complete status
 * Runs periodically to clean files older than threshold
 */

const ORPHAN_AGE_HOURS = 24 // Files older than 24 hours are considered orphaned
const BATCH_SIZE = 100 // Process in batches to avoid memory issues
const JOB_NAME = 'cleanup-orphaned-media'

interface CleanupStats {
  processed: number
  deleted: number
  failed: number
  errors: string[]
}

/**
 * Main cleanup function - should be called by cron job or scheduler
 */
export async function cleanupOrphanedMedia(): Promise<CleanupStats> {
  const startTime = Date.now()
  const sessionId = `CLEANUP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  logger.info('🧹 Starting orphaned media cleanup', {
    job: JOB_NAME,
    sessionId,
    orphanAgeHours: ORPHAN_AGE_HOURS,
    batchSize: BATCH_SIZE
  })

  const stats: CleanupStats = {
    processed: 0,
    deleted: 0,
    failed: 0,
    errors: []
  }

  try {
    const payload = await getPayload({ config })
    
    // Calculate cutoff time for orphaned files
    const cutoffDate = new Date()
    cutoffDate.setHours(cutoffDate.getHours() - ORPHAN_AGE_HOURS)
    
    // Find orphaned files in batches
    let hasMore = true
    let page = 1
    
    while (hasMore) {
      // Query for orphaned files:
      // 1. Status is 'staging' (not confirmed)
      // 2. Created before cutoff date
      // 3. OR status is explicitly 'orphaned'
      const orphanedFiles = await payload.find({
        collection: 'form-media',
        where: {
          or: [
            {
              and: [
                { uploadStatus: { equals: 'staging' } },
                { createdAt: { less_than: cutoffDate.toISOString() } }
              ]
            },
            {
              uploadStatus: { equals: 'orphaned' }
            },
            {
              and: [
                { uploadStatus: { equals: 'staging' } },
                { expiresAt: { less_than: new Date().toISOString() } }
              ]
            }
          ]
        },
        limit: BATCH_SIZE,
        page,
        sort: 'createdAt' // Process oldest first
      })

      if (orphanedFiles.docs.length === 0) {
        hasMore = false
        break
      }

      logger.info(`📦 Processing batch ${page} with ${orphanedFiles.docs.length} files`, {
        job: JOB_NAME,
        sessionId,
        batch: page,
        count: orphanedFiles.docs.length
      })

      // Process each orphaned file
      for (const file of orphanedFiles.docs) {
        stats.processed++
        
        try {
          // Optional: Check if file is referenced by any submission
          // This is a safety check to prevent deleting files that might be in use
          if (file.submissionId) {
            const submission = await payload.findByID({
              collection: 'media-content-submissions',
              id: file.submissionId
            }).catch(() => null)
            
            if (submission && submission.status === 'complete') {
              // File is associated with a complete submission, skip deletion
              logger.warn(`⚠️ Skipping file associated with complete submission`, {
                job: JOB_NAME,
                sessionId,
                fileId: file.id,
                submissionId: file.submissionId
              })
              continue
            }
          }
          
          // Delete the file (R2 cleanup handled by beforeDelete hook)
          await payload.delete({
            collection: 'form-media',
            id: file.id
          })
          
          stats.deleted++
          
          logger.info(`✅ Deleted orphaned file`, {
            job: JOB_NAME,
            sessionId,
            fileId: file.id,
            filename: file.filename,
            age: `${Math.round((Date.now() - new Date(file.createdAt).getTime()) / 1000 / 60 / 60)} hours`
          })
          
        } catch (error) {
          stats.failed++
          const errorMsg = `Failed to delete file ${file.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
          stats.errors.push(errorMsg)
          
          logger.error(`❌ Cleanup error`, {
            job: JOB_NAME,
            sessionId,
            fileId: file.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
          
          // Mark file as orphaned for manual review if deletion fails
          try {
            await payload.update({
              collection: 'form-media',
              id: file.id,
              data: {
                uploadStatus: 'orphaned'
              }
            })
          } catch (updateError) {
            logger.error(`❌ Failed to mark file as orphaned`, {
              job: JOB_NAME,
              sessionId,
              fileId: file.id,
              error: updateError instanceof Error ? updateError.message : 'Unknown error'
            })
          }
        }
      }

      // Check if there are more pages
      hasMore = orphanedFiles.hasNextPage
      page++
      
      // Add a small delay between batches to avoid overwhelming the system
      if (hasMore) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    const duration = Date.now() - startTime
    
    logger.info('✅ Orphaned media cleanup completed', {
      job: JOB_NAME,
      sessionId,
      duration: `${duration}ms`,
      stats: {
        processed: stats.processed,
        deleted: stats.deleted,
        failed: stats.failed
      }
    })

    // Send metrics if monitoring is configured
    await sendMetrics(stats, duration)
    
    return stats

  } catch (error) {
    logger.error('❌ Cleanup job failed', {
      job: JOB_NAME,
      sessionId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    throw error
  }
}

/**
 * Send metrics to monitoring system (if configured)
 */
async function sendMetrics(stats: CleanupStats, duration: number): Promise<void> {
  // TODO: Integrate with your monitoring system (e.g., OpenTelemetry, Datadog, etc.)
  // Example metrics to track:
  // - orphaned_files_deleted (counter)
  // - orphaned_files_failed (counter)
  // - cleanup_job_duration (histogram)
  // - orphaned_files_age (histogram)
  
  if (process.env.MONITORING_ENABLED === 'true') {
    try {
      // Example: Send to monitoring endpoint
      // await fetch(process.env.MONITORING_ENDPOINT, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     job: JOB_NAME,
      //     timestamp: new Date().toISOString(),
      //     duration,
      //     ...stats
      //   })
      // })
      
      logger.info('📊 Metrics sent to monitoring system', {
        job: JOB_NAME,
        stats
      })
    } catch (error) {
      logger.warn('⚠️ Failed to send metrics', {
        job: JOB_NAME,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}

/**
 * Dry run to see what would be deleted without actually deleting
 */
export async function cleanupOrphanedMediaDryRun(): Promise<{
  wouldDelete: number
  files: Array<{ id: string; filename: string; createdAt: string; status: string }>
}> {
  const payload = await getPayload({ config })
  
  const cutoffDate = new Date()
  cutoffDate.setHours(cutoffDate.getHours() - ORPHAN_AGE_HOURS)
  
  const orphanedFiles = await payload.find({
    collection: 'form-media',
    where: {
      or: [
        {
          and: [
            { uploadStatus: { equals: 'staging' } },
            { createdAt: { less_than: cutoffDate.toISOString() } }
          ]
        },
        {
          uploadStatus: { equals: 'orphaned' }
        },
        {
          and: [
            { uploadStatus: { equals: 'staging' } },
            { expiresAt: { less_than: new Date().toISOString() } }
          ]
        }
      ]
    },
    limit: 1000 // Get more for dry run
  })

  return {
    wouldDelete: orphanedFiles.totalDocs,
    files: orphanedFiles.docs.map(file => ({
      id: file.id,
      filename: file.filename || 'unknown',
      createdAt: file.createdAt,
      status: file.uploadStatus || 'unknown'
    }))
  }
}

/**
 * Manual cleanup for specific file IDs
 */
export async function cleanupSpecificFiles(fileIds: string[]): Promise<CleanupStats> {
  const stats: CleanupStats = {
    processed: 0,
    deleted: 0,
    failed: 0,
    errors: []
  }

  const payload = await getPayload({ config })

  for (const fileId of fileIds) {
    stats.processed++
    
    try {
      await payload.delete({
        collection: 'form-media',
        id: fileId
      })
      
      stats.deleted++
      logger.info(`✅ Manually deleted file ${fileId}`)
      
    } catch (error) {
      stats.failed++
      const errorMsg = `Failed to delete file ${fileId}: ${error instanceof Error ? error.message : 'Unknown error'}`
      stats.errors.push(errorMsg)
      logger.error(errorMsg)
    }
  }

  return stats
}