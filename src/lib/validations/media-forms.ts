import { z } from 'zod'
import type { useTranslations } from 'next-intl'
import { getValidationMessages } from './validation-messages'

// Gender enum - only male/female
export const GenderEnum = z.enum([
  'male',
  'female'
])

// TV Channels enum
export const TVChannelEnum = z.enum([
  // El Mouritaniya channels
  'mouritaniya',
  'mouritaniya2', 
  'thakafiya',
  'riyadiya',
  'parlement',
  // Other channels
  'mahdhara',
  'ousra',
  'mourabitoune',
  'wataniya',
  'chinguitt',
  'sahel',
  'dava',
  'medina',
  'sahra24',
  'ghimem',
  'other'
])

// Radio Stations enum
export const RadioStationEnum = z.enum([
  // Radio Mauritanie
  'radio-mauritanie',
  'radio-coran',
  'radio-scolaire',
  'radio-jeunesse', 
  'radio-culture',
  'radio-sante',
  'radio-rurale',
  // Other stations
  'radio-mauritanides',
  'radio-koubeni',
  'radio-tenwir',
  'other'
])

// Common media types enum (for basic media type selection)
export const MediaTypeEnum = z.enum([
  'television',
  'radio',
  'website',
  'youtube',
  'facebook',
  'other'
])

// Common report reasons enum
export const ReportReasonEnum = z.enum([
  'hateSpeech',
  'misinformation',
  'privacyViolation',
  'shockingContent',
  'pluralismViolation',
  'falseAdvertising',
  'other'
])

// Common attachment types enum
export const AttachmentTypeEnum = z.enum([
  'screenshot',
  'videoLink',
  'writtenStatement',
  'audioRecording',
  'other'
])

// Relationship to content enum (for complaints only)
export const RelationshipToContentEnum = z.enum([
  'viewer',
  'directlyConcerned',
  'journalist',
  'other'
])

// Phone validation regex (international format)
const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/

// Base content information schema factory (shared between report and complaint)
const createContentInformationSchema = (validationMessages: ReturnType<typeof getValidationMessages>) => z.object({
  mediaType: MediaTypeEnum,
  mediaTypeOther: z.string().optional(),
  // Dynamic fields based on media type
  tvChannel: TVChannelEnum.optional(),
  tvChannelOther: z.string().optional(),
  radioStation: RadioStationEnum.optional(),
  radioStationOther: z.string().optional(),
  programName: z.string().min(2, validationMessages.required).max(200, validationMessages.max_length(200)),
  broadcastDateTime: z.string().min(1, validationMessages.required),
  linkScreenshot: z.string().max(500, validationMessages.max_length(500)).optional().or(z.literal('')),
  // File upload fields
  screenshotFiles: z.array(z.string()).optional(), // Array of file URLs
})

// Base report reason schema factory
const createReportReasonSchema = (validationMessages: ReturnType<typeof getValidationMessages>) => z.object({
  reasons: z.array(ReportReasonEnum).min(1, validationMessages.select_at_least_one),
  reasonOther: z.string().optional(),
})

// Content description schema factory
const createContentDescriptionSchema = (validationMessages: ReturnType<typeof getValidationMessages>) => z.object({
  description: z.string().min(50, validationMessages.min_length(50)).max(2000, validationMessages.max_length(2000)),
})

// Attachments schema factory
const createAttachmentsSchema = (validationMessages: ReturnType<typeof getValidationMessages>) => z.object({
  attachmentTypes: z.array(AttachmentTypeEnum).optional(),
  attachmentOther: z.string().max(1000, validationMessages.max_length(1000)).optional(),
  // File upload fields for attachments
  attachmentFiles: z.array(z.string()).optional(), // Array of file URLs
})

// Declaration and consent schema factory (for complaints only)
const createDeclarationConsentSchema = (validationMessages: ReturnType<typeof getValidationMessages>) => z.object({
  acceptDeclaration: z.boolean().refine((val) => val === true, {
    message: validationMessages.required,
  }),
  acceptConsent: z.boolean().refine((val) => val === true, {
    message: validationMessages.required,
  }),
})

