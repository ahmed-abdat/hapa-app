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
  
  
  const encodedParams = new URLSearchParams({
    slug,
    collection,
    path: localizedPath,
    previewSecret: process.env.PREVIEW_SECRET || '',
  })

  const url = `/next/preview?${encodedParams.toString()}`

  return url
}
