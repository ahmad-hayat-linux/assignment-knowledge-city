# User Stories with Acceptance Criteria

Tax year: 2026-27 (1 July 2026 to 30 June 2027), salaried individuals, Pakistan.
Each story names the job it serves (see `jobs-to-be-done.md`), a priority and a status.
**Status is set from what the app does today.** Every story is currently **Not implemented**; statuses change only after the story is verified in the running app.

## Calculation rules the criteria rely on

- Slabs (annual income, PKR): up to 600,000: 0 | 600,001 to 1,200,000: 1% over 600,000 | 1,200,001 to 2,200,000: 6,000 + 11% over 1,200,000 | 2,200,001 to 3,200,000: 116,000 + 20% over 2,200,000 | 3,200,001 to 4,100,000: 316,000 + 25% over 3,200,000 | 4,100,001 to 5,600,000: 541,000 + 29% over 4,100,000 | 5,600,001 to 7,000,000: 976,000 + 32% over 5,600,000 | above 7,000,000: 1,424,000 + 35% over 7,000,000. No surcharge.
- Monthly input is multiplied by 12 to give yearly income.
- Yearly tax is rounded to the nearest whole rupee. Yearly net = yearly income minus yearly tax.
- Monthly figures are the yearly figures divided by 12, rounded to the nearest whole rupee.
- **Rounding rule.** Every rounding is to the nearest whole rupee, and an exact half rounds up (0.5 becomes 1, 2.5 becomes 3). Each monthly figure is therefore within 0.5 rupee of its true value; monthly tax plus monthly net is within 1 rupee of yearly income divided by 12; and switching between Monthly and Annual never changes any result. Monthly figures multiplied by 12 may differ from the yearly figures by up to 6 rupees, which is expected with whole-rupee display.
- **Amount display.** Every rupee amount shows "PKR" and comma thousands separators in standard grouping, for example "PKR 1,194,000". Percentages are not rupee amounts: the effective rate shows two decimals ("16.04%") and the marginal rate shows none ("11%").
- Maximum supported income: PKR 10,000,000,000 per year.
- The default input mode is Monthly.
- **Whole rupees only.** The salary field cannot hold a decimal point: typing "." does nothing, and in pasted text the decimal point and everything after it are dropped (no error is shown). Every amount the app displays is a whole number of rupees, with no decimal point.
- Display text is exactly as quoted in the criteria.

## Priority summary

| Priority  | Stories             |
| --------- | ------------------- |
| P0 Must   | S-1, S-2, S-6       |
| P1 Should | S-3, S-4, S-7, S-11 |
| P2 Could  | S-5, S-8, S-9, S-10 |

---

## S-1: Result cards

**Serves J-2, J-3 (also J-1) | Role: Salaried Employee | Priority: P0 | Status: Not implemented**
As a Salaried Employee, I want to enter my salary and see my monthly tax, monthly net pay, yearly income, yearly tax and yearly net pay, so that I know exactly what I take home.

- Given Monthly mode and I enter 100,000, when the result shows, then yearly income is 1,200,000, yearly tax is 6,000, yearly net is 1,194,000, monthly tax is 500 and monthly net is 99,500.
- Given Annual mode and I enter 1,000,000, then yearly tax is 4,000, yearly net is 996,000, monthly tax is 333 and monthly net is 83,000.
- Given annual income of 2,000,000, then yearly tax is 94,000.
- Given annual income of 5,000,000, then yearly tax is 802,000.
- Given annual income of 8,000,000, then yearly tax is 1,774,000.
- Given annual income of exactly 600,000, then yearly tax is 0 and yearly net equals yearly income.
- Given annual income of 600,001, then yearly tax is 0 (the exact 0.01 rounds to 0).
- Given annual income of 600,050 (exact tax 0.50), then yearly tax is 1; given 600,150 (exact tax 1.50), then yearly tax is 2; given 600,149 (exact tax 1.49), then yearly tax is 1 (exact halves round up).
- Given annual income of 600,600 (yearly tax 6), then monthly tax is 1 (0.50 rounds up) and monthly net is 50,050 (yearly net 600,594 ÷ 12 = 50,049.50 rounds up).
- Given annual income of 7,000,000, then yearly tax is 1,424,000.
- Given annual income of 10,000,000,000 (the maximum), then yearly tax is 3,498,974,000 and no error is shown.
- Given annual income of 1, then yearly tax is 0 and no error is shown.
- Given a result is showing, when I change the amount to another valid number, then all five figures update without reloading the page.

