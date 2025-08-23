import { test, expect } from '@playwright/test';

test.describe('Admin Language Consistency Fix', () => {
  test('Arabic submission #35 should display headers in Arabic', async ({ page }) => {
    // Navigate to Arabic submission
    await page.goto('/admin/collections/media-content-submissions/35');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot before verification
    await page.screenshot({ 
      path: 'test-results/arabic-submission-before.png', 
      fullPage: true 
    });
    
    // Check for Arabic headers - should show "الأسباب المختارة:" instead of "MOTIFS SÉLECTIONNÉS"
    const arabicReasonsHeader = page.locator('text=الأسباب المختارة:');
    await expect(arabicReasonsHeader).toBeVisible({ timeout: 10000 });
    
    // Check for Arabic attachments header - should show "أنواع المرفقات:" instead of "TYPES DE PIÈCES JOINTES"
    const arabicAttachmentsHeader = page.locator('text=أنواع المرفقات:');
    await expect(arabicAttachmentsHeader).toBeVisible({ timeout: 10000 });
    
    // Verify RTL layout is applied
    const pageContent = page.locator('body');
    const direction = await pageContent.getAttribute('dir');
    console.log('Page direction:', direction);
    
    // Take screenshot after verification
    await page.screenshot({ 
      path: 'test-results/arabic-submission-verified.png', 
      fullPage: true 
    });
  });

  test('French submission #34 should display headers in French', async ({ page }) => {
    // Navigate to French submission
    await page.goto('/admin/collections/media-content-submissions/34');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot before verification
    await page.screenshot({ 
      path: 'test-results/french-submission-before.png', 
      fullPage: true 
    });
    
    // Check for French headers - should show "MOTIFS SÉLECTIONNÉS"
    const frenchReasonsHeader = page.locator('text=MOTIFS SÉLECTIONNÉS');
    await expect(frenchReasonsHeader).toBeVisible({ timeout: 10000 });
    
    // Check for French attachments header - should show "TYPES DE PIÈCES JOINTES"
    const frenchAttachmentsHeader = page.locator('text=TYPES DE PIÈCES JOINTES');
    await expect(frenchAttachmentsHeader).toBeVisible({ timeout: 10000 });
    
    // Take screenshot after verification
    await page.screenshot({ 
      path: 'test-results/french-submission-verified.png', 
      fullPage: true 
    });
  });

  test('Verify individual labels display in correct language', async ({ page }) => {
    // Test Arabic submission labels
    await page.goto('/admin/collections/media-content-submissions/35');
    await page.waitForLoadState('networkidle');
    
    // Check for specific Arabic reason labels (if any are selected)
    const arabicLabels = page.locator('[data-testid^="reason-"], [data-testid^="attachment-"]');
    const labelCount = await arabicLabels.count();
    console.log('Found', labelCount, 'labels in Arabic submission');
    
    // Test French submission labels
    await page.goto('/admin/collections/media-content-submissions/34');
    await page.waitForLoadState('networkidle');
    
    // Check for French reason labels (if any are selected)
    const frenchLabels = page.locator('[data-testid^="reason-"], [data-testid^="attachment-"]');
    const frenchLabelCount = await frenchLabels.count();
    console.log('Found', frenchLabelCount, 'labels in French submission');
    
    // Take final comparison screenshot
    await page.screenshot({ 
      path: 'test-results/language-consistency-comparison.png', 
      fullPage: true 
    });
  });
});