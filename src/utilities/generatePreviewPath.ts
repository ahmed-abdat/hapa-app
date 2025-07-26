import { PayloadRequest, CollectionSlug } from 'payload'
import { defaultLocale } from './locale'
import { getServerSideURL } from './getURL'

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  posts: '/posts',
}

type Props = {
  collection: keyof typeof collectionPrefixMap
  slug: string
  req: PayloadRequest
  locale?: string
}

export const generatePreviewPath = ({ collection, slug, locale }: Props) => {
  // Validate required parameters
  if (!collection || !slug) {
    console.error('generatePreviewPath: Missing required parameters', { collection, slug })
    return `/next/preview?error=missing-params`
  }
  
  // Validate preview secret
  const previewSecret = process.env.PREVIEW_SECRET
  if (!previewSecret) {
    console.error('generatePreviewPath: PREVIEW_SECRET environment variable not set')
    return `/next/preview?error=missing-secret`
  }
  
  // Get server URL to ensure we have a valid base URL
  const serverUrl = getServerSideURL()
  if (!serverUrl) {
    console.error('[ERROR]: Failed to create URL object from URL: , falling back to http://localhost')
  }
  
  const currentLocale = locale || defaultLocale
  const basePath = `${collectionPrefixMap[collection] || ''}/${slug}`
  const localizedPath = `/${currentLocale}${basePath}`
  
  const encodedParams = new URLSearchParams({
    slug,
    collection,
    path: localizedPath,
    previewSecret,
  })

  const url = `/next/preview?${encodedParams.toString()}`

  return url
}
