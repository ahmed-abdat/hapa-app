'use client'

import React from 'react'
import { useField } from '@payloadcms/ui'
import { getMotifLabel, getMotifDescription } from '@/utilities/motif-translations'

/**
 * Custom Field component for reason field in admin interface
 * Displays localized translation based on submission locale
 * Shows clean, readable text for administrators in French or Arabic
 */
const ReasonField: React.FC = () => {
  const { value } = useField<string>()
  const { value: formData } = useField<any>({ path: '' })
  
  // Determine locale from the submission
  const submissionLocale = formData?.locale || 'fr'
  
  if (!value || typeof value !== 'string') {
    return (
      <div style={{ 
        padding: '8px 12px', 
        color: '#888', 
        fontStyle: 'italic',
        fontSize: '14px',
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '4px',
        direction: submissionLocale === 'ar' ? 'rtl' : 'ltr'
      }}>
        {submissionLocale === 'ar' ? 'لم يتم تحديد سبب' : 'Aucun motif spécifié'}
      </div>
    )
  }

  // Get localized translation for the reason key
  const label = getMotifLabel(value, submissionLocale as 'fr' | 'ar')
  const description = getMotifDescription(value, submissionLocale as 'fr' | 'ar')

  return (
    <div style={{ 
      padding: '12px',
      fontSize: '14px',
      color: '#374151',
      backgroundColor: '#fef3c7',
      border: '1px solid #fbbf24',
      borderRadius: '6px',
      lineHeight: '1.5',
      direction: submissionLocale === 'ar' ? 'rtl' : 'ltr'
    }}>
      <div style={{
        fontWeight: '600',
        marginBottom: description ? '4px' : '0'
      }}>
        {label}
      </div>
      {description && (
        <div style={{
          fontSize: '12px',
          color: '#78716c',
          marginTop: '4px'
        }}>
          {description}
        </div>
      )}
      <div style={{
        fontSize: '10px',
        color: '#94a3b8',
        marginTop: '8px',
        fontFamily: 'monospace'
      }}>
        {value}
      </div>
    </div>
  )
}

export default ReasonField