import { expect, test } from '@playwright/test';
import {
  amountInput,
  cardValue,
  enterSalary,
  errorAlert,
  expectCards,
  expectNoError,
  expectNoResults,
  modeRadio,
  openApp,
  resetButton,
  resultsHeading,
  slabTableSection,
} from './helpers';

const PHONE_WIDTH = 375;
const PHONE_HEIGHT = 800;
const SLAB_COUNT = 8;

// Expected values are worked out from the slab table in docs/user-stories.md.
const MONTHLY_100K_CARDS = {
  monthlyTax: 'PKR 500',
  monthlyNet: 'PKR 99,500',
  yearlyIncome: 'PKR 1,200,000',
  yearlyTax: 'PKR 6,000',
  yearlyNet: 'PKR 1,194,000',
};

test.describe('S-12 [P0] (B-7): works in current browsers', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page);
  });

  test('S-12 [P0] (B-7): the app loads with title, heading, tax year, slab table and no error screen', async ({
    page,
  }) => {
    await expect(page).toHaveTitle('Pakistan Salary Tax Calculator 2026-27');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Pakistan Salary Tax Calculator' }),
    ).toBeVisible();
    await expect(page.getByText('Tax year 2026-27').first()).toBeVisible();
    await expect(slabTableSection(page).locator('tbody tr')).toHaveCount(SLAB_COUNT);
    await expect(errorAlert(page)).toHaveCount(0);
  });

  test('S-12 [P0] (B-7): Monthly 100,000 shows the five S-1 figures', async ({ page }) => {
    await enterSalary(page, '100000', 'Monthly');
    await expectCards(page, MONTHLY_100K_CARDS);
  });

  test('S-12 [P0] (B-7): "abc" shows the error and no results, then a valid amount clears it', async ({
    page,
  }) => {
    await enterSalary(page, 'abc');
    await expect(errorAlert(page)).toHaveText('Salary must be a number');
    await expectNoResults(page);

    await enterSalary(page, '100000');
    await expectNoError(page);
    await expect(resultsHeading(page)).toBeVisible();
    await expectCards(page, MONTHLY_100K_CARDS);
  });

  test('S-12 [P0] (B-7): typing "." enters nothing and "100000.50" shows "100000"', async ({
    page,
  }) => {
    await amountInput(page).pressSequentially('.');
    await expect(amountInput(page)).toHaveValue('');

    await amountInput(page).fill('100000.50');
    await expect(amountInput(page)).toHaveValue('100000');
  });

  test('S-12 [P0] (B-7): Annual 100,000 switched to Monthly shows "8,333" and yearly income PKR 100,000', async ({
    page,
  }) => {
    await enterSalary(page, '100000', 'Annual');
    await modeRadio(page, 'Monthly').check();
    await expect(amountInput(page)).toHaveValue('8,333');
    await expect(cardValue(page, 'Yearly income')).toHaveText('PKR 100,000');
  });

  test('S-12 [P0] (B-7): Reset with a result showing empties the field, removes results and selects Monthly', async ({
    page,
  }) => {
    await enterSalary(page, '1000000', 'Annual');
    await expect(resultsHeading(page)).toBeVisible();

    await resetButton(page).click();
    await expect(amountInput(page)).toHaveValue('');
    await expectNoResults(page);
    await expect(modeRadio(page, 'Monthly')).toBeChecked();
  });

  test('S-12 [P0] (B-7): the maximum annual income shows "PKR 3,498,974,000" in full digits', async ({
    page,
  }) => {
    await enterSalary(page, '10000000000', 'Annual');
    const yearlyTax = cardValue(page, 'Yearly tax');
    await expect(yearlyTax).toHaveText('PKR 3,498,974,000');
    await expect(yearlyTax).not.toContainText('.');
    await expect(yearlyTax).not.toContainText(/e/i);
  });

  test.describe('at 375 px wide', () => {
    test.use({ viewport: { width: PHONE_WIDTH, height: PHONE_HEIGHT } });

    test('S-12 [P0] (B-7): the page does not scroll sideways', async ({ page }) => {
      const overflow = async (): Promise<number> =>
        page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
      expect(await overflow()).toBeLessThanOrEqual(0);

      await enterSalary(page, '10000000000', 'Annual');
      await expect(resultsHeading(page)).toBeVisible();
      expect(await overflow()).toBeLessThanOrEqual(0);
    });
  });
});
