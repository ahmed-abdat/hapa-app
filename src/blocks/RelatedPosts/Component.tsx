import clsx from 'clsx'
import React from 'react'
import RichText from '@/components/RichText'

import type { Post } from '@/payload-types'

import { Card } from '../../components/Card'
import { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { type Locale } from '@/utilities/locale'
import { getTranslations } from 'next-intl/server'

export type RelatedPostsProps = {
  className?: string
  docs?: Post[]
  introContent?: SerializedEditorState
  locale: Locale
}

export const RelatedPosts: React.FC<RelatedPostsProps> = async (props) => {
  const { className, docs, introContent, locale } = props

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

            return (
              <Card 
                key={doc.id} 
                doc={doc} 
                relationTo="posts" 
                showCategories 
                locale={locale}
                className="h-full"
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
