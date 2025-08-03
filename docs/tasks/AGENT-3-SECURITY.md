# Agent 3: Security Engineer Tasks 🛡️

**Agent**: Security Engineer  
**Focus**: Security enhancements and production readiness  
**Estimated Time**: 6-8 hours  
**Priority**: High

---

## 📊 Current Status

### ✅ Security Strengths
- Rate limiting implemented (in-memory for development)
- File signature validation active
- Input validation with Zod schemas
- No eval() or Function() usage detected
- Minimal dangerouslySetInnerHTML usage (safe contexts)

### 🎯 Production Security Gaps
- **Rate Limiting**: In-memory Map (not production-ready)
- **CSRF Protection**: Missing cross-site request forgery protection
- **Content Security Policy**: No CSP headers configured
- **File Security**: Basic validation, needs enhancement

---

## 📋 Task List

### Task 1: Production Rate Limiting (2-3 hours)

#### 1.1 Research Redis Integration Options
**Goal**: Replace in-memory rate limiting with distributed solution

**Current Implementation**: `src/app/(payload)/api/media-forms/submit/route.ts:25-48`
```typescript
// Current: In-memory Map (development-friendly)
const submissionCounts = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour
const MAX_SUBMISSIONS_PER_HOUR = 5
```

**Production Options**:
1. **Vercel KV (Redis)** - Native Vercel integration
2. **Upstash Redis** - Serverless Redis with REST API
3. **AWS ElastiCache** - Enterprise Redis solution

#### 1.2 Install Redis Dependencies
**Recommended**: Upstash Redis for Vercel deployment

```bash
npm install @upstash/redis @upstash/ratelimit
```

#### 1.3 Create Rate Limiting Utility
**File**: `src/lib/rate-limiting/distributed-limiter.ts` (create)

```typescript
import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Create rate limiters for different endpoints
export const formSubmissionLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1h'), // 5 requests per hour
  analytics: true,
  prefix: 'hapa:form-submission',
})

export const mediaUploadLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1h'), // 20 uploads per hour
  analytics: true,
  prefix: 'hapa:media-upload',
})

export const apiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '15m'), // 100 API calls per 15 min
  analytics: true,
  prefix: 'hapa:api',
})

// Rate limit response headers
export function getRateLimitHeaders(result: any) {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.reset).toISOString(),
  }
}

// Enhanced IP extraction with security
export function getClientIP(request: Request): string {
  // Check various headers for real IP
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  // Prefer Cloudflare IP if available
  if (cfConnectingIP) {
    return cfConnectingIP.split(',')[0].trim()
  }
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}
```

#### 1.4 Update Form Submission Route
**File**: `src/app/(payload)/api/media-forms/submit/route.ts`

**Replace lines 25-48** with:
```typescript
import { formSubmissionLimiter, getRateLimitHeaders, getClientIP } from '@/lib/rate-limiting/distributed-limiter'

// Remove in-memory rate limiting code
// Replace checkSubmissionRateLimit function

export async function POST(request: NextRequest): Promise<NextResponse<FormSubmissionResponse>> {
  try {
    // Enhanced rate limiting with Redis
    const clientIP = getClientIP(request)
    const rateLimitResult = await formSubmissionLimiter.limit(clientIP)
    
    // Add rate limit headers to all responses
    const headers = getRateLimitHeaders(rateLimitResult)
    
    if (!rateLimitResult.success) {
      logger.error('Form submission rate limit exceeded', undefined, {
        component: 'MediaFormSubmit',
        action: 'rateLimitExceeded',
        metadata: { 
          clientIP,
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.reset
        }
      })
      
      return NextResponse.json(
        {
          success: false,
          message: 'Rate limit exceeded. Maximum 5 form submissions per hour.',
        },
        { 
          status: 429,
          headers
        }
      )
    }

    // Continue with existing form processing...
    // Add headers to success responses too
    return NextResponse.json(
      {
        success: true,
        message: submissionData.formType === 'report' 
          ? 'Report submitted successfully' 
          : 'Complaint submitted successfully',
        submissionId: result.id.toString(),
      },
      { 
        status: 201,
        headers
      }
    )
  } catch (error) {
    // Add headers to error responses
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error. Please try again later.',
      },
      { 
        status: 500,
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(Date.now() + 3600000).toISOString(),
        }
      }
    )
  }
}
```

