/**
 * Enhanced File Upload Component V3
 * 
 * Production-ready file upload with:
 * - Local file storage until form submission
 * - Full media preview (image, video, audio)
 * - Enhanced grid layout with modern UI/UX
 * - No automatic upload to R2 (saves storage)
 * - Better user experience
 */

'use client'

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  X,
  FileText,
  FileVideo,
  FileAudio,
  FileImage,
  File,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  Volume2,
  Eye,
  Download,
  Maximize2,
  Music,
  Film,
  Image as ImageIcon,
  FileIcon
} from 'lucide-react'
import Image from 'next/image'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

import { validateFileProduction, type ValidationResult } from '@/lib/production-file-validation'
import { formatFileSize } from '@/lib/file-upload'
import { logger } from '@/utilities/logger'

interface FileWithPreview extends File {
  id: string
  preview?: string
  validationResult?: ValidationResult
  category?: 'image' | 'video' | 'audio' | 'document' | 'unknown'
}

interface EnhancedFileUploadV3Props {
  value?: File[]
  onChange: (files: File[]) => void
  maxFiles?: number
  maxSize?: number // in MB
  acceptedFileTypes?: string[]
  multiple?: boolean
  required?: boolean
  label?: string
  description?: string
  className?: string
  fileType?: 'screenshot' | 'attachment'
  disabled?: boolean
}

const FILE_TYPE_ICONS = {
  image: ImageIcon,
  video: Film,
  audio: Music,
  document: FileText,
  unknown: FileIcon
}

const FILE_TYPE_COLORS = {
  image: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800',
  video: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800',
  audio: 'bg-green-50 text-green-600 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800',
  document: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800',
  unknown: 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-950 dark:text-gray-400 dark:border-gray-800'
}

