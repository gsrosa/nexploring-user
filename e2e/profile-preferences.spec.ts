import { expect, test } from '@playwright/test';

test.describe('Profile — preferences (ProfileLayout)', () => {
  test('should show travel preferences in the profile shell on /profile/preferences', async ({
    page,
  }) => {
    await page.goto('/profile/preferences');

    await expect(
      page.getByRole('navigation', { name: /account sections/i }).getByRole('link', { name: /^Preferences$/ }),
    ).toBeVisible();

    await expect(page.getByRole('heading', { name: /Travel preferences/i })).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.getByText(/Atlas uses these to personalise every trip plan to your style/i),
    ).toBeVisible();
  });
});
