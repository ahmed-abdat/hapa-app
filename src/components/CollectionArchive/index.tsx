import { cn } from '@/lib/utils'
import React from 'react'

import { PostCard } from '@/components/PostCard'
import { CardPostData } from '@/components/Card'
import { type Locale } from '@/utilities/locale'

export type Props = {
  posts: CardPostData[]
  locale: Locale
  showDescription?: boolean
  showCategory?: boolean
  shortDescription?: boolean
}

export const CollectionArchive: React.FC<Props> = (props) => {
  const { posts, locale, showDescription = false, showCategory = true, shortDescription = false } = props

  return (
    <div className={cn('hapa-container')}>
      {/* Enhanced responsive grid: 1 column mobile, 2 columns tablet/laptop, 3 columns desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 grid-spacing">
        {posts?.map((result) => {
          if (typeof result === 'object' && result !== null) {
            // Get category for the PostCard
            const category = result.categories && Array.isArray(result.categories) && result.categories.length > 0 
              ? (typeof result.categories[0] === 'object' && result.categories[0] !== null 
                  ? result.categories[0].title || 'Catégorie'
                  : '') 
              : undefined;

            // Get image for the PostCard - pass the whole media object
            const image = result.meta?.image && typeof result.meta.image === 'object' 
              ? result.meta.image 
              : undefined;

            // Get title - handle localized titles
            const title = typeof result.title === 'string' 
              ? result.title 
              : (result.title as { fr?: string; ar?: string })?.fr || '';

            return (
              <PostCard
                key={result.id}
                title={title}
                description={result.meta?.description || undefined}
                href={`/posts/${result.slug}`}
                image={image}
                category={category}
                date={result.publishedAt || result.createdAt || undefined}
                showDescription={showDescription}
                showCategory={showCategory}
                shortDescription={shortDescription}
                className="h-full"
              />
            )
          }

          return null
        })}
      </div>
      
      {/* Simple empty state */}
      {(!posts || posts.length === 0) && (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-lg">
            {locale === 'ar' 
              ? 'لا توجد مقالات حاليًا'
              : 'Aucun article disponible pour le moment'
            }
          </p>
        </div>
      )}
    </div>
  )
}
