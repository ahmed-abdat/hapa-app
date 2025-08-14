import { PayloadRequest, CollectionSlug } from 'payload'
import { defaultLocale } from './locale'
import { logger } from './logger'

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  posts: '/posts',
  // Add other collections if they have public-facing pages
  // media: '/media', // Uncomment if media has public pages
}

type Props = {
  collection: keyof typeof collectionPrefixMap
  slug: string
  req: PayloadRequest
  locale?: string
}

export const generatePreviewPath = ({ collection, slug, locale }: Props) => {
  try {
    // Validate required parameters
    if (!collection || !slug) {
      return `/next/preview?error=missing-params&collection=${collection || 'unknown'}&slug=${slug || 'unknown'}`
    }
    
    // Validate collection is supported
    if (!collectionPrefixMap[collection]) {
      return `/next/preview?error=unsupported-collection&collection=${collection}`
    }
    
    // Validate preview secret
    const previewSecret = process.env.PREVIEW_SECRET
    if (!previewSecret) {
      return `/next/preview?error=missing-secret`
    }
    
    
    // Build the preview path
    const currentLocale = locale || defaultLocale
    const basePath = `${collectionPrefixMap[collection]}/${slug}`
    const localizedPath = `/${currentLocale}${basePath}`
    
    // Create URL parameters - URLSearchParams handles encoding automatically
    const params = {
      slug: slug,
      collection: collection,
      path: localizedPath,
      previewSecret: previewSecret,
    }
    
    const encodedParams = new URLSearchParams(params)
    const url = `/next/preview?${encodedParams.toString()}`
    
    return url
  } catch (error) {
    // Log errors using structured logging
    logger.error('generatePreviewPath unexpected error', error, {
      component: 'GeneratePreviewPath',
      action: 'path_generation_error',
      metadata: { 
        errorMessage: error instanceof Error ? error.message : String(error)
      }
    })
    return `/next/preview?error=unexpected-error`
  }
}
