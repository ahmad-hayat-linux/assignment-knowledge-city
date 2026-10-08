import { expect, test } from '@playwright/test';
import {
  amountInput,
  enterSalary,
  errorAlert,
  expectCards,
  expectNoError,
  expectNoResults,
  openApp,
} from './helpers';

const NOT_A_NUMBER = 'Salary must be a number';
const TOO_LARGE = 'Salary is too large. The maximum is PKR 10,000,000,000 per year.';

test.describe('S-6 [P0] (B-3): invalid input and recovery', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page);
  });

  test('S-6 [P0] (B-3): the untouched form shows no error and no results', async ({ page }) => {
    await expectNoError(page);
    await expectNoResults(page);
  });

  test('S-6 [P0] (B-3): blank input shows "Enter your salary"', async ({ page }) => {
    await enterSalary(page, '5');
    await enterSalary(page, '');
    await expect(errorAlert(page)).toHaveText('Enter your salary');
    await expectNoResults(page);
  });

  test('S-6 [P0] (B-3): only spaces shows "Enter your salary"', async ({ page }) => {
    await enterSalary(page, '    ');
    await expect(errorAlert(page)).toHaveText('Enter your salary');
    await expectNoResults(page);
  });

  for (const text of ['abc', '12abc', 'NaN', 'Infinity', '1e5']) {
    test(`S-6 [P0] (B-3): "${text}" shows "${NOT_A_NUMBER}"`, async ({ page }) => {
      await enterSalary(page, text);
      await expect(errorAlert(page)).toHaveText(NOT_A_NUMBER);
      await expectNoResults(page);
    });
  }

  test('S-6 [P0] (B-3): "-5" shows "Salary cannot be negative"', async ({ page }) => {
    await enterSalary(page, '-5');
    await expect(errorAlert(page)).toHaveText('Salary cannot be negative');
    await expectNoResults(page);
  });

  test('S-6 [P0] (B-3): Annual 10,000,000,001 shows the too-large message', async ({ page }) => {
    await enterSalary(page, '10000000001', 'Annual');
    await expect(errorAlert(page)).toHaveText(TOO_LARGE);
    await expectNoResults(page);
  });

  test('S-6 [P0] (B-3): Monthly 1,000,000,000 (12 billion a year) shows the too-large message', async ({
    page,
  }) => {
    await enterSalary(page, '1000000000', 'Monthly');
    await expect(errorAlert(page)).toHaveText(TOO_LARGE);
    await expectNoResults(page);
  });

  test('S-6 [P0] (B-3): Monthly 833,333,334 (just over the yearly maximum) shows the too-large message', async ({
    page,
  }) => {
    await enterSalary(page, '833333334', 'Monthly');
    await expect(errorAlert(page)).toHaveText(TOO_LARGE);
    await expectNoResults(page);
  });

  test('S-6 [P0] (B-3): "0" shows results with tax 0 and no error', async ({ page }) => {
    await enterSalary(page, '0');
    await expectNoError(page);
    await expectCards(page, {
      yearlyIncome: 'PKR 0',
      yearlyTax: 'PKR 0',
      yearlyNet: 'PKR 0',
      monthlyTax: 'PKR 0',
      monthlyNet: 'PKR 0',
    });
  });

  test('S-6 [P0] (B-3): fixing a blank field with a valid amount clears the error and shows results', async ({
    page,
  }) => {
    await enterSalary(page, '   ');
    await expect(errorAlert(page)).toHaveText('Enter your salary');
    await enterSalary(page, '100000');
    await expectNoError(page);
    await expectCards(page, {
      yearlyIncome: 'PKR 1,200,000',
      yearlyTax: 'PKR 6,000',
      yearlyNet: 'PKR 1,194,000',
      monthlyTax: 'PKR 500',
      monthlyNet: 'PKR 99,500',
    });
  });

  test('S-6 [P0] (B-3): fixing "abc" with a valid amount clears the error and shows results', async ({
    page,
  }) => {
    await enterSalary(page, 'abc');
    await expect(errorAlert(page)).toHaveText(NOT_A_NUMBER);
    await enterSalary(page, '100000');
    await expectNoError(page);
    await expect(page.getByRole('heading', { name: 'Your results' })).toBeVisible();
  });

  test('S-6 [P0] (B-3): fixing a negative amount with a valid amount clears the error', async ({
    page,
  }) => {
    await enterSalary(page, '-5');
    await expect(errorAlert(page)).toHaveText('Salary cannot be negative');
    await enterSalary(page, '5');
    await expectNoError(page);
    await expect(page.getByRole('heading', { name: 'Your results' })).toBeVisible();
  });

  test('S-6 [P0] (B-3): fixing a too-large amount with a valid amount clears the error', async ({
    page,
  }) => {
    await enterSalary(page, '10000000001', 'Annual');
    await expect(errorAlert(page)).toHaveText(TOO_LARGE);
    await enterSalary(page, '1200000');
    await expectNoError(page);
    await expect(page.getByRole('heading', { name: 'Your results' })).toBeVisible();
  });

  test('S-6 [P0] (B-3): results disappear when a valid amount becomes invalid text', async ({
    page,
  }) => {
    await enterSalary(page, '100000');
    await expect(page.getByRole('heading', { name: 'Your results' })).toBeVisible();
    await enterSalary(page, '100000x');
    await expect(errorAlert(page)).toHaveText(NOT_A_NUMBER);
    await expectNoResults(page);
  });

  test('S-6 [P0] (B-3): results disappear when a valid amount is emptied', async ({ page }) => {
    await enterSalary(page, '100000');
    await expect(page.getByRole('heading', { name: 'Your results' })).toBeVisible();
    await amountInput(page).clear();
    await expect(errorAlert(page)).toHaveText('Enter your salary');
    await expectNoResults(page);
  });

  test('S-6 [P0] (B-3): results disappear when a valid amount becomes negative or too large', async ({
    page,
  }) => {
    await enterSalary(page, '100000');
    await enterSalary(page, '-1');
    await expect(errorAlert(page)).toHaveText('Salary cannot be negative');
    await expectNoResults(page);
    await enterSalary(page, '100000');
    await expect(page.getByRole('heading', { name: 'Your results' })).toBeVisible();
    await enterSalary(page, '99999999999');
    await expect(errorAlert(page)).toHaveText(TOO_LARGE);
    await expectNoResults(page);
  });

  test('S-6 [P0]: an error is announced with role alert and the field is marked invalid', async ({
    page,
  }) => {
    await enterSalary(page, 'abc');
    const alert = errorAlert(page);
    await expect(alert).toHaveCount(1);
    await expect(alert).toHaveText(NOT_A_NUMBER);
    await expect(amountInput(page)).toHaveAttribute('aria-invalid', 'true');
    await expect(amountInput(page)).toHaveAccessibleDescription(NOT_A_NUMBER);
  });

  test('S-6 [P0]: aria-invalid goes back to false when the error is fixed', async ({ page }) => {
    await enterSalary(page, 'abc');
    await expect(amountInput(page)).toHaveAttribute('aria-invalid', 'true');
    await enterSalary(page, '100');
    await expect(amountInput(page)).toHaveAttribute('aria-invalid', 'false');
    await expect(amountInput(page)).not.toHaveAttribute('aria-describedby', /.+/);
  });

  test('S-6 [P0]: the amount field has a visible label', async ({ page }) => {
    await expect(page.getByText('Salary amount', { exact: true })).toBeVisible();
    await expect(amountInput(page)).toBeVisible();
  });
});
