import { CURRENCY_LABEL } from '@/constants';
import type { Slab } from '@/types';

const WHOLE_RUPEE_FRACTION_DIGITS = 0;

/** Thousands separators, rounded to a whole number: the app never shows a decimal point. */
export const formatNumber = (amount: number): string =>
  amount.toLocaleString('en-US', { maximumFractionDigits: WHOLE_RUPEE_FRACTION_DIGITS });

export const formatPkr = (amount: number): string => `${CURRENCY_LABEL} ${formatNumber(amount)}`;

export const formatPercent = (percent: number, fractionDigits: number): string =>
  `${percent.toFixed(fractionDigits)}%`;

/** Text for a slab's income range, for example "PKR 600,001 to 1,200,000" or "Above PKR 7,000,000". */
export const formatSlabRange = (slab: Slab): string => {
  if (slab.upperBound === null) {
    return `Above ${formatPkr(slab.lowerBound)}`;
  }

  const firstRupee = slab.lowerBound === 0 ? 0 : slab.lowerBound + 1;
  return `${formatPkr(firstRupee)} to ${formatNumber(slab.upperBound)}`;
};
