import { expect, test } from '@playwright/test';
import {
  type ExpectedCards,
  type Mode,
  enterSalary,
  errorAlert,
  expectCards,
  expectNoError,
  openApp,
} from './helpers';

interface CardCase {
  name: string;
  mode: Mode;
  amount: string;
  expected: ExpectedCards;
}

// Expected figures are worked out by hand from the slab table in docs/user-stories.md.
const INDIVIDUAL_CASES: readonly CardCase[] = [
  {
    name: 'Monthly 100,000',
    mode: 'Monthly',
    amount: '100000',
    expected: {
      yearlyIncome: 'PKR 1,200,000',
      yearlyTax: 'PKR 6,000',
      yearlyNet: 'PKR 1,194,000',
      monthlyTax: 'PKR 500',
      monthlyNet: 'PKR 99,500',
    },
  },
  {
    name: 'Annual 1,000,000',
    mode: 'Annual',
    amount: '1000000',
    expected: {
      yearlyIncome: 'PKR 1,000,000',
      yearlyTax: 'PKR 4,000',
      yearlyNet: 'PKR 996,000',
      monthlyTax: 'PKR 333',
      monthlyNet: 'PKR 83,000',
    },
  },
  {
    name: 'Annual 600,000 (first slab edge)',
    mode: 'Annual',
    amount: '600000',
    expected: {
      yearlyIncome: 'PKR 600,000',
      yearlyTax: 'PKR 0',
      yearlyNet: 'PKR 600,000',
      monthlyTax: 'PKR 0',
      monthlyNet: 'PKR 50,000',
    },
  },
  {
    name: 'Annual 600,600 (monthly 0.50 and 50,049.50 round up)',
    mode: 'Annual',
    amount: '600600',
    expected: {
      yearlyIncome: 'PKR 600,600',
      yearlyTax: 'PKR 6',
      yearlyNet: 'PKR 600,594',
      monthlyTax: 'PKR 1',
      monthlyNet: 'PKR 50,050',
    },
  },
];

// Other incomes named in the criteria; checked in one test to save page loads.
const LOOP_CASES: readonly CardCase[] = [
  {
    name: 'Annual 2,000,000',
    mode: 'Annual',
    amount: '2000000',
    expected: {
      yearlyIncome: 'PKR 2,000,000',
      yearlyTax: 'PKR 94,000',
      yearlyNet: 'PKR 1,906,000',
      monthlyTax: 'PKR 7,833',
      monthlyNet: 'PKR 158,833',
    },
  },
  {
    name: 'Annual 5,000,000',
    mode: 'Annual',
    amount: '5000000',
    expected: {
      yearlyIncome: 'PKR 5,000,000',
      yearlyTax: 'PKR 802,000',
      yearlyNet: 'PKR 4,198,000',
      monthlyTax: 'PKR 66,833',
      monthlyNet: 'PKR 349,833',
    },
  },
  {
    name: 'Annual 8,000,000',
    mode: 'Annual',
    amount: '8000000',
    expected: {
      yearlyIncome: 'PKR 8,000,000',
      yearlyTax: 'PKR 1,774,000',
      yearlyNet: 'PKR 6,226,000',
      monthlyTax: 'PKR 147,833',
      monthlyNet: 'PKR 518,833',
    },
  },
  {
    name: 'Annual 600,001 (exact tax 0.01 rounds to 0)',
    mode: 'Annual',
    amount: '600001',
    expected: {
      yearlyIncome: 'PKR 600,001',
      yearlyTax: 'PKR 0',
      yearlyNet: 'PKR 600,001',
      monthlyTax: 'PKR 0',
      monthlyNet: 'PKR 50,000',
    },
  },
  {
    name: 'Annual 7,000,000 (top slab edge)',
    mode: 'Annual',
    amount: '7000000',
    expected: {
      yearlyIncome: 'PKR 7,000,000',
      yearlyTax: 'PKR 1,424,000',
      yearlyNet: 'PKR 5,576,000',
      monthlyTax: 'PKR 118,667',
      monthlyNet: 'PKR 464,667',
    },
  },
  {
    name: 'Annual 10,000,000,000 (maximum)',
    mode: 'Annual',
    amount: '10000000000',
    expected: {
      yearlyIncome: 'PKR 10,000,000,000',
      yearlyTax: 'PKR 3,498,974,000',
      yearlyNet: 'PKR 6,501,026,000',
      monthlyTax: 'PKR 291,581,167',
      monthlyNet: 'PKR 541,752,167',
    },
  },
  {
    name: 'Annual 1 (smallest whole amount)',
    mode: 'Annual',
    amount: '1',
    expected: {
      yearlyIncome: 'PKR 1',
      yearlyTax: 'PKR 0',
      yearlyNet: 'PKR 1',
      monthlyTax: 'PKR 0',
      monthlyNet: 'PKR 0',
    },
  },
  {
    name: 'Annual 600,050 (exact tax 0.50 rounds up to 1)',
    mode: 'Annual',
    amount: '600050',
    expected: {
      yearlyIncome: 'PKR 600,050',
      yearlyTax: 'PKR 1',
      yearlyNet: 'PKR 600,049',
      monthlyTax: 'PKR 0',
      monthlyNet: 'PKR 50,004',
    },
  },
  {
    name: 'Annual 600,150 (exact tax 1.50 rounds up to 2)',
    mode: 'Annual',
    amount: '600150',
    expected: {
      yearlyIncome: 'PKR 600,150',
      yearlyTax: 'PKR 2',
      yearlyNet: 'PKR 600,148',
      monthlyTax: 'PKR 0',
      monthlyNet: 'PKR 50,012',
    },
  },
  {
    name: 'Annual 600,149 (exact tax 1.49 rounds down to 1)',
    mode: 'Annual',
    amount: '600149',
    expected: {
      yearlyIncome: 'PKR 600,149',
      yearlyTax: 'PKR 1',
      yearlyNet: 'PKR 600,148',
      monthlyTax: 'PKR 0',
      monthlyNet: 'PKR 50,012',
    },
  },
];

