/**
 * Enhanced File Upload Component V2
 * 
 * Production-ready file upload with:
 * - Grid-based file preview system
 * - Type-specific icons and previews
 * - Improved UX/UI with modern design
 * - Production-grade validation
 * - Performance optimizations
 * - R2 cloud storage integration
 */

'use client'

import React, { useState, useCallback, useMemo } from 'react'
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
  XCircle,
  Loader2,
  AlertTriangle,
  Play,
  Download
} from 'lucide-react'
import Image from 'next/image'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { validateFileProduction, type ValidationResult } from '@/lib/production-file-validation'
import { uploadFileWithRetry, formatFileSize } from '@/lib/file-upload'
import { logger } from '@/utilities/logger'

interface FileWithPreview extends File {
  id: string
  preview?: string
  validationResult?: ValidationResult
  uploadProgress?: number
  uploadStatus?: 'pending' | 'uploading' | 'success' | 'error'
  uploadError?: string
  uploadUrl?: string
}

interface EnhancedFileUploadV2Props {
  value?: string[]
  onChange: (urls: string[]) => void
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
  image: FileImage,
  video: FileVideo,
  audio: FileAudio,
  document: FileText,
  unknown: File
}

const FILE_TYPE_COLORS = {
  image: 'bg-blue-50 text-blue-600 border-blue-200',
  video: 'bg-red-50 text-red-600 border-red-200',
  audio: 'bg-green-50 text-green-600 border-green-200',
  document: 'bg-orange-50 text-orange-600 border-orange-200',
  unknown: 'bg-gray-50 text-gray-600 border-gray-200'
}

