'use client'

import React, { useRef } from 'react'
import { ArrayField } from '@payloadcms/ui'
import type { ArrayFieldClientComponent } from 'payload'

const SimpleBulkUploadField: ArrayFieldClientComponent = (props) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(file => 
      file.type.startsWith('image/')
    )
    
    if (files.length > 0) {
      // For now, just show an alert - could be enhanced later
      alert(`Selected ${files.length} images. Please add them manually using the "Add Image" button below.`)
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div style={{ marginBottom: '16px' }}>
      {/* Simple bulk upload button */}
      <div style={{
        border: '2px dashed #ddd',
        borderRadius: '8px',
        padding: '16px',
        textAlign: 'center',
        marginBottom: '16px',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
          📁 Sélection multiple d&apos;images
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleBulkUpload}
          style={{
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: 'white'
          }}
        />
        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
          Supports: PNG, JPG, JPEG, WEBP, GIF
        </div>
      </div>

      {/* Standard Array Field */}
      <ArrayField {...props} />
    </div>
  )
}

export { SimpleBulkUploadField }
export default SimpleBulkUploadField