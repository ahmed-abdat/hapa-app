import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { 
  mediaContentReportSchema,
  mediaContentComplaintSchema,
  type MediaContentReportSubmission,
  type MediaContentComplaintSubmission,
  type FormSubmissionResponse
} from '@/lib/validations/media-forms'

export async function POST(request: NextRequest): Promise<NextResponse<FormSubmissionResponse>> {
  try {
    const payload = await getPayload({ config })
    const body = await request.json()

    // Validate the request has required fields
    if (!body.formType || !body.submittedAt || !body.locale) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields: formType, submittedAt, locale',
        },
        { status: 400 }
      )
    }

    let validationResult
    let submissionData: MediaContentReportSubmission | MediaContentComplaintSubmission

    // Validate based on form type
    if (body.formType === 'report') {
      validationResult = mediaContentReportSchema.safeParse(body)
      if (!validationResult.success) {
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid report form data',
          },
          { status: 400 }
        )
      }
      submissionData = body as MediaContentReportSubmission
    } else if (body.formType === 'complaint') {
      validationResult = mediaContentComplaintSchema.safeParse(body)
      if (!validationResult.success) {
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid complaint form data',
          },
          { status: 400 }
        )
      }
      submissionData = body as MediaContentComplaintSubmission
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid form type. Must be "report" or "complaint"',
        },
        { status: 400 }
      )
    }

    // Prepare data for Payload collection
    const collectionData = {
      formType: submissionData.formType as 'report' | 'complaint',
      submittedAt: submissionData.submittedAt,
      locale: ['fr', 'ar'].includes(submissionData.locale) ? submissionData.locale as 'fr' | 'ar' : 'fr',
      submissionStatus: 'pending' as 'pending' | 'reviewing' | 'resolved' | 'dismissed',
      priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
      
      // For complaints, include complainant information
      ...(submissionData.formType === 'complaint' && {
        complainantInfo: {
          fullName: (submissionData as MediaContentComplaintSubmission).fullName,
          emailAddress: (submissionData as MediaContentComplaintSubmission).emailAddress,
          phoneNumber: (submissionData as MediaContentComplaintSubmission).phoneNumber,
          whatsappNumber: (submissionData as MediaContentComplaintSubmission).whatsappNumber || '',
          profession: (submissionData as MediaContentComplaintSubmission).profession || '',
          relationshipToContent: formatRelationshipToContent(
            (submissionData as MediaContentComplaintSubmission).relationshipToContent,
            (submissionData as MediaContentComplaintSubmission).relationshipOther
          ),
        },
      }),

      // Content information
      contentInfo: {
        mediaType: formatMediaType(submissionData.mediaType, submissionData.mediaTypeOther),
        mediaTypeOther: submissionData.mediaTypeOther || '',
        programName: submissionData.programName,
        broadcastDateTime: submissionData.broadcastDateTime,
        linkScreenshot: submissionData.linkScreenshot || '',
      },

      // Reasons (convert array to format expected by collection)
      reasons: submissionData.reasons.map(reason => ({ reason: formatReason(reason) })),
      reasonOther: submissionData.reasonOther || '',

      // Content description
      description: submissionData.description,

      // Attachments
      attachmentTypes: submissionData.attachmentTypes?.map(type => ({ type: formatAttachmentType(type) })) || [],
      attachmentOther: submissionData.attachmentOther || '',
    }

    // Create the submission in Payload
    const result = await payload.create({
      collection: 'media-content-submissions',
      data: collectionData,
    })

    return NextResponse.json(
      {
        success: true,
        message: submissionData.formType === 'report' 
          ? 'Report submitted successfully' 
          : 'Complaint submitted successfully',
        submissionId: result.id.toString(),
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Media form submission error:', error)
    
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error. Please try again later.',
      },
      { status: 500 }
    )
  }
}

// Helper functions to format enum values for display
function formatMediaType(type: string, other?: string): string {
  const typeMap: Record<string, string> = {
    television: 'Télévision',
    radio: 'Radio',
    website: 'Site web',
    youtube: 'YouTube',
    facebook: 'Facebook (page publique)',
    other: other || 'Autre',
  }
  return typeMap[type] || type
}

function formatRelationshipToContent(relationship?: string, other?: string): string {
  if (!relationship) return ''
  
  const relationshipMap: Record<string, string> = {
    viewer: 'Téléspectateur / Internaute',
    directlyConcerned: 'Directement concerné',
    journalist: 'Journaliste',
    other: other || 'Autre',
  }
  return relationshipMap[relationship] || relationship
}

function formatReason(reason: string): string {
  const reasonMap: Record<string, string> = {
    hateSpeech: 'Discours de haine / Incitation à la violence',
    misinformation: 'Désinformation / Informations mensongères',
    fakeNews: 'Désinformation / Fake news',
    privacyViolation: 'Atteinte à la vie privée / Diffamation',
    shockingContent: 'Contenu choquant / Violent / Inapproprié',
    pluralismViolation: 'Non-respect du pluralisme politique',
    falseAdvertising: 'Publicité mensongère ou interdite',
    other: 'Autre',
  }
  return reasonMap[reason] || reason
}

function formatAttachmentType(type: string): string {
  const typeMap: Record<string, string> = {
    screenshot: 'Capture d\'écran',
    videoLink: 'Lien vers une vidéo / page',
    writtenStatement: 'Déclaration écrite',
    audioRecording: 'Enregistrement audio',
    other: 'Autre',
  }
  return typeMap[type] || type
}