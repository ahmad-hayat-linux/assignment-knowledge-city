import { describe, expect, it } from 'vitest';
import { buildSlabTableRows, calculateTax } from '@/lib/tax';

const MAX_INCOME = 10_000_000_000;

describe('S-1 [P0] (B-2): yearly tax per slab table', () => {
  it.each([
    [0, 0],
    [1, 0],
    [600_000, 0],
    [600_001, 0],
    [600_050, 1],
    [600_149, 1],
    [600_150, 2],
    [1_000_000, 4_000],
    [1_200_000, 6_000],
    [1_200_001, 6_000],
    [2_000_000, 94_000],
    [2_200_000, 116_000],
    [2_200_001, 116_000],
    [3_200_000, 316_000],
    [3_200_001, 316_000],
    [4_100_000, 541_000],
    [4_100_001, 541_000],
    [5_000_000, 802_000],
    [5_600_000, 976_000],
    [5_600_001, 976_000],
    [7_000_000, 1_424_000],
    [7_000_001, 1_424_000],
    [8_000_000, 1_774_000],
    [MAX_INCOME, 3_498_974_000],
  ])('S-1 [P0] (B-2): income %d gives yearly tax %d', (income, tax) => {
    expect(calculateTax(income).yearlyTax).toBe(tax);
  });

  it('S-1 [P0] (B-4): income of 600,000 has net equal to income', () => {
    const result = calculateTax(600_000);
    expect(result.yearlyNet).toBe(600_000);
    expect(result.yearlyIncome).toBe(600_000);
  });

  it('S-1 [P0] (B-4): 1,200,000 yearly gives net 1,194,000, monthly tax 500, monthly net 99,500', () => {
    const result = calculateTax(1_200_000);
    expect(result.yearlyTax).toBe(6_000);
    expect(result.yearlyNet).toBe(1_194_000);
    expect(result.monthlyTax).toBe(500);
    expect(result.monthlyNet).toBe(99_500);
  });

  it('S-1 [P0] (B-4): 1,000,000 yearly gives monthly tax 333 and monthly net 83,000', () => {
    const result = calculateTax(1_000_000);
    expect(result.yearlyNet).toBe(996_000);
    expect(result.monthlyTax).toBe(333);
    expect(result.monthlyNet).toBe(83_000);
  });

  it('S-1 [P0] (B-4): maximum income has the documented net and finite figures', () => {
    const result = calculateTax(MAX_INCOME);
    expect(result.yearlyNet).toBe(MAX_INCOME - 3_498_974_000);
    expect(Number.isFinite(result.monthlyTax)).toBe(true);
    expect(Number.isFinite(result.effectiveRatePercent)).toBe(true);
  });

  it('S-1 [P0] (B-4): income 1 gives tax 0 and no NaN anywhere', () => {
    const result = calculateTax(1);
    expect(result.yearlyTax).toBe(0);
    expect(result.monthlyTax).toBe(0);
    expect(Number.isNaN(result.effectiveRatePercent)).toBe(false);
  });

  it('S-1 [P0] (B-4): income 600,600 gives yearly tax 6, monthly tax 1 and monthly net 50,050', () => {
    // Exact halves round up: 6 / 12 = 0.50 and (600,600 - 6) / 12 = 50,049.50.
    const result = calculateTax(600_600);
    expect(result.yearlyTax).toBe(6);
    expect(result.yearlyNet).toBe(600_594);
    expect(result.monthlyTax).toBe(1);
    expect(result.monthlyNet).toBe(50_050);
  });

  it('S-1 [P0] (B-4): rounding bounds hold over a sample of incomes', () => {
    const incomes = [
      0,
      1,
      599_999,
      600_000,
      600_050,
      600_149,
      600_150,
      600_600,
      700_001,
      1_000_000,
      1_234_567,
      2_345_678,
      3_333_333,
      4_100_001,
      5_555_555,
      6_999_999,
      8_765_432,
      123_456_789,
      MAX_INCOME,
    ];
    for (const income of incomes) {
      const result = calculateTax(income);
      expect(Math.abs(result.monthlyTax - result.yearlyTax / 12)).toBeLessThanOrEqual(0.5);
      expect(Math.abs(result.monthlyNet - result.yearlyNet / 12)).toBeLessThanOrEqual(0.5);
      expect(Math.abs(result.monthlyTax + result.monthlyNet - income / 12)).toBeLessThanOrEqual(1);
      expect(result.yearlyTax).toBeGreaterThanOrEqual(0);
      expect(result.yearlyNet).toBe(income - result.yearlyTax);
      expect(Number.isInteger(result.yearlyTax)).toBe(true);
      expect(Number.isInteger(result.monthlyTax)).toBe(true);
      expect(Number.isInteger(result.monthlyNet)).toBe(true);
    }
  });

  it('S-1 [P0] (B-4): monthly figures are yearly divided by 12 and rounded', () => {
    for (const income of [700_000, 1_500_000, 2_345_678, 4_000_000, 6_500_000, 9_999_999]) {
      const result = calculateTax(income);
      expect(result.monthlyTax).toBe(Math.round(result.yearlyTax / 12));
      expect(result.monthlyNet).toBe(Math.round(result.yearlyNet / 12));
    }
  });

  it('S-1 [P0]: tax never decreases as income grows (sampled)', () => {
    let previous = -1;
    for (let income = 0; income <= 9_000_000; income += 12_345) {
      const { yearlyTax } = calculateTax(income);
      expect(yearlyTax).toBeGreaterThanOrEqual(previous);
      previous = yearlyTax;
    }
  });
});

