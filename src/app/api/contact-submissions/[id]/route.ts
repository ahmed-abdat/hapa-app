import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payload = await getPayload({ config })
    
    const submission = await payload.findByID({
      collection: 'contact-submissions',
      id,
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
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch submission',
      },
      { status: 500 }
    )
  }
}

// Handle PATCH requests from Payload admin
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payload = await getPayload({ config })
    
    // Validate content type
    const contentType = request.headers.get('content-type') || ''
    
    let data
    
    // Handle multipart/form-data from Payload admin
    if (contentType.includes('multipart/form-data')) {
      try {
        const formData = await request.formData()
        
        // Look for the _payload field which contains the JSON data
        const payloadField = formData.get('_payload')
        
        if (!payloadField) {
          return NextResponse.json(
            { success: false, error: 'Missing payload data' },
            { status: 400 }
          )
        }
        
        // Parse the JSON from the _payload field
        data = JSON.parse(payloadField.toString())
      } catch (formError) {
        return NextResponse.json(
          { success: false, error: 'Invalid form data' },
          { status: 400 }
        )
      }
    } 
    // Handle regular JSON requests
    else if (contentType.includes('application/json')) {
      try {
        data = await request.json()
      } catch (jsonError) {
        return NextResponse.json(
          { success: false, error: 'Invalid JSON in request body' },
          { status: 400 }
        )
      }
    }
    // Fallback to text parsing
    else {
      try {
        const text = await request.text()
        
        if (!text || text.trim() === '') {
          return NextResponse.json(
            { success: false, error: 'Empty request body' },
            { status: 400 }
          )
        }
        
        data = JSON.parse(text)
      } catch (parseError) {
        return NextResponse.json(
          { success: false, error: 'Invalid request body' },
          { status: 400 }
        )
      }
    }
    
    const updated = await payload.update({
      collection: 'contact-submissions',
      id,
      data: data,
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update submission',
      },
      { status: 500 }
    )
  }
}