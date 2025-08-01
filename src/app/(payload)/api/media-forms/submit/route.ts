import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getValidationMessages } from '@/lib/validations/validation-messages'
import type {
  MediaContentReportSubmission,
  MediaContentComplaintSubmission,
  FormSubmissionResponse,
  PayloadSubmissionData,
  MediaType,
  TVChannel,
  RadioStation
} from '@/types/media-forms'
import { getTranslations } from 'next-intl/server'

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

    // Get locale from request headers or default to 'fr'
    const acceptLanguage = request.headers.get('accept-language') || 'fr'
    const locale = acceptLanguage.includes('ar') ? 'ar' : 'fr'
    
    // Get translations for validation messages
    const t = await getTranslations({ locale })

    // Basic validation for both form types
    const requiredFields = ['formType', 'mediaType', 'programName', 'broadcastDateTime', 'reasons', 'description']
    
    if (body.formType === 'complaint') {
      // Complaint forms require complainant info
      requiredFields.push('fullName', 'gender', 'country', 'emailAddress', 'phoneNumber')
    }

    // Check required fields
    for (const field of requiredFields) {
      if (!body[field] || (typeof body[field] === 'string' && body[field].trim() === '')) {
        return NextResponse.json(
          {
            success: false,
            message: `Missing required field: ${field}`,
          },
          { status: 400 }
        )
      }
    }

    // Validate email format if provided
    if (body.emailAddress) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(body.emailAddress)) {
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid email address format',
          },
          { status: 400 }
        )
      }
    }

    // Validate reasons array
    if (!Array.isArray(body.reasons) || body.reasons.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'At least one reason must be selected',
        },
        { status: 400 }
      )
    }

    if (body.formType === 'report') {
      submissionData = body as MediaContentReportSubmission
    } else if (body.formType === 'complaint') {
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
          gender: formatGender((submissionData as MediaContentComplaintSubmission).gender),
          country: (submissionData as MediaContentComplaintSubmission).country,
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
        specificChannel: getSpecificChannel(submissionData),
        programName: submissionData.programName,
        broadcastDateTime: submissionData.broadcastDateTime,
        linkScreenshot: submissionData.linkScreenshot || '',
        screenshotFiles: (submissionData.screenshotFiles || []).map((url: string) => ({ url })),
      },

      // Reasons (convert array to format expected by collection)
      reasons: submissionData.reasons.map(reason => ({ reason: formatReason(reason) })),
      reasonOther: submissionData.reasonOther || '',

      // Content description
      description: submissionData.description,

      // Attachments
      attachmentTypes: submissionData.attachmentTypes?.map(type => ({ type: formatAttachmentType(type) })) || [],
      attachmentOther: submissionData.attachmentOther || '',
      attachmentFiles: (submissionData.attachmentFiles || []).map((url: string) => ({ url })),
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

function formatGender(gender: string): string {
  const genderMap: Record<string, string> = {
    male: 'Homme',
    female: 'Femme',
  }
  return genderMap[gender] || gender
}

function getSpecificChannel(data: MediaContentReportSubmission | MediaContentComplaintSubmission): string {
  if (data.mediaType === 'television' && data.tvChannel) {
    return formatTVChannel(data.tvChannel, data.tvChannelOther)
  }
  if (data.mediaType === 'radio' && data.radioStation) {
    return formatRadioStation(data.radioStation, data.radioStationOther)
  }
  return ''
}

function formatTVChannel(channel: string, other?: string): string {
  const channelMap: Record<string, string> = {
    mouritaniya: 'الموريتانية / El Mouritaniya',
    mouritaniya2: 'الموريتانية 2 / El Mouritaniya 2',
    thakafiya: 'الثقافية / Thakafiya',
    riyadiya: 'الرياضية / Riyadiya',
    parlement: 'البرلمانية / Parlement TV',
    mahdhara: 'المحظرة / Al Mahdhara TV',
    ousra: 'الأسرة / Al Ousra TV',
    mourabitoune: 'المرابطون / El Mourabitoune',
    wataniya: 'الوطنية / El Wataniya',
    chinguitt: 'شنقيط / Chinguitt',
    sahel: 'الساحل / Sahel TV',
    dava: 'دافا / DAVA TV',
    medina: 'المدينة / Elmedina TV',
    sahra24: 'صحراء 24 / Sahra24 TV',
    ghimem: 'قمم / Ghimem TV',
    other: other || 'Autre chaîne',
  }
  return channelMap[channel] || channel
}

function formatRadioStation(station: string, other?: string): string {
  const stationMap: Record<string, string> = {
    'radio-mauritanie': 'إذاعة موريتانيا الأم / Radio Mauritanie',
    'radio-coran': 'إذاعة القرآن الكريم / Radio Coran',
    'radio-scolaire': 'الإذاعة المدرسية / Radio Scolaire',
    'radio-jeunesse': 'إذاعة الشباب / Radio Jeunesse',
    'radio-culture': 'الإذاعة الثقافية / Radio Culture',
    'radio-sante': 'إذاعة التثقيف الصحي / Radio Éducation à la santé',
    'radio-rurale': 'الإذاعة الريفية / Radio Rurale',
    'radio-mauritanides': 'إذاعة موريتانيد / Radio Mauritanides',
    'radio-koubeni': 'إذاعة كوبني / Radio Koubeni',
    'radio-tenwir': 'إذاعة التنوير / Radio Tenwir',
    other: other || 'Autre station',
  }
  return stationMap[station] || station
}