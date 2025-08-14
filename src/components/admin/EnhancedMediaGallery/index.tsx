'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useField, useFormFields } from '@payloadcms/ui'
import type { ArrayFieldClientComponent } from 'payload'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Download, 
  ExternalLink, 
  ZoomIn,
  FileText,
  File,
  Image,
  VideoIcon,
  Music,
  Eye,
  X,
  Maximize2
} from 'lucide-react'
import './index.scss'

interface MediaItem {
  url: string
  id?: string
}

interface VideoPlayerProps {
  url: string
  onError: () => void
}

interface AudioPlayerProps {
  url: string
  filename: string
  onError: () => void
}

interface PDFViewerProps {
  url: string
  filename: string
  onError: () => void
}

interface ImageViewerProps {
  url: string
  filename: string
  onError: () => void
}

// Video Player Component
const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, onError }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [duration, setDuration] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [volume, setVolume] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  // Set volume through ref
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume
    }
  }, [volume])

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const newTime = (parseFloat(e.target.value) / 100) * duration
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value) / 100
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
  }

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen()
        setIsFullscreen(true)
      } else {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  return (
    <div ref={containerRef} className="enhanced-video-player">
      <div className="video-container">
        <video
          ref={videoRef}
          src={url}
          className="video-element"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onError={onError}
          muted={isMuted}
        />
        
        {/* Video Controls Overlay */}
        <div className="video-controls-overlay">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            className="play-pause-btn"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="video-controls">
          <div className="controls-left">
            <button onClick={togglePlay} className="control-btn">
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            
            <button onClick={toggleMute} className="control-btn">
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            
            <input
              type="range"
              min="0"
              max="100"
              value={volume * 100}
              onChange={handleVolumeChange}
              className="volume-slider"
            />
            
            <span className="time-display">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="controls-center">
            <input
              type="range"
              min="0"
              max="100"
              value={duration ? (currentTime / duration) * 100 : 0}
              onChange={handleSeek}
              className="progress-slider"
            />
          </div>

          <div className="controls-right">
            <button onClick={toggleFullscreen} className="control-btn">
              <Maximize2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Audio Player Component
const AudioPlayer: React.FC<AudioPlayerProps> = ({ url, filename, onError }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [duration, setDuration] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [volume, setVolume] = useState(1)
  const audioRef = useRef<HTMLAudioElement>(null)

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  // Set volume through ref  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = (parseFloat(e.target.value) / 100) * duration
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value) / 100
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="enhanced-audio-player">
      <audio
        ref={audioRef}
        src={url}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onError={onError}
        muted={isMuted}
      />
      
      <div className="audio-controls">
        <div className="audio-info">
          <Music size={20} className="audio-icon" />
          <div className="audio-meta">
            <div className="audio-title">{filename}</div>
            <div className="audio-duration">{formatTime(duration)}</div>
          </div>
        </div>

        <div className="audio-player-controls">
          <button onClick={togglePlay} className="control-btn primary">
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          
          <div className="progress-container">
            <span className="time-current">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max="100"
              value={duration ? (currentTime / duration) * 100 : 0}
              onChange={handleSeek}
              className="progress-slider"
            />
            <span className="time-total">{formatTime(duration)}</span>
          </div>
          
          <div className="volume-controls">
            <button onClick={toggleMute} className="control-btn">
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={volume * 100}
              onChange={handleVolumeChange}
              className="volume-slider"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// PDF Viewer Component
const PDFViewer: React.FC<PDFViewerProps> = ({ url, filename, onError }) => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const openInNewTab = () => {
    window.open(url, '_blank')
  }

  const downloadFile = () => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div className="enhanced-pdf-viewer">
      <div className="pdf-toolbar">
        <div className="pdf-info">
          <FileText size={20} className="pdf-icon" />
          <span className="pdf-title">{filename}</span>
        </div>
        
        <div className="pdf-actions">
          <button onClick={toggleFullscreen} className="control-btn" title="Toggle fullscreen">
            {isFullscreen ? <X size={16} /> : <ZoomIn size={16} />}
          </button>
          <button onClick={openInNewTab} className="control-btn" title="Open in new tab">
            <ExternalLink size={16} />
          </button>
          <button onClick={downloadFile} className="control-btn" title="Download">
            <Download size={16} />
          </button>
        </div>
      </div>
      
      <div className={`pdf-container ${isFullscreen ? 'fullscreen' : ''}`}>
        <iframe
          ref={iframeRef}
          src={`${url}#toolbar=1&navpanes=1&scrollbar=1&page=1&view=FitH`}
          className="pdf-iframe"
          title={`PDF: ${filename}`}
          onError={onError}
        />
      </div>
    </div>
  )
}

