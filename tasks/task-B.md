# Task B: Category Filter Enhancement (Main Posts Page Integration)

**Priority**: Medium  
**Estimated Time**: 3-4 hours  
**Risk Level**: Low  
**Depends On**: Task A completion  

## Objective
Add category filtering capability to the main posts page (`/[locale]/posts`) allowing users to filter posts by category while maintaining existing functionality.

## Research Findings

### Current Posts Page Analysis ✅
- **Route**: `src/app/(frontend)/[locale]/posts/page.tsx`
- **Query**: Simple payload.find without `where` clause
- **Components**: Uses CollectionArchive, PageRange, Pagination
- **Search Params**: Currently only supports pagination via URL params

### Integration Strategy
Add category filtering as optional URL search parameter: `/posts?category=news`

## Required Modifications

### 1. Enhanced Posts Page Route
**File**: `src/app/(frontend)/[locale]/posts/page.tsx` (Modify existing)

```typescript
// Add searchParams to type definition
type Args = {
  params: Promise<{
    locale: string
  }>
  searchParams: Promise<{
    category?: string
  }>
}

export default async function Page({ 
  params: paramsPromise, 
  searchParams: searchParamsPromise 
}: Args) {
  const { locale } = await paramsPromise
  const { category } = await searchParamsPromise
  
  if (!isValidLocale(locale)) {
    notFound()
  }

  const payload = await getPayload({ config: configPromise })

  // Build query with optional category filter
  let whereClause = {}
  let selectedCategory = null

  if (category) {
    // Find category by slug
    const categoryResult = await payload.find({
      collection: 'categories',
      where: { slug: { equals: category } },
      limit: 1,
      locale,
    })

    if (categoryResult.docs.length > 0) {
      selectedCategory = categoryResult.docs[0]
      whereClause = {
        categories: { in: [selectedCategory.id] }
      }
    }
  }

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    locale,
    overrideAccess: false,
    where: whereClause, // Add conditional filtering
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
    },
  })

  // Get all categories for filter dropdown
  const allCategories = await payload.find({
    collection: 'categories',
    limit: 100,
    locale,
    sort: 'title',
  })

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>
            {selectedCategory ? selectedCategory.title : 'Posts'}
          </h1>
          {selectedCategory && (
            <p className="text-muted-foreground">
              {locale === 'ar' ? 'في فئة' : 'Dans la catégorie'}: {selectedCategory.title}
            </p>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="container mb-8">
        <CategoryFilter 
          categories={allCategories.docs}
          selectedCategory={category}
          locale={locale}
        />
      </div>

      <div className="container mb-8">
        <PageRange
          collection="posts"
          currentPage={posts.page}
          limit={12}
          totalDocs={posts.totalDocs}
        />
      </div>

      <CollectionArchive posts={posts.docs} locale={locale} />

      <div className="container">
        {posts.totalPages > 1 && posts.page && (
          <Pagination 
            page={posts.page} 
            totalPages={posts.totalPages}
            preserveSearchParams={true} // NEW: preserve category filter
          />
        )}
      </div>
    </div>
  )
}
```

### 2. Category Filter Component
**File**: `src/components/CategoryFilter/index.tsx` (New)

```typescript
'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import type { Category } from '@/payload-types'
import type { Locale } from '@/utilities/locale'

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory?: string
  locale: Locale
}

export function CategoryFilter({ 
  categories, 
  selectedCategory, 
  locale 
}: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleCategorySelect = (categorySlug: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('category', categorySlug)
    router.push(`?${params.toString()}`)
  }

  const handleClearFilter = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('category')
    const queryString = params.toString()
    router.push(queryString ? `?${queryString}` : window.location.pathname)
  }

  const selectedCategoryObj = categories.find(cat => cat.slug === selectedCategory)

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <span className="text-sm font-medium text-gray-700">
        {locale === 'ar' ? 'فلترة حسب الفئة:' : 'Filtrer par catégorie:'}
      </span>
      
      {/* Active Filter */}
      {selectedCategoryObj && (
        <Badge variant="default" className="flex items-center gap-1">
          {selectedCategoryObj.title}
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 hover:bg-transparent"
            onClick={handleClearFilter}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {/* Category Buttons */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.slug ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategorySelect(category.slug)}
          >
            {category.title}
          </Button>
        ))}
      </div>

      {/* Clear All */}
      {selectedCategory && (
        <Button variant="ghost" size="sm" onClick={handleClearFilter}>
          {locale === 'ar' ? 'إزالة الفلتر' : 'Effacer le filtre'}
        </Button>
      )}
    </div>
  )
}
```

