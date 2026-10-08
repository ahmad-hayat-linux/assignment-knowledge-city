import { MONTHS_PER_YEAR } from '@/constants';
import { TAX_SLABS } from '@/data/slabs';
import type { Slab, SlabBreakdownRow, SlabTableRow, TaxResult } from '@/types';

const PERCENT = 100;

const amountInSlab = (income: number, slab: Slab): number => {
  const cappedIncome = slab.upperBound === null ? income : Math.min(income, slab.upperBound);
  return Math.max(0, cappedIncome - slab.lowerBound);
};

const buildBreakdown = (income: number, slabs: readonly Slab[]): SlabBreakdownRow[] =>
  slabs
    .map((slab) => {
      const amount = amountInSlab(income, slab);
      return { slab, amountInSlab: amount, tax: (amount * slab.ratePercent) / PERCENT };
    })
    .filter((row) => row.amountInSlab > 0);

/** The rate on the next rupee: an income exactly on a boundary belongs to the slab above it. */
const findMarginalRatePercent = (income: number, slabs: readonly Slab[]): number => {
  const slab = slabs.find(
    (candidate) =>
      income >= candidate.lowerBound &&
      (candidate.upperBound === null || income < candidate.upperBound),
  );
  return slab?.ratePercent ?? 0;
};

const roundToRupee = (amount: number): number => Math.round(amount);

/** Calculates tax for a yearly income. The yearly tax is rounded to the nearest whole rupee. */
export const calculateTax = (
  yearlyIncome: number,
  slabs: readonly Slab[] = TAX_SLABS,
): TaxResult => {
  const breakdown = buildBreakdown(yearlyIncome, slabs);
  // Summed in whole hundredths of a rupee (income x rate) so an exact .5 rounds up without
  // floating-point drift; dividing by 100 once at the end keeps exact halves exact.
  const taxInHundredths = breakdown.reduce(
    (total, row) => total + row.amountInSlab * row.slab.ratePercent,
    0,
  );
  const yearlyTax = roundToRupee(taxInHundredths / PERCENT);
  const yearlyNet = yearlyIncome - yearlyTax;

  return {
    yearlyIncome,
    yearlyTax,
    yearlyNet,
    monthlyTax: roundToRupee(yearlyTax / MONTHS_PER_YEAR),
    monthlyNet: roundToRupee(yearlyNet / MONTHS_PER_YEAR),
    effectiveRatePercent: yearlyIncome === 0 ? 0 : (yearlyTax / yearlyIncome) * PERCENT,
    marginalRatePercent: findMarginalRatePercent(yearlyIncome, slabs),
    breakdown,
  };
};

/** Rows for the slab reference table: each slab with the tax already due on the slabs below it. */
export const buildSlabTableRows = (slabs: readonly Slab[] = TAX_SLABS): SlabTableRow[] => {
  let fixedAmount = 0;

  return slabs.map((slab) => {
    const row = { slab, fixedAmount };
    if (slab.upperBound !== null) {
      fixedAmount += ((slab.upperBound - slab.lowerBound) * slab.ratePercent) / PERCENT;
    }
    return row;
  });
};