describe('S-3 [P1] (B-5): slab breakdown', () => {
  it('S-3 [P1] (B-5): 2,000,000 lists three slabs with amounts, rates and taxes', () => {
    const rows = calculateTax(2_000_000).breakdown;
    expect(rows.map((row) => row.amountInSlab)).toEqual([600_000, 600_000, 800_000]);
    expect(rows.map((row) => row.slab.ratePercent)).toEqual([0, 1, 11]);
    expect(rows.map((row) => row.tax)).toEqual([0, 6_000, 88_000]);
  });

  it('S-3 [P1] (B-5): 2,000,000 slab taxes add up to the yearly tax of 94,000', () => {
    const result = calculateTax(2_000_000);
    const total = result.breakdown.reduce((sum, row) => sum + row.tax, 0);
    expect(total).toBe(94_000);
    expect(result.yearlyTax).toBe(94_000);
  });

  it('S-3 [P1] (B-5): 600,000 lists only the 0% slab with 600,000 and tax 0', () => {
    const rows = calculateTax(600_000).breakdown;
    expect(rows).toHaveLength(1);
    expect(rows[0]?.slab.ratePercent).toBe(0);
    expect(rows[0]?.amountInSlab).toBe(600_000);
    expect(rows[0]?.tax).toBe(0);
  });

  it('S-3 [P1] (B-5): 8,000,000 lists all eight slabs and amounts add up to 8,000,000', () => {
    const rows = calculateTax(8_000_000).breakdown;
    expect(rows).toHaveLength(8);
    expect(rows.reduce((sum, row) => sum + row.amountInSlab, 0)).toBe(8_000_000);
  });

  it('S-3 [P1] (B-5): 600,001 shows two slabs (the 1% slab holds 1 rupee)', () => {
    const rows = calculateTax(600_001).breakdown;
    expect(rows).toHaveLength(2);
    expect(rows[1]?.amountInSlab).toBe(1);
  });

  it('S-3 [P1] (B-5): zero income has an empty breakdown', () => {
    expect(calculateTax(0).breakdown).toEqual([]);
  });
});

describe('S-4 [P1] (B-5): effective tax rate', () => {
  it('S-4 [P1] (B-5): 5,000,000 gives 16.04', () => {
    expect(calculateTax(5_000_000).effectiveRatePercent.toFixed(2)).toBe('16.04');
  });

  it('S-4 [P1] (B-5): 2,000,000 gives 4.70', () => {
    expect(calculateTax(2_000_000).effectiveRatePercent.toFixed(2)).toBe('4.70');
  });

  it('S-4 [P1] (B-5): income 0 gives 0 and not NaN', () => {
    const rate = calculateTax(0).effectiveRatePercent;
    expect(rate).toBe(0);
    expect(Number.isNaN(rate)).toBe(false);
  });

  it('S-4 [P1] (B-5): 600,000 gives 0', () => {
    expect(calculateTax(600_000).effectiveRatePercent).toBe(0);
  });
});

describe('S-5 [P2] (B-2): marginal tax rate', () => {
  it.each([
    [0, 0],
    [1, 0],
    [599_999, 0],
    [600_000, 1],
    [1_200_000, 11],
    [2_000_000, 11],
    [2_200_000, 20],
    [3_200_000, 25],
    [4_100_000, 29],
    [5_000_000, 29],
    [5_600_000, 32],
    [7_000_000, 35],
    [7_000_001, 35],
    [MAX_INCOME, 35],
  ])('S-5 [P2] (B-2): income %d gives marginal rate %d', (income, rate) => {
    expect(calculateTax(income).marginalRatePercent).toBe(rate);
  });
});

