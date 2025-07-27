'use client'
import { Button } from '@/components/ui/button'
import { useRouter } from '@/i18n/navigation'

interface CategoryCardsProps {
  categories: Array<{
    title: string
    description: string
    icon: string
    query: string
  }>
}

export function CategoryCards({ categories }: CategoryCardsProps) {
  const router = useRouter()

  const handleCategoryClick = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <>
      {categories.map((category, index) => (
        <Button
          key={index}
          variant="outline"
          onClick={() => handleCategoryClick(category.query)}
          className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-primary hover:shadow-lg transition-all duration-300 text-left h-auto flex-col items-start justify-start space-y-4"
        >
          <div className="text-3xl">{category.icon}</div>
          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
            {category.title}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {category.description}
          </p>
        </Button>
      ))}
    </>
  )
}