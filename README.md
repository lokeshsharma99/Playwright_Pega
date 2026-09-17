# Playwright Template — Pega Classic Back Office Portal

Playwright automation template for a Classic-UI (harness-based) Pega back
office portal, using native operator-login auth.

## Why this template looks the way it does

Classic Pega UI has a few automation-specific quirks this template bakes
in from the start:

- **Iframes everywhere.** Harnesses, modals, and local actions each render
  in their own frame. `BasePage.getContentFrame()` centralizes the primary
  content frame lookup; `pages/components/PegaModal.js` handles the
  separate modal frame.
- **A processing glass-pane during AJAX.** Playwright's auto-wait doesn't
  know when Pega is mid-refresh. `utils/waits.js#waitForPegaIdle` polls
  for the indicator to disappear; `BasePage.clickAndWait()` wraps clicks
  with it.
- **Auto-generated element IDs.** Pega generates `pyxxx`/`p$xxx`-style
  IDs that are unstable across environments and rule versions. Locators
  in this template prefer `getByRole` / `getByLabel` / `getByText` over
  IDs or CSS classes wherever possible.
- **Repeating grids.** Work lists and embedded lists share the same
  underlying structure. `pages/components/PegaGrid.js` implements
  row/cell lookup once, reused everywhere a grid shows up.

## ⚠️ Before you run this against your portal

Every file with a `TODO` comment contains a placeholder selector that
**must** be confirmed against your actual portal's DOM — they can't be
finalized without live access:

| File                                                                  | What to confirm                                                       |
| --------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `pages/BasePage.js`                                                   | `PRIMARY_FRAME_SELECTOR` — the primary harness iframe's name/selector |
| `utils/waits.js`                                                      | `PROCESSING_SELECTOR` — the AJAX processing/glass-pane indicator      |
| `pages/components/PegaModal.js`                                       | modal harness iframe selector                                         |
| `pages/WorkListPage.js`                                               | work list grid scoping selector                                       |
| `pages/CaseHarnessPage.js`                                            | `caseIdLabel` — case header/ID display selector                       |
| `tests/work-list/work-list.spec.js`, `tests/case/create-case.spec.js` | sample case IDs/case type — replace with real values from your env    |

Use `npx playwright codegen <your-portal-url>` to inspect real selectors
and `npx playwright show-trace` on a failed run's trace to see exactly
what the DOM looked like at each step.

## Setup

```bash
npm install
npx playwright install chromium
cp .env.example .env   # fill in BASE_URL, PEGA_USERNAME, PEGA_PASSWORD
```

## Running tests

```bash
npm test              # headless, runs auth setup then all specs
npm run test:headed   # watch it run
npm run test:debug    # Playwright inspector
npm run test:ui       # Playwright UI mode
npm run report        # open the last HTML report
```

## Allure report

Every run also writes raw results to `allure-results/` (via
`allure-playwright`, configured in `playwright.config.js` alongside the
built-in HTML reporter — both run every time, no extra flag needed).

```bash
npm run allure:generate   # builds allure-report/ from allure-results/
npm run allure:open       # serves it locally
```

Requires a **Java runtime** on the machine running these two commands
(`allure-commandline` needs it to build/serve the report) — collecting
results during `npm test` does not.

Auth runs once per test run (the `setup` project in `playwright.config.js`)
and its `storageState` is reused by every spec — specs start already
logged in. Delete `playwright/.auth/user.json` to force a fresh login.

## Readable steps without Gherkin

