
interface FormLoadingSkeletonProps {
  sections?: number
  className?: string
}

export function FormLoadingSkeleton({ 
  sections = 4, 
  className = "" 
}: FormLoadingSkeletonProps) {
  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 md:p-8 animate-pulse ${className}`}>
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>

      {/* Form sections skeleton */}
      {Array.from({ length: sections }).map((_, index) => (
        <div key={index} className="mb-8">
          {/* Section title */}
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
          
          {/* Form fields */}
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}

      {/* File upload section skeleton */}
      <div className="mb-8">
        <div className="h-5 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-32 bg-gray-200 rounded border-2 border-dashed border-gray-300"></div>
      </div>

      {/* Submit button skeleton */}
      <div className="flex justify-end">
        <div className="h-12 bg-gray-200 rounded w-32"></div>
      </div>
    </div>
  )
}

export default FormLoadingSkeleton