'use client'

import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'
import FormLoadingSkeleton from '@/components/ui/FormLoadingSkeleton'

// Dynamic import with loading state
const MediaContentReportForm = dynamic(
  () => import('./MediaContentReportForm/index').then(mod => ({ default: mod.MediaContentReportForm })),
  {
    loading: () => <FormLoadingSkeleton sections={4} />,
    ssr: true // Keep SSR for SEO
  }
)

interface DynamicMediaContentReportFormProps {
  className?: string
}

export function DynamicMediaContentReportForm({ 
  className 
}: DynamicMediaContentReportFormProps) {
  return (
    <Suspense fallback={<FormLoadingSkeleton sections={4} />}>
      <MediaContentReportForm className={className} />
    </Suspense>
  )
}

export default DynamicMediaContentReportForm