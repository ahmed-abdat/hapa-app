import clsx from 'clsx'
import React from 'react'
import RichText from '@/components/RichText'

import type { Post } from '@/payload-types'

import { PostCard } from '@/components/PostCard'
import { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { type Locale } from '@/utilities/locale'
import { getTranslations } from 'next-intl/server'

export type RelatedPostsProps = {
  className?: string
  docs?: Post[]
  introContent?: SerializedEditorState
  showDescription?: boolean
  locale: Locale
}

export const RelatedPosts: React.FC<RelatedPostsProps> = async (props) => {
  const { className, docs, introContent, showDescription = false, locale } = props

  if (!docs || docs.length === 0) return null
  
  const t = await getTranslations()

  return (
    <section className={clsx('w-full', className)}>
      <div className="container">
        {/* Section Header */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3">
            {t('relatedPosts')}
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
            {t('relatedPostsDesc')}
          </p>
        </div>

        {/* Custom intro content if provided */}
        {introContent && (
          <div className="mb-8">
            <RichText data={introContent} enableGutter={false} />
          </div>
        )}

        {/* Posts Grid - Responsive: 1 mobile, 2 tablet, 3 desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-stretch">
          {docs.map((doc) => {
            if (typeof doc === 'string') return null

            // Get category for the PostCard
            const category = doc.categories && Array.isArray(doc.categories) && doc.categories.length > 0 
              ? (typeof doc.categories[0] === 'object' && doc.categories[0] !== null 
                  ? doc.categories[0].title || t('untitledCategory')
                  : '') 
              : undefined;

            // Get image for the PostCard - pass the whole media object
            const image = doc.meta?.image && typeof doc.meta.image === 'object' 
              ? doc.meta.image 
              : doc.heroImage && typeof doc.heroImage === 'object' && 'url' in doc.heroImage
              ? doc.heroImage
              : undefined;

            // Get title
            const title = typeof doc.title === 'string' ? doc.title : doc.title?.fr || '';

            return (
              <PostCard
                key={doc.id}
                title={title}
                description={doc.meta?.description || undefined}
                href={`/posts/${doc.slug}`}
                image={image}
                category={category}
                date={doc.publishedAt || doc.createdAt || undefined}
                showDescription={showDescription}
                className="h-full"
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
