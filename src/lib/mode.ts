import { MONTHS_PER_YEAR } from '@/constants';
import { formatNumber } from '@/lib/format';
import { parseSalaryInput, toYearlyIncome } from '@/lib/validate';
import type { InputMode, ModeSwitchResult } from '@/types';

/**
 * Handles the Monthly/Annual switch. The field shows a rounded whole number, but the exact yearly
 * income is kept so the results never change on a switch (for example Annual 100,000 shows 8,333
 * in Monthly mode while the calculation still uses 100,000). Empty or invalid text is left as typed.
 */
export const switchInputMode = (
  amount: string,
  from: InputMode,
  to: InputMode,
  exactYearlyIncome: number | null,
): ModeSwitchResult => {
  const parsed = parseSalaryInput(amount);

  if (!parsed.ok || from === to) {
    return { amount, exactYearlyIncome };
  }

  const yearlyIncome = exactYearlyIncome ?? toYearlyIncome(parsed.value, from);
  const nextAmount = to === 'annual' ? yearlyIncome : Math.round(yearlyIncome / MONTHS_PER_YEAR);

  return { amount: formatNumber(nextAmount), exactYearlyIncome: yearlyIncome };
};
