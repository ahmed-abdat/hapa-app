import type { FieldHook } from 'payload'

export const formatSlug = (val: string): string =>
  val
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')
    .toLowerCase()

export const formatSlugHook =
  (fallback: string): FieldHook =>
  ({ data, operation, value }) => {
    if (typeof value === 'string') {
      return formatSlug(value)
    }

    // Always generate slug from French title if it exists, regardless of operation
    if (operation === 'create' || operation === 'update' || !data?.slug) {
      let fallbackData = data?.[fallback]

      // Handle localized fields - always use French ('fr') for slug generation
      if (fallbackData && typeof fallbackData === 'object' && 'fr' in fallbackData) {
        fallbackData = fallbackData.fr
      }

      // Only generate slug if French title exists and is not empty
      if (fallbackData && typeof fallbackData === 'string' && fallbackData.trim()) {
        return formatSlug(fallbackData)
      }
      
      // Return empty string if no French title
      return ''
    }

    return value
  }
