'use client'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/utilities/ui'

interface SearchSkeletonProps {
  variant?: 'grid' | 'list'
  count?: number
  locale?: 'fr' | 'ar'
}

export function SearchSkeleton({ 
  variant = 'grid', 
  count = 6,
  locale = 'fr' 
}: SearchSkeletonProps) {
  const isRtl = locale === 'ar'

  if (variant === 'list') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, index) => (
          <Card key={index} className="p-6">
            <CardContent className="space-y-4">
              <div className={cn(
                'flex gap-4',
                isRtl && 'flex-row-reverse'
              )}>
                <Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
              <div className={cn(
                'flex gap-2',
                isRtl && 'flex-row-reverse'
              )}>
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="p-6">
          <CardContent className="space-y-4">
            <div className={cn(
              'flex items-center gap-3',
              isRtl && 'flex-row-reverse'
            )}>
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <div className={cn(
              'flex gap-2',
              isRtl && 'flex-row-reverse'
            )}>
              <Skeleton className="h-5 w-12 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function SearchInputSkeleton({ locale = 'fr' }: { locale?: 'fr' | 'ar' }) {
  return (
    <div className="max-w-3xl mx-auto mb-8">
      <Skeleton className="h-14 w-full rounded-full" />
    </div>
  )
}

export function SearchSuggestionsSkeleton({ 
  locale = 'fr',
  count = 6 
}: { 
  locale?: 'fr' | 'ar'
  count?: number 
}) {
  const isRtl = locale === 'ar'
  
  return (
    <div className={cn(
      'flex flex-wrap gap-3 justify-center',
      isRtl && 'rtl:space-x-reverse'
    )}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton 
          key={index} 
          className="h-8 w-20 rounded-full" 
          style={{ width: `${Math.random() * 60 + 60}px` }}
        />
      ))}
    </div>
  )
}