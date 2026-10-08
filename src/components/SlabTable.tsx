import { APP_TEXT } from '@/constants';
import { formatPercent, formatPkr, formatSlabRange } from '@/lib/format';
import { styles } from '@/style';
import type { SlabTableProps } from '@/types';

export const SlabTable = ({ rows }: SlabTableProps) => (
  <section style={styles.card} aria-labelledby="slab-table-heading">
    <h2 id="slab-table-heading" style={styles.sectionHeading}>
      {APP_TEXT.slabTable.heading}
    </h2>
    <div style={styles.tableScroll}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th scope="col" style={styles.tableFirstHeadCell}>
              {APP_TEXT.slabTable.range}
            </th>
            <th scope="col" style={styles.tableHeadCell}>
              {APP_TEXT.slabTable.fixedTax}
            </th>
            <th scope="col" style={styles.tableHeadCell}>
              {APP_TEXT.slabTable.rate}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.slab.lowerBound}>
              <th scope="row" style={styles.tableFirstCell}>
                {formatSlabRange(row.slab)}
              </th>
              <td style={styles.tableCell}>{formatPkr(row.fixedAmount)}</td>
              <td style={styles.tableCell}>{formatPercent(row.slab.ratePercent, 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);
