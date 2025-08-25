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

    // Fetch all submissions for statistics
    const allSubmissions = await payload.find({
      collection: 'contact-submissions',
      limit: 0, // Get all
      sort: '-createdAt',
    })

    // Calculate statistics
    const stats = {
      total: allSubmissions.totalDocs,
      today: 0,
      week: 0,
      month: 0,
      pending: 0,
      inProgress: 0,
      resolved: 0,
      emailsSent: 0,
    }

    // Process each submission for statistics
    allSubmissions.docs.forEach((submission) => {
      const createdAt = new Date(submission.createdAt)
      
      // Time-based stats
      if (createdAt >= todayStart) stats.today++
      if (createdAt >= weekStart) stats.week++
      if (createdAt >= monthStart) stats.month++
      
      // Status stats
      switch (submission.status) {
        case 'pending':
          stats.pending++
          break
        case 'in-progress':
          stats.inProgress++
          break
        case 'resolved':
          stats.resolved++
          break
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

    return NextResponse.json({
      success: true,
      stats,
      recent: recentSubmissions.docs,
    })
  } catch (error) {
    console.error('Error fetching contact submissions stats:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch statistics',
      },
      { status: 500 }
    )
  }
}