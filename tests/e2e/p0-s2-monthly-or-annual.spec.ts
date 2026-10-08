import { expect, test } from '@playwright/test';
import {
  amountInput,
  cardValue,
  enterSalary,
  errorAlert,
  expectCards,
  expectNoError,
  modeRadio,
  openApp,
} from './helpers';

const MONTHLY_100K_CARDS = {
  yearlyIncome: 'PKR 1,200,000',
  yearlyTax: 'PKR 6,000',
  yearlyNet: 'PKR 1,194,000',
  monthlyTax: 'PKR 500',
  monthlyNet: 'PKR 99,500',
};

const ANNUAL_100K_CARDS = {
  yearlyIncome: 'PKR 100,000',
  yearlyTax: 'PKR 0',
  yearlyNet: 'PKR 100,000',
  monthlyTax: 'PKR 0',
  monthlyNet: 'PKR 8,333',
};

test.describe('S-2 [P0] (B-3): monthly or annual input', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page);
  });

  test('S-2 [P0] (B-3): Monthly mode is selected when the app opens', async ({ page }) => {
    await expect(modeRadio(page, 'Monthly')).toBeChecked();
    await expect(modeRadio(page, 'Annual')).not.toBeChecked();
  });

  test('S-2 [P0] (B-3): the mode choice is a labelled group', async ({ page }) => {
    await expect(page.getByRole('group', { name: 'Salary period' })).toBeVisible();
  });

  test('S-2 [P0] (B-3): Annual 1,200,000 is 1,200,000 per year and monthly tax shows 500', async ({
    page,
  }) => {
    await enterSalary(page, '1200000', 'Annual');
    await expectCards(page, MONTHLY_100K_CARDS);
  });

  test('S-2 [P0] (B-4): switching Monthly 100,000 to Annual gives 1,200,000 and the same results', async ({
    page,
  }) => {
    await enterSalary(page, '100000');
    await modeRadio(page, 'Annual').check();
    await expect(amountInput(page)).toHaveValue('1,200,000');
    await expect(modeRadio(page, 'Annual')).toBeChecked();
    await expectCards(page, MONTHLY_100K_CARDS);
  });

  test('S-2 [P0] (B-4): switching Annual 1,200,000 to Monthly gives 100,000 and the same results', async ({
    page,
  }) => {
    await enterSalary(page, '1200000', 'Annual');
    await modeRadio(page, 'Monthly').check();
    await expect(amountInput(page)).toHaveValue('100,000');
    await expect(modeRadio(page, 'Monthly')).toBeChecked();
    await expectCards(page, MONTHLY_100K_CARDS);
  });

  test('S-2 [P0] (B-4): switching mode with an empty field keeps it empty and shows no error', async ({
    page,
  }) => {
    await modeRadio(page, 'Annual').check();
    await expect(amountInput(page)).toHaveValue('');
    await expectNoError(page);
    await modeRadio(page, 'Monthly').check();
    await expect(amountInput(page)).toHaveValue('');
    await expectNoError(page);
  });

  test('S-2 [P0] (B-4): switching mode with invalid text leaves the text and keeps the error', async ({
    page,
  }) => {
    await enterSalary(page, 'abc');
    await expect(errorAlert(page)).toHaveText('Salary must be a number');
    await modeRadio(page, 'Annual').check();
    await expect(amountInput(page)).toHaveValue('abc');
    await expect(errorAlert(page)).toHaveText('Salary must be a number');
    await modeRadio(page, 'Monthly').check();
    await expect(amountInput(page)).toHaveValue('abc');
    await expect(errorAlert(page)).toHaveText('Salary must be a number');
  });

  test('S-2 [P0] (B-4): Annual 100,000 switched to Monthly shows 8,333 and the results do not change', async ({
    page,
  }) => {
    await enterSalary(page, '100000', 'Annual');
    await modeRadio(page, 'Monthly').check();
    await expect(amountInput(page)).toHaveValue('8,333');
    // The field is rounded, but the calculation still uses the exact 100,000 a year.
    await expectCards(page, ANNUAL_100K_CARDS);
    await expectNoError(page);
  });

  test('S-2 [P0] (B-4): switching back without editing shows the original 100,000 exactly', async ({
    page,
  }) => {
    await enterSalary(page, '100000', 'Annual');
    await modeRadio(page, 'Monthly').check();
    await expect(amountInput(page)).toHaveValue('8,333');
    await modeRadio(page, 'Annual').check();
    await expect(amountInput(page)).toHaveValue('100,000');
    await expectCards(page, ANNUAL_100K_CARDS);
  });

  test('S-2 [P0] (B-4): editing after a switch calculates from the typed amount', async ({
    page,
  }) => {
    await enterSalary(page, '100000', 'Annual');
    await modeRadio(page, 'Monthly').check();
    // 9,000 a month is 108,000 a year, not the earlier 100,000.
    await amountInput(page).fill('9000');
    await expectCards(page, {
      yearlyIncome: 'PKR 108,000',
      yearlyTax: 'PKR 0',
      yearlyNet: 'PKR 108,000',
      monthlyTax: 'PKR 0',
      monthlyNet: 'PKR 9,000',
    });
  });

  test('S-2 [P0] (B-4): typing 8334 after a switch to Monthly uses the typed amount, not the old figure', async ({
    page,
  }) => {
    await enterSalary(page, '100000', 'Annual');
    await modeRadio(page, 'Monthly').check();
    await amountInput(page).fill('8334');
    await expect(cardValue(page, 'Yearly income')).toHaveText('PKR 100,008');
  });

  test('S-2 [P0] (B-4): the field never contains a decimal point after a switch', async ({
    page,
  }) => {
    await enterSalary(page, '100000', 'Annual');
    await modeRadio(page, 'Monthly').check();
    await expect(amountInput(page)).not.toHaveValue(/\./);
    await modeRadio(page, 'Annual').check();
    await expect(amountInput(page)).not.toHaveValue(/\./);

    await enterSalary(page, '7', 'Annual');
    await modeRadio(page, 'Monthly').check();
    await expect(amountInput(page)).not.toHaveValue(/\./);
    await modeRadio(page, 'Annual').check();
    await expect(amountInput(page)).not.toHaveValue(/\./);
  });
});
