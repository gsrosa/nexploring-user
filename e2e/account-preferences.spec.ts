import { expect, test } from '@playwright/test';

test.describe('Account — preferences (App / AccountLayout)', () => {
  test('should show travel preferences with the account sidebar on /profile/settings', async ({
    page,
  }) => {
    await page.goto('/profile/settings');

    await expect(
      page.getByRole('button', { name: /^Preferences$/, exact: true }),
    ).toHaveAttribute('aria-current', 'page');

    await expect(page.getByRole('heading', { name: /Travel preferences/i })).toBeVisible({
      timeout: 30_000,
    });
  });
});
