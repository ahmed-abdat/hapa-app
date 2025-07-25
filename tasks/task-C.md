# Task C: Navigation Publication Routes with Category Integration

**Priority**: High  
**Estimated Time**: 4-5 hours  
**Risk Level**: Low  
**Dependencies**: Categories in Payload admin  

## Objective
Create publication-specific routes that display posts filtered by category, with full pagination support and bilingual routing (French/Arabic).

## Navigation Analysis

### Current Navigation Routes Needing Implementation

Based on `src/components/navigation/navigation-items.ts`, these routes are missing:

#### Publications Section (`/publications/*`)
1. **`/publications/decisions`** → "Décisions et communiqués" / "قرارات وبيانات"
2. **`/publications/reports`** → "Rapports" / "تقارير" 
3. **`/publications/laws`** → "Lois et règlements" / "قوانين وتشريعات"

#### News Section  
4. **`/news`** → "Actualités" / "الأخبار"

### Additional Publication Types (From Your Request)
You also mentioned these specific publication categories:
- **قوانين وتشريعات** (Laws and Legislation)
- **تقارير** (Reports)  
- **إصدرات ومنشورات** (Publications and Releases)
- **قرارات وبيانات** (Decisions and Statements)

## Route Structure Design

### URL Pattern
```
/[locale]/publications/[category-type]        # Main page
/[locale]/publications/[category-type]/page/[pageNumber]  # Pagination
/[locale]/news                                # News main page  
/[locale]/news/page/[pageNumber]             # News pagination
```

### Category Mapping
| Route | Category Slug | French Title | Arabic Title |
|-------|---------------|--------------|--------------|
| `/publications/decisions` | `decisions` | Décisions et communiqués | قرارات وبيانات |
| `/publications/reports` | `reports` | Rapports | تقارير |
| `/publications/laws` | `laws` | Lois et règlements | قوانين وتشريعات |
| `/publications/publications` | `publications` | Publications et éditions | إصدرات ومنشورات |
| `/news` | `news` | Actualités | الأخبار |

## Implementation Files

### 1. Dynamic Publications Route (Recommended Approach)
**File**: `src/app/(frontend)/[locale]/publications/[category]/page.tsx`

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

// Valid publication categories
const PUBLICATION_CATEGORIES = {
  'decisions': {
    fr: 'Décisions et communiqués',
    ar: 'قرارات وبيانات',
    description: {
      fr: 'Décisions officielles et communiqués de presse de HAPA',
      ar: 'القرارات الرسمية والبيانات الصحفية للهابا'
    }
  },
  'reports': {
    fr: 'Rapports',
    ar: 'تقارير',
    description: {
      fr: 'Rapports d\'activité et études sectorielles',
      ar: 'تقارير النشاط والدراسات القطاعية'
    }
  },
  'laws': {
    fr: 'Lois et règlements',
    ar: 'قوانين وتشريعات',
    description: {
      fr: 'Cadre juridique et textes réglementaires',
      ar: 'الإطار القانوني والنصوص التنظيمية'
    }
  },
  'publications': {
    fr: 'Publications et éditions',
    ar: 'إصدرات ومنشورات',
    description: {
      fr: 'Publications officielles et documents édités',
      ar: 'المنشورات الرسمية والوثائق المحررة'
    }
  }
} as const

type Args = {
  params: Promise<{
    locale: string
    category: string
  }>
  searchParams: Promise<{
    page?: string
  }>
}

