'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Filter } from 'lucide-react'
import type { Category } from '@/payload-types'
import type { Locale } from '@/utilities/locale'
import { motion } from 'framer-motion'

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
  
  const isRtl = locale === 'ar'

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
    <div className="w-full">
      {/* Simplified Header - Only show when no category selected */}
      {!selectedCategory && (
        <div className="flex items-center gap-2 text-primary mb-6">
          <Filter className="w-5 h-5" />
          <h3 className="text-lg font-semibold">
            {locale === 'ar' ? 'فلترة المقالات' : 'Filtrer les articles'}
          </h3>
        </div>
      )}

      {/* Category Pills - Horizontal Scrollable */}
      <div className="relative">
        {/* Fade gradients for visual scroll indication - RTL aware */}
        <div className={`absolute ${isRtl ? 'right-0' : 'left-0'} top-0 bottom-0 w-8 ${isRtl ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-gray-50 to-transparent z-10 pointer-events-none`} />
        <div className={`absolute ${isRtl ? 'left-0' : 'right-0'} top-0 bottom-0 w-8 ${isRtl ? 'bg-gradient-to-r' : 'bg-gradient-to-l'} from-gray-50 to-transparent z-10 pointer-events-none`} />
        
        <ScrollArea className="w-full" type="scroll">
          <div className={`flex gap-3 pb-4 px-2 `} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {/* All Categories Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-shrink-0"
            >
            <Button
              variant={!selectedCategory ? "default" : "outline"}
              className={`
                rounded-full px-6 py-3 font-medium transition-all duration-200 whitespace-nowrap touch-manipulation
                ${!selectedCategory 
                  ? 'bg-primary text-white shadow-md hover:shadow-lg' 
                  : 'border-2 border-gray-200 text-gray-700 hover:border-primary hover:text-primary hover:bg-primary/5 active:bg-primary/10'
                }
              `}
              onClick={() => handleClearFilter()}
            >
              {locale === 'ar' ? 'جميع المقالات' : 'Tous les articles'}
            </Button>
          </motion.div>

          {/* Category Buttons */}
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { delay: index * 0.1 }
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-shrink-0"
            >
              <Button
                variant={selectedCategory === category.slug ? "default" : "outline"}
                className={`
                  rounded-full px-6 py-3 font-medium transition-all duration-200 whitespace-nowrap touch-manipulation
                  ${selectedCategory === category.slug 
                    ? 'bg-primary text-white shadow-md hover:shadow-lg' 
                    : 'border-2 border-gray-200 text-gray-700 hover:border-primary hover:text-primary hover:bg-primary/5 hover:shadow-md active:bg-primary/10'
                  }
                `}
                onClick={() => handleCategorySelect(category.slug ?? '')}
              >
                {category.title}
              </Button>
            </motion.div>
          ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

    </div>
  )
}