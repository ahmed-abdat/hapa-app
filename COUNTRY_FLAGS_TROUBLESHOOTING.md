# 🚩 Country Flags Not Loading - Troubleshooting Guide

## 🔍 Issue Summary

Country flags in the media complaint form (`/forms/media-content-complaint`) are not displaying correctly, showing broken image placeholders instead of flag icons.

## 📸 Visual Evidence

- **Form Location**: `/forms/media-content-complaint` - "Pays" (Country) selector dropdown
- **Symptoms**: Flag icons appear as broken image placeholders
- **Network Tab**: Multiple failed requests to `react-circle-flags.pages.dev` domain (see screenshots)

## 🕵️ Root Cause Analysis

### Current Implementation
- **Library**: `react-circle-flags` v0.0.23
- **Component**: `CountryCombobox.tsx` uses `<CircleFlag />` component
- **Location**: `src/components/CustomForms/FormFields/CountryCombobox.tsx:216-220, 273-277`

### Technical Details
```typescript
// Current broken implementation
<CircleFlag
  countryCode={selectedCountry.alpha2.toLowerCase()}
  height={20}
/>
```

### Failed Network Requests
- **Domain**: `https://react-circle-flags.pages.dev/`
- **Pattern**: `https://react-circle-flags.pages.dev/{countryCode}.svg`
- **Examples**: 
  - `https://react-circle-flags.pages.dev/dz.svg` (Algeria)
  - `https://react-circle-flags.pages.dev/ma.svg` (Morocco)
  - `https://react-circle-flags.pages.dev/tn.svg` (Tunisia)

### Primary Issues Identified

1. **🌐 Domain Availability Issue**
   - The `react-circle-flags.pages.dev` domain appears to be down or unavailable
   - All requests to this domain are failing with network errors

2. **🔒 CSP (Content Security Policy) Mismatch**
   - Current CSP allows: `https://hatscripts.github.io` (original circle-flags source)
   - Library tries to load from: `https://react-circle-flags.pages.dev/`
   - Domain not whitelisted in CSP configuration

3. **📦 Library Dependency Issue**
   - Using potentially outdated or unmaintained `react-circle-flags` package
   - Package last updated 8 months ago (as of research date)

## 🎯 Solution Options

### Option 1: ✅ RECOMMENDED - Switch to Reliable Flag Library

Replace `react-circle-flags` with a more reliable, well-maintained alternative:

**Recommended Libraries:**
- **`react-world-flags`** - Actively maintained, self-contained
- **`country-flag-icons`** - Popular, reliable, includes SVGs
- **`flag-icons`** - Comprehensive CSS/SVG flag collection

**Implementation:**
```bash
# Remove current library
pnpm remove react-circle-flags

# Install reliable alternative
pnpm add country-flag-icons
# or
pnpm add react-world-flags
```

### Option 2: 🔧 Fix CSP + Domain Whitelist

Add the failing domain to CSP and hope it comes back online:

```javascript
// next.config.mjs - Add to img-src
"img-src 'self' blob: data: https://res.cloudinary.com https://*.r2.dev https://vercel.com https://hatscripts.github.io https://react-circle-flags.pages.dev",
```

**⚠️ Risks:**
- Domain may remain unavailable
- Dependency on external CDN
- Potential security/reliability concerns

### Option 3: 🏗️ Self-Host Flag Assets

Download flag SVGs and host them locally:

1. Download flag assets from reliable source (e.g., hatscripts/circle-flags)
2. Place in `public/flags/` directory  
3. Update component to use local paths
4. Update CSP to allow self-hosted images

### Option 4: 🎨 Create Custom Flag Component

Build a custom flag component using:
- Unicode flag emojis (simple but limited)
- CSS-based flag implementations
- Inline SVG definitions

## 📋 Current CSP Configuration

