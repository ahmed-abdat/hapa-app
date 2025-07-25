export interface FormSubmissionData {
  id?: string
  formType: 'contact' | 'complaint' | 'document-request'
  submissionData: Record<string, any>
  status: 'new' | 'reviewed' | 'in-progress' | 'responded' | 'closed'
  locale: 'fr' | 'ar'
  createdAt?: string
  updatedAt?: string
  userAgent?: string
  ipAddress?: string
  adminNotes?: string
  reviewedBy?: string
  reviewedAt?: string
}

export interface FormFieldProps {
  name: string
  label: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export interface FormSelectOption {
  value: string
  label: string
}

export interface FormSelectProps extends FormFieldProps {
  options: FormSelectOption[]
}

export interface FormTextareaProps extends FormFieldProps {
  rows?: number
  maxLength?: number
}

export interface FormFileUploadProps extends FormFieldProps {
  accept?: string
  maxSize?: number
  multiple?: boolean
}

export interface FormSubmissionResponse {
  success: boolean
  message: string
  submissionId?: string
  errors?: Record<string, string[]>
}

export interface FormConfig {
  title: string
  description: string
  submitButtonText: string
  successMessage: string
  errorMessage: string
}

export interface FormTranslations {
  fr: FormConfig
  ar: FormConfig
}