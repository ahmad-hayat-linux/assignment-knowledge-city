# TaxCalculator: Pakistan Salary Tax Calculator (TY 2026-27)

## Context

Take-home assignment for KnowledgeCity: build a calculator web app with an AI coding tool, backed by three product docs (roles, jobs, stories) and a README. This plan covers app creation only. Claude executes it. Submission and deployment are tracked separately by the user and are not part of this plan.

Working dir: /Users/ahmadhayat/Development/assignment-knowledge-city/assignment-knowledge-city (empty, no git, Node 24).
Stack: React + Vite + TypeScript, ESLint + Prettier, Vitest (unit), Playwright (E2E). UI inspired by taxcalculator.pk, scope our own.

## Who does what

- **Main Claude (developer):** writes docs, app code and config. Does **not** write test cases.
- **`qa-subagent` (a Claude subagent, built in this plan):** writes test cases, runs unit tests and E2E tests, reports failures. Does not change app code; it reports defects and the main Claude fixes them. Tests are written from the user stories and acceptance criteria, not from the implementation, so they stay independent.

## qa-subagent definition

File: `.claude/agents/qa-subagent.md`

- **name:** `qa-subagent`
- **Duty:** "To write test cases, and do unit testing and E2E testing."
- **Tools:** Read, Write, Edit (test files only), Bash (to run `npm test` and `npx playwright test`), Grep, Glob.
- **Inputs:** `docs/user-stories.md` (source of truth), `docs/app-roles.md`, `Constraints.md` (business rules), `CLAUDE.md` (coding rules), the slab table, and the code under test.
- **Outputs:**
  - All tests live in the root `tests/` folder, never inside `src/`.
  - Unit tests: `tests/unit/lib/*.test.ts` (Vitest), for the pure logic in `src/lib/` only.
  - No component tests. Everything on screen is covered by Playwright E2E.
  - E2E tests: `tests/e2e/*.spec.ts` (Playwright).
  - A QA report per run: pass/fail, failing story ids, and reproduction steps. It is also saved as a file, one per story tested, in the root `report/` folder as `report/story-[number]-[timestamp].md` (timestamp `YYYYMMDD-HHmmss`, for example `report/story-1-20261008-153412.md`). Reports are never overwritten, so the folder keeps the history.
- **Rules it follows:**
  - Every acceptance criterion maps to at least one test, named after its story (for example `S-6: blank input shows "Enter your salary"`).
  - Expected values are worked out independently from the slab table, never copied from the code's output.
  - Error and display text is read from `src/constants.ts` or matches the criteria exactly.
  - It never edits app source, only test files and test config; it reports bugs back.
  - It follows `CLAUDE.md` (TypeScript, Prettier, ESLint) for test code.

## Coding rules (written to `CLAUDE.md` in task 1.2)

1. TypeScript everywhere, strict mode, no `any`.
2. Components are arrow functions with an explicit props type and a named export.
3. All styles in `src/style.ts`.
4. All types in `src/types.ts`.
5. ESLint and Prettier configured and passing.
6. All console messages in `src/constants.ts`.
7. All display strings in `src/constants.ts`.
8. **Testing:** unit tests for `src/lib/` use Vitest; everything on screen is tested with Playwright E2E (no component tests). No Jest anywhere. **All tests live in the root `tests/` folder (`tests/unit/`, `tests/e2e/`), never inside `src/`.** Tests are written and run by `qa-subagent`; the developer agent does not write test cases.
9. Professional practices: structure by `lib/`, `data/`, `components/`; tax logic kept out of components in pure functions; **no custom hooks** (hooks from React or libraries are fine, but we write none ourselves, so there is no `hooks/` folder; reusable logic goes in plain functions in `lib/`); input validated at the boundary; no NaN/Infinity ever rendered; accessible labels and `role="alert"` errors; error boundary; no secrets, no dead code; story statuses reflect verified behavior only; run lint, format check and `tsc --noEmit` before finishing any change, and request a QA run from `qa-subagent` before marking a story Implemented.

## Slabs (verify in task 1.1)

| Annual income (PKR)    | Tax                     |
| ---------------------- | ----------------------- |
| up to 600,000          | 0                       |
| 600,001 to 1,200,000   | 1% over 600,000         |
| 1,200,001 to 2,200,000 | 6,000 + 11% over 1.2M   |
| 2,200,001 to 3,200,000 | 116,000 + 20% over 2.2M |
| 3,200,001 to 4,100,000 | 316,000 + 25% over 3.2M |
| 4,100,001 to 5,600,000 | 541,000 + 29% over 4.1M |
| 5,600,001 to 7,000,000 | 976,000 + 32% over 5.6M |
| above 7,000,000        | 1,424,000 + 35% over 7M |