export function EnhancedFileUploadV2({
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
}: EnhancedFileUploadV2Props) {
  const t = useTranslations()
  const locale = useLocale()
  
  // Generate unique session ID for logging
  const sessionId = useState(() => `SESSION_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`)[0]
  
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  // Generate unique ID for each file
  const generateFileId = useCallback(() => {
    return `file_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
  }, [])

  // Detect file category for icon selection
  const detectFileCategory = useCallback((file: File): keyof typeof FILE_TYPE_ICONS => {
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

  // Generate preview for image files
  const generatePreview = useCallback((file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(undefined)
        return
      }

      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => resolve(undefined)
      reader.readAsDataURL(file)
    })
  }, [])

  // Upload single file with progress tracking
  const uploadFile = useCallback(async (file: FileWithPreview) => {
    const uploadId = `UPLOAD_${file.id}`
    
    // Update upload status
    setFiles(prevFiles => 
      prevFiles.map(f => 
        f.id === file.id 
          ? { ...f, uploadStatus: 'uploading', uploadProgress: 0 }
          : f
      )
    )

    logger.info('☁️ Starting file upload', {
      component: 'EnhancedFileUploadV2',
      action: 'upload_start',
      sessionId,
      metadata: { uploadId, fileName: file.name, fileSize: file.size }
    })

    let progressInterval: NodeJS.Timeout | null = null

    try {
      // Simulate progress updates (in real implementation, this would be handled by the upload service)
      progressInterval = setInterval(() => {
        setFiles(prevFiles => 
          prevFiles.map(f => 
            f.id === file.id && f.uploadProgress !== undefined && f.uploadProgress < 90
              ? { ...f, uploadProgress: Math.min(f.uploadProgress + 10, 90) }
              : f
          )
        )
      }, 200)

      // Upload file with retry mechanism
      const result = await uploadFileWithRetry(
        file,
        3, // maxRetries
        (attemptCount, delay) => {
          logger.info('🔄 Upload retry attempt', {
            component: 'EnhancedFileUploadV2',
            action: 'upload_retry',
            sessionId,
            metadata: { uploadId, attemptCount, retryDelay: delay }
          })
        },
        { fileType, fileIndex: file.id }
      )

      clearInterval(progressInterval)

      if (result.success && result.url) {
        // Update file with success status
        setFiles(prevFiles => 
          prevFiles.map(f => 
            f.id === file.id 
              ? { 
                  ...f, 
                  uploadStatus: 'success', 
                  uploadProgress: 100, 
                  uploadUrl: result.url 
                }
              : f
          )
        )

        // Update parent component with new URL
        onChange([...value, result.url])

        logger.info('✅ File upload successful', {
          component: 'EnhancedFileUploadV2',
          action: 'upload_success',
          sessionId,
          metadata: { uploadId, uploadUrl: result.url }
        })

      } else {
        // Update file with error status
        setFiles(prevFiles => 
          prevFiles.map(f => 
            f.id === file.id 
              ? { 
                  ...f, 
                  uploadStatus: 'error', 
                  uploadError: result.error || 'Upload failed',
                  uploadProgress: 0
                }
              : f
          )
        )

        logger.error('❌ File upload failed', {
          component: 'EnhancedFileUploadV2',
          action: 'upload_failed',
          sessionId,
          error: result.error,
          metadata: { uploadId, canRetry: result.canRetry }
        })
      }

    } catch (error) {
      if (progressInterval) {
        clearInterval(progressInterval)
      }
      
      setFiles(prevFiles => 
        prevFiles.map(f => 
          f.id === file.id 
            ? { 
                ...f, 
                uploadStatus: 'error', 
                uploadError: error instanceof Error ? error.message : 'Upload failed',
                uploadProgress: 0
              }
            : f
        )
      )

      logger.error('❌ File upload error', {
        component: 'EnhancedFileUploadV2',
        action: 'upload_error',
        sessionId,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: { uploadId }
      })
    }
  }, [fileType, onChange, value, sessionId])

  // Validate and process files
  const processFiles = useCallback(async (acceptedFiles: File[]) => {
    if (disabled) return

    setIsValidating(true)
    
    const sessionId = `UPLOAD_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    
    logger.info('🚀 File upload session started', {
      component: 'EnhancedFileUploadV2',
      action: 'upload_session_start',
      sessionId,
      metadata: {
        fileCount: acceptedFiles.length,
        fileType,
        maxFiles,
        maxSize,
        multiple
      }
    })

    try {
      const processedFiles: FileWithPreview[] = []

      for (const file of acceptedFiles) {
        const fileId = generateFileId()
        
        logger.info('📄 Processing file', {
          component: 'EnhancedFileUploadV2',
          action: 'file_processing_start',
          sessionId,
          metadata: { fileName: file.name, fileSize: file.size, fileId }
        })

        // Validate file with production-grade validation
        const validationResult = await validateFileProduction(file)
        
        // Generate preview for images
        const preview = await generatePreview(file)

        const processedFile: FileWithPreview = {
          ...file,
          id: fileId,
          preview,
          validationResult,
          uploadStatus: validationResult.isValid ? 'pending' : 'error',
          uploadError: !validationResult.isValid ? validationResult.error : undefined
        }

        processedFiles.push(processedFile)

        if (validationResult.isValid) {
          logger.info('✅ File validation successful', {
            component: 'EnhancedFileUploadV2',
            action: 'validation_success',
            sessionId,
            metadata: { fileId, detectedType: validationResult.detectedType }
          })
        } else {
          logger.warn('⚠️ File validation failed', {
            component: 'EnhancedFileUploadV2',
            action: 'validation_failed',
            sessionId,
            metadata: { fileId, error: validationResult.error, securityFlags: validationResult.securityFlags }
          })
        }
      }

      // Update files state
      setFiles(prevFiles => {
        const newFiles = [...prevFiles, ...processedFiles]
        return newFiles.slice(0, maxFiles)
      })

      // Auto-upload valid files
      processedFiles.forEach(file => {
        if (file.validationResult?.isValid) {
          uploadFile(file)
        }
      })

    } catch (error) {
      logger.error('❌ File processing error', {
        component: 'EnhancedFileUploadV2',
        action: 'processing_error',
        sessionId,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsValidating(false)
    }
  }, [disabled, fileType, generateFileId, generatePreview, maxFiles, maxSize, multiple, uploadFile])

  // Remove file
  const removeFile = useCallback((fileId: string) => {
    setFiles(prevFiles => {
      const fileToRemove = prevFiles.find(f => f.id === fileId)
      const updatedFiles = prevFiles.filter(f => f.id !== fileId)
      
      // Remove URL from parent component if file was successfully uploaded
      if (fileToRemove?.uploadUrl) {
        onChange(value.filter(url => url !== fileToRemove.uploadUrl))
      }
      
      return updatedFiles
    })
  }, [onChange, value])

  // Retry upload for failed files
  const retryUpload = useCallback((file: FileWithPreview) => {
    if (file.validationResult?.isValid) {
      uploadFile(file)
    }
  }, [uploadFile])

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
        // Handle file extensions
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
    maxSize: maxSize * 1024 * 1024, // Convert MB to bytes
    disabled: disabled || isValidating,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    onDropAccepted: () => setDragActive(false),
    onDropRejected: () => setDragActive(false)
  })

  // Memoized upload zone styling
  const uploadZoneClassName = useMemo(() => {
    const baseClasses = 'border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer'
    
    if (disabled) return `${baseClasses} border-gray-200 bg-gray-50 cursor-not-allowed opacity-50`
    if (isDragReject) return `${baseClasses} border-red-300 bg-red-50`
    if (isDragAccept || dragActive) return `${baseClasses} border-blue-400 bg-blue-50`
    
    return `${baseClasses} border-gray-300 hover:border-gray-400 hover:bg-gray-50`
  }, [disabled, isDragReject, isDragAccept, dragActive])

  return (
    <TooltipProvider>
      <div className={`space-y-4 ${className}`}>
        {/* Upload Zone */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-0">
            <div {...getRootProps()} className={uploadZoneClassName}>
              <input {...getInputProps()} />
              
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                
                <div className="space-y-1">
                  <p className="text-lg font-medium text-gray-900">
                    {isDragActive ? t('dropFilesHere') : `Upload ${label}`}
                  </p>
                  <p className="text-sm text-gray-500">
                    {description}
                  </p>
                  <p className="text-xs text-gray-400">
                    Max {maxFiles} files • {maxSize}MB each • {acceptedFileTypes.slice(0, 3).join(', ')}
                    {acceptedFileTypes.length > 3 && ` +${acceptedFileTypes.length - 3} more`}
                  </p>
                </div>

                {!disabled && (
                  <Button variant="outline" size="sm" type="button">
                    {t('chooseFiles')}
                  </Button>
                )}
              </div>
            </div>

            {/* Validation Progress */}
            {isValidating && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">{t('validatingFiles')}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* File Grid */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {files.map((file) => (
                <FilePreviewCard
                  key={file.id}
                  file={file}
                  onRemove={() => removeFile(file.id)}
                  onRetry={() => retryUpload(file)}
                  category={detectFileCategory(file)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary Stats */}
        {files.length > 0 && (
          <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t">
            <span>
              {files.length} file{files.length !== 1 ? 's' : ''} • {files.filter(f => f.uploadStatus === 'success').length} uploaded
            </span>
            <span>
              {formatFileSize(files.reduce((total, file) => total + file.size, 0))} total
            </span>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}

// File Preview Card Component
interface FilePreviewCardProps {
  file: FileWithPreview
  onRemove: () => void
  onRetry: () => void
  category: keyof typeof FILE_TYPE_ICONS
}

function FilePreviewCard({ file, onRemove, onRetry, category }: FilePreviewCardProps) {
  const t = useTranslations()
  const IconComponent = FILE_TYPE_ICONS[category]
  const colorClasses = FILE_TYPE_COLORS[category]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="relative"
    >
      <Card className={`relative overflow-hidden ${file.validationResult?.isValid ? '' : 'border-red-200'}`}>
        <CardContent className="p-4">
          {/* File Preview/Icon */}
          <div className="relative mb-3">
            {file.preview && category === 'image' ? (
              <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={file.preview}
                  alt={file.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            ) : (
              <div className={`flex items-center justify-center w-full h-32 rounded-lg border-2 ${colorClasses}`}>
                <IconComponent className="w-12 h-12" />
              </div>
            )}

            {/* Status Overlay */}
            <div className="absolute top-2 right-2 flex space-x-1">
              {file.uploadStatus === 'success' && (
                <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {t('uploaded')}
                </Badge>
              )}
              
              {file.uploadStatus === 'error' && (
                <Badge variant="outline" className="bg-red-50 border-red-200 text-red-700">
                  <XCircle className="w-3 h-3 mr-1" />
                  {t('failed')}
                </Badge>
              )}

              {file.uploadStatus === 'uploading' && (
                <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  {t('uploading')}
                </Badge>
              )}
            </div>

            {/* Remove Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 left-2 w-6 h-6"
                  onClick={onRemove}
                >
                  <X className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('removeFile')}</TooltipContent>
            </Tooltip>
          </div>

          {/* File Info */}
          <div className="space-y-2">
            <div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="font-medium text-sm text-gray-900 truncate">{file.name}</p>
                </TooltipTrigger>
                <TooltipContent>{file.name}</TooltipContent>
              </Tooltip>
              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
            </div>

            {/* Upload Progress */}
            {file.uploadStatus === 'uploading' && file.uploadProgress !== undefined && (
              <div className="space-y-1">
                <Progress value={file.uploadProgress} className="h-2" />
                <p className="text-xs text-gray-500 text-center">{file.uploadProgress}%</p>
              </div>
            )}

            {/* Validation Error */}
            {file.validationResult && !file.validationResult.isValid && (
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-red-600 font-medium">{t('validationFailed')}</p>
                  <p className="text-xs text-red-500">{file.validationResult.error}</p>
                </div>
              </div>
            )}

            {/* Upload Error */}
            {file.uploadError && (
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-2">
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600">{file.uploadError}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  className="h-6 px-2 text-xs"
                >
                  {t('retry')}
                </Button>
              </div>
            )}

            {/* Success Actions */}
            {file.uploadStatus === 'success' && file.uploadUrl && (
              <div className="flex space-x-2">
                {category === 'video' && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Play className="w-3 h-3 mr-1" />
                        {t('preview')}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t('previewVideo')}</TooltipContent>
                  </Tooltip>
                )}
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => window.open(file.uploadUrl, '_blank')}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      {t('view')}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t('openFile')}</TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default EnhancedFileUploadV2