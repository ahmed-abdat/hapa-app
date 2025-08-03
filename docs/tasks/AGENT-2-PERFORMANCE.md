# Agent 2: Performance Optimizer Tasks ⚡

**Agent**: Performance Optimizer  
**Focus**: Image optimization and performance improvements  
**Estimated Time**: 3-4 hours  
**Priority**: High

---

## 📊 Current Status

### ✅ Foundation Ready
- TypeScript compilation clean
- Production build working
- Modern Next.js 15.3.3 App Router

### 🎯 Immediate Issues
- **1 ESLint warning**: `<img>` instead of `<Image />` at FormFileUpload.tsx:216
- **Bundle optimization**: Large form components affecting performance
- **Code splitting**: Opportunities for dynamic imports

---

## 📋 Task List

### Task 1: Image Component Migration (1 hour)

#### 1.1 Fix ESLint Warning
**File**: `src/components/CustomForms/FormFields/FormFileUpload.tsx`  
**Line**: 216  
**Issue**: Using `<img>` instead of Next.js `<Image />`

**Current Code**:
```typescript
// Line 216
<img
  src={thumbnailUrl}
  alt={`${t('loadingThumbnail')} ${file.name}`}
  className="h-full w-full object-cover"
/>
```

**Solution**:
```typescript
import Image from 'next/image'

// Replace with:
<Image
  src={thumbnailUrl}
  alt={`${t('loadingThumbnail')} ${file.name}`}
  className="h-full w-full object-cover"
  width={48}
  height={48}
  sizes="48px"
  priority={false}
  loading="lazy"
  onError={(e) => {
    // Handle image load errors
    const target = e.target as HTMLImageElement
    target.style.display = 'none'
  }}
/>
```

#### 1.2 Add Image Optimization Configuration
**File**: `next.config.js`

**Add Image Configuration**:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Add other existing config...
}
```

#### 1.3 Handle Blob URLs for Thumbnails
**Challenge**: Next.js Image doesn't work with blob URLs  
**Solution**: Custom image component for thumbnails

```typescript
// Create: src/components/ui/OptimizedImage.tsx
interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  priority?: boolean
}

export function OptimizedImage({ src, alt, className, width = 48, height = 48, priority = false }: OptimizedImageProps) {
  // Use native img for blob URLs, Next.js Image for external URLs
  const isBlobUrl = src.startsWith('blob:')
  
  if (isBlobUrl) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
      />
    )
  }
  
  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      priority={priority}
      sizes={`${width}px`}
    />
  )
}
```

---

### Task 2: Bundle Analysis (1 hour)

#### 2.1 Install Bundle Analyzer
```bash
npm install --save-dev @next/bundle-analyzer
```

#### 2.2 Configure Bundle Analysis
**File**: `package.json`
```json
{
  "scripts": {
    "analyze": "cross-env ANALYZE=true next build",
    "analyze:server": "cross-env BUNDLE_ANALYZE=server next build",
    "analyze:browser": "cross-env BUNDLE_ANALYZE=browser next build"
  }
}
```

**File**: `next.config.js`
```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)
```

#### 2.3 Run Bundle Analysis
```bash
# Generate bundle analysis
npm run analyze

# Analyze results
# 1. Identify largest bundles
# 2. Find duplicate dependencies  
# 3. Locate optimization opportunities
```

#### 2.4 Document Findings
**Create**: `docs/BUNDLE-ANALYSIS.md`
```markdown
# Bundle Analysis Results

## Current Bundle Sizes
- Main bundle: X MB
- Form components: X MB
- Admin components: X MB

## Optimization Opportunities
1. Large form components (MediaContentComplaintForm, MediaContentReportForm)
2. Duplicate dependencies
3. Unused imports

## Recommendations
1. Dynamic imports for form components
2. Tree shaking optimization
3. Component code splitting
```

---

### Task 3: Dynamic Imports Implementation (1-2 hours)

#### 3.1 Identify Heavy Components
**Target Components**:
```
Heavy Form Components (>50KB):
- src/components/CustomForms/MediaContentComplaintForm/index.tsx
- src/components/CustomForms/MediaContentReportForm/index.tsx

Block Components:
- src/blocks/ComplaintFormBlock/Component.tsx (if exists)
- src/blocks/ContactFormBlock/Component.tsx (if exists)

Admin Components:
- src/components/admin/MediaSubmissionsDashboard/index.tsx
```

#### 3.2 Implement Dynamic Imports

**File**: `src/components/CustomForms/index.tsx` (create)
```typescript
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Dynamic imports with loading states
const MediaContentComplaintForm = dynamic(
  () => import('./MediaContentComplaintForm').then(mod => ({ default: mod.MediaContentComplaintForm })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3">Chargement du formulaire...</span>
      </div>
    ),
    ssr: false // Forms are interactive, can skip SSR
  }
)

