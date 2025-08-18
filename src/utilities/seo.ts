import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'
import { hasText } from '@payloadcms/richtext-lexical/shared'

/**
 * SEO character limits based on best practices
 */
export const SEO_LIMITS = {
  title: {
    min: 30,
    max: 60,
    warning: 55, // Show warning when approaching limit
  },
  description: {
    min: 120,
    max: 160,
    warning: 155, // Show warning when approaching limit
  },
} as const

/**
 * Extracts plain text from Lexical rich text content
 */
export function extractPlainTextFromLexical(
  content: SerializedEditorState | null | undefined
): string {
  if (!content || !hasText(content)) {
    return ''
  }

  try {
    const plaintext = convertLexicalToPlaintext({ data: content })
    // Clean up extra whitespace and line breaks
    return plaintext
      .replace(/\n+/g, ' ') // Replace multiple line breaks with space
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim()
  } catch (error) {
    console.error('Error extracting text from Lexical content:', error)
    return ''
  }
}

/**
 * Truncates text to a specific length, respecting word boundaries
 * and adding ellipsis when truncated
 */
export function truncateText(
  text: string,
  maxLength: number,
  addEllipsis: boolean = true
): string {
  if (!text || text.length <= maxLength) {
    return text
  }

  // Account for ellipsis length
  const ellipsis = '...'
  const effectiveLength = addEllipsis ? maxLength - ellipsis.length : maxLength

  // Find the last space before the limit
  let truncateAt = text.lastIndexOf(' ', effectiveLength)
  
  // If no space found, or space is too early, truncate at limit
  if (truncateAt === -1 || truncateAt < effectiveLength * 0.8) {
    truncateAt = effectiveLength
  }

  const truncated = text.substring(0, truncateAt).trim()
  return addEllipsis ? `${truncated}${ellipsis}` : truncated
}

/**
 * Generates SEO-friendly title from post title
 */
export function generateSEOTitle(
  title: string | undefined | null,
  siteName: string = 'HAPA'
): string {
  if (!title || !title.trim()) {
    return `${siteName} - Haute Autorité de la Presse et de l'Audiovisuel`
  }

  const cleanTitle = title.trim()
  
  // If title is too long, truncate it
  if (cleanTitle.length > SEO_LIMITS.title.max) {
    return truncateText(cleanTitle, SEO_LIMITS.title.max, true)
  }
  
  // Return the title as is
  return cleanTitle
}

/**
 * Generates SEO meta description from content
 */
export function generateSEODescription(
  content: SerializedEditorState | null | undefined,
  fallbackText?: string
): string {
  // Try to extract text from rich content
  let description = extractPlainTextFromLexical(content)
  
  // Use fallback if no content extracted
  if (!description && fallbackText) {
    description = fallbackText
  }
  
  // Return empty if still no content
  if (!description) {
    return ''
  }
  
  // Truncate to SEO limit
  return truncateText(description, SEO_LIMITS.description.max, true)
}

/**
 * Validates SEO field length and returns status
 */
export type SEOValidationStatus = 'too-short' | 'good' | 'warning' | 'too-long'

export function validateSEOField(
  text: string,
  type: 'title' | 'description'
): {
  status: SEOValidationStatus
  length: number
  message: string
} {
  const length = text?.length || 0
  const limits = SEO_LIMITS[type]
  
  let status: SEOValidationStatus
  let message: string
  
  if (length === 0) {
    status = 'too-short'
    message = `${type === 'title' ? 'Title' : 'Description'} is required for SEO`
  } else if (length < limits.min) {
    status = 'too-short'
    message = `Too short. Recommended minimum: ${limits.min} characters`
  } else if (length > limits.max) {
    status = 'too-long'
    message = `Too long. Maximum: ${limits.max} characters`
  } else if (length > limits.warning) {
    status = 'warning'
    message = `Approaching limit. Maximum: ${limits.max} characters`
  } else {
    status = 'good'
    message = `Good length (${length}/${limits.max} characters)`
  }
  
  return { status, length, message }
}

/**
 * Generates a summary from content for SEO purposes
 * Prioritizes the first paragraph or meaningful content
 */
export function generateContentSummary(
  content: SerializedEditorState | null | undefined,
  maxLength: number = SEO_LIMITS.description.max
): string {
  const plainText = extractPlainTextFromLexical(content)
  
  if (!plainText) {
    return ''
  }
  
  // Try to find the first paragraph or sentence
  const paragraphs = plainText.split(/\.\s+/)
  
  if (paragraphs.length > 0) {
    const firstParagraph = paragraphs[0].trim()
    
    // If first paragraph is good length, use it
    if (firstParagraph.length >= 100 && firstParagraph.length <= maxLength) {
      return firstParagraph + '.'
    }
    
    // If too long, truncate it
    if (firstParagraph.length > maxLength) {
      return truncateText(firstParagraph, maxLength, true)
    }
    
    // If too short, combine with next paragraphs
    let summary = firstParagraph
    for (let i = 1; i < paragraphs.length && summary.length < 100; i++) {
      summary += '. ' + paragraphs[i].trim()
    }
    
    if (summary.length > maxLength) {
      return truncateText(summary, maxLength, true)
    }
    
    return summary
  }
  
  // Fallback to simple truncation
  return truncateText(plainText, maxLength, true)
}