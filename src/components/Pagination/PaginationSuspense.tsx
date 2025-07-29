'use client'
import { Suspense } from 'react'
import { Pagination } from './index'

interface PaginationSuspenseProps {
  totalItems: number
  itemsPerPage?: number
  currentPage?: number
  className?: string
}

// Loading fallback for Pagination
function PaginationFallback({ className }: { className?: string }) {
  return (
    <nav 
      className={`flex flex-col items-center gap-4 mt-12 ${className || ''}`}
      role="navigation"
      aria-label="Navigation des pages"
    >
      <div className="animate-pulse">
        {/* Page info skeleton */}
        <div className="h-5 w-40 bg-gray-200 rounded mb-4"></div>

        {/* Pagination buttons skeleton */}
        <div className="flex items-center gap-2">
          {/* Previous button */}
          <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
          
          {/* Page number buttons */}
          <div className="flex items-center gap-1">
            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
          </div>

          {/* Next button */}
          <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </nav>
  )
}

export function PaginationSuspense({ totalItems, itemsPerPage = 12, currentPage = 1, className }: PaginationSuspenseProps) {
  // Only render if there are 10+ items (matching the component's logic)
  if (totalItems < 10 || Math.ceil(totalItems / itemsPerPage) <= 1) {
    return null
  }

  return (
    <Suspense fallback={<PaginationFallback className={className} />}>
      <Pagination 
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        className={className}
      />
    </Suspense>
  )
}