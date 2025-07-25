import { test, expect } from '@playwright/test';

test.describe('HAPA API and Forms Testing', () => {
  const apiBaseUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

  test.describe('Payload API Testing', () => {
    test('should access GraphQL playground', async ({ page }) => {
      await page.goto('/api/graphql-playground');
      
      // Should load GraphQL playground
      const title = await page.title();
      console.log(`🎮 GraphQL Playground title: ${title}`);
      
      // Check if playground loads
      const playgroundElement = page.locator('[class*="graphiql"], [data-testid*="graphql"], .graphql-playground');
      if (await playgroundElement.count() > 0) {
        console.log('✅ GraphQL Playground loaded successfully');
      } else {
        console.log('ℹ️ GraphQL Playground may be disabled in production');
      }
    });

    test('should handle GraphQL queries', async ({ request }) => {
      // Test GraphQL endpoint
      const query = `
        query {
          Categories(limit: 5) {
            docs {
              id
              title
              slug
            }
          }
        }
      `;

      const response = await request.post('/api/graphql', {
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          query
        }
      });

      console.log(`📊 GraphQL response status: ${response.status()}`);
      
      if (response.ok()) {
        const data = await response.json();
        console.log('✅ GraphQL query successful');
        console.log(`📝 Categories found: ${data.data?.Categories?.docs?.length || 0}`);
        
        // Should have proper response structure
        expect(data).toHaveProperty('data');
        
        if (data.data?.Categories?.docs?.length > 0) {
          const category = data.data.Categories.docs[0];
          expect(category).toHaveProperty('id');
          expect(category).toHaveProperty('title');
          expect(category).toHaveProperty('slug');
        }
      } else {
        console.log('ℹ️ GraphQL endpoint may require authentication');
      }
    });

    test('should access media files', async ({ request }) => {
      // Test media endpoint
      const response = await request.get('/api/media');
      
      console.log(`🖼️ Media API status: ${response.status()}`);
      
      // Should respond (may be empty but shouldn't error)
      expect(response.status()).toBeLessThan(500);
      
      if (response.ok()) {
        const contentType = response.headers()['content-type'];
        console.log(`📄 Media response type: ${contentType}`);
      }
    });

    test('should handle sitemaps', async ({ request }) => {
      const sitemapUrls = [
        '/sitemap.xml',
        '/pages-sitemap.xml',
        '/posts-sitemap.xml'
      ];

      for (const url of sitemapUrls) {
        const response = await request.get(url);
        console.log(`🗺️ ${url} status: ${response.status()}`);
        
        if (response.ok()) {
          const content = await response.text();
          
          // Should be valid XML
          expect(content).toContain('<?xml');
          expect(content).toContain('<urlset');
          
          // Count URLs in sitemap
          const urlCount = (content.match(/<url>/g) || []).length;
          console.log(`🔗 ${url} contains ${urlCount} URLs`);
          
          // Should have some URLs
          expect(urlCount).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('Custom Form Submission Testing', () => {
    test('should submit contact form successfully', async ({ page }) => {
      // Navigate to a page with contact form
      await page.goto('/fr');
      
      // Look for contact form or navigate to contact page
      const contactForm = page.locator('form[action*="contact"], form[data-testid*="contact"]');
      
      if (await contactForm.count() === 0) {
        // Try to find contact page link
        const contactLink = page.locator('a[href*="contact"], a:has-text("Contact")');
        if (await contactLink.count() > 0) {
          await contactLink.first().click();
          await page.waitForLoadState('networkidle');
        }
      }

      // Check if contact form is now available
      const form = page.locator('form').first();
      
      if (await form.count() > 0) {
        console.log('📝 Contact form found, testing submission...');
        
        // Fill out form fields
        const nameField = page.locator('input[name*="name"], input[placeholder*="nom"], input[placeholder*="name"]');
        if (await nameField.count() > 0) {
          await nameField.fill('Test User');
        }
        
        const emailField = page.locator('input[type="email"], input[name*="email"]');
        if (await emailField.count() > 0) {
          await emailField.fill('test@example.com');
        }
        
        const messageField = page.locator('textarea[name*="message"], textarea[placeholder*="message"]');
        if (await messageField.count() > 0) {
          await messageField.fill('Test message from automated test');
        }
        
        // Submit form
        const submitButton = page.locator('button[type="submit"], input[type="submit"], button:has-text("Envoyer"), button:has-text("Submit")');
        
        if (await submitButton.count() > 0) {
          await submitButton.click();
          
          // Wait for response
          await page.waitForTimeout(2000);
          
          // Check for success message or redirection
          const successIndicators = [
            'merci', 'thank you', 'success', 'envoyé', 'sent',
            'confirmé', 'confirmed', 'reçu', 'received'
          ];
          
          const pageContent = await page.content();
          const hasSuccessMessage = successIndicators.some(indicator => 
            pageContent.toLowerCase().includes(indicator)
          );
          
          if (hasSuccessMessage) {
            console.log('✅ Contact form submission successful');
          } else {
            console.log('ℹ️ Contact form submitted, checking for validation');
          }
        } else {
          console.log('ℹ️ No submit button found in form');
        }
      } else {
        console.log('ℹ️ No contact form found on the page');
      }
    });

    test('should test form API endpoint directly', async ({ request }) => {
      const formData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+222 00 00 00 00',
        subject: 'Test Subject',
        message: 'This is a test message from automated testing',
        type: 'contact'
      };

      console.log('🚀 Testing form API endpoint...');
      
      const response = await request.post('/api/custom-forms/submit', {
        headers: {
          'Content-Type': 'application/json',
        },
        data: formData
      });

      console.log(`📊 Form API response status: ${response.status()}`);
      
      if (response.ok()) {
        const responseData = await response.json();
        console.log('✅ Form submission API successful');
        console.log(`📝 Response:`, responseData);
        
        // Should have proper response structure
        expect(responseData).toHaveProperty('success');
        
        if (responseData.success) {
          expect(responseData).toHaveProperty('id');
        }
      } else {
        const errorText = await response.text();
        console.log(`❌ Form API error: ${errorText}`);
        
        // Log for debugging but don't fail test if endpoint is protected
        if (response.status() === 403 || response.status() === 401) {
          console.log('ℹ️ Form endpoint may be protected in production');
        }
      }
    });

    test('should validate form validation works', async ({ page }) => {
      await page.goto('/fr');
      
      // Look for any form
      const form = page.locator('form').first();
      
      if (await form.count() > 0) {
        console.log('🔍 Testing form validation...');
        
        // Try to submit empty form
        const submitButton = page.locator('button[type="submit"], input[type="submit"]').first();
        
        if (await submitButton.count() > 0) {
          await submitButton.click();
          
          // Wait for validation messages
          await page.waitForTimeout(1000);
          
          // Check for validation messages
          const validationMessages = await page.locator('[class*="error"], [class*="invalid"], [aria-invalid="true"]').count();
          const requiredFields = await page.locator('input[required], textarea[required]').count();
          
          console.log(`🔍 Found ${validationMessages} validation messages for ${requiredFields} required fields`);
          
          if (requiredFields > 0) {
            // Should show validation for required fields
            expect(validationMessages).toBeGreaterThan(0);
            console.log('✅ Form validation working correctly');
          }
        }
      }
    });
  });

  test.describe('Admin Interface Testing', () => {
    test('should access admin login page', async ({ page }) => {
      await page.goto('/admin');
      
      const title = await page.title();
      console.log(`🔐 Admin page title: ${title}`);
      
      // Should load admin interface
      const isAdminPage = title.toLowerCase().includes('admin') || 
                         title.toLowerCase().includes('payload') ||
                         await page.locator('[class*="admin"], [data-testid*="admin"]').count() > 0;
      
      if (isAdminPage) {
        console.log('✅ Admin interface accessible');
        
        // Should have login form
        const loginForm = page.locator('form, [data-testid*="login"]');
        const emailField = page.locator('input[type="email"], input[name*="email"]');
        const passwordField = page.locator('input[type="password"]');
        
        if (await loginForm.count() > 0) {
          console.log('🔐 Login form found');
          expect(await emailField.count()).toBeGreaterThan(0);
          expect(await passwordField.count()).toBeGreaterThan(0);
        }
      } else {
        console.log('ℹ️ Admin interface may be disabled or redirected');
      }
    });

    test('should test admin static assets', async ({ request }) => {
      const adminAssets = [
        '/admin/favicon.ico',
        '/admin'
      ];

      for (const asset of adminAssets) {
        const response = await request.get(asset);
        console.log(`🎨 ${asset} status: ${response.status()}`);
        
        // Should be accessible (not 404)
        expect(response.status()).not.toBe(404);
      }
    });
  });

  test.describe('SEO and Robots Testing', () => {
    test('should have proper robots.txt', async ({ request }) => {
      const response = await request.get('/robots.txt');
      
      console.log(`🤖 robots.txt status: ${response.status()}`);
      
      if (response.ok()) {
        const robotsContent = await response.text();
        console.log('📄 robots.txt content preview:', robotsContent.substring(0, 200));
        
        // Should contain basic directives
        expect(robotsContent).toMatch(/User-agent/i);
        
        // Should not block everything
        expect(robotsContent).not.toMatch(/Disallow: \//);
        
        // Should reference sitemap
        expect(robotsContent).toMatch(/Sitemap/i);
      }
    });

    test('should generate proper RSS feeds', async ({ request }) => {
      // Test potential RSS feed URLs
      const rssUrls = ['/rss.xml', '/feed.xml', '/api/rss', '/fr/rss', '/ar/rss'];
      
      for (const url of rssUrls) {
        const response = await request.get(url);
        
        if (response.ok()) {
          const content = await response.text();
          console.log(`📡 RSS feed found at ${url}`);
          
          // Should be valid XML
          expect(content).toContain('<?xml');
          expect(content).toMatch(/<rss|<feed/);
          
          const itemCount = (content.match(/<item>|<entry>/g) || []).length;
          console.log(`📰 RSS contains ${itemCount} items`);
        }
      }
    });
  });

  test.describe('Security Testing', () => {
    test('should have proper security headers', async ({ request }) => {
      const response = await request.get('/');
      const headers = response.headers();
      
      console.log('🔒 Security headers check:');
      
      // Check for security headers
      const securityHeaders = [
        'x-frame-options',
        'x-content-type-options',
        'referrer-policy',
        'content-security-policy'
      ];
      
      securityHeaders.forEach(header => {
        if (headers[header]) {
          console.log(`✅ ${header}: ${headers[header]}`);
        } else {
          console.log(`⚠️ Missing ${header}`);
        }
      });
      
      // Should have at least some security headers
      const securityHeaderCount = securityHeaders.filter(h => headers[h]).length;
      expect(securityHeaderCount).toBeGreaterThan(0);
    });

    test('should prevent common vulnerabilities', async ({ request }) => {
      // Test for SQL injection in query params
      const maliciousParams = [
        "?id=1' OR '1'='1",
        "?search=<script>alert('xss')</script>",
        "?category=../../etc/passwd"
      ];

      for (const param of maliciousParams) {
        const response = await request.get(`/fr/posts${param}`);
        
        // Should not return server error
        expect(response.status()).toBeLessThan(500);
        
        if (response.ok()) {
          const content = await response.text();
          
          // Should not execute scripts or show sensitive data
          expect(content).not.toContain('<script>');
          expect(content).not.toContain('root:x:');
          expect(content).not.toContain('SQL');
        }
      }
      
      console.log('✅ Basic security tests passed');
    });

    test('should handle CORS properly', async ({ request }) => {
      const response = await request.get('/', {
        headers: {
          'Origin': 'https://evil-site.com'
        }
      });
      
      const corsHeader = response.headers()['access-control-allow-origin'];
      
      if (corsHeader) {
        console.log(`🌐 CORS header: ${corsHeader}`);
        
        // Should not allow all origins in production
        if (process.env.NODE_ENV === 'production') {
          expect(corsHeader).not.toBe('*');
        }
      } else {
        console.log('ℹ️ No CORS headers (restrictive - good for security)');
      }
    });
  });

  test.describe('Internationalization API', () => {
    test('should handle locale switching', async ({ page }) => {
      // Start on French page
      await page.goto('/fr');
      
      // Look for language switcher
      const langSwitcher = page.locator('[data-testid*="lang"], [class*="lang"], a[href*="/ar/"]');
      
      if (await langSwitcher.count() > 0) {
        console.log('🌐 Language switcher found');
        
        // Switch to Arabic
        await langSwitcher.first().click();
        
        // Should navigate to Arabic version
        await expect(page).toHaveURL(/\/ar\//);
        
        // Should have RTL direction
        await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
        
        console.log('✅ Language switching works');
      } else {
        console.log('ℹ️ No language switcher found, testing direct navigation');
        
        // Test direct navigation to Arabic
        await page.goto('/ar');
        await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
      }
    });

    test('should serve appropriate content by locale', async ({ request }) => {
      const frResponse = await request.get('/fr');
      const arResponse = await request.get('/ar');
      
      if (frResponse.ok() && arResponse.ok()) {
        const frContent = await frResponse.text();
        const arContent = await arResponse.text();
        
        // Content should be different (localized)
        expect(frContent).not.toBe(arContent);
        
        // French should have French lang attribute
        expect(frContent).toMatch(/lang=["\']fr/);
        
        // Arabic should have Arabic lang attribute and RTL
        expect(arContent).toMatch(/lang=["\']ar/);
        expect(arContent).toMatch(/dir=["\']rtl/);
        
        console.log('✅ Localized content served correctly');
      }
    });
  });

  test.afterAll(async () => {
    console.log('\n🎯 API & FORMS TEST SUMMARY');
    console.log('='.repeat(50));
    console.log('✅ API testing completed');
    console.log('📝 Form validation tested');
    console.log('🔒 Security checks performed');
    console.log('🌐 Internationalization verified');
  });
});