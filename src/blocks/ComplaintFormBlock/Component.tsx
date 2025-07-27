'use client'

import React from 'react'
import { ComplaintForm } from '@/components/CustomForms/ComplaintForm'
import { FormSubmissionResponse } from '@/components/CustomForms/types'

interface ComplaintFormBlockProps {
  locale?: 'fr' | 'ar'
  [key: string]: unknown // Allow other props from Payload
}

export function ComplaintFormBlock({ locale = 'fr' }: ComplaintFormBlockProps) {
  const handleSuccess = (_response: FormSubmissionResponse) => {
    // Form submitted successfully - logged via payload.logger
    // You can add additional success handling here (e.g., analytics, redirects)
  }

  const handleError = (_error: string) => {
    // Form submission error - logged via payload.logger
    // You can add additional error handling here (e.g., error tracking)
  }

  return (
    <div className="section-spacing bg-gray-50">
      <div className="hapa-container">
        <ComplaintForm 
          locale={locale}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
    </div>
  )
}