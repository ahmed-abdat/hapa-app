'use client'

import React, { useState } from 'react'
import { useRowLabel } from '@payloadcms/ui'
import './index.scss'

/**
 * Enhanced media preview component for admin interface
 * Follows PayloadCMS best practices for custom row label components
 * Provides intelligent previews for different file types with fallbacks
 * Designed for non-technical users with clear visual indicators
 */
const MediaPreviewCard: React.FC = () => {
  const { data, rowNumber } = useRowLabel<{ url?: string }>()
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showLightbox, setShowLightbox] = useState(false)

  if (!data?.url) {
    return (
      <div className="media-preview-card">
        <div className="media-preview-card__no-media">
          <span className="icon">📄</span>
          <span className="text">Aucun fichier</span>
        </div>
      </div>
    )
  }

  const url = data.url
  const fileInfo = getFileInfo(url)

  return (
    <div className="media-preview-simple">
      {/* Simple media preview */}
      <div 
        className="media-preview-simple__preview"
        onClick={() => fileInfo.type === 'image' && !imageError && setShowLightbox(true)}
        style={{ cursor: fileInfo.type === 'image' && !imageError ? 'pointer' : 'default' }}
      >
        {renderMediaPreview(url, fileInfo.type, imageError, setImageError, setIsLoading)}
        {isLoading && fileInfo.type === 'image' && (
          <div className="media-preview-simple__loading">⏳</div>
        )}
        {/* Simple hover effect for images */}
        {fileInfo.type === 'image' && !imageError && (
          <div className="media-preview-simple__hover">
            Cliquer pour agrandir
          </div>
        )}
      </div>
      
      {/* Simple file type indicator */}
      <div className="media-preview-simple__type">
        {fileInfo.icon} {fileInfo.label}
      </div>

      {/* Simple action - just open */}
      <button
        onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
        className="media-preview-simple__action"
        title="Ouvrir le fichier"
        type="button"
      >
        Ouvrir
      </button>

      {/* Simple lightbox */}
      {showLightbox && (
        <div 
          className="media-preview-simple__lightbox" 
          onClick={() => {
            setShowLightbox(false)
            document.body.style.overflow = 'unset'
          }}
        >
          <button
            className="media-preview-simple__close"
            onClick={() => {
              setShowLightbox(false)
              document.body.style.overflow = 'unset'
            }}
            type="button"
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="Image en grand"
            className="media-preview-simple__image"
          />
        </div>
      )}
    </div>
  )
}

// Helper functions following PayloadCMS patterns
function getFilenameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const filename = pathname.split('/').pop() || 'Fichier téléchargé'
    return decodeURIComponent(filename)
  } catch {
    return url.length > 50 ? `${url.substring(0, 50)}...` : url
  }
}

function getFileInfo(url: string): { type: string; icon: string; label: string; color: string } {
  const extension = url.toLowerCase().split('.').pop() || ''
  
  // Image files
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'ico'].includes(extension)) {
    return { type: 'image', icon: '🖼️', label: 'Image', color: '#4CAF50' }
  }
  
  // Video files
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v'].includes(extension)) {
    return { type: 'video', icon: '🎥', label: 'Vidéo', color: '#FF5722' }
  }
  
  // Audio files
  if (['mp3', 'wav', 'ogg', 'aac', 'flac', 'wma', 'm4a'].includes(extension)) {
    return { type: 'audio', icon: '🎵', label: 'Audio', color: '#9C27B0' }
  }
  
  // Document files
  if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'].includes(extension)) {
    return { type: 'document', icon: '📄', label: 'Document', color: '#2196F3' }
  }
  
  // Archive files
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
    return { type: 'archive', icon: '📦', label: 'Archive', color: '#795548' }
  }
  
  // Default for unknown files
  return { type: 'file', icon: '📁', label: 'Fichier', color: '#607D8B' }
}


function renderMediaPreview(
  url: string, 
  fileType: string, 
  imageError: boolean, 
  setImageError: (error: boolean) => void,
  setIsLoading: (loading: boolean) => void
): React.ReactElement {
  switch (fileType) {
    case 'image':
      if (imageError) {
        return (
          <div className="media-preview-simple__file-icon">
            <span className="icon">🖼️</span>
            <span className="error-text">Erreur de chargement</span>
          </div>
        )
      }
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt="Aperçu de l'image"
          className="media-preview-simple__img"
          onError={() => {
            setImageError(true)
            setIsLoading(false)
          }}
          onLoad={() => setIsLoading(false)}
        />
      )
    
    case 'video':
      return (
        <div className="media-preview-card__video-preview">
          <video
            src={url}
            className="media-preview-card__preview-video"
            controls
            preload="metadata"
            controlsList="nodownload"
            onError={() => {/* Video load error - graceful fallback */}}
          >
            Votre navigateur ne supporte pas la lecture vidéo.
          </video>
        </div>
      )
    
    case 'audio':
      return (
        <div className="media-preview-card__audio-preview">
          <div className="media-preview-card__audio-icon">🎵</div>
          <audio
            src={url}
            controls
            className="media-preview-card__preview-audio"
            preload="metadata"
            controlsList="nodownload"
            onError={() => {/* Audio load error - graceful fallback */}}
          >
            Votre navigateur ne supporte pas la lecture audio.
          </audio>
        </div>
      )
    
    case 'document':
      return (
        <div className="media-preview-simple__file-icon">
          <span className="icon">📄</span>
          <span className="type-text">Document</span>
        </div>
      )
    
    case 'archive':
      return (
        <div className="media-preview-simple__file-icon">
          <span className="icon">📦</span>
          <span className="type-text">Archive</span>
        </div>
      )
    
    default:
      return (
        <div className="media-preview-simple__file-icon">
          <span className="icon">📁</span>
          <span className="type-text">Fichier</span>
        </div>
      )
  }
}

export default MediaPreviewCard