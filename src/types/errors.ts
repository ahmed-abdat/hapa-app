/**
 * Comprehensive error handling types
 * Replaces generic 'unknown' and 'any' error types
 */

// Base error interface
export interface BaseError {
  message: string
  code: string
  timestamp: Date
  context?: Record<string, any>
}

// Application-specific error types
export interface ValidationError extends BaseError {
  code: 'VALIDATION_ERROR'
  field?: string
  expected?: string
  received?: string
}

export interface FileError extends BaseError {
  code: 'FILE_ERROR'
  filename?: string
  filesize?: number
  mimetype?: string
  operation: 'upload' | 'validation' | 'processing' | 'storage'
}

export interface NetworkError extends BaseError {
  code: 'NETWORK_ERROR'
  status?: number
  endpoint?: string
  method?: string
}

export interface DatabaseError extends BaseError {
  code: 'DATABASE_ERROR'
  query?: string
  table?: string
  operation: 'create' | 'read' | 'update' | 'delete'
}

export interface AuthError extends BaseError {
  code: 'AUTH_ERROR'
  userId?: string
  action: 'login' | 'logout' | 'token_refresh' | 'permission_check'
}

export interface PayloadError extends BaseError {
  code: 'PAYLOAD_ERROR'
  collection?: string
  operation: 'create' | 'read' | 'update' | 'delete' | 'find'
}

// Union type for all application errors
export type AppError = 
  | ValidationError
  | FileError
  | NetworkError
  | DatabaseError
  | AuthError
  | PayloadError

// Error categorization
export type ErrorCategory = 
  | 'validation'
  | 'network'
  | 'server'
  | 'security'
  | 'unknown'

// Error handling result types
export interface ErrorResult {
  error: AppError
  category: ErrorCategory
  isRetryable: boolean
  userMessage: string
}

// Logger context types
export interface LogContext {
  userId?: string
  sessionId?: string
  requestId?: string
  userAgent?: string
  ip?: string
  url?: string
  method?: string
  component?: string
  action?: string
  metadata?: Record<string, any>
}

// File validation specific errors
export interface FileValidationError extends FileError {
  securityFlags?: string[]
  detectedType?: string
  expectedTypes?: string[]
}

// Form submission errors
export interface FormSubmissionError extends BaseError {
  code: 'FORM_SUBMISSION_ERROR'
  formType?: 'complaint' | 'report'
  fieldErrors?: ValidationError[]
  uploadErrors?: FileError[]
}

// API error response format
export interface ApiErrorResponse {
  success: false
  error: {
    message: string
    code: string
    details?: Record<string, any>
  }
  timestamp: string
  requestId?: string
}

// Error severity levels
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'

// Enhanced error with severity and tracking
export interface TrackedError extends BaseError {
  id: string
  severity: ErrorSeverity
  resolved: boolean
  reportedAt: Date
  resolvedAt?: Date
  occurrenceCount: number
  affectedUsers?: string[]
  tags?: string[]
}

// Error handler function types
export type ErrorHandler<T = any> = (error: AppError, context?: LogContext) => T
export type AsyncErrorHandler<T = any> = (error: AppError, context?: LogContext) => Promise<T>

// Recovery action types
export interface RecoveryAction {
  type: 'retry' | 'fallback' | 'redirect' | 'reset'
  label: string
  action: () => void | Promise<void>
}

export interface ErrorWithRecovery extends BaseError {
  recoveryActions?: RecoveryAction[]
  userMessage: string
  technicalMessage?: string
}

// Type guards for error identification
export const isValidationError = (error: any): error is ValidationError =>
  error?.code === 'VALIDATION_ERROR'

export const isFileError = (error: any): error is FileError =>
  error?.code === 'FILE_ERROR'

export const isNetworkError = (error: any): error is NetworkError =>
  error?.code === 'NETWORK_ERROR'

export const isDatabaseError = (error: any): error is DatabaseError =>
  error?.code === 'DATABASE_ERROR'

export const isAuthError = (error: any): error is AuthError =>
  error?.code === 'AUTH_ERROR'

export const isPayloadError = (error: any): error is PayloadError =>
  error?.code === 'PAYLOAD_ERROR'

export const isAppError = (error: any): error is AppError =>
  isValidationError(error) ||
  isFileError(error) ||
  isNetworkError(error) ||
  isDatabaseError(error) ||
  isAuthError(error) ||
  isPayloadError(error)

// Error utilities
export const createError = <T extends AppError>(
  type: T['code'],
  message: string,
  context?: Partial<Omit<T, 'code' | 'message' | 'timestamp'>>
): T => ({
  code: type,
  message,
  timestamp: new Date(),
  ...context,
} as T)

export const formatErrorForUser = (error: AppError): string => {
  switch (error.code) {
    case 'VALIDATION_ERROR':
      return `Erreur de validation: ${error.message}`
    case 'FILE_ERROR':
      return `Erreur de fichier: ${error.message}`
    case 'NETWORK_ERROR':
      return `Erreur de connexion: ${error.message}`
    case 'DATABASE_ERROR':
      return `Erreur de base de données: ${error.message}`
    case 'AUTH_ERROR':
      return `Erreur d'authentification: ${error.message}`
    case 'PAYLOAD_ERROR':
      return `Erreur système: ${error.message}`
  }
}