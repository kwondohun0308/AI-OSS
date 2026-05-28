const { test, expect } = require('@playwright/test');

test('week13 dashboard shows experiment decision and feedback', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Week13 Experiment Lab' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Pivot / Persevere' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Persona Feedback' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Weekly Report Snapshot' })).toBeVisible();

  await page.getByLabel('User').fill('analyst-amy');
  await page.getByLabel('Experiment').fill('homepage-cta');
  await page.getByRole('button', { name: 'Refresh scenario' }).click();

  await expect(page.getByText('analyst-amy')).toBeVisible();
  await expect(page.getByText('decision: Persevere', { exact: true })).toBeVisible();
});