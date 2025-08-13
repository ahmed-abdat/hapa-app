'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { 
  Upload, 
  X, 
  FileImage, 
  FileText, 
  FileVideo, 
  File, 
  Settings, 
  Check, 
  AlertCircle, 
  Zap, 
  RotateCcw, 
  Play,
  Pause,
  Volume2,
  VolumeX,
  Eye,
  Loader2
} from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { type Locale } from '@/utilities/locale'
import { FormFieldProps } from '../types'
import { 
  validateMediaFile,
  validateMultipleFiles,
  type ValidationResult,
  type MediaMetadata,
  MEDIA_VALIDATION_CONFIGS
} from '@/lib/media-validation'

interface EnhancedFileUploadProps extends Omit<FormFieldProps, 'placeholder'> {
  accept?: string
  maxFiles?: number
  enableChunkedUpload?: boolean
  chunkSizeMB?: number
  enablePreview?: boolean
  supportedTypes?: ('video' | 'audio' | 'image' | 'document')[]
  locale?: Locale
}

interface UploadFile {
  file: File
  fileId: string
  previewUrl?: string
  thumbnailUrl?: string
  validation: ValidationResult
  uploadProgress?: number
  uploadStatus: 'pending' | 'validating' | 'uploading' | 'completed' | 'error' | 'paused'
  error?: string
  chunks?: UploadChunk[]
  metadata?: MediaMetadata
}

interface UploadChunk {
  id: string
  start: number
  end: number
  blob: Blob
  uploaded: boolean
  progress: number
  retryCount: number
}

