import { expect, test } from '@playwright/test';
import {
  amountInput,
  breakdownSection,
  enterSalary,
  expectNoError,
  expectNoResults,
  modeRadio,
  openApp,
  resetButton,
  resultsHeading,
  slabTableSection,
} from './helpers';

test.describe('S-9 [P2]: reset', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page);
  });

  test('S-9 [P2]: with results showing, Reset empties the field and removes results', async ({
    page,
  }) => {
    await enterSalary(page, '2000000', 'Annual');
    await expect(resultsHeading(page)).toBeVisible();
    await expect(breakdownSection(page)).toBeVisible();

    await resetButton(page).click();

    await expect(amountInput(page)).toHaveValue('');
    await expectNoResults(page);
    await expectNoError(page);
    await expect(modeRadio(page, 'Monthly')).toBeChecked();
    await expect(modeRadio(page, 'Annual')).not.toBeChecked();
  });

  test('S-9 [P2]: with an error showing, Reset empties the field and removes the error', async ({
    page,
  }) => {
    await enterSalary(page, 'abc');
    await expect(page.getByRole('alert')).toBeVisible();

    await resetButton(page).click();

    await expect(amountInput(page)).toHaveValue('');
    await expectNoError(page);
    await expectNoResults(page);
  });

  test('S-9 [P2]: with an error in Annual mode, Reset also returns to Monthly', async ({
    page,
  }) => {
    await enterSalary(page, '10000000001', 'Annual');
    await expect(page.getByRole('alert')).toBeVisible();

    await resetButton(page).click();

    await expect(amountInput(page)).toHaveValue('');
    await expectNoError(page);
    await expect(modeRadio(page, 'Monthly')).toBeChecked();
  });

  test('S-9 [P2]: Reset on an empty form breaks nothing and shows no error', async ({ page }) => {
    await resetButton(page).click();
    await expect(amountInput(page)).toHaveValue('');
    await expectNoError(page);
    await expectNoResults(page);
    await expect(modeRadio(page, 'Monthly')).toBeChecked();
    await expect(slabTableSection(page)).toBeVisible();
  });

  test('S-9 [P2]: Reset twice in a row is safe', async ({ page }) => {
    await enterSalary(page, '100000');
    await resetButton(page).click();
    await resetButton(page).click();
    await expect(amountInput(page)).toHaveValue('');
    await expectNoError(page);
    await expectNoResults(page);
  });

  test('S-9 [P2]: a new calculation works after Reset', async ({ page }) => {
    await enterSalary(page, '100000');
    await resetButton(page).click();
    await enterSalary(page, '1000000', 'Annual');
    await expect(resultsHeading(page)).toBeVisible();
    await expect(page.getByText('PKR 996,000', { exact: true })).toBeVisible();
  });

  test('S-9 [P2]: Reset is a keyboard-operable button', async ({ page }) => {
    await enterSalary(page, '100000');
    await resetButton(page).focus();
    await page.keyboard.press('Enter');
    await expect(amountInput(page)).toHaveValue('');
    await expectNoResults(page);
  });
});
