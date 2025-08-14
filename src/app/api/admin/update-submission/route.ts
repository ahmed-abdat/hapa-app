import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { logger } from '@/utilities/logger'

interface UpdateSubmissionRequest {
  submissionId: string
  updates: {
    submissionStatus?: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
    priority?: 'low' | 'medium' | 'high' | 'urgent'
    internalNotes?: string
    assignedTo?: string
  }
}

interface BulkUpdateRequest {
  submissionIds: string[]
  updates: {
    submissionStatus?: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
    priority?: 'low' | 'medium' | 'high' | 'urgent'
    assignedTo?: string
  }
}

// PATCH - Update single submission
export async function PATCH(req: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    
    // Check authentication
    const { user } = await payload.auth({ headers: req.headers })
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: UpdateSubmissionRequest = await req.json()
    const { submissionId, updates } = body

    if (!submissionId || !updates) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Update the submission
    const updatedSubmission = await payload.update({
      collection: 'media-content-submissions',
      id: submissionId,
      data: {
        ...updates,
        updatedAt: new Date().toISOString(),
      },
    })

    logger.info('Submission updated via dashboard', {
      component: 'AdminDashboard',
      action: 'update_submission',
      metadata: {
        submissionId,
        updatedFields: Object.keys(updates),
        userId: user.id,
      },
    })

    return NextResponse.json({
      success: true,
      submission: updatedSubmission,
    })
  } catch (error) {
    logger.error('Error updating submission', error as Error, {
      component: 'AdminDashboard',
      action: 'update_submission_error',
    })

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Bulk update submissions
export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    
    // Check authentication
    const { user } = await payload.auth({ headers: req.headers })
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: BulkUpdateRequest = await req.json()
    const { submissionIds, updates } = body

    if (!submissionIds?.length || !updates) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Perform bulk update
    const updatePromises = submissionIds.map(async (id) => {
      try {
        return await payload.update({
          collection: 'media-content-submissions',
          id,
          data: {
            ...updates,
            updatedAt: new Date().toISOString(),
          },
        })
      } catch (error) {
        logger.warn('Failed to update submission in bulk operation', {
          component: 'AdminDashboard',
          action: 'bulk_update_item_failed',
          metadata: { submissionId: id, error: error instanceof Error ? error.message : String(error) },
        })
        return null
      }
    })

    const results = await Promise.all(updatePromises)
    const successful = results.filter(result => result !== null)
    const failed = submissionIds.length - successful.length

    logger.info('Bulk update completed', {
      component: 'AdminDashboard',
      action: 'bulk_update_submissions',
      metadata: {
        total: submissionIds.length,
        successful: successful.length,
        failed,
        updatedFields: Object.keys(updates),
        userId: user.id,
      },
    })

    return NextResponse.json({
      success: true,
      updated: successful.length,
      failed,
      results: successful,
    })
  } catch (error) {
    logger.error('Error in bulk update', error as Error, {
      component: 'AdminDashboard',
      action: 'bulk_update_error',
    })

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Bulk delete submissions
export async function DELETE(req: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    
    // Check authentication
    const { user } = await payload.auth({ headers: req.headers })
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const submissionIds = searchParams.get('ids')?.split(',') || []

    if (!submissionIds.length) {
      return NextResponse.json(
        { success: false, error: 'No submission IDs provided' },
        { status: 400 }
      )
    }

    // Perform bulk delete
    // Note: Each payload.delete() call automatically triggers the beforeDelete hook
    // in MediaContentSubmissions collection, which handles FormMedia cleanup via cleanupFormMediaHook
    const deletePromises = submissionIds.map(async (id) => {
      try {
        await payload.delete({
          collection: 'media-content-submissions',
          id,
        })
        return id
      } catch (error) {
        logger.warn('Failed to delete submission in bulk operation', {
          component: 'AdminDashboard',
          action: 'bulk_delete_item_failed',
          metadata: { submissionId: id, error: error instanceof Error ? error.message : String(error) },
        })
        return null
      }
    })

    const results = await Promise.all(deletePromises)
    const successful = results.filter(result => result !== null)
    const failed = submissionIds.length - successful.length

    logger.info('Bulk delete completed', {
      component: 'AdminDashboard',
      action: 'bulk_delete_submissions',
      metadata: {
        total: submissionIds.length,
        successful: successful.length,
        failed,
        userId: user.id,
      },
    })

    return NextResponse.json({
      success: true,
      deleted: successful.length,
      failed,
    })
  } catch (error) {
    logger.error('Error in bulk delete', error as Error, {
      component: 'AdminDashboard',
      action: 'bulk_delete_error',
    })

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}