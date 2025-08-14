/**
 * Type definitions for form handling and media submissions
 * Replaces generic 'any' types with specific interfaces
 */

import type { Locale } from '@/utilities/locale'

// Base types for form handling
export interface FileUploadResult {
  url: string
  filename: string
  size: number
  type: string
  success: boolean
}

export interface FileUploadError {
  filename: string
  error: string
  code: 'VALIDATION_ERROR' | 'UPLOAD_ERROR' | 'SIZE_ERROR' | 'TYPE_ERROR'
}

export interface FormSubmissionResult {
  success: boolean
  id?: string
  errors?: string[]
  uploadResults?: FileUploadResult[]
  uploadErrors?: FileUploadError[]
}

// Media content submission types
export interface ComplainantInfo {
  fullName: string
  gender: 'male' | 'female' | 'other'
  country: string
  emailAddress: string
  phoneNumber?: string
  whatsappNumber?: string
  profession?: string
  relationshipToContent: 'viewer' | 'parent' | 'educator' | 'journalist' | 'other'
}

export interface ContentInfo {
  mediaType: 'tv' | 'radio' | 'website' | 'social' | 'print' | 'other'
  mediaTypeOther?: string
  specificChannel?: string
  programName: string
  broadcastDateTime?: string
  linkScreenshot?: string
  screenshotFiles?: FileUploadResult[]
}

export interface MediaContentSubmission {
  id: string
  formType: 'complaint' | 'report'
  submittedAt: string
  locale: Locale
  submissionStatus: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  
  // Optional complainant info (only for complaints)
  complainantInfo?: ComplainantInfo
  
  // Content information
  contentInfo: ContentInfo
  
  // Reasons and description
  reasons: Array<{ reason: string }>
  reasonOther?: string
  description: string
  
  // Attachments
  attachmentTypes?: Array<{ type: string }>
  attachmentOther?: string
  attachmentFiles?: FileUploadResult[]
  
  // Admin fields
  adminNotes?: string
  resolution?: {
    resolvedAt?: string
    resolvedBy?: string
    resolutionNotes?: string
    actionTaken?: string
  }
}

// Form field validation types
export interface FormFieldError {
  field: string
  message: string
  code: string
}

export interface FormValidationResult {
  isValid: boolean
  errors: FormFieldError[]
  data?: Partial<MediaContentSubmission>
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  errors?: string[]
  message?: string
}

// File upload specific types
export interface UploadStats {
  expected: number
  successful: number
  failed: number
  totalSize: number
}

export interface FileValidationResult {
  valid: boolean
  detectedType?: {
    mime: string
    extension: string
  }
  error?: string
  securityFlags?: string[]
}

// Form component prop types
export interface FormFieldProps {
  name: string
  label: string
  required?: boolean
  error?: string
  disabled?: boolean
  locale: Locale
}

export interface FileUploadFieldProps extends FormFieldProps {
  accept?: string
  maxSize?: number
  maxFiles?: number
  category?: 'image' | 'video' | 'audio' | 'document'
  onUpload?: (files: FileUploadResult[]) => void
  onError?: (errors: FileUploadError[]) => void
}

// Admin dashboard types
export interface SubmissionFilterOptions {
  status?: MediaContentSubmission['submissionStatus']
  priority?: MediaContentSubmission['priority']
  formType?: MediaContentSubmission['formType']
  dateFrom?: string
  dateTo?: string
  search?: string
}

export interface SubmissionStats {
  total: number
  byStatus: Record<MediaContentSubmission['submissionStatus'], number>
  byPriority: Record<MediaContentSubmission['priority'], number>
  byFormType: Record<MediaContentSubmission['formType'], number>
  recentCount: number
}