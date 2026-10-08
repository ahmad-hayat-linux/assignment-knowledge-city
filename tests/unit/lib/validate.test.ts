import { describe, expect, it } from 'vitest';
import { ERROR_MESSAGES } from '@/constants';
import {
  parseSalaryInput,
  sanitizeAmountInput,
  toYearlyIncome,
  validateSalary,
} from '@/lib/validate';

const NOT_NUMBER_INPUTS = [
  'abc',
  '12abc',
  '1.2.3',
  '100000.50',
  '1.5',
  'NaN',
  'Infinity',
  '1e5',
  ',,,',
  '1,,',
  '-',
  '.',
  '1,',
  ',1',
];

describe('S-6 [P0] (B-3): invalid input', () => {
  it.each(['', ' ', '   ', '\t'])('S-6 [P0] (B-3): blank input %j is EMPTY', (raw) => {
    expect(parseSalaryInput(raw)).toEqual({ ok: false, error: 'EMPTY' });
    expect(validateSalary(raw, 'monthly')).toEqual({ ok: false, error: 'EMPTY' });
  });

  it.each(NOT_NUMBER_INPUTS)('S-6 [P0] (B-3): %j is NOT_A_NUMBER', (raw) => {
    expect(parseSalaryInput(raw)).toEqual({ ok: false, error: 'NOT_A_NUMBER' });
    expect(validateSalary(raw, 'annual')).toEqual({ ok: false, error: 'NOT_A_NUMBER' });
  });

  it.each(['-5', '-1,000'])('S-6 [P0] (B-3): %j is NEGATIVE', (raw) => {
    expect(parseSalaryInput(raw)).toEqual({ ok: false, error: 'NEGATIVE' });
    expect(validateSalary(raw, 'monthly')).toEqual({ ok: false, error: 'NEGATIVE' });
  });

  it('S-6 [P0] (B-3): "0" is valid with yearly income 0', () => {
    expect(parseSalaryInput('0')).toEqual({ ok: true, value: 0 });
    expect(validateSalary('0', 'monthly')).toEqual({ ok: true, yearlyIncome: 0 });
  });

  it('S-6 [P0] (B-3): "-0" is never returned as negative zero', () => {
    const parsed = parseSalaryInput('-0');
    expect(parsed.ok).toBe(true);
    expect(parsed).toHaveProperty('value');
    expect(Object.is((parsed as { value: number }).value, 0)).toBe(true);
  });

  it('S-6 [P0] (B-3): annual 10,000,000,000 is accepted', () => {
    expect(validateSalary('10000000000', 'annual')).toEqual({
      ok: true,
      yearlyIncome: 10_000_000_000,
    });
  });

  it('S-6 [P0] (B-3): annual just above 10,000,000,000 is TOO_LARGE', () => {
    expect(validateSalary('10000000001', 'annual')).toEqual({ ok: false, error: 'TOO_LARGE' });
    expect(validateSalary('10,000,000,001', 'annual')).toEqual({
      ok: false,
      error: 'TOO_LARGE',
    });
  });

  it('S-6 [P0] (B-3): monthly 833,333,334 is TOO_LARGE because x12 is above the maximum', () => {
    expect(validateSalary('833,333,334', 'monthly')).toEqual({ ok: false, error: 'TOO_LARGE' });
  });

  it('S-6 [P0] (B-3): monthly 833,333,333 is accepted', () => {
    expect(validateSalary('833333333', 'monthly')).toEqual({
      ok: true,
      yearlyIncome: 9_999_999_996,
    });
  });

  it('S-6 [P0] (B-3): a 400-digit string is TOO_LARGE and does not crash', () => {
    const huge = '9'.repeat(400);
    expect(validateSalary(huge, 'annual')).toEqual({ ok: false, error: 'TOO_LARGE' });
    expect(validateSalary(huge, 'monthly')).toEqual({ ok: false, error: 'TOO_LARGE' });
  });

  it('S-6 [P0] (B-3): error messages equal the exact text in the stories', () => {
    expect(ERROR_MESSAGES.EMPTY).toBe('Enter your salary');
    expect(ERROR_MESSAGES.NOT_A_NUMBER).toBe('Salary must be a number');
    expect(ERROR_MESSAGES.NEGATIVE).toBe('Salary cannot be negative');
    expect(ERROR_MESSAGES.TOO_LARGE).toBe(
      'Salary is too large. The maximum is PKR 10,000,000,000 per year.',
    );
  });

  it('S-6 [P0] (B-3): after an error, a valid value validates again (no state kept)', () => {
    expect(validateSalary('abc', 'monthly').ok).toBe(false);
    expect(validateSalary('100000', 'monthly')).toEqual({ ok: true, yearlyIncome: 1_200_000 });
  });
});

describe('S-2 [P0] (B-3): monthly or annual input', () => {
  it('S-2 [P0] (B-3): monthly 100,000 is 1,200,000 per year', () => {
    expect(toYearlyIncome(100_000, 'monthly')).toBe(1_200_000);
    expect(validateSalary('100,000', 'monthly')).toEqual({ ok: true, yearlyIncome: 1_200_000 });
  });

  it('S-2 [P0] (B-3): annual 1,200,000 is 1,200,000 per year', () => {
    expect(toYearlyIncome(1_200_000, 'annual')).toBe(1_200_000);
    expect(validateSalary('1,200,000', 'annual')).toEqual({ ok: true, yearlyIncome: 1_200_000 });
  });
});

describe('S-1 [P0]: tiny amounts', () => {
  it('S-1 [P0] (B-3): 1 is accepted as a valid amount with no error', () => {
    expect(parseSalaryInput('1')).toEqual({ ok: true, value: 1 });
    expect(validateSalary('1', 'annual')).toEqual({ ok: true, yearlyIncome: 1 });
  });

  it('S-11 [P1] (B-3): "0.01" is not a valid whole-rupee amount', () => {
    expect(parseSalaryInput('0.01')).toEqual({ ok: false, error: 'NOT_A_NUMBER' });
  });
});

describe('S-11 [P1] (B-3): pasted numbers', () => {
  it('S-11 [P1] (B-3): "1,000,000" is accepted as 1000000', () => {
    expect(parseSalaryInput('1,000,000')).toEqual({ ok: true, value: 1_000_000 });
  });

  it('S-11 [P1]: " 500000 " is accepted as 500000', () => {
    expect(parseSalaryInput(' 500000 ')).toEqual({ ok: true, value: 500_000 });
  });

  it('S-11 [P1] (B-3): "1,00,000" is accepted as 100000', () => {
    expect(parseSalaryInput('1,00,000')).toEqual({ ok: true, value: 100_000 });
  });
});

describe('S-11 [P1] (B-3): sanitizeAmountInput drops the decimal point and everything after it', () => {
  it.each([
    ['100000.50', '100000'],
    ['1.2.3', '1'],
    ['.', ''],
    ['12', '12'],
    ['1,000,000', '1,000,000'],
    ['', ''],
    ['abc', 'abc'],
    ['5.', '5'],
  ])('S-11 [P1]: %j becomes %j', (raw, expected) => {
    expect(sanitizeAmountInput(raw)).toBe(expected);
  });
});
