/**
 * Enhanced structured logging utility for HAPA website
 * Environment-aware with production safety and comprehensive context support
 */

import { nanoid } from 'nanoid'

// Environment detection
const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

// Logging levels for production filtering
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

// Enhanced context interface for structured logging
export interface LogContext {
  // Request/Session context
  userId?: string
  sessionId?: string
  requestId?: string
  
  // Application context
  component?: string
  action?: string
  formType?: string
  locale?: string
  
  // File/Media context
  filename?: string
  fileSize?: number
  operation?: string
  
  // Error context
  errorId?: string
  errorCode?: string
  stack?: string
  
  // Performance context
  duration?: number
  memoryUsage?: number
  
  // Additional metadata
  metadata?: Record<string, any>
  
  // Validation context
  validationId?: string
  fileName?: string
  declaredMime?: string
  detectedMime?: string
  detectedType?: any
  fileCategory?: string
  bufferSize?: number
  expectedDepth?: number
  securityFlags?: string[]
  validationDepth?: number
  
  // API context
  clientIP?: string
  limit?: number
  remaining?: number
  
  // Cache context  
  page?: number
}

// Enhanced logger with structured logging
export const logger = {
  /**
   * Generate unique error ID for user support
   */
  generateErrorId: (): string => {
    return `ERR_${nanoid(8).toUpperCase()}`
  },

  /**
   * Log debug messages (development only)
   */
  debug: (message: string, context?: LogContext) => {
    if (isDevelopment) {
      const logEntry = {
        level: 'DEBUG',
        timestamp: new Date().toISOString(),
        message,
        ...context,
      }
      console.debug('🐛 [DEBUG]', message, context || '')
    }
  },

  /**
   * Log info messages (development only, unless forced)
   */
  info: (message: string, context?: LogContext, force = false) => {
    if (isDevelopment || force) {
      const logEntry = {
        level: 'INFO',
        timestamp: new Date().toISOString(),
        message,
        ...context,
      }
      console.log('ℹ️ [INFO]', message, context || '')
    }
  },

  /**
   * Log warning messages (development + production warnings)
   */
  warn: (message: string, context?: LogContext) => {
    const logEntry = {
      level: 'WARN',
      timestamp: new Date().toISOString(),
      message,
      ...context,
    }
    
    if (isDevelopment) {
      console.warn('⚠️ [WARN]', message, context || '')
    } else {
      // Production: structured logging only
      console.warn(JSON.stringify(logEntry))
    }
  },

  /**
   * Log error messages (always logged with structured format)
   */
  error: (message: string, error?: Error | any, context?: LogContext) => {
    const errorId = context?.errorId || logger.generateErrorId()
    
    const logEntry = {
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      message,
      errorId,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: isDevelopment ? error.stack : undefined,
      } : error,
      ...context,
    }

    if (isDevelopment) {
      console.error('❌ [ERROR]', message, { errorId, ...context }, error)
    } else {
      // Production: structured JSON logging
      console.error(JSON.stringify(logEntry))
    }
    
    return errorId
  },

  /**
   * Log API operations with request context
   */
  api: {
    request: (method: string, path: string, context?: LogContext) => {
      logger.debug(`🔌 API ${method} ${path}`, {
        component: 'API',
        action: 'request',
        ...context,
      })
    },
    
    response: (status: number, path: string, context?: LogContext) => {
      const level = status >= 400 ? 'warn' : 'debug'
      logger[level](`📡 API Response ${status} for ${path}`, {
        component: 'API',
        action: 'response',
        metadata: { status },
        ...context,
      })
    },
    
    error: (message: string, error: Error, context?: LogContext) => {
      return logger.error(`🚨 API Error: ${message}`, error, {
        component: 'API',
        action: 'error',
        ...context,
      })
    },
  },

  /**
   * Log form operations with validation context
   */
  form: {
    submission: (formType: string, context?: LogContext) => {
      logger.info(`🚀 Form submission started: ${formType}`, {
        component: 'Form',
        action: 'submission_start',
        formType,
        ...context,
      })
    },
    
    validation: (formType: string, isValid: boolean, errors?: Record<string, any>, context?: LogContext) => {
      if (isValid) {
        logger.debug(`✅ Form validation passed: ${formType}`, {
          component: 'Form',
          action: 'validation_success',
          formType,
          ...context,
        })
      } else {
        logger.warn(`❌ Form validation failed: ${formType}`, {
          component: 'Form',
          action: 'validation_failed',
          formType,
          metadata: { errors },
          ...context,
        })
      }
    },
    
    success: (formType: string, id?: string, context?: LogContext) => {
      logger.info(`✅ Form submission successful: ${formType}`, {
        component: 'Form',
        action: 'submission_success',
        formType,
        metadata: { submissionId: id },
        ...context,
      })
    },
  },

  /**
   * Log file operations with metadata
   */
  file: {
    upload: (filename: string, size: number, context?: LogContext) => {
      logger.debug(`📁 File upload: ${filename}`, {
        component: 'File',
        action: 'upload',
        filename,
        fileSize: size,
        ...context,
      })
    },
    
    processing: (operation: string, filename: string, context?: LogContext) => {
      logger.debug(`🔄 File processing: ${operation}`, {
        component: 'File',
        action: 'processing',
        operation,
        filename,
        ...context,
      })
    },
    
    error: (operation: string, filename: string, error: Error, context?: LogContext) => {
      return logger.error(`❌ File operation failed: ${operation}`, error, {
        component: 'File',
        action: 'error',
        operation,
        filename,
        ...context,
      })
    },
  },

  /**
   * Log database operations
   */
  database: {
    query: (operation: string, collection?: string, context?: LogContext) => {
      logger.debug(`🗄️ Database ${operation}`, {
        component: 'Database',
        action: operation,
        metadata: { collection },
        ...context,
      })
    },
    
    error: (operation: string, error: Error, context?: LogContext) => {
      return logger.error(`❌ Database error: ${operation}`, error, {
        component: 'Database',
        action: 'error',
        ...context,
      })
    },
  },

  /**
   * Log performance metrics
   */
  performance: {
    measure: (name: string, duration: number, context?: LogContext) => {
      logger.debug(`⚡ Performance: ${name}`, {
        component: 'Performance',
        action: 'measure',
        duration,
        metadata: { metric: name },
        ...context,
      })
    },
    
    warning: (name: string, duration: number, threshold: number, context?: LogContext) => {
      logger.warn(`🐌 Performance warning: ${name} took ${duration}ms (threshold: ${threshold}ms)`, {
        component: 'Performance',
        action: 'slow_operation',
        duration,
        metadata: { metric: name, threshold },
        ...context,
      })
    },
  },

  /**
   * Log cache operations
   */
  cache: {
    hit: (key: string, context?: LogContext) => {
      logger.debug(`💾 Cache hit: ${key}`, {
        component: 'Cache',
        action: 'hit',
        metadata: { key },
        ...context,
      })
    },
    
    miss: (key: string, context?: LogContext) => {
      logger.debug(`💸 Cache miss: ${key}`, {
        component: 'Cache',
        action: 'miss',
        metadata: { key },
        ...context,
      })
    },
    
    error: (operation: string, key: string, error: Error, context?: LogContext) => {
      return logger.error(`❌ Cache error: ${operation}`, error, {
        component: 'Cache',
        action: 'error',
        metadata: { key },
        ...context,
      })
    },
  },

  // Legacy compatibility methods
  log: (message: string, data?: Record<string, any>) => {
    logger.debug(message, { metadata: data })
  },

  success: (message: string, id?: string) => {
    logger.info(message, { metadata: { id } })
  },

  formSubmission: (formType: string, data?: Record<string, any>) => {
    logger.form.submission(formType, { metadata: data })
  },

  apiResponse: (status: number, data?: Record<string, any>) => {
    const path = 'unknown'
    logger.api.response(status, path, { metadata: data })
  },

  fileOperation: (operation: string, filename?: string) => {
    if (filename) {
      logger.file.processing(operation, filename)
    } else {
      logger.debug(`📁 ${operation}`, { component: 'File', action: operation })
    }
  },
}