# Agent 5: DevOps Engineer Tasks 🚀

**Agent**: DevOps Engineer  
**Focus**: CI/CD improvements and monitoring  
**Estimated Time**: 4-6 hours  
**Priority**: Medium

---

## 📊 Current Status

### ✅ Existing Infrastructure
- GitHub repository with Actions
- Vercel deployment pipeline
- Package manager (pnpm) configured
- Environment variables setup

### 🔥 Critical Build Issue
**Production build failing with TypeScript error**:
- `submit-with-files/route.ts:271` - formType string assignment error
- Blocking all deployments

---

## 🚨 IMMEDIATE PRIORITY: Fix Production Build

### Critical Fix Required
**File**: `src/app/(payload)/api/media-forms/submit-with-files/route.ts:271`

**Error**:
```
Type 'string' is not assignable to type '"report" | "complaint"'
```

**Solution**: Fix type assertion in collectionData object
```typescript
// Line 271 - Fix formType typing
const collectionData = {
  formType: submissionData.formType as 'report' | 'complaint', // Fix type assertion
  // ... rest of the data
}
```

---

## 📋 Task List

### Task 1: Fix Production Build (URGENT - 30 minutes)

#### 1.1 Resolve TypeScript Error
**File**: `src/app/(payload)/api/media-forms/submit-with-files/route.ts`

**Current Issue** (Line 271):
```typescript
const collectionData = {
  formType: submissionData.formType, // String not assignable to '"report" | "complaint"'
  // ...
}
```

**Fix**:
```typescript
const collectionData = {
  formType: submissionData.formType as 'report' | 'complaint',
  submittedAt: submissionData.submittedAt,
  locale: ['fr', 'ar'].includes(submissionData.locale) ? submissionData.locale as 'fr' | 'ar' : 'fr',
  submissionStatus: 'pending' as const,
  priority: 'medium' as const,
  // ... rest of the data
}
```

#### 1.2 Verify Build Success
```bash
# Test locally first
pnpm build

# Should complete without TypeScript errors
# Then commit and push to trigger deployment
```

---

### Task 2: GitHub Actions Enhancement (2 hours)

#### 2.1 Current GitHub Actions Analysis
**File**: `.github/workflows/` (review existing)

**Enhancements Needed**:
- Automated testing in CI/CD
- Build quality gates
- Security scanning
- Deployment previews

#### 2.2 Enhanced CI/CD Pipeline
**File**: `.github/workflows/ci.yml` (create/update)

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18.19.0'
  PNPM_VERSION: '10.12.4'

jobs:
  lint-and-type-check:
    name: Lint and Type Check
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run ESLint
        run: pnpm lint

      - name: Run TypeScript check
        run: npx tsc --noEmit

  test:
    name: Run Tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run tests
        run: pnpm test:ci

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella

  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

      - name: Audit dependencies
        run: pnpm audit --audit-level high

  build:
    name: Build Application
    runs-on: ubuntu-latest
    needs: [lint-and-type-check, test]
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build application
        run: pnpm build
        env:
          NODE_ENV: production

      - name: Archive build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-files
          path: |
            .next/
            public/

  deploy-preview:
    name: Deploy Preview
    runs-on: ubuntu-latest
    needs: [build]
    if: github.event_name == 'pull_request'
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to Vercel Preview
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_ID }}

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [build, security-scan]
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to Vercel Production
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
          scope: ${{ secrets.VERCEL_ORG_ID }}
```

#### 2.3 Quality Gates Configuration
**File**: `.github/workflows/quality-gates.yml` (create)

```yaml
name: Quality Gates

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  quality-check:
    name: Quality Gates
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18.19.0'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run quality checks
        run: |
          # Lint check
          pnpm lint
          
          # Type check
          npx tsc --noEmit
          
          # Test coverage
          pnpm test:coverage
          
          # Build test
          pnpm build

      - name: Comment PR with results
        uses: actions/github-script@v6
        if: github.event_name == 'pull_request'
        with:
          script: |
            const fs = require('fs');
            const path = require('path');
            
            // Read coverage results if available
            let coverageComment = '';
            if (fs.existsSync('coverage/coverage-summary.json')) {
              const coverage = JSON.parse(fs.readFileSync('coverage/coverage-summary.json'));
              const total = coverage.total;
              coverageComment = `
              ## Test Coverage
              - Lines: ${total.lines.pct}%
              - Functions: ${total.functions.pct}%
              - Branches: ${total.branches.pct}%
              - Statements: ${total.statements.pct}%
              `;
            }
            
            const comment = `
            ## Quality Gates Results
            
            ✅ All quality checks passed!
            
            ${coverageComment}
            
            Built successfully - ready for deployment.
            `;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