export function EnhancedFileUploadV3({
  value = [],
  onChange,
  maxFiles = 10,
  maxSize = 100,
  acceptedFileTypes = ['.mp4', '.webm', '.mov', '.avi', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx', '.txt', '.mp3', '.wav', '.m4a', '.ogg', '.flac'],
  multiple = true,
  required = false,
  label = 'Files',
  description = 'Upload your files here',
  className = '',
  fileType = 'attachment',
  disabled = false
}: EnhancedFileUploadV3Props) {
  const t = useTranslations()
  const locale = useLocale()
  const isRTL = locale === 'ar'
  
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [previewFile, setPreviewFile] = useState<FileWithPreview | null>(null)

  // Generate unique ID for each file
  const generateFileId = useCallback(() => {
    return `file_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
  }, [])

  // Detect file category for icon selection
  const detectFileCategory = useCallback((file: File): 'image' | 'video' | 'audio' | 'document' | 'unknown' => {
    if (!file || !file.type) return 'unknown'
    
    const mimeType = file.type.toLowerCase()
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    if (mimeType.startsWith('audio/')) return 'audio'
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document'
    
    // Fallback to extension-based detection
    if (file.name) {
      const extension = file.name.split('.').pop()?.toLowerCase()
      if (extension) {
        if (['mp4', 'webm', 'mov', 'avi', 'ogv'].includes(extension)) return 'video'
        if (['mp3', 'wav', 'm4a', 'ogg', 'oga', 'flac'].includes(extension)) return 'audio'
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image'
        if (['pdf', 'doc', 'docx', 'txt'].includes(extension)) return 'document'
      }
    }
    
    return 'unknown'
  }, [])

  // Generate preview URL for media files
  const generatePreview = useCallback((file: File): string | undefined => {
    const category = detectFileCategory(file)
    
    // Create blob URL for media files
    if (category === 'image' || category === 'video' || category === 'audio') {
      return URL.createObjectURL(file)
    }
    
    return undefined
  }, [detectFileCategory])

  // Clean up blob URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview && file.preview.startsWith('blob:')) {
          URL.revokeObjectURL(file.preview)
        }
      })
    }
  }, [files])

  // Validate and process files
  const processFiles = useCallback(async (acceptedFiles: File[]) => {
    if (disabled) return

    setIsValidating(true)
    
    const sessionId = `UPLOAD_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    
    logger.info('📁 File selection session started', {
      component: 'EnhancedFileUploadV3',
      action: 'file_selection_start',
      sessionId,
      metadata: {
        fileCount: acceptedFiles.length,
        fileType,
        maxFiles,
        maxSize
      }
    })

    try {
      const processedFiles: FileWithPreview[] = []

      for (const file of acceptedFiles) {
        const fileId = generateFileId()
        const category = detectFileCategory(file)
        
        // Validate file
        const validationResult = await validateFileProduction(file)
        
        // Generate preview URL
        const preview = generatePreview(file)

        const processedFile: FileWithPreview = Object.assign(file, {
          id: fileId,
          preview,
          validationResult,
          category
        })

        processedFiles.push(processedFile)

        if (validationResult.isValid) {
          logger.info('✅ File validated successfully', {
            component: 'EnhancedFileUploadV3',
            action: 'validation_success',
            sessionId,
            metadata: { fileId, category, fileName: file.name }
          })
        } else {
          logger.warn('⚠️ File validation failed', {
            component: 'EnhancedFileUploadV3',
            action: 'validation_failed',
            sessionId,
            metadata: { fileId, error: validationResult.error }
          })
        }
      }

      // Update files state
      const validFiles = processedFiles.filter(f => f.validationResult?.isValid)
      if (validFiles.length > 0) {
        const newFiles = [...files, ...validFiles].slice(0, maxFiles)
        setFiles(newFiles)
        onChange(newFiles)
      }

    } catch (error) {
      logger.error('❌ File processing error', {
        component: 'EnhancedFileUploadV3',
        action: 'processing_error',
        sessionId,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsValidating(false)
    }
  }, [disabled, fileType, generateFileId, detectFileCategory, generatePreview, maxFiles, maxSize, files, onChange])

  // Remove file
  const removeFile = useCallback((fileId: string) => {
    setFiles(prevFiles => {
      const fileToRemove = prevFiles.find(f => f.id === fileId)
      const updatedFiles = prevFiles.filter(f => f.id !== fileId)
      
      // Clean up blob URL if exists
      if (fileToRemove?.preview && fileToRemove.preview.startsWith('blob:')) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      
      // Update parent component
      onChange(updatedFiles)
      
      return updatedFiles
    })
  }, [onChange])

  // Dropzone configuration
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    isDragAccept
  } = useDropzone({
    onDrop: processFiles,
    accept: acceptedFileTypes.reduce((acc, type) => {
      if (type.startsWith('.')) {
        const mimeTypes = {
          '.mp4': 'video/mp4',
          '.webm': 'video/webm',
          '.mov': 'video/quicktime',
          '.avi': 'video/x-msvideo',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.gif': 'image/gif',
          '.webp': 'image/webp',
          '.pdf': 'application/pdf',
          '.doc': 'application/msword',
          '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          '.txt': 'text/plain',
          '.mp3': 'audio/mpeg',
          '.wav': 'audio/wav',
          '.m4a': 'audio/mp4',
          '.ogg': 'audio/ogg',
          '.flac': 'audio/flac'
        }
        const mimeType = mimeTypes[type as keyof typeof mimeTypes]
        if (mimeType) acc[mimeType] = []
      }
      return acc
    }, {} as Record<string, string[]>),
    multiple,
    maxFiles,
    maxSize: maxSize * 1024 * 1024,
    disabled: disabled || isValidating
  })

  // Upload zone styling
  const uploadZoneClassName = useMemo(() => {
    const baseClasses = 'relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer backdrop-blur-sm'
    
    if (disabled) return cn(baseClasses, 'border-gray-200 bg-gray-50/50 cursor-not-allowed opacity-50')
    if (isDragReject) return cn(baseClasses, 'border-red-400 bg-red-50/50 animate-pulse')
    if (isDragAccept || dragActive) return cn(baseClasses, 'border-blue-400 bg-blue-50/50 scale-[1.02]')
    
    return cn(baseClasses, 'border-gray-300 hover:border-gray-400 hover:bg-gray-50/50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-900/50')
  }, [disabled, isDragReject, isDragAccept, dragActive])

  return (
    <TooltipProvider>
      <div className={cn('space-y-6', className)} dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Upload Zone */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div {...getRootProps()} className={uploadZoneClassName}>
              <input {...getInputProps()} />
              
              <div className="flex flex-col items-center justify-center space-y-4">
                <motion.div 
                  className="relative"
                  animate={{ scale: dragActive ? 1.1 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800">
                    <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  {dragActive && (
                    <motion.div 
                      className="absolute inset-0 rounded-full bg-blue-400 opacity-30"
                      animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </motion.div>
                
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {isDragActive ? t('fileUpload.dropFilesHere') : label}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {description}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {t('fileUpload.maxFiles', { maxFiles })} • {maxSize}MB {t('fileUpload.maxSizeEach')}
                  </p>
                </div>

                {!disabled && (
                  <Button variant="outline" size="sm" type="button" className="gap-2">
                    <Upload className="w-4 h-4" />
                    {t('fileUpload.chooseFiles')}
                  </Button>
                )}
              </div>

              {/* Validation Progress */}
              {isValidating && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 flex items-center justify-center backdrop-blur-sm"
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('fileUpload.validatingFiles')}
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* File Grid */}
        <AnimatePresence mode="popLayout">
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {files.map((file) => (
                <MediaPreviewCard
                  key={file.id}
                  file={file}
                  onRemove={() => removeFile(file.id)}
                  onPreview={() => setPreviewFile(file)}
                  isRTL={isRTL}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary Stats */}
        {files.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-4 border-t dark:border-gray-800"
          >
            <span className="flex items-center gap-2">
              <FileIcon className="w-4 h-4" />
              {files.length === 1 ? t('fileUpload.filesCount', { count: files.length }) : t('fileUpload.filesCountPlural', { count: files.length })}
            </span>
            <span className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              {formatFileSize(files.reduce((total, file) => total + file.size, 0))}
            </span>
          </motion.div>
        )}

        {/* Full Preview Modal */}
        <FullPreviewModal 
          file={previewFile} 
          onClose={() => setPreviewFile(null)} 
          isRTL={isRTL}
        />
      </div>
    </TooltipProvider>
  )
}

// Media Preview Card Component
interface MediaPreviewCardProps {
  file: FileWithPreview
  onRemove: () => void
  onPreview: () => void
  isRTL: boolean
}

function MediaPreviewCard({ file, onRemove, onPreview, isRTL }: MediaPreviewCardProps) {
  const t = useTranslations()
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  
  const IconComponent = FILE_TYPE_ICONS[file.category || 'unknown']
  const colorClasses = FILE_TYPE_COLORS[file.category || 'unknown']

  const togglePlayPause = () => {
    if (file.category === 'video' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    } else if (file.category === 'audio' && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      className="group relative"
    >
      <Card className={cn(
        'relative overflow-hidden transition-all duration-200',
        'hover:shadow-lg dark:hover:shadow-gray-900/50',
        file.validationResult?.isValid ? '' : 'border-red-300 dark:border-red-800'
      )}>
        <CardContent className="p-0">
          {/* Media Preview */}
          <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            {file.category === 'image' && file.preview ? (
              <Image
                src={file.preview}
                alt={file.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              />
            ) : file.category === 'video' && file.preview ? (
              <div className="relative w-full h-full">
                <video
                  ref={videoRef}
                  src={file.preview}
                  className="w-full h-full object-cover"
                  onEnded={() => setIsPlaying(false)}
                />
                <button
                  onClick={togglePlayPause}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                    {isPlaying ? (
                      <Pause className="w-6 h-6 text-gray-900" />
                    ) : (
                      <Play className="w-6 h-6 text-gray-900 ml-1" />
                    )}
                  </div>
                </button>
              </div>
            ) : file.category === 'audio' && file.preview ? (
              <div className="flex flex-col items-center justify-center h-full p-4">
                <div className={cn('w-20 h-20 rounded-full flex items-center justify-center mb-4', colorClasses)}>
                  <Volume2 className="w-10 h-10" />
                </div>
                <audio
                  ref={audioRef}
                  src={file.preview}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={togglePlayPause}
                  className="gap-2"
                >
                  {isPlaying ? (
                    <><Pause className="w-4 h-4" /> {t('fileUpload.pause')}</>
                  ) : (
                    <><Play className="w-4 h-4" /> {t('fileUpload.play')}</>
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className={cn('w-20 h-20 rounded-xl flex items-center justify-center', colorClasses)}>
                  <IconComponent className="w-10 h-10" />
                </div>
              </div>
            )}

            {/* Action Buttons Overlay */}
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Only show preview button for supported media types */}
              {(file.category === 'image' || file.category === 'video' || file.category === 'audio') && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="w-8 h-8 bg-white/90 hover:bg-white"
                      onClick={onPreview}
                    >
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t('fileUpload.preview')}</TooltipContent>
                </Tooltip>
              )}
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="w-8 h-8"
                    onClick={onRemove}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t('fileUpload.removeFile')}</TooltipContent>
              </Tooltip>
            </div>

            {/* Status Badge */}
            {file.validationResult && !file.validationResult.isValid && (
              <div className="absolute top-2 left-2">
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {t('fileUpload.validationFailed')}
                </Badge>
              </div>
            )}
          </div>

          {/* File Info */}
          <div className="p-4 space-y-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                  {file.name}
                </p>
              </TooltipTrigger>
              <TooltipContent>{file.name}</TooltipContent>
            </Tooltip>
            
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <IconComponent className="w-3 h-3" />
                {file.category}
              </span>
              <span>{formatFileSize(file.size)}</span>
            </div>

            {/* Validation Error */}
            {file.validationResult && !file.validationResult.isValid && (
              <div className="pt-2 border-t dark:border-gray-800">
                <p className="text-xs text-red-600 dark:text-red-400">
                  {file.validationResult.error}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Full Preview Modal Component
interface FullPreviewModalProps {
  file: FileWithPreview | null
  onClose: () => void
  isRTL: boolean
}

function FullPreviewModal({ file, onClose, isRTL }: FullPreviewModalProps) {
  if (!file) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {file.name}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-4 max-h-[calc(90vh-8rem)] overflow-auto">
            {file.category === 'image' && file.preview && (
              <img
                src={file.preview}
                alt={`Preview of ${file.name}`}
                className="w-full h-auto"
              />
            )}
            {file.category === 'video' && file.preview && (
              <video
                src={file.preview}
                controls
                className="w-full h-auto"
              />
            )}
            {file.category === 'audio' && file.preview && (
              <audio
                src={file.preview}
                controls
                className="w-full"
              />
            )}
            {(file.category === 'document' || file.category === 'unknown') && (
              <div className="flex flex-col items-center justify-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Preview not available for this file type
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default EnhancedFileUploadV3