'use client'

import React from 'react'
import { ComplaintForm } from '@/components/CustomForms/ComplaintForm'
import { FormSubmissionResponse } from '@/components/CustomForms/types'

interface ComplaintFormBlockProps {
  locale?: 'fr' | 'ar'
  [key: string]: any // Allow other props from Payload
}

export function ComplaintFormBlock({ locale = 'fr' }: ComplaintFormBlockProps) {
  const handleSuccess = (response: FormSubmissionResponse) => {
    console.log('Complaint form submitted successfully:', response)
    // You can add additional success handling here (e.g., analytics, redirects)
  }

  const handleError = (error: string) => {
    console.error('Complaint form submission error:', error)
    // You can add additional error handling here (e.g., error tracking)
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ComplaintForm 
          locale={locale}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
    </div>
  )
}