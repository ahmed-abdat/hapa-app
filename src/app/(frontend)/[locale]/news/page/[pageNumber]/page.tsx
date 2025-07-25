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
    pageNumber: string
  }>
}

export default async function NewsPaginationPage({ params: paramsPromise }: Args) {
  const { locale, pageNumber } = await paramsPromise
  
  if (!isValidLocale(locale)) {
    notFound()
  }

  const currentPage = parseInt(pageNumber, 10)
  
  if (isNaN(currentPage) || currentPage < 1) {
    notFound()
  }

  const payload = await getPayload({ config: configPromise })

  // 1. Find news category by slug
  const categoryResult = await payload.find({
    collection: 'categories',
    where: { slug: { equals: 'news' } },
    limit: 1,
    locale,
  })

  // If news category doesn't exist in CMS, create fallback title
  const categoryData = categoryResult.docs.length > 0 
    ? categoryResult.docs[0] 
    : { 
        id: '',
        title: locale === 'ar' ? 'الأخبار' : 'Actualités',
        slug: 'news' 
      }

  // 2. Find posts in news category with pagination
  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    page: currentPage,
    locale,
    overrideAccess: false,
    where: categoryResult.docs.length > 0 
      ? { categories: { in: [categoryData.id] } }
      : { id: { equals: 'nonexistent' } }, // Return empty if category doesn't exist
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
    },
  })

  // If page number is beyond available pages, redirect to 404
  if (currentPage > posts.totalPages && posts.totalPages > 0) {
    notFound()
  }

  return (
    <div className="pt-24 pb-24">
      {/* News Header */}
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>{categoryData.title}</h1>
          <p className="text-muted-foreground">
            {locale === 'ar' ? 'الصفحة' : 'Page'} {currentPage} {locale === 'ar' ? 'من' : 'de'} {posts.totalPages} - {posts.totalDocs} {locale === 'ar' ? 'مقال' : 'articles'}
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

      {/* Posts Grid or Empty State */}
      {posts.docs.length > 0 ? (
        <CollectionArchive posts={posts.docs} locale={locale} />
      ) : (
        <div className="container">
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {locale === 'ar' 
                ? 'لا توجد أخبار حاليًا'
                : 'Aucune actualité pour le moment'
              }
            </p>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="container">
        {posts.totalPages > 1 && posts.page && (
          <Pagination 
            page={posts.page} 
            totalPages={posts.totalPages}
            basePath={`/${locale}/news`}
          />
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale, pageNumber } = await paramsPromise
  
  if (!isValidLocale(locale)) {
    return {}
  }

  const title = locale === 'ar' 
    ? `الأخبار - الصفحة ${pageNumber} - HAPA`
    : `Actualités - Page ${pageNumber} - HAPA`
  
  const description = locale === 'ar' 
    ? `آخر الأخبار والإعلانات من الهيئة العليا للصحافة والإعلام المرئي والمسموع - الصفحة ${pageNumber}`
    : `Dernières actualités et annonces de la Haute Autorité de la Presse et de l'Audiovisuel - Page ${pageNumber}`

  return {
    title,
    description,
    alternates: {
      languages: {
        'fr': `/fr/news/page/${pageNumber}`,
        'ar': `/ar/news/page/${pageNumber}`
      }
    }
  }
}

export async function generateStaticParams() {
  // Generate first few pages for news
  const locales = ['fr', 'ar']
  const pageNumbers = ['1', '2', '3'] // Generate first 3 pages
  
  return locales.flatMap(locale =>
    pageNumbers.map(pageNumber => ({
      locale,
      pageNumber
    }))
  )
}