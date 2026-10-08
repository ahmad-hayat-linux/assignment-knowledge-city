import { describe, expect, it } from 'vitest';
import { switchInputMode } from '@/lib/mode';

describe('S-2 [P0] (B-4): switchInputMode', () => {
  it('S-2 [P0] (B-4): Monthly 100,000 to Annual gives 1,200,000 and keeps the exact yearly income', () => {
    expect(switchInputMode('100,000', 'monthly', 'annual', null)).toEqual({
      amount: '1,200,000',
      exactYearlyIncome: 1_200_000,
    });
    expect(switchInputMode('100000', 'monthly', 'annual', null).amount).toBe('1,200,000');
  });

  it('S-2 [P0] (B-4): Annual 1,200,000 to Monthly gives 100,000', () => {
    expect(switchInputMode('1,200,000', 'annual', 'monthly', null)).toEqual({
      amount: '100,000',
      exactYearlyIncome: 1_200_000,
    });
  });

  it('S-2 [P0] (B-4): Annual 100,000 to Monthly shows 8,333 and keeps 100,000 as the exact income', () => {
    expect(switchInputMode('100,000', 'annual', 'monthly', null)).toEqual({
      amount: '8,333',
      exactYearlyIncome: 100_000,
    });
  });

  it('S-2 [P0] (B-4): switching back with the exact value gives 100,000 exactly', () => {
    const toMonthly = switchInputMode('100,000', 'annual', 'monthly', null);
    const back = switchInputMode(
      toMonthly.amount,
      'monthly',
      'annual',
      toMonthly.exactYearlyIncome,
    );
    expect(back.amount).toBe('100,000');
    expect(back.exactYearlyIncome).toBe(100_000);
  });

  it('S-2 [P0] (B-4): an empty field is returned unchanged', () => {
    expect(switchInputMode('', 'monthly', 'annual', null)).toEqual({
      amount: '',
      exactYearlyIncome: null,
    });
    expect(switchInputMode('   ', 'annual', 'monthly', null).amount).toBe('   ');
  });

  it.each(['abc', '1.2.3', '-5', '1e5', ',,,'])(
    'S-2 [P0] (B-4): invalid text %j is returned unchanged',
    (raw) => {
      expect(switchInputMode(raw, 'monthly', 'annual', null)).toEqual({
        amount: raw,
        exactYearlyIncome: null,
      });
      expect(switchInputMode(raw, 'annual', 'monthly', 100_000)).toEqual({
        amount: raw,
        exactYearlyIncome: 100_000,
      });
    },
  );

  it('S-2 [P0] (B-4): the same mode returns the input unchanged', () => {
    expect(switchInputMode('100,000', 'monthly', 'monthly', null)).toEqual({
      amount: '100,000',
      exactYearlyIncome: null,
    });
    expect(switchInputMode('8,333', 'monthly', 'monthly', 100_000)).toEqual({
      amount: '8,333',
      exactYearlyIncome: 100_000,
    });
  });

  it('S-2 [P0] (B-4): the returned amount never contains a decimal point', () => {
    for (const amount of ['100000', '1', '7', '999,999', '1,234,567', '10,000,000,000']) {
      expect(switchInputMode(amount, 'annual', 'monthly', null).amount).not.toContain('.');
      expect(switchInputMode(amount, 'monthly', 'annual', null).amount).not.toContain('.');
    }
  });

  it('S-2 [P0] (B-4): an exact half rounds up in the monthly field', () => {
    // 100,006 / 12 = 8,333.83 rounds to 8,334; 1,000,002 / 12 = 83,333.5 rounds up to 83,334.
    expect(switchInputMode('100,006', 'annual', 'monthly', null).amount).toBe('8,334');
    expect(switchInputMode('1,000,002', 'annual', 'monthly', null).amount).toBe('83,334');
  });
});
