'use client'

import React, { useState, useRef } from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'
import { Upload, X, FileImage, FileText, FileVideo, File, Settings, Check, AlertCircle, Zap, RotateCcw, Wifi, WifiOff } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { type Locale } from '@/utilities/locale'
import { FormFieldProps } from '../types'
import { 
  validateFileSignature, 
  sanitizeFilename, 
  generateThumbnail, 
  isImageFile, 
  smartCompressImage,
  formatFileSize,
  type CompressionResult,
  type RetryState,
  createRetryState,
  updateRetryState,
  categorizeError,
  isRetryableError,
  retryFileUpload,
  uploadFileWithRetry,
  sleep
} from '@/lib/file-upload'
import { logger } from '@/utilities/logger'

interface FormFileUploadProps extends Omit<FormFieldProps, 'placeholder'> {
  accept?: string
  maxSize?: number // in MB
  multiple?: boolean
  locale?: 'fr' | 'ar'
  enableCompression?: boolean // Enable/disable compression
  compressionThreshold?: number // Size threshold in MB for compression
}

interface SelectedFile {
  file: File
  originalFile?: File // Keep reference to original file
  fileId: string // Unique identifier to prevent race conditions
  previewUrl: string
  thumbnailUrl?: string
  thumbnailLoading?: boolean
  thumbnailError?: string
  error?: string
  uploading?: boolean
  uploadProgress?: number
  // Compression-related fields
  isCompressed?: boolean
  compressionResult?: CompressionResult
  compressing?: boolean
  compressionError?: string
  // Retry-related fields
  retryState?: RetryState
  retrying?: boolean
  canRetry?: boolean
  retryAttempts?: number
  nextRetryDelay?: number
}

/**
 * Generate unique file ID to prevent race conditions
 */
