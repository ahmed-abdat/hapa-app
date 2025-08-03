import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { SubmissionStatus, SubmissionPriority } from '@/types/media-forms'

interface SubmissionUpdateData {
  submissionStatus?: SubmissionStatus
  priority?: SubmissionPriority
  adminNotes?: string
  resolution?: {
    resolvedAt: string
    resolvedBy: string
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params
    const { id } = await params
    
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

    // Parse request body
    const body = await req.json()
    const { submissionStatus, priority, adminNotes } = body

    // Prepare update data
    const updateData: SubmissionUpdateData = {}
    
    if (submissionStatus !== undefined) {
      updateData.submissionStatus = submissionStatus
    }
    
    if (priority !== undefined) {
      updateData.priority = priority
    }
    
    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes
    }

    // If status is being changed to resolved or dismissed, update resolution details
    if (submissionStatus === 'resolved' || submissionStatus === 'dismissed') {
      updateData.resolution = {
        resolvedAt: new Date().toISOString(),
        resolvedBy: user.email || String(user.id),
      }
    }

    // Update the submission
    const updatedSubmission = await payload.update({
      collection: 'media-content-submissions',
      id: id,
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      submission: updatedSubmission,
    })
  } catch (error) {
    // Error handled in response
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}