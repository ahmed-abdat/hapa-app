import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { logger } from '@/utilities/logger'
import { getR2Client } from '@/utilities/r2-client'
import { ListObjectsV2Command, HeadObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3'

interface ScanRequest {
  dryRun?: boolean
  directories?: string[]
  maxFiles?: number
  retentionDays?: number
}

interface CleanupRequest {
  orphanedFiles: string[]
  dryRun?: boolean
}

/**
 * Scan R2 storage for orphaned files not referenced in FormMedia collection
 */
async function scanForOrphanedFiles(
  payload: any,
  directories: string[] = ['forms/'],
  maxFiles: number = 1000,
  retentionDays: number = 30
): Promise<{
  orphanedFiles: Array<{
    filename: string
    path: string
    size: number
    lastModified: string
  }>
  metrics: {
    filesScanned: number
    orphanedFilesFound: number
    storageSize: number
  }
}> {
  const r2Client = getR2Client()
  const orphanedFiles: Array<{
    filename: string
    path: string
    size: number
    lastModified: string
  }> = []
  
  let filesScanned = 0
  let storageSize = 0
  
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

  try {
    // Scan each directory in R2
    for (const directory of directories) {
      let continuationToken: string | undefined
      
      do {
        const listCommand = new ListObjectsV2Command({
          Bucket: process.env.R2_BUCKET_NAME!,
          Prefix: directory,
          MaxKeys: Math.min(1000, maxFiles - filesScanned),
          ContinuationToken: continuationToken,
        })

        const listResponse = await r2Client.send(listCommand)
        
        if (listResponse.Contents) {
          for (const object of listResponse.Contents) {
            if (!object.Key) continue
            
            filesScanned++
            
            // Skip files newer than retention period
            if (object.LastModified && object.LastModified > cutoffDate) {
              continue
            }
            
            // Extract filename from path
            const filename = object.Key.split('/').pop()
            if (!filename) continue
            
            // Check if file exists in FormMedia collection
            const mediaExists = await payload.find({
              collection: 'media',
              where: {
                filename: {
                  equals: filename,
                },
              },
              limit: 1,
            })
            
            // If not found in database, it's orphaned
            if (mediaExists.totalDocs === 0) {
              orphanedFiles.push({
                filename,
                path: object.Key,
                size: object.Size || 0,
                lastModified: object.LastModified?.toISOString() || '',
              })
              
              storageSize += object.Size || 0
            }
            
            // Stop if we've reached the max files limit
            if (filesScanned >= maxFiles) {
              break
            }
          }
        }
        
        continuationToken = listResponse.NextContinuationToken
      } while (continuationToken && filesScanned < maxFiles)
      
      if (filesScanned >= maxFiles) {
        break
      }
    }
    
    return {
      orphanedFiles,
      metrics: {
        filesScanned,
        orphanedFilesFound: orphanedFiles.length,
        storageSize,
      },
    }
  } catch (error) {
    logger.error('Error scanning for orphaned files', error as Error, {
      component: 'MediaCleanup',
      action: 'scan_error',
    })
    throw error
  }
}

/**
 * Delete orphaned files from R2 storage
 */
async function deleteOrphanedFiles(
  files: string[],
  dryRun: boolean = false
): Promise<{
  deleted: number
  failed: number
  errors: string[]
}> {
  if (dryRun || files.length === 0) {
    return { deleted: 0, failed: 0, errors: [] }
  }

  const r2Client = getR2Client()
  const errors: string[] = []
  let deleted = 0
  let failed = 0

  try {
    // Process in batches of 1000 (S3 limit)
    const BATCH_SIZE = 1000
    
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE)
      const objects = batch.map(path => ({ Key: path }))
      
      try {
        const deleteCommand = new DeleteObjectsCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Delete: {
            Objects: objects,
            Quiet: false,
          },
        })
        
        const result = await r2Client.send(deleteCommand)
        
        if (result.Deleted) {
          deleted += result.Deleted.length
        }
        
        if (result.Errors && result.Errors.length > 0) {
          result.Errors.forEach(error => {
            errors.push(`${error.Key}: ${error.Code} - ${error.Message}`)
            failed++
          })
        }
      } catch (batchError) {
        const errorMessage = batchError instanceof Error ? batchError.message : 'Unknown error'
        batch.forEach(path => {
          errors.push(`${path}: ${errorMessage}`)
          failed++
        })
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Error deleting orphaned files', error as Error, {
      component: 'MediaCleanup',
      action: 'delete_error',
    })
    
    failed = files.length
    errors.push(`Bulk deletion failed: ${errorMessage}`)
  }
  
  return { deleted, failed, errors }
}

