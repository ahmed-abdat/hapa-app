'use client'

import React from 'react'
import { useRowLabel } from '@payloadcms/ui'

/**
 * Custom RowLabel component for file arrays in admin interface
 * Displays file URLs as clickable download links instead of object notation
 */
const FileDisplayRowLabel: React.FC = () => {
  const { data, rowNumber } = useRowLabel<{ url?: string }>()
  if (!data?.url) {
    return <span style={{ color: '#888', fontStyle: 'italic' }}>Fichier sans URL</span>
  }

  // Extract filename from URL
  const getFilenameFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname
      const filename = pathname.split('/').pop() || 'Fichier téléchargé'
      
      // Decode URI component to handle special characters
      return decodeURIComponent(filename)
    } catch {
      // Fallback for non-URL strings or malformed URLs
      return url.length > 50 ? `${url.substring(0, 50)}...` : url
    }
  }

  // Check if URL is an image for preview
  const isImage = (url: string): boolean => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg']
    return imageExtensions.some(ext => url.toLowerCase().includes(ext))
  }

  const filename = getFilenameFromUrl(data.url)
  const displayText = `Fichier ${String(rowNumber).padStart(2, '0')}: ${filename}`

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px',
      maxWidth: '400px'
    }}>
      {/* File type icon */}
      <span style={{
        display: 'inline-block',
        width: '16px',
        height: '16px',
        backgroundColor: isImage(data.url) ? '#4CAF50' : '#2196F3',
        borderRadius: '2px',
        flexShrink: 0
      }} />
      
      {/* Clickable filename */}
      <a
        href={data.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: '#0070f3',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: '500',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
          minWidth: 0
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.textDecoration = 'underline'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.textDecoration = 'none'
        }}
        title={`Ouvrir ${filename} dans un nouvel onglet`}
      >
        {displayText}
      </a>

      {/* Download button */}
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          
          // Create temporary link for download
          const link = document.createElement('a')
          link.href = data.url
          link.download = filename
          link.target = '_blank'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }}
        style={{
          background: 'none',
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '4px 8px',
          fontSize: '12px',
          color: '#666',
          cursor: 'pointer',
          flexShrink: 0
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#f5f5f5'
          e.currentTarget.style.borderColor = '#999'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
          e.currentTarget.style.borderColor = '#ddd'
        }}
        title="Télécharger le fichier"
      >
        ⬇
      </button>
    </div>
  )
}

export default FileDisplayRowLabel