test.describe('S-1 [P0] (B-2, B-4): result cards', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page);
  });

  for (const { name, mode, amount, expected } of INDIVIDUAL_CASES) {
    test(`S-1 [P0] (B-2, B-4): ${name} shows all five figures and no error`, async ({ page }) => {
      await enterSalary(page, amount, mode);
      await expectCards(page, expected);
      await expect(errorAlert(page)).toHaveCount(0);
    });
  }

  test('S-1 [P0] (B-2, B-4): the other incomes named in the criteria show all five figures and no error', async ({
    page,
  }) => {
    for (const { name, mode, amount, expected } of LOOP_CASES) {
      await test.step(name, async () => {
        await enterSalary(page, amount, mode);
        await expectCards(page, expected);
        await expectNoError(page);
      });
    }
  });

  test('S-1 [P0] (B-2, B-4): the five cards are labelled in the story wording', async ({
    page,
  }) => {
    await enterSalary(page, '100000', 'Monthly');
    await expect(page.getByRole('heading', { name: 'Your results' })).toBeVisible();
    await expect(page.getByRole('article')).toHaveCount(5);
    for (const label of [
      'Monthly tax',
      'Monthly net pay',
      'Yearly income',
      'Yearly tax',
      'Yearly net pay',
    ]) {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    }
  });

  test('S-1 [P0] (B-2, B-4): changing to another valid amount updates all five figures', async ({
    page,
  }) => {
    await enterSalary(page, '100000', 'Monthly');
    await expectCards(page, {
      yearlyIncome: 'PKR 1,200,000',
      yearlyTax: 'PKR 6,000',
      yearlyNet: 'PKR 1,194,000',
      monthlyTax: 'PKR 500',
      monthlyNet: 'PKR 99,500',
    });

    // 200,000 a month is 2,400,000 a year: 116,000 + 20% of 200,000 = 156,000.
    await enterSalary(page, '200000');
    await expectCards(page, {
      yearlyIncome: 'PKR 2,400,000',
      yearlyTax: 'PKR 156,000',
      yearlyNet: 'PKR 2,244,000',
      monthlyTax: 'PKR 13,000',
      monthlyNet: 'PKR 187,000',
    });
  });
});