// Image Viewer Component
const ImageViewer: React.FC<ImageViewerProps> = ({ url, filename, onError }) => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [imageError, setImageError] = useState(false)

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const downloadImage = () => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleImageError = () => {
    setImageError(true)
    onError()
  }

  if (imageError) {
    return (
      <div className="image-error">
        <Image size={48} className="error-icon" aria-hidden="true" />
        <p>Unable to load image: {filename}</p>
      </div>
    )
  }

  return (
    <div className="enhanced-image-viewer">
      <div className="image-toolbar">
        <div className="image-info">
          <Image size={20} className="image-icon" aria-hidden="true" />
          <span className="image-title">{filename}</span>
        </div>
        
        <div className="image-actions">
          <button onClick={toggleFullscreen} className="control-btn" title="Toggle fullscreen">
            {isFullscreen ? <X size={16} /> : <Eye size={16} />}
          </button>
          <button onClick={downloadImage} className="control-btn" title="Download">
            <Download size={16} />
          </button>
        </div>
      </div>
      
      <div className={`image-container ${isFullscreen ? 'fullscreen' : ''}`}>
        <img
          src={url}
          alt={`Preview of ${filename}`}
          className="preview-image"
          onError={handleImageError}
          loading="lazy"
        />
      </div>
    </div>
  )
}

/**
 * Enhanced Media Gallery - Advanced media preview component for Payload CMS
 * Supports video, audio, PDF, and image files with full-featured players
 */
