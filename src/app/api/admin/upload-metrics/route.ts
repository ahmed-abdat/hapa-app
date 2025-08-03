import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { uploadMetrics } from '@/lib/upload-metrics'
import { logger } from '@/utilities/logger'

/**
 * Upload Metrics API Endpoint
 * Provides upload performance statistics for monitoring and alerts
 */
export async function GET(req: NextRequest) {
  try {
    // Get Payload instance for authentication
    const payload = await getPayload({ config: configPromise })
    
    // Check if user is authenticated (admin only)
    const { user } = await payload.auth({ headers: req.headers })
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get current metrics
    const metrics = uploadMetrics.getMetrics()
    const fullExport = uploadMetrics.exportMetrics()

    // Calculate additional insights
    const successRate = metrics.totalAttempts > 0 
      ? (metrics.successfulUploads / metrics.totalAttempts) * 100 
      : 0

    const insights = {
      successRate: Number(successRate.toFixed(2)),
      isHealthy: successRate >= 95, // Consider healthy if 95%+ success rate
      needsAttention: successRate < 90, // Needs attention if <90%
      mostCommonError: Object.keys(metrics.errorBreakdown).length > 0 
        ? Object.entries(metrics.errorBreakdown)
            .sort(([,a], [,b]) => b - a)[0][0]
        : null,
      performanceGrade: getPerformanceGrade(metrics.averageUploadTime),
      recommendations: generateRecommendations(metrics, successRate)
    }

    // Log metrics access
    logger.log('📊 Upload metrics accessed', {
      component: 'UploadMetricsAPI',
      action: 'metrics_accessed',
      metadata: {
        user: user.email,
        sessionId: fullExport.sessionId,
        totalAttempts: metrics.totalAttempts,
        successRate: `${successRate.toFixed(1)}%`
      }
    })

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      sessionId: fullExport.sessionId,
      metrics,
      insights,
      // Include recent events for detailed analysis (last 50 events)
      recentEvents: fullExport.events.slice(-50)
    }

    return NextResponse.json(response)

  } catch (error) {
    logger.error('❌ Upload metrics API error:', error)
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Reset metrics (for testing/debugging)
 */
export async function DELETE(req: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: req.headers })
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Only allow in development or with specific permission
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { success: false, error: 'Reset only allowed in development' },
        { status: 403 }
      )
    }

    uploadMetrics.reset()

    logger.log('📊 Upload metrics reset', {
      component: 'UploadMetricsAPI',
      action: 'metrics_reset',
      metadata: { user: user.email }
    })

    return NextResponse.json({
      success: true,
      message: 'Upload metrics reset successfully'
    })

  } catch (error) {
    logger.error('❌ Upload metrics reset error:', error)
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Get performance grade based on average upload time
 */
function getPerformanceGrade(avgTime: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (avgTime === 0) return 'excellent' // No uploads yet
  if (avgTime < 2000) return 'excellent' // < 2s
  if (avgTime < 5000) return 'good'      // < 5s
  if (avgTime < 10000) return 'fair'     // < 10s
  return 'poor'                          // >= 10s
}

/**
 * Generate recommendations based on metrics
 */
function generateRecommendations(metrics: any, successRate: number): string[] {
  const recommendations: string[] = []

  if (successRate < 90) {
    recommendations.push('Success rate is below 90%. Investigate upload failures.')
  }

  if (metrics.averageUploadTime > 10000) {
    recommendations.push('Average upload time is over 10 seconds. Consider optimizing storage or network.')
  }

  if (metrics.errorBreakdown.network > metrics.totalAttempts * 0.3) {
    recommendations.push('High network error rate detected. Check connectivity and CDN performance.')
  }

  if (metrics.errorBreakdown.server > metrics.totalAttempts * 0.1) {
    recommendations.push('Server errors detected. Check storage service health and configuration.')
  }

  if (metrics.performanceStats.p95Time > 15000) {
    recommendations.push('95th percentile upload time is over 15 seconds. Investigate slow uploads.')
  }

  if (recommendations.length === 0) {
    recommendations.push('Upload performance looks good! No immediate action required.')
  }

  return recommendations
}