/**
 * Upload Metrics and Monitoring System
 * Tracks file upload performance, success rates, and errors for production monitoring
 */

import { logger } from '@/utilities/logger'

export interface UploadMetrics {
  totalAttempts: number
  successfulUploads: number
  failedUploads: number
  averageUploadTime: number
  errorBreakdown: Record<string, number>
  performanceStats: {
    minTime: number
    maxTime: number
    p95Time: number
  }
}

export interface UploadEvent {
  timestamp: number
  type: 'start' | 'success' | 'error'
  filename: string
  fileSize: number
  duration?: number
  error?: string
  errorType?: 'network' | 'validation' | 'server' | 'security' | 'unknown'
  userId?: string
  sessionId?: string
}

class UploadMetricsCollector {
  private events: UploadEvent[] = []
  private readonly maxEvents = 1000 // Keep last 1000 events in memory
  private sessionId: string

  constructor() {
    this.sessionId = this.generateSessionId()
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Record the start of an upload
   */
  recordUploadStart(filename: string, fileSize: number): void {
    const event: UploadEvent = {
      timestamp: Date.now(),
      type: 'start',
      filename,
      fileSize,
      sessionId: this.sessionId
    }

    this.addEvent(event)
    
    logger.log('📊 Upload metrics - Start', { metadata: { filename, fileSize, sessionId: this.sessionId } })
  }

  /**
   * Record a successful upload
   */
  recordUploadSuccess(filename: string, fileSize: number, duration: number, url: string): void {
    const event: UploadEvent = {
      timestamp: Date.now(),
      type: 'success',
      filename,
      fileSize,
      duration,
      sessionId: this.sessionId
    }

    this.addEvent(event)

    logger.success(
      `📊 Upload metrics - Success: ${filename} (${fileSize} bytes, ${duration}ms, ${(fileSize / duration * 1000 / 1024).toFixed(2)} KB/s)`
    )
  }

  /**
   * Record a failed upload
   */
  recordUploadError(filename: string, fileSize: number, duration: number, error: string, errorType: string): void {
    const event: UploadEvent = {
      timestamp: Date.now(),
      type: 'error',
      filename,
      fileSize,
      duration,
      error,
      errorType: errorType as 'network' | 'validation' | 'server' | 'security' | 'unknown',
      sessionId: this.sessionId
    }

    this.addEvent(event)

    logger.error('📊 Upload metrics - Error', new Error(error), {
      component: 'UploadMetrics',
      sessionId: this.sessionId,
      metadata: { filename, fileSize, duration, errorType }
    })
  }

  /**
   * Record batch upload results
   */
  recordBatchUpload(results: {
    total: number
    successful: number
    failed: number
    totalTime: number
    errors: string[]
  }): void {
    const successRate = (results.successful / results.total) * 100
    const avgTimePerFile = results.totalTime / results.total

    logger.log('📊 Batch upload metrics', { metadata: {
      ...results,
      successRate: `${successRate.toFixed(1)}%`,
      avgTimePerFile: `${avgTimePerFile.toFixed(0)}ms`,
      sessionId: this.sessionId
    } })

    // Alert if success rate is low
    if (successRate < 90) {
      logger.error('🚨 Low upload success rate detected', new Error(`Success rate: ${successRate.toFixed(1)}%`), {
        component: 'UploadMetrics',
        sessionId: this.sessionId,
        metadata: {
          successRate: `${successRate.toFixed(1)}%`,
          threshold: '90%',
          errors: results.errors
        }
      })
    }
  }

  /**
   * Get current metrics summary
   */
  getMetrics(): UploadMetrics {
    const successEvents = this.events.filter(e => e.type === 'success')
    const errorEvents = this.events.filter(e => e.type === 'error')
    const totalAttempts = successEvents.length + errorEvents.length

    if (totalAttempts === 0) {
      return {
        totalAttempts: 0,
        successfulUploads: 0,
        failedUploads: 0,
        averageUploadTime: 0,
        errorBreakdown: {},
        performanceStats: {
          minTime: 0,
          maxTime: 0,
          p95Time: 0
        }
      }
    }

    // Calculate durations
    const durations = [...successEvents, ...errorEvents]
      .filter(e => e.duration !== undefined)
      .map(e => e.duration!)
      .sort((a, b) => a - b)

    const averageUploadTime = durations.length > 0 
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length 
      : 0

    // Error breakdown
    const errorBreakdown: Record<string, number> = {}
    errorEvents.forEach(event => {
      const errorType = event.errorType || 'unknown'
      errorBreakdown[errorType] = (errorBreakdown[errorType] || 0) + 1
    })

    // Performance stats
    const performanceStats = {
      minTime: durations.length > 0 ? durations[0] : 0,
      maxTime: durations.length > 0 ? durations[durations.length - 1] : 0,
      p95Time: durations.length > 0 ? durations[Math.floor(durations.length * 0.95)] : 0
    }

    return {
      totalAttempts,
      successfulUploads: successEvents.length,
      failedUploads: errorEvents.length,
      averageUploadTime,
      errorBreakdown,
      performanceStats
    }
  }

  /**
   * Export metrics for external monitoring
   */
  exportMetrics(): {
    summary: UploadMetrics
    events: UploadEvent[]
    sessionId: string
  } {
    return {
      summary: this.getMetrics(),
      events: [...this.events],
      sessionId: this.sessionId
    }
  }

  /**
   * Reset metrics (useful for testing)
   */
  reset(): void {
    this.events = []
    this.sessionId = this.generateSessionId()
    
    logger.log('📊 Upload metrics reset', { metadata: { sessionId: this.sessionId } })
  }

  private addEvent(event: UploadEvent): void {
    this.events.push(event)
    
    // Keep only the last maxEvents
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents)
    }
  }
}

// Singleton instance
export const uploadMetrics = new UploadMetricsCollector()

/**
 * Utility function to track an upload operation
 */
export async function trackUpload<T>(
  filename: string,
  fileSize: number,
  uploadFn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now()
  uploadMetrics.recordUploadStart(filename, fileSize)

  try {
    const result = await uploadFn()
    const duration = Date.now() - startTime
    
    // Assume success if no error thrown - might need adjustment based on your uploadFn return type
    uploadMetrics.recordUploadSuccess(filename, fileSize, duration, 'success')
    
    return result
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorType = categorizeUploadError(error)
    
    uploadMetrics.recordUploadError(filename, fileSize, duration, errorMessage, errorType)
    throw error
  }
}

/**
 * Categorize upload errors for metrics
 */
function categorizeUploadError(error: unknown): string {
  if (!error) return 'unknown'
  
  const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase()
  
  if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
    return 'network'
  }
  
  if (errorMessage.includes('timeout')) {
    return 'network'
  }
  
  if (errorMessage.includes('invalid') || errorMessage.includes('validation')) {
    return 'validation'
  }
  
  if (errorMessage.includes('server') || errorMessage.includes('500') || errorMessage.includes('503')) {
    return 'server'
  }
  
  if (errorMessage.includes('unauthorized') || errorMessage.includes('forbidden')) {
    return 'security'
  }
  
  return 'unknown'
}