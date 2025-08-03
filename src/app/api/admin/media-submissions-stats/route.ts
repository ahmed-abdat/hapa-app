import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { PayloadSubmissionData } from '@/types/media-forms'
import { logger } from '@/utilities/logger'

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Simple cache using WeakMap to avoid memory leaks in serverless environment
const cacheWeakMap = new WeakMap()
const cacheKey = { key: 'stats-cache' }

interface PayloadSubmissionDocument extends PayloadSubmissionData {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  adminNotes?: string
}

export async function GET(req: NextRequest) {
  try {
    // Check cache first
    const cachedData = cacheWeakMap.get(cacheKey)
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      return NextResponse.json(cachedData.data)
    }

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

    // Fetch recent submissions with optimized query
    const submissions = await payload.find({
      collection: 'media-content-submissions',
      limit: 100, // Reduced for better performance
      sort: '-submittedAt',
      select: {
        id: true,
        formType: true,
        submissionStatus: true,
        priority: true,
        submittedAt: true,
        locale: true,
        contentInfo: true,
        complainantInfo: true,
        description: true,
        reasons: true,
        adminNotes: true,
      },
    })

    // Process statistics
    const stats = {
      totalSubmissions: submissions.totalDocs,
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

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Process each submission for statistics
    submissions.docs.forEach((submission: PayloadSubmissionDocument) => {
      const submittedDate = new Date(submission.submittedAt)

      // Form type counts
      if (submission.formType === 'report') {
        stats.reportSubmissions++
        stats.reportStats.total++
        
        // Status counts for reports
        switch (submission.submissionStatus) {
          case 'pending':
            stats.reportStats.pending++
            break
          case 'reviewing':
            stats.reportStats.reviewing++
            break
          case 'resolved':
            stats.reportStats.resolved++
            break
          case 'dismissed':
            stats.reportStats.dismissed++
            break
        }

        // Language counts for reports
        if (submission.locale === 'fr') {
          stats.reportStats.french++
        } else if (submission.locale === 'ar') {
          stats.reportStats.arabic++
        }

        // Time-based counts for reports
        if (submittedDate >= weekAgo) {
          stats.reportStats.thisWeek++
        }
        if (submittedDate >= monthStart) {
          stats.reportStats.thisMonth++
        }
      } else if (submission.formType === 'complaint') {
        stats.complaintSubmissions++
        stats.complaintStats.total++
        
        // Status counts for complaints
        switch (submission.submissionStatus) {
          case 'pending':
            stats.complaintStats.pending++
            break
          case 'reviewing':
            stats.complaintStats.reviewing++
            break
          case 'resolved':
            stats.complaintStats.resolved++
            break
          case 'dismissed':
            stats.complaintStats.dismissed++
            break
        }

        // Language counts for complaints
        if (submission.locale === 'fr') {
          stats.complaintStats.french++
        } else if (submission.locale === 'ar') {
          stats.complaintStats.arabic++
        }

        // Time-based counts for complaints
        if (submittedDate >= weekAgo) {
          stats.complaintStats.thisWeek++
        }
        if (submittedDate >= monthStart) {
          stats.complaintStats.thisMonth++
        }
      }

      // Overall status counts
      switch (submission.submissionStatus) {
        case 'pending':
          stats.pendingCount++
          break
        case 'reviewing':
          stats.reviewingCount++
          break
        case 'resolved':
          stats.resolvedCount++
          break
        case 'dismissed':
          stats.dismissedCount++
          break
      }

      // Priority counts
      switch (submission.priority) {
        case 'urgent':
          stats.urgentCount++
          break
        case 'high':
          stats.highCount++
          break
        case 'medium':
          stats.mediumCount++
          break
        case 'low':
          stats.lowCount++
          break
      }

      // Language counts
      if (submission.locale === 'fr') {
        stats.frenchSubmissions++
      } else if (submission.locale === 'ar') {
        stats.arabicSubmissions++
      }

      // Time-based counts
      if (submittedDate >= today) {
        stats.todaySubmissions++
      }
      if (submittedDate >= weekAgo) {
        stats.weekSubmissions++
      }
      if (submittedDate >= monthStart) {
        stats.monthSubmissions++
      }

      // Media type counts (if available)
      if (submission.contentInfo?.mediaType) {
        const mediaType = submission.contentInfo.mediaType.toLowerCase()
        if (mediaType.includes('television') || mediaType.includes('tv')) {
          stats.mediaTypeStats.television++
        } else if (mediaType.includes('radio')) {
          stats.mediaTypeStats.radio++
        } else if (mediaType.includes('online') || mediaType.includes('web') || mediaType.includes('internet')) {
          stats.mediaTypeStats.online++
        } else if (mediaType.includes('print') || mediaType.includes('journal') || mediaType.includes('magazine')) {
          stats.mediaTypeStats.print++
        } else {
          stats.mediaTypeStats.other++
        }
      }
    })

    // Prepare submissions data for table
    const submissionsData = submissions.docs.map((submission: PayloadSubmissionDocument) => ({
      id: submission.id,
      title: submission.title,
      formType: submission.formType,
      submissionStatus: submission.submissionStatus,
      priority: submission.priority,
      submittedAt: submission.submittedAt,
      locale: submission.locale,
      contentInfo: submission.contentInfo,
      complainantInfo: submission.complainantInfo,
      description: submission.description,
      reasons: submission.reasons,
      adminNotes: submission.adminNotes,
    }))

    const response = {
      success: true,
      stats,
      submissions: submissionsData,
    }

    // Cache the response
    cacheWeakMap.set(cacheKey, {
      data: response,
      timestamp: Date.now(),
    })

    return NextResponse.json(response)
  } catch (error) {
    logger.error('Error fetching media submissions stats:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}