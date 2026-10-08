import { expect, type Locator, type Page } from '@playwright/test';

export type Mode = 'Monthly' | 'Annual';

export interface ExpectedCards {
  monthlyTax: string;
  monthlyNet: string;
  yearlyIncome: string;
  yearlyTax: string;
  yearlyNet: string;
}

export const amountInput = (page: Page): Locator => page.getByLabel('Salary amount');

export const modeRadio = (page: Page, mode: Mode): Locator =>
  page.getByRole('radio', { name: mode });

export const resetButton = (page: Page): Locator => page.getByRole('button', { name: 'Reset' });

export const errorAlert = (page: Page): Locator => page.getByRole('alert');

export const resultsHeading = (page: Page): Locator =>
  page.getByRole('heading', { name: 'Your results' });

export const breakdownSection = (page: Page): Locator =>
  page.getByRole('region', { name: 'How your tax is worked out' });

export const slabTableSection = (page: Page): Locator =>
  page.getByRole('region', { name: 'Tax slabs for salaried individuals' });

export const DISCLAIMER =
  'Estimate only. This is not tax advice. Confirm your tax with FBR or a tax professional.';

export const openApp = async (page: Page): Promise<void> => {
  await page.goto('/');
  await expect(amountInput(page)).toBeVisible();
};

/** Picks the mode (when given) and then types the amount into the field. */
export const enterSalary = async (page: Page, amount: string, mode?: Mode): Promise<void> => {
  if (mode !== undefined) {
    await modeRadio(page, mode).check();
  }
  await amountInput(page).fill(amount);
};

export const cardValue = (page: Page, label: string): Locator =>
  page
    .getByRole('article')
    .filter({ has: page.getByText(label, { exact: true }) })
    .locator('p')
    .nth(1);

export const expectCards = async (page: Page, expected: ExpectedCards): Promise<void> => {
  await expect(cardValue(page, 'Monthly tax')).toHaveText(expected.monthlyTax);
  await expect(cardValue(page, 'Monthly net pay')).toHaveText(expected.monthlyNet);
  await expect(cardValue(page, 'Yearly income')).toHaveText(expected.yearlyIncome);
  await expect(cardValue(page, 'Yearly tax')).toHaveText(expected.yearlyTax);
  await expect(cardValue(page, 'Yearly net pay')).toHaveText(expected.yearlyNet);
};

export const rateValue = (page: Page, label: string): Locator =>
  page.getByText(label, { exact: true }).locator('xpath=following-sibling::dd');

export const expectNoResults = async (page: Page): Promise<void> => {
  await expect(resultsHeading(page)).toHaveCount(0);
  await expect(page.getByRole('article')).toHaveCount(0);
  await expect(breakdownSection(page)).toHaveCount(0);
  await expect(page.getByText(DISCLAIMER)).toHaveCount(0);
};

export const expectNoError = async (page: Page): Promise<void> => {
  await expect(errorAlert(page)).toHaveCount(0);
  await expect(amountInput(page)).toHaveAttribute('aria-invalid', 'false');
};
