import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { logger } from '@/utilities/logger'

// Cache for stats with 5-minute TTL
const statsCache = new WeakMap<object, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

interface SubmissionStats {
  totalSubmissions: number
  reportSubmissions: number
  complaintSubmissions: number
  pendingCount: number
  reviewingCount: number
  resolvedCount: number
  dismissedCount: number
  todaySubmissions: number
  weekSubmissions: number
  monthSubmissions: number
  urgentCount: number
  highCount: number
  mediumCount: number
  lowCount: number
  frenchSubmissions: number
  arabicSubmissions: number
  mediaTypeStats: {
    television: number
    radio: number
    online: number
    print: number
    other: number
  }
  reportStats: {
    total: number
    pending: number
    reviewing: number
    resolved: number
    dismissed: number
    french: number
    arabic: number
    thisWeek: number
    thisMonth: number
  }
  complaintStats: {
    total: number
    pending: number
    reviewing: number
    resolved: number
    dismissed: number
    french: number
    arabic: number
    thisWeek: number
    thisMonth: number
  }
}

interface Submission {
  id: string
  title: string
  formType: 'report' | 'complaint'
  submissionStatus: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  submittedAt: string
  locale: 'fr' | 'ar'
  contentInfo?: {
    programName?: string
    mediaType?: string
  }
  complainantInfo?: {
    fullName?: string
    emailAddress?: string
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get Payload instance
    const payload = await getPayload({ config: configPromise })
    
    // Check if user is authenticated
    const { user } = await payload.auth({ headers: req.headers })
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check cache
    const cached = statsCache.get(payload)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        ...cached.data,
      })
    }

    // Fetch submissions with performance optimization
    const allSubmissions = await payload.find({
      collection: 'media-content-submissions',
      limit: 1000, // Reasonable limit for performance
      select: {
        title: true,
        formType: true,
        submissionStatus: true,
        priority: true,
        submittedAt: true,
        locale: true,
        contentInfo: true,
        complainantInfo: true,
      },
      sort: '-submittedAt',
    })

    // Calculate date ranges
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Initialize stats
    const stats: SubmissionStats = {
      totalSubmissions: 0,
      reportSubmissions: 0,
      complaintSubmissions: 0,
      pendingCount: 0,
      reviewingCount: 0,
      resolvedCount: 0,
      dismissedCount: 0,
      todaySubmissions: 0,
      weekSubmissions: 0,
      monthSubmissions: 0,
      urgentCount: 0,
      highCount: 0,
      mediumCount: 0,
      lowCount: 0,
      frenchSubmissions: 0,
      arabicSubmissions: 0,
      mediaTypeStats: {
        television: 0,
        radio: 0,
        online: 0,
        print: 0,
        other: 0,
      },
      reportStats: {
        total: 0,
        pending: 0,
        reviewing: 0,
        resolved: 0,
        dismissed: 0,
        french: 0,
        arabic: 0,
        thisWeek: 0,
        thisMonth: 0,
      },
      complaintStats: {
        total: 0,
        pending: 0,
        reviewing: 0,
        resolved: 0,
        dismissed: 0,
        french: 0,
        arabic: 0,
        thisWeek: 0,
        thisMonth: 0,
      },
    }

    // Process submissions
    const recentSubmissions: Submission[] = []
    
    allSubmissions.docs.forEach((submission: any) => {
      const submittedDate = new Date(submission.submittedAt)
      
      // Basic counts
      stats.totalSubmissions++
      
      if (submission.formType === 'report') {
        stats.reportSubmissions++
        stats.reportStats.total++
        
        if (submission.locale === 'fr') stats.reportStats.french++
        else stats.reportStats.arabic++
        
        if (submittedDate >= weekAgo) stats.reportStats.thisWeek++
        if (submittedDate >= monthAgo) stats.reportStats.thisMonth++
        
        // Status counts for reports
        switch (submission.submissionStatus) {
          case 'pending': stats.reportStats.pending++; break
          case 'reviewing': stats.reportStats.reviewing++; break
          case 'resolved': stats.reportStats.resolved++; break
          case 'dismissed': stats.reportStats.dismissed++; break
        }
      } else {
        stats.complaintSubmissions++
        stats.complaintStats.total++
        
        if (submission.locale === 'fr') stats.complaintStats.french++
        else stats.complaintStats.arabic++
        
        if (submittedDate >= weekAgo) stats.complaintStats.thisWeek++
        if (submittedDate >= monthAgo) stats.complaintStats.thisMonth++
        
        // Status counts for complaints
        switch (submission.submissionStatus) {
          case 'pending': stats.complaintStats.pending++; break
          case 'reviewing': stats.complaintStats.reviewing++; break
          case 'resolved': stats.complaintStats.resolved++; break
          case 'dismissed': stats.complaintStats.dismissed++; break
        }
      }
      
      // Status counts (overall)
      switch (submission.submissionStatus) {
        case 'pending': stats.pendingCount++; break
        case 'reviewing': stats.reviewingCount++; break
        case 'resolved': stats.resolvedCount++; break
        case 'dismissed': stats.dismissedCount++; break
      }
      
      // Priority counts
      switch (submission.priority) {
        case 'urgent': stats.urgentCount++; break
        case 'high': stats.highCount++; break
        case 'medium': stats.mediumCount++; break
        case 'low': stats.lowCount++; break
      }
      
      // Language counts
      if (submission.locale === 'fr') {
        stats.frenchSubmissions++
      } else {
        stats.arabicSubmissions++
      }
      
      // Time-based counts
      if (submittedDate >= today) {
        stats.todaySubmissions++
      }
      if (submittedDate >= weekAgo) {
        stats.weekSubmissions++
      }
      if (submittedDate >= monthAgo) {
        stats.monthSubmissions++
      }
      
      // Media type stats
      const mediaType = submission.contentInfo?.mediaType?.toLowerCase()
      if (mediaType === 'television' || mediaType === 'tv' || mediaType === 'télévision') {
        stats.mediaTypeStats.television++
      } else if (mediaType === 'radio') {
        stats.mediaTypeStats.radio++
      } else if (mediaType === 'online' || mediaType === 'internet' || mediaType === 'en ligne') {
        stats.mediaTypeStats.online++
      } else if (mediaType === 'print' || mediaType === 'presse' || mediaType === 'journal') {
        stats.mediaTypeStats.print++
      } else if (mediaType) {
        stats.mediaTypeStats.other++
      }
      
      // Add to recent submissions (limit to first 50 for performance)
      if (recentSubmissions.length < 50) {
        recentSubmissions.push({
          id: submission.id,
          title: submission.title || 'Sans titre',
          formType: submission.formType,
          submissionStatus: submission.submissionStatus,
          priority: submission.priority || 'medium',
          submittedAt: submission.submittedAt,
          locale: submission.locale,
          contentInfo: submission.contentInfo,
          complainantInfo: submission.complainantInfo,
        })
      }
    })

    const result = {
      stats,
      submissions: recentSubmissions,
    }

    // Cache the result
    statsCache.set(payload, {
      data: result,
      timestamp: Date.now(),
    })

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    logger.error('Error fetching media submissions stats', error, {
      component: 'MediaSubmissionsStatsAPI',
      action: 'fetch_stats_error',
      metadata: { 
        endpoint: '/api/admin/media-submissions-stats',
        method: 'GET'
      }
    })
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}