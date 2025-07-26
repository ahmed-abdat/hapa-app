import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const payload = await getPayload({ config })

    // Check if user is authenticated
    const { user } = await payload.auth({ headers: request.headers })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch all media content submissions
    const submissions = await payload.find({
      collection: 'media-content-submissions',
      limit: 1000, // Adjust based on expected volume
      depth: 1,
    })

    const docs = submissions.docs

    // Calculate statistics
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Separate by form type for detailed analysis
    const reportDocs = docs.filter(s => s.formType === 'report')
    const complaintDocs = docs.filter(s => s.formType === 'complaint')

    const stats = {
      totalSubmissions: docs.length,
      reportSubmissions: reportDocs.length,
      complaintSubmissions: complaintDocs.length,
      
      // Status counts (overall)
      pendingCount: docs.filter(s => s.submissionStatus === 'pending').length,
      reviewingCount: docs.filter(s => s.submissionStatus === 'reviewing').length,
      resolvedCount: docs.filter(s => s.submissionStatus === 'resolved').length,
      dismissedCount: docs.filter(s => s.submissionStatus === 'dismissed').length,
      
      // Time-based counts
      todaySubmissions: docs.filter(s => new Date(s.submittedAt) >= today).length,
      weekSubmissions: docs.filter(s => new Date(s.submittedAt) >= weekAgo).length,
      monthSubmissions: docs.filter(s => new Date(s.submittedAt) >= monthStart).length,
      
      // Priority counts
      urgentCount: docs.filter(s => s.priority === 'urgent').length,
      highCount: docs.filter(s => s.priority === 'high').length,
      mediumCount: docs.filter(s => s.priority === 'medium').length,
      lowCount: docs.filter(s => s.priority === 'low').length,

      // Language breakdown
      frenchSubmissions: docs.filter(s => s.locale === 'fr').length,
      arabicSubmissions: docs.filter(s => s.locale === 'ar').length,

      // Media type breakdown (for reports)
      mediaTypeStats: {
        television: docs.filter(s => s.contentInfo?.mediaType === 'television').length,
        radio: docs.filter(s => s.contentInfo?.mediaType === 'radio').length,
        online: docs.filter(s => s.contentInfo?.mediaType === 'online').length,
        print: docs.filter(s => s.contentInfo?.mediaType === 'print').length,
        other: docs.filter(s => s.contentInfo?.mediaType === 'other').length,
      },

      // Report-specific statistics
      reportStats: {
        total: reportDocs.length,
        pending: reportDocs.filter(s => s.submissionStatus === 'pending').length,
        reviewing: reportDocs.filter(s => s.submissionStatus === 'reviewing').length,
        resolved: reportDocs.filter(s => s.submissionStatus === 'resolved').length,
        dismissed: reportDocs.filter(s => s.submissionStatus === 'dismissed').length,
        french: reportDocs.filter(s => s.locale === 'fr').length,
        arabic: reportDocs.filter(s => s.locale === 'ar').length,
        thisWeek: reportDocs.filter(s => new Date(s.submittedAt) >= weekAgo).length,
        thisMonth: reportDocs.filter(s => new Date(s.submittedAt) >= monthStart).length,
      },

      // Complaint-specific statistics
      complaintStats: {
        total: complaintDocs.length,
        pending: complaintDocs.filter(s => s.submissionStatus === 'pending').length,
        reviewing: complaintDocs.filter(s => s.submissionStatus === 'reviewing').length,
        resolved: complaintDocs.filter(s => s.submissionStatus === 'resolved').length,
        dismissed: complaintDocs.filter(s => s.submissionStatus === 'dismissed').length,
        french: complaintDocs.filter(s => s.locale === 'fr').length,
        arabic: complaintDocs.filter(s => s.locale === 'ar').length,
        thisWeek: complaintDocs.filter(s => new Date(s.submittedAt) >= weekAgo).length,
        thisMonth: complaintDocs.filter(s => new Date(s.submittedAt) >= monthStart).length,
      },
    }

    // Prepare submission summaries
    const submissionSummaries = docs.map(doc => ({
      id: doc.id,
      title: doc.title,
      formType: doc.formType,
      submissionStatus: doc.submissionStatus,
      priority: doc.priority,
      submittedAt: doc.submittedAt,
      locale: doc.locale,
      contentInfo: {
        programName: doc.contentInfo?.programName || '',
        mediaType: doc.contentInfo?.mediaType || '',
      },
      complainantInfo: doc.complainantInfo ? {
        fullName: doc.complainantInfo.fullName || '',
        emailAddress: doc.complainantInfo.emailAddress || '',
      } : null,
    }))

    return NextResponse.json({
      success: true,
      stats,
      submissions: submissionSummaries,
    })

  } catch (error) {
    console.error('Error fetching media submissions stats:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

// Only allow GET requests
export const dynamic = 'force-dynamic'