This template does **not** use Cucumber/Gherkin. It was tried
([playwright-bdd](https://github.com/vitalets/playwright-bdd)) and pulled
back out — community consensus (multiple r/Playwright and
r/QualityAssurance threads) is that a separate `.feature`-file layer only
pays for itself when non-technical stakeholders actually read/write those
files; otherwise it's a second codebase (English layer + real automation
layer) to keep in sync for no one. Representative take: _"Gherkin is a
false god. Code is king."_

The readable-step benefit Gherkin was there for is instead done with
Playwright's own `test.step()`, directly in the `.spec.js` files — same
descriptive breakdown in the HTML report/trace viewer, zero extra
tooling, zero compile step, one codebase:

```js
test('opens a case from the work list', async ({ workListPage }) => {
  await test.step('Given I am on the work list', async () => {
    await workListPage.waitForLoaded();
  });
  await test.step('When I open the case', async () => {
    await workListPage.openCaseById(caseId);
  });
});
```

See `tests/work-list/work-list.spec.js` and `tests/case/create-case.spec.js`
for the pattern in place.

## Folder structure

```
tests/                 Specs, grouped by feature. auth.setup.js runs first.
pages/                 Page Object Model — one class per screen/harness.
pages/components/      Reusable Pega UI patterns (grids, modals).
fixtures/              Custom `test` extended with page-object fixtures.
test-data/             JSON fixtures for data-driven specs.
utils/                 Pega-specific wait/retry helpers, API client for test data setup/teardown.
```

## API setup/teardown

Driving test-data setup and cleanup through the API instead of the UI is
faster and more stable — reserve UI interaction for the behavior actually
under test. `utils/api.js` (`PegaApiClient`) and the `apiClient` fixture
in `fixtures/test-fixtures.js` scaffold this pattern; wire in your real
endpoint paths/auth (marked `TODO`) and use it like:

```js
test('case shows submitted status', async ({ apiClient, caseHarnessPage, page }) => {
  const { ID } = await apiClient.createCase({ caseType: 'Sample', priority: 'High' });
  try {
    await page.goto(`/cases/${ID}`); // or however the portal deep-links to a case
    // ...assert only the behavior under test, not case creation itself
  } finally {
    await apiClient.deleteCase(ID);
  }
});
```

`tests/case/create-case.spec.js` is the one exception: case creation is the
behavior under test there, so it stays UI-driven — but it still uses
`apiClient.deleteCase()` in a `finally` block afterward, for the same
"don't pile up test cases" reason.

## Linting & formatting

```bash
npm run lint           # eslint .
npm run format         # prettier --write .
npm run format:check   # prettier --check . (CI-friendly, no writes)
```

`eslint-config-prettier` is included so ESLint never fights Prettier over
formatting — ESLint stays focused on correctness (`no-undef`,
`no-unused-vars`), Prettier owns style.

## Test design

- Mix short, focused tests (one behavior each) with a handful of full
  end-to-end flows — pick the ratio based on risk, not a fixed rule.
- Keep test data deterministic (`test-data/*.json`) for E2E — avoid
  random/faker-generated data here, it makes failures hard to reproduce.
  Faker-style random data is fine for load/performance testing, which is
  out of scope for this template.
- If the app misbehaves, prefer filing/fixing that over adding
  test-side workarounds (extra waits, retries, soft assertions) to paper
  over it — workarounds hide real regressions.

## Tagging

Tests are tagged `@smoke` / `@regression` / `@e2e` via Playwright's
`test(name, { tag: '@smoke' }, ...)` option:

```bash
npx playwright test --grep @smoke
npx playwright test --grep @regression
npx playwright test --grep "@smoke|@regression"
```

Add `@flaky` or `@quarantine` tags as needed once a test is known-flaky,
so it can be excluded from a blocking run with `--grep-invert @quarantine`
without deleting it.

## Debugging & flakiness

- `trace: 'retain-on-failure'` in `playwright.config.js` means every
  failing test keeps a trace regardless of retries — open it with
  `npx playwright show-trace <path>` or via `npm run report`.
- To hunt for flakiness in a specific test before trusting it:
  `npx playwright test <file> --repeat-each 10`
- Running in Docker so local runs match CI/teammate environments is a
  good idea once a CI pipeline exists — out of scope for now since this
  template is local-run only (see the reporting choice above), revisit
  when CI is added.

## Adding a new page object

1. Extend `BasePage` — you get `getContentFrame()`, `waitForIdle()`,
   `clickAndWait()` for free.
2. Prefer `getByRole`/`getByLabel`/`getByText` locators; fall back to a
   stable `data-testid` if your Pega team adds them, before ever reaching
   for a generated ID.
3. For any repeating list, reuse `PegaGrid` rather than writing bespoke
   row logic.
4. Wire it into `fixtures/test-fixtures.js` if specs will need it
   pre-instantiated.
