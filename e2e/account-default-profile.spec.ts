import { expect, test } from '@playwright/test';

test.describe('Account — default profile section (App / AccountLayout)', () => {
  test('should show the profile editor with the account sidebar on /profile/wrapped-account', async ({
    page,
  }) => {
    await page.goto('/profile/wrapped-account');

    await expect(
      page.getByRole('button', { name: /^Profile$/, exact: true }),
    ).toHaveAttribute('aria-current', 'page');

    await expect(page.getByRole('heading', { name: /^Profile$/ })).toBeVisible();
    await expect(page.getByText(/Manage your personal information/i)).toBeVisible();
  });
});
