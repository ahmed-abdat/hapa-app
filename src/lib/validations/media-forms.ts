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
  // Radio Mauritanie (state radio network)
  'radio_mauritanie',
  'radio_coran',
  'radio_scolaire',
  'radio_jeunesse', 
  'radio_culture',
  'radio_sante',
  'radio_rurale',
  // Private stations
  'radio_mauritanides',
  'radio_koubeni',
  'radio_tenwir',
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
  'fakeNews',
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
  mediaType: z.union([MediaTypeEnum, z.literal('')]).refine((val) => val !== '', validationMessages.required),
  mediaTypeOther: z.string()
    .optional()
    .refine((val) => !val || val.trim().length >= 2, {
      message: "Veuillez spécifier le type de média"
    }),
  // Dynamic fields based on media type
  tvChannel: z.union([TVChannelEnum, z.literal('')]).optional(),
  tvChannelOther: z.string()
    .optional()
    .refine((val) => !val || val.trim().length >= 2, {
      message: "Veuillez spécifier la chaîne TV"
    }),
  radioStation: z.union([RadioStationEnum, z.literal('')]).optional(),
  radioStationOther: z.string()
    .optional()
    .refine((val) => !val || val.trim().length >= 2, {
      message: "Veuillez spécifier la station radio"
    }),
  programName: z.string()
    .min(2, validationMessages.required)
    .max(200, validationMessages.max_length(200))
    .refine((val) => val.trim().length >= 2 && !/^(undefined|null|[0-9\s]+)$/i.test(val.trim()), {
      message: "Nom du programme invalide"
    }),
  broadcastDateTime: z.string()
    .min(1, validationMessages.required)
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Date de diffusion invalide"
    })
    .refine((val) => new Date(val) <= new Date(), {
      message: "La date de diffusion ne peut pas être dans le futur"
    }),
  linkScreenshot: z.string()
    .max(500, validationMessages.max_length(500))
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || val === '' || /^https?:\/\/.+/.test(val), {
      message: "URL invalide - doit commencer par http:// ou https://"
    }),
  // File upload fields - accept File objects or empty array
  screenshotFiles: z.union([
    z.array(typeof File !== 'undefined' ? z.instanceof(File) : z.any()),
    z.array(z.string()),
    z.literal(undefined),
    z.literal(null)
  ]).optional().nullable().transform(val => {
    // Preserve File arrays, only convert empty arrays to undefined
    if (Array.isArray(val) && val.length === 0) return undefined
    return val
  }),
})

// Base report reason schema factory
const createReportReasonSchema = (validationMessages: ReturnType<typeof getValidationMessages>) => z.object({
  reasons: z.array(ReportReasonEnum).min(1, validationMessages.select_at_least_one),
  reasonOther: z.string().optional(),
})

// Content description schema factory
const createContentDescriptionSchema = (validationMessages: ReturnType<typeof getValidationMessages>) => z.object({
  description: z.string()
    .min(50, validationMessages.min_length(50))
    .max(2000, validationMessages.max_length(2000))
    .refine((val) => {
      // Prevent debug/development text and server logs from being submitted
      const debugPatterns = [
        /cross-env/i,
        /NODE_OPTIONS/i,
        /next\s+dev/i,
        /localhost:\d+/i,
        /console\.log/i,
        /undefined|null/i,
        /\$\{.*\}/,
        /<script/i,
        /<\/script/i,
        // Server log patterns
        /✓\s+Compiled/i,
        /GET\s+\/api\//i,
        /POST\s+\/api\//i,
        /\d+ms$/m,
        /Deprecation warning/i,
        /WARN:/i,
        /ERROR:/i,
        /INFO:/i,
        /Generating import map/i,
        /Fast Refresh/i,
        /runtime error/i,
        // Admin interface text
        /Tout réduire/i,
        /Afficher tout/i,
        /Reason \d+/i,
      ];
      return !debugPatterns.some(pattern => pattern.test(val));
    }, {
      message: "La description contient du contenu invalide (logs serveur, code de débogage, ou texte d'interface admin). Veuillez fournir une description claire du problème de contenu médiatique."
    })
    .refine((val) => val.trim().length >= 50, {
      message: validationMessages.min_length(50)
    }),
})

// Attachments schema factory
const createAttachmentsSchema = (validationMessages: ReturnType<typeof getValidationMessages>) => z.object({
  attachmentTypes: z.array(AttachmentTypeEnum).optional(),
  attachmentOther: z.string().max(1000, validationMessages.max_length(1000)).optional(),
  // File upload fields for attachments - accept File objects or empty array
  attachmentFiles: z.union([
    z.array(typeof File !== 'undefined' ? z.instanceof(File) : z.any()),
    z.array(z.string()),
    z.literal(undefined),
    z.literal(null)
  ]).optional().nullable().transform(val => {
    // Preserve File arrays, only convert empty arrays to undefined
    if (Array.isArray(val) && val.length === 0) return undefined
    return val
  }),
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
      return data.tvChannel !== undefined && data.tvChannel !== ''
    }
    return true
  }, {
    message: validationMessages.required,
    path: ['tvChannel'],
  }).refine((data) => {
    // If media type is 'radio', radioStation is required
    if (data.mediaType === 'radio') {
      return data.radioStation !== undefined && data.radioStation !== ''
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
  gender: z.union([GenderEnum, z.literal('')]).refine((val) => val !== '', validationMessages.required),
  country: z.string().min(2, validationMessages.required),
  phoneNumber: z.string().regex(phoneRegex, validationMessages.invalid_phone),
  whatsappNumber: z.string().optional().or(z.literal('')).refine((val) => {
    if (!val || val === '') return true // Optional field
    return phoneRegex.test(val)
  }, validationMessages.invalid_phone),
  emailAddress: z.string().email(validationMessages.invalid_email),
  profession: z.string().max(100, validationMessages.max_length(100)).optional(),
  relationshipToContent: z.union([RelationshipToContentEnum, z.literal('')]).optional(),
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
      return data.tvChannel !== undefined && data.tvChannel !== ''
    }
    return true
  }, {
    message: validationMessages.required,
    path: ['tvChannel'],
  }).refine((data) => {
    // If media type is 'radio', radioStation is required
    if (data.mediaType === 'radio') {
      return data.radioStation !== undefined && data.radioStation !== ''
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