// Media Content Report Form Schema Factory
export const createMediaContentReportSchema = (t: ReturnType<typeof useTranslations>) => {
  const validationMessages = getValidationMessages(t)
  const contentInformationSchema = createContentInformationSchema(validationMessages)
  const reportReasonSchema = createReportReasonSchema(validationMessages)
  const contentDescriptionSchema = createContentDescriptionSchema(validationMessages)
  const attachmentsSchema = createAttachmentsSchema(validationMessages)

  return z.object({
    // Content Information Section
    ...contentInformationSchema.shape,
    
    // Report Reason Section
    ...reportReasonSchema.shape,
    
    // Content Description Section
    ...contentDescriptionSchema.shape,
    
    // Attachments Section (optional)
    ...attachmentsSchema.shape,
  }).refine((data) => {
    // If media type is 'other', mediaTypeOther is required
    if (data.mediaType === 'other') {
      return data.mediaTypeOther && data.mediaTypeOther.trim().length > 0
    }
    return true
  }, {
    message: validationMessages.specify_other,
    path: ['mediaTypeOther'],
  }).refine((data) => {
    // If media type is 'television', tvChannel is required
    if (data.mediaType === 'television') {
      return data.tvChannel && data.tvChannel.trim().length > 0
    }
    return true
  }, {
    message: validationMessages.required,
    path: ['tvChannel'],
  }).refine((data) => {
    // If media type is 'radio', radioStation is required
    if (data.mediaType === 'radio') {
      return data.radioStation && data.radioStation.trim().length > 0
    }
    return true
  }, {
    message: validationMessages.required,
    path: ['radioStation'],
  }).refine((data) => {
    // If TV channel is 'other', tvChannelOther is required
    if (data.tvChannel === 'other') {
      return data.tvChannelOther && data.tvChannelOther.trim().length > 0
    }
    return true
  }, {
    message: validationMessages.specify_other,
    path: ['tvChannelOther'],
  }).refine((data) => {
    // If radio station is 'other', radioStationOther is required
    if (data.radioStation === 'other') {
      return data.radioStationOther && data.radioStationOther.trim().length > 0
    }
    return true
  }, {
    message: validationMessages.specify_other,
    path: ['radioStationOther'],
  }).refine((data) => {
    // If 'other' is selected in reasons, reasonOther is required
    if (data.reasons.includes('other')) {
      return data.reasonOther && data.reasonOther.trim().length > 0
    }
    return true
  }, {
    message: validationMessages.specify_other,
    path: ['reasonOther'],
  }).refine((data) => {
    // If 'other' is selected in attachments, attachmentOther is required
    if (data.attachmentTypes?.includes('other')) {
      return data.attachmentOther && data.attachmentOther.trim().length > 0
    }
    return true
  }, {
    message: validationMessages.specify_other,
    path: ['attachmentOther'],
  })
}

// Complainant information schema factory (for complaints only)
const createComplainantInformationSchema = (validationMessages: ReturnType<typeof getValidationMessages>) => z.object({
  fullName: z.string().min(2, validationMessages.required).max(100, validationMessages.max_length(100)),
  gender: GenderEnum,
  country: z.string().min(2, validationMessages.required),
  phoneNumber: z.string().regex(phoneRegex, validationMessages.invalid_phone),
  whatsappNumber: z.string().regex(phoneRegex, validationMessages.invalid_phone).optional().or(z.literal('')),
  emailAddress: z.string().email(validationMessages.invalid_email),
  profession: z.string().max(100, validationMessages.max_length(100)).optional(),
  relationshipToContent: RelationshipToContentEnum.optional(),
  relationshipOther: z.string().optional(),
})