export default async function PublicationCategoryPage({ 
  params: paramsPromise, 
  searchParams: searchParamsPromise 
}: Args) {
  const { locale, category } = await paramsPromise
  const { page } = await searchParamsPromise
  
  if (!isValidLocale(locale)) {
    notFound()
  }

  // Validate category
  if (!(category in PUBLICATION_CATEGORIES)) {
    notFound()
  }

  const currentPage = page ? parseInt(page, 10) : 1
  const categoryInfo = PUBLICATION_CATEGORIES[category as keyof typeof PUBLICATION_CATEGORIES]

  const payload = await getPayload({ config: configPromise })

  // Find category in Payload CMS
  const categoryResult = await payload.find({
    collection: 'categories',
    where: { slug: { equals: category } },
    limit: 1,
    locale,
  })

  if (categoryResult.docs.length === 0) {
    // Category doesn't exist in CMS - show empty state
    return (
      <PublicationEmptyState 
        locale={locale} 
        categoryInfo={categoryInfo}
        categorySlug={category}
      />
    )
  }

  const categoryDoc = categoryResult.docs[0]

  // Find posts in this category with pagination
  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    page: currentPage,
    locale,
    overrideAccess: false,
    where: {
      categories: { in: [categoryDoc.id] }
    },
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
      publishedAt: true,
    },
    sort: '-publishedAt',
  })

  return (
    <div className="pt-24 pb-24">
      {/* Page Header */}
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>{categoryInfo[locale as 'fr' | 'ar']}</h1>
          <p className="text-muted-foreground">
            {categoryInfo.description[locale as 'fr' | 'ar']}
          </p>
          <p className="text-sm text-muted-foreground">
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

      {/* Posts Grid */}
      {posts.docs.length > 0 ? (
        <>
          <CollectionArchive posts={posts.docs} locale={locale} />
          
          <div className="container">
            {posts.totalPages > 1 && posts.page && (
              <Pagination 
                page={posts.page} 
                totalPages={posts.totalPages}
                basePath={`/${locale}/publications/${category}`}
              />
            )}
          </div>
        </>
      ) : (
        <PublicationEmptyState 
          locale={locale} 
          categoryInfo={categoryInfo}
          categorySlug={category}
          hasCategory={true}
        />
      )}
    </div>
  )
}

