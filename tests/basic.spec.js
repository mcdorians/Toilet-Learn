const { test, expect } = require('@playwright/test');

test('loads home page', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Universeller Quiz-Player');
});
