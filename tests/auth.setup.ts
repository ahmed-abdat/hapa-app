import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/admin.json';

setup('authenticate admin', async ({ page }) => {
  console.log('Setting up admin authentication...');
  
  // Navigate to admin login
  await page.goto('/admin');
  
  // Fill login credentials
  await page.getByLabel('Email', { exact: true }).fill('admin@hapa.mr');
  await page.getByLabel('Password', { exact: true }).fill('42049074');
  
  // Submit login form
  await page.getByRole('button', { name: 'Sign In' }).click();
  
  // Wait for successful authentication - adjust selector based on actual admin dashboard
  await page.waitForURL(/\/admin\/.*/, { timeout: 10000 });
  
  // Verify admin is logged in by checking for admin-specific elements
  await expect(page.locator('[data-testid="admin-dashboard"], .admin-nav, [href*="/admin/collections"]')).toBeVisible({ timeout: 5000 });
  
  // Save authentication state
  await page.context().storageState({ path: authFile });
  
  console.log('Admin authentication setup complete');
});