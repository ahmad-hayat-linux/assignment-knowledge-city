import { expect, test, type Page } from '@playwright/test';
import {
  amountInput,
  cardValue,
  enterSalary,
  errorAlert,
  expectCards,
  expectNoError,
  modeRadio,
  openApp,
  resultsHeading,
} from './helpers';

const NOT_A_NUMBER = 'Salary must be a number';
const CARD_LABELS = [
  'Monthly tax',
  'Monthly net pay',
  'Yearly income',
  'Yearly tax',
  'Yearly net pay',
];

const readPageText = (page: Page): Promise<string> => page.locator('body').innerText();

/** Real clipboard paste: writes the text to the clipboard and presses the paste shortcut. */
const pasteFromClipboard = async (page: Page, text: string): Promise<void> => {
  await page.evaluate((value) => navigator.clipboard.writeText(value), text);
  await amountInput(page).focus();
  await page.keyboard.press('ControlOrMeta+V');
};

test.describe('S-11 [P1] (B-5): PKR formatting and pasted numbers', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page);
  });

  test('S-11 [P1] (B-5): every amount has thousands separators and the PKR label', async ({
    page,
  }) => {
    await enterSalary(page, '100000', 'Monthly');
    await expect(cardValue(page, 'Yearly net pay')).toHaveText('PKR 1,194,000');
    for (const label of CARD_LABELS) {
      await expect(cardValue(page, label)).toHaveText(/^PKR \d{1,3}(,\d{3})*$/);
    }
  });

  test('S-11 [P1] (B-5): a very large result is shown in full digits, never in scientific notation', async ({
    page,
  }) => {
    await enterSalary(page, '10000000000', 'Annual');
    await expect(cardValue(page, 'Yearly tax')).toHaveText('PKR 3,498,974,000');
    for (const label of CARD_LABELS) {
      await expect(cardValue(page, label)).not.toHaveText(/e\+|E\+|e-/);
    }
  });

  test('S-11 [P1] (B-3): pasting "1,000,000" is accepted as 1000000', async ({ page }) => {
    await enterSalary(page, '1,000,000', 'Annual');
    await expectNoError(page);
    await expectCards(page, {
      yearlyIncome: 'PKR 1,000,000',
      yearlyTax: 'PKR 4,000',
      yearlyNet: 'PKR 996,000',
      monthlyTax: 'PKR 333',
      monthlyNet: 'PKR 83,000',
    });
  });

  test('S-11 [P1] (B-3): pasting " 500000 " with spaces is accepted as 500000', async ({
    page,
  }) => {
    await enterSalary(page, ' 500000 ', 'Annual');
    await expectNoError(page);
    await expect(cardValue(page, 'Yearly income')).toHaveText('PKR 500,000');
    await expect(cardValue(page, 'Yearly tax')).toHaveText('PKR 0');
  });

  test('S-11 [P1] (B-3): pasting "1,00,000" (lakh grouping) is accepted as 100000', async ({
    page,
  }) => {
    await enterSalary(page, '1,00,000', 'Annual');
    await expectNoError(page);
    await expect(cardValue(page, 'Yearly income')).toHaveText('PKR 100,000');
  });

  test('S-11 [P1] (B-3): lakh grouping in Monthly mode is read as 100000 a month', async ({
    page,
  }) => {
    await enterSalary(page, '1,00,000', 'Monthly');
    await expectNoError(page);
    await expect(cardValue(page, 'Yearly income')).toHaveText('PKR 1,200,000');
    await expect(cardValue(page, 'Yearly tax')).toHaveText('PKR 6,000');
  });

  for (const text of [',,,', '1,,']) {
    test(`S-11 [P1] (B-3): "${text}" shows "${NOT_A_NUMBER}"`, async ({ page }) => {
      await enterSalary(page, text);
      await expect(errorAlert(page)).toHaveText(NOT_A_NUMBER);
      await expect(resultsHeading(page)).toHaveCount(0);
    });
  }

  test('S-11 [P1] (B-3): typing a decimal point on an empty field enters nothing and shows no error', async ({
    page,
  }) => {
    await amountInput(page).pressSequentially('.');
    await expect(amountInput(page)).toHaveValue('');
    await expectNoError(page);
  });

  test('S-11 [P1] (B-3): typing a decimal point after digits leaves the field unchanged', async ({
    page,
  }) => {
    await amountInput(page).pressSequentially('5');
    await amountInput(page).press('.');
    await expect(amountInput(page)).toHaveValue('5');
    await expectNoError(page);
  });

  test('S-11 [P1] (B-3): a real clipboard paste of "100000.50" gives "100000" and no error', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await modeRadio(page, 'Annual').check();
    await pasteFromClipboard(page, '100000.50');
    await expect(amountInput(page)).toHaveValue('100000');
    await expectNoError(page);
    await expect(cardValue(page, 'Yearly income')).toHaveText('PKR 100,000');
    await expect(cardValue(page, 'Yearly tax')).toHaveText('PKR 0');
  });

  test('S-11 [P1] (B-3): a real clipboard paste of "1.2.3" gives "1"', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await modeRadio(page, 'Annual').check();
    await pasteFromClipboard(page, '1.2.3');
    await expect(amountInput(page)).toHaveValue('1');
    await expectNoError(page);
    await expect(cardValue(page, 'Yearly income')).toHaveText('PKR 1');
  });

  for (const { name, mode, amount } of [
    { name: 'Monthly 8,000,000', mode: 'Monthly', amount: '8000000' },
    { name: 'Annual 8,000,000', mode: 'Annual', amount: '8000000' },
    { name: 'Annual 2,345,678', mode: 'Annual', amount: '2345678' },
  ] as const) {
    test(`S-11 [P1] (B-5): ${name} shows no decimal point in any rupee amount`, async ({
      page,
    }) => {
      await enterSalary(page, amount, mode);
      await expect(resultsHeading(page)).toBeVisible();
      await expect(page.getByRole('table').first()).toBeVisible();
      // Percentages may carry decimals (the effective rate); rupee amounts may not.
      const withoutPercentages = (await readPageText(page)).replace(/\d+(\.\d+)?%/g, '');
      expect(withoutPercentages).not.toMatch(/\d\.\d/);
    });
  }

  test('S-11 [P1] (B-5): amounts use standard grouping, not lakh style', async ({ page }) => {
    // 12,345,678 a year: 1,424,000 + 35% of 5,345,678 = 3,294,987.30, rounded to 3,294,987.
    await enterSalary(page, '12345678', 'Annual');
    await expect(cardValue(page, 'Yearly income')).toHaveText('PKR 12,345,678');
    await expect(cardValue(page, 'Yearly tax')).toHaveText('PKR 3,294,987');
    await expect(cardValue(page, 'Yearly net pay')).toHaveText('PKR 9,050,691');
    expect(await readPageText(page)).not.toContain('1,23,45,678');
  });

  test('S-11 [P1] (B-5): the field keeps what was typed while the user types', async ({ page }) => {
    await enterSalary(page, '1,000,000');
    await expect(amountInput(page)).toHaveValue('1,000,000');
  });
});
