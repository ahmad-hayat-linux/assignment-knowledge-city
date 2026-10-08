# Business Constraints: Pakistan Salary Tax Calculator (TY 2026-27)

These are the business rules the app must obey: what it calculates, how amounts are rounded and shown, and what input it accepts. They say **what** the app does. How the code is written is in `CLAUDE.md`.

The acceptance criteria in `docs/user-stories.md` are the testable form of these rules, and its "Calculation rules" section mirrors them. If a rule changes, update this file, that section and the affected criteria together.

## B-1 Scope

- Income tax for salaried individuals in Pakistan, for **tax year 2026-27** (1 July 2026 to 30 June 2027) only.
- It is an estimate, not tax advice. Every result is shown with the tax year and an estimate-only notice.
- Out of scope: deductions, allowances, zakat, other tax years, comparing offers, printing or downloading.

## B-2 Tax slabs

Annual income, PKR. No surcharge applies this year.

| Annual income          | Tax                            |
| ---------------------- | ------------------------------ |
| up to 600,000          | 0                              |
| 600,001 to 1,200,000   | 1% of the amount over 600,000  |
| 1,200,001 to 2,200,000 | 6,000 + 11% over 1,200,000     |
| 2,200,001 to 3,200,000 | 116,000 + 20% over 2,200,000   |
| 3,200,001 to 4,100,000 | 316,000 + 25% over 3,200,000   |
| 4,100,001 to 5,600,000 | 541,000 + 29% over 4,100,000   |
| 5,600,001 to 7,000,000 | 976,000 + 32% over 5,600,000   |
| above 7,000,000        | 1,424,000 + 35% over 7,000,000 |

An income exactly on a slab boundary belongs to the lower slab for tax. The rate on the next rupee (the marginal rate) is the rate of the slab above the boundary.

## B-3 Input

- The salary can be entered as a **monthly** or **annual** amount. Monthly is the default. A monthly amount is multiplied by 12 to give yearly income.
- **Whole rupees only.** The field never holds a decimal point. A typed "." does nothing. In pasted text, the "." and everything after it are dropped. No error is shown for either.
- Commas between digits are ignored, so "1,000,000" and "1,00,000" are accepted. Spaces around the number are ignored.
- Rejected with a message and no result:

  | Input                                         | Message                                                          |
  | --------------------------------------------- | ---------------------------------------------------------------- |
  | empty or only spaces                          | Enter your salary                                                |
  | letters, mixed text, "NaN", "Infinity", "1e5" | Salary must be a number                                          |
  | a negative number                             | Salary cannot be negative                                        |
  | yearly income above PKR 10,000,000,000        | Salary is too large. The maximum is PKR 10,000,000,000 per year. |

- 0 is valid and gives tax 0.
- The app never shows `NaN`, `Infinity`, scientific notation or a wrong result. Old results never stay on screen beside an error.
- An untouched, empty form shows no error. The error appears only after the user has edited the field.

## B-4 Rounding

- Every rounding is to the **nearest whole rupee**. An exact half rounds **up** (0.5 becomes 1, 2.5 becomes 3).
- Yearly tax is rounded once, from the exact tax over all slabs. Yearly net = yearly income minus yearly tax.
- Monthly figures are the yearly figures divided by 12, rounded.
- Bounds that must hold:
  - each monthly figure is within 0.5 rupee of its true value (yearly ÷ 12);
  - monthly tax plus monthly net is within 1 rupee of yearly income ÷ 12;
  - switching between Monthly and Annual never changes any result.
- Monthly figures multiplied by 12 may differ from the yearly figures by up to 6 rupees. This is expected with whole-rupee display.
- After a Monthly/Annual switch the field shows a rounded whole number (Annual 100,000 shows 8,333 in Monthly mode), but the exact yearly amount is kept for the calculation until the user edits the field.

## B-5 Display

- Every rupee amount is shown as **PKR** with comma thousands separators in standard grouping, for example "PKR 1,194,000" (not lakh style), and always as a whole number with no decimal point.
- Very large amounts show in full digits, never in scientific notation.
- Percentages are not rupee amounts: the effective tax rate shows two decimals ("16.04%", and "0.00%" for zero income); the marginal rate shows none ("11%").
- Results shown: monthly tax, monthly net pay, yearly income, yearly tax, yearly net pay, effective rate, marginal rate, and the slab-by-slab breakdown. The full slab table and the tax year are always visible.

## B-6 Slab data is the single source

- The slab figures come from the Finance Act 2026 as reported by four independent sources (checked 2026-10-08); they have not been compared against the official Act text. The sources are listed in `src/data/slabs.ts` and in the README.
