import { expect, test } from '@playwright/test';

test('browser test runner is available', async ({ page }) => {
  await page.setContent('<main><h1>Potion Lab browser test</h1></main>');
  await expect(
    page.getByRole('heading', { name: 'Potion Lab browser test' })
  ).toBeVisible();
});
