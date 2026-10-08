import {
  APP_TEXT,
  EFFECTIVE_RATE_FRACTION_DIGITS,
  MARGINAL_RATE_FRACTION_DIGITS,
} from '@/constants';
import { formatNumber, formatPercent, formatPkr, formatSlabRange } from '@/lib/format';
import { styles } from '@/style';
import type { SlabBreakdownProps } from '@/types';

export const SlabBreakdown = ({ result }: SlabBreakdownProps) => (
  <section style={styles.card} aria-labelledby="breakdown-heading">
    <h2 id="breakdown-heading" style={styles.sectionHeading}>
      {APP_TEXT.breakdown.heading}
    </h2>

    <dl style={styles.rateRow}>
      <div style={styles.rateItem}>
        <dt style={styles.resultLabel}>{APP_TEXT.results.effectiveRate}</dt>
        <dd style={styles.resultValue}>
          {formatPercent(result.effectiveRatePercent, EFFECTIVE_RATE_FRACTION_DIGITS)}
        </dd>
      </div>
      <div style={styles.rateItem}>
        <dt style={styles.resultLabel}>{APP_TEXT.results.marginalRate}</dt>
        <dd style={styles.resultValue}>
          {formatPercent(result.marginalRatePercent, MARGINAL_RATE_FRACTION_DIGITS)}
        </dd>
      </div>
    </dl>

    <div style={styles.tableScroll}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th scope="col" style={styles.tableFirstHeadCell}>
              {APP_TEXT.breakdown.slab}
            </th>
            <th scope="col" style={styles.tableHeadCell}>
              {APP_TEXT.breakdown.incomeInSlab}
            </th>
            <th scope="col" style={styles.tableHeadCell}>
              {APP_TEXT.breakdown.rate}
            </th>
            <th scope="col" style={styles.tableHeadCell}>
              {APP_TEXT.breakdown.tax}
            </th>
          </tr>
        </thead>
        <tbody>
          {result.breakdown.map((row) => (
            <tr key={row.slab.lowerBound}>
              <th scope="row" style={styles.tableFirstCell}>
                {formatSlabRange(row.slab)}
              </th>
              <td style={styles.tableCell}>{formatNumber(row.amountInSlab)}</td>
              <td style={styles.tableCell}>{formatPercent(row.slab.ratePercent, 0)}</td>
              <td style={styles.tableCell}>{formatPkr(row.tax)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);