export function EnhancedFileUpload({
  name,
  label,
  required = false,
  disabled = false,
  className = '',
  accept = 'image/*,video/*,audio/*,.pdf,.doc,.docx,.txt',
  maxFiles = 5,
  enableChunkedUpload = true,
  chunkSizeMB = 5,
  enablePreview = true,
  supportedTypes = ['video', 'audio', 'image', 'document'],
  locale = 'fr'
}: EnhancedFileUploadProps) {
  const { control, setValue, formState: { errors } } = useFormContext()
  const t = useTranslations()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [globalValidating, setGlobalValidating] = useState(false)
  const [validationProgress, setValidationProgress] = useState(0)

  const error = errors[name]
  const isRTL = locale === 'ar'

  // Generate unique file ID
  const generateFileId = (file: File): string => {
    return `${file.name}-${file.size}-${file.lastModified}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Create chunks for large files
  const createChunks = (file: File, chunkSize: number): UploadChunk[] => {
    const chunks: UploadChunk[] = []
    const totalChunks = Math.ceil(file.size / chunkSize)
    
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      
      chunks.push({
        id: `${file.name}-chunk-${i}`,
        start,
        end,
        blob: file.slice(start, end),
        uploaded: false,
        progress: 0,
        retryCount: 0
      })
    }
    
    return chunks
  }

  // Generate preview URL for media files
  const generatePreviewUrl = useCallback((file: File, validation: ValidationResult): string | undefined => {
    if (!enablePreview) return undefined
    
    if (validation.fileType === 'image' || validation.fileType === 'video' || validation.fileType === 'audio') {
      return URL.createObjectURL(file)
    }
    
    return undefined
  }, [enablePreview])

  // Handle file selection
  const handleFileSelection = useCallback(async (selectedFiles: FileList) => {
    if (disabled) return
    
    const newFiles = Array.from(selectedFiles)
    
    // Check max files limit
    if (files.length + newFiles.length > maxFiles) {
      // Show error message
      return
    }
    
    setGlobalValidating(true)
    setValidationProgress(0)
    
    try {
      // Validate all files
      const validationResults = await validateMultipleFiles(
        newFiles,
        (progress, currentFile) => {
          setValidationProgress(progress * 100)
        }
      )
      
      // Create upload files
      const uploadFiles: UploadFile[] = newFiles.map((file, index) => {
        const fileId = generateFileId(file)
        const validation = validationResults[index]
        
        const uploadFile: UploadFile = {
          file,
          fileId,
          validation,
          uploadStatus: validation.isValid ? 'pending' : 'error',
          error: validation.error,
          metadata: validation.metadata
        }
        
        // Generate preview URL for valid files
        if (validation.isValid) {
          uploadFile.previewUrl = generatePreviewUrl(file, validation)
        }
        
        // Create chunks for large files if chunked upload is enabled
        if (enableChunkedUpload && validation.isValid && file.size > chunkSizeMB * 1024 * 1024) {
          uploadFile.chunks = createChunks(file, chunkSizeMB * 1024 * 1024)
        }
        
        return uploadFile
      })
      
      setFiles(prev => [...prev, ...uploadFiles])
    } catch (error) {
      console.error('File validation error:', error)
    } finally {
      setGlobalValidating(false)
      setValidationProgress(0)
    }
  }, [files.length, maxFiles, disabled, enableChunkedUpload, chunkSizeMB, generatePreviewUrl])

  // File input change handler
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files
    if (selectedFiles && selectedFiles.length > 0) {
      handleFileSelection(selectedFiles)
    }
    // Reset input value to allow re-selecting same files
    event.target.value = ''
  }

  // Drag and drop handlers
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
    
    if (disabled) return
    
    const droppedFiles = event.dataTransfer.files
    if (droppedFiles.length > 0) {
      handleFileSelection(droppedFiles)
    }
  }, [disabled, handleFileSelection])

  // Remove file
  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.fileId === fileId)
      if (fileToRemove?.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl)
      }
      if (fileToRemove?.thumbnailUrl) {
        URL.revokeObjectURL(fileToRemove.thumbnailUrl)
      }
      return prev.filter(f => f.fileId !== fileId)
    })
  }, [])

  // Get file type icon
  const getFileIcon = (fileType: string, size = 24) => {
    const iconProps = { size, className: "flex-shrink-0" }
    
    switch (fileType) {
      case 'video': return <FileVideo {...iconProps} />
      case 'audio': return <Volume2 {...iconProps} />
      case 'image': return <FileImage {...iconProps} />
      case 'document': return <FileText {...iconProps} />
      default: return <File {...iconProps} />
    }
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  // Format duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Get validation configs summary
  const getValidationSummary = () => {
    const summary: string[] = []
    
    supportedTypes.forEach(type => {
      const config = MEDIA_VALIDATION_CONFIGS[type]
      const extensions = config.allowedExtensions.join(', ')
      summary.push(`${type.toUpperCase()}: .${extensions} (max ${config.maxFileSizeMB}MB)`)
    })
    
    return summary
  }

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.previewUrl) URL.revokeObjectURL(file.previewUrl)
        if (file.thumbnailUrl) URL.revokeObjectURL(file.thumbnailUrl)
      })
    }
  }, [files])

  const validFiles = files.filter(f => f.validation.isValid)
  const hasErrors = files.some(f => !f.validation.isValid)

  // Update form field value when files change
  React.useEffect(() => {
    const validFileObjects = validFiles.map(f => f.file)
    if (typeof setValue === 'function') {
      setValue(name, validFileObjects)
    }
  }, [validFiles, name, setValue])

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        return (
          <div className={cn('space-y-4', className)}>
            {/* Label and Info */}
            <div className="space-y-2">
              <Label htmlFor={name} className={cn('text-sm font-medium', required && 'required')}>
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              
              {/* Supported types info */}
              <div className="text-xs text-gray-500 space-y-1">
                <div>{t('supportedFormats')}:</div>
                <div className="grid grid-cols-1 gap-1">
                  {getValidationSummary().map((summary, index) => (
                    <div key={index} className="text-gray-600">{summary}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Upload Area */}
            <div className="space-y-4">
              {/* Drop Zone */}
              <div
                className={cn(
                  'relative border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer',
                  'hover:border-blue-400 hover:bg-blue-50/50',
                  isDragOver && 'border-blue-500 bg-blue-50',
                  disabled && 'opacity-50 cursor-not-allowed',
                  error && 'border-red-300 bg-red-50/50'
                )}
                onClick={() => !disabled && fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={accept}
                  multiple={maxFiles > 1}
                  onChange={handleFileInputChange}
                  className="hidden"
                  disabled={disabled}
                />

                <div className={cn('flex flex-col items-center space-y-3', isRTL && 'text-right')}>
                  <Upload size={32} className={cn('text-gray-400', isDragOver && 'text-blue-500')} />
                  
                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium text-gray-700">
                      {globalValidating ? t('validatingFiles') : t('dropFilesHere')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {globalValidating ? 
                        `${Math.round(validationProgress)}% ${t('complete')}` : 
                        `${t('or')} ${t('clickToSelect')} • ${t('maxFiles')}: ${maxFiles}`
                      }
                    </p>
                  </div>

                  {globalValidating && (
                    <Progress value={validationProgress} className="w-48" />
                  )}
                </div>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">
                      {t('selectedFiles')} ({files.length}/{maxFiles})
                    </h4>
                    
                    {hasErrors && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertCircle size={12} className="mr-1" />
                        {files.filter(f => !f.validation.isValid).length} {t('errors')}
                      </Badge>
                    )}
                  </div>

                  <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="all">
                        {t('all')} ({files.length})
                      </TabsTrigger>
                      <TabsTrigger value="valid">
                        {t('valid')} ({validFiles.length})
                      </TabsTrigger>
                      <TabsTrigger value="errors" disabled={!hasErrors}>
                        {t('errors')} ({files.filter(f => !f.validation.isValid).length})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="space-y-2 mt-4">
                      {files.map((uploadFile) => (
                        <FilePreviewCard 
                          key={uploadFile.fileId}
                          uploadFile={uploadFile}
                          onRemove={removeFile}
                          locale={locale}
                          formatFileSize={formatFileSize}
                          formatDuration={formatDuration}
                          getFileIcon={getFileIcon}
                          enablePreview={enablePreview}
                        />
                      ))}
                    </TabsContent>

                    <TabsContent value="valid" className="space-y-2 mt-4">
                      {validFiles.map((uploadFile) => (
                        <FilePreviewCard 
                          key={uploadFile.fileId}
                          uploadFile={uploadFile}
                          onRemove={removeFile}
                          locale={locale}
                          formatFileSize={formatFileSize}
                          formatDuration={formatDuration}
                          getFileIcon={getFileIcon}
                          enablePreview={enablePreview}
                        />
                      ))}
                    </TabsContent>

                    <TabsContent value="errors" className="space-y-2 mt-4">
                      {files.filter(f => !f.validation.isValid).map((uploadFile) => (
                        <FilePreviewCard 
                          key={uploadFile.fileId}
                          uploadFile={uploadFile}
                          onRemove={removeFile}
                          locale={locale}
                          formatFileSize={formatFileSize}
                          formatDuration={formatDuration}
                          getFileIcon={getFileIcon}
                          enablePreview={enablePreview}
                        />
                      ))}
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>

            {/* Field Error */}
            {error && (
              <div className="flex items-center space-x-2 text-sm text-red-600">
                <AlertCircle size={16} />
                <span>
                  {typeof error === 'string' 
                    ? error 
                    : typeof error === 'object' && error !== null && 'message' in error 
                      ? String(error.message) 
                      : 'Invalid input'
                  }
                </span>
              </div>
            )}
          </div>
        )
      }}
    />
  )
}

// File Preview Card Component
interface FilePreviewCardProps {
  uploadFile: UploadFile
  onRemove: (fileId: string) => void
  locale: Locale
  formatFileSize: (bytes: number) => string
  formatDuration: (seconds: number) => string
  getFileIcon: (fileType: string, size?: number) => React.ReactElement
  enablePreview: boolean
}

function FilePreviewCard({
  uploadFile,
  onRemove,
  locale,
  formatFileSize,
  formatDuration,
  getFileIcon,
  enablePreview
}: FilePreviewCardProps) {
  const t = useTranslations()
  const [showPreview, setShowPreview] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const { file, validation, uploadStatus, error, metadata, previewUrl } = uploadFile
  const isRTL = locale === 'ar'

  const togglePreview = () => {
    if (enablePreview && previewUrl && validation.isValid) {
      setShowPreview(!showPreview)
    }
  }

  const togglePlay = () => {
    if (validation.fileType === 'video' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    } else if (validation.fileType === 'audio' && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (validation.fileType === 'video' && videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    } else if (validation.fileType === 'audio' && audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  return (
    <div className={cn(
      'border rounded-lg p-4 space-y-3 transition-all',
      validation.isValid ? 'border-gray-200 hover:border-gray-300' : 'border-red-200 bg-red-50/20',
      uploadStatus === 'uploading' && 'border-blue-300 bg-blue-50/30'
    )}>
      {/* File Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* File Icon */}
          <div className={cn('mt-1', validation.isValid ? 'text-gray-600' : 'text-red-500')}>
            {getFileIcon(validation.fileType)}
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium text-sm truncate" title={file.name}>
                {file.name}
              </p>
              <Badge variant={validation.isValid ? 'secondary' : 'destructive'} className="text-xs">
                {validation.fileType}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>{formatFileSize(file.size)}</span>
              {metadata?.duration && (
                <span>{formatDuration(metadata.duration)}</span>
              )}
              {metadata?.width && metadata?.height && (
                <span>{metadata.width}×{metadata.height}</span>
              )}
              {validation.codecInfo?.container && (
                <span>{validation.codecInfo.container}</span>
              )}
            </div>

            {/* Validation Status */}
            <div className="mt-2">
              {validation.isValid ? (
                <div className="flex items-center gap-1 text-green-600 text-xs">
                  <Check size={12} />
                  <span>{t('validFile')}</span>
                </div>
              ) : (
                <div className="text-red-600 text-xs">
                  <div className="flex items-center gap-1 mb-1">
                    <AlertCircle size={12} />
                    <span>{t('invalidFile')}</span>
                  </div>
                  <p className="text-red-500">{error || validation.error}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Preview Toggle */}
          {enablePreview && previewUrl && validation.isValid && (validation.fileType === 'video' || validation.fileType === 'audio' || validation.fileType === 'image') && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={togglePreview}
              className="h-8 w-8 p-0"
              title={showPreview ? t('hidePreview') : t('showPreview')}
            >
              <Eye size={16} />
            </Button>
          )}

          {/* Remove Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(uploadFile.fileId)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            title={t('removeFile')}
          >
            <X size={16} />
          </Button>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadStatus === 'uploading' && uploadFile.uploadProgress !== undefined && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>{t('uploading')}...</span>
            <span>{Math.round(uploadFile.uploadProgress)}%</span>
          </div>
          <Progress value={uploadFile.uploadProgress} className="h-2" />
        </div>
      )}

      {/* Preview */}
      {showPreview && previewUrl && validation.isValid && (
        <div className="border-t pt-3 mt-3">
          {validation.fileType === 'image' && (
            <div className="relative rounded-lg overflow-hidden bg-gray-100 max-h-60">
              <img
                src={previewUrl}
                alt={file.name}
                className="w-full h-auto object-contain max-h-60"
                onError={() => setShowPreview(false)}
              />
            </div>
          )}

          {validation.fileType === 'video' && (
            <div className="relative rounded-lg overflow-hidden bg-gray-900 max-h-60">
              <video
                ref={videoRef}
                src={previewUrl}
                className="w-full h-auto max-h-60"
                controls={false}
                muted={isMuted}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onError={() => setShowPreview(false)}
              />
              
              {/* Video Controls */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between bg-black/60 backdrop-blur-sm rounded px-3 py-2">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={togglePlay}
                    className="h-8 w-8 p-0 text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="h-8 w-8 p-0 text-white hover:bg-white/20"
                  >
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </Button>
                </div>

                <div className="text-white text-xs">
                  {metadata?.duration && formatDuration(metadata.duration)}
                </div>
              </div>
            </div>
          )}

          {validation.fileType === 'audio' && (
            <div className="bg-gray-100 rounded-lg p-4">
              <audio
                ref={audioRef}
                src={previewUrl}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onError={() => setShowPreview(false)}
                className="hidden"
                muted={isMuted}
              />
              
              {/* Audio Controls */}
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={togglePlay}
                  className="h-8 w-8 p-0"
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </Button>
                
                <Button
                  type="button"
                  variant="ghost" 
                  size="sm"
                  onClick={toggleMute}
                  className="h-8 w-8 p-0"
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </Button>

                <div className="flex-1 text-center">
                  <div className="text-sm font-medium">{file.name}</div>
                  {metadata?.duration && (
                    <div className="text-xs text-gray-500">
                      {formatDuration(metadata.duration)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}