### 3. Enhanced Pagination Component
**File**: `src/components/Pagination/index.tsx` (Minor modification)

```typescript
// Add preserveSearchParams prop
interface PaginationProps {
  // ... existing props
  preserveSearchParams?: boolean
}

// In navigation logic:
const handlePageClick = (page: number) => {
  let url = `${basePath}/page/${page}`
  
  if (preserveSearchParams) {
    const currentParams = new URLSearchParams(window.location.search)
    const queryString = currentParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }
  
  router.push(url)
}
```

## Implementation Steps

### Step 1: Modify Posts Page Route (1.5-2 hours)
1. Add searchParams parameter handling
2. Implement conditional where clause for category filtering
3. Fetch categories for filter component
4. Test basic filtering functionality

### Step 2: Create Category Filter Component (1-1.5 hours)
1. Build filter UI with category buttons
2. Implement URL parameter management
3. Add clear filter functionality
4. Style with HAPA brand colors

### Step 3: Enhance Pagination (30 minutes)
1. Add preserveSearchParams option
2. Test pagination maintains category filter
3. Ensure URL parameters persist correctly

### Step 4: Integration Testing (1 hour)
1. Test filtering with various categories
2. Verify pagination preserves filters
3. Test French/Arabic localization
4. Validate URL parameter handling

## Success Criteria

- [ ] URL filtering works: `/fr/posts?category=news`
- [ ] Category filter UI displays all available categories
- [ ] Active filter is clearly indicated
- [ ] Clear filter functionality works
- [ ] Pagination preserves category filter
- [ ] No interference with existing posts functionality
- [ ] Bilingual support (French/Arabic)
- [ ] Mobile-responsive filter interface

## URL Pattern Examples

```
/fr/posts                          # All posts
/fr/posts?category=news            # News category
/fr/posts?category=news&page=2     # News category, page 2
/ar/posts?category=decisions       # Decisions category (Arabic)
```

## Component Integration

### Filter Component Features
- **Visual Indicators**: Active category highlighted
- **Clear Options**: Remove individual or all filters
- **Responsive Design**: Works on mobile and desktop
- **Accessibility**: Proper ARIA labels and keyboard navigation

### Pagination Enhancement
- **Parameter Preservation**: Maintains category filter across pages
- **URL Management**: Clean URL parameter handling
- **Backward Compatibility**: Existing pagination unchanged

## Benefits

1. **Enhanced UX**: Users can filter posts without leaving main page
2. **SEO Friendly**: Clean URL parameters for search engines
3. **Scalable**: Works with unlimited categories
4. **Maintainable**: Minimal changes to existing codebase
5. **Accessible**: Full keyboard and screen reader support

## Future Enhancements (Post Task B)

- Multiple category selection
- Search within category results
- Category-based RSS feeds
- Advanced filter combinations
- Filter state persistence

## Integration with Task A

Task B builds on Task A by:
1. **Shared Components**: Uses same CollectionArchive and Pagination
2. **Query Patterns**: Uses same category filtering logic
3. **URL Structure**: Complements dedicated category routes
4. **User Experience**: Provides alternative path to category content

This creates a comprehensive category system where users can:
- Browse dedicated category pages (`/posts/category/news`)
- Filter the main posts page (`/posts?category=news`)
- Navigate seamlessly between both approaches