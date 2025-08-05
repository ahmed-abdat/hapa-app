import type { z } from 'zod'
import type { 
  MediaTypeEnum, 
  TVChannelEnum, 
  RadioStationEnum, 
  GenderEnum,
  ReportReasonEnum,
  AttachmentTypeEnum,
  RelationshipToContentEnum
} from '@/lib/validations/media-forms'

// Infer types from Zod enums for better type safety
export type MediaType = z.infer<typeof MediaTypeEnum>
export type TVChannel = z.infer<typeof TVChannelEnum>
export type RadioStation = z.infer<typeof RadioStationEnum>
export type Gender = z.infer<typeof GenderEnum>
export type ReportReason = z.infer<typeof ReportReasonEnum>
export type AttachmentType = z.infer<typeof AttachmentTypeEnum>
export type RelationshipToContent = z.infer<typeof RelationshipToContentEnum>

// Content Information interface with proper typing
export interface ContentInformation {
  mediaType: MediaType
  mediaTypeOther?: string
  tvChannel?: TVChannel
  tvChannelOther?: string
  radioStation?: RadioStation
  radioStationOther?: string
  programName: string
  broadcastDateTime: string
  linkScreenshot?: string
  screenshotFiles?: string[]
}

// Complainant Information interface
export interface ComplainantInformation {
  fullName: string
  gender: Gender
  country: string
  emailAddress: string
  phoneNumber: string
  whatsappNumber?: string
  profession?: string
  relationshipToContent?: RelationshipToContent
  relationshipOther?: string
}

// Report Reason interface
export interface ReportReasonInfo {
  reasons: ReportReason[]
  reasonOther?: string
}

// Attachments interface
export interface AttachmentInfo {
  attachmentTypes?: AttachmentType[]
  attachmentOther?: string
  attachmentFiles?: string[]
}

// Media Content Report Form Data
export interface MediaContentReportFormData extends 
  ContentInformation, 
  ReportReasonInfo, 
  AttachmentInfo {
  description: string
}

// Media Content Complaint Form Data
export interface MediaContentComplaintFormData extends 
  ComplainantInformation,
  ContentInformation, 
  ReportReasonInfo, 
  AttachmentInfo {
  description: string
  acceptDeclaration: boolean
  acceptConsent: boolean
}

// Form submission data with metadata
export interface FormSubmissionBase {
  formType: 'report' | 'complaint'
  submittedAt: string
  locale: 'fr' | 'ar'
}

export interface MediaContentReportSubmission extends 
  MediaContentReportFormData, 
  FormSubmissionBase {
  formType: 'report'
}

export interface MediaContentComplaintSubmission extends 
  MediaContentComplaintFormData, 
  FormSubmissionBase {
  formType: 'complaint'
}

// API Response types
export interface FormSubmissionResponse {
  success: boolean
  message: string
  submissionId?: string
  details?: string[]
  uploadStats?: {
    screenshots?: number
    attachments?: number
    totalTime?: number
    expected?: number
    successful?: number
    failed?: number
  }
  errorId?: string
}

// File upload API response
export interface FileUploadResponse {
  success: boolean
  url?: string
  id?: string
  filename?: string
  message?: string
}

// Submission status for Payload CMS
export type SubmissionStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed'
export type SubmissionPriority = 'low' | 'medium' | 'high' | 'urgent'

// Payload CMS collection data structure
export interface PayloadSubmissionData {
  formType: 'report' | 'complaint'
  submittedAt: string
  locale: 'fr' | 'ar'
  submissionStatus: SubmissionStatus
  priority: SubmissionPriority
  complainantInfo?: {
    fullName: string
    gender: string
    country: string
    emailAddress: string
    phoneNumber: string
    whatsappNumber: string
    profession: string
    relationshipToContent: string
  }
  contentInfo: {
    mediaType: string
    mediaTypeOther: string
    specificChannel: string
    programName: string
    broadcastDateTime: string
    linkScreenshot: string
    screenshotFiles: Array<{ url: string }>
  }
  reasons: Array<{ reason: string }>
  reasonOther: string
  description: string
  attachmentTypes: Array<{ type: string }>
  attachmentOther: string
  attachmentFiles: Array<{ url: string }>
}

// Form field component props
export interface FormFieldProps {
  name: string
  label: string
  required?: boolean
  disabled?: boolean
  className?: string
  locale?: 'fr' | 'ar'
}

// Statistics interfaces for admin dashboard
export interface SubmissionStatistics {
  totalSubmissions: number
  reportSubmissions: number
  complaintSubmissions: number
  pendingSubmissions: number
  resolvedSubmissions: number
  byStatus: Record<SubmissionStatus, number>
  byPriority: Record<SubmissionPriority, number>
  byMediaType: Record<MediaType, number>
  recentSubmissions: Array<{
    id: string
    formType: 'report' | 'complaint'
    submittedAt: string
    status: SubmissionStatus
    priority: SubmissionPriority
  }>
}

// RichText node types for proper typing
export interface RichTextCodeNode {
  node: {
    fields: {
      language?: string
      code: string
    }
  }
}

export interface RichTextCTANode {
  node: {
    fields: {
      richText?: unknown
      links?: unknown[]
    }
  }
}