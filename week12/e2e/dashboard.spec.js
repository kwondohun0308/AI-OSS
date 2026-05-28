const { test, expect } = require('@playwright/test');

test('release dashboard updates after user input', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('User').fill('alice');
  await page.getByLabel('Experiment').fill('pricing-copy');
  await page.getByLabel('Legacy order text').fill('SKU-1|price=1000|qty=2|coupon=SAVE10|customerType=standard');
  await page.getByRole('button', { name: 'Analyze release' }).click();

  await expect(page.getByText('Week12 Testing Lab')).toBeVisible();
  await expect(page.getByLabel('User')).toHaveValue('alice');
  await expect(page.getByLabel('Experiment')).toHaveValue('pricing-copy');
  await expect(page.locator('.badge').filter({ hasText: 'variant:' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Legacy Pricing' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Canary Rollout' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Event Tracker' })).toBeVisible();
});