#### 1.5 Environment Configuration
**File**: `.env.example`
```env
# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

---

### Task 2: CSRF Protection (2 hours)

#### 2.1 Install CSRF Dependencies
```bash
npm install csrf
npm install --save-dev @types/csrf
```

#### 2.2 Create CSRF Middleware
**File**: `src/middleware.ts` (create/update)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import csrf from 'csrf'

const tokens = csrf()

export function middleware(request: NextRequest) {
  // Apply CSRF protection to form submission endpoints
  if (request.nextUrl.pathname.startsWith('/api/media-forms/submit')) {
    return csrfProtection(request)
  }
  
  // Apply to admin endpoints
  if (request.nextUrl.pathname.startsWith('/api/admin/')) {
    return csrfProtection(request)
  }
  
  return NextResponse.next()
}

async function csrfProtection(request: NextRequest) {
  const response = NextResponse.next()
  
  if (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') {
    // Verify CSRF token for state-changing requests
    const csrfToken = request.headers.get('x-csrf-token') || 
                     request.headers.get('csrf-token')
    
    const sessionSecret = request.cookies.get('csrf-secret')?.value
    
    if (!sessionSecret || !csrfToken) {
      return NextResponse.json(
        { error: 'CSRF token missing' },
        { status: 403 }
      )
    }
    
    try {
      const isValid = tokens.verify(sessionSecret, csrfToken)
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid CSRF token' },
          { status: 403 }
        )
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'CSRF validation failed' },
        { status: 403 }
      )
    }
  }
  
  // Generate and set CSRF token for GET requests
  if (request.method === 'GET') {
    const secret = tokens.secretSync()
    const token = tokens.create(secret)
    
    response.cookies.set('csrf-secret', secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
    })
    
    response.headers.set('x-csrf-token', token)
  }
  
  return response
}

export const config = {
  matcher: [
    '/api/media-forms/:path*',
    '/api/admin/:path*',
  ]
}
```

#### 2.3 Update Form Components
**Files**: Form components that submit data

```typescript
// Add to form components (MediaContentComplaintForm, MediaContentReportForm)
import { useEffect, useState } from 'react'

function useCSRFToken() {
  const [csrfToken, setCSRFToken] = useState<string | null>(null)
  
  useEffect(() => {
    // Get CSRF token from meta tag or API
    fetch('/api/csrf-token')
      .then(res => res.json())
      .then(data => setCSRFToken(data.token))
      .catch(console.error)
  }, [])
  
  return csrfToken
}

// In form submission:
const csrfToken = useCSRFToken()

const submitForm = async (data: FormData) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  if (csrfToken) {
    headers['x-csrf-token'] = csrfToken
  }
  
  const response = await fetch('/api/media-forms/submit', {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  })
  
  // Handle response...
}
```

#### 2.4 Create CSRF Token Endpoint
**File**: `src/app/api/csrf-token/route.ts` (create)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import csrf from 'csrf'

const tokens = csrf()

export async function GET(request: NextRequest) {
  const secret = tokens.secretSync()
  const token = tokens.create(secret)
  
  const response = NextResponse.json({ token })
  
  response.cookies.set('csrf-secret', secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
  })
  
  return response
}
```

---

### Task 3: Content Security Policy (1-2 hours)

#### 3.1 Configure CSP Headers
**File**: `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: generateCSPHeader(),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
  // Other config...
}

function generateCSPHeader() {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https://res.cloudinary.com https://*.r2.dev",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://api.vercel.com https://*.upstash.io",
    "media-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ]
  
  return cspDirectives.join('; ')
}
```

#### 3.2 Update Inline Styles
**Files**: Remove inline styles that violate CSP

**File**: `src/app/(frontend)/global-error.tsx`
```typescript
// Replace dangerouslySetInnerHTML with CSS modules or styled-components
// Move inline styles to CSS files

// Instead of:
<style dangerouslySetInnerHTML={{
  __html: `/* styles */`
}} />

// Use:
import './global-error.css'
```

#### 3.3 CSP Reporting
**File**: `src/app/api/csp-report/route.ts` (create)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/utilities/logger'

export async function POST(request: NextRequest) {
  try {
    const report = await request.json()
    
    logger.warn('CSP violation reported', undefined, {
      component: 'CSPReporting',
      action: 'violationReported',
      metadata: {
        documentURI: report['document-uri'],
        violatedDirective: report['violated-directive'],
        blockedURI: report['blocked-uri'],
        lineNumber: report['line-number'],
        sourceFile: report['source-file'],
      }
    })
    
    return NextResponse.json({ received: true })
  } catch (error) {
    logger.error('CSP report processing failed', error)
    return NextResponse.json({ error: 'Invalid report' }, { status: 400 })
  }
}
```

---

