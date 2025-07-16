import type { FieldHook } from 'payload'
import slugify from 'slugify'

// Language-aware slug generation with proper transliteration
export const formatSlug = (val: string, locale?: string): string => {
  // Detect if content is Arabic (contains Arabic characters)
  const isArabic = /[\u0600-\u06FF]/.test(val)
  
  const options = {
    lower: true,
    strict: true,
    replacement: '-',
    trim: true,
    // Use Arabic locale for Arabic content, no locale for French/Latin content
    locale: isArabic || locale === 'ar' ? 'ar' : undefined,
  }
  
  return slugify(val, options)
}

export const formatSlugHook =
  (fallback: string): FieldHook =>
  ({ data, operation, value, originalDoc }) => {
    // If user manually entered a slug, use it
    if (typeof value === 'string' && value.trim()) {
      return formatSlug(value)
    }

    // Get the current title data (localized or not)
    const fallbackData = data?.[fallback]
    let frenchTitle = ''

    // Handle localized fields - always use French ('fr') for slug generation
    if (fallbackData && typeof fallbackData === 'object' && 'fr' in fallbackData) {
      frenchTitle = fallbackData.fr
    } else if (fallbackData && typeof fallbackData === 'string') {
      frenchTitle = fallbackData
    }

    // Normalize French title
    if (frenchTitle && typeof frenchTitle === 'string') {
      frenchTitle = frenchTitle.trim()
    }

    // For create operations, generate slug from French title
    if (operation === 'create') {
      if (frenchTitle) {
        return formatSlug(frenchTitle)
      }
      return '' // Return empty for new documents without French title
    }

    // For update operations, only regenerate if:
    // 1. No existing slug, OR
    // 2. French title changed, OR
    // 3. User explicitly cleared the slug field
    if (operation === 'update') {
      const existingSlug = originalDoc?.slug
      let originalFrenchTitle = ''
      
      // Get original French title safely
      if (originalDoc?.title) {
        if (typeof originalDoc.title === 'object' && 'fr' in originalDoc.title) {
          originalFrenchTitle = originalDoc.title.fr || ''
        } else if (typeof originalDoc.title === 'string') {
          originalFrenchTitle = originalDoc.title
        }
      }
      
      // Normalize original title
      if (originalFrenchTitle && typeof originalFrenchTitle === 'string') {
        originalFrenchTitle = originalFrenchTitle.trim()
      }
      
      // If no existing slug or French title changed, regenerate
      if (!existingSlug || (frenchTitle && frenchTitle !== originalFrenchTitle)) {
        if (frenchTitle) {
          return formatSlug(frenchTitle)
        }
      }
      
      // Keep existing slug if French title unchanged
      return existingSlug || ''
    }

    // For all other operations, preserve existing value
    return value || data?.slug || ''
  }
