import { calculateTax } from '@/lib/tax';
import { validateSalary } from '@/lib/validate';
import type { InputMode, SalaryEvaluation } from '@/types';

/**
 * Turns the form state into what the screen shows: a result, or an error.
 * An untouched, empty form shows neither; the error only appears once the user has edited the field.
 * `exactYearlyIncome` is set after a Monthly/Annual switch and replaces the field's own yearly figure.
 */
export const evaluateSalary = (
  amount: string,
  mode: InputMode,
  hasEdited: boolean,
  exactYearlyIncome: number | null = null,
): SalaryEvaluation => {
  const validation = validateSalary(amount, mode);

  if (validation.ok) {
    return { errorKey: null, result: calculateTax(exactYearlyIncome ?? validation.yearlyIncome) };
  }

  return { errorKey: hasEdited ? validation.error : null, result: null };
};
