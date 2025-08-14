'use client'

import React from 'react'
import { useField } from '@payloadcms/ui'
import { getMotifLabel } from '@/utilities/motif-translations'

/**
 * Custom Field component for reason field in admin interface
 * Displays French translation instead of raw English key
 * Shows clean, readable text for administrators
 */
const ReasonField: React.FC = () => {
  const { value } = useField<string>()
  
  if (!value || typeof value !== 'string') {
    return (
      <div style={{ 
        padding: '8px 12px', 
        color: '#888', 
        fontStyle: 'italic',
        fontSize: '14px',
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '4px'
      }}>
        Aucun motif spécifié
      </div>
    )
  }

  // Get French translation for the reason key
  const frenchLabel = getMotifLabel(value)

  return (
    <div style={{ 
      padding: '8px 12px',
      fontSize: '14px',
      color: '#374151',
      backgroundColor: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '4px',
      lineHeight: '1.5'
    }}>
      {frenchLabel}
    </div>
  )
}

export default ReasonField