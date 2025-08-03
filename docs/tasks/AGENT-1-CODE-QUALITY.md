# Agent 1: Code Quality Specialist Tasks 🧹

**Agent**: Code Quality Specialist  
**Focus**: Console logging cleanup and code quality improvements  
**Estimated Time**: 4-6 hours  
**Priority**: High

---

## 📊 Current Status

### ✅ Already Improved
- TypeScript compilation errors fixed
- Some console.log statements already wrapped with development checks

### 🎯 Remaining Work
- **79 console occurrences** across 18 files need review
- Environment-based logging controls needed
- Structured logging implementation required

---

## 📋 Task List

### Task 1: Console Logging Audit (1 hour)

#### 1.1 Categorize Console Usage
**Goal**: Classify all 79 console occurrences

**Files to Audit**:
```
Production Critical (Remove/Replace):
- src/app/(payload)/api/media-forms/submit/route.ts (4 occurrences) 
- src/collections/MediaContentSubmissions/index.ts (1 occurrence)
- src/components/admin/MediaSubmissionsDashboard/SubmissionsTable.tsx (2 occurrences)
- src/components/admin/MediaSubmissionsDashboard/index.tsx (4 occurrences)

Development Logging (Environment-Conditional):
- src/lib/file-upload.ts (13 occurrences)
- src/components/CustomForms/MediaContentReportForm/index.tsx (7 occurrences)
- src/utilities/cached-queries.ts (4 occurrences)
- src/lib/cache/enhanced-cache.ts (3 occurrences)

Error Boundaries (Keep/Improve):
- src/app/(frontend)/error.tsx (3 occurrences)
- src/app/(frontend)/global-error.tsx (3 occurrences)
- src/app/(frontend)/[locale]/error.tsx (3 occurrences)
- src/components/ErrorBoundary/index.tsx (1 occurrence)
```

**Action Items**:
- [ ] Create spreadsheet of all console usage
- [ ] Classify each as: Remove, Replace with logger, Environment-wrap, Keep
- [ ] Priority ranking: 1=Production Critical, 2=Development, 3=Error Boundaries

#### 1.2 Create Logging Standards
**Goal**: Document logging best practices

**Create**: `docs/LOGGING-STANDARDS.md`
```markdown
# HAPA Logging Standards

## Production Logging
- Use `logger.error()` for errors
- Use `logger.warn()` for warnings  
- Use `logger.info()` for important events
- NO console.log in production

## Development Logging
- Wrap with `if (process.env.NODE_ENV === 'development')`
- Use descriptive prefixes: 🔍, ❌, ✅, ⚠️
- Clean up before production deployment

## Error Boundaries
- Use structured error logging
- Include error context and stack traces
- Log user-facing error IDs for support
```

---

### Task 2: Structured Logging Implementation (2-3 hours)

#### 2.1 Enhance Logger Utility
**File**: `src/utilities/logger.ts`

**Current Status**: ✅ Already exists - needs enhancement

**Enhancements Needed**:
```typescript
// Add to logger.ts
export interface LogContext {
  userId?: string
  sessionId?: string
  requestId?: string
  component?: string
  action?: string
  metadata?: Record<string, any>
}

export class Logger {
  private static instance: Logger
  
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  error(message: string, error?: Error, context?: LogContext) {
    // Structured error logging
  }

  warn(message: string, context?: LogContext) {
    // Warning logging
  }

  info(message: string, context?: LogContext) {
    // Info logging  
  }

  debug(message: string, context?: LogContext) {
    // Debug logging (development only)
  }
}
```

#### 2.2 Replace Production Console Statements
**Priority Files** (Replace immediately):

**File**: `src/app/(payload)/api/media-forms/submit/route.ts`
```typescript
// Replace lines 143, 150, 166, 246
// FROM:
console.error('❌ Validation error caught:', error)

// TO:
logger.error('Form validation failed', error, {
  component: 'MediaFormSubmit',
  action: 'validation',
  requestId: headers.get('x-request-id'),
  metadata: { formType: body.formType }
})
```

**File**: `src/collections/MediaContentSubmissions/index.ts`
```typescript
// Replace console statements with proper error logging
logger.error('Media submission processing failed', error, {
  component: 'MediaContentSubmissions',
  action: 'create',
  metadata: { submissionId: data.id }
})
```

