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

/**
 * Rate limiting for form submissions
 * In production, this should be replaced with Redis or a proper rate limiter
 */
const submissionCounts = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour
const MAX_SUBMISSIONS_PER_HOUR = 5 // Stricter limit for form submissions

/**
 * Simple rate limiting check for form submissions
 */
function checkSubmissionRateLimit(ip: string): boolean {
  const now = Date.now()
  const userLimits = submissionCounts.get(ip)
  
  if (!userLimits || now > userLimits.resetTime) {
    // Reset or create new limit
    submissionCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }
  
  if (userLimits.count >= MAX_SUBMISSIONS_PER_HOUR) {
    return false
  }
  
  userLimits.count++
  return true
}

/**
 * Get client IP address
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

export async function POST(request: NextRequest): Promise<NextResponse<FormSubmissionResponse>> {
  try {
    // Check rate limiting first
    const clientIP = getClientIP(request)
    if (!checkSubmissionRateLimit(clientIP)) {
      logger.error('Form submission rate limit exceeded for IP:', clientIP)
      return NextResponse.json(
        {
          success: false,
          message: 'Rate limit exceeded. Maximum 5 form submissions per hour.',
        },
        { status: 429 }
      )
    }
    const payload = await getPayload({ config })
    const body = await request.json()

    // Log the incoming request body for debugging
    logger.log('🔍 API received body:', JSON.stringify(body, null, 2))

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

    let submissionData: MediaContentReportSubmission | MediaContentComplaintSubmission

    // Get locale from request headers or default to 'fr'
    const acceptLanguage = request.headers.get('accept-language') || 'fr'
    const locale = acceptLanguage.includes('ar') ? 'ar' : 'fr'
    
    // Get translations for validation messages
    const t = await getTranslations({ locale })

    // Validate form type first
    if (!body.formType || !['report', 'complaint'].includes(body.formType)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid form type. Must be "report" or "complaint"',
        },
        { status: 400 }
      )
    }

    // Use appropriate Zod schema based on form type
    try {
      if (body.formType === 'report') {
        const reportSchema = createMediaContentReportSchema(t)
        const validationResult = reportSchema.parse(body)
        submissionData = {
          ...validationResult,
          formType: 'report',
          submittedAt: body.submittedAt,
          locale: body.locale
        } as MediaContentReportSubmission
      } else {
        const complaintSchema = createMediaContentComplaintSchema(t)
        const validationResult = complaintSchema.parse(body)
        submissionData = {
          ...validationResult,
          formType: 'complaint',
          submittedAt: body.submittedAt,
          locale: body.locale
        } as MediaContentComplaintSubmission
      }
    } catch (error) {
      // Debug: Log the validation error details
      console.error('❌ Validation error caught:', error)
      
      // Handle Zod validation errors
      if (error instanceof Error && 'issues' in error) {
        const zodError = error as any
        console.error('🐛 Zod validation issues:', JSON.stringify(zodError.issues, null, 2))
        
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
      
      // Log generic errors
      console.error('❌ Generic validation error:', error)
      
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