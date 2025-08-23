/**
 * Centralized Form Options and Mappings
 * Ensures consistency between frontend forms and admin display components
 * All options should match the validation schemas in media-forms.ts
 */

// Report Reason Options (based on ReportReasonEnum)
export const REPORT_REASON_OPTIONS = [
  'hateSpeech',       // 0
  'misinformation',   // 1  
  'fakeNews',         // 2
  'privacyViolation', // 3
  'shockingContent',  // 4
  'pluralismViolation', // 5
  'falseAdvertising', // 6
  'other'             // 7
] as const

// Attachment Type Options (based on AttachmentTypeEnum)  
export const ATTACHMENT_TYPE_OPTIONS = [
  'screenshot',       // 0
  'videoLink',        // 1
  'writtenStatement', // 2
  'audioRecording',   // 3
  'other'             // 4
] as const

// Media Type Options
export const MEDIA_TYPE_OPTIONS = [
  'television',
  'radio', 
  'website',
  'youtube',
  'facebook',
  'other'
] as const

// Relationship to Content Options (for complaints)
export const RELATIONSHIP_OPTIONS = [
  'viewer',
  'directlyConcerned', 
  'journalist',
  'other'
] as const

// Gender Options
export const GENDER_OPTIONS = [
  'male',
  'female'
] as const

/**
 * Helper function to create form option objects with translations
 */
export function createFormOptions<T extends readonly string[]>(
  keys: T,
  t: (key: string) => string,
  keyTransformers?: { [K in T[number]]?: string }
) {
  return keys.map(key => ({
    value: key,
    label: t((keyTransformers as Record<string, string>)?.[key] || key)
  }))
}

/**
 * Mapping functions for admin components
 * These convert numeric indices back to option keys
 */

export function getReasonKeyFromIndex(index: number): string {
  return REPORT_REASON_OPTIONS[index] || String(index)
}

export function getAttachmentTypeKeyFromIndex(index: number): string {
  return ATTACHMENT_TYPE_OPTIONS[index] || String(index)
}

export function getIndexFromReasonKey(key: string): number {
  return REPORT_REASON_OPTIONS.indexOf(key as any)
}

export function getIndexFromAttachmentTypeKey(key: string): number {
  return ATTACHMENT_TYPE_OPTIONS.indexOf(key as any)
}

/**
 * Validation: Ensure frontend options match validation schema
 * These should match exactly with the enums in media-forms.ts
 */
export const VALIDATION_CHECKS = {
  reportReasons: REPORT_REASON_OPTIONS.length === 8,
  attachmentTypes: ATTACHMENT_TYPE_OPTIONS.length === 5,
  mediaTypes: MEDIA_TYPE_OPTIONS.length === 6,
  relationships: RELATIONSHIP_OPTIONS.length === 4,
  genders: GENDER_OPTIONS.length === 2
} as const