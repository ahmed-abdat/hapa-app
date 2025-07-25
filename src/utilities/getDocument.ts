import type { Config } from 'src/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
import { defaultLocale, type Locale } from './locale'

type Collection = keyof Config['collections']

async function getDocument(collection: Collection, slug: string, depth = 0, locale?: Locale | 'all') {
  const payload = await getPayload({ config: configPromise })
  
  const currentLocale = (locale as Locale | 'all') || defaultLocale
  const shouldDisableFallback = locale && locale !== defaultLocale

  const page = await payload.find({
    collection,
    depth,
    locale: currentLocale,
    fallbackLocale: shouldDisableFallback ? false : undefined,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return page.docs[0]
}

/**
 * Returns a unstable_cache function mapped with the cache tag for the slug
 */
export const getCachedDocument = (collection: Collection, slug: string, locale?: Locale | 'all') =>
  unstable_cache(async () => getDocument(collection, slug, 0, locale), [collection, slug, locale || defaultLocale], {
    tags: [`${collection}_${slug}_${locale || defaultLocale}`],
  })
