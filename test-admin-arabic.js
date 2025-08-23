import { chromium } from 'playwright';

async function testAdminArabicHeaders() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    console.log('🚀 Starting admin testing...');
    
    // Navigate to admin login
    await page.goto('http://localhost:3000/admin');
    await page.waitForLoadState('networkidle');
    
    // Login with admin credentials
    console.log('🔐 Logging in...');
    await page.fill('[name="email"]', 'admin@hapa.mr');
    await page.fill('[name="password"]', '42049074');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await page.waitForURL('**/admin/**', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    console.log('✅ Successfully logged in');
    
    // Navigate to the specific media content submission
    console.log('📄 Navigating to media content submission page...');
    await page.goto('http://localhost:3000/admin/collections/media-content-submissions/35');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of the full page
    console.log('📸 Taking screenshot...');
    await page.screenshot({ 
      path: '.playwright-mcp/admin-arabic-headers-test.png',
      fullPage: true
    });
    
    // Check console errors
    const logs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(`Console Error: ${msg.text()}`);
      }
    });
    
    // Check for Arabic headers
    console.log('🔍 Checking for Arabic headers...');
    
    // Look for the specific Arabic text
    const reasonsHeader = await page.locator('text=الأسباب المختارة:').count();
    const attachmentsHeader = await page.locator('text=أنواع المرفقات:').count();
    const frenchReasonsHeader = await page.locator('text=MOTIFS SÉLECTIONNÉS').count();
    const frenchAttachmentsHeader = await page.locator('text=TYPES DE PIÈCES JOINTES').count();
    
    console.log('\n=== HEADER VERIFICATION ===');
    console.log(`Arabic Reasons Header (الأسباب المختارة:): ${reasonsHeader > 0 ? '✅ FOUND' : '❌ NOT FOUND'}`);
    console.log(`Arabic Attachments Header (أنواع المرفقات:): ${attachmentsHeader > 0 ? '✅ FOUND' : '❌ NOT FOUND'}`);
    console.log(`French Reasons Header (MOTIFS SÉLECTIONNÉS): ${frenchReasonsHeader > 0 ? '⚠️ STILL PRESENT' : '✅ REMOVED'}`);
    console.log(`French Attachments Header (TYPES DE PIÈCES JOINTES): ${frenchAttachmentsHeader > 0 ? '⚠️ STILL PRESENT' : '✅ REMOVED'}`);
    
    // Check RTL direction
    const bodyDir = await page.locator('body').getAttribute('dir');
    const htmlDir = await page.locator('html').getAttribute('dir');
    console.log(`\n=== RTL DIRECTION CHECK ===`);
    console.log(`HTML dir attribute: ${htmlDir || 'not set'}`);
    console.log(`Body dir attribute: ${bodyDir || 'not set'}`);
    
    // Check for any Arabic text content
    const arabicContent = await page.locator('[dir="rtl"], .rtl, text=/[\u0600-\u06FF]+/').count();
    console.log(`Arabic content blocks found: ${arabicContent}`);
    
    // Get page title and URL for verification
    const pageTitle = await page.title();
    const currentURL = page.url();
    console.log(`\n=== PAGE INFO ===`);
    console.log(`Current URL: ${currentURL}`);
    console.log(`Page Title: ${pageTitle}`);
    
    // Check for specific form sections
    const reasonsSection = await page.locator('[data-testid="reasons-section"], .reasons-section').count();
    const attachmentsSection = await page.locator('[data-testid="attachments-section"], .attachments-section').count();
    console.log(`\n=== FORM SECTIONS ===`);
    console.log(`Reasons sections found: ${reasonsSection}`);
    console.log(`Attachments sections found: ${attachmentsSection}`);
    
    // Log console errors if any
    if (logs.length > 0) {
      console.log('\n=== CONSOLE ERRORS ===');
      logs.forEach(log => console.log(log));
    } else {
      console.log('\n✅ No console errors detected');
    }
    
    console.log('\n📸 Screenshot saved to: .playwright-mcp/admin-arabic-headers-test.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: '.playwright-mcp/admin-error.png' });
    throw error;
  } finally {
    await browser.close();
  }
}

testAdminArabicHeaders().catch(console.error);