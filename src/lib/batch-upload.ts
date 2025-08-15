/**
 * Production-ready batch upload utilities
 * Handles file upload batching, progress tracking, and error recovery
 */

import { logger } from '@/utilities/logger'
import { uploadMetrics } from '@/lib/upload-metrics'
import { categorizeError, sleep, calculateRetryDelay } from '@/lib/file-upload'
import { UPLOAD_RETRY_CONFIG } from '@/lib/constants'

export interface BatchUploadConfig {
  batchSize: number
  concurrentBatches: boolean
  delayBetweenBatches: number // milliseconds
  maxRetries: number
  retryDelayMs: number
  timeoutMs: number
}

export interface BatchUploadProgress {
  totalFiles: number
  processedFiles: number
  successfulFiles: number
  failedFiles: number
  currentBatch: number
  totalBatches: number
  progress: number // 0-100
  currentFileIndex: number
  currentFileName: string
  errors: BatchUploadError[]
  estimatedTimeRemaining?: number
}

export interface BatchUploadError {
  fileIndex: number
  fileName: string
  error: string
  isRetryable: boolean
  attempts: number
  timestamp: number
}

export interface BatchUploadResult {
  success: boolean
  totalFiles: number
  successfulFiles: number
  failedFiles: number
  successfulUploads: UploadResult[]
  failedUploads: BatchUploadError[]
  totalTime: number
  averageTimePerFile: number
}

export interface UploadResult {
  fileIndex: number
  fileName: string
  url: string
  fileId: string
  fileSize: number
  uploadTime: number
  attempts: number
}

export type ProgressCallback = (progress: BatchUploadProgress) => void
export type UploadFunction<T> = (file: File, fileIndex: number) => Promise<T>

/**
 * Default batch upload configuration
 */
export const DEFAULT_BATCH_CONFIG: BatchUploadConfig = {
  batchSize: 2,
  concurrentBatches: false,
  delayBetweenBatches: 100, // 100ms
  maxRetries: UPLOAD_RETRY_CONFIG.MAX_RETRIES,
  retryDelayMs: UPLOAD_RETRY_CONFIG.INITIAL_DELAY,
  timeoutMs: 60000, // 60 seconds
}

/**
 * Advanced batch upload processor with progress tracking and error recovery
 */
export class BatchUploadProcessor<T> {
  private config: BatchUploadConfig
  private progressCallback?: ProgressCallback
  private uploadFunction: UploadFunction<T>
  private startTime: number = 0
  private processedFiles: number = 0
  private successfulFiles: number = 0
  private failedFiles: number = 0
  private errors: BatchUploadError[] = []
  private sessionId: string

