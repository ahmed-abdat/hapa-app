'use client'

import React from 'react'
import { useRowLabel, useField } from '@payloadcms/ui'
import { getMotifLabel } from '@/utilities/motif-translations'

/**
 * Custom RowLabel component for reasons array in admin interface
 * Displays localized labels based on submission locale
 * Keeps original simple styling per user preference
 */
const ReasonRowLabel: React.FC = () => {
  const { data } = useRowLabel<{ reason?: string }>()
  const { value: formData } = useField<any>({ path: '' })
  
  // Determine locale from the submission
  const submissionLocale = formData?.locale || 'fr'
  
  if (!data?.reason) {
    return (
      <span style={{ 
        color: '#888', 
        fontStyle: 'italic',
        direction: submissionLocale === 'ar' ? 'rtl' : 'ltr'
      }}>
        {submissionLocale === 'ar' ? 'سبب بدون عنوان' : 'Motif sans titre'}
      </span>
    )
  }

  // Get localized translation for the reason key
  const label = getMotifLabel(data.reason, submissionLocale as 'fr' | 'ar')
  
  // Truncate long reasons for better display
  const truncatedReason = label.length > 50 
    ? `${label.substring(0, 50)}...` 
    : label

  return (
    <span 
      style={{ 
        fontSize: '14px',
        color: '#333',
        direction: submissionLocale === 'ar' ? 'rtl' : 'ltr'
      }}
      title={label} // Show full text on hover
    >
      {truncatedReason}
    </span>
  )
}

export default ReasonRowLabel