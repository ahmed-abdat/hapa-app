# Development Guide & Common Patterns

This document contains essential development patterns, common mistakes, and ongoing improvements for the HAPA website project.

## Current Focus: Multilingual Slug Generation

### Status: ✅ Completed
**Goal**: Improve multilingual slug generation for better French/Arabic URL handling

### Current Implementation
- **Location**: `src/fields/slug/formatSlug.ts`
- **Pattern**: French-first slug generation with Arabic transliteration
- **Works**: Enhanced French → slug, Arabic → transliterated slug
- **Features**: Unicode normalization, proper Arabic handling, simplified code

### ✅ Completed Improvements
1. **Unicode Normalization**: Implemented proper NFD normalization for complex characters
2. **Code Deduplication**: Created shared utilities in `src/utilities/hooks/`
3. **Arabic Transliteration**: Uses `slugify` with `locale: 'ar'` for proper Arabic handling
4. **Debug Log Cleanup**: Removed all debug console.log statements
5. **French Locale Enforcement**: Fixed TypeScript errors and simplified logic

### Implementation Pattern
```typescript
// Current working pattern
export const formatSlug = (val: string, locale?: string): string => {
  const isArabic = /[\u0600-\u06FF]/.test(val)
  const options = {
    lower: true,
    strict: true,
    replacement: '-',
    trim: true,
    locale: isArabic || locale === 'ar' ? 'ar' : undefined,
  }
  return slugify(val, options)
}
```

## Common Development Mistakes & Solutions

### 1. Slug Generation Issues
**❌ Mistake**: Not normalizing Unicode before slug generation
```typescript
const slug = slugify(title) // Bad: raw string
```

**✅ Solution**: Always normalize Unicode first
```typescript
const slug = slugify(title.normalize('NFD')) // Good: normalized
```

### 2. Localization Errors
**❌ Mistake**: Hardcoded locale values
```typescript
const title = data.title.fr // Bad: hardcoded
```

**✅ Solution**: Use locale constants
```typescript
import { DEFAULT_LOCALE } from '@/utilities/locale'
const title = data.title[DEFAULT_LOCALE] // Good: constant
```

### 3. Missing Fallback Logic
**❌ Mistake**: No fallback for missing translations
```typescript
const title = data.title[locale] // Bad: might be undefined
```

**✅ Solution**: Always provide fallback
```typescript
const title = data.title[locale] || data.title[DEFAULT_LOCALE] // Good: fallback
```

### 4. Schema Changes Without Migrations
**❌ Mistake**: Modify collections without running migrations
```bash
# Edit collection files... (incomplete)
```

**✅ Solution**: Always run migrations and regenerate types
```bash
pnpm payload migrate
pnpm generate:types
```

### 5. RTL Layout Issues
**❌ Mistake**: Fixed LTR CSS classes
```typescript
<div className="ml-4 text-left"> // Bad: LTR only
```

**✅ Solution**: RTL-compatible classes
```typescript
<div className="ms-4 text-start"> // Good: RTL aware
```

## Essential Development Patterns

### Working with Localized Content
```typescript
// 1. Always create French content first (required for slugs)
// 2. Use fallback for missing translations
// 3. Test both LTR and RTL layouts
```

### Collection Schema Changes
```bash
# Required sequence:
1. Edit collection files
2. pnpm payload migrate
3. pnpm generate:types
4. Update components
5. Test with both languages
```

### Slug Field Usage
```typescript
// In collections:
import { slugField } from '@/fields/slug'

fields: [
  {
    name: 'title',
    type: 'text',
    localized: true,
    required: true,
  },
  ...slugField('title'), // Generates slug from title
]
```

## Quick Reference

### Essential Commands
```bash
pnpm dev                 # Start development
pnpm payload migrate     # Apply schema changes
pnpm generate:types      # Update TypeScript types
pnpm lint               # Check code quality
pnpm build              # Production build
```

### Key Files to Remember
- `src/fields/slug/formatSlug.ts` - Slug generation logic
- `src/utilities/locale.ts` - Locale configuration
- `src/utilities/translations.ts` - UI translations
- `src/collections/` - Content structure definitions

### Testing Checklist
- [ ] Test with French content (special characters: é, è, ç)
- [ ] Test with Arabic content (RTL layout)
- [ ] Test language switching
- [ ] Test admin interface in both languages
- [ ] Run `pnpm lint` before committing

## Current Priorities

1. **Slug Generation**: Enhance Unicode handling and uniqueness
2. **Performance**: Optimize database queries and caching
3. **Documentation**: Keep this guide updated with new patterns

## When Adding New Features

1. **Check existing patterns** in this document first
2. **Test with both languages** (French/Arabic)
3. **Update this document** with new patterns or mistakes
4. **Run migrations** if schema changes
5. **Test RTL layout** for Arabic content

---

*This document is the single source of truth for development patterns. Keep it updated and concise.*