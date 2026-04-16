import { expect, test } from '@playwright/test';

test.describe('Profile — password (ProfileLayout)', () => {
  test('should show the change-password form on /profile/password', async ({ page }) => {
    await page.goto('/profile/password');

    await expect(page.getByRole('heading', { name: /^Password$/ })).toBeVisible();
    await expect(
      page.getByText(/Update your password to keep your account secure/i),
    ).toBeVisible();
    await expect(page.getByLabel(/^Current password$/i)).toBeVisible();
    await expect(page.getByLabel(/^New password$/i)).toBeVisible();
  });
});
