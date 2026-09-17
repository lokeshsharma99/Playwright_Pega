const { retryClick } = require('../../utils/waits');

/**
 * Reusable helper for Pega's repeating-grid/table structures — used by
 * work lists and any embedded list inside a case. Write the row/column
 * logic once here rather than re-deriving it in every page object.
 */
class PegaGrid {
  /**
   * @param {import('@playwright/test').Locator | import('@playwright/test').FrameLocator} scope
   * @param {string} gridSelector - selector scoping the grid itself, e.g.
   *   a `data-testid`, aria role, or containing element selector. Confirm
   *   against the real portal's grid markup. May be a comma-separated
   *   list of fallback candidates — `.first()` below is what keeps that
   *   safe: a plain union match would throw a strict-mode violation on
   *   `.click()` if more than one candidate matches simultaneously (e.g.
   *   an element carrying both `role="grid"` and `.gridContainer`).
   */
  constructor(scope, gridSelector) {
    this.scope = scope;
    this.grid = scope.locator(gridSelector).first();
    this.rows = this.grid.locator('tbody tr, [role="row"]');
  }

  /**
   * Finds a row containing the given text anywhere in its cells.
   * @param {string} text
   */
  getRowByText(text) {
    return this.rows.filter({ hasText: text });
  }

  /**
   * @param {string} text - text uniquely identifying the row (e.g. a case ID)
   */
  async clickRow(text) {
    await retryClick(this.getRowByText(text));
  }

  /**
   * @param {import('@playwright/test').Locator} row
   * @param {number} columnIndex - 0-based
   */
  async getCellText(row, columnIndex) {
    const cell = row.locator('td, [role="cell"]').nth(columnIndex);
    return cell.innerText();
  }

  async rowCount() {
    return this.rows.count();
  }
}

module.exports = { PegaGrid };
