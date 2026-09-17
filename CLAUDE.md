# Instructions for AI agents working in this repo

This is a Playwright template for a Pega Classic-UI back office portal. The
architecture and conventions below were deliberately chosen. **Follow them.
Do not invent a different approach, add tooling, or restructure the project
without being explicitly asked.** If something here seems wrong, say so and
ask — don't silently work around it.

## Hard rules

1. **No Cucumber/Gherkin.** It was tried in this project and removed on
   purpose (community consensus: a separate `.feature`-file layer only pays
   off when non-technical stakeholders actually read it; otherwise it's two
   codebases to keep in sync). Readable step breakdowns go through
   Playwright's own `test.step()`, inline in `.spec.js` files. Do not
   reintroduce `playwright-bdd`, `@cucumber/cucumber`, or a `features/`
   directory.

2. **No assertions in page objects.** `pages/**` and `pages/components/**`
   contain interactions and locators only. `expect()` calls belong in
   `tests/**/*.spec.js`.

3. **Locator priority, in order:** `getByRole` → `getByLabel` → `getByText`
   → a documented CSS/attribute fallback. Never reach for CSS or an
   auto-generated Pega `pyxxx`/`p$xxx` ID as the first choice. If a
   fallback selector is genuinely needed, chain it with `.or()` and add
   `.first()` — an un-`.first()`'d union match will throw a strict-mode
   violation the moment more than one candidate matches on a real page.

4. **Never invent a real selector, endpoint, or credential.** Every
   Pega-specific selector, API path, and login field in this repo is
   currently a documented `TODO` guess — that's intentional, they can't be
   confirmed without live portal access. Do not "fix" a `TODO` by guessing
   harder. Do not delete a `TODO` comment unless you've verified the real
   value against the actual portal.

5. **Reuse the existing helpers, don't reimplement them.**
   - Waiting for Pega's AJAX processing cycle → `utils/waits.js#waitForPegaIdle`
   - Clicking something that might get torn down mid-interaction → `utils/waits.js#retryClick`
   - Any click-then-settle interaction → `BasePage.clickAndWait()`
   - Repeating grid/table UI → `pages/components/PegaGrid.js`
   - Modal/local-action harness → `pages/components/PegaModal.js`

   If none of these fit a new situation, say so and propose an addition —
   don't write a one-off wait/retry/grid-parsing routine inline in a test.

6. **Prefer API setup/teardown over UI-driven setup** for anything that
   isn't the actual behavior under test. Use the `apiClient` fixture
   (`utils/api.js`). The one exception is `create-case.spec.js`, where case
   creation _is_ the thing under test — there, UI creation + API teardown
   is correct, not a bug.

7. **Deterministic test data only for E2E.** `test-data/*.json`, not
   `faker` or other randomized generators. Faker-style random data is out
   of scope for this template entirely.

8. **Tag every test** `@smoke` / `@regression` / `@e2e` via Playwright's
   `test(name, { tag: '@smoke' }, ...)` option — not a string suffix in the
   test name.

## Keep it simple, keep it readable

- No cleverness. A test or page object should read top-to-bottom like
  plain steps a human would take, not a display of language features.
- No abstraction for a problem you don't have yet. This project's own
  history is the cautionary tale: Cucumber, Allure, an API-client
  fixture, and a tagging scheme were all added in one sitting before a
  single test had ever run against a real portal. Don't repeat that.
  Add structure when a second or third real case demands it, not before.
- No new top-level directories, new dependencies, new config files
  (linters, CI, Docker, etc.) unless the user asks for them by name.
- Comments explain _why_, never _what_. If a comment just restates the
  code, delete it.
- Before adding anything non-trivial, run it by the user rather than
  deciding unilaterally — this file is a starting point, not a substitute
  for asking when a real judgment call comes up.

## Before calling anything done

```bash
npm run lint
npm run format:check
npx playwright test --list
```

All three must be clean. None of them require a live Pega portal, so
there's no excuse for skipping them.
