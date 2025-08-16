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
 * Scan R2 storage for orphaned files not referenced in Media collection
 * Now supports the new folder structure: images/, docs/, videos/, audio/, media/
 */
async function scanForOrphanedFiles(
  payload: any,
  directories: string[] = ['images/', 'docs/', 'videos/', 'audio/', 'media/', 'forms/'],
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
    // First, get all media records from database for efficient comparison
    const allMediaRecords = await payload.find({
      collection: 'media',
      limit: 100000, // Get all records
      select: {
        filename: true,
        prefix: true,
        url: true,
      },
    })
    
    // Create a Set of all valid R2 paths from database records
    const validPaths = new Set<string>()
    allMediaRecords.docs.forEach((doc: any) => {
      if (doc.filename) {
        // Handle files with prefix
        if (doc.prefix) {
          validPaths.add(`${doc.prefix}/${doc.filename}`)
        } else {
          // For older files without prefix, try to extract from URL
          if (doc.url && typeof doc.url === 'string') {
            // Extract path from URL (e.g., /api/media/file/images/test.jpg -> images/test.jpg)
            const urlMatch = doc.url.match(/\/api\/media\/file\/(.+)/)
            if (urlMatch && urlMatch[1]) {
              validPaths.add(decodeURIComponent(urlMatch[1]))
            }
          }
          // Also add without prefix for backward compatibility
          validPaths.add(`media/${doc.filename}`)
          validPaths.add(doc.filename)
        }
      }
    })
    
    logger.info('Database media scan complete', {
      component: 'MediaCleanup',
      action: 'database_scan',
      metadata: {
        totalRecords: allMediaRecords.totalDocs,
        validPaths: validPaths.size,
      },
    })
    
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
            
            // Skip directories (keys ending with /)
            if (object.Key.endsWith('/')) continue
            
            // Skip files newer than retention period
            if (object.LastModified && object.LastModified > cutoffDate) {
              continue
            }
            
            // Extract filename from path
            const filename = object.Key.split('/').pop()
            if (!filename) continue
            
            // Check if this exact path exists in our valid paths set
            const isOrphaned = !validPaths.has(object.Key) && 
                               !validPaths.has(decodeURIComponent(object.Key))
            
            // If not found in database paths, it's orphaned
            if (isOrphaned) {
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
    
    // Validate and sanitize directories input
    const ALLOWED_DIRECTORIES = ['images/', 'docs/', 'videos/', 'audio/', 'media/', 'forms/']
    const requestedDirs = searchParams.get('directories')?.split(',') || ALLOWED_DIRECTORIES
    const directories = requestedDirs.filter(dir => 
      ALLOWED_DIRECTORIES.includes(dir) && !dir.includes('..')
    )
    
    // Apply reasonable limits to prevent resource exhaustion
    const maxFiles = Math.min(parseInt(searchParams.get('maxFiles') || '1000', 10), 5000)
    const retentionDays = Math.min(Math.max(parseInt(searchParams.get('retentionDays') || '30', 10), 1), 365)

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
    
    // Validate file paths - simple security check
    const MAX_FILES_PER_BATCH = 1000
    const validFiles = orphanedFiles
      .slice(0, MAX_FILES_PER_BATCH) // Limit batch size
      .filter(file => 
        typeof file === 'string' &&
        file.length > 0 &&
        file.length < 500 && // Reasonable path length
        !file.includes('..') && // No directory traversal
        !file.startsWith('/') // No absolute paths
      )
    
    if (validFiles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid files provided' },
        { status: 400 }
      )
    }

    logger.info('Starting orphaned files cleanup', {
      component: 'MediaCleanup',
      action: 'cleanup_start',
      metadata: {
        fileCount: validFiles.length,
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
          maxFilesToProcess: validFiles.length,
        },
        orphanedFiles: validFiles.map(path => ({
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
      const cleanupResult = await deleteOrphanedFiles(validFiles, dryRun)

      // Update job with results
      const updatedOrphanedFiles = validFiles.map(path => {
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
            filesProcessed: validFiles.length,
            filesDeleted: cleanupResult.deleted,
            deletionErrors: cleanupResult.failed,
            orphanedFilesFound: validFiles.length,
            filesScanned: validFiles.length,
            storageReclaimed: 0, // Would need to track file sizes
          },
          orphanedFiles: updatedOrphanedFiles,
          executionLog: dryRun 
            ? `Dry run completed. Would delete ${validFiles.length} files.`
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