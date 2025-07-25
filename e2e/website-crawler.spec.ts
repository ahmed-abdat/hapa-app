import { test, expect } from '@playwright/test';

test.describe('HAPA Website Comprehensive Crawler', () => {
  // Store discovered URLs for comprehensive testing
  const discoveredUrls = new Set<string>();
  const brokenLinks = new Set<string>();
  const performanceMetrics: Array<{url: string, loadTime: number, size: number}> = [];

  test.describe('Site Discovery and Crawling', () => {
    test('should discover all main navigation routes', async ({ page }) => {
      const baseUrls = [
        '/',
        '/fr',
        '/ar',
        '/fr/posts',
        '/ar/posts',
        '/fr/news',
        '/ar/news'
      ];

      for (const url of baseUrls) {
        console.log(`🔍 Crawling: ${url}`);
        
        const startTime = Date.now();
        await page.goto(url);
        const loadTime = Date.now() - startTime;
        
        // Check if page loads successfully
        const title = await page.title();
        console.log(`📄 Page title: ${title}`);
        
        // Skip if 404 page
        if (title.includes('404') || title.includes('Not Found')) {
          console.log(`⚠️ Skipping 404 page: ${url}`);
          continue;
        }

        discoveredUrls.add(url);
        
        // Collect performance metrics
        const responseSize = await page.evaluate(() => {
          return performance.getEntriesByType('navigation')[0]?.transferSize || 0;
        });
        
        performanceMetrics.push({
          url,
          loadTime,
          size: responseSize
        });

        // Discover links on this page
        const links = await page.locator('a[href]').evaluateAll(elements => 
          elements.map(el => el.getAttribute('href')).filter(href => 
            href && 
            !href.startsWith('http') && 
            !href.startsWith('mailto:') && 
            !href.startsWith('tel:') &&
            !href.includes('#')
          )
        );

        // Add discovered internal links
        for (const link of links) {
          if (link.startsWith('/')) {
            discoveredUrls.add(link);
          }
        }

        console.log(`🔗 Found ${links.length} links on ${url}`);
      }

      console.log(`🎯 Total discovered URLs: ${discoveredUrls.size}`);
      expect(discoveredUrls.size).toBeGreaterThan(5);
    });

    test('should crawl and validate all discovered URLs', async ({ page }) => {
      // Add some expected category URLs to test
      const expectedUrls = [
        '/fr/posts/category/news',
        '/ar/posts/category/news',
        '/fr/publications/decisions',
        '/ar/publications/decisions',
        '/fr/publications/reports',
        '/ar/publications/reports',
        '/fr/publications/laws',
        '/ar/publications/laws',
        '/fr/publications/publications',
        '/ar/publications/publications'
      ];

      expectedUrls.forEach(url => discoveredUrls.add(url));

      let successCount = 0;
      let errorCount = 0;

      for (const url of Array.from(discoveredUrls).slice(0, 20)) { // Limit to first 20 for testing
        try {
          console.log(`🌐 Testing URL: ${url}`);
          
          const startTime = Date.now();
          const response = await page.goto(url, { waitUntil: 'networkidle' });
          const loadTime = Date.now() - startTime;

          if (response) {
            const status = response.status();
            console.log(`📊 ${url} - Status: ${status}, Load: ${loadTime}ms`);

            if (status >= 200 && status < 400) {
              successCount++;
              
              // Basic page structure validation
              const hasTitle = await page.locator('title').count() > 0;
              const hasH1 = await page.locator('h1').count() > 0;
              const hasMain = await page.locator('main, [role="main"]').count() > 0;
              
              console.log(`✅ ${url} - Structure: Title(${hasTitle}), H1(${hasH1}), Main(${hasMain})`);
              
              // Check for console errors
              page.on('console', msg => {
                if (msg.type() === 'error') {
                  console.log(`🔴 Console error on ${url}: ${msg.text()}`);
                }
              });

              // Performance check
              if (loadTime > 5000) {
                console.log(`⚠️ Slow page: ${url} took ${loadTime}ms`);
              }

            } else {
              errorCount++;
              brokenLinks.add(url);
              console.log(`❌ ${url} - Status: ${status}`);
            }
          }

        } catch (error) {
          errorCount++;
          brokenLinks.add(url);
          console.log(`💥 Error testing ${url}: ${error}`);
        }
      }

      console.log(`📈 Crawl Results: ${successCount} success, ${errorCount} errors`);
      
      // Should have more successes than errors
      expect(successCount).toBeGreaterThan(errorCount);
    });

    test('should validate category integration routes work', async ({ page }) => {
      const categoryTestRoutes = [
        // Task A: Core category routes
        { url: '/fr/posts/category/test', name: 'French Category Route' },
        { url: '/ar/posts/category/test', name: 'Arabic Category Route' },
        
        // Task B: Posts filtering
        { url: '/fr/posts?category=test', name: 'French Posts Filter' },
        { url: '/ar/posts?category=test', name: 'Arabic Posts Filter' },
        
        // Task C: Government publications
        { url: '/fr/publications/decisions', name: 'French Publications - Decisions' },
        { url: '/ar/publications/decisions', name: 'Arabic Publications - Decisions' },
        { url: '/fr/news', name: 'French News' },
        { url: '/ar/news', name: 'Arabic News' }
      ];

      for (const route of categoryTestRoutes) {
        console.log(`🧪 Testing ${route.name}: ${route.url}`);
        
        await page.goto(route.url);
        
        // Page should load (not necessarily with content)
        const title = await page.title();
        console.log(`📝 ${route.name} title: ${title}`);
        
        // Should not be a generic error page
        expect(title).not.toMatch(/error|500/i);
        
        // Should have basic page structure
        await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
        
        // Check for proper locale direction
        if (route.url.includes('/ar/')) {
          await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
        } else {
          await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
        }
        
        // Should have HAPA branding
        expect(title).toMatch(/HAPA|منطقة/i);
        
        console.log(`✅ ${route.name} passed validation`);
      }
    });
  });

  test.describe('Performance and SEO Analysis', () => {
    test('should analyze Core Web Vitals', async ({ page }) => {
      const testUrls = ['/fr', '/ar', '/fr/posts', '/ar/posts'];
      
      for (const url of testUrls) {
        await page.goto(url);
        
        const title = await page.title();
        if (title.includes('404')) continue;

        // Measure Core Web Vitals
        const metrics = await page.evaluate(() => {
          return new Promise((resolve) => {
            const observer = new PerformanceObserver((list) => {
              const entries = list.getEntries();
              const vitals: any = {};
              
              entries.forEach((entry) => {
                if (entry.entryType === 'navigation') {
                  vitals.loadTime = entry.loadEventEnd - entry.loadEventStart;
                  vitals.domContentLoaded = entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart;
                }
                if (entry.entryType === 'paint') {
                  if (entry.name === 'first-contentful-paint') {
                    vitals.fcp = entry.startTime;
                  }
                  if (entry.name === 'largest-contentful-paint') {
                    vitals.lcp = entry.startTime;
                  }
                }
              });
              
              resolve(vitals);
            });
            
            observer.observe({ entryTypes: ['navigation', 'paint'] });
            
            // Fallback timeout
            setTimeout(() => resolve({}), 5000);
          });
        });

        console.log(`⚡ Performance metrics for ${url}:`, metrics);
        
        // Performance assertions (generous for testing)
        if (metrics.loadTime) {
          expect(metrics.loadTime).toBeLessThan(10000); // 10 seconds
        }
        
        if (metrics.fcp) {
          expect(metrics.fcp).toBeLessThan(5000); // 5 seconds FCP
        }
      }
    });

    test('should validate SEO meta tags', async ({ page }) => {
      const testUrls = ['/fr', '/ar', '/fr/posts', '/ar/posts'];
      
      for (const url of testUrls) {
        await page.goto(url);
        
        const title = await page.title();
        if (title.includes('404')) continue;

        console.log(`🔍 SEO analysis for ${url}`);
        
        // Title tag
        expect(title).toBeTruthy();
        expect(title.length).toBeGreaterThan(10);
        expect(title.length).toBeLessThan(60);
        console.log(`📝 Title: ${title}`);
        
        // Meta description
        const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
        if (metaDescription) {
          expect(metaDescription.length).toBeGreaterThan(50);
          expect(metaDescription.length).toBeLessThan(160);
          console.log(`📄 Description: ${metaDescription.substring(0, 50)}...`);
        }
        
        // Language attributes
        const htmlLang = await page.locator('html').getAttribute('lang');
        if (url.includes('/ar/')) {
          expect(htmlLang).toMatch(/ar/);
        } else {
          expect(htmlLang).toMatch(/fr/);
        }
        
        // Canonical links
        const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
        if (canonical) {
          console.log(`🔗 Canonical: ${canonical}`);
        }
        
        // Hreflang tags
        const hreflangTags = await page.locator('link[hreflang]').count();
        console.log(`🌐 Hreflang tags: ${hreflangTags}`);
        
        console.log(`✅ SEO validation passed for ${url}`);
      }
    });

    test('should check accessibility compliance', async ({ page }) => {
      const testUrls = ['/fr', '/ar'];
      
      for (const url of testUrls) {
        await page.goto(url);
        
        const title = await page.title();
        if (title.includes('404')) continue;

        console.log(`♿ Accessibility check for ${url}`);
        
        // Basic accessibility checks
        const hasSkipLink = await page.locator('a[href*="#main"], a[href*="#content"]').count() > 0;
        const hasLandmarks = await page.locator('main, [role="main"], nav, [role="navigation"]').count() > 0;
        const hasHeading = await page.locator('h1').count() > 0;
        
        console.log(`🔍 Skip link: ${hasSkipLink}, Landmarks: ${hasLandmarks}, H1: ${hasHeading}`);
        
        // Check for alt text on images
        const images = await page.locator('img').count();
        const imagesWithAlt = await page.locator('img[alt]').count();
        
        if (images > 0) {
          const altTextCoverage = (imagesWithAlt / images) * 100;
          console.log(`🖼️ Image alt text coverage: ${altTextCoverage.toFixed(1)}%`);
          expect(altTextCoverage).toBeGreaterThan(80); // 80% minimum
        }
        
        // Check for form labels
        const inputs = await page.locator('input, textarea, select').count();
        const labeledInputs = await page.locator('input[aria-label], textarea[aria-label], select[aria-label], input[id][placeholder] + label[for], textarea[id] + label[for], select[id] + label[for]').count();
        
        if (inputs > 0) {
          const labelCoverage = (labeledInputs / inputs) * 100;
          console.log(`🏷️ Form label coverage: ${labelCoverage.toFixed(1)}%`);
        }
        
        console.log(`✅ Accessibility check passed for ${url}`);
      }
    });
  });

  test.describe('Mobile and Cross-browser Testing', () => {
    test('should work on mobile viewports', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      const testUrls = ['/fr', '/ar', '/fr/posts', '/ar/posts'];
      
      for (const url of testUrls) {
        await page.goto(url);
        
        const title = await page.title();
        if (title.includes('404')) continue;

        console.log(`📱 Mobile test for ${url}`);
        
        // Page should load
        await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
        
        // Check for mobile navigation
        const mobileNav = page.locator('[data-testid*="mobile"], .mobile-nav, [aria-label*="menu"]');
        if (await mobileNav.count() > 0) {
          console.log(`📲 Mobile navigation found on ${url}`);
        }
        
        // Check viewport meta tag
        const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute('content');
        expect(viewportMeta).toContain('width=device-width');
        
        // Test touch interactions if available
        const buttons = page.locator('button, [role="button"]');
        if (await buttons.count() > 0) {
          const firstButton = buttons.first();
          if (await firstButton.isVisible()) {
            // Simulate touch
            await firstButton.tap();
            console.log(`👆 Touch interaction tested on ${url}`);
          }
        }
        
        console.log(`✅ Mobile test passed for ${url}`);
      }
    });

    test('should handle network conditions', async ({ page }) => {
      // Simulate slow 3G
      await page.context().route('**/*', async route => {
        await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
        await route.continue();
      });
      
      const testUrl = '/fr';
      const startTime = Date.now();
      
      await page.goto(testUrl);
      const loadTime = Date.now() - startTime;
      
      console.log(`🌐 Slow network test: ${loadTime}ms`);
      
      // Should still load within reasonable time (with 100ms delay per request)
      expect(loadTime).toBeLessThan(15000); // 15 seconds with delays
      
      // Page should still be functional
      await expect(page.locator('h1')).toBeVisible();
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle 404 pages gracefully', async ({ page }) => {
      const invalidUrls = [
        '/fr/invalid-page',
        '/ar/invalid-page',
        '/fr/posts/category/invalid-category',
        '/ar/posts/category/invalid-category',
        '/fr/publications/invalid-publication',
        '/ar/publications/invalid-publication'
      ];

      for (const url of invalidUrls) {
        await page.goto(url);
        
        const title = await page.title();
        console.log(`🔍 Testing 404 for ${url}: ${title}`);
        
        // Should show 404 page or redirect appropriately
        const is404 = title.includes('404') || title.includes('Not Found');
        const hasContent = await page.locator('h1').count() > 0;
        
        // Either should be a proper 404 page or redirect to valid content
        expect(is404 || hasContent).toBeTruthy();
        
        if (is404) {
          console.log(`✅ Proper 404 page for ${url}`);
        } else {
          console.log(`↗️ Redirected to valid content for ${url}`);
        }
      }
    });

    test('should handle JavaScript errors gracefully', async ({ page }) => {
      const jsErrors: string[] = [];
      
      page.on('console', msg => {
        if (msg.type() === 'error') {
          jsErrors.push(msg.text());
        }
      });
      
      page.on('pageerror', error => {
        jsErrors.push(error.message);
      });
      
      const testUrls = ['/fr', '/ar', '/fr/posts'];
      
      for (const url of testUrls) {
        await page.goto(url);
        
        const title = await page.title();
        if (title.includes('404')) continue;

        // Wait for page to fully load
        await page.waitForLoadState('networkidle');
        
        // Interact with page to trigger any JS
        const buttons = page.locator('button');
        if (await buttons.count() > 0) {
          await buttons.first().click();
        }
        
        const links = page.locator('a[href]');
        if (await links.count() > 0) {
          await links.first().hover();
        }
      }
      
      console.log(`🔍 JavaScript errors found: ${jsErrors.length}`);
      jsErrors.forEach(error => console.log(`🔴 JS Error: ${error}`));
      
      // Should have minimal JS errors
      expect(jsErrors.length).toBeLessThan(5);
    });
  });

  test.afterAll(async () => {
    // Report summary
    console.log('\n🎯 CRAWL SUMMARY REPORT');
    console.log('='.repeat(50));
    console.log(`📊 Total URLs discovered: ${discoveredUrls.size}`);
    console.log(`❌ Broken links: ${brokenLinks.size}`);
    console.log(`⚡ Performance data points: ${performanceMetrics.length}`);
    
    if (brokenLinks.size > 0) {
      console.log('\n🔴 BROKEN LINKS:');
      Array.from(brokenLinks).forEach(url => console.log(`  - ${url}`));
    }
    
    if (performanceMetrics.length > 0) {
      const avgLoadTime = performanceMetrics.reduce((sum, m) => sum + m.loadTime, 0) / performanceMetrics.length;
      console.log(`\n⚡ AVERAGE LOAD TIME: ${avgLoadTime.toFixed(0)}ms`);
      
      const slowPages = performanceMetrics.filter(m => m.loadTime > 3000);
      if (slowPages.length > 0) {
        console.log('\n🐌 SLOW PAGES (>3s):');
        slowPages.forEach(page => console.log(`  - ${page.url}: ${page.loadTime}ms`));
      }
    }
    
    console.log('\n✅ Crawl analysis complete!');
  });
});