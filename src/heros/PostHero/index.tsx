import { formatDateTime } from 'src/utilities/formatDateTime'
import React from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { formatAuthors } from '@/utilities/formatAuthors'
import { useTranslations } from 'next-intl'
import { type Locale } from '@/utilities/locale'

export const PostHero: React.FC<{
  post: Post
  locale: Locale
}> = ({ post, locale }) => {
  const { categories, heroImage, populatedAuthors, publishedAt, title } = post
  const t = useTranslations()

  const hasAuthors =
    populatedAuthors && populatedAuthors.length > 0 && formatAuthors(populatedAuthors) !== ''

  // Calculate responsive title size based on title length
  const getTitleClass = (titleLength: number) => {
    if (titleLength > 100) return "text-2xl md:text-3xl lg:text-4xl xl:text-5xl"
    if (titleLength > 60) return "text-2xl md:text-4xl lg:text-4xl xl:text-5xl"
    if (titleLength > 30) return "text-3xl md:text-4xl lg:text-4xl xl:text-5xl"
    return "text-3xl md:text-4xl lg:text-4xl xl:text-5xl"
  }

  const titleClass = getTitleClass(title?.length || 0)

  return (
    <div className="relative -mt-[10.4rem] flex items-end">
      <div className="container z-10 relative text-white">
        <div className="max-w-4xl mx-auto md:px-6 lg:px-8">
          {/* Enhanced responsive title */}
          <div className="mb-4 md:mb-6 pt-24 md:pt-28 lg:pt-32">
            <h1 className={`font-bold leading-tight tracking-tight ${titleClass}`}>
              {title}
            </h1>
          </div>

          {/* Metadata section below title - horizontal layout */}
          <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-6">
            {/* Categories */}
            {categories && categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  if (typeof category === 'object' && category !== null) {
                    const { title: categoryTitle } = category
                    const titleToUse = categoryTitle || t('untitledCategory')

                    return (
                      <span 
                        key={category.id}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-colors"
                      >
                        {titleToUse}
                      </span>
                    )
                  }
                  return null
                })}
              </div>
            )}

            {/* Date separator and publication date */}
            {publishedAt && (
              <>
                {categories && categories.length > 0 && (
                  <div className="w-1 h-1 bg-white/40 rounded-full hidden sm:block" />
                )}
                <time 
                  dateTime={publishedAt}
                  className="text-sm text-white/90 font-medium flex items-center gap-1"
                >
                  <span className="text-white/60">{t('datePublished')}:</span>
                  {formatDateTime(publishedAt)}
                </time>
              </>
            )}

            {/* Author information - inline */}
            {hasAuthors && (
              <>
                <div className="w-1 h-1 bg-white/40 rounded-full hidden md:block" />
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-white/60">{t('author')}:</span>
                  <span className="text-white/90 font-medium">
                    {formatAuthors(populatedAuthors)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Enhanced hero image with better gradient */}
      <div className="min-h-[75vh] md:min-h-[80vh] lg:min-h-[85vh] select-none">
        {heroImage && typeof heroImage !== 'string' && (
          <Media fill priority imgClassName="-z-10 object-cover" resource={heroImage} />
        )}
        <div className="absolute pointer-events-none left-0 bottom-0 w-full h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        <div className="absolute pointer-events-none left-0 top-0 w-full h-32 bg-gradient-to-b from-black/40 to-transparent" />
      </div>
    </div>
  )
}
