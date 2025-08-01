import { useTranslations } from 'next-intl'

/**
 * Generates localized validation messages for Zod schemas
 * Maps validation keys used in media-forms.ts to proper next-intl translations
 * 
 * @param t - The translation function from useTranslations hook
 * @returns Object containing localized validation messages
 */
export function getValidationMessages(t: ReturnType<typeof useTranslations>) {
  return {
    // Basic field validation
    required: t('fieldRequired'),
    invalid_type: t('fieldRequired'),
    
    // Email validation
    invalid_email: t('invalidEmail'),
    invalid_string: t('invalidEmail'), // Zod uses this for email validation
    
    // Phone validation
    invalid_phone: t('invalidPhone'),
    
    // String length validation
    too_small: (min: number) => t('minLength', { min }),
    too_big: (max: number) => t('maxLength', { max }),
    min_length: (min: number) => t('minLength', { min }),
    max_length: (max: number) => t('maxLength', { max }),
    
    // Array validation (for multi-select fields)
    too_small_array: t('selectAtLeastOne'),
    select_at_least_one: t('selectAtLeastOne'),
    
    // Custom validation messages for media forms
    specify_other: t('specifyOther'),
    field_required: t('fieldRequired'),
    
    // Boolean validation (for checkboxes)
    invalid_literal: t('fieldRequired'), // Used for required boolean fields
    
    // Refine validation messages (custom validation rules)
    refine_media_type_other: t('specifyOther'),
    refine_tv_channel_required: t('fieldRequired'),
    refine_radio_station_required: t('fieldRequired'),
    refine_tv_channel_other: t('specifyOther'),
    refine_radio_station_other: t('specifyOther'),
    refine_reason_other: t('specifyOther'),
    refine_relationship_other: t('specifyOther'),
    refine_attachment_other: t('specifyOther'),
    
    // File upload validation (if used in forms)
    file_too_large: (maxSize: string) => t('FileUpload.fileTooLarge', { maxSize }),
    unsupported_file_type: t('FileUpload.unsupportedFileType'),
    upload_failed: t('FileUpload.uploadFailed'),
  }
}

/**
 * Type definition for validation message keys
 * Used to ensure type safety when referencing validation messages
 */
export type ValidationMessageKey = keyof ReturnType<typeof getValidationMessages>

/**
 * Helper function to get a specific validation message
 * 
 * @param t - The translation function from useTranslations hook
 * @param key - The validation message key
 * @param params - Optional parameters for the message (e.g., min, max values)
 * @returns The localized validation message
 */
export function getValidationMessage(
  t: ReturnType<typeof useTranslations>,
  key: string,
  params?: Record<string, any>
): string {
  const messages = getValidationMessages(t)
  
  // Handle parameterized messages
  if (key === 'too_small' || key === 'min_length') {
    return messages.min_length(params?.minimum || params?.min || 0)
  }
  
  if (key === 'too_big' || key === 'max_length') {
    return messages.max_length(params?.maximum || params?.max || 0)
  }
  
  if (key === 'file_too_large') {
    return messages.file_too_large(params?.maxSize || '10')
  }
  
  // Handle direct message lookup
  const messageKey = key as ValidationMessageKey
  const message = messages[messageKey]
  
  if (typeof message === 'function') {
    return (message as any)(params || {})
  }
  
  return typeof message === 'string' ? message : messages.required
}

/**
 * Default validation messages mapping for Zod error codes
 * Maps standard Zod error codes to our validation message keys
 */
export const ZOD_ERROR_MAP: Record<string, string> = {
  // String validation
  'too_small': 'min_length',
  'too_big': 'max_length',
  'invalid_string': 'invalid_email', // For email validation
  'invalid_type': 'required',
  
  // Custom validation
  'custom': 'field_required',
  'invalid_literal': 'required', // For boolean fields
} as const