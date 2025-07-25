# Task A: Category Route Implementation (Core Frontend-Payload Integration)

**Priority**: High  
**Estimated Time**: 4-6 hours  
**Risk Level**: Low  

## Objective
Create category-specific routes that integrate seamlessly with Payload CMS categories, allowing users to view posts filtered by category.

## Research Findings

### Current Integration Analysis ✅
- **Posts Collection**: Already has `categories` relationship field (`hasMany: true`)
- **Categories Collection**: Existing with bilingual support (French/Arabic + RTL)
- **Query Pattern**: ArchiveBlock component already demonstrates category filtering:
  ```typescript
  where: { categories: { in: flattenedCategories } }
  ```
- **Display Logic**: CollectionArchive and Card components already handle categories display

### Required Files (Zero Conflicts)

#### 1. Category Page Route
**File**: `src/app/(frontend)/[locale]/posts/category/[slug]/page.tsx`

```typescript
import type { Metadata } from 'next/types'
import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { isValidLocale } from '@/utilities/locale'
import { notFound } from 'next/navigation'

export const dynamic = 'force-static'
export const revalidate = 600

type Args = {
  params: Promise<{
    locale: string
    slug: string
  }>
}

export default async function CategoryPage({ params: paramsPromise }: Args) {
  const { locale, slug } = await paramsPromise
  
  if (!isValidLocale(locale)) {
    notFound()
  }

  const payload = await getPayload({ config: configPromise })

  // 1. Find category by slug
  const categoryResult = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
    locale,
  })

  if (categoryResult.docs.length === 0) {
    notFound()
  }

  const category = categoryResult.docs[0]

  // 2. Find posts in this category (using existing ArchiveBlock pattern)
  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    locale,
    overrideAccess: false,
    where: {
      categories: { in: [category.id] }
    },
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
    },
  })

  return (
    <div className="pt-24 pb-24">
      {/* Category Header */}
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>{category.title}</h1>
          <p className="text-muted-foreground">
            {posts.totalDocs} {locale === 'ar' ? 'مقال' : 'articles'}
          </p>
        </div>
      </div>

      {/* Posts Count */}
      <div className="container mb-8">
        <PageRange
          collection="posts"
          currentPage={posts.page}
          limit={12}
          totalDocs={posts.totalDocs}
        />
      </div>

      {/* Posts Grid (reusing existing component) */}
      <CollectionArchive posts={posts.docs} locale={locale} />

      {/* Pagination */}
      <div className="container">
        {posts.totalPages > 1 && posts.page && (
          <Pagination 
            page={posts.page} 
            totalPages={posts.totalPages}
            basePath={`/${locale}/posts/category/${slug}`}
          />
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale, slug } = await paramsPromise
  
  if (!isValidLocale(locale)) {
    return {}
  }

  // Get category for meta
  const payload = await getPayload({ config: configPromise })
  const categoryResult = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
    locale,
  })

  if (categoryResult.docs.length === 0) {
    return {}
  }

  const category = categoryResult.docs[0]
  const title = `${category.title} - HAPA`

  return {
    title,
    description: `Articles dans la catégorie ${category.title}`,
    alternates: {
      languages: {
        'fr': `/fr/posts/category/${slug}`,
        'ar': `/ar/posts/category/${slug}`
      }
    }
  }
}

export async function generateStaticParams() {
  // Generate for common categories - can be expanded
  return [
    { locale: 'fr', slug: 'news' },
    { locale: 'ar', slug: 'news' },
    // Add more as categories are created in admin
  ]
}
```

#### 2. Enhanced Pagination Component
**File**: `src/components/Pagination/index.tsx` (Minor modification)

Add `basePath` prop to support category routes:

```typescript
// Add this prop to the component interface:
interface PaginationProps {
  // ... existing props
  basePath?: string  // NEW: for category pagination
}

// Update the navigation logic:
const basePath = props.basePath || `/posts`
// router.push(`/posts/page/${page}`) becomes:
router.push(`${basePath}/page/${page}`)
```

#### 3. Category Pagination Route
**File**: `src/app/(frontend)/[locale]/posts/category/[slug]/page/[pageNumber]/page.tsx`

Copy pattern from existing pagination route but add category filtering.

## Implementation Steps

### Step 1: Create Category Page Route (2-3 hours)
1. Create directory structure: `src/app/(frontend)/[locale]/posts/category/[slug]/`
2. Implement `page.tsx` with category filtering query
3. Test with existing categories in admin panel
4. Verify bilingual functionality (French/Arabic)

### Step 2: Test Payload Integration (1 hour)
1. Create test categories in Payload admin
2. Assign posts to categories  
3. Verify category routes display correct posts
4. Test locale switching works

### Step 3: Add Pagination Support (1-2 hours)  
1. Modify Pagination component to accept `basePath` prop
2. Create category pagination route
3. Test pagination with large category datasets

### Step 4: Validation & Testing (1 hour)
1. Test 404 handling for invalid category slugs
2. Verify SEO metadata generation
3. Test static generation build process
4. Check RTL layout for Arabic

## Success Criteria

- [ ] Category URLs work: `/fr/posts/category/news` and `/ar/posts/category/news`
- [ ] Posts are correctly filtered by category using Payload query
- [ ] Existing components (CollectionArchive, Card) work unchanged
- [ ] Categories display bilingual content correctly  
- [ ] Pagination works for category routes
- [ ] 404 pages for invalid categories
- [ ] Static generation builds successfully
- [ ] SEO metadata generates properly
- [ ] No regression in existing posts pages

## Payload CMS Integration Points

### Query Pattern (From ArchiveBlock)
```typescript
// Proven working pattern for category filtering:
where: {
  categories: { in: [categoryId] }
}
```

### Category Relationship
```typescript
// Posts already have categories relationship:
{
  name: 'categories',
  type: 'relationship',
  relationTo: 'categories',
  hasMany: true,
}
```

### Localization Support
```typescript
// Categories collection already supports:
localized: true  // for title field
```

## Benefits

1. **Zero Breaking Changes**: Uses existing component architecture
2. **Proven Patterns**: Follows existing pagination and query patterns  
3. **Minimal Code**: Reuses 90% of existing functionality
4. **Immediate Results**: Works with categories you create in admin
5. **Scalable**: Supports unlimited categories and posts
6. **SEO Ready**: Proper metadata and static generation

## Dependencies

- **Admin Created Categories**: Requires categories to be created in Payload admin
- **Post Assignment**: Requires posts to be assigned to categories
- **Existing Components**: Leverages CollectionArchive and Card components

## Next Steps (Task B)

After Task A completion, the foundation will be ready for:
- Category navigation integration
- Category overview page
- Advanced filtering features
- Category-based search enhancement

This task provides the core infrastructure for category-based content organization while maintaining the existing high-quality standards of the HAPA website.