### Task 4: Enhanced File Security (1 hour)

#### 4.1 Add Metadata Stripping
**File**: `src/lib/file-security.ts` (create)

```typescript
import sharp from 'sharp'

/**
 * Strip metadata from image files for privacy and security
 */
export async function stripImageMetadata(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) {
    return file
  }
  
  try {
    const buffer = await file.arrayBuffer()
    const strippedBuffer = await sharp(buffer)
      .rotate() // Auto-rotate based on EXIF, then remove EXIF
      .jpeg({ quality: 95 }) // Re-encode to remove metadata
      .toBuffer()
    
    return new File([strippedBuffer], file.name, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    })
  } catch (error) {
    // If metadata stripping fails, return original file
    console.warn('Failed to strip image metadata:', error)
    return file
  }
}

/**
 * Additional file security checks
 */
export async function enhancedFileValidation(file: File): Promise<{
  isValid: boolean
  threats: string[]
  warnings: string[]
}> {
  const threats: string[] = []
  const warnings: string[] = []
  
  // Check file size limits
  if (file.size > 50 * 1024 * 1024) { // 50MB limit
    threats.push('File exceeds maximum size limit')
  }
  
  // Check for suspicious file names
  const suspiciousPatterns = [
    /\.exe$/i,
    /\.scr$/i,
    /\.bat$/i,
    /\.cmd$/i,
    /\.com$/i,
    /\.pif$/i,
    /\.vbs$/i,
    /\.js$/i,
    /\.jar$/i,
  ]
  
  if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
    threats.push('Potentially dangerous file type')
  }
  
  // Check for double extensions
  if ((file.name.match(/\./g) || []).length > 1) {
    warnings.push('File has multiple extensions')
  }
  
  return {
    isValid: threats.length === 0,
    threats,
    warnings,
  }
}
```

#### 4.2 Secure File Serving
**File**: `src/app/(payload)/api/media/file/[...filename]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string[] } }
) {
  try {
    const filename = params.filename.join('/')
    
    // Validate filename to prevent path traversal
    if (filename.includes('..') || filename.includes('~')) {
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      )
    }
    
    const payload = await getPayload({ config })
    
    // Verify file exists in database
    const media = await payload.find({
      collection: 'media',
      where: {
        filename: {
          equals: filename,
        },
      },
    })
    
    if (media.docs.length === 0) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }
    
    const mediaDoc = media.docs[0]
    
    // Generate signed URL or serve with security headers
    const response = NextResponse.redirect(mediaDoc.url)
    
    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Content-Disposition', 'attachment')
    
    return response
  } catch (error) {
    return NextResponse.json(
      { error: 'File access failed' },
      { status: 500 }
    )
  }
}
```

---

## 🎯 Acceptance Criteria

### Must Complete:
- [ ] Redis-based rate limiting implemented and tested
- [ ] CSRF protection active on all form endpoints
- [ ] Content Security Policy headers configured
- [ ] CSP violation reporting working
- [ ] File metadata stripping implemented
- [ ] Secure file serving with path traversal protection

### Nice to Have:
- [ ] Rate limiting analytics dashboard
- [ ] Advanced threat detection for files
- [ ] Security monitoring integration
- [ ] Automated security scanning in CI/CD

---

## 🛠️ Tools & Dependencies

### Required:
```bash
npm install @upstash/redis @upstash/ratelimit csrf sharp
npm install --save-dev @types/csrf
```

### Environment Variables:
```env
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

---

## 📊 Testing & Validation

### Rate Limiting Tests:
```bash
# Test form submission rate limiting
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/media-forms/submit \
    -H "Content-Type: application/json" \
    -d '{"formType":"test"}' && echo
done

# Should show rate limit on 6th request
```

### CSRF Tests:
```bash
# Test CSRF protection
curl -X POST http://localhost:3000/api/media-forms/submit \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}'

# Should return 403 CSRF token missing
```

### CSP Tests:
```bash
# Test CSP headers
curl -I http://localhost:3000/

# Check for Content-Security-Policy header
```

---

## 📅 Timeline

**Hour 1-2**: Redis rate limiting setup and testing  
**Hour 3-4**: CSRF protection implementation  
**Hour 5-6**: Content Security Policy configuration  
**Hour 7**: Enhanced file security features  
**Hour 8**: Integration testing and documentation  

---

**Estimated Completion**: 8 hours  
**Dependencies**: Agent 1 (logging) for security event logging  
**Coordination**: Coordinate with Agent 5 for environment setup  
**Output**: Production-ready security layer with monitoring