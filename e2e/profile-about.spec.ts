import { expect, test } from '@playwright/test';

test.describe('Profile — about (ProfileLayout)', () => {
  test('should show the profile editor and shell navigation on /profile/about', async ({ page }) => {
    await page.goto('/profile/about');

    await expect(page.getByRole('heading', { name: /^Profile$/ })).toBeVisible();
    await expect(page.getByText(/Manage your personal information/i)).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: /account sections/i }).getByRole('link', { name: /^Profile$/ }),
    ).toBeVisible();
  });
});
