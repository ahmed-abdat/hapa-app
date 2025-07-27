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
    <div className={cn('hapa-container')}>
      <div>
        {/* Enhanced responsive grid: 1 column mobile, 2 columns tablet/laptop, 3 columns desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 grid-spacing">
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
