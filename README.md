# Pakistan Salary Tax Calculator (tax year 2026-27)

A small web app that estimates income tax and take-home pay for **salaried individuals in Pakistan**, using the 2026-27 tax slabs (1 July 2026 to 30 June 2027). Enter a monthly or yearly salary and see the tax, the net pay, how the tax is built up slab by slab, and the tax rates that apply.

- **Live app:** <https://assignment-knowledge-city.onrender.com/> (hosted on Render; the first load can take a moment if the site has been idle). You can also run it locally by following the steps below.
- **It is an estimate, not tax advice.** The app says so on every result.
- **Main contributor:** Ahmad Hayat. He chose the app, defined the roles, jobs, stories and rules, directed the AI tools, and reviewed and tested what they produced. The code and tests were written with Claude Code (see [AI tools and models used](#ai-tools-and-models-used)).

## What it is and who it is for

The calculator serves three kinds of people (full descriptions in [docs/app-roles.md](docs/app-roles.md)):

| Role               | Situation                                                       | What they need                                                      |
| ------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------- |
| Salaried Employee  | Has one known salary and a pay slip with a tax deduction        | Check the deduction and know the real take-home                     |
| Job Seeker         | Weighing an offer quoted as a gross (often yearly) package      | A quick answer for several amounts, and the value of an extra rupee |
| HR/Payroll Officer | Prepares salary estimates for others and may have to justify it | The working: tax per slab, the slab table, the tax year             |

**Why this calculator:** salary tax is a calculation people in Pakistan do not get right easily, and the rules (slabs, boundaries, rounding) are precise enough to specify and test exhaustively. That fits a small app that is well specified rather than large. The product thinking is in [docs/jobs-to-be-done.md](docs/jobs-to-be-done.md) and [docs/user-stories.md](docs/user-stories.md) (11 stories with acceptance criteria and priorities). The business rules behind them are in [Constraints.md](Constraints.md).

## What the app does

- Monthly (default) or annual salary input, with value conversion when you switch.
- Five result cards: monthly tax, monthly net pay, yearly income, yearly tax, yearly net pay.
- Effective tax rate and the tax rate on your next rupee.
- A slab-by-slab breakdown and the full slab table.
- Clear messages for invalid input (empty, not a number, negative, too large), with no wrong result and no crash.
- Whole rupees only: a decimal point cannot be typed, and every amount shows as, for example, `PKR 1,194,000`.
- The tax year and an estimate-only notice on every result, a Reset button, and a layout that works on a phone.

## Prerequisites

- **Node.js 22.12 or newer** (developed and tested on Node 24; the unit tests and build also passed on Node 20.20, but Vitest 5 officially requires 22.12+).
- npm (it comes with Node).
- A current Chrome, Edge, Firefox or Safari to use the app. No accounts, API keys or cloud services are needed.

## Install and run

```bash
npm install
npm start
```

`npm start` starts the dev server at <http://localhost:5173> and opens it in your browser. `npm run dev` does the same without opening a browser.

To run the production build instead:

```bash
npm run build
npm run preview
```

## Tests

- **Unit tests** (Vitest) cover the pure logic in `src/lib/`. They need nothing extra:

  ```bash
  npm test
  ```

- **End-to-end tests** (Playwright, Chromium) drive the real app in a browser. Install the browser once, then run them. They start the dev server themselves:

  ```bash
  npx playwright install chromium
  npm run test:e2e
  ```

- **Other checks:** `npm run lint`, `npm run format:check`, `npm run typecheck`.

At the last run (2026-10-08) all **176 unit tests and 108 E2E tests passed**, and lint, formatting and type checks were clean. Tests are named after the story and business rule they protect, for example `S-6 [P0] (B-3): blank input shows "Enter your salary"`.

A GitHub Actions workflow, [.github/workflows/final-deployment.yml](.github/workflows/final-deployment.yml) (named `final-deployment`), runs the build, the unit tests and the E2E tests on every push and pull request to `main`.

## AI tools and models used

- **Tool:** Claude Code, in the VS Code extension.
- **Model:** Claude Sonnet 5.5 (`claude-sonnet-5-5`) for the main session, which wrote the documents, the app code and the configuration.
- **QA agent:** the tests were written and run by a separate Claude subagent defined in [.claude/agents/qa-subagent.md](.claude/agents/qa-subagent.md) ("To write test cases, and do unit testing and E2E testing."). The developer agent does not write test cases, and the QA agent never edits app code; it reports defects. Claude Code only registers a new agent file when a session starts, so for the first runs the same instructions were given to a general-purpose subagent. Later runs used the named `qa-subagent`.
- The author reviewed the documents and decisions and directed the work. The session transcripts are in `transcripts/`.

## Code changed by hand

None. All code, tests and documents were written by the AI tools described above.

## Assumptions

- **One tax year and one taxpayer type:** salaried individuals, tax year 2026-27 only. There are no deductions, allowances, zakat or other income.
- **Slab figures come from secondary sources.** They were taken from four independent sources that agree on every slab (checked 2026-10-08) and have **not** been compared against the official Finance Act 2026 text. The sources are listed in [src/data/slabs.ts](src/data/slabs.ts). Treat the figures as unconfirmed until checked against FBR:
  - <https://vialtopartners.com/regional-alerts/pakistan-employment-tax-finance-bill-2026-27-summary>
  - <https://cssprep.com.pk/income-tax-slabs-2026-27-pakistan-salaried-class/>
  - <https://www.ict.edu.pk/blogs/income-tax-slabs-salaried-individuals-pakistan>
  - <https://taxcalc.pk/resources/tax-card-2026-27>
- **No surcharge** applies this year, as reported by those sources.
- **Whole rupees only.** A pasted decimal such as `100000.50` becomes `100000` (the decimal point and what follows are dropped, with no error).
- **Rounding:** every rounding is to the nearest rupee and an exact half rounds up. Monthly figures are the yearly figures divided by 12, so monthly × 12 can differ from the yearly figure by a few rupees.
- **Maximum income:** PKR 10,000,000,000 a year. Anything above shows an error.
- **Default input is Monthly**, because that is how most salaries are quoted.
- **Number grouping** is standard (`1,194,000`), not lakh style, although lakh-style input such as `1,00,000` is accepted.
- Full detail on these rules is in [Constraints.md](Constraints.md).

## Known limits

- Automated tests run on **Chromium only**. Firefox, Safari and Edge, real phones, screen readers, keyboard feel and colour contrast have not been checked.
- The **error fallback screen** (shown only if the app crashes) cannot be triggered from a browser test and has not been checked.
- The slab figures are not confirmed against the official Act (see above).

## To do

- [ ] **Git hooks with Husky (planned, not done yet).** To enforce branching conventions, commit messages and pushes:
  - commit messages in Conventional Commits format (checked with commitlint), for example `fix(validate): reject decimal input`;
  - branch names like `feature/short-description` (also `fix/`, `docs/`, `test/`, `chore/`, `refactor/`);
  - no direct commits or pushes on `main`, with changes merged through pull requests;
  - a pre-commit check that runs ESLint and Prettier on the changed files, plus a type-check.

  The packages (`husky`, `lint-staged`, `@commitlint/cli`, `@commitlint/config-conventional`), a `prepare` script and a `lint-staged` setting are already in `package.json`, but **no hooks are installed or enforced today**.

## Build plan, constraints and rules

These three files are how the project was directed. Together they let anyone rebuild or adapt it.

### The plan: [plan/TaxCalculator.md](plan/TaxCalculator.md)

The step-by-step plan the app was built from: who does what (developer agent and QA agent), the tasks in four phases (foundation and docs, logic, UI, verification), the story priorities, the files created, the testing approach and a time estimate. To reuse the project:

```bash
git clone <this repository>
cd <the cloned folder>
npm install
```

Then read the plan from the top. It lists the order of work, so you can follow it to rebuild the app or change it for another tax year (a new year only needs changes to `src/data/slabs.ts` and the tax year label in `src/constants.ts`).

### The constraints: [Constraints.md](Constraints.md)

The business rules the app must obey, in short:

- **Scope:** salaried-individual income tax for tax year 2026-27 only, shown as an estimate with the tax year and a notice on every result.
- **Slabs:** eight slabs from 0% up to 35%, with no surcharge.
- **Input:** monthly (default) or annual amounts in whole rupees only. Decimals cannot be typed, commas and spaces are ignored, and the maximum is PKR 10,000,000,000 a year.
- **Errors:** an empty, non-numeric, negative or too-large amount shows a clear message and no result.
- **Rounding:** nearest rupee, with exact halves rounding up. Monthly figures stay within 0.5 rupee of the true value, and switching between monthly and annual never changes a result.
- **Display:** amounts as `PKR 1,194,000`, effective rate with two decimals, marginal rate with none.

### The coding rules: [CLAUDE.md](CLAUDE.md)

The rules the AI coding tool follows, kept separate from the business rules above: TypeScript everywhere, arrow-function components, all styles in `style.ts`, all types in `types.ts`, all display text and console messages in `constants.ts`, tax logic kept out of components, no custom hooks, ESLint and Prettier passing, and Vitest and Playwright tests written by the QA agent. It also lists the accessibility, code quality and workflow practices.

## Project layout

```
README.md              this file
Constraints.md         business rules (slabs, input, rounding, display)
CLAUDE.md              coding rules for the AI tool
docs/                  app-roles.md, jobs-to-be-done.md, user-stories.md
plan/TaxCalculator.md  the build plan
transcripts/           AI session transcripts
src/
  data/slabs.ts        the tax slabs (the only place a tax year changes)
  lib/                 pure logic: tax, validate, format, mode switch, evaluate
  components/          the React components
  App.tsx, main.tsx    state and entry point
  types.ts, constants.ts, style.ts   all types, all text, all styles
tests/
  unit/lib/            Vitest unit tests
  e2e/                 Playwright specs, one per story or group of stories
.claude/agents/        the QA subagent definition
.github/workflows/     the final-deployment workflow
```

Built with React 19, Vite, TypeScript, Vitest, Playwright, ESLint and Prettier.