---

### Task 3: Monitoring Setup (2 hours)

#### 3.1 Error Monitoring with Sentry
**Install Sentry**:
```bash
npm install @sentry/nextjs
```

**File**: `sentry.client.config.js` (create)
```javascript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: ['localhost', 'hapa.mr'],
    }),
  ],
  beforeSend(event) {
    // Filter out development errors
    if (event.exception) {
      const error = event.exception.values?.[0]
      if (error?.type === 'ChunkLoadError') {
        return null // Ignore chunk load errors
      }
    }
    return event
  },
})
```

**File**: `sentry.server.config.js` (create)
```javascript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
})
```

#### 3.2 Performance Monitoring
**File**: `src/lib/monitoring/performance.ts` (create)

```typescript
import { logger } from '@/utilities/logger'

export interface PerformanceMetric {
  name: string
  value: number
  unit: 'ms' | 'bytes' | 'count'
  timestamp: number
  tags?: Record<string, string>
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []

  startTimer(name: string, tags?: Record<string, string>) {
    const start = performance.now()
    
    return {
      end: () => {
        const duration = performance.now() - start
        this.recordMetric({
          name,
          value: duration,
          unit: 'ms',
          timestamp: Date.now(),
          tags,
        })
        return duration
      }
    }
  }

  recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric)
    
    // Log slow operations
    if (metric.unit === 'ms' && metric.value > 1000) {
      logger.warn('Slow operation detected', undefined, {
        component: 'PerformanceMonitor',
        action: 'slowOperation',
        metadata: {
          operation: metric.name,
          duration: metric.value,
          tags: metric.tags,
        }
      })
    }
    
    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(metric)
    }
  }

  private async sendToMonitoring(metric: PerformanceMetric) {
    try {
      // Send to your monitoring service (DataDog, New Relic, etc.)
      if (process.env.MONITORING_ENDPOINT) {
        await fetch(process.env.MONITORING_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.MONITORING_API_KEY}`,
          },
          body: JSON.stringify(metric),
        })
      }
    } catch (error) {
      logger.error('Failed to send metrics to monitoring service', error)
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  clearMetrics() {
    this.metrics = []
  }
}

export const performanceMonitor = new PerformanceMonitor()

// Helper function for measuring async operations
export async function measureAsync<T>(
  name: string,
  operation: () => Promise<T>,
  tags?: Record<string, string>
): Promise<T> {
  const timer = performanceMonitor.startTimer(name, tags)
  try {
    const result = await operation()
    timer.end()
    return result
  } catch (error) {
    timer.end()
    throw error
  }
}
```

#### 3.3 Uptime Monitoring
**File**: `src/app/api/health/route.ts` (create)

```typescript
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  const start = Date.now()
  
  try {
    // Check database connection
    const payload = await getPayload({ config })
    await payload.find({
      collection: 'users',
      limit: 1,
      showHiddenFields: false,
    })
    
    const responseTime = Date.now() - start
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
      services: {
        database: 'healthy',
        cms: 'healthy',
      },
      metrics: {
        responseTime: `${responseTime}ms`,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        services: {
          database: 'unknown',
          cms: 'unknown',
        },
      },
      { status: 503 }
    )
  }
}
```

---

### Task 4: Environment Configuration (1-2 hours)

#### 4.1 Environment Validation
**File**: `src/lib/env-validation.ts` (create)

```typescript
import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // Payload CMS
  PAYLOAD_SECRET: z.string().min(32),
  
  // Next.js
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  
  // Storage
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  
  // Rate Limiting
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  
  // Monitoring
  SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  
  // Environment
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  
  // Optional
  MONITORING_ENDPOINT: z.string().url().optional(),
  MONITORING_API_KEY: z.string().optional(),
})

export function validateEnv() {
  try {
    const env = envSchema.parse(process.env)
    console.log('✅ Environment variables validated successfully')
    return env
  } catch (error) {
    console.error('❌ Environment validation failed:', error)
    process.exit(1)
  }
}

// Validate on module load
export const env = validateEnv()
```

#### 4.2 Deployment Documentation
**File**: `docs/DEPLOYMENT.md` (create)

```markdown
# HAPA Deployment Guide

## Environment Setup

### Required Environment Variables

\`\`\`env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Payload CMS
PAYLOAD_SECRET=your-32-character-secret-key

# Storage (Optional - for file uploads)
S3_BUCKET=your-bucket-name
S3_REGION=your-region
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key

# Rate Limiting (Production)
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Monitoring (Optional)
SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_SENTRY_DSN=your-public-sentry-dsn
\`\`\`

## Deployment Environments

### Development
\`\`\`bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local

# Run database migrations
pnpm payload migrate

# Start development server
pnpm dev
\`\`\`

### Staging
- Automated deployment from \`develop\` branch
- Environment: \`staging\`
- URL: https://staging-hapa.vercel.app

### Production
- Automated deployment from \`main\` branch
- Environment: \`production\`
- URL: https://hapa.mr

## Deployment Checklist

### Pre-Deployment
- [ ] All tests pass
- [ ] Build succeeds locally
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Security scan passes

### Post-Deployment
- [ ] Health check passes
- [ ] Core functionality tested
- [ ] Forms submission working
- [ ] Admin panel accessible
- [ ] Monitoring active

## Rollback Procedure

### Vercel Rollback
\`\`\`bash
# List recent deployments
vercel --prod list

# Rollback to specific deployment
vercel --prod promote [deployment-url]
\`\`\`

### Database Rollback
\`\`\`bash
# Rollback last migration
pnpm payload migrate:rollback
\`\`\`

## Monitoring & Alerts

### Health Checks
- Endpoint: \`/api/health\`
- Expected: HTTP 200 with JSON response
- Check frequency: Every 5 minutes

### Error Monitoring
- Sentry integration for error tracking
- Alert on error rate >1%
- Alert on response time >5s

### Performance Monitoring
- Core Web Vitals tracking
- API response time monitoring
- Database query performance
\`\`\`

---

## 🎯 Acceptance Criteria

### Must Complete:
- [ ] TypeScript build error fixed (CRITICAL)
- [ ] Enhanced GitHub Actions with testing
- [ ] Error monitoring with Sentry configured
- [ ] Health check endpoint created
- [ ] Environment validation implemented
- [ ] Deployment documentation complete

### Nice to Have:
- [ ] Performance monitoring dashboard
- [ ] Automated security scanning
- [ ] Database backup automation
- [ ] Load testing setup

---

## 🛠️ Tools & Dependencies

### Required:
```bash
npm install @sentry/nextjs zod
```

### Environment Variables:
```env
SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_SENTRY_DSN=your_public_sentry_dsn
MONITORING_ENDPOINT=your_monitoring_url
MONITORING_API_KEY=your_monitoring_key
```

---

## 📊 Testing & Validation

### Build Testing:
```bash
# Fix critical error first
# Then test build
pnpm build

# Should complete without errors
echo "Exit code: $?"
```

### Health Check Testing:
```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Should return 200 with healthy status
```

### Monitoring Testing:
```bash
# Trigger test error
curl -X POST http://localhost:3000/api/test-error

# Check Sentry dashboard for error report
```

---

## 📅 Timeline

**IMMEDIATE (30 min)**: Fix TypeScript build error  
**Hour 1-2**: GitHub Actions enhancement  
**Hour 3-4**: Monitoring setup (Sentry, performance)  
**Hour 5-6**: Environment configuration and documentation  

---

**Estimated Completion**: 6 hours  
**Dependencies**: Build fix blocks all other work  
**Coordination**: Environment setup with Agent 3 (Security)  
**Output**: Production-ready CI/CD pipeline with monitoring