function generateFileId(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}-${Date.now()}`
}

export function FormFileUpload({
  name,
  label,
  required = false,
  disabled = false,
  className = '',
  accept = 'image/*,.pdf,.doc,.docx,.txt',
  maxSize = 10, // 10MB default
  multiple = false,
  locale,
  enableCompression = true, // Enable compression by default
  compressionThreshold = 2, // 2MB threshold for compression
  ...props
}: FormFileUploadProps) {
  const [files, setFiles] = useState<SelectedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [compressionEnabled, setCompressionEnabled] = useState(enableCompression)
  // Ref to store the current onChange function from Controller
  const formOnChangeRef = React.useRef<((value: any) => void) | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const {
    control,
    setValue,
    formState: { errors }
  } = useFormContext()

  const currentLocale = useLocale() as Locale
  const effectiveLocale = locale || currentLocale
  const isRTL = effectiveLocale === 'ar'
  const error = errors[name]?.message as string | undefined
  const t = useTranslations()

  const getFileIcon = (file: File) => {
    const type = file.type
    if (type.startsWith('video/')) return <FileVideo className="h-5 w-5" />
    if (type.includes('pdf') || type.includes('document')) return <FileText className="h-5 w-5" />
    if (type.startsWith('image/')) return <FileImage className="h-5 w-5" />
    return <File className="h-5 w-5" />
  }

  // Retry-related functions
  const handleRetryUpload = async (fileData: SelectedFile) => {
    if (!fileData.retryState) return
    
    // Update file state to show retrying
    setFiles(prev => prev.map(f => 
      f.fileId === fileData.fileId 
        ? { 
            ...f, 
            retrying: true, 
            error: undefined,
            uploadProgress: 0
          }
        : f
    ))

    try {
      const result = await retryFileUpload(fileData.file, fileData.retryState)
      
      if (result.success) {
        // Retry succeeded
        setFiles(prev => prev.map(f => 
          f.fileId === fileData.fileId 
            ? { 
                ...f, 
                retrying: false,
                error: undefined,
                retryState: result.retryState,
                canRetry: false,
                uploadProgress: 100
              }
            : f
        ))
      } else {
        // Retry failed
        setFiles(prev => prev.map(f => 
          f.fileId === fileData.fileId 
            ? { 
                ...f, 
                retrying: false,
                error: result.error,
                retryState: result.retryState,
                canRetry: result.canRetry || false
              }
            : f
        ))
      }
    } catch (error) {
      // Handle retry error
      setFiles(prev => prev.map(f => 
        f.fileId === fileData.fileId 
          ? { 
              ...f, 
              retrying: false,
              error: error instanceof Error ? error.message : 'Retry failed'
            }
          : f
      ))
    }
  }

  const getRetryButtonText = (fileData: SelectedFile): string => {
    if (!fileData.retryState) return t('retry')
    
    const attemptCount = fileData.retryState.attemptCount
    const maxRetries = fileData.retryState.maxRetries
    
    if (attemptCount === 0) {
      return t('retry')
    }
    
    return t('retryAttempt', { current: attemptCount, max: maxRetries })
  }

  const getErrorIcon = (failureType?: string) => {
    switch (failureType) {
      case 'network':
        return <WifiOff className="h-4 w-4 text-orange-500" />
      case 'security':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'validation':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'server':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const renderFilePreview = (fileData: SelectedFile) => {
    const { file, thumbnailUrl, thumbnailLoading, thumbnailError } = fileData

    // For image files, show thumbnail if available
    if (isImageFile(file)) {
      if (thumbnailLoading) {
        return (
          <div className="h-12 w-12 bg-gray-200 rounded-md flex items-center justify-center animate-pulse">
            <FileImage className="h-5 w-5 text-gray-400" />
          </div>
        )
      }

      if (thumbnailUrl && !thumbnailError) {
        return (
          <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
            <Image
              src={thumbnailUrl}
              alt={`${t('loadingThumbnail')} ${file.name}`}
              width={48}
              height={48}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={() => {
                // Update file data to show error state
                setFiles(prev => prev.map(f => 
                  f.file === file 
                    ? { ...f, thumbnailError: t('thumbnailError') }
                    : f
                ))
              }}
            />
          </div>
        )
      }

      // Fallback for thumbnail error or no thumbnail
      return (
        <div className="h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
          {getFileIcon(file)}
        </div>
      )
    }

    // For non-image files, show icon
    return (
      <div className="flex items-center justify-center flex-shrink-0">
        {getFileIcon(file)}
      </div>
    )
  }


  const validateFile = async (file: File): Promise<{ error: string | null, retryState?: RetryState }> => {
    // Size validation
    if (file.size > maxSize * 1024 * 1024) {
      return { error: t('fileTooLarge', { maxSize }) }
    }

    // File name sanitization check
    const sanitizedName = sanitizeFilename(file.name)
    if (sanitizedName !== file.name && sanitizedName.length < file.name.length * 0.5) {
      return { error: t('invalidFileName') }
    }

    // Type validation (basic MIME type check)
    const allowedTypes = accept.split(',').map(t => t.trim())
    const isValidType = allowedTypes.some(allowedType => {
      if (allowedType.startsWith('.')) {
        return file.name.toLowerCase().endsWith(allowedType.toLowerCase())
      }
      if (allowedType.includes('*')) {
        const baseType = allowedType.split('/')[0]
        return file.type.startsWith(baseType + '/')
      }
      return file.type === allowedType
    })

    if (!isValidType) {
      return { error: t('unsupportedFileType') }
    }

    // Advanced security validation - file signature check
    try {
      const isValidSignature = await validateFileSignature(file)
      if (!isValidSignature) {
        return { error: t('invalidFileFormat') }
      }
    } catch (error) {
      logger.warn('File signature validation failed:', {
        component: 'FormFileUpload',
        action: 'signature_validation_failed',
        filename: file.name,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      })
      // Create retry state for validation errors that might be transient
      const fakeError = { message: 'File validation error' }
      const retryState = updateRetryState(createRetryState(), fakeError)
      return { 
        error: t('fileValidationError'),
        retryState
      }
    }

    return { error: null }
  }


  const handleFileSelect = async (selectedFiles: FileList) => {
    const newFiles: SelectedFile[] = []

    // Process files sequentially to handle async validation and compression
    for (let i = 0; i < selectedFiles.length; i++) {
      const originalFile = selectedFiles[i]
      
      // Show loading state for this file
      const fileId = generateFileId(originalFile)
      const tempFileData: SelectedFile = {
        file: originalFile,
        originalFile,
        fileId,
        previewUrl: '',
        thumbnailLoading: isImageFile(originalFile),
        uploading: true,
        uploadProgress: 0,
        compressing: false
      }
      
      if (!multiple && i === 0) {
        setFiles([tempFileData])
      } else if (multiple) {
        setFiles(prev => [...prev, tempFileData])
      }
      
      const validationResult = await validateFile(originalFile)
      if (validationResult.error) {
        const errorFileData: SelectedFile = {
          file: originalFile,
          originalFile,
          fileId,
          previewUrl: '',
          error: validationResult.error,
          uploading: false,
          thumbnailLoading: false,
          retryState: validationResult.retryState,
          canRetry: validationResult.retryState ? isRetryableError(validationResult.retryState.failureType || 'unknown') : false
        }
        newFiles.push(errorFileData)
        continue
      }

      // Check if compression is needed and enabled
      let processedFile = originalFile
      let compressionResult: CompressionResult | undefined
      let isCompressed = false

      if (compressionEnabled && 
          isImageFile(originalFile) && 
          originalFile.size > compressionThreshold * 1024 * 1024) {
        
        // Show compression state
        setFiles(prevFiles => prevFiles.map(f => 
          f.fileId === fileId 
            ? { ...f, compressing: true, uploadProgress: 25 }  
            : f
        ))

        try {
          compressionResult = await smartCompressImage(originalFile, compressionThreshold)
          
          if (compressionResult.success && compressionResult.compressedFile) {
            processedFile = compressionResult.compressedFile
            isCompressed = true
            
            // Update progress during compression
            setFiles(prevFiles => prevFiles.map(f => 
              f.fileId === fileId 
                ? { ...f, uploadProgress: 75 }  
                : f
            ))
          }
        } catch (error) {
          logger.warn('Image compression failed:', {
            component: 'FormFileUpload',
            action: 'image_compression_failed',
            filename: originalFile.name,
            metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
          })
          // Continue with original file if compression fails
        }
      }

      let finalFileData: SelectedFile = {
        file: processedFile,
        originalFile,
        fileId,
        previewUrl: URL.createObjectURL(processedFile),
        uploading: false,
        thumbnailLoading: false,
        compressing: false,
        isCompressed,
        compressionResult
      }

      // Generate thumbnail for image files asynchronously
      if (isImageFile(processedFile)) {
        finalFileData.thumbnailLoading = true
        
        // Generate thumbnail asynchronously without blocking the UI
        generateThumbnail(processedFile, 100, 100, 0.8).then(thumbnailResult => {
          setFiles(prevFiles => prevFiles.map(f => {
            if (f.fileId === fileId) {
              return {
                ...f,
                thumbnailLoading: false,
                thumbnailUrl: thumbnailResult.success ? thumbnailResult.thumbnailUrl : undefined,
                thumbnailError: thumbnailResult.success ? undefined : (thumbnailResult.error || t('thumbnailError'))
              }
            }
            return f
          }))
        }).catch(() => {
          setFiles(prevFiles => prevFiles.map(f => {
            if (f.fileId === fileId) {
              return {
                ...f,
                thumbnailLoading: false,
                thumbnailError: t('thumbnailError')
              }
            }
            return f
          }))
        })
      }
      
      newFiles.push(finalFileData)
    }

    // Update with all validated files
    if (!multiple) {
      setFiles(newFiles.slice(0, 1))
    } else {
      setFiles(prev => {
        // Replace loading files with validated ones
        const nonLoadingFiles = prev.filter(f => !f.uploading)
        return [...nonLoadingFiles, ...newFiles]
      })
    }

    // Update form value immediately with validated file objects
    // Don't use setTimeout as it can cause timing issues with Controller
    const validatedFileObjects = newFiles.filter(f => !f.error).map(f => f.file)
    const newFormValue = multiple ? validatedFileObjects : (validatedFileObjects[0] || null)
    
    // Update form value immediately with validated files
    
    // Update form value immediately using Controller's onChange or setValue
    if (formOnChangeRef.current) {
      formOnChangeRef.current(newFormValue)
      // Called formOnChange with new value
    } else {
      setValue(name, newFormValue)
      // Called setValue with new value
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (disabled) return
    
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles)
    }
  }

  const removeFile = (fileToRemove: SelectedFile) => {
    setFiles(prev => {
      const updatedFiles = prev.filter(f => f.fileId !== fileToRemove.fileId)
      
      // Update form value immediately after removing file
      const validFiles = updatedFiles.filter(f => !f.error).map(f => f.file)
      const newValue = multiple ? validFiles : (validFiles[0] || null)
      
      logger.log(`🗑️ Removing file and updating form for "${name}":`, {
        removedFile: fileToRemove.file.name,
        remainingFiles: validFiles.length,
        fileNames: validFiles.map(f => f.name)
      })
      
      // Update form value immediately
      if (formOnChangeRef.current) {
        formOnChangeRef.current(newValue)
      } else {
        setValue(name, newValue)
      }
      
      return updatedFiles
    })
    
    // Revoke object URLs to prevent memory leaks
    if (fileToRemove.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(fileToRemove.previewUrl)
    }
    if (fileToRemove.thumbnailUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(fileToRemove.thumbnailUrl)
    }
  }

  // Update form field when files change (store File objects, not URLs)
  const updateFormValue = React.useCallback(() => {
    // Skip if no files to avoid clearing during initial setup
    if (files.length === 0) {
      // Skipping update - no files present
      return
    }
    
    const validFiles = files.filter(f => !f.error).map(f => f.file)
    const newValue = multiple ? validFiles : (validFiles[0] || null)
    
    // Update form value with valid files
    
    // Use Controller's onChange if available, fallback to setValue
    if (formOnChangeRef.current) {
      formOnChangeRef.current(newValue)
      // Called formOnChange with new value
    } else {
      setValue(name, newValue)
      // Called setValue with new value
    }
  }, [files, multiple, name, setValue])

  // Update form value when files change (but not on initial mount)
  React.useEffect(() => {
    // Only update if files have been modified (not empty initial state)
    if (files.length > 0) {
      updateFormValue()
    }
  }, [files, updateFormValue])

  // Cleanup all object URLs when component unmounts
  React.useEffect(() => {
    return () => {
      files.forEach(fileData => {
        if (fileData.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(fileData.previewUrl)
        }
        if (fileData.thumbnailUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(fileData.thumbnailUrl)
        }
      })
    }
  }, [files])

  return (
    <div className={`space-y-2 ${className}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Label htmlFor={name} className="text-sm font-medium text-gray-700">
        <bdi>
          {label}
          {required && <span className="text-red-500 ms-1">*</span>}
        </bdi>
      </Label>

      {/* Compression Toggle */}
      {enableCompression && (
        <div className={cn("flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200", isRTL && "flex-row-reverse")}>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCompressionEnabled(!compressionEnabled)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                compressionEnabled
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-700 hover:bg-gray-400",
                isRTL && "flex-row-reverse"
              )}
            >
              <Zap className="h-4 w-4" />
              <bdi>
                {compressionEnabled ? t('compressionEnabled') : t('compressionDisabled')}
              </bdi>
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-blue-700 font-medium">
              <bdi>{t('compressionToggleLabel')}</bdi>
            </p>
            <p className="text-xs text-blue-600">
              <bdi>{t('compressionToggleDesc')}</bdi>
            </p>
          </div>
        </div>
      )}

      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value, ...fieldProps } }) => {
          // Store the onChange function in ref to avoid Rules of Hooks violation
          formOnChangeRef.current = onChange
          
          // Controller render - field value updated
          
          return (
            <div className="space-y-3">
              {/* Upload Area */}
              <div
                role="button"
                tabIndex={disabled ? -1 : 0}
                aria-label={t('fileUploadArea')}
                aria-describedby={`${name}-instructions ${name}-security-info`}
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer",
                  "hover:border-primary/50 hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/20",
                  isDragOver && "border-primary bg-primary/10 ring-2 ring-primary/20",
                  error && "border-red-500 bg-red-50",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !disabled && fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
                    e.preventDefault()
                    fileInputRef.current?.click()
                  }
                }}
              >
                <Upload className={cn("h-8 w-8 mx-auto mb-2 text-gray-400", isRTL && "scale-x-[-1]")} />
                <p className="text-sm text-gray-600 mb-2">
                  <bdi>{t('dragDropText')}</bdi>
                </p>
                <p id={`${name}-instructions`} className="text-xs text-gray-500 mb-1">
                  <bdi>{t('maxSizeText', { maxSize })}</bdi>
                </p>
                <p id={`${name}-security-info`} className="text-xs text-gray-400 mb-3">
                  <bdi>{t('filesValidatedSecurity')}</bdi>
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(isRTL && "flex-row-reverse")}
                >
                  <Upload className={cn("h-4 w-4", isRTL ? "ms-2" : "me-2")} />
                  <bdi>{t('chooseFile')}</bdi>
                </Button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={accept}
                  multiple={multiple}
                  disabled={disabled}
                  className="hidden"
                  onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
                />
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((fileData, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center gap-3 p-3 bg-gray-50 rounded-lg",
                        isRTL && "flex-row-reverse"
                      )}
                    >
                      {renderFilePreview(fileData)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          <bdi>{fileData.file.name}</bdi>
                        </p>
                        <p className="text-xs text-gray-500">
                          <bdi>{formatFileSize(fileData.file.size)}</bdi>
                        </p>
                        
                        {/* Compression status */}
                        {fileData.isCompressed && fileData.compressionResult && (
                          <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            <bdi>
                              {t('compressionSavings', {
                                originalSize: formatFileSize(fileData.compressionResult.originalSize),
                                compressedSize: formatFileSize(fileData.compressionResult.compressedSize),
                                savings: fileData.compressionResult.savings
                              })}
                            </bdi>
                          </p>
                        )}
                        
                        {fileData.error && (
                          <div className="mt-1">
                            <div className="flex items-center gap-1">
                              {getErrorIcon(fileData.retryState?.failureType)}
                              <p className="text-xs text-red-600">
                                <bdi>{fileData.error}</bdi>
                              </p>
                            </div>
                            {fileData.retryState && (
                              <p className="text-xs text-gray-500 mt-1">
                                <bdi>
                                  {t('errorType')}: {t(`errorType${fileData.retryState.failureType || 'unknown'}`)}
                                </bdi>
                              </p>
                            )}
                          </div>
                        )}
                        {fileData.compressing && (
                          <div className="mt-1">
                            <p className="text-xs text-blue-600 mb-1">
                              <bdi>{t('compressingImage')}...</bdi>
                            </p>
                            <Progress 
                              value={fileData.uploadProgress || 0} 
                              className="h-1 animate-pulse"
                            />
                          </div>
                        )}
                        {fileData.uploading && !fileData.compressing && (
                          <div className="mt-1">
                            <p className="text-xs text-blue-600 mb-1">
                              <bdi>{t('validatingFile')}...</bdi>
                            </p>
                            <Progress 
                              value={fileData.uploadProgress || 0} 
                              className="h-1 animate-pulse"
                            />
                          </div>
                        )}
                        {!fileData.error && !fileData.uploading && !fileData.compressing && (
                          <p className="text-xs text-green-600 mt-1">
                            <bdi>{t('fileReady')}</bdi>
                          </p>
                        )}
                      </div>
                      
                      {/* Retry and Remove buttons */}
                      <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                        {fileData.canRetry && fileData.error && !fileData.retrying && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleRetryUpload(fileData)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                            disabled={fileData.retrying}
                          >
                            <RotateCcw className={cn("h-4 w-4", isRTL ? "ms-1" : "me-1")} />
                            <bdi>{getRetryButtonText(fileData)}</bdi>
                          </Button>
                        )}
                        
                        {fileData.retrying && (
                          <div className="flex items-center gap-2 text-blue-600">
                            <RotateCcw className="h-4 w-4 animate-spin" />
                            <span className="text-xs">
                              <bdi>{t('retrying')}...</bdi>
                            </span>
                          </div>
                        )}
                        
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(fileData)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={fileData.retrying}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        }}
      />

      {error && (
        <p className="text-sm text-red-600 mt-1">
          <bdi>{error}</bdi>
        </p>
      )}
    </div>
  )
}