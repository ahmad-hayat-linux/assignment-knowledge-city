import { expect, test, type Locator, type Page } from '@playwright/test';
import {
  DISCLAIMER,
  amountInput,
  breakdownSection,
  enterSalary,
  openApp,
  resetButton,
  slabTableSection,
} from './helpers';

const PHONE_WIDTH = 375;
const DESKTOP_WIDTH = 1280;
const VIEWPORT_HEIGHT = 900;

const expectNoHorizontalPageScroll = async (page: Page): Promise<void> => {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
};

const expectInsideWidth = async (locator: Locator, width: number): Promise<void> => {
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  if (box !== null) {
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width + 0.5);
  }
};

test.describe('S-10 [P2]: phone-width layout (375px)', () => {
  test.use({ viewport: { width: PHONE_WIDTH, height: 812 } });

  test.beforeEach(async ({ page }) => {
    await openApp(page);
  });

  test('S-10 [P2]: the first screen has no horizontal page scroll', async ({ page }) => {
    await expectNoHorizontalPageScroll(page);
  });

  test('S-10 [P2]: a result with the full eight-slab breakdown has no horizontal page scroll', async ({
    page,
  }) => {
    await enterSalary(page, '8000000', 'Annual');
    await expect(breakdownSection(page).locator('tbody tr')).toHaveCount(8);
    await expectNoHorizontalPageScroll(page);
  });

  test('S-10 [P2]: a long error message has no horizontal page scroll', async ({ page }) => {
    await enterSalary(page, '10000000001', 'Annual');
    await expect(page.getByRole('alert')).toBeVisible();
    await expectNoHorizontalPageScroll(page);
  });

  test('S-10 [P2]: a very long input value has no horizontal page scroll', async ({ page }) => {
    await enterSalary(page, '9'.repeat(60));
    await expectNoHorizontalPageScroll(page);
  });

  test('S-10 [P2]: input, Reset, all five figures and the disclaimer fit within 375px', async ({
    page,
  }) => {
    await enterSalary(page, '10000000000', 'Annual');
    await expectInsideWidth(amountInput(page), PHONE_WIDTH);
    await expectInsideWidth(resetButton(page), PHONE_WIDTH);
    const cards = page.getByRole('article');
    await expect(cards).toHaveCount(5);
    for (let index = 0; index < 5; index += 1) {
      await expectInsideWidth(cards.nth(index), PHONE_WIDTH);
    }
    await expectInsideWidth(page.getByText(DISCLAIMER, { exact: true }), PHONE_WIDTH);
    await expectInsideWidth(slabTableSection(page), PHONE_WIDTH);
  });

  test('S-10 [P2]: Reset can be reached and pressed at 375px', async ({ page }) => {
    await enterSalary(page, '100000');
    await resetButton(page).click();
    await expect(amountInput(page)).toHaveValue('');
  });
});

test.describe('S-10 [P2]: desktop layout (1280px)', () => {
  test.use({ viewport: { width: DESKTOP_WIDTH, height: VIEWPORT_HEIGHT } });

  test.beforeEach(async ({ page }) => {
    await openApp(page);
  });

  test('S-10 [P2]: a full result has no horizontal page scroll at 1280px', async ({ page }) => {
    await enterSalary(page, '8000000', 'Annual');
    await expect(breakdownSection(page).locator('tbody tr')).toHaveCount(8);
    await expectNoHorizontalPageScroll(page);
  });

  test('S-10 [P2]: the five result cards do not overlap at 1280px', async ({ page }) => {
    await enterSalary(page, '8000000', 'Annual');
    const cards = page.getByRole('article');
    await expect(cards).toHaveCount(5);
    const boxes = await cards.evaluateAll((elements) =>
      elements.map((element) => {
        const { x, y, width, height } = element.getBoundingClientRect();
        return { x, y, width, height };
      }),
    );
    for (const [i, a] of boxes.entries()) {
      for (const b of boxes.slice(i + 1)) {
        const overlaps =
          a.x < b.x + b.width &&
          b.x < a.x + a.width &&
          a.y < b.y + b.height &&
          b.y < a.y + a.height;
        expect(overlaps).toBe(false);
      }
    }
  });

  test('S-10 [P2]: the form, results, breakdown and slab table are stacked without overlap', async ({
    page,
  }) => {
    await enterSalary(page, '8000000', 'Annual');
    const sections = page.getByRole('region');
    const count = await sections.count();
    expect(count).toBeGreaterThanOrEqual(4);
    const boxes = await sections.evaluateAll((elements) =>
      elements.map((element) => {
        const { y, height } = element.getBoundingClientRect();
        return { top: y, bottom: y + height };
      }),
    );
    const ordered = [...boxes].sort((a, b) => a.top - b.top);
    for (const [i, current] of ordered.entries()) {
      const next = ordered[i + 1];
      if (next !== undefined) {
        expect(current.bottom).toBeLessThanOrEqual(next.top + 0.5);
      }
    }
  });

  test('S-10 [P2]: input and Reset are visible and usable at 1280px', async ({ page }) => {
    await expectInsideWidth(amountInput(page), DESKTOP_WIDTH);
    await expectInsideWidth(resetButton(page), DESKTOP_WIDTH);
  });
});
