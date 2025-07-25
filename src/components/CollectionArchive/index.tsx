import { cn } from '@/utilities/ui'
import React from 'react'

import { Card, CardPostData } from '@/components/Card'
import { type Locale } from '@/utilities/locale'

export type Props = {
  posts: CardPostData[]
  locale: Locale
}

export const CollectionArchive: React.FC<Props> = (props) => {
  const { posts, locale } = props

  return (
    <div className={cn('container')}>
      <div>
        {/* Enhanced responsive grid with better spacing and card sizing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {posts?.map((result) => {
            if (typeof result === 'object' && result !== null) {
              return (
                <div key={result.id} className="w-full">
                  <Card 
                    className="h-full flex flex-col" 
                    doc={result} 
                    relationTo="posts" 
                    showCategories 
                    locale={locale}
                  />
                </div>
              )
            }

            return null
          })}
        </div>
        
        {/* Empty state */}
        {(!posts || posts.length === 0) && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {locale === 'ar' 
                ? 'لا توجد مقالات حاليًا'
                : 'Aucun article disponible pour le moment'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