No surcharge.

## Business constraints (written to `Constraints.md` in task 1.2)

`Constraints.md` (project root) holds the business rules, kept apart from the coding rules in `CLAUDE.md`. It says **what** the app does; the stories' acceptance criteria are its testable form, and the "Calculation rules" section of `docs/user-stories.md` mirrors it (both change together). Both the developer agent and the `qa-subagent` read it before working.

| Section       | Rules                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| B-1 Scope     | Salaried-individual income tax for tax year 2026-27 only. An estimate, not tax advice; every result shows the tax year and an estimate-only notice. Out of scope: deductions, allowances, zakat, other tax years, comparing offers, print or download.                                                                                                                                                                                                                                                                                                                                                                                                                               |
| B-2 Tax slabs | The eight slabs in the table above, no surcharge. An income exactly on a boundary is taxed in the lower slab, and its marginal rate is the rate of the slab above.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| B-3 Input     | Monthly or annual, Monthly by default; monthly is multiplied by 12. **Whole rupees only:** a typed "." does nothing and pasted text is cut at the ".", with no error. Commas between digits and spaces around the number are ignored. Rejected with no result: empty ("Enter your salary"), non-numeric incl. NaN, Infinity, 1e5 ("Salary must be a number"), negative ("Salary cannot be negative"), yearly income above PKR 10,000,000,000 ("Salary is too large. The maximum is PKR 10,000,000,000 per year."). Zero is valid. Never show NaN, Infinity, scientific notation or a wrong result, and never leave old results beside an error. No error on an untouched empty form. |
| B-4 Rounding  | Every rounding to the nearest whole rupee, exact halves round up (0.5 becomes 1, 2.5 becomes 3). Yearly tax is rounded once from the exact total; monthly figures are yearly ÷ 12, rounded. Each monthly figure is within 0.5 rupee of its true value; monthly tax plus monthly net is within 1 rupee of yearly income ÷ 12; a Monthly/Annual switch never changes any result; monthly × 12 may differ from yearly by up to 6 rupees (expected). After a switch the field shows a rounded whole number while the exact yearly amount is kept until the user edits.                                                                                                                   |
| B-5 Display   | Rupee amounts as "PKR" plus comma thousands separators in standard grouping (PKR 1,194,000, not lakh style), always whole numbers; large amounts in full digits. Effective rate has two decimals ("16.04%"), marginal rate none ("11%"). Shown: monthly tax and net, yearly income, tax and net, both rates, the slab breakdown, the slab table and the tax year.                                                                                                                                                                                                                                                                                                                    |
| B-6 Slab data | Figures come from the Finance Act 2026 as reported by four independent sources (checked 2026-10-08), not yet compared with the official Act text; sources are listed in `src/data/slabs.ts` and the README.                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

## Requirements to meet

- Runs in Chrome, Edge, Firefox and Safari; starts locally from the README with no paid accounts or keys.
- Every Implemented story works exactly as its acceptance criteria say.
- Invalid input and errors show a clear message, never a crash or a wrong result.
- The three docs match the app as built.
- **Business rules live in `Constraints.md`** (scope, slabs, input, rounding, display), separate from the coding rules in `CLAUDE.md`. Highlights: whole rupees only (no decimal point can be entered or shown), exact halves round up, results never change on a Monthly/Annual switch, amounts shown as "PKR 1,194,000". The `qa-subagent` covers all of it in unit and E2E tests.

## Story priorities (build and cut order)

| Priority  | Stories                                                                                                       | Rule                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| P0 Must   | S-1 Result cards, S-12 Works in current browsers, S-6 Invalid input and recovery, S-2 Monthly or annual input | Core purpose and the assignment's error-handling requirement; built first, never cut |
| P1 Should | S-3 Slab breakdown, S-7 Tax year and disclaimer, S-11 PKR formatting and paste, S-4 Effective rate            | Make the result trustworthy and explainable                                          |
| P2 Could  | S-9 Reset, S-8 Slab reference table, S-10 Phone-width layout, S-5 Marginal rate                               | Polish; first to be marked Not implemented if they cannot be verified                |

Build and QA order follows priority: P0, then P1, then P2.

## Phase A: Foundation, docs and QA agent

