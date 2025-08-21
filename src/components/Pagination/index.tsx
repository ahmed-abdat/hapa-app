'use client'
import { cn } from '@/lib/utils'
import { useRouter } from '@/i18n/navigation'
import { useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { type Locale } from '@/utilities/locale'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import React from 'react'

interface PaginationProps {
  totalItems: number
  itemsPerPage?: number
  currentPage?: number
  className?: string
}

export const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  itemsPerPage = 12,
  currentPage = 1,
  className
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const locale = useLocale() as Locale
  
  const isRtl = locale === 'ar'
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Only show pagination if there are 10+ items (best practice)
  if (totalItems < 10 || totalPages <= 1) {
    return null
  }

  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1

  // Generate visible page numbers (show first, last, current, and adjacent pages)
  const getVisiblePages = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = []
    
    // Always show first page
    pages.push(1)
    
    // Calculate start and end of middle range
    const startPage = Math.max(2, currentPage - 1)
    const endPage = Math.min(totalPages - 1, currentPage + 1)
    
    // Add ellipsis if there's a gap after page 1
    if (startPage > 2) {
      pages.push('ellipsis')
    }
    
    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i)
      }
    }
    
    // Add ellipsis if there's a gap before last page
    if (endPage < totalPages - 1) {
      pages.push('ellipsis')
    }
    
    // Always show last page (if more than 1 page)
    if (totalPages > 1) {
      pages.push(totalPages)
    }
    
    return pages
  }

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages || pageNumber === currentPage) {
      return
    }

    const params = new URLSearchParams(searchParams.toString())
    
    if (pageNumber === 1) {
      params.delete('page')
    } else {
      params.set('page', pageNumber.toString())
    }
    
    const queryString = params.toString()
    const newUrl = queryString ? `?${queryString}` : window.location.pathname
    
    router.push(newUrl)
  }

  const visiblePages = getVisiblePages()

  return (
    <nav 
      className={cn('flex flex-col items-center gap-4 mt-12', className)}
      role="navigation"
      aria-label={locale === 'ar' ? 'تصفح الصفحات' : 'Navigation des pages'}
    >
      {/* Page info */}
      <div className="text-sm text-gray-600 font-medium">
        {locale === 'ar' 
          ? `الصفحة ${currentPage} من ${totalPages} (${totalItems} مقال)`
          : `Page ${currentPage} sur ${totalPages} (${totalItems} articles)`
        }
      </div>

      {/* Pagination buttons */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
            'border border-gray-200',
            hasPrevPage 
              ? 'text-gray-700 hover:text-primary hover:bg-primary/5 hover:border-primary/30 active:scale-95' 
              : 'text-gray-400 cursor-not-allowed opacity-50',
          )}
          aria-label={locale === 'ar' ? 'الصفحة السابقة' : 'Page précédente'}
        >
          {isRtl ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {locale === 'ar' ? 'السابق' : 'Précédent'}
          </span>
        </button>

        {/* Page number buttons */}
        <div className="flex items-center gap-1">
          {visiblePages.map((pageNum, index) => {
            if (pageNum === 'ellipsis') {
              return (
                <div 
                  key={`ellipsis-${index}`} 
                  className="flex items-center justify-center w-10 h-10"
                  aria-hidden="true"
                >
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </div>
              )
            }

            const pageNumber = pageNum as number
            const isActive = pageNumber === currentPage

            return (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={cn(
                  'flex items-center justify-center w-10 h-10 text-sm font-medium rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'text-gray-700 hover:text-primary hover:bg-primary/10 border border-gray-200 hover:border-primary/30'
                )}
                aria-label={
                  locale === 'ar' 
                    ? `الذهاب إلى الصفحة ${pageNumber}` 
                    : `Aller à la page ${pageNumber}`
                }
                aria-current={isActive ? 'page' : undefined}
              >
                {pageNumber}
              </button>
            )
          })}
        </div>

        {/* Next button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
            'border border-gray-200',
            hasNextPage 
              ? 'text-gray-700 hover:text-primary hover:bg-primary/5 hover:border-primary/30 active:scale-95' 
              : 'text-gray-400 cursor-not-allowed opacity-50',
          )}
          aria-label={locale === 'ar' ? 'الصفحة التالية' : 'Page suivante'}
        >
          <span className="hidden sm:inline">
            {locale === 'ar' ? 'التالي' : 'Suivant'}
          </span>
          {isRtl ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Quick jump for large datasets (only show if 10+ pages) */}
      {totalPages >= 10 && (
        <div className={cn(
          'flex items-center gap-2 text-xs text-gray-500',
        )}>
          <label htmlFor="page-jump" className="font-medium">
            {locale === 'ar' ? 'الذهاب إلى الصفحة:' : 'Aller à la page:'}
          </label>
          <input
            id="page-jump"
            type="number"
            min="1"
            max={totalPages}
            defaultValue={currentPage}
            className="w-16 px-2 py-1 text-center text-sm border border-gray-200 rounded focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const value = parseInt((e.target as HTMLInputElement).value)
                if (value >= 1 && value <= totalPages) {
                  handlePageChange(value)
                }
              }
            }}
            aria-label={locale === 'ar' ? 'أدخل رقم الصفحة' : 'Entrez le numéro de page'}
          />
        </div>
      )}
    </nav>
  )
}