```javascript
// next.config.mjs - Current img-src allowlist
"img-src 'self' blob: data: https://res.cloudinary.com https://*.r2.dev https://vercel.com https://hatscripts.github.io"
```

## 🛠️ Files Requiring Updates

1. **`src/components/CustomForms/FormFields/CountryCombobox.tsx`**
   - Replace `CircleFlag` import and usage
   - Update flag rendering logic

2. **`package.json`**
   - Remove `react-circle-flags` dependency
   - Add new flag library dependency

3. **`next.config.mjs`** (if needed)
   - Update CSP img-src directive for new domains

## 🔍 Investigation Notes

### Library Research Results
- **`react-circle-flags`**: Last updated 8 months ago, potential reliability issues
- **Alternative sources**: `hatscripts.github.io/circle-flags/` (original, reliable)
- **CSP**: Already configured for `hatscripts.github.io`

### Network Analysis
- All flag requests return network errors
- No CORS issues detected (requests don't reach the server)
- Domain resolution or server availability problem

## 🚀 Recommended Implementation Plan

1. **Phase 1: Quick Fix**
   - Replace `react-circle-flags` with `country-flag-icons`
   - Update `CountryCombobox` component
   - Test flag display

2. **Phase 2: Optimization**
   - Self-host critical flag assets for performance
   - Implement fallback mechanisms
   - Add loading states for flag images

3. **Phase 3: Enhancement**
   - Add flag image preloading
   - Implement CDN caching strategy
   - Consider WebP format for better performance

## 📊 Impact Assessment

- **Severity**: Medium (UX impact, form functionality intact)
- **Affected Users**: All users using country selector
- **Countries**: All countries in the dropdown (150+ entries)
- **Priority**: High (government form should display properly)

## 🧪 Testing Checklist

After implementing fix:

- [ ] Flags display correctly in country dropdown
- [ ] No broken image placeholders
- [ ] Network tab shows successful flag loading
- [ ] Both French and Arabic locales work
- [ ] Mobile/desktop responsive behavior
- [ ] CSP compliance (no console errors)
- [ ] Performance impact assessment

## 📚 Additional Resources

- **Circle Flags Original**: https://hatscripts.github.io/circle-flags/
- **Country Flag Icons**: https://www.npmjs.com/package/country-flag-icons
- **React World Flags**: https://www.npmjs.com/package/react-world-flags
- **CSP Documentation**: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP

---

**Last Updated**: 2024-08-13  
**Status**: ✅ FIXED - Solution Implemented Successfully  
**Solution**: Replaced react-circle-flags with static country-flag-icons SVGs

## ✅ Implemented Solution

**Final Implementation:**
- ✅ Replaced `react-circle-flags` with static flag files from `country-flag-icons`
- ✅ Updated `CountryCombobox.tsx` to use static `/flags/{CODE}.svg` paths  
- ✅ Copied 259 flag SVG files to `public/flags/` directory
- ✅ Added globe.svg fallback for missing flags and "OTHER" option
- ✅ Fixed case sensitivity (flags stored as uppercase: MR.svg, MA.svg, etc.)
- ✅ Maintained bilingual support and RTL layout compatibility

**Technical Details:**
```typescript
// Final working implementation
const getFlagUrl = (countryCode: string | null): string => {
  if (!countryCode) return '/flags/globe.svg'
  return `/flags/${countryCode.toUpperCase()}.svg` // Fixed uppercase format
}

// Usage in component
<img
  src={getFlagUrl(selectedCountry.alpha2)}
  alt={`${selectedCountry.label} flag`}
  width={20} height={20}
  onError={/* Globe fallback */}
/>
```

**Files Modified:**
- ✅ `src/components/CustomForms/FormFields/CountryCombobox.tsx` - Updated implementation
- ✅ `public/flags/` - Added 259 country flag SVGs + globe.svg fallback
- ✅ No package.json changes needed (country-flag-icons was already installed)
- ✅ No CSP changes needed (self-hosted in public directory)