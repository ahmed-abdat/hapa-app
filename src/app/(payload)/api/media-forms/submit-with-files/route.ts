import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getValidationMessages } from '@/lib/validations/validation-messages'
import { 
  createMediaContentReportSchema,
  createMediaContentComplaintSchema
} from '@/lib/validations/media-forms'
import type {
  FormSubmissionResponse,
} from '@/types/media-forms'
import { getTranslations } from 'next-intl/server'
import { uploadFile } from '@/lib/file-upload'
import { logger } from '@/utilities/logger'

export async function POST(request: NextRequest): Promise<NextResponse<FormSubmissionResponse>> {
  try {
    const payload = await getPayload({ config })
    const formData = await request.formData()

    // Extract form fields and files
    const formFields: Record<string, any> = {}
    const screenshotFiles: File[] = []
    const attachmentFiles: File[] = []

    // Process FormData entries
    for (const [key, value] of formData.entries()) {
      if (key === 'screenshotFiles' && value instanceof File) {
        screenshotFiles.push(value)
      } else if (key === 'attachmentFiles' && value instanceof File) {
        attachmentFiles.push(value)
      } else if (key === 'reasons' || key === 'attachmentTypes') {
        // Handle array fields
        if (formFields[key]) {
          if (Array.isArray(formFields[key])) {
            formFields[key].push(value.toString())
          } else {
            formFields[key] = [formFields[key], value.toString()]
          }
        } else {
          formFields[key] = [value.toString()]
        }
      } else {
        formFields[key] = value.toString()
      }
    }

    logger.log('🔍 Received form fields:', formFields)
    logger.log('📎 Received files:', { 
      screenshots: screenshotFiles.length, 
      attachments: attachmentFiles.length,
      screenshotFileNames: screenshotFiles.map(f => f.name),
      attachmentFileNames: attachmentFiles.map(f => f.name),
      allFormDataKeys: Array.from(formData.keys()),
    })

    // Validate required fields
    if (!formFields.formType || !formFields.submittedAt || !formFields.locale) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields: formType, submittedAt, locale',
        },
        { status: 400 }
      )
    }

    // Get translations for validation
    const locale = formFields.locale === 'ar' ? 'ar' : 'fr'
    const t = await getTranslations({ locale })

    // Validate form type
    if (!['report', 'complaint'].includes(formFields.formType)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid form type. Must be "report" or "complaint"',
        },
        { status: 400 }
      )
    }

    // Upload files first
    logger.log('📤 Starting file uploads...')
    const uploadedScreenshots: string[] = []
    const uploadedAttachments: string[] = []

    // Upload screenshot files
    for (const file of screenshotFiles) {
      logger.fileOperation('📷 Uploading screenshot:', file.name)
      const result = await uploadFile(file)
      if (result.success && result.url) {
        uploadedScreenshots.push(result.url)
        logger.success('📷 Screenshot uploaded:', result.url)
      } else {
        logger.error('❌ Screenshot upload failed:', result.error)
      }
    }

    // Upload attachment files
    for (const file of attachmentFiles) {
      logger.fileOperation('📎 Uploading attachment:', file.name)
      const result = await uploadFile(file)
      if (result.success && result.url) {
        uploadedAttachments.push(result.url)
        logger.success('📎 Attachment uploaded:', result.url)
      } else {
        logger.error('❌ Attachment upload failed:', result.error)
      }
    }

    // Prepare submission data with uploaded file URLs
    const submissionData = {
      ...formFields,
      screenshotFiles: uploadedScreenshots,
      attachmentFiles: uploadedAttachments,
    }

    // Validate with Zod schema
    let validatedData: any
    try {
      if (formFields.formType === 'report') {
        const reportSchema = createMediaContentReportSchema(t)
        validatedData = reportSchema.parse(submissionData)
      } else {
        const complaintSchema = createMediaContentComplaintSchema(t)
        validatedData = complaintSchema.parse(submissionData)
      }
    } catch (error) {
      logger.error('❌ Validation error:', error)
      
      if (error instanceof Error && 'issues' in error) {
        const zodError = error as any
        const firstIssue = zodError.issues[0]
        return NextResponse.json(
          {
            success: false,
            message: `Validation error: ${firstIssue.message} (field: ${firstIssue.path.join('.')})`,
            debug: zodError.issues,
          },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 400 }
      )
    }

    // Ensure validation succeeded before proceeding
    if (!validatedData) {
      logger.error('❌ Validation failed - no validated data available')
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed. Please check your input and try again.',
        },
        { status: 400 }
      )
    }

    // Server-side data validation and sanitization
    // Preserve the original form type from form submission
    const formTypeValue: 'report' | 'complaint' = formFields.formType === 'report' ? 'report' : 'complaint'
    
    // Log to debug form type preservation
    logger.log('🔍 Form type preservation:', {
      originalFormType: formFields.formType,
      validatedFormType: validatedData.formType,
      finalFormType: formTypeValue,
    })
    
    // Validate and sanitize critical fields
    const sanitizedData = {
      ...validatedData,
      programName: validatedData.programName?.trim() || 'Programme sans nom',
      description: validatedData.description?.trim() || '',
      submittedAt: new Date().toISOString(), // Use server time for consistency
    }

    // Additional server-side validation
    if (!sanitizedData.description || sanitizedData.description.length < 50) {
      logger.error('❌ Description too short or missing')
      return NextResponse.json(
        { success: false, message: 'Description requise (minimum 50 caractères)' },
        { status: 400 }
      )
    }

    // Validate date
    const broadcastDate = new Date(sanitizedData.broadcastDateTime)
    if (isNaN(broadcastDate.getTime()) || broadcastDate > new Date()) {
      logger.error('❌ Invalid broadcast date')
      return NextResponse.json(
        { success: false, message: 'Date de diffusion invalide' },
        { status: 400 }
      )
    }

    // Prepare data for Payload collection
    const collectionData = {
      formType: formTypeValue,
      submittedAt: sanitizedData.submittedAt,
      locale: ['fr', 'ar'].includes(sanitizedData.locale) ? sanitizedData.locale as 'fr' | 'ar' : 'fr',
      submissionStatus: 'pending' as 'pending' | 'reviewing' | 'resolved' | 'dismissed',
      priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
      
      // Top-level fields for better admin visibility
      mediaType: formatMediaType(sanitizedData.mediaType, sanitizedData.mediaTypeOther),
      specificChannel: getSpecificChannel(sanitizedData),
      programName: sanitizedData.programName,
      
      // For complaints, include complainant information
      ...(formTypeValue === 'complaint' && {
        complainantInfo: {
          fullName: sanitizedData.fullName?.trim() || '',
          gender: formatGender(sanitizedData.gender),
          country: sanitizedData.country?.trim() || '',
          emailAddress: sanitizedData.emailAddress?.trim() || '',
          phoneNumber: sanitizedData.phoneNumber?.trim() || '',
          whatsappNumber: sanitizedData.whatsappNumber?.trim() || '',
          profession: sanitizedData.profession?.trim() || '',
          relationshipToContent: formatRelationshipToContent(
            sanitizedData.relationshipToContent,
            sanitizedData.relationshipOther
          ),
        },
      }),

      // Content information
      contentInfo: {
        mediaType: formatMediaType(sanitizedData.mediaType, sanitizedData.mediaTypeOther),
        mediaTypeOther: sanitizedData.mediaTypeOther?.trim() || '',
        specificChannel: getSpecificChannel(sanitizedData),
        programName: sanitizedData.programName,
        broadcastDateTime: sanitizedData.broadcastDateTime,
        linkScreenshot: sanitizedData.linkScreenshot?.trim() || '',
        screenshotFiles: uploadedScreenshots.map((url: string) => ({ url })),
      },

      // Reasons
      reasons: sanitizedData.reasons.map((reason: string) => ({ reason: formatReason(reason) })),
      reasonOther: sanitizedData.reasonOther?.trim() || '',

      // Content description
      description: sanitizedData.description,

      // Attachments
      attachmentTypes: validatedData.attachmentTypes?.map((type: string) => ({ type: formatAttachmentType(type) })) || [],
      attachmentOther: validatedData.attachmentOther || '',
      attachmentFiles: uploadedAttachments.map((url: string) => ({ url })),
    }

    // Debug logging
    logger.log('🔍 Creating submission with data:', {
      originalFormType: formFields.formType,
      validatedFormType: validatedData.formType,
      finalFormType: collectionData.formType,
      formTypeType: typeof collectionData.formType,
      locale: collectionData.locale,
    })

    // Create the submission in Payload with explicit locale
    const result = await payload.create({
      collection: 'media-content-submissions',
      data: collectionData,
      locale: 'fr', // Use French locale as it's the default for this project
    })

    logger.success('✅ Submission created successfully', result.id.toString())

    return NextResponse.json(
      {
        success: true,
        message: validatedData.formType === 'report' 
          ? 'Report submitted successfully' 
          : 'Complaint submitted successfully',
        submissionId: result.id.toString(),
      },
      { status: 201 }
    )

  } catch (error) {
    logger.error('❌ Media form submission error:', error)
    
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error. Please try again later.',
      },
      { status: 500 }
    )
  }
}

// Helper functions (reused from submit route)
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

function getSpecificChannel(data: any): string {
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