import { useState } from 'react';
import { APP_TEXT, DEFAULT_INPUT_MODE, TAX_YEAR_LABEL } from '@/constants';
import { Disclaimer } from '@/components/Disclaimer';
import { IncomeForm } from '@/components/IncomeForm';
import { ResultCards } from '@/components/ResultCards';
import { SlabBreakdown } from '@/components/SlabBreakdown';
import { SlabTable } from '@/components/SlabTable';
import { evaluateSalary } from '@/lib/evaluate';
import { switchInputMode } from '@/lib/mode';
import { buildSlabTableRows } from '@/lib/tax';
import { sanitizeAmountInput } from '@/lib/validate';
import { styles } from '@/style';
import type { InputMode } from '@/types';

const SLAB_TABLE_ROWS = buildSlabTableRows();

export const App = () => {
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState<InputMode>(DEFAULT_INPUT_MODE);
  const [hasEdited, setHasEdited] = useState(false);
  const [exactYearlyIncome, setExactYearlyIncome] = useState<number | null>(null);

  const { errorKey, result } = evaluateSalary(amount, mode, hasEdited, exactYearlyIncome);

  const handleAmountChange = (nextAmount: string) => {
    const sanitizedAmount = sanitizeAmountInput(nextAmount);

    // A keystroke that sanitizing removes (such as ".") changes nothing, so it is not an edit.
    if (sanitizedAmount === amount) {
      return;
    }

    setAmount(sanitizedAmount);
    setExactYearlyIncome(null);
    setHasEdited(true);
  };

  const handleModeChange = (nextMode: InputMode) => {
    const switched = switchInputMode(amount, mode, nextMode, exactYearlyIncome);
    setAmount(switched.amount);
    setExactYearlyIncome(switched.exactYearlyIncome);
    setMode(nextMode);
    if (amount.trim() === '') {
      setHasEdited(false);
    }
  };

  const handleReset = () => {
    setAmount('');
    setExactYearlyIncome(null);
    setMode(DEFAULT_INPUT_MODE);
    setHasEdited(false);
  };

  return (
    <div style={styles.page}>
      <main style={styles.container}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>{APP_TEXT.title}</h1>
            <p style={styles.subtitle}>{APP_TEXT.subtitle}</p>
          </div>
          <span style={styles.taxYearBadge}>{TAX_YEAR_LABEL}</span>
        </header>

        <section style={styles.card} aria-labelledby="form-heading">
          <h2 id="form-heading" style={styles.sectionHeading}>
            {APP_TEXT.form.heading}
          </h2>
          <IncomeForm
            amount={amount}
            mode={mode}
            errorKey={errorKey}
            onAmountChange={handleAmountChange}
            onModeChange={handleModeChange}
            onReset={handleReset}
          />
        </section>

        {result !== null && (
          <>
            <ResultCards result={result} />
            <SlabBreakdown result={result} />
          </>
        )}
        <Disclaimer showNotice={result !== null} />
        <SlabTable rows={SLAB_TABLE_ROWS} />
      </main>
    </div>
  );
};
