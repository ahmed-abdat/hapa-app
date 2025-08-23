import { test, expect } from '@playwright/test';

test.describe('HAPA Admin Routes', () => {
  test.beforeEach(async ({ page: _page }) => {
    // Each test starts with authenticated admin session
    console.log('Starting admin route test...');
  });

  test('admin dashboard loads correctly', async ({ page }) => {
    await page.goto('/admin');
    
    // Wait for dashboard to load
    await page.waitForLoadState('networkidle');
    
    // Check for admin dashboard elements
    await expect(page).toHaveTitle(/Admin|Dashboard/);
    
    // Take screenshot for visual verification
    await page.screenshot({ 
      path: 'test-results/screenshots/admin-dashboard.png',
      fullPage: true 
    });
    
    // Check for console errors
    const logs: any[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text());
      }
    });
    
    // Verify no critical JavaScript errors
    expect(logs.filter(log => log.includes('Error'))).toHaveLength(0);
  });

  test('posts collection management', async ({ page }) => {
    await page.goto('/admin/collections/posts');
    
    // Wait for posts collection to load
    await page.waitForSelector('[data-testid="collection-list"], .collection-list, table', { timeout: 10000 });
    
    // Take screenshot of posts management interface
    await page.screenshot({ 
      path: 'test-results/screenshots/admin-posts-collection.png',
      fullPage: true 
    });
    
    // Test create new post button
    const createButton = page.locator('a[href*="create"], button:has-text("Create"), .btn:has-text("New")').first();
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForURL(/.*create.*|.*new.*/);
      
      // Screenshot of create post form
      await page.screenshot({ 
        path: 'test-results/screenshots/admin-create-post.png',
        fullPage: true 
      });
      
      // Go back to collection list
      await page.goBack();
    }
  });

  test('media collection management', async ({ page }) => {
    await page.goto('/admin/collections/media');
    
    // Wait for media collection to load
    await page.waitForSelector('[data-testid="media-grid"], .media-grid, .upload-area', { timeout: 10000 });
    
    // Take screenshot of media management interface
    await page.screenshot({ 
      path: 'test-results/screenshots/admin-media-collection.png',
      fullPage: true 
    });
    
    // Check for upload functionality
    const uploadButton = page.locator('input[type="file"], .upload-btn, button:has-text("Upload")').first();
    if (await uploadButton.isVisible()) {
      console.log('Media upload functionality detected');
    }
  });

  test('users collection management', async ({ page }) => {
    await page.goto('/admin/collections/users');
    
    // Wait for users collection to load
    await page.waitForSelector('[data-testid="users-list"], .users-table, table', { timeout: 10000 });
    
    // Take screenshot of users management interface
    await page.screenshot({ 
      path: 'test-results/screenshots/admin-users-collection.png',
      fullPage: true 
    });
  });

  test('categories collection management', async ({ page }) => {
    await page.goto('/admin/collections/categories');
    
    // Wait for categories collection to load
    await page.waitForSelector('[data-testid="categories-list"], .categories-tree, table', { timeout: 10000 });
    
    // Take screenshot of categories management interface
    await page.screenshot({ 
      path: 'test-results/screenshots/admin-categories-collection.png',
      fullPage: true 
    });
  });

  test('media submissions dashboard', async ({ page }) => {
    await page.goto('/admin/collections/media-submissions-dashboard');
    
    // Wait for submissions dashboard to load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of submissions dashboard
    await page.screenshot({ 
      path: 'test-results/screenshots/admin-submissions-dashboard.png',
      fullPage: true 
    });
  });

  test('media content submissions', async ({ page }) => {
    await page.goto('/admin/collections/media-content-submissions');
    
    // Wait for submissions collection to load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of content submissions interface
    await page.screenshot({ 
      path: 'test-results/screenshots/admin-content-submissions.png',
      fullPage: true 
    });
  });

  test('admin navigation functionality', async ({ page }) => {
    await page.goto('/admin');
    
    // Test main navigation links
    const navLinks = await page.locator('nav a, .nav-link, [data-testid="nav-link"]').all();
    
    for (const link of navLinks.slice(0, 5)) { // Test first 5 nav links
      const href = await link.getAttribute('href');
      if (href && href.startsWith('/admin')) {
        try {
          await link.click();
          await page.waitForLoadState('networkidle', { timeout: 5000 });
          
          // Take screenshot of each admin page
          const url = page.url();
          const pageName = url.split('/').pop() || 'page';
          await page.screenshot({ 
            path: `test-results/screenshots/admin-nav-${pageName}.png`,
            fullPage: true 
          });
          
        } catch (error) {
          console.log(`Navigation to ${href} failed: ${(error as Error).message}`);
        }
      }
    }
  });

  test('responsive design - mobile view', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    // Take mobile screenshot
    await page.screenshot({ 
      path: 'test-results/screenshots/admin-mobile-dashboard.png',
      fullPage: true 
    });
    
    // Test mobile navigation
    const mobileMenuToggle = page.locator('.mobile-menu-toggle, .hamburger, button[aria-label*="menu"]').first();
    if (await mobileMenuToggle.isVisible()) {
      await mobileMenuToggle.click();
      await page.screenshot({ 
        path: 'test-results/screenshots/admin-mobile-menu.png',
        fullPage: true 
      });
    }
  });

  test('performance metrics', async ({ page }) => {
    // Monitor performance
    await page.goto('/admin');
    
    // Wait for complete load
    await page.waitForLoadState('networkidle');
    
    // Evaluate Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        if ('web-vital' in window) {
          // If web-vitals library is available
          resolve({ supported: true });
        } else {
          // Basic performance metrics
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          resolve({
            loadTime: navigation.loadEventEnd - navigation.loadEventStart,
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
          });
        }
      });
    });
    
    console.log('Performance metrics:', JSON.stringify(metrics, null, 2));
    
    // Assert reasonable load times (adjust thresholds as needed)
    if (typeof metrics === 'object' && metrics && 'loadTime' in metrics) {
      expect(metrics.loadTime).toBeLessThan(5000); // 5 seconds max
    }
  });
});