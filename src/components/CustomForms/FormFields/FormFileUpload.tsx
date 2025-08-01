'use client'

import React, { useState, useRef } from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { useLocale, useTranslations } from 'next-intl'
import { Upload, X, FileImage, FileText, FileVideo, File } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { type Locale } from '@/utilities/locale'
import { FormFieldProps } from '../types'

interface FormFileUploadProps extends Omit<FormFieldProps, 'placeholder'> {
  accept?: string
  maxSize?: number // in MB
  multiple?: boolean
  locale?: 'fr' | 'ar'
}

interface UploadedFile {
  file: File
  url: string
  uploading: boolean
  uploaded: boolean
  error?: string
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
  ...props
}: FormFileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
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
    if (type.startsWith('image/')) return <FileImage className="h-5 w-5" />
    if (type.startsWith('video/')) return <FileVideo className="h-5 w-5" />
    if (type.includes('pdf') || type.includes('document')) return <FileText className="h-5 w-5" />
    return <File className="h-5 w-5" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateFile = (file: File): string | null => {
    // Size validation
    if (file.size > maxSize * 1024 * 1024) {
      return t('fileTooLarge')
    }

    // Type validation (basic)
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
      return t('unsupportedFileType')
    }

    return null
  }

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/media/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    const result = await response.json()
    return result.url
  }

  const handleFileSelect = async (selectedFiles: FileList) => {
    const newFiles: UploadedFile[] = []

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]
      const validationError = validateFile(file)

      if (validationError) {
        newFiles.push({
          file,
          url: '',
          uploading: false,
          uploaded: false,
          error: validationError
        })
        continue
      }

      newFiles.push({
        file,
        url: URL.createObjectURL(file),
        uploading: true,
        uploaded: false
      })
    }

    if (!multiple) {
      setFiles(newFiles.slice(0, 1))
    } else {
      setFiles(prev => [...prev, ...newFiles])
    }

    // Upload files
    for (let i = 0; i < newFiles.length; i++) {
      const fileData = newFiles[i]
      if (fileData.error) continue

      try {
        const uploadedUrl = await uploadFile(fileData.file)
        setFiles(prev => prev.map(f => 
          f.file === fileData.file 
            ? { ...f, url: uploadedUrl, uploading: false, uploaded: true }
            : f
        ))
      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.file === fileData.file 
            ? { ...f, uploading: false, uploaded: false, error: t('uploadFailed') }
            : f
        ))
      }
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

  const removeFile = (fileToRemove: UploadedFile) => {
    setFiles(prev => prev.filter(f => f.file !== fileToRemove.file))
    // Revoke object URL to prevent memory leaks
    if (fileToRemove.url.startsWith('blob:')) {
      URL.revokeObjectURL(fileToRemove.url)
    }
  }

  const uploadedUrls = files.filter(f => f.uploaded).map(f => f.url)

  // Update form field when uploaded URLs change
  React.useEffect(() => {
    if (multiple) {
      setValue(name, uploadedUrls)
    } else {
      setValue(name, uploadedUrls[0] || '')
    }
  }, [uploadedUrls, multiple, name, setValue])

  return (
    <div className={`space-y-2 ${className}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Label htmlFor={name} className="text-sm font-medium text-gray-700">
        <bdi>
          {label}
          {required && <span className="text-red-500 ms-1">*</span>}
        </bdi>
      </Label>

      <Controller
        name={name}
        control={control}
        render={({ field }) => (
            <div className="space-y-3">
              {/* Upload Area */}
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200",
                  "hover:border-primary/50 hover:bg-primary/5",
                  isDragOver && "border-primary bg-primary/10",
                  error && "border-red-500 bg-red-50",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className={cn("h-8 w-8 mx-auto mb-2 text-gray-400", isRTL && "scale-x-[-1]")} />
                <p className="text-sm text-gray-600 mb-2">
                  <bdi>{t('dragDropText')}</bdi>
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  <bdi>{t('maxSizeText')} ({maxSize}MB)</bdi>
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
                      {getFileIcon(fileData.file)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          <bdi>{fileData.file.name}</bdi>
                        </p>
                        <p className="text-xs text-gray-500">
                          <bdi>{formatFileSize(fileData.file.size)}</bdi>
                        </p>
                        {fileData.error && (
                          <p className="text-xs text-red-600 mt-1">
                            <bdi>{fileData.error}</bdi>
                          </p>
                        )}
                        {fileData.uploading && (
                          <p className="text-xs text-blue-600 mt-1">
                            <bdi>{t('uploading')}</bdi>
                          </p>
                        )}
                        {fileData.uploaded && (
                          <p className="text-xs text-green-600 mt-1">
                            <bdi>{t('uploadSuccess')}</bdi>
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(fileData)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
        )}
      />

      {error && (
        <p className="text-sm text-red-600 mt-1">
          <bdi>{error}</bdi>
        </p>
      )}
    </div>
  )
}