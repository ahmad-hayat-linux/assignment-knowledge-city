import { expect, test } from '@playwright/test';
import { enterSalary, openApp, rateValue, resultsHeading } from './helpers';

const CASES = [
  { name: 'Annual 2,000,000', amount: '2000000', rate: '11%' },
  { name: 'Annual 5,000,000', amount: '5000000', rate: '29%' },
  { name: 'exactly 600,000 (slab boundary, rate of the slab above)', amount: '600000', rate: '1%' },
  { name: 'exactly 7,000,000', amount: '7000000', rate: '35%' },
  { name: 'income of 0', amount: '0', rate: '0%' },
  { name: 'Annual 8,000,000 (above 7,000,000)', amount: '8000000', rate: '35%' },
];

test.describe('S-5 [P2] (B-2): marginal tax rate', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page);
  });

  for (const { name, amount, rate } of CASES) {
    test(`S-5 [P2] (B-2): ${name} shows the marginal rate "${rate}"`, async ({ page }) => {
      await enterSalary(page, amount, 'Annual');
      await expect(resultsHeading(page)).toBeVisible();
      await expect(rateValue(page, 'Tax rate on your next rupee')).toHaveText(rate);
    });
  }

  test('S-5 [P2] (B-2): Monthly 100,000 (1,200,000 a year) shows the rate of the slab above, 11%', async ({
    page,
  }) => {
    await enterSalary(page, '100000', 'Monthly');
    await expect(rateValue(page, 'Tax rate on your next rupee')).toHaveText('11%');
  });

  test('S-5 [P2] (B-2): the marginal rate is not shown without a result', async ({ page }) => {
    await expect(page.getByText('Tax rate on your next rupee')).toHaveCount(0);
    await enterSalary(page, 'abc');
    await expect(page.getByText('Tax rate on your next rupee')).toHaveCount(0);
  });
});
