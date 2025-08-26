import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })

    // Get date ranges
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Fetch submissions with a reasonable limit for statistics
    // For large datasets, consider using aggregation queries instead
    const allSubmissions = await payload.find({
      collection: 'contact-submissions',
      limit: 1000, // Reasonable limit to prevent memory issues
      sort: '-createdAt',
    })

    // Calculate statistics - matching ContactStats interface
    const stats = {
      totalSubmissions: allSubmissions.totalDocs,
      totalToday: 0,
      totalThisWeek: 0,
      totalThisMonth: 0,
      statusBreakdown: {
        pending: 0,
        inProgress: 0,
        resolved: 0,
      },
      localeBreakdown: {
        fr: 0,
        ar: 0,
      },
      recentSubmissions: [],
      emailsSent: 0,
    }

    // Process each submission for statistics
    allSubmissions.docs.forEach((submission) => {
      const createdAt = new Date(submission.createdAt)
      
      // Time-based stats
      if (createdAt >= todayStart) stats.totalToday++
      if (createdAt >= weekStart) stats.totalThisWeek++
      if (createdAt >= monthStart) stats.totalThisMonth++
      
      // Status stats
      switch (submission.status) {
        case 'pending':
          stats.statusBreakdown.pending++
          break
        case 'in-progress':
          stats.statusBreakdown.inProgress++
          break
        case 'resolved':
          stats.statusBreakdown.resolved++
          break
      }
      
      // Locale stats
      if (submission.locale === 'fr') {
        stats.localeBreakdown.fr++
      } else if (submission.locale === 'ar') {
        stats.localeBreakdown.ar++
      }
      
      // Email stats
      if (submission.emailSent) stats.emailsSent++
    })

    // Get recent submissions (last 10)
    const recentSubmissions = await payload.find({
      collection: 'contact-submissions',
      limit: 10,
      sort: '-createdAt',
      select: {
        name: true,
        email: true,
        subject: true,
        status: true,
        emailSent: true,
        createdAt: true,
        locale: true,
        preferredLanguage: true,
      },
    })

    // Add recent submissions to stats
    stats.recentSubmissions = recentSubmissions.docs as any

    return NextResponse.json({
      success: true,
      stats,
      submissions: recentSubmissions.docs, // Dashboard expects 'submissions' not 'recent'
    })
  } catch (error) {
    // Log error in production monitoring system instead of console
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch statistics',
      },
      { status: 500 }
    )
  }
}