describe('S-8 [P2] (B-2): slab reference table rows', () => {
  const rows = buildSlabTableRows();

  it('S-8 [P2] (B-2): has all eight slabs', () => {
    expect(rows).toHaveLength(8);
  });

  it('S-8 [P2] (B-2): rates match the document', () => {
    expect(rows.map((row) => row.slab.ratePercent)).toEqual([0, 1, 11, 20, 25, 29, 32, 35]);
  });

  it('S-8 [P2] (B-2): lower bounds match the document', () => {
    expect(rows.map((row) => row.slab.lowerBound)).toEqual([
      0, 600_000, 1_200_000, 2_200_000, 3_200_000, 4_100_000, 5_600_000, 7_000_000,
    ]);
  });

  it('S-8 [P2] (B-2): the last slab has no upper limit and the others end where the next begins', () => {
    expect(rows[7]?.slab.upperBound).toBeNull();
    expect(rows.slice(0, 7).map((row) => row.slab.upperBound)).toEqual([
      600_000, 1_200_000, 2_200_000, 3_200_000, 4_100_000, 5_600_000, 7_000_000,
    ]);
  });

  it('S-8 [P2] (B-2): fixed amounts match the document', () => {
    expect(rows.map((row) => row.fixedAmount)).toEqual([
      0, 0, 6_000, 116_000, 316_000, 541_000, 976_000, 1_424_000,
    ]);
  });
});

describe('S-1 [P0] (B-4): exact halves round up and yearly tax is rounded once', () => {
  it.each([
    // 600,250 is 250 over 600,000: exact tax 2.50 rounds up to 3.
    [600_250, 3],
    // 600,350: exact tax 3.50 rounds up to 4.
    [600_350, 4],
    // 1,200,050: 6,000 + 5.50 = 6,005.50 rounds up to 6,006.
    [1_200_050, 6_006],
    // 7,000,050: 1,424,000 + 17.50 rounds up to 1,424,018.
    [7_000_050, 1_424_018],
    // 7,000,010: 1,424,000 + 3.50 rounds up to 1,424,004.
    [7_000_010, 1_424_004],
  ])('S-1 [P0] (B-4): income %d gives yearly tax %d', (income, tax) => {
    const result = calculateTax(income);
    expect(result.yearlyTax).toBe(tax);
    expect(result.yearlyNet).toBe(income - tax);
  });

  it('S-1 [P0] (B-4): a half in a monthly figure rounds up (2.5 becomes 3)', () => {
    // Yearly tax 30 is 2.50 a month. Income 603,000 has exact tax 30.
    const result = calculateTax(603_000);
    expect(result.yearlyTax).toBe(30);
    expect(result.monthlyTax).toBe(3);
  });

  it('S-1 [P0] (B-4): every rupee from 600,000 to 601,200 stays within the rounding bounds', () => {
    for (let income = 600_000; income <= 601_200; income += 1) {
      const result = calculateTax(income);
      expect(Math.abs(result.monthlyTax - result.yearlyTax / 12)).toBeLessThanOrEqual(0.5);
      expect(Math.abs(result.monthlyNet - result.yearlyNet / 12)).toBeLessThanOrEqual(0.5);
      expect(Math.abs(result.monthlyTax + result.monthlyNet - income / 12)).toBeLessThanOrEqual(1);
    }
  });

  it('S-1 [P0] (B-4): monthly figures times 12 differ from the yearly figures by at most 6', () => {
    for (const income of [1, 600_600, 700_001, 1_234_567, 3_333_333, 5_555_555, 8_765_432]) {
      const result = calculateTax(income);
      expect(Math.abs(result.monthlyTax * 12 - result.yearlyTax)).toBeLessThanOrEqual(6);
      expect(Math.abs(result.monthlyNet * 12 - result.yearlyNet)).toBeLessThanOrEqual(6);
    }
  });
});

describe('S-1 [P0] (B-2): a boundary income belongs to the lower slab', () => {
  // The edges themselves are in the main table; these are a few rupees above each edge,
  // taxed at the rate of the slab above.
  it.each([
    [1_200_010, 6_001],
    [2_200_010, 116_002],
    [3_200_004, 316_001],
    [4_100_010, 541_003],
    [5_600_010, 976_003],
  ])('S-1 [P0] (B-2): income %d gives yearly tax %d', (income, tax) => {
    expect(calculateTax(income).yearlyTax).toBe(tax);
  });

  it.each([
    [600_000, 1],
    [1_200_000, 2],
    [2_200_000, 3],
    [3_200_000, 4],
    [4_100_000, 5],
    [5_600_000, 6],
    [7_000_000, 7],
    [7_000_001, 8],
  ])('S-3 [P1] (B-2): income %d lists %d slabs in the breakdown', (income, slabCount) => {
    expect(calculateTax(income).breakdown).toHaveLength(slabCount);
  });

  it('S-1 [P0] (B-2): there is no surcharge on top of the slab tax at the maximum', () => {
    // 1,424,000 + 35% of (10,000,000,000 - 7,000,000) = 3,498,974,000 exactly.
    const result = calculateTax(MAX_INCOME);
    expect(result.yearlyTax).toBe(3_498_974_000);
    expect(result.effectiveRatePercent).toBeCloseTo(34.98974, 5);
  });
});
