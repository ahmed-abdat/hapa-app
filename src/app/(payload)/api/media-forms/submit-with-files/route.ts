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
import { uploadMetrics } from '@/lib/upload-metrics'

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

    // Upload files in parallel with comprehensive error tracking
    logger.log('📤 Starting parallel file uploads...', {
      screenshots: screenshotFiles.length,
      attachments: attachmentFiles.length,
      total: screenshotFiles.length + attachmentFiles.length
    })

    const uploadErrors: string[] = []
    const uploadedScreenshots: string[] = []
    const uploadedAttachments: string[] = []

    // Create upload promises for parallel processing with metrics tracking
    const screenshotPromises = screenshotFiles.map(async (file, index) => {
      logger.fileOperation(`📷 Starting screenshot upload ${index + 1}/${screenshotFiles.length}:`, file.name)
      uploadMetrics.recordUploadStart(file.name, file.size)
      const startTime = Date.now()
      
      try {
        const result = await uploadFile(file)
        const duration = Date.now() - startTime
        
        if (result.success && result.url) {
          uploadMetrics.recordUploadSuccess(file.name, file.size, duration, result.url)
        } else {
          uploadMetrics.recordUploadError(file.name, file.size, duration, result.error || 'Upload failed', 'unknown')
        }
        
        return { type: 'screenshot', file, result, index, duration }
      } catch (error) {
        const duration = Date.now() - startTime
        const errorMessage = error instanceof Error ? error.message : 'Upload failed'
        uploadMetrics.recordUploadError(file.name, file.size, duration, errorMessage, 'network')
        throw error
      }
    })

    const attachmentPromises = attachmentFiles.map(async (file, index) => {
      logger.fileOperation(`📎 Starting attachment upload ${index + 1}/${attachmentFiles.length}:`, file.name)
      uploadMetrics.recordUploadStart(file.name, file.size)
      const startTime = Date.now()
      
      try {
        const result = await uploadFile(file)
        const duration = Date.now() - startTime
        
        if (result.success && result.url) {
          uploadMetrics.recordUploadSuccess(file.name, file.size, duration, result.url)
        } else {
          uploadMetrics.recordUploadError(file.name, file.size, duration, result.error || 'Upload failed', 'unknown')
        }
        
        return { type: 'attachment', file, result, index, duration }
      } catch (error) {
        const duration = Date.now() - startTime
        const errorMessage = error instanceof Error ? error.message : 'Upload failed'
        uploadMetrics.recordUploadError(file.name, file.size, duration, errorMessage, 'network')
        throw error
      }
    })

    // Execute all uploads in parallel
    const uploadStartTime = Date.now()
    const allUploadPromises = [...screenshotPromises, ...attachmentPromises]
    
    logger.log(`🚀 Executing ${allUploadPromises.length} uploads in parallel...`)
    const uploadResults = await Promise.allSettled(allUploadPromises)
    const uploadDuration = Date.now() - uploadStartTime

    // Process results and collect successes/failures
    uploadResults.forEach((promiseResult, index) => {
      if (promiseResult.status === 'fulfilled') {
        const { type, file, result } = promiseResult.value
        
        if (result.success && result.url) {
          if (type === 'screenshot') {
            uploadedScreenshots.push(result.url)
            logger.success(
              `📷 Screenshot uploaded (${uploadDuration}ms): ${file.name} (${file.size} bytes) -> ${result.url}`
            )
          } else {
            uploadedAttachments.push(result.url)
            logger.success(
              `📎 Attachment uploaded (${uploadDuration}ms): ${file.name} (${file.size} bytes) -> ${result.url}`
            )
          }
        } else {
          const errorMsg = `${type === 'screenshot' ? 'Screenshot' : 'Attachment'} "${file.name}": ${result.error || 'Upload failed'}`
          uploadErrors.push(errorMsg)
          logger.error(`❌ ${type} upload failed:`, {
            filename: file.name,
            error: result.error,
            duration: uploadDuration
          })
        }
      } else {
        // Promise rejected (network error, etc.)
        const errorMsg = `Upload promise rejected: ${promiseResult.reason?.message || 'Unknown error'}`
        uploadErrors.push(errorMsg)
        logger.error('❌ Upload promise rejection:', {
          error: promiseResult.reason?.message || 'Unknown error',
          index,
          duration: uploadDuration
        })
      }
    })

    // Log upload performance summary and record batch metrics
    const totalSuccessful = uploadedScreenshots.length + uploadedAttachments.length
    const totalFailed = uploadErrors.length
    
    logger.log('📊 Upload performance summary:', {
      duration: `${uploadDuration}ms`,
      totalFiles: allUploadPromises.length,
      successful: totalSuccessful,
      failed: totalFailed,
      avgTimePerFile: allUploadPromises.length > 0 ? `${Math.round(uploadDuration / allUploadPromises.length)}ms` : '0ms'
    })

    // Record batch upload metrics
    uploadMetrics.recordBatchUpload({
      total: allUploadPromises.length,
      successful: totalSuccessful,
      failed: totalFailed,
      totalTime: uploadDuration,
      errors: uploadErrors
    })

    // Critical validation: Ensure all files uploaded successfully
    const totalFilesExpected = screenshotFiles.length + attachmentFiles.length
    const totalFilesUploaded = uploadedScreenshots.length + uploadedAttachments.length
    
    if (totalFilesExpected > 0 && totalFilesUploaded !== totalFilesExpected) {
      const failureDetails = uploadErrors.length > 0 
        ? uploadErrors.join('; ') 
        : 'Unknown upload failures'
      
      logger.error('❌ File upload validation failed:', {
        expected: totalFilesExpected,
        uploaded: totalFilesUploaded,
        failures: uploadErrors.length,
        details: failureDetails
      })
      
      return NextResponse.json(
        {
          success: false,
          message: `File upload failed: ${totalFilesUploaded}/${totalFilesExpected} files uploaded successfully`,
          details: uploadErrors,
          uploadStats: {
            expected: totalFilesExpected,
            successful: totalFilesUploaded,
            failed: uploadErrors.length
          }
        },
        { status: 400 }
      )
    }

    // Log successful upload summary
    if (totalFilesExpected > 0) {
      logger.success(
        `✅ All files uploaded successfully: ${totalFilesUploaded} files (${uploadedScreenshots.length} screenshots, ${uploadedAttachments.length} attachments)`
      )
    }

    // Prepare submission data with uploaded file URLs
    const submissionData = {
      ...formFields,
      screenshotFiles: uploadedScreenshots,
      attachmentFiles: uploadedAttachments,
    }

    // Validate with Zod schema
    let validatedData: Record<string, any>
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
        const zodError = error as { issues: Array<{ message: string; path: string[] }> }
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

    // Validate date if present
    if (validatedData.broadcastDateTime) {
      const broadcastDate = new Date(validatedData.broadcastDateTime)
      if (isNaN(broadcastDate.getTime()) || broadcastDate > new Date()) {
        logger.error('❌ Invalid broadcast date')
        return NextResponse.json(
          { success: false, message: 'Date de diffusion invalide' },
          { status: 400 }
        )
      }
    }

    // Prepare data for Payload collection
    const collectionData = {
      formType: formTypeValue as 'report' | 'complaint',
      submittedAt: sanitizedData.submittedAt,
      locale: ['fr', 'ar'].includes(validatedData.locale) ? validatedData.locale as 'fr' | 'ar' : 'fr',
      submissionStatus: 'pending' as const,
      priority: 'medium' as const,
      
      // Top-level fields for better admin visibility
      mediaType: formatMediaType(validatedData.mediaType, validatedData.mediaTypeOther),
      specificChannel: getSpecificChannel(validatedData),
      programName: sanitizedData.programName,
      
      // For complaints, include complainant information
      ...(formTypeValue === 'complaint' && {
        complainantInfo: {
          fullName: validatedData.fullName?.trim() || '',
          gender: formatGender(validatedData.gender),
          country: validatedData.country?.trim() || '',
          emailAddress: validatedData.emailAddress?.trim() || '',
          phoneNumber: validatedData.phoneNumber?.trim() || '',
          whatsappNumber: validatedData.whatsappNumber?.trim() || '',
          profession: validatedData.profession?.trim() || '',
          relationshipToContent: formatRelationshipToContent(
            validatedData.relationshipToContent,
            validatedData.relationshipOther
          ),
        },
      }),

      // Content information
      contentInfo: {
        mediaType: formatMediaType(validatedData.mediaType, validatedData.mediaTypeOther),
        mediaTypeOther: validatedData.mediaTypeOther?.trim() || '',
        specificChannel: getSpecificChannel(validatedData),
        programName: sanitizedData.programName,
        broadcastDateTime: validatedData.broadcastDateTime,
        linkScreenshot: validatedData.linkScreenshot?.trim() || '',
        screenshotFiles: uploadedScreenshots.map((url: string) => ({ url })),
      },

      // Reasons
      reasons: validatedData.reasons.map((reason: string) => ({ reason: formatReason(reason) })),
      reasonOther: validatedData.reasonOther?.trim() || '',

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

    // Final validation before database creation
    logger.log('🔍 Final validation before DB creation:', {
      screenshotFiles: uploadedScreenshots.length,
      attachmentFiles: uploadedAttachments.length,
      totalFiles: uploadedScreenshots.length + uploadedAttachments.length,
      expectedFiles: screenshotFiles.length + attachmentFiles.length
    })

    // Double-check that all expected files have valid URLs
    const invalidScreenshots = uploadedScreenshots.filter(url => !url || typeof url !== 'string' || url.trim() === '')
    const invalidAttachments = uploadedAttachments.filter(url => !url || typeof url !== 'string' || url.trim() === '')
    
    if (invalidScreenshots.length > 0 || invalidAttachments.length > 0) {
      logger.error('❌ Invalid file URLs detected before DB creation:', {
        invalidScreenshots: invalidScreenshots.length,
        invalidAttachments: invalidAttachments.length
      })
      
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid file URLs detected. Please try uploading your files again.',
          details: [
            ...invalidScreenshots.map(() => 'Invalid screenshot URL'),
            ...invalidAttachments.map(() => 'Invalid attachment URL')
          ]
        },
        { status: 400 }
      )
    }

    // Create the submission in Payload with explicit locale
    const result = await payload.create({
      collection: 'media-content-submissions',
      data: collectionData,
      locale: 'fr', // Use French locale as it's the default for this project
    })

    logger.success(
      `✅ Submission created successfully (ID: ${result.id}, ${uploadedScreenshots.length} screenshots, ${uploadedAttachments.length} attachments)`
    )

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

function getSpecificChannel(data: Record<string, any>): string {
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