'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Post } from '@/payload-types'
import { revalidateTag, unstable_cache } from 'next/cache'

export interface SearchParams {
  query: string
  locale: 'fr' | 'ar'
  limit?: number
  offset?: number
  category?: string
}

export interface SearchResult {
  posts: Post[]
  totalDocs: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface QuickSearchResult {
  id: string
  title: string
  type: 'post' | 'decision' | 'announcement'
  excerpt?: string
  publishedAt?: string | null
  slug: string
}

// Simple cached search focused on user experience
const cachedSearch = unstable_cache(
  async (params: SearchParams): Promise<SearchResult> => {
    const payload = await getPayload({ config: configPromise })
    const { query, locale, limit = 12, offset = 0, category } = params
    
    // Build search conditions
    const searchConditions = []
    
    if (query.trim()) {
      searchConditions.push({
        or: [
          {
            title: {
              contains: query.trim(),
            },
          },
          {
            'meta.description': {
              contains: query.trim(),
            },
          },
          {
            'meta.title': {
              contains: query.trim(),
            },
          },
          {
            slug: {
              contains: query.trim(),
            },
          },
          {
            'categories.title': {
              contains: query.trim(),
            },
          },
        ],
      })
    }
    
    // Add category filter if specified
    if (category) {
      searchConditions.push({
        'categories.slug': {
          equals: category,
        },
      })
    }
    
    const result = await payload.find({
      collection: 'posts',
      depth: 2,
      limit,
      page: Math.floor(offset / limit) + 1,
      locale,
      sort: '-publishedAt',
      where: {
        and: [
          {
            _status: {
              equals: 'published',
            },
          },
          ...searchConditions,
        ],
      },
      select: {
        title: true,
        slug: true,
        categories: true,
        meta: true,
        heroImage: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        content: true,
      },
    })
    
    return {
      posts: result.docs,
      totalDocs: result.totalDocs,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    }
  },
  ['search-results'],
  {
    revalidate: 300, // 5 minutes
    tags: ['search'],
  }
)

// Main search action
export async function searchPosts(params: SearchParams): Promise<SearchResult> {
  try {
    return await cachedSearch(params)
  } catch (error) {
    console.error('Search error:', error)
    throw error
  }
}

// Quick search for autocomplete/suggestions
export async function quickSearch(query: string, locale: 'fr' | 'ar'): Promise<QuickSearchResult[]> {
  if (!query.trim() || query.length < 2) {
    return []
  }
  
  try {
    const payload = await getPayload({ config: configPromise })
    
    const result = await payload.find({
      collection: 'posts',
      depth: 1,
      limit: 5,
      locale,
      where: {
        and: [
          {
            _status: {
              equals: 'published',
            },
          },
          {
            or: [
              {
                title: {
                  contains: query.trim(),
                },
              },
              {
                'categories.title': {
                  contains: query.trim(),
                },
              },
            ],
          },
        ],
      },
      select: {
        title: true,
        slug: true,
        categories: true,
        meta: {
          description: true,
        },
        publishedAt: true,
      },
      sort: '-publishedAt',
    })
    
    return result.docs.map((post): QuickSearchResult => ({
      id: String(post.id),
      title: post.title || 'Untitled',
      type: 'post',
      excerpt: post.meta?.description ? post.meta.description.substring(0, 100) + '...' : undefined,
      publishedAt: post.publishedAt || null,
      slug: post.slug || '',
    }))
  } catch (error) {
    // Error handled by throwing
    return []
  }
}

// Get popular search terms based on categories
export async function getPopularSearchTerms(locale: 'fr' | 'ar'): Promise<string[]> {
  try {
    const payload = await getPayload({ config: configPromise })
    
    const categories = await payload.find({
      collection: 'categories',
      depth: 1,
      limit: 8,
      locale,
      select: {
        title: true,
      },
    })
    
    const terms = categories.docs
      .map(cat => cat.title)
      .filter(Boolean)
      .slice(0, 6)
    
    // Add engaging and memorable default terms based on locale
    const defaultTerms = locale === 'fr' 
      ? ['Actualités récentes', 'Nouvelles décisions', 'Demandes de licence', 'Annonces officielles', 'Réglementation médias', 'Innovation numérique']
      : ['آخر الأخبار', 'قرارات جديدة', 'طلبات التراخيص', 'إعلانات رسمية', 'تنظيم الإعلام', 'الابتكار الرقمي']
    
    return [...terms, ...defaultTerms].slice(0, 6)
  } catch (error) {
    // Error handled by throwing
    // Return engaging and memorable fallback terms
    const fallbackTerms = locale === 'fr' 
      ? ['Dernières actualités', 'Décisions récentes', 'Services HAPA', 'Licences médias', 'Communiqués officiels', 'Innovation']
      : ['آخر الأخبار', 'القرارات الحديثة', 'خدمات الهيئة', 'تراخيص الإعلام', 'البيانات الرسمية', 'الابتكار']
    return fallbackTerms
  }
}

// Simple search with minimal analytics
export async function searchPostsWithAnalytics(params: SearchParams): Promise<SearchResult> {
  try {
    const result = await searchPosts(params)
    
    // Return search results
    
    return result
  } catch (error) {
    console.error('Search error:', error)
    throw error
  }
}

// Revalidate search cache when content changes
export async function revalidateSearchCache() {
  revalidateTag('search')
}