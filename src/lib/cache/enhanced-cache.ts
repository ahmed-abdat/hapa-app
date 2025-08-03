import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Post, Category } from '@/payload-types'
import type { Locale } from '@/utilities/locale'
import { logger } from '@/utilities/logger'

/**
 * Enhanced caching utilities for HAPA website performance optimization
 * Follows Next.js 15 + React 19 best practices for unstable_cache usage:
 * 
 * - Uses React cache() for request-scoped memoization (React 19 optimized)
 * - Includes all dynamic parameters in cache keys
 * - Optimizes select fields and depth for performance 
 * - Implements proper error handling with async/await patterns
 * - Uses cache tags for targeted invalidation
 * - Compatible with React Compiler optimizations
 */

// React cache for request-scoped memoization (prevents duplicate calls within same request)
export const getPayloadClient = cache(async () => {
  return await getPayload({ config: configPromise })
})

// Optimized posts cache with dynamic key parts and proper error handling
export const getCachedPosts = unstable_cache(
  async ({
    locale = 'fr',
    limit = 6,
    categoryId,
    excludeId,
  }: {
    locale?: Locale
    limit?: number
    categoryId?: string
    excludeId?: string
  }): Promise<Post[]> => {
    try {
      const payload = await getPayloadClient()
      
      // Build optimized where clause - Payload where clause structure
      const whereClause: Record<string, any> = {
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
        depth: 1, // Optimized depth for list views
        select: {
          id: true,
          title: true,
          slug: true,
          publishedAt: true,
          createdAt: true,
          heroImage: true,
          categories: true, // Include for filtering
          meta: {
            description: true,
          },
        },
      })

      return result.docs
    } catch (error) {
      logger.cache.error('posts_fetch', 'posts', error as Error, {
        metadata: { locale, limit, categoryId, excludeId }
      })
      return []
    }
  },
  // Include all dynamic parameters in cache key
  ['posts', 'list'],
  {
    revalidate: 300, // 5 minutes cache
    tags: ['posts-collection'],
  }
)

// Cached single post with optimized fields for detail view
export const getCachedPostBySlug = unstable_cache(
  async ({ slug, locale = 'fr' }: { slug: string; locale?: Locale }): Promise<Post | null> => {
    try {
      const payload = await getPayloadClient()

      const result = await payload.find({
        collection: 'posts',
        where: {
          slug: { equals: slug },
          _status: { equals: 'published' }
        },
        limit: 1,
        locale,
        depth: 2, // Keep depth 2 for full content and populated relations
        select: {
          id: true,
          title: true,
          slug: true,
          publishedAt: true,
          createdAt: true,
          heroImage: true,
          categories: true,
          content: true, // Full content for detail view
          meta: {
            title: true,
            description: true,
            image: true,
          },
        },
      })

      return result.docs[0] || null
    } catch (error) {
      logger.cache.error('post_by_slug_fetch', slug, error as Error, {
        metadata: { locale, slug }
      })
      return null
    }
  },
  // Include slug and locale in cache key for proper invalidation
  ['post', 'detail'],
  {
    revalidate: 300, // 5 minutes cache
    tags: ['posts-collection'],
  }
)

// Cached categories with React cache for request memoization
export const getCachedCategories = cache(
  unstable_cache(
    async ({ locale = 'fr' }: { locale?: Locale } = {}): Promise<Category[]> => {
      try {
        const payload = await getPayloadClient()

        const result = await payload.find({
          collection: 'categories',
          limit: 100,
          sort: 'title',
          locale,
          depth: 1, // Optimized depth
          select: {
            id: true,
            title: true,
            slug: true,
          },
        })

        return result.docs
      } catch (error) {
        logger.cache.error('categories_fetch', 'categories', error as Error, {
          metadata: { locale }
        })
        return []
      }
    },
    ['categories', 'list'],
    {
      revalidate: 3600, // 1 hour cache - categories change less frequently
      tags: ['categories-collection'],
    }
  )
)

// Helper function to get posts by category (uses main posts cache)
export const getCachedPostsByCategory = (
  categoryId: string,
  locale: Locale = 'fr',
  limit: number = 6
) => {
  return getCachedPosts({ locale, limit, categoryId })
}

// Helper function to get related posts (excludes current post)
export const getCachedRelatedPosts = (
  excludeId: string,
  locale: Locale = 'fr',
  limit: number = 3
) => {
  return getCachedPosts({ locale, limit, excludeId })
}

// Cache invalidation helpers (for manual revalidation)
export const cacheInvalidation = {
  // Invalidate all posts cache
  invalidatePosts: () => {
    // Note: revalidateTag requires server action or route handler context
    // This helper documents the available tags for invalidation
    return 'posts-collection'
  },
  
  // Invalidate all categories cache
  invalidateCategories: () => {
    return 'categories-collection'
  },
  
  // Get all cache tags for complete invalidation
  getAllTags: () => {
    return ['posts-collection', 'categories-collection']
  }
}