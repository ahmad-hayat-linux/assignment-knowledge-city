import type { InputMode, ValidationErrorKey } from '@/types';

export const MONTHS_PER_YEAR = 12;
export const MAX_YEARLY_INCOME = 10_000_000_000;
export const DEFAULT_INPUT_MODE: InputMode = 'monthly';
export const CURRENCY_LABEL = 'PKR';
export const TAX_YEAR_LABEL = 'Tax year 2026-27';
export const EFFECTIVE_RATE_FRACTION_DIGITS = 2;
export const MARGINAL_RATE_FRACTION_DIGITS = 0;

export const ERROR_MESSAGES: Record<ValidationErrorKey, string> = {
  EMPTY: 'Enter your salary',
  NOT_A_NUMBER: 'Salary must be a number',
  NEGATIVE: 'Salary cannot be negative',
  TOO_LARGE: `Salary is too large. The maximum is ${CURRENCY_LABEL} ${MAX_YEARLY_INCOME.toLocaleString('en-US')} per year.`,
};

export const DISCLAIMER_TEXT =
  'Estimate only. This is not tax advice. Confirm your tax with FBR or a tax professional.';

export const APP_TEXT = {
  title: 'Pakistan Salary Tax Calculator',
  subtitle: 'Estimate your income tax and take-home pay as a salaried individual.',
  form: {
    heading: 'Your salary',
    amountLabel: 'Salary amount',
    amountPlaceholder: 'e.g. 100,000',
    modeLegend: 'Salary period',
    reset: 'Reset',
  },
  modes: {
    monthly: 'Monthly',
    annual: 'Annual',
  },
  results: {
    heading: 'Your results',
    monthlyTax: 'Monthly tax',
    monthlyNet: 'Monthly net pay',
    yearlyIncome: 'Yearly income',
    yearlyTax: 'Yearly tax',
    yearlyNet: 'Yearly net pay',
    effectiveRate: 'Effective tax rate',
    marginalRate: 'Tax rate on your next rupee',
  },
  breakdown: {
    heading: 'How your tax is worked out',
    slab: 'Slab',
    incomeInSlab: 'Income in slab',
    rate: 'Rate',
    tax: 'Tax',
  },
  slabTable: {
    heading: 'Tax slabs for salaried individuals',
    range: 'Annual income',
    fixedTax: 'Tax on income below the slab',
    rate: 'Rate on income in the slab',
  },
  errorBoundary: {
    message: 'Something went wrong. Please reload the page and try again.',
  },
} as const;

export const CONSOLE_MESSAGES = {
  renderError: 'Calculator failed to render:',
} as const;
