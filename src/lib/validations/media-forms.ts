import { z } from 'zod'

// Common media types enum
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

// Base content information schema (shared between report and complaint)
const contentInformationSchema = z.object({
  mediaType: MediaTypeEnum,
  mediaTypeOther: z.string().optional(),
  programName: z.string().min(2, 'fieldRequired').max(200, 'maxLength'),
  broadcastDateTime: z.string().min(1, 'fieldRequired'),
  linkScreenshot: z.string().url().optional().or(z.literal('')),
})

// Base report reason schema
const reportReasonSchema = z.object({
  reasons: z.array(ReportReasonEnum).min(1, 'selectAtLeastOne'),
  reasonOther: z.string().optional(),
})

// Content description schema
const contentDescriptionSchema = z.object({
  description: z.string().min(50, 'minLength').max(2000, 'maxLength'),
})

// Attachments schema
const attachmentsSchema = z.object({
  attachmentTypes: z.array(AttachmentTypeEnum).optional(),
  attachmentOther: z.string().optional(),
})

// Declaration and consent schema (for complaints only)
const declarationConsentSchema = z.object({
  acceptDeclaration: z.boolean().refine((val) => val === true, {
    message: 'fieldRequired',
  }),
  acceptConsent: z.boolean().refine((val) => val === true, {
    message: 'fieldRequired',
  }),
})

// Media Content Report Form Schema
export const mediaContentReportSchema = z.object({
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
  message: 'specifyOther',
  path: ['mediaTypeOther'],
}).refine((data) => {
  // If 'other' is selected in reasons, reasonOther is required
  if (data.reasons.includes('other')) {
    return data.reasonOther && data.reasonOther.trim().length > 0
  }
  return true
}, {
  message: 'specifyOther',
  path: ['reasonOther'],
}).refine((data) => {
  // If 'other' is selected in attachments, attachmentOther is required
  if (data.attachmentTypes?.includes('other')) {
    return data.attachmentOther && data.attachmentOther.trim().length > 0
  }
  return true
}, {
  message: 'specifyOther',
  path: ['attachmentOther'],
})

// Complainant information schema (for complaints only)
const complainantInformationSchema = z.object({
  fullName: z.string().min(2, 'fieldRequired').max(100, 'maxLength'),
  phoneNumber: z.string().regex(phoneRegex, 'invalidPhone'),
  whatsappNumber: z.string().regex(phoneRegex, 'invalidPhone').optional().or(z.literal('')),
  emailAddress: z.string().email('invalidEmail'),
  profession: z.string().max(100, 'maxLength').optional(),
  relationshipToContent: RelationshipToContentEnum.optional(),
  relationshipOther: z.string().optional(),
})

// Media Content Complaint Form Schema
export const mediaContentComplaintSchema = z.object({
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
  message: 'specifyOther',
  path: ['mediaTypeOther'],
}).refine((data) => {
  // If 'other' is selected in reasons, reasonOther is required
  if (data.reasons.includes('other')) {
    return data.reasonOther && data.reasonOther.trim().length > 0
  }
  return true
}, {
  message: 'specifyOther',
  path: ['reasonOther'],
}).refine((data) => {
  // If relationship is 'other', relationshipOther is required
  if (data.relationshipToContent === 'other') {
    return data.relationshipOther && data.relationshipOther.trim().length > 0
  }
  return true
}, {
  message: 'specifyOther',
  path: ['relationshipOther'],
}).refine((data) => {
  // If 'other' is selected in attachments, attachmentOther is required
  if (data.attachmentTypes?.includes('other')) {
    return data.attachmentOther && data.attachmentOther.trim().length > 0
  }
  return true
}, {
  message: 'specifyOther',
  path: ['attachmentOther'],
})

// TypeScript types derived from schemas
export type MediaContentReportFormData = z.infer<typeof mediaContentReportSchema>
export type MediaContentComplaintFormData = z.infer<typeof mediaContentComplaintSchema>

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