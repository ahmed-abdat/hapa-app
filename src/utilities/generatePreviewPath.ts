import { PayloadRequest, CollectionSlug } from 'payload'
import { defaultLocale } from './locale'
import { getServerSideURL } from './getURL'

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
      console.error('generatePreviewPath: Missing required parameters', { collection, slug })
      return `/next/preview?error=missing-params&collection=${collection || 'unknown'}&slug=${slug || 'unknown'}`
    }
    
    // Validate collection is supported
    if (!collectionPrefixMap[collection]) {
      console.error('generatePreviewPath: Unsupported collection', { 
        collection, 
        supportedCollections: Object.keys(collectionPrefixMap) 
      })
      return `/next/preview?error=unsupported-collection&collection=${collection}`
    }
    
    // Validate preview secret
    const previewSecret = process.env.PREVIEW_SECRET
    if (!previewSecret) {
      console.error('generatePreviewPath: PREVIEW_SECRET environment variable not set')
      return `/next/preview?error=missing-secret`
    }
    
    // Get server URL for debugging (optional)
    const serverUrl = getServerSideURL()
    if (!serverUrl && process.env.NODE_ENV === 'development') {
      console.warn('generatePreviewPath: No server URL available, but continuing...')
    }
    
    // Build the preview path
    const currentLocale = locale || defaultLocale
    const basePath = `${collectionPrefixMap[collection]}/${slug}`
    const localizedPath = `/${currentLocale}${basePath}`
    
    // Create URL parameters
    const params = {
      slug: encodeURIComponent(slug),
      collection: collection,
      path: encodeURIComponent(localizedPath),
      previewSecret: encodeURIComponent(previewSecret),
    }
    
    const encodedParams = new URLSearchParams(params)
    const url = `/next/preview?${encodedParams.toString()}`
    
    // Log successful generation in development
    if (process.env.NODE_ENV === 'development') {
      console.log('generatePreviewPath: Generated preview URL', {
        collection,
        slug,
        locale: currentLocale,
        localizedPath,
        url,
      })
    }

    return url
  } catch (error) {
    console.error('generatePreviewPath: Unexpected error', {
      error: error instanceof Error ? error.message : String(error),
      collection,
      slug,
      locale,
    })
    
    return `/next/preview?error=unexpected-error`
  }
}
