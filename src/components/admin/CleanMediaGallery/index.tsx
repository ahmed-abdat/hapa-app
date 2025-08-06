'use client'

import React, { useState, useEffect } from 'react'
import { useField, useFormFields } from '@payloadcms/ui'
import type { ArrayFieldClientComponent } from 'payload'
import './index.scss'

interface MediaItem {
  url: string
  id?: string
}

/**
 * Clean Media Gallery - Completely replaces PayloadCMS array field UI
 * Hides all technical details and URLs from non-technical admin users
 * Shows only beautiful media previews with simple actions
 */
const CleanMediaGallery: ArrayFieldClientComponent = ({ path }) => {
  const fieldState = useField({ 
    path, 
    hasRows: true // Essential for array fields!
  })
  
  // 🎯 NEW APPROACH: Access actual form data using useFormFields
  const formFields = useFormFields(([fields]) => fields)
  
  const [lightboxMedia, setLightboxMedia] = useState<string | null>(null)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  // Cleanup body overflow on component unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // Get the actual array data from form fields
  const formFieldValue = formFields[path]?.value
  
  // Get actual data from the form
  let actualData: MediaItem[] | null = null
  if (Array.isArray(formFieldValue)) {
    actualData = formFieldValue
  } else if (fieldState.rows && Array.isArray(fieldState.rows) && formFieldValue) {
    // Try to get data for each row
    const rowData: MediaItem[] = fieldState.rows
      .map((row: any, index: number) => {
        const rowPath = `${path}.${index}`
        const data = formFields[rowPath]?.value || formFields[`${rowPath}.url`]?.value
        return data ? { url: data as string } : null
      })
      .filter((item): item is MediaItem => item !== null && typeof item.url === 'string')
    
    if (rowData.length > 0) {
      actualData = rowData
    }
  }
  
  // Fallback: search through all form fields for our data
  if (!actualData && typeof fieldState.value === 'number' && fieldState.value > 0) {
    Object.keys(formFields).forEach(key => {
      if (key.startsWith(path)) {
        // Found potential data, try to extract it
        const fieldValue = formFields[key]?.value
        if (fieldValue && !actualData) {
          actualData = Array.isArray(fieldValue) ? fieldValue as MediaItem[] : [fieldValue as MediaItem]
        }
      }
    })
  }

  // Handle empty state - check if we have actual data
  if (!actualData || !Array.isArray(actualData) || actualData.length === 0) {
    return (
      <div className="clean-media-gallery">
        <div className="clean-media-gallery__empty">
          <span className="clean-media-gallery__empty-icon">📁</span>
          <span className="clean-media-gallery__empty-text">
            Aucun média disponible
          </span>
        </div>
      </div>
    )
  }

  const openLightbox = (url: string) => {
    setLightboxMedia(url)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setLightboxMedia(null)
    document.body.style.overflow = 'unset'
  }

  const getFileType = (url: string): string => {
    const extension = url.toLowerCase().split('.').pop() || ''
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(extension)) return 'image'
    if (['mp4', 'avi', 'mov', 'wmv', 'webm', 'mkv'].includes(extension)) return 'video'
    if (['mp3', 'wav', 'ogg', 'aac', 'flac'].includes(extension)) return 'audio'
    if (['pdf', 'doc', 'docx', 'txt'].includes(extension)) return 'document'
    return 'file'
  }

  const getFileIcon = (fileType: string): string => {
    const icons = {
      image: '🖼️',
      video: '🎥',
      audio: '🎵',
      document: '📄',
      file: '📁'
    }
    return icons[fileType as keyof typeof icons] || '📁'
  }

  const renderMediaItem = (item: any, index: number) => {
    // Extract URL from the item data
    let url = null
    if (typeof item === 'string') {
      url = item // Direct URL string
    } else if (item?.url) {
      url = item.url // Object with url property  
    } else if (typeof item === 'object' && item !== null) {
      // Try common property names
      url = item.url || item.value || item.src || item.file
    }
    
    if (!url) {
      return null // Skip items without URLs
    }
    
    const media = { url }

    const fileType = getFileType(media.url)
    const fileIcon = getFileIcon(fileType)
    const isImageError = imageErrors.has(media.url)

    return (
      <div key={`media-${index}`} className="clean-media-gallery__item">
        <div 
          className="clean-media-gallery__preview"
          onClick={() => fileType === 'image' && !isImageError && openLightbox(media.url!)}
        >
          {fileType === 'image' && !isImageError ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={media.url}
                alt={`Média ${index + 1}`}
                className="clean-media-gallery__image"
                onError={() => {
                  setImageErrors(prev => new Set([...prev, media.url!]))
                }}
                loading="lazy"
              />
              <div className="clean-media-gallery__overlay">
                <span className="clean-media-gallery__overlay-text">
                  Cliquer pour agrandir
                </span>
              </div>
            </>
          ) : (
            <div className="clean-media-gallery__file-preview">
              <span className="clean-media-gallery__file-icon">{fileIcon}</span>
              <span className="clean-media-gallery__file-type">
                {fileType === 'image' && isImageError ? 'Image (erreur)' : 
                 fileType === 'video' ? 'Vidéo' :
                 fileType === 'audio' ? 'Audio' :
                 fileType === 'document' ? 'Document' : 'Fichier'}
              </span>
            </div>
          )}
        </div>

        <div className="clean-media-gallery__actions">
          <button
            onClick={() => window.open(media.url, '_blank', 'noopener,noreferrer')}
            className="clean-media-gallery__action-btn"
            type="button"
          >
            Ouvrir
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="clean-media-gallery">
        <div className="clean-media-gallery__header">
          <h3 className="clean-media-gallery__title">
            Fichiers multimédias ({actualData.length})
          </h3>
        </div>

        <div className="clean-media-gallery__grid">
          {actualData.map((item, index) => renderMediaItem(item, index))}
        </div>
      </div>

      {/* Lightbox for full-screen image viewing */}
      {lightboxMedia && (
        <div className="clean-media-gallery__lightbox" onClick={closeLightbox}>
          <button
            className="clean-media-gallery__lightbox-close"
            onClick={closeLightbox}
            type="button"
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxMedia}
            alt="Image agrandie"
            className="clean-media-gallery__lightbox-image"
          />
        </div>
      )}
    </>
  )
}

export default CleanMediaGallery