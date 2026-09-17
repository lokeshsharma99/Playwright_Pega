const { test, expect } = require('../../fixtures/test-fixtures');

test.describe('Work list', () => {
  test('loads and displays queued work', { tag: '@smoke' }, async ({ workListPage }) => {
    await test.step('Given I am on the work list', async () => {
      await workListPage.waitForLoaded();
    });

    await test.step('Then the work list should show at least one item', async () => {
      const rowCount = await workListPage.workListGrid.rowCount();
      expect(rowCount).toBeGreaterThan(0);
    });
  });

  test(
    'opens a case from the work list',
    { tag: '@regression' },
    async ({ workListPage, caseHarnessPage }) => {
      await test.step('Given I am on the work list', async () => {
        await workListPage.waitForLoaded();
      });

      // TODO: replace with a real case ID/handle present in the target env.
      const caseId = 'SAMPLE-CASE C-1001';
      await test.step(`When I open case "${caseId}"`, async () => {
        await workListPage.openCaseById(caseId);
      });

      await test.step('Then the case header should show "C-1001"', async () => {
        await expect(caseHarnessPage.caseIdLabel).toContainText('C-1001');
      });
    },
  );
});