| #   | Task                                                                   | Output                                                                   | Done when                                                                                                                                                |
| --- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1 | Verify slabs against the Finance Act or FBR                            | Slab table with source URL and date                                      | Numbers match an official source                                                                                                                         |
| 1.2 | Write `CLAUDE.md` (coding rules) and `Constraints.md` (business rules) | `CLAUDE.md`                                                              | Coding rules in place with Vitest and Playwright named; business rules B-1 to B-6 in `Constraints.md`, matching the stories' calculation rules           |
| 1.3 | Write roles                                                            | `docs/app-roles.md`                                                      | 3 roles, each with can / must never                                                                                                                      |
| 1.4 | Write jobs                                                             | `docs/jobs-to-be-done.md`                                                | J-1..J-5, each names a role, none mention the app                                                                                                        |
| 1.5 | Write stories                                                          | `docs/user-stories.md`                                                   | S-1..S-12 with Given/When/Then, priorities, all Not implemented for now                                                                                  |
| 1.6 | User reviews the docs                                                  | Approval                                                                 | User can explain every line                                                                                                                              |
| 1.7 | Scaffold                                                               | package.json, Vite/TS/ESLint/Prettier/Vitest config, .gitignore          | `npm install`, `lint` and `npm test` run on an empty app                                                                                                 |
| 1.8 | Build the QA agent                                                     | `.claude/agents/qa-subagent.md`, `playwright.config.ts`, `tests/` folder | Agent definition matches the section above; Playwright installed with its Chromium browser; `webServer` starts the Vite dev server; one smoke run passes |

## Phase B: Logic (no tests written here)

| #   | Task                         | Files                                       | Done when                                                                                                                  |
| --- | ---------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 2.1 | Types and constants          | `src/types.ts`, `src/constants.ts`          | All strings and console messages are constants                                                                             |
| 2.2 | Slab data                    | `src/data/slabs.ts`                         | Year, source URL and date checked in a comment                                                                             |
| 2.3 | Tax engine                   | `src/lib/tax.ts`                            | Tax, per-slab breakdown, effective rate, marginal rate, nearest-rupee rounding                                             |
| 2.4 | Validation                   | `src/lib/validate.ts`                       | Blank, letters, negative, NaN, Infinity, too large, 0, "1,000,000" handled with the exact error text                       |
| 2.5 | Formatting                   | `src/lib/format.ts`                         | PKR format, no NaN text, no scientific notation                                                                            |
| 2.6 | QA run: unit tests for logic | `tests/unit/lib/*.test.ts` (by qa-subagent) | Tests cover every slab edge and every logic criterion; run reported; defects fixed by the developer and re-run until green |

## Phase C: UI (no tests written here)

| #   | Task                          | Files                                                                                              | Done when                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --- | ----------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 3.1 | Styles                        | `src/style.ts`                                                                                     | One file of typed objects                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 3.2 | Form                          | `src/components/IncomeForm.tsx`                                                                    | Amount, monthly/annual switch with value converted, Reset                                                                                                                                                                                                                                                                                                                                                                                  |
| 3.3 | Results                       | `ResultCards.tsx`, `SlabBreakdown.tsx`                                                             | 5 cards, breakdown that sums to total, effective and marginal rate                                                                                                                                                                                                                                                                                                                                                                         |
| 3.4 | Reference and notices         | `SlabTable.tsx`, `Disclaimer.tsx`, `ErrorBoundary.tsx`                                             | Tax year and "estimate only" on every result, 8 slab rows                                                                                                                                                                                                                                                                                                                                                                                  |
| 3.5 | App wiring                    | `src/App.tsx`, `src/main.tsx`                                                                      | Errors clear when input is fixed, no NaN or Infinity rendered                                                                                                                                                                                                                                                                                                                                                                              |
| 3.6 | QA run: tests for new logic   | `tests/unit/lib/evaluate.test.ts` and `formatSlabRange` cases in `format.test.ts` (by qa-subagent) | When the error appears (only after the user has typed), and slab range text; green                                                                                                                                                                                                                                                                                                                                                         |
| 3.7 | QA run: E2E tests             | `tests/e2e/*.spec.ts` (by qa-subagent, Playwright)                                                 | One spec per story in priority order, covering every on-screen criterion of S-1 to S-11: displayed figures, exact error text and `role="alert"`, recovery, old results hidden on invalid input, monthly/annual switch, Reset, tax year and disclaimer, breakdown and slab table, labels and `aria-invalid`, 375px viewport with no horizontal scroll and a 1280px layout; green on Chromium. The error fallback screen is checked by hand. |
| 3.8 | Optional Claude Design mockup | Design artifact                                                                                    | Desktop and 375px, only if time allows                                                                                                                                                                                                                                                                                                                                                                                                     |

