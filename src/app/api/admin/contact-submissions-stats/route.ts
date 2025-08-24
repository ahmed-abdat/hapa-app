import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { ContactSubmission } from '@/payload-types'

export async function GET() {
  try {
    const payload = await getPayload({ config })
    
    // Get all contact submissions
    const result = await payload.find({
      collection: 'contact-submissions',
      depth: 0,
      limit: 1000,
      sort: '-createdAt',
    })
    
    const submissions = result.docs as ContactSubmission[]
    
    // Calculate statistics
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const stats = {
      totalSubmissions: submissions.length,
      totalToday: submissions.filter(sub => 
        new Date(sub.createdAt) >= startOfToday
      ).length,
      totalThisWeek: submissions.filter(sub => 
        new Date(sub.createdAt) >= startOfWeek
      ).length,
      totalThisMonth: submissions.filter(sub => 
        new Date(sub.createdAt) >= startOfMonth
      ).length,
      statusBreakdown: {
        pending: submissions.filter(sub => sub.status === 'pending').length,
        inProgress: submissions.filter(sub => sub.status === 'in-progress').length,
        resolved: submissions.filter(sub => sub.status === 'resolved').length,
      },
      localeBreakdown: {
        fr: submissions.filter(sub => sub.locale === 'fr').length,
        ar: submissions.filter(sub => sub.locale === 'ar').length,
      },
      recentSubmissions: submissions.slice(0, 10) // Get the 10 most recent
    }
    
    return NextResponse.json({
      success: true,
      stats,
      submissions: submissions.slice(0, 20) // Return recent submissions for the dashboard
    })
    
  } catch (error: any) {
    console.error('Contact submissions stats API error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch contact submissions statistics',
        details: error.message
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'