## S-2: Monthly or annual input

**Serves J-3 (also J-2) | Role: Job Seeker | Priority: P0 | Status: Not implemented**
As a Job Seeker, I want to enter my salary as either a monthly or a yearly amount, so that I can use the figure exactly as my offer states it.

- Given the app has just opened, then Monthly mode is selected.
- Given Monthly mode and I enter 100,000, then the app treats my income as 1,200,000 per year.
- Given Annual mode and I enter 1,200,000, then the app treats my income as 1,200,000 per year and monthly tax shows 500.
- Given Monthly mode with 100,000 entered, when I switch to Annual, then the field changes to 1,200,000 and the results do not change.
- Given Annual mode with 1,200,000 entered, when I switch to Monthly, then the field changes to 100,000 and the results do not change.
- Given Annual mode with 100,000 entered (not divisible by 12), when I switch to Monthly, then the field shows "8,333" (a whole number, never a decimal) and yearly income still shows PKR 100,000, with yearly tax and yearly net unchanged.
- Given I have just switched modes and have not edited the field, when I switch back, then the field shows the amount I originally typed (100,000) exactly.
- Given I have switched modes, when I edit the field, then the results are calculated from the amount I typed, not from the earlier amount.
- Given any switch of mode, then the field never shows a decimal point.
- Given I switch mode while the field is empty, then the field stays empty and no error is shown.
- Given I switch mode while the field holds invalid text, then the text is left as typed and the current error remains.

## S-3: Slab breakdown

**Serves J-1, J-4 | Role: HR/Payroll Officer | Priority: P1 | Status: Not implemented**
As an HR/Payroll Officer, I want to see how much income fell into each slab and the tax from each, so that I can verify and explain the figure.

- Given annual income of 2,000,000, then the breakdown lists three slabs: 0 to 600,000 with 600,000 at 0% giving tax 0; 600,001 to 1,200,000 with 600,000 at 1% giving tax 6,000; and 1,200,001 to 2,200,000 with 800,000 at 11% giving tax 88,000; and the slab taxes add up to the yearly tax of 94,000.
- Given annual income of 600,000, then the breakdown lists only the 0% slab with 600,000 and tax 0.
- Given annual income of 8,000,000, then the breakdown lists all eight slabs, and the amounts in the slabs add up to 8,000,000.
- Given no result is showing, then no breakdown is shown.

## S-4: Effective tax rate

**Serves J-1, J-2 | Role: Salaried Employee | Priority: P1 | Status: Not implemented**
As a Salaried Employee, I want to see the share of my income that goes to tax, so that I understand my overall tax burden.

- Given annual income of 5,000,000 (yearly tax 802,000), then the effective rate shows "16.04%".
- Given annual income of 2,000,000, then the effective rate shows "4.70%".
- Given income of 0, then the effective rate shows "0.00%" and not NaN.
- Given annual income of 600,000, then the effective rate shows "0.00%".

## S-5: Marginal tax rate

**Serves J-5 | Role: Job Seeker | Priority: P2 | Status: Not implemented**
As a Job Seeker, I want to see the tax rate that applies to my next rupee of income, so that I can judge what a raise is worth.

- Given annual income of 2,000,000, then the marginal rate shows "11%".
- Given annual income of 5,000,000, then the marginal rate shows "29%".
- Given income of exactly 600,000 (a slab boundary), then the marginal rate shows "1%" (the rate of the slab above).
- Given income of exactly 7,000,000, then the marginal rate shows "35%".
- Given income of 0, then the marginal rate shows "0%".
- Given annual income above 7,000,000, then the marginal rate shows "35%".

## S-6: Invalid input and recovery

**Serves J-1, J-2, J-3, J-4, J-5 | Roles: all | Priority: P0 | Status: Not implemented**
As any user, I want a clear message when my input cannot be used and an easy way to carry on, so that I never see a wrong result.

