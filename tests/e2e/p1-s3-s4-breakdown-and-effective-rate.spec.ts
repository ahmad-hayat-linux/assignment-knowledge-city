import { expect, test, type Page } from '@playwright/test';
import {
  breakdownSection,
  enterSalary,
  expectNoResults,
  openApp,
  rateValue,
  resultsHeading,
} from './helpers';

interface BreakdownRow {
  slab: string;
  income: string;
  rate: string;
  tax: string;
}

const SLAB_1 = 'PKR 0 to 600,000';
const SLAB_2 = 'PKR 600,001 to 1,200,000';
const SLAB_3 = 'PKR 1,200,001 to 2,200,000';
const SLAB_4 = 'PKR 2,200,001 to 3,200,000';
const SLAB_5 = 'PKR 3,200,001 to 4,100,000';
const SLAB_6 = 'PKR 4,100,001 to 5,600,000';
const SLAB_7 = 'PKR 5,600,001 to 7,000,000';
const SLAB_8 = 'Above PKR 7,000,000';

const expectBreakdownRows = async (page: Page, rows: readonly BreakdownRow[]): Promise<void> => {
  const bodyRows = breakdownSection(page).locator('tbody tr');
  await expect(bodyRows).toHaveCount(rows.length);
  for (const [index, row] of rows.entries()) {
    const bodyRow = bodyRows.nth(index);
    await expect(bodyRow.getByRole('rowheader')).toHaveText(row.slab);
    const cells = bodyRow.getByRole('cell');
    await expect(cells.nth(0)).toHaveText(row.income);
    await expect(cells.nth(1)).toHaveText(row.rate);
    await expect(cells.nth(2)).toHaveText(row.tax);
  }
};

test.describe('S-3 [P1] (B-5): slab breakdown', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page);
  });

  test('S-3 [P1] (B-5): 2,000,000 lists three slabs with their income, rate and tax', async ({
    page,
  }) => {
    await enterSalary(page, '2000000', 'Annual');
    await expectBreakdownRows(page, [
      { slab: SLAB_1, income: '600,000', rate: '0%', tax: 'PKR 0' },
      { slab: SLAB_2, income: '600,000', rate: '1%', tax: 'PKR 6,000' },
      { slab: SLAB_3, income: '800,000', rate: '11%', tax: 'PKR 88,000' },
    ]);
  });

  test('S-3 [P1] (B-5): the slab taxes for 2,000,000 add up to the yearly tax of 94,000', async ({
    page,
  }) => {
    await enterSalary(page, '2000000', 'Annual');
    // 0 + 6,000 + 88,000 = 94,000
    await expect(breakdownSection(page).getByText('PKR 6,000', { exact: true })).toBeVisible();
    await expect(breakdownSection(page).getByText('PKR 88,000', { exact: true })).toBeVisible();
    await expect(
      page
        .getByRole('article')
        .filter({ has: page.getByText('Yearly tax', { exact: true }) })
        .getByText('PKR 94,000', { exact: true }),
    ).toBeVisible();
  });

  test('S-3 [P1] (B-5): 600,000 lists only the 0% slab with 600,000 and tax 0', async ({
    page,
  }) => {
    await enterSalary(page, '600000', 'Annual');
    await expectBreakdownRows(page, [
      { slab: SLAB_1, income: '600,000', rate: '0%', tax: 'PKR 0' },
    ]);
  });

  test('S-3 [P1] (B-5): 8,000,000 lists all eight slabs and the amounts add up to 8,000,000', async ({
    page,
  }) => {
    await enterSalary(page, '8000000', 'Annual');
    // Amounts: 600,000 + 600,000 + 1,000,000 + 1,000,000 + 900,000 + 1,500,000 + 1,400,000
    // + 1,000,000 = 8,000,000. Taxes sum to 1,774,000.
    await expectBreakdownRows(page, [
      { slab: SLAB_1, income: '600,000', rate: '0%', tax: 'PKR 0' },
      { slab: SLAB_2, income: '600,000', rate: '1%', tax: 'PKR 6,000' },
      { slab: SLAB_3, income: '1,000,000', rate: '11%', tax: 'PKR 110,000' },
      { slab: SLAB_4, income: '1,000,000', rate: '20%', tax: 'PKR 200,000' },
      { slab: SLAB_5, income: '900,000', rate: '25%', tax: 'PKR 225,000' },
      { slab: SLAB_6, income: '1,500,000', rate: '29%', tax: 'PKR 435,000' },
      { slab: SLAB_7, income: '1,400,000', rate: '32%', tax: 'PKR 448,000' },
      { slab: SLAB_8, income: '1,000,000', rate: '35%', tax: 'PKR 350,000' },
    ]);
  });

  test('S-3 [P1] (B-5): the breakdown table has column headings', async ({ page }) => {
    await enterSalary(page, '2000000', 'Annual');
    const headers = breakdownSection(page).getByRole('columnheader');
    await expect(headers).toHaveText(['Slab', 'Income in slab', 'Rate', 'Tax']);
  });

  test('S-3 [P1] (B-5): no result means no breakdown', async ({ page }) => {
    await expect(breakdownSection(page)).toHaveCount(0);
    await enterSalary(page, 'abc');
    await expect(breakdownSection(page)).toHaveCount(0);
    await expectNoResults(page);
  });

  test('S-3 [P1] (B-5): the breakdown follows a changed amount', async ({ page }) => {
    await enterSalary(page, '2000000', 'Annual');
    await expect(breakdownSection(page).locator('tbody tr')).toHaveCount(3);
    await enterSalary(page, '600000');
    await expect(breakdownSection(page).locator('tbody tr')).toHaveCount(1);
  });
});

test.describe('S-4 [P1] (B-5): effective tax rate', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page);
  });

  const CASES = [
    { name: 'Annual 5,000,000 (tax 802,000)', amount: '5000000', rate: '16.04%' },
    { name: 'Annual 2,000,000', amount: '2000000', rate: '4.70%' },
    { name: 'income of 0', amount: '0', rate: '0.00%' },
    { name: 'Annual 600,000', amount: '600000', rate: '0.00%' },
    // 3,498,974,000 / 10,000,000,000 = 34.98974%, shown with two decimals.
    { name: 'Annual 10,000,000,000 (maximum)', amount: '10000000000', rate: '34.99%' },
  ];

  for (const { name, amount, rate } of CASES) {
    test(`S-4 [P1] (B-5): ${name} shows the effective rate "${rate}"`, async ({ page }) => {
      await enterSalary(page, amount, 'Annual');
      await expect(resultsHeading(page)).toBeVisible();
      await expect(rateValue(page, 'Effective tax rate')).toHaveText(rate);
      await expect(page.getByText('NaN')).toHaveCount(0);
    });
  }

  test('S-4 [P1] (B-5): Monthly 100,000 shows the effective rate for 1,200,000 a year', async ({
    page,
  }) => {
    // 6,000 / 1,200,000 = 0.5%
    await enterSalary(page, '100000', 'Monthly');
    await expect(rateValue(page, 'Effective tax rate')).toHaveText('0.50%');
  });
});
