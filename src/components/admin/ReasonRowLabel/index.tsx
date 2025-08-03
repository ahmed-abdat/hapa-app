'use client'

import React from 'react'
import { useRowLabel } from '@payloadcms/ui'

/**
 * Custom RowLabel component for reasons array in admin interface
 * Displays reason text in a truncated format for better readability
 */
const ReasonRowLabel: React.FC = () => {
  const { data } = useRowLabel<{ reason?: string }>()
  
  if (!data?.reason) {
    return <span style={{ color: '#888', fontStyle: 'italic' }}>Motif sans titre</span>
  }

  // Truncate long reasons for better display
  const truncatedReason = data.reason.length > 50 
    ? `${data.reason.substring(0, 50)}...` 
    : data.reason

  return (
    <span 
      style={{ 
        fontSize: '14px',
        color: '#333'
      }}
      title={data.reason} // Show full text on hover
    >
      {truncatedReason}
    </span>
  )
}

export default ReasonRowLabel