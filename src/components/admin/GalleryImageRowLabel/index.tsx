'use client'

import React from 'react'
import { useRowLabel } from '@payloadcms/ui'

interface GalleryImageData {
  media?: {
    alt?: string
    filename?: string
  } | number
  caption?: string
}

/**
 * Custom RowLabel component for gallery images array in admin interface
 * Displays meaningful labels instead of "Image NaN"
 * Shows caption, alt text, or filename with proper fallback
 */
const GalleryImageRowLabel: React.FC = () => {
  const { data, rowNumber } = useRowLabel<GalleryImageData>()
  
  // Helper function to get display text
  const getDisplayText = (): string => {
    // Try caption first
    if (data?.caption && typeof data.caption === 'string' && data.caption.trim()) {
      return data.caption.trim()
    }
    
    // Try media alt text
    if (data?.media && typeof data.media === 'object' && data.media.alt) {
      return data.media.alt
    }
    
    // Try media filename
    if (data?.media && typeof data.media === 'object' && data.media.filename) {
      return data.media.filename
    }
    
    // Fallback to image number
    const imageNumber = typeof rowNumber === 'number' ? rowNumber + 1 : 1
    return `Image ${String(imageNumber).padStart(2, '0')}`
  }

  const displayText = getDisplayText()
  
  // Truncate long text for better display
  const truncatedText = displayText.length > 40 
    ? `${displayText.substring(0, 40)}...` 
    : displayText

  return (
    <span 
      style={{ 
        fontSize: '14px',
        color: '#333',
        fontWeight: '500'
      }}
      title={displayText} // Show full text on hover
    >
      {truncatedText}
    </span>
  )
}

// Named export for Payload's import map
export { GalleryImageRowLabel }

// Default export for standard imports  
export default GalleryImageRowLabel