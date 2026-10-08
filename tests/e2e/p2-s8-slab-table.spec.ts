import { expect, test } from '@playwright/test';
import { enterSalary, openApp, slabTableSection } from './helpers';

interface SlabRow {
  range: string;
  fixedTax: string;
  rate: string;
}

// Taken from the slab list at the top of docs/user-stories.md.
const EXPECTED_ROWS: readonly SlabRow[] = [
  { range: 'PKR 0 to 600,000', fixedTax: 'PKR 0', rate: '0%' },
  { range: 'PKR 600,001 to 1,200,000', fixedTax: 'PKR 0', rate: '1%' },
  { range: 'PKR 1,200,001 to 2,200,000', fixedTax: 'PKR 6,000', rate: '11%' },
  { range: 'PKR 2,200,001 to 3,200,000', fixedTax: 'PKR 116,000', rate: '20%' },
  { range: 'PKR 3,200,001 to 4,100,000', fixedTax: 'PKR 316,000', rate: '25%' },
  { range: 'PKR 4,100,001 to 5,600,000', fixedTax: 'PKR 541,000', rate: '29%' },
  { range: 'PKR 5,600,001 to 7,000,000', fixedTax: 'PKR 976,000', rate: '32%' },
  { range: 'Above PKR 7,000,000', fixedTax: 'PKR 1,424,000', rate: '35%' },
];

const expectTableMatchesStoryDocument = async (
  table: ReturnType<typeof slabTableSection>,
): Promise<void> => {
  const bodyRows = table.locator('tbody tr');
  await expect(bodyRows).toHaveCount(EXPECTED_ROWS.length);
  for (const [index, row] of EXPECTED_ROWS.entries()) {
    const bodyRow = bodyRows.nth(index);
    await expect(bodyRow.getByRole('rowheader')).toHaveText(row.range);
    await expect(bodyRow.getByRole('cell').nth(0)).toHaveText(row.fixedTax);
    await expect(bodyRow.getByRole('cell').nth(1)).toHaveText(row.rate);
  }
};

test.describe('S-8 [P2] (B-2, B-5): slab reference table', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page);
  });

  test('S-8 [P2] (B-2, B-5): with nothing entered, a table of all eight slabs is shown', async ({
    page,
  }) => {
    const table = slabTableSection(page);
    await expect(table).toBeVisible();
    await expect(table.locator('tbody tr')).toHaveCount(8);
    await expect(table.getByRole('columnheader')).toHaveText([
      'Annual income',
      'Tax on income below the slab',
      'Rate on income in the slab',
    ]);
  });

  test('S-8 [P2] (B-2, B-5): the table figures match the slabs in the story document', async ({
    page,
  }) => {
    await expectTableMatchesStoryDocument(slabTableSection(page));
  });

  test('S-8 [P2] (B-2, B-5): the table is still visible with a result', async ({ page }) => {
    await enterSalary(page, '100000');
    await expect(page.getByRole('heading', { name: 'Your results' })).toBeVisible();
    await expect(slabTableSection(page)).toBeVisible();
    await expectTableMatchesStoryDocument(slabTableSection(page));
  });

  test('S-8 [P2] (B-2, B-5): the table is still visible with an error', async ({ page }) => {
    await enterSalary(page, 'abc');
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(slabTableSection(page)).toBeVisible();
    await expect(slabTableSection(page).locator('tbody tr')).toHaveCount(8);
  });
});
