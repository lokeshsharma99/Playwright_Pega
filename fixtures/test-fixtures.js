const { test: base, expect } = require('@playwright/test');
const { WorkListPage } = require('../pages/WorkListPage');
const { CaseHarnessPage } = require('../pages/CaseHarnessPage');
const { PegaApiClient } = require('../utils/api');

/**
 * Extends the base test with page objects pre-wired to the current page.
 * Auth is already applied via the `chromium` project's storageState, so
 * specs using this fixture start already logged in.
 */
const test = base.extend({
  workListPage: async ({ page }, use) => {
    await use(new WorkListPage(page));
  },
  caseHarnessPage: async ({ page }, use) => {
    await use(new CaseHarnessPage(page));
  },
  // For API-based test data setup/teardown instead of driving the UI —
  // see README's "API setup/teardown" section for the intended pattern.
  // `request` is Playwright's built-in APIRequestContext fixture, already
  // scoped to `baseURL` from playwright.config.js.
  apiClient: async ({ request }, use) => {
    await use(new PegaApiClient(request));
  },
});

module.exports = { test, expect };
