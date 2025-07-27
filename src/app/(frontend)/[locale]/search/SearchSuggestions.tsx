'use client'
import { Button } from '@/components/ui/button'
import { useRouter } from '@/i18n/navigation'

interface SearchSuggestionsProps {
  suggestions: string[]
  locale: 'fr' | 'ar'
}

export function SearchSuggestions({ suggestions, locale }: SearchSuggestionsProps) {
  const router = useRouter()

  const handleSuggestionClick = (suggestion: string) => {
    router.push(`/search?q=${encodeURIComponent(suggestion)}`)
  }

  return (
    <>
      {suggestions.map((suggestion, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => handleSuggestionClick(suggestion)}
          className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
        >
          {suggestion}
        </Button>
      ))}
    </>
  )
}