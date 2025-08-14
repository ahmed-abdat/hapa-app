'use client'

import React from 'react'
import { useRowLabel } from '@payloadcms/ui'
import { getMotifLabel } from '@/utilities/motif-translations'

/**
 * Custom RowLabel component for reasons array in admin interface
 * Displays translated French labels instead of raw English keys
 * Keeps original simple styling per user preference
 */
const ReasonRowLabel: React.FC = () => {
  const { data } = useRowLabel<{ reason?: string }>()
  
  if (!data?.reason) {
    return <span style={{ color: '#888', fontStyle: 'italic' }}>Motif sans titre</span>
  }

  // Get French translation for the reason key
  const frenchLabel = getMotifLabel(data.reason)
  
  // Truncate long reasons for better display
  const truncatedReason = frenchLabel.length > 50 
    ? `${frenchLabel.substring(0, 50)}...` 
    : frenchLabel

  return (
    <span 
      style={{ 
        fontSize: '14px',
        color: '#333'
      }}
      title={frenchLabel} // Show full French text on hover
    >
      {truncatedReason}
    </span>
  )
}

export default ReasonRowLabel