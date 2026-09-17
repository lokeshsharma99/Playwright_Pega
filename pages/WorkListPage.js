const { BasePage } = require('./BasePage');
const { PegaGrid } = require('./components/PegaGrid');

class WorkListPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);
    // TODO: confirm the work list grid's scoping selector against the
    // real portal. Tries accessible grid/table roles first, falls back to
    // a `.gridContainer` class guess (a named list view div is another
    // common Classic Pega pattern to check for).
    this.workListGrid = new PegaGrid(
      this.getContentFrame(),
      '[role="grid"], [role="table"], .gridContainer',
    );
  }

  /** Landmark confirming the work list has loaded, used post-login. */
  async waitForLoaded() {
    await this.getContentFrame()
      .getByRole('heading', { name: /my work|work list/i })
      .waitFor();
  }

  async openCaseById(caseId) {
    await this.workListGrid.clickRow(caseId);
    await this.waitForIdle();
  }
}

module.exports = { WorkListPage };
