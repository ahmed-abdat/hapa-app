'use client'

import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'
import FormLoadingSkeleton from '@/components/ui/FormLoadingSkeleton'

// Dynamic import with loading state
const MediaContentComplaintForm = dynamic(
  () => import('./MediaContentComplaintForm/index').then(mod => ({ default: mod.MediaContentComplaintForm })),
  {
    loading: () => <FormLoadingSkeleton sections={5} />,
    ssr: true // Keep SSR for SEO
  }
)

interface DynamicMediaContentComplaintFormProps {
  className?: string
}

export function DynamicMediaContentComplaintForm({ 
  className 
}: DynamicMediaContentComplaintFormProps) {
  return (
    <Suspense fallback={<FormLoadingSkeleton sections={5} />}>
      <MediaContentComplaintForm className={className} />
    </Suspense>
  )
}

export default DynamicMediaContentComplaintForm