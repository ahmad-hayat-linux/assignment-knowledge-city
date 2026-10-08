# Coding Rules: Pakistan Salary Tax Calculator (TY 2026-27)

React + Vite + TypeScript single-page app. Fully client side: no backend, no API keys, no paid services.
This file holds the **coding rules** only. The **business rules** (slabs, input, rounding, display) are in `Constraints.md`; read it before changing behavior.
The user stories in `docs/user-stories.md` are the source of truth. Read `docs/app-roles.md`, `docs/jobs-to-be-done.md` and `docs/user-stories.md` before changing behavior.
Do not build behavior the stories do not describe. The plan is in `plan/TaxCalculator.md`.

## Required rules

1. **TypeScript everywhere.** No `.js` or `.jsx` source files (config files excepted where a tool requires it). `strict: true`. No `any` (use `unknown` and narrow). No `@ts-ignore` without a written reason.
2. **Components are arrow functions** with an explicit props type and a named export: `export const Foo = ({ a }: FooProps) => { ... }`. No class components and no `function` declarations for components.
3. **All styles live in one `src/style.ts`.** Export typed style objects (`React.CSSProperties`). No inline style literals in components and no per-component style files. Style objects cannot express `:hover`, `:focus-visible` or media queries, so: never remove the browser's default focus outline, and build the phone layout with fluid techniques (`flex-wrap`, `minmax`, `clamp()`, `max-width`, percentage widths), not media queries.
4. **All types live in `src/types.ts`.** Props, domain types and function signatures are defined and exported from there. No `type` or `interface` declarations in other files.
5. **ESLint and Prettier are configured and must pass.** Scripts: `lint`, `format`, `format:check`. Fix lint errors; never disable rules to silence them.
6. **All console messages live in `src/constants.ts`.** No string literals in `console.*` calls. Avoid `console.log` in committed code.
7. **All user-visible strings live in `src/constants.ts`.** Labels, buttons, headings, placeholders, validation and error messages, the disclaimer. Components import them and never hardcode display text. Error wording must match the acceptance criteria exactly.
8. **Testing.** Unit tests for the pure logic in `src/lib/` use **Vitest**. Everything a user sees or does on screen is tested with **Playwright** E2E tests in a real browser (Chromium for every spec; Chromium, Firefox and WebKit for the browser-compatibility story S-12); we write no component tests. Do not use Jest anywhere. **All tests live in the root `tests/` folder, never inside `src/`:** `tests/unit/` (mirroring `src/`, for example `tests/unit/lib/tax.test.ts`), and `tests/e2e/` for Playwright specs. Tests import app code through the `@/` alias. Tests are written and run by the `qa-subagent` (`.claude/agents/qa-subagent.md`); the developer agent does not write test cases. Request a QA run before marking a story Implemented.
9. **Tax logic is separate from components.** No tax, validation or formatting logic inside components. It lives in `src/lib/` (`tax.ts`, `validate.ts`, `format.ts`) and `src/data/slabs.ts`. Components collect input, call these functions and display the result. Logic functions return error keys; `constants.ts` holds the text.
10. **No custom hooks.** Do not create our own hooks (no `useXxx` functions that we define, and no `src/hooks/` folder). Using hooks that come from React or from libraries is fine. Keep state in components with the built-in hooks, and put any reusable logic in plain functions in `src/lib/`.

## Professional practices

### Structure

- `src/lib/` pure logic with no React imports. `src/data/` tax slab data, with source URL, tax year and date checked in a comment. `src/components/` one component per file, PascalCase names. There is no `src/hooks/` folder, because we write no custom hooks (rule 10).
- Shared files at the `src/` root: `types.ts`, `constants.ts`, `style.ts`.
- Use the `@/` path alias instead of long relative imports.

### Correctness (implementation)

What the app must do with money, input and rounding is in `Constraints.md`. These are the coding rules that make it hold.

- Tax logic is pure and deterministic.
- Validate all input at the boundary, before any calculation. Never render `NaN`, `Infinity`, scientific notation or a wrong result.
- Define each rounding rule once, in one place. Sum slab taxes in whole hundredths of a rupee (income × rate) and divide by 100 once, so an exact half never drifts in floating point.
- Slabs are data, not logic. A tax year change touches only `src/data/slabs.ts`.

### React

- Function components and hooks provided by React or by libraries (`useState`, `useMemo`, and so on). We never write our own custom hooks. Small, single-purpose components.
- Derive state instead of duplicating it: compute results from inputs rather than storing them.
- Correct effect dependency arrays; never suppress `react-hooks/exhaustive-deps`.
- Use `useMemo` and `useCallback` only where there is a clear need.
- Controlled inputs. Stable `key` props.
- Wrap the app in an error boundary so unexpected failures show a message, not a blank page.

### Accessibility

- Every input has a visible `<label>` linked by `htmlFor`.
- Errors use `role="alert"`; invalid inputs use `aria-invalid` and `aria-describedby`.
- Semantic HTML, fully keyboard operable, sufficient color contrast.

### Code quality

- Descriptive names, small functions, no magic numbers (name them as constants).
- No dead code and no commented-out code. Comments explain why, not what.
- No duplicated logic; reuse before adding.
- Named exports; default exports only where a tool requires one.
- Handle errors explicitly; never swallow exceptions.

### Security and hygiene

- No secrets in the repo; do not commit `.env` files; never use `dangerouslySetInnerHTML`.
- Add only dependencies that are needed. Commit `package-lock.json`.
- `.gitignore` excludes `node_modules`, `dist`, coverage, `test-results`, `playwright-report` and env files.

### Workflow

- Before finishing any change run: `npm run lint`, `npm run format:check`, `npx tsc --noEmit`.
- Keep the README, docs and story statuses in line with what is actually built. Mark a story Implemented only after the `qa-subagent` run passes and it has been verified in the running app.
- Record any hand edit to code in the README under "Code changed by hand".
- Do not add features outside the user stories without updating the docs first.
