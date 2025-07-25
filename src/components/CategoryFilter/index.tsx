'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import type { Category } from '@/payload-types'
import type { Locale } from '@/utilities/locale'

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory?: string
  locale: Locale
}

export function CategoryFilter({ 
  categories, 
  selectedCategory, 
  locale 
}: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleCategorySelect = (categorySlug: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('category', categorySlug)
    router.push(`?${params.toString()}`)
  }

  const handleClearFilter = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('category')
    const queryString = params.toString()
    router.push(queryString ? `?${queryString}` : window.location.pathname)
  }

  const selectedCategoryObj = categories.find(cat => cat.slug === selectedCategory)

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <span className="text-sm font-medium text-gray-700">
        {locale === 'ar' ? 'فلترة حسب الفئة:' : 'Filtrer par catégorie:'}
      </span>
      
      {/* Active Filter */}
      {selectedCategoryObj && (
        <Badge variant="default" className="flex items-center gap-1">
          {selectedCategoryObj.title}
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 hover:bg-transparent"
            onClick={handleClearFilter}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {/* Category Buttons */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.slug ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategorySelect(category.slug)}
          >
            {category.title}
          </Button>
        ))}
      </div>

      {/* Clear All */}
      {selectedCategory && (
        <Button variant="ghost" size="sm" onClick={handleClearFilter}>
          {locale === 'ar' ? 'إزالة الفلتر' : 'Effacer le filtre'}
        </Button>
      )}
    </div>
  )
}