// GET - Scan for orphaned files
export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    
    // Check authentication and admin role
    const { user } = await payload.auth({ headers: req.headers })
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const dryRun = searchParams.get('dryRun') === 'true'
    const directories = searchParams.get('directories')?.split(',') || ['forms/']
    const maxFiles = parseInt(searchParams.get('maxFiles') || '1000', 10)
    const retentionDays = parseInt(searchParams.get('retentionDays') || '30', 10)

    logger.info('Starting orphaned files scan', {
      component: 'MediaCleanup',
      action: 'scan_start',
      metadata: {
        dryRun,
        directories,
        maxFiles,
        retentionDays,
        userId: user.id,
      },
    })

    // Create cleanup job record
    const job = await payload.create({
      collection: 'media-cleanup-jobs',
      data: {
        jobType: 'verification',
        status: 'running',
        executedAt: new Date().toISOString(),
        configuration: {
          dryRun: true, // Scan is always dry run
          includeDirectories: directories.map(path => ({ path })),
          maxFilesToProcess: maxFiles,
          retentionDays,
        },
        triggeredBy: 'api',
        executedBy: user.id,
      },
    })

    try {
      // Perform the scan
      const scanResult = await scanForOrphanedFiles(
        payload,
        directories,
        maxFiles,
        retentionDays
      )

      // Update job with results
      await payload.update({
        collection: 'media-cleanup-jobs',
        id: job.id,
        data: {
          status: 'completed',
          completedAt: new Date().toISOString(),
          metrics: {
            filesScanned: scanResult.metrics.filesScanned,
            orphanedFilesFound: scanResult.metrics.orphanedFilesFound,
            storageReclaimed: scanResult.metrics.storageSize,
            filesProcessed: scanResult.metrics.filesScanned,
            filesDeleted: 0,
            deletionErrors: 0,
          },
          orphanedFiles: scanResult.orphanedFiles.map(file => ({
            filename: file.filename,
            path: file.path,
            size: file.size,
            lastModified: file.lastModified,
            status: 'found',
          })),
          executionLog: `Scan completed successfully. Found ${scanResult.metrics.orphanedFilesFound} orphaned files out of ${scanResult.metrics.filesScanned} scanned.`,
        },
      })

      logger.info('Orphaned files scan completed', {
        component: 'MediaCleanup',
        action: 'scan_complete',
        metadata: {
          ...scanResult.metrics,
          jobId: job.id,
          userId: user.id,
        },
      })

      return NextResponse.json({
        success: true,
        jobId: job.id,
        ...scanResult,
      })
    } catch (error) {
      // Update job with error
      await payload.update({
        collection: 'media-cleanup-jobs',
        id: job.id,
        data: {
          status: 'failed',
          completedAt: new Date().toISOString(),
          errorLog: error instanceof Error ? error.message : 'Unknown error',
        },
      })

      throw error
    }
  } catch (error) {
    logger.error('Error in orphaned files scan', error as Error, {
      component: 'MediaCleanup',
      action: 'scan_error',
    })

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Execute cleanup of orphaned files
export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    
    // Check authentication and admin role
    const { user } = await payload.auth({ headers: req.headers })
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: CleanupRequest = await req.json()
    const { orphanedFiles = [], dryRun = false } = body

    if (!orphanedFiles.length) {
      return NextResponse.json(
        { success: false, error: 'No files provided for cleanup' },
        { status: 400 }
      )
    }

    logger.info('Starting orphaned files cleanup', {
      component: 'MediaCleanup',
      action: 'cleanup_start',
      metadata: {
        fileCount: orphanedFiles.length,
        dryRun,
        userId: user.id,
      },
    })

    // Create cleanup job record
    const job = await payload.create({
      collection: 'media-cleanup-jobs',
      data: {
        jobType: dryRun ? 'verification' : 'cleanup',
        status: 'running',
        executedAt: new Date().toISOString(),
        configuration: {
          dryRun,
          maxFilesToProcess: orphanedFiles.length,
        },
        orphanedFiles: orphanedFiles.map(path => ({
          path,
          filename: path.split('/').pop() || path,
          status: 'found',
        })),
        triggeredBy: 'api',
        executedBy: user.id,
      },
    })

    try {
      // Execute the cleanup
      const cleanupResult = await deleteOrphanedFiles(orphanedFiles, dryRun)

      // Update job with results
      const updatedOrphanedFiles = orphanedFiles.map(path => {
        const filename = path.split('/').pop() || path
        const wasDeleted = !cleanupResult.errors.some(err => err.startsWith(path))
        
        return {
          path,
          filename,
          status: (dryRun ? 'found' : (wasDeleted ? 'deleted' : 'failed')) as 'found' | 'deleted' | 'failed',
          error: cleanupResult.errors.find(err => err.startsWith(path)),
        }
      })

      await payload.update({
        collection: 'media-cleanup-jobs',
        id: job.id,
        data: {
          status: cleanupResult.failed > 0 ? 'partial' : 'completed',
          completedAt: new Date().toISOString(),
          metrics: {
            filesProcessed: orphanedFiles.length,
            filesDeleted: cleanupResult.deleted,
            deletionErrors: cleanupResult.failed,
            orphanedFilesFound: orphanedFiles.length,
            filesScanned: orphanedFiles.length,
            storageReclaimed: 0, // Would need to track file sizes
          },
          orphanedFiles: updatedOrphanedFiles,
          executionLog: dryRun 
            ? `Dry run completed. Would delete ${orphanedFiles.length} files.`
            : `Cleanup completed. Deleted ${cleanupResult.deleted} files, ${cleanupResult.failed} failed.`,
          errorLog: cleanupResult.errors.length > 0 
            ? cleanupResult.errors.join('\n')
            : undefined,
        },
      })

      logger.info('Orphaned files cleanup completed', {
        component: 'MediaCleanup',
        action: 'cleanup_complete',
        metadata: {
          ...cleanupResult,
          jobId: job.id,
          userId: user.id,
          dryRun,
        },
      })

      return NextResponse.json({
        success: true,
        jobId: job.id,
        dryRun,
        results: cleanupResult,
      })
    } catch (error) {
      // Update job with error
      await payload.update({
        collection: 'media-cleanup-jobs',
        id: job.id,
        data: {
          status: 'failed',
          completedAt: new Date().toISOString(),
          errorLog: error instanceof Error ? error.message : 'Unknown error',
        },
      })

      throw error
    }
  } catch (error) {
    logger.error('Error in orphaned files cleanup', error as Error, {
      component: 'MediaCleanup',
      action: 'cleanup_error',
    })

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Cancel a running cleanup job
export async function DELETE(req: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    
    // Check authentication and admin role
    const { user } = await payload.auth({ headers: req.headers })
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID required' },
        { status: 400 }
      )
    }

    // Update job status to cancelled
    const job = await payload.update({
      collection: 'media-cleanup-jobs',
      id: jobId,
      data: {
        status: 'failed',
        completedAt: new Date().toISOString(),
        errorLog: 'Job cancelled by user',
      },
    })

    logger.info('Cleanup job cancelled', {
      component: 'MediaCleanup',
      action: 'job_cancelled',
      metadata: {
        jobId,
        userId: user.id,
      },
    })

    return NextResponse.json({
      success: true,
      job,
    })
  } catch (error) {
    logger.error('Error cancelling cleanup job', error as Error, {
      component: 'MediaCleanup',
      action: 'cancel_error',
    })

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}