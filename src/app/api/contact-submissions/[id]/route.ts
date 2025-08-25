import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const payload = await getPayload({ config })
    
    const submission = await payload.findByID({
      collection: 'contact-submissions',
      id: params.id,
    })

    if (!submission) {
      return NextResponse.json(
        {
          success: false,
          error: 'Submission not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json(submission)
  } catch (error) {
    console.error('Error fetching contact submission:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch submission',
      },
      { status: 500 }
    )
  }
}