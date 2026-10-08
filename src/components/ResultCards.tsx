import { APP_TEXT } from '@/constants';
import { formatPkr } from '@/lib/format';
import { styles } from '@/style';
import type { ResultCardsProps } from '@/types';

export const ResultCards = ({ result }: ResultCardsProps) => {
  const cards = [
    { label: APP_TEXT.results.monthlyTax, value: result.monthlyTax },
    { label: APP_TEXT.results.monthlyNet, value: result.monthlyNet },
    { label: APP_TEXT.results.yearlyIncome, value: result.yearlyIncome },
    { label: APP_TEXT.results.yearlyTax, value: result.yearlyTax },
    { label: APP_TEXT.results.yearlyNet, value: result.yearlyNet },
  ];

  return (
    <section style={styles.card} aria-labelledby="results-heading">
      <h2 id="results-heading" style={styles.sectionHeading}>
        {APP_TEXT.results.heading}
      </h2>
      <div style={styles.cardGrid}>
        {cards.map((card) => (
          <article key={card.label} style={styles.resultCard}>
            <p style={styles.resultLabel}>{card.label}</p>
            <p style={styles.resultValue}>{formatPkr(card.value)}</p>
          </article>
        ))}
      </div>
    </section>
  );
};
