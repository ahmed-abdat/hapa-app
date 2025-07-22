import { PayloadRequest, CollectionSlug } from 'payload'
import { defaultLocale } from './locale'

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  posts: '/posts',
  pages: '',
}

type Props = {
  collection: keyof typeof collectionPrefixMap
  slug: string
  req: PayloadRequest
  locale?: string
}

export const generatePreviewPath = ({ collection, slug, locale }: Props) => {
  const currentLocale = locale || defaultLocale
  const basePath = `${collectionPrefixMap[collection]}/${slug}`
  const localizedPath = `/${currentLocale}${basePath}`
  
  console.log('🔍 GENERATE PREVIEW PATH DEBUG:', {
    collection,
    slug,
    locale,
    currentLocale,
    basePath,
    localizedPath,
    collectionPrefix: collectionPrefixMap[collection],
    previewSecret: process.env.PREVIEW_SECRET ? 'SET' : 'MISSING'
  })
  
  const encodedParams = new URLSearchParams({
    slug,
    collection,
    path: localizedPath,
    previewSecret: process.env.PREVIEW_SECRET || '',
  })

  const url = `/next/preview?${encodedParams.toString()}`
  console.log('✅ GENERATE PREVIEW PATH DEBUG - Generated URL:', url)

  return url
}
