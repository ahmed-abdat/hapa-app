import { test, expect } from '@playwright/test';

test.describe('HAPA Category Integration System', () => {
  // Test data setup
  const locales = ['fr', 'ar'];
  const testCategories = [
    { slug: 'decisions', fr: 'Décisions et communiqués', ar: 'قرارات وبيانات' },
    { slug: 'reports', fr: 'Rapports', ar: 'تقارير' },
    { slug: 'laws', fr: 'Lois et règlements', ar: 'قوانين وتشريعات' },
    { slug: 'publications', fr: 'Publications et éditions', ar: 'إصدرات ومنشورات' },
    { slug: 'news', fr: 'Actualités', ar: 'الأخبار' }
  ];

  test.describe('Task A: Core Category Routes', () => {
    test('should load category pages for all locales', async ({ page }) => {
      for (const locale of locales) {
        for (const category of testCategories.slice(0, 2)) { // Test first 2 categories
          const url = `/${locale}/posts/category/${category.slug}`;
          
          console.log(`Testing category route: ${url}`);
          
          // Navigate to category page
          await page.goto(url);
          
          // Check that we don't get a 404
          await expect(page).not.toHaveTitle(/404|Not Found/i);
          
          // Check for category page structure
          await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
          
          // Verify bilingual content based on locale
          if (locale === 'ar') {
            // Check RTL direction for Arabic
            await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
            
            // Check for Arabic content if category exists
            const heading = page.locator('h1');
            if (await heading.isVisible()) {
              const headingText = await heading.textContent();
              if (headingText && !headingText.includes('404')) {
                console.log(`Arabic category found: ${headingText}`);
              }
            }
          } else {
            // Check LTR direction for French
            await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
          }
          
          // Check for posts grid or empty state
          const postsGrid = page.locator('[class*="grid"]').first();
          const emptyState = page.locator('text=/no posts|aucun article|لا توجد/i');
          
          // Either posts grid or empty state should be visible
          await expect.soft(postsGrid.or(emptyState)).toBeVisible();
        }
      }
    });

    test('should handle pagination on category pages', async ({ page }) => {
      // Test pagination on a category that might have content
      const testUrl = '/fr/posts/category/news';
      
      await page.goto(testUrl);
      await expect(page).not.toHaveTitle(/404|Not Found/i);
      
      // Look for pagination controls
      const paginationNext = page.locator('[aria-label*="Next"], [aria-label*="Suivant"], button:has-text("Next"), button:has-text("Suivant")');
      const paginationPrev = page.locator('[aria-label*="Previous"], [aria-label*="Précédent"], button:has-text("Previous"), button:has-text("Précédent")');
      
      // If pagination exists, test it
      if (await paginationNext.isVisible()) {
        await paginationNext.click();
        
        // Should navigate to page 2
        await expect(page).toHaveURL(/\/page\/2/);
        
        // Previous button should now be visible
        await expect(paginationPrev).toBeVisible();
      }
    });

    test('should return 404 for invalid category slugs', async ({ page }) => {
      const invalidUrl = '/fr/posts/category/invalid-category-slug';
      
      await page.goto(invalidUrl);
      
      // Should get 404 page
      await expect(page).toHaveTitle(/404|Not Found/i);
    });
  });

  test.describe('Task B: Posts Page Category Filtering', () => {
    test('should show category filter on posts page', async ({ page }) => {
      for (const locale of ['fr', 'ar']) {
        const postsUrl = `/${locale}/posts`;
        
        await page.goto(postsUrl);
        await expect(page).not.toHaveTitle(/404|Not Found/i);
        
        // Look for category filter component
        const filterText = locale === 'ar' ? 'فلترة حسب الفئة' : 'Filtrer par catégorie';
        const categoryFilter = page.locator(`text=${filterText}`).or(
          page.locator('[class*="CategoryFilter"], [data-testid*="category-filter"]')
        );
        
        // Category filter should be visible if categories exist
        if (await categoryFilter.isVisible()) {
          console.log(`Category filter found on ${postsUrl}`);
          
          // Look for filter buttons
          const filterButtons = page.locator('button[class*="outline"], button:has-text("Actualités"), button:has-text("الأخبار")');
          await expect.soft(filterButtons.first()).toBeVisible();
        } else {
          console.log(`No category filter found on ${postsUrl} - categories may not exist yet`);
        }
      }
    });

    test('should filter posts by category via URL parameters', async ({ page }) => {
      // Test filtering with URL parameters
      const filterUrl = '/fr/posts?category=news';
      
      await page.goto(filterUrl);
      await expect(page).not.toHaveTitle(/404|Not Found/i);
      
      // Check that URL parameter is reflected in page state
      await expect(page).toHaveURL(/category=news/);
      
      // Check for filtered content indication
      const heading = page.locator('h1');
      if (await heading.isVisible()) {
        const headingText = await heading.textContent();
        console.log(`Filtered page heading: ${headingText}`);
      }
    });

    test('should preserve filters during pagination', async ({ page }) => {
      const filterUrl = '/fr/posts?category=news';
      
      await page.goto(filterUrl);
      await expect(page).not.toHaveTitle(/404|Not Found/i);
      
      // Look for pagination with filters
      const paginationNext = page.locator('[aria-label*="Next"], button:has-text("Next")');
      
      if (await paginationNext.isVisible()) {
        await paginationNext.click();
        
        // Should preserve category filter in URL
        await expect(page).toHaveURL(/category=news/);
        await expect(page).toHaveURL(/page/);
      }
    });
  });

  test.describe('Task C: Government Publication Routes', () => {
    test('should load publication category pages', async ({ page }) => {
      const publicationCategories = ['decisions', 'reports', 'laws', 'publications'];
      
      for (const locale of locales) {
        for (const category of publicationCategories.slice(0, 2)) { // Test first 2
          const url = `/${locale}/publications/${category}`;
          
          console.log(`Testing publication route: ${url}`);
          
          await page.goto(url);
          await expect(page).not.toHaveTitle(/404|Not Found/i);
          
          // Check page structure
          await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
          
          // Check for proper locale direction
          if (locale === 'ar') {
            await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
          } else {
            await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
          }
          
          // Check for content or empty state
          const contentArea = page.locator('main, [class*="container"]').first();
          await expect(contentArea).toBeVisible();
        }
      }
    });

    test('should load news routes', async ({ page }) => {
      for (const locale of locales) {
        const newsUrl = `/${locale}/news`;
        
        console.log(`Testing news route: ${newsUrl}`);
        
        await page.goto(newsUrl);
        await expect(page).not.toHaveTitle(/404|Not Found/i);
        
        // Check page structure
        await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
        
        // Check for proper locale direction
        if (locale === 'ar') {
          await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
        } else {
          await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
        }
      }
    });

    test('should handle publication pagination', async ({ page }) => {
      const testUrl = '/fr/publications/decisions';
      
      await page.goto(testUrl);
      await expect(page).not.toHaveTitle(/404|Not Found/i);
      
      // Look for pagination
      const paginationNext = page.locator('[aria-label*="Next"], button:has-text("Next")');
      
      if (await paginationNext.isVisible()) {
        await paginationNext.click();
        
        // Should navigate to page 2
        await expect(page).toHaveURL(/\/page\/2/);
      }
    });

    test('should return 404 for invalid publication categories', async ({ page }) => {
      const invalidUrl = '/fr/publications/invalid-category';
      
      await page.goto(invalidUrl);
      
      // Should get 404 page
      await expect(page).toHaveTitle(/404|Not Found/i);
    });
  });

  test.describe('SEO and Accessibility', () => {
    test('should have proper meta tags on category pages', async ({ page }) => {
      const testUrl = '/fr/posts/category/news';
      
      await page.goto(testUrl);
      
      if (!await page.title().then(title => title.includes('404'))) {
        // Check for basic SEO meta tags
        await expect(page).toHaveTitle(/HAPA/);
        
        // Check for meta description
        const metaDescription = page.locator('meta[name="description"]');
        if (await metaDescription.count() > 0) {
          await expect(metaDescription).toHaveAttribute('content', /.+/);
        }
        
        // Check for hreflang tags
        const hreflangTags = page.locator('link[hreflang]');
        if (await hreflangTags.count() > 0) {
          console.log(`Found ${await hreflangTags.count()} hreflang tags`);
        }
      }
    });

    test('should maintain keyboard navigation', async ({ page }) => {
      await page.goto('/fr/posts');
      
      // Test keyboard navigation through interactive elements
      await page.keyboard.press('Tab');
      
      // Check if focus is visible
      const focusedElement = page.locator(':focus');
      if (await focusedElement.count() > 0) {
        await expect(focusedElement).toBeVisible();
      }
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      const testUrl = '/fr/posts/category/news';
      
      await page.goto(testUrl);
      
      if (!await page.title().then(title => title.includes('404'))) {
        // Check for h1 tag
        const h1 = page.locator('h1');
        await expect(h1).toHaveCount(1);
        await expect(h1).toBeVisible();
      }
    });
  });

  test.describe('Performance and Loading', () => {
    test('should load pages within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/fr/posts');
      
      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      console.log(`Page load time: ${loadTime}ms`);
      
      // Should load within 5 seconds (generous for testing)
      expect(loadTime).toBeLessThan(5000);
    });

    test('should handle concurrent requests', async ({ browser }) => {
      const contexts = await Promise.all([
        browser.newContext(),
        browser.newContext(),
        browser.newContext()
      ]);
      
      const pages = await Promise.all(
        contexts.map(context => context.newPage())
      );
      
      // Load different category pages concurrently
      const urls = [
        '/fr/posts/category/news',
        '/ar/posts/category/news', 
        '/fr/publications/decisions'
      ];
      
      const startTime = Date.now();
      
      await Promise.all(
        pages.map((page, index) => page.goto(urls[index]))
      );
      
      const loadTime = Date.now() - startTime;
      console.log(`Concurrent load time: ${loadTime}ms`);
      
      // All pages should load successfully
      for (const page of pages) {
        await expect(page).not.toHaveTitle(/Error|500/i);
      }
      
      // Cleanup
      await Promise.all(contexts.map(context => context.close()));
    });
  });
});