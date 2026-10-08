import { describe, expect, it } from 'vitest';
import { formatNumber, formatPercent, formatPkr, formatSlabRange } from '@/lib/format';
import { calculateTax } from '@/lib/tax';

describe('S-11 [P1] (B-5): PKR formatting', () => {
  it('S-11 [P1] (B-5): formatPkr shows the PKR label and thousands separators', () => {
    expect(formatPkr(1_194_000)).toBe('PKR 1,194,000');
  });

  it('S-11 [P1] (B-5): zero is shown as PKR 0', () => {
    expect(formatPkr(0)).toBe('PKR 0');
  });

  it('S-11 [P1] (B-5): 3,498,974,000 is shown in full digits, not scientific notation', () => {
    expect(formatNumber(3_498_974_000)).toBe('3,498,974,000');
    expect(formatPkr(3_498_974_000)).toBe('PKR 3,498,974,000');
    expect(formatPkr(10_000_000_000)).toBe('PKR 10,000,000,000');
    expect(formatPkr(3_498_974_000)).not.toMatch(/e/i);
  });

  it.each([
    [0.01, '0'],
    [0.4, '0'],
    [88_000.4, '88,000'],
    [2.5, '3'],
    [1.5, '2'],
    [0.5, '1'],
    [3_498_974_000.7, '3,498,974,001'],
    [999.5, '1,000'],
  ])('S-11 [P1] (B-5): %d is shown as the whole number %s', (amount, text) => {
    expect(formatNumber(amount)).toBe(text);
    expect(formatPkr(amount)).toBe(`PKR ${text}`);
  });

  it('S-11 [P1] (B-5): amounts below 1,000 have no separator', () => {
    expect(formatPkr(500)).toBe('PKR 500');
  });
});

describe('S-4 [P1] (B-5): effective rate formatting', () => {
  it('S-4 [P1] (B-5): formatPercent(16.04, 2) is "16.04%"', () => {
    expect(formatPercent(16.04, 2)).toBe('16.04%');
  });

  it('S-4 [P1] (B-5): zero shows "0.00%"', () => {
    expect(formatPercent(0, 2)).toBe('0.00%');
  });

  it('S-4 [P1] (B-5): 4.7 shows "4.70%"', () => {
    expect(formatPercent(4.7, 2)).toBe('4.70%');
  });
});

describe('S-5 [P2] (B-5): marginal rate formatting', () => {
  it('S-5 [P2] (B-5): 11 with 0 digits shows "11%"', () => {
    expect(formatPercent(11, 0)).toBe('11%');
  });

  it('S-5 [P2] (B-5): 0 with 0 digits shows "0%"', () => {
    expect(formatPercent(0, 0)).toBe('0%');
  });
});

describe('S-8 [P2]: slab range text', () => {
  it('S-8 [P2]: the first slab reads "PKR 0 to 600,000"', () => {
    expect(formatSlabRange({ lowerBound: 0, upperBound: 600_000, ratePercent: 0 })).toBe(
      'PKR 0 to 600,000',
    );
  });

  it('S-8 [P2]: a middle slab reads "PKR 600,001 to 1,200,000"', () => {
    expect(formatSlabRange({ lowerBound: 600_000, upperBound: 1_200_000, ratePercent: 1 })).toBe(
      'PKR 600,001 to 1,200,000',
    );
  });

  it('S-8 [P2]: the top slab reads "Above PKR 7,000,000"', () => {
    expect(formatSlabRange({ lowerBound: 7_000_000, upperBound: null, ratePercent: 35 })).toBe(
      'Above PKR 7,000,000',
    );
  });
});

describe('S-11 [P1] (B-5): standard grouping and rates at the maximum', () => {
  it('S-11 [P1] (B-5): amounts use standard grouping, not lakh grouping', () => {
    expect(formatNumber(12_345_678)).toBe('12,345,678');
    expect(formatPkr(1_194_000)).toBe('PKR 1,194,000');
    expect(formatPkr(100_000)).toBe('PKR 100,000');
  });

  it('S-4 [P1] (B-5): the effective rate at the maximum income shows two decimals', () => {
    // 3,498,974,000 / 10,000,000,000 = 34.98974%.
    expect(formatPercent(calculateTax(10_000_000_000).effectiveRatePercent, 2)).toBe('34.99%');
  });

  it('S-5 [P2] (B-5): the marginal rate at the maximum income shows no decimals', () => {
    expect(formatPercent(calculateTax(10_000_000_000).marginalRatePercent, 0)).toBe('35%');
  });
});
