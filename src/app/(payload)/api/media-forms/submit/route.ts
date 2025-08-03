import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getValidationMessages } from '@/lib/validations/validation-messages'
import { 
  createMediaContentReportSchema,
  createMediaContentComplaintSchema
} from '@/lib/validations/media-forms'
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
import { logger } from '@/utilities/logger'

// Type interfaces for request validation
interface BasicRequestBody {
  formType?: unknown;
  submittedAt?: unknown;
  locale?: unknown;
  [key: string]: unknown;
}

// Type guard functions
function isValidFormType(value: unknown): value is 'report' | 'complaint' {
  return typeof value === 'string' && ['report', 'complaint'].includes(value);
}

function isValidLocale(value: unknown): value is 'fr' | 'ar' {
  return typeof value === 'string' && ['fr', 'ar'].includes(value);
}

function getStringValue(value: unknown, fallback: string = 'unknown'): string {
  return typeof value === 'string' ? value : fallback;
}

export async function POST(request: NextRequest): Promise<NextResponse<FormSubmissionResponse>> {
  let body: BasicRequestBody | null = null
  
  try {
    const payload = await getPayload({ config })
    body = await request.json()

    // Log the incoming request body for debugging
    logger.log('🔍 API received body:', JSON.stringify(body, null, 2))

    // Validate the request has required fields
    if (!body || !isValidFormType(body.formType) || !body.submittedAt || !isValidLocale(body.locale)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing or invalid required fields: formType, submittedAt, locale',
        },
        { status: 400 }
      )
    }

    let submissionData: MediaContentReportSubmission | MediaContentComplaintSubmission

    // Get locale from request headers or default to 'fr'
    const acceptLanguage = request.headers.get('accept-language') || 'fr'
    const locale = acceptLanguage.includes('ar') ? 'ar' : 'fr'
    
    // Get translations for validation messages
    const t = await getTranslations({ locale })

    // TypeScript now knows body.formType is valid due to the type guard above
    const formType = body.formType; // This is now properly typed as 'report' | 'complaint'
    const submissionLocale = body.locale; // This is now properly typed as 'fr' | 'ar'

    // Use appropriate Zod schema based on form type
    try {
      if (formType === 'report') {
        const reportSchema = createMediaContentReportSchema(t)
        const validationResult = reportSchema.parse(body)
        submissionData = {
          ...validationResult,
          formType: 'report',
          submittedAt: body.submittedAt,
          locale: submissionLocale
        } as MediaContentReportSubmission
      } else {
        const complaintSchema = createMediaContentComplaintSchema(t)
        const validationResult = complaintSchema.parse(body)
        submissionData = {
          ...validationResult,
          formType: 'complaint',
          submittedAt: body.submittedAt,
          locale: submissionLocale
        } as MediaContentComplaintSubmission
      }
    } catch (error) {
      // Log validation error with context
      const errorId = logger.api.error('Form validation failed', error as Error, {
        component: 'MediaFormsAPI',
        formType: formType,
        locale: submissionLocale,
      })
      
      // Handle Zod validation errors
      if (error instanceof Error && 'issues' in error) {
        const zodError = error as any
        // Log Zod validation details
        logger.form.validation(
          formType, 
          false, 
          zodError.issues, 
          {
            component: 'MediaFormsAPI',
            locale: submissionLocale,
          }
        )
        
        const firstIssue = zodError.issues[0]
        return NextResponse.json(
          {
            success: false,
            message: `Validation error: ${firstIssue.message} (field: ${firstIssue.path.join('.')})`,
            debug: zodError.issues, // Add debug info
          },
          { status: 400 }
        )
      }
      
      // Log generic validation error
      logger.api.error('Generic validation error', error as Error, {
        component: 'MediaFormsAPI',
        formType: formType,
        locale: submissionLocale,
      })
      
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          error: error instanceof Error ? error.message : 'Unknown error',
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
      
      // Top-level fields for better admin visibility
      mediaType: formatMediaType(submissionData.mediaType, submissionData.mediaTypeOther),
      specificChannel: getSpecificChannel(submissionData),
      programName: submissionData.programName,
      
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
      { 
        status: 201,
      }
    )

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      const errorId = logger.api.error('Media form submission failed', error as Error, {
        component: 'MediaFormsAPI',
        formType: getStringValue(body?.formType),
      })
    }
    
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
    'radio_mauritanie': 'إذاعة موريتانيا الأم / Radio Mauritanie',
    'radio_coran': 'إذاعة القرآن الكريم / Radio Coran',
    'radio_scolaire': 'الإذاعة المدرسية / Radio Scolaire',
    'radio_jeunesse': 'إذاعة الشباب / Radio Jeunesse',
    'radio_culture': 'الإذاعة الثقافية / Radio Culture',
    'radio_sante': 'إذاعة التثقيف الصحي / Radio Éducation à la santé',
    'radio_rurale': 'الإذاعة الريفية / Radio Rurale',
    'radio_mauritanides': 'إذاعة موريتانيد / Radio Mauritanides',
    'radio_koubeni': 'إذاعة كوبني / Radio Koubeni',
    'radio_tenwir': 'إذاعة التنوير / Radio Tenwir',
    other: other || 'Autre station',
  }
  return stationMap[station] || station
}