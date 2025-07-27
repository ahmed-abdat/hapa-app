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
    // Missing required parameters
    return `/next/preview?error=missing-params`
  }
  
  // Validate preview secret
  const previewSecret = process.env.PREVIEW_SECRET
  if (!previewSecret) {
    // PREVIEW_SECRET not set
    return `/next/preview?error=missing-secret`
  }
  
  // Get server URL to ensure we have a valid base URL
  const serverUrl = getServerSideURL()
  if (!serverUrl) {
    // Failed to create URL - falling back to localhost
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