const EnhancedMediaGallery: ArrayFieldClientComponent = ({ path }) => {
  const fieldState = useField({ 
    path, 
    hasRows: true
  })
  
  const formFields = useFormFields(([fields]) => fields)
  const [activeMedia, setActiveMedia] = useState<string | null>(null)
  const [mediaErrors, setMediaErrors] = useState<Set<string>>(new Set())

  // Log the path to understand the component context
  if (process.env.NODE_ENV === 'development') {
    console.log('🎯 EnhancedMediaGallery mounted with path:', path)
  }

  // Get the actual array data from form fields
  const formFieldValue = formFields[path]?.value
  
  let actualData: MediaItem[] | null = null
  
  // Enhanced debug logging for troubleshooting
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 EnhancedMediaGallery Debug:', {
      path,
      formFieldValue,
      formFieldValueType: typeof formFieldValue,
      formFieldValueIsArray: Array.isArray(formFieldValue),
      formFieldValueLength: Array.isArray(formFieldValue) ? formFieldValue.length : 'N/A',
      fieldStateValue: fieldState.value,
      fieldStateValueType: typeof fieldState.value,
      fieldStateValueIsArray: Array.isArray(fieldState.value),
      fieldStateValueLength: Array.isArray(fieldState.value) ? fieldState.value.length : 'N/A',
      hasRows: fieldState.rows ? fieldState.rows.length : 0,
      rowsData: fieldState.rows ? fieldState.rows.slice(0, 2) : null, // Show first 2 rows for debugging
      isLegacyData: typeof formFieldValue === 'number' || typeof fieldState.value === 'number',
      formFieldsKeys: Object.keys(formFields).filter(key => key.startsWith(path)).slice(0, 5) // Show related form field keys
    })
  }
  
  // Try multiple data extraction methods
  
  // Method 1: Direct array from formFieldValue
  if (Array.isArray(formFieldValue)) {
    actualData = formFieldValue
      .map((item: any) => {
        // Handle both string URLs and object with url property
        if (typeof item === 'string' && item.length > 0) {
          return { url: item }
        } else if (item && typeof item === 'object' && typeof item.url === 'string' && item.url.length > 0) {
          return { url: item.url }
        }
        return null
      })
      .filter((item): item is MediaItem => item !== null && typeof item.url === 'string' && item.url.length > 0)
  }
  
  // Method 2: From fieldState.value (primary Payload CMS source)
  else if (fieldState.value && Array.isArray(fieldState.value)) {
    actualData = fieldState.value
      .map((item: any) => {
        // Handle both string URLs and object with url property
        if (typeof item === 'string' && item.length > 0) {
          return { url: item }
        } else if (item && typeof item === 'object' && typeof item.url === 'string' && item.url.length > 0) {
          return { url: item.url }
        }
        return null
      })
      .filter((item): item is MediaItem => item !== null && typeof item.url === 'string' && item.url.length > 0)
  }
  
  // Method 3: From fieldState.rows
  else if (fieldState.rows && Array.isArray(fieldState.rows)) {
    const rowData: MediaItem[] = fieldState.rows
      .map((row: any, index: number) => {
        const rowPath = `${path}.${index}`
        
        // Debug individual row
        if (process.env.NODE_ENV === 'development' && index < 2) {
          console.log(`🔎 Row ${index} debug:`, {
            row,
            rowPath,
            fieldAtPath: formFields[rowPath],
            fieldAtPathUrl: formFields[`${rowPath}.url`],
          })
        }
        
        // Try different ways to get the URL
        let url: string | null = null
        
        // Method 3a: Direct from row.url
        if (typeof row?.url === 'string') {
          url = row.url
        }
        // Method 3b: From row itself if it's a string
        else if (typeof row === 'string') {
          url = row
        }
        // Method 3c: From form fields at rowPath
        else if (formFields[rowPath]?.value) {
          const rowValue = formFields[rowPath].value
          if (typeof rowValue === 'string') {
            url = rowValue
          } else if (rowValue && typeof rowValue === 'object' && 'url' in rowValue && typeof (rowValue as any).url === 'string') {
            url = (rowValue as any).url
          }
        }
        // Method 3d: From form fields at rowPath.url
        else if (formFields[`${rowPath}.url`]?.value) {
          url = formFields[`${rowPath}.url`].value as string
        }
        
        return url ? { url } : null
      })
      .filter((item): item is MediaItem => item !== null && typeof item.url === 'string')
    
    if (rowData.length > 0) {
      actualData = rowData
    }
  }
  
  // Method 4: Fallback - look for numbered field entries
  else {
    const numberedFields: MediaItem[] = []
    let index = 0
    
    while (formFields[`${path}.${index}`] || formFields[`${path}.${index}.url`]) {
      const rowValue = formFields[`${path}.${index}`]?.value || formFields[`${path}.${index}.url`]?.value
      
      if (typeof rowValue === 'string') {
        numberedFields.push({ url: rowValue })
      } else if (rowValue && typeof rowValue === 'object' && 'url' in rowValue && typeof (rowValue as any).url === 'string') {
        numberedFields.push({ url: (rowValue as any).url })
      }
      
      index++
      if (index > 50) break // Safety limit
    }
    
    if (numberedFields.length > 0) {
      actualData = numberedFields
    }
  }
  
  // Debug extracted data (can be removed in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 EnhancedMediaGallery Extracted Data:', {
      actualData,
      dataLength: actualData ? actualData.length : 0,
      firstItem: actualData && actualData.length > 0 ? actualData[0] : null,
      extractionMethod: actualData ? (
        Array.isArray(formFieldValue) ? 'Method 1: formFieldValue' :
        Array.isArray(fieldState.value) ? 'Method 2: fieldState.value' :
        fieldState.rows ? 'Method 3: fieldState.rows' :
        'Method 4: numbered fields'
      ) : 'No data extracted'
    })
  }

  // Handle empty state
  if (!actualData || !Array.isArray(actualData) || actualData.length === 0) {
    // Check if this is legacy data (old submissions before the V3 fix)
    // Legacy data has typeof number, new empty submissions have empty arrays or undefined
    const isActualLegacyData = (typeof formFieldValue === 'number' && formFieldValue !== 0) || 
                               (typeof fieldState.value === 'number' && fieldState.value !== 0)
    
    return (
      <div className="enhanced-media-gallery">
        <div className="empty-state">
          <File size={48} className="empty-icon" />
          <span className="empty-text">Aucun média disponible</span>
          {isActualLegacyData && process.env.NODE_ENV === 'development' && (
            <small className="empty-help" style={{ color: '#6b7280', marginTop: '0.5rem' }}>
              Note: Soumission créée avant la correction V3 (données héritées)
            </small>
          )}
        </div>
      </div>
    )
  }

  const getFileType = (url: string): string => {
    const extension = url.toLowerCase().split('.').pop() || ''
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(extension)) return 'image'
    if (['mp4', 'avi', 'mov', 'wmv', 'webm', 'mkv'].includes(extension)) return 'video'
    if (['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'].includes(extension)) return 'audio'
    if (['pdf'].includes(extension)) return 'pdf'
    if (['doc', 'docx', 'txt'].includes(extension)) return 'document'
    return 'file'
  }

  const getFileIcon = (fileType: string): React.ReactElement => {
    switch (fileType) {
      case 'image': return <Image size={24} aria-hidden="true" />
      case 'video': return <VideoIcon size={24} aria-hidden="true" />
      case 'audio': return <Music size={24} aria-hidden="true" />
      case 'pdf': return <FileText size={24} aria-hidden="true" />
      case 'document': return <FileText size={24} aria-hidden="true" />
      default: return <File size={24} aria-hidden="true" />
    }
  }

  const getFileName = (url: string): string => {
    return url.split('/').pop()?.split('?')[0] || 'Unknown file'
  }

  const handleMediaError = (url: string) => {
    setMediaErrors(prev => new Set([...prev, url]))
  }

  const renderMediaPreview = (item: MediaItem, index: number) => {
    // Ensure URL is properly formatted
    const mediaUrl = item.url.startsWith('http') ? item.url : 
                     item.url.startsWith('/') ? item.url : 
                     `/${item.url}`
    
    const fileType = getFileType(mediaUrl)
    const fileName = getFileName(mediaUrl)
    const hasError = mediaErrors.has(mediaUrl)
    const isActive = activeMedia === mediaUrl

    if (hasError) {
      return (
        <div key={`error-${index}`} className="media-item error">
          <div className="media-error">
            <File size={48} className="error-icon" />
            <p className="error-text">Erreur de chargement</p>
            <p className="error-filename">{fileName}</p>
            <small className="error-url" style={{ fontSize: '10px', color: '#999' }}>{mediaUrl}</small>
          </div>
        </div>
      )
    }

    return (
      <div key={`media-${index}`} className="media-item auto-preview">
        {/* Automatic thumbnail preview for images */}
        {fileType === 'image' && (
          <div className="media-thumbnail">
            <img
              src={mediaUrl}
              alt={`Thumbnail preview of ${fileName}`}
              className="thumbnail-image"
              onError={() => handleMediaError(mediaUrl)}
              loading="lazy"
              onClick={() => setActiveMedia(isActive ? null : mediaUrl)}
            />
          </div>
        )}
        
        {/* Preview area for PDFs - always visible with embed */}
        {fileType === 'pdf' && (
          <div className="media-pdf-preview">
            <embed
              src={`${mediaUrl}#view=FitH&toolbar=0&navpanes=0`}
              type="application/pdf"
              className="pdf-embed"
              title={fileName}
            />
          </div>
        )}
        
        {/* For video - show thumbnail with play overlay */}
        {fileType === 'video' && (
          <div className="media-video-preview">
            <video
              src={mediaUrl}
              className="video-thumbnail"
              onError={() => handleMediaError(mediaUrl)}
              onClick={() => setActiveMedia(isActive ? null : mediaUrl)}
              muted
              preload="metadata"
            />
            <div 
              className="video-play-overlay" 
              onClick={() => setActiveMedia(isActive ? null : mediaUrl)}
            >
              <Play size={32} className="play-icon" />
            </div>
          </div>
        )}
        
        {/* Audio files - show compact player */}
        {fileType === 'audio' && (
          <div className="media-audio-preview">
            <div className="audio-info-compact">
              <Music size={20} className="audio-icon" />
              <span className="audio-filename">{fileName}</span>
            </div>
            <audio
              src={mediaUrl}
              controls
              className="audio-compact"
              onError={() => handleMediaError(mediaUrl)}
              preload="metadata"
            />
          </div>
        )}
        
        {/* For other file types, show enhanced icon preview */}
        {!['image', 'pdf', 'video', 'audio'].includes(fileType) && (
          <div className="media-file-preview">
            <div className="file-icon-large">
              {getFileIcon(fileType)}
            </div>
            <span className="file-info">{fileName}</span>
          </div>
        )}

        <div className="media-header">
          <div className="media-info">
            {getFileIcon(fileType)}
            <div className="media-meta">
              <span className="media-title">{fileName}</span>
              <span className="media-type">{fileType.toUpperCase()}</span>
            </div>
          </div>
          
          {/* Keep the expand button for full-featured players */}
          {['video', 'image'].includes(fileType) && (
            <button
              onClick={() => setActiveMedia(isActive ? null : mediaUrl)}
              className="preview-toggle"
              title={isActive ? 'Fermer la vue élargie' : 'Agrandir'}
            >
              {isActive ? <X size={16} /> : <Maximize2 size={16} />}
            </button>
          )}
        </div>

        {/* Expanded view with full-featured players */}
        {isActive && (
          <div className="media-preview-expanded">
            {fileType === 'video' && (
              <VideoPlayer
                url={mediaUrl}
                onError={() => handleMediaError(mediaUrl)}
              />
            )}
            
            {fileType === 'image' && (
              <ImageViewer
                url={mediaUrl}
                filename={fileName}
                onError={() => handleMediaError(mediaUrl)}
              />
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="enhanced-media-gallery">
      <div className="media-header">
        <h4 className="media-title">
          Fichiers médias ({actualData.length})
        </h4>
      </div>
      
      <div className="media-list">
        {actualData.map((item, index) => renderMediaPreview(item, index))}
      </div>
    </div>
  )
}

export default EnhancedMediaGallery