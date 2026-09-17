const { test, expect } = require('../../fixtures/test-fixtures');
const caseData = require('../../test-data/case-data.json');

test.describe('Case creation', () => {
  test(
    'creates a new case and submits it',
    { tag: '@e2e' },
    async ({ page, caseHarnessPage, apiClient }) => {
      let caseId;

      await test.step('Given I start creating a new case', async () => {
        // TODO: replace with the real "create case" entry point for this
        // portal (a nav menu item, a "Create" button, or a direct URL).
        await page.getByRole('button', { name: /create/i }).click();
        await caseHarnessPage.waitForIdle();
      });

      await test.step('When I fill in the case details', async () => {
        const frame = caseHarnessPage.getContentFrame();
        await frame.getByLabel(/case type/i).selectOption({ label: caseData.newCase.caseType });
        await frame.getByLabel(/description/i).fill(caseData.newCase.description);
        await frame.getByLabel(/priority/i).selectOption({ label: caseData.newCase.priority });
      });

      await test.step('And I submit the case', async () => {
        await caseHarnessPage.submit();
      });

      try {
        await test.step('Then the case should be created successfully', async () => {
          await expect(caseHarnessPage.caseIdLabel).toBeVisible();
          caseId = await caseHarnessPage.caseIdLabel.textContent();
        });
      } finally {
        // Case creation is what's under test here, so it stays UI-driven —
        // but cleanup goes through the API (see README's "API setup/teardown"
        // section) so test cases don't pile up in the work list run over run.
        if (caseId) {
          await apiClient.deleteCase(caseId);
        }
      }
    },
  );
});
