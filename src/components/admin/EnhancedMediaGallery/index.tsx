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
        <p>Unable to load image</p>
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
          alt={filename}
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

  // Get the actual array data from form fields
  const formFieldValue = formFields[path]?.value
  
  let actualData: MediaItem[] | null = null
  if (Array.isArray(formFieldValue)) {
    actualData = formFieldValue
  } else if (fieldState.rows && Array.isArray(fieldState.rows) && formFieldValue) {
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

  // Handle empty state
  if (!actualData || !Array.isArray(actualData) || actualData.length === 0) {
    return (
      <div className="enhanced-media-gallery">
        <div className="empty-state">
          <File size={48} className="empty-icon" />
          <span className="empty-text">Aucun média disponible</span>
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
    const fileType = getFileType(item.url)
    const fileName = getFileName(item.url)
    const hasError = mediaErrors.has(item.url)
    const isActive = activeMedia === item.url

    if (hasError) {
      return (
        <div key={`error-${index}`} className="media-item error">
          <div className="media-error">
            <File size={48} className="error-icon" />
            <p className="error-text">Erreur de chargement</p>
            <p className="error-filename">{fileName}</p>
          </div>
        </div>
      )
    }

    return (
      <div key={`media-${index}`} className="media-item">
        <div className="media-header">
          <div className="media-info">
            {getFileIcon(fileType)}
            <div className="media-meta">
              <span className="media-title">{fileName}</span>
              <span className="media-type">{fileType.toUpperCase()}</span>
            </div>
          </div>
          
          <button
            onClick={() => setActiveMedia(isActive ? null : item.url)}
            className="preview-toggle"
            title={isActive ? 'Masquer l\'aperçu' : 'Afficher l\'aperçu'}
          >
            {isActive ? <X size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {isActive && (
          <div className="media-preview">
            {fileType === 'video' && (
              <VideoPlayer
                url={item.url}
                onError={() => handleMediaError(item.url)}
              />
            )}
            
            {fileType === 'audio' && (
              <AudioPlayer
                url={item.url}
                filename={fileName}
                onError={() => handleMediaError(item.url)}
              />
            )}
            
            {fileType === 'pdf' && (
              <PDFViewer
                url={item.url}
                filename={fileName}
                onError={() => handleMediaError(item.url)}
              />
            )}
            
            {fileType === 'image' && (
              <ImageViewer
                url={item.url}
                filename={fileName}
                onError={() => handleMediaError(item.url)}
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