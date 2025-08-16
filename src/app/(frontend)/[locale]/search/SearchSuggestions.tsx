'use client'
import { Badge } from '@/components/ui/badge'
import { useRouter } from '@/i18n/navigation'
import { cn } from '@/utilities/ui'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'

interface SearchSuggestionsProps {
  suggestions: string[]
  locale: 'fr' | 'ar'
  variant?: 'default' | 'compact' | 'large'
}

export function SearchSuggestions({ 
  suggestions, 
  locale, 
  variant = 'default' 
}: SearchSuggestionsProps) {
  const router = useRouter()
  const isRtl = locale === 'ar'

  const handleSuggestionClick = (suggestion: string) => {
    router.push(`/search?q=${encodeURIComponent(suggestion)}`)
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return {
          container: 'gap-2',
          badge: 'px-3 py-1.5 text-xs h-auto',
          icon: 'w-3 h-3'
        }
      case 'large':
        return {
          container: 'gap-4',
          badge: 'px-5 py-3 text-sm h-auto font-medium',
          icon: 'w-4 h-4'
        }
      default:
        return {
          container: 'gap-3',
          badge: 'px-4 py-2.5 text-sm h-auto',
          icon: 'w-3.5 h-3.5'
        }
    }
  }

  const styles = getVariantStyles()

  if (!suggestions.length) return null

  return (
    <div className={cn(
      'flex flex-wrap items-center justify-center',
      styles.container,
      isRtl && 'rtl:space-x-reverse'
    )}>
      {suggestions.map((suggestion, index) => (
        <motion.div
          key={`${suggestion}-${index}`}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            delay: index * 0.1, 
            type: 'spring', 
            stiffness: 300, 
            damping: 20 
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Badge
            variant="outline"
            onClick={() => handleSuggestionClick(suggestion)}
            className={cn(
              'cursor-pointer transition-all duration-200 select-none',
              'bg-white/80 backdrop-blur-sm border-gray-200/80',
              'hover:bg-primary hover:text-primary-foreground hover:border-primary/50',
              'hover:shadow-lg hover:shadow-primary/20',
              'active:scale-95 focus-visible:ring-2 focus-visible:ring-primary/50',
              'group relative overflow-hidden',
              styles.badge,
              isRtl && 'text-right font-medium'
            )}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleSuggestionClick(suggestion)
              }
            }}
            aria-label={`${locale === 'fr' ? 'Rechercher' : 'البحث عن'} ${suggestion}`}
          >
            {/* Background gradient effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className={cn(
              'flex items-center gap-2 relative z-10',
              isRtl && 'flex-row-reverse'
            )}>
              <Search className={cn(
                'text-gray-400 group-hover:text-primary-foreground transition-colors',
                styles.icon
              )} />
              <span className="truncate">{suggestion}</span>
            </div>
          </Badge>
        </motion.div>
      ))}
    </div>
  )
}