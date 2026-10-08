import { MAX_YEARLY_INCOME, MONTHS_PER_YEAR } from '@/constants';
import type { InputMode, ParseResult, SalaryValidation } from '@/types';

/** Optional minus, then digits with optional commas between digit groups. Whole numbers only. */
const NUMBER_PATTERN = /^-?\d+(,\d+)*$/;
const DECIMAL_POINT = '.';

/** The field never holds a decimal point: it and everything after it are dropped, with no error. */
export const sanitizeAmountInput = (raw: string): string => {
  const decimalIndex = raw.indexOf(DECIMAL_POINT);
  return decimalIndex === -1 ? raw : raw.slice(0, decimalIndex);
};

export const parseSalaryInput = (raw: string): ParseResult => {
  const text = raw.trim();

  if (text === '') {
    return { ok: false, error: 'EMPTY' };
  }

  if (!NUMBER_PATTERN.test(text)) {
    return { ok: false, error: 'NOT_A_NUMBER' };
  }

  const value = Number(text.replaceAll(',', ''));

  if (value < 0) {
    return { ok: false, error: 'NEGATIVE' };
  }

  // `+ 0` turns a parsed "-0" into 0.
  return { ok: true, value: value + 0 };
};

export const toYearlyIncome = (amount: number, mode: InputMode): number =>
  mode === 'monthly' ? amount * MONTHS_PER_YEAR : amount;

export const validateSalary = (raw: string, mode: InputMode): SalaryValidation => {
  const parsed = parseSalaryInput(raw);

  if (!parsed.ok) {
    return parsed;
  }

  const yearlyIncome = toYearlyIncome(parsed.value, mode);

  if (yearlyIncome > MAX_YEARLY_INCOME) {
    return { ok: false, error: 'TOO_LARGE' };
  }

  return { ok: true, yearlyIncome };
};
