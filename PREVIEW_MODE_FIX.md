# Payload CMS Preview Mode Fix Documentation

## Issue Overview

**GitHub Issue**: #14 - Payload CMS preview mode not working
**PR**: #15 (initial attempt) and #16 (complete fix)
**Environment**: Payload CMS 3.52.0 + Next.js 15.3.3

## Original Problems

### 1. 500 Error: "Failed to create URL object from URL:"

- **Root Cause**: Incompatibility between Payload CMS expecting Express.js Request objects and Next.js 15 using Web Request API
- **Location**: `/src/app/(frontend)/next/preview/route.ts`
- **Error Details**: Payload's internal auth() method tried to construct URLs using Express properties (req.protocol, req.host, req.get()) that don't exist on Web Request objects

### 2. Empty Admin Panel Preview Iframe

- **Root Cause**: `livePreview.url` was returning preview route URLs (`/next/preview?...`) instead of direct frontend URLs
- **Location**: `/src/collections/Posts/index.ts`
- **Error Details**: Iframes cannot properly handle 307 redirects, resulting in empty preview panes

## Solutions Implemented

### Fix 1: Headers-Only Authentication Pattern

**File**: `/src/app/(frontend)/next/preview/route.ts`

**Before** (Problematic - caused 500 error):

```typescript
user = await payload.auth({
  req: req as unknown as PayloadRequest,
  headers: req.headers,
});
```

**After** (Fixed - headers-only pattern):

```typescript
const { user: authenticatedUser } = await payload.auth({
  headers: req.headers,
});
user = authenticatedUser;
```

**Why This Works**:

- Avoids passing the full Request object that Payload can't properly parse
- Uses only headers for authentication, which is all Payload actually needs
- Follows Payload's official documentation pattern for Next.js App Router

### Fix 2: Direct Frontend URLs for Live Preview

**File**: `/src/collections/Posts/index.ts`

**Before** (Problematic - caused empty iframes):

```typescript
livePreview: {
  url: ({ data, req, locale }) => {
    // ... slug generation ...
    return generatePreviewPath({
      slug,
      collection: 'posts',
      req,
      locale,
    })
  },
}
```

**After** (Fixed - direct frontend URLs):

```typescript
livePreview: {
  url: ({ data, req, locale }) => {
    // ... slug generation ...
    // For live preview, return direct frontend URL (not preview route)
    const currentLocale = (locale && typeof locale === 'object' && 'code' in locale)
      ? String((locale as { code: string }).code)
      : String(locale || 'fr')

    return `/${currentLocale}/posts/${slug}`
  },
},
```

**Why This Works**:

- Live preview (iframe) needs direct frontend URLs that load immediately
- Regular preview (button) can use redirect URLs for authentication flow
- Iframes cannot handle 307 redirects properly

### Fix 3: Flexible URL Resolution

**File**: `/src/utilities/getURL.ts`

**Enhanced** (Better port detection):

```typescript
export const getServerSideURL = () => {
  // In development, use the actual port if available from PORT env var
  if (process.env.NODE_ENV === "development") {
    const port = process.env.PORT || "3000";
    return `http://localhost:${port}`;
  }
  // ... production logic ...
};
```

### Fix 4: Multi-Port CORS Support

**File**: `/src/payload.config.ts`

**Configuration** (Already implemented):

```typescript
cors: process.env.NODE_ENV === 'development'
  ? ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'].filter(Boolean)
  : [getServerSideURL()].filter(Boolean),
```

## Technical Deep Dive

### Understanding the Preview System

#### Two Types of Preview in Payload CMS:

1. **Live Preview** (`livePreview` config)

   - Used for: Admin panel iframe preview
   - Requirement: Direct frontend URLs
   - Authentication: Handled by admin session
   - Example: `/${locale}/posts/${slug}`

2. **Regular Preview** (`preview` config)
   - Used for: "Open Preview" button
   - Requirement: Can use redirect URLs for auth flow
   - Authentication: Through preview route handler
   - Example: `/next/preview?collection=posts&slug=${slug}`

### Key Differences Between Request Types

| Feature  | Express Request     | Web Request API             |
| -------- | ------------------- | --------------------------- |
| Protocol | `req.protocol`      | Parse from `req.url`        |
| Host     | `req.host`          | `req.headers.get('host')`   |
| Headers  | `req.get('header')` | `req.headers.get('header')` |
| URL      | `req.originalUrl`   | `req.url`                   |

### Middleware Considerations

The middleware.ts file was kept minimal to avoid conflicts:

```typescript
// Only handle next-intl routing, skip API and admin routes
export default createMiddleware(routing);

export const config = {
  matcher: [
    "/",
    "/(ar|fr)/:path*",
    "/((?!api|_next|admin|next|_static|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};
```

## Testing Steps

### 1. Test Preview Route Authentication

```bash
# Should return 401 without auth
curl -I http://localhost:3000/next/preview?collection=posts&slug=test

# Should redirect with valid session
# (requires admin cookie)
```

### 2. Test Admin Panel Live Preview

1. Login to admin panel: `http://localhost:3000/admin`
2. Navigate to Posts collection
3. Edit any post
4. Click "Preview" tab in editor
5. Verify iframe shows actual post content (not empty)

### 3. Test "Open Preview" Button

1. In post editor, click "Open Preview" button
2. Should open new tab with preview URL
3. Should redirect to frontend post after authentication

## Common Issues & Solutions

### Issue: Preview still shows empty

**Solution**: Check that:

1. Development server is running
2. Frontend routes exist (`/[locale]/posts/[slug]`)
3. CORS includes current port
4. Browser console for iframe loading errors

### Issue: 404 on preview URLs

**Solution**: Ensure:

1. Slug generation matches frontend routing
2. Locale parameter is correctly formatted
3. Post is published or draft preview is enabled

### Issue: Authentication fails

**Solution**: Verify:

1. Admin user is logged in
2. Session cookies are valid
3. CORS configuration matches server URL

## Future Improvements

1. **Add preview mode indicator** on frontend pages
2. **Implement exit preview** functionality
3. **Add preview expiration** for security
4. **Support for other collections** (not just Posts)
5. **Better error handling** with user-friendly messages

## Migration Guide for Other Collections

To add preview support to other collections:

1. **Add preview configuration**:

```typescript
preview: {
  url: ({ data, req, locale }) => {
    return generatePreviewPath({
      slug: data.slug,
      collection: 'your-collection',
      req,
      locale,
    })
  },
},
```

2. **Add livePreview configuration**:

```typescript
livePreview: {
  url: ({ data, locale }) => {
    const currentLocale = // ... locale logic
    return `/${currentLocale}/your-route/${data.slug}`
  },
},
```

3. **Ensure frontend route exists** at the URL pattern returned by livePreview

## Resources

- [Payload CMS Preview Documentation](https://payloadcms.com/docs/admin/live-preview)
- [Next.js 15 App Router Documentation](https://nextjs.org/docs/app)
- [Web Request API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Request)

## Contributors

- Initial investigation and fix: Ahmed (via Claude Code)
- Testing and validation: Development team

## Status

✅ **RESOLVED** - Both issues fixed:

1. Authentication error eliminated using headers-only pattern
2. Live preview iframe now displays content with direct frontend URLs