// Media Content Complaint Form Schema Factory
export const createMediaContentComplaintSchema = (t: ReturnType<typeof useTranslations>) => {
  const validationMessages = getValidationMessages(t)
  const complainantInformationSchema = createComplainantInformationSchema(validationMessages)
  const contentInformationSchema = createContentInformationSchema(validationMessages)
  const reportReasonSchema = createReportReasonSchema(validationMessages)
  const contentDescriptionSchema = createContentDescriptionSchema(validationMessages)
  const attachmentsSchema = createAttachmentsSchema(validationMessages)
  const declarationConsentSchema = createDeclarationConsentSchema(validationMessages)

  return z.object({
    // Complainant Information Section
    ...complainantInformationSchema.shape,
    
    // Content Information Section
    ...contentInformationSchema.shape,
    
    // Complaint Reason Section
    ...reportReasonSchema.shape,
    
    // Content Description Section
    ...contentDescriptionSchema.shape,
    
    // Attachments Section (optional)
    ...attachmentsSchema.shape,
    
    // Declaration and Consent Section
    ...declarationConsentSchema.shape,
  }).refine((data) => {
    // If media type is 'other', mediaTypeOther is required
    if (data.mediaType === 'other') {
      return data.mediaTypeOther && data.mediaTypeOther.trim().length > 0
    }
    return true
  }, {
    message: validationMessages.specify_other,
    path: ['mediaTypeOther'],
  }).refine((data) => {
    // If media type is 'television', tvChannel is required
    if (data.mediaType === 'television') {
      return data.tvChannel && data.tvChannel.trim().length > 0
    }
    return true
  }, {
    message: validationMessages.required,
    path: ['tvChannel'],
  }).refine((data) => {
    // If media type is 'radio', radioStation is required
    if (data.mediaType === 'radio') {
      return data.radioStation && data.radioStation.trim().length > 0
    }
    return true
  }, {
    message: validationMessages.required,
    path: ['radioStation'],
  }).refine((data) => {
    // If TV channel is 'other', tvChannelOther is required
    if (data.tvChannel === 'other') {
      return data.tvChannelOther && data.tvChannelOther.trim().length > 0
    }
    return true
  }, {
    message: validationMessages.specify_other,
    path: ['tvChannelOther'],
  }).refine((data) => {
    // If radio station is 'other', radioStationOther is required
    if (data.radioStation === 'other') {
      return data.radioStationOther && data.radioStationOther.trim().length > 0
    }
    return true
  }, {
    message: validationMessages.specify_other,
    path: ['radioStationOther'],
  }).refine((data) => {
    // If 'other' is selected in reasons, reasonOther is required
    if (data.reasons.includes('other')) {
      return data.reasonOther && data.reasonOther.trim().length > 0
    }
    return true
  }, {
    message: validationMessages.specify_other,
    path: ['reasonOther'],
  }).refine((data) => {
    // If relationship is 'other', relationshipOther is required
    if (data.relationshipToContent === 'other') {
      return data.relationshipOther && data.relationshipOther.trim().length > 0
    }
    return true
  }, {
    message: validationMessages.specify_other,
    path: ['relationshipOther'],
  }).refine((data) => {
    // If 'other' is selected in attachments, attachmentOther is required
    if (data.attachmentTypes?.includes('other')) {
      return data.attachmentOther && data.attachmentOther.trim().length > 0
    }
    return true
  }, {
    message: validationMessages.specify_other,
    path: ['attachmentOther'],
  })
}

// TypeScript types derived from schemas (using sample instances for type inference)
export type MediaContentReportFormData = z.infer<ReturnType<typeof createMediaContentReportSchema>>
export type MediaContentComplaintFormData = z.infer<ReturnType<typeof createMediaContentComplaintSchema>>

// NOTE: No static schema exports - always use factory functions with proper translation context
// This ensures proper internationalization and avoids mock translation issues in production

// Submission response types
export interface FormSubmissionResponse {
  success: boolean
  message: string
  submissionId?: string
}

// Form submission payload types (for API)
export interface MediaContentReportSubmission extends MediaContentReportFormData {
  formType: 'report'
  submittedAt: string
  locale: string
}

export interface MediaContentComplaintSubmission extends MediaContentComplaintFormData {
  formType: 'complaint'
  submittedAt: string
  locale: string
}