## Phase D: Verification and close

| #   | Task             | Done when                                                                                                                                                                             |
| --- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4.1 | Quality gate     | `npm run lint`, `format:check`, `npx tsc --noEmit`, `npm test` and `npx playwright test` all pass                                                                                     |
| 4.2 | QA report review | The user reads the qa-subagent report; every failure is fixed or the story is marked Not implemented                                                                                  |
| 4.3 | Manual walk      | Every Implemented story's criteria tried by hand in two real browsers (E2E covers Chromium only), at phone width and by keyboard                                                      |
| 4.4 | Cross-check      | 3 or more salaries compared with an independent calculator                                                                                                                            |
| 4.5 | Fix and log      | Bugs fixed; AI and QA findings noted for the README                                                                                                                                   |
| 4.6 | Update docs      | Statuses set only from verified behavior; story-to-test traceability table (story id to unit and E2E test files)                                                                      |
| 4.7 | Write README     | What and who, prerequisites (Node 20+), install, start and test commands including `npx playwright install`, AI tool and model, the qa-subagent, hand edits, assumptions, slab source |
| 4.8 | Build check      | `npm run build` and `npm run preview` work, ready for deployment                                                                                                                      |

## Files created

````
CLAUDE.md  Constraints.md  README.md  .gitignore  .prettierrc  eslint.config.js  tsconfig*.json  vite.config.ts  playwright.config.ts  index.html  package.json
.claude/agents/qa-subagent.md
docs/app-roles.md  docs/jobs-to-be-done.md  docs/user-stories.md
src/main.tsx  src/App.tsx  src/types.ts  src/constants.ts  src/style.ts
src/data/slabs.ts  src/lib/{tax,validate,format}.ts
src/components/{IncomeForm,ResultCards,SlabBreakdown,SlabTable,Disclaimer,ErrorBoundary}.tsx
Written by qa-subagent, all under tests/: tests/unit/lib/*.test.ts  tests/e2e/*.spec.ts
Written by qa-subagent after each run: report/story-[number]-[timestamp].md
```

Vitest config lives in `vite.config.ts`. Playwright config is in `playwright.config.ts`.

## Testing approach

- All test cases are written and run by `qa-subagent`, not by the developer agent. This keeps tests independent of the code.
- Unit tests (Vitest) cover logic and components. E2E tests (Playwright) cover user journeys against the running app.
- Each acceptance criterion becomes at least one test named after its story.
- E2E runs on Chromium for every spec, and on Chromium, Firefox and WebKit for the browser-compatibility story S-12 (free, no paid services). Chromium stands for Chrome and Edge; WebKit stands in for Safari. A real Safari and Edge are checked by hand in task 4.3.
- No snapshot tests.

## Open decisions

- Default input mode: monthly (suggested) or annual.
- Rounding: nearest rupee.
- Rule 3 limit: style objects cannot express hover or media queries; allow one small documented CSS file for responsive layout, or stay strict.
- Playwright needs a one-time browser download (`npx playwright install chromium`); acceptable as a documented README step.

## Time estimate (app creation only)

Assumes Claude writes and qa-subagent tests, with the user reviewing, deciding and testing manually. Submission and deployment are excluded.

| Phase                         | Claude + qa-subagent | User review/testing | Total               |
| ----------------------------- | -------------------- | ------------------- | ------------------- |
| A. Foundation, docs, QA agent | 1.25 to 1.75 h       | 1 to 1.5 h          | 2.25 to 3.25 h      |
| B. Logic and unit tests       | 1 to 1.5 h           | 0.5 h               | 1.5 to 2 h          |
| C. UI and E2E tests           | 2 to 2.5 h           | 1 h                 | 3 to 3.5 h          |
| D. Verification and close     | 0.5 to 1 h           | 1 to 1.5 h          | 1.5 to 2.5 h        |
| **Total**                     | **4.75 to 6.75 h**   | **3.5 to 4.5 h**    | **8.25 to 11.25 h** |

Schedule: about 1.5 working days. Day 1 covers phases A and B, and Day 2 covers phases C and D. Some spare time stays for submission and deployment.

Could add time: slab verification trouble (0.5 to 1 h), doc rewrites (0.5 to 1 h), Playwright or tooling config (0.5 to 1 h), optional mockup 3.8 (0.5 to 1 h), bugs found by QA runs (0.5 to 1 h).
Could save time: skip 3.8 (0.5 to 1 h), E2E only for P0 and P1 stories (0.5 h), accept slabs confirmed by two independent sources (0.5 h).
````
