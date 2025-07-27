import { unstable_cache as cache } from 'next/cache'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Post } from '@/payload-types'
import type { Locale } from './locale'

/**
 * Cached posts fetcher with automatic revalidation
 * Uses Next.js unstable_cache for optimal performance
 * Enhanced with depth limits and select fields optimization
 */
export const getCachedPosts = cache(
  async ({
    limit = 6,
    locale = 'fr',
    categoryId,
    excludeId,
  }: {
    limit?: number
    locale?: Locale
    categoryId?: string
    excludeId?: string
  }): Promise<Post[]> => {
    try {
      const payload = await getPayload({ config: configPromise })

      // Build where clause
      const whereClause: any = {
        _status: { equals: 'published' }
      }

      if (categoryId) {
        whereClause.categories = { in: [categoryId] }
      }

      if (excludeId) {
        whereClause.id = { not_equals: excludeId }
      }

      const result = await payload.find({
        collection: 'posts',
        where: whereClause,
        limit,
        sort: '-publishedAt',
        locale,
        depth: 1,
        select: {
          id: true,
          title: true,
          slug: true,
          publishedAt: true,
          createdAt: true,
          heroImage: true,
          categories: true,
          meta: {
            description: true,
          },
        },
      })

      return result.docs
    } catch (error) {
      console.error('Error fetching cached posts:', error)
      return []
    }
  },
  ['posts-cache'],
  {
    revalidate: 300, // 5 minutes cache
    tags: ['posts-collection'],
  }
)

/**
 * Cached single post fetcher
 */
export const getCachedPostBySlug = cache(
  async ({ slug, locale = 'fr' }: { slug: string; locale?: Locale }): Promise<Post | null> => {
    try {
      const payload = await getPayload({ config: configPromise })

      const result = await payload.find({
        collection: 'posts',
        where: {
          slug: { equals: slug },
          _status: { equals: 'published' }
        },
        limit: 1,
        locale,
        depth: 2, // Keep depth 2 for full post content
        select: {
          id: true,
          title: true,
          slug: true,
          publishedAt: true,
          createdAt: true,
          heroImage: true,
          categories: true,
          content: true, // Include content for full post view
          meta: {
            title: true,
            description: true,
            image: true,
          },
        },
      })

      return result.docs[0] || null
    } catch (error) {
      console.error('Error fetching cached post:', error)
      return null
    }
  },
  ['post-by-slug'],
  {
    revalidate: 300, // 5 minutes cache
    tags: ['posts-collection'],
  }
)

/**
 * Cached categories fetcher
 */
export const getCachedCategories = cache(
  async ({ locale = 'fr' }: { locale?: Locale } = {}) => {
    try {
      const payload = await getPayload({ config: configPromise })

      const result = await payload.find({
        collection: 'categories',
        limit: 100,
        sort: 'title',
        locale,
        depth: 1, // Add depth limit for performance
        select: {
          id: true,
          title: true,
          slug: true,
        },
      })

      return result.docs
    } catch (error) {
      console.error('Error fetching cached categories:', error)
      return []
    }
  },
  ['categories-cache'],
  {
    revalidate: 3600, // 1 hour cache - categories change less frequently
    tags: ['categories-collection'],
  }
)

/**
 * Cached homepage content - Disabled as no homepage global exists
 */
// export const getCachedHomepage = cache(
//   async ({ locale = 'fr' }: { locale?: Locale } = {}) => {
//     try {
//       const payload = await getPayload({ config: configPromise })

//       const result = await payload.findGlobal({
//         slug: 'homepage',
//         locale,
//         depth: 2,
//       })

//       return result
//     } catch (error) {
//       console.error('Error fetching cached homepage:', error)
//       return null
//     }
//   },
//   ['homepage-cache'],
//   {
//     revalidate: 600, // 10 minutes cache
//     tags: ['homepage-global'],
//   }
// )