- Given the field is empty or only spaces, then I see "Enter your salary" and no results are shown.
- Given I enter letters or mixed text such as "abc" or "12abc", then I see "Salary must be a number" and no results are shown.
- Given I enter "NaN", "Infinity" or "1e5", then I see "Salary must be a number" and no results are shown.
- Given I enter a negative number such as "-5", then I see "Salary cannot be negative" and no results are shown.
- Given the yearly income would be above 10,000,000,000, then I see "Salary is too large. The maximum is PKR 10,000,000,000 per year." and no results are shown.
- Given I enter "0", then I see results with tax 0 and no error.
- Given an error is showing, when I change the input to a valid amount, then the error disappears and the results appear without reloading.
- Given results are showing, when I change the input to an invalid value, then the old results disappear and the error appears (old results are never left on screen beside an error).
- Given an error is showing, then the error message is announced to assistive technology and the field is marked invalid.

## S-7: Tax year and disclaimer

**Serves J-4 (also J-1, J-3) | Role: HR/Payroll Officer | Priority: P1 | Status: Not implemented**
As an HR/Payroll Officer, I want every result to state the tax year and that it is an estimate, so that nobody treats it as an official figure.

- Given any page state, then I see "Tax year 2026-27" on the page.
- Given a result is showing, then I see the notice "Estimate only. This is not tax advice. Confirm your tax with FBR or a tax professional."
- Given an error is showing, then the tax year is still visible.

## S-8: Slab reference table

**Serves J-4 | Role: HR/Payroll Officer | Priority: P2 | Status: Not implemented**
As an HR/Payroll Officer, I want to see the full list of slabs and rates on the page, so that I can check the rates myself.

- Given the page is open and no amount has been entered, then I see a table of all eight slabs with income range, fixed amount and rate.
- Given the table is shown, then its figures match the slabs listed at the top of this document.
- Given a result is showing, then the table is still visible.

## S-9: Reset

**Serves J-3 (also J-1, J-2, J-4, J-5) | Roles: all | Priority: P2 | Status: Not implemented**
As any user, I want to clear everything with one action, so that I can start a new calculation.

- Given results are showing, when I press Reset, then the field is empty, the results and breakdown are gone, no error is shown and Monthly mode is selected.
- Given an error is showing, when I press Reset, then the field is empty and the error is gone.
- Given the form is already empty, when I press Reset, then nothing breaks and no error appears.

## S-10: Phone-width layout

**Serves J-2, J-3 | Roles: Salaried Employee, Job Seeker | Priority: P2 | Status: Not implemented**
As a Job Seeker or Salaried Employee, I want to use the calculator on my phone, so that I can check a figure wherever I am.

- Given a screen 375 pixels wide, when a result with the full breakdown is showing, then there is no horizontal scrolling of the page.
- Given a screen 375 pixels wide, then the input, the Reset control, all result figures and the disclaimer are readable and can be reached without zooming.
- Given a screen 1280 pixels wide, then the layout is also usable with no overlapping content.

## S-11: PKR formatting and pasted numbers

**Serves J-1, J-2, J-3 | Roles: Salaried Employee, Job Seeker | Priority: P1 | Status: Not implemented**
As a Salaried Employee, I want amounts shown with thousands separators and a currency label and to be able to paste a formatted number, so that I can read and enter figures easily.

- Given a result, then every amount appears with thousands separators and the PKR label, for example "PKR 1,194,000".
- Given a very large result such as 3,498,974,000, then it is shown in full digits with separators and never in scientific notation.
- Given I paste "1,000,000" into the field, then it is accepted as 1000000 and results show.
- Given I paste " 500000 " with spaces around it, then it is accepted as 500000.
- Given I paste "1,00,000" (lakh-style grouping common in Pakistan), then it is accepted as 100000, because commas between digits are ignored.
- Given I enter ",,," or "1,,", then I see "Salary must be a number".
- Given I type a decimal point in the field, then nothing is entered and no error is shown.
- Given I paste "100000.50", then the field shows "100000" (the decimal point and everything after it are dropped), results show for 100,000 and no error is shown.
- Given I paste "1.2.3", then the field shows "1".
- Given any result, then every amount on the page (cards, breakdown and slab table) is a whole number of rupees with no decimal point.
