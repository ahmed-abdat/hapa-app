import type { Metadata } from 'next/types'
import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { isValidLocale } from '@/utilities/locale'
import { notFound } from 'next/navigation'

export const dynamic = 'force-static'
export const revalidate = 600

type Args = {
  params: Promise<{
    locale: string
    slug: string
  }>
}

export default async function CategoryPage({ params: paramsPromise }: Args) {
  const { locale, slug } = await paramsPromise
  
  if (!isValidLocale(locale)) {
    notFound()
  }

  const payload = await getPayload({ config: configPromise })

  // 1. Find category by slug
  const categoryResult = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
    locale,
  })

  if (categoryResult.docs.length === 0) {
    notFound()
  }

  const category = categoryResult.docs[0]

  // 2. Find posts in this category (using existing ArchiveBlock pattern)
  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    locale,
    overrideAccess: false,
    where: {
      categories: { in: [category.id] }
    },
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
    },
  })

  return (
    <div className="pt-24 pb-24">
      {/* Category Header */}
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>{category.title}</h1>
          <p className="text-muted-foreground">
            {posts.totalDocs} {locale === 'ar' ? 'مقال' : 'articles'}
          </p>
        </div>
      </div>

      {/* Posts Count */}
      <div className="container mb-8">
        <PageRange
          collection="posts"
          currentPage={posts.page}
          limit={12}
          totalDocs={posts.totalDocs}
        />
      </div>

      {/* Posts Grid (reusing existing component) */}
      <CollectionArchive posts={posts.docs} locale={locale} />

      {/* Pagination */}
      <div className="container">
        {posts.totalPages > 1 && posts.page && (
          <Pagination 
            page={posts.page} 
            totalPages={posts.totalPages}
            basePath={`/${locale}/posts/category/${slug}`}
          />
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale, slug } = await paramsPromise
  
  if (!isValidLocale(locale)) {
    return {}
  }

  // Get category for meta
  const payload = await getPayload({ config: configPromise })
  const categoryResult = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
    locale,
  })

  if (categoryResult.docs.length === 0) {
    return {}
  }

  const category = categoryResult.docs[0]
  const title = `${category.title} - HAPA`

  return {
    title,
    description: `Articles dans la catégorie ${category.title}`,
    alternates: {
      languages: {
        'fr': `/fr/posts/category/${slug}`,
        'ar': `/ar/posts/category/${slug}`
      }
    }
  }
}

export async function generateStaticParams() {
  // Generate for common categories - can be expanded
  return [
    { locale: 'fr', slug: 'news' },
    { locale: 'ar', slug: 'news' },
    // Add more as categories are created in admin
  ]
}