const MediaContentReportForm = dynamic(
  () => import('./MediaContentReportForm').then(mod => ({ default: mod.MediaContentReportForm })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3">Chargement du formulaire...</span>
      </div>
    ),
    ssr: false
  }
)

export { MediaContentComplaintForm, MediaContentReportForm }
```

#### 3.3 Update Form Block Components
**Files**: Form block components that use the forms

```typescript
// Instead of direct import:
// import { MediaContentComplaintForm } from '@/components/CustomForms/MediaContentComplaintForm'

// Use dynamic import:
import { MediaContentComplaintForm } from '@/components/CustomForms'

// Wrap in Suspense for better loading experience
<Suspense fallback={<FormLoadingSkeleton />}>
  <MediaContentComplaintForm {...props} />
</Suspense>
```

#### 3.4 Create Loading Skeletons
**File**: `src/components/ui/FormLoadingSkeleton.tsx`
```typescript
export function FormLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      <div className="space-y-3">
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded w-32"></div>
    </div>
  )
}
```

---

### Task 4: Performance Optimizations (30 minutes)

#### 4.1 Component Memoization
**Target Files**: Heavy form field components

```typescript
// Example: FormFileUpload.tsx
import { memo, useMemo, useCallback } from 'react'

export const FormFileUpload = memo(function FormFileUpload({
  name,
  label,
  required = false,
  disabled = false,
  // ...other props
}: FormFileUploadProps) {
  // Memoize expensive calculations
  const memoizedValidation = useMemo(() => {
    return createValidationConfig(accept, maxSize)
  }, [accept, maxSize])

  // Memoize callbacks
  const handleFileSelect = useCallback(async (selectedFiles: FileList) => {
    // File selection logic
  }, [multiple, onFilesChange, compressionEnabled])

  // Component logic...
})
```

#### 4.2 Add Performance Monitoring
**File**: `src/lib/performance.ts` (create)
```typescript
export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): T | Promise<T> {
  if (typeof performance === 'undefined') return fn()
  
  const start = performance.now()
  const result = fn()
  
  if (result instanceof Promise) {
    return result.finally(() => {
      const end = performance.now()
      console.log(`${name} took ${end - start}ms`)
    })
  } else {
    const end = performance.now()
    console.log(`${name} took ${end - start}ms`)
    return result
  }
}

// Usage in components:
const processedData = measurePerformance('Form validation', () => {
  return validateFormData(data)
})
```

---

## 🎯 Acceptance Criteria

### Must Complete:
- [ ] ESLint warning resolved (img → Image component)
- [ ] Bundle analysis completed and documented
- [ ] Dynamic imports implemented for 2+ heavy components
- [ ] Loading states for dynamic components
- [ ] Performance measurement utilities added

### Nice to Have:
- [ ] Component memoization for form fields
- [ ] WebP/AVIF image format support
- [ ] Progressive loading for images
- [ ] Bundle size reduced by 15%+

---

## 🛠️ Tools & Dependencies

### Required:
```bash
npm install --save-dev @next/bundle-analyzer
```

### Optional:
```bash
npm install --save-dev webpack-bundle-analyzer
npm install react-intersection-observer # For lazy loading
```

---

## 📊 Testing & Validation

### Performance Testing:
```bash
# 1. Baseline measurement
npm run build
npm run analyze

# 2. After optimizations
npm run build  
npm run analyze

# 3. Compare bundle sizes
echo "Bundle size improvement: X% reduction"
```

### Lighthouse Testing:
```bash
# Run Lighthouse on key pages
npx lighthouse http://localhost:3000/fr/forms/media-content-complaint
npx lighthouse http://localhost:3000/fr/forms/media-content-report

# Check Core Web Vitals:
# - LCP (Largest Contentful Paint) < 2.5s
# - FID (First Input Delay) < 100ms  
# - CLS (Cumulative Layout Shift) < 0.1
```

### Load Testing:
```bash
# Test dynamic imports
# 1. Open dev tools Network tab
# 2. Navigate to form pages
# 3. Verify dynamic chunks load separately
# 4. Check loading states appear
```

---

## 📊 Performance Metrics

### Before Optimization:
- [ ] Main bundle size: _____ MB
- [ ] Form component size: _____ MB
- [ ] Page load time: _____ seconds
- [ ] ESLint warnings: 1

### After Optimization:
- [ ] Main bundle size: _____ MB (target: 15% reduction)
- [ ] Form component size: _____ MB (target: 20% reduction)  
- [ ] Page load time: _____ seconds (target: 10% improvement)
- [ ] ESLint warnings: 0

---

## 📅 Timeline

**Hour 1**: Image component migration and ESLint fix  
**Hour 2**: Bundle analysis setup and execution  
**Hour 3**: Dynamic imports implementation  
**Hour 4**: Performance optimizations and testing  

---

**Estimated Completion**: 4 hours  
**Dependencies**: None - can start immediately  
**Coordination**: None required  
**Output**: Optimized, fast-loading application with improved Core Web Vitals