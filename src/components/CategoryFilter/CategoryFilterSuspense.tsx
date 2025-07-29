'use client'
import { Suspense } from 'react'
import { CategoryFilter } from './index'
import type { Category } from '@/payload-types'
import type { Locale } from '@/utilities/locale'

interface CategoryFilterSuspenseProps {
  categories: Category[]
  selectedCategory?: string
  locale: Locale
}

// Loading fallback for CategoryFilter
function CategoryFilterFallback({ locale }: { locale: Locale }) {
  return (
    <div className="w-full" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="animate-pulse">
        {/* Loading skeleton for filter header */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-5 h-5 bg-gray-200 rounded"></div>
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
        </div>
        
        {/* Loading skeleton for category pills */}
        <div className="flex gap-3 pb-4 px-2">
          <div className="h-12 w-28 bg-gray-200 rounded-full flex-shrink-0"></div>
          <div className="h-12 w-24 bg-gray-200 rounded-full flex-shrink-0"></div>
          <div className="h-12 w-32 bg-gray-200 rounded-full flex-shrink-0"></div>
          <div className="h-12 w-20 bg-gray-200 rounded-full flex-shrink-0"></div>
        </div>
      </div>
    </div>
  )
}

export function CategoryFilterSuspense({ categories, selectedCategory, locale }: CategoryFilterSuspenseProps) {
  return (
    <Suspense fallback={<CategoryFilterFallback locale={locale} />}>
      <CategoryFilter 
        categories={categories}
        selectedCategory={selectedCategory}
        locale={locale}
      />
    </Suspense>
  )
}