import type { Validate } from 'payload'

/**
 * Localized validation messages for MediaBlock
 */
const VALIDATION_MESSAGES = {
  fr: 'Le média est requis',
  ar: 'الوسائط مطلوبة',
  en: 'Media is required' // Fallback
} as const

/**
 * Validates that a media item has been selected
 * Returns localized error message based on current locale
 */
export const validateMediaRequired: Validate<any, any, any> = (
  value,
  { req }
) => {
  if (!value) {
    // Get the current locale from the request
    const locale = req?.locale || 'fr'
    
    // Return the appropriate error message
    return VALIDATION_MESSAGES[locale as keyof typeof VALIDATION_MESSAGES] || VALIDATION_MESSAGES.fr
  }
  
  return true
}