// Empty state component
function PublicationEmptyState({ 
  locale, 
  categoryInfo, 
  categorySlug,
  hasCategory = false 
}: { 
  locale: string
  categoryInfo: any
  categorySlug: string
  hasCategory?: boolean
}) {
  return (
    <div className="pt-24 pb-24">
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>{categoryInfo[locale as 'fr' | 'ar']}</h1>
          <p className="text-muted-foreground">
            {categoryInfo.description[locale as 'fr' | 'ar']}
          </p>
        </div>
      </div>
      
      <div className="container">
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📄</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {locale === 'ar' ? 'لا توجد منشورات' : 'Aucune publication'}
          </h2>
          <p className="text-gray-600">
            {hasCategory ? (
              locale === 'ar' 
                ? 'لا توجد منشورات في هذه الفئة حاليًا'
                : 'Aucune publication n\'est disponible dans cette catégorie pour le moment.'
            ) : (
              locale === 'ar'
                ? 'يجب إنشاء هذه الفئة في لوحة التحكم أولاً'
                : 'Cette catégorie doit être créée dans le panneau d\'administration.'
            )}
          </p>
          {!hasCategory && (
            <p className="text-sm text-gray-500 mt-2">
              {locale === 'ar' 
                ? `قم بإنشاء فئة بالرمز: ${categorySlug}`
                : `Créez une catégorie avec le slug: ${categorySlug}`
              }
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale, category } = await paramsPromise
  
  if (!(category in PUBLICATION_CATEGORIES)) {
    return {}
  }

  const categoryInfo = PUBLICATION_CATEGORIES[category as keyof typeof PUBLICATION_CATEGORIES]
  const title = `${categoryInfo[locale as 'fr' | 'ar']} - HAPA`
  const description = categoryInfo.description[locale as 'fr' | 'ar']

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    alternates: {
      languages: {
        'fr': `/fr/publications/${category}`,
        'ar': `/ar/publications/${category}`
      }
    }
  }
}

export async function generateStaticParams() {
  const categories = Object.keys(PUBLICATION_CATEGORIES)
  const locales = ['fr', 'ar']
  
  return categories.flatMap(category =>
    locales.map(locale => ({
      locale,
      category
    }))
  )
}
```

### 2. Dynamic Publications Pagination Route
**File**: `src/app/(frontend)/[locale]/publications/[category]/page/[pageNumber]/page.tsx`

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

// Import the same PUBLICATION_CATEGORIES from the main page
const PUBLICATION_CATEGORIES = {
  'decisions': {
    fr: 'Décisions et communiqués',
    ar: 'قرارات وبيانات',
    description: {
      fr: 'Décisions officielles et communiqués de presse de HAPA',
      ar: 'القرارات الرسمية والبيانات الصحفية للهابا'
    }
  },
  'reports': {
    fr: 'Rapports',
    ar: 'تقارير',
    description: {
      fr: 'Rapports d\'activité et études sectorielles',
      ar: 'تقارير النشاط والدراسات القطاعية'
    }
  },
  'laws': {
    fr: 'Lois et règlements',
    ar: 'قوانين وتشريعات',
    description: {
      fr: 'Cadre juridique et textes réglementaires',
      ar: 'الإطار القانوني والنصوص التنظيمية'
    }
  },
  'publications': {
    fr: 'Publications et éditions',
    ar: 'إصدرات ومنشورات',
    description: {
      fr: 'Publications officielles et documents édités',
      ar: 'المنشورات الرسمية والوثائق المحررة'
    }
  }
} as const

export const dynamic = 'force-static'
export const revalidate = 600

type Args = {
  params: Promise<{
    locale: string
    category: string
    pageNumber: string
  }>
}

export default async function PublicationCategoryPaginationPage({ params: paramsPromise }: Args) {
  const { locale, category, pageNumber } = await paramsPromise
  
  if (!isValidLocale(locale)) {
    notFound()
  }

  // Validate category
  if (!(category in PUBLICATION_CATEGORIES)) {
    notFound()
  }

  const currentPage = parseInt(pageNumber, 10)
  
  if (isNaN(currentPage) || currentPage < 1) {
    notFound()
  }

  const categoryInfo = PUBLICATION_CATEGORIES[category as keyof typeof PUBLICATION_CATEGORIES]
  const payload = await getPayload({ config: configPromise })

  // Find category in Payload CMS
  const categoryResult = await payload.find({
    collection: 'categories',
    where: { slug: { equals: category } },
    limit: 1,
    locale,
  })

  if (categoryResult.docs.length === 0) {
    notFound()
  }

  const categoryDoc = categoryResult.docs[0]

  // Find posts with pagination
  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    page: currentPage,
    locale,
    overrideAccess: false,
    where: {
      categories: { in: [categoryDoc.id] }
    },
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
      publishedAt: true,
    },
    sort: '-publishedAt',
  })

  // If page number is beyond available pages, redirect to last page
  if (currentPage > posts.totalPages && posts.totalPages > 0) {
    notFound()
  }

  return (
    <div className="pt-24 pb-24">
      {/* Page Header */}
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>{categoryInfo[locale as 'fr' | 'ar']}</h1>
          <p className="text-muted-foreground">
            {categoryInfo.description[locale as 'fr' | 'ar']}
          </p>
          <p className="text-sm text-muted-foreground">
            {locale === 'ar' ? 'الصفحة' : 'Page'} {currentPage} {locale === 'ar' ? 'من' : 'de'} {posts.totalPages} - {posts.totalDocs} {locale === 'ar' ? 'مقال' : 'articles'}
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

      {/* Posts Grid */}
      <CollectionArchive posts={posts.docs} locale={locale} />

      {/* Pagination */}
      <div className="container">
        {posts.totalPages > 1 && (
          <Pagination 
            page={posts.page} 
            totalPages={posts.totalPages}
            basePath={`/${locale}/publications/${category}`}
          />
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale, category, pageNumber } = await paramsPromise
  
  if (!(category in PUBLICATION_CATEGORIES)) {
    return {}
  }

  const categoryInfo = PUBLICATION_CATEGORIES[category as keyof typeof PUBLICATION_CATEGORIES]
  const title = `${categoryInfo[locale as 'fr' | 'ar']} - ${locale === 'ar' ? 'الصفحة' : 'Page'} ${pageNumber} - HAPA`
  const description = categoryInfo.description[locale as 'fr' | 'ar']

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    alternates: {
      languages: {
        'fr': `/fr/publications/${category}/page/${pageNumber}`,
        'ar': `/ar/publications/${category}/page/${pageNumber}`
      }
    }
  }
}

export async function generateStaticParams() {
  const categories = Object.keys(PUBLICATION_CATEGORIES)
  const locales = ['fr', 'ar']
  
  // Generate first few pages for each category
  return categories.flatMap(category =>
    locales.flatMap(locale =>
      [1, 2, 3, 4, 5].map(pageNumber => ({
        locale,
        category,
        pageNumber: pageNumber.toString()
      }))
    )
  )
}
```

### 3. News Route
**File**: `src/app/(frontend)/[locale]/news/page.tsx`

```typescript
// Similar to publications but for news category
// Category slug: 'news'
// Routes: /news and /news/page/[pageNumber]
```

### 4. News Pagination Route
**File**: `src/app/(frontend)/[locale]/news/page/[pageNumber]/page.tsx`

```typescript
// Similar to publications pagination but for news
```

## Implementation Steps

### Step 1: Create Directory Structure (15 minutes)
```bash
mkdir -p src/app/\(frontend\)/\[locale\]/publications/\[category\]/page/\[pageNumber\]
mkdir -p src/app/\(frontend\)/\[locale\]/news/page/\[pageNumber\]
```

### Step 2: Implement Publications Routes (2.5 hours)
1. Create dynamic publications route with category validation
2. Create pagination route for publications
3. Test with various category slugs

### Step 3: Implement News Routes (1 hour)
1. Create news main page
2. Create news pagination route
3. Test news functionality

### Step 4: Admin Setup (30 minutes)
Create categories in Payload admin with exact slugs:
- `decisions` → "Décisions et communiqués" / "قرارات وبيانات"
- `reports` → "Rapports" / "تقارير"
- `laws` → "Lois et règlements" / "قوانين وتشريعات"  
- `publications` → "Publications et éditions" / "إصدرات ومنشورات"
- `news` → "Actualités" / "الأخبار"

### Step 5: Testing & Validation (1 hour)
1. Test all publication routes
2. Test pagination functionality
3. Verify bilingual content
4. Test empty states

## Expected Results

### Working Routes
- ✅ `/fr/publications/decisions` + pagination
- ✅ `/fr/publications/reports` + pagination  
- ✅ `/fr/publications/laws` + pagination
- ✅ `/fr/publications/publications` + pagination
- ✅ `/fr/news` + pagination
- ✅ All Arabic equivalents with RTL layout

### Features
- ✅ Posts filtered by category automatically
- ✅ Full pagination support (12 posts per page)
- ✅ Bilingual support with proper metadata
- ✅ Empty states when no content
- ✅ SEO-friendly URLs
- ✅ Static generation for performance

## Categories Required in Admin

| Slug | French Title | Arabic Title |
|------|--------------|--------------|
| `decisions` | Décisions et communiqués | قرارات وبيانات |
| `reports` | Rapports | تقارير |
| `laws` | Lois et règlements | قوانين وتشريعات |
| `publications` | Publications et éditions | إصدرات ومنشورات |
| `news` | Actualités | الأخبار |

## Success Criteria

- [ ] All navigation routes resolve correctly
- [ ] Posts display filtered by appropriate category
- [ ] Pagination works on all routes
- [ ] Bilingual content with proper RTL
- [ ] Empty states for missing categories/content
- [ ] SEO metadata generates correctly
- [ ] Static generation builds successfully
- [ ] No 404s on navigation links

This implementation provides a complete publication system that integrates seamlessly with your existing navigation and Payload CMS categories.