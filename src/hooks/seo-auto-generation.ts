import type { FieldHook, PayloadRequest } from 'payload'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { extractPlainTextFromLexical, truncateText, SEO_LIMITS } from '@/utilities/seo'

/**
 * Auto-generates SEO title from post title with proper localization
 */
export const autoGenerateSEOTitle: FieldHook = async ({
  data,
  req,
  operation,
  originalDoc,
  value,
}) => {
  // Only auto-generate on create or if field is empty
  if (value || (operation === 'update' && originalDoc?.meta?.title)) {
    return value
  }

  const locale = req.locale || 'fr'
  const title = data?.title?.[locale] || data?.title?.fr || data?.title

  if (!title) return value

  // Generate title based on locale
  const siteName = locale === 'ar' 
    ? 'الهيئة العليا للصحافة والإعلام السمعي البصري'
    : 'HAPA'

  // Truncate title if needed to fit SEO limits
  const maxTitleLength = SEO_LIMITS.title.max - siteName.length - 3 // Account for " — " separator
  const truncatedTitle = title.length > maxTitleLength 
    ? truncateText(title, maxTitleLength, false)
    : title

  return `${truncatedTitle} — ${siteName}`
}

/**
 * Auto-generates SEO description from post content with localization
 */
export const autoGenerateSEODescription: FieldHook = async ({
  data,
  req,
  operation,
  originalDoc,
  value,
}) => {
  // Only auto-generate on create or if field is empty
  if (value || (operation === 'update' && originalDoc?.meta?.description)) {
    return value
  }

  const locale = req.locale || 'fr'
  
  // Try to get content in current locale, fallback to French
  const content = data?.content?.[locale] || data?.content?.fr || data?.content
  
  if (!content) {
    // Fallback to title if no content
    const title = data?.title?.[locale] || data?.title?.fr || data?.title
    if (title) {
      return truncateText(title, SEO_LIMITS.description.max, true)
    }
    return value
  }

  // Extract plain text from Lexical content
  let plainText = ''
  if (typeof content === 'object' && content.root) {
    plainText = extractPlainTextFromLexical(content as SerializedEditorState)
  } else if (typeof content === 'string') {
    plainText = content
  }

  if (!plainText) return value

  // Smart extraction: Get first meaningful paragraph
  const paragraphs = plainText.split(/\.\s+/)
  let description = ''

  // Try to find a good first sentence/paragraph
  if (paragraphs.length > 0) {
    const firstParagraph = paragraphs[0].trim()
    
    // If first paragraph is good length, use it
    if (firstParagraph.length >= 100 && firstParagraph.length <= SEO_LIMITS.description.max) {
      description = firstParagraph + '.'
    } else if (firstParagraph.length > SEO_LIMITS.description.max) {
      // If too long, truncate it
      description = truncateText(firstParagraph, SEO_LIMITS.description.max, true)
    } else {
      // If too short, combine with next paragraphs
      description = firstParagraph
      for (let i = 1; i < paragraphs.length && description.length < 100; i++) {
        description += '. ' + paragraphs[i].trim()
      }
    }
  }

  // Final truncation if needed
  if (description.length > SEO_LIMITS.description.max) {
    description = truncateText(description, SEO_LIMITS.description.max, true)
  }

  return description || value
}

/**
 * Auto-selects SEO image from hero image or first media block
 */
export const autoGenerateSEOImage: FieldHook = async ({
  data,
  operation,
  originalDoc,
  value,
}) => {
  // Only auto-generate on create or if field is empty
  if (value || (operation === 'update' && originalDoc?.meta?.image)) {
    return value
  }

  // Priority: heroImage > first media block > first image in content
  if (data?.heroImage) {
    return data.heroImage
  }

  // Check content blocks for media
  if (data?.content?.root?.children) {
    // This would need to parse the Lexical content for images
    // For now, return the heroImage if available
  }

  return value
}

/**
 * Validates and improves SEO fields with smart suggestions
 */
export const validateAndImproveSEO: FieldHook = async ({
  data,
  req,
  value,
  siblingData,
}) => {
  const locale = req.locale || 'fr'
  
  // Get the current SEO values
  const metaTitle = siblingData?.title || value?.title
  const metaDescription = siblingData?.description || value?.description

  // Validation messages in both languages
  const messages = {
    fr: {
      titleTooShort: `Titre trop court. Ajoutez ${SEO_LIMITS.title.min - (metaTitle?.length || 0)} caractères.`,
      titleTooLong: `Titre trop long. Supprimez ${(metaTitle?.length || 0) - SEO_LIMITS.title.max} caractères.`,
      descTooShort: `Description trop courte. Ajoutez ${SEO_LIMITS.description.min - (metaDescription?.length || 0)} caractères.`,
      descTooLong: `Description trop longue. Supprimez ${(metaDescription?.length || 0) - SEO_LIMITS.description.max} caractères.`,
    },
    ar: {
      titleTooShort: `العنوان قصير جداً. أضف ${SEO_LIMITS.title.min - (metaTitle?.length || 0)} حرف.`,
      titleTooLong: `العنوان طويل جداً. احذف ${(metaTitle?.length || 0) - SEO_LIMITS.title.max} حرف.`,
      descTooShort: `الوصف قصير جداً. أضف ${SEO_LIMITS.description.min - (metaDescription?.length || 0)} حرف.`,
      descTooLong: `الوصف طويل جداً. احذف ${(metaDescription?.length || 0) - SEO_LIMITS.description.max} حرف.`,
    }
  }

  // Store validation feedback in a field that the UI can access
  const validationFeedback: any = {}

  if (metaTitle) {
    if (metaTitle.length < SEO_LIMITS.title.min) {
      validationFeedback.titleStatus = 'warning'
      validationFeedback.titleMessage = messages[locale as 'fr' | 'ar'].titleTooShort
    } else if (metaTitle.length > SEO_LIMITS.title.max) {
      validationFeedback.titleStatus = 'error'
      validationFeedback.titleMessage = messages[locale as 'fr' | 'ar'].titleTooLong
    } else {
      validationFeedback.titleStatus = 'success'
    }
  }

  if (metaDescription) {
    if (metaDescription.length < SEO_LIMITS.description.min) {
      validationFeedback.descriptionStatus = 'warning'
      validationFeedback.descriptionMessage = messages[locale as 'fr' | 'ar'].descTooShort
    } else if (metaDescription.length > SEO_LIMITS.description.max) {
      validationFeedback.descriptionStatus = 'error'
      validationFeedback.descriptionMessage = messages[locale as 'fr' | 'ar'].descTooLong
    } else {
      validationFeedback.descriptionStatus = 'success'
    }
  }

  // Return the value with validation feedback attached
  return {
    ...value,
    _validation: validationFeedback
  }
}