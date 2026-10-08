import { expect, test } from '@playwright/test';
import { DISCLAIMER, enterSalary, openApp } from './helpers';

const TAX_YEAR = 'Tax year 2026-27';

test.describe('S-7 [P1] (B-1): tax year and disclaimer', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page);
  });

  test('S-7 [P1] (B-1): the page title and the main landmark are present', async ({ page }) => {
    await expect(page).toHaveTitle('Pakistan Salary Tax Calculator 2026-27');
    await expect(page.getByRole('main')).toHaveCount(1);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Pakistan Salary Tax Calculator' }),
    ).toBeVisible();
  });

  test('S-7 [P1] (B-1): the tax year is shown on the first screen', async ({ page }) => {
    await expect(page.getByText(TAX_YEAR, { exact: true })).toBeVisible();
  });

  test('S-7 [P1] (B-1): the tax year is still shown with a result', async ({ page }) => {
    await enterSalary(page, '100000');
    await expect(page.getByText(TAX_YEAR, { exact: true })).toBeVisible();
  });

  test('S-7 [P1] (B-1): the tax year is still shown with an error', async ({ page }) => {
    await enterSalary(page, 'abc');
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByText(TAX_YEAR, { exact: true })).toBeVisible();
  });

  test('S-7 [P1] (B-1): the tax year is still shown after Reset', async ({ page }) => {
    await enterSalary(page, '100000');
    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(page.getByText(TAX_YEAR, { exact: true })).toBeVisible();
  });

  test('S-7 [P1] (B-1): a result shows the exact estimate notice', async ({ page }) => {
    await enterSalary(page, '100000');
    await expect(page.getByText(DISCLAIMER, { exact: true })).toBeVisible();
  });

  test('S-7 [P1] (B-1): the notice is shown for a result of zero tax', async ({ page }) => {
    await enterSalary(page, '0');
    await expect(page.getByText(DISCLAIMER, { exact: true })).toBeVisible();
  });
});
