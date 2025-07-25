import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

// Average reading speed (words per minute)
const WORDS_PER_MINUTE = 200

/**
 * Extracts text content from Lexical editor state
 */
function extractTextFromLexical(data: DefaultTypedEditorState): string {
  if (!data?.root?.children) return ''

  const extractFromChildren = (children: any[]): string => {
    let text = ''
    
    for (const child of children) {
      if (child.type === 'text') {
        text += child.text || ''
      } else if (child.type === 'paragraph' && child.children) {
        text += extractFromChildren(child.children) + ' '
      } else if (child.type === 'heading' && child.children) {
        text += extractFromChildren(child.children) + ' '
      } else if (child.type === 'list' && child.children) {
        text += extractFromChildren(child.children) + ' '
      } else if (child.type === 'listitem' && child.children) {
        text += extractFromChildren(child.children) + ' '
      } else if (child.type === 'quote' && child.children) {
        text += extractFromChildren(child.children) + ' '
      } else if (child.children && Array.isArray(child.children)) {
        text += extractFromChildren(child.children) + ' '
      }
    }
    
    return text
  }

  return extractFromChildren(data.root.children)
}

/**
 * Counts words in a text string
 */
function countWords(text: string): number {
  if (!text || typeof text !== 'string') return 0
  
  // Remove extra whitespace and split by spaces
  const words = text
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .split(' ')
    .filter(word => word.length > 0)
  
  return words.length
}

/**
 * Calculates estimated reading time for content
 */
export function calculateReadingTime(content: DefaultTypedEditorState | string): {
  minutes: number
  words: number
  text: string
} {
  let wordCount = 0
  
  if (typeof content === 'string') {
    wordCount = countWords(content)
  } else if (content && typeof content === 'object') {
    const extractedText = extractTextFromLexical(content)
    wordCount = countWords(extractedText)
  }
  
  const minutes = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE))
  
  return {
    minutes,
    words: wordCount,
    text: `${minutes} min read`
  }
}

/**
 * Formats reading time with localization support
 */
export function formatReadingTime(
  content: DefaultTypedEditorState | string,
  locale: 'fr' | 'ar' = 'fr'
): string {
  const { minutes } = calculateReadingTime(content)
  
  if (locale === 'ar') {
    return minutes === 1 ? 'دقيقة واحدة' : `${minutes} دقائق`
  }
  
  return minutes === 1 ? '1 min de lecture' : `${minutes} min de lecture`
}

/**
 * Gets reading progress percentage based on scroll position
 */
export function getReadingProgress(contentElement: HTMLElement | null): number {
  if (!contentElement) return 0
  
  const windowHeight = window.innerHeight
  const documentHeight = contentElement.offsetHeight
  const scrollTop = window.scrollY
  const contentTop = contentElement.offsetTop
  
  // Calculate how much of the content has been scrolled through
  const contentScrolled = Math.max(0, scrollTop - contentTop)
  const contentVisible = documentHeight - windowHeight
  
  if (contentVisible <= 0) return 100
  
  const progress = Math.min(100, Math.max(0, (contentScrolled / contentVisible) * 100))
  return Math.round(progress)
}