**File**: `src/components/admin/MediaSubmissionsDashboard/*.tsx`
```typescript
// Replace admin dashboard console statements
logger.warn('Dashboard data loading issue', undefined, {
  component: 'MediaSubmissionsDashboard', 
  action: 'dataLoad',
  metadata: { timestamp: Date.now() }
})
```

#### 2.3 Environment-Based Logging Controls
**Goal**: Conditional development logging

**Implementation Pattern**:
```typescript
// Wrap development-only logging
if (process.env.NODE_ENV === 'development') {
  logger.debug('Development debug info', undefined, {
    component: 'FileUpload',
    action: 'compression',
    metadata: { fileSize: file.size, compressionRatio }
  })
}
```

**Files to Update**:
- `src/lib/file-upload.ts` (13 occurrences)
- `src/components/CustomForms/MediaContentReportForm/index.tsx` (7 occurrences)
- `src/utilities/cached-queries.ts` (4 occurrences)

---

### Task 3: Development Logging Cleanup (1-2 hours)

#### 3.1 File Upload Logging Enhancement
**File**: `src/lib/file-upload.ts`

**Current**: 13 console statements with development logging
**Status**: ✅ Already environment-conditional - needs logger migration

**Action**: 
```typescript
// Replace development console with logger.debug
if (process.env.NODE_ENV === 'development') {
  logger.debug('File upload progress', undefined, {
    component: 'FileUpload',
    action: 'convertToFormData',
    metadata: { 
      fileName: file.name,
      fileSize: file.size,
      step: 'formDataConversion'
    }
  })
}
```

#### 3.2 Form Component Logging
**File**: `src/components/CustomForms/MediaContentReportForm/index.tsx`

**Action**:
- Replace console.log with logger.debug
- Add form submission tracking
- Include form validation context

#### 3.3 Cache Logging Enhancement
**Files**: 
- `src/utilities/cached-queries.ts`
- `src/lib/cache/enhanced-cache.ts`

**Action**:
- Replace console with structured cache logging
- Add cache hit/miss metrics
- Include performance timing

---

### Task 4: Error Boundary Improvements (1 hour)

#### 4.1 Enhanced Error Logging
**Files**: 
- `src/app/(frontend)/error.tsx`
- `src/app/(frontend)/global-error.tsx`
- `src/components/ErrorBoundary/index.tsx`

**Improvements**:
```typescript
// Add structured error logging with context
logger.error('React error boundary triggered', error, {
  component: 'ErrorBoundary',
  action: 'errorCaught',
  metadata: {
    errorBoundary: 'GlobalError',
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  }
})
```

#### 4.2 Error ID Generation
**Goal**: Generate unique error IDs for user support

```typescript
const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
logger.error('User-facing error occurred', error, {
  errorId,
  component: 'ErrorBoundary',
  metadata: { userMessage: 'Please report this error ID to support' }
})
```

---

## 🎯 Acceptance Criteria

### Must Complete:
- [ ] Zero production console statements (except error boundaries)
- [ ] All API routes use structured logger for errors
- [ ] Development logging wrapped with environment checks
- [ ] Enhanced logger utility with context support
- [ ] Logging standards documentation created

### Nice to Have:
- [ ] Error ID generation for user support
- [ ] Performance logging for slow operations
- [ ] User action tracking for analytics
- [ ] Log aggregation configuration

---

## 🛠️ Tools & Dependencies

### Required:
- Existing `src/utilities/logger.ts` (enhance)
- TypeScript for type definitions
- Environment variable checks

### Optional:
- Winston for advanced logging
- Log aggregation service (LogDNA, DataDog)
- Error tracking service (Sentry)

---

## 📊 Testing & Validation

### Development Testing:
```bash
# Enable development logging
NODE_ENV=development npm run dev

# Check logs appear in console
# Test form submissions, file uploads

# Disable development logging  
NODE_ENV=production npm run build
# Verify no console output in production build
```

### Production Testing:
```bash
# Build production bundle
npm run build

# Check for console statements
grep -r "console\." .next/static/ || echo "No console statements found"

# Test error logging
# Trigger validation errors, check structured logs
```

---

## 📅 Timeline

**Hour 1**: Console logging audit and categorization  
**Hour 2-3**: Logger utility enhancement and production fixes  
**Hour 4-5**: Development logging cleanup and environment controls  
**Hour 6**: Error boundary improvements and testing  

---

**Estimated Completion**: 6 hours  
**Dependencies**: None - can start immediately  
**Coordination**: Minimal - mostly independent work  
**Output**: Clean, production-ready logging system