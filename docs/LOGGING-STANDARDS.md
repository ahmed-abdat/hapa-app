# HAPA Logging Standards

## Overview

This document defines logging standards for the HAPA website to ensure consistent, secure, and maintainable logging practices across the codebase.

## Production Logging Rules

### ✅ DO - Use Structured Logger
```typescript
import { logger } from '@/utilities/logger'

// ✅ Good - Structured logging with context
logger.error('Form validation failed', error, {
  component: 'MediaFormSubmit',
  action: 'validation',
  formType: 'complaint',
  metadata: { fieldErrors: errors }
})

// ✅ Good - API logging
logger.api.response(429, '/api/media-forms/submit', {
  requestId: headers.get('x-request-id'),
  metadata: { rateLimitExceeded: true }
})
```

### ❌ DON'T - Direct Console Usage
```typescript
// ❌ Bad - No console in production
console.log('User submitted form')
console.error('Something went wrong')

// ❌ Bad - Unstructured logging
console.log('DEBUG:', data)
```

## Logging Levels

### Production Environment
- **ERROR**: Always logged - system failures, validation errors, security issues
- **WARN**: Always logged - performance issues, deprecated usage, rate limiting
- **INFO**: Forced only - important business events (form submissions, auth)
- **DEBUG**: Never logged - filtered out in production

### Development Environment
- **All levels active** - full debugging capability
- **Console output** - human-readable format with emojis
- **Stack traces** - full error context

## Context Standards

### Required Context Fields
```typescript
interface LogContext {
  component: string    // Component/module name
  action: string      // Specific action being performed
  
  // Optional but recommended
  requestId?: string  // For request tracing
  userId?: string     // For user action tracking
  formType?: string   // For form operations
  metadata?: object   // Additional structured data
}
```

### Component Naming Convention
- **API**: Server-side API routes
- **Form**: Form validation and submission
- **File**: File upload and processing
- **Database**: Database operations
- **Cache**: Caching operations
- **Performance**: Performance monitoring
- **Security**: Security-related events

## Development Logging

### Environment Wrapping
```typescript
// ✅ Acceptable - Development-only debugging
if (process.env.NODE_ENV === 'development') {
  logger.debug('File compression details', {
    component: 'FileUpload',
    action: 'compression',
    metadata: { 
      originalSize: file.size,
      compressedSize: compressed.size,
      savings: calculateSavings(file.size, compressed.size)
    }
  })
}
```

### Descriptive Prefixes
Use emojis and clear prefixes for development debugging:
- 🔍 **Investigation/Analysis**
- ❌ **Errors**
- ✅ **Success states**
- ⚠️ **Warnings**
- 🔄 **Processing/Loading**
- 📊 **Data/Metrics**

## Error Boundaries

### Structured Error Logging
```typescript
// ✅ Good - Error boundary logging
const errorId = logger.error('React error boundary triggered', error, {
  component: 'ErrorBoundary',
  action: 'errorCaught',
  metadata: {
    errorBoundary: 'GlobalError',
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  }
})

// Show user-friendly error ID
setErrorId(errorId)
```

### User-Facing Error IDs
- Generate unique error IDs for support: `ERR_A1B2C3D4`
- Include in user error messages
- Log full context with error ID for debugging

## Security Logging

### Rate Limiting Events
```typescript
logger.warn('Rate limit exceeded', undefined, {
  component: 'RateLimiter',
  action: 'limitExceeded',
  metadata: { 
    clientIP: '192.168.1.1',
    endpoint: '/api/media-forms/submit',
    limit: 5,
    remaining: 0,
    resetTime: new Date().toISOString()
  }
})
```

### Security Events
```typescript
logger.error('File signature validation failed', undefined, {
  component: 'FileValidation',
  action: 'securityViolation',
  metadata: {
    filename: file.name,
    detectedType: 'executable',
    expectedType: 'image',
    fileSize: file.size
  }
})
```

## Performance Logging

### Slow Operations
```typescript
logger.performance.warning('Database query slow', duration, 1000, {
  component: 'Database',
  action: 'query',
  metadata: {
    collection: 'mediaContentSubmissions',
    queryType: 'find',
    resultCount: results.length
  }
})
```

### File Operations
```typescript
logger.file.processing('compression', filename, {
  metadata: {
    originalSize: original.size,
    compressedSize: compressed.size,
    duration: processingTime,
    savings: savingsPercentage
  }
})
```

## Migration Guidelines

### Replacing Console Statements

1. **Identify** console usage category:
   - Production critical (replace immediately)
   - Development debugging (wrap with environment check)
   - Error boundaries (enhance with structured logging)

2. **Replace** with appropriate logger method:
   ```typescript
   // Before
   console.error('Form submission failed:', error)
   
   // After
   logger.form.error('Form submission failed', error, {
     formType: 'complaint',
     metadata: { validationErrors: errors }
   })
   ```

3. **Add context** for debugging:
   - Component name
   - Action being performed
   - Relevant metadata

## Best Practices

### DO
- Use the logger utility for all logging
- Include meaningful context
- Use appropriate log levels
- Generate error IDs for user support
- Wrap development logging with environment checks
- Log security events and rate limiting
- Include performance metrics for slow operations

### DON'T
- Use console.* directly in source code
- Log sensitive information (passwords, tokens, PII)
- Log large objects without trimming
- Use console in production code
- Skip error context
- Log without component/action context

## Monitoring Integration

### Production Monitoring
- Structured logs are ready for log aggregation
- Error IDs enable user support correlation
- Security events can trigger alerts
- Performance metrics can drive optimization

### Development Debugging
- Human-readable console output
- Full stack traces and error context
- Performance timing information
- File processing details

---

**Last Updated**: Phase 2 - Code Quality Improvements  
**Review Cycle**: Update when logging practices change