# Payload CMS Live Preview Production CSP Research & Implementation

## Issue Context
**Production Problem**: Live preview iframe shows "refused to connect" error at `https://hapa-mr.vercel.app/admin/collections/posts/4/preview`
**Environment**: Works in development, fails in production
**Root Cause**: Content Security Policy (CSP) headers blocking iframe embedding

## Current Implementation Status

### Changes Made (Ready to Commit)

#### 1. next.config.mjs - CSP Headers Fix
**File**: `/next.config.mjs`
**Changes**:
- Implemented environment-specific `frame-ancestors` configuration
- Removed deprecated `X-Frame-Options` in favor of modern CSP approach
- Added dynamic domain detection for production environments

```typescript
// Environment-specific frame ancestors for Payload CMS live preview
const getFrameAncestors = () => {
  const baseAncestors = ['\'self\'']
  
  if (process.env.NODE_ENV === 'development') {
    baseAncestors.push('localhost:*')
  }
  
  // Add production admin domain if available
  const productionUrl = process.env.NEXT_PUBLIC_SERVER_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (productionUrl && process.env.NODE_ENV === 'production') {
    const domain = productionUrl.replace(/^https?:\/\//, '')
    baseAncestors.push(`https://${domain}`)
  }
  
  return baseAncestors.join(' ')
}
```

#### 2. src/payload.config.ts - CORS Enhancement
**File**: `/src/payload.config.ts`
**Changes**:
- Added multi-port CORS support for development flexibility
- Environment-specific CORS configuration

```typescript
cors: process.env.NODE_ENV === 'development' 
  ? ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'].filter(Boolean)
  : [getServerSideURL()].filter(Boolean),
```

#### 3. CLAUDE.md - Documentation Updates
**File**: `/CLAUDE.md`
**Changes**:
- Updated architecture documentation to reflect current project structure
- Corrected information about heroes, blocks, and routing patterns
- Added comprehensive development workflow documentation

#### 4. .gitignore - Debug Assets
**File**: `/.gitignore`
**Changes**:
- Added exclusion for debugging screenshots directory

```gitignore
# Debugging screenshots development
debging-screenshots/*
```

#### 5. package.json - Development Tools
**File**: `/package.json`
**Changes**:
- Added stagewise development tools for enhanced workflow

```json
"dev:stagewise": "pnpm dlx stagewise@latest -b -- pnpm dev",
"stagewise": "pnpm dlx stagewise@latest -b",
```

## Research Summary

### Payload CMS Best Practices (from comprehensive research)

#### Key Findings:
1. **Modern CSP Approach**: Use `frame-ancestors` instead of `X-Frame-Options`
2. **Environment-Specific Configuration**: Different CSP policies for dev/prod
3. **Domain Whitelisting**: Strict domain allowlisting for production security
4. **Cross-Origin Configuration**: Proper CORS and CSRF setup in Payload config

#### Official Recommendations:
- Environment-specific CSP configuration with dynamic domain detection
- Monitoring CSP violations in production
- Gradual deployment with report-only mode
- Proper postMessage communication setup

### Security Considerations

#### Current Security Posture:
- ✅ Environment-specific frame ancestors
- ✅ Maintained strict CSP for non-preview content  
- ✅ Dynamic domain detection for production
- ✅ Development flexibility with localhost wildcards

#### Potential Improvements:
- CSP violation reporting setup
- Nonce-based script execution
- Middleware-based CSP for route-specific policies
- Monitor CSP effectiveness in production

## Testing Required

### Development Testing:
- [x] Live preview functionality works locally
- [x] Multi-port development support (3000, 3001, 3002)
- [x] CORS configuration supports admin panel communication

### Production Testing (Pending):
- [ ] Live preview iframe loads correctly in production
- [ ] CSP headers allow same-origin framing
- [ ] No CSP violations in browser console
- [ ] Cross-origin communication works between admin and frontend

## Environment Variables Impact

### Current Variables:
- `NEXT_PUBLIC_SERVER_URL`: Primary production URL
- `VERCEL_PROJECT_PRODUCTION_URL`: Fallback production URL detection
- `NODE_ENV`: Environment detection for CSP configuration

### Recommended Additions:
```bash
# For explicit CSP configuration
ADMIN_DOMAIN=https://hapa-mr.vercel.app
PREVIEW_DOMAINS=https://staging.hapa-mr.vercel.app

# For CSP violation reporting
CSP_REPORT_URI=https://your-csp-report-endpoint.com/report
```

## Alternative Implementation Approaches

### Option 1: Middleware-Based CSP (Not Implemented)
Route-specific CSP policies using Next.js middleware for more granular control.

### Option 2: Dynamic CSP Headers (Current Implementation)
Environment-specific CSP generation in next.config.mjs with automatic domain detection.

### Option 3: Report-Only CSP (Future Enhancement)
Gradual CSP deployment with monitoring and violation reporting.

## Known Issues & Limitations

### Current Limitations:
1. **Domain Detection**: Relies on environment variables for production domain detection
2. **Single Domain**: Currently supports single production domain (could support multiple)
3. **No Violation Reporting**: CSP violations not currently monitored

### Potential Issues:
1. **Environment Variable Missing**: If NEXT_PUBLIC_SERVER_URL is not set, fallback may not work
2. **Subdomain Handling**: Current implementation may not handle complex subdomain scenarios
3. **CDN Configuration**: Additional CSP considerations may be needed for CDN usage

## Future Research Areas

### Areas for Further Investigation:
1. **CSP Violation Monitoring**: Implement reporting and analysis
2. **Advanced CSP Policies**: Nonce-based execution, strict-dynamic
3. **Performance Impact**: CSP header parsing performance analysis
4. **Multi-Domain Support**: Support for multiple admin/preview domains
5. **Security Audit**: Comprehensive security review of CSP implementation

### MCP Research Tasks for Future Agents:
1. **Search Payload CMS GitHub Issues**: Look for recent CSP and iframe-related issues
2. **Research Next.js 15 CSP Best Practices**: Latest CSP implementations with App Router  
3. **Security Analysis**: Comprehensive security review of current CSP configuration
4. **Performance Testing**: Impact analysis of CSP headers on application performance
5. **Community Solutions**: Review community implementations and solutions

## Implementation Checklist

### Completed:
- [x] Research Payload CMS live preview requirements
- [x] Implement environment-specific CSP configuration
- [x] Update CORS configuration for cross-origin communication
- [x] Document implementation approach and rationale

### Pending:
- [ ] Deploy and test in production environment
- [ ] Monitor CSP violations and adjust policies as needed
- [ ] Implement CSP reporting for ongoing security monitoring
- [ ] Performance testing and optimization

## Deployment Notes

### Pre-Deployment Requirements:
1. Ensure `NEXT_PUBLIC_SERVER_URL` is properly set in production
2. Test CSP configuration in staging environment first
3. Monitor browser console for CSP violations after deployment

### Post-Deployment Monitoring:
1. Check live preview functionality across all collections
2. Monitor CSP violation reports (if implemented)
3. Verify cross-origin communication works correctly
4. Test iframe loading performance and user experience

---

**Document Created**: For comprehensive research validation and future agent analysis
**Implementation Status**: Ready for production deployment and testing
**Security Level**: Enhanced with environment-specific policies