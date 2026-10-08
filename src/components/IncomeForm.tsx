import { APP_TEXT, ERROR_MESSAGES } from '@/constants';
import { styles } from '@/style';
import type { IncomeFormProps, InputMode } from '@/types';

const MODES: readonly InputMode[] = ['monthly', 'annual'];
const AMOUNT_INPUT_ID = 'salary-amount';
const ERROR_ID = 'salary-error';

export const IncomeForm = ({
  amount,
  mode,
  errorKey,
  onAmountChange,
  onModeChange,
  onReset,
}: IncomeFormProps) => (
  <form style={styles.form} onSubmit={(event) => event.preventDefault()} noValidate>
    <fieldset style={styles.modeFieldset}>
      <legend style={styles.modeLegend}>{APP_TEXT.form.modeLegend}</legend>
      {MODES.map((option) => (
        <label
          key={option}
          style={{ ...styles.modeOption, ...(option === mode ? styles.modeOptionSelected : {}) }}
        >
          <input
            type="radio"
            name="salary-mode"
            value={option}
            checked={option === mode}
            onChange={() => onModeChange(option)}
          />
          {APP_TEXT.modes[option]}
        </label>
      ))}
    </fieldset>

    <div style={styles.fieldGroup}>
      <label htmlFor={AMOUNT_INPUT_ID} style={styles.label}>
        {APP_TEXT.form.amountLabel}
      </label>
      <input
        id={AMOUNT_INPUT_ID}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        placeholder={APP_TEXT.form.amountPlaceholder}
        value={amount}
        onChange={(event) => onAmountChange(event.target.value)}
        aria-invalid={errorKey !== null}
        aria-describedby={errorKey !== null ? ERROR_ID : undefined}
        style={{ ...styles.input, ...(errorKey !== null ? styles.inputInvalid : {}) }}
      />
      {errorKey !== null && (
        <p id={ERROR_ID} role="alert" style={styles.errorMessage}>
          {ERROR_MESSAGES[errorKey]}
        </p>
      )}
    </div>

    <button type="button" onClick={onReset} style={styles.resetButton}>
      {APP_TEXT.form.reset}
    </button>
  </form>
);
