'use client'

import React, { useState, useCallback, useRef } from 'react'
import { useForm } from '@payloadcms/ui'
import { ArrayField } from '@payloadcms/ui'
import type { ArrayFieldClientComponent } from 'payload'

interface BulkUploadState {
  isDragOver: boolean
  isUploading: boolean
  uploadProgress: { [key: string]: number }
  uploadQueue: File[]
}

/**
 * Enhanced Array Field component with bulk upload capabilities
 * Adds drag-and-drop functionality for multiple image uploads
 */
const BulkImageUploadField: ArrayFieldClientComponent = (props) => {
  const { addFieldRow } = useForm()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [bulkState, setBulkState] = useState<BulkUploadState>({
    isDragOver: false,
    isUploading: false,
    uploadProgress: {},
    uploadQueue: []
  })

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setBulkState(prev => ({ ...prev, isDragOver: true }))
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setBulkState(prev => ({ ...prev, isDragOver: false }))
  }, [])

  // Handle bulk file addition
  const handleBulkAdd = useCallback(async (files: File[]) => {
    // Assume empty array as current index base for new items
    let currentIndex = 0
    
    setBulkState(prev => ({ 
      ...prev, 
      isUploading: true,
      uploadQueue: files 
    }))

    try {
      // Add rows to the array field for each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const rowIndex = currentIndex + i
        
        // Update progress
        setBulkState(prev => ({
          ...prev,
          uploadProgress: {
            ...prev.uploadProgress,
            [file.name]: (i + 1) / files.length * 100
          }
        }))

        // Add new row to the array
        await addFieldRow({
          path: props.path,
          schemaPath: props.path,
          rowIndex: rowIndex,
          subFieldState: {
            media: {
              initialValue: null,
              valid: false,
              value: null,
            },
            caption: {
              initialValue: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
              valid: true,
              value: file.name.replace(/\.[^/.]+$/, ''),
            },
          },
        })

        // Small delay to prevent overwhelming the UI
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    } catch (error) {
      console.error('Error adding bulk images:', error)
    } finally {
      setBulkState({
        isDragOver: false,
        isUploading: false,
        uploadProgress: {},
        uploadQueue: []
      })
    }
  }, [props.path, addFieldRow])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setBulkState(prev => ({ ...prev, isDragOver: false }))
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    )
    
    if (files.length > 0) {
      handleBulkAdd(files)
    }
  }, [handleBulkAdd])

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(file => 
      file.type.startsWith('image/')
    )
    
    if (files.length > 0) {
      handleBulkAdd(files)
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [handleBulkAdd])

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div className="bulk-image-upload-wrapper">
      {/* Bulk Upload Drop Zone */}
      <div
        className={`bulk-upload-zone ${bulkState.isDragOver ? 'drag-over' : ''} ${bulkState.isUploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
        style={{
          border: `2px dashed ${bulkState.isDragOver ? '#007bff' : '#ddd'}`,
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '16px',
          textAlign: 'center',
          cursor: bulkState.isUploading ? 'wait' : 'pointer',
          backgroundColor: bulkState.isDragOver ? '#f8f9fa' : 'transparent',
          transition: 'all 0.2s ease-in-out'
        }}
      >
        {bulkState.isUploading ? (
          <div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
              Ajout en cours... ({bulkState.uploadQueue.length} images)
            </div>
            <div style={{ 
              width: '100%', 
              height: '4px', 
              backgroundColor: '#e9ecef',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div 
                style={{
                  height: '100%',
                  backgroundColor: '#007bff',
                  width: `${Object.keys(bulkState.uploadProgress).length / bulkState.uploadQueue.length * 100}%`,
                  transition: 'width 0.2s ease-in-out'
                }}
              />
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '4px' }}>
              📁 Ajouter plusieurs images
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Glissez-déposez des images ici ou cliquez pour sélectionner
            </div>
            <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
              Supports: PNG, JPG, JPEG, WEBP, GIF
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />

      {/* Standard Array Field */}
      <ArrayField {...props} />

      <style jsx>{`
        .bulk-upload-zone:hover {
          border-color: #007bff !important;
          background-color: #f8f9fa !important;
        }
        
        .bulk-upload-zone.drag-over {
          transform: scale(1.02);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
        }
        
        .bulk-upload-zone.uploading {
          pointer-events: none;
          opacity: 0.8;
        }
      `}</style>
    </div>
  )
}

// Export component for Payload's import map
export { BulkImageUploadField }
export default BulkImageUploadField