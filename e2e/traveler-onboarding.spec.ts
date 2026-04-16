import { expect, test } from '@playwright/test';

test.describe('Traveler onboarding (full-screen)', () => {
  test('should show the first traveler profile section or a loading state on /profile/onboarding', async ({
    page,
  }) => {
    await page.goto('/profile/onboarding');

    const foodHeading = page.getByRole('heading', { name: /Food & Diet/i });
    const loading = page.getByText(/^Loading…$/);

    await expect
      .poll(
        async () => (await foodHeading.isVisible()) || (await loading.isVisible()),
        { timeout: 30_000 },
      )
      .toBe(true);

    await expect(foodHeading.or(loading)).toBeVisible();
  });
});
