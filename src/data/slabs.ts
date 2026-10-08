import type { Slab } from '@/types';

/**
 * Income tax slabs for salaried individuals, Pakistan, tax year 2027 (fiscal year 2026-27,
 * 1 July 2026 to 30 June 2027), as set by the Finance Act 2026. The 9% surcharge on high
 * earners was withdrawn for this year, so there is none.
 *
 * Sources, date checked 2026-10-08. All four agree on every slab:
 * - https://vialtopartners.com/regional-alerts/pakistan-employment-tax-finance-bill-2026-27-summary
 * - https://cssprep.com.pk/income-tax-slabs-2026-27-pakistan-salaried-class/
 * - https://www.ict.edu.pk/blogs/income-tax-slabs-salaried-individuals-pakistan
 * - https://taxcalc.pk/resources/tax-card-2026-27
 * Not yet compared against the official Finance Act or FBR text.
 *
 * To support another tax year, change only this file (and the label in constants.ts).
 */
export const TAX_SLABS: readonly Slab[] = [
  { lowerBound: 0, upperBound: 600_000, ratePercent: 0 },
  { lowerBound: 600_000, upperBound: 1_200_000, ratePercent: 1 },
  { lowerBound: 1_200_000, upperBound: 2_200_000, ratePercent: 11 },
  { lowerBound: 2_200_000, upperBound: 3_200_000, ratePercent: 20 },
  { lowerBound: 3_200_000, upperBound: 4_100_000, ratePercent: 25 },
  { lowerBound: 4_100_000, upperBound: 5_600_000, ratePercent: 29 },
  { lowerBound: 5_600_000, upperBound: 7_000_000, ratePercent: 32 },
  { lowerBound: 7_000_000, upperBound: null, ratePercent: 35 },
];
