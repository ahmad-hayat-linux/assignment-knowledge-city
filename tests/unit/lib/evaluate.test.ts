import { describe, expect, it } from 'vitest';
import { evaluateSalary } from '@/lib/evaluate';

describe('S-6 [P0] (B-3): evaluateSalary', () => {
  it('S-6 [P0] (B-3): an untouched empty form shows neither an error nor a result', () => {
    expect(evaluateSalary('', 'monthly', false)).toEqual({ errorKey: null, result: null });
  });

  it('S-6 [P0] (B-3): an empty form shows the EMPTY error once the user has edited', () => {
    expect(evaluateSalary('', 'monthly', true)).toEqual({ errorKey: 'EMPTY', result: null });
  });

  it('S-6 [P0] (B-3): a valid amount gives a result and no error', () => {
    const evaluation = evaluateSalary('100000', 'monthly', true);
    expect(evaluation.errorKey).toBeNull();
    expect(evaluation.result?.yearlyIncome).toBe(1_200_000);
    expect(evaluation.result?.yearlyTax).toBe(6_000);
  });

  it('S-6 [P0] (B-3): a valid amount gives a result whether or not the user has edited', () => {
    expect(evaluateSalary('1000000', 'annual', false).result?.yearlyTax).toBe(4_000);
  });

  it.each([
    ['abc', 'NOT_A_NUMBER'],
    ['-5', 'NEGATIVE'],
    ['10000000001', 'TOO_LARGE'],
  ])('S-6 [P0] (B-3): invalid amount %j gives error %s and no result', (amount, errorKey) => {
    expect(evaluateSalary(amount, 'annual', true)).toEqual({ errorKey, result: null });
  });

  it('S-6 [P0] (B-3): a monthly amount that makes the yearly income too large is rejected', () => {
    expect(evaluateSalary('1000000000', 'monthly', true)).toEqual({
      errorKey: 'TOO_LARGE',
      result: null,
    });
  });

  it('S-6 [P0] (B-3): an invalid amount never gives a result, even before the user has edited', () => {
    expect(evaluateSalary('abc', 'monthly', false).result).toBeNull();
  });

  it('S-2 [P0]: an exact yearly income replaces the field figure for a valid amount', () => {
    const evaluation = evaluateSalary('8,333', 'monthly', true, 100_000);
    expect(evaluation.errorKey).toBeNull();
    expect(evaluation.result?.yearlyIncome).toBe(100_000);
    expect(evaluation.result?.yearlyTax).toBe(0);
  });

  it('S-2 [P0]: without an exact yearly income the field figure is used', () => {
    expect(evaluateSalary('8,333', 'monthly', true, null).result?.yearlyIncome).toBe(99_996);
    expect(evaluateSalary('8,333', 'monthly', true).result?.yearlyIncome).toBe(99_996);
  });

  it('S-2 [P0]: an exact yearly income does not hide an invalid amount', () => {
    expect(evaluateSalary('abc', 'monthly', true, 100_000)).toEqual({
      errorKey: 'NOT_A_NUMBER',
      result: null,
    });
  });
});
