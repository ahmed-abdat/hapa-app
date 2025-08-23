import { test } from '@playwright/test';

test.describe('HAPA Admin Design Review', () => {
  
  test('admin interface accessibility audit', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    // Run basic accessibility checks
    const a11yIssues = await page.evaluate(() => {
      const issues = [];
      
      // Check for missing alt attributes on images
      const images = document.querySelectorAll('img:not([alt])');
      if (images.length > 0) {
        issues.push(`${images.length} images missing alt attributes`);
      }
      
      // Check for proper heading hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let previousLevel = 0;
      headings.forEach((heading) => {
        const level = parseInt(heading.tagName.charAt(1));
        if (level > previousLevel + 1) {
          issues.push(`Heading hierarchy skip detected: ${heading.tagName} after h${previousLevel}`);
        }
        previousLevel = level;
      });
      
      // Check for missing form labels
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach((input, index) => {
        const hasLabel = input.closest('label') || 
                        document.querySelector(`label[for="${input.id}"]`) ||
                        input.getAttribute('aria-label') ||
                        input.getAttribute('aria-labelledby');
        if (!hasLabel) {
          issues.push(`Form input ${index + 1} missing label`);
        }
      });
      
      // Check color contrast (basic check for very light text)
      const elements = document.querySelectorAll('*');
      elements.forEach((element) => {
        const styles = window.getComputedStyle(element);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        
        // Very basic contrast check - this would need a proper contrast calculation
        if (color === 'rgb(255, 255, 255)' && backgroundColor === 'rgb(255, 255, 255)') {
          issues.push('Potential white text on white background detected');
        }
      });
      
      return issues;
    });
    
    // Log accessibility issues
    if (a11yIssues.length > 0) {
      console.log('Accessibility issues found:', a11yIssues);
    }
    
    // Take screenshot for manual review
    await page.screenshot({ 
      path: 'test-results/screenshots/admin-accessibility-review.png',
      fullPage: true 
    });
  });

  test('component consistency check', async ({ page }) => {
    const pages = [
      '/admin',
      '/admin/collections/posts',
      '/admin/collections/media',
      '/admin/collections/users'
    ];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      // Check for consistent button styles
      const buttons = await page.locator('button, .btn, [role="button"]').all();
      const buttonStyles = [];
      
      for (const button of buttons.slice(0, 5)) { // Check first 5 buttons
        const styles = await button.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            backgroundColor: computed.backgroundColor,
            color: computed.color,
            borderRadius: computed.borderRadius,
            padding: computed.padding,
            fontSize: computed.fontSize
          };
        });
        buttonStyles.push(styles);
      }
      
      // Take screenshot for visual consistency review
      const pageName = pagePath.split('/').pop() || 'admin';
      await page.screenshot({ 
        path: `test-results/screenshots/admin-consistency-${pageName}.png`,
        fullPage: true 
      });
      
      console.log(`Button styles on ${pagePath}:`, buttonStyles);
    }
  });

  test('responsive design validation', async ({ page }) => {
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
      
      // Take screenshot for each viewport
      await page.screenshot({ 
        path: `test-results/screenshots/admin-responsive-${viewport.name}.png`,
        fullPage: true 
      });
      
      // Check for horizontal scroll issues
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      if (hasHorizontalScroll) {
        console.log(`Horizontal scroll detected on ${viewport.name} viewport`);
      }
      
      // Check for overlapping elements
      const overlaps = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'));
        const overlapping: any[] = [];
        
        elements.forEach((el1, i) => {
          elements.slice(i + 1).forEach((el2, _j) => {
            const rect1 = el1.getBoundingClientRect();
            const rect2 = el2.getBoundingClientRect();
            
            const overlap = !(rect1.right < rect2.left || 
                            rect2.right < rect1.left || 
                            rect1.bottom < rect2.top || 
                            rect2.bottom < rect1.top);
            
            if (overlap && rect1.width > 0 && rect1.height > 0 && rect2.width > 0 && rect2.height > 0) {
              overlapping.push({
                element1: el1.tagName + (el1.className ? '.' + el1.className.split(' ')[0] : ''),
                element2: el2.tagName + (el2.className ? '.' + el2.className.split(' ')[0] : '')
              });
            }
          });
        });
        
        return overlapping.slice(0, 5); // Return first 5 overlaps to avoid spam
      });
      
      if (overlaps.length > 0) {
        console.log(`Overlapping elements on ${viewport.name}:`, overlaps);
      }
    }
  });

  test('typography and spacing consistency', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    // Analyze typography consistency
    const typographyAnalysis = await page.evaluate(() => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const paragraphs = document.querySelectorAll('p');
      const buttons = document.querySelectorAll('button, .btn');
      
      const analyzeElements = (elements: any, type: any) => {
        const styles: any[] = [];
        elements.forEach((el: any) => {
          const computed = window.getComputedStyle(el);
          styles.push({
            fontSize: computed.fontSize,
            fontWeight: computed.fontWeight,
            lineHeight: computed.lineHeight,
            marginTop: computed.marginTop,
            marginBottom: computed.marginBottom
          });
        });
        return { type, count: elements.length, styles: styles.slice(0, 3) }; // Sample first 3
      };
      
      return {
        headings: analyzeElements(headings, 'headings'),
        paragraphs: analyzeElements(paragraphs, 'paragraphs'),
        buttons: analyzeElements(buttons, 'buttons')
      };
    });
    
    console.log('Typography analysis:', JSON.stringify(typographyAnalysis, null, 2));
    
    // Take focused screenshot of typography elements
    await page.screenshot({ 
      path: 'test-results/screenshots/admin-typography.png',
      fullPage: true 
    });
  });

  test('color scheme and theme validation', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    // Extract color palette from the admin interface
    const colorAnalysis = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const colors = new Set();
      const backgroundColors = new Set();
      
      elements.forEach((el) => {
        const styles = window.getComputedStyle(el);
        if (styles.color && styles.color !== 'rgba(0, 0, 0, 0)') {
          colors.add(styles.color);
        }
        if (styles.backgroundColor && styles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          backgroundColors.add(styles.backgroundColor);
        }
      });
      
      return {
        textColors: Array.from(colors).slice(0, 10), // Top 10 colors
        backgroundColors: Array.from(backgroundColors).slice(0, 10)
      };
    });
    
    console.log('Color scheme analysis:', colorAnalysis);
    
    // Check for dark mode support
    const hasDarkMode = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ||
             document.body.classList.contains('dark-theme') ||
             window.getComputedStyle(document.body).backgroundColor === 'rgb(0, 0, 0)' ||
             document.querySelector('[data-theme="dark"]') !== null;
    });
    
    console.log('Dark mode support detected:', hasDarkMode);
    
    // Take screenshot for color analysis
    await page.screenshot({ 
      path: 'test-results/screenshots/admin-color-scheme.png',
      fullPage: true 
    });
  });

  test('internationalization UI validation', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    // Check for French/Arabic language elements
    const i18nElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('[lang], [dir], .rtl, .ltr');
      const langAttributes: any[] = [];
      
      elements.forEach((el) => {
        langAttributes.push({
          tag: el.tagName,
          lang: el.getAttribute('lang'),
          dir: el.getAttribute('dir'),
          classes: el.className
        });
      });
      
      // Check for text that might indicate language switching
      const textContent = document.body.textContent;
      const hasFrench = /français|french|fr/i.test(textContent || '');
      const hasArabic = /عربي|arabic|ar/i.test(textContent || '');
      
      return {
        langElements: langAttributes,
        hasFrench,
        hasArabic,
        documentLang: document.documentElement.lang,
        documentDir: document.documentElement.dir
      };
    });
    
    console.log('Internationalization analysis:', i18nElements);
    
    // Take screenshot for i18n review
    await page.screenshot({ 
      path: 'test-results/screenshots/admin-i18n-validation.png',
      fullPage: true 
    });
  });

  test('form design and usability', async ({ page }) => {
    // Test form on create post page
    await page.goto('/admin/collections/posts');
    
    // Try to find and navigate to create form
    const createButton = page.locator('a[href*="create"], button:has-text("Create"), .btn:has-text("New")').first();
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForURL(/.*create.*|.*new.*/);
      
      // Analyze form design
      const formAnalysis = await page.evaluate(() => {
        const forms = document.querySelectorAll('form');
        const inputs = document.querySelectorAll('input, textarea, select');
        const labels = document.querySelectorAll('label');
        const fieldsets = document.querySelectorAll('fieldset');
        
        return {
          formCount: forms.length,
          inputCount: inputs.length,
          labelCount: labels.length,
          fieldsetCount: fieldsets.length,
          hasRequiredFields: document.querySelectorAll('[required]').length > 0,
          hasErrorStates: document.querySelectorAll('.error, .invalid, [aria-invalid="true"]').length > 0
        };
      });
      
      console.log('Form design analysis:', formAnalysis);
      
      // Take screenshot of form
      await page.screenshot({ 
        path: 'test-results/screenshots/admin-form-design.png',
        fullPage: true 
      });
    }
  });
});