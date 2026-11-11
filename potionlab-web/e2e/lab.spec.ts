import { expect, test, type Page } from '@playwright/test';
const catalog = Array.from({ length: 60 }, (_, index) => ({
  id: `item-${index}`,
  name: `Ingredient ${index}`,
  description: 'Ingredient description',
  element: index < 3 ? 'fire' : index === 3 ? 'earth' : 'water',
  properties: ['healing'],
  assets: {
    full: `full-${index}.png`,
    thumb64: `64-${index}.png`,
    thumb128: `128-${index}.png`,
  },
}));
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=',
  'base64'
);

async function setup(page: Page) {
  await page.route('https://**/*', (route) =>
    route.fulfill({ contentType: 'image/png', body: png })
  );
  await page.route('**/api/ingredients?*', (route) =>
    route.fulfill({ json: catalog })
  );
  await page.goto('/');
  await expect(
    page.getByRole('button', { name: 'Інформація: Ingredient 0', exact: true })
  ).toBeVisible();
}
const add = (page: Page, index: number) =>
  page
    .getByRole('button', { name: `Додати: Ingredient ${index}`, exact: true })
    .click();

test('selection, local result, locked language and reset', async ({ page }) => {
  let requests = 0;

  await page.route('**/api/brew?*', (route) => {
    requests++;
    return route.fulfill({ json: { status: 'useless' } });
  });
  await setup(page);
  await expect(
    page.getByRole('button', { name: 'Зварити зілля', exact: true })
  ).toBeDisabled();
  await add(page, 0);
  await add(page, 1);
  await add(page, 2);
  await expect(
    page.getByRole('button', { name: 'Додати: Ingredient 3', exact: true })
  ).toBeDisabled();
  expect(requests).toBe(0);
  await page
    .getByRole('button', { name: 'Зварити зілля', exact: true })
    .click();
  await expect(
    page.getByText('Магія не почалася.', { exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Видалити: Ingredient 0', exact: true })
  ).toBeDisabled();
  await page.getByRole('button', { name: 'Налаштування', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('combobox')).toBeDisabled();
  await page.keyboard.press('Escape');
  await page
    .getByRole('button', { name: 'Зварити інше зілля', exact: true })
    .click();
  await expect(
    page.getByText('Обрані інгредієнти (0/3)', { exact: true })
  ).toBeVisible();
  expect(requests).toBe(0);
});
test('pending locks controls, failed request preserves selection and manual retry completes', async ({
  page,
}) => {
  let requests = 0;
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });

  await page.route('**/api/brew?*', async (route) => {
    requests++;
    expect(route.request().postDataJSON()).toEqual({
      ingredientIds: ['item-0', 'item-1', 'item-3'],
    });
    expect(route.request().url()).toContain('lang=ua');
    if (requests === 1) {
      await gate;
      await route.fulfill({ status: 503, json: {} });
    } else
      await route.fulfill({
        json: {
          status: 'brewed',
          properties: { healing: 3 },
          description: 'A potion. '.repeat(2000),
        },
      });
  });
  await setup(page);
  await add(page, 0);
  await add(page, 1);
  await add(page, 3);
  await page
    .getByRole('button', { name: 'Зварити зілля', exact: true })
    .dblclick();
  await expect(
    page.getByRole('button', { name: 'Зілля вариться…', exact: true })
  ).toBeDisabled();
  await expect(
    page.getByRole('button', { name: 'Видалити: Ingredient 0', exact: true })
  ).toBeDisabled();
  release();
  await expect(page.getByRole('alert')).toContainText('тимчасово недоступний');
  await expect(
    page.getByRole('button', { name: 'Видалити: Ingredient 0', exact: true })
  ).toBeEnabled();
  await page
    .getByRole('button', { name: 'Спробувати ще', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Зварити інше зілля', exact: true })
  ).toBeVisible();
  expect(requests).toBe(2);
  expect(
    await page
      .locator('.result-description')
      .evaluate((el) => el.scrollHeight > el.clientHeight)
  ).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollHeight <= innerHeight
    )
  ).toBe(true);
});
test('info modal loads full lazily, add and remove sync with catalog; language keeps ids', async ({
  page,
}) => {
  const full: string[] = [];

  page.on('request', (request) => {
    if (request.url().includes('/full-')) full.push(request.url());
  });
  await setup(page);
  expect(full).toHaveLength(0);
  await page
    .getByRole('button', { name: 'Інформація: Ingredient 0', exact: true })
    .click();
  const modal = page.getByRole('dialog');

  await expect(modal.getByText('Елемент: Вогонь')).toBeVisible();
  await modal.getByRole('button', { name: 'Додати', exact: true }).click();
  await expect(
    modal.getByRole('button', { name: 'Обрано', exact: true })
  ).toBeDisabled();
  await page.keyboard.press('Escape');
  await page
    .getByRole('button', { name: 'Видалити: Ingredient 0', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Додати: Ingredient 0', exact: true })
  ).toBeEnabled();
  await add(page, 0);
  await page.getByRole('button', { name: 'Налаштування', exact: true }).click();
  await page.getByRole('dialog').getByRole('combobox').selectOption('en');
  await page.keyboard.press('Escape');
  await expect(
    page.getByText('Selected ingredients (1/3)', { exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Add: Ingredient 0', exact: true })
  ).toBeDisabled();
});
test('failed image uses placeholder and catalog retry works', async ({
  page,
}) => {
  await page.route('https://**/*', (route) =>
    route.request().url().includes('cloudfront')
      ? route.abort()
      : route.fulfill({ contentType: 'image/png', body: png })
  );
  let available = false;

  await page.route('**/api/ingredients?*', (route) =>
    route.fulfill(available ? { json: catalog } : { status: 500, json: {} })
  );
  await page.goto('/');
  await expect(page.getByRole('alert')).toBeVisible();
  available = true;
  await page
    .getByRole('button', { name: 'Спробувати ще', exact: true })
    .click();
  await expect(page.locator('.ingredient-card img').first()).toHaveAttribute(
    'src',
    /placehold.co\/128x128/
  );
});
for (const width of [1024, 1280, 1440, 1920]) {
  test(`fixed layout at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 600 });
    await setup(page);
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <= innerWidth &&
          document.documentElement.scrollHeight <= innerHeight
      )
    ).toBe(true);
    expect(
      await page
        .locator('.ingredient-grid')
        .evaluate((el) => el.scrollHeight > el.clientHeight)
    ).toBe(true);
    const action = await page
      .getByRole('button', { name: 'Зварити зілля', exact: true })
      .boundingBox();

    expect(action!.y + action!.height).toBeLessThanOrEqual(600);
  });
}
test('under 1024 shows only future mobile message without fetching catalog', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1023, height: 768 });
  let requests = 0;

  page.on('request', (request) => {
    if (/\/api\/(ingredients|brew)\?/.test(request.url())) requests++;
  });
  await page.goto('/');
  await expect(page.getByText(/Мобільний застосунок/)).toBeVisible();
  await expect(page.getByRole('button')).toHaveCount(0);
  expect(requests).toBe(0);
});
test('startup waits for thumbnails; failed full image still exposes ingredient controls', async ({
  page,
}) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });

  await page.route('https://**/*', async (route) => {
    const url = route.request().url();

    if (url.includes('/full-')) return route.abort();
    if (url.includes('/128-0')) await gate;
    await route.fulfill({ contentType: 'image/png', body: png });
  });
  await page.route('**/api/ingredients?*', (route) =>
    route.fulfill({ json: catalog })
  );
  await page.goto('/');
  await expect(page.getByRole('status')).toHaveText('Завантаження…');
  await expect(page.locator('.ingredient-card')).toHaveCount(0);
  release();
  await page
    .getByRole('button', { name: 'Інформація: Ingredient 0', exact: true })
    .click();
  const modal = page.getByRole('dialog');

  await expect(modal.getByText('Ingredient description')).toBeVisible();
  await expect(modal.locator('img')).toHaveAttribute(
    'src',
    /placehold.co\/480x480/
  );
  await expect(
    modal.getByRole('button', { name: 'Додати', exact: true })
  ).toBeEnabled();
});
test('element filter defaults to all and changes only visible catalog cards', async ({
  page,
}) => {
  let catalogRequests = 0;

  page.on('request', (request) => {
    if (request.url().includes('/api/ingredients?')) catalogRequests++;
  });
  await setup(page);
  const filter = page.getByRole('combobox', { name: 'Фільтр за елементом' });

  await expect(filter).toHaveValue('all');
  await expect(filter.getByRole('option')).toHaveCount(7);
  await expect(page.locator('.ingredient-card')).toHaveCount(60);
  const before = catalogRequests;

  await add(page, 0);
  await filter.selectOption('earth');
  await expect(page.locator('.ingredient-card')).toHaveCount(1);
  await expect(page.locator('.ingredient-card')).toContainText('Ingredient 3');
  await expect(
    page.getByRole('button', { name: 'Видалити: Ingredient 0', exact: true })
  ).toBeVisible();
  await add(page, 3);
  await filter.selectOption('air');
  await expect(page.locator('.ingredient-card')).toHaveCount(0);
  await filter.selectOption('all');
  await expect(page.locator('.ingredient-card')).toHaveCount(60);
  await expect(
    page.getByRole('button', { name: 'Додати: Ingredient 0', exact: true })
  ).toBeDisabled();
  await expect(
    page.getByRole('button', { name: 'Додати: Ingredient 3', exact: true })
  ).toBeDisabled();
  expect(catalogRequests).toBe(before);
  await page.getByRole('button', { name: 'Налаштування', exact: true }).click();
  await page.getByRole('combobox', { name: 'Мова' }).selectOption('en');
  await page.keyboard.press('Escape');
  await expect(
    page
      .getByRole('combobox', { name: 'Filter by element' })
      .getByRole('option', { name: 'All', exact: true })
  ).toBeAttached();
  await expect(
    page
      .getByRole('combobox', { name: 'Filter by element' })
      .getByRole('option', { name: 'Fire', exact: true })
  ).toBeAttached();
  await expect(
    page.getByText('Selected ingredients (2/3)', { exact: true })
  ).toBeVisible();
});