  constructor(
    uploadFunction: UploadFunction<T>,
    config: Partial<BatchUploadConfig> = {},
    progressCallback?: ProgressCallback
  ) {
    this.config = { ...DEFAULT_BATCH_CONFIG, ...config }
    this.uploadFunction = uploadFunction
    this.progressCallback = progressCallback
    this.sessionId = `BATCH_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
  }

  /**
   * Process file uploads in batches with comprehensive error handling
   */
  async uploadFiles(files: File[]): Promise<BatchUploadResult> {
    this.startTime = Date.now()
    this.processedFiles = 0
    this.successfulFiles = 0
    this.failedFiles = 0
    this.errors = []

    const totalBatches = Math.ceil(files.length / this.config.batchSize)
    const successfulUploads: UploadResult[] = []

    logger.info(`🚀 Starting batch upload`, {
      sessionId: this.sessionId,
      totalFiles: files.length,
      batchSize: this.config.batchSize,
      totalBatches,
      config: this.config
    })

    // Initialize progress
    this.updateProgress(files, 0, totalBatches, 0, '')

    try {
      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const batchStart = batchIndex * this.config.batchSize
        const batchEnd = Math.min(batchStart + this.config.batchSize, files.length)
        const batchFiles = files.slice(batchStart, batchEnd)

        logger.info(`📦 Processing batch ${batchIndex + 1}/${totalBatches}`, {
          sessionId: this.sessionId,
          batchStart,
          batchEnd,
          batchSize: batchFiles.length
        })

        // Update progress for batch start
        this.updateProgress(files, batchIndex + 1, totalBatches, batchStart, batchFiles[0]?.name || '')

        // Process current batch
        const batchResults = await this.processBatch(
          batchFiles,
          batchStart,
          batchIndex + 1,
          totalBatches
        )

        // Collect results
        for (const result of batchResults) {
          if (result.success && result.data) {
            successfulUploads.push(result.data)
            this.successfulFiles++
          } else if (result.error) {
            this.errors.push(result.error)
            this.failedFiles++
          }
          this.processedFiles++
        }

        // Update progress after batch completion
        this.updateProgress(
          files,
          batchIndex + 1,
          totalBatches,
          this.processedFiles,
          ''
        )

        // Delay between batches (except for the last batch)
        if (batchIndex < totalBatches - 1 && this.config.delayBetweenBatches > 0) {
          await sleep(this.config.delayBetweenBatches)
        }
      }

      const totalTime = Date.now() - this.startTime
      const averageTimePerFile = files.length > 0 ? totalTime / files.length : 0

      // Record final metrics
      uploadMetrics.recordBatchUpload({
        total: files.length,
        successful: this.successfulFiles,
        failed: this.failedFiles,
        totalTime,
        errors: this.errors.map(e => e.error)
      })

      const result: BatchUploadResult = {
        success: this.failedFiles === 0,
        totalFiles: files.length,
        successfulFiles: this.successfulFiles,
        failedFiles: this.failedFiles,
        successfulUploads,
        failedUploads: this.errors,
        totalTime,
        averageTimePerFile
      }

      logger.info(`✅ Batch upload completed`, {
        sessionId: this.sessionId,
        ...result
      })

      return result

    } catch (error) {
      logger.error(`❌ Batch upload failed`, error, {
        sessionId: this.sessionId,
        processedFiles: this.processedFiles,
        successfulFiles: this.successfulFiles
      })

      throw error
    }
  }

  /**
   * Process a single batch of files
   */
  private async processBatch(
    batchFiles: File[],
    batchStartIndex: number,
    currentBatch: number,
    totalBatches: number
  ): Promise<Array<{ success: boolean; data?: UploadResult; error?: BatchUploadError }>> {
    if (this.config.concurrentBatches) {
      // Process files in batch concurrently
      const promises = batchFiles.map((file, index) =>
        this.processFileWithRetry(file, batchStartIndex + index, currentBatch, totalBatches)
      )
      return Promise.all(promises)
    } else {
      // Process files sequentially
      const results = []
      for (let i = 0; i < batchFiles.length; i++) {
        const file = batchFiles[i]
        const fileIndex = batchStartIndex + i
        const result = await this.processFileWithRetry(file, fileIndex, currentBatch, totalBatches)
        results.push(result)
      }
      return results
    }
  }

  /**
   * Process a single file with retry logic
   */
  private async processFileWithRetry(
    file: File,
    fileIndex: number,
    currentBatch: number,
    totalBatches: number
  ): Promise<{ success: boolean; data?: UploadResult; error?: BatchUploadError }> {
    let lastError: Error | null = null
    let attempts = 0

    // Update progress for current file
    this.updateProgress(
      [],
      currentBatch,
      totalBatches,
      this.processedFiles,
      file.name,
      fileIndex
    )

    for (attempts = 1; attempts <= this.config.maxRetries + 1; attempts++) {
      try {
        const startTime = Date.now()

        // Record upload start
        uploadMetrics.recordUploadStart(file.name, file.size)

        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Upload timeout')), this.config.timeoutMs)
        )

        // Execute upload with timeout
        const uploadPromise = this.uploadFunction(file, fileIndex)
        const result = await Promise.race([uploadPromise, timeoutPromise])

        const uploadTime = Date.now() - startTime

        // Record success
        uploadMetrics.recordUploadSuccess(file.name, file.size, uploadTime, 'success')

        logger.info(`✅ File uploaded successfully`, {
          sessionId: this.sessionId,
          fileName: file.name,
          fileIndex,
          attempts,
          uploadTime
        })

        // Convert generic result to UploadResult if needed
        const uploadResult: UploadResult = {
          fileIndex,
          fileName: file.name,
          url: (result as any)?.url || 'success',
          fileId: (result as any)?.id || `file_${fileIndex}`,
          fileSize: file.size,
          uploadTime,
          attempts
        }

        return { success: true, data: uploadResult }

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        const errorCategory = categorizeError(error)
        const isRetryable = ['network', 'server', 'unknown'].includes(errorCategory) && attempts <= this.config.maxRetries

        logger.warn(`⚠️ Upload attempt ${attempts} failed`, {
          sessionId: this.sessionId,
          fileName: file.name,
          fileIndex,
          error: lastError.message,
          errorCategory,
          isRetryable,
          attemptsRemaining: this.config.maxRetries - attempts + 1
        })

        // Record error
        const uploadTime = attempts * 1000 // Estimate
        uploadMetrics.recordUploadError(
          file.name,
          file.size,
          uploadTime,
          lastError.message,
          errorCategory
        )

        // If this is the last attempt or error is not retryable
        if (!isRetryable || attempts > this.config.maxRetries) {
          const batchError: BatchUploadError = {
            fileIndex,
            fileName: file.name,
            error: lastError.message,
            isRetryable,
            attempts,
            timestamp: Date.now()
          }
          return { success: false, error: batchError }
        }

        // Calculate retry delay
        const delay = calculateRetryDelay(attempts - 1, this.config.retryDelayMs)
        logger.info(`⏳ Retrying upload in ${delay}ms`, {
          sessionId: this.sessionId,
          fileName: file.name,
          attempt: attempts,
          delay
        })

        await sleep(delay)
      }
    }

    // Should not reach here, but just in case
    const batchError: BatchUploadError = {
      fileIndex,
      fileName: file.name,
      error: lastError?.message || 'Maximum retries exceeded',
      isRetryable: false,
      attempts,
      timestamp: Date.now()
    }
    return { success: false, error: batchError }
  }

  /**
   * Update progress and notify callback
   */
  private updateProgress(
    files: File[],
    currentBatch: number,
    totalBatches: number,
    currentFileIndex: number,
    currentFileName: string,
    processingFileIndex?: number
  ): void {
    if (!this.progressCallback) return

    const totalFiles = files.length
    const progress = totalFiles > 0 ? Math.round((this.processedFiles / totalFiles) * 100) : 0

    // Estimate time remaining
    const elapsedTime = Date.now() - this.startTime
    const estimatedTimeRemaining = this.processedFiles > 0
      ? Math.round((elapsedTime / this.processedFiles) * (totalFiles - this.processedFiles))
      : undefined

    const progressData: BatchUploadProgress = {
      totalFiles,
      processedFiles: this.processedFiles,
      successfulFiles: this.successfulFiles,
      failedFiles: this.failedFiles,
      currentBatch,
      totalBatches,
      progress,
      currentFileIndex: processingFileIndex ?? currentFileIndex,
      currentFileName,
      errors: [...this.errors],
      estimatedTimeRemaining
    }

    this.progressCallback(progressData)
  }
}

/**
 * Utility function to create a simple batch uploader
 */
export function createBatchUploader<T>(
  uploadFunction: UploadFunction<T>,
  config?: Partial<BatchUploadConfig>
): (files: File[], progressCallback?: ProgressCallback) => Promise<BatchUploadResult> {
  return async (files: File[], progressCallback?: ProgressCallback) => {
    const processor = new BatchUploadProcessor(uploadFunction, config, progressCallback)
    return processor.uploadFiles(files)
  }
}

/**
 * Helper function for common Payload CMS upload pattern
 */
export function createPayloadBatchUploader(
  payload: any,
  collection: string,
  submissionId: string,
  config?: Partial<BatchUploadConfig>
) {
  const uploadFunction: UploadFunction<any> = async (file: File, fileIndex: number) => {
    const result = await payload.create({
      collection,
      data: {
        alt: file.name,
        submissionId,
        fileIndex,
        uploadedAt: new Date().toISOString(),
      },
      file: {
        data: Buffer.from(await file.arrayBuffer()),
        mimetype: file.type,
        name: file.name,
        size: file.size,
      },
      overrideAccess: true,
    })

    return {
      id: result.id,
      url: result.url,
      filename: result.filename,
    }
  }

  return createBatchUploader(uploadFunction, config)
}