'use client'

import React, { useState, useRef } from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'
import Dropzone, { type DropzoneProps, type FileRejection } from 'react-dropzone'
import { toast } from 'sonner'
import { Upload, X, FileImage, FileText, FileVideo, File, Settings, Check, AlertCircle, RotateCcw, Wifi, WifiOff, Loader2, Trash } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { type Locale } from '@/utilities/locale'
import { FormFieldProps } from '../types'
import { useControllableState } from '@/hooks/use-controllable-state'
import { 
  sanitizeFilename, 
  generateThumbnail, 
  isImageFile, 
  formatFileSize,
  type RetryState,
  createRetryState,
  updateRetryState,
  categorizeError,
  isRetryableError,
  retryFileUpload,
  uploadFileWithRetry,
  sleep
} from '@/lib/file-upload'
import { validateFileProduction, type ValidationResult } from '@/lib/production-file-validation'
import { logger } from '@/utilities/logger'

interface FormFileUploadProps extends Omit<FormFieldProps, 'placeholder'> {
  /**
   * Value of the uploader.
   * @type File[]
   * @default undefined
   */
  value?: File[]

  /**
   * Function to be called when the value changes.
   * @type React.Dispatch<React.SetStateAction<File[]>>
   * @default undefined
   */
  onValueChange?: React.Dispatch<React.SetStateAction<File[]>>

  /**
   * Accepted file types for the uploader.
   * @type string
   * @default 'image/*,.pdf,.doc,.docx,.txt'
   */
  accept?: string

  /**
   * Maximum file size for the uploader.
   * @type number | undefined
   * @default 10 // 10MB
   */
  maxSize?: number // in MB

  /**
   * Maximum number of files for the uploader.
   * @type number | undefined
   * @default undefined
   */
  maxFiles?: number

  /**
   * Whether the uploader should accept multiple files.
   * @type boolean
   * @default false
   */
  multiple?: boolean

  locale?: 'fr' | 'ar'

  /**
   * Whether to hide the default preview.
   * @type boolean
   * @default false
   */
  hideDefaultPreview?: boolean
}

interface FileWithPreview extends File {
  preview: string
  id: string
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
  return `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Check if file has preview property
 */
function isFileWithPreview(file: File): file is FileWithPreview {
  return 'preview' in file && typeof (file as any).preview === 'string' && 'id' in file
}

export function FormFileUploadModern({
  name,
  label,
  required = false,
  disabled = false,
  className = '',
  value: valueProp,
  onValueChange,
  accept = 'image/*,.pdf,.doc,.docx,.txt',
  maxSize = 10, // 10MB default
  maxFiles,
  multiple = false,
  locale,
  hideDefaultPreview = false,
  ...props
}: FormFileUploadProps) {
  const [files, setFiles] = useControllableState<File[]>({
    prop: valueProp,
    onChange: onValueChange,
    defaultProp: []
  })
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const formOnChangeRef = React.useRef<((value: any) => void) | null>(null)
  
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

  // Convert accept string to dropzone format
  const dropzoneAccept = React.useMemo(() => {
    const acceptTypes = accept.split(',').map(t => t.trim())
    const dropzoneAcceptObject: Record<string, string[]> = {}
    
    acceptTypes.forEach(type => {
      if (type.startsWith('.')) {
        // File extension
        if (!dropzoneAcceptObject['application/octet-stream']) {
          dropzoneAcceptObject['application/octet-stream'] = []
        }
        dropzoneAcceptObject['application/octet-stream'].push(type)
      } else if (type.includes('*')) {
        // MIME type with wildcard
        dropzoneAcceptObject[type] = []
      } else {
        // Specific MIME type
        dropzoneAcceptObject[type] = []
      }
    })
    
    return dropzoneAcceptObject
  }, [accept])

  // Update form field when files change (store File objects, not URLs)
  const updateFormValue = React.useCallback(() => {
    const validFiles = selectedFiles.filter(f => !f.error).map(f => f.file)
    const newValue = multiple ? validFiles : (validFiles[0] || null)
    
    logger.log(`🔍 FormFileUploadModern - Updating form value for field "${name}":`, {
      component: 'FormFileUploadModern',
      metadata: {
        fieldName: name,
        totalFiles: selectedFiles.length,
        validFiles: validFiles.length,
        fileNames: validFiles.map(f => f.name),
        fileSizes: validFiles.map(f => f.size),
        multiple,
        valueBeingSet: newValue,
        hasFormOnChange: typeof formOnChangeRef.current === 'function',
        usingSetValue: !formOnChangeRef.current
      }
    })
    
    // Use Controller's onChange if available, fallback to setValue
    if (formOnChangeRef.current) {
      formOnChangeRef.current(newValue)
      logger.log(`✅ Called formOnChange for "${name}" with:`, { newValue })
    } else {
      if (multiple) {
        setValue(name, validFiles)
      } else {
        setValue(name, validFiles[0] || null)
      }
      logger.log(`✅ Called setValue for "${name}" with:`, { newValue })
    }
  }, [selectedFiles, multiple, name, setValue, formOnChangeRef])

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
    setSelectedFiles(prev => prev.map(f => 
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
        setSelectedFiles(prev => prev.map(f => 
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
        setSelectedFiles(prev => prev.map(f => 
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
      setSelectedFiles(prev => prev.map(f => 
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

  const validateFile = React.useCallback(async (file: File): Promise<{ error: string | null, retryState?: RetryState }> => {
    // Use production validation system
    try {
      const validationResult: ValidationResult = await validateFileProduction(file)
      
      if (!validationResult.isValid) {
        // Handle specific validation errors
        if (validationResult.error?.includes('size')) {
          return { error: t('fileTooLarge', { maxSize }) }
        }
        if (validationResult.error?.includes('MIME type')) {
          return { error: t('unsupportedFileType') }
        }
        if (validationResult.error?.includes('extension')) {
          return { error: t('unsupportedFileType') }
        }
        if (validationResult.securityFlags?.includes('MIME_MISMATCH')) {
          return { error: t('invalidFileFormat') }
        }
        if (validationResult.securityFlags?.includes('UNDETECTABLE_SIGNATURE')) {
          return { error: t('invalidFileFormat') }
        }
        
        // Generic validation error
        return { error: validationResult.error || t('fileValidationError') }
      }
      
      // Additional file name sanitization check (not covered by production validation)
      const sanitizedName = sanitizeFilename(file.name)
      if (sanitizedName !== file.name && sanitizedName.length < file.name.length * 0.5) {
        return { error: t('invalidFileName') }
      }
      
      // Additional type validation against accept prop
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
      
      return { error: null }
      
    } catch (error) {
      logger.warn('Production file validation failed:', {
        component: 'FormFileUploadModern',
        action: 'production_validation_failed',
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
  }, [maxSize, accept, t])

  const onDrop = React.useCallback(
    async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (!multiple && acceptedFiles.length > 1) {
        toast.error(effectiveLocale === 'ar' ? 'لا يمكن رفع أكثر من ملف واحد' : 'Cannot upload more than one file')
        return
      }

      if (maxFiles && (files?.length ?? 0) + acceptedFiles.length > maxFiles) {
        toast.error(effectiveLocale === 'ar' ? `لا يمكن رفع أكثر من ${maxFiles} ملف` : `Cannot upload more than ${maxFiles} files`)
        return
      }

      setIsUploading(true)

      // Process rejected files
      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file, errors }) => {
          const errorMessages = errors.map((e) => e.message).join(', ')
          toast.error(`${file.name}: ${errorMessages}`)
        })
      }

      const newFiles: SelectedFile[] = []
      const newFileObjects: File[] = []

      // Process files sequentially to handle async validation and compression
      for (let i = 0; i < acceptedFiles.length; i++) {
        const originalFile = acceptedFiles[i]
        
        // Create file with preview
        const fileId = generateFileId(originalFile)
        const tempFileData: SelectedFile = {
          file: originalFile,
          originalFile,
          fileId,
          previewUrl: URL.createObjectURL(originalFile),
          thumbnailLoading: isImageFile(originalFile),
          uploading: true,
          uploadProgress: 0
        }
        
        // Update selected files immediately for UI feedback
        setSelectedFiles(prev => [...prev, tempFileData])
        
        const validationResult = await validateFile(originalFile)
        if (validationResult.error) {
          const errorFileData: SelectedFile = {
            ...tempFileData,
            error: validationResult.error,
            uploading: false,
            thumbnailLoading: false,
            retryState: validationResult.retryState,
            canRetry: validationResult.retryState ? isRetryableError(validationResult.retryState.failureType || 'unknown') : false
          }
          newFiles.push(errorFileData)
          continue
        }

        // Use original file without compression
        let processedFile = originalFile

        let finalFileData: SelectedFile = {
          file: processedFile,
          originalFile,
          fileId,
          previewUrl: URL.createObjectURL(processedFile),
          uploading: false,
          thumbnailLoading: false
        }

        // Generate thumbnail for image files asynchronously
        if (isImageFile(processedFile)) {
          finalFileData.thumbnailLoading = true
          
          // Generate thumbnail asynchronously without blocking the UI
          generateThumbnail(processedFile, 100, 100, 0.8).then(thumbnailResult => {
            setSelectedFiles(prevFiles => prevFiles.map(f => {
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
            setSelectedFiles(prevFiles => prevFiles.map(f => {
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
        newFileObjects.push(processedFile)
      }

      // Update selected files with all validated files
      setSelectedFiles(prev => {
        const nonLoadingFiles = prev.filter(f => !f.uploading || !acceptedFiles.some(af => generateFileId(af) === f.fileId))
        return [...nonLoadingFiles, ...newFiles]
      })

      // Update form value with file objects
      const updatedFiles = files ? [...files, ...newFileObjects] : newFileObjects
      if (!multiple) {
        setFiles(newFileObjects.slice(0, 1))
      } else {
        setFiles(updatedFiles)
      }

      setIsUploading(false)
      
      // Update form value
      setTimeout(updateFormValue, 100)
    },
    [files, maxFiles, multiple, setFiles, effectiveLocale, t, updateFormValue, validateFile]
  )

  const removeFile = (fileToRemove: SelectedFile) => {
    if (isUploading) return

    // Remove from selected files
    setSelectedFiles(prev => prev.filter(f => f.fileId !== fileToRemove.fileId))
    
    // Remove from form files
    const newFiles = files?.filter(f => {
      const fileId = generateFileId(f)
      return fileId !== fileToRemove.fileId
    }) || []
    
    setFiles(newFiles)
    onValueChange?.(newFiles)
    
    // Revoke object URLs to prevent memory leaks
    if (fileToRemove.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(fileToRemove.previewUrl)
    }
    if (fileToRemove.thumbnailUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(fileToRemove.thumbnailUrl)
    }
  }


  // Update form value when files change
  React.useEffect(() => {
    updateFormValue()
  }, [updateFormValue])

  // Cleanup all object URLs when component unmounts
  React.useEffect(() => {
    return () => {
      selectedFiles.forEach(fileData => {
        if (fileData.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(fileData.previewUrl)
        }
        if (fileData.thumbnailUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(fileData.thumbnailUrl)
        }
      })
    }
  }, [selectedFiles])

  const isDisabled = disabled || isUploading || (maxFiles ? (selectedFiles?.length ?? 0) >= maxFiles : false)

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
                setSelectedFiles(prev => prev.map(f => 
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

  return (
    <div className={cn('w-full space-y-4', className)} dir={isRTL ? 'rtl' : 'ltr'} {...props}>
      <Label htmlFor={name} className="text-sm font-medium text-gray-700">
        <bdi>
          {label}
          {required && <span className="text-red-500 ms-1">*</span>}
        </bdi>
      </Label>


      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value, ...fieldProps } }) => {
          // Store the onChange function in ref
          formOnChangeRef.current = onChange
          
          // Debug current field value
          logger.log(`🔍 FormFileUploadModern Controller render - Field "${name}":`, {
            component: 'FormFileUploadModern',
            metadata: {
              fieldName: name,
              currentValue: value,
              valueType: typeof value,
              valueLength: Array.isArray(value) ? value.length : 'not array',
              filesState: selectedFiles.length,
              hasOnChange: typeof onChange === 'function'
            }
          })
          
          return (
            <div className="space-y-3">
              {/* Modern Dropzone */}
              <Dropzone
                onDrop={onDrop}
                accept={dropzoneAccept}
                maxSize={maxSize * 1024 * 1024}
                maxFiles={maxFiles}
                multiple={!!multiple}
                disabled={isDisabled}
              >
                {({ getRootProps, getInputProps, isDragActive }) => (
                  <div
                    {...getRootProps()}
                    className={cn(
                      "flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-6 transition-all duration-200",
                      isDragActive
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]"
                        : "hover:border-blue-400 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50",
                      isDisabled && "pointer-events-none opacity-60",
                      error && "border-red-500 bg-red-50"
                    )}
                  >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center gap-3 text-center">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                          isDragActive
                            ? "bg-blue-100 dark:bg-blue-900/30"
                            : "bg-gray-100 dark:bg-gray-800"
                        )}
                      >
                        <Upload
                          className={cn(
                            "h-5 w-5 transition-colors",
                            isDragActive ? "text-blue-600" : "text-gray-500",
                            isRTL && "scale-x-[-1]"
                          )}
                        />
                      </div>
                      {isUploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                          <p className="text-sm text-muted-foreground">
                            <bdi>{effectiveLocale === 'ar' ? 'جاري رفع الملفات...' : 'Uploading files...'}</bdi>
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              <bdi>
                                {isDragActive
                                  ? (effectiveLocale === 'ar' ? 'اسقط الملفات هنا' : 'Drop files here')
                                  : (effectiveLocale === 'ar' ? 'اسحب وأسقط الملفات أو انقر للاختيار' : t('dragDropText'))
                                }
                              </bdi>
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              <bdi>
                                <span className="hidden sm:inline">
                                  {effectiveLocale === 'ar' ? 'يمكنك سحب الملفات وإسقاطها هنا أو النقر للاختيار' : 'Drag files here or click to select'}
                                </span>
                                <span className="sm:hidden">
                                  {effectiveLocale === 'ar' ? 'اضغط لاختيار الملفات' : 'Click to select files'}
                                </span>
                              </bdi>
                            </p>
                          </div>
                          <div className="flex flex-col items-center gap-1 text-xs text-gray-400">
                            <p><bdi>{t('maxSizeText', { maxSize })}</bdi></p>
                            {maxFiles && <p><bdi>Max files: {maxFiles}</bdi></p>}
                            <p><bdi>{t('filesValidatedSecurity')} (Production Grade)</bdi></p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </Dropzone>

              {/* Enhanced File Preview Grid */}
              {selectedFiles?.length > 0 && !hideDefaultPreview && (
                <div className="w-full rounded-lg border p-3 bg-gray-50/50">
                  <div
                    className={cn(
                      "grid gap-3",
                      // Single image: make it larger and centered
                      selectedFiles.length === 1 && maxFiles === 1
                        ? "grid-cols-1 max-w-sm mx-auto"
                        : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                    )}
                  >
                    {selectedFiles.map((fileData, i) => {
                      return (
                        <div
                          key={fileData.fileId}
                          className={cn(
                            "group relative w-full overflow-hidden rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow",
                            // Single image: use better aspect ratio
                            selectedFiles.length === 1 && maxFiles === 1
                              ? "aspect-[4/3]"
                              : "aspect-square"
                          )}
                        >
                          {isImageFile(fileData.file) ? (
                            <>
                              <Image
                                src={fileData.previewUrl}
                                alt={fileData.file.name}
                                className="object-cover transition-all group-hover:scale-105"
                                fill
                                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                              />
                            </>
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-100">
                              {getFileIcon(fileData.file)}
                            </div>
                          )}

                          {/* Delete button overlay */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="h-8 w-8 shadow-lg"
                              onClick={() => removeFile(fileData)}
                              disabled={fileData.retrying}
                            >
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">
                                {effectiveLocale === 'ar' ? `حذف ${fileData.file.name}` : `Delete ${fileData.file.name}`}
                              </span>
                            </Button>
                          </div>


                          {/* File info */}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2">
                            <p className="truncate text-xs text-white">
                              <bdi>{fileData.file.name}</bdi>
                            </p>
                            <p className="text-xs text-white/80" dir="ltr">
                              {formatFileSize(fileData.file.size)}
                            </p>
                            
                            
                            {/* Error display */}
                            {fileData.error && (
                              <div className="mt-1">
                                <div className="flex items-center gap-1">
                                  {getErrorIcon(fileData.retryState?.failureType)}
                                  <p className="text-xs text-red-400">
                                    <bdi>{fileData.error}</bdi>
                                  </p>
                                </div>
                                {fileData.canRetry && !fileData.retrying && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRetryUpload(fileData)}
                                    className="mt-1 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 border-blue-400/20"
                                  >
                                    <RotateCcw className="h-3 w-3 mr-1" />
                                    <bdi>{getRetryButtonText(fileData)}</bdi>
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* File summary */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>
                        <bdi>
                          {selectedFiles.length} {selectedFiles.length === 1 ? 
                            (effectiveLocale === 'ar' ? 'ملف' : 'file') : 
                            (effectiveLocale === 'ar' ? 'ملف' : 'files')
                          }
                        </bdi>
                      </span>
                      <span dir="ltr">
                        <bdi>
                          Total: {formatFileSize(selectedFiles.reduce((acc, file) => acc + file.file.size, 0))}
                        </bdi>
                      </span>
                    </div>
                  </div>
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