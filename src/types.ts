export type InputMode = 'monthly' | 'annual';

/** A tax slab. `ratePercent` is a whole-number percentage (11 means 11%). `upperBound` null means no upper limit. */
export interface Slab {
  lowerBound: number;
  upperBound: number | null;
  ratePercent: number;
}

export interface SlabBreakdownRow {
  slab: Slab;
  amountInSlab: number;
  tax: number;
}

export interface SlabTableRow {
  slab: Slab;
  fixedAmount: number;
}

export interface TaxResult {
  yearlyIncome: number;
  yearlyTax: number;
  yearlyNet: number;
  monthlyTax: number;
  monthlyNet: number;
  effectiveRatePercent: number;
  marginalRatePercent: number;
  breakdown: SlabBreakdownRow[];
}

export type ValidationErrorKey = 'EMPTY' | 'NOT_A_NUMBER' | 'NEGATIVE' | 'TOO_LARGE';

export type ParseResult = { ok: true; value: number } | { ok: false; error: ValidationErrorKey };

export type SalaryValidation =
  { ok: true; yearlyIncome: number } | { ok: false; error: ValidationErrorKey };

export interface IncomeFormProps {
  amount: string;
  mode: InputMode;
  errorKey: ValidationErrorKey | null;
  onAmountChange: (amount: string) => void;
  onModeChange: (mode: InputMode) => void;
  onReset: () => void;
}

export interface ResultCardsProps {
  result: TaxResult;
}

export interface SlabBreakdownProps {
  result: TaxResult;
}

export interface SlabTableProps {
  rows: SlabTableRow[];
}

export interface DisclaimerProps {
  showNotice: boolean;
}

export interface ModeSwitchResult {
  amount: string;
  exactYearlyIncome: number | null;
}

export interface SalaryEvaluation {
  errorKey: ValidationErrorKey | null;